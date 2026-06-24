const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { API_PREFIX, DEFAULT_PORT } = require("../../shared/constants");

const ROOT_DIR = path.resolve(__dirname, "../..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const DEFAULT_DATA_DIR = path.join(ROOT_DIR, "backend", "data");
const PORT = Number(process.env.PORT || DEFAULT_PORT);
const STATE_SCHEMA_VERSION = 1;
const DEFAULT_COMPANY_ID = "demo-company";

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

function nowISO() {
  return new Date().toISOString();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stateEnvelope(state = {}, options = {}) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    savedAt: options.savedAt || nowISO(),
    source: options.source || "backend",
    companyId: options.companyId || DEFAULT_COMPANY_ID,
    state: isPlainObject(state) ? state : {}
  };
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeStatePayload(payload, options = {}) {
  if (!isPlainObject(payload)) throw validationError("State payload must be a JSON object.");

  if (Object.prototype.hasOwnProperty.call(payload, "state")) {
    if (payload.schemaVersion !== undefined && Number(payload.schemaVersion) !== STATE_SCHEMA_VERSION) {
      throw validationError(`Unsupported state schemaVersion: ${payload.schemaVersion}.`);
    }
    if (!isPlainObject(payload.state)) throw validationError("State envelope must include an object state.");
    return stateEnvelope(payload.state, {
      savedAt: payload.savedAt || options.savedAt,
      source: payload.source || options.source || "backend",
      companyId: payload.companyId || options.companyId || DEFAULT_COMPANY_ID
    });
  }

  return stateEnvelope(payload, {
    source: options.source || "migration",
    companyId: options.companyId || DEFAULT_COMPANY_ID
  });
}

function readStateEnvelope(stateFile) {
  if (!fs.existsSync(stateFile)) return stateEnvelope({}, { source: "backend" });
  const saved = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  return normalizeStatePayload(saved, { source: "backend" });
}

function writeStateEnvelope(stateFile, envelope) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(envelope, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleApi(req, res, pathname, options = {}) {
  const stateFile = options.stateFile || path.join(process.env.SMARTBOOKS_DATA_DIR || DEFAULT_DATA_DIR, "smartbooks-state.json");

  if (pathname === `${API_PREFIX}/health` && req.method === "GET") {
    return sendJson(res, 200, { ok: true, service: "smartbooks-backend" });
  }

  if (pathname === `${API_PREFIX}/state` && req.method === "GET") {
    return sendJson(res, 200, { ok: true, data: readStateEnvelope(stateFile) });
  }

  if (pathname === `${API_PREFIX}/state` && (req.method === "POST" || req.method === "PUT")) {
    const body = await readRequestBody(req);
    const payload = body ? JSON.parse(body) : {};
    const envelope = normalizeStatePayload(payload);
    const saved = stateEnvelope(envelope.state, {
      source: envelope.source,
      companyId: envelope.companyId
    });
    writeStateEnvelope(stateFile, saved);
    return sendJson(res, 200, { ok: true, savedAt: saved.savedAt });
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
      return sendJson(res, error.statusCode || 500, { ok: false, error: error.message || "Unexpected server error." });
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
  normalizeStatePayload,
  readStateEnvelope,
  stateEnvelope,
  STATE_SCHEMA_VERSION
};
