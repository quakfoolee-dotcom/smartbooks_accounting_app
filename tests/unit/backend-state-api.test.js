const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

const root = path.resolve(__dirname, "../..");
const {
  COMPANY_ID_HEADER,
  REVISION_HEADER,
  createSmartBooksServer,
  normalizeStatePayload,
  stateEnvelope
} = require(path.join(root, "backend/src/server.js"));

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
  const headers = {
    [COMPANY_ID_HEADER]: options.companyId || "demo-company",
    ...(options.body === undefined ? {} : { "Content-Type":"application/json" }),
    ...(options.headers || {})
  };
  if(options.companyId === null) delete headers[COMPANY_ID_HEADER];
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  return { status:response.status, body:await response.json() };
}

async function requestRaw(baseUrl, pathname, options = {}){
  const headers = {
    [COMPANY_ID_HEADER]: options.companyId || "demo-company",
    ...(options.headers || {})
  };
  if(options.companyId === null) delete headers[COMPANY_ID_HEADER];
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers,
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
      assert.equal(result.body.data.revision, "rev_000001");
      assert.deepEqual(result.body.data.state, {});
      assert.equal(result.body.data.source, "backend");
    });
  });

  await test("monitoring endpoints expose liveness, readiness, and safe metrics", async () => {
    await withServer(async ({ baseUrl, stateFile }) => {
      const live = await requestJson(baseUrl, "/api/live", { companyId:null });
      assert.equal(live.status, 200);
      assert.equal(live.body.ok, true);
      assert.equal(live.body.status, "live");
      assert.equal(live.body.service, "smartbooks-backend");

      const health = await requestJson(baseUrl, "/api/health", { companyId:null });
      assert.equal(health.status, 200);
      assert.equal(health.body.status, "live");

      const ready = await requestJson(baseUrl, "/api/ready", { companyId:null });
      assert.equal(ready.status, 200);
      assert.equal(ready.body.ok, true);
      assert.equal(ready.body.status, "ready");
      assert.equal(ready.body.checks.persistence.status, "pass");
      assert.equal(ready.body.checks.persistence.revisionPresent, true);
      assert.equal(JSON.stringify(ready.body).includes(stateFile), false);

      const metrics = await requestJson(baseUrl, "/api/metrics", { companyId:null });
      assert.equal(metrics.status, 200);
      assert.equal(metrics.body.ok, true);
      assert.equal(metrics.body.service, "smartbooks-backend");
      assert.ok(metrics.body.requests.total >= 3);
      assert.ok(metrics.body.requests.api >= 3);
      assert.ok(metrics.body.requests.routes["GET /api/live"]);
      assert.ok(metrics.body.requests.routes["GET /api/ready"]);
      assert.equal(JSON.stringify(metrics.body).includes(stateFile), false);
    });
  });

  await test("readiness reports degraded persistence without leaking internals", async () => {
    const persistenceAdapter = {
      async read(){
        throw new Error("C:\\private\\smartbooks-state.json permission denied");
      }
    };

    await withServer(async ({ baseUrl }) => {
      const ready = await requestJson(baseUrl, "/api/ready", { companyId:null });
      assert.equal(ready.status, 503);
      assert.equal(ready.body.ok, false);
      assert.equal(ready.body.status, "degraded");
      assert.equal(ready.body.checks.persistence.status, "fail");
      assert.equal(ready.body.checks.persistence.detail, "Persistence dependency is not readable.");
      const serialized = JSON.stringify(ready.body);
      assert.equal(serialized.includes("private"), false);
      assert.equal(serialized.includes("permission denied"), false);
    }, { persistenceAdapter });
  });

  await test("state API requires a request company scope", async () => {
    await withServer(async ({ baseUrl }) => {
      const missingRead = await requestJson(baseUrl, "/api/state", { companyId:null });
      assert.equal(missingRead.status, 400);
      assert.match(missingRead.body.error, /Company-Id header is required/);

      const missingWrite = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        companyId:null,
        body:{ schemaVersion:1, state:{} }
      });
      assert.equal(missingWrite.status, 400);
      assert.match(missingWrite.body.error, /Company-Id header is required/);
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
      assert.equal(saved.body.companyId, "demo-company");
      assert.ok(saved.body.requestId);
      assert.ok(saved.body.savedAt);
      assert.equal(saved.body.revision, "rev_000002");
      assert.equal(fs.existsSync(stateFile), true);

      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.status, 200);
      assert.equal(loaded.body.data.schemaVersion, 1);
      assert.equal(loaded.body.data.companyId, "demo-company");
      assert.equal(loaded.body.data.source, "backend");
      assert.equal(loaded.body.data.revision, saved.body.revision);
      assert.deepEqual(loaded.body.data.state, payload.state);
    });
  });

  await test("state API rejects stale revisions without overwriting backend state", async () => {
    await withServer(async ({ baseUrl }) => {
      const first = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:1, companyId:"demo-company", state:{ company:{ name:"First Co" } } }
      });
      assert.equal(first.status, 200);

      const second = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        headers:{ [REVISION_HEADER]:first.body.revision },
        body:{ schemaVersion:1, companyId:"demo-company", revision:first.body.revision, state:{ company:{ name:"Second Co" } } }
      });
      assert.equal(second.status, 200);

      const stale = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        headers:{ [REVISION_HEADER]:first.body.revision },
        body:{ schemaVersion:1, companyId:"demo-company", revision:first.body.revision, state:{ company:{ name:"Stale Co" } } }
      });
      assert.equal(stale.status, 409);
      assert.equal(stale.body.code, "STATE_REVISION_CONFLICT");
      assert.equal(stale.body.expectedRevision, first.body.revision);
      assert.equal(stale.body.currentRevision, second.body.revision);

      const missingRevision = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:1, companyId:"demo-company", state:{ company:{ name:"No Revision Co" } } }
      });
      assert.equal(missingRevision.status, 409);
      assert.equal(missingRevision.body.currentRevision, second.body.revision);

      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.body.data.revision, second.body.revision);
      assert.equal(loaded.body.data.state.company.name, "Second Co");
    });
  });

  await test("state API creates, lists, and restores scoped backups", async () => {
    await withServer(async ({ baseUrl }) => {
      const first = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:1, companyId:"demo-company", state:{ company:{ name:"Backup Source Co" } } }
      });
      assert.equal(first.status, 200);

      const backup = await requestJson(baseUrl, "/api/state/backup", {
        method:"POST",
        body:{ label:"before-restore" }
      });
      assert.equal(backup.status, 200);
      assert.equal(backup.body.ok, true);
      assert.match(backup.body.backup.id, /before-restore\.json$/);
      assert.equal(backup.body.backup.companyId, "demo-company");
      assert.equal(backup.body.backup.revision, first.body.revision);

      const changed = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        headers:{ [REVISION_HEADER]:first.body.revision },
        body:{
          schemaVersion:1,
          companyId:"demo-company",
          revision:first.body.revision,
          state:{ company:{ name:"Changed Before Restore Co" } }
        }
      });
      assert.equal(changed.status, 200);

      const backups = await requestJson(baseUrl, "/api/state/backups");
      assert.equal(backups.status, 200);
      assert.equal(backups.body.backups.length, 1);
      assert.equal(backups.body.backups[0].id, backup.body.backup.id);

      const restored = await requestJson(baseUrl, "/api/state/restore", {
        method:"POST",
        headers:{ [REVISION_HEADER]:changed.body.revision },
        body:{ backupId:backup.body.backup.id, revision:changed.body.revision }
      });
      assert.equal(restored.status, 200);
      assert.equal(restored.body.ok, true);
      assert.equal(restored.body.companyId, "demo-company");
      assert.ok(restored.body.revision);
      assert.notEqual(restored.body.revision, changed.body.revision);

      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.body.data.source, "restore");
      assert.equal(loaded.body.data.revision, restored.body.revision);
      assert.equal(loaded.body.data.state.company.name, "Backup Source Co");
    });
  });

  await test("state API rejects invalid restore requests safely", async () => {
    await withServer(async ({ baseUrl }) => {
      const first = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        body:{ schemaVersion:1, companyId:"demo-company", state:{ company:{ name:"Restore Guard Co" } } }
      });
      const backup = await requestJson(baseUrl, "/api/state/backup", {
        method:"POST",
        body:{ label:"restore-guard" }
      });
      const changed = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        headers:{ [REVISION_HEADER]:first.body.revision },
        body:{ schemaVersion:1, companyId:"demo-company", revision:first.body.revision, state:{ company:{ name:"Newer Co" } } }
      });

      const missingId = await requestJson(baseUrl, "/api/state/restore", {
        method:"POST",
        body:{ revision:changed.body.revision }
      });
      assert.equal(missingId.status, 400);
      assert.match(missingId.body.error, /backupId/);

      const unsafeId = await requestJson(baseUrl, "/api/state/restore", {
        method:"POST",
        headers:{ [REVISION_HEADER]:changed.body.revision },
        body:{ backupId:"../restore-guard.json", revision:changed.body.revision }
      });
      assert.equal(unsafeId.status, 400);

      const staleRestore = await requestJson(baseUrl, "/api/state/restore", {
        method:"POST",
        headers:{ [REVISION_HEADER]:first.body.revision },
        body:{ backupId:backup.body.backup.id, revision:first.body.revision }
      });
      assert.equal(staleRestore.status, 409);
      assert.equal(staleRestore.body.code, "STATE_REVISION_CONFLICT");

      const missingBackup = await requestJson(baseUrl, "/api/state/restore", {
        method:"POST",
        headers:{ [REVISION_HEADER]:changed.body.revision },
        body:{ backupId:"missing.json", revision:changed.body.revision }
      });
      assert.equal(missingBackup.status, 404);

      const loaded = await requestJson(baseUrl, "/api/state");
      assert.equal(loaded.body.data.state.company.name, "Newer Co");
    });
  });

  await test("state API rejects payloads outside the request company scope", async () => {
    await withServer(async ({ baseUrl }) => {
      const result = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        companyId:"company-a",
        body:{ schemaVersion:1, companyId:"company-b", state:{ company:{ name:"Wrong Scope" } } }
      });

      assert.equal(result.status, 403);
      assert.match(result.body.error, /does not match request company scope/);
    });
  });

  await test("state API prevents cross-company read and overwrite", async () => {
    await withServer(async ({ baseUrl }) => {
      const saved = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        companyId:"company-a",
        body:{ schemaVersion:1, companyId:"company-a", state:{ company:{ name:"Company A" } } }
      });
      assert.equal(saved.status, 200);

      const blockedRead = await requestJson(baseUrl, "/api/state", { companyId:"company-b" });
      assert.equal(blockedRead.status, 403);
      assert.match(blockedRead.body.error, /Company scope mismatch/);

      const blockedWrite = await requestJson(baseUrl, "/api/state", {
        method:"PUT",
        companyId:"company-b",
        body:{ schemaVersion:1, companyId:"company-b", state:{ company:{ name:"Company B" } } }
      });
      assert.equal(blockedWrite.status, 403);
      assert.match(blockedWrite.body.error, /Company scope mismatch/);
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
        headers:{ [REVISION_HEADER]:loaded.body.data.revision },
        body:{
          schemaVersion:1,
          companyId:"demo-company",
          revision:loaded.body.data.revision,
          state:{ company:{ name:"Injected Saved Co" } }
        }
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
