const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { API_PREFIX, DEFAULT_PORT } = require("../../shared/constants");
const {
  DEFAULT_COMPANY_ID,
  STATE_SCHEMA_VERSION,
  createFileStatePersistenceAdapter,
  enforceExpectedRevision,
  normalizeStatePayload,
  stateEnvelope
} = require("./persistence-adapter");

const ROOT_DIR = path.resolve(__dirname, "../..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const DEFAULT_DATA_DIR = path.join(ROOT_DIR, "backend", "data");
const PORT = Number(process.env.PORT || DEFAULT_PORT);
const MAX_REQUEST_BODY_BYTES = 5 * 1024 * 1024;
const COMPANY_ID_HEADER = "x-smartbooks-company-id";
const REQUEST_ID_HEADER = "x-smartbooks-request-id";
const REVISION_HEADER = "x-smartbooks-state-revision";
const COMPANY_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{1,63}$/;
const SERVICE_NAME = "smartbooks-backend";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": MIME_TYPES[".json"] });
  res.end(JSON.stringify(payload, null, 2));
}

function createRuntimeMetrics(now = Date.now) {
  return {
    startedAt: now(),
    requests: {
      total: 0,
      api: 0,
      failures: 0,
      byStatus: {},
      routes: {}
    }
  };
}

function routeLabel(pathname) {
  if (pathname === `${API_PREFIX}/state`) return `${API_PREFIX}/state`;
  if (pathname.startsWith(`${API_PREFIX}/state/`)) return `${API_PREFIX}/state/:operation`;
  if (pathname === `${API_PREFIX}/health`) return `${API_PREFIX}/health`;
  if (pathname === `${API_PREFIX}/live`) return `${API_PREFIX}/live`;
  if (pathname === `${API_PREFIX}/ready`) return `${API_PREFIX}/ready`;
  if (pathname === `${API_PREFIX}/metrics`) return `${API_PREFIX}/metrics`;
  if (pathname.startsWith(API_PREFIX)) return `${API_PREFIX}/unknown`;
  return "static";
}

function recordRequest(metrics, entry) {
  if (!metrics?.requests) return;
  const statusCode = Number(entry.statusCode || 0);
  const durationMs = Math.max(0, Math.round(entry.durationMs || 0));
  const statusGroup = statusCode ? `${Math.floor(statusCode / 100)}xx` : "unknown";
  const route = `${entry.method || "GET"} ${routeLabel(entry.pathname || "")}`;
  const routeMetrics = metrics.requests.routes[route] || {
    total: 0,
    failures: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    lastStatusCode: null
  };

  metrics.requests.total += 1;
  if (String(entry.pathname || "").startsWith(API_PREFIX)) metrics.requests.api += 1;
  metrics.requests.byStatus[statusGroup] = (metrics.requests.byStatus[statusGroup] || 0) + 1;
  if (statusCode >= 400) metrics.requests.failures += 1;

  routeMetrics.total += 1;
  routeMetrics.totalDurationMs += durationMs;
  routeMetrics.maxDurationMs = Math.max(routeMetrics.maxDurationMs, durationMs);
  routeMetrics.lastStatusCode = statusCode || null;
  if (statusCode >= 400) routeMetrics.failures += 1;
  metrics.requests.routes[route] = routeMetrics;
}

function metricsSnapshot(metrics, now = Date.now) {
  const requests = metrics?.requests || createRuntimeMetrics(now).requests;
  const memory = process.memoryUsage();
  const routes = Object.fromEntries(Object.entries(requests.routes).map(([route, values]) => [
    route,
    {
      total: values.total,
      failures: values.failures,
      averageDurationMs: values.total ? Math.round(values.totalDurationMs / values.total) : 0,
      maxDurationMs: values.maxDurationMs,
      lastStatusCode: values.lastStatusCode
    }
  ]));

  return {
    ok: true,
    service: SERVICE_NAME,
    generatedAt: new Date(now()).toISOString(),
    uptimeSeconds: Math.max(0, Math.round((now() - metrics.startedAt) / 1000)),
    memory: {
      rssMb: Math.round(memory.rss / 1024 / 1024),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024)
    },
    requests: {
      total: requests.total,
      api: requests.api,
      failures: requests.failures,
      byStatus: requests.byStatus,
      routes
    }
  };
}

