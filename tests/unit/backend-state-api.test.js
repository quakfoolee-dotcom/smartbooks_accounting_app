const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

const root = path.resolve(__dirname, "../..");
const { createSmartBooksServer, normalizeStatePayload, stateEnvelope } = require(path.join(root, "backend/src/server.js"));

async function withServer(fn, options = {}){
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "smartbooks-state-api-"));
  const stateFile = path.join(tempDir, "smartbooks-state.json");
  const server = createSmartBooksServer({ stateFile, ...options });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  try{
    await fn({ baseUrl:`http://127.0.0.1:${port}`, stateFile });
  }finally{
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(tempDir, { recursive:true, force:true });
  }
}

async function requestJson(baseUrl, pathname, options = {}){
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers: options.body === undefined ? undefined : { "Content-Type":"application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  return { status:response.status, body:await response.json() };
}

async function requestRaw(baseUrl, pathname, options = {}){
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers: options.headers,
    body: options.body
  });
  return { status:response.status, body:await response.json() };
}

async function test(name, fn){
  try{
    await fn();
    console.log(`ok - ${name}`);
  }catch(error){
    console.error(`not ok - ${name}`);
    throw error;
  }
}

(async () => {
  await test("state API returns an empty envelope when no backend state exists", async () => {
    await withServer(async ({ baseUrl }) => {
      const result = await requestJson(baseUrl, "/api/state");
      assert.equal(result.status, 200);
      assert.equal(result.body.ok, true);
      assert.equal(result.body.data.schemaVersion, 1);
      assert.equal(result.body.data.companyId, "demo-company");
      assert.deepEqual(result.body.data.state, {});
      assert.equal(result.body.data.source, "backend");
    });
  });

  await test("state API stores and returns contract envelopes", async () => {
    await withServer(async ({ baseUrl, stateFile }) => {
      const payload = {
        schemaVersion:1,
        companyId:"demo-company",
        state:{ company:{ name:"Demo Co" }, invoices:[{ id:"INV-1" }] }
      };

      const saved = await requestJson(baseUrl, "/api/state", { method:"PUT", body:payload });
      assert.equal(saved.status, 200);
      assert.equal(saved.body.ok, true);
      assert.ok(saved.body.savedAt);
      assert.equal(fs.existsSync(stateFile), true);

      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.status, 200);
      assert.equal(loaded.body.data.schemaVersion, 1);
      assert.equal(loaded.body.data.companyId, "demo-company");
      assert.equal(loaded.body.data.source, "backend");
      assert.deepEqual(loaded.body.data.state, payload.state);
    });
  });

  await test("state API can use an injected persistence adapter", async () => {
    const writes = [];
    let stored = stateEnvelope({ company:{ name:"Injected Adapter Co" } }, { source:"backend" });
    const persistenceAdapter = {
      async read(){
        return stored;
      },
      async write(envelope){
        writes.push(envelope);
        stored = stateEnvelope(envelope.state, {
          source:envelope.source,
          companyId:envelope.companyId,
          savedAt:"2026-06-24T07:00:00.000Z"
        });
        return stored;
      }
    };

    await withServer(async ({ baseUrl, stateFile }) => {
      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.status, 200);
      assert.equal(loaded.body.data.state.company.name, "Injected Adapter Co");
      assert.equal(fs.existsSync(stateFile), false);

      const saved = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:1, companyId:"demo-company", state:{ company:{ name:"Injected Saved Co" } } }
      });

      assert.equal(saved.status, 200);
      assert.equal(saved.body.savedAt, "2026-06-24T07:00:00.000Z");
      assert.equal(writes.length, 1);
      assert.equal(writes[0].state.company.name, "Injected Saved Co");
      assert.equal(fs.existsSync(stateFile), false);
    }, { persistenceAdapter });
  });

  await test("state API wraps legacy raw state as migration-compatible state", async () => {
    await withServer(async ({ baseUrl }) => {
      const rawState = { company:{ name:"Legacy Co" }, bills:[{ id:"BILL-1" }] };
      const saved = await requestJson(baseUrl, "/api/state", { method:"POST", body:rawState });
      assert.equal(saved.status, 200);

      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.body.data.source, "migration");
      assert.deepEqual(loaded.body.data.state, rawState);
    });
  });

  await test("state API rejects invalid and unsupported payloads", async () => {
    await withServer(async ({ baseUrl }) => {
      const badState = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:1, state:[] }
      });
      assert.equal(badState.status, 400);
      assert.equal(badState.body.ok, false);

      const badVersion = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:999, state:{} }
      });
      assert.equal(badVersion.status, 400);
      assert.match(badVersion.body.error, /Unsupported state schemaVersion/);

      const invalidJson = await requestRaw(baseUrl, "/api/state", {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:"{bad json"
      });
      assert.equal(invalidJson.status, 400);
      assert.match(invalidJson.body.error, /valid JSON/);
    });
  });

  await test("state API rejects oversized payloads before saving", async () => {
    await withServer(async ({ baseUrl, stateFile }) => {
      const oversized = JSON.stringify({ state:{ blob:"x".repeat(5 * 1024 * 1024 + 1) } });
      const result = await requestRaw(baseUrl, "/api/state", {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:oversized
      });

      assert.equal(result.status, 413);
      assert.match(result.body.error, /too large/);
      assert.equal(fs.existsSync(stateFile), false);
    });
  });

  await test("state payload normalizer supports saved legacy files", () => {
    const normalized = normalizeStatePayload({ company:{ name:"Raw File" } }, { source:"backend" });
    assert.equal(normalized.schemaVersion, 1);
    assert.equal(normalized.source, "backend");
    assert.deepEqual(normalized.state, { company:{ name:"Raw File" } });
  });

  console.log("All backend state API tests passed.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
