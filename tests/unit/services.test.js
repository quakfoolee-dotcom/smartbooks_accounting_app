const assert = require('node:assert/strict');
const path = require('node:path');

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

function throwingStorage(message = 'storage unavailable'){
  return {
    getItem(){ throw new Error(message); },
    setItem(){ throw new Error(message); },
    removeItem(){ throw new Error(message); },
    clear(){ throw new Error(message); }
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

function domElement(options = {}){
  const classes = new Set(options.classes || []);
  const attrs = Object.assign({}, options.attrs || {});
  const element = {
    nodeType: options.nodeType || 1,
    tagName: options.tagName || 'DIV',
    id: options.id || '',
    style: {},
    dataset: options.dataset || {},
    textContent: options.textContent || '',
    innerHTML: options.innerHTML || '',
    appended: [],
    clicked: 0,
    removed: 0,
    classList: {
      contains(name){ return classes.has(name); }
    },
    appendChild(child){ this.appended.push(child); child.parentElement = this; },
    remove(){ this.removed++; },
    click(){ this.clicked++; },
    querySelector(selector){
      if(selector === '.sb-icon') return options.hasIcon ? {} : null;
      if(selector === '.notification-dot') return options.notificationDot || null;
      return null;
    },
    querySelectorAll(selector){
      if(typeof options.querySelectorAll === 'function') return options.querySelectorAll(selector);
      return [];
    },
    setAttribute(name, value){ attrs[name] = value; },
    getAttribute(name){ return attrs[name] || null; },
    closest(selector){
      if(typeof options.closest === 'function') return options.closest(selector);
      return null;
    }
  };
  return element;
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

function textWalker(nodes){
  let index = -1;
  return {
    currentNode:null,
    nextNode(){
      index++;
      this.currentNode = nodes[index] || null;
      return index < nodes.length;
    }
  };
}

function loadBrowserScript(relativePath, extras = {}, onLoad){
  const modulePath = path.join(root, relativePath);
  const globalKeys = [
    'Blob',
    'MutationObserver',
    'NodeFilter',
    'TextDecoder',
    'URL',
    'clearTimeout',
    'document',
    'localStorage',
    'sessionStorage',
    'setTimeout',
    'structuredClone',
    'window'
  ];
  const previous = new Map(globalKeys.map(key => [key, {
    existed:Object.prototype.hasOwnProperty.call(globalThis, key),
    value:globalThis[key]
  }]));
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
    structuredClone: globalThis.structuredClone,
    window: {},
    document: fakeDocument(),
    ...extras
  };
  sandbox.window = Object.assign(sandbox.window, sandbox);
  try{
    Object.assign(globalThis, sandbox);
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
    if(typeof onLoad === 'function') onLoad(sandbox);
    return { ...sandbox, window: sandbox.window };
  }finally{
    delete require.cache[require.resolve(modulePath)];
    previous.forEach((entry, key) => {
      if(entry.existed) globalThis[key] = entry.value;
      else delete globalThis[key];
    });
  }
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
    ['getthingsdone','dashboard','apps','settings','banking','transactions','custom']
  );
  assert.deepEqual(
    plain(
    nav.normalizeOrder(['custom','banking','missing','banking'], modules),
    ),
    ['custom','banking','getthingsdone','dashboard','apps','settings','transactions']
  );
});

test('navigation model keeps dashboard visible while optional shortcuts are user controlled', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  assert.deepEqual(plain(nav.defaultVisibleMenuItems(modules)), ['getthingsdone','dashboard','banking','transactions','custom']);
  assert.deepEqual(plain(nav.normalizeVisible(['banking','missing'], modules)), ['banking','dashboard']);
  assert.equal(nav.isVisible('dashboard', { visibleMenuItems:[] }, modules), true);
  assert.equal(nav.isVisible('settings', { visibleMenuItems:[] }, modules), false);
  assert.equal(nav.isVisible('settings', { visibleMenuItems:['settings'] }, modules), true);
  assert.equal(nav.isVisible('banking', { visibleMenuItems:['dashboard','settings'] }, modules), false);
});

test('navigation model syncs settings and derives visible modules', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  const settings = { menuOrder:['settings','dashboard'], visibleMenuItems:['apps'] };
  nav.syncSettings(settings, modules, items => items.filter(id => id !== 'custom'));
  assert.deepEqual(plain(settings.menuOrder), ['settings','dashboard','getthingsdone','apps','banking','transactions','custom']);
  assert.deepEqual(plain(settings.visibleMenuItems), ['apps','dashboard']);
  assert.deepEqual(plain(settings.visibleModules), ['apps','dashboard']);
  assert.equal(settings.menuVisibilityDefaultsVersion, 2);
});