function livePayload(metrics) {
  return {
    ok: true,
    status: "live",
    service: SERVICE_NAME,
    uptimeSeconds: Math.max(0, Math.round((Date.now() - metrics.startedAt) / 1000))
  };
}

async function readinessPayload(persistenceAdapter, metrics) {
  const checks = {
    persistence: {
      status: "unknown",
      detail: "Persistence read check has not run."
    }
  };

  try {
    const envelope = await persistenceAdapter.read();
    checks.persistence = {
      status: "pass",
      detail: "Persistence dependency is readable.",
      schemaVersion: envelope?.schemaVersion || null,
      revisionPresent: Boolean(envelope?.revision),
      statePresent: Boolean(envelope?.state && Object.keys(envelope.state).length)
    };
  } catch (error) {
    checks.persistence = {
      status: "fail",
      detail: "Persistence dependency is not readable."
    };
  }

  const ready = checks.persistence.status === "pass";
  return {
    statusCode: ready ? 200 : 503,
    body: {
      ok: ready,
      status: ready ? "ready" : "degraded",
      service: SERVICE_NAME,
      uptimeSeconds: Math.max(0, Math.round((Date.now() - metrics.startedAt) / 1000)),
      checks
    }
  };
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function scopedRequest(req) {
  const companyId = String(req.headers[COMPANY_ID_HEADER] || "").trim();
  if (!companyId) throw httpError(400, "X-SmartBooks-Company-Id header is required.");
  if (!COMPANY_ID_PATTERN.test(companyId)) {
    throw httpError(400, "X-SmartBooks-Company-Id must be 2-64 characters using letters, numbers, dots, underscores, colons, or hyphens.");
  }

  const requestId = String(req.headers[REQUEST_ID_HEADER] || "").trim();
  return {
    companyId,
    requestId: requestId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  };
}

function enforceCompanyScope(envelope, scope, action) {
  const existingCompanyId = envelope?.companyId || DEFAULT_COMPANY_ID;
  const hasState = envelope?.state && Object.keys(envelope.state).length > 0;
  if (existingCompanyId !== scope.companyId && hasState) {
    throw httpError(403, `Company scope mismatch for ${action}.`);
  }
}

function expectedRevision(req, payload) {
  const headerRevision = String(req.headers[REVISION_HEADER] || "").trim();
  return headerRevision || payload?.expectedRevision || payload?.revision || null;
}

async function readJsonBody(req) {
  const body = await readRequestBody(req);
  try {
    return body ? JSON.parse(body) : {};
  } catch (error) {
    throw validationError("Request body must be valid JSON.");
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let rejected = false;
    req.on("data", chunk => {
      if (rejected) return;
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BODY_BYTES) {
        rejected = true;
        reject(httpError(413, "Request body too large."));
        req.removeAllListeners("data");
        req.resume();
      }
    });
    req.on("end", () => {
      if (!rejected) resolve(body);
    });
    req.on("error", error => {
      if (!rejected) reject(error);
    });
  });
}

function createPersistenceAdapter(options = {}) {
  if (options.persistenceAdapter) return options.persistenceAdapter;
  const stateFile = options.stateFile || path.join(process.env.SMARTBOOKS_DATA_DIR || DEFAULT_DATA_DIR, "smartbooks-state.json");
  return createFileStatePersistenceAdapter({ stateFile });
}

