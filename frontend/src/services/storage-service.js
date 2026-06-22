// SmartBooks storage adapter.
// The app still uses localStorage by default, but callers no longer need to know that.
(function(global){
  const DEFAULT_KEY = 'smartbooks_state';
  const DEFAULT_ENDPOINT = '/api/state';
  const config = {
    key: DEFAULT_KEY,
    mode: 'local',
    backendEndpoint: DEFAULT_ENDPOINT
  };
  const stats = {
    reads: 0,
    writes: 0,
    backups: 0,
    errors: 0,
    lastSavedAt: null,
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
    if(['local','backend','hybrid'].includes(String(options.mode))) config.mode = String(options.mode);
    return api;
  }

  function normalizeLoaded(value, fallbackFactory, normalize){
    const fallback = typeof fallbackFactory === 'function' ? fallbackFactory : () => ({});
    const normalizer = typeof normalize === 'function' ? normalize : x => x;
    if(value === undefined || value === null) return normalizer(clone(fallback()));
    return normalizer(value);
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
      stats: Object.assign({}, stats)
    };
  }

  const api = {
    configure,
    load,
    save,
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
