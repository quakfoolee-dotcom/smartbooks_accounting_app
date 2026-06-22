const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');

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

function fakeElement(){
  return {
    style: {},
    dataset: {},
    classList: { contains(){ return false; } },
    appendChild(){},
    remove(){},
    click(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    setAttribute(){},
    getAttribute(){ return null; },
    textContent: '',
    innerHTML: ''
  };
}

function fakeDocument(){
  return {
    readyState: 'loading',
    body: fakeElement(),
    createElement(){ return fakeElement(); },
    addEventListener(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    createTreeWalker(){ return { nextNode(){ return false; }, currentNode:null }; }
  };
}

function loadBrowserScript(relativePath, extras = {}){
  const sandbox = {
    console,
    setTimeout(fn){ if(typeof fn === 'function') fn(); return 0; },
    clearTimeout(){},
    Blob: class Blob {
      constructor(parts, options){ this.parts = parts; this.options = options; }
    },
    URL: {
      createObjectURL(){ return 'blob:unit-test'; },
      revokeObjectURL(){}
    },
    TextDecoder,
    NodeFilter: { SHOW_TEXT: 4 },
    MutationObserver: class MutationObserver {
      constructor(callback){ this.callback = callback; }
      observe(){}
      disconnect(){}
    },
    window: {},
    document: fakeDocument(),
    ...extras
  };
  sandbox.window = Object.assign(sandbox.window, sandbox);
  const code = fs.readFileSync(path.join(root, relativePath), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: relativePath });
  return sandbox;
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

function plain(value){
  return JSON.parse(JSON.stringify(value));
}

const modules = [
  { id:'dashboard', label:'Dashboard', icon:'D' },
  { id:'apps', label:'Apps', icon:'A' },
  { id:'banking', label:'Banking', icon:'B' },
  { id:'transactions', label:'Transactions', icon:'T' },
  { id:'settings', label:'Settings', icon:'S' },
  { id:'custom', label:'Custom Module', icon:'C' }
];

test('navigation model normalizes menu order and appends unknown modules', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  assert.deepEqual(
    plain(
    nav.defaultMenuOrder(modules),
    ),
    ['getthingsdone','dashboard','apps','banking','transactions','settings','custom']
  );
  assert.deepEqual(
    plain(
    nav.normalizeOrder(['custom','banking','missing','banking'], modules),
    ),
    ['custom','banking','getthingsdone','dashboard','apps','transactions','settings']
  );
});

test('navigation model keeps dashboard and settings visible', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  assert.deepEqual(plain(nav.normalizeVisible(['banking','missing'], modules)), ['banking','dashboard','settings']);
  assert.equal(nav.isVisible('dashboard', { visibleMenuItems:[] }, modules), true);
  assert.equal(nav.isVisible('settings', { visibleMenuItems:[] }, modules), true);
  assert.equal(nav.isVisible('banking', { visibleMenuItems:['dashboard','settings'] }, modules), false);
});

test('navigation model syncs settings and derives visible modules', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  const settings = { menuOrder:['settings','dashboard'], visibleMenuItems:['apps'] };
  nav.syncSettings(settings, modules, items => items.filter(id => id !== 'custom'));
  assert.deepEqual(plain(settings.menuOrder), ['settings','dashboard','getthingsdone','apps','banking','transactions','custom']);
  assert.deepEqual(plain(settings.visibleMenuItems), ['apps','dashboard','settings']);
  assert.deepEqual(plain(settings.visibleModules), ['apps','dashboard','settings']);
});

test('navigation model maps menu ids into bookmark ids without duplicates', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  const registry = nav.menuRegistry(modules);
  const result = nav.menuIdsToBookmarkIds(
    ['banking','dashboard','banking','missing'],
    [{ id:'home-bookmark', nav:'dashboard', label:'Home' }],
    registry,
    ['existing']
  );
  assert.deepEqual(plain(result.ids), ['existing','banking','home-bookmark']);
  assert.equal(result.added, 2);
});

test('storage service loads fallback, saves JSON, and tracks status', () => {
  const localStorage = memoryStorage();
  const sessionStorage = memoryStorage();
  const { window } = loadBrowserScript('frontend/src/services/storage-service.js', { localStorage, sessionStorage });
  const storage = window.SmartBooksPersistence.configure({ key:'unit_state' });
  const fallback = { company:{ name:'Fallback' } };
  assert.deepEqual(plain(storage.load({ fallback:() => fallback })), fallback);

  const state = { company:{ name:'Saved' }, count:2 };
  const save = storage.save(state, { backupKey:'unit_backup' });
  assert.equal(save.ok, true);
  assert.deepEqual(JSON.parse(localStorage.getItem('unit_state')), state);
  assert.deepEqual(JSON.parse(localStorage.getItem('unit_backup')), state);
  assert.equal(storage.getStatus().stats.writes, 1);
});

test('storage service handles invalid JSON and invokes onError', () => {
  let sawError = false;
  const localStorage = memoryStorage({ broken:'{not-json' });
  const { window } = loadBrowserScript('frontend/src/services/storage-service.js', { localStorage, sessionStorage:memoryStorage() });
  const loaded = window.SmartBooksPersistence.load({
    key:'broken',
    fallback:() => ({ ok:true }),
    onError(){ sawError = true; }
  });
  assert.deepEqual(plain(loaded), { ok:true });
  assert.equal(sawError, true);
  assert.equal(window.SmartBooksPersistence.getStatus().stats.errors, 1);
});

test('icon service renders safe svg and repairs mojibake text', () => {
  const { window } = loadBrowserScript('frontend/src/services/icon-service.js');
  const icons = window.SmartBooksIcons;
  assert.match(icons.html('banking'), /<svg class="sb-icon /);
  assert.match(icons.html('not-real'), /rect x="3" y="3"/);
  assert.equal(icons.repairMojibake('\u00e2\u0153\u201c Done'), '✓ Done');
});

test('icon service infers icons from navigation and button text', () => {
  const { window } = loadBrowserScript('frontend/src/services/icon-service.js');
  const icons = window.SmartBooksIcons;
  const navEl = {
    getAttribute(){ return null; },
    closest(selector){ return selector === '[data-nav]' ? { getAttribute(){ return 'reports'; } } : null; }
  };
  assert.equal(icons.infer(navEl), 'reports');

  const buttonEl = {
    getAttribute(){ return null; },
    id: '',
    classList:{ contains(){ return false; } },
    textContent:'Export JSON',
    closest(selector){ return selector === 'button' ? this : null; }
  };
  assert.equal(icons.infer(buttonEl), 'download');
});

console.log('All unit tests passed.');
