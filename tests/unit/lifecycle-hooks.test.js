const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const lifecyclePath = path.join(root, 'frontend/src/runtime/lifecycle-hooks.js');

function loadLifecycle(){
  const previousWindow = Object.prototype.hasOwnProperty.call(globalThis, 'window') ? globalThis.window : undefined;
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, 'window');
  globalThis.window = { console };
  delete require.cache[require.resolve(lifecyclePath)];
  require(lifecyclePath);
  const lifecycle = globalThis.window.SmartBooksLifecycle;
  return {
    lifecycle,
    cleanup(){
      delete require.cache[require.resolve(lifecyclePath)];
      if(hadWindow) globalThis.window = previousWindow;
      else delete globalThis.window;
    }
  };
}

function test(name, fn){
  try{
    fn();
    console.log(`ok - ${name}`);
  }catch(error){
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('lifecycle registry runs hooks in deterministic registration order', () => {
  const { lifecycle, cleanup } = loadLifecycle();
  try{
    const calls = [];
    lifecycle.register('beforeSave', 'first', () => calls.push('first'));
    lifecycle.register('beforeSave', 'second', () => calls.push('second'));
    lifecycle.register('beforeSave', 'third', () => calls.push('third'));

    lifecycle.run('beforeSave');

    assert.deepEqual(calls, ['first', 'second', 'third']);
    assert.deepEqual(
      lifecycle.list('beforeSave').map(entry => entry.id),
      ['first', 'second', 'third']
    );
  }finally{
    cleanup();
  }
});

test('lifecycle unregister removes one hook without changing remaining order', () => {
  const { lifecycle, cleanup } = loadLifecycle();
  try{
    const calls = [];
    lifecycle.register('normalizeState', 'first', () => calls.push('first'));
    const unregister = lifecycle.register('normalizeState', 'second', () => calls.push('second'));
    lifecycle.register('normalizeState', 'third', () => calls.push('third'));

    unregister();
    lifecycle.run('normalizeState');

    assert.deepEqual(calls, ['first', 'third']);
    assert.deepEqual(
      lifecycle.list('normalizeState').map(entry => entry.id),
      ['first', 'third']
    );
  }finally{
    cleanup();
  }
});

test('core hook installer wraps save and render once with before and after hooks', () => {
  const { lifecycle, cleanup } = loadLifecycle();
  try{
    const calls = [];
    let saveState = function(){ calls.push('save'); return 'saved'; };
    let renderAll = function(){ calls.push('render'); return 'rendered'; };

    lifecycle.register('beforeSave', 'save-hook', () => calls.push('beforeSave'));
    lifecycle.register('beforeRender', 'render-hook', () => calls.push('beforeRender'));
    lifecycle.register('afterRender', 'after-render-hook', context => calls.push(`afterRender:${context.result}`));

    const installed = lifecycle.installCoreHooks({
      getSaveState:() => saveState,
      setSaveState:fn => { saveState = fn; },
      getRenderAll:() => renderAll,
      setRenderAll:fn => { renderAll = fn; }
    });
    const installedAgain = lifecycle.installCoreHooks({
      getSaveState:() => saveState,
      setSaveState:fn => { saveState = fn; },
      getRenderAll:() => renderAll,
      setRenderAll:fn => { renderAll = fn; }
    });

    assert.equal(installed, true);
    assert.equal(installedAgain, false);
    assert.equal(saveState(), 'saved');
    assert.equal(renderAll(), 'rendered');
    assert.deepEqual(calls, ['beforeSave', 'save', 'beforeRender', 'render', 'afterRender:rendered']);
  }finally{
    cleanup();
  }
});

console.log('All lifecycle hook tests passed.');
