// SmartBooks storage adapter.
// The app still uses localStorage by default, but callers no longer need to know that.
(function(global){
  const DEFAULT_KEY = 'smartbooks_state';
  const DEFAULT_ENDPOINT = '/api/state';
  const config = {
    key: DEFAULT_KEY,
    mode: 'local',
    backendEndpoint: DEFAULT_ENDPOINT,
    companyId: 'demo-company'
  };
  const stats = {
    reads: 0,
    writes: 0,
    backendReads: 0,
    backendWrites: 0,
    backups: 0,
    errors: 0,
    lastSavedAt: null,
    lastLoadedAt: null,
    lastBackendSavedAt: null,
    lastBackendSource: null,
    lastBackendCompanyId: null,
    lastBackendRevision: null,
    lastBackendStateEmpty: false,
    lastError: null
  };

  function clone(value){
    if(value === undefined) return undefined;
    try{ return global.structuredClone ? global.structuredClone(value) : JSON.parse(JSON.stringify(value)); }
    catch(error){ return JSON.parse(JSON.stringify(value)); }
  }

  function configure(options){
    if(!options || typeof options !== 'object') return api;
    if(options.key) config.key = String(options.key);
    if(options.backendEndpoint) config.backendEndpoint = String(options.backendEndpoint);
    if(options.companyId) config.companyId = String(options.companyId);
    if(['local','backend','hybrid'].includes(String(options.mode))) config.mode = String(options.mode);
    return api;
  }

  function normalizeLoaded(value, fallbackFactory, normalize){
    const fallback = typeof fallbackFactory === 'function' ? fallbackFactory : () => ({});
    const normalizer = typeof normalize === 'function' ? normalize : x => x;
    if(value === undefined || value === null) return normalizer(clone(fallback()));
    return normalizer(value);
  }

  function fetchClient(options){
    const fn = options?.fetch || global.fetch;
    if(typeof fn !== 'function') throw new Error('Backend persistence requires fetch support.');
    return fn.bind(global);
  }

  function backendEndpoint(options){
    return options?.backendEndpoint || config.backendEndpoint;
  }

  function companyId(options){
    return options?.companyId || config.companyId || 'demo-company';
  }

  function requestId(){
    if(global.crypto?.randomUUID) return global.crypto.randomUUID();
    return `sb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function backendHeaders(options, extra = {}){
    return {
      'Accept':'application/json',
      'X-SmartBooks-Company-Id':companyId(options),
      'X-SmartBooks-Request-Id':requestId(),
      ...extra
    };
  }

  function revisionHeader(revision){
    return revision ? { 'X-SmartBooks-State-Revision':String(revision) } : {};
  }

  function isPlainObject(value){
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function backendEnvelope(payload, expectedCompanyId){
    const data = payload?.data || payload;
    if(!isPlainObject(data) || !Object.prototype.hasOwnProperty.call(data, 'state')){
      throw new Error('Backend response must include a state envelope.');
    }
    if(!isPlainObject(data.state)) throw new Error('Backend state envelope must include an object state.');
    if(data.schemaVersion !== undefined && Number(data.schemaVersion) !== 1){
      throw new Error(`Unsupported backend state schemaVersion: ${data.schemaVersion}.`);
    }
    if(data.companyId && expectedCompanyId && data.companyId !== expectedCompanyId){
      throw new Error('Backend response companyId did not match the requested company scope.');
    }
    return data;
  }

  async function readResponseJson(response){
    try{ return await response.json(); }
    catch(error){ throw new Error('Backend response was not valid JSON.'); }
  }

  function backendError(payload, fallback){
    const error = new Error(payload?.error || fallback);
    if(payload?.code) error.code = payload.code;
    if(payload?.expectedRevision !== undefined) error.expectedRevision = payload.expectedRevision;
    if(payload?.currentRevision !== undefined) error.currentRevision = payload.currentRevision;
    return error;
  }

  async function loadBackend(options){
    const opts = options || {};
    stats.reads++;
    stats.backendReads++;
    try{
      const response = await fetchClient(opts)(backendEndpoint(opts), {
        method:'GET',
        headers:backendHeaders(opts)
      });
      const payload = await readResponseJson(response);
      if(!response.ok) throw backendError(payload, `Backend load failed with HTTP ${response.status}.`);
      if(payload && payload.ok === false) throw backendError(payload, 'Backend load failed.');
      const envelope = backendEnvelope(payload, companyId(opts));
      const backendStateEmpty = Object.keys(envelope.state).length === 0;
      const loaded = normalizeLoaded(envelope.state, opts.fallback, opts.normalize);
      stats.lastLoadedAt = Date.now();
      stats.lastBackendSource = envelope.source || null;
      stats.lastBackendCompanyId = envelope.companyId || null;
      stats.lastBackendRevision = envelope.revision || null;
      stats.lastBackendStateEmpty = backendStateEmpty;
      stats.lastError = null;
      return loaded;
    }catch(error){
      stats.errors++;
      stats.lastError = error;
      if(typeof opts.onError === 'function') opts.onError(error);
      else console.warn('SmartBooks backend storage load failed', error);
      return normalizeLoaded(null, opts.fallback, opts.normalize);
    }
  }

  async function saveBackend(state, options){
    const opts = options || {};
    stats.writes++;
    stats.backendWrites++;
    try{
      const revision = opts.revision || stats.lastBackendRevision || null;
      const envelope = {
        schemaVersion:1,
        companyId:companyId(opts),
        source:opts.source || 'backend',
        ...(revision ? { revision } : {}),
        state:clone(state || {})
      };
      const response = await fetchClient(opts)(backendEndpoint(opts), {
        method:opts.method || 'PUT',
        headers:backendHeaders(opts, { 'Content-Type':'application/json', ...revisionHeader(revision) }),
        body:JSON.stringify(envelope)
      });
      const payload = await readResponseJson(response);
      if(!response.ok) throw backendError(payload, `Backend save failed with HTTP ${response.status}.`);
      if(payload && payload.ok === false) throw backendError(payload, 'Backend save failed.');
      stats.lastSavedAt = Date.now();
      stats.lastBackendSavedAt = payload.savedAt || null;
      stats.lastBackendRevision = payload.revision || stats.lastBackendRevision || null;
      stats.lastError = null;
      return { ok:true, savedAt:payload.savedAt || null, payload };
    }catch(error){
      stats.errors++;
      stats.lastError = error;
      if(typeof opts.onError === 'function') opts.onError(error);
      return { ok:false, error };
    }
  }

  async function loadAsync(options){
    if(config.mode === 'backend' || config.mode === 'hybrid') return loadBackend(options);
    return load(options);
  }

  async function saveAsync(state, options){
    if(config.mode === 'backend') return saveBackend(state, options);
    if(config.mode === 'hybrid'){
      const localResult = save(state, options);
      const backendResult = await saveBackend(state, options);
      return backendResult.ok ? backendResult : { ...backendResult, local:localResult };
    }
    return save(state, options);
  }

  function load(options){
    const opts = options || {};
    const key = opts.key || config.key;
    stats.reads++;
    try{
      const saved = global.localStorage.getItem(key);
      if(saved) return normalizeLoaded(JSON.parse(saved), opts.fallback, opts.normalize);
    }catch(error){
      stats.errors++;
      stats.lastError = error;
      if(typeof opts.onError === 'function') opts.onError(error);
      else console.warn('SmartBooks storage load failed', error);
    }
    return normalizeLoaded(null, opts.fallback, opts.normalize);
  }

  function save(state, options){
    const opts = options || {};
    const key = opts.key || config.key;
    try{
      const payload = JSON.stringify(state);
      global.localStorage.setItem(key, payload);
      if(opts.backupKey) global.localStorage.setItem(opts.backupKey, payload);
      stats.writes++;
      stats.lastSavedAt = Date.now();
      stats.lastError = null;
      return { ok:true, payload };
    }catch(error){
      stats.errors++;
      stats.lastError = error;
      return { ok:false, error };
    }
  }

  function backup(state, label, options){
    const opts = options || {};
    const key = opts.key || config.key;
    const suffix = label ? String(label).replace(/[^a-z0-9_-]/gi, '_') : 'manual';
    const backupKey = opts.backupKey || `${key}_${suffix}_backup`;
    const result = save(state, { key: backupKey });
    if(result.ok) stats.backups++;
    return result;
  }

  function saveSessionCopy(state, options){
    const opts = options || {};
    const key = opts.key || `${config.key}_unsaved_session_copy`;
    try{
      global.sessionStorage.setItem(key, JSON.stringify(state));
      return { ok:true };
    }catch(error){
      stats.errors++;
      stats.lastError = error;
      return { ok:false, error };
    }
  }

  function exportState(state){
    return clone(state || {});
  }

  function downloadJson(state, filename){
    const blob = new Blob([JSON.stringify(exportState(state), null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'smartbooks-company-data.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  function getStatus(){
    return {
      key: config.key,
      mode: config.mode,
      backendEndpoint: config.backendEndpoint,
      companyId: config.companyId,
      stats: Object.assign({}, stats)
    };
  }

  const api = {
    configure,
    load,
    save,
    loadAsync,
    saveAsync,
    loadBackend,
    saveBackend,
    backup,
    saveSessionCopy,
    exportState,
    downloadJson,
    getStatus,
    get key(){ return config.key; },
    get mode(){ return config.mode; },
    set mode(value){ configure({ mode:value }); }
  };

  global.SmartBooksPersistence = api;
})(window);
