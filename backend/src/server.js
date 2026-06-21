const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { API_PREFIX, DEFAULT_PORT } = require("../../shared/constants");

const ROOT_DIR = path.resolve(__dirname, "../..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const DATA_DIR = path.join(ROOT_DIR, "backend", "data");
const STATE_FILE = path.join(DATA_DIR, "smartbooks-state.json");
const PORT = Number(process.env.PORT || DEFAULT_PORT);

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

async function handleApi(req, res, pathname) {
  if (pathname === `${API_PREFIX}/health` && req.method === "GET") {
    return sendJson(res, 200, { ok: true, service: "smartbooks-backend" });
  }

  // Backend handoff point: the frontend can later replace localStorage calls with this state endpoint.
  if (pathname === `${API_PREFIX}/state` && req.method === "GET") {
    if (!fs.existsSync(STATE_FILE)) return sendJson(res, 200, {});
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return sendJson(res, 200, state);
  }

  if (pathname === `${API_PREFIX}/state` && (req.method === "POST" || req.method === "PUT")) {
    const body = await readRequestBody(req);
    const state = body ? JSON.parse(body) : {};
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return sendJson(res, 200, { ok: true });
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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (url.pathname.startsWith(API_PREFIX)) {
      return await handleApi(req, res, url.pathname);
    }

    return serveStatic(req, res, url.pathname);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Unexpected server error." });
  }
});

server.listen(PORT, () => {
  console.log(`SmartBooks app running at http://localhost:${PORT}`);
});
