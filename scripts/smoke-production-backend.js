const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

const {
  COMPANY_ID_HEADER,
  REQUEST_ID_HEADER,
  REVISION_HEADER,
  createSmartBooksServer
} = require("../backend/src/server");

const COMPANY_ID = process.env.SMARTBOOKS_SMOKE_COMPANY_ID || "smoke-company";

async function requestJson(baseUrl, pathname, options = {}) {
  const headers = {
    ...(options.companyId === false ? {} : { [COMPANY_ID_HEADER]: options.companyId || COMPANY_ID }),
    ...(options.requestId ? { [REQUEST_ID_HEADER]: options.requestId } : {}),
    ...(options.revision ? { [REVISION_HEADER]: options.revision } : {}),
    ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`${options.method || "GET"} ${pathname} returned non-JSON response with HTTP ${response.status}.`);
  }
  return { status: response.status, body };
}

function assertOk(result, pathname) {
  assert.equal(result.status, 200, `${pathname} should return HTTP 200`);
  assert.equal(result.body.ok, true, `${pathname} should return ok:true`);
}

async function runSmoke() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "smartbooks-production-smoke-"));
  const stateFile = path.join(tempDir, "smartbooks-state.json");
  const server = createSmartBooksServer({ stateFile });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const results = [];

  try {
    const live = await requestJson(baseUrl, "/api/live", { companyId: false });
    assertOk(live, "/api/live");
    assert.equal(live.body.status, "live");
    results.push(["liveness", "passed"]);

    const ready = await requestJson(baseUrl, "/api/ready", { companyId: false });
    assertOk(ready, "/api/ready");
    assert.equal(ready.body.status, "ready");
    assert.equal(ready.body.checks.persistence.status, "pass");
    assert.equal(JSON.stringify(ready.body).includes(stateFile), false, "readiness must not leak storage paths");
    results.push(["readiness", "passed"]);

    const initial = await requestJson(baseUrl, "/api/state", { requestId: "smoke-read-initial" });
    assertOk(initial, "/api/state");
    assert.equal(initial.body.requestId, "smoke-read-initial");
    assert.equal(initial.body.data.revision, "rev_000001");
    assert.deepEqual(initial.body.data.state, {});
    results.push(["state read", "passed"]);

    const save = await requestJson(baseUrl, "/api/state", {
      method: "PUT",
      requestId: "smoke-save",
      revision: initial.body.data.revision,
      body: {
        schemaVersion: 1,
        companyId: COMPANY_ID,
        source: "production-smoke",
        revision: initial.body.data.revision,
        state: {
          company: { name: "SmartBooks Smoke Test" },
          settings: { visibleModules: ["dashboard"] }
        }
      }
    });
    assertOk(save, "/api/state PUT");
    assert.equal(save.body.requestId, "smoke-save");
    assert.equal(save.body.companyId, COMPANY_ID);
    assert.notEqual(save.body.revision, initial.body.data.revision);
    results.push(["revision-safe save", "passed"]);

    const saved = await requestJson(baseUrl, "/api/state", { requestId: "smoke-read-saved" });
    assertOk(saved, "/api/state saved read");
    assert.equal(saved.body.data.companyId, COMPANY_ID);
    assert.equal(saved.body.data.revision, save.body.revision);
    assert.equal(saved.body.data.state.company.name, "SmartBooks Smoke Test");
    results.push(["saved state verification", "passed"]);

    const metrics = await requestJson(baseUrl, "/api/metrics", { companyId: false });
    assertOk(metrics, "/api/metrics");
    assert.equal(metrics.body.requests.failures, 0);
    assert.ok(metrics.body.requests.routes["GET /api/live"], "metrics should include liveness route");
    assert.ok(metrics.body.requests.routes["GET /api/ready"], "metrics should include readiness route");
    assert.ok(metrics.body.requests.routes["GET /api/state"], "metrics should include state read route");
    assert.ok(metrics.body.requests.routes["PUT /api/state"], "metrics should include state write route");
    assert.equal(JSON.stringify(metrics.body).includes(stateFile), false, "metrics must not leak storage paths");
    results.push(["metrics", "passed"]);

    console.log(`SmartBooks production backend smoke passed at ${baseUrl}`);
    for (const [gate, result] of results) console.log(`ok - ${gate}: ${result}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

runSmoke().catch(error => {
  console.error("SmartBooks production backend smoke failed.");
  console.error(error);
  process.exit(1);
});