async function handleApi(req, res, pathname, options = {}) {
  const persistenceAdapter = createPersistenceAdapter(options);
  const metrics = options.metrics || createRuntimeMetrics();

  if ((pathname === `${API_PREFIX}/health` || pathname === `${API_PREFIX}/live`) && req.method === "GET") {
    return sendJson(res, 200, livePayload(metrics));
  }

  if (pathname === `${API_PREFIX}/ready` && req.method === "GET") {
    const readiness = await readinessPayload(persistenceAdapter, metrics);
    return sendJson(res, readiness.statusCode, readiness.body);
  }

  if (pathname === `${API_PREFIX}/metrics` && req.method === "GET") {
    return sendJson(res, 200, metricsSnapshot(metrics));
  }

  if (pathname === `${API_PREFIX}/state` && req.method === "GET") {
    const scope = scopedRequest(req);
    const envelope = await persistenceAdapter.read();
    enforceCompanyScope(envelope, scope, "state read");
    return sendJson(res, 200, { ok: true, requestId: scope.requestId, data: envelope });
  }

  if (pathname === `${API_PREFIX}/state/backup` && req.method === "POST") {
    const scope = scopedRequest(req);
    const payload = await readJsonBody(req);
    const current = await persistenceAdapter.read();
    enforceCompanyScope(current, scope, "state backup");
    const backup = await persistenceAdapter.backup(payload.label || "manual");
    return sendJson(res, 200, {
      ok: true,
      requestId: scope.requestId,
      backup
    });
  }

  if (pathname === `${API_PREFIX}/state/backups` && req.method === "GET") {
    const scope = scopedRequest(req);
    const current = await persistenceAdapter.read();
    enforceCompanyScope(current, scope, "state backup list");
    const backups = await persistenceAdapter.listBackups();
    return sendJson(res, 200, {
      ok: true,
      requestId: scope.requestId,
      backups: backups.filter(backup => !backup.invalid && backup.companyId === scope.companyId)
    });
  }

  if (pathname === `${API_PREFIX}/state/restore` && req.method === "POST") {
    const scope = scopedRequest(req);
    const payload = await readJsonBody(req);
    if (!payload.backupId) throw validationError("Restore request must include a backupId.");
    const current = await persistenceAdapter.read();
    enforceCompanyScope(current, scope, "state restore");
    const expected = expectedRevision(req, payload);
    enforceExpectedRevision(current, expected);
    const backup = await persistenceAdapter.readBackup(payload.backupId);
    enforceCompanyScope(backup, scope, "backup restore");
    const restored = await persistenceAdapter.restoreBackup(payload.backupId, {
      companyId: scope.companyId,
      expectedRevision: expected,
      source: "restore"
    });
    return sendJson(res, 200, {
      ok: true,
      requestId: scope.requestId,
      backupId: payload.backupId,
      companyId: restored.companyId,
      savedAt: restored.savedAt,
      revision: restored.revision
    });
  }

  if (pathname === `${API_PREFIX}/state` && (req.method === "POST" || req.method === "PUT")) {
    const scope = scopedRequest(req);
    const payload = await readJsonBody(req);
    if (payload && payload.companyId && payload.companyId !== scope.companyId) {
      throw httpError(403, "State payload companyId does not match request company scope.");
    }
    const current = await persistenceAdapter.read();
    enforceCompanyScope(current, scope, "state write");
    const expected = expectedRevision(req, payload);
    enforceExpectedRevision(current, expected);
    const envelope = normalizeStatePayload(payload, { companyId: scope.companyId });
    const saved = await persistenceAdapter.write(envelope, { expectedRevision: expected });
    return sendJson(res, 200, {
      ok: true,
      requestId: scope.requestId,
      savedAt: saved.savedAt,
      companyId: saved.companyId,
      revision: saved.revision
    });
  }

  return sendJson(res, 404, { error: "API route not found." });
}

function serveStatic(req, res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const filePath = path.normalize(path.join(FRONTEND_DIR, decodedPath));

  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

function createSmartBooksServer(options = {}) {
  const metrics = options.metrics || createRuntimeMetrics();

  return http.createServer(async (req, res) => {
    const startedAt = Date.now();
    let pathname = "";
    res.on("finish", () => {
      recordRequest(metrics, {
        method: req.method,
        pathname,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });

    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      pathname = url.pathname;

      if (url.pathname.startsWith(API_PREFIX)) {
        return await handleApi(req, res, url.pathname, { ...options, metrics });
      }

      return serveStatic(req, res, url.pathname);
    } catch (error) {
      const payload = { ok: false, error: error.message || "Unexpected server error." };
      if (error.code) payload.code = error.code;
      if (error.expectedRevision !== undefined) payload.expectedRevision = error.expectedRevision;
      if (error.currentRevision !== undefined) payload.currentRevision = error.currentRevision;
      return sendJson(res, error.statusCode || 500, payload);
    }
  });
}

if (require.main === module) {
  const server = createSmartBooksServer();
  server.listen(PORT, () => {
    console.log(`SmartBooks app running at http://localhost:${PORT}`);
  });
}

module.exports = {
  createSmartBooksServer,
  createPersistenceAdapter,
  createRuntimeMetrics,
  normalizeStatePayload,
  stateEnvelope,
  COMPANY_ID_HEADER,
  REQUEST_ID_HEADER,
  REVISION_HEADER,
  DEFAULT_COMPANY_ID,
  STATE_SCHEMA_VERSION
};
