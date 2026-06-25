const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

function memoryStorage(initial = {}){
  const store = new Map(Object.entries(initial));
  return {
    getItem(key){ return store.has(key) ? store.get(key) : null; },
    setItem(key, value){ store.set(String(key), String(value)); },
    removeItem(key){ store.delete(key); },
    clear(){ store.clear(); },
    dump(){ return Object.fromEntries(store.entries()); }
  };
}

function loadStorageService(extras = {}){
  const modulePath = path.join(root, "frontend/src/services/storage-service.js");
  const keys = ["window", "localStorage", "sessionStorage", "structuredClone", "fetch", "console"];
  const previous = new Map(keys.map(key => [key, {
    existed:Object.prototype.hasOwnProperty.call(globalThis, key),
    value:globalThis[key]
  }]));
  const sandbox = {
    console,
    structuredClone:globalThis.structuredClone,
    localStorage:memoryStorage(),
    sessionStorage:memoryStorage(),
    ...extras
  };
  sandbox.window = Object.assign({}, sandbox);
  try{
    Object.assign(globalThis, sandbox);
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
    return sandbox.window.SmartBooksPersistence;
  }finally{
    delete require.cache[require.resolve(modulePath)];
    previous.forEach((entry, key) => {
      if(entry.existed) globalThis[key] = entry.value;
      else delete globalThis[key];
    });
  }
}

function response(ok, status, body){
  return {
    ok,
    status,
    async json(){ return body; }
  };
}

