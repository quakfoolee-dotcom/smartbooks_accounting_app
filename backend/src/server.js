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

  if (pathname === `${API_PREFIX}/health` && req.method === "GET") {
    return sendJson(res, 200, { ok: true, service: "smartbooks-backend" });
  }

  if (pathname === `${API_PREFIX}/state` && req.method === "GET") {
    const scope = scopedRequest(req);
    const envelope = await persistenceAdapter.read();
    enforceCompanyScope(envelope, scope, "state read");
    return sendJson(res, 200, { ok: true, requestId: scope.requestId, data: envelope });
  }

  if (pathname === `${API_PREFIX}/state` && (req.method === "POST" || req.method === "PUT")) {
    const scope = scopedRequest(req);
    const body = await readRequestBody(req);
    let payload = {};
    try {
      payload = body ? JSON.parse(body) : {};
    } catch (error) {
      throw validationError("Request body must be valid JSON.");
    }
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
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

      if (url.pathname.startsWith(API_PREFIX)) {
        return await handleApi(req, res, url.pathname, options);
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
  normalizeStatePayload,
  stateEnvelope,
  COMPANY_ID_HEADER,
  REQUEST_ID_HEADER,
  REVISION_HEADER,
  DEFAULT_COMPANY_ID,
  STATE_SCHEMA_VERSION
};