test('navigation model migrates legacy all-visible menu defaults to lean defaults', () => {
  const { window } = loadBrowserScript('frontend/src/services/navigation-model.js');
  const nav = window.SmartBooksNavigation;
  const settings = { visibleMenuItems:nav.defaultMenuOrder(modules) };
  nav.syncSettings(settings, modules);
  assert.deepEqual(plain(settings.visibleMenuItems), ['getthingsdone','dashboard','banking','transactions','custom']);
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

test('storage service creates backups, session copies, and export clones', () => {
  const localStorage = memoryStorage();
  const sessionStorage = memoryStorage();
  const { window } = loadBrowserScript('frontend/src/services/storage-service.js', { localStorage, sessionStorage });
  const storage = window.SmartBooksPersistence.configure({ key:'company_state', mode:'hybrid', backendEndpoint:'/api/test-state' });
  const state = { company:{ name:'SmartBooks' }, nested:{ count:1 } };

  const backup = storage.backup(state, 'Nightly Backup!');
  assert.equal(backup.ok, true);
  assert.deepEqual(JSON.parse(localStorage.getItem('company_state_Nightly_Backup__backup')), state);
  assert.equal(storage.getStatus().stats.backups, 1);

  const session = storage.saveSessionCopy(state);
  assert.equal(session.ok, true);
  assert.deepEqual(JSON.parse(sessionStorage.getItem('company_state_unsaved_session_copy')), state);

  const exported = storage.exportState(state);
  exported.nested.count = 99;
  assert.equal(state.nested.count, 1);
  assert.equal(storage.mode, 'hybrid');
  assert.equal(storage.getStatus().backendEndpoint, '/api/test-state');
});

test('storage service reports save, backup, and session copy failures', () => {
  const { window } = loadBrowserScript('frontend/src/services/storage-service.js', {
    localStorage:throwingStorage('local write failed'),
    sessionStorage:throwingStorage('session write failed')
  });
  const storage = window.SmartBooksPersistence.configure({ key:'failing_state' });

  const save = storage.save({ ok:false });
  assert.equal(save.ok, false);
  assert.match(save.error.message, /local write failed/);

  const backup = storage.backup({ ok:false }, 'manual');
  assert.equal(backup.ok, false);
  assert.equal(storage.getStatus().stats.backups, 0);

  const session = storage.saveSessionCopy({ ok:false });
  assert.equal(session.ok, false);
  assert.match(session.error.message, /session write failed/);
  assert.equal(storage.getStatus().stats.errors, 3);
});

test('storage service downloadJson creates and cleans up a download link', () => {
  const anchors = [];
  const appended = [];
  const revoked = [];
  const blobs = [];
  const document = {
    readyState:'loading',
    body:{
      appendChild(node){ appended.push(node); }
    },
    createElement(tag){
      assert.equal(tag, 'a');
      const anchor = domElement({ tagName:'A' });
      anchors.push(anchor);
      return anchor;
    }
  };
  class TestBlob {
    constructor(parts, options){
      this.parts = parts;
      this.options = options;
      blobs.push(this);
    }
  }
  const URL = {
    createObjectURL(blob){
      assert.equal(blob, blobs[0]);
      return 'blob:smartbooks-test';
    },
    revokeObjectURL(url){ revoked.push(url); }
  };

  loadBrowserScript('frontend/src/services/storage-service.js', {
    document,
    Blob:TestBlob,
    URL,
    localStorage:memoryStorage(),
    sessionStorage:memoryStorage()
  }, ({ window }) => {
    window.SmartBooksPersistence.downloadJson({ company:{ name:'Download Test' } }, 'company.json');
  });
  assert.equal(blobs.length, 1);
  assert.deepEqual(blobs[0].options, { type:'application/json' });
  assert.match(blobs[0].parts[0], /Download Test/);
  assert.equal(appended[0], anchors[0]);
  assert.equal(anchors[0].href, 'blob:smartbooks-test');
  assert.equal(anchors[0].download, 'company.json');
  assert.equal(anchors[0].style.display, 'none');
  assert.equal(anchors[0].clicked, 1);
  assert.deepEqual(revoked, ['blob:smartbooks-test']);
  assert.equal(anchors[0].removed, 1);
});

test('import service parses quoted CSV and plans customer create/update rows', () => {
  const { window } = loadBrowserScript('frontend/src/services/import-service.js');
  const importer = window.SmartBooksImport;
  const state = {
    customers:[{ id:'C-1001', name:'County Parks Department', company:'County Parks Department', email:'parks@example.com', phone:'517-111-2223', type:'Government' }]
  };

  const csv = [
    'id,name,company,email,phone,type',
    ',"Quinn, Lee",Quinn Studio,quinn@example.com,555-0100,Commercial',
    ',County Parks Department,County Parks Department,parks@example.com,517-999-0000,Government'
  ].join('\n');
  const plan = importer.buildPlan(state, 'customers', csv);

  assert.equal(plan.summary.create, 1);
  assert.equal(plan.summary.update, 1);
  assert.equal(plan.entries[0].record.name, 'Quinn, Lee');
  assert.equal(plan.entries[1].record.id, 'C-1001');
});

test('import service keeps bank transaction imports unposted and skips duplicates', () => {
  const { window } = loadBrowserScript('frontend/src/services/import-service.js');
  const importer = window.SmartBooksImport;
  const state = {
    chartOfAccounts:[{ id:'4100', code:'4100' }, { id:'6000', code:'6000' }],
    bankAccounts:[{ id:'BA-1', name:'Operating Checking' }],
    bankTransactions:[{ id:'BFT-1001', date:'2026-06-01', description:'Existing deposit', amount:100, bankAccountId:'BA-1' }]
  };
  const csv = [
    'date,description,amount,bankAccountId,suggestedAccountId,note',
    '2026-06-01,Existing deposit,100,BA-1,4100,duplicate',
    '2026-06-02,Bank fee,-12.50,BA-1,6000,monthly fee'
  ].join('\n');

  const plan = importer.buildPlan(state, 'bankTransactions', csv);
  assert.equal(plan.summary.skip, 1);
  assert.equal(plan.summary.create, 1);
  assert.equal(plan.entries[1].record.status, 'Unreviewed');
  assert.equal(plan.entries[1].record.posted, false);

  const applied = importer.applyPlan(state, plan);
  assert.deepEqual(applied, { create:1, update:0, skip:1, error:0 });
  assert.equal(state.bankTransactions.length, 2);
  assert.equal(state.bankTransactions[0].description, 'Bank fee');
  assert.equal(state.bankTransactions[0].posted, false);
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
  const chevronEl = {
    getAttribute(){ return null; },
    classList:{ contains(name){ return name === 'nav-chevron'; } },
    closest(selector){ return selector === '[data-nav]' ? { getAttribute(){ return 'reports'; } } : null; }
  };
  assert.equal(icons.infer(chevronEl), 'arrowRight');

  const buttonEl = {
    getAttribute(){ return null; },
    id: '',
    classList:{ contains(){ return false; } },
    textContent:'Export JSON',
    closest(selector){ return selector === 'button' ? this : null; }
  };
  assert.equal(icons.infer(buttonEl), 'download');
});

test('icon service fixes sidebar symbols, legacy button labels, headings, and workflow arrows', () => {
  const existing = domElement({ classes:['nav-chevron'], hasIcon:true, innerHTML:'existing icon' });
  const chevron = domElement({ classes:['nav-chevron'], textContent:'>' });
  const button = domElement({ tagName:'BUTTON', textContent:'âœ“ Done' });
  const heading = domElement({ tagName:'H2', textContent:'⚙ Settings' });
  const workflowArrow = domElement({ classes:['workflow-arrow'], textContent:'›' });
  const root = domElement({
    querySelectorAll(selector){
      if(selector.includes('.nav-chevron')) return [existing, chevron];
      if(selector === 'button,.btn') return [button];
      if(selector.includes('h1,h2,h3,h4')) return [heading];
      if(selector.includes('.workflow-arrow')) return [workflowArrow];
      return [];
    }
  });
  const document = {
    readyState:'complete',
    body:root,
    addEventListener(){},
    createTreeWalker(){ return textWalker([]); },
    querySelectorAll(selector){ return root.querySelectorAll(selector); }
  };

  loadBrowserScript('frontend/src/services/icon-service.js', { document });

  assert.equal(existing.innerHTML, 'existing icon');
  assert.equal(chevron.dataset.icon, 'arrowRight');
  assert.match(chevron.innerHTML, /sb-icon/);
  assert.equal(button.dataset.icon, 'check');
  assert.match(button.innerHTML, /<span>Done<\/span>/);
  assert.equal(heading.dataset.icon, 'settings');
  assert.match(heading.innerHTML, /<span>Settings<\/span>/);
  assert.equal(workflowArrow.dataset.icon, 'arrowRight');
});

test('icon service observer repairs changed text and added symbol nodes', () => {
  const changedText = {
    nodeType:3,
    nodeValue:'A\u00a0B',
    parentElement:{ tagName:'DIV' }
  };
  const addedArrow = domElement({ classes:['workflow-arrow'], textContent:'→' });
  const addedNode = domElement({
    nodeType:1,
    querySelectorAll(selector){
      return selector.includes('.workflow-arrow') ? [addedArrow] : [];
    }
  });
  const body = domElement();
  const document = {
    readyState:'complete',
    body,
    createTreeWalker(root){ return textWalker(root.__textNodes || []); },
    querySelectorAll(){ return []; }
  };
  class TestMutationObserver {
    constructor(callback){ this.callback = callback; }
    observe(){
      this.callback([
        { type:'characterData', target:changedText, addedNodes:[] },
        { type:'childList', target:body, addedNodes:[addedNode] }
      ]);
    }
    disconnect(){}
  }

  loadBrowserScript('frontend/src/services/icon-service.js', {
    document,
    MutationObserver:TestMutationObserver
  });

  assert.equal(changedText.nodeValue, 'A B');
  assert.equal(addedArrow.dataset.icon, 'arrowRight');
  assert.match(addedArrow.innerHTML, /sb-icon/);
});

console.log('All unit tests passed.');