function invalidJsonResponse(ok = true, status = 200){
  return {
    ok,
    status,
    async json(){ throw new Error("invalid json"); }
  };
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
  await test("backend storage loads envelope state through loadBackend", async () => {
    const calls = [];
    const storage = loadStorageService({
      fetch:async (url, options) => {
        calls.push({ url, options });
        return response(true, 200, {
          ok:true,
          data:{ schemaVersion:1, revision:"rev_000010", state:{ company:{ name:"Backend Co" } } }
        });
      }
    }).configure({ backendEndpoint:"/api/state-test" });

    const loaded = await storage.loadBackend({ fallback:() => ({ company:{ name:"Fallback" } }) });

    assert.deepEqual(loaded, { company:{ name:"Backend Co" } });
    assert.equal(calls[0].url, "/api/state-test");
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers["X-SmartBooks-Company-Id"], "demo-company");
    assert.match(calls[0].options.headers["X-SmartBooks-Request-Id"], /.+/);
    assert.equal(storage.getStatus().stats.lastBackendRevision, "rev_000010");
    assert.equal(storage.getStatus().stats.backendReads, 1);
  });

  await test("backend storage saves state envelopes without changing local default mode", async () => {
    const calls = [];
    const localStorage = memoryStorage();
    const storage = loadStorageService({
      localStorage,
      fetch:async (url, options) => {
        calls.push({ url, options });
        return response(true, 200, { ok:true, savedAt:"2026-06-23T00:00:00.000Z" });
      }
    }).configure({ key:"unit_state", backendEndpoint:"/api/state-test" });

    const state = { company:{ name:"Save Co" } };
    const result = await storage.saveBackend(state, { companyId:"company-1" });

    assert.equal(result.ok, true);
    assert.equal(result.savedAt, "2026-06-23T00:00:00.000Z");
    assert.equal(localStorage.getItem("unit_state"), null);
    assert.equal(calls[0].options.method, "PUT");
    assert.equal(calls[0].options.headers["X-SmartBooks-Company-Id"], "company-1");
    assert.match(calls[0].options.headers["X-SmartBooks-Request-Id"], /.+/);
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      schemaVersion:1,
      companyId:"company-1",
      source:"backend",
      state
    });
    assert.equal(storage.getStatus().stats.backendWrites, 1);
  });

  await test("backend storage sends the last loaded revision on save", async () => {
    const calls = [];
    const storage = loadStorageService({
      fetch:async (url, options) => {
        calls.push({ url, options });
        if(options.method === "GET") {
          return response(true, 200, {
            ok:true,
            data:{
              schemaVersion:1,
              companyId:"demo-company",
              revision:"rev_000014",
              state:{ company:{ name:"Revision Co" } }
            }
          });
        }
        return response(true, 200, {
          ok:true,
          savedAt:"2026-06-24T08:10:00.000Z",
          revision:"rev_000015"
        });
      }
    }).configure({ mode:"backend" });

    await storage.loadAsync();
    const result = await storage.saveAsync({ company:{ name:"Revision Saved Co" } });
    const body = JSON.parse(calls[1].options.body);

    assert.equal(result.ok, true);
    assert.equal(calls[1].options.headers["X-SmartBooks-State-Revision"], "rev_000014");
    assert.equal(body.revision, "rev_000014");
    assert.equal(storage.getStatus().stats.lastBackendRevision, "rev_000015");
  });

  await test("backend storage preserves revision conflict details", async () => {
    const storage = loadStorageService({
      fetch:async (url, options) => {
        if(options.method === "GET") {
          return response(true, 200, {
            ok:true,
            data:{ schemaVersion:1, companyId:"demo-company", revision:"rev_000020", state:{} }
          });
        }
        return response(false, 409, {
          ok:false,
          error:"State revision conflict.",
          code:"STATE_REVISION_CONFLICT",
          expectedRevision:"rev_000020",
          currentRevision:"rev_000021"
        });
      }
    }).configure({ mode:"backend" });

    await storage.loadAsync();
    const result = await storage.saveAsync({ company:{ name:"Conflict Co" } });

    assert.equal(result.ok, false);
    assert.equal(result.error.code, "STATE_REVISION_CONFLICT");
    assert.equal(result.error.expectedRevision, "rev_000020");
    assert.equal(result.error.currentRevision, "rev_000021");
    assert.equal(storage.getStatus().stats.lastError.code, "STATE_REVISION_CONFLICT");
  });

  await test("backend mode loadAsync and saveAsync use the configured backend endpoint", async () => {
    const methods = [];
    const storage = loadStorageService({
      fetch:async (url, options) => {
        methods.push(options.method);
        if(options.method === "GET") return response(true, 200, { ok:true, data:{ schemaVersion:1, state:{ from:"backend" } } });
        return response(true, 200, { ok:true, savedAt:"2026-06-23T00:00:00.000Z" });
      }
    }).configure({ mode:"backend", backendEndpoint:"/api/backend-mode" });

    assert.deepEqual(await storage.loadAsync(), { from:"backend" });
    assert.equal((await storage.saveAsync({ ok:true })).ok, true);
    assert.deepEqual(methods, ["GET", "PUT"]);
  });

  await test("hybrid save keeps a local copy when backend save fails", async () => {
    let sawError = false;
    const localStorage = memoryStorage();
    const storage = loadStorageService({
      localStorage,
      fetch:async () => response(false, 500, { error:"backend down" })
    }).configure({ key:"hybrid_state", mode:"hybrid" });

    const result = await storage.saveAsync({ company:{ name:"Hybrid Co" } }, {
      onError(){ sawError = true; }
    });

    assert.equal(result.ok, false);
    assert.equal(sawError, true);
    assert.deepEqual(JSON.parse(localStorage.getItem("hybrid_state")), { company:{ name:"Hybrid Co" } });
    assert.equal(storage.getStatus().stats.errors, 1);
  });

  await test("backend load failure returns fallback without overwriting local data", async () => {
    const localStorage = memoryStorage({ safe:JSON.stringify({ local:true }) });
    const storage = loadStorageService({
      localStorage,
      fetch:async () => response(false, 500, { error:"backend unavailable" })
    }).configure({ key:"safe", mode:"backend" });

    const loaded = await storage.loadAsync({ fallback:() => ({ fallback:true }), onError(){} });

    assert.deepEqual(loaded, { fallback:true });
    assert.deepEqual(JSON.parse(localStorage.getItem("safe")), { local:true });
    assert.equal(storage.getStatus().stats.errors, 1);
  });

  await test("backend load rejects invalid JSON and invalid envelopes", async () => {
    const invalidJson = loadStorageService({
      fetch:async () => invalidJsonResponse()
    }).configure({ mode:"backend" });

    let jsonError = "";
    const jsonLoaded = await invalidJson.loadAsync({
      fallback:() => ({ fallback:true }),
      onError(error){ jsonError = error.message; }
    });
    assert.deepEqual(jsonLoaded, { fallback:true });
    assert.match(jsonError, /not valid JSON/);
    assert.equal(invalidJson.getStatus().stats.errors, 1);

    const invalidEnvelope = loadStorageService({
      fetch:async () => response(true, 200, { ok:true, data:{ state:[] } })
    }).configure({ mode:"backend" });

    let envelopeError = "";
    const envelopeLoaded = await invalidEnvelope.loadAsync({
      fallback:() => ({ fallback:true }),
      onError(error){ envelopeError = error.message; }
    });
    assert.deepEqual(envelopeLoaded, { fallback:true });
    assert.match(envelopeError, /object state/);
    assert.equal(invalidEnvelope.getStatus().stats.errors, 1);

    const wrongCompany = loadStorageService({
      fetch:async () => response(true, 200, { ok:true, data:{ schemaVersion:1, companyId:"wrong-company", state:{} } })
    }).configure({ mode:"backend", companyId:"requested-company" });

    let companyError = "";
    const companyLoaded = await wrongCompany.loadAsync({
      fallback:() => ({ fallback:true }),
      onError(error){ companyError = error.message; }
    });
    assert.deepEqual(companyLoaded, { fallback:true });
    assert.match(companyError, /companyId did not match/);
    assert.equal(wrongCompany.getStatus().stats.errors, 1);
  });

  await test("backend save supports migration source envelopes", async () => {
    let body = null;
    const storage = loadStorageService({
      fetch:async (url, options) => {
        body = JSON.parse(options.body);
        return response(true, 200, { ok:true, savedAt:"2026-06-23T00:00:00.000Z" });
      }
    }).configure({ backendEndpoint:"/api/state-test" });

    const result = await storage.saveBackend({ company:{ name:"Migrated Co" } }, { source:"migration" });

    assert.equal(result.ok, true);
    assert.equal(body.source, "migration");
    assert.deepEqual(body.state, { company:{ name:"Migrated Co" } });
  });

  await test("backend requests use configured company identity by default", async () => {
    const calls = [];
    const storage = loadStorageService({
      fetch:async (url, options) => {
        calls.push({ url, options });
        if(options.method === "GET") return response(true, 200, { ok:true, data:{ schemaVersion:1, companyId:"company-config", state:{} } });
        return response(true, 200, { ok:true, savedAt:"2026-06-23T00:00:00.000Z" });
      }
    }).configure({ mode:"backend", companyId:"company-config" });

    await storage.loadAsync();
    await storage.saveAsync({ company:{ name:"Configured Co" } });

    assert.equal(calls[0].options.headers["X-SmartBooks-Company-Id"], "company-config");
    assert.equal(calls[1].options.headers["X-SmartBooks-Company-Id"], "company-config");
    assert.equal(JSON.parse(calls[1].options.body).companyId, "company-config");
    assert.equal(storage.getStatus().companyId, "company-config");
  });

  console.log("All storage backend service tests passed.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
