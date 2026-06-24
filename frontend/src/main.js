// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

// Source: smartbooks_accounting_app.html embedded scripts.
// TODO: Continue splitting this file into feature modules under frontend/src as the app stabilizes.

// Script block 1
  // V59 early browser-safety polyfill: several legacy state paths rely on structuredClone.
  // Keep this before state initialization so older Chromium/WebView engines do not fail at startup.
  if(typeof window.structuredClone !== 'function'){
    window.structuredClone = function(value){
      if(value === undefined) return undefined;
      return JSON.parse(JSON.stringify(value));
    };
  }
  const STORE_KEY = 'smartbooks_v71_state';
  function smartBooksPersistenceConfig(){
    const params = (()=>{ try{ return new URLSearchParams(window.location.search); }catch(e){ return null; } })();
    const mode = String(window.SMARTBOOKS_PERSISTENCE_MODE || params?.get('sb_persistence') || params?.get('persistence') || 'local').toLowerCase();
    const backendEndpoint = String(window.SMARTBOOKS_BACKEND_ENDPOINT || params?.get('sb_backend_endpoint') || params?.get('backendEndpoint') || '/api/state');
    return {
      key: STORE_KEY,
      mode: ['local','backend','hybrid'].includes(mode) ? mode : 'local',
      backendEndpoint
    };
  }
  const persistenceConfig = smartBooksPersistenceConfig();
  window.SmartBooksPersistence?.configure(persistenceConfig);
  const todayISO = () => new Date().toISOString().slice(0,10);
  const addDaysISO = (days) => { const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };
  const uid = (prefix) => prefix + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
  const money = (value) => new Intl.NumberFormat('en-CA', {style:'currency', currency:'CAD'}).format(Number(value)||0);
  const escapeHTML = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const num = (v) => Number(v) || 0;
  const signed = (v) => num(v) < 0 ? `(${money(Math.abs(num(v)))})` : money(v);

  const menuModules = [
    {id:'dashboard', label:'Dashboards', icon:'▦'}, {id:'banking', label:'Banking', icon:'◉'}, {id:'transactions', label:'Transactions', icon:'⇄'}, {id:'accounting', label:'Accounting', icon:'▤'},
    {id:'sales', label:'Sales', icon:'↗'}, {id:'customers', label:'Customers & Leads', icon:'☘'}, {id:'expenses', label:'Expenses', icon:'▸'}, {id:'vendors', label:'Vendors', icon:'□'},
    {id:'reports', label:'Reports', icon:'☷'}, {id:'inventory', label:'Inventory', icon:'◼'}, {id:'projects', label:'Projects', icon:'◆'},
    {id:'time', label:'Time', icon:'◷'}, {id:'payroll', label:'Payroll', icon:'♢'}, {id:'taxes', label:'Taxes', icon:'◖'}, {id:'settings', label:'Settings', icon:'⚙'}
  ];

  const chartOfAccounts = [
    {id:'1000', code:'1000', name:'Operating Checking', type:'Asset', normal:'Debit', detail:'Bank'},
    {id:'1010', code:'1010', name:'Savings Reserve', type:'Asset', normal:'Debit', detail:'Bank'},
    {id:'1200', code:'1200', name:'Accounts Receivable', type:'Asset', normal:'Debit', detail:'Current Asset'},
    {id:'1300', code:'1300', name:'Inventory Asset', type:'Asset', normal:'Debit', detail:'Inventory'},
    {id:'1400', code:'1400', name:'Undeposited Funds', type:'Asset', normal:'Debit', detail:'Current Asset'},
    {id:'2000', code:'2000', name:'Accounts Payable', type:'Liability', normal:'Credit', detail:'Current Liability'},
    {id:'2100', code:'2100', name:'Credit Card Payable', type:'Liability', normal:'Credit', detail:'Credit Card'},
    {id:'2200', code:'2200', name:'GST/HST Payable', type:'Liability', normal:'Credit', detail:'Sales Tax'},
    {id:'2210', code:'2210', name:'GST/HST Input Tax Credit', type:'Asset', normal:'Debit', detail:'Sales Tax Recoverable'},
    {id:'3000', code:'3000', name:'Owner\'s Equity', type:'Equity', normal:'Credit', detail:'Equity'},
    {id:'3900', code:'3900', name:'Retained Earnings', type:'Equity', normal:'Credit', detail:'Equity'},
    {id:'4000', code:'4000', name:'Service Revenue', type:'Income', normal:'Credit', detail:'Revenue'},
    {id:'4010', code:'4010', name:'Product Sales', type:'Income', normal:'Credit', detail:'Revenue'},
    {id:'4020', code:'4020', name:'Implementation Revenue', type:'Income', normal:'Credit', detail:'Revenue'},
    {id:'4100', code:'4100', name:'Other Income', type:'Income', normal:'Credit', detail:'Revenue'},
    {id:'5000', code:'5000', name:'Cost of Goods Sold', type:'COGS', normal:'Debit', detail:'Direct Cost'},
    {id:'6000', code:'6000', name:'Office Expenses', type:'Expense', normal:'Debit', detail:'Operating Expense'},
    {id:'6100', code:'6100', name:'Utilities Expense', type:'Expense', normal:'Debit', detail:'Operating Expense'},
    {id:'6200', code:'6200', name:'Marketing Expense', type:'Expense', normal:'Debit', detail:'Operating Expense'},
    {id:'6300', code:'6300', name:'Software Expense', type:'Expense', normal:'Debit', detail:'Operating Expense'},
    {id:'6400', code:'6400', name:'Professional Fees', type:'Expense', normal:'Debit', detail:'Operating Expense'},
    {id:'6500', code:'6500', name:'Payroll Expense', type:'Expense', normal:'Debit', detail:'Operating Expense'}
  ];

  const initialState = {
    company:{name:'Your Company', fiscalYear:'2026', province:'BC', salesTax:5, accountingMethod:'Accrual'},
    settings:{visibleModules: menuModules.map(m=>m.id)},
    chartOfAccounts,
    customers:[
      {id:'C-1001', name:'County Parks Department', company:'County Parks Department', email:'parks@example.com', phone:'517-111-2223', type:'Government'},
      {id:'C-1002', name:'Abbott Softball Complex', company:'Abbott Softball Complex and Water Park', email:'abbott@example.com', phone:'517-111-2525', type:'Commercial'},
      {id:'C-1003', name:'Dan Wisniewski', company:'Dan Wisniewski', email:'dan@example.com', phone:'517-123-0000', type:'Residential'},
      {id:'C-1004', name:'EL Sports Complex', company:'Mr. David Jones', email:'el@example.com', phone:'555-100-0200', type:'Commercial'},
      {id:'C-1005', name:"St. Paul's School", company:"St. Paul's School", email:'office@stpauls.example.com', phone:'555-123-4567', type:'Education'}
    ],
    vendors:[
      {id:'V-2001', name:'Metro Office Supplies', email:'billing@metro.example.com', phone:'604-555-0110', category:'Office expenses'},
      {id:'V-2002', name:'North Shore Utilities', email:'accounts@nsu.example.com', phone:'604-555-0188', category:'Utilities'},
      {id:'V-2003', name:'Vancouver Digital Ads', email:'ap@vda.example.com', phone:'604-555-0199', category:'Marketing'}
    ],
    products:[
      {id:'P-3001', name:'Consulting service', type:'Service', price:125, incomeAccountId:'4000', qty:0},
      {id:'P-3002', name:'Monthly maintenance', type:'Service', price:750, incomeAccountId:'4000', qty:0},
      {id:'P-3003', name:'Starter hardware kit', type:'Product', price:420, incomeAccountId:'4010', qty:12},
      {id:'P-3004', name:'Implementation package', type:'Service', price:1850, incomeAccountId:'4020', qty:0}
    ],
    invoices:[
      {id:'INV-1001', customerId:'C-1004', date:'2026-05-02', dueDate:'2026-05-25', status:'Sent', subtotal:2600, tax:130, paid:0, incomeAccountId:'4020', items:[{desc:'Implementation package', qty:1, rate:2600}]},
      {id:'INV-1002', customerId:'C-1001', date:'2026-05-05', dueDate:'2026-06-04', status:'Paid', subtotal:900, tax:45, paid:945, incomeAccountId:'4000', items:[{desc:'Consulting service', qty:7.2, rate:125}]},
      {id:'INV-1003', customerId:'C-1003', date:'2026-04-20', dueDate:'2026-05-10', status:'Overdue', subtotal:150, tax:7.5, paid:0, incomeAccountId:'4000', items:[{desc:'Small service call', qty:1.2, rate:125}]},
      {id:'INV-1004', customerId:'C-1002', date:'2026-05-08', dueDate:'2026-06-07', status:'Paid', subtotal:1800, tax:90, paid:1890, incomeAccountId:'4000', items:[{desc:'Monthly maintenance', qty:2.4, rate:750}]}
    ],
    payments:[
      {id:'PMT-1001', invoiceId:'INV-1002', customerId:'C-1001', date:'2026-05-09', accountId:'BA-1', amount:945, memo:'Payment for INV-1002'},
      {id:'PMT-1002', invoiceId:'INV-1004', customerId:'C-1002', date:'2026-05-13', accountId:'BA-1', amount:1890, memo:'Payment for INV-1004'}
    ],
    estimates:[
      {id:'EST-5001', customerId:'C-1005', date:'2026-05-11', status:'Draft', total:3400},
      {id:'EST-5002', customerId:'C-1004', date:'2026-05-16', status:'Accepted', total:1250}
    ],
    expenses:[
      {id:'EXP-7001', vendorId:'V-2001', date:'2026-05-04', expenseAccountId:'6000', account:'Office expenses', memo:'Printer supplies and paper', amount:285.34, tax:14.27, paymentMethod:'Credit card', bankAccountId:'BA-2'},
      {id:'EXP-7002', vendorId:'V-2002', date:'2026-05-07', expenseAccountId:'6100', account:'Utilities', memo:'Electricity bill', amount:492.15, tax:24.61, paymentMethod:'Bank transfer', bankAccountId:'BA-1'},
      {id:'EXP-7003', vendorId:'V-2003', date:'2026-05-12', expenseAccountId:'6200', account:'Marketing', memo:'Search campaign', amount:650.00, tax:32.50, paymentMethod:'Credit card', bankAccountId:'BA-2'},
      {id:'EXP-7004', vendorId:'V-2001', date:'2026-05-14', expenseAccountId:'6300', account:'Software', memo:'Monthly SaaS subscription', amount:199.00, tax:9.95, paymentMethod:'Credit card', bankAccountId:'BA-2'}
    ],
    bills:[
      {id:'BILL-9001', vendorId:'V-2003', date:'2026-05-18', dueDate:'2026-06-02', status:'Open', expenseAccountId:'6200', amount:450, tax:22.5, paid:0},
      {id:'BILL-9002', vendorId:'V-2001', date:'2026-05-10', dueDate:'2026-05-28', status:'Paid', expenseAccountId:'6000', amount:285, tax:14.25, paid:299.25}
    ],
    billPayments:[
      {id:'BP-1001', billId:'BILL-9002', vendorId:'V-2001', date:'2026-05-21', accountId:'BA-1', amount:299.25, memo:'Payment for BILL-9002'}
    ],
    deposits:[
      {id:'DEP-2001', date:'2026-05-12', accountId:'BA-1', incomeAccountId:'4100', amount:500, memo:'Owner reimbursement / other income deposit'}
    ],
    transfers:[],
    bankTransactions:[
      {id:'BFT-1001', date:'2026-05-19', description:'Stripe deposit - EL Sports Complex', amount:2730.00, bankAccountId:'BA-1', status:'Suggested', suggestedAccountId:'1200', matchType:'Invoice payment', matchedInvoiceId:'INV-1001', linkedId:null, posted:false, cleared:false, note:'Suggested match to open invoice INV-1001'},
      {id:'BFT-1002', date:'2026-05-20', description:'Office Depot supplies', amount:-86.50, bankAccountId:'BA-2', status:'Suggested', suggestedAccountId:'6000', matchType:'Expense category', linkedId:null, posted:false, cleared:false, note:'Suggested category: Office Expenses'},
      {id:'BFT-1003', date:'2026-05-21', description:'CRA GST/HST payment', amount:-320.00, bankAccountId:'BA-1', status:'Unreviewed', suggestedAccountId:'2200', matchType:'Tax payment', linkedId:null, posted:false, cleared:false, note:'Review before posting tax remittance'},
      {id:'BFT-1004', date:'2026-05-22', description:'Customer e-transfer - Dan Wisniewski', amount:157.50, bankAccountId:'BA-1', status:'Suggested', suggestedAccountId:'1200', matchType:'Invoice payment', matchedInvoiceId:'INV-1003', linkedId:null, posted:false, cleared:false, note:'Suggested match to overdue invoice INV-1003'},
      {id:'BFT-1005', date:'2026-05-22', description:'Vendor ACH - Vancouver Digital Ads', amount:-472.50, bankAccountId:'BA-1', status:'Suggested', suggestedAccountId:'2000', matchType:'Bill payment', matchedBillId:'BILL-9001', linkedId:null, posted:false, cleared:false, note:'Suggested match to open bill BILL-9001'},
      {id:'BFT-1006', date:'2026-05-23', description:'Bank service fee', amount:-18.95, bankAccountId:'BA-1', status:'Unreviewed', suggestedAccountId:'6000', matchType:'Expense category', linkedId:null, posted:false, cleared:false, note:'Small bank charge to categorize'}
    ],
    reconciliations:[
      {id:'REC-1001', accountId:'BA-1', statementDate:'2026-04-30', endingBalance:32000, clearedTotal:32000, difference:0, status:'Completed', notes:'Opening reconciliation'}
    ],
    bankAccounts:[
      {id:'BA-1', accountId:'1000', name:'Operating Checking (1234)', type:'Checking', bank:'SmartBank', balance:32300, qbBalance:4000, toReview:4},
      {id:'BA-2', accountId:'2100', name:'Mastercard (0987)', type:'Credit Card', bank:'Mastercard', balance:-8080, qbBalance:-2000, toReview:9},
      {id:'BA-3', accountId:'1010', name:'Savings Reserve', type:'Savings', bank:'Credit Union', balance:18160, qbBalance:18160, toReview:1}
    ],
    projects:[
      {id:'PRJ-1', name:'City Park Refresh', customerId:'C-1001', budget:8000, actualCost:2950, revenue:4000, status:'Active'},
      {id:'PRJ-2', name:'EL Complex Summer Setup', customerId:'C-1004', budget:12000, actualCost:5600, revenue:7600, status:'Active'}
    ],
    timeEntries:[
      {id:'T-1', employee:'Alex Chen', customerId:'C-1004', date:'2026-05-13', hours:6.5, billable:true},
      {id:'T-2', employee:'Maya Patel', customerId:'C-1001', date:'2026-05-14', hours:4, billable:true}
    ],
    journalEntries:[
      {id:'JE-OPEN', date:'2026-05-01', memo:'Opening balances', status:'Posted', lines:[
        {accountId:'1000', debit:32000, credit:0}, {accountId:'1010', debit:18160, credit:0}, {accountId:'1300', debit:5040, credit:0}, {accountId:'3000', debit:0, credit:55200}
      ]}
    ],
    auditTrail:[{date:'2026-05-01', user:'System', action:'Opening records initialized with company setup, sales workflow, dashboard customization, banking review, reconciliation, and accrual posting logic'}]
  };

  const persistenceRuntime = {
    config:persistenceConfig,
    backendLoaded:false,
    backendLoadFailed:false,
    backendLoadState:'not-started',
    lastLoadError:null,
    lastSaveError:null,
    lastSavePromise:Promise.resolve(),
    usesBackend(){
      const mode=window.SmartBooksPersistence?.mode || this.config.mode;
      return mode==='backend' || mode==='hybrid';
    },
    startupFallback(){
      if((window.SmartBooksPersistence?.mode || this.config.mode)==='hybrid') return loadLocalState();
      return ensureState(structuredClone(initialState));
    },
    saveBeforeBackendReady(nextState){
      const persistence=window.SmartBooksPersistence;
      if(!persistence) return false;
      const mode=persistence.mode || this.config.mode;
      if(mode==='hybrid'){
        const result=persistence.save(nextState, { key:STORE_KEY, backupKey:STORE_KEY+'_v59_last_good' });
        if(!result.ok) this.lastSaveError=result.error;
        return !!result.ok;
      }
      try{ persistence.saveSessionCopy(nextState, { key:STORE_KEY+'_pending_backend_load_session_copy' }); }catch(e){}
      return false;
    }
  };
  window.SmartBooksRuntimePersistence = persistenceRuntime;

  let state = persistenceRuntime.usesBackend() ? persistenceRuntime.startupFallback() : loadState();
  let currentPage = 'dashboard';
  let currentModal = null;
  let lastModalFocus = null;

  function loadLocalState(){
    try{
      const saved = localStorage.getItem(STORE_KEY);
      if(saved) return ensureState(JSON.parse(saved));
    }catch(e){ console.warn('Unable to load saved SmartBooks data', e); }
    return ensureState(structuredClone(initialState));
  }
  function loadState(){
    if(window.SmartBooksPersistence){
      return window.SmartBooksPersistence.load({
        key: STORE_KEY,
        fallback: () => structuredClone(initialState),
        normalize: ensureState,
        onError: e => console.warn('Unable to load saved SmartBooks data', e)
      });
    }
    return loadLocalState();
  }
  async function loadStateAsync(){
    const persistence=window.SmartBooksPersistence;
    if(!persistence || !persistenceRuntime.usesBackend() || typeof persistence.loadAsync!=='function') return false;
    if(persistenceRuntime.backendLoadState==='loading' || persistenceRuntime.backendLoaded) return false;
    const beforeErrors=Number(persistence.getStatus?.().stats?.errors) || 0;
    persistenceRuntime.backendLoadState='loading';
    persistenceRuntime.lastLoadError=null;
    try{
      const loaded = await persistence.loadAsync({
        key: STORE_KEY,
        fallback: () => persistenceRuntime.startupFallback(),
        normalize: ensureState,
        onError: error => {
          persistenceRuntime.lastLoadError=error;
          console.warn('Unable to load SmartBooks backend data', error);
        }
      });
      const afterStatus=persistence.getStatus?.() || {};
      const afterErrors=Number(afterStatus.stats?.errors) || 0;
      if(persistenceRuntime.lastLoadError || afterErrors>beforeErrors){
        persistenceRuntime.backendLoadState='failed';
        persistenceRuntime.backendLoadFailed=true;
        try{ showToast('Backend load failed. Local state was not written back to the backend.'); }catch(e){}
        try{ renderDashboard(); }catch(e){}
        return false;
      }
      state=ensureState(loaded);
      persistenceRuntime.backendLoaded=true;
      persistenceRuntime.backendLoadFailed=false;
      persistenceRuntime.backendLoadState='loaded';
      renderAll();
      return true;
    }catch(error){
      persistenceRuntime.lastLoadError=error;
      persistenceRuntime.backendLoadFailed=true;
      persistenceRuntime.backendLoadState='failed';
      console.warn('Unable to load SmartBooks backend data', error);
      try{ showToast('Backend load failed. Local state was not written back to the backend.'); }catch(e){}
      try{ renderDashboard(); }catch(e){}
      return false;
    }
  }
  persistenceRuntime.bootstrap = loadStateAsync;
  function ensureState(s){
    s.company ||= structuredClone(initialState.company);
    s.settings ||= {visibleModules: menuModules.map(m=>m.id)};
    s.chartOfAccounts ||= structuredClone(chartOfAccounts);
    s.payments ||= [];
    s.billPayments ||= [];
    s.transfers ||= [];
    s.bankTransactions ||= structuredClone(initialState.bankTransactions || []);
    s.reconciliations ||= structuredClone(initialState.reconciliations || []);
    s.deposits ||= [];
    s.auditTrail ||= [];
    s.journalEntries ||= [];
    s.bankAccounts ||= structuredClone(initialState.bankAccounts);
    s.products ||= [];
    s.invoices ||= [];
    s.expenses ||= [];
    s.bills ||= [];
    s.vendors ||= [];
    s.customers ||= [];
    for(const a of chartOfAccounts){ if(!s.chartOfAccounts.some(x=>x.id===a.id)) s.chartOfAccounts.push(structuredClone(a)); }
    return s;
  }
  function saveState(){
    if(window.SmartBooksPersistence){
      if(persistenceRuntime.usesBackend() && !persistenceRuntime.backendLoaded){
        return persistenceRuntime.saveBeforeBackendReady(state);
      }
      const result = window.SmartBooksPersistence.save(state, { key: STORE_KEY });
      if(!result.ok) throw result.error;
      return true;
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  }
  function resetState(){ state = structuredClone(initialState); saveState(); renderAll(); showToast('Company data reset.'); }
  function audit(action){ state.auditTrail.unshift({date: new Date().toISOString().slice(0,19).replace('T',' '), user:'Quak', action}); state.auditTrail = state.auditTrail.slice(0,80); }

  function getCustomer(id){ return state.customers.find(c=>c.id===id) || {name:'Unknown customer', company:''}; }
  function getVendor(id){ return state.vendors.find(v=>v.id===id) || {name:'Unknown vendor'}; }
  function getAccount(id){ return state.chartOfAccounts.find(a=>a.id===id) || {id, code:id, name:'Unknown account', type:'Other', normal:'Debit'}; }
  function getBank(id){ return state.bankAccounts.find(b=>b.id===id) || state.bankAccounts[0]; }
  function accountLabel(id){ const a=getAccount(id); return `${a.code} · ${a.name}`; }
  const accounting = window.SmartBooksAccounting;
  function bankAccountIdToLedger(id){ return accounting.bankAccountIdToLedger(state, id); }
  function invoiceTotal(inv){ return accounting.invoiceTotal(inv); }
  function expenseTotal(exp){ return accounting.expenseTotal(exp); }
  function billTotal(bill){ return accounting.billTotal(bill); }
  function openAmount(inv){ return accounting.openAmount(inv); }
  function billOpenAmount(bill){ return accounting.billOpenAmount(bill); }
  function expenseAccountFromName(name){ return accounting.expenseAccountFromName(name); }

  function line(source, sourceId, date, memo, accountId, debit, credit){ return {source, sourceId, date, memo, accountId, debit:num(debit), credit:num(credit)}; }
  function ledger(){
    return accounting.ledger(state, {
      customerName: id => getCustomer(id).name,
      vendorName: id => getVendor(id).name
    });
  }
  function accountBalances(){ return accounting.accountBalances(state); }
  function normalBalance(accountId){ return accounting.normalBalance(state, accountId); }
  function sumTypes(types){ return accounting.sumTypes(state, types); }
  function salesTaxSummary(){ return accounting.salesTaxSummary(state); }
  function totals(){ return accounting.totals(state); }

  function showToast(message){ const t = document.getElementById('toast'); t.textContent = message; t.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(()=>t.classList.remove('show'), 2600); }

  function setupEventListeners(){
    document.querySelectorAll('[data-open-create]').forEach(b=>b.addEventListener('click', toggleCreateMenu));
    document.addEventListener('click', (e)=>{
      if(e.target.closest('[data-open-create]') || e.target.closest('#createMenu')) return;
      document.getElementById('createMenu').classList.remove('open');
    });
    document.addEventListener('click', (e)=>{
      const nav = e.target.closest('[data-nav]'); if(nav){ navigate(nav.dataset.nav); }
      const modalBtn = e.target.closest('[data-modal]'); if(modalBtn){ openModal(modalBtn.dataset.modal); document.getElementById('createMenu').classList.remove('open'); }
      const action = e.target.closest('[data-action]'); if(action){ handleAction(action.dataset.action, action.dataset.id); }
    });
    document.getElementById('sidebarToggle').addEventListener('click', ()=>{ document.getElementById('sidebar').classList.toggle('open'); document.getElementById('mobileOverlay').classList.toggle('open'); });
    document.getElementById('mobileOverlay').addEventListener('click', ()=>{ document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobileOverlay').classList.remove('open'); });
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', e=>{ if(e.target.id==='modalBackdrop') closeModal(); });
    document.getElementById('modalForm').addEventListener('submit', submitModal);
    document.getElementById('resetDemo').addEventListener('click', resetState);
    document.getElementById('exportData').addEventListener('click', exportData);
    document.addEventListener('click', e=>{
      const resetButton = e.target.closest?.('#resetDemo,#resetDemo2');
      if(resetButton){ e.preventDefault(); resetState(); }
    });
    document.getElementById('railCustomize').addEventListener('click', ()=>openModal('customize'));
    const legacySettingsBtn = document.getElementById('settingsBtn'); /* Settings icon is handled by the V8.5 top-bar panel. */
    document.getElementById('dashboardRefresh').addEventListener('click', ()=>{ renderDashboard(); showToast('Dashboard refreshed.'); });
    document.getElementById('globalSearch').addEventListener('input', (e)=> applySearch(e.target.value));
    document.addEventListener('input', e=>{ const inp=e.target.closest('[data-filter-table]'); if(inp) filterNearestTable(inp); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') { closeModal(); document.getElementById('createMenu').classList.remove('open'); } });
  }
  function toggleCreateMenu(){ document.getElementById('createMenu').classList.toggle('open'); }
  function navigate(page){
    currentPage = page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const el = document.getElementById('page-'+page); if(el) el.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
    document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobileOverlay').classList.remove('open');
    if(page !== 'dashboard') renderPage(page); else renderDashboard();
  }
  function renderAll(){
    document.getElementById('topCompanyName').textContent = state.company.name;
    renderMenu(); renderModulePills(); renderDashboard(); renderPage(currentPage);
  }
  function renderMenu(){
    const list = document.getElementById('menuList');
    const visible = new Set(state.settings.visibleModules || menuModules.map(m=>m.id));
    list.innerHTML = menuModules.filter(m=>visible.has(m.id)).map(m=>`<button class="nav-item ${currentPage===m.id?'active':''}" data-nav="${m.id}"><span class="dot">${m.icon}</span>${escapeHTML(m.label)}<span class="nav-chevron">›</span></button>`).join('');
  }
  function renderModulePills(){
    const mods = [
      {label:'Banking', icon:'◉', nav:'banking'}, {label:'Transactions', icon:'⇄', nav:'transactions'}, {label:'Accounting', icon:'▤', nav:'accounting'}, {label:'Sales & Get Paid', icon:'▣', nav:'sales'},
      {label:'Expenses & Pay Bills', icon:'›', nav:'expenses'}, {label:'Customers', icon:'✿', nav:'customers'}, {label:'Reports', icon:'☷', nav:'reports'}, {label:'Inventory', icon:'◼', nav:'inventory'}
    ];
    document.getElementById('modulePills').innerHTML = mods.map(m=>`<button class="module-pill" data-nav="${m.nav}"><span class="module-icon">${m.icon}</span>${m.label}</button>`).join('');
    const hr = new Date().getHours(); const part = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening'; document.getElementById('greeting').textContent = `Good ${part}, Quak!`;
  }

  function renderDashboard(){ const t = totals(); renderBusinessFeed(t); renderFunnel(t); renderPLCard(t); renderExpensesCard(t); renderRecentTransactions(); renderBankCard(t); renderCashFlowCard(t); renderSetupCard(); }
  function renderBusinessFeed(t){
    const tb=trialBalanceStatus();
    const unreviewed = state.bankTransactions.filter(x=>x.status!=='Reviewed' && x.status!=='Matched').length;
    const cards = [
      {icon:'◉', title:'Banking Agent', text:`${unreviewed} bank-feed transactions need review, matching, or categorization.`, action:'Review banking', nav:'banking'},
      {icon:'✓', title:'Accounting Agent', text:`Trial balance check: ${tb.ok?'balanced':'needs review'} (${money(Math.abs(tb.diff))} difference).`, action:'Open accounting', nav:'accounting'},
      {icon:'$', title:'Payments Agent', text:`Open A/R is ${money(t.ar)}. Overdue exposure is ${money(t.overdue)}.`, action:'Review A/R', nav:'sales'}
    ];
    document.getElementById('businessFeed').innerHTML = `<div class="feed-row">${cards.map(c=>`<div class="feed-card"><span class="menu">⋮</span><div class="feed-title"><span class="feed-badge">${c.icon}</span>${c.title}</div><p>${escapeHTML(c.text)}</p><button class="btn soft" data-nav="${c.nav}">${c.action}</button></div>`).join('')}</div>`;
  }
  function renderFunnel(t){
    const notPaid = state.invoices.reduce((s,i)=>s+openAmount(i),0), paid = state.payments.reduce((s,p)=>s+num(p.amount),0), deposited = state.payments.reduce((s,p)=>s+num(p.amount),0)+state.deposits.reduce((s,d)=>s+num(d.amount),0);
    const cards = [
      {cls:'first', label:'Create a new payment request', value:'Send invoices, pay links, and more', chip:'Request payment'},
      {label:'Not Paid', value:money(notPaid), chip:`${state.invoices.filter(i=>i.status==='Overdue').length} overdue invoices`, status:'red'},
      {label:'Paid', value:money(paid), chip:'Customer payments recorded', status:'blue'},
      {label:'Deposited', value:money(deposited), chip:'Deposited to bank', status:'green'}
    ];
    document.getElementById('funnelCards').innerHTML = cards.map(c=>`<div class="funnel-card ${c.cls||''}"><div class="label">${c.label}</div><div class="value">${c.value}</div><span class="status-chip ${c.status||''}">${c.chip}</span></div>`).join('');
  }
  function renderPLCard(t){ document.getElementById('plCard').innerHTML = `<h3>Profit & Loss</h3><div class="muted">Accrual-basis net income</div><div class="metric">${money(t.profit)}</div><div class="report-line"><span>Income</span><strong>${money(sumTypes(['Income']))}</strong></div><div class="report-line"><span>Expenses</span><strong>${money(t.expenses)}</strong></div><div class="report-line"><span>Open A/R</span><strong>${money(t.ar)}</strong></div><button class="btn soft" data-nav="reports" style="margin-top:12px">Run report</button>`; }
  function renderExpensesCard(){
    const byCat = groupExpenses(); const total = Object.values(byCat).reduce((a,b)=>a+b,0) || 1; const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,4); const p = Math.round((top[0]?.[1] || 0) / total * 100);
    document.getElementById('expensesCard').innerHTML = `<h3>Expenses</h3><div class="muted">Expense categories from ledger</div><div class="chart-wrap"><div class="donut" style="--p:${p}"></div></div><div class="legend">${top.map(([k,v],idx)=>`<div class="legend-row"><span><i class="swatch ${['','orange','purple','blue'][idx]}"></i>${escapeHTML(k)}</span><strong>${money(v)}</strong></div>`).join('')}</div>`;
  }
  function groupExpenses(){ const bal=accountBalances(); return state.chartOfAccounts.filter(a=>['Expense','COGS'].includes(a.type)).reduce((acc,a)=>{ const v = normalBalance(a.id); if(Math.abs(v)>0.005) acc[a.name]=v; return acc; },{}); }
  function renderRecentTransactions(){
    const rows = [...state.invoices.map(i=>({date:i.date, type:'Invoice', name:getCustomer(i.customerId).name, amount:invoiceTotal(i), status:i.status})), ...state.expenses.map(e=>({date:e.date, type:'Expense', name:getVendor(e.vendorId).name, amount:-expenseTotal(e), status:e.paymentMethod})), ...state.payments.map(p=>({date:p.date, type:'Payment', name:getCustomer(p.customerId).name, amount:p.amount, status:'Received'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7);
    document.getElementById('recentTransactions').innerHTML = `<div class="toolbar"><div><h3 style="margin:0">Recent transactions</h3><div class="muted small">Latest sales, payments, and expenses</div></div><button class="btn square" data-open-create>＋ New</button></div>${table(['Date','Type','Name','Status','Amount'], rows.map(r=>[r.date,r.type,escapeHTML(r.name),tagForStatus(r.status),`<span class="amount">${money(r.amount)}</span>`]))}`;
  }
  function renderBankCard(t){ document.getElementById('bankCard').innerHTML = `<h3>Bank Accounts</h3><div class="muted">Ledger balances</div><div class="metric">${money(t.bank)}</div><div class="bank-list">${state.bankAccounts.map(b=>`<div class="bank-row"><div class="bank-icon">${b.type==='Credit Card'?'CC':'$'}</div><div><strong>${escapeHTML(b.name)}</strong><div class="muted small">${escapeHTML(accountLabel(b.accountId))} · ${bankAccountReviewCount(b.id)} to review</div></div><div class="amount">${money(normalBalance(b.accountId))}</div></div>`).join('')}</div><button class="btn" data-nav="banking" style="width:100%;margin-top:10px">Go to registers</button>`; }
  function renderCashFlowCard(t){
    const inflow = state.payments.reduce((s,p)=>s+num(p.amount),0)+state.deposits.reduce((s,d)=>s+num(d.amount),0); const outflow = state.expenses.reduce((s,e)=>s+expenseTotal(e),0)+state.billPayments.reduce((s,p)=>s+num(p.amount),0);
    document.getElementById('cashFlowCard').innerHTML = `<h3>Cash Flow Snapshot</h3><div class="report-line"><span>Inflow</span><strong>${money(inflow)}</strong></div><div class="report-line"><span>Outflow</span><strong>${money(outflow)}</strong></div><div class="report-line total"><span>Net cash movement</span><span>${money(inflow-outflow)}</span></div><div class="bars"><div class="bar-row"><span>Inflow</span><div class="bar"><span style="width:80%"></span></div><strong>${money(inflow)}</strong></div><div class="bar-row"><span>Outflow</span><div class="bar"><span style="width:${Math.min(100,Math.round(outflow/(inflow||1)*80))}%"></span></div><strong>${money(outflow)}</strong></div></div>`;
  }
  function renderSetupCard(){ document.getElementById('setupCard').innerHTML = `<h3>Accounting + Banking Setup</h3><div class="report-line"><span>Chart of accounts</span><span class="tag paid">Active</span></div><div class="report-line"><span>Accrual posting</span><span class="tag paid">On</span></div><div class="report-line"><span>Trial balance</span><span class="tag ${trialBalanceStatus().ok?'paid':'overdue'}">${trialBalanceStatus().ok?'Balanced':'Review'}</span></div><div class="report-line"><span>Sales tax tracking</span><span class="tag open">GST/HST</span></div><button class="btn primary" data-nav="accounting" style="margin-top:14px">Open accounting center</button>`; }

  function renderPage(page){
    if(page==='dashboard'){ renderDashboard(); return; }
    const map = {accounting:renderAccounting, customers:renderCustomers, sales:renderSales, expenses:renderExpenses, vendors:renderVendors, banking:renderBanking, transactions:renderTransactions, reports:renderReports, inventory:renderInventory, time:renderTime, projects:renderProjects, payroll:renderPayroll, taxes:renderTaxes, apps:renderApps, settings:renderSettings};
    (map[page] || renderPlaceholder)(page); renderMenu();
  }
  function header(title, subtitle, actions=''){ return `<div class="section-header"><div><h2>${title}</h2><p>${subtitle}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap">${actions}</div></div>`; }
  function table(headings, rows){ return `<table><thead><tr>${headings.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headings.length}"><div class="empty">No records yet.</div></td></tr>`}</tbody></table>`; }
  function tagForStatus(status){ const s=String(status); const cls = s.toLowerCase().includes('paid')||s.toLowerCase().includes('received')||s.toLowerCase().includes('balanced')?'paid':s.toLowerCase().includes('over')||s.toLowerCase().includes('review')?'overdue':s.toLowerCase().includes('sent')?'sent':s.toLowerCase().includes('open')?'open':'draft'; return `<span class="tag ${cls}">${escapeHTML(s)}</span>`; }

  function renderAccounting(){
    const el=document.getElementById('page-accounting'), tb=trialBalanceStatus(), bal=accountBalances(), t=totals();
    const recentLedger = ledger().slice(0,80);
    el.innerHTML = header('Accounting Center', 'Manage the accounting engine, transaction review, bank-feed matching, reconciliation controls, journal entries, trial balance, and audit trail.', `<button class="btn" data-modal="account">Add account</button><button class="btn primary" data-modal="journal">Journal entry</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Trial balance</h3><div class="metric">${tb.ok?'Balanced':'Review'}</div><div class="muted small">Debits ${money(tb.debits)} · Credits ${money(tb.credits)}</div></div><div class="card"><h3>Accounts receivable</h3><div class="metric">${money(t.ar)}</div><div class="muted small">Open customer invoices</div></div><div class="card"><h3>Accounts payable</h3><div class="metric">${money(t.ap)}</div><div class="muted small">Open vendor bills</div></div><div class="card"><h3>Sales tax payable</h3><div class="metric">${money(t.tax.net)}</div><div class="muted small">Collected minus input tax credits</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Chart of Accounts</h3><div class="muted small">Current balances are calculated from the ledger</div></div><input class="table-search" data-filter-table placeholder="Search accounts"></div>${table(['Code','Account','Type','Normal','Balance'], state.chartOfAccounts.map(a=>[a.code,`<strong>${escapeHTML(a.name)}</strong><div class="muted small">${escapeHTML(a.detail||'')}</div>`,a.type,a.normal,`<span class="amount">${money(normalBalance(a.id))}</span>`]))}</div>`+
      `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Journal Entries</h3><div class="muted small">Manual entries must balance before posting</div></div><button class="btn square" data-modal="journal">＋ Entry</button></div>${table(['Entry','Date','Memo','Debits','Credits','Status'], state.journalEntries.map(j=>{ const d=j.lines.reduce((s,l)=>s+num(l.debit),0), c=j.lines.reduce((s,l)=>s+num(l.credit),0); return [`<strong>${j.id}</strong>`,j.date,escapeHTML(j.memo),money(d),money(c),tagForStatus(Math.abs(d-c)<0.01?'Balanced':'Review')]; }))}</div>`+
      `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">General Ledger</h3><div class="muted small">All source transactions translated into debit/credit lines</div></div><input class="table-search" data-filter-table placeholder="Search ledger"></div>${table(['Date','Source','Account','Memo','Debit','Credit'], recentLedger.map(l=>[l.date,`${l.source}<div class="muted small">${l.sourceId}</div>`,escapeHTML(accountLabel(l.accountId)),escapeHTML(l.memo),l.debit?money(l.debit):'—',l.credit?money(l.credit):'—']))}</div>`+
      `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><h3 style="margin:0">Audit Trail</h3></div>${table(['Date','User','Action'], state.auditTrail.slice(0,20).map(a=>[a.date,escapeHTML(a.user),escapeHTML(a.action)]))}</div>`;
  }
  function trialBalanceStatus(){ return accounting.trialBalanceStatus(state); }

  function renderCustomers(){
    const el=document.getElementById('page-customers'); const ar = totals().ar;
    el.innerHTML = header('Customers', 'Manage customer records, open balances, estimates, and invoices.', `<button class="btn" data-modal="estimate">New estimate</button><button class="btn primary" data-modal="customer">New customer</button>`)+
    `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/R</h3><div class="metric">${money(ar)}</div><div class="muted small">Ledger account 1200</div></div><div class="card"><h3>Overdue</h3><div class="metric">${money(totals().overdue)}</div><div class="muted small">Needs follow-up</div></div><div class="card"><h3>Customers</h3><div class="metric">${state.customers.length}</div><div class="muted small">Active contacts</div></div><div class="card"><h3>Estimates</h3><div class="metric">${state.estimates.length}</div><div class="muted small">Draft/accepted</div></div></div>`+
    `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search customers" /></div><div class="right"><button class="btn" data-modal="invoice">Create invoice</button></div></div>${table(['','Name','Company','Phone','Type','Open balance','Action'], state.customers.map(c=>[`<input type="checkbox"/>`,`<strong>${escapeHTML(c.name)}</strong>`,escapeHTML(c.company),escapeHTML(c.phone),escapeHTML(c.type),`<span class="amount">${money(customerOpenBalance(c.id))}</span>`,`<button class="btn square" data-modal="invoice">Invoice</button>`]))}</div>`;
  }
  function customerOpenBalance(customerId){ return state.invoices.filter(i=>i.customerId===customerId).reduce((s,i)=>s+openAmount(i),0); }
  function renderSales(){
    const el=document.getElementById('page-sales');
    el.innerHTML = header('Sales & Get Paid', 'Create invoices, receive payments, track estimates, and monitor receivables.', `<button class="btn" data-modal="payment">Receive payment</button><button class="btn primary" data-modal="invoice">Create invoice</button>`)+
    `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Sales revenue</h3><div class="metric">${money(totals().invoiceRevenue)}</div></div><div class="card"><h3>Open invoices</h3><div class="metric">${money(totals().ar)}</div></div><div class="card"><h3>Paid</h3><div class="metric">${money(totals().paidRevenue)}</div></div><div class="card"><h3>GST/HST collected</h3><div class="metric">${money(salesTaxSummary().collected)}</div></div></div>`+
    `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Invoices</h3><div class="muted small">Invoices post debit A/R and credit revenue/sales tax</div></div><input class="table-search" data-filter-table placeholder="Search invoices" /></div>${table(['Invoice','Customer','Date','Due','Status','Income Account','Total','Open balance','Action'], state.invoices.map(i=>[`<strong>${i.id}</strong>`,escapeHTML(getCustomer(i.customerId).name),i.date,i.dueDate,tagForStatus(i.status),escapeHTML(accountLabel(i.incomeAccountId||'4000')),`<span class="amount">${money(invoiceTotal(i))}</span>`,`<span class="amount">${money(openAmount(i))}</span>`, openAmount(i)<=0.01?'<span class="muted">Closed</span>':`<button class="btn square" data-action="mark-paid" data-id="${i.id}">Receive</button>`]))}</div>`+
    `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Payments</h3><div class="muted small">Payments post debit bank and credit A/R</div></div></div>${table(['Payment','Invoice','Customer','Date','Deposit To','Amount'], state.payments.map(p=>[`<strong>${p.id}</strong>`,p.invoiceId,escapeHTML(getCustomer(p.customerId).name),p.date,escapeHTML(getBank(p.accountId).name),`<span class="amount">${money(p.amount)}</span>`]))}</div>`+
    `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Estimates</h3><div class="muted small">Accepted estimates can be converted into invoices when ready</div></div><button class="btn" data-modal="estimate">New estimate</button></div>${table(['Estimate','Customer','Date','Status','Total'], state.estimates.map(e=>[`<strong>${e.id}</strong>`,escapeHTML(getCustomer(e.customerId).name),e.date,tagForStatus(e.status),`<span class="amount">${money(e.total)}</span>`]))}</div>`;
  }
  function markInvoicePaid(id){ const inv=state.invoices.find(i=>i.id===id); if(inv){ const amt=openAmount(inv); if(amt<=0) return; inv.paid=num(inv.paid)+amt; inv.status='Paid'; state.payments.unshift({id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:todayISO(), accountId:'BA-1', amount:amt, memo:'Payment for '+inv.id}); audit(`Payment received for ${inv.id}: ${money(amt)}`); saveState(); renderAll(); showToast(`${inv.id} paid and posted to the ledger.`); } }
  function renderExpenses(){
    const el=document.getElementById('page-expenses');
    el.innerHTML = header('Expenses & Pay Bills', 'Record expenses, create bills, pay vendors, and post to the general ledger.', `<button class="btn" data-modal="payBill">Pay bill</button><button class="btn" data-modal="bill">Create bill</button><button class="btn primary" data-modal="expense">Record expense</button>`)+
    `<div class="grid three" style="margin-bottom:16px"><div class="card"><h3>Total expenses</h3><div class="metric">${money(totals().expenses)}</div></div><div class="card"><h3>Accounts payable</h3><div class="metric">${money(totals().ap)}</div></div><div class="card"><h3>Input tax credits</h3><div class="metric">${money(salesTaxSummary().itc)}</div></div></div>`+
    `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Expenses</h3><div class="muted small">Paid expenses credit bank or credit card</div></div><input class="table-search" data-filter-table placeholder="Search expenses" /></div>${table(['Expense','Vendor','Date','Account','Memo','Method','Total'], state.expenses.map(e=>[`<strong>${e.id}</strong>`,escapeHTML(getVendor(e.vendorId).name),e.date,escapeHTML(accountLabel(e.expenseAccountId || expenseAccountFromName(e.account))),escapeHTML(e.memo),escapeHTML(e.paymentMethod),`<span class="amount">${money(expenseTotal(e))}</span>`]))}</div><div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Bills</h3><div class="muted small">Bills credit A/P until paid</div></div></div>${table(['Bill','Vendor','Due','Status','Total','Open','Action'], state.bills.map(b=>[`<strong>${b.id}</strong>`,escapeHTML(getVendor(b.vendorId).name),b.dueDate,tagForStatus(b.status),`<span class="amount">${money(billTotal(b))}</span>`,`<span class="amount">${money(billOpenAmount(b))}</span>`, billOpenAmount(b)>0.01?`<button class="btn square" data-action="pay-bill" data-id="${b.id}">Pay</button>`:'<span class="muted">Closed</span>']))}</div>`;
  }
  function renderVendors(){ const el=document.getElementById('page-vendors'); el.innerHTML = header('Vendors', 'Track supplier contacts, categories, open bills, and payment status.', `<button class="btn" data-modal="payBill">Pay bill</button><button class="btn primary" data-modal="vendor">Add vendor</button>`)+`<div class="card table-card">${table(['Vendor','Email','Phone','Category','Open balance','Action'], state.vendors.map(v=>[`<strong>${escapeHTML(v.name)}</strong>`,escapeHTML(v.email),escapeHTML(v.phone),escapeHTML(v.category),`<span class="amount">${money(vendorOpenBalance(v.id))}</span>`,`<button class="btn square" data-modal="bill">Create bill</button>`]))}</div>`; }
  function vendorOpenBalance(vendorId){ return state.bills.filter(b=>b.vendorId===vendorId).reduce((s,b)=>s+billOpenAmount(b),0); }
  function bankAccountReviewCount(id){ return state.bankTransactions.filter(tx=>tx.bankAccountId===id && tx.status!=='Reviewed' && tx.status!=='Matched').length; }
  function bankTxAmount(tx){ return num(tx.amount); }
  function bankTxStatusTag(tx){ return tagForStatus(tx.status || 'Unreviewed'); }
  function bankTxSuggestion(tx){
    if(tx.matchType==='Invoice payment' && tx.matchedInvoiceId) return `Match to ${tx.matchedInvoiceId}`;
    if(tx.matchType==='Bill payment' && tx.matchedBillId) return `Match to ${tx.matchedBillId}`;
    return accountLabel(tx.suggestedAccountId || (tx.amount>=0?'4100':'6000'));
  }
  function shortenBankDescription(description, maxLen=28){
    const raw = String(description || '').replace(/\s+/g,' ').trim();
    if(!raw) return '';
    const firstSegment = raw.split(/\s+[-–—]\s+/)[0].trim();
    let shortText = firstSegment.length >= 8 ? firstSegment : raw;
    if(shortText.length > maxLen) shortText = shortText.slice(0, maxLen - 1).trimEnd() + '…';
    return shortText;
  }
  function bankTxPostingPreview(tx){
    if(!tx) return [];
    const amt=Math.abs(num(tx.amount)), bank=bankAccountIdToLedger(tx.bankAccountId), cat=tx.suggestedAccountId || (num(tx.amount)>=0?'4100':'6000');
    if(tx.matchType==='Invoice payment') return [{accountId:bank,debit:amt,credit:0},{accountId:'1200',debit:0,credit:amt}];
    if(tx.matchType==='Bill payment') return [{accountId:'2000',debit:amt,credit:0},{accountId:bank,debit:0,credit:amt}];
    if(num(tx.amount)>=0) return [{accountId:bank,debit:amt,credit:0},{accountId:cat,debit:0,credit:amt}];
    return [{accountId:cat,debit:amt,credit:0},{accountId:bank,debit:0,credit:amt}];
  }
  function renderPostingPreview(tx){
    const rows=bankTxPostingPreview(tx);
    return `<div class="posting-preview"><div class="posting-line posting-head"><span>Account</span><span>Debit</span><span>Credit</span></div>${rows.map(r=>`<div class="posting-line"><span>${escapeHTML(accountLabel(r.accountId))}</span><span>${r.debit?money(r.debit):'—'}</span><span>${r.credit?money(r.credit):'—'}</span></div>`).join('')}</div>`;
  }
  function renderBankTransactionRows(txs){
    return txs.map(tx=>{
      const cls=String(tx.status||'Unreviewed').toLowerCase().replace(/\s+/g,'-');
      const canInvoice = num(tx.amount)>0 && tx.matchType==='Invoice payment' && tx.matchedInvoiceId;
      const canBill = num(tx.amount)<0 && tx.matchType==='Bill payment' && tx.matchedBillId;
      return [`<span class="small muted">${tx.date}</span>`,
        `<div class="tx-desc"><strong>${escapeHTML(tx.description)}</strong><span class="muted small">${tx.id} · ${escapeHTML(getBank(tx.bankAccountId).name)}</span></div>`,
        `<span class="amount">${money(tx.amount)}</span>`,
        escapeHTML(bankTxSuggestion(tx)),
        `${bankTxStatusTag(tx)}<div class="small muted" style="margin-top:4px"><span class="cleared-dot ${tx.cleared?'on':''}"></span>${tx.cleared?'Cleared':'Not cleared'}</div>`,
        `<div class="tx-actions"><button class="btn square" data-action="view-banktx" data-id="${tx.id}">View</button>${canInvoice?`<button class="btn square" data-action="match-invoice-banktx" data-id="${tx.id}">Match invoice</button>`:''}${canBill?`<button class="btn square" data-action="match-bill-banktx" data-id="${tx.id}">Match bill</button>`:''}<button class="btn square" data-action="review-banktx" data-id="${tx.id}">Review</button><button class="btn square" data-action="${tx.cleared?'unclear-banktx':'clear-banktx'}" data-id="${tx.id}">${tx.cleared?'Unclear':'Clear'}</button></div>`];
    });
  }
  function renderTransactions(){
    const el=document.getElementById('page-transactions');
    const rows = [
      ...state.bankTransactions.map(tx=>({date:tx.date, source:'Bank feed', ref:tx.id, name:tx.description, amount:tx.amount, status:tx.status, action:`<button class="btn square" data-action="view-banktx" data-id="${tx.id}">Detail</button>`})),
      ...state.invoices.map(i=>({date:i.date, source:'Invoice', ref:i.id, name:getCustomer(i.customerId).name, amount:invoiceTotal(i), status:i.status, action:openAmount(i)>0?`<button class="btn square" data-action="mark-paid" data-id="${i.id}">Receive</button>`:'—'})),
      ...state.expenses.map(e=>({date:e.date, source:'Expense', ref:e.id, name:getVendor(e.vendorId).name, amount:-expenseTotal(e), status:e.paymentMethod, action:'—'})),
      ...state.bills.map(b=>({date:b.date, source:'Bill', ref:b.id, name:getVendor(b.vendorId).name, amount:-billTotal(b), status:b.status, action:billOpenAmount(b)>0?`<button class="btn square" data-action="pay-bill" data-id="${b.id}">Pay</button>`:'—'})),
      ...state.payments.map(p=>({date:p.date, source:'Payment', ref:p.id, name:getCustomer(p.customerId).name, amount:p.amount, status:'Posted', action:'—'}))
    ].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,120);
    el.innerHTML = header('Transactions', 'Unified transaction register combining bank-feed items, invoices, bills, expenses, payments, and ledger-linked actions.', `<button class="btn" data-modal="bankTx">Add bank transaction</button><button class="btn primary" data-nav="banking">Open banking center</button>`)+
      `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">All Transactions</h3><div class="muted small">Search, review, and jump to workflow actions</div></div><input class="table-search" data-filter-table placeholder="Search transactions"></div>${table(['Date','Source','Reference','Name / Memo','Status','Amount','Action'], rows.map(r=>[r.date,r.source,`<strong>${r.ref}</strong>`,escapeHTML(r.name),tagForStatus(r.status),`<span class="amount">${money(r.amount)}</span>`,r.action]))}</div>`;
  }
  function reconciliationSummary(accountId){
    const account = state.bankAccounts.find(b=>b.id===accountId) || state.bankAccounts[0];
    const last = [...state.reconciliations].filter(r=>r.accountId===account.id).sort((a,b)=>String(b.statementDate).localeCompare(String(a.statementDate)))[0];
    const book = normalBalance(account.accountId);
    const cleared = state.bankTransactions.filter(tx=>tx.bankAccountId===account.id && tx.cleared).reduce((s,tx)=>s+num(tx.amount),0);
    const ending = last ? num(last.endingBalance) : book;
    return {account,last,book,cleared,ending,difference:ending-book};
  }
  function renderBanking(){
    const el=document.getElementById('page-banking');
    const unreviewed=state.bankTransactions.filter(tx=>tx.status!=='Reviewed' && tx.status!=='Matched').length;
    const suggested=state.bankTransactions.filter(tx=>tx.status==='Suggested').length;
    const cleared=state.bankTransactions.filter(tx=>tx.cleared).length;
    const rec=reconciliationSummary('BA-1');
    const sortedTx=[...state.bankTransactions].sort((a,b)=>b.date.localeCompare(a.date));
    el.innerHTML = header('Banking Center', 'Bank transaction review, matching, categorization, clearing, and reconciliation workflow.', `<button class="btn" data-modal="bankTx">Add bank transaction</button><button class="btn" data-modal="transfer">Transfer</button><button class="btn primary" data-modal="reconcile">Reconcile</button>`)+
    `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>To review</h3><div class="metric">${unreviewed}</div><div class="muted small">Unreviewed or suggested bank feed items</div></div><div class="card"><h3>Suggested matches</h3><div class="metric">${suggested}</div><div class="muted small">Invoice, bill, or category suggestions</div></div><div class="card"><h3>Cleared</h3><div class="metric">${cleared}</div><div class="muted small">Marked as cleared for reconciliation</div></div><div class="card"><h3>Operating book balance</h3><div class="metric">${money(rec.book)}</div><div class="muted small">${escapeHTML(rec.account.name)}</div></div></div>`+
    `<div class="split-layout"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Bank Transaction Review Center</h3><div class="muted small">Match deposits to invoices, match withdrawals to bills, or categorize transactions directly to the ledger.</div></div><input class="table-search" data-filter-table placeholder="Search bank feed"></div>${table(['Date','Description','Amount','Suggestion','Status','Actions'], renderBankTransactionRows(sortedTx))}</div>`+
    `<div class="grid"><div class="recon-box"><h3 style="margin-top:0">Reconciliation Snapshot</h3><div class="report-line"><span>Account</span><strong>${escapeHTML(rec.account.name)}</strong></div><div class="report-line"><span>Book balance</span><strong>${money(rec.book)}</strong></div><div class="report-line"><span>Last statement balance</span><strong>${money(rec.ending)}</strong></div><div class="report-line"><span>Cleared bank-feed total</span><strong>${money(rec.cleared)}</strong></div><div class="report-line total"><span>Difference</span><span class="difference ${Math.abs(rec.difference)<0.01?'good':'bad'}">${money(rec.difference)}</span></div><button class="btn primary" data-modal="reconcile" style="width:100%;margin-top:12px">Start reconciliation</button></div>`+
    `<div class="card"><h3>Bank Accounts</h3><div class="bank-list">${state.bankAccounts.map(b=>`<div class="bank-row"><div class="bank-icon">${b.type==='Credit Card'?'CC':'$'}</div><div><strong>${escapeHTML(b.name)}</strong><div class="muted small">${escapeHTML(accountLabel(b.accountId))} · ${bankAccountReviewCount(b.id)} to review</div></div><div class="amount">${money(normalBalance(b.accountId))}</div></div>`).join('')}</div></div></div></div>`+
    `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><h3 style="margin:0">Bank Register Lines</h3></div>${table(['Date','Source','Bank Account','Memo','Debit','Credit'], ledger().filter(l=>['1000','1010','2100'].includes(l.accountId)).slice(0,50).map(l=>[l.date,`${l.source} ${l.sourceId}`,escapeHTML(accountLabel(l.accountId)),escapeHTML(l.memo),l.debit?money(l.debit):'—',l.credit?money(l.credit):'—']))}</div>`;
  }
  function renderReports(){
    const t=totals(), tax=salesTaxSummary(), tb=trialBalanceStatus(); const bal=accountBalances();
    const assets=sumTypes(['Asset']), liabilities=sumTypes(['Liability']), equity=sumTypes(['Equity']), income=sumTypes(['Income']), expenses=sumTypes(['Expense','COGS']), net=income-expenses;
    const el=document.getElementById('page-reports');
    el.innerHTML = header('Reports & Analytics', 'Financial statements generated from the double-entry ledger and reviewed bank-feed postings.', `<button class="btn" onclick="window.print()">Print</button><button class="btn primary" data-modal="journal">Journal entry</button>`)+
    `<div class="report-block"><div class="card"><h3>Profit & Loss</h3><div class="report-line"><span>Income</span><strong>${money(income)}</strong></div><div class="report-line"><span>Expenses</span><strong>${money(expenses)}</strong></div><div class="report-line total"><span>Net income</span><span>${money(net)}</span></div></div><div class="card"><h3>Balance Sheet</h3><div class="report-line"><span>Assets</span><strong>${money(assets)}</strong></div><div class="report-line"><span>Liabilities</span><strong>${money(liabilities)}</strong></div><div class="report-line"><span>Equity</span><strong>${money(equity)}</strong></div><div class="report-line"><span>Current earnings</span><strong>${money(net)}</strong></div><div class="report-line total"><span>A = L + E + NI check</span><span>${money(assets-(liabilities+equity+net))}</span></div></div></div>`+
    `<div class="grid two" style="margin-top:16px"><div class="card"><h3>Sales Tax Summary</h3><div class="report-line"><span>GST/HST collected</span><strong>${money(tax.collected)}</strong></div><div class="report-line"><span>Input tax credits</span><strong>${money(tax.itc)}</strong></div><div class="report-line total"><span>Net before payments</span><span>${money(tax.net)}</span></div></div><div class="card"><h3>A/R and A/P Aging</h3><div class="report-line"><span>Open receivables</span><strong>${money(t.ar)}</strong></div><div class="report-line"><span>Overdue invoices</span><strong>${money(t.overdue)}</strong></div><div class="report-line"><span>Open payables</span><strong>${money(t.ap)}</strong></div><div class="report-line total"><span>Working capital exposure</span><span>${money(t.ar-t.ap)}</span></div></div></div>`+
    `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Trial Balance</h3><div class="muted small">Status: ${tb.ok?'balanced':'review needed'} · Difference ${money(Math.abs(tb.diff))}</div></div></div>${table(['Code','Account','Type','Debit','Credit'], state.chartOfAccounts.map(a=>{ const b=bal[a.id]||{net:0}; const d=b.net>0?b.net:0, c=b.net<0?-b.net:0; return [a.code,escapeHTML(a.name),a.type,d?money(d):'—',c?money(c):'—']; }).filter(r=>r[3]!=='—'||r[4]!=='—'))}</div>`+
    `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><h3 style="margin:0">Receivables and Payables Aging</h3></div>${table(['Type','Reference','Name','Due','Status','Open'], [
      ...state.invoices.filter(i=>openAmount(i)>0).map(i=>['Receivable',i.id,escapeHTML(getCustomer(i.customerId).name),i.dueDate,tagForStatus(i.status),money(openAmount(i))]),
      ...state.bills.filter(b=>billOpenAmount(b)>0).map(b=>['Payable',b.id,escapeHTML(getVendor(b.vendorId).name),b.dueDate,tagForStatus(b.status),money(billOpenAmount(b))])
    ].sort((a,b)=>String(a[3]).localeCompare(String(b[3]))))}</div>`;
  }
  function renderInventory(){ const el=document.getElementById('page-inventory'); el.innerHTML = header('Products & Services', 'Manage sellable services, products, income accounts, and starting inventory quantities.', `<button class="btn primary" data-modal="product">Add product/service</button>`)+`<div class="card table-card">${table(['Product / Service','Type','Price','Income Account','Qty on hand'], state.products.map(p=>[`<strong>${escapeHTML(p.name)}</strong>`,p.type,money(p.price),escapeHTML(accountLabel(p.incomeAccountId||'4000')),num(p.qty)]))}</div>`; }
  function renderTime(){ const el=document.getElementById('page-time'); el.innerHTML = header('Time', 'Capture billable time by team member and customer.', `<button class="btn primary" data-modal="time">Add time</button>`)+`<div class="card table-card">${table(['Entry','Team member','Customer','Date','Hours','Billable'], state.timeEntries.map(t=>[t.id,escapeHTML(t.employee),escapeHTML(getCustomer(t.customerId).name),t.date,num(t.hours),t.billable?'Yes':'No']))}</div>`; }
  function renderProjects(){ const el=document.getElementById('page-projects'); el.innerHTML = header('Projects', 'Track project budget, revenue, cost, and profitability.', `<button class="btn primary" data-modal="project">New project</button>`)+`<div class="card table-card">${table(['Project','Customer','Budget','Revenue','Actual cost','Profit','Status'], state.projects.map(p=>[`<strong>${escapeHTML(p.name)}</strong>`,escapeHTML(getCustomer(p.customerId).name),money(p.budget),money(p.revenue),money(p.actualCost),money(num(p.revenue)-num(p.actualCost)),tagForStatus(p.status)]))}</div>`; }
  function renderPayroll(){ const el=document.getElementById('page-payroll'); el.innerHTML = header('Payroll', 'Payroll setup, pay runs, deductions, and remittance tracking.', `<button class="btn primary" data-modal="payroll">Payroll setup</button>`)+`<div class="empty">Payroll features are not enabled for this company. Enable payroll setup before running pay calculations.</div>`; }
  function renderTaxes(){ const tax=salesTaxSummary(); const el=document.getElementById('page-taxes'); el.innerHTML = header('Taxes', 'Track GST/HST collected, input tax credits, tax payments, and net tax balance.', `<button class="btn primary" data-nav="reports">Open tax report</button>`)+`<div class="grid three"><div class="card"><h3>Collected</h3><div class="metric">${money(tax.collected)}</div></div><div class="card"><h3>Input tax credits</h3><div class="metric">${money(tax.itc)}</div></div><div class="card"><h3>Net before payments</h3><div class="metric">${money(tax.net)}</div></div></div>`; }
  function renderApps(){ const el=document.getElementById('page-apps'); el.innerHTML = header('Apps & Integrations', 'Future connection point for bank feeds, receipt OCR, payment processors, Shopify, payroll, and Supabase/PostgreSQL.', '')+`<div class="grid three"><div class="card"><h3>Bank feeds</h3><p class="muted">Review, match, categorize, clear, and reconcile imported-style bank transactions.</p></div><div class="card"><h3>Receipt capture</h3><p class="muted">Planned: upload receipt and draft expense transaction.</p></div><div class="card"><h3>Database</h3><p class="muted">Planned: Supabase/PostgreSQL multi-company storage.</p></div></div>`; }
  function renderSettings(){ const el=document.getElementById('page-settings'); el.innerHTML = header('Settings', 'Company profile, tax rate, accounting method, menu customization, and local data controls.', `<button class="btn" data-modal="customize">Customize menu</button><button class="btn primary" data-modal="company">Company settings</button>`)+`<div class="grid two"><div class="card"><h3>Company</h3><div class="report-line"><span>Name</span><strong>${escapeHTML(state.company.name)}</strong></div><div class="report-line"><span>Province</span><strong>${escapeHTML(state.company.province)}</strong></div><div class="report-line"><span>Fiscal year</span><strong>${escapeHTML(state.company.fiscalYear)}</strong></div><div class="report-line"><span>Sales tax</span><strong>${state.company.salesTax}%</strong></div><div class="report-line"><span>Method</span><strong>${escapeHTML(state.company.accountingMethod||'Accrual')}</strong></div></div><div class="card"><h3>Data</h3><p class="muted">Data is stored in this browser. Export a backup before clearing browser data.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="exportData2">Export JSON</button><button class="btn danger" id="resetDemo2">Reset company data</button></div></div></div>`; document.getElementById('exportData2').addEventListener('click', exportData); document.getElementById('resetDemo2').addEventListener('click', resetState); }
  function renderPlaceholder(page){ const el=document.getElementById('page-'+page); if(el) el.innerHTML = header(page, 'This workspace is ready for setup.', '')+`<div class="empty">This workspace is available for setup.</div>`; }

  function handleAction(action, id){
    if(action==='mark-paid') markInvoicePaid(id);
    if(action==='pay-bill'){
      openModal('payBill');
      setTimeout(()=>{ const s=document.querySelector('[name="billId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change')); }},0);
    }
    if(action==='view-banktx') openModal('bankTxDetail:'+id);
    if(action==='review-banktx') reviewBankTransaction(id);
    if(action==='match-invoice-banktx') matchBankTransactionToInvoice(id);
    if(action==='match-bill-banktx') matchBankTransactionToBill(id);
    if(action==='clear-banktx' || action==='unclear-banktx') toggleBankCleared(id);
  }

  function openModal(type){
    const active = document.activeElement;
    if(active && !document.getElementById('modalBackdrop')?.contains(active)) lastModalFocus = active;
    currentModal = type;
    const isDetail = type.startsWith('bankTxDetail:');
    const titles = {invoice:['Create invoice','Post debit Accounts Receivable and credit revenue / sales tax.'], expense:['Record expense','Post debit expense / input tax credit and credit bank or credit card.'], customer:['Add customer','Create a customer record.'], vendor:['Add vendor','Create a supplier record.'], bill:['Create bill','Post debit expense / input tax credit and credit Accounts Payable.'], payBill:['Pay bill','Post debit Accounts Payable and credit bank.'], deposit:['Bank deposit','Post debit bank and credit selected income account.'], bankTx:['Add bank transaction','Create an imported bank-feed style transaction for review and categorization.'], reconcile:['Bank reconciliation','Record statement balance and compare with book balance / cleared activity.'], transfer:['Transfer','Move funds between bank accounts using balanced ledger lines.'], product:['Add product/service','Create an item with a linked income account.'], payment:['Receive payment','Post debit bank and credit Accounts Receivable.'], estimate:['Create estimate','Create a non-posting quote.'], time:['Add time entry','Capture billable/non-billable hours.'], project:['New project','Create a project record.'], company:['Company settings','Update company profile and default tax rate.'], customize:['Customize app menus','Choose visible navigation modules.'], journal:['Journal entry','Create a balanced two-line manual journal entry.'], account:['Add account','Add a new account to the chart of accounts.'] };
    const [title, sub] = isDetail ? ['Transaction detail drawer','Review bank-feed details, suggested match, and posting preview.'] : (titles[type] || [type, 'Choose an available action or complete the related setup.']);
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalSubtitle').textContent = sub;
    document.getElementById('modalBody').innerHTML = modalBodyContent(type);
    document.getElementById('modalFooter').innerHTML = isDetail ? '<button type="button" class="btn" id="cancelModal">Close</button>' : '<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save</button>';
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').classList.add('open');
    bindModalLiveCalculations(type);
  }
  function customerOptions(){ return state.customers.map(c=>`<option value="${c.id}">${escapeHTML(c.name)}</option>`).join(''); }
  function vendorOptions(){ return state.vendors.map(v=>`<option value="${v.id}">${escapeHTML(v.name)}</option>`).join(''); }
  function bankOptions(){ return state.bankAccounts.map(b=>`<option value="${b.id}">${escapeHTML(b.name)} · ${money(normalBalance(b.accountId))}</option>`).join(''); }
  function accountOptions(filterTypes=null){ return state.chartOfAccounts.filter(a=>!filterTypes || filterTypes.includes(a.type)).map(a=>`<option value="${a.id}">${a.code} · ${escapeHTML(a.name)}</option>`).join(''); }
  function productOptions(){ return state.products.map(p=>`<option value="${p.id}" data-price="${p.price}" data-account="${p.incomeAccountId||'4000'}">${escapeHTML(p.name)} · ${money(p.price)}</option>`).join(''); }
  function modalBodyContent(type){
    if(type==='invoice') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Invoice date</label><input type="date" name="date" value="${todayISO()}" required></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(30)}" required></div><div class="field"><label>Status</label><select name="status"><option>Sent</option><option>Draft</option><option>Overdue</option></select></div><div class="field full"><label>Product / service</label><select id="invoiceProduct" name="productId">${productOptions()}</select></div><div class="field full"><label>Description</label><input id="invoiceDesc" name="desc" value="Consulting service" required></div><div class="field"><label>Qty</label><input id="invoiceQty" type="number" step="0.01" min="0" name="qty" value="1" required></div><div class="field"><label>Rate</label><input id="invoiceRate" type="number" step="0.01" min="0" name="rate" value="125" required></div><div class="field"><label>Sales tax %</label><input id="invoiceTax" type="number" step="0.01" min="0" name="taxRate" value="${state.company.salesTax}" required></div><div class="field"><label>Income account</label><select id="invoiceIncome" name="incomeAccountId">${accountOptions(['Income'])}</select></div></div><div class="inline-total"><span>Invoice total</span><span id="invoiceTotalPreview">$0.00</span></div>`;
    if(type==='expense') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Expense account</label><select name="expenseAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option>Bank transfer</option><option>Credit card</option><option>Cash</option></select></div><div class="field"><label>Paid from</label><select name="bankAccountId">${bankOptions()}</select></div><div class="field"><label>Amount before tax</label><input id="expenseAmount" type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Tax / ITC</label><input id="expenseTax" type="number" step="0.01" min="0" name="tax" value="5"></div><div class="field full"><label>Memo</label><input name="memo" value="Business expense"></div></div><div class="inline-total"><span>Expense total</span><span id="expenseTotalPreview">$0.00</span></div>`;
    if(type==='customer') return `<div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Company</label><input name="company"></div><div class="field"><label>Email</label><input type="email" name="email"></div><div class="field"><label>Phone</label><input name="phone"></div><div class="field"><label>Type</label><select name="type"><option>Commercial</option><option>Residential</option><option>Government</option><option>Education</option></select></div></div>`;
    if(type==='vendor') return `<div class="form-grid"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Category</label><input name="category" value="Office expenses"></div><div class="field"><label>Email</label><input type="email" name="email"></div><div class="field"><label>Phone</label><input name="phone"></div></div>`;
    if(type==='bill') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Bill date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(14)}"></div><div class="field"><label>Status</label><select name="status"><option>Open</option><option>Paid</option></select></div><div class="field"><label>Expense account</label><select name="expenseAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="250"></div><div class="field"><label>Tax / ITC</label><input type="number" step="0.01" min="0" name="tax" value="12.50"></div></div>`;
    if(type==='payBill') return `<div class="form-grid"><div class="field full"><label>Open bill</label><select name="billId" id="payBillSelect">${state.bills.filter(b=>billOpenAmount(b)>0).map(b=>`<option value="${b.id}" data-open="${billOpenAmount(b)}">${b.id} · ${escapeHTML(getVendor(b.vendorId).name)} · open ${money(billOpenAmount(b))}</option>`).join('') || '<option value="">No open bills</option>'}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Pay from</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Amount</label><input id="payBillAmount" type="number" step="0.01" min="0" name="amount" value="0"></div><div class="field full"><label>Memo</label><input name="memo" value="Vendor bill payment"></div></div>`;
    if(type==='deposit') return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Deposit to</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Credit account</label><select name="incomeAccountId">${accountOptions(['Income','Equity','Liability'])}</select></div><div class="field"><label>Amount</label><input type="number" step="0.01" min="0" name="amount" value="500"></div><div class="field full"><label>Memo</label><input name="memo" value="Bank deposit"></div></div>`;
    if(type==='transfer') return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Amount</label><input type="number" step="0.01" min="0" name="amount" value="1000"></div><div class="field"><label>From</label><select name="fromAccountId">${bankOptions()}</select></div><div class="field"><label>To</label><select name="toAccountId">${bankOptions()}</select></div><div class="field full"><label>Memo</label><input name="memo" value="Internal transfer"></div></div>`;
    if(type==='product') return `<div class="form-grid"><div class="field full"><label>Name</label><input name="name" required></div><div class="field"><label>Type</label><select name="type"><option>Service</option><option>Product</option></select></div><div class="field"><label>Price</label><input type="number" step="0.01" min="0" name="price" value="100" required></div><div class="field"><label>Qty on hand</label><input type="number" step="1" min="0" name="qty" value="0"></div><div class="field full"><label>Income account</label><select name="incomeAccountId">${accountOptions(['Income'])}</select></div></div>`;
    if(type==='payment') return `<div class="form-grid"><div class="field full"><label>Open invoice</label><select name="invoiceId" id="paymentInvoiceSelect">${state.invoices.filter(i=>openAmount(i)>0).map(i=>`<option value="${i.id}" data-open="${openAmount(i)}">${i.id} · ${escapeHTML(getCustomer(i.customerId).name)} · ${money(openAmount(i))}</option>`).join('') || '<option value="">No open invoices</option>'}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Deposit to</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Amount</label><input id="paymentAmount" type="number" step="0.01" min="0" name="amount" value="0"></div></div>`;
    if(type==='estimate') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Total</label><input type="number" step="0.01" min="0" name="total" value="1000"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option>Sent</option><option>Accepted</option></select></div></div>`;
    if(type==='time') return `<div class="form-grid"><div class="field"><label>Team member</label><input name="employee" value="Alex Chen" required></div><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Hours</label><input type="number" step="0.25" min="0" name="hours" value="1"></div><div class="field full"><label><input type="checkbox" name="billable" checked> Billable</label></div></div>`;
    if(type==='project') return `<div class="form-grid"><div class="field"><label>Project name</label><input name="name" required></div><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Budget</label><input type="number" step="0.01" min="0" name="budget" value="5000"></div><div class="field"><label>Status</label><select name="status"><option>Active</option><option>Planning</option><option>Closed</option></select></div></div>`;
    if(type==='bankTx') return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Bank account</label><select name="bankAccountId">${bankOptions()}</select></div><div class="field full"><label>Description</label><input name="description" value="Imported bank transaction" required></div><div class="field"><label>Amount (+ deposit / - withdrawal)</label><input type="number" step="0.01" name="amount" value="100"></div><div class="field"><label>Suggested category</label><select name="suggestedAccountId">${accountOptions()}</select></div><div class="field"><label>Status</label><select name="status"><option>Unreviewed</option><option>Suggested</option><option>Reviewed</option></select></div><div class="field full"><label>Note</label><input name="note" value="Manually entered bank-feed transaction"></div></div>`;
    if(type==='reconcile') return `<div class="form-grid"><div class="field"><label>Bank account</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Statement date</label><input type="date" name="statementDate" value="${todayISO()}"></div><div class="field"><label>Statement ending balance</label><input type="number" step="0.01" name="endingBalance" value="${normalBalance(state.bankAccounts[0].accountId).toFixed(2)}"></div><div class="field"><label>Status</label><select name="status"><option>In progress</option><option>Completed</option></select></div><div class="field full"><label>Notes</label><input name="notes" value="Monthly bank reconciliation"></div></div><div class="empty"><strong>Reconciliation logic:</strong> This records the statement balance, compares it to the current book balance, and uses cleared bank-feed items to support review.</div>`;
    if(type.startsWith('bankTxDetail:')){ const id=type.split(':')[1]; const tx=state.bankTransactions.find(x=>x.id===id); if(!tx) return `<div class="empty">Transaction not found.</div>`; return `<div class="drawer-grid"><div class="grid two"><div class="card"><h3>Bank transaction</h3><div class="report-line"><span>ID</span><strong>${tx.id}</strong></div><div class="report-line"><span>Date</span><strong>${tx.date}</strong></div><div class="report-line"><span>Description</span><strong title="${escapeHTML(tx.description)}" aria-label="${escapeHTML(tx.description)}">${escapeHTML(shortenBankDescription(tx.description))}</strong></div><div class="report-line"><span>Amount</span><strong>${money(tx.amount)}</strong></div><div class="report-line"><span>Status</span><span>${bankTxStatusTag(tx)}</span></div><div class="report-line"><span>Cleared</span><strong>${tx.cleared?'Yes':'No'}</strong></div></div><div class="card"><h3>Suggested handling</h3><div class="report-line"><span>Bank account</span><strong>${escapeHTML(getBank(tx.bankAccountId).name)}</strong></div><div class="report-line"><span>Suggestion</span><strong>${escapeHTML(bankTxSuggestion(tx))}</strong></div><div class="report-line"><span>Match type</span><strong>${escapeHTML(tx.matchType||'Category')}</strong></div><div class="report-line"><span>Linked transaction</span><strong>${escapeHTML(tx.linkedId||'Not linked')}</strong></div><p class="muted small">${escapeHTML(tx.note||'No note')}</p></div></div><div><h3>Posting preview</h3>${renderPostingPreview(tx)}</div><div class="tx-actions"><button type="button" class="btn" data-action="review-banktx" data-id="${tx.id}">Review / categorize</button>${tx.matchType==='Invoice payment'?`<button type="button" class="btn" data-action="match-invoice-banktx" data-id="${tx.id}">Match invoice</button>`:''}${tx.matchType==='Bill payment'?`<button type="button" class="btn" data-action="match-bill-banktx" data-id="${tx.id}">Match bill</button>`:''}<button type="button" class="btn" data-action="${tx.cleared?'unclear-banktx':'clear-banktx'}" data-id="${tx.id}">${tx.cleared?'Unclear':'Clear'}</button></div></div>`; }
    if(type==='company') return `<div class="form-grid"><div class="field"><label>Company name</label><input name="name" value="${escapeHTML(state.company.name)}" required></div><div class="field"><label>Province</label><input name="province" value="${escapeHTML(state.company.province)}"></div><div class="field"><label>Fiscal year</label><input name="fiscalYear" value="${escapeHTML(state.company.fiscalYear)}"></div><div class="field"><label>Sales tax %</label><input type="number" step="0.01" name="salesTax" value="${state.company.salesTax}"></div><div class="field"><label>Accounting method</label><select name="accountingMethod"><option ${state.company.accountingMethod==='Accrual'?'selected':''}>Accrual</option><option ${state.company.accountingMethod==='Cash'?'selected':''}>Cash</option></select></div></div>`;
    if(type==='customize') return `<p class="muted">Select the modules that should appear in the left menu. Dashboard remains available through the rail.</p><div class="grid two">${menuModules.map(m=>`<label class="card" style="display:flex;align-items:center;gap:12px;padding:12px"><input type="checkbox" name="module" value="${m.id}" ${(state.settings.visibleModules||[]).includes(m.id)?'checked':''}> <span class="module-icon" style="width:28px;height:28px;font-size:12px">${m.icon}</span><strong>${escapeHTML(m.label)}</strong></label>`).join('')}</div>`;
    if(type==='journal') return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Status</label><select name="status"><option>Posted</option><option>Draft</option></select></div><div class="field full"><label>Memo</label><input name="memo" value="Manual journal entry"></div><div class="field"><label>Debit account</label><select name="debitAccountId">${accountOptions()}</select></div><div class="field"><label>Debit amount</label><input id="journalDebit" type="number" step="0.01" min="0" name="debitAmount" value="100"></div><div class="field"><label>Credit account</label><select name="creditAccountId">${accountOptions()}</select></div><div class="field"><label>Credit amount</label><input id="journalCredit" type="number" step="0.01" min="0" name="creditAmount" value="100"></div></div><div class="inline-total"><span>Difference</span><span id="journalDiff">$0.00</span></div>`;
    if(type==='account') return `<div class="form-grid"><div class="field"><label>Code</label><input name="code" value="${nextAccountCode()}" required></div><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Type</label><select name="type"><option>Asset</option><option>Liability</option><option>Equity</option><option>Income</option><option>COGS</option><option>Expense</option></select></div><div class="field"><label>Normal balance</label><select name="normal"><option>Debit</option><option>Credit</option></select></div><div class="field full"><label>Detail</label><input name="detail" value="Custom account"></div></div>`;
    return `<div class="empty"><strong>${escapeHTML(type)}</strong> is not available yet. Choose an available action from + New or complete the related setup.</div>`;
  }
  function nextAccountCode(){ const max=Math.max(...state.chartOfAccounts.map(a=>num(a.code)),7000); return String(max+10); }
  function bindModalLiveCalculations(type){
    if(type==='invoice'){
      const recalc=()=>{ const q=num(document.getElementById('invoiceQty')?.value), r=num(document.getElementById('invoiceRate')?.value), tx=num(document.getElementById('invoiceTax')?.value), preview=document.getElementById('invoiceTotalPreview'); if(preview) preview.textContent=money(q*r*(1+tx/100)); };
      ['invoiceQty','invoiceRate','invoiceTax'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc));
      document.getElementById('invoiceProduct')?.addEventListener('change',e=>{ const opt=e.target.selectedOptions[0]; document.getElementById('invoiceRate').value = opt.dataset.price || 0; document.getElementById('invoiceIncome').value = opt.dataset.account || '4000'; document.getElementById('invoiceDesc').value = opt.textContent.split(' · ')[0]; recalc(); }); recalc();
    }
    if(type==='expense'){ const recalc=()=>{ const preview=document.getElementById('expenseTotalPreview'); if(preview) preview.textContent=money(num(document.getElementById('expenseAmount')?.value)+num(document.getElementById('expenseTax')?.value)); }; ['expenseAmount','expenseTax'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc)); recalc(); }
    if(type==='payment'){ const sel=document.getElementById('paymentInvoiceSelect'), amt=document.getElementById('paymentAmount'); const sync=()=>{ const opt=sel?.selectedOptions[0]; if(opt&&amt) amt.value = Number(opt.dataset.open||0).toFixed(2); }; sel?.addEventListener('change',sync); sync(); }
    if(type==='payBill'){ const sel=document.getElementById('payBillSelect'), amt=document.getElementById('payBillAmount'); const sync=()=>{ const opt=sel?.selectedOptions[0]; if(opt&&amt) amt.value = Number(opt.dataset.open||0).toFixed(2); }; sel?.addEventListener('change',sync); sync(); }
    if(type==='journal'){ const recalc=()=>{ const diff=num(document.getElementById('journalDebit')?.value)-num(document.getElementById('journalCredit')?.value), preview=document.getElementById('journalDiff'); if(preview) preview.textContent=money(diff); }; ['journalDebit','journalCredit'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc)); recalc(); }
  }
  function closeModal(){
    document.getElementById('modalBackdrop').classList.remove('open');
    currentModal=null;
    if(lastModalFocus && document.contains(lastModalFocus)) lastModalFocus.focus();
    lastModalFocus=null;
  }
  function submitModal(e){
    e.preventDefault(); const f = new FormData(e.target); const data = Object.fromEntries(f.entries());
    switch(currentModal){
      case 'invoice': { const subtotal=num(data.qty)*num(data.rate); const tax=subtotal*num(data.taxRate)/100; const inv={id:uid('INV'), customerId:data.customerId, date:data.date, dueDate:data.dueDate, status:data.status, subtotal, tax, paid:0, incomeAccountId:data.incomeAccountId, items:[{desc:data.desc, qty:num(data.qty), rate:num(data.rate)}]}; state.invoices.unshift(inv); audit(`Invoice ${inv.id} created and posted`); showToast('Invoice created and posted.'); break; }
      case 'expense': { const exp={id:uid('EXP'), vendorId:data.vendorId, date:data.date, expenseAccountId:data.expenseAccountId, account:getAccount(data.expenseAccountId).name, memo:data.memo, amount:num(data.amount), tax:num(data.tax), paymentMethod:data.paymentMethod, bankAccountId:data.bankAccountId}; state.expenses.unshift(exp); audit(`Expense ${exp.id} recorded: ${money(expenseTotal(exp))}`); showToast('Expense recorded and posted.'); break; }
      case 'customer': state.customers.unshift({id:uid('C'), name:data.name, company:data.company||data.name, email:data.email, phone:data.phone, type:data.type}); audit(`Customer added: ${data.name}`); showToast('Customer added.'); break;
      case 'vendor': state.vendors.unshift({id:uid('V'), name:data.name, email:data.email, phone:data.phone, category:data.category}); audit(`Vendor added: ${data.name}`); showToast('Vendor added.'); break;
      case 'bill': { const bill={id:uid('BILL'), vendorId:data.vendorId, date:data.date, dueDate:data.dueDate, status:data.status, expenseAccountId:data.expenseAccountId, amount:num(data.amount), tax:num(data.tax), paid:0}; state.bills.unshift(bill); if(data.status==='Paid'){ bill.paid=billTotal(bill); state.billPayments.unshift({id:uid('BP'), billId:bill.id, vendorId:bill.vendorId, date:data.date, accountId:'BA-1', amount:bill.paid, memo:'Payment for '+bill.id}); } audit(`Bill ${bill.id} created`); showToast('Bill created and posted.'); break; }
      case 'payBill': { const bill=state.bills.find(b=>b.id===data.billId); const requested=num(data.amount); const applied=bill?accounting.billPaymentApplication(bill)(requested):null; if(bill&&applied.appliedAmount>0){ bill.paid=applied.paid; if(applied.fullyPaid) bill.status='Paid'; state.billPayments.unshift({id:uid('BP'), billId:bill.id, vendorId:bill.vendorId, date:data.date, accountId:data.accountId, amount:applied.appliedAmount, memo:data.memo||('Payment for '+bill.id)}); audit(`Bill ${bill.id} paid: ${money(applied.appliedAmount)}`); showToast(requested>applied.appliedAmount?'Bill payment applied to remaining open balance.':'Bill payment posted.'); } break; }
      case 'deposit': { const deposit=accounting.depositApplication(state.payments, [], data.amount, data.incomeAccountId); if(!deposit.canDeposit){ showToast('Select payments to deposit or enter an additional deposit amount.'); return; } const dep={id:uid('DEP'), date:data.date, accountId:data.accountId, incomeAccountId:deposit.incomeAccountId, clearingAccountId:deposit.clearingAccountId, amount:deposit.total, memo:data.memo, paymentIds:deposit.paymentIds, linkedPaymentTotal:deposit.linkedPaymentTotal, additionalAmount:deposit.additionalAmount}; state.deposits.unshift(dep); audit(`Deposit ${dep.id} posted: ${money(dep.amount)}`); showToast('Deposit added and posted.'); break; }
      case 'bankTx': { const tx={id:uid('BFT'), date:data.date, description:data.description, amount:num(data.amount), bankAccountId:data.bankAccountId, status:data.status, suggestedAccountId:data.suggestedAccountId, matchType:'Expense category', linkedId:null, posted:data.status==='Reviewed', cleared:false, note:data.note}; state.bankTransactions.unshift(tx); audit(`Bank transaction ${tx.id} added: ${money(tx.amount)}`); showToast('Bank transaction added to review center.'); break; }
      case 'reconcile': { const bank=state.bankAccounts.find(b=>b.id===data.accountId) || state.bankAccounts[0]; const book=normalBalance(bank.accountId); const cleared=state.bankTransactions.filter(tx=>tx.bankAccountId===bank.id && tx.cleared).reduce((s,tx)=>s+num(tx.amount),0); const rec={id:uid('REC'), accountId:bank.id, statementDate:data.statementDate, endingBalance:num(data.endingBalance), clearedTotal:cleared, difference:num(data.endingBalance)-book, status:data.status, notes:data.notes}; state.reconciliations.unshift(rec); audit(`Reconciliation ${rec.id} saved for ${bank.name}; difference ${money(rec.difference)}`); showToast('Reconciliation saved.'); break; }
      case 'transfer': { if(data.fromAccountId===data.toAccountId){ showToast('Transfer requires two different accounts.'); return; } const tr={id:uid('TRF'), date:data.date, fromAccountId:data.fromAccountId, toAccountId:data.toAccountId, amount:num(data.amount), memo:data.memo}; state.transfers.unshift(tr); audit(`Transfer ${tr.id} posted: ${money(tr.amount)}`); showToast('Transfer posted.'); break; }
      case 'product': state.products.unshift({id:uid('P'), name:data.name, type:data.type, price:num(data.price), incomeAccountId:data.incomeAccountId, qty:num(data.qty)}); audit(`Product/service added: ${data.name}`); showToast('Product/service added.'); break;
      case 'payment': { const inv=state.invoices.find(i=>i.id===data.invoiceId); const requested=data.amount && num(data.amount)>0?num(data.amount):(inv?openAmount(inv):0); const applied=inv?accounting.invoicePaymentApplication(inv)(requested):null; if(inv && applied.appliedAmount>0){ inv.paid=applied.paid; if(applied.fullyPaid) inv.status='Paid'; state.payments.unshift({id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:data.date, accountId:data.accountId, amount:applied.appliedAmount, memo:'Payment for '+inv.id}); audit(`Payment received for ${inv.id}: ${money(applied.appliedAmount)}`); showToast(requested>applied.appliedAmount?'Payment applied to remaining invoice balance.':'Payment received and posted.'); } break; }
      case 'estimate': state.estimates.unshift({id:uid('EST'), customerId:data.customerId, date:data.date, status:data.status, total:num(data.total)}); audit('Estimate created'); showToast('Estimate created.'); break;
      case 'time': state.timeEntries.unshift({id:uid('T'), employee:data.employee, customerId:data.customerId, date:data.date, hours:num(data.hours), billable:f.has('billable')}); audit('Time entry added'); showToast('Time entry added.'); break;
      case 'project': state.projects.unshift({id:uid('PRJ'), name:data.name, customerId:data.customerId, budget:num(data.budget), actualCost:0, revenue:0, status:data.status}); audit(`Project created: ${data.name}`); showToast('Project created.'); break;
      case 'company': state.company = {...state.company, name:data.name, province:data.province, fiscalYear:data.fiscalYear, salesTax:num(data.salesTax), accountingMethod:data.accountingMethod}; audit('Company settings updated'); showToast('Company settings updated.'); break;
      case 'customize': { const modules = Array.from(document.querySelectorAll('input[name="module"]:checked')).map(i=>i.value); state.settings.visibleModules = modules.length?modules:menuModules.map(m=>m.id); audit('Menu customized'); showToast('Menu customized.'); break; }
      case 'journal': { const debit=num(data.debitAmount), credit=num(data.creditAmount); if(Math.abs(debit-credit)>0.01){ showToast('Journal entry is not balanced. Debit must equal credit.'); return; } const je={id:uid('JE'), date:data.date, memo:data.memo, status:data.status, lines:[{accountId:data.debitAccountId, debit, credit:0},{accountId:data.creditAccountId, debit:0, credit}]}; state.journalEntries.unshift(je); audit(`Journal entry ${je.id} ${data.status}`); showToast('Journal entry saved.'); break; }
      case 'account': { const code=String(data.code).trim(); if(state.chartOfAccounts.some(a=>a.code===code)){ showToast('Account code already exists.'); return; } const acct={id:code, code, name:data.name, type:data.type, normal:data.normal, detail:data.detail}; state.chartOfAccounts.push(acct); state.chartOfAccounts.sort((a,b)=>String(a.code).localeCompare(String(b.code))); audit(`Account added: ${code} ${data.name}`); showToast('Account added.'); break; }
      default: showToast('Placeholder action acknowledged.'); break;
    }
    saveState(); closeModal(); renderAll();
  }
  function reviewBankTransaction(id){
    const tx=state.bankTransactions.find(x=>x.id===id); if(!tx) return;
    tx.status='Reviewed'; tx.posted=true; tx.linkedId=null;
    audit(`Bank transaction ${tx.id} reviewed and categorized to ${accountLabel(tx.suggestedAccountId || (tx.amount>=0?'4100':'6000'))}`);
    saveState(); renderAll(); showToast(`${tx.id} reviewed and posted to ledger.`);
  }
  function matchBankTransactionToInvoice(id){
    const tx=state.bankTransactions.find(x=>x.id===id); if(!tx) return;
    const inv=state.invoices.find(i=>i.id===tx.matchedInvoiceId) || state.invoices.find(i=>openAmount(i)>0 && Math.abs(openAmount(i)-Math.abs(num(tx.amount)))<0.01);
    if(!inv){ showToast('No matching open invoice found.'); return; }
    const match=accounting.bankInvoiceMatchApplication(inv, tx);
    if(!match.canMatch){ showToast('Invoice is already closed.'); return; }
    inv.paid=match.paid; inv.status=match.status;
    const pmt={id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:tx.date, accountId:tx.bankAccountId, amount:match.appliedAmount, memo:'Matched bank transaction '+tx.id};
    state.payments.unshift(pmt); tx.status='Matched'; tx.linkedId=pmt.id; tx.posted=false; tx.matchType='Invoice payment';
    audit(`Bank transaction ${tx.id} matched to invoice ${inv.id}`);
    saveState(); renderAll(); showToast(`${tx.id} matched to ${inv.id}.`);
  }
  function matchBankTransactionToBill(id){
    const tx=state.bankTransactions.find(x=>x.id===id); if(!tx) return;
    const bill=state.bills.find(b=>b.id===tx.matchedBillId) || state.bills.find(b=>billOpenAmount(b)>0 && Math.abs(billOpenAmount(b)-Math.abs(num(tx.amount)))<0.01);
    if(!bill){ showToast('No matching open bill found.'); return; }
    const match=accounting.bankBillMatchApplication(bill, tx);
    if(!match.canMatch){ showToast('Bill is already closed.'); return; }
    bill.paid=match.paid; bill.status=match.status;
    const bp={id:uid('BP'), billId:bill.id, vendorId:bill.vendorId, date:tx.date, accountId:tx.bankAccountId, amount:match.appliedAmount, memo:'Matched bank transaction '+tx.id};
    state.billPayments.unshift(bp); tx.status='Matched'; tx.linkedId=bp.id; tx.posted=false; tx.matchType='Bill payment';
    audit(`Bank transaction ${tx.id} matched to bill ${bill.id}`);
    saveState(); renderAll(); showToast(`${tx.id} matched to ${bill.id}.`);
  }
  function toggleBankCleared(id){
    const tx=state.bankTransactions.find(x=>x.id===id); if(!tx) return;
    tx.cleared=!tx.cleared; audit(`Bank transaction ${tx.id} marked ${tx.cleared?'cleared':'uncleared'}`);
    saveState(); renderAll(); showToast(`${tx.id} ${tx.cleared?'cleared':'uncleared'} for reconciliation.`);
  }
  function exportData(){ if(window.SmartBooksPersistence){ window.SmartBooksPersistence.downloadJson(state, 'smartbooks-company-data.json'); showToast('Backup export started.'); return; } const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-company-data.json'; a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0); showToast('Backup export started.'); }
  function applySearch(query){ query = query.trim().toLowerCase(); if(!query) return; const matchCustomer = state.customers.find(c=>c.name.toLowerCase().includes(query) || c.company.toLowerCase().includes(query)); const matchInvoice = state.invoices.find(i=>i.id.toLowerCase().includes(query)); const matchVendor = state.vendors.find(v=>v.name.toLowerCase().includes(query)); const matchAccount = state.chartOfAccounts.find(a=>a.name.toLowerCase().includes(query)||a.code.includes(query)); const matchBankTx = state.bankTransactions.find(tx=>tx.id.toLowerCase().includes(query)||tx.description.toLowerCase().includes(query)); if(matchBankTx) { navigate('banking'); showToast('Found bank transaction '+matchBankTx.id); } else if(matchInvoice) { navigate('sales'); showToast('Found invoice '+matchInvoice.id); } else if(matchCustomer) { navigate('customers'); showToast('Found customer '+matchCustomer.name); } else if(matchVendor) { navigate('vendors'); showToast('Found vendor '+matchVendor.name); } else if(matchAccount) { navigate('accounting'); showToast('Found account '+matchAccount.code); } }
  function filterNearestTable(input){ const q=input.value.toLowerCase(); const card=input.closest('.table-card') || input.closest('.card'); const rows=card?.querySelectorAll('tbody tr') || []; rows.forEach(r=>{ r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; }); }



