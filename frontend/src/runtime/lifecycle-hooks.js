// SmartBooks lifecycle hook registry.
// Provides deterministic extension points while the legacy runtime is migrated
// away from broad saveState/renderAll reassignment.
(function(){
  const root = typeof window !== 'undefined' ? window : globalThis;
  const hookMap = new Map();
  let sequence = 0;
  const coreState = {
    installed:false,
    rendering:false
  };

  function entriesFor(name){
    const key = String(name || '').trim();
    if(!key) throw new Error('Lifecycle hook name is required.');
    if(!hookMap.has(key)) hookMap.set(key, []);
    return hookMap.get(key);
  }

  function register(name, id, callback){
    if(typeof callback !== 'function') throw new Error('Lifecycle hook callback must be a function.');
    const hookId = String(id || '').trim();
    if(!hookId) throw new Error('Lifecycle hook id is required.');
    const entries = entriesFor(name);
    const existing = entries.findIndex(entry => entry.id === hookId);
    const entry = { id:hookId, callback, order:++sequence };
    if(existing >= 0) entries.splice(existing, 1, entry);
    else entries.push(entry);
    entries.sort((a,b) => a.order - b.order);
    return function unregister(){
      const current = entriesFor(name);
      const index = current.findIndex(item => item.id === hookId);
      if(index >= 0) current.splice(index, 1);
    };
  }

  function run(name, context){
    const entries = entriesFor(name).slice().sort((a,b) => a.order - b.order);
    const hookContext = context || {};
    const results = [];
    entries.forEach(entry => {
      try{
        results.push(entry.callback.call(hookContext.thisArg || root, hookContext));
      }catch(error){
        if(hookContext.failFast) throw error;
        try{ console.warn(`SmartBooks lifecycle hook failed: ${name}:${entry.id}`, error); }catch(e){}
        results.push(undefined);
      }
    });
    return results;
  }

  function list(name){
    if(name) return entriesFor(name).map(entry => ({ id:entry.id, order:entry.order }));
    return Array.from(hookMap.keys()).reduce((out, key) => {
      out[key] = list(key);
      return out;
    }, {});
  }

  function installCoreHooks(options){
    if(coreState.installed) return false;
    const config = options || {};
    const getSaveState = typeof config.getSaveState === 'function' ? config.getSaveState : () => root.saveState;
    const setSaveState = typeof config.setSaveState === 'function' ? config.setSaveState : fn => { root.saveState = fn; };
    const getRenderAll = typeof config.getRenderAll === 'function' ? config.getRenderAll : () => root.renderAll;
    const setRenderAll = typeof config.setRenderAll === 'function' ? config.setRenderAll : fn => { root.renderAll = fn; };

    const baseSaveState = getSaveState();
    if(typeof baseSaveState === 'function'){
      setSaveState(function smartBooksLifecycleSaveState(){
        run('beforeSave', { args:Array.from(arguments), thisArg:this, source:'saveState' });
        return baseSaveState.apply(this, arguments);
      });
    }

    const baseRenderAll = getRenderAll();
    if(typeof baseRenderAll === 'function'){
      setRenderAll(function smartBooksLifecycleRenderAll(){
        if(coreState.rendering) return baseRenderAll.apply(this, arguments);
        coreState.rendering = true;
        let result;
        try{
          run('beforeRender', { args:Array.from(arguments), thisArg:this, source:'renderAll' });
          result = baseRenderAll.apply(this, arguments);
          run('afterRender', { args:Array.from(arguments), thisArg:this, result, source:'renderAll' });
          return result;
        }finally{
          coreState.rendering = false;
        }
      });
    }

    coreState.installed = true;
    return true;
  }

  function resetForTests(){
    hookMap.clear();
    sequence = 0;
    coreState.installed = false;
    coreState.rendering = false;
  }

  root.SmartBooksLifecycle = {
    register,
    run,
    list,
    installCoreHooks,
    resetForTests
  };
})();
