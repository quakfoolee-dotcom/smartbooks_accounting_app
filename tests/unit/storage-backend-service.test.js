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
          data:{ schemaVersion:1, state:{ company:{ name:"Backend Co" } } }
        });
      }
    }).configure({ backendEndpoint:"/api/state-test" });

    const loaded = await storage.loadBackend({ fallback:() => ({ company:{ name:"Fallback" } }) });

    assert.deepEqual(loaded, { company:{ name:"Backend Co" } });
    assert.equal(calls[0].url, "/api/state-test");
    assert.equal(calls[0].options.method, "GET");
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
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      schemaVersion:1,
      companyId:"company-1",
      state
    });
    assert.equal(storage.getStatus().stats.backendWrites, 1);
  });

  await test("backend mode loadAsync and saveAsync use the configured backend endpoint", async () => {
    const methods = [];
    const storage = loadStorageService({
      fetch:async (url, options) => {
        methods.push(options.method);
        if(options.method === "GET") return response(true, 200, { ok:true, data:{ state:{ from:"backend" } } });
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

  console.log("All storage backend service tests passed.");
})().catch(error => {
  console.error(error);
  process.exit(1);
});
