// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

  // ---------- V4 overrides and feature expansion ----------
  function ensureV4State(){
    state.company.name = state.company.name.replace('V3','V4');
    state.settings ||= {};
    state.settings.visibleModules ||= menuModules.map(m=>m.id);
    state.settings.dashboardWidgets ||= ['feed','funnel','pl','expenses','recent','bank','cashflow','setup'];
    state.settings.privacyMode ||= false;
    state.settings.salesTab ||= 'overview';
    state.setupTasks ||= [
      {id:'business', group:'Business basics', title:'Confirm company profile and fiscal year', done:true, hidden:false, nav:'settings'},
      {id:'sales', group:'Sales & Get Paid', title:'Create first invoice or payment link', done:false, hidden:false, nav:'sales'},
      {id:'banking', group:'Accounting', title:'Review and categorize imported bank transactions', done:false, hidden:false, nav:'banking'},
      {id:'tax', group:'Accounting', title:'Confirm GST/HST sales tax tracking', done:true, hidden:false, nav:'taxes'},
      {id:'coa', group:'Accounting', title:'Review chart of accounts and trial balance', done:true, hidden:false, nav:'accounting'},
      {id:'widgets', group:'Personalize', title:'Customize dashboard widgets and privacy mode', done:false, hidden:false, nav:'dashboard'}
    ];
    state.paymentLinks ||= [
      {id:'PAYLINK-1001', customerId:'C-1004', date:'2026-05-18', dueDate:'2026-06-02', amount:2730, description:'EL Sports implementation payment request', status:'Sent'},
      {id:'PAYLINK-1002', customerId:'C-1005', date:'2026-05-20', dueDate:'2026-06-19', amount:3400, description:'Accepted estimate deposit request', status:'Draft'}
    ];
    state.recurringTransactions ||= [
      {id:'RECINV-1001', type:'Recurring invoice', customerId:'C-1002', amount:1890, frequency:'Monthly', nextDate:'2026-06-08', mode:'Reminder only', status:'Active'},
      {id:'RECEXP-1001', type:'Recurring expense', customerId:'V-2002', amount:516.76, frequency:'Monthly', nextDate:'2026-06-07', mode:'Auto-create draft', status:'Active'}
    ];
    state.salesOrders ||= [
      {id:'SO-1001', customerId:'C-1001', date:'2026-05-17', shipDate:'2026-06-03', status:'Open', total:4200, channel:'Direct sales'},
      {id:'SO-1002', customerId:'C-1004', date:'2026-05-22', shipDate:'2026-06-10', status:'Pending approval', total:1850, channel:'Web inquiry'}
    ];
    state.payouts ||= [
      {id:'POUT-1001', processor:'Stripe', date:'2026-05-24', gross:2730, fees:79.17, net:2650.83, status:'In transit'},
      {id:'POUT-1002', processor:'Bank transfer', date:'2026-05-13', gross:1890, fees:0, net:1890, status:'Deposited'}
    ];
    state.salesChannels ||= [
      {id:'CH-1', name:'Direct sales', status:'Connected', orders:8, revenue:11280},
      {id:'CH-2', name:'Website payment links', status:'Demo only', orders:2, revenue:6130},
      {id:'CH-3', name:'Marketplace / Shopify', status:'Planned', orders:0, revenue:0}
    ];
    state.purchaseOrders ||= [];
  }

  const v4MenuIds = ['dashboard','setup','apps','banking','transactions','accounting','sales','customers','expenses','vendors','reports','inventory','projects','time','payroll','taxes','settings'];
  state.settings.visibleModules = (state.settings.visibleModules || []).filter(Boolean);
  // Menu customization persistence: do not force optional Setup or My Apps back into the menu after the user hides them.

  const originalRenderMenu = renderMenu;
  renderMenu = function(){
    const list = document.getElementById('menuList');
    const visible = new Set(state.settings.visibleModules || v4MenuIds);
    const v4Modules = [
      {id:'dashboard', label:'Dashboards', icon:'â–¦'}, {id:'setup', label:'Setup Checklist', icon:'âœ“'}, {id:'apps', label:'My Apps', icon:'â–©'},
      {id:'banking', label:'Banking', icon:'â—‰'}, {id:'transactions', label:'Transactions', icon:'â‡„'}, {id:'accounting', label:'Accounting', icon:'â–¤'},
      {id:'sales', label:'Sales & Get Paid', icon:'â†—'}, {id:'customers', label:'Customers & Leads', icon:'â˜˜'}, {id:'expenses', label:'Expenses', icon:'â–¸'}, {id:'vendors', label:'Vendors', icon:'â–¡'},
      {id:'reports', label:'Reports', icon:'â˜·'}, {id:'inventory', label:'Inventory', icon:'â—¼'}, {id:'projects', label:'Projects', icon:'â—†'},
      {id:'time', label:'Time', icon:'â—·'}, {id:'payroll', label:'Payroll & HR', icon:'â™¢'}, {id:'taxes', label:'Taxes', icon:'â—–'}, {id:'settings', label:'Settings', icon:'âš™'}
    ];
    list.innerHTML = v4Modules.filter(m=>visible.has(m.id)).map(m=>`<button class="nav-item ${currentPage===m.id?'active':''}" data-nav="${m.id}"><span class="dot">${m.icon}</span>${escapeHTML(m.label)}<span class="nav-chevron">â€º</span></button>`).join('');
  };

  const originalRenderModulePills = renderModulePills;
  renderModulePills = function(){
    const mods = [
      {label:'Accounting', icon:'â–¤', nav:'accounting'}, {label:'Expenses', icon:'â–¸', nav:'expenses'}, {label:'Sales', icon:'â†—', nav:'sales'},
      {label:'Customers', icon:'âœ¿', nav:'customers'}, {label:'Setup', icon:'âœ“', nav:'setup'}, {label:'Banking', icon:'â—‰', nav:'banking'},
      {label:'Time', icon:'â—·', nav:'time'}, {label:'Projects', icon:'â—†', nav:'projects'}, {label:'Inventory', icon:'â—¼', nav:'inventory'}, {label:'Taxes', icon:'â—–', nav:'taxes'}
    ];
    document.getElementById('modulePills').innerHTML = mods.map(m=>`<button class="module-pill" data-nav="${m.nav}"><span class="module-icon">${m.icon}</span>${m.label}</button>`).join('');
    const hr = new Date().getHours(); const part = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening'; document.getElementById('greeting').textContent = `Good ${part}, Quak!`;
  };

  const originalRenderAll = renderAll;
  renderAll = function(){ ensureV4State(); document.body.classList.toggle('privacy-mode', !!state.settings.privacyMode); originalRenderAll(); applyDashboardPrefs(); };

  const originalRenderPage = renderPage;
  renderPage = function(page){
    ensureV4State();
    if(page==='setup'){ renderSetupPage(); renderMenu(); return; }
    originalRenderPage(page); applyDashboardPrefs();
  };

  const originalRenderDashboard = renderDashboard;
  renderDashboard = function(){ ensureV4State(); originalRenderDashboard(); applyDashboardPrefs(); };

  function dashboardWidgetLabels(){ return {feed:'Business feed / smart suggestions', funnel:'Sales & Get Paid funnel', pl:'Profit & loss', expenses:'Expense summary', recent:'Recent transactions', bank:'Bank accounts', cashflow:'Cash flow', setup:'Setup Checklist'}; }
  function applyDashboardPrefs(){
    document.body.classList.toggle('privacy-mode', !!state.settings.privacyMode);
    const visible = new Set(state.settings.dashboardWidgets || Object.keys(dashboardWidgetLabels()));
    const map = {feed:document.getElementById('businessFeed'), funnel:document.getElementById('funnelCards')?.closest('.card'), pl:document.getElementById('plCard'), expenses:document.getElementById('expensesCard'), recent:document.getElementById('recentTransactions'), bank:document.getElementById('bankCard'), cashflow:document.getElementById('cashFlowCard'), setup:document.getElementById('setupCard')};
    Object.entries(map).forEach(([k,el])=>{ if(el) el.style.display = visible.has(k) ? '' : 'none'; });
  }

  renderSetupCard = function(){
    ensureV4State();
    const tasks = state.setupTasks.filter(t=>!t.hidden);
    const done = state.setupTasks.filter(t=>t.done).length, total = state.setupTasks.length || 1, pct = Math.round(done/total*100);
    document.getElementById('setupCard').innerHTML = `<h3>Setup Checklist</h3><div class="muted">Letâ€™s lay the groundwork for accounting, sales, banking, and taxes.</div><div class="setup-progress"><span style="width:${pct}%"></span></div><div class="report-line"><span>${done} of ${total} completed</span><strong>${pct}%</strong></div><div class="checklist">${tasks.slice(0,4).map(t=>`<div class="check-row ${t.done?'done':''}"><span class="check-dot">${t.done?'âœ“':'â—‹'}</span><div><strong>${escapeHTML(t.title)}</strong><div class="muted small">${escapeHTML(t.group)}</div></div><button class="btn square" data-action="complete-setup-task" data-id="${t.id}">${t.done?'Undo':'Done'}</button></div>`).join('')}</div><button class="btn primary" data-nav="setup" style="margin-top:14px;width:100%">Open setup checklist</button>`;
  };

  function renderSetupPage(){
    ensureV4State();
    const el=document.getElementById('page-setup');
    const done = state.setupTasks.filter(t=>t.done).length, total = state.setupTasks.length || 1, pct = Math.round(done/total*100);
    const groups = [...new Set(state.setupTasks.map(t=>t.group))];
    el.innerHTML = header('Setup Checklist', 'Guided onboarding for company basics, sales, banking, accounting, taxes, and dashboard personalization.', `<button class="btn" data-modal="customizeDashboard">Customize dashboard</button><button class="btn primary" data-modal="company">Company settings</button>`) +
      `<div class="card" style="margin-bottom:16px"><h3>Progress</h3><div class="setup-progress"><span style="width:${pct}%"></span></div><div class="report-line"><span>${done} of ${total} tasks completed</span><strong>${pct}%</strong></div></div>` +
      groups.map(g=>`<div class="card" style="margin-bottom:16px"><h3>${escapeHTML(g)}</h3><div class="checklist">${state.setupTasks.filter(t=>t.group===g).map(t=>`<div class="check-row ${t.done?'done':''} ${t.hidden?'hidden-task':''}"><span class="check-dot">${t.done?'âœ“':'â—‹'}</span><div><strong>${escapeHTML(t.title)}</strong><div class="muted small">${t.hidden?'Hidden from dashboard':'Visible task'}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn square" data-nav="${t.nav}">Open</button><button class="btn square" data-action="complete-setup-task" data-id="${t.id}">${t.done?'Undo':'Done'}</button><button class="btn square" data-action="hide-setup-task" data-id="${t.id}">${t.hidden?'Show':'Hide'}</button></div></div>`).join('')}</div></div>`).join('');
  }

  const salesTabs = [
    ['overview','Overview'], ['transactions','Sales Transactions'], ['invoices','Invoices'], ['paymentLinks','Payment Links'], ['recurring','Recurring Payments'], ['salesOrders','Sales Orders'], ['salesChannels','Sales Channels'], ['payouts','Payouts'], ['products','Products & Services']
  ];
  function salesTabbar(){ const active=state.settings.salesTab || 'overview'; return `<div class="tabbar">${salesTabs.map(([id,label])=>`<button class="tab-btn ${active===id?'active':''}" data-action="set-sales-tab" data-id="${id}">${label}</button>`).join('')}</div>`; }
  function renderSales(){
    ensureV4State();
    const el=document.getElementById('page-sales');
    const active=state.settings.salesTab || 'overview';
    const t=totals();
    let body='';
    if(active==='overview'){
      body = `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/R</h3><div class="metric">${money(t.ar)}</div><div class="muted small">Unpaid customer invoices</div></div><div class="card"><h3>Overdue</h3><div class="metric">${money(t.overdue)}</div><div class="muted small">Needs follow-up</div></div><div class="card"><h3>Payment Links</h3><div class="metric">${state.paymentLinks.length}</div><div class="muted small">Draft/sent/paid links</div></div><div class="card"><h3>Sales Orders</h3><div class="metric">${state.salesOrders.filter(x=>x.status!=='Closed').length}</div><div class="muted small">Open sales orders</div></div></div>`+
      `<div class="grid three"><div class="card"><h3>Smart suggestions</h3><div class="smart-suggestions"><div class="suggestion"><span>${state.invoices.filter(i=>openAmount(i)>0).length} invoices still have open balances.</span><button class="btn square" data-action="set-sales-tab" data-id="invoices">Review</button></div><div class="suggestion"><span>Create payment links for fast customer collection.</span><button class="btn square" data-modal="paymentLink">Create</button></div><div class="suggestion"><span>Review payout fees before deposits are reconciled.</span><button class="btn square" data-action="set-sales-tab" data-id="payouts">Open</button></div></div></div><div class="card"><h3>Workflow</h3><p class="muted">Estimate â†’ sales order â†’ invoice / payment link â†’ payout â†’ bank reconciliation.</p><button class="btn primary" data-modal="salesOrder">Create sales order</button></div><div class="card"><h3>Recurring revenue</h3><div class="metric">${money(state.recurringTransactions.reduce((s,r)=>s+num(r.amount),0))}</div><div class="muted small">Scheduled recurring invoice/expense templates</div><button class="btn" data-action="set-sales-tab" data-id="recurring" style="margin-top:10px">Review templates</button></div></div>`;
    } else if(active==='transactions'){
      const rows=[...state.invoices.map(i=>({date:i.date,type:'Invoice',ref:i.id,name:getCustomer(i.customerId).name,status:i.status,amount:invoiceTotal(i)})),...state.payments.map(p=>({date:p.date,type:'Payment',ref:p.id,name:getCustomer(p.customerId).name,status:'Received',amount:p.amount})),...state.estimates.map(e=>({date:e.date,type:'Estimate',ref:e.id,name:getCustomer(e.customerId).name,status:e.status,amount:e.total})),...state.salesOrders.map(o=>({date:o.date,type:'Sales order',ref:o.id,name:getCustomer(o.customerId).name,status:o.status,amount:o.total})),...state.paymentLinks.map(l=>({date:l.date,type:'Payment link',ref:l.id,name:getCustomer(l.customerId).name,status:l.status,amount:l.amount}))].sort((a,b)=>b.date.localeCompare(a.date));
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Sales Transactions</h3><div class="muted small">Invoices, payments, estimates, payment links, and sales orders in one view.</div></div><input class="table-search" data-filter-table placeholder="Search sales"></div>${table(['Date','Type','Reference','Customer','Status','Amount'], rows.map(r=>[r.date,r.type,`<strong>${r.ref}</strong>`,escapeHTML(r.name),tagForStatus(r.status),`<span class="amount">${money(r.amount)}</span>`]))}</div>`;
    } else if(active==='invoices'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Invoices</h3><div class="muted small">Invoices post debit A/R and credit revenue/sales tax.</div></div><input class="table-search" data-filter-table placeholder="Search invoices" /></div>${table(['Invoice','Customer','Date','Due','Status','Income Account','Total','Open balance','Action'], state.invoices.map(i=>[`<strong>${i.id}</strong>`,escapeHTML(getCustomer(i.customerId).name),i.date,i.dueDate,tagForStatus(i.status),escapeHTML(accountLabel(i.incomeAccountId||'4000')),`<span class="amount">${money(invoiceTotal(i))}</span>`,`<span class="amount">${money(openAmount(i))}</span>`, openAmount(i)<=0.01?'<span class="muted">Closed</span>':`<button class="btn square" data-action="mark-paid" data-id="${i.id}">Receive</button>`]))}</div>`;
    } else if(active==='paymentLinks'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Payment Links</h3><div class="muted small">Demo links that can be sent to customers for fast collection.</div></div><button class="btn primary" data-modal="paymentLink">Create payment link</button></div>${table(['Link','Customer','Date','Due','Description','Status','Amount'], state.paymentLinks.map(l=>[`<strong>${l.id}</strong>`,escapeHTML(getCustomer(l.customerId).name),l.date,l.dueDate,escapeHTML(l.description),tagForStatus(l.status),`<span class="amount">${money(l.amount)}</span>`]))}</div>`;
    } else if(active==='recurring'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Recurring Payments</h3><div class="muted small">Templates for recurring invoices, payments, expenses, and bills.</div></div><button class="btn primary" data-modal="recurringPayment">New recurring template</button></div>${table(['Template','Type','Customer/Vendor','Frequency','Next date','Mode','Status','Amount'], state.recurringTransactions.map(r=>[`<strong>${r.id}</strong>`,escapeHTML(r.type),escapeHTML(getCustomer(r.customerId).name || getVendor(r.customerId).name),escapeHTML(r.frequency),r.nextDate,escapeHTML(r.mode),tagForStatus(r.status),`<span class="amount">${money(r.amount)}</span>`]))}</div>`;
    } else if(active==='salesOrders'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Sales Orders</h3><div class="muted small">Non-posting order commitments before invoicing or fulfillment.</div></div><button class="btn primary" data-modal="salesOrder">Create sales order</button></div>${table(['Order','Customer','Date','Ship date','Channel','Status','Total'], state.salesOrders.map(o=>[`<strong>${o.id}</strong>`,escapeHTML(getCustomer(o.customerId).name),o.date,o.shipDate,escapeHTML(o.channel),tagForStatus(o.status),`<span class="amount">${money(o.total)}</span>`]))}</div>`;
    } else if(active==='salesChannels'){
      body = `<div class="grid three">${state.salesChannels.map(ch=>`<div class="card"><h3>${escapeHTML(ch.name)}</h3><div class="report-line"><span>Status</span>${tagForStatus(ch.status)}</div><div class="report-line"><span>Orders</span><strong>${ch.orders}</strong></div><div class="report-line"><span>Revenue</span><strong class="amount">${money(ch.revenue)}</strong></div><button class="btn" style="margin-top:10px">Configure</button></div>`).join('')}</div>`;
    } else if(active==='payouts'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Payouts</h3><div class="muted small">Payment processor payouts and fees before bank matching.</div></div></div>${table(['Payout','Processor','Date','Gross','Fees','Net','Status'], state.payouts.map(p=>[`<strong>${p.id}</strong>`,escapeHTML(p.processor),p.date,`<span class="amount">${money(p.gross)}</span>`,`<span class="amount">${money(p.fees)}</span>`,`<span class="amount">${money(p.net)}</span>`,tagForStatus(p.status)]))}</div>`;
    } else if(active==='products'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Products & Services</h3><div class="muted small">Items available for invoices, sales receipts, and sales orders.</div></div><button class="btn primary" data-modal="product">Add product/service</button></div>${table(['Product / Service','Type','Price','Income Account','Qty on hand'], state.products.map(p=>[`<strong>${escapeHTML(p.name)}</strong>`,p.type,money(p.price),escapeHTML(accountLabel(p.incomeAccountId||'4000')),num(p.qty)]))}</div>`;
    }
    el.innerHTML = header('Sales & Get Paid', 'Manage sales transactions, invoices, payment links, recurring payments, sales orders, channels, payouts, and products.', `<button class="btn" data-modal="payment">Receive payment</button><button class="btn" data-modal="paymentLink">Payment link</button><button class="btn" data-modal="salesOrder">Sales order</button><button class="btn primary" data-modal="invoice">Create invoice</button>`) + salesTabbar() + body;
  }

  renderApps = function(){
    const el=document.getElementById('page-apps');
    const apps = [
      ['Accounting','â–¤','Chart of accounts, journal entries, trial balance, audit trail.','accounting'],
      ['Expenses & Pay Bills','â–¸','Expenses, bills, vendor payments, and A/P workflow.','expenses'],
      ['Sales & Get Paid','â†—','Invoices, payment links, recurring payments, sales orders, channels, payouts.','sales'],
      ['Customer Hub','â˜˜','Customer records, open balances, estimates, and invoices.','customers'],
      ['Banking','â—‰','Bank feed review, matching, categorization, and reconciliation.','banking'],
      ['Reports','â˜·','Profit & Loss, Balance Sheet, Trial Balance, A/R and A/P aging.','reports'],
      ['Inventory','â—¼','Products, services, quantity, and income accounts.','inventory'],
      ['Time','â—·','Billable time entries by team member and customer.','time'],
      ['Projects','â—†','Project budgets, actual costs, revenue, and profitability.','projects'],
      ['Taxes','â—–','GST/HST collected, ITCs, and net payable.','taxes'],
      ['Setup Checklist','âœ“','Guided setup for company, sales, banking, taxes, and dashboard.','setup'],
      ['Settings','âš™','Company profile, menu customization, dashboard controls, and data export.','settings']
    ];
    el.innerHTML = header('My Apps', 'Launch core SmartBooks modules from one QuickBooks-style app center.', `<button class="btn" data-modal="customize">Customize app menus</button>`) + `<div class="app-grid">${apps.map(a=>`<div class="app-tile"><span class="tile-icon">${a[1]}</span><h3>${a[0]}</h3><p class="muted">${a[2]}</p><button class="btn" data-nav="${a[3]}">Open</button></div>`).join('')}</div>`;
  };

  renderSettings = function(){
    const el=document.getElementById('page-settings');
    el.innerHTML = header('Settings', 'Company profile, tax rate, accounting method, menu customization, dashboard controls, and local data controls.', `<button class="btn" data-modal="customizeDashboard">Customize dashboard</button><button class="btn" data-modal="customize">Customize menu</button><button class="btn primary" data-modal="company">Company settings</button>`) +
      `<div class="grid two"><div class="card"><h3>Company</h3><div class="report-line"><span>Name</span><strong>${escapeHTML(state.company.name)}</strong></div><div class="report-line"><span>Province</span><strong>${escapeHTML(state.company.province)}</strong></div><div class="report-line"><span>Fiscal year</span><strong>${escapeHTML(state.company.fiscalYear)}</strong></div><div class="report-line"><span>Sales tax</span><strong>${state.company.salesTax}%</strong></div><div class="report-line"><span>Method</span><strong>${escapeHTML(state.company.accountingMethod||'Accrual')}</strong></div></div><div class="card"><h3>Dashboard & UX</h3><div class="report-line"><span>Privacy mode</span><strong>${state.settings.privacyMode?'On':'Off'}</strong></div><div class="report-line"><span>Visible dashboard widgets</span><strong>${(state.settings.dashboardWidgets||[]).length}</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" data-action="toggle-privacy">Toggle privacy</button><button class="btn" data-modal="customizeDashboard">Customize widgets</button></div></div></div>`+
      `<div class="grid two" style="margin-top:16px"><div class="card"><h3>Data</h3><p class="muted">Your company data is stored in this browser using localStorage. Export JSON before clearing browser data.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="exportData2">Export JSON</button><button class="btn danger" id="resetDemo2">Reset company data</button></div></div><div class="card"><h3>Workspace coverage</h3><p class="muted">Includes setup checklist, expanded + New menu, app launcher, Sales & Get Paid workflow, payment links, recurring templates, sales orders, sales channels, payouts, and dashboard customization.</p></div></div>`;
    document.getElementById('exportData2').addEventListener('click', exportData); document.getElementById('resetDemo2').addEventListener('click', resetState);
  };

  const v3HandleAction = handleAction;
  handleAction = function(action,id){
    if(action==='set-sales-tab'){ state.settings.salesTab = id || 'overview'; saveState(); renderSales(); return; }
    if(action==='toggle-privacy'){ state.settings.privacyMode = !state.settings.privacyMode; saveState(); document.body.classList.toggle('privacy-mode', state.settings.privacyMode); showToast(`Privacy mode ${state.settings.privacyMode?'on':'off'}.`); renderAll(); return; }
    if(action==='complete-setup-task'){ const t=state.setupTasks.find(x=>x.id===id); if(t){ t.done=!t.done; audit(`Setup task ${t.title} marked ${t.done?'done':'not done'}`); saveState(); renderAll(); if(currentPage==='setup') renderSetupPage(); showToast(t.done?'Setup task completed.':'Setup task reopened.'); } return; }
    if(action==='hide-setup-task'){ const t=state.setupTasks.find(x=>x.id===id); if(t){ t.hidden=!t.hidden; audit(`Setup task ${t.title} ${t.hidden?'hidden':'shown'}`); saveState(); renderAll(); if(currentPage==='setup') renderSetupPage(); showToast(t.hidden?'Task hidden.':'Task shown.'); } return; }
    v3HandleAction(action,id);
  };

  const v3OpenModal = openModal;
  openModal = function(type){
    v3OpenModal(type);
    const labels = {
      customizeDashboard:['Customize dashboard','Choose dashboard widgets and turn privacy mode on or off.'],
      paymentLink:['Create payment link','Create a demo customer payment request link.'],
      recurringPayment:['Recurring payment template','Set up a recurring invoice, payment, bill, or expense template.'],
      salesOrder:['Create sales order','Create a non-posting customer order before invoicing.'],
      salesReceipt:['Create sales receipt','Record a paid sale and deposit it to a bank account.']
    };
    if(labels[type]){ document.getElementById('modalTitle').textContent = labels[type][0]; document.getElementById('modalSubtitle').textContent = labels[type][1]; }
  };

  const v3ModalBodyContent = modalBodyContent;
  modalBodyContent = function(type){
    if(type==='customizeDashboard'){
      const labels = dashboardWidgetLabels(); const visible = new Set(state.settings.dashboardWidgets || Object.keys(labels));
      return `<p class="muted">Choose which dashboard widgets are visible. Privacy mode masks financial amounts on the screen.</p><div class="widget-list">${Object.entries(labels).map(([id,label])=>`<label class="widget-option"><input type="checkbox" name="widget" value="${id}" ${visible.has(id)?'checked':''}> ${escapeHTML(label)}</label>`).join('')}</div><label class="card" style="display:flex;align-items:center;gap:12px;margin-top:14px;padding:12px"><input type="checkbox" name="privacyMode" ${state.settings.privacyMode?'checked':''}> <strong>Privacy mode: hide dollar values on dashboard</strong></label>`;
    }
    if(type==='paymentLink') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(14)}"></div><div class="field"><label>Amount</label><input type="number" step="0.01" min="0" name="amount" value="500"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option>Sent</option><option>Paid</option><option>Expired</option></select></div><div class="field full"><label>Description</label><input name="description" value="Customer payment request"></div></div>`;
    if(type==='recurringPayment') return `<div class="form-grid"><div class="field"><label>Template type</label><select name="type"><option>Recurring invoice</option><option>Recurring payment</option><option>Recurring expense</option><option>Recurring bill</option></select></div><div class="field"><label>Customer / vendor</label><select name="customerId">${customerOptions()}${vendorOptions()}</select></div><div class="field"><label>Amount</label><input type="number" step="0.01" min="0" name="amount" value="750"></div><div class="field"><label>Frequency</label><select name="frequency"><option>Weekly</option><option selected>Monthly</option><option>Quarterly</option><option>Yearly</option></select></div><div class="field"><label>Next date</label><input type="date" name="nextDate" value="${addDaysISO(30)}"></div><div class="field"><label>Mode</label><select name="mode"><option>Reminder only</option><option>Auto-create draft</option></select></div><div class="field"><label>Status</label><select name="status"><option>Active</option><option>Paused</option></select></div></div>`;
    if(type==='salesOrder') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Ship date</label><input type="date" name="shipDate" value="${addDaysISO(10)}"></div><div class="field"><label>Channel</label><select name="channel"><option>Direct sales</option><option>Website payment links</option><option>Marketplace / Shopify</option></select></div><div class="field"><label>Status</label><select name="status"><option>Open</option><option>Pending approval</option><option>Closed</option></select></div><div class="field"><label>Total</label><input type="number" step="0.01" min="0" name="total" value="1000"></div></div>`;
    if(type==='salesReceipt') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field full"><label>Product / service</label><select id="invoiceProduct" name="productId">${productOptions()}</select></div><div class="field full"><label>Description</label><input id="invoiceDesc" name="desc" value="Sales receipt item"></div><div class="field"><label>Qty</label><input id="invoiceQty" type="number" step="0.01" min="0" name="qty" value="1"></div><div class="field"><label>Rate</label><input id="invoiceRate" type="number" step="0.01" min="0" name="rate" value="125"></div><div class="field"><label>Sales tax %</label><input id="invoiceTax" type="number" step="0.01" min="0" name="taxRate" value="${state.company.salesTax}"></div><div class="field"><label>Deposit to</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Income account</label><select id="invoiceIncome" name="incomeAccountId">${accountOptions(['Income'])}</select></div></div><div class="inline-total"><span>Sales receipt total</span><span id="invoiceTotalPreview">$0.00</span></div>`;
    return v3ModalBodyContent(type);
  };

  const v3SubmitModal = submitModal;
  submitModal = function(e){
    if(['customizeDashboard','paymentLink','recurringPayment','salesOrder','salesReceipt'].includes(currentModal)){
      e.preventDefault(); const f = new FormData(e.target); const data = Object.fromEntries(f.entries());
      switch(currentModal){
        case 'customizeDashboard': { const widgets = Array.from(document.querySelectorAll('input[name="widget"]:checked')).map(i=>i.value); state.settings.dashboardWidgets = widgets.length?widgets:Object.keys(dashboardWidgetLabels()); state.settings.privacyMode = f.has('privacyMode'); audit('Dashboard widgets customized'); showToast('Dashboard customized.'); break; }
        case 'paymentLink': { state.paymentLinks.unshift({id:uid('PAYLINK'), customerId:data.customerId, date:data.date, dueDate:data.dueDate, amount:num(data.amount), description:data.description, status:data.status}); audit(`Payment link created for ${money(data.amount)}`); showToast('Payment link created.'); state.settings.salesTab='paymentLinks'; break; }
        case 'recurringPayment': { state.recurringTransactions.unshift({id:uid('REC'), type:data.type, customerId:data.customerId, amount:num(data.amount), frequency:data.frequency, nextDate:data.nextDate, mode:data.mode, status:data.status}); audit(`Recurring template created: ${data.type}`); showToast('Recurring template created.'); state.settings.salesTab='recurring'; break; }
        case 'salesOrder': { state.salesOrders.unshift({id:uid('SO'), customerId:data.customerId, date:data.date, shipDate:data.shipDate, status:data.status, total:num(data.total), channel:data.channel}); audit(`Sales order created for ${money(data.total)}`); showToast('Sales order created.'); state.settings.salesTab='salesOrders'; break; }
        case 'salesReceipt': { const subtotal=num(data.qty)*num(data.rate); const tax=subtotal*num(data.taxRate)/100; const total=subtotal+tax; const inv={id:uid('INV'), customerId:data.customerId, date:data.date, dueDate:data.date, status:'Paid', subtotal, tax, paid:total, incomeAccountId:data.incomeAccountId, items:[{desc:data.desc, qty:num(data.qty), rate:num(data.rate)}]}; state.invoices.unshift(inv); state.payments.unshift({id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:data.date, accountId:data.accountId, amount:total, memo:'Sales receipt for '+inv.id}); audit(`Sales receipt posted as paid invoice ${inv.id}`); showToast('Sales receipt posted.'); state.settings.salesTab='transactions'; break; }
      }
      saveState(); closeModal(); renderAll(); return;
    }
    return v3SubmitModal(e);
  };

  const v3ResetState = resetState;
  resetState = function(){ state = structuredClone(initialState); ensureV4State(); saveState(); renderAll(); showToast('Company data reset.'); };


  // ---------- V5 Tax Center and compliance workflow ----------
  function ensureV5State(){
    ensureV4State();
    state.company.name = (state.company.name || 'Your Company').replace(/V[34]/g,'V5');
    state.settings ||= {};
    state.settings.taxTab ||= 'returns';
    state.taxAgencies ||= [
      {id:'TA-CRA-GST', name:'Canada Revenue Agency - GST/HST', filingFrequency:'Quarterly', startMonth:'January', startDate:'2026-01-01', reportingMethod:'Accrual', active:true},
      {id:'TA-BC-PST', name:'BC Ministry of Finance - PST', filingFrequency:'Monthly', startMonth:'January', startDate:'2026-01-01', reportingMethod:'Accrual', active:true}
    ];
    state.taxCodes ||= [
      {id:'GST5', code:'GST 5%', agencyId:'TA-CRA-GST', rate:5, type:'Taxable', appliesTo:'Sales and purchases', recoverable:true, active:true},
      {id:'HST13', code:'HST 13%', agencyId:'TA-CRA-GST', rate:13, type:'Taxable', appliesTo:'Sales and purchases', recoverable:true, active:true},
      {id:'PST7', code:'PST 7%', agencyId:'TA-BC-PST', rate:7, type:'Taxable', appliesTo:'Sales only / non-recoverable purchases', recoverable:false, active:true},
      {id:'ZERO', code:'Zero-rated', agencyId:'TA-CRA-GST', rate:0, type:'Zero-rated', appliesTo:'Sales and purchases', recoverable:false, active:true},
      {id:'EXEMPT', code:'Exempt', agencyId:'TA-CRA-GST', rate:0, type:'Exempt', appliesTo:'Sales and purchases', recoverable:false, active:true},
      {id:'OUT', code:'Out of scope', agencyId:'TA-CRA-GST', rate:0, type:'Out of scope', appliesTo:'Sales and purchases', recoverable:false, active:true}
    ];
    state.taxReturns ||= [
      {id:'TAXRET-2026-Q1-GST', agencyId:'TA-CRA-GST', startDate:'2026-01-01', endDate:'2026-03-31', fileDate:'', status:'Open', notes:'Next GST/HST return to prepare'},
      {id:'TAXRET-2025-Q4-GST', agencyId:'TA-CRA-GST', startDate:'2025-10-01', endDate:'2025-12-31', fileDate:'2026-01-28', status:'Filed and paid', notes:'Demo historical return'}
    ];
    state.taxPayments ||= [
      {id:'TAXPAY-1001', agencyId:'TA-CRA-GST', returnId:'TAXRET-2025-Q4-GST', date:'2026-01-28', accountId:'BA-1', amount:980.00, memo:'Demo prior GST/HST remittance'}
    ];
    state.taxAdjustments ||= [
      {id:'TAXADJ-1001', agencyId:'TA-CRA-GST', date:'2026-05-01', amount:0, reason:'Opening demo adjustment', accountId:'6600'}
    ];
    const neededAccounts = [
      {id:'2220', code:'2220', name:'Sales Tax Suspense / Clearing', type:'Liability', normal:'Credit', detail:'Sales Tax'},
      {id:'6600', code:'6600', name:'Tax Adjustments Expense', type:'Expense', normal:'Debit', detail:'Operating Expense'}
    ];
    neededAccounts.forEach(a=>{ if(!state.chartOfAccounts.some(x=>x.id===a.id)) state.chartOfAccounts.push(a); });
    state.chartOfAccounts.sort((a,b)=>String(a.code).localeCompare(String(b.code)));
    state.invoices.forEach(inv=>{
      inv.taxCodeId ||= num(inv.tax)>0 ? 'GST5' : 'ZERO';
      inv.taxAgencyId ||= getTaxCode(inv.taxCodeId).agencyId;
      inv.taxRate ||= getTaxCode(inv.taxCodeId).rate;
      inv.items ||= [{desc:'Imported line item', qty:1, rate:num(inv.subtotal), taxCodeId:inv.taxCodeId, taxAmount:num(inv.tax)}];
      inv.items.forEach(line=>{ line.taxCodeId ||= inv.taxCodeId; line.taxAmount = num(line.taxAmount || inv.tax); });
    });
    state.expenses.forEach(exp=>{
      exp.taxCodeId ||= num(exp.tax)>0 ? 'GST5' : 'ZERO';
      exp.taxAgencyId ||= getTaxCode(exp.taxCodeId).agencyId;
      exp.taxRate ||= getTaxCode(exp.taxCodeId).rate;
      exp.rawTax ??= num(exp.tax);
      exp.nonRecoverableTax ||= 0;
    });
    state.bills.forEach(bill=>{
      bill.taxCodeId ||= num(bill.tax)>0 ? 'GST5' : 'ZERO';
      bill.taxAgencyId ||= getTaxCode(bill.taxCodeId).agencyId;
      bill.taxRate ||= getTaxCode(bill.taxCodeId).rate;
      bill.rawTax ??= num(bill.tax);
      bill.nonRecoverableTax ||= 0;
    });
    if(!state.setupTasks.some(t=>t.id==='tax-return')) state.setupTasks.push({id:'tax-return', group:'Accounting', title:'Prepare first tax return and review tax exceptions', done:false, hidden:false, nav:'taxes'});
    // Taxes setup data is initialized here, but Taxes remains hideable from menu customization.
  }

  function getTaxAgency(id){ return (state.taxAgencies||[]).find(a=>a.id===id) || {id, name:'Unknown tax agency', filingFrequency:'Monthly', reportingMethod:'Accrual'}; }
  function getTaxCode(id){ return (state.taxCodes||[]).find(c=>c.id===id) || {id:'GST5', code:'GST 5%', agencyId:'TA-CRA-GST', rate:state.company.salesTax||5, recoverable:true, active:true}; }
  function taxAgencyOptions(selected='TA-CRA-GST'){ return (state.taxAgencies||[]).map(a=>`<option value="${a.id}" ${a.id===selected?'selected':''}>${escapeHTML(a.name)}</option>`).join(''); }
  function taxCodeOptions(selected='GST5'){ return (state.taxCodes||[]).filter(c=>c.active!==false).map(c=>`<option value="${c.id}" data-rate="${num(c.rate)}" ${c.id===selected?'selected':''}>${escapeHTML(c.code)} Â· ${num(c.rate)}%</option>`).join(''); }
  function calcTax(base, taxCodeId){ const c=getTaxCode(taxCodeId); return +(num(base)*num(c.rate)/100).toFixed(2); }
  function taxPeriodMatch(date,start,end){ return (!start || date>=start) && (!end || date<=end); }
  function taxableSales(start=null,end=null,agencyId=null){ return state.invoices.filter(i=>taxPeriodMatch(i.date,start,end) && (!agencyId || (i.taxAgencyId||getTaxCode(i.taxCodeId).agencyId)===agencyId)).reduce((s,i)=>s+num(i.tax),0); }
  function recoverablePurchases(start=null,end=null,agencyId=null){ const exp=state.expenses.filter(e=>taxPeriodMatch(e.date,start,end) && (!agencyId || (e.taxAgencyId||getTaxCode(e.taxCodeId).agencyId)===agencyId)).reduce((s,e)=>s+num(e.tax),0); const bills=state.bills.filter(b=>taxPeriodMatch(b.date,start,end) && (!agencyId || (b.taxAgencyId||getTaxCode(b.taxCodeId).agencyId)===agencyId)).reduce((s,b)=>s+num(b.tax),0); return exp+bills; }
  function taxAdjustmentsTotal(start=null,end=null,agencyId=null){ return (state.taxAdjustments||[]).filter(a=>taxPeriodMatch(a.date,start,end) && (!agencyId || a.agencyId===agencyId)).reduce((s,a)=>s+num(a.amount),0); }
  function taxPaymentsTotal(start=null,end=null,agencyId=null,returnId=null){ return (state.taxPayments||[]).filter(p=>taxPeriodMatch(p.date,start,end) && (!agencyId || p.agencyId===agencyId) && (!returnId || p.returnId===returnId)).reduce((s,p)=>s+num(p.amount),0); }
  function taxReturnCalc(ret){ const agencyId=ret.agencyId; const collected=taxableSales(ret.startDate,ret.endDate,agencyId); const itc=recoverablePurchases(ret.startDate,ret.endDate,agencyId); const adjustments=taxAdjustmentsTotal(ret.startDate,ret.endDate,agencyId); const amountDue=collected-itc+adjustments; const payments=taxPaymentsTotal(null,null,agencyId,ret.id); return {collected,itc,adjustments,amountDue,payments,balance:amountDue-payments}; }
  salesTaxSummary = function(){ const collected=taxableSales(), itc=recoverablePurchases(), adjustments=taxAdjustmentsTotal(), payments=taxPaymentsTotal(); return {collected,itc,adjustments,payments,net:collected-itc+adjustments,balance:collected-itc+adjustments-payments}; };
  function taxDetailRows(){
    const rows=[];
    state.invoices.forEach(i=>rows.push({date:i.date,type:'Sales invoice',source:i.id,name:getCustomer(i.customerId).name,agency:getTaxAgency(i.taxAgencyId||getTaxCode(i.taxCodeId).agencyId).name,code:getTaxCode(i.taxCodeId).code,tax:num(i.tax),base:num(i.subtotal),direction:'Collected'}));
    state.expenses.forEach(e=>rows.push({date:e.date,type:'Expense',source:e.id,name:getVendor(e.vendorId).name,agency:getTaxAgency(e.taxAgencyId||getTaxCode(e.taxCodeId).agencyId).name,code:getTaxCode(e.taxCodeId).code,tax:num(e.tax),base:num(e.amount),direction:'ITC'}));
    state.bills.forEach(b=>rows.push({date:b.date,type:'Bill',source:b.id,name:getVendor(b.vendorId).name,agency:getTaxAgency(b.taxAgencyId||getTaxCode(b.taxCodeId).agencyId).name,code:getTaxCode(b.taxCodeId).code,tax:num(b.tax),base:num(b.amount),direction:'ITC'}));
    (state.taxAdjustments||[]).forEach(a=>rows.push({date:a.date,type:'Adjustment',source:a.id,name:a.reason,agency:getTaxAgency(a.agencyId).name,code:'Adjustment',tax:num(a.amount),base:0,direction:num(a.amount)>=0?'Payable adj.':'Credit adj.'}));
    return rows.sort((a,b)=>b.date.localeCompare(a.date));
  }
  function taxExceptions(){
    const ex=[];
    state.invoices.forEach(i=>{ if(!i.taxCodeId) ex.push({date:i.date,type:'Invoice',id:i.id,issue:'Missing tax code',action:'Edit invoice'}); if(num(i.tax)>0 && getTaxCode(i.taxCodeId).rate===0) ex.push({date:i.date,type:'Invoice',id:i.id,issue:'Tax amount exists but code is zero/exempt',action:'Review tax code'}); });
    state.expenses.forEach(e=>{ if(!e.taxCodeId) ex.push({date:e.date,type:'Expense',id:e.id,issue:'Missing purchase tax code',action:'Edit expense'}); });
    state.bills.forEach(b=>{ if(!b.taxCodeId) ex.push({date:b.date,type:'Bill',id:b.id,issue:'Missing bill tax code',action:'Edit bill'}); });
    state.bankTransactions.filter(t=>t.posted && !t.linkedId && !t.taxReviewed).forEach(t=>{ if(String(t.suggestedAccountId||'').startsWith('6')) ex.push({date:t.date,type:'Bank feed',id:t.id,issue:'Posted expense from bank feed without tax review',action:'Review tax treatment'}); });
    return ex.sort((a,b)=>b.date.localeCompare(a.date));
  }

  const v5RenderAllBase = renderAll;
  renderAll = function(){ ensureV5State(); document.getElementById('topCompanyName').textContent = state.company.name; v5RenderAllBase(); };
  const v5RenderPageBase = renderPage;
  renderPage = function(page){ ensureV5State(); if(page==='taxes'){ renderTaxes(); renderMenu(); return; } v5RenderPageBase(page); };
  const v5RenderDashboardBase = renderDashboard;
  renderDashboard = function(){ ensureV5State(); v5RenderDashboardBase(); };
  const v5RenderBusinessFeedBase = renderBusinessFeed;
  renderBusinessFeed = function(t){
    v5RenderBusinessFeedBase(t);
    const feed=document.getElementById('businessFeed'); if(!feed) return;
    const tax=salesTaxSummary(); const exceptions=taxExceptions().length;
    const html = `<div class="feed-card"><span class="menu">â‹®</span><div class="feed-title"><span class="feed-badge">%</span>Tax Agent</div><p>${exceptions} tax exceptions need review. Current net sales tax balance is ${money(tax.balance)}.</p><button class="btn soft" data-nav="taxes">Open Tax Center</button></div>`;
    const row=feed.querySelector('.feed-row'); if(row && row.children.length<4) row.insertAdjacentHTML('beforeend', html);
  };

  renderTaxes = function(){
    ensureV5State();
    const el=document.getElementById('page-taxes');
    const tax=salesTaxSummary();
    const tab=state.settings.taxTab || 'returns';
    const tabs=[['returns','Returns'],['payments','Payments'],['settings','Tax settings'],['reports','Reports'],['exceptions','Exceptions']];
    let body='';
    if(tab==='returns'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax returns</h3><div class="muted small">Track filing periods, calculated amount due, payments, and balances.</div></div><div class="right"><button class="btn" data-modal="taxReturn">Prepare return</button><button class="btn primary" data-modal="taxPayment">Record payment</button></div></div>${table(['Return','Agency','Period','File date','Amount due','Payments','Balance','Status','Action'], (state.taxReturns||[]).map(r=>{ const c=taxReturnCalc(r); return [`<strong>${r.id}</strong>`,escapeHTML(getTaxAgency(r.agencyId).name),`${r.startDate} â†’ ${r.endDate}`,escapeHTML(r.fileDate||'Not filed'),`<span class="amount">${money(c.amountDue)}</span>`,`<span class="amount">${money(c.payments)}</span>`,`<span class="amount">${money(c.balance)}</span>`,tagForStatus(r.status),`<button class="btn square" data-modal="taxPayment">Record payment</button>`]; }))}</div>`;
    }
    if(tab==='payments'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax payments</h3><div class="muted small">Payments post debit GST/HST Payable and credit selected bank account.</div></div><button class="btn primary" data-modal="taxPayment">Record payment</button></div>${table(['Payment','Agency','Return','Date','Paid from','Amount','Memo'], (state.taxPayments||[]).map(p=>[`<strong>${p.id}</strong>`,escapeHTML(getTaxAgency(p.agencyId).name),escapeHTML(p.returnId||'Not linked'),p.date,escapeHTML(getBank(p.accountId).name),`<span class="amount">${money(p.amount)}</span>`,escapeHTML(p.memo||'')]))}</div>`;
    }
    if(tab==='settings'){
      body = `<div class="grid two"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax agencies</h3><div class="muted small">Filing frequency, period start, and reporting method.</div></div><button class="btn" data-modal="taxAgency">Add agency</button></div>${table(['Agency','Filing frequency','Start month','Start date','Method','Status','Action'], (state.taxAgencies||[]).map(a=>[`<strong>${escapeHTML(a.name)}</strong>`,a.filingFrequency,a.startMonth,a.startDate,a.reportingMethod,a.active?'<span class="tax-pill active">Active</span>':'<span class="tax-pill">Inactive</span>',`<button class="btn square" data-modal="taxAgency">Edit</button>`]))}</div><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax codes and rates</h3><div class="muted small">Used on invoice, bill, and expense line items.</div></div><button class="btn" data-modal="taxCode">Add tax code</button></div>${table(['Code','Agency','Rate','Type','Applies to','Recoverable','Status'], (state.taxCodes||[]).map(c=>[`<strong>${escapeHTML(c.code)}</strong>`,escapeHTML(getTaxAgency(c.agencyId).name),`${num(c.rate)}%`,escapeHTML(c.type),escapeHTML(c.appliesTo),c.recoverable?'Yes':'No',c.active?'<span class="tax-pill active">Active</span>':'<span class="tax-pill">Inactive</span>']))}</div></div>`;
    }
    if(tab==='reports'){
      const details=taxDetailRows();
      body = `<div class="grid two" style="margin-bottom:16px"><div class="card"><h3>Sales Tax Liability Report</h3><p class="muted">Collected minus recoverable input tax credits plus adjustments.</p><div class="report-line"><span>Collected on sales</span><strong>${money(tax.collected)}</strong></div><div class="report-line"><span>Paid on purchases / ITCs</span><strong>${money(tax.itc)}</strong></div><div class="report-line"><span>Adjustments</span><strong>${money(tax.adjustments)}</strong></div><div class="report-line"><span>Payments</span><strong>${money(tax.payments)}</strong></div><div class="report-line"><span>Balance</span><strong>${money(tax.balance)}</strong></div></div><div class="card"><h3>Available reports</h3><div class="checklist"><div class="check-row done"><span class="check-dot">âœ“</span><div><strong>Tax detail by transaction</strong><div class="muted small">Included below</div></div><span class="tax-pill active">Ready</span></div><div class="check-row done"><span class="check-dot">âœ“</span><div><strong>Tax exceptions report</strong><div class="muted small">Open the Exceptions tab</div></div><span class="tax-pill active">Ready</span></div></div></div></div><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax detail by transaction</h3><div class="muted small">Line-item tax code, agency, taxable base, and tax amount.</div></div><input class="table-search" data-filter-table placeholder="Search tax detail"></div>${table(['Date','Type','Source','Name','Agency','Tax code','Base','Tax','Direction'], details.map(d=>[d.date,d.type,`<strong>${d.source}</strong>`,escapeHTML(d.name),escapeHTML(d.agency),`<span class="tax-pill">${escapeHTML(d.code)}</span>`,money(d.base),`<span class="amount">${money(d.tax)}</span>`,escapeHTML(d.direction)]))}</div>`;
    }
    if(tab==='exceptions'){
      const exceptions=taxExceptions();
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax exceptions</h3><div class="muted small">Transactions that may require tax-code review before filing.</div></div><button class="btn" data-modal="taxAdjustment">Add adjustment</button></div>${table(['Date','Type','Source','Issue','Suggested action'], exceptions.map(x=>[x.date,x.type,`<strong>${x.id}</strong>`,escapeHTML(x.issue),escapeHTML(x.action)]))}</div>`;
    }
    el.innerHTML = header('Tax Center', 'Manage tax agencies, tax codes, tax returns, input tax credits, remittances, and tax exceptions.', `<button class="btn" data-modal="taxAdjustment">Tax adjustment</button><button class="btn" data-modal="taxCode">Edit rates</button><button class="btn primary" data-modal="taxReturn">Prepare return</button>`) +
      `<div class="tax-hero"><div class="tax-card ${tax.balance>0?'warning':'good'}"><h3>Net tax balance</h3><div class="metric">${money(tax.balance)}</div><div class="muted small">After recorded payments</div></div><div class="tax-card"><h3>Collected on sales</h3><div class="metric">${money(tax.collected)}</div></div><div class="tax-card"><h3>Paid on purchases</h3><div class="metric">${money(tax.itc)}</div><div class="muted small">Recoverable ITCs</div></div><div class="tax-card"><h3>Adjustments</h3><div class="metric">${money(tax.adjustments)}</div></div><div class="tax-card"><h3>Exceptions</h3><div class="metric">${taxExceptions().length}</div><div class="muted small">Need review</div></div></div>`+
      `<div class="tax-subnav">${tabs.map(t=>`<button class="tab-btn ${tab===t[0]?'active':''}" data-action="set-tax-tab" data-id="${t[0]}">${t[1]}</button>`).join('')}</div>` + body;
  };

  const v5ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    ensureV5State();
    if(type==='invoice') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Invoice date</label><input type="date" name="date" value="${todayISO()}" required></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(30)}" required></div><div class="field"><label>Status</label><select name="status"><option>Sent</option><option>Draft</option><option>Overdue</option></select></div><div class="field full"><label>Product / service</label><select id="invoiceProduct" name="productId">${productOptions()}</select></div><div class="field full"><label>Description</label><input id="invoiceDesc" name="desc" value="Consulting service" required></div><div class="field"><label>Qty</label><input id="invoiceQty" type="number" step="0.01" min="0" name="qty" value="1" required></div><div class="field"><label>Rate</label><input id="invoiceRate" type="number" step="0.01" min="0" name="rate" value="125" required></div><div class="field"><label>Line tax code</label><select id="invoiceTaxCode" name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field"><label>Calculated tax %</label><input id="invoiceTax" type="number" step="0.01" min="0" name="taxRate" value="5" readonly></div><div class="field"><label>Income account</label><select id="invoiceIncome" name="incomeAccountId">${accountOptions(['Income'])}</select></div></div><div class="tax-form-note">Sales tax is calculated from the selected line-item tax code. The tax code is stored with the invoice line and feeds the Tax Center.</div><div class="inline-total"><span>Invoice total</span><span id="invoiceTotalPreview">$0.00</span></div>`;
    if(type==='expense') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Expense account</label><select name="expenseAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option>Bank transfer</option><option>Credit card</option><option>Cash</option></select></div><div class="field"><label>Paid from</label><select name="bankAccountId">${bankOptions()}</select></div><div class="field"><label>Amount before tax</label><input id="expenseAmount" type="number" step="0.01" min="0" name="amount" value="100"></div><div class="field"><label>Purchase tax code</label><select id="expenseTaxCode" name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field"><label>Calculated ITC / tax</label><input id="expenseTax" type="number" step="0.01" min="0" name="tax" value="5" readonly></div><div class="field full"><label>Memo</label><input name="memo" value="Business expense"></div></div><div class="tax-form-note">If the selected code is not recoverable, V5 rolls the tax into the expense instead of posting it as an input tax credit.</div><div class="inline-total"><span>Expense total</span><span id="expenseTotalPreview">$0.00</span></div>`;
    if(type==='bill') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Bill date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(14)}"></div><div class="field"><label>Status</label><select name="status"><option>Open</option><option>Paid</option></select></div><div class="field"><label>Expense account</label><select name="expenseAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Amount before tax</label><input id="billAmount" type="number" step="0.01" min="0" name="amount" value="250"></div><div class="field"><label>Bill tax code</label><select id="billTaxCode" name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field"><label>Calculated ITC / tax</label><input id="billTax" type="number" step="0.01" min="0" name="tax" value="12.50" readonly></div></div><div class="inline-total"><span>Bill total</span><span id="billTotalPreview">$0.00</span></div>`;
    if(type==='salesReceipt') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field full"><label>Product / service</label><select id="invoiceProduct" name="productId">${productOptions()}</select></div><div class="field full"><label>Description</label><input id="invoiceDesc" name="desc" value="Sales receipt item"></div><div class="field"><label>Qty</label><input id="invoiceQty" type="number" step="0.01" min="0" name="qty" value="1"></div><div class="field"><label>Rate</label><input id="invoiceRate" type="number" step="0.01" min="0" name="rate" value="125"></div><div class="field"><label>Line tax code</label><select id="invoiceTaxCode" name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field"><label>Calculated tax %</label><input id="invoiceTax" type="number" step="0.01" min="0" name="taxRate" value="5" readonly></div><div class="field"><label>Deposit to</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Income account</label><select id="invoiceIncome" name="incomeAccountId">${accountOptions(['Income'])}</select></div></div><div class="inline-total"><span>Sales receipt total</span><span id="invoiceTotalPreview">$0.00</span></div>`;
    if(type==='taxAgency') return `<div class="form-grid"><div class="field full"><label>Tax agency name</label><input name="name" value="Canada Revenue Agency - GST/HST" required></div><div class="field"><label>Filing frequency</label><select name="filingFrequency"><option>Monthly</option><option selected>Quarterly</option><option>Annual</option></select></div><div class="field"><label>Start month</label><select name="startMonth"><option selected>January</option><option>February</option><option>March</option><option>April</option><option>July</option><option>October</option></select></div><div class="field"><label>Start date</label><input type="date" name="startDate" value="2026-01-01"></div><div class="field"><label>Reporting method</label><select name="reportingMethod"><option selected>Accrual</option><option>Cash</option></select></div><div class="field"><label>Status</label><select name="active"><option value="true">Active</option><option value="false">Inactive</option></select></div></div>`;
    if(type==='taxCode') return `<div class="form-grid"><div class="field"><label>Tax code</label><input name="code" value="GST 5%" required></div><div class="field"><label>Agency</label><select name="agencyId">${taxAgencyOptions()}</select></div><div class="field"><label>Rate %</label><input type="number" step="0.001" min="0" name="rate" value="5"></div><div class="field"><label>Type</label><select name="type"><option>Taxable</option><option>Zero-rated</option><option>Exempt</option><option>Out of scope</option></select></div><div class="field"><label>Recoverable on purchases?</label><select name="recoverable"><option value="true">Yes</option><option value="false">No</option></select></div><div class="field"><label>Status</label><select name="active"><option value="true">Active</option><option value="false">Inactive</option></select></div><div class="field full"><label>Applies to</label><input name="appliesTo" value="Sales and purchases"></div></div>`;
    if(type==='taxReturn') return `<div class="form-grid"><div class="field"><label>Agency</label><select name="agencyId">${taxAgencyOptions()}</select></div><div class="field"><label>Status</label><select name="status"><option>Open</option><option>Filed</option><option>Filed and paid</option></select></div><div class="field"><label>Period start</label><input type="date" name="startDate" value="2026-04-01"></div><div class="field"><label>Period end</label><input type="date" name="endDate" value="2026-06-30"></div><div class="field"><label>File date</label><input type="date" name="fileDate" value=""></div><div class="field full"><label>Notes</label><input name="notes" value="Prepared from SmartBooks tax detail"></div></div>`;
    if(type==='taxPayment') return `<div class="form-grid"><div class="field"><label>Agency</label><select name="agencyId">${taxAgencyOptions()}</select></div><div class="field"><label>Return</label><select name="returnId">${(state.taxReturns||[]).map(r=>`<option value="${r.id}">${r.id} Â· ${r.startDate} to ${r.endDate}</option>`).join('')}<option value="">Not linked</option></select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Pay from</label><select name="accountId">${bankOptions()}</select></div><div class="field"><label>Amount paid</label><input type="number" step="0.01" min="0" name="amount" value="${Math.max(0,salesTaxSummary().balance).toFixed(2)}"></div><div class="field full"><label>Memo</label><input name="memo" value="Sales tax remittance"></div></div><div class="tax-form-note">Recording payment creates a journal entry: debit GST/HST Payable and credit the selected bank account.</div>`;
    if(type==='taxAdjustment') return `<div class="form-grid"><div class="field"><label>Agency</label><select name="agencyId">${taxAgencyOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Adjustment amount</label><input type="number" step="0.01" name="amount" value="0"></div><div class="field"><label>Offset account</label><select name="accountId">${accountOptions(['Expense','Income','Liability'])}</select></div><div class="field full"><label>Reason</label><input name="reason" value="Tax rounding / filing adjustment"></div></div><div class="tax-form-note">Positive adjustment increases tax payable; negative adjustment decreases tax payable.</div>`;
    return v5ModalBodyBase(type);
  };

  const v5BindModalBase = bindModalLiveCalculations;
  bindModalLiveCalculations = function(type){
    v5BindModalBase(type);
    const updateTaxRateInput=(prefix)=>{ const sel=document.getElementById(prefix+'TaxCode'); const tax=document.getElementById(prefix==='invoice'?'invoiceTax':prefix+'Tax'); const code=getTaxCode(sel?.value); if(tax) tax.value = num(code.rate).toFixed(2); };
    if(type==='invoice' || type==='salesReceipt'){
      const recalc=()=>{ updateTaxRateInput('invoice'); const q=num(document.getElementById('invoiceQty')?.value), r=num(document.getElementById('invoiceRate')?.value), code=document.getElementById('invoiceTaxCode')?.value; document.getElementById('invoiceTotalPreview').textContent=money(q*r+calcTax(q*r,code)); };
      ['invoiceQty','invoiceRate','invoiceTaxCode'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc)); document.getElementById('invoiceTaxCode')?.addEventListener('change',recalc); recalc();
    }
    if(type==='expense'){
      const recalc=()=>{ const base=num(document.getElementById('expenseAmount')?.value), code=document.getElementById('expenseTaxCode')?.value, tax=calcTax(base,code); const c=getTaxCode(code); document.getElementById('expenseTax').value=tax.toFixed(2); document.getElementById('expenseTotalPreview').textContent=money(base+tax); };
      ['expenseAmount','expenseTaxCode'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc)); document.getElementById('expenseTaxCode')?.addEventListener('change',recalc); recalc();
    }
    if(type==='bill'){
      const recalc=()=>{ const base=num(document.getElementById('billAmount')?.value), code=document.getElementById('billTaxCode')?.value, tax=calcTax(base,code); document.getElementById('billTax').value=tax.toFixed(2); document.getElementById('billTotalPreview').textContent=money(base+tax); };
      ['billAmount','billTaxCode'].forEach(id=>document.getElementById(id)?.addEventListener('input',recalc)); document.getElementById('billTaxCode')?.addEventListener('change',recalc); recalc();
    }
  };

  const v5OpenModalBase = openModal;
  openModal = function(type){
    v5OpenModalBase(type);
    const labels = {
      taxAgency:['Tax agency setup','Create or update filing agency, frequency, period start, and reporting method.'],
      taxCode:['Tax rates and codes','Create a tax code used on invoice, expense, and bill line items.'],
      taxReturn:['Prepare tax return','Create a tax return period from calculated transaction detail.'],
      taxPayment:['Record tax payment','Record a remittance to a tax agency and post the accounting entry.'],
      taxAdjustment:['Tax adjustment','Record a filing or rounding adjustment to the tax payable balance.']
    };
    if(labels[type]){ document.getElementById('modalTitle').textContent=labels[type][0]; document.getElementById('modalSubtitle').textContent=labels[type][1]; }
  };

  const v5SubmitModalBase = submitModal;
  submitModal = function(e){
    if(['invoice','expense','bill','salesReceipt','taxAgency','taxCode','taxReturn','taxPayment','taxAdjustment'].includes(currentModal)){
      e.preventDefault(); const f=new FormData(e.target); const data=Object.fromEntries(f.entries());
      switch(currentModal){
        case 'invoice': { const subtotal=num(data.qty)*num(data.rate); const code=getTaxCode(data.taxCodeId); const tax=calcTax(subtotal,data.taxCodeId); const inv={id:uid('INV'), customerId:data.customerId, date:data.date, dueDate:data.dueDate, status:data.status, subtotal, tax, paid:0, incomeAccountId:data.incomeAccountId, taxCodeId:data.taxCodeId, taxAgencyId:code.agencyId, taxRate:num(code.rate), items:[{desc:data.desc, qty:num(data.qty), rate:num(data.rate), amount:subtotal, taxCodeId:data.taxCodeId, taxAmount:tax}]}; state.invoices.unshift(inv); audit(`Invoice ${inv.id} created with tax code ${code.code}`); showToast('Invoice created with line-item tax code.'); break; }
        case 'salesReceipt': { const subtotal=num(data.qty)*num(data.rate); const code=getTaxCode(data.taxCodeId); const tax=calcTax(subtotal,data.taxCodeId); const total=subtotal+tax; const inv={id:uid('INV'), customerId:data.customerId, date:data.date, dueDate:data.date, status:'Paid', subtotal, tax, paid:total, incomeAccountId:data.incomeAccountId, taxCodeId:data.taxCodeId, taxAgencyId:code.agencyId, taxRate:num(code.rate), items:[{desc:data.desc, qty:num(data.qty), rate:num(data.rate), amount:subtotal, taxCodeId:data.taxCodeId, taxAmount:tax}]}; state.invoices.unshift(inv); state.payments.unshift({id:uid('PMT'), invoiceId:inv.id, customerId:inv.customerId, date:data.date, accountId:data.accountId, amount:total, memo:'Sales receipt for '+inv.id}); audit(`Sales receipt ${inv.id} posted with tax code ${code.code}`); showToast('Sales receipt posted with tax code.'); state.settings.salesTab='transactions'; break; }
        case 'expense': { const base=num(data.amount), code=getTaxCode(data.taxCodeId), rawTax=calcTax(base,data.taxCodeId); const recoverable=!!code.recoverable; const exp={id:uid('EXP'), vendorId:data.vendorId, date:data.date, expenseAccountId:data.expenseAccountId, account:getAccount(data.expenseAccountId).name, memo:data.memo, amount:recoverable?base:base+rawTax, tax:recoverable?rawTax:0, rawTax, nonRecoverableTax:recoverable?0:rawTax, taxCodeId:data.taxCodeId, taxAgencyId:code.agencyId, taxRate:num(code.rate), paymentMethod:data.paymentMethod, bankAccountId:data.bankAccountId}; state.expenses.unshift(exp); audit(`Expense ${exp.id} recorded with purchase tax code ${code.code}`); showToast('Expense recorded with tax code.'); break; }
        case 'bill': { const base=num(data.amount), code=getTaxCode(data.taxCodeId), rawTax=calcTax(base,data.taxCodeId); const recoverable=!!code.recoverable; const bill={id:uid('BILL'), vendorId:data.vendorId, date:data.date, dueDate:data.dueDate, status:data.status, expenseAccountId:data.expenseAccountId, amount:recoverable?base:base+rawTax, tax:recoverable?rawTax:0, rawTax, nonRecoverableTax:recoverable?0:rawTax, taxCodeId:data.taxCodeId, taxAgencyId:code.agencyId, taxRate:num(code.rate), paid:0}; state.bills.unshift(bill); if(data.status==='Paid'){ bill.paid=billTotal(bill); state.billPayments.unshift({id:uid('BP'), billId:bill.id, vendorId:bill.vendorId, date:data.date, accountId:'BA-1', amount:bill.paid, memo:'Payment for '+bill.id}); } audit(`Bill ${bill.id} created with purchase tax code ${code.code}`); showToast('Bill created with tax code.'); break; }
        case 'taxAgency': { const agency={id:uid('TA'), name:data.name, filingFrequency:data.filingFrequency, startMonth:data.startMonth, startDate:data.startDate, reportingMethod:data.reportingMethod, active:data.active==='true'}; state.taxAgencies.unshift(agency); audit(`Tax agency added: ${agency.name}`); showToast('Tax agency added.'); state.settings.taxTab='settings'; break; }
        case 'taxCode': { const code={id:uid('TAXCODE'), code:data.code, agencyId:data.agencyId, rate:num(data.rate), type:data.type, appliesTo:data.appliesTo, recoverable:data.recoverable==='true', active:data.active==='true'}; state.taxCodes.unshift(code); audit(`Tax code added: ${code.code}`); showToast('Tax code added.'); state.settings.taxTab='settings'; break; }
        case 'taxReturn': { const ret={id:uid('TAXRET'), agencyId:data.agencyId, startDate:data.startDate, endDate:data.endDate, fileDate:data.fileDate, status:data.status, notes:data.notes}; state.taxReturns.unshift(ret); audit(`Tax return prepared: ${ret.id}`); showToast('Tax return created.'); state.settings.taxTab='returns'; break; }
        case 'taxPayment': { const amt=num(data.amount); if(amt<=0){ showToast('Tax payment amount must be greater than zero.'); return; } const pay={id:uid('TAXPAY'), agencyId:data.agencyId, returnId:data.returnId, date:data.date, accountId:data.accountId, amount:amt, memo:data.memo}; state.taxPayments.unshift(pay); state.journalEntries.unshift({id:uid('JE'), date:data.date, memo:`Tax payment ${pay.id}: ${data.memo}`, status:'Posted', lines:[{accountId:'2200', debit:amt, credit:0},{accountId:bankAccountIdToLedger(data.accountId), debit:0, credit:amt}]}); audit(`Tax payment ${pay.id} recorded: ${money(amt)}`); showToast('Tax payment recorded and posted.'); state.settings.taxTab='payments'; break; }
        case 'taxAdjustment': { const amt=num(data.amount); const adj={id:uid('TAXADJ'), agencyId:data.agencyId, date:data.date, amount:amt, reason:data.reason, accountId:data.accountId||'6600'}; state.taxAdjustments.unshift(adj); if(Math.abs(amt)>0){ if(amt>0){ state.journalEntries.unshift({id:uid('JE'), date:data.date, memo:`Tax adjustment ${adj.id}: ${data.reason}`, status:'Posted', lines:[{accountId:data.accountId||'6600', debit:amt, credit:0},{accountId:'2200', debit:0, credit:amt}]}); } else { state.journalEntries.unshift({id:uid('JE'), date:data.date, memo:`Tax adjustment ${adj.id}: ${data.reason}`, status:'Posted', lines:[{accountId:'2200', debit:Math.abs(amt), credit:0},{accountId:data.accountId||'6600', debit:0, credit:Math.abs(amt)}]}); } } audit(`Tax adjustment ${adj.id} recorded: ${money(amt)}`); showToast('Tax adjustment saved.'); state.settings.taxTab='exceptions'; break; }
      }
      saveState(); closeModal(); renderAll(); return;
    }
    return v5SubmitModalBase(e);
  };

  const v5HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='set-tax-tab'){ state.settings.taxTab=id||'returns'; saveState(); renderTaxes(); return; }
    return v5HandleActionBase(action,id);
  };

  const v5ExportBase = exportData;
  exportData = function(){ const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-company-data.json'; a.click(); URL.revokeObjectURL(url); showToast('V5 Backup export started.'); };

  const v5ResetBase = resetState;
  resetState = function(){ state = structuredClone(initialState); ensureV5State(); saveState(); renderAll(); showToast('Company data reset.'); };



  // ---------- V6 Invoice Center, sent tracking, reports, and invoice actions ----------
  function ensureV6State(){
    ensureV5State();
    state.company.name = (state.company.name || 'Your Company - V6').replace(/V[345]/g,'V6');
    state.settings ||= {};
    state.settings.invoiceCenterFilters ||= {status:'all', customerId:'all', range:'all', sort:'date-desc'};
    if(Array.isArray(salesTabs)){
      const invTab = salesTabs.find(t=>t[0]==='invoices');
      if(invTab) invTab[1] = 'Invoice Center';
    }
    state.invoices.forEach((inv, idx)=>{
      inv.invoiceNo ||= inv.id;
      inv.emailStatus ||= inv.status==='Draft' ? 'Draft' : (inv.status==='Void' ? 'Void' : 'Sent');
      inv.sentDate ||= inv.status==='Draft' || inv.status==='Void' ? '' : inv.date;
      inv.lastViewed ||= idx % 2 === 0 && inv.sentDate ? addDaysISO(-Math.max(1, idx+1)) : '';
      inv.reminderCount ??= inv.status==='Overdue' ? 1 : 0;
      inv.deliveryMethod ||= 'Email';
      inv.customerMessage ||= 'Thank you for your business.';
      inv.items ||= [{desc:'Imported line item', qty:1, rate:num(inv.subtotal), amount:num(inv.subtotal), taxCodeId:inv.taxCodeId||'GST5', taxAmount:num(inv.tax)}];
    });
    if(!state.setupTasks.some(t=>t.id==='invoice-center')) state.setupTasks.push({id:'invoice-center', group:'Sales & Get Paid', title:'Review sent, unpaid, overdue, and paid invoices in Invoice Center', done:false, hidden:false, nav:'sales'});
  }

  function activeInvoice(){ return state.invoices.find(i=>i.id===state.settings.activeInvoiceId) || state.invoices[0]; }
  function invoiceIsVoid(inv){ return String(inv?.status||'').toLowerCase()==='void' || !!inv?.voided; }
  const v6InvoiceTotalBase = invoiceTotal;
  invoiceTotal = function(inv){ return invoiceIsVoid(inv) ? 0 : v6InvoiceTotalBase(inv); };
  openAmount = function(inv){ return invoiceIsVoid(inv) ? 0 : Math.max(0, invoiceTotal(inv) - num(inv.paid)); };
  customerOpenBalance = function(customerId){ return state.invoices.filter(i=>i.customerId===customerId && !invoiceIsVoid(i)).reduce((s,i)=>s+openAmount(i),0); };
  taxableSales = function(start=null,end=null,agencyId=null){ return state.invoices.filter(i=>!invoiceIsVoid(i) && taxPeriodMatch(i.date,start,end) && (!agencyId || (i.taxAgencyId||getTaxCode(i.taxCodeId).agencyId)===agencyId)).reduce((s,i)=>s+num(i.tax),0); };

  function invoiceDisplayStatus(inv){
    if(invoiceIsVoid(inv)) return 'Void';
    if(openAmount(inv)<=0.01 && invoiceTotal(inv)>0) return 'Paid';
    if(openAmount(inv)>0 && inv.dueDate && inv.dueDate < todayISO() && inv.status!=='Draft') return 'Overdue';
    return inv.status || 'Draft';
  }
  function invoicePayments(inv){ return state.payments.filter(p=>p.invoiceId===inv.id); }
  function invoiceDepositedAmount(inv){ return invoicePayments(inv).reduce((s,p)=>s+num(p.amount),0); }
  function invoiceStatusMatch(inv,status){
    const st=invoiceDisplayStatus(inv), open=openAmount(inv), total=invoiceTotal(inv), deposited=invoiceDepositedAmount(inv);
    if(status==='all') return true;
    if(status==='draft') return st==='Draft';
    if(status==='sent') return ['Sent','Viewed'].includes(st) || (inv.emailStatus==='Sent' && open>0 && st!=='Overdue');
    if(status==='unpaid') return open>0 && st!=='Draft' && st!=='Void';
    if(status==='overdue') return st==='Overdue';
    if(status==='paid') return total>0 && open<=0.01 && st!=='Void';
    if(status==='deposited') return deposited>0 && open<=0.01 && st!=='Void';
    if(status==='void') return st==='Void';
    return true;
  }
  function invoiceDateInRange(inv,range){
    if(!range || range==='all') return true;
    const d=new Date(inv.date+'T00:00:00'); const now=new Date(todayISO()+'T00:00:00');
    if(range==='last30') return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()-30);
    if(range==='thisMonth') return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
    if(range==='thisQuarter') { const q=Math.floor(now.getMonth()/3); return d.getFullYear()===now.getFullYear() && Math.floor(d.getMonth()/3)===q; }
    if(range==='thisYear') return d.getFullYear()===now.getFullYear();
    return true;
  }
  function getInvoiceCenterFilters(){ ensureV6State(); return state.settings.invoiceCenterFilters ||= {status:'all', customerId:'all', range:'all', sort:'date-desc'}; }
  function getInvoiceCenterInvoices(){
    const f=getInvoiceCenterFilters();
    let rows=state.invoices.filter(inv=>invoiceStatusMatch(inv,f.status||'all') && (f.customerId==='all' || inv.customerId===f.customerId) && invoiceDateInRange(inv,f.range||'all'));
    const sort=f.sort||'date-desc';
    rows.sort((a,b)=>{
      if(sort==='date-asc') return a.date.localeCompare(b.date);
      if(sort==='due-asc') return (a.dueDate||'').localeCompare(b.dueDate||'');
      if(sort==='due-desc') return (b.dueDate||'').localeCompare(a.dueDate||'');
      if(sort==='amount-desc') return invoiceTotal(b)-invoiceTotal(a);
      if(sort==='amount-asc') return invoiceTotal(a)-invoiceTotal(b);
      return b.date.localeCompare(a.date);
    });
    return rows;
  }
  function invoiceBucketStats(){
    const bucket=(status)=>state.invoices.filter(i=>invoiceStatusMatch(i,status));
    const total=(rows,mode='total')=>rows.reduce((s,i)=>s+(mode==='open'?openAmount(i):mode==='deposited'?invoiceDepositedAmount(i):invoiceTotal(i)),0);
    const buckets={
      draft:bucket('draft'), sent:bucket('sent'), unpaid:bucket('unpaid'), overdue:bucket('overdue'), paid:bucket('paid'), deposited:bucket('deposited')
    };
    return Object.fromEntries(Object.entries(buckets).map(([k,rows])=>[k,{count:rows.length, amount:total(rows,k==='unpaid'||k==='overdue'?'open':k==='deposited'?'deposited':'total')} ]));
  }
  function invoiceAging(){
    const today=new Date(todayISO()+'T00:00:00'); const buckets={current:0,d1_30:0,d31_60:0,d60:0};
    state.invoices.filter(i=>openAmount(i)>0 && !invoiceIsVoid(i) && invoiceDisplayStatus(i)!=='Draft').forEach(i=>{
      const due=new Date((i.dueDate||i.date)+'T00:00:00'); const days=Math.floor((today-due)/(24*3600*1000));
      if(days<=0) buckets.current+=openAmount(i); else if(days<=30) buckets.d1_30+=openAmount(i); else if(days<=60) buckets.d31_60+=openAmount(i); else buckets.d60+=openAmount(i);
    });
    return buckets;
  }
  function renderInvoiceMoneybar(){
    const s=invoiceBucketStats(), active=getInvoiceCenterFilters().status||'all';
    const cards=[['draft','Draft',s.draft],['sent','Sent',s.sent],['unpaid','Unpaid',s.unpaid],['overdue','Overdue',s.overdue],['paid','Paid',s.paid],['deposited','Deposited',s.deposited]];
    return `<div class="invoice-moneybar">${cards.map(([id,label,v])=>`<button class="money-card ${active===id?'active':''}" data-action="set-invoice-status-filter" data-id="${id}"><span>${label}</span><strong>${money(v.amount)}</strong><em>${v.count} invoice${v.count===1?'':'s'}</em></button>`).join('')}</div>`;
  }
  function renderInvoiceFilters(){
    const f=getInvoiceCenterFilters();
    return `<div class="invoice-filters"><div class="field"><label>Search invoices</label><input class="table-search" data-filter-table placeholder="Search invoice, customer, status, email" /></div><div class="field"><label>Status</label><select data-invoice-filter name="status"><option value="all" ${f.status==='all'?'selected':''}>All statuses</option><option value="draft" ${f.status==='draft'?'selected':''}>Draft</option><option value="sent" ${f.status==='sent'?'selected':''}>Sent</option><option value="unpaid" ${f.status==='unpaid'?'selected':''}>Unpaid</option><option value="overdue" ${f.status==='overdue'?'selected':''}>Overdue</option><option value="paid" ${f.status==='paid'?'selected':''}>Paid</option><option value="deposited" ${f.status==='deposited'?'selected':''}>Deposited</option><option value="void" ${f.status==='void'?'selected':''}>Void</option></select></div><div class="field"><label>Customer</label><select data-invoice-filter name="customerId"><option value="all">All customers</option>${state.customers.map(c=>`<option value="${c.id}" ${f.customerId===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select></div><div class="field"><label>Date range</label><select data-invoice-filter name="range"><option value="all" ${f.range==='all'?'selected':''}>All dates</option><option value="last30" ${f.range==='last30'?'selected':''}>Last 30 days</option><option value="thisMonth" ${f.range==='thisMonth'?'selected':''}>This month</option><option value="thisQuarter" ${f.range==='thisQuarter'?'selected':''}>This quarter</option><option value="thisYear" ${f.range==='thisYear'?'selected':''}>This year</option></select></div><div class="field"><label>Sort</label><select data-invoice-filter name="sort"><option value="date-desc" ${f.sort==='date-desc'?'selected':''}>Newest first</option><option value="date-asc" ${f.sort==='date-asc'?'selected':''}>Oldest first</option><option value="due-asc" ${f.sort==='due-asc'?'selected':''}>Due date â†‘</option><option value="due-desc" ${f.sort==='due-desc'?'selected':''}>Due date â†“</option><option value="amount-desc" ${f.sort==='amount-desc'?'selected':''}>Amount â†“</option><option value="amount-asc" ${f.sort==='amount-asc'?'selected':''}>Amount â†‘</option></select></div></div>`;
  }
  function renderInvoiceActions(inv){
    const open=openAmount(inv), st=invoiceDisplayStatus(inv), sendBtn=st==='Draft'||!inv.sentDate?`<button class="btn square" data-action="send-invoice" data-id="${inv.id}">Send</button>`:'';
    return `<div class="invoice-actions"><button class="btn square" data-action="view-invoice" data-id="${inv.id}">View</button><button class="btn square" data-action="edit-invoice" data-id="${inv.id}">Edit</button><button class="btn square" data-action="duplicate-invoice" data-id="${inv.id}">Duplicate</button>${sendBtn}<button class="btn square" data-action="print-invoice" data-id="${inv.id}">Print/PDF</button>${open>0?`<button class="btn square" data-action="mark-paid" data-id="${inv.id}">Receive</button>`:''}${st!=='Void'?`<button class="btn square danger" data-action="void-invoice" data-id="${inv.id}">Void</button>`:''}</div>`;
  }
  function invoiceReportsHTML(rows){
    const openRows=state.invoices.filter(i=>openAmount(i)>0 && !invoiceIsVoid(i));
    const paidRows=state.invoices.filter(i=>openAmount(i)<=0.01 && invoiceTotal(i)>0 && !invoiceIsVoid(i));
    const aging=invoiceAging();
    return `<div class="invoice-report-grid"><div class="invoice-report-card"><h4>Invoice List by Date</h4><div class="metric">${rows.length}</div><div class="muted small">Filtered invoices shown above</div><button class="btn" data-action="export-invoices-csv" style="margin-top:10px">Export CSV</button></div><div class="invoice-report-card"><h4>Open Invoices</h4><div class="metric">${money(openRows.reduce((s,i)=>s+openAmount(i),0))}</div><div class="muted small">${openRows.length} open records</div></div><div class="invoice-report-card"><h4>Paid Invoices</h4><div class="metric">${money(paidRows.reduce((s,i)=>s+invoiceTotal(i),0))}</div><div class="muted small">${paidRows.length} closed records</div></div><div class="invoice-report-card"><h4>A/R Aging</h4><div class="small"><div class="report-line"><span>Current</span><strong>${money(aging.current)}</strong></div><div class="report-line"><span>1â€“30</span><strong>${money(aging.d1_30)}</strong></div><div class="report-line"><span>31â€“60</span><strong>${money(aging.d31_60)}</strong></div><div class="report-line"><span>60+</span><strong>${money(aging.d60)}</strong></div></div></div></div>`;
  }
  function renderInvoiceCenter(){
    const rows=getInvoiceCenterInvoices();
    return `<div class="card"><div class="toolbar"><div><h3 style="margin:0">Invoice Center</h3><div class="muted small">View sent invoices, track delivery, filter by status/customer/date, and export invoice reports.</div></div><div class="right"><button class="btn" data-action="clear-invoice-filters">Clear filters</button><button class="btn" data-action="export-invoices-csv">Export CSV</button><button class="btn primary" data-modal="invoice">Create invoice</button></div></div>${renderInvoiceMoneybar()}${renderInvoiceFilters()}<div class="table-card">${table(['Invoice','Customer','Invoice date','Due date','Status','Sent tracking','Total','Open balance','Actions'], rows.map(i=>{ const customer=getCustomer(i.customerId); const track=`<div><span class="tracking-chip">${escapeHTML(i.emailStatus||'Draft')}</span><div class="muted small" style="margin-top:4px">Sent: ${escapeHTML(i.sentDate||'â€”')} Â· Viewed: ${escapeHTML(i.lastViewed||'â€”')} Â· Reminders: ${num(i.reminderCount)}</div></div>`; return [`<strong>${i.id}</strong>`,escapeHTML(customer.name),i.date,i.dueDate,tagForStatus(invoiceDisplayStatus(i)),track,`<span class="amount">${money(invoiceTotal(i))}</span>`,`<span class="amount">${money(openAmount(i))}</span>`,renderInvoiceActions(i)]; }))}</div>${invoiceReportsHTML(rows)}</div>`;
  }

  const v6RenderSalesBase = renderSales;
  renderSales = function(){
    ensureV6State();
    if((state.settings.salesTab||'overview') !== 'invoices') return v6RenderSalesBase();
    const el=document.getElementById('page-sales');
    el.innerHTML = header('Sales & Get Paid', 'Invoice Center helps users answer: which invoices were sent, viewed, unpaid, overdue, paid, deposited, or voided.', `<button class="btn" data-modal="payment">Receive payment</button><button class="btn" data-action="export-invoices-csv">Export invoices</button><button class="btn primary" data-modal="invoice">Create invoice</button>`) + salesTabbar() + renderInvoiceCenter();
  };

  function invoiceDetailHTML(inv){
    const cust=getCustomer(inv.customerId); const payments=invoicePayments(inv);
    return `<div class="invoice-detail-grid"><div class="invoice-summary-box"><h3>${escapeHTML(inv.id)} Â· ${escapeHTML(cust.name)}</h3><div class="report-line"><span>Status</span>${tagForStatus(invoiceDisplayStatus(inv))}</div><div class="report-line"><span>Invoice date</span><strong>${escapeHTML(inv.date)}</strong></div><div class="report-line"><span>Due date</span><strong>${escapeHTML(inv.dueDate)}</strong></div><div class="report-line"><span>Delivery</span><strong>${escapeHTML(inv.deliveryMethod||'Email')}</strong></div><div class="report-line"><span>Email status</span><strong>${escapeHTML(inv.emailStatus||'Draft')}</strong></div><div class="report-line"><span>Sent date</span><strong>${escapeHTML(inv.sentDate||'â€”')}</strong></div><div class="report-line"><span>Last viewed</span><strong>${escapeHTML(inv.lastViewed||'â€”')}</strong></div><div class="report-line"><span>Reminders</span><strong>${num(inv.reminderCount)}</strong></div></div><div class="invoice-summary-box"><h3>Balance</h3><div class="report-line"><span>Subtotal</span><strong>${money(num(inv.subtotal))}</strong></div><div class="report-line"><span>Tax</span><strong>${money(num(inv.tax))}</strong></div><div class="report-line"><span>Total</span><strong>${money(invoiceTotal(inv))}</strong></div><div class="report-line"><span>Paid / deposited</span><strong>${money(invoiceDepositedAmount(inv))}</strong></div><div class="report-line"><span>Open balance</span><strong>${money(openAmount(inv))}</strong></div><div class="report-line"><span>Income account</span><strong>${escapeHTML(accountLabel(inv.incomeAccountId||'4000'))}</strong></div><div class="report-line"><span>Tax code</span><strong>${escapeHTML(getTaxCode(inv.taxCodeId||'GST5').code)}</strong></div></div></div><div class="card table-card" style="margin-top:14px"><h3>Line items</h3>${table(['Description','Qty','Rate','Amount','Tax code','Tax'], (inv.items||[]).map(l=>[escapeHTML(l.desc||'Item'),num(l.qty),money(num(l.rate)),money(num(l.amount ?? num(l.qty)*num(l.rate))),escapeHTML(getTaxCode(l.taxCodeId||inv.taxCodeId||'GST5').code),money(num(l.taxAmount||inv.tax))]))}</div><div class="card table-card" style="margin-top:14px"><h3>Linked payments</h3>${table(['Payment','Date','Deposit to','Amount','Memo'], payments.map(p=>[`<strong>${p.id}</strong>`,p.date,escapeHTML(getBank(p.accountId).name),money(p.amount),escapeHTML(p.memo||'')]))}</div>`;
  }
  function invoicePrintHTML(inv){
    const cust=getCustomer(inv.customerId);
    return `<div class="invoice-preview"><div class="invoice-preview-head"><div><h2>INVOICE</h2><p class="muted">SmartBooks Accounting App</p><strong>${escapeHTML(state.company.name)}</strong></div><div style="text-align:right"><div><strong>${escapeHTML(inv.id)}</strong></div><div>${escapeHTML(inv.date)}</div><div>Due ${escapeHTML(inv.dueDate)}</div><div class="big-total">${money(invoiceTotal(inv))}</div></div></div><div class="grid two"><div><h3>Bill to</h3><p><strong>${escapeHTML(cust.name)}</strong><br>${escapeHTML(cust.company||'')}<br>${escapeHTML(cust.email||'')}</p></div><div><h3>Status</h3>${tagForStatus(invoiceDisplayStatus(inv))}<p class="muted small">Sent: ${escapeHTML(inv.sentDate||'â€”')} Â· Viewed: ${escapeHTML(inv.lastViewed||'â€”')}</p></div></div>${table(['Product / service','Description','Qty','Rate','Amount','Tax'], (inv.items||[]).map(l=>[escapeHTML(l.product||'Service'),escapeHTML(l.desc||'Item'),num(l.qty),money(num(l.rate)),money(num(l.amount ?? num(l.qty)*num(l.rate))),money(num(l.taxAmount||inv.tax))]))}<div style="max-width:340px;margin-left:auto;margin-top:14px"><div class="report-line"><span>Subtotal</span><strong>${money(num(inv.subtotal))}</strong></div><div class="report-line"><span>Sales tax</span><strong>${money(num(inv.tax))}</strong></div><div class="report-line"><span>Total</span><strong>${money(invoiceTotal(inv))}</strong></div><div class="report-line"><span>Balance due</span><strong>${money(openAmount(inv))}</strong></div></div><p class="muted" style="margin-top:20px">${escapeHTML(inv.customerMessage||'Thank you for your business.')}</p></div>`;
  }

  const v6ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    if(type==='invoiceDetail') return invoiceDetailHTML(activeInvoice());
    if(type==='invoicePrint') return invoicePrintHTML(activeInvoice());
    if(type==='invoiceEdit'){
      const inv=activeInvoice();
      return `<div class="form-grid"><div class="field"><label>Invoice</label><input value="${escapeHTML(inv.id)}" readonly></div><div class="field"><label>Customer</label><input value="${escapeHTML(getCustomer(inv.customerId).name)}" readonly></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${escapeHTML(inv.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select name="status"><option ${invoiceDisplayStatus(inv)==='Draft'?'selected':''}>Draft</option><option ${invoiceDisplayStatus(inv)==='Sent'?'selected':''}>Sent</option><option ${invoiceDisplayStatus(inv)==='Viewed'?'selected':''}>Viewed</option><option ${invoiceDisplayStatus(inv)==='Overdue'?'selected':''}>Overdue</option><option ${invoiceDisplayStatus(inv)==='Paid'?'selected':''}>Paid</option><option ${invoiceDisplayStatus(inv)==='Void'?'selected':''}>Void</option></select></div><div class="field"><label>Email status</label><select name="emailStatus"><option ${inv.emailStatus==='Draft'?'selected':''}>Draft</option><option ${inv.emailStatus==='Sent'?'selected':''}>Sent</option><option ${inv.emailStatus==='Delivered'?'selected':''}>Delivered</option><option ${inv.emailStatus==='Viewed'?'selected':''}>Viewed</option><option ${inv.emailStatus==='Bounced'?'selected':''}>Bounced</option><option ${inv.emailStatus==='Void'?'selected':''}>Void</option></select></div><div class="field"><label>Sent date</label><input type="date" name="sentDate" value="${escapeHTML(inv.sentDate||'')}"></div><div class="field"><label>Last viewed</label><input type="date" name="lastViewed" value="${escapeHTML(inv.lastViewed||'')}"></div><div class="field"><label>Reminder count</label><input type="number" min="0" name="reminderCount" value="${num(inv.reminderCount)}"></div><div class="field full"><label>Customer message</label><input name="customerMessage" value="${escapeHTML(inv.customerMessage||'Thank you for your business.')}" /></div></div>`;
    }
    return v6ModalBodyBase(type);
  };

  const v6OpenModalBase = openModal;
  openModal = function(type){
    v6OpenModalBase(type);
    const labels={invoiceDetail:['Invoice detail','View line items, sent tracking, linked payments, and ledger impact.'], invoiceEdit:['Edit invoice tracking','Update invoice status, sent date, viewed date, due date, and reminder count.'], invoicePrint:['Print / PDF invoice','Preview a clean invoice layout. Use browser print to save as PDF.']};
    if(labels[type]){
      document.getElementById('modalTitle').textContent=labels[type][0]; document.getElementById('modalSubtitle').textContent=labels[type][1];
      if(type==='invoiceDetail') document.getElementById('modalFooter').innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn" data-action="print-invoice" data-id="${activeInvoice().id}">Print/PDF</button><button type="button" class="btn" data-action="duplicate-invoice" data-id="${activeInvoice().id}">Duplicate</button>${openAmount(activeInvoice())>0?`<button type="button" class="btn primary" data-action="mark-paid" data-id="${activeInvoice().id}">Receive payment</button>`:''}`;
      if(type==='invoicePrint') document.getElementById('modalFooter').innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn primary" data-action="browser-print-invoice" data-id="${activeInvoice().id}">Print / Save PDF</button>`;
      if(type==='invoiceEdit') document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save invoice tracking</button>';
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    }
  };

  const v6SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='invoiceEdit'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries()), inv=activeInvoice(); if(!inv){ showToast('No invoice selected.'); return; }
      inv.dueDate=data.dueDate; inv.status=data.status; inv.emailStatus=data.emailStatus; inv.sentDate=data.sentDate; inv.lastViewed=data.lastViewed; inv.reminderCount=num(data.reminderCount); inv.customerMessage=data.customerMessage;
      if(inv.status==='Paid' && openAmount(inv)>0) inv.status='Sent';
      audit(`Invoice ${inv.id} tracking updated`); saveState(); closeModal(); renderAll(); showToast('Invoice tracking updated.'); return;
    }
    return v6SubmitModalBase(e);
  };

  function setActiveInvoice(id){ state.settings.activeInvoiceId=id; saveState(); }
  function duplicateInvoice(id){
    const inv=state.invoices.find(i=>i.id===id); if(!inv) return;
    const copy=structuredClone(inv); copy.id=uid('INV'); copy.invoiceNo=copy.id; copy.status='Draft'; copy.emailStatus='Draft'; copy.sentDate=''; copy.lastViewed=''; copy.reminderCount=0; copy.paid=0; copy.date=todayISO(); copy.dueDate=addDaysISO(30); copy.voided=false; copy.voidedOriginal=null;
    state.invoices.unshift(copy); audit(`Invoice ${id} duplicated as ${copy.id}`); saveState(); state.settings.salesTab='invoices'; renderAll(); showToast(`${id} duplicated as ${copy.id}.`);
  }
  function sendInvoice(id){
    const inv=state.invoices.find(i=>i.id===id); if(!inv || invoiceIsVoid(inv)) return;
    inv.status = openAmount(inv)>0 ? 'Sent' : 'Paid'; inv.emailStatus='Sent'; inv.sentDate=todayISO(); inv.deliveryMethod='Email'; audit(`Invoice ${id} sent to ${getCustomer(inv.customerId).name}`); saveState(); renderAll(); showToast(`${id} marked as sent.`);
  }
  function voidInvoice(id){
    const inv=state.invoices.find(i=>i.id===id); if(!inv) return;
    inv.voidedOriginal ||= {subtotal:num(inv.subtotal), tax:num(inv.tax), paid:num(inv.paid), items:structuredClone(inv.items||[])};
    inv.subtotal=0; inv.tax=0; inv.paid=0; inv.status='Void'; inv.emailStatus='Void'; inv.voided=true; audit(`Invoice ${id} voided`); saveState(); renderAll(); showToast(`${id} voided and removed from invoice totals.`);
  }
  function remindInvoice(id){
    const inv=state.invoices.find(i=>i.id===id); if(!inv) return;
    inv.reminderCount=num(inv.reminderCount)+1; inv.emailStatus='Reminder sent'; audit(`Reminder sent for invoice ${id}`); saveState(); renderAll(); showToast(`Reminder recorded for ${id}.`);
  }
  function exportInvoicesCSV(){
    const rows=getInvoiceCenterInvoices();
    const headers=['Invoice','Customer','Invoice Date','Due Date','Status','Email Status','Sent Date','Last Viewed','Reminders','Subtotal','Tax','Total','Open Balance','Income Account'];
    const csv=[headers, ...rows.map(i=>[i.id,getCustomer(i.customerId).name,i.date,i.dueDate,invoiceDisplayStatus(i),i.emailStatus||'',i.sentDate||'',i.lastViewed||'',num(i.reminderCount),num(i.subtotal).toFixed(2),num(i.tax).toFixed(2),invoiceTotal(i).toFixed(2),openAmount(i).toFixed(2),accountLabel(i.incomeAccountId||'4000')])].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-v6-3-invoice-list.csv'; a.click(); URL.revokeObjectURL(url); showToast('Invoice CSV export started.');
  }

  const v6HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='set-invoice-status-filter'){ const f=getInvoiceCenterFilters(); f.status=id||'all'; state.settings.salesTab='invoices'; saveState(); renderSales(); return; }
    if(action==='clear-invoice-filters'){ state.settings.invoiceCenterFilters={status:'all', customerId:'all', range:'all', sort:'date-desc'}; saveState(); renderSales(); showToast('Invoice filters cleared.'); return; }
    if(action==='export-invoices-csv'){ exportInvoicesCSV(); return; }
    if(action==='view-invoice'){ setActiveInvoice(id); openModal('invoiceDetail'); return; }
    if(action==='edit-invoice'){ setActiveInvoice(id); openModal('invoiceEdit'); return; }
    if(action==='duplicate-invoice'){ closeModal(); duplicateInvoice(id); return; }
    if(action==='send-invoice'){ closeModal(); sendInvoice(id); return; }
    if(action==='void-invoice'){ closeModal(); voidInvoice(id); return; }
    if(action==='print-invoice'){ setActiveInvoice(id); openModal('invoicePrint'); return; }
    if(action==='browser-print-invoice'){ window.print(); showToast('Use browser print dialog to save as PDF.'); return; }
    if(action==='remind-invoice'){ remindInvoice(id); return; }
    return v6HandleActionBase(action,id);
  };

  const v6SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v6SetupEventListenersBase();
    document.addEventListener('change', e=>{
      const f=e.target.closest('[data-invoice-filter]'); if(!f) return;
      const filters=getInvoiceCenterFilters(); filters[f.name]=f.value; state.settings.salesTab='invoices'; saveState(); renderSales();
    });
  };

  const v6RenderAllBase = renderAll;
  renderAll = function(){ ensureV6State(); v6RenderAllBase(); };
  const v6RenderPageBase = renderPage;
  renderPage = function(page){ ensureV6State(); v6RenderPageBase(page); };
  const v6ExportBase = exportData;
  exportData = function(){ const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-company-data.json'; a.click(); URL.revokeObjectURL(url); showToast('V6 Backup export started.'); };
  const v6ResetBase = resetState;
  resetState = function(){ state = structuredClone(initialState); ensureV6State(); saveState(); renderAll(); showToast('Company data reset.'); };




  // ---------- V6.1 Professional Invoice Templates, customization, print/PDF, and send workflow ----------
  const v61EnsureV6StateBase = ensureV6State;
  ensureV6State = function(){
    v61EnsureV6StateBase();
    state.company.name = (state.company.name || 'Your Company - V6.1').replace(/V[3456](\.1)?/g,'V6.1');
    const existing = state.invoiceSettings || {};
    state.invoiceSettings = {
      template: existing.template || 'standard',
      accentColor: existing.accentColor || '#008c95',
      logoText: existing.logoText || 'LOGO',
      companyName: existing.companyName || state.company.name || 'SmartBooks',
      address: existing.address || '1200 Ledger Avenue\nVancouver, BC V6B 1A1',
      phone: existing.phone || '604-555-0198',
      email: existing.email || 'billing@smartbooks.example.com',
      website: existing.website || 'www.smartbooks.example.com',
      defaultTerms: existing.defaultTerms || 'Net 30',
      defaultMessage: existing.defaultMessage || 'Thank you for your purchase. Please remit this invoice with payment.\n\nThanks!',
      footerNote: existing.footerNote || 'This invoice was generated in SmartBooks. Please contact us if you have questions about this invoice.',
      paymentInstructions: existing.paymentInstructions || 'Payment instructions: EFT, bank transfer, or cheque payable to SmartBooks.',
      showShipping: existing.showShipping !== false,
      showSku: !!existing.showSku,
      showTaxColumn: existing.showTaxColumn !== false,
      showPaymentInstructions: existing.showPaymentInstructions !== false
    };
    if(!state.chartOfAccounts.some(a=>a.id==='4200')) state.chartOfAccounts.push({id:'4200', code:'4200', name:'Shipping Income', type:'Income', normal:'Credit', detail:'Revenue'});
    state.chartOfAccounts.sort((a,b)=>String(a.code).localeCompare(String(b.code)));
    state.invoices.forEach((inv, idx)=>{
      inv.template ||= state.invoiceSettings.template;
      inv.terms ||= state.invoiceSettings.defaultTerms;
      inv.shipping ??= 0;
      inv.shipTo ||= getCustomer(inv.customerId).company || getCustomer(inv.customerId).name || '';
      inv.billToAddress ||= getCustomer(inv.customerId).company || getCustomer(inv.customerId).name || '';
      inv.shipVia ||= '';
      inv.shippingDate ||= '';
      inv.trackingNo ||= '';
      inv.paymentInstructions ||= state.invoiceSettings.paymentInstructions;
      inv.customerMessage ||= state.invoiceSettings.defaultMessage;
      inv.items ||= [{product:'Service', desc:'Imported line item', qty:1, rate:num(inv.subtotal), amount:num(inv.subtotal), taxCodeId:inv.taxCodeId||'GST5', taxAmount:num(inv.tax)}];
      inv.items.forEach((line, lineIdx)=>{
        line.product ||= line.item || (lineIdx===0 ? (line.desc || 'Service') : 'Service');
        line.sku ||= line.sku || (line.product && line.product.toLowerCase().includes('hardware') ? 'SKU-HW' : '');
        line.desc ||= line.description || line.product || 'Item';
        line.qty = num(line.qty || 1);
        line.rate = num(line.rate || (num(line.amount) || num(inv.subtotal)) / (line.qty || 1));
        line.amount = num(line.amount || line.qty * line.rate);
        line.taxCodeId ||= inv.taxCodeId || 'GST5';
        line.taxAmount = num(line.taxAmount || calcTax(line.amount, line.taxCodeId));
      });
      const lineSubtotal = inv.items.reduce((s,l)=>s+num(l.amount),0);
      if(!inv.subtotal || Math.abs(num(inv.subtotal)-lineSubtotal)>0.01) inv.subtotal = num(inv.subtotal) || lineSubtotal;
    });
    if(!state.setupTasks.some(t=>t.id==='invoice-template')) state.setupTasks.push({id:'invoice-template', group:'Sales & Get Paid', title:'Customize invoice template, message, payment instructions, and print/PDF layout', done:false, hidden:false, nav:'sales'});
  };

  invoiceTotal = function(inv){ return invoiceIsVoid(inv) ? 0 : num(inv.subtotal) + num(inv.tax) + num(inv.shipping); };
  openAmount = function(inv){ return invoiceIsVoid(inv) ? 0 : Math.max(0, invoiceTotal(inv) - num(inv.paid)); };
  customerOpenBalance = function(customerId){ return state.invoices.filter(i=>i.customerId===customerId && !invoiceIsVoid(i)).reduce((s,i)=>s+openAmount(i),0); };

  ledger = function(){
    const rows=[];
    state.journalEntries.filter(j=>j.status!=='Draft').forEach(j=>j.lines.forEach(l=>rows.push(line('Journal', j.id, j.date, j.memo, l.accountId, l.debit, l.credit))));
    state.invoices.forEach(i=>{
      if(invoiceIsVoid(i)) return;
      const total=invoiceTotal(i); rows.push(line('Invoice', i.id, i.date, `Invoice to ${getCustomer(i.customerId).name}`, '1200', total, 0));
      rows.push(line('Invoice', i.id, i.date, `Revenue: ${i.items?.[0]?.desc || i.id}`, i.incomeAccountId || '4000', 0, i.subtotal));
      if(num(i.shipping)>0) rows.push(line('Invoice', i.id, i.date, `Shipping on ${i.id}`, '4200', 0, i.shipping));
      if(num(i.tax)>0) rows.push(line('Invoice', i.id, i.date, `Sales tax collected on ${i.id}`, '2200', 0, i.tax));
    });
    state.payments.forEach(p=>{ rows.push(line('Payment', p.id, p.date, p.memo || `Payment for ${p.invoiceId}`, bankAccountIdToLedger(p.accountId), p.amount, 0)); rows.push(line('Payment', p.id, p.date, p.memo || `Payment for ${p.invoiceId}`, '1200', 0, p.amount)); });
    state.expenses.forEach(e=>{ const total=expenseTotal(e), bank=e.bankAccountId || (e.paymentMethod==='Credit card'?'BA-2':'BA-1'); rows.push(line('Expense', e.id, e.date, e.memo, e.expenseAccountId || expenseAccountFromName(e.account), e.amount, 0)); if(num(e.tax)>0) rows.push(line('Expense', e.id, e.date, `Input tax credit: ${e.memo}`, '2210', e.tax, 0)); rows.push(line('Expense', e.id, e.date, e.memo, bankAccountIdToLedger(bank), 0, total)); });
    state.bills.forEach(b=>{ rows.push(line('Bill', b.id, b.date, `Bill from ${getVendor(b.vendorId).name}`, b.expenseAccountId || '6000', b.amount, 0)); if(num(b.tax)>0) rows.push(line('Bill', b.id, b.date, `Input tax credit on ${b.id}`, '2210', b.tax, 0)); rows.push(line('Bill', b.id, b.date, `Accounts payable: ${b.id}`, '2000', 0, billTotal(b))); });
    state.billPayments.forEach(p=>{ rows.push(line('Bill payment', p.id, p.date, p.memo || `Payment for ${p.billId}`, '2000', p.amount, 0)); rows.push(line('Bill payment', p.id, p.date, p.memo || `Payment for ${p.billId}`, bankAccountIdToLedger(p.accountId), 0, p.amount)); });
    state.deposits.forEach(d=>{ rows.push(line('Deposit', d.id, d.date, d.memo, bankAccountIdToLedger(d.accountId), d.amount, 0)); rows.push(line('Deposit', d.id, d.date, d.memo, d.incomeAccountId || '4100', 0, d.amount)); });
    state.transfers.forEach(t=>{ rows.push(line('Transfer', t.id, t.date, t.memo || 'Bank transfer', bankAccountIdToLedger(t.toAccountId), t.amount, 0)); rows.push(line('Transfer', t.id, t.date, t.memo || 'Bank transfer', bankAccountIdToLedger(t.fromAccountId), 0, t.amount)); });
    state.bankTransactions.filter(tx=>tx.posted && !tx.linkedId).forEach(tx=>{ const bankAcct=bankAccountIdToLedger(tx.bankAccountId), amt=Math.abs(num(tx.amount)), cat=tx.suggestedAccountId || (num(tx.amount)>=0?'4100':'6000'); if(num(tx.amount)>=0){ rows.push(line('Bank feed', tx.id, tx.date, tx.description, bankAcct, amt, 0)); rows.push(line('Bank feed', tx.id, tx.date, tx.description, cat, 0, amt)); } else { rows.push(line('Bank feed', tx.id, tx.date, tx.description, cat, amt, 0)); rows.push(line('Bank feed', tx.id, tx.date, tx.description, bankAcct, 0, amt)); } });
    return rows.sort((a,b)=> b.date.localeCompare(a.date) || a.source.localeCompare(b.source));
  };

  function invoiceSettings(){ ensureV6State(); return state.invoiceSettings; }
  function templateName(id){ return ({standard:'Standard',service:'Service',product:'Product',contractor:'Contractor',commercial:'Commercial',minimal:'Minimal'})[id] || 'Standard'; }
  function invoiceTemplateOptions(selected){ return ['standard','service','product','contractor','commercial','minimal'].map(t=>`<option value="${t}" ${selected===t?'selected':''}>${templateName(t)}</option>`).join(''); }
  function invoiceTaxCodeLabel(id){ const c=getTaxCode(id||'ZERO'); return c.code || 'No tax'; }
  function invoiceItemRows(inv, settings){
    const showSku = settings.showSku || (inv.template==='product');
    const showTax = settings.showTaxColumn !== false;
    const heads = [showSku?'SKU':'', 'Product / service', 'Description', inv.template==='service'?'Hours':'Qty', 'Rate', 'Amount', showTax?'Tax':''].filter(Boolean);
    const rows = (inv.items||[]).map(l=>[showSku?escapeHTML(l.sku||'â€”'):'', escapeHTML(l.product||'Service'), `<div>${escapeHTML(l.desc||'Item')}</div>${l.taxCodeId?`<div class="muted-line">Tax code: ${escapeHTML(invoiceTaxCodeLabel(l.taxCodeId))}</div>`:''}`, num(l.qty), money(num(l.rate)), money(num(l.amount ?? num(l.qty)*num(l.rate))), showTax?money(num(l.taxAmount||0)):''].filter((_,idx)=> idx!==0 || showSku).filter((_,idx,arr)=>true));
    const htmlRows = rows.map(r=>`<tr>${r.map((c,idx)=>`<td class="${idx>=r.length-4?'num':''}">${c}</td>`).join('')}</tr>`).join('');
    return `<table class="invoice-lines"><thead><tr>${heads.map((h,idx)=>`<th class="${idx>=heads.length-4?'num':''}">${h}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table>`;
  }
  function professionalInvoiceHTML(inv){
    const settings=invoiceSettings(), cust=getCustomer(inv.customerId), template=inv.template || settings.template || 'standard', accent=inv.accentColor || settings.accentColor;
    const billTo = inv.billToAddress || `${cust.name}\n${cust.company||''}\n${cust.email||''}`;
    const shipTo = inv.shipTo || cust.company || cust.name || '';
    const balance = openAmount(inv), lineSubtotal=(inv.items||[]).reduce((s,l)=>s+num(l.amount),0) || num(inv.subtotal);
    const detailRows = `<div class="detail-row"><span>Invoice #</span><strong>${escapeHTML(inv.invoiceNo||inv.id)}</strong></div><div class="detail-row"><span>Invoice date</span><span>${escapeHTML(inv.date||'')}</span></div><div class="detail-row"><span>Terms</span><span>${escapeHTML(inv.terms||settings.defaultTerms)}</span></div><div class="detail-row"><span>Due date</span><span>${escapeHTML(inv.dueDate||'')}</span></div>${inv.shipVia?`<div class="detail-row"><span>Ship via</span><span>${escapeHTML(inv.shipVia)}</span></div>`:''}${inv.trackingNo?`<div class="detail-row"><span>Tracking</span><span>${escapeHTML(inv.trackingNo)}</span></div>`:''}`;
    return `<div class="invoice-doc-wrap"><article class="invoice-document ${escapeHTML(template)}" style="--invoice-accent:${escapeHTML(accent)}"><div class="accent-bar"></div><div class="doc-body"><div class="invoice-doc-top"><div><div class="invoice-logo">${escapeHTML(settings.logoText||'LOGO')}</div><div class="company-block"><strong>${escapeHTML(settings.companyName||state.company.name)}</strong><br>${escapeHTML(settings.address||'').replace(/\n/g,'<br>')}<br><br><strong>Phone</strong> ${escapeHTML(settings.phone||'')}<br><strong>Email</strong> ${escapeHTML(settings.email||'')}<br><strong>Website</strong> ${escapeHTML(settings.website||'')}</div></div><div class="invoice-meta-title"><h1>Invoice</h1><div style="text-align:right"><div class="invoice-balance-label">Balance due</div><div class="invoice-balance">${money(balance)}</div><div>${tagForStatus(invoiceDisplayStatus(inv))}</div></div></div></div><div class="invoice-info-band"><div><h2>Bill to</h2><p>${escapeHTML(billTo).replace(/\n/g,'<br>')}</p></div>${settings.showShipping?`<div><h2>Ship to</h2><p>${escapeHTML(shipTo).replace(/\n/g,'<br>')||'â€”'}</p></div>`:''}<div><h2>Details</h2>${detailRows}</div></div>${invoiceItemRows(inv, settings)}<div class="invoice-doc-bottom"><div><div class="invoice-message"><strong>Customer message</strong><br>${escapeHTML(inv.customerMessage||settings.defaultMessage)}</div>${settings.showPaymentInstructions?`<div class="invoice-message"><strong>Payment instructions</strong><br>${escapeHTML(inv.paymentInstructions||settings.paymentInstructions)}</div>`:''}</div><div class="invoice-totals"><div class="report-line"><span>Subtotal</span><strong>${money(lineSubtotal)}</strong></div><div class="report-line"><span>Sales tax</span><strong>${money(num(inv.tax))}</strong></div><div class="report-line"><span>Shipping</span><strong>${money(num(inv.shipping))}</strong></div><div class="report-line total"><span>Total</span><span>${money(invoiceTotal(inv))}</span></div><div class="report-line"><span>Paid</span><strong>${money(num(inv.paid))}</strong></div><div class="report-line"><span>Balance due</span><strong>${money(balance)}</strong></div></div></div></div><div class="invoice-footer"><span>${escapeHTML(settings.footerNote||'')}</span><span>${escapeHTML(templateName(template))} template</span></div></article></div>`;
  }

  invoicePrintHTML = function(inv){ return professionalInvoiceHTML(inv); };
  function invoiceDetailHTML61(inv){
    const cust=getCustomer(inv.customerId); const payments=invoicePayments(inv);
    return `<div class="invoice-detail-grid"><div class="invoice-summary-box"><h3>Invoice summary</h3><div class="report-line"><span>Customer</span><strong>${escapeHTML(cust.name)}</strong></div><div class="report-line"><span>Template</span><strong>${templateName(inv.template||invoiceSettings().template)}</strong></div><div class="report-line"><span>Terms</span><strong>${escapeHTML(inv.terms||invoiceSettings().defaultTerms)}</strong></div><div class="report-line"><span>Status</span><strong>${tagForStatus(invoiceDisplayStatus(inv))}</strong></div><div class="report-line"><span>Total</span><strong>${money(invoiceTotal(inv))}</strong></div><div class="report-line"><span>Open balance</span><strong>${money(openAmount(inv))}</strong></div></div><div class="invoice-summary-box"><h3>Sent tracking</h3><div class="report-line"><span>Email status</span><strong>${escapeHTML(inv.emailStatus||'Draft')}</strong></div><div class="report-line"><span>Sent date</span><strong>${escapeHTML(inv.sentDate||'â€”')}</strong></div><div class="report-line"><span>Last viewed</span><strong>${escapeHTML(inv.lastViewed||'â€”')}</strong></div><div class="report-line"><span>Reminders</span><strong>${num(inv.reminderCount)}</strong></div><div class="report-line"><span>Delivery</span><strong>${escapeHTML(inv.deliveryMethod||'Email')}</strong></div></div></div><div style="margin-top:14px">${professionalInvoiceHTML(inv)}</div><div class="card table-card" style="margin-top:14px"><div class="toolbar"><h3 style="margin:0">Linked payments</h3></div>${table(['Payment','Date','Account','Amount','Memo'], payments.map(p=>[p.id,p.date,escapeHTML(getBank(p.accountId)?.name||p.accountId),money(p.amount),escapeHTML(p.memo||'')]))}</div>`;
  }
  invoiceDetailHTML = invoiceDetailHTML61;

  function invoiceCustomizeHTML(){
    const s=invoiceSettings();
    return `<div class="form-grid"><div class="field"><label>Default template</label><select name="template">${invoiceTemplateOptions(s.template)}</select></div><div class="field"><label>Accent color</label><div class="color-input-row"><input type="color" name="accentColor" value="${escapeHTML(s.accentColor)}"><input name="accentColorText" value="${escapeHTML(s.accentColor)}"></div></div><div class="field"><label>Logo text</label><input name="logoText" value="${escapeHTML(s.logoText)}"></div><div class="field"><label>Company name</label><input name="companyName" value="${escapeHTML(s.companyName)}"></div><div class="field full"><label>Company address</label><textarea name="address">${escapeHTML(s.address)}</textarea></div><div class="field"><label>Phone</label><input name="phone" value="${escapeHTML(s.phone)}"></div><div class="field"><label>Email</label><input name="email" value="${escapeHTML(s.email)}"></div><div class="field"><label>Website</label><input name="website" value="${escapeHTML(s.website)}"></div><div class="field"><label>Default terms</label><input name="defaultTerms" value="${escapeHTML(s.defaultTerms)}"></div><div class="field full"><label>Default customer message</label><textarea name="defaultMessage">${escapeHTML(s.defaultMessage)}</textarea></div><div class="field full"><label>Payment instructions</label><textarea name="paymentInstructions">${escapeHTML(s.paymentInstructions)}</textarea></div><div class="field full"><label>Footer note</label><textarea name="footerNote">${escapeHTML(s.footerNote)}</textarea></div><div class="field full"><label>Display options</label><div class="widget-list"><label class="widget-option"><input type="checkbox" name="showShipping" ${s.showShipping?'checked':''}> Show shipping address</label><label class="widget-option"><input type="checkbox" name="showSku" ${s.showSku?'checked':''}> Show SKU column</label><label class="widget-option"><input type="checkbox" name="showTaxColumn" ${s.showTaxColumn?'checked':''}> Show tax column</label><label class="widget-option"><input type="checkbox" name="showPaymentInstructions" ${s.showPaymentInstructions?'checked':''}> Show payment instructions</label></div></div></div><div class="invoice-settings-preview" style="margin-top:14px"><strong>Template choices:</strong> Standard, Service, Product, Contractor, Commercial, and Minimal. The print preview uses Letter-size formatting and browser print/save-as-PDF.</div>`;
  }

  function invoiceSendHTML(inv){
    const cust=getCustomer(inv.customerId); const s=invoiceSettings();
    return `<div class="form-grid"><div class="field"><label>To</label><input name="to" value="${escapeHTML(cust.email||'customer@example.com')}"></div><div class="field"><label>CC</label><input name="cc" placeholder="Optional"></div><div class="field full"><label>Subject</label><input name="subject" value="Invoice ${escapeHTML(inv.invoiceNo||inv.id)} from ${escapeHTML(s.companyName||state.company.name)}"></div><div class="field full"><label>Message</label><textarea name="message">Hi ${escapeHTML(cust.name)},\n\nPlease find invoice ${escapeHTML(inv.invoiceNo||inv.id)} for ${money(invoiceTotal(inv))}. The balance due is ${money(openAmount(inv))}.\n\n${escapeHTML(inv.customerMessage||s.defaultMessage)}</textarea></div><div class="field"><label>Attach invoice PDF</label><select name="attachPdf"><option value="true">Yes - attach PDF copy</option><option value="false">No</option></select></div><div class="field"><label>Send copy to myself</label><select name="sendCopy"><option value="true">Yes</option><option value="false">No</option></select></div></div><div class="send-preview"><strong>Send preview</strong><div class="report-line"><span>Invoice</span><strong>${escapeHTML(inv.id)}</strong></div><div class="report-line"><span>Template</span><strong>${templateName(inv.template||s.template)}</strong></div><div class="report-line"><span>Balance due</span><strong>${money(openAmount(inv))}</strong></div><div class="report-line"><span>Due date</span><strong>${escapeHTML(inv.dueDate||'')}</strong></div></div>`;
  }

  function invoiceCreateHTML(){
    const s=invoiceSettings();
    return `<div class="invoice-template-grid"><label class="invoice-template-card"><input type="radio" name="template" value="standard" ${s.template==='standard'?'checked':''}><div><strong>Standard</strong><span>General invoice with bill-to, ship-to, details, line items, tax, and balance due.</span></div></label><label class="invoice-template-card"><input type="radio" name="template" value="service" ${s.template==='service'?'checked':''}><div><strong>Service</strong><span>Better for consulting, hourly work, retainers, and professional service descriptions.</span></div></label><label class="invoice-template-card"><input type="radio" name="template" value="product" ${s.template==='product'?'checked':''}><div><strong>Product</strong><span>Better for product/service rows, SKU visibility, quantity, rate, tax, and shipping.</span></div></label></div><div class="form-grid three"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Invoice date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(30)}"></div><div class="field"><label>Terms</label><input name="terms" value="${escapeHTML(s.defaultTerms)}"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option>Sent</option></select></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field"><label>Product / service</label><select name="productId">${productOptions()}</select></div><div class="field"><label>Quantity / hours</label><input type="number" step="0.01" name="qty" value="1"></div><div class="field"><label>Rate</label><input type="number" step="0.01" name="rate" value="125"></div><div class="field full"><label>Description</label><input name="desc" value="Professional service"></div><div class="field"><label>Shipping</label><input type="number" step="0.01" name="shipping" value="0"></div><div class="field"><label>Income account</label><select name="incomeAccountId">${accountOptions(['Income'])}</select></div><div class="field full"><label>Customer message</label><textarea name="customerMessage">${escapeHTML(s.defaultMessage)}</textarea></div><div class="field full"><label>Payment instructions</label><textarea name="paymentInstructions">${escapeHTML(s.paymentInstructions)}</textarea></div></div>`;
  }

  function renderInvoiceCenter(){
    const rows=getInvoiceCenterInvoices(), s=invoiceSettings();
    return `<div class="card"><div class="toolbar"><div><h3 style="margin:0">Invoice Center</h3><div class="muted small">View sent invoices, apply professional templates, track delivery, print/PDF, send, and export invoice reports.</div></div><div class="right"><button class="btn" data-action="clear-invoice-filters">Clear filters</button><button class="btn" data-action="export-invoices-csv">Export CSV</button><button class="btn" data-modal="invoiceCustomize">Customize invoice</button><button class="btn primary" data-modal="invoice">Create invoice</button></div></div><div class="invoice-center-controls"><span class="template-chip">Current template: ${templateName(s.template)}</span><select data-invoice-template>${invoiceTemplateOptions(s.template)}</select><button class="btn soft" data-action="preview-template">Preview template</button></div>${renderInvoiceMoneybar()}${renderInvoiceFilters()}<div class="table-card">${table(['Invoice','Customer','Invoice date','Due date','Template','Status','Sent tracking','Total','Open balance','Actions'], rows.map(i=>{ const customer=getCustomer(i.customerId); const track=`<div><span class="tracking-chip">${escapeHTML(i.emailStatus||'Draft')}</span><div class="muted small" style="margin-top:4px">Sent: ${escapeHTML(i.sentDate||'â€”')} Â· Viewed: ${escapeHTML(i.lastViewed||'â€”')} Â· Reminders: ${num(i.reminderCount)}</div></div>`; return [`<strong>${i.id}</strong>`,escapeHTML(customer.name),i.date,i.dueDate,templateName(i.template||s.template),tagForStatus(invoiceDisplayStatus(i)),track,`<span class="amount">${money(invoiceTotal(i))}</span>`,`<span class="amount">${money(openAmount(i))}</span>`,renderInvoiceActions(i)]; }))}</div>${invoiceReportsHTML(rows)}</div>`;
  }

  const v61ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    if(type==='invoice') return invoiceCreateHTML();
    if(type==='invoiceDetail') return invoiceDetailHTML(activeInvoice());
    if(type==='invoicePrint') return invoicePrintHTML(activeInvoice());
    if(type==='invoiceCustomize') return invoiceCustomizeHTML();
    if(type==='invoiceSend') return invoiceSendHTML(activeInvoice());
    if(type==='invoiceEdit'){
      const inv=activeInvoice();
      return `<div class="form-grid"><div class="field"><label>Invoice</label><input value="${escapeHTML(inv.id)}" readonly></div><div class="field"><label>Customer</label><input value="${escapeHTML(getCustomer(inv.customerId).name)}" readonly></div><div class="field"><label>Template</label><select name="template">${invoiceTemplateOptions(inv.template||invoiceSettings().template)}</select></div><div class="field"><label>Terms</label><input name="terms" value="${escapeHTML(inv.terms||invoiceSettings().defaultTerms)}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${escapeHTML(inv.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select name="status"><option ${invoiceDisplayStatus(inv)==='Draft'?'selected':''}>Draft</option><option ${invoiceDisplayStatus(inv)==='Sent'?'selected':''}>Sent</option><option ${invoiceDisplayStatus(inv)==='Viewed'?'selected':''}>Viewed</option><option ${invoiceDisplayStatus(inv)==='Overdue'?'selected':''}>Overdue</option><option ${invoiceDisplayStatus(inv)==='Paid'?'selected':''}>Paid</option><option ${invoiceDisplayStatus(inv)==='Void'?'selected':''}>Void</option></select></div><div class="field"><label>Email status</label><select name="emailStatus"><option ${inv.emailStatus==='Draft'?'selected':''}>Draft</option><option ${inv.emailStatus==='Sent'?'selected':''}>Sent</option><option ${inv.emailStatus==='Delivered'?'selected':''}>Delivered</option><option ${inv.emailStatus==='Viewed'?'selected':''}>Viewed</option><option ${inv.emailStatus==='Bounced'?'selected':''}>Bounced</option><option ${inv.emailStatus==='Void'?'selected':''}>Void</option></select></div><div class="field"><label>Sent date</label><input type="date" name="sentDate" value="${escapeHTML(inv.sentDate||'')}"></div><div class="field"><label>Last viewed</label><input type="date" name="lastViewed" value="${escapeHTML(inv.lastViewed||'')}"></div><div class="field"><label>Reminder count</label><input type="number" min="0" name="reminderCount" value="${num(inv.reminderCount)}"></div><div class="field"><label>Shipping</label><input type="number" step="0.01" name="shipping" value="${num(inv.shipping)}"></div><div class="field"><label>Ship via</label><input name="shipVia" value="${escapeHTML(inv.shipVia||'')}"></div><div class="field"><label>Tracking no.</label><input name="trackingNo" value="${escapeHTML(inv.trackingNo||'')}"></div><div class="field full"><label>Bill-to address</label><textarea name="billToAddress">${escapeHTML(inv.billToAddress||'')}</textarea></div><div class="field full"><label>Ship-to address</label><textarea name="shipTo">${escapeHTML(inv.shipTo||'')}</textarea></div><div class="field full"><label>Customer message</label><textarea name="customerMessage">${escapeHTML(inv.customerMessage||invoiceSettings().defaultMessage)}</textarea></div><div class="field full"><label>Payment instructions</label><textarea name="paymentInstructions">${escapeHTML(inv.paymentInstructions||invoiceSettings().paymentInstructions)}</textarea></div></div>`;
    }
    return v61ModalBodyBase(type);
  };

  const v61OpenModalBase = openModal;
  openModal = function(type){
    v61OpenModalBase(type);
    const modal=document.querySelector('.modal'); modal?.classList.toggle('wide', ['invoicePrint','invoiceDetail','invoiceCustomize'].includes(type));
    const labels={invoice:['Create professional invoice','Choose a template, enter invoice details, and generate a customer-facing invoice.'], invoiceCustomize:['Customize invoice templates','Set logo, company details, default terms, customer message, payment instructions, and display options.'], invoiceSend:['Send invoice','Compose the invoice email and mark the invoice as sent.'], invoicePrint:['Print / PDF invoice','Preview the professional invoice. Use browser print to save as PDF.'], invoiceDetail:['Invoice detail','Review customer-facing invoice, sent tracking, payments, and ledger impact.']};
    if(labels[type]){ document.getElementById('modalTitle').textContent=labels[type][0]; document.getElementById('modalSubtitle').textContent=labels[type][1]; }
    if(type==='invoice') document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Create invoice</button>';
    if(type==='invoiceCustomize') document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save invoice template</button>';
    if(type==='invoiceSend') document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Send invoice</button>';
    if(type==='invoicePrint') document.getElementById('modalFooter').innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn" data-modal="invoiceCustomize">Customize</button><button type="button" class="btn primary" data-action="browser-print-invoice" data-id="${activeInvoice().id}">Print / Save PDF</button>`;
    if(type==='invoiceDetail') document.getElementById('modalFooter').innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn" data-action="print-invoice" data-id="${activeInvoice().id}">Print/PDF</button><button type="button" class="btn" data-action="duplicate-invoice" data-id="${activeInvoice().id}">Duplicate</button><button type="button" class="btn" data-action="open-send-invoice" data-id="${activeInvoice().id}">Send</button>${openAmount(activeInvoice())>0?`<button type="button" class="btn primary" data-action="mark-paid" data-id="${activeInvoice().id}">Receive payment</button>`:''}`;
    document.getElementById('cancelModal')?.addEventListener('click', closeModal);
  };

  const v61SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='invoice'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries()); const prod=state.products.find(p=>p.id===data.productId); const code=getTaxCode(data.taxCodeId); const qty=num(data.qty), rate=num(data.rate || prod?.price), subtotal=qty*rate, tax=calcTax(subtotal,data.taxCodeId), shipping=num(data.shipping); const cust=getCustomer(data.customerId);
      const inv={id:uid('INV'), invoiceNo:'INV-'+String(Date.now()).slice(-6), customerId:data.customerId, date:data.date, dueDate:data.dueDate, status:data.status, subtotal, tax, shipping, paid:0, incomeAccountId:data.incomeAccountId || prod?.incomeAccountId || '4000', taxCodeId:data.taxCodeId, taxAgencyId:code.agencyId, taxRate:num(code.rate), template:data.template||invoiceSettings().template, terms:data.terms||invoiceSettings().defaultTerms, customerMessage:data.customerMessage, paymentInstructions:data.paymentInstructions, billToAddress:`${cust.name}\n${cust.company||''}\n${cust.email||''}`, shipTo:cust.company||cust.name, emailStatus:data.status==='Sent'?'Sent':'Draft', sentDate:data.status==='Sent'?todayISO():'', lastViewed:'', reminderCount:0, deliveryMethod:'Email', items:[{product:prod?.name||'Service', sku:prod?.id||'', desc:data.desc, qty, rate, amount:subtotal, taxCodeId:data.taxCodeId, taxAmount:tax}]};
      state.invoices.unshift(inv); audit(`Professional invoice ${inv.id} created with ${templateName(inv.template)} template and tax code ${code.code}`); state.settings.activeInvoiceId=inv.id; state.settings.salesTab='invoices'; saveState(); closeModal(); renderAll(); showToast('Professional invoice created.'); return;
    }
    if(currentModal==='invoiceCustomize'){
      e.preventDefault(); const f=new FormData(e.target), d=Object.fromEntries(f.entries()); const color=d.accentColorText || d.accentColor || '#008c95';
      state.invoiceSettings={...invoiceSettings(), template:d.template, accentColor:color, logoText:d.logoText, companyName:d.companyName, address:d.address, phone:d.phone, email:d.email, website:d.website, defaultTerms:d.defaultTerms, defaultMessage:d.defaultMessage, paymentInstructions:d.paymentInstructions, footerNote:d.footerNote, showShipping:f.has('showShipping'), showSku:f.has('showSku'), showTaxColumn:f.has('showTaxColumn'), showPaymentInstructions:f.has('showPaymentInstructions')};
      audit('Invoice template settings updated'); saveState(); closeModal(); renderAll(); showToast('Invoice template settings saved.'); return;
    }
    if(currentModal==='invoiceSend'){
      e.preventDefault(); const f=new FormData(e.target), d=Object.fromEntries(f.entries()), inv=activeInvoice(); if(!inv){showToast('No invoice selected.'); return;}
      inv.status=openAmount(inv)>0?'Sent':'Paid'; inv.emailStatus='Sent'; inv.sentDate=todayISO(); inv.deliveryMethod='Email'; inv.sentTo=d.to; inv.sentSubject=d.subject; inv.sentMessage=d.message; inv.attachPdf=d.attachPdf==='true'; inv.sendCopy=d.sendCopy==='true'; audit(`Invoice ${inv.id} sent to ${d.to}`); saveState(); closeModal(); renderAll(); showToast(`${inv.id} marked as sent to ${d.to}.`); return;
    }
    if(currentModal==='invoiceEdit'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries()), inv=activeInvoice(); if(!inv){ showToast('No invoice selected.'); return; }
      inv.template=data.template; inv.terms=data.terms; inv.dueDate=data.dueDate; inv.status=data.status; inv.emailStatus=data.emailStatus; inv.sentDate=data.sentDate; inv.lastViewed=data.lastViewed; inv.reminderCount=num(data.reminderCount); inv.shipping=num(data.shipping); inv.shipVia=data.shipVia; inv.trackingNo=data.trackingNo; inv.billToAddress=data.billToAddress; inv.shipTo=data.shipTo; inv.customerMessage=data.customerMessage; inv.paymentInstructions=data.paymentInstructions;
      if(inv.status==='Paid' && openAmount(inv)>0) inv.status='Sent'; audit(`Invoice ${inv.id} template/tracking updated`); saveState(); closeModal(); renderAll(); showToast('Invoice template and tracking updated.'); return;
    }
    return v61SubmitModalBase(e);
  };

  const v61SendInvoiceBase = sendInvoice;
  sendInvoice = function(id){ setActiveInvoice(id); openModal('invoiceSend'); };

  const v61HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='open-send-invoice'){ setActiveInvoice(id); openModal('invoiceSend'); return; }
    if(action==='send-invoice'){ setActiveInvoice(id); openModal('invoiceSend'); return; }
    if(action==='preview-template'){ setActiveInvoice(state.invoices[0]?.id); openModal('invoicePrint'); return; }
    return v61HandleActionBase(action,id);
  };

  const v61SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v61SetupEventListenersBase();
    document.addEventListener('change', e=>{
      const template=e.target.closest('[data-invoice-template]'); if(template){ state.invoiceSettings.template=template.value; saveState(); renderSales(); showToast(`Default invoice template set to ${templateName(template.value)}.`); }
    });
    document.addEventListener('input', e=>{
      if(e.target.name==='accentColor' && document.querySelector('input[name="accentColorText"]')) document.querySelector('input[name="accentColorText"]').value=e.target.value;
      if(e.target.name==='accentColorText' && document.querySelector('input[name="accentColor"]') && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) document.querySelector('input[name="accentColor"]').value=e.target.value;
    });
  };



  // ---------- V6.2 Invoice Print/PDF cleanup, one-page print isolation, and real logo upload ----------
  function stripVersionText(v){ return String(v||'').replace(/\s*-\s*V\d+(?:\.\d+)?/gi,'').replace(/\bV\d+(?:\.\d+)?\b/gi,'').replace(/\s{2,}/g,' ').trim(); }

  const v62EnsureV6StateBase = ensureV6State;
  ensureV6State = function(){
    v62EnsureV6StateBase();
    state.company.name = stripVersionText(state.company.name) || 'Your Company';
    state.invoiceSettings ||= {};
    state.invoiceSettings.companyName = stripVersionText(state.invoiceSettings.companyName || state.company.name) || 'Your Company';
    state.invoiceSettings.logoText = stripVersionText(state.invoiceSettings.logoText || 'LOGO') || 'LOGO';
    state.invoiceSettings.logoImageData ||= '';
    state.invoiceSettings.footerNote = stripVersionText(state.invoiceSettings.footerNote || 'This invoice was generated in SmartBooks. Please contact us if you have questions about this invoice.');
  };

  function invoiceLogoHTML(settings){
    if(settings.logoImageData){
      return `<div class="invoice-logo has-image"><img alt="Company logo" src="${escapeHTML(settings.logoImageData)}"></div>`;
    }
    return `<div class="invoice-logo">${escapeHTML(settings.logoText||'LOGO')}</div>`;
  }

  invoiceItemRows = function(inv, settings){
    const showSku = settings.showSku || (inv.template==='product');
    const showTax = settings.showTaxColumn !== false;
    const lineCols = [];
    if(showSku) lineCols.push({h:'SKU', v:l=>escapeHTML(l.sku||'â€”'), num:false});
    lineCols.push({h:'Product / service', v:l=>escapeHTML(l.product||'Service'), num:false});
    lineCols.push({h:'Description', v:l=>`<div>${escapeHTML(l.desc||'Item')}</div>${l.taxCodeId?`<div class="muted-line">Tax code: ${escapeHTML(invoiceTaxCodeLabel(l.taxCodeId))}</div>`:''}`, num:false});
    lineCols.push({h:inv.template==='service'?'Hours':'Qty', v:l=>num(l.qty), num:true});
    lineCols.push({h:'Rate', v:l=>money(num(l.rate)), num:true});
    lineCols.push({h:'Amount', v:l=>money(num(l.amount ?? num(l.qty)*num(l.rate))), num:true});
    if(showTax) lineCols.push({h:'Tax', v:l=>money(num(l.taxAmount||0)), num:true});
    const body = (inv.items||[]).map(l=>`<tr>${lineCols.map(col=>`<td class="${col.num?'num':''}">${col.v(l)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${lineCols.length}" class="muted">No line items.</td></tr>`;
    return `<table class="invoice-lines"><thead><tr>${lineCols.map(col=>`<th class="${col.num?'num':''}">${col.h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  };

  professionalInvoiceHTML = function(inv){
    const settings=invoiceSettings(), cust=getCustomer(inv.customerId), template=inv.template || settings.template || 'standard', accent=inv.accentColor || settings.accentColor;
    const companyName = stripVersionText(settings.companyName || state.company.name) || 'Your Company';
    const billTo = inv.billToAddress || `${cust.name}\n${cust.company||''}\n${cust.email||''}`;
    const shipTo = inv.shipTo || cust.company || cust.name || '';
    const balance = openAmount(inv), lineSubtotal=(inv.items||[]).reduce((s,l)=>s+num(l.amount),0) || num(inv.subtotal);
    const showShipping = settings.showShipping !== false;
    const detailRows = `<div class="detail-row"><span>Invoice #</span><strong>${escapeHTML(inv.invoiceNo||inv.id)}</strong></div><div class="detail-row"><span>Invoice date</span><span>${escapeHTML(inv.date||'')}</span></div><div class="detail-row"><span>Terms</span><span>${escapeHTML(inv.terms||settings.defaultTerms)}</span></div><div class="detail-row"><span>Due date</span><span>${escapeHTML(inv.dueDate||'')}</span></div>${inv.shipVia?`<div class="detail-row"><span>Ship via</span><span>${escapeHTML(inv.shipVia)}</span></div>`:''}${inv.trackingNo?`<div class="detail-row"><span>Tracking</span><span>${escapeHTML(inv.trackingNo)}</span></div>`:''}`;
    const infoStyle = showShipping ? '' : ' style="grid-template-columns:1fr 1.1fr"';
    const footerNote = stripVersionText(settings.footerNote || 'This invoice was generated in SmartBooks. Please contact us if you have questions about this invoice.');
    return `<div class="invoice-doc-wrap"><article class="invoice-document ${escapeHTML(template)}" style="--invoice-accent:${escapeHTML(accent)}"><div class="accent-bar"></div><div class="doc-body"><div class="invoice-doc-top"><div>${invoiceLogoHTML(settings)}<div class="company-block"><strong>${escapeHTML(companyName)}</strong><br>${escapeHTML(settings.address||'').replace(/\n/g,'<br>')}<br><br><strong>Phone</strong> ${escapeHTML(settings.phone||'')}<br><strong>Email</strong> ${escapeHTML(settings.email||'')}<br><strong>Website</strong> ${escapeHTML(settings.website||'')}</div></div><div class="invoice-meta-title"><h1>Invoice</h1><div style="text-align:right"><div class="invoice-balance-label">Balance due</div><div class="invoice-balance">${money(balance)}</div><div>${tagForStatus(invoiceDisplayStatus(inv))}</div></div></div></div><div class="invoice-info-band"${infoStyle}><div><h2>Bill to</h2><p>${escapeHTML(billTo).replace(/\n/g,'<br>')}</p></div>${showShipping?`<div><h2>Ship to</h2><p>${escapeHTML(shipTo).replace(/\n/g,'<br>')||'â€”'}</p></div>`:''}<div><h2>Details</h2>${detailRows}</div></div>${invoiceItemRows(inv, settings)}<div class="invoice-doc-bottom"><div><div class="invoice-message"><strong>Customer message</strong><br>${escapeHTML(inv.customerMessage||settings.defaultMessage)}</div>${settings.showPaymentInstructions?`<div class="invoice-message"><strong>Payment instructions</strong><br>${escapeHTML(inv.paymentInstructions||settings.paymentInstructions)}</div>`:''}</div><div class="invoice-totals"><div class="report-line"><span>Subtotal</span><strong>${money(lineSubtotal)}</strong></div><div class="report-line"><span>Sales tax</span><strong>${money(num(inv.tax))}</strong></div><div class="report-line"><span>Shipping</span><strong>${money(num(inv.shipping))}</strong></div><div class="report-line total"><span>Total</span><span>${money(invoiceTotal(inv))}</span></div><div class="report-line"><span>Paid</span><strong>${money(num(inv.paid))}</strong></div><div class="report-line"><span>Balance due</span><strong>${money(balance)}</strong></div></div></div></div><div class="invoice-footer">${escapeHTML(footerNote)}</div></article></div>`;
  };
  invoicePrintHTML = function(inv){ return professionalInvoiceHTML(inv); };

  const v62InvoiceCustomizeHTMLBase = invoiceCustomizeHTML;
  invoiceCustomizeHTML = function(){
    const s=invoiceSettings();
    const logoPreview = s.logoImageData ? `<img alt="Company logo preview" src="${escapeHTML(s.logoImageData)}">` : escapeHTML(s.logoText||'LOGO');
    return `<div class="logo-upload-row"><div class="logo-upload-preview" id="logoUploadPreview">${logoPreview}</div><div><strong>Company logo</strong><div class="logo-upload-help">Upload a PNG, JPG, or SVG logo. It is saved in this browser and used automatically on invoice print/PDF layouts.</div><input type="file" name="logoUpload" accept="image/png,image/jpeg,image/svg+xml,image/webp" style="margin-top:10px"><label class="widget-option" style="margin-top:8px"><input type="checkbox" name="removeLogo"> Remove saved logo</label></div></div>` +
      `<div class="form-grid"><div class="field"><label>Default template</label><select name="template">${invoiceTemplateOptions(s.template)}</select></div><div class="field"><label>Accent color</label><div class="color-input-row"><input type="color" name="accentColor" value="${escapeHTML(s.accentColor)}"><input name="accentColorText" value="${escapeHTML(s.accentColor)}"></div></div><div class="field"><label>Logo text / initials</label><input name="logoText" value="${escapeHTML(s.logoText)}"></div><div class="field"><label>Company name</label><input name="companyName" value="${escapeHTML(stripVersionText(s.companyName||state.company.name))}"></div><div class="field full"><label>Company address</label><textarea name="address">${escapeHTML(s.address)}</textarea></div><div class="field"><label>Phone</label><input name="phone" value="${escapeHTML(s.phone)}"></div><div class="field"><label>Email</label><input name="email" value="${escapeHTML(s.email)}"></div><div class="field"><label>Website</label><input name="website" value="${escapeHTML(s.website)}"></div><div class="field"><label>Default terms</label><input name="defaultTerms" value="${escapeHTML(s.defaultTerms)}"></div><div class="field full"><label>Default customer message</label><textarea name="defaultMessage">${escapeHTML(s.defaultMessage)}</textarea></div><div class="field full"><label>Payment instructions</label><textarea name="paymentInstructions">${escapeHTML(s.paymentInstructions)}</textarea></div><div class="field full"><label>Footer note</label><textarea name="footerNote">${escapeHTML(stripVersionText(s.footerNote))}</textarea></div><div class="field full"><label>Display options</label><div class="widget-list"><label class="widget-option"><input type="checkbox" name="showShipping" ${s.showShipping?'checked':''}> Show shipping address</label><label class="widget-option"><input type="checkbox" name="showSku" ${s.showSku?'checked':''}> Show SKU column</label><label class="widget-option"><input type="checkbox" name="showTaxColumn" ${s.showTaxColumn?'checked':''}> Show tax column</label><label class="widget-option"><input type="checkbox" name="showPaymentInstructions" ${s.showPaymentInstructions?'checked':''}> Show payment instructions</label></div></div></div><div class="invoice-settings-preview" style="margin-top:14px"><strong>Print/PDF cleanup:</strong> customer-facing invoices print as a single isolated document, with version text removed and footer/totals spacing protected.</div>`;
  };

  function saveInvoiceCustomizeForm(formData, logoData){
    const d=Object.fromEntries(formData.entries()); const color=d.accentColorText || d.accentColor || '#008c95';
    const next={...invoiceSettings(), template:d.template, accentColor:color, logoText:stripVersionText(d.logoText || 'LOGO') || 'LOGO', companyName:stripVersionText(d.companyName || state.company.name) || 'Your Company', address:d.address, phone:d.phone, email:d.email, website:d.website, defaultTerms:d.defaultTerms, defaultMessage:d.defaultMessage, paymentInstructions:d.paymentInstructions, footerNote:stripVersionText(d.footerNote), showShipping:formData.has('showShipping'), showSku:formData.has('showSku'), showTaxColumn:formData.has('showTaxColumn'), showPaymentInstructions:formData.has('showPaymentInstructions')};
    if(formData.has('removeLogo')) next.logoImageData=''; else if(logoData) next.logoImageData=logoData;
    state.invoiceSettings=next; state.company.name=stripVersionText(state.company.name)||'Your Company';
    audit('Invoice branding and print/PDF settings updated'); saveState(); closeModal(); renderAll(); showToast('Invoice branding saved.');
  }

  const v62SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='invoiceCustomize'){
      e.preventDefault(); const formData=new FormData(e.target); const file=formData.get('logoUpload');
      if(file && file.size>0){ const reader=new FileReader(); reader.onload=()=>saveInvoiceCustomizeForm(formData, reader.result); reader.onerror=()=>{showToast('Logo upload failed. Settings were not saved.');}; reader.readAsDataURL(file); }
      else saveInvoiceCustomizeForm(formData, '');
      return;
    }
    return v62SubmitModalBase(e);
  };

  function printInvoiceOnly(id){
    const inv=state.invoices.find(i=>i.id===id) || activeInvoice(); if(!inv){ showToast('No invoice selected.'); return; }
    const markup=professionalInvoiceHTML(inv);
    const css=`@page{size:letter;margin:0.45in}*{box-sizing:border-box}body{margin:0;background:#fff;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.35}.invoice-doc-wrap{background:#fff;padding:0;overflow:visible}.invoice-document{width:100%;max-width:7.6in;margin:0 auto;background:#fff;color:#1f2937;border:0;box-shadow:none;position:relative;font-size:12px;line-height:1.35;overflow:visible;min-height:auto}.accent-bar{height:8px;background:var(--invoice-accent,#008c95);margin-bottom:26px}.doc-body{padding:0}.invoice-doc-top{display:grid;grid-template-columns:1.1fr .9fr;gap:26px;margin-bottom:28px}.invoice-logo{width:126px;height:72px;border:1px dashed #b8c4cf;display:grid;place-items:center;font-size:26px;font-weight:900;color:#2f3437;margin-bottom:12px;text-align:center;overflow:hidden}.invoice-logo.has-image{border:0;width:150px;height:82px;display:flex;align-items:center;justify-content:flex-start;background:transparent}.invoice-logo img{max-width:150px;max-height:82px;object-fit:contain}.company-block{font-size:12px;color:#344054}.company-block strong{font-size:13px;color:#111827}.invoice-meta-title{display:grid;gap:18px;justify-items:end}.invoice-meta-title h1{margin:0;font-size:34px;letter-spacing:-.03em;text-align:right;color:#2f3437}.invoice-balance{font-size:34px;font-weight:900;letter-spacing:-.04em}.invoice-balance-label{font-size:11px;color:#667085;text-transform:uppercase;letter-spacing:.08em;font-weight:900}.tag{display:inline-flex;border-radius:999px;padding:3px 8px;background:#eef3f6;color:#344054;font-size:11px;font-weight:800}.tag.good{background:#e8f6ee;color:#0b6b32}.tag.warn{background:#fff2cc;color:#8a5a00}.tag.bad{background:#fdecec;color:#a61616}.invoice-info-band{display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:18px;background:#f1f3f5;padding:18px 20px;margin:0 0 22px;border-radius:4px}.invoice-info-band h2{font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.04em;color:#344054}.invoice-info-band p{margin:0}.detail-row{display:grid;grid-template-columns:95px 1fr;gap:6px;margin-bottom:4px}.invoice-lines{width:100%;border-collapse:collapse;margin-top:8px}.invoice-lines th{font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:.04em;color:#344054;border-bottom:1px solid #dce3ea;padding:9px 8px;background:#fff}.invoice-lines td{border-bottom:1px solid #edf2f6;padding:9px 8px;vertical-align:top}.invoice-lines th.num,.invoice-lines td.num{text-align:right}.muted-line{color:#667085;font-size:11px;margin-top:2px}.invoice-doc-bottom{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;margin-top:24px;align-items:start;break-inside:avoid;page-break-inside:avoid}.invoice-message{border-top:1px solid #dce3ea;padding-top:12px;margin-bottom:12px;white-space:pre-line}.invoice-totals{break-inside:avoid;page-break-inside:avoid}.report-line{display:flex;justify-content:space-between;gap:14px;padding:7px 0;border-bottom:1px solid #edf2f6}.invoice-totals .total{border-top:2px solid #2f3437;border-bottom:0;padding-top:13px;margin-top:6px;font-size:18px;font-weight:900}.invoice-footer{position:static;margin:26px 0 0;border-top:1px solid #dce3ea;padding-top:12px;color:#667085;font-size:11px;line-height:1.4}button{display:none}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}`;
    let frame=document.getElementById('smartbooks-invoice-print-frame'); if(frame) frame.remove(); frame=document.createElement('iframe'); frame.id='smartbooks-invoice-print-frame'; frame.style.position='fixed'; frame.style.right='0'; frame.style.bottom='0'; frame.style.width='0'; frame.style.height='0'; frame.style.border='0'; document.body.appendChild(frame);
    const doc=frame.contentWindow.document; doc.open(); doc.write(`<!doctype html><html><head><title>Invoice ${escapeHTML(inv.invoiceNo||inv.id)}</title><style>${css}</style></head><body>${markup}<script>setTimeout(function(){window.focus();window.print();},250);<\/script></body></html>`); doc.close();
    setTimeout(()=>{ try{ frame.remove(); }catch(e){} }, 5000); showToast('Print/PDF opened for one invoice only.');
  }

  const v62HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='browser-print-invoice'){ printInvoiceOnly(id || activeInvoice()?.id); return; }
    return v62HandleActionBase(action,id);
  };

  const v62SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v62SetupEventListenersBase();
    document.addEventListener('change', e=>{
      if(e.target?.name==='logoUpload'){
        const file=e.target.files?.[0], preview=document.getElementById('logoUploadPreview'); if(!file || !preview) return;
        const reader=new FileReader(); reader.onload=()=>{ preview.innerHTML=`<img alt="Company logo preview" src="${escapeHTML(reader.result)}">`; }; reader.readAsDataURL(file);
      }
    });
  };


  // ---------- V6.3 Invoice logo persistence and global template rendering fix ----------
  // V6.2 saved the uploaded logo, but the V6.1 compatibility initializer rebuilt
  // invoiceSettings without carrying logoImageData forward. This wrapper preserves
  // the saved logo every time invoice settings are normalized, then all template,
  // detail, and print/PDF render paths read from the same global branding object.
  const v63EnsureV6StateBase = ensureV6State;
  ensureV6State = function(){
    const priorLogo = state?.invoiceSettings?.logoImageData || '';
    v63EnsureV6StateBase();
    state.invoiceSettings ||= {};
    if(priorLogo && !state.invoiceSettings.logoImageData) state.invoiceSettings.logoImageData = priorLogo;
    state.invoiceSettings.logoImageData ||= '';
    state.invoiceSettings.companyName = stripVersionText(state.invoiceSettings.companyName || state.company.name) || 'Your Company';
    state.invoiceSettings.logoText = stripVersionText(state.invoiceSettings.logoText || 'LOGO') || 'LOGO';
    state.invoiceSettings.footerNote = stripVersionText(state.invoiceSettings.footerNote || 'This invoice was generated in SmartBooks. Please contact us if you have questions about this invoice.');
  };

  function safeLogoData(settings){
    const s = settings || state.invoiceSettings || {};
    return s.logoImageData || state.invoiceSettings?.logoImageData || '';
  }

  invoiceLogoHTML = function(settings){
    const s = settings || invoiceSettings();
    const logoData = safeLogoData(s);
    if(logoData){
      return `<div class="invoice-logo has-image"><img alt="Company logo" src="${escapeHTML(logoData)}"></div>`;
    }
    return `<div class="invoice-logo">${escapeHTML(stripVersionText(s.logoText||'LOGO')||'LOGO')}</div>`;
  };

  invoiceCustomizeHTML = function(){
    const s=invoiceSettings();
    const logoData = safeLogoData(s);
    const logoPreview = logoData ? `<img alt="Company logo preview" src="${escapeHTML(logoData)}">` : escapeHTML(s.logoText||'LOGO');
    return `<div class="logo-upload-row"><div class="logo-upload-preview" id="logoUploadPreview">${logoPreview}</div><div><strong>Company logo</strong><div class="logo-upload-help">Upload a PNG, JPG, SVG, or WebP logo. The saved logo is used as global invoice branding, so it appears on every invoice template, invoice detail, and print/PDF preview.</div><input type="file" name="logoUpload" accept="image/png,image/jpeg,image/svg+xml,image/webp" style="margin-top:10px"><label class="widget-option" style="margin-top:8px"><input type="checkbox" name="removeLogo"> Remove saved logo</label></div></div>` +
      `<div class="form-grid"><div class="field"><label>Default template</label><select name="template">${invoiceTemplateOptions(s.template)}</select></div><div class="field"><label>Accent color</label><div class="color-input-row"><input type="color" name="accentColor" value="${escapeHTML(s.accentColor)}"><input name="accentColorText" value="${escapeHTML(s.accentColor)}"></div></div><div class="field"><label>Logo text / initials</label><input name="logoText" value="${escapeHTML(s.logoText)}"></div><div class="field"><label>Company name</label><input name="companyName" value="${escapeHTML(stripVersionText(s.companyName||state.company.name))}"></div><div class="field full"><label>Company address</label><textarea name="address">${escapeHTML(s.address)}</textarea></div><div class="field"><label>Phone</label><input name="phone" value="${escapeHTML(s.phone)}"></div><div class="field"><label>Email</label><input name="email" value="${escapeHTML(s.email)}"></div><div class="field"><label>Website</label><input name="website" value="${escapeHTML(s.website)}"></div><div class="field"><label>Default terms</label><input name="defaultTerms" value="${escapeHTML(s.defaultTerms)}"></div><div class="field full"><label>Default customer message</label><textarea name="defaultMessage">${escapeHTML(s.defaultMessage)}</textarea></div><div class="field full"><label>Payment instructions</label><textarea name="paymentInstructions">${escapeHTML(s.paymentInstructions)}</textarea></div><div class="field full"><label>Footer note</label><textarea name="footerNote">${escapeHTML(stripVersionText(s.footerNote))}</textarea></div><div class="field full"><label>Display options</label><div class="widget-list"><label class="widget-option"><input type="checkbox" name="showShipping" ${s.showShipping?'checked':''}> Show shipping address</label><label class="widget-option"><input type="checkbox" name="showSku" ${s.showSku?'checked':''}> Show SKU column</label><label class="widget-option"><input type="checkbox" name="showTaxColumn" ${s.showTaxColumn?'checked':''}> Show tax column</label><label class="widget-option"><input type="checkbox" name="showPaymentInstructions" ${s.showPaymentInstructions?'checked':''}> Show payment instructions</label></div></div></div><div class="invoice-settings-preview" style="margin-top:14px"><strong>Branding note:</strong> one saved logo is reused by all invoice templates, existing invoices, new invoices, invoice details, and the isolated print/PDF view.</div>`;
  };

  function readLogoData(file, onSuccess, onError){
    if(!file || !file.size){ onSuccess(''); return; }
    const allowed = ['image/png','image/jpeg','image/svg+xml','image/webp'];
    if(!allowed.includes(file.type)){
      onError && onError('Please upload a PNG, JPG, SVG, or WebP logo.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => onError && onError('Logo upload failed. Please try another image.');
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if(file.type === 'image/svg+xml' || dataUrl.length < 450000){ onSuccess(dataUrl); return; }
      const img = new Image();
      img.onload = () => {
        try{
          const maxW = 520, maxH = 260;
          const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
          const w = Math.max(1, Math.round(img.width * ratio));
          const h = Math.max(1, Math.round(img.height * ratio));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0,0,w,h);
          ctx.drawImage(img, 0, 0, w, h);
          let out = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
          if(out.length > 900000){
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0,0,w,h);
            out = canvas.toDataURL('image/jpeg', 0.86);
          }
          onSuccess(out);
        }catch(err){ onSuccess(dataUrl); }
      };
      img.onerror = () => onSuccess(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  saveInvoiceCustomizeForm = function(formData, logoData){
    const d=Object.fromEntries(formData.entries()); const color=d.accentColorText || d.accentColor || '#008c95';
    const current = invoiceSettings();
    const next={...current, template:d.template, accentColor:color, logoText:stripVersionText(d.logoText || 'LOGO') || 'LOGO', companyName:stripVersionText(d.companyName || state.company.name) || 'Your Company', address:d.address, phone:d.phone, email:d.email, website:d.website, defaultTerms:d.defaultTerms, defaultMessage:d.defaultMessage, paymentInstructions:d.paymentInstructions, footerNote:stripVersionText(d.footerNote), showShipping:formData.has('showShipping'), showSku:formData.has('showSku'), showTaxColumn:formData.has('showTaxColumn'), showPaymentInstructions:formData.has('showPaymentInstructions')};
    if(formData.has('removeLogo')) next.logoImageData='';
    else if(logoData) next.logoImageData=logoData;
    else next.logoImageData=current.logoImageData || '';
    state.invoiceSettings=next; state.company.name=stripVersionText(state.company.name)||'Your Company';
    audit('Invoice logo and branding settings updated');
    saveState(); closeModal(); renderAll(); saveState();
    showToast(next.logoImageData ? 'Logo saved and applied to all invoice templates.' : 'Invoice branding saved.');
  };

  const v63SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='invoiceCustomize'){
      e.preventDefault();
      const formData=new FormData(e.target); const file=formData.get('logoUpload');
      if(file && file.size>0){
        readLogoData(file, data=>saveInvoiceCustomizeForm(formData, data), msg=>showToast(msg));
      } else saveInvoiceCustomizeForm(formData, '');
      return;
    }
    return v63SubmitModalBase(e);
  };

  const v63SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v63SetupEventListenersBase();
    document.addEventListener('change', e=>{
      if(e.target?.name==='logoUpload'){
        const file=e.target.files?.[0], preview=document.getElementById('logoUploadPreview'); if(!file || !preview) return;
        readLogoData(file, data=>{ preview.innerHTML=`<img alt="Company logo preview" src="${escapeHTML(data)}">`; }, msg=>{ preview.textContent='LOGO'; showToast(msg); });
      }
    });
  };

  exportData = function(){ const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-company-data.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState = function(){ state = structuredClone(initialState); ensureV6State(); saveState(); renderAll(); showToast('Company data reset.'); };




  // ---------- V7 Inventory, Purchase Orders, Sales Orders, AP workflow ----------
  function ensureV7State(){
    ensureV6State();
    state.company.name = stripVersionText(state.company.name || 'Your Company') || 'Your Company';
    state.settings ||= {}; state.settings.inventoryTab ||= 'overview'; state.settings.expenseTab ||= 'bills';
    if(!state.products.some(p=>p.id==='P-3005')) state.products.push({id:'P-3005', name:'Wireless sensor gateway', type:'Product', price:680, incomeAccountId:'4010', qty:4});
    const defaults={
      'P-3001':['SERV-CONSULT',0,0,'V-2003',false], 'P-3002':['SERV-MAINT',0,0,'V-2003',false],
      'P-3003':['HW-KIT-001',260,8,'V-2001',true], 'P-3004':['SERV-IMPL',0,0,'V-2003',false], 'P-3005':['IOT-GW-100',390,5,'V-2001',true]
    };
    state.products.forEach(p=>{ const d=defaults[p.id]||[p.id,Math.round(num(p.price)*0.6),5,state.vendors[0]?.id,p.type==='Product']; p.sku ||= d[0]; p.avgCost=num(p.avgCost ?? d[1]); p.reorderPoint=num(p.reorderPoint ?? d[2]); p.preferredVendorId ||= d[3]; p.trackInventory = p.trackInventory ?? d[4]; p.assetAccountId ||= '1300'; p.cogsAccountId ||= '5000'; });
    state.purchaseOrders ||= [];
    if(!state.purchaseOrders.length){
      state.purchaseOrders.push({id:'PO-1001', vendorId:'V-2001', date:'2026-05-21', expectedDate:'2026-06-04', status:'Issued', productId:'P-3003', qty:15, receivedQty:0, unitCost:260, taxCodeId:'GST5', billId:null});
      state.purchaseOrders.push({id:'PO-1002', vendorId:'V-2001', date:'2026-05-22', expectedDate:'2026-06-05', status:'Draft', productId:'P-3005', qty:8, receivedQty:0, unitCost:390, taxCodeId:'GST5', billId:null});
    }
    state.receivingRecords ||= [];
    state.inventoryMovements ||= [
      {id:'IM-1001', date:'2026-05-01', type:'Opening balance', productId:'P-3003', qty:12, unitCost:260, cogsAmount:0, memo:'Opening inventory quantity'},
      {id:'IM-1002', date:'2026-05-01', type:'Opening balance', productId:'P-3005', qty:4, unitCost:390, cogsAmount:0, memo:'Opening inventory quantity'}
    ];
    state.salesOrders ||= [];
    if(!state.salesOrders.some(o=>o.id==='SO-1003')) state.salesOrders.push({id:'SO-1003', customerId:'C-1002', date:'2026-05-23', shipDate:'2026-06-08', status:'Confirmed', channel:'Direct sales', productId:'P-3003', qty:3, fulfilledQty:0, unitPrice:420, taxCodeId:'GST5', invoiceId:null});
    state.salesOrders.forEach(o=>{ o.productId ||= 'P-3003'; const p=getProduct(o.productId); o.qty=num(o.qty||1); o.unitPrice=num(o.unitPrice||p.price); o.fulfilledQty=num(o.fulfilledQty); o.taxCodeId ||= 'GST5'; o.total=soTotal(o); });
    state.apDocuments ||= [{id:'APDOC-1001', vendorId:'V-2001', date:'2026-05-24', dueDate:'2026-06-08', amount:325, taxCodeId:'GST5', tax:16.25, suggestedAccountId:'6000', status:'Submitted', fileName:'metro-office-supplies.pdf', memo:'Captured vendor invoice waiting for approval'}];
    state.bills.forEach(b=>{ b.approvalStatus ||= b.status==='Paid'?'Paid':'Approved'; b.source ||= b.purchaseOrderId?'PO conversion':'Manual bill'; });
    if(!state.setupTasks.some(t=>t.id==='inventory-cycle')) state.setupTasks.push({id:'inventory-cycle', group:'Operations', title:'Review inventory, purchase orders, sales orders, and three-way match', done:false, hidden:false, nav:'inventory'});
    // Products & Services setup data is initialized here, but the module remains hideable from menu customization.
  }
  function getProduct(id){ return state.products.find(p=>p.id===id) || {id, name:'Unknown product', sku:id, price:0, avgCost:0, qty:0, incomeAccountId:'4010'}; }
  function inventoryProducts(){ return state.products.filter(p=>p.type==='Product' || p.trackInventory); }
  function inventoryProductOptions(selected){ return inventoryProducts().map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${escapeHTML(p.sku||p.id)} Â· ${escapeHTML(p.name)} Â· available ${num(stockAvailable(p.id))}</option>`).join(''); }
  function stockCommitted(productId){ return state.salesOrders.filter(o=>o.productId===productId && !['Invoiced','Closed','Cancelled','Fulfilled'].includes(o.status)).reduce((s,o)=>s+Math.max(0,num(o.qty)-num(o.fulfilledQty)),0); }
  function stockAvailable(productId){ return num(getProduct(productId).qty)-stockCommitted(productId); }
  function inventoryValue(){ return inventoryProducts().reduce((s,p)=>s+num(p.qty)*num(p.avgCost),0); }
  function lowStockProducts(){ return inventoryProducts().filter(p=>stockAvailable(p.id)<=num(p.reorderPoint)); }
  function poSubtotal(po){ return num(po.qty)*num(po.unitCost); } function poTax(po){ return calcTax(poSubtotal(po),po.taxCodeId||'GST5'); } function poTotal(po){ return poSubtotal(po)+poTax(po); }
  function soSubtotal(o){ return num(o.qty)*num(o.unitPrice); } function soTax(o){ return calcTax(soSubtotal(o),o.taxCodeId||'GST5'); } function soTotal(o){ return soSubtotal(o)+soTax(o); }
  function poMatchStatus(po){ const bill=state.bills.find(b=>b.id===po.billId || b.purchaseOrderId===po.id); const q=num(po.receivedQty)>=num(po.qty); const p=!bill || Math.abs(num(bill.amount)-poSubtotal(po))<0.02; if(q&&bill&&p)return{label:'Matched',cls:'paid',detail:'PO, receiving, and bill agree'}; if(!q&&bill)return{label:'Missing receiving',cls:'overdue',detail:'Bill exists before full receipt'}; if(q&&!bill)return{label:'Missing bill',cls:'open',detail:'Inventory received but vendor bill is missing'}; if(!p)return{label:'Price variance',cls:'overdue',detail:'Bill amount does not match PO'}; return{label:'Open',cls:'open',detail:'Waiting for receiving and/or bill'}; }
  function renderOpsTabbar(active,tabs,action){ return `<div class="ops-tabbar">${tabs.map(([id,label])=>`<button class="ops-tab ${active===id?'active':''}" data-action="${action}" data-id="${id}">${escapeHTML(label)}</button>`).join('')}</div>`; }
  function inventoryKPIs(){ return `<div class="kpi-grid"><div class="kpi-card"><h4>Inventory value</h4><strong>${money(inventoryValue())}</strong><div class="hint">Qty Ã— average cost</div></div><div class="kpi-card"><h4>Committed</h4><strong>${inventoryProducts().reduce((s,p)=>s+stockCommitted(p.id),0)}</strong><div class="hint">Reserved by sales orders</div></div><div class="kpi-card"><h4>Low stock</h4><strong>${lowStockProducts().length}</strong><div class="hint">At/below reorder point</div></div><div class="kpi-card"><h4>Open POs</h4><strong>${state.purchaseOrders.filter(p=>!['Closed','Billed'].includes(p.status)).length}</strong><div class="hint">Purchasing queue</div></div><div class="kpi-card"><h4>Open SOs</h4><strong>${state.salesOrders.filter(s=>!['Invoiced','Closed','Cancelled'].includes(s.status)).length}</strong><div class="hint">Customer demand</div></div></div>`; }

  const v7RenderInventoryBase = renderInventory;
  renderInventory = function(){
    ensureV7State(); const active=state.settings.inventoryTab||'overview'; const tabs=[['overview','Overview'],['products','Products'],['purchaseOrders','Purchase Orders'],['receiving','Receiving'],['salesOrders','Sales Orders'],['matching','3-Way Match'],['movements','Movements']]; let body='';
    if(active==='overview') body=inventoryKPIs()+`<div class="grid two"><div class="card"><h3>Connected workflow</h3><div class="mini-flow"><span>Vendor</span><b>â†’</b><span>PO</span><b>â†’</b><span>Receive</span><b>â†’</b><span>Bill</span><b>â†’</b><span>Pay</span></div><div class="mini-flow"><span>Customer</span><b>â†’</b><span>SO</span><b>â†’</b><span>Reserve</span><b>â†’</b><span>Fulfill</span><b>â†’</b><span>Invoice</span></div><p class="muted">Products, vendors, customers, inventory value, COGS, A/P, A/R, and tax coding are connected.</p></div><div class="card"><h3>Low-stock alerts</h3>${lowStockProducts().map(p=>`<div class="report-line"><span>${escapeHTML(p.name)} <span class="muted small">${escapeHTML(p.sku)}</span></span><strong>${num(stockAvailable(p.id))} available</strong></div>`).join('') || '<div class="empty">No low-stock alerts.</div>'}</div></div>`;
    if(active==='products') body=inventoryKPIs()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Inventory Products</h3><div class="muted small">SKU, on-hand, committed, available, average cost, reorder point, and valuation.</div></div><input class="table-search" data-filter-table placeholder="Search products"></div>${table(['SKU','Product','On hand','Committed','Available','Reorder','Avg cost','Sales price','Value','Status'],inventoryProducts().map(p=>[escapeHTML(p.sku),`<strong>${escapeHTML(p.name)}</strong>`,num(p.qty),num(stockCommitted(p.id)),num(stockAvailable(p.id)),num(p.reorderPoint),money(p.avgCost),money(p.price),money(num(p.qty)*num(p.avgCost)),`<span class="stock-pill ${stockAvailable(p.id)<=num(p.reorderPoint)?'low':'good'}">${stockAvailable(p.id)<=num(p.reorderPoint)?'Low stock':'OK'}</span>`]))}</div>`;
    if(active==='purchaseOrders') body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Purchase Orders</h3><div class="muted small">Issue PO, receive inventory, and convert to vendor bill.</div></div><button class="btn primary" data-modal="purchaseOrder">Create PO</button></div>${table(['PO','Vendor','Product','Ordered','Received','Unit cost','Tax','Total','Status','Actions'],state.purchaseOrders.map(po=>[`<strong>${po.id}</strong>`,escapeHTML(getVendor(po.vendorId).name),escapeHTML(getProduct(po.productId).name),num(po.qty),num(po.receivedQty),money(po.unitCost),money(poTax(po)),money(poTotal(po)),tagForStatus(po.status),`<div class="invoice-actions"><button class="btn square" data-action="issue-po" data-id="${po.id}">Issue</button><button class="btn square" data-action="receive-po" data-id="${po.id}">Receive</button><button class="btn square" data-action="convert-po-bill" data-id="${po.id}">Convert to bill</button></div>`]))}</div>`;
    if(active==='receiving') body=`<div class="grid two"><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Open receiving queue</h3></div>${table(['PO','Product','Remaining','Expected','Action'],state.purchaseOrders.filter(po=>num(po.receivedQty)<num(po.qty)).map(po=>[po.id,escapeHTML(getProduct(po.productId).name),num(num(po.qty)-num(po.receivedQty)),po.expectedDate,`<button class="btn square" data-action="receive-po" data-id="${po.id}">Receive remaining</button>`]))}</div><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Receiving history</h3></div>${table(['Receipt','PO','Product','Date','Qty','Unit cost'],state.receivingRecords.map(r=>[r.id,r.poId,escapeHTML(getProduct(r.productId).name),r.date,num(r.qty),money(r.unitCost)]))}</div></div>`;
    if(active==='salesOrders') body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Sales Orders</h3><div class="muted small">Reserve inventory, fulfill stock, create COGS, and convert to invoice.</div></div><button class="btn primary" data-modal="salesOrder">Create SO</button></div>${table(['SO','Customer','Product','Ordered','Fulfilled','Available','Ship date','Status','Total','Actions'],state.salesOrders.map(o=>[`<strong>${o.id}</strong>`,escapeHTML(getCustomer(o.customerId).name),escapeHTML(getProduct(o.productId).name),num(o.qty),num(o.fulfilledQty),num(stockAvailable(o.productId)),o.shipDate,tagForStatus(o.status),money(soTotal(o)),`<div class="invoice-actions"><button class="btn square" data-action="fulfill-so" data-id="${o.id}">Fulfill</button><button class="btn square" data-action="convert-so-invoice" data-id="${o.id}">Invoice</button><button class="btn square" data-action="release-so" data-id="${o.id}">Close</button></div>`]))}</div>`;
    if(active==='matching') body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Three-way match: PO â†’ Receiving â†’ Bill</h3><div class="muted small">Compare ordered quantity, received quantity, bill amount, and match status.</div></div></div>${table(['PO','Vendor','Product','PO Qty','Received','Bill','PO Amount','Bill Amount','Status','Detail'],state.purchaseOrders.map(po=>{const b=state.bills.find(x=>x.id===po.billId||x.purchaseOrderId===po.id),m=poMatchStatus(po);return[po.id,escapeHTML(getVendor(po.vendorId).name),escapeHTML(getProduct(po.productId).name),num(po.qty),num(po.receivedQty),b?b.id:'â€”',money(poSubtotal(po)),b?money(b.amount):'â€”',`<span class="tag ${m.cls}">${m.label}</span>`,escapeHTML(m.detail)]}))}</div>`;
    if(active==='movements') body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Inventory movements</h3><div class="muted small">Receipts, sales fulfillments, adjustments, and COGS events.</div></div><button class="btn primary" data-modal="inventoryAdjust">Inventory adjustment</button></div>${table(['Movement','Date','Type','Product','Qty','Unit cost','COGS','Source','Memo'],state.inventoryMovements.map(m=>[m.id,m.date,escapeHTML(m.type),escapeHTML(getProduct(m.productId).name),num(m.qty),money(m.unitCost),num(m.cogsAmount)?money(m.cogsAmount):'â€”',escapeHTML(m.sourceId||m.soId||m.poId||''),escapeHTML(m.memo||'')]))}</div>`;
    document.getElementById('page-inventory').innerHTML=header('Inventory, Purchase Orders & Sales Orders','Connect products, vendors, customers, purchasing, receiving, sales orders, invoices, COGS, and inventory value.',`<button class="btn" data-modal="salesOrder">Create sales order</button><button class="btn" data-modal="inventoryAdjust">Adjust inventory</button><button class="btn primary" data-modal="purchaseOrder">Create purchase order</button>`)+renderOpsTabbar(active,tabs,'set-inventory-tab')+body;
  };

  const v7RenderSalesBase=renderSales;
  renderSales=function(){ ensureV7State(); if((state.settings.salesTab||'overview')==='salesOrders'){ const body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Sales Orders and fulfillment</h3><div class="muted small">Reserve inventory, fulfill stock, create COGS, and convert to invoice.</div></div><button class="btn primary" data-modal="salesOrder">Create sales order</button></div>${table(['SO','Customer','Product','Qty','Fulfilled','Ship date','Channel','Status','Total','Actions'],state.salesOrders.map(o=>[`<strong>${o.id}</strong>`,escapeHTML(getCustomer(o.customerId).name),escapeHTML(getProduct(o.productId).name),num(o.qty),num(o.fulfilledQty),o.shipDate,escapeHTML(o.channel||'Direct sales'),tagForStatus(o.status),money(soTotal(o)),`<div class="invoice-actions"><button class="btn square" data-action="fulfill-so" data-id="${o.id}">Fulfill</button><button class="btn square" data-action="convert-so-invoice" data-id="${o.id}">Invoice</button></div>`]))}</div>`; document.getElementById('page-sales').innerHTML=header('Sales & Get Paid','Manage invoices, payment links, sales orders, fulfillment, and customer collections.',`<button class="btn" data-modal="payment">Receive payment</button><button class="btn" data-modal="salesOrder">Sales order</button><button class="btn primary" data-modal="invoice">Create invoice</button>`)+salesTabbar()+body; return;} return v7RenderSalesBase(); };

  const v7RenderExpensesBase=renderExpenses;
  renderExpenses=function(){ ensureV7State(); const active=state.settings.expenseTab||'bills'; const tabs=[['bills','Bills & A/P'],['capture','Receipt / invoice capture'],['expenses','Expenses'],['payments','Bill payments']]; const openBills=state.bills.filter(b=>billOpenAmount(b)>0); let body=''; if(active==='bills') body=`<div class="kpi-grid"><div class="kpi-card"><h4>Open A/P</h4><strong>${money(openBills.reduce((s,b)=>s+billOpenAmount(b),0))}</strong></div><div class="kpi-card"><h4>Overdue</h4><strong>${state.bills.filter(b=>billOpenAmount(b)>0&&b.dueDate<todayISO()).length}</strong></div><div class="kpi-card"><h4>Captured docs</h4><strong>${state.apDocuments.filter(d=>d.status!=='Approved').length}</strong></div><div class="kpi-card"><h4>PO bills</h4><strong>${state.bills.filter(b=>b.purchaseOrderId).length}</strong></div><div class="kpi-card"><h4>ITCs</h4><strong>${money(state.bills.reduce((s,b)=>s+num(b.tax),0))}</strong></div></div><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Bill & Expense Center</h3><div class="muted small">Review vendor bills, approval, PO source, tax code, and payment status.</div></div><button class="btn" data-modal="billCapture">Capture invoice</button><button class="btn primary" data-modal="bill">Create bill</button></div>${table(['Bill','Vendor','Due','Approval','Source','Tax code','Total','Open','Status','Action'],state.bills.map(b=>[b.id,escapeHTML(getVendor(b.vendorId).name),b.dueDate,`<span class="stock-pill ${b.approvalStatus==='Approved'||b.approvalStatus==='Paid'?'good':'low'}">${escapeHTML(b.approvalStatus||'Draft')}</span>`,escapeHTML(b.source||'Manual bill'),escapeHTML(getTaxCode(b.taxCodeId||'GST5').code),money(billTotal(b)),money(billOpenAmount(b)),tagForStatus(b.status),billOpenAmount(b)>0?`<button class="btn square" data-action="pay-bill" data-id="${b.id}">Pay</button>`:'â€”']))}</div>`; if(active==='capture') body=`<div class="grid two"><div class="card"><h3>Capture workflow</h3><div class="mini-flow"><span>Capture</span><b>â†’</b><span>Smart coding</span><b>â†’</b><span>Approve</span><b>â†’</b><span>Create bill</span></div><p class="muted">Capture invoice details and route them for approval.</p><button class="btn primary" data-modal="billCapture">Capture vendor invoice</button></div><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Captured AP documents</h3></div>${table(['Document','Vendor','Date','Suggested account','Tax','Amount','Status','Action'],state.apDocuments.map(d=>[`<div style="display:flex;gap:10px;align-items:center"><div class="doc-thumb">PDF</div><div><strong>${d.id}</strong><div class="muted small">${escapeHTML(d.fileName||'Manual capture')}</div></div></div>`,escapeHTML(getVendor(d.vendorId).name),d.date,escapeHTML(accountLabel(d.suggestedAccountId||'6000')),money(d.tax),money(num(d.amount)+num(d.tax)),tagForStatus(d.status),d.status!=='Approved'?`<button class="btn square" data-action="approve-apdoc" data-id="${d.id}">Approve & create bill</button>`:'Created']))}</div></div>`; if(active==='expenses') body=`<div class="card table-card"><div class="toolbar"><h3 style="margin:0">Expenses</h3><button class="btn primary" data-modal="expense">Record expense</button></div>${table(['Expense','Vendor','Date','Category','Tax code','Amount','Tax','Total','Paid from'],state.expenses.map(e=>[e.id,escapeHTML(getVendor(e.vendorId).name),e.date,escapeHTML(getAccount(e.expenseAccountId||'6000').name),escapeHTML(getTaxCode(e.taxCodeId||'GST5').code),money(e.amount),money(e.tax),money(expenseTotal(e)),escapeHTML(e.paymentMethod||'')]))}</div>`; if(active==='payments') body=`<div class="card table-card"><div class="toolbar"><h3 style="margin:0">Bill payments</h3><button class="btn primary" data-modal="payBill">Pay bill</button></div>${table(['Payment','Bill','Vendor','Date','Account','Amount','Memo'],state.billPayments.map(p=>[p.id,p.billId,escapeHTML(getVendor(p.vendorId).name),p.date,escapeHTML(getBank(p.accountId).name),money(p.amount),escapeHTML(p.memo||'')]))}</div>`; document.getElementById('page-expenses').innerHTML=header('Bills, Expenses & Vendor A/P Workflow','Review vendor bills, invoice capture, tax coding, approvals, and PO-to-bill flow.',`<button class="btn" data-modal="billCapture">Capture invoice</button><button class="btn" data-modal="payBill">Pay bill</button><button class="btn primary" data-modal="bill">Create bill</button>`)+renderOpsTabbar(active,tabs,'set-expense-tab')+body; };

  const v7RenderVendorsBase=renderVendors;
  renderVendors=function(){ ensureV7State(); document.getElementById('page-vendors').innerHTML=header('Vendors','Track supplier contacts, open bills, purchase orders, credits, and default coding.',`<button class="btn" data-modal="purchaseOrder">Create PO</button><button class="btn" data-modal="payBill">Pay bill</button><button class="btn primary" data-modal="vendor">Add vendor</button>`)+`<div class="card table-card">${table(['Vendor','Email','Category','Open A/P','Open POs','Recent bills','Preferred products','Actions'],state.vendors.map(v=>{const open=state.bills.filter(b=>b.vendorId===v.id).reduce((s,b)=>s+billOpenAmount(b),0); const po=state.purchaseOrders.filter(p=>p.vendorId===v.id&&!['Closed','Billed'].includes(p.status)).length; const pref=inventoryProducts().filter(p=>p.preferredVendorId===v.id).map(p=>p.sku).join(', ')||'â€”'; return[`<strong>${escapeHTML(v.name)}</strong>`,escapeHTML(v.email),escapeHTML(v.category),money(open),po,state.bills.filter(b=>b.vendorId===v.id).length,escapeHTML(pref),`<button class="btn square" data-modal="purchaseOrder">PO</button> <button class="btn square" data-modal="bill">Bill</button>`]}))}</div>`; };

  const v7LedgerBase=ledger;
  ledger=function(){ const rows=v7LedgerBase(); (state.inventoryMovements||[]).filter(m=>num(m.cogsAmount)>0).forEach(m=>{ rows.push(line('Inventory COGS',m.id,m.date,m.memo||`COGS for ${getProduct(m.productId).name}`,'5000',num(m.cogsAmount),0)); rows.push(line('Inventory COGS',m.id,m.date,m.memo||`Inventory relieved for ${getProduct(m.productId).name}`,'1300',0,num(m.cogsAmount))); }); return rows; };
  const v7RenderReportsBase=renderReports;
  renderReports=function(){ v7RenderReportsBase(); const el=document.getElementById('page-reports'); if(el) el.innerHTML+=`<div class="grid two" style="margin-top:16px"><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Inventory Valuation</h3></div>${table(['SKU','Product','Qty','Avg cost','Value','Available'],inventoryProducts().map(p=>[escapeHTML(p.sku),escapeHTML(p.name),num(p.qty),money(p.avgCost),money(num(p.qty)*num(p.avgCost)),num(stockAvailable(p.id))]))}</div><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Purchase Order Match Summary</h3></div>${table(['PO','Vendor','Received','Bill','Status'],state.purchaseOrders.map(po=>{const m=poMatchStatus(po); return[po.id,escapeHTML(getVendor(po.vendorId).name),`${num(po.receivedQty)} / ${num(po.qty)}`,po.billId||'â€”',`<span class="tag ${m.cls}">${m.label}</span>`]}))}</div></div>`; };

  const v7OpenModalBase=openModal;
  openModal=function(type){ v7OpenModalBase(type); const labels={purchaseOrder:['Create purchase order','Order inventory from a vendor.'],salesOrder:['Create sales order','Reserve inventory for a customer order.'],inventoryAdjust:['Inventory adjustment','Adjust on-hand quantity for cycle count/shrinkage.'],billCapture:['Capture vendor invoice','Simulate receipt/invoice capture and approval.']}; if(labels[type]){document.getElementById('modalTitle').textContent=labels[type][0]; document.getElementById('modalSubtitle').textContent=labels[type][1];} };
  const v7ModalBodyBase=modalBodyContent;
  modalBodyContent=function(type){
    if(type==='purchaseOrder') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>PO date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Expected date</label><input type="date" name="expectedDate" value="${addDaysISO(14)}"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option>Issued</option></select></div><div class="field full"><label>Inventory product</label><select name="productId">${inventoryProductOptions()}</select></div><div class="field"><label>Quantity</label><input type="number" step="1" min="1" name="qty" value="10"></div><div class="field"><label>Unit cost</label><input type="number" step="0.01" min="0" name="unitCost" value="250"></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions('GST5')}</select></div></div><div class="tax-form-note">POs are non-posting until converted to bill. Receiving updates stock; bill conversion updates Inventory Asset and A/P.</div>`;
    if(type==='salesOrder') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Order date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Ship date</label><input type="date" name="shipDate" value="${addDaysISO(10)}"></div><div class="field"><label>Channel</label><select name="channel"><option>Direct sales</option><option>Website payment links</option><option>Marketplace / Shopify</option></select></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option selected>Confirmed</option><option>Pending approval</option></select></div><div class="field full"><label>Product</label><select name="productId">${inventoryProductOptions()}</select></div><div class="field"><label>Quantity</label><input type="number" step="1" min="1" name="qty" value="1"></div><div class="field"><label>Unit sales price</label><input type="number" step="0.01" min="0" name="unitPrice" value="420"></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions('GST5')}</select></div></div><div class="tax-form-note">Confirmed sales orders reserve stock. Fulfillment relieves inventory and posts COGS; invoice conversion posts A/R, revenue, and sales tax.</div>`;
    if(type==='inventoryAdjust') return `<div class="form-grid"><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field full"><label>Product</label><select name="productId">${inventoryProductOptions()}</select></div><div class="field"><label>Quantity change</label><input type="number" step="1" name="qty" value="1"></div><div class="field"><label>Unit cost</label><input type="number" step="0.01" min="0" name="unitCost" value="250"></div><div class="field"><label>Reason</label><select name="reason"><option>Cycle count adjustment</option><option>Shrinkage / damage</option><option>Opening correction</option><option>Manual receipt correction</option></select></div><div class="field full"><label>Memo</label><input name="memo" value="Inventory adjustment"></div></div>`;
    if(type==='billCapture') return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>Document date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${addDaysISO(14)}"></div><div class="field"><label>File name</label><input name="fileName" value="vendor-invoice.pdf"></div><div class="field"><label>Suggested account</label><select name="suggestedAccountId">${accountOptions(['Expense','COGS'])}</select></div><div class="field"><label>Amount before tax</label><input type="number" step="0.01" min="0" name="amount" value="325"></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field full"><label>Memo</label><input name="memo" value="Captured vendor invoice waiting for approval"></div></div>`;
    return v7ModalBodyBase(type);
  };

  function receivePurchaseOrder(id){ const po=state.purchaseOrders.find(x=>x.id===id); if(!po)return; const rem=Math.max(0,num(po.qty)-num(po.receivedQty)); if(rem<=0){showToast('PO is already fully received.'); return;} const p=getProduct(po.productId), old=num(p.qty), neu=old+rem; p.avgCost=neu>0?((old*num(p.avgCost))+(rem*num(po.unitCost)))/neu:num(po.unitCost); p.qty=neu; po.receivedQty=num(po.receivedQty)+rem; po.status=po.receivedQty>=po.qty?'Received':'Partially Received'; const rec={id:uid('RCV'), poId:po.id, productId:po.productId, date:todayISO(), qty:rem, unitCost:num(po.unitCost)}; state.receivingRecords.unshift(rec); state.inventoryMovements.unshift({id:uid('IM'),date:todayISO(),type:'PO Receipt',productId:po.productId,qty:rem,unitCost:num(po.unitCost),cogsAmount:0,poId:po.id,sourceId:rec.id,memo:`Received inventory from ${po.id}`}); audit(`PO ${po.id} received`); saveState(); renderAll(); showToast(`${po.id} received and inventory updated.`); }
  function convertPOToBill(id){ const po=state.purchaseOrders.find(x=>x.id===id); if(!po)return; if(po.billId||state.bills.some(b=>b.purchaseOrderId===po.id)){showToast('PO already converted to bill.'); return;} const code=getTaxCode(po.taxCodeId||'GST5'), base=poSubtotal(po), tax=calcTax(base,po.taxCodeId||'GST5'); const bill={id:uid('BILL'),vendorId:po.vendorId,date:todayISO(),dueDate:addDaysISO(14),status:'Open',expenseAccountId:'1300',amount:base,tax:code.recoverable?tax:0,rawTax:tax,nonRecoverableTax:code.recoverable?0:tax,taxCodeId:po.taxCodeId||'GST5',taxAgencyId:code.agencyId,taxRate:num(code.rate),paid:0,purchaseOrderId:po.id,source:'PO conversion',approvalStatus:'Approved'}; state.bills.unshift(bill); po.billId=bill.id; po.status=num(po.receivedQty)>=num(po.qty)?'Billed':'Bill created'; audit(`PO ${po.id} converted to ${bill.id}`); saveState(); renderAll(); showToast(`${po.id} converted to ${bill.id}.`); }
  function fulfillSalesOrder(id){ const o=state.salesOrders.find(x=>x.id===id); if(!o)return; const rem=Math.max(0,num(o.qty)-num(o.fulfilledQty)); if(rem<=0){showToast('Sales order already fulfilled.'); return;} const p=getProduct(o.productId); if(num(p.qty)<rem){showToast(`Not enough stock. ${p.sku} has ${num(p.qty)} on hand.`); return;} p.qty=num(p.qty)-rem; o.fulfilledQty=num(o.fulfilledQty)+rem; o.status=o.fulfilledQty>=o.qty?'Fulfilled':'Partially Fulfilled'; const cogs=rem*num(p.avgCost); state.inventoryMovements.unshift({id:uid('IM'),date:todayISO(),type:'Sales fulfillment',productId:o.productId,qty:-rem,unitCost:num(p.avgCost),cogsAmount:cogs,soId:o.id,sourceId:o.id,memo:`COGS for sales order ${o.id}`}); audit(`Sales order ${o.id} fulfilled`); saveState(); renderAll(); showToast(`${o.id} fulfilled. Inventory and COGS updated.`); }
  function convertSOToInvoice(id){ const o=state.salesOrders.find(x=>x.id===id); if(!o)return; if(o.invoiceId){showToast('Sales order already has an invoice.'); return;} if(num(o.fulfilledQty)<num(o.qty)) fulfillSalesOrder(id); if(num(o.fulfilledQty)<num(o.qty)) return; const p=getProduct(o.productId), code=getTaxCode(o.taxCodeId||'GST5'), subtotal=soSubtotal(o), tax=calcTax(subtotal,o.taxCodeId||'GST5'); const inv={id:uid('INV'),customerId:o.customerId,date:todayISO(),dueDate:addDaysISO(30),status:'Sent',subtotal,tax,paid:0,incomeAccountId:p.incomeAccountId||'4010',taxCodeId:o.taxCodeId||'GST5',taxAgencyId:code.agencyId,taxRate:num(code.rate),sourceSalesOrderId:o.id,sentDate:todayISO(),emailStatus:'Sent',viewedDate:'',reminders:0,items:[{productId:p.id,sku:p.sku,desc:p.name,qty:num(o.qty),rate:num(o.unitPrice),taxCodeId:o.taxCodeId||'GST5',taxAmount:tax}]}; state.invoices.unshift(inv); o.invoiceId=inv.id; o.status='Invoiced'; audit(`Sales order ${o.id} converted to ${inv.id}`); saveState(); renderAll(); showToast(`${o.id} converted to invoice ${inv.id}.`); }
  function approveAPDocument(id){ const d=state.apDocuments.find(x=>x.id===id); if(!d||d.status==='Approved')return; const code=getTaxCode(d.taxCodeId||'GST5'), rawTax=calcTax(d.amount,d.taxCodeId||'GST5'); const bill={id:uid('BILL'),vendorId:d.vendorId,date:d.date,dueDate:d.dueDate,status:'Open',expenseAccountId:d.suggestedAccountId||'6000',amount:code.recoverable?num(d.amount):num(d.amount)+rawTax,tax:code.recoverable?rawTax:0,rawTax,nonRecoverableTax:code.recoverable?0:rawTax,taxCodeId:d.taxCodeId||'GST5',taxAgencyId:code.agencyId,taxRate:num(code.rate),paid:0,source:'Captured AP document '+d.id,approvalStatus:'Approved',captureId:d.id}; state.bills.unshift(bill); d.status='Approved'; d.billId=bill.id; audit(`AP document ${d.id} approved`); saveState(); renderAll(); showToast(`${d.id} approved and converted to ${bill.id}.`); }

  const v7HandleActionBase=handleAction;
  handleAction=function(action,id){ if(action==='set-inventory-tab'){state.settings.inventoryTab=id||'overview'; saveState(); renderInventory(); return;} if(action==='set-expense-tab'){state.settings.expenseTab=id||'bills'; saveState(); renderExpenses(); return;} if(action==='receive-po'){receivePurchaseOrder(id); return;} if(action==='convert-po-bill'){convertPOToBill(id); return;} if(action==='issue-po'){const po=state.purchaseOrders.find(x=>x.id===id); if(po){po.status='Issued'; saveState(); renderAll(); showToast(`${po.id} issued.`);} return;} if(action==='fulfill-so'){fulfillSalesOrder(id); return;} if(action==='convert-so-invoice'){convertSOToInvoice(id); return;} if(action==='release-so'){const o=state.salesOrders.find(x=>x.id===id); if(o){o.status='Closed'; saveState(); renderAll(); showToast(`${o.id} closed.`);} return;} if(action==='approve-apdoc'){approveAPDocument(id); return;} return v7HandleActionBase(action,id); };
  const v7SubmitModalBase=submitModal;
  submitModal=function(e){ if(['purchaseOrder','salesOrder','inventoryAdjust','billCapture'].includes(currentModal)){ e.preventDefault(); const f=new FormData(e.target), d=Object.fromEntries(f.entries()); if(currentModal==='purchaseOrder'){const po={id:uid('PO'),vendorId:d.vendorId,date:d.date,expectedDate:d.expectedDate,status:d.status,productId:d.productId,qty:num(d.qty),receivedQty:0,unitCost:num(d.unitCost),taxCodeId:d.taxCodeId,billId:null}; state.purchaseOrders.unshift(po); state.settings.inventoryTab='purchaseOrders'; showToast(`${po.id} created.`);} if(currentModal==='salesOrder'){ if(num(d.qty)>stockAvailable(d.productId)&&d.status!=='Draft'){showToast(`Insufficient available stock. Available: ${stockAvailable(d.productId)}.`); return;} const so={id:uid('SO'),customerId:d.customerId,date:d.date,shipDate:d.shipDate,status:d.status,channel:d.channel,productId:d.productId,qty:num(d.qty),fulfilledQty:0,unitPrice:num(d.unitPrice),taxCodeId:d.taxCodeId,invoiceId:null}; so.total=soTotal(so); state.salesOrders.unshift(so); state.settings.salesTab='salesOrders'; state.settings.inventoryTab='salesOrders'; showToast(`${so.id} created. Inventory reserved.`);} if(currentModal==='inventoryAdjust'){const p=getProduct(d.productId), q=num(d.qty), u=num(d.unitCost)||num(p.avgCost); const oldQty=num(p.qty); p.qty=oldQty+q; if(q>0){p.avgCost=((oldQty*num(p.avgCost))+(q*u))/Math.max(p.qty,1);} const cogs=q<0?Math.abs(q)*num(p.avgCost):0; state.inventoryMovements.unshift({id:uid('IM'),date:d.date,type:d.reason,productId:d.productId,qty:q,unitCost:u,cogsAmount:cogs,memo:d.memo}); state.settings.inventoryTab='movements'; showToast('Inventory adjustment saved.');} if(currentModal==='billCapture'){const tax=calcTax(d.amount,d.taxCodeId); const doc={id:uid('APDOC'),vendorId:d.vendorId,date:d.date,dueDate:d.dueDate,amount:num(d.amount),taxCodeId:d.taxCodeId,tax,suggestedAccountId:d.suggestedAccountId,status:'Submitted',fileName:d.fileName,memo:d.memo}; state.apDocuments.unshift(doc); state.settings.expenseTab='capture'; showToast(`${doc.id} captured for approval.`);} saveState(); closeModal(); renderAll(); return;} return v7SubmitModalBase(e); };
  const v7RenderDashboardBase=renderDashboard;
  renderDashboard=function(){ v7RenderDashboardBase(); const row=document.querySelector('#businessFeed .feed-row'); if(row&&!row.textContent.includes('Inventory Agent')) row.insertAdjacentHTML('beforeend',`<div class="feed-card"><span class="menu">â‹®</span><div class="feed-title"><span class="feed-badge">â—¼</span>Inventory Agent</div><p>${lowStockProducts().length} low-stock items and ${state.purchaseOrders.filter(p=>poMatchStatus(p).label!=='Matched').length} PO match items need review.</p><button class="btn soft" data-nav="inventory">Review inventory</button></div>`); };
  exportData=function(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-backup.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState=function(){ state=structuredClone(initialState); ensureV7State(); saveState(); renderAll(); showToast('Company data reset.'); };



  // ---------- Products & Services Center: Services, Non-Inventory, Bundles ----------
  function ensureV71State(){
    ensureV7State();
    state.company.name = stripVersionText(state.company.name || 'Your Company') || 'Your Company';
    state.settings ||= {}; state.settings.inventoryTab ||= 'overview';
    const ensureProduct = (item) => { if(!state.products.some(p=>p.id===item.id)) state.products.push(item); };
    ensureProduct({id:'P-3006', name:'One-time setup materials', type:'Non-Inventory', sku:'NONINV-SETUP', price:95, avgCost:55, incomeAccountId:'4010', taxCodeId:'GST5', qty:0, trackInventory:false, preferredVendorId:'V-2001', description:'Non-stock setup supplies charged to a customer job'});
    ensureProduct({id:'P-3007', name:'Monthly support bundle', type:'Bundle', sku:'BND-SUPPORT', price:1100, avgCost:0, incomeAccountId:'4020', taxCodeId:'GST5', qty:0, trackInventory:false, bundleItems:['P-3002','P-3001'], description:'Packaged support bundle combining maintenance and advisory hours'});
    state.products.forEach(p=>{
      const t=itemType(p);
      p.itemType=t;
      p.taxCodeId ||= 'GST5';
      p.salesUnit ||= t==='Service' ? (p.name.toLowerCase().includes('maintenance') ? 'month' : p.name.toLowerCase().includes('package') ? 'job' : 'hour') : 'each';
      p.defaultBillingUnit ||= p.salesUnit;
      p.description ||= t==='Service' ? `${p.name} billed by ${p.salesUnit}` : p.name;
      p.active = p.active !== false;
      if(t==='Service'){
        p.trackInventory=false; p.qty=0; p.assetAccountId=''; p.cogsAccountId='';
        p.serviceCategory ||= p.name.toLowerCase().includes('maintenance')?'Recurring service':p.name.toLowerCase().includes('implementation')?'Implementation':'Professional service';
        p.costRate = num(p.costRate || (p.name.toLowerCase().includes('implementation')?650:p.name.toLowerCase().includes('maintenance')?280:55));
      }
      if(t==='Non-Inventory'){ p.trackInventory=false; p.qty=0; p.reorderPoint=0; p.serviceCategory ||= 'Non-stock resale'; }
      if(t==='Bundle'){ p.trackInventory=false; p.qty=0; p.reorderPoint=0; p.serviceCategory ||= 'Package'; }
      if(t==='Inventory'){ p.trackInventory=true; p.salesUnit='each'; }
    });
    if(!state.setupTasks.some(t=>t.id==='services-center')) state.setupTasks.push({id:'services-center', group:'Operations', title:'Review services, non-inventory products, bundles, and inventory items', done:false, hidden:false, nav:'inventory'});
  }
  function itemType(p){
    const raw=String(p?.type||p?.itemType||'').toLowerCase();
    if(p?.trackInventory || raw.includes('inventory product') || raw==='product') return 'Inventory';
    if(raw.includes('non')) return 'Non-Inventory';
    if(raw.includes('bundle') || raw.includes('package')) return 'Bundle';
    if(raw.includes('service')) return 'Service';
    return raw ? raw.replace(/\b\w/g,c=>c.toUpperCase()) : 'Service';
  }
  function itemTypePill(p){ const t=itemType(p), cls=t.toLowerCase().replace(/[^a-z]/g,''); return `<span class="item-type-pill ${cls}">${escapeHTML(t)}</span>`; }
  function isInventoryTracked(id){ const p=getProduct(id); return itemType(p)==='Inventory' || !!p.trackInventory; }
  function serviceItems(){ return state.products.filter(p=>itemType(p)==='Service'); }
  function nonInventoryItems(){ return state.products.filter(p=>itemType(p)==='Non-Inventory'); }
  function bundleItems(){ return state.products.filter(p=>itemType(p)==='Bundle'); }
  function sellableItems(){ return state.products.filter(p=>p.active!==false); }
  function sellableItemOptions(selected){ return sellableItems().map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''} data-price="${num(p.price)}" data-account="${p.incomeAccountId||'4000'}">${escapeHTML(p.sku||p.id)} Â· ${escapeHTML(p.name)} Â· ${escapeHTML(itemType(p))} Â· ${money(p.price)}</option>`).join(''); }
  function productOptions(){ return sellableItemOptions(); }
  function lineRevenueForProduct(p){
    return state.invoices.reduce((sum,inv)=>sum+(inv.items||[]).reduce((s,it)=>{
      const byId=it.productId===p.id;
      const byDesc=!it.productId && String(it.desc||'').toLowerCase().includes(String(p.name||'').toLowerCase().slice(0,12));
      return s + ((byId||byDesc)? num(it.amount || (num(it.qty)||1)*num(it.rate||p.price)) : 0);
    },0),0);
  }
  function serviceQtyForProduct(p){
    return state.invoices.reduce((sum,inv)=>sum+(inv.items||[]).reduce((s,it)=>{
      const byId=it.productId===p.id;
      const byDesc=!it.productId && String(it.desc||'').toLowerCase().includes(String(p.name||'').toLowerCase().slice(0,12));
      return s + ((byId||byDesc)? num(it.qty||1) : 0);
    },0),0);
  }
  function serviceProfitForProduct(p){ return lineRevenueForProduct(p) - serviceQtyForProduct(p)*num(p.costRate||0); }
  function serviceRevenueTotal(){ return serviceItems().reduce((s,p)=>s+lineRevenueForProduct(p),0); }
  function serviceProfitTotal(){ return serviceItems().reduce((s,p)=>s+serviceProfitForProduct(p),0); }
  function itemTypeCounts(){ return {services:serviceItems().length, inventory:inventoryProducts().length, noninv:nonInventoryItems().length, bundles:bundleItems().length}; }
  function v71Metrics(){ const c=itemTypeCounts(); return `<div class="service-metric-grid"><div class="service-metric"><h4>Services</h4><strong>${c.services}</strong><div class="item-note">No stock tracking; billed by hour, month, job, or fixed fee.</div></div><div class="service-metric"><h4>Service revenue</h4><strong>${money(serviceRevenueTotal())}</strong><div class="item-note">Calculated from invoice line items.</div></div><div class="service-metric"><h4>Inventory value</h4><strong>${money(inventoryValue())}</strong><div class="item-note">Inventory items only.</div></div><div class="service-metric"><h4>Low stock</h4><strong>${lowStockProducts().length}</strong><div class="item-note">Inventory Products at or below reorder point.</div></div></div>`; }
  function renderItemTable(items, type){
    if(type==='Service') return table(['Service','Category','Billing unit','Rate','Income account','Tax code','Revenue','Est. margin','Actions'], items.map(p=>[`<strong>${escapeHTML(p.name)}</strong><div class="muted small">${escapeHTML(p.sku||p.id)} Â· ${escapeHTML(p.description||'')}</div>`,escapeHTML(p.serviceCategory||'Service'),escapeHTML(p.salesUnit||'hour'),money(p.price),escapeHTML(accountLabel(p.incomeAccountId||'4000')),escapeHTML(getTaxCode(p.taxCodeId||'GST5').code),money(lineRevenueForProduct(p)),money(serviceProfitForProduct(p)),`<button class="btn square" data-action="edit-item" data-id="${p.id}">Edit</button>`]));
    if(type==='Non-Inventory') return table(['SKU','Item','Sales price','Estimated cost','Income account','Tax code','Used on','Actions'], items.map(p=>[escapeHTML(p.sku||p.id),`<strong>${escapeHTML(p.name)}</strong><div class="muted small">No stock balance or receiving required.</div>`,money(p.price),money(p.avgCost),escapeHTML(accountLabel(p.incomeAccountId||'4010')),escapeHTML(getTaxCode(p.taxCodeId||'GST5').code),'Invoices, estimates, sales orders',`<button class="btn square" data-action="edit-item" data-id="${p.id}">Edit</button>`]));
    if(type==='Bundle') return table(['SKU','Bundle / Package','Sales price','Income account','Components','Tax code','Actions'], items.map(p=>[escapeHTML(p.sku||p.id),`<strong>${escapeHTML(p.name)}</strong><div class="muted small">Package item; does not carry its own quantity.</div>`,money(p.price),escapeHTML(accountLabel(p.incomeAccountId||'4020')),escapeHTML((p.bundleItems||[]).map(id=>getProduct(id).name).join(', ')||'Define components later'),escapeHTML(getTaxCode(p.taxCodeId||'GST5').code),`<button class="btn square" data-action="edit-item" data-id="${p.id}">Edit</button>`]));
    return table(['SKU','Product','On hand','Committed','Available','Reorder','Avg cost','Sales price','Value','Status','Actions'], items.map(p=>[escapeHTML(p.sku),`<strong>${escapeHTML(p.name)}</strong>`,num(p.qty),num(stockCommitted(p.id)),num(stockAvailable(p.id)),num(p.reorderPoint),money(p.avgCost),money(p.price),money(num(p.qty)*num(p.avgCost)),`<span class="stock-pill ${stockAvailable(p.id)<=num(p.reorderPoint)?'low':'good'}">${stockAvailable(p.id)<=num(p.reorderPoint)?'Low stock':'OK'}</span>`,`<button class="btn square" data-action="edit-item" data-id="${p.id}">Edit</button>`]));
  }

  const v71RenderInventoryBase=renderInventory;
  renderInventory=function(){
    ensureV71State();
    const active=state.settings.inventoryTab||'overview';
    const tabs=[['overview','Overview'],['services','Services'],['products','Inventory Products'],['noninventory','Non-Inventory'],['bundles','Bundles'],['purchaseOrders','Purchase Orders'],['receiving','Receiving'],['salesOrders','Sales Orders'],['matching','3-Way Match'],['movements','Movements']];
    let body='';
    if(active==='overview') body=v71Metrics()+`<div class="grid two"><div class="card"><h3>Products & Services Center</h3><div class="mini-flow"><span>Services</span><b>â†’</b><span>Estimate / SO</span><b>â†’</b><span>Invoice</span><b>â†’</b><span>Service revenue</span></div><div class="mini-flow"><span>Inventory</span><b>â†’</b><span>PO</span><b>â†’</b><span>Receive</span><b>â†’</b><span>Bill</span><b>â†’</b><span>COGS on sale</span></div><p class="muted">Services are separated from inventory. Services do not show quantity, reorder point, receiving, inventory asset, or COGS movement.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-modal="serviceItem">Add service</button><button class="btn" data-modal="product">Add product/item</button></div></div><div class="card"><h3>Item type rules</h3><div class="report-line"><span>${itemTypePill({type:'Service'})} Service</span><strong>No inventory</strong></div><div class="report-line"><span>${itemTypePill({type:'Product',trackInventory:true})} Inventory</span><strong>Asset + COGS</strong></div><div class="report-line"><span>${itemTypePill({type:'Non-Inventory'})} Non-Inventory</span><strong>No stock balance</strong></div><div class="report-line"><span>${itemTypePill({type:'Bundle'})} Bundle</span><strong>Package</strong></div></div></div><div class="card table-card" style="margin-top:16px"><div class="toolbar"><h3 style="margin:0">Service profitability summary</h3><button class="btn" data-modal="serviceItem">Add service</button></div>${renderItemTable(serviceItems(),'Service')}</div>`;
    if(active==='services') body=v71Metrics()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Services</h3><div class="muted small">Services are first-class sellable items for invoices, estimates, sales orders, recurring invoices, and payment links. They do not track quantity on hand.</div></div><button class="btn primary" data-modal="serviceItem">Add service</button></div>${renderItemTable(serviceItems(),'Service')}</div>`;
    if(active==='products') body=v71Metrics()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Inventory Products</h3><div class="muted small">SKU, on-hand, committed, available, average cost, reorder point, and valuation.</div></div><button class="btn" data-modal="inventoryAdjust">Adjust inventory</button></div>${renderItemTable(inventoryProducts(),'Inventory')}</div>`;
    if(active==='noninventory') body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Non-Inventory products</h3><div class="muted small">Items you buy or sell but do not track as inventory assets.</div></div><button class="btn primary" data-modal="product">Add non-inventory/product</button></div>${renderItemTable(nonInventoryItems(),'Non-Inventory')}</div>`;
    if(active==='bundles') body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Bundles / packages</h3><div class="muted small">Group services and products into a package for quoting and invoicing.</div></div><button class="btn primary" data-modal="product">Add bundle</button></div>${renderItemTable(bundleItems(),'Bundle')}</div>`;
    if(['purchaseOrders','receiving','salesOrders','matching','movements'].includes(active)){
      state.settings.inventoryTab=active; v71RenderInventoryBase(); return;
    }
    document.getElementById('page-inventory').innerHTML=header('Products & Services, Inventory, Purchase Orders & Sales Orders','Services are visible as first-class sellable items while inventory, PO, SO, receiving, COGS, and three-way match workflows remain available.',`<button class="btn" data-modal="serviceItem">Add service</button><button class="btn" data-modal="salesOrder">Create sales order</button><button class="btn primary" data-modal="purchaseOrder">Create purchase order</button>`)+renderOpsTabbar(active,tabs,'set-inventory-tab')+body;
  };

  const v71RenderSalesBase=renderSales;
  renderSales=function(){
    ensureV71State();
    const active=state.settings.salesTab||'overview';
    if(active==='salesOrders'){
      const body=`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Sales Orders, service orders, and fulfillment</h3><div class="muted small">Inventory items reserve stock. Service, non-inventory, and bundle items can be delivered without stock movement.</div></div><button class="btn primary" data-modal="salesOrder">Create sales order</button></div>${table(['SO','Customer','Item','Type','Qty / Hours','Fulfilled / Delivered','Ship / Service date','Channel','Status','Total','Actions'],state.salesOrders.map(o=>{const p=getProduct(o.productId); const deliverLabel=isInventoryTracked(p.id)?'Fulfill':'Deliver'; return[`<strong>${o.id}</strong>`,escapeHTML(getCustomer(o.customerId).name),escapeHTML(p.name),itemTypePill(p),num(o.qty),num(o.fulfilledQty),o.shipDate,escapeHTML(o.channel||'Direct sales'),tagForStatus(o.status),money(soTotal(o)),`<div class="invoice-actions"><button class="btn square" data-action="fulfill-so" data-id="${o.id}">${deliverLabel}</button><button class="btn square" data-action="convert-so-invoice" data-id="${o.id}">Invoice</button></div>`]}))}</div>`;
      document.getElementById('page-sales').innerHTML=header('Sales & Get Paid','Manage invoices, services, sales orders, fulfillment/delivery, and customer collections.',`<button class="btn" data-modal="payment">Receive payment</button><button class="btn" data-modal="serviceItem">Add service</button><button class="btn primary" data-modal="invoice">Create invoice</button>`)+salesTabbar()+body;
      return;
    }
    if(active==='products'){
      document.getElementById('page-sales').innerHTML=header('Sales & Get Paid','Manage invoices, services, products, payment links, recurring payments, and sales orders.',`<button class="btn" data-modal="serviceItem">Add service</button><button class="btn primary" data-modal="invoice">Create invoice</button>`)+salesTabbar()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Products & Services used for sales</h3><div class="muted small">These items can be selected on invoices, estimates, sales orders, recurring invoices, and payment links.</div></div><button class="btn primary" data-nav="inventory">Open Products & Services Center</button></div>${table(['Item','Type','Billing / sales unit','Price','Income account','Tax code','Inventory rule'],sellableItems().map(p=>[`${escapeHTML(p.name)}<div class="muted small">${escapeHTML(p.sku||p.id)}</div>`,itemTypePill(p),escapeHTML(p.salesUnit||'each'),money(p.price),escapeHTML(accountLabel(p.incomeAccountId||'4000')),escapeHTML(getTaxCode(p.taxCodeId||'GST5').code),isInventoryTracked(p.id)?`${num(stockAvailable(p.id))} available`:'No stock tracking']))}</div>`;
      return;
    }
    return v71RenderSalesBase();
  };

  function itemModalFields(item={}){
    const t=itemType(item.type?item:{type:item.type||'Service'});
    const val=(k,d='')=>escapeHTML(item[k] ?? d);
    const sel=(a,b)=>String(a)===String(b)?'selected':'';
    return `<div class="form-grid"><div class="field"><label>Item type</label><select name="type"><option ${sel(item.type,'Service')}>Service</option><option ${sel(item.type,'Product')}>Product</option><option ${sel(item.type,'Non-Inventory')}>Non-Inventory</option><option ${sel(item.type,'Bundle')}>Bundle</option></select></div><div class="field"><label>SKU / item code</label><input name="sku" value="${val('sku')}"></div><div class="field full"><label>Name</label><input name="name" value="${val('name')}" required></div><div class="field full"><label>Description</label><textarea name="description">${val('description')}</textarea></div><div class="field"><label>Sales price / rate</label><input type="number" step="0.01" min="0" name="price" value="${num(item.price||125)}" required></div><div class="field"><label>Billing / sales unit</label><select name="salesUnit"><option ${sel(item.salesUnit,'hour')}>hour</option><option ${sel(item.salesUnit,'day')}>day</option><option ${sel(item.salesUnit,'job')}>job</option><option ${sel(item.salesUnit,'month')}>month</option><option ${sel(item.salesUnit,'each')}>each</option><option ${sel(item.salesUnit,'fixed fee')}>fixed fee</option></select></div><div class="field"><label>Income account</label><select name="incomeAccountId">${accountOptions(['Income']).replace(`value="${item.incomeAccountId||''}"`,`value="${item.incomeAccountId||''}" selected`)}</select></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions(item.taxCodeId||'GST5')}</select></div><div class="field"><label>Service category</label><input name="serviceCategory" value="${val('serviceCategory', t==='Service'?'Professional service':'')}"></div><div class="field"><label>Estimated service cost / unit</label><input type="number" step="0.01" min="0" name="costRate" value="${num(item.costRate||0)}"></div><div class="field"><label>Qty on hand</label><input type="number" step="1" name="qty" value="${num(item.qty||0)}"></div><div class="field"><label>Average cost</label><input type="number" step="0.01" min="0" name="avgCost" value="${num(item.avgCost||0)}"></div><div class="field"><label>Reorder point</label><input type="number" step="1" min="0" name="reorderPoint" value="${num(item.reorderPoint||0)}"></div><div class="field"><label>Preferred vendor</label><select name="preferredVendorId"><option value="">None</option>${state.vendors.map(v=>`<option value="${v.id}" ${v.id===item.preferredVendorId?'selected':''}>${escapeHTML(v.name)}</option>`).join('')}</select></div><div class="field full"><label>Options</label><div class="widget-list"><label class="widget-option"><input type="checkbox" name="trackInventory" ${item.trackInventory?'checked':''}> Track inventory quantity and COGS</label><label class="widget-option"><input type="checkbox" name="active" ${item.active!==false?'checked':''}> Active item</label></div></div></div><div class="tax-form-note">Choose <strong>Service</strong> for labour, consulting, maintenance, or other non-inventory work. Services never use inventory quantity, receiving, inventory asset, or COGS.</div>`;
  }

  const v71ModalBodyBase=modalBodyContent;
  modalBodyContent=function(type){
    if(type==='serviceItem') return itemModalFields({type:'Service', incomeAccountId:'4000', taxCodeId:'GST5', salesUnit:'hour', price:125, active:true});
    if(type==='product') return itemModalFields({type:'Product', incomeAccountId:'4010', taxCodeId:'GST5', salesUnit:'each', price:100, avgCost:60, qty:0, reorderPoint:0, trackInventory:true, active:true});
    if(type.startsWith('editItem:')){ const id=type.split(':')[1]; return itemModalFields(getProduct(id)); }
    if(type==='salesOrder') return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Ship / service date</label><input type="date" name="shipDate" value="${addDaysISO(7)}"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option selected>Confirmed</option><option>Open</option></select></div><div class="field full"><label>Item / service</label><select id="soProduct" name="productId">${sellableItemOptions()}</select><div class="hint">Inventory items reserve stock; service and bundle items do not.</div></div><div class="field"><label>Qty / hours</label><input id="soQty" type="number" step="0.01" min="0" name="qty" value="1"></div><div class="field"><label>Unit price / rate</label><input id="soUnitPrice" type="number" step="0.01" min="0" name="unitPrice" value="125"></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions('GST5')}</select></div><div class="field"><label>Channel</label><input name="channel" value="Direct sales"></div></div><div class="inline-total"><span>Sales order total</span><span id="soTotalPreview">${money(125*1*1.05)}</span></div>`;
    return v71ModalBodyBase(type);
  };

  const v71OpenModalBase=openModal;
  openModal=function(type){
    v71OpenModalBase(type);
    if(type==='serviceItem'){ document.getElementById('modalTitle').textContent='Add service item'; document.getElementById('modalSubtitle').textContent='Create a sellable service with rate, billing unit, income account, and tax code.'; }
    if(type==='product'){ document.getElementById('modalTitle').textContent='Add product or item'; document.getElementById('modalSubtitle').textContent='Create an inventory product, non-inventory item, service, or bundle.'; }
    if(type.startsWith('editItem:')){ document.getElementById('modalTitle').textContent='Edit product/service item'; document.getElementById('modalSubtitle').textContent='Update item type, price, revenue account, tax code, service settings, and inventory options.'; }
  };

  function buildItemFromForm(d, existing={}){
    const t=d.type || 'Service'; const inv = (t==='Product') && !!d.trackInventory;
    return {...existing, id:existing.id||uid('P'), name:d.name, type:t, itemType:t, sku:d.sku || existing.sku || uid(t==='Service'?'SERV':'ITEM'), description:d.description||'', price:num(d.price), incomeAccountId:d.incomeAccountId||'4000', taxCodeId:d.taxCodeId||'GST5', salesUnit:d.salesUnit||'each', defaultBillingUnit:d.salesUnit||'each', serviceCategory:d.serviceCategory||'', costRate:num(d.costRate), qty:inv?num(d.qty):0, avgCost:inv?num(d.avgCost):num(d.avgCost), reorderPoint:inv?num(d.reorderPoint):0, preferredVendorId:d.preferredVendorId||'', trackInventory:inv, active:!!d.active, assetAccountId:inv?'1300':'', cogsAccountId:inv?'5000':''};
  }

  const v71SubmitModalBase=submitModal;
  submitModal=function(e){
    if(currentModal==='serviceItem' || currentModal==='product' || currentModal.startsWith('editItem:') || currentModal==='salesOrder'){
      e.preventDefault(); const f=new FormData(e.target), d=Object.fromEntries(f.entries()); d.trackInventory=f.has('trackInventory'); d.active=f.has('active');
      if(currentModal==='serviceItem' || currentModal==='product' || currentModal.startsWith('editItem:')){
        if(currentModal.startsWith('editItem:')){ const id=currentModal.split(':')[1]; const ix=state.products.findIndex(p=>p.id===id); if(ix>=0){ state.products[ix]=buildItemFromForm(d,state.products[ix]); showToast('Product/service item updated.'); audit(`Item updated: ${d.name}`); } }
        else { const item=buildItemFromForm(d); if(currentModal==='serviceItem') { item.type='Service'; item.itemType='Service'; item.trackInventory=false; item.qty=0; item.assetAccountId=''; item.cogsAccountId=''; } state.products.unshift(item); showToast(`${itemType(item)} item added.`); audit(`Item added: ${item.name}`); }
        saveState(); closeModal(); renderAll(); return;
      }
      if(currentModal==='salesOrder'){
        const tracked=isInventoryTracked(d.productId);
        if(tracked && num(d.qty)>stockAvailable(d.productId)&&d.status!=='Draft'){showToast(`Insufficient available stock. Available: ${stockAvailable(d.productId)}.`); return;}
        const so={id:uid('SO'),customerId:d.customerId,date:d.date,shipDate:d.shipDate,status:d.status,channel:d.channel,productId:d.productId,qty:num(d.qty),fulfilledQty:0,unitPrice:num(d.unitPrice),taxCodeId:d.taxCodeId,invoiceId:null};
        so.total=soTotal(so); state.salesOrders.unshift(so); state.settings.salesTab='salesOrders'; state.settings.inventoryTab='salesOrders'; saveState(); closeModal(); renderAll(); showToast(`${so.id} created. ${tracked?'Inventory reserved.':'Service/non-inventory item added with no stock reservation.'}`); return;
      }
    }
    return v71SubmitModalBase(e);
  };

  fulfillSalesOrder=function(id){
    const o=state.salesOrders.find(x=>x.id===id); if(!o)return; const rem=Math.max(0,num(o.qty)-num(o.fulfilledQty)); if(rem<=0){showToast('Sales order already fulfilled/delivered.'); return;}
    const p=getProduct(o.productId);
    if(isInventoryTracked(p.id)){
      if(num(p.qty)<rem){showToast(`Not enough stock. ${p.sku} has ${num(p.qty)} on hand.`); return;}
      p.qty=num(p.qty)-rem; const cogs=rem*num(p.avgCost); state.inventoryMovements.unshift({id:uid('IM'),date:todayISO(),type:'Sales fulfillment',productId:o.productId,qty:-rem,unitCost:num(p.avgCost),cogsAmount:cogs,soId:o.id,sourceId:o.id,memo:`COGS for sales order ${o.id}`});
      showToast(`${o.id} fulfilled. Inventory and COGS updated.`);
    } else {
      state.inventoryMovements.unshift({id:uid('IM'),date:todayISO(),type:'Service / non-inventory delivery',productId:o.productId,qty:0,unitCost:0,cogsAmount:0,soId:o.id,sourceId:o.id,memo:`Delivered ${itemType(p).toLowerCase()} item for ${o.id}; no inventory movement`});
      showToast(`${o.id} delivered. No inventory quantity or COGS movement required.`);
    }
    o.fulfilledQty=num(o.fulfilledQty)+rem; o.status=o.fulfilledQty>=o.qty?'Fulfilled':'Partially Fulfilled'; audit(`Sales order ${o.id} ${isInventoryTracked(p.id)?'fulfilled':'delivered'}`); saveState(); renderAll();
  };

  const v71HandleActionBase=handleAction;
  handleAction=function(action,id){
    if(action==='edit-item'){ openModal('editItem:'+id); return; }
    if(action==='set-inventory-tab'){ state.settings.inventoryTab=id||'overview'; saveState(); renderInventory(); return; }
    return v71HandleActionBase(action,id);
  };

  const v71RenderMenuBase=renderMenu;
  renderMenu=function(){
    v71RenderMenuBase();
    document.querySelectorAll('[data-nav="inventory"]').forEach(btn=>{ if(btn.classList.contains('nav-item')) btn.innerHTML='<span class="dot">â—¼</span>Products & Services<span class="nav-chevron">â€º</span>'; });
  };

  exportData=function(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-backup.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState=function(){ state=structuredClone(initialState); ensureV71State(); saveState(); renderAll(); showToast('Company data reset.'); };


  // ---------- V7.2 user-facing version label cleanup ----------
  function removeVersionLabelsFromString(value){
    return String(value || '')
      .replace(/\s*-\s*V\d+(?:\.\d+)?/gi, '')
      .replace(/\bV\d+(?:\.\d+)?\s*rule:\s*/gi, '')
      .replace(/\bV\d+(?:\.\d+)?\s*(prototype|scope|active|keeps|adds|implemented|initialized)?\s*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
  function ensureV72State(){
    ensureV71State();
    state.company.name = removeVersionLabelsFromString(state.company.name) || 'Your Company';
    state.invoiceSettings ||= {};
    state.invoiceSettings.companyName = removeVersionLabelsFromString(state.invoiceSettings.companyName || state.company.name) || 'Your Company';
    state.invoiceSettings.logoText = removeVersionLabelsFromString(state.invoiceSettings.logoText || 'LOGO') || 'LOGO';
    state.invoiceSettings.footerNote = removeVersionLabelsFromString(state.invoiceSettings.footerNote || 'This invoice was generated in SmartBooks. Please contact us if you have questions about this invoice.');
    if (Array.isArray(state.auditTrail)) {
      state.auditTrail.forEach(a => { a.action = removeVersionLabelsFromString(a.action); });
    }
    document.title = 'SmartBooks Accounting App';
  }
  function cleanVersionLabelsInDOM(root=document.body){
    if(!root) return;
    const skipTags = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION']);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if(!parent || skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return /\bV\d+(?:\.\d+)?\b/i.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = removeVersionLabelsFromString(node.nodeValue)
        .replace(/^rule:\s*/i,'')
        .replace(/^Scope\s*$/i,'Scope')
        .replace(/\s+([.,:;])/g,'$1');
    });
    document.querySelectorAll('#topCompanyName, .company span').forEach(el => { el.textContent = removeVersionLabelsFromString(el.textContent) || (el.classList.contains('company') ? 'Accounting App' : 'Your Company'); });
    const sideSpan = document.querySelector('.company h1 + span');
    if(sideSpan) sideSpan.textContent='Accounting App';
  }

  const v72RenderAllBase = renderAll;
  renderAll = function(){ ensureV72State(); v72RenderAllBase(); cleanVersionLabelsInDOM(document.body); };
  const v72RenderPageBase = renderPage;
  renderPage = function(page){ ensureV72State(); v72RenderPageBase(page); cleanVersionLabelsInDOM(document.body); };
  const v72RenderInventoryBase = renderInventory;
  renderInventory = function(){ ensureV72State(); v72RenderInventoryBase(); cleanVersionLabelsInDOM(document.getElementById('page-inventory')); };
  const v72RenderSalesBase = renderSales;
  renderSales = function(){ ensureV72State(); v72RenderSalesBase(); cleanVersionLabelsInDOM(document.getElementById('page-sales')); };
  const v72OpenModalBase = openModal;
  openModal = function(type){ ensureV72State(); v72OpenModalBase(type); cleanVersionLabelsInDOM(document.getElementById('modal')); };
  exportData = function(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-backup.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState = function(){ state=structuredClone(initialState); ensureV72State(); saveState(); renderAll(); showToast('Company data reset.'); };



  // ---------- Business item setup mode: Products / Services / Mixed / Simple ----------
  const itemModeDefinitions = {
    services:{label:'Services only', icon:'SVC', headline:'For consulting, maintenance, labour, professional services, and other non-stock work.', guidance:'Service businesses see service items, estimates, invoices, recurring billing, payment links, and service revenue. Inventory quantity, receiving, reorder points, inventory asset, COGS, purchase orders, and three-way match are hidden.'},
    products:{label:'Products only', icon:'INV', headline:'For businesses that sell physical products and track inventory.', guidance:'Product businesses see inventory products, purchase orders, receiving, sales orders, stock availability, reorder points, inventory value, COGS, and three-way match.'},
    mixed:{label:'Products + Services', icon:'ALL', headline:'For contractors, agencies, repair businesses, and firms that sell both products and services.', guidance:'Mixed businesses see the full product, service, inventory, purchase order, sales order, receiving, COGS, and three-way match workflow.'},
    simple:{label:'Simple non-inventory', icon:'SIM', headline:'For businesses selling items or packages without formal stock tracking.', guidance:'Simple non-inventory businesses see sellable services, non-inventory items, bundles, estimates, invoices, and sales orders. Receiving, inventory valuation, reorder points, COGS, and three-way match stay hidden.'}
  };
  function itemMode(){ const m=state.settings?.itemSetupMode || 'mixed'; return itemModeDefinitions[m] ? m : 'mixed'; }
  function modeAllowsItem(p){ const m=itemMode(), t=itemType(p); if(m==='services') return t==='Service'; if(m==='products') return t==='Inventory'; if(m==='simple') return ['Service','Non-Inventory','Bundle'].includes(t); return true; }
  function modeItems(){ return state.products.filter(p=>p.active!==false && modeAllowsItem(p)); }
  function modeInventoryProducts(){ return inventoryProducts().filter(modeAllowsItem); }
  function modeNonInventoryItems(){ return nonInventoryItems().filter(modeAllowsItem); }
  function modeBundleItems(){ return bundleItems().filter(modeAllowsItem); }
  function modeServiceItems(){ return serviceItems().filter(modeAllowsItem); }
  function modeSellableItems(){ return state.products.filter(p=>p.active!==false && modeAllowsItem(p)); }
  function modeSellableItemOptions(selected){ const items=modeSellableItems(); if(!items.length) return '<option value="">No active items available for the selected business setup</option>'; return items.map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''} data-price="${num(p.price)}" data-account="${p.incomeAccountId||'4000'}">${escapeHTML(p.sku||p.id)} Â· ${escapeHTML(p.name)} Â· ${escapeHTML(itemType(p))} Â· ${money(p.price)}</option>`).join(''); }
  function modeInventoryProductOptions(selected){ const items=modeInventoryProducts(); if(!items.length) return '<option value="">No inventory products available</option>'; return items.map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${escapeHTML(p.sku||p.id)} Â· ${escapeHTML(p.name)} Â· available ${num(stockAvailable(p.id))}</option>`).join(''); }
  function modeTabs(){ const m=itemMode(); if(m==='services') return [['overview','Overview'],['services','Services']]; if(m==='products') return [['overview','Overview'],['products','Inventory Products'],['purchaseOrders','Purchase Orders'],['receiving','Receiving'],['salesOrders','Sales Orders'],['matching','3-Way Match'],['movements','Movements']]; if(m==='simple') return [['overview','Overview'],['services','Services'],['noninventory','Non-Inventory'],['bundles','Bundles'],['salesOrders','Sales Orders']]; return [['overview','Overview'],['services','Services'],['products','Inventory Products'],['noninventory','Non-Inventory'],['bundles','Bundles'],['purchaseOrders','Purchase Orders'],['receiving','Receiving'],['salesOrders','Sales Orders'],['matching','3-Way Match'],['movements','Movements']]; }
  function defaultProductTypeForMode(){ const m=itemMode(); if(m==='services') return 'Service'; if(m==='products') return 'Product'; if(m==='simple') return 'Non-Inventory'; return 'Product'; }
  function modeActionButtons(){ const m=itemMode(); if(m==='services') return `<button class="btn primary" data-modal="serviceItem">Add service</button><button class="btn" data-modal="salesOrder">Create service order</button><button class="btn" data-modal="invoice">Create invoice</button>`; if(m==='products') return `<button class="btn" data-modal="product">Add product</button><button class="btn" data-modal="salesOrder">Create sales order</button><button class="btn primary" data-modal="purchaseOrder">Create purchase order</button>`; if(m==='simple') return `<button class="btn primary" data-modal="product">Add item</button><button class="btn" data-modal="serviceItem">Add service</button><button class="btn" data-modal="salesOrder">Create sales order</button>`; return `<button class="btn" data-modal="serviceItem">Add service</button><button class="btn" data-modal="salesOrder">Create sales order</button><button class="btn primary" data-modal="purchaseOrder">Create purchase order</button>`; }
  function businessModeSetupCard(){ const mode=itemMode(); return `<div class="mode-setup-card"><div class="mode-setup-head"><div><h3>What do you sell?</h3><p>Choose the item setup that matches your business. This only changes what workflows are shown; existing product, service, inventory, purchase order, and sales order data is preserved.</p></div><span class="stock-pill good">Current: ${escapeHTML(itemModeDefinitions[mode].label)}</span></div><div class="mode-card-grid">${Object.entries(itemModeDefinitions).map(([id,def])=>`<button type="button" class="mode-card ${mode===id?'active':''}" data-action="set-business-mode" data-id="${id}"><span class="mode-icon">${escapeHTML(def.icon)}</span><strong>${escapeHTML(def.label)}</strong><span>${escapeHTML(def.headline)}</span></button>`).join('')}</div></div><div class="mode-guidance"><strong>${escapeHTML(itemModeDefinitions[mode].label)} setup:</strong> ${escapeHTML(itemModeDefinitions[mode].guidance)}</div>`; }
  function v73Metrics(){ const m=itemMode(), c=itemTypeCounts(); if(m==='services') return `<div class="service-metric-grid"><div class="service-metric"><h4>Services</h4><strong>${modeServiceItems().length}</strong><div class="item-note">Billable work only; no inventory tracking.</div></div><div class="service-metric"><h4>Service revenue</h4><strong>${money(serviceRevenueTotal())}</strong><div class="item-note">Calculated from invoice line items.</div></div><div class="service-metric"><h4>Open service orders</h4><strong>${state.salesOrders.filter(o=>modeAllowsItem(getProduct(o.productId))&&!['Invoiced','Closed','Cancelled'].includes(o.status)).length}</strong><div class="item-note">No stock reservation required.</div></div><div class="service-metric"><h4>Recurring templates</h4><strong>${(state.recurringTemplates||[]).length}</strong><div class="item-note">Useful for monthly service billing.</div></div></div>`; if(m==='products') return `<div class="service-metric-grid"><div class="service-metric"><h4>Inventory value</h4><strong>${money(inventoryValue())}</strong><div class="item-note">Inventory Products only.</div></div><div class="service-metric"><h4>Low stock</h4><strong>${lowStockProducts().length}</strong><div class="item-note">At or below reorder point.</div></div><div class="service-metric"><h4>Open POs</h4><strong>${state.purchaseOrders.filter(p=>!['Closed','Billed'].includes(p.status)).length}</strong><div class="item-note">Purchasing queue.</div></div><div class="service-metric"><h4>Open SOs</h4><strong>${state.salesOrders.filter(s=>modeAllowsItem(getProduct(s.productId))&&!['Invoiced','Closed','Cancelled'].includes(s.status)).length}</strong><div class="item-note">Customer demand.</div></div></div>`; if(m==='simple') return `<div class="service-metric-grid"><div class="service-metric"><h4>Sellable items</h4><strong>${modeItems().length}</strong><div class="item-note">Services, non-inventory items, and bundles.</div></div><div class="service-metric"><h4>Non-Inventory</h4><strong>${modeNonInventoryItems().length}</strong><div class="item-note">No stock balance.</div></div><div class="service-metric"><h4>Service revenue</h4><strong>${money(serviceRevenueTotal())}</strong><div class="item-note">Invoice-based revenue.</div></div><div class="service-metric"><h4>Open orders</h4><strong>${state.salesOrders.filter(o=>modeAllowsItem(getProduct(o.productId))&&!['Invoiced','Closed','Cancelled'].includes(o.status)).length}</strong><div class="item-note">No receiving or three-way match.</div></div></div>`; return v71Metrics(); }
  function modeOverviewBody(){ const m=itemMode(); let workflow=''; if(m==='services') workflow=`<div class="mini-flow"><span>Service</span><b>â†’</b><span>Estimate / service order</span><b>â†’</b><span>Invoice</span><b>â†’</b><span>Service revenue</span></div><p class="muted">Services are sellable items with a rate, billing unit, income account, and tax code. They do not use stock quantities or inventory accounting.</p>`; else if(m==='products') workflow=`<div class="mini-flow"><span>Inventory product</span><b>â†’</b><span>PO</span><b>â†’</b><span>Receive</span><b>â†’</b><span>Bill</span><b>â†’</b><span>Sell</span><b>â†’</b><span>COGS</span></div><p class="muted">Inventory Products use stock quantities, average cost, reorder points, inventory asset value, and cost of goods sold.</p>`; else if(m==='simple') workflow=`<div class="mini-flow"><span>Service / item</span><b>â†’</b><span>Estimate / sales order</span><b>â†’</b><span>Invoice</span><b>â†’</b><span>Revenue</span></div><p class="muted">Simple non-inventory mode supports sellable items without receiving, reorder points, inventory value, or COGS movements.</p>`; else workflow=`<div class="mini-flow"><span>Services</span><b>â†’</b><span>Estimate / SO</span><b>â†’</b><span>Invoice</span><b>â†’</b><span>Revenue</span></div><div class="mini-flow"><span>Inventory</span><b>â†’</b><span>PO</span><b>â†’</b><span>Receive</span><b>â†’</b><span>Bill</span><b>â†’</b><span>COGS on sale</span></div><p class="muted">Use this mode when your business sells both billable services and trackable inventory products.</p>`; const rules = m==='products' ? `<div class="report-line"><span>${itemTypePill({type:'Product',trackInventory:true})} Inventory</span><strong>Asset + COGS</strong></div><div class="report-line"><span>Purchase Orders and receiving</span><strong>Visible</strong></div><div class="report-line"><span>Services</span><strong>Hidden</strong></div>` : m==='services' ? `<div class="report-line"><span>${itemTypePill({type:'Service'})} Service</span><strong>No inventory</strong></div><div class="report-line"><span>Purchase Orders and receiving</span><strong>Hidden</strong></div><div class="report-line"><span>COGS movement</span><strong>Hidden</strong></div>` : m==='simple' ? `<div class="report-line"><span>${itemTypePill({type:'Non-Inventory'})} Non-Inventory</span><strong>No stock balance</strong></div><div class="report-line"><span>${itemTypePill({type:'Service'})} Service</span><strong>No inventory</strong></div><div class="report-line"><span>Receiving and three-way match</span><strong>Hidden</strong></div>` : `<div class="report-line"><span>${itemTypePill({type:'Service'})} Service</span><strong>No inventory</strong></div><div class="report-line"><span>${itemTypePill({type:'Product',trackInventory:true})} Inventory</span><strong>Asset + COGS</strong></div><div class="report-line"><span>${itemTypePill({type:'Non-Inventory'})} Non-Inventory</span><strong>No stock balance</strong></div><div class="report-line"><span>${itemTypePill({type:'Bundle'})} Bundle</span><strong>Package</strong></div>`; const summary = m==='products' ? `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><h3 style="margin:0">Inventory product summary</h3><button class="btn" data-modal="product">Add product</button></div>${renderItemTable(inventoryProducts(),'Inventory')}</div>` : `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><h3 style="margin:0">Sellable item summary</h3><button class="btn" data-modal="${m==='services'?'serviceItem':'product'}">Add item</button></div>${renderItemTable(m==='services'?modeServiceItems():modeItems(), m==='services'?'Service':'Non-Inventory')}</div>`; return v73Metrics()+`<div class="grid two"><div class="card"><h3>Products & Services Center</h3>${workflow}<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-modal="${m==='services'?'serviceItem':'product'}">Add item</button>${m==='products'||m==='mixed'?'<button class="btn" data-modal="purchaseOrder">Create PO</button>':''}<button class="btn" data-modal="salesOrder">Create sales order</button></div></div><div class="card"><h3>Item setup rules</h3>${rules}</div></div>${summary}`; }
  function purchaseOrdersBody(){ return `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Purchase Orders</h3><div class="muted small">Issue PO, receive inventory, and convert to vendor bill.</div></div><button class="btn primary" data-modal="purchaseOrder">Create PO</button></div>${table(['PO','Vendor','Product','Ordered','Received','Unit cost','Tax','Total','Status','Actions'],state.purchaseOrders.map(po=>[`<strong>${po.id}</strong>`,escapeHTML(getVendor(po.vendorId).name),escapeHTML(getProduct(po.productId).name),num(po.qty),num(po.receivedQty),money(po.unitCost),money(poTax(po)),money(poTotal(po)),tagForStatus(po.status),`<div class="invoice-actions"><button class="btn square" data-action="issue-po" data-id="${po.id}">Issue</button><button class="btn square" data-action="receive-po" data-id="${po.id}">Receive</button><button class="btn square" data-action="convert-po-bill" data-id="${po.id}">Convert to bill</button></div>`]))}</div>`; }
  function receivingBody(){ return `<div class="grid two"><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Open receiving queue</h3></div>${table(['PO','Product','Remaining','Expected','Action'],state.purchaseOrders.filter(po=>num(po.receivedQty)<num(po.qty)).map(po=>[po.id,escapeHTML(getProduct(po.productId).name),num(num(po.qty)-num(po.receivedQty)),po.expectedDate,`<button class="btn square" data-action="receive-po" data-id="${po.id}">Receive remaining</button>`]))}</div><div class="card table-card"><div class="toolbar"><h3 style="margin:0">Receiving history</h3></div>${table(['Receipt','PO','Product','Date','Qty','Unit cost'],state.receivingRecords.map(r=>[r.id,r.poId,escapeHTML(getProduct(r.productId).name),r.date,num(r.qty),money(r.unitCost)]))}</div></div>`; }
  function salesOrdersBody(){ const rows=state.salesOrders.filter(o=>modeAllowsItem(getProduct(o.productId))); return `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Sales Orders</h3><div class="muted small">Inventory items reserve stock. Service and non-inventory items can be delivered without stock movement.</div></div><button class="btn primary" data-modal="salesOrder">Create sales order</button></div>${table(['SO','Customer','Item','Type','Qty / Hours','Fulfilled / Delivered','Ship / Service date','Status','Total','Actions'],rows.map(o=>{const p=getProduct(o.productId); const label=isInventoryTracked(p.id)?'Fulfill':'Deliver'; return [`<strong>${o.id}</strong>`,escapeHTML(getCustomer(o.customerId).name),escapeHTML(p.name),itemTypePill(p),num(o.qty),num(o.fulfilledQty),o.shipDate,tagForStatus(o.status),money(soTotal(o)),`<div class="invoice-actions"><button class="btn square" data-action="fulfill-so" data-id="${o.id}">${label}</button><button class="btn square" data-action="convert-so-invoice" data-id="${o.id}">Invoice</button><button class="btn square" data-action="release-so" data-id="${o.id}">Close</button></div>`]}))}</div>`; }
  function matchingBody(){ return `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Three-way match: PO â†’ Receiving â†’ Bill</h3><div class="muted small">Compare ordered quantity, received quantity, bill source, amount, and match status.</div></div></div>${table(['PO','Vendor','Product','Ordered','Received','Bill','PO total','Match status','Detail'],state.purchaseOrders.map(po=>{const m=poMatchStatus(po); return [po.id,escapeHTML(getVendor(po.vendorId).name),escapeHTML(getProduct(po.productId).name),num(po.qty),num(po.receivedQty),po.billId||'â€”',money(poTotal(po)),`<span class="tag ${m.cls}">${m.label}</span>`,escapeHTML(m.detail)]}))}</div>`; }
  function movementsBody(){ return `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Inventory movements</h3><div class="muted small">Receipts, adjustments, fulfillment, and COGS movements.</div></div><button class="btn primary" data-modal="inventoryAdjust">Adjust inventory</button></div>${table(['Movement','Date','Type','Product','Qty','Unit cost','COGS','Source','Memo'],state.inventoryMovements.map(m=>[m.id,m.date,escapeHTML(m.type),escapeHTML(getProduct(m.productId).name),num(m.qty),money(m.unitCost),money(m.cogsAmount),escapeHTML(m.sourceId||m.poId||m.soId||'â€”'),escapeHTML(m.memo||'')]))}</div>`; }
  function ensureV73State(){ ensureV72State(); state.settings ||= {}; state.settings.itemSetupMode ||= 'mixed'; if(!itemModeDefinitions[state.settings.itemSetupMode]) state.settings.itemSetupMode='mixed'; const visible=modeTabs().map(t=>t[0]); if(!visible.includes(state.settings.inventoryTab)) state.settings.inventoryTab='overview'; }

  const v73RenderInventoryBase = renderInventory;
  renderInventory = function(){ ensureV73State(); const tabs=modeTabs(); let active=state.settings.inventoryTab || 'overview'; if(!tabs.some(t=>t[0]===active)) active='overview'; let body=''; if(active==='overview') body=businessModeSetupCard()+modeOverviewBody(); if(active==='services') body=businessModeSetupCard()+v73Metrics()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Services</h3><div class="muted small">Services are billable items for invoices, estimates, sales orders, recurring invoices, and payment links. They do not track quantity on hand.</div></div><button class="btn primary" data-modal="serviceItem">Add service</button></div>${renderItemTable(modeServiceItems(),'Service')}</div>`; if(active==='products') body=businessModeSetupCard()+v73Metrics()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Inventory Products</h3><div class="muted small">SKU, on-hand, committed, available, average cost, reorder point, and valuation.</div></div><button class="btn" data-modal="inventoryAdjust">Adjust inventory</button></div>${renderItemTable(modeInventoryProducts(),'Inventory')}</div>`; if(active==='noninventory') body=businessModeSetupCard()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Non-Inventory products</h3><div class="muted small">Items you buy or sell but do not track as inventory assets.</div></div><button class="btn primary" data-modal="product">Add non-inventory item</button></div>${renderItemTable(modeNonInventoryItems(),'Non-Inventory')}</div>`; if(active==='bundles') body=businessModeSetupCard()+`<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Bundles / packages</h3><div class="muted small">Group services and products into a package for quoting and invoicing.</div></div><button class="btn primary" data-modal="product">Add bundle</button></div>${renderItemTable(modeBundleItems(),'Bundle')}</div>`; if(active==='purchaseOrders') body=businessModeSetupCard()+purchaseOrdersBody(); if(active==='receiving') body=businessModeSetupCard()+receivingBody(); if(active==='salesOrders') body=businessModeSetupCard()+salesOrdersBody(); if(active==='matching') body=businessModeSetupCard()+matchingBody(); if(active==='movements') body=businessModeSetupCard()+movementsBody(); document.getElementById('page-inventory').innerHTML=header('Products & Services','Choose whether your business sells services, products, or both. The page adapts so users only see the workflows they need.',modeActionButtons())+renderOpsTabbar(active,tabs,'set-inventory-tab')+body; cleanVersionLabelsInDOM(document.getElementById('page-inventory')); };

  const v73ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){ if(type==='product'){ const t=defaultProductTypeForMode(); return itemModalFields({type:t, itemType:t, salesUnit:t==='Service'?'hour':'each', price:t==='Service'?125:100, avgCost:0, qty:0, reorderPoint:0, trackInventory:t==='Product', active:true}); } if(type==='purchaseOrder'){ return `<div class="form-grid"><div class="field"><label>Vendor</label><select name="vendorId">${vendorOptions()}</select></div><div class="field"><label>PO date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Expected date</label><input type="date" name="expectedDate" value="${addDaysISO(14)}"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option>Issued</option></select></div><div class="field full"><label>Inventory product</label><select name="productId">${modeInventoryProductOptions()}</select></div><div class="field"><label>Quantity</label><input type="number" step="1" min="1" name="qty" value="10"></div><div class="field"><label>Unit cost</label><input type="number" step="0.01" min="0" name="unitCost" value="250"></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions('GST5')}</select></div></div><div class="tax-form-note">Purchase Orders are available when inventory products are enabled. Receiving updates stock; bill conversion updates Inventory Asset and A/P.</div>`; } if(type==='salesOrder'){ const first=modeSellableItems()[0]; return `<div class="form-grid"><div class="field"><label>Customer</label><select name="customerId">${customerOptions()}</select></div><div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div><div class="field"><label>Ship / service date</label><input type="date" name="shipDate" value="${addDaysISO(7)}"></div><div class="field"><label>Status</label><select name="status"><option>Draft</option><option selected>Confirmed</option><option>Open</option></select></div><div class="field full"><label>Item / service</label><select id="soProduct" name="productId">${modeSellableItemOptions(first?.id)}</select><div class="hint">The selected business setup controls whether services, non-inventory items, inventory products, or all item types are available.</div></div><div class="field"><label>Qty / hours</label><input id="soQty" type="number" step="0.01" min="0" name="qty" value="1"></div><div class="field"><label>Unit price / rate</label><input id="soUnitPrice" type="number" step="0.01" min="0" name="unitPrice" value="${num(first?.price||125)}"></div><div class="field"><label>Tax code</label><select name="taxCodeId">${taxCodeOptions(first?.taxCodeId||'GST5')}</select></div><div class="field"><label>Channel</label><input name="channel" value="Direct sales"></div></div><div class="inline-total"><span>Sales order total</span><span id="soTotalPreview">${money(num(first?.price||125)*1*1.05)}</span></div>`; } return v73ModalBodyBase(type); };

  const v73SubmitModalBase = submitModal;
  submitModal = function(e){ if(currentModal==='purchaseOrder'){ const d=Object.fromEntries(new FormData(e.target).entries()); if(!d.productId){ e.preventDefault(); showToast('Add or enable at least one inventory product before creating a purchase order.'); return; } } if(currentModal==='salesOrder'){ const d=Object.fromEntries(new FormData(e.target).entries()); if(!d.productId){ e.preventDefault(); showToast('Add at least one sellable item for the selected business setup.'); return; } } return v73SubmitModalBase(e); };

  const v73HandleActionBase = handleAction;
  handleAction = function(action,id){ if(action==='set-business-mode'){ ensureV73State(); state.settings.itemSetupMode = itemModeDefinitions[id] ? id : 'mixed'; const valid=modeTabs().map(t=>t[0]); if(!valid.includes(state.settings.inventoryTab)) state.settings.inventoryTab='overview'; saveState(); renderInventory(); showToast(`Products & Services setup changed to ${itemModeDefinitions[state.settings.itemSetupMode].label}.`); return; } return v73HandleActionBase(action,id); };

  const v73RenderSalesBase = renderSales;
  renderSales = function(){ ensureV73State(); v73RenderSalesBase(); const el=document.getElementById('page-sales'); if(el && (state.settings.salesTab||'overview')==='productsServices'){ const tableEl = el.querySelector('.card.table-card'); if(tableEl){ tableEl.outerHTML = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Products and services used for sales</h3><div class="muted small">Visible items follow the selected Products & Services setup mode.</div></div><button class="btn primary" data-nav="inventory">Open Products & Services Center</button></div>${table(['Item','Type','Billing / sales unit','Price','Income account','Tax code','Inventory rule'],modeSellableItems().map(p=>[`${escapeHTML(p.name)}<div class="muted small">${escapeHTML(p.sku||p.id)}</div>`,itemTypePill(p),escapeHTML(p.salesUnit||'each'),money(p.price),escapeHTML(accountLabel(p.incomeAccountId||'4000')),escapeHTML(getTaxCode(p.taxCodeId||'GST5').code),isInventoryTracked(p.id)?`${num(stockAvailable(p.id))} available`:'No stock tracking']))}</div>`; } } cleanVersionLabelsInDOM(el); };

  exportData = function(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-backup.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState = function(){ state=structuredClone(initialState); ensureV73State(); saveState(); renderAll(); showToast('Company data reset.'); };


  // ---------- Menu Visibility Persistence Fix ----------
  const masterModuleRegistry = [
    {id:'dashboard', label:'Dashboards', icon:'â–¦', locked:true},
    {id:'setup', label:'Setup Checklist', icon:'âœ“'},
    {id:'apps', label:'My Apps', icon:'â–©'},
    {id:'banking', label:'Banking', icon:'â—‰'},
    {id:'transactions', label:'Transactions', icon:'â‡„'},
    {id:'accounting', label:'Accounting', icon:'â–¤'},
    {id:'sales', label:'Sales & Get Paid', icon:'â†—'},
    {id:'customers', label:'Customers & Leads', icon:'â˜˜'},
    {id:'expenses', label:'Expenses & Pay Bills', icon:'â–¸'},
    {id:'vendors', label:'Vendors', icon:'â–¡'},
    {id:'reports', label:'Reports', icon:'â˜·'},
    {id:'inventory', label:'Products & Services', icon:'â—¼'},
    {id:'projects', label:'Projects', icon:'â—†'},
    {id:'time', label:'Time', icon:'â—·'},
    {id:'payroll', label:'Payroll & HR', icon:'â™¢'},
    {id:'taxes', label:'Taxes', icon:'â—–'},
    {id:'settings', label:'Settings', icon:'âš™', locked:true}
  ];
  const masterModuleIds = masterModuleRegistry.map(m=>m.id);
  const alwaysVisibleModules = new Set(['dashboard','settings']);
  const moduleLabel = (id) => (masterModuleRegistry.find(m=>m.id===id)?.label || id);
  function normalizeVisibleModules(ids){
    let selected = Array.isArray(ids) ? ids.filter(Boolean) : masterModuleIds.slice();
    selected = selected.map(id => id === 'products' ? 'inventory' : id);
    const allowed = new Set(masterModuleIds);
    selected = selected.filter((id,idx,arr)=>allowed.has(id) && arr.indexOf(id)===idx);
    alwaysVisibleModules.forEach(id=>{ if(!selected.includes(id)) selected.push(id); });
    if(!selected.length) selected = masterModuleIds.slice();
    return selected.sort((a,b)=>masterModuleIds.indexOf(a)-masterModuleIds.indexOf(b));
  }
  function ensureV74State(){
    ensureV73State();
    state.settings ||= {};
    if(!Array.isArray(state.settings.visibleModules) || !state.settings.visibleModules.length){ state.settings.visibleModules = masterModuleIds.slice(); }
    state.settings.visibleModules = normalizeVisibleModules(state.settings.visibleModules);
    state.settings.menuMigrationComplete = true;
    // Keep the older base menu metadata aligned for any legacy renderer that still reads menuModules, without changing user visibility choices.
    menuModules.forEach(m=>{ if(m.id==='inventory') m.label='Products & Services'; if(m.id==='payroll') m.label='Payroll & HR'; if(m.id==='expenses') m.label='Expenses & Pay Bills'; if(m.id==='sales') m.label='Sales & Get Paid'; });
    if(!menuModules.some(m=>m.id==='setup')) menuModules.splice(1,0,{id:'setup', label:'Setup Checklist', icon:'âœ“'});
    if(!menuModules.some(m=>m.id==='apps')) menuModules.splice(2,0,{id:'apps', label:'My Apps', icon:'â–©'});
    if(!canNavigate(currentPage)) currentPage='dashboard';
  }
  function isModuleVisible(id){
    ensureModuleListOnly();
    return alwaysVisibleModules.has(id) || (state.settings.visibleModules || []).includes(id);
  }
  function ensureModuleListOnly(){
    state.settings ||= {};
    state.settings.visibleModules = normalizeVisibleModules(state.settings.visibleModules || masterModuleIds);
  }
  function canNavigate(page){
    if(!page) return true;
    if(page==='dashboard' || page==='settings') return true;
    if(masterModuleIds.includes(page)) return isModuleVisible(page);
    return true;
  }
  function modalRequiredModules(type){
    const map = {
      invoice:['sales'], payment:['sales'], statement:['customers'], estimate:['sales'], salesOrder:['sales'], creditMemo:['sales'], salesReceipt:['sales'], recurringPayment:['sales'], paymentLink:['sales'], shippingLabel:['sales'], refundReceipt:['sales'], delayedCredit:['sales'], delayedCharge:['sales'], customer:['customers'],
      expense:['expenses'], check:['expenses'], bill:['expenses'], payBill:['expenses'], purchaseOrder:['inventory','vendors'], vendorCredit:['vendors'], creditCardCredit:['expenses'], printChecks:['expenses'], vendor:['vendors'],
      payroll:['payroll'], employee:['payroll'], contractor:['payroll'], singleActivity:['time'], weeklyTimesheet:['time'], reviewTime:['time'], time:['time'],
      deposit:['banking'], transfer:['banking'], bankTx:['banking'], reconcile:['banking'], payDownCreditCard:['banking'],
      journal:['accounting'], account:['accounting'], inventoryAdjust:['inventory'], product:['inventory'], serviceItem:['inventory'],
      project:['projects'], taxAdjust:['taxes'], taxPayment:['taxes'], taxAgency:['taxes'], taxCode:['taxes'],
      customize:['settings'], customizeDashboard:['settings'], company:['settings']
    };
    return map[type] || [];
  }
  function isModalAllowed(type){
    const required = modalRequiredModules(type);
    if(required.some(id=>!isModuleVisible(id))) return false;
    const mode = itemMode();
    if(['purchaseOrder','inventoryAdjust'].includes(type) && ['services','simple'].includes(mode)) return false;
    if(type==='serviceItem' && mode==='products') return false;
    return true;
  }
  function moduleHiddenMessage(id){ return `${moduleLabel(id)} is hidden. Restore it from Settings â†’ Customize menu.`; }
  function applyCreateMenuVisibility(){
    const menu = document.getElementById('createMenu'); if(!menu) return;
    menu.querySelectorAll('[data-modal]').forEach(btn=>{
      const type = btn.dataset.modal;
      btn.style.display = isModalAllowed(type) ? '' : 'none';
    });
    menu.querySelectorAll('.create-col').forEach(col=>{
      const visibleButtons = Array.from(col.querySelectorAll('[data-modal]')).some(b=>b.style.display !== 'none');
      col.style.display = visibleButtons ? '' : 'none';
    });
  }
  function applyQuickActionVisibility(root=document){
    root.querySelectorAll('[data-modal]').forEach(btn=>{
      const type=btn.dataset.modal;
      if(!type || btn.closest('#createMenu') || btn.closest('#modalBackdrop')) return;
      btn.style.display = isModalAllowed(type) ? '' : 'none';
    });
    root.querySelectorAll('[data-nav]').forEach(btn=>{
      const nav=btn.dataset.nav;
      if(!nav || nav==='dashboard' || nav==='settings') return;
      if(masterModuleIds.includes(nav)) btn.style.display = isModuleVisible(nav) ? '' : 'none';
    });
    document.querySelectorAll('.rail [data-nav]').forEach(btn=>{
      const nav=btn.dataset.nav;
      btn.style.display = canNavigate(nav) ? '' : 'none';
    });
    const resetBtn=document.getElementById('resetDemo'); if(resetBtn) resetBtn.innerHTML='<span class="dot">â†º</span>Reset company data';
    const sideSpan = document.querySelector('.company h1 + span'); if(sideSpan) sideSpan.textContent='Accounting App';
  }
  function visibleSetupTasks(includeHidden=false){
    ensureV74State();
    return (state.setupTasks||[]).filter(t => (includeHidden || !t.hidden) && (!t.nav || canNavigate(t.nav)));
  }
  function cleanProductLanguageInDOM(root=document.body){
    cleanVersionLabelsInDOM(root);
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      node.nodeValue = node.nodeValue
        .replace(/\bprototype\b/gi,'app')
        .replace(/\bV\d+(?:\.\d+)?\b/g,'')
        .replace(/V\d+(?:\.\d+)?\s+/g,'')
        .replace(/\bFuture connection point\b/gi,'Connection center')
        .replace(/\bFuture\b/gi,'Upcoming')
        .replace(/\bPlanned:\s*/gi,'Available when connected: ')
        .replace(/\bDemo data\b/gi,'Sample data')
        .replace(/\bdemo data\b/gi,'sample data')
        .replace(/\bDemo only\b/gi,'Sample connection')
        .replace(/\s+([.,:;])/g,'$1')
        .replace(/\s{2,}/g,' ');
    });
  }

  renderMenu = function(){
    ensureV74State();
    const list = document.getElementById('menuList');
    const visible = new Set(state.settings.visibleModules || masterModuleIds);
    list.innerHTML = masterModuleRegistry
      .filter(m=>visible.has(m.id))
      .map(m=>`<button class="nav-item ${currentPage===m.id?'active':''}" data-nav="${m.id}"><span class="dot">${m.icon}</span>${escapeHTML(m.label)}<span class="nav-chevron">â€º</span></button>`)
      .join('');
  };
  renderModulePills = function(){
    ensureV74State();
    const preferred = ['accounting','expenses','sales','customers','banking','transactions','reports','inventory','taxes','time','projects','payroll'];
    const mods = preferred.map(id=>masterModuleRegistry.find(m=>m.id===id)).filter(Boolean).filter(m=>isModuleVisible(m.id));
    document.getElementById('modulePills').innerHTML = mods.map(m=>`<button class="module-pill" data-nav="${m.id}"><span class="module-icon">${m.icon}</span>${escapeHTML(m.label)}</button>`).join('');
    const hr = new Date().getHours(); const part = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening'; document.getElementById('greeting').textContent = `Good ${part}, Quak!`;
  };
  renderSetupCard = function(){
    ensureV74State();
    const tasks = visibleSetupTasks(false);
    const allTasks = visibleSetupTasks(true);
    const done = allTasks.filter(t=>t.done).length, total = allTasks.length || 1, pct = Math.round(done/total*100);
    const card=document.getElementById('setupCard'); if(!card) return;
    card.innerHTML = `<h3>Setup Checklist</h3><div class="muted">Guided setup for the modules currently shown in your menu.</div><div class="setup-progress"><span style="width:${pct}%"></span></div><div class="report-line"><span>${done} of ${total} completed</span><strong>${pct}%</strong></div><div class="checklist">${tasks.slice(0,4).map(t=>`<div class="check-row ${t.done?'done':''}"><span class="check-dot">${t.done?'âœ“':'â—‹'}</span><div><strong>${escapeHTML(t.title)}</strong><div class="muted small">${escapeHTML(t.group)}</div></div><button class="btn square" data-action="complete-setup-task" data-id="${t.id}">${t.done?'Undo':'Done'}</button></div>`).join('')}</div>${isModuleVisible('setup')?'<button class="btn primary" data-nav="setup" style="margin-top:14px;width:100%">Open setup checklist</button>':''}`;
  };
  renderSetupPage = function(){
    ensureV74State();
    const el=document.getElementById('page-setup'); if(!el) return;
    const tasks = visibleSetupTasks(true);
    const done = tasks.filter(t=>t.done).length, total = tasks.length || 1, pct = Math.round(done/total*100);
    const groups = [...new Set(tasks.map(t=>t.group))];
    el.innerHTML = header('Setup Checklist', 'Guided onboarding for the modules currently visible in your menu.', `<button class="btn" data-modal="customizeDashboard">Customize dashboard</button><button class="btn primary" data-modal="company">Company settings</button>`) +
      `<div class="card" style="margin-bottom:16px"><h3>Progress</h3><div class="setup-progress"><span style="width:${pct}%"></span></div><div class="report-line"><span>${done} of ${total} tasks completed</span><strong>${pct}%</strong></div></div>` +
      (groups.length ? groups.map(g=>`<div class="card" style="margin-bottom:16px"><h3>${escapeHTML(g)}</h3><div class="checklist">${tasks.filter(t=>t.group===g).map(t=>`<div class="check-row ${t.done?'done':''} ${t.hidden?'hidden-task':''}"><span class="check-dot">${t.done?'âœ“':'â—‹'}</span><div><strong>${escapeHTML(t.title)}</strong><div class="muted small">${t.hidden?'Hidden from dashboard':'Visible task'}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn square" data-nav="${t.nav}">Open</button><button class="btn square" data-action="complete-setup-task" data-id="${t.id}">${t.done?'Undo':'Done'}</button><button class="btn square" data-action="hide-setup-task" data-id="${t.id}">${t.hidden?'Show':'Hide'}</button></div></div>`).join('')}</div></div>`).join('') : '<div class="empty">No setup tasks are available for the currently visible modules.</div>');
    applyQuickActionVisibility(el);
  };
  renderApps = function(){
    ensureV74State();
    const el=document.getElementById('page-apps'); if(!el) return;
    const descriptions = {
      dashboard:'Business overview, smart suggestions, and quick actions.', setup:'Guided setup for visible modules.', apps:'Launch enabled modules from one center.', banking:'Bank transactions, matching, clearing, and reconciliation.', transactions:'All posted and imported transaction activity.', accounting:'Chart of accounts, journal entries, trial balance, and audit trail.', sales:'Invoices, payment links, sales orders, recurring payments, and payouts.', customers:'Customer profiles, open balances, and receivables.', expenses:'Expenses, bills, vendor payments, and approval workflow.', vendors:'Supplier records, open bills, purchase orders, and payment history.', reports:'Financial, tax, sales, A/R, A/P, inventory, and management reports.', inventory:'Services, inventory products, non-inventory items, bundles, PO/SO workflows, receiving, and movements.', projects:'Project budgets, costs, revenue, and profitability.', time:'Time entries, billable hours, and team activity.', payroll:'Employee setup, payroll workflow, and pay-run preparation.', taxes:'Tax returns, agencies, rates, collected tax, input tax credits, and payments.', settings:'Company profile, menu customization, invoice branding, and data controls.'
    };
    const apps = masterModuleRegistry.filter(m=>isModuleVisible(m.id));
    el.innerHTML = header('My Apps', 'Open the modules enabled for this company. Hidden modules can be restored from Settings.', `<button class="btn" data-modal="customize">Customize app menus</button>`) + `<div class="app-grid">${apps.map(m=>`<div class="app-tile"><span class="tile-icon">${m.icon}</span><h3>${escapeHTML(m.label)}</h3><p class="muted">${escapeHTML(descriptions[m.id]||'Module workspace.')}</p><button class="btn" data-nav="${m.id}">Open</button></div>`).join('')}</div>`;
  };
  renderSettings = function(){
    ensureV74State();
    const el=document.getElementById('page-settings');
    el.innerHTML = header('Settings', 'Company profile, tax rate, accounting method, menu customization, dashboard controls, and local data controls.', `<button class="btn" data-modal="customizeDashboard">Customize dashboard</button><button class="btn" data-modal="customize">Customize menu</button><button class="btn primary" data-modal="company">Company settings</button>`) +
      `<div class="grid two"><div class="card"><h3>Company</h3><div class="report-line"><span>Name</span><strong>${escapeHTML(state.company.name)}</strong></div><div class="report-line"><span>Province</span><strong>${escapeHTML(state.company.province)}</strong></div><div class="report-line"><span>Fiscal year</span><strong>${escapeHTML(state.company.fiscalYear)}</strong></div><div class="report-line"><span>Sales tax</span><strong>${state.company.salesTax}%</strong></div><div class="report-line"><span>Method</span><strong>${escapeHTML(state.company.accountingMethod||'Accrual')}</strong></div></div><div class="card"><h3>Menu & dashboard</h3><div class="report-line"><span>Visible modules</span><strong>${state.settings.visibleModules.length}</strong></div><div class="report-line"><span>Privacy mode</span><strong>${state.settings.privacyMode?'On':'Off'}</strong></div><div class="report-line"><span>Visible dashboard widgets</span><strong>${(state.settings.dashboardWidgets||[]).length}</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" data-modal="customize">Customize menu</button><button class="btn" data-modal="customizeDashboard">Customize widgets</button><button class="btn" data-action="toggle-privacy">Toggle privacy</button></div></div></div>`+
      `<div class="grid two" style="margin-top:16px"><div class="card"><h3>Data</h3><p class="muted">Data is stored in this browser using localStorage. Export a backup before clearing browser data.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="exportData2">Export JSON</button><button class="btn danger" id="resetDemo2">Reset company data</button></div></div><div class="card"><h3>Implemented capabilities</h3><p class="muted">Setup Checklist, customizable menus, dashboard controls, Sales & Get Paid workflow, invoice templates, tax center, banking, accounting, Products & Services, purchase orders, sales orders, receiving, and three-way match are available.</p></div></div>`;
    document.getElementById('exportData2').addEventListener('click', exportData); document.getElementById('resetDemo2').addEventListener('click', resetState);
  };
  renderPayroll = function(){ const el=document.getElementById('page-payroll'); el.innerHTML = header('Payroll', 'Set up employees, contractors, pay schedules, deductions, and payroll remittances.', `<button class="btn primary" data-modal="payroll">Payroll setup</button>`)+`<div class="card"><h3>Payroll workspace</h3><p class="muted">Payroll calculations depend on jurisdiction, pay rules, deductions, and remittance requirements. Use this area to prepare employee and contractor records before connecting payroll services.</p></div>`; };

  const v74ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    if(type==='customize'){
      const visible = new Set(normalizeVisibleModules(state.settings.visibleModules));
      return `<p class="muted">Select the modules that should appear in the left menu, top shortcuts, My Apps, setup links, and quick actions. Dashboards and Settings are always on; all other modules can be hidden or restored anytime.</p><div class="grid two">${masterModuleRegistry.map(m=>{ const locked=!!m.locked; return `<label class="card" style="display:flex;align-items:center;gap:12px;padding:12px;${locked?'opacity:.78':''}"><input type="checkbox" name="module" value="${m.id}" ${visible.has(m.id)?'checked':''} ${locked?'disabled':''}> <span class="module-icon" style="width:28px;height:28px;font-size:12px">${m.icon}</span><strong>${escapeHTML(m.label)}</strong>${locked?'<span class="muted small" style="margin-left:auto">Always on</span>':''}</label>`; }).join('')}</div><div class="tax-form-note">Hidden modules are not deleted. You can restore them anytime from Settings.</div>`;
    }
    return v74ModalBodyBase(type);
  };
  const v74SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='customize'){
      e.preventDefault();
      const selected = Array.from(document.querySelectorAll('input[name="module"]:checked')).map(i=>i.value);
      state.settings.visibleModules = normalizeVisibleModules(selected);
      if(!canNavigate(currentPage)) currentPage='dashboard';
      audit('Menu visibility updated');
      saveState(); closeModal(); renderAll();
      showToast('Menu updated. Hidden modules will stay hidden until restored from Settings.');
      return;
    }
    return v74SubmitModalBase(e);
  };
  const v74OpenModalBase = openModal;
  openModal = function(type){
    ensureV74State();
    if(!isModalAllowed(type)){
      const blocked = modalRequiredModules(type).find(id=>!isModuleVisible(id));
      showToast(blocked ? moduleHiddenMessage(blocked) : 'This action is hidden by your Products & Services setup.');
      return;
    }
    v74OpenModalBase(type);
    cleanProductLanguageInDOM(document.getElementById('modalBackdrop'));
  };
  const v74NavigateBase = navigate;
  navigate = function(page){
    ensureV74State();
    if(!canNavigate(page)){
      showToast(moduleHiddenMessage(page));
      page='dashboard';
    }
    v74NavigateBase(page);
    applyQuickActionVisibility(document);
    cleanProductLanguageInDOM(document.body);
  };
  const v74RenderPageBase = renderPage;
  renderPage = function(page){
    ensureV74State();
    if(!canNavigate(page)) page='dashboard';
    v74RenderPageBase(page);
    applyQuickActionVisibility(document);
    cleanProductLanguageInDOM(document.body);
  };
  const v74RenderAllBase = renderAll;
  renderAll = function(){
    ensureV74State();
    if(!canNavigate(currentPage)) currentPage='dashboard';
    v74RenderAllBase();
    applyCreateMenuVisibility();
    applyQuickActionVisibility(document);
    cleanProductLanguageInDOM(document.body);
  };
  const v74ToggleCreateMenuBase = toggleCreateMenu;
  toggleCreateMenu = function(){ applyCreateMenuVisibility(); v74ToggleCreateMenuBase(); };
  exportData = function(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-backup.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState = function(){ state=structuredClone(initialState); state.settings.visibleModules = masterModuleIds.slice(); ensureV74State(); saveState(); renderAll(); showToast('Company data reset.'); };




  // ---------- V8 Clean UI, Business Feed, and Reports Redesign ----------
  function injectV8Styles(){
    if(document.getElementById('v8-clean-ui-style')) return;
    const style=document.createElement('style');
    style.id='v8-clean-ui-style';
    style.textContent=`
      body.v8-ui{background:#f8fbfd;color:#172033}
      body.v8-ui .app{grid-template-columns:66px 220px minmax(0,1fr)}
      body.v8-ui .rail{background:#eef6f7;border-right:1px solid #dbe6ec}
      body.v8-ui .brand-mini{background:linear-gradient(145deg,#12a454,#087b38);box-shadow:0 10px 22px rgba(10,143,60,.18)}
      body.v8-ui .sidebar{background:#fff;color:#172033;border-right:1px solid #dfe7ee;box-shadow:none}
      body.v8-ui .company-logo{background:#0a8f3c;color:#fff}
      body.v8-ui .company span{color:#667085}
      body.v8-ui .new-btn{background:#fff;color:#172033;border-color:#172033}
      body.v8-ui .new-btn:hover{background:#0a8f3c;color:#fff;border-color:#0a8f3c}
      body.v8-ui .side-title{color:#667085}
      body.v8-ui .nav-item{color:#344054;background:transparent}
      body.v8-ui .nav-item:hover{background:#f1f5f9;color:#111827}
      body.v8-ui .nav-item.active{background:#e9f7ef;color:#075f2a;font-weight:900}
      body.v8-ui .nav-item .dot{background:#073b71;color:#fff}
      body.v8-ui .nav-item.active .dot{background:#0a8f3c}
      body.v8-ui .topbar{height:56px;background:#fbfdfe;box-shadow:0 1px 0 #e5edf2}
      body.v8-ui .search input{height:36px;border-color:#cfd9e3;background:#fff}
      body.v8-ui .content{padding-top:26px;max-width:1500px;width:100%;margin:0 auto}
      body.v8-ui .card{box-shadow:none;border-color:#dfe7ee;background:#fff}
      body.v8-ui .card:hover{border-color:#d3dde6}
      body.v8-ui .hero.v8-hero{margin:0 0 20px;text-align:center}
      body.v8-ui .hero.v8-hero h2{font-size:28px;margin-bottom:18px;font-weight:900;letter-spacing:-.035em}
      body.v8-ui .module-pill{box-shadow:none;border-color:#dbe5ec;padding:9px 14px;background:#fff}
      body.v8-ui .module-pill.active{border-color:#a7d8b9;background:#f0fbf4;color:#0a6b32}
      body.v8-ui .module-icon{background:#06386d}
      body.v8-ui .quick-actions.v8-actions{margin:14px 0 24px;justify-content:flex-start}
      body.v8-ui .feed-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:8px 0 12px}
      body.v8-ui .feed-header h3{font-size:18px;margin:0;display:flex;align-items:center;gap:8px}
      body.v8-ui .feed-row.v8-feed-row{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
      body.v8-ui .feed-card.v8-feed-card{min-height:138px;border-radius:16px;padding:17px;background:#fff;display:flex;flex-direction:column;justify-content:space-between}
      body.v8-ui .feed-card.v8-feed-card p{margin:0 0 14px;line-height:1.35;color:#344054}
      body.v8-ui .feed-badge{background:#eff8ff;color:#075985;border:1px solid #d8efff}
      body.v8-ui .v8-dashboard-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(320px,.86fr);gap:18px;align-items:start}
      body.v8-ui .v8-main-col,body.v8-ui .v8-side-col{display:grid;gap:16px}
      body.v8-ui .funnel{grid-template-columns:1.04fr repeat(4,1fr);gap:10px}
      body.v8-ui .funnel-card{min-height:154px;border-radius:13px}
      body.v8-ui .funnel-card .label{text-transform:none;font-weight:700;color:#475467}
      body.v8-ui .funnel-card .value{font-size:24px;letter-spacing:-.03em}
      body.v8-ui .funnel-card:before{height:5px}
      body.v8-ui .v8-add-widget-card{border:1.5px dashed #d6e1ea;background:#fbfdff;text-align:center;padding:22px}
      body.v8-ui .v8-add-widget-card .plus{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;margin:0 auto 10px;background:#eef6f7;color:#0a6b32;font-size:24px;font-weight:900}
      body.v8-ui .report-center{display:grid;grid-template-columns:220px minmax(0,1fr);gap:18px;align-items:start}
      body.v8-ui .report-side{position:sticky;top:78px;border-radius:18px;border:1px solid #dfe7ee;background:#fff;padding:12px}
      body.v8-ui .report-side h3{margin:0 0 12px;font-size:12px;text-transform:uppercase;color:#667085;letter-spacing:.05em}
      body.v8-ui .report-side button{width:100%;border:0;background:transparent;text-align:left;border-radius:10px;padding:10px 11px;font-weight:800;color:#344054}
      body.v8-ui .report-side button:hover,body.v8-ui .report-side button.active{background:#eff8f2;color:#0a6b32}
      body.v8-ui .report-search-box{display:grid;grid-template-columns:minmax(260px,460px) auto;gap:10px;margin-bottom:14px;align-items:center}
      body.v8-ui .report-search-box input{border:1px solid #cfd9e3;border-radius:12px;padding:11px 13px;width:100%}
      body.v8-ui .report-section{border-top:1px solid #e8eef3;padding:15px 0 4px}
      body.v8-ui .report-section:first-of-type{border-top:0;padding-top:0}
      body.v8-ui .report-section h3{margin:0 0 8px;font-size:17px;text-transform:none;color:#172033}
      body.v8-ui .report-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:28px}
      body.v8-ui .report-row{display:grid;grid-template-columns:minmax(0,1fr) 34px 34px;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #edf2f6}
      body.v8-ui .report-name{border:0;background:transparent;text-align:left;padding:0;color:#344054;font-weight:700}
      body.v8-ui .report-name:hover{color:#0a6b32;text-decoration:underline}
      body.v8-ui .report-desc{display:block;color:#667085;font-weight:400;font-size:12px;margin-top:2px}
      body.v8-ui .star-btn,body.v8-ui .more-btn{border:0;background:transparent;border-radius:9px;width:32px;height:32px;color:#98a2b3;font-size:18px}
      body.v8-ui .star-btn.active{color:#0a8f3c}
      body.v8-ui .star-btn:hover,body.v8-ui .more-btn:hover{background:#f1f5f9}
      body.v8-ui .clean-empty{border:1px dashed #d6e1ea;background:#fbfdff;border-radius:16px;padding:22px;text-align:center;color:#667085}
      @media(max-width:1180px){body.v8-ui .feed-row.v8-feed-row{grid-template-columns:repeat(2,minmax(0,1fr))}body.v8-ui .v8-dashboard-grid{grid-template-columns:1fr}body.v8-ui .funnel{grid-template-columns:repeat(2,1fr)}body.v8-ui .report-center{grid-template-columns:1fr}body.v8-ui .report-side{position:static}}
      @media(max-width:760px){body.v8-ui .app{grid-template-columns:1fr}body.v8-ui .report-rows{grid-template-columns:1fr}body.v8-ui .report-search-box{grid-template-columns:1fr}body.v8-ui .feed-row.v8-feed-row{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function v8CleanText(text){
    return removeVersionLabelsFromString(String(text||''))
      .replace(/\bprototype\b/gi,'workspace')
      .replace(/\bfuture version\b/gi,'later workflow')
      .replace(/\bscope note\b/gi,'note')
      .replace(/\s{2,}/g,' ')
      .trim();
  }
  function ensureV8State(){
    ensureV74State();
    injectV8Styles();
    document.body.classList.add('v8-ui');
    state.company.name = v8CleanText(state.company.name) || 'Your Company';
    state.settings ||= {};
    state.settings.dashboardWidgets ||= ['feed','funnel','pl','expenses','recent','bank','cashflow','setup'];
    state.settings.reportFavorites ||= ['ar-aging','balance-sheet','profit-loss'];
    state.settings.cleanDashboard = true;
    state.auditTrail = (state.auditTrail||[]).map(a=>({...a, action:v8CleanText(a.action)}));
  }
  const v8HeaderBase = header;
  header = function(title, subtitle, actions=''){
    return v8HeaderBase(v8CleanText(title), v8CleanText(subtitle), actions);
  };
  function visibleModulesForPillsV8(){
    const preferred = ['accounting','expenses','sales','customers','banking','transactions','reports','inventory','taxes','time','projects','payroll'];
    return preferred.map(id=>masterModuleRegistry.find(m=>m.id===id)).filter(Boolean).filter(m=>isModuleVisible(m.id));
  }
  renderModulePills = function(){
    ensureV8State();
    const mods = visibleModulesForPillsV8();
    const el=document.getElementById('modulePills');
    if(el) el.innerHTML = mods.map(m=>`<button class="module-pill ${currentPage===m.id?'active':''}" data-nav="${m.id}"><span class="module-icon">${m.icon}</span>${escapeHTML(m.label)}</button>`).join('');
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    const g=document.getElementById('greeting'); if(g) g.textContent = `${greeting}, Quak!`;
  };
  function quickActionsV8(){
    const actions = [
      {label:'Get paid online', modal:'payment', primary:false},
      {label:'Create invoice', modal:'invoice', primary:false},
      {label:'Create check', modal:'check', primary:false},
      {label:'Add bank deposit', modal:'deposit', primary:false},
      {label:'Record expense', modal:'expense', primary:false}
    ].filter(a=>isModalAllowed(a.modal));
    return `<div class="quick-actions v8-actions"><strong>Create actions</strong>${actions.map(a=>`<button class="btn ${a.primary?'primary':''}" data-modal="${a.modal}">${a.label}</button>`).join('')}<button class="btn soft" data-open-create>Show all</button></div>`;
  }
  renderDashboard = function(){
    ensureV8State();
    const page=document.getElementById('page-dashboard'); if(!page) return;
    page.innerHTML = `
      <div class="hero v8-hero"><h2 id="greeting">Welcome back</h2><div class="pill-row" id="modulePills"></div></div>
      <div class="feed-header"><h3>âœ¦ Business Feed</h3><button class="btn soft" data-action="refresh-dashboard">View all</button></div>
      <div id="businessFeed"></div>
      ${quickActionsV8()}
      <div class="section-header"><div><h2>Business at a glance</h2><p>Clean summary of receivables, deposits, bank balances, profit, expenses, and setup items.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-modal="customizeDashboard">âš™ Customize</button><button class="btn" data-action="toggle-privacy">â—‰ Privacy</button><button class="btn square" data-action="refresh-dashboard">â†» Refresh</button></div></div>
      <div class="v8-dashboard-grid">
        <div class="v8-main-col">
          <div class="card" id="funnelWidget"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap"><h3 style="margin:0">Sales & Get Paid Funnel</h3><select id="dashRange" class="table-search" style="min-width:140px;padding:7px 10px"><option>This month</option><option>Last 30 days</option><option>Quarter to date</option></select></div><div class="funnel" id="funnelCards"></div></div>
          <div class="grid two"><div class="card" id="plCard"></div><div class="card" id="expensesCard"></div></div>
          <div class="card table-card" id="recentTransactions"></div>
        </div>
        <div class="v8-side-col">
          <div class="card" id="bankCard"></div>
          <div class="card" id="cashFlowCard"></div>
          <div class="card" id="setupCard"></div>
          <div class="v8-add-widget-card"><div class="plus">ï¼‹</div><strong>Add widgets</strong><p class="muted">Show sales, cash flow, A/R, A/P, inventory, or tax cards from Customize.</p><button class="btn" data-modal="customizeDashboard">Customize dashboard</button></div>
        </div>
      </div>`;
    renderModulePills();
    const t=totals();
    renderBusinessFeed(t); renderFunnel(t); renderPLCard(t); renderExpensesCard(); renderRecentTransactions(); renderBankCard(t); renderCashFlowCard(t); renderSetupCard();
    applyDashboardPrefs(); applyQuickActionVisibility(page); cleanProductLanguageInDOM(page);
  };
  renderBusinessFeed = function(t){
    const tb=trialBalanceStatus();
    const unreviewed = state.bankTransactions.filter(x=>x.status!=='Reviewed' && x.status!=='Matched').length;
    const overdueInvoices = state.invoices.filter(i=>invoiceDisplayStatus(i)==='Overdue' || (openAmount(i)>0 && i.dueDate < todayISO()));
    const dueBills = state.bills.filter(b=>billOpenAmount(b)>0).slice(0,20);
    const lowStock = (state.products||[]).filter(p=>isInventoryTracked(p.id) && stockAvailable(p.id)<=num(p.reorderPoint)).length;
    const taxNet = salesTaxSummary().net;
    const cards = [
      {icon:'â–£', title:'Accounting done', text:`Trial balance is ${tb.ok?'balanced':'out by '+money(Math.abs(tb.diff))}. ${state.bankTransactions.filter(x=>x.posted).length} bank transactions are posted.`, action:'Open accounting', nav:'accounting'},
      {icon:'!', title:'Overdue invoices', text:`${overdueInvoices.length} invoice${overdueInvoices.length===1?'':'s'} need follow-up. Open receivables are ${money(t.ar)}.`, action:'Review all', nav:'sales'},
      {icon:'â—‰', title:'Banking review', text:`${unreviewed} imported-style bank transaction${unreviewed===1?'':'s'} need matching, clearing, or categorization.`, action:'Review banking', nav:'banking'},
      {icon:'â†—', title:'Cash flow insight', text:`Current bank position is ${money(t.bank)}. Net cash flow is based on recorded payments, deposits, expenses, and bill payments.`, action:'View banking', nav:'banking'},
      {icon:'â—¼', title:'Low stock detected', text:`${lowStock} inventory item${lowStock===1?'':'s'} are at or below reorder point.`, action:'Open items', nav:'inventory'},
      {icon:'â—–', title:'Tax return ready', text:`Estimated net tax ${taxNet>=0?'payable':'recoverable'} is ${money(Math.abs(taxNet))}.`, action:'Prepare return', nav:'taxes'},
      {icon:'â–¸', title:'Bills due', text:`${dueBills.length} open vendor bill${dueBills.length===1?'':'s'} require review or payment scheduling.`, action:'Review bills', nav:'expenses'}
    ].filter(c=>!c.nav || isModuleVisible(c.nav)).slice(0,4);
    const el=document.getElementById('businessFeed'); if(!el) return;
    el.innerHTML = `<div class="feed-row v8-feed-row">${cards.map(c=>`<div class="feed-card v8-feed-card"><span class="menu">â‹®</span><div><div class="feed-title"><span class="feed-badge">${c.icon}</span>${escapeHTML(c.title)}</div><p>${escapeHTML(c.text)}</p></div><button class="btn soft" data-nav="${c.nav}">${escapeHTML(c.action)}</button></div>`).join('')}<div class="feed-card v8-feed-card"><div><div class="feed-title"><span class="feed-badge">âœ¦</span>More ready for you</div><p>Use Customize to choose dashboard widgets and menu modules for your business workflow.</p></div><button class="btn soft" data-modal="customizeDashboard">Customize</button></div></div>`;
  };
  renderFunnel = function(t){
    const notPaid = state.invoices.reduce((s,i)=>s+openAmount(i),0);
    const paid = state.payments.reduce((s,p)=>s+num(p.amount),0);
    const deposited = paid + state.deposits.reduce((s,d)=>s+num(d.amount),0);
    const cleared = state.bankTransactions.filter(x=>x.cleared).reduce((s,x)=>s+Math.abs(num(x.amount)),0);
    const overdueCount = state.invoices.filter(i=>invoiceDisplayStatus(i)==='Overdue' || (openAmount(i)>0 && i.dueDate < todayISO())).length;
    const cards = [
      {cls:'first', label:'Request a payment', value:'Send invoices, pay links, and more', chip:'Create payment'},
      {label:'Outstanding', value:money(notPaid), chip:`${overdueCount} overdue invoice${overdueCount===1?'':'s'}`, status:overdueCount?'red':'green'},
      {label:'Paid', value:money(paid), chip:'Customer payments recorded', status:'blue'},
      {label:'Deposited', value:money(deposited), chip:'Deposits in bank workflow', status:'green'},
      {label:'Reconciled', value:money(cleared), chip:`${state.bankTransactions.filter(x=>x.cleared).length} cleared item${state.bankTransactions.filter(x=>x.cleared).length===1?'':'s'}`, status:'green'}
    ];
    const el=document.getElementById('funnelCards'); if(el) el.innerHTML = cards.map(c=>`<div class="funnel-card ${c.cls||''}"><div class="label">${escapeHTML(c.label)}</div><div class="value ${c.cls==='first'?'muted small':'amount'}">${c.value}</div><span class="status-chip ${c.status||''}">${escapeHTML(c.chip)}</span></div>`).join('');
  };
  dashboardWidgetLabels = function(){ return {feed:'Business Feed / smart suggestions', funnel:'Sales & Get Paid funnel', pl:'Profit & Loss', expenses:'Expense summary', recent:'Recent transactions', bank:'Bank accounts', cashflow:'Cash flow', setup:'Setup Checklist'}; };
  applyDashboardPrefs = function(){
    document.body.classList.toggle('privacy-mode', !!state.settings.privacyMode);
    const visible = new Set(state.settings.dashboardWidgets || Object.keys(dashboardWidgetLabels()));
    const map = {feed:document.getElementById('businessFeed')?.closest('#businessFeed'), funnel:document.getElementById('funnelWidget'), pl:document.getElementById('plCard'), expenses:document.getElementById('expensesCard'), recent:document.getElementById('recentTransactions'), bank:document.getElementById('bankCard'), cashflow:document.getElementById('cashFlowCard'), setup:document.getElementById('setupCard')};
    Object.entries(map).forEach(([k,el])=>{ if(el) el.style.display = visible.has(k) ? '' : 'none'; });
  };
  function reportCatalogV8(){
    const t=totals(); const tax=salesTaxSummary();
    const rows = [
      {id:'ar-aging', name:'Accounts Receivable Aging Summary', category:'Favorites', desc:`Open A/R ${money(t.ar)}`, nav:'sales'},
      {id:'balance-sheet', name:'Balance Sheet', category:'Favorites', desc:'Assets, liabilities, equity, and current earnings.', nav:'reports'},
      {id:'profit-loss', name:'Profit and Loss', category:'Favorites', desc:`Net income ${money(t.profit)}`, nav:'reports'},
      {id:'audit-log', name:'Audit Log', category:'Business overview', desc:'Recent user and system activity.', nav:'accounting'},
      {id:'balance-comparison', name:'Balance Sheet Comparison', category:'Business overview', desc:'Compare assets, liabilities, and equity over time.', nav:'reports'},
      {id:'cash-flow', name:'Statement of Cash Flows', category:'Business overview', desc:'Cash movement from operating activity.', nav:'banking'},
      {id:'business-snapshot', name:'Business Snapshot', category:'Business overview', desc:'Sales, expenses, bank, A/R, and A/P in one summary.', nav:'dashboard'},
      {id:'pl-by-customer', name:'Profit and Loss by Customer', category:'Business overview', desc:'Revenue and margin by customer.', nav:'customers'},
      {id:'pl-by-month', name:'Profit and Loss by Month', category:'Business overview', desc:'Monthly income and expenses.', nav:'reports'},
      {id:'project-profitability', name:'Project Profitability Summary', category:'Business overview', desc:'Budget, cost, and revenue by project.', nav:'projects'},
      {id:'open-invoices', name:'Open Invoices', category:'Who owes you', desc:'Unpaid and partially paid invoices.', nav:'sales'},
      {id:'invoices-payments', name:'Invoices and Received Payments', category:'Who owes you', desc:'Invoice, payment, and deposit tracking.', nav:'sales'},
      {id:'customer-balance', name:'Customer Balance Summary', category:'Who owes you', desc:'Open customer balances.', nav:'customers'},
      {id:'ap-aging', name:'Accounts Payable Aging Summary', category:'What you owe', desc:`Open A/P ${money(t.ap)}`, nav:'expenses'},
      {id:'unpaid-bills', name:'Unpaid Bills', category:'What you owe', desc:'Vendor bills requiring payment.', nav:'vendors'},
      {id:'bill-payment-list', name:'Bill Payment List', category:'What you owe', desc:'Payments made to vendors.', nav:'expenses'},
      {id:'sales-by-customer', name:'Sales by Customer Summary', category:'Sales and customers', desc:'Sales revenue by customer.', nav:'sales'},
      {id:'sales-by-product', name:'Sales by Product/Service', category:'Sales and customers', desc:'Sellable item revenue and quantity.', nav:'inventory'},
      {id:'invoice-list', name:'Invoice List by Date', category:'Sales and customers', desc:'Sent, paid, viewed, overdue, and draft invoices.', nav:'sales'},
      {id:'expenses-category', name:'Expenses by Category', category:'Expenses and vendors', desc:'Expense accounts and vendor spend.', nav:'expenses'},
      {id:'vendor-balance', name:'Vendor Balance Summary', category:'Expenses and vendors', desc:'Open balances by vendor.', nav:'vendors'},
      {id:'inventory-valuation', name:'Inventory Valuation Summary', category:'Products and inventory', desc:'Quantity on hand, average cost, and value.', nav:'inventory'},
      {id:'po-match', name:'Purchase Order Match Report', category:'Products and inventory', desc:'PO, receiving, and bill matching.', nav:'inventory'},
      {id:'sales-tax-liability', name:'Sales Tax Liability Report', category:'Taxes', desc:`Estimated net tax ${money(tax.net)}`, nav:'taxes'},
      {id:'tax-detail', name:'Tax Detail by Transaction', category:'Taxes', desc:'Tax code and agency by transaction.', nav:'taxes'},
      {id:'trial-balance', name:'Trial Balance', category:'Accounting', desc:'Debit and credit totals by account.', nav:'accounting'},
      {id:'general-ledger', name:'General Ledger', category:'Accounting', desc:'All posted debit and credit lines.', nav:'accounting'},
      {id:'payroll-summary', name:'Payroll Summary', category:'Payroll and time', desc:'Pay runs, employee costs, and remittances.', nav:'payroll'},
      {id:'time-activity', name:'Time Activity by Customer', category:'Payroll and time', desc:'Billable and non-billable time entries.', nav:'time'}
    ];
    return rows.filter(r=>!r.nav || isModuleVisible(r.nav));
  }
  function reportSectionsV8(catalog){
    const fav = new Set(state.settings.reportFavorites || []);
    const categories = ['Favorites','Business overview','Who owes you','What you owe','Sales and customers','Expenses and vendors','Products and inventory','Taxes','Accounting','Payroll and time'];
    return categories.map(cat=>{
      const rows = cat==='Favorites' ? catalog.filter(r=>fav.has(r.id) || r.category==='Favorites') : catalog.filter(r=>r.category===cat);
      if(!rows.length) return '';
      return `<section class="report-section" data-report-section="${escapeHTML(cat)}"><h3>${escapeHTML(cat)}</h3><div class="report-rows">${rows.map(r=>`<div class="report-row" data-report-row data-search="${escapeHTML((r.name+' '+r.desc+' '+cat).toLowerCase())}"><button class="report-name" data-action="open-report" data-id="${r.id}">${escapeHTML(r.name)}<span class="report-desc">${escapeHTML(r.desc)}</span></button><button class="star-btn ${fav.has(r.id)?'active':''}" data-action="toggle-report-fav" data-id="${r.id}" title="Favorite">${fav.has(r.id)?'â˜…':'â˜†'}</button><button class="more-btn" data-action="open-report" data-id="${r.id}">â‹®</button></div>`).join('')}</div></section>`;
    }).join('');
  }
  renderReports = function(){
    ensureV8State();
    const el=document.getElementById('page-reports'); if(!el) return;
    const catalog=reportCatalogV8();
    el.innerHTML = header('Reports & Analytics', 'Search, favorite, and open financial, sales, tax, banking, inventory, and management reports.', `<button class="btn" onclick="window.print()">Print</button><button class="btn primary" data-modal="journal">Journal entry</button>`) +
      `<div class="report-center"><aside class="report-side"><h3>Reports & Analytics</h3><button class="active" data-action="report-filter" data-id="all">Standard reports</button><button data-action="report-filter" data-id="favorites">Favorites</button><button data-action="report-filter" data-id="financial">Financial planning</button><button data-nav="dashboard">Dashboard</button><button data-modal="customize">Customize menu</button></aside><div class="card"><div class="report-search-box"><input data-report-search placeholder="Type report name here" /><button class="btn" data-action="report-filter" data-id="all">Show all</button></div>${reportSectionsV8(catalog)}</div></div>`;
  };
  renderApps = function(){
    ensureV8State();
    const el=document.getElementById('page-apps'); if(!el) return;
    const descriptions = {
      dashboard:'Business overview, Business Feed, and quick actions.', setup:'Guided setup for visible modules.', apps:'Launch enabled modules from one clean center.', banking:'Bank transactions, matching, clearing, and reconciliation.', transactions:'All posted and imported transaction activity.', accounting:'Chart of accounts, journal entries, trial balance, and audit trail.', sales:'Invoices, payment links, sales orders, recurring payments, and payouts.', customers:'Customer profiles, open balances, estimates, and receivables.', expenses:'Expenses, bills, vendor payments, and approval workflow.', vendors:'Supplier records, open bills, purchase orders, and payment history.', reports:'Financial, sales, tax, inventory, and management reports.', inventory:'Services, inventory products, non-inventory items, bundles, PO/SO workflows, receiving, and movements.', projects:'Project budgets, costs, revenue, and profitability.', time:'Time entries, billable hours, and team activity.', payroll:'Employee setup, payroll workflow, and pay-run preparation.', taxes:'Tax returns, agencies, rates, collected tax, input tax credits, and payments.', settings:'Company profile, menu customization, invoice branding, and data controls.'
    };
    const apps=masterModuleRegistry.filter(m=>isModuleVisible(m.id));
    el.innerHTML = header('My Apps', 'Open the modules enabled for this company. Hidden modules can be restored from Settings.', `<button class="btn" data-modal="customize">Customize app menus</button>`) + `<div class="app-grid">${apps.map(m=>`<div class="app-tile"><span class="tile-icon">${m.icon}</span><h3>${escapeHTML(m.label)}</h3><p class="muted">${escapeHTML(descriptions[m.id]||'Module workspace.')}</p><button class="btn" data-nav="${m.id}">Open</button></div>`).join('')}</div>`;
  };
  renderSettings = function(){
    ensureV8State();
    const el=document.getElementById('page-settings'); if(!el) return;
    el.innerHTML = header('Settings', 'Company profile, tax rate, accounting method, menu customization, dashboard controls, invoice branding, and local data controls.', `<button class="btn" data-modal="customizeDashboard">Customize dashboard</button><button class="btn" data-modal="customize">Customize menu</button><button class="btn primary" data-modal="company">Company settings</button>`) +
      `<div class="grid two"><div class="card"><h3>Company</h3><div class="report-line"><span>Name</span><strong>${escapeHTML(state.company.name)}</strong></div><div class="report-line"><span>Province</span><strong>${escapeHTML(state.company.province)}</strong></div><div class="report-line"><span>Fiscal year</span><strong>${escapeHTML(state.company.fiscalYear)}</strong></div><div class="report-line"><span>Sales tax</span><strong>${state.company.salesTax}%</strong></div><div class="report-line"><span>Method</span><strong>${escapeHTML(state.company.accountingMethod||'Accrual')}</strong></div></div><div class="card"><h3>Menu & dashboard</h3><div class="report-line"><span>Visible modules</span><strong>${state.settings.visibleModules.length}</strong></div><div class="report-line"><span>Privacy mode</span><strong>${state.settings.privacyMode?'On':'Off'}</strong></div><div class="report-line"><span>Dashboard widgets</span><strong>${(state.settings.dashboardWidgets||[]).length}</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" data-modal="customize">Customize menu</button><button class="btn" data-modal="customizeDashboard">Customize widgets</button><button class="btn" data-action="toggle-privacy">Toggle privacy</button></div></div></div>`+
      `<div class="grid two" style="margin-top:16px"><div class="card"><h3>Data</h3><p class="muted">Data is stored in this browser using localStorage. Export a backup before clearing browser data.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="exportData2">Export JSON</button><button class="btn danger" id="resetDemo2">Reset company data</button></div></div><div class="card"><h3>Clean interface</h3><p class="muted">The dashboard uses Business Feed cards, focused quick actions, cleaner report navigation, and menu visibility rules that respect your enabled modules.</p></div></div>`;
    document.getElementById('exportData2').addEventListener('click', exportData); document.getElementById('resetDemo2').addEventListener('click', resetState);
  };
  const v8ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    const html = v8ModalBodyBase(type);
    if(type==='invoiceBranding'){
      return html.replace(/V\d+(?:\.\d+)?\s*/g,'').replace(/logo fix:/i,'Branding note:').replace(/stores it as global invoice branding, so it appears/i,'stores it as global invoice branding so it appears');
    }
    return html;
  };
  const v8HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='refresh-dashboard'){ renderDashboard(); showToast('Dashboard refreshed.'); return; }
    if(action==='toggle-report-fav'){
      state.settings.reportFavorites ||= [];
      const set=new Set(state.settings.reportFavorites);
      if(set.has(id)) set.delete(id); else set.add(id);
      state.settings.reportFavorites=[...set]; saveState(); renderReports(); showToast(set.has(id)?'Report added to favorites.':'Report removed from favorites.'); return;
    }
    if(action==='open-report'){
      const report=reportCatalogV8().find(r=>r.id===id);
      if(report?.nav && report.nav!=='reports') navigate(report.nav);
      showToast(report ? `${report.name} opened.` : 'Report opened.'); return;
    }
    if(action==='report-filter'){
      const q = id==='favorites' ? 'favorites' : '';
      const input=document.querySelector('[data-report-search]'); if(input){ input.value=''; }
      if(id==='favorites'){
        const fav=new Set(state.settings.reportFavorites||[]);
        document.querySelectorAll('[data-report-row]').forEach(r=>{ const star=r.querySelector('.star-btn'); r.style.display = star?.classList.contains('active') ? '' : 'none'; });
      } else {
        document.querySelectorAll('[data-report-row]').forEach(r=>r.style.display='');
      }
      document.querySelectorAll('.report-side button').forEach(b=>b.classList.toggle('active', b.dataset.id===id));
      return;
    }
    return v8HandleActionBase(action,id);
  };
  const v8SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v8SetupEventListenersBase();
    document.addEventListener('input', e=>{
      const input=e.target.closest('[data-report-search]');
      if(!input) return;
      const q=input.value.trim().toLowerCase();
      document.querySelectorAll('[data-report-row]').forEach(row=>{ row.style.display = !q || row.dataset.search.includes(q) ? '' : 'none'; });
      document.querySelectorAll('[data-report-section]').forEach(section=>{
        const rows=[...section.querySelectorAll('[data-report-row]')];
        section.style.display = rows.some(r=>r.style.display!=='none') ? '' : 'none';
      });
    });
  };
  const v8RenderAllBase = renderAll;
  renderAll = function(){ ensureV8State(); v8RenderAllBase(); document.body.classList.add('v8-ui'); cleanProductLanguageInDOM(document.body); };
  exportData = function(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='smartbooks-backup.json'; a.click(); URL.revokeObjectURL(url); showToast('Backup export started.'); };
  resetState = function(){ state=structuredClone(initialState); state.settings.visibleModules = masterModuleIds.slice(); ensureV8State(); saveState(); renderAll(); showToast('Company data reset.'); };



  // ---------- V8.1 Reports Center interaction fixes ----------
  let v81StylesInjected = false;
  function injectV81Styles(){
    if(v81StylesInjected) return;
    v81StylesInjected = true;
    const style=document.createElement('style');
    style.textContent = `
      body.v8-ui .report-side .report-group-label{margin:14px 8px 6px;font-size:11px;text-transform:uppercase;color:#98a2b3;letter-spacing:.06em;font-weight:900}
      body.v8-ui .report-row{position:relative}
      body.v8-ui .report-action-menu{grid-column:1 / -1;background:#f8fbfd;border:1px solid #dfe7ee;border-radius:12px;padding:10px;margin:2px 0 6px;display:flex;gap:8px;flex-wrap:wrap}
      body.v8-ui .report-action-menu .btn{padding:7px 10px;font-size:12px}
      body.v8-ui .report-detail{border:1px solid #dfe7ee;border-radius:18px;background:#fff;padding:20px}
      body.v8-ui .report-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;border-bottom:1px solid #e8eef3;padding-bottom:14px;margin-bottom:14px}
      body.v8-ui .report-detail-head h3{margin:0;font-size:24px;letter-spacing:-.03em}
      body.v8-ui .report-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0 14px}
      body.v8-ui .report-controls input,body.v8-ui .report-controls select{border:1px solid #cfd9e3;border-radius:10px;padding:8px 10px;background:#fff}
      body.v8-ui .report-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:10px 0 16px}
      body.v8-ui .report-summary-card{border:1px solid #e2eaf0;background:#fbfdff;border-radius:13px;padding:12px}
      body.v8-ui .report-summary-card span{display:block;color:#667085;font-size:12px;margin-bottom:4px}
      body.v8-ui .report-summary-card strong{font-size:20px;color:#172033}
      body.v8-ui .report-table-wrap{overflow:auto;border:1px solid #e8eef3;border-radius:14px}
      body.v8-ui .report-table-wrap table{margin:0;border:0}
      body.v8-ui .report-empty-match{display:none;margin-top:14px}
      body.v8-ui .report-empty-match.show{display:block}
      @media print{
        body.v8-ui.printing-report .rail, body.v8-ui.printing-report .sidebar, body.v8-ui.printing-report .topbar, body.v8-ui.printing-report .report-side, body.v8-ui.printing-report .section-header, body.v8-ui.printing-report .report-controls, body.v8-ui.printing-report .report-detail-head .actions{display:none!important}
        body.v8-ui.printing-report .app{display:block!important}
        body.v8-ui.printing-report .content{padding:0!important;max-width:none!important}
        body.v8-ui.printing-report .page:not(#page-reports){display:none!important}
        body.v8-ui.printing-report .report-center{display:block!important}
        body.v8-ui.printing-report .report-detail{border:0!important;border-radius:0!important;padding:0!important}
      }
      @media(max-width:900px){body.v8-ui .report-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:560px){body.v8-ui .report-summary{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function ensureV81State(){
    ensureV8State();
    injectV81Styles();
    state.settings ||= {};
    state.settings.reportFavorites ||= ['ar-aging','balance-sheet','profit-loss'];
    state.settings.reportFilter ||= 'all';
    state.settings.activeReportId ||= null;
    state.settings.reportMenuId ||= null;
  }
  function reportGroupsV81(){
    return [
      'Business Overview','Who Owes You','What You Owe','Sales & Customers','Expenses & Vendors','Products & Services','Taxes','Accounting','Payroll & Time'
    ];
  }
  reportCatalogV8 = function(){
    const t=totals(); const tax=salesTaxSummary(); const invValue = typeof inventoryValue==='function' ? inventoryValue() : (state.products||[]).filter(p=>p.trackInventory||p.type==='Product').reduce((s,p)=>s+num(p.qty)*num(p.avgCost||0),0);
    return [
      {id:'profit-loss', name:'Profit and Loss', category:'Business Overview', desc:`Net income ${money(t.profit)}`},
      {id:'balance-sheet', name:'Balance Sheet', category:'Business Overview', desc:'Assets, liabilities, equity, and current earnings.'},
      {id:'business-snapshot', name:'Business Snapshot', category:'Business Overview', desc:'Sales, expenses, bank, A/R, and A/P in one summary.'},
      {id:'cash-flow', name:'Statement of Cash Flows', category:'Business Overview', desc:'Cash inflows and outflows from current activity.'},
      {id:'pl-by-month', name:'Profit and Loss by Month', category:'Business Overview', desc:'Monthly income and expenses.'},
      {id:'balance-comparison', name:'Balance Sheet Comparison', category:'Business Overview', desc:'Compare assets, liabilities, and equity over time.'},
      {id:'audit-log', name:'Audit Log', category:'Business Overview', desc:'Recent user and system activity.'},
      {id:'ar-aging', name:'Accounts Receivable Aging Summary', category:'Who Owes You', desc:`Open A/R ${money(t.ar)}`},
      {id:'invoice-list', name:'Invoice List by Date', category:'Who Owes You', desc:'All invoices sorted by invoice date.'},
      {id:'open-invoices', name:'Open Invoices', category:'Who Owes You', desc:'Invoices with remaining open balances.'},
      {id:'paid-invoices', name:'Paid Invoices', category:'Who Owes You', desc:'Invoices fully paid by customers.'},
      {id:'invoices-payments', name:'Invoices and Received Payments', category:'Who Owes You', desc:'Invoice, payment, and deposit tracking.'},
      {id:'ap-aging', name:'Accounts Payable Aging Summary', category:'What You Owe', desc:`Open A/P ${money(t.ap)}`},
      {id:'unpaid-bills', name:'Unpaid Bills', category:'What You Owe', desc:'Vendor bills requiring payment.'},
      {id:'bill-payment-list', name:'Bill Payment List', category:'What You Owe', desc:'Payments issued against vendor bills.'},
      {id:'vendor-balance', name:'Vendor Balance Summary', category:'What You Owe', desc:'Open balances grouped by vendor.'},
      {id:'sales-by-customer', name:'Sales by Customer Summary', category:'Sales & Customers', desc:'Revenue grouped by customer.'},
      {id:'sales-by-product-service', name:'Sales by Product/Service', category:'Sales & Customers', desc:'Revenue grouped by item or service.'},
      {id:'payment-links', name:'Payment Links', category:'Sales & Customers', desc:'Payment link status and amounts.'},
      {id:'recurring-transactions', name:'Recurring Transactions', category:'Sales & Customers', desc:'Recurring invoices, bills, payments, and expenses.'},
      {id:'expenses-by-vendor', name:'Expenses by Vendor Summary', category:'Expenses & Vendors', desc:'Expenses and bills grouped by vendor.'},
      {id:'expenses-by-category', name:'Expenses by Category', category:'Expenses & Vendors', desc:'Expense and COGS totals by account.'},
      {id:'bills-by-vendor', name:'Bills by Vendor', category:'Expenses & Vendors', desc:'Vendor bills by due date and status.'},
      {id:'inventory-valuation', name:'Inventory Valuation Summary', category:'Products & Services', desc:`Inventory value ${money(invValue)}`},
      {id:'stock-status', name:'Stock Status by Item', category:'Products & Services', desc:'On-hand, committed, available, and reorder points.'},
      {id:'purchase-orders', name:'Open Purchase Orders', category:'Products & Services', desc:'Purchase orders and receiving status.'},
      {id:'sales-orders', name:'Open Sales Orders', category:'Products & Services', desc:'Customer orders, fulfillment, and invoicing status.'},
      {id:'po-match', name:'Purchase Order 3-Way Match', category:'Products & Services', desc:'PO, receiving, and bill matching exceptions.'},
      {id:'sales-tax-liability', name:'Sales Tax Liability', category:'Taxes', desc:`Net before payments ${money(tax.net)}`},
      {id:'tax-detail', name:'Tax Detail by Transaction', category:'Taxes', desc:'Tax collected and recoverable tax by transaction.'},
      {id:'tax-exceptions', name:'Tax Exceptions', category:'Taxes', desc:'Transactions with missing or unusual tax treatment.'},
      {id:'tax-return-summary', name:'Tax Return Summary', category:'Taxes', desc:'Tax filing periods, payments, and balances.'},
      {id:'trial-balance', name:'Trial Balance', category:'Accounting', desc:'Debit and credit check by account.'},
      {id:'general-ledger', name:'General Ledger', category:'Accounting', desc:'All source transactions translated into debit/credit lines.'},
      {id:'chart-of-accounts', name:'Chart of Accounts', category:'Accounting', desc:'Accounts, types, detail, and balances.'},
      {id:'journal-report', name:'Journal Entries', category:'Accounting', desc:'Manual journal entries and balance status.'},
      {id:'time-entries', name:'Time Activities by Customer', category:'Payroll & Time', desc:'Billable and non-billable time records.'},
      {id:'project-profitability', name:'Project Profitability Summary', category:'Payroll & Time', desc:'Project revenue, costs, and margin.'}
    ];
  };
  function reportGroupButtonsV81(){
    const groups=reportGroupsV81();
    const active=state.settings.reportFilter || 'all';
    return `<aside class="report-side"><h3>Reports & Analytics</h3><button class="${active==='all'?'active':''}" data-action="report-filter" data-id="all">Standard Reports</button><button class="${active==='favorites'?'active':''}" data-action="report-filter" data-id="favorites">Favorites</button><div class="report-group-label">Categories</div>${groups.map(g=>`<button class="${active===g?'active':''}" data-action="report-filter" data-id="${escapeHTML(g)}">${escapeHTML(g)}</button>`).join('')}<div class="report-group-label">Shortcuts</div><button data-nav="dashboard">Dashboard</button><button data-modal="customize">Customize Menu</button></aside>`;
  }
  function reportSectionsV8(catalog){
    ensureV81State();
    const fav = new Set(state.settings.reportFavorites || []);
    const filter = state.settings.reportFilter || 'all';
    const menuId = state.settings.reportMenuId;
    let cats = ['Favorites', ...reportGroupsV81()];
    if(filter==='favorites') cats=['Favorites'];
    else if(filter && filter!=='all') cats=[filter];
    return cats.map(cat=>{
      let rows = cat==='Favorites' ? catalog.filter(r=>fav.has(r.id)) : catalog.filter(r=>r.category===cat);
      if(!rows.length) return '';
      return `<section class="report-section" data-report-section="${escapeHTML(cat)}"><h3>${escapeHTML(cat)}</h3><div class="report-rows">${rows.map(r=>`<div class="report-row" data-report-row data-id="${r.id}" data-category="${escapeHTML(r.category)}" data-search="${escapeHTML((r.name+' '+r.desc+' '+r.category).toLowerCase())}"><button class="report-name" data-action="open-report" data-id="${r.id}">${escapeHTML(r.name)}<span class="report-desc">${escapeHTML(r.desc)}</span></button><button class="star-btn ${fav.has(r.id)?'active':''}" data-action="toggle-report-fav" data-id="${r.id}" title="Favorite">${fav.has(r.id)?'â˜…':'â˜†'}</button><button class="more-btn" data-action="report-more" data-id="${r.id}" title="More actions">â‹®</button>${menuId===r.id ? `<div class="report-action-menu"><button class="btn primary" data-action="open-report" data-id="${r.id}">Open Report</button><button class="btn" data-action="toggle-report-fav" data-id="${r.id}">${fav.has(r.id)?'Remove Favorite':'Add Favorite'}</button><button class="btn" data-action="export-report" data-id="${r.id}">Export CSV</button><button class="btn" data-action="print-report" data-id="${r.id}">Print</button><button class="btn" data-action="add-report-dashboard" data-id="${r.id}">Add to Dashboard</button></div>`:''}</div>`).join('')}</div></section>`;
    }).join('') + `<div class="report-empty-match clean-empty" data-report-empty>No matching reports found.</div>`;
  }
  function monthKey(date){ return String(date||'').slice(0,7) || 'No date'; }
  function groupSum(rows, keyFn, amtFn){ const m=new Map(); rows.forEach(r=>{ const k=keyFn(r); m.set(k,(m.get(k)||0)+num(amtFn(r))); }); return [...m.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]))); }
  function daysLate(due){ const d=new Date(due+'T00:00:00'); const n=new Date(todayISO()+'T00:00:00'); return Math.max(0, Math.floor((n-d)/86400000)); }
  function agingBuckets(amount, days){ return [days===0?amount:0, days>0&&days<=30?amount:0, days>30&&days<=60?amount:0, days>60?amount:0]; }
  function safeInventoryProducts(){ return typeof inventoryProducts==='function' ? inventoryProducts() : (state.products||[]).filter(p=>p.trackInventory||p.type==='Product'); }
  function safeStockCommitted(id){ return typeof stockCommitted==='function' ? stockCommitted(id) : 0; }
  function safeStockAvailable(id){ return typeof stockAvailable==='function' ? stockAvailable(id) : num((state.products||[]).find(p=>p.id===id)?.qty); }
  function getReportMeta(id){ return reportCatalogV8().find(r=>r.id===id) || {id, name:'Report', category:'Reports', desc:'Report detail.'}; }
  function reportDataV81(id){
    ensureV81State();
    const t=totals(), tax=salesTaxSummary(), bal=accountBalances(), meta=getReportMeta(id);
    const common={id, title:meta.name, subtitle:meta.desc, summary:[], headings:[], rows:[]};
    if(id==='profit-loss'){
      const income=state.chartOfAccounts.filter(a=>a.type==='Income').map(a=>[a.code, a.name, 'Income', money(normalBalance(a.id))]);
      const exp=state.chartOfAccounts.filter(a=>['Expense','COGS'].includes(a.type)).map(a=>[a.code, a.name, a.type, money(normalBalance(a.id))]);
      return {...common, summary:[['Income',money(sumTypes(['Income']))],['Expenses',money(sumTypes(['Expense','COGS']))],['Net income',money(t.profit)]], headings:['Code','Account','Type','Amount'], rows:[...income,...exp,['','','Net income',money(t.profit)]]};
    }
    if(id==='balance-sheet'){
      const rows=state.chartOfAccounts.filter(a=>['Asset','Liability','Equity'].includes(a.type)).map(a=>[a.code,a.name,a.type,money(normalBalance(a.id))]);
      rows.push(['','Current earnings','Equity',money(t.profit)]);
      return {...common, summary:[['Assets',money(sumTypes(['Asset']))],['Liabilities',money(sumTypes(['Liability']))],['Equity',money(sumTypes(['Equity']))],['Current earnings',money(t.profit)]], headings:['Code','Account','Type','Amount'], rows};
    }
    if(id==='trial-balance'){
      const rows=state.chartOfAccounts.map(a=>{ const b=bal[a.id]||{net:0}; return [a.code,a.name,a.type,b.net>=0?money(b.net):'â€”',b.net<0?money(-b.net):'â€”']; });
      const debit=rows.reduce((s,r)=>s+(r[3]==='â€”'?0:0),0); const tb=trialBalanceStatus();
      return {...common, summary:[['Total debits',money(tb.debits)],['Total credits',money(tb.credits)],['Difference',money(Math.abs(tb.diff))],['Status',tb.ok?'Balanced':'Review']], headings:['Code','Account','Type','Debit','Credit'], rows};
    }
    if(id==='general-ledger') return {...common, summary:[['Ledger lines',ledger().length],['Debits',money(trialBalanceStatus().debits)],['Credits',money(trialBalanceStatus().credits)]], headings:['Date','Source','Account','Memo','Debit','Credit'], rows:ledger().map(l=>[l.date,`${l.source} ${l.sourceId}`,accountLabel(l.accountId),l.memo,l.debit?money(l.debit):'',l.credit?money(l.credit):''])};
    if(id==='ar-aging' || id==='open-invoices'){
      const inv=state.invoices.filter(i=>openAmount(i)>0.01);
      const rows=inv.map(i=>{ const amt=openAmount(i), d=daysLate(i.dueDate), b=agingBuckets(amt,d); return [getCustomer(i.customerId).name,i.id,i.dueDate,i.status,money(amt),...b.map(money)]; });
      return {...common, summary:[['Open A/R',money(t.ar)],['Overdue',money(t.overdue)],['Open invoices',inv.length]], headings:['Customer','Invoice','Due date','Status','Open','Current','1-30','31-60','61+'], rows};
    }
    if(id==='ap-aging' || id==='unpaid-bills'){
      const bills=state.bills.filter(b=>billOpenAmount(b)>0.01);
      const rows=bills.map(b=>{ const amt=billOpenAmount(b), d=daysLate(b.dueDate), buck=agingBuckets(amt,d); return [getVendor(b.vendorId).name,b.id,b.dueDate,b.status,money(amt),...buck.map(money)]; });
      return {...common, summary:[['Open A/P',money(t.ap)],['Open bills',bills.length],['Due/overdue',bills.filter(b=>b.dueDate<=todayISO()).length]], headings:['Vendor','Bill','Due date','Status','Open','Current','1-30','31-60','61+'], rows};
    }
    if(id==='invoice-list' || id==='paid-invoices'){
      const inv=(id==='paid-invoices'?state.invoices.filter(i=>openAmount(i)<=0.01):state.invoices).slice().sort((a,b)=>b.date.localeCompare(a.date));
      return {...common, summary:[['Invoices',inv.length],['Invoice total',money(inv.reduce((s,i)=>s+invoiceTotal(i),0))],['Open balance',money(inv.reduce((s,i)=>s+openAmount(i),0))]], headings:['Date','Invoice','Customer','Due date','Status','Subtotal','Tax','Total','Paid','Open'], rows:inv.map(i=>[i.date,i.id,getCustomer(i.customerId).name,i.dueDate,i.status,money(i.subtotal),money(i.tax),money(invoiceTotal(i)),money(i.paid),money(openAmount(i))])};
    }
    if(id==='invoices-payments'){
      const rows=[...state.invoices.map(i=>[i.date,'Invoice',i.id,getCustomer(i.customerId).name,money(invoiceTotal(i)),i.status]),...state.payments.map(p=>[p.date,'Payment',p.id,getCustomer(p.customerId).name,money(p.amount),'Received']),...state.deposits.map(d=>[d.date,'Deposit',d.id,'Bank deposit',money(d.amount),'Deposited'])].sort((a,b)=>String(b[0]).localeCompare(String(a[0])));
      return {...common, summary:[['Invoices',state.invoices.length],['Payments',money(state.payments.reduce((s,p)=>s+p.amount,0))],['Deposits',money(state.deposits.reduce((s,d)=>s+d.amount,0))]], headings:['Date','Type','Reference','Name','Amount','Status'], rows};
    }
    if(id==='sales-tax-liability') return {...common, summary:[['Collected',money(tax.collected)],['Input tax credits',money(tax.itc)],['Net before payments',money(tax.net)]], headings:['Tax component','Amount'], rows:[['GST/HST collected on sales',money(tax.collected)],['Recoverable tax paid on purchases',money(tax.itc)],['Net sales tax payable / refundable',money(tax.net)]]};
    if(id==='tax-detail'){
      const rows=[...state.invoices.map(i=>[i.date,'Invoice',i.id,getCustomer(i.customerId).name,money(i.tax),'Collected']),...state.expenses.map(e=>[e.date,'Expense',e.id,getVendor(e.vendorId).name,money(e.tax),'Input tax credit']),...state.bills.map(b=>[b.date,'Bill',b.id,getVendor(b.vendorId).name,money(b.tax),'Input tax credit'])].sort((a,b)=>String(b[0]).localeCompare(String(a[0])));
      return {...common, summary:[['Collected',money(tax.collected)],['Recoverable',money(tax.itc)],['Net',money(tax.net)]], headings:['Date','Type','Reference','Name','Tax','Treatment'], rows};
    }
    if(id==='tax-exceptions'){
      const rows=[...state.invoices.filter(i=>num(i.tax)<=0).map(i=>[i.date,'Invoice',i.id,getCustomer(i.customerId).name,'No sales tax captured']),...state.expenses.filter(e=>num(e.tax)<=0).map(e=>[e.date,'Expense',e.id,getVendor(e.vendorId).name,'No input tax credit captured']),...state.bills.filter(b=>num(b.tax)<=0).map(b=>[b.date,'Bill',b.id,getVendor(b.vendorId).name,'No input tax credit captured'])];
      return {...common, summary:[['Exceptions',rows.length],['Review needed',rows.length? 'Yes':'No']], headings:['Date','Type','Reference','Name','Exception'], rows};
    }
    if(id==='inventory-valuation' || id==='stock-status'){
      const prods=safeInventoryProducts();
      return {...common, summary:[['Inventory value',money(prods.reduce((s,p)=>s+num(p.qty)*num(p.avgCost),0))],['Inventory items',prods.length],['Low stock',prods.filter(p=>safeStockAvailable(p.id)<=num(p.reorderPoint)).length]], headings:['SKU','Item','On hand','Committed','Available','Reorder point','Average cost','Sales price','Value','Status'], rows:prods.map(p=>[p.sku||p.id,p.name,num(p.qty),safeStockCommitted(p.id),safeStockAvailable(p.id),num(p.reorderPoint),money(p.avgCost),money(p.price),money(num(p.qty)*num(p.avgCost)),safeStockAvailable(p.id)<=num(p.reorderPoint)?'Low stock':'OK'])};
    }
    if(id==='purchase-orders') return {...common, summary:[['Purchase orders',(state.purchaseOrders||[]).length],['Open',(state.purchaseOrders||[]).filter(p=>!['Closed','Billed'].includes(p.status)).length]], headings:['PO','Vendor','Date','Product','Qty','Received','Status','Total'], rows:(state.purchaseOrders||[]).map(p=>[p.id,getVendor(p.vendorId).name,p.date,(typeof getProduct==='function'?getProduct(p.productId).name:p.productId),num(p.qty),num(p.receivedQty),p.status,money((num(p.qty)*num(p.unitCost||p.price||0))+num(p.tax||0))])};
    if(id==='sales-orders') return {...common, summary:[['Sales orders',(state.salesOrders||[]).length],['Open',(state.salesOrders||[]).filter(o=>!['Closed','Invoiced'].includes(o.status)).length]], headings:['SO','Customer','Date','Product/Service','Qty','Fulfilled','Status','Total'], rows:(state.salesOrders||[]).map(o=>[o.id,getCustomer(o.customerId).name,o.date,(typeof getProduct==='function'?getProduct(o.productId).name:(o.productId||'')),num(o.qty||1),num(o.fulfilledQty||0),o.status,money(typeof soTotal==='function'?soTotal(o):num(o.total))])};
    if(id==='po-match') return {...common, summary:[['POs',(state.purchaseOrders||[]).length],['Potential exceptions',(state.purchaseOrders||[]).filter(p=>p.status!=='Billed'&&p.status!=='Closed').length]], headings:['PO','Vendor','Received','Bill','Quantity','Cost','Tax','Status'], rows:(state.purchaseOrders||[]).map(p=>[p.id,getVendor(p.vendorId).name,`${num(p.receivedQty||0)} / ${num(p.qty||0)}`,p.billId||'Not billed',num(p.qty||0),money(num(p.unitCost||0)),money(num(p.tax||0)),p.billId?'Matched':'Review'])};
    if(id==='sales-by-customer') return {...common, summary:[['Customers',state.customers.length],['Sales',money(state.invoices.reduce((s,i)=>s+i.subtotal,0))]], headings:['Customer','Invoices','Subtotal','Tax','Total','Open'], rows:state.customers.map(c=>{ const inv=state.invoices.filter(i=>i.customerId===c.id); return [c.name,inv.length,money(inv.reduce((s,i)=>s+i.subtotal,0)),money(inv.reduce((s,i)=>s+i.tax,0)),money(inv.reduce((s,i)=>s+invoiceTotal(i),0)),money(inv.reduce((s,i)=>s+openAmount(i),0))]; })};
    if(id==='sales-by-product-service'){
      const rows=groupSum(state.invoices.flatMap(i=>(i.items||[]).map(it=>({...it, invoice:i}))), r=>r.desc||'Item', r=>num(r.qty)*num(r.rate)).map(([name,amt])=>[name,money(amt)]);
      return {...common, summary:[['Items',rows.length],['Sales',money(rows.reduce((s,r)=>s+num(String(r[1]).replace(/[^0-9.-]/g,'')),0))]], headings:['Product / Service','Sales'], rows};
    }
    if(id==='expenses-by-vendor'){
      const all=[...state.expenses.map(e=>({vendorId:e.vendorId,total:expenseTotal(e)})),...state.bills.map(b=>({vendorId:b.vendorId,total:billTotal(b)}))]; const rows=groupSum(all,r=>getVendor(r.vendorId).name,r=>r.total).map(([k,v])=>[k,money(v)]);
      return {...common, summary:[['Vendors',rows.length],['Total',money(all.reduce((s,r)=>s+r.total,0))]], headings:['Vendor','Amount'], rows};
    }
    if(id==='expenses-by-category'){
      const rows=Object.entries(groupExpenses()).map(([k,v])=>[k,money(v)]);
      return {...common, summary:[['Categories',rows.length],['Total expenses',money(t.expenses)]], headings:['Category','Amount'], rows};
    }
    if(id==='bills-by-vendor' || id==='bill-payment-list'){
      const rows=(id==='bill-payment-list'?state.billPayments.map(p=>[p.date,p.id,getVendor(p.vendorId).name,p.billId,money(p.amount),'Paid']):state.bills.map(b=>[b.date,b.id,getVendor(b.vendorId).name,b.dueDate,money(billTotal(b)),b.status]));
      return {...common, summary:[['Rows',rows.length]], headings:id==='bill-payment-list'?['Date','Payment','Vendor','Bill','Amount','Status']:['Date','Bill','Vendor','Due','Total','Status'], rows};
    }
    if(id==='payment-links') return {...common, summary:[['Payment links',(state.paymentLinks||[]).length],['Total',money((state.paymentLinks||[]).reduce((s,l)=>s+num(l.amount),0))]], headings:['Link','Customer','Date','Due','Description','Status','Amount'], rows:(state.paymentLinks||[]).map(l=>[l.id,getCustomer(l.customerId).name,l.date,l.dueDate,l.description,l.status,money(l.amount)])};
    if(id==='recurring-transactions') return {...common, summary:[['Templates',(state.recurringTransactions||[]).length]], headings:['Template','Type','Name','Frequency','Next date','Mode','Status','Amount'], rows:(state.recurringTransactions||[]).map(r=>[r.id,r.type,(getCustomer(r.customerId).name||getVendor(r.customerId).name),r.frequency,r.nextDate,r.mode,r.status,money(r.amount)])};
    if(id==='chart-of-accounts') return {...common, summary:[['Accounts',state.chartOfAccounts.length]], headings:['Code','Account','Type','Detail','Normal','Balance'], rows:state.chartOfAccounts.map(a=>[a.code,a.name,a.type,a.detail,a.normal,money(normalBalance(a.id))])};
    if(id==='journal-report') return {...common, summary:[['Entries',state.journalEntries.length]], headings:['Entry','Date','Memo','Debits','Credits','Status'], rows:state.journalEntries.map(j=>[j.id,j.date,j.memo,money(j.lines.reduce((s,l)=>s+num(l.debit),0)),money(j.lines.reduce((s,l)=>s+num(l.credit),0)),j.status])};
    if(id==='audit-log') return {...common, summary:[['Events',(state.auditTrail||[]).length]], headings:['Date','User','Action'], rows:(state.auditTrail||[]).map(a=>[a.date,a.user,a.action])};
    if(id==='cash-flow'){
      const rows=[...state.payments.map(p=>[p.date,'Customer payment',p.id,money(p.amount)]),...state.deposits.map(d=>[d.date,'Deposit',d.id,money(d.amount)]),...state.expenses.map(e=>[e.date,'Expense',e.id,money(-expenseTotal(e))]),...state.billPayments.map(p=>[p.date,'Bill payment',p.id,money(-p.amount)])].sort((a,b)=>String(b[0]).localeCompare(String(a[0]))); const net=rows.reduce((s,r)=>s+num(String(r[3]).replace(/[^0-9.-]/g,'')),0);
      return {...common, summary:[['Net cash movement',money(net)],['Rows',rows.length]], headings:['Date','Activity','Reference','Cash impact'], rows};
    }
    if(id==='business-snapshot') return {...common, summary:[['Bank',money(t.bank)],['Open A/R',money(t.ar)],['Open A/P',money(t.ap)],['Profit',money(t.profit)]], headings:['Metric','Amount'], rows:[['Bank balance',money(t.bank)],['Open accounts receivable',money(t.ar)],['Open accounts payable',money(t.ap)],['Sales tax payable',money(t.tax.net)],['Net income',money(t.profit)]]};
    if(id==='pl-by-month'){
      const sales=groupSum(state.invoices,i=>monthKey(i.date),i=>i.subtotal), expenses=groupSum(state.expenses,e=>monthKey(e.date),e=>expenseTotal(e)); const keys=[...new Set([...sales.map(x=>x[0]),...expenses.map(x=>x[0])])].sort();
      return {...common, summary:[['Months',keys.length]], headings:['Month','Income','Expenses','Net'], rows:keys.map(k=>{ const inc=sales.find(x=>x[0]===k)?.[1]||0, exp=expenses.find(x=>x[0]===k)?.[1]||0; return [k,money(inc),money(exp),money(inc-exp)]; })};
    }
    if(id==='balance-comparison') return {...common, summary:[['Current assets',money(sumTypes(['Asset']))],['Current liabilities',money(sumTypes(['Liability']))]], headings:['Measure','Current'], rows:[['Assets',money(sumTypes(['Asset']))],['Liabilities',money(sumTypes(['Liability']))],['Equity',money(sumTypes(['Equity']))],['Current earnings',money(t.profit)]]};
    if(id==='time-entries') return {...common, summary:[['Time entries',(state.timeEntries||[]).length],['Hours',((state.timeEntries||[]).reduce((s,t)=>s+num(t.hours),0)).toFixed(2)]], headings:['Date','Team member','Customer','Hours','Billable'], rows:(state.timeEntries||[]).map(te=>[te.date,te.employee,getCustomer(te.customerId).name,num(te.hours),te.billable?'Yes':'No'])};
    if(id==='project-profitability') return {...common, summary:[['Projects',(state.projects||[]).length]], headings:['Project','Customer','Budget','Revenue','Actual cost','Margin','Status'], rows:(state.projects||[]).map(p=>[p.name,getCustomer(p.customerId).name,money(p.budget),money(p.revenue),money(p.actualCost),money(num(p.revenue)-num(p.actualCost)),p.status])};
    return {...common, summary:[['Rows',0]], headings:['Information'], rows:[[meta.desc||'No detail available yet.']]};
  }
  function reportSummaryCardsV81(summary){ return summary?.length ? `<div class="report-summary">${summary.slice(0,4).map(([k,v])=>`<div class="report-summary-card"><span>${escapeHTML(k)}</span><strong>${escapeHTML(v)}</strong></div>`).join('')}</div>` : ''; }
  function reportTableV81(data){ return `<div class="report-table-wrap">${table(data.headings, data.rows.map(r=>r.map(c=>escapeHTML(String(c)).replace(/\n/g,'<br>'))))}</div>`; }
  function renderReportDetailV81(id){
    const data=reportDataV81(id);
    const fav=new Set(state.settings.reportFavorites||[]);
    return `<div id="reportDetailArea" class="report-detail"><div class="report-detail-head"><div><button class="btn soft" data-action="back-reports">â† Back to reports</button><h3>${escapeHTML(data.title)}</h3><p class="muted">${escapeHTML(data.subtitle)}</p></div><div class="actions" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-action="toggle-report-fav" data-id="${data.id}">${fav.has(data.id)?'â˜… Favorite':'â˜† Favorite'}</button><button class="btn" data-action="export-report" data-id="${data.id}">Export CSV</button><button class="btn primary" data-action="print-report" data-id="${data.id}">Print</button></div></div><div class="report-controls"><label>Start <input type="date" value="2026-05-01" aria-label="Report start date"></label><label>End <input type="date" value="${todayISO()}" aria-label="Report end date"></label><button class="btn" data-action="open-report" data-id="${data.id}">Run report</button></div>${reportSummaryCardsV81(data.summary)}${reportTableV81(data)}</div>`;
  }
  renderReports = function(){
    ensureV81State();
    const el=document.getElementById('page-reports'); if(!el) return;
    const activeReport=state.settings.activeReportId;
    const actions = activeReport ? `<button class="btn" data-action="export-report" data-id="${activeReport}">Export CSV</button><button class="btn" data-action="print-report" data-id="${activeReport}">Print</button><button class="btn primary" data-modal="journal">Journal Entry</button>` : `<button class="btn" data-action="print-report-directory">Print</button><button class="btn primary" data-modal="journal">Journal Entry</button>`;
    el.innerHTML = header('Reports & Analytics','Search, favorite, and open financial, sales, tax, banking, inventory, and management reports.', actions) +
      `<div class="report-center">${reportGroupButtonsV81()}<div class="card">${activeReport ? renderReportDetailV81(activeReport) : `<div class="report-search-box"><input data-report-search placeholder="Type report name here" /><button class="btn" data-action="report-filter" data-id="all">Show All</button></div>${reportSectionsV8(reportCatalogV8())}`}</div></div>`;
  };
  function reportRowsForCSV(id){ const d=reportDataV81(id); return {headings:d.headings, rows:d.rows, title:d.title}; }
  function csvEscape(v){ const s=String(v??'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"'); return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }
  function exportReportCSV(id){ const d=reportRowsForCSV(id); const csv=[d.headings.map(csvEscape).join(','),...d.rows.map(r=>r.map(csvEscape).join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(d.title||'report').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.csv'; a.click(); URL.revokeObjectURL(url); showToast('Report CSV export started.'); }
  function printCurrentReport(){ document.body.classList.add('printing-report'); window.print(); setTimeout(()=>document.body.classList.remove('printing-report'),500); }
  function updateReportSearchV81(input){
    const q=input.value.trim().toLowerCase(); let visible=0;
    document.querySelectorAll('[data-report-row]').forEach(row=>{ const show=!q || row.dataset.search.includes(q); row.style.display=show?'':'none'; if(show) visible++; });
    document.querySelectorAll('[data-report-section]').forEach(section=>{ const rows=[...section.querySelectorAll('[data-report-row]')]; section.style.display = rows.some(r=>r.style.display!=='none') ? '' : 'none'; });
    const empty=document.querySelector('[data-report-empty]'); if(empty) empty.classList.toggle('show', visible===0);
  }
  const v81HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='open-report'){
      state.settings.activeReportId=id; state.settings.reportMenuId=null; saveState(); renderReports(); showToast(`${getReportMeta(id).name} opened.`); return;
    }
    if(action==='back-reports'){
      state.settings.activeReportId=null; state.settings.reportMenuId=null; saveState(); renderReports(); return;
    }
    if(action==='report-more'){
      state.settings.reportMenuId = state.settings.reportMenuId===id ? null : id; saveState(); renderReports(); return;
    }
    if(action==='report-filter'){
      state.settings.reportFilter=id||'all'; state.settings.activeReportId=null; state.settings.reportMenuId=null; saveState(); renderReports(); return;
    }
    if(action==='export-report') { exportReportCSV(id || state.settings.activeReportId || 'profit-loss'); return; }
    if(action==='print-report') { state.settings.activeReportId=id || state.settings.activeReportId || 'profit-loss'; saveState(); renderReports(); setTimeout(printCurrentReport,50); return; }
    if(action==='print-report-directory') { window.print(); return; }
    if(action==='add-report-dashboard') { showToast(`${getReportMeta(id).name} can be added through dashboard customization.`); state.settings.reportMenuId=null; renderReports(); return; }
    if(action==='toggle-report-fav'){
      state.settings.reportFavorites ||= [];
      const set=new Set(state.settings.reportFavorites);
      if(set.has(id)) set.delete(id); else set.add(id);
      state.settings.reportFavorites=[...set]; state.settings.reportMenuId=null; saveState(); renderReports(); showToast(set.has(id)?'Report added to favorites.':'Report removed from favorites.'); return;
    }
    return v81HandleActionBase(action,id);
  };
  const v81SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v81SetupEventListenersBase();
    document.addEventListener('input', e=>{ const input=e.target.closest('[data-report-search]'); if(input) updateReportSearchV81(input); });
  };
  const v81RenderAllBase = renderAll;
  renderAll = function(){ ensureV81State(); v81RenderAllBase(); };
  resetState = function(){ state=structuredClone(initialState); state.settings.visibleModules = masterModuleIds.slice(); ensureV81State(); saveState(); renderAll(); showToast('Company data reset.'); };



  // V8.3 proper two-mode light/dark workspace theme
  function injectV83Styles(){
    if(document.getElementById('v83-full-dark-style')) return;
    const style=document.createElement('style');
    style.id='v83-full-dark-style';
    style.textContent=`
      body.v8-ui.dark-mode{
        --ink:#f8fafc;
        --muted:#cbd5e1;
        --line:#334155;
        --soft:#111827;
        --panel:#172033;
        --sidebar:#0b1220;
        --sidebar-2:#132033;
        background:#0f172a;
        color:#e5edf7;
      }
      body.v8-ui.dark-mode .app,
      body.v8-ui.dark-mode .main,
      body.v8-ui.dark-mode .content{
        background:#0f172a;
        color:#e5edf7;
      }
      body.v8-ui.dark-mode .rail{
        background:#08111f;
        border-right-color:#1e293b;
        color:#dbeafe;
      }
      body.v8-ui.dark-mode .rail-btn{color:#cbd5e1}
      body.v8-ui.dark-mode .rail-btn:hover,
      body.v8-ui.dark-mode .rail-btn.active{
        background:#12233a;
        color:#7dd3fc;
        box-shadow:0 8px 20px rgba(0,0,0,.28);
      }
      body.v8-ui.dark-mode .sidebar{
        background:#0b1220;
        color:#e5edf7;
        border-right-color:#1e293b;
      }
      body.v8-ui.dark-mode .company-logo{
        background:#0a8f3c;
        color:#fff;
      }
      body.v8-ui.dark-mode .company h1{color:#f8fafc}
      body.v8-ui.dark-mode .company span{color:#94a3b8}
      body.v8-ui.dark-mode .new-btn{
        background:#0f172a;
        border-color:#64748b;
        color:#f8fafc;
      }
      body.v8-ui.dark-mode .new-btn:hover{
        background:#0a8f3c;
        border-color:#0a8f3c;
        color:#fff;
      }
      body.v8-ui.dark-mode .side-title{color:#94a3b8}
      body.v8-ui.dark-mode .nav-item{color:#dbeafe;background:transparent}
      body.v8-ui.dark-mode .nav-item:hover{background:#132033;color:#fff}
      body.v8-ui.dark-mode .nav-item.active{
        background:#ffffff;
        color:#0f172a;
        font-weight:900;
      }
      body.v8-ui.dark-mode .nav-item .dot{background:#075985;color:#fff}
      body.v8-ui.dark-mode .nav-item.active .dot{background:#0a8f3c;color:#fff}
      body.v8-ui.dark-mode .nav-chevron{color:#94a3b8}

      body.v8-ui.dark-mode .topbar{
        background:#101827;
        border-bottom-color:#253246;
        box-shadow:0 1px 0 #253246;
        color:#e5edf7;
      }
      body.v8-ui.dark-mode .hamburger,
      body.v8-ui.dark-mode .company-name,
      body.v8-ui.dark-mode .icon-btn{color:#e5edf7}
      body.v8-ui.dark-mode .icon-btn:hover{background:#1e293b;border-color:#334155;color:#fff}
      body.v8-ui.dark-mode .avatar{background:#0a72ce;color:#fff}
      body.v8-ui.dark-mode .search input{
        background:#0b1220;
        border-color:#3b4a61;
        color:#f8fafc;
      }
      body.v8-ui.dark-mode .search input::placeholder{color:#94a3b8}
      body.v8-ui.dark-mode .search:before{color:#94a3b8}

      body.v8-ui.dark-mode .hero h2,
      body.v8-ui.dark-mode .section-header h2,
      body.v8-ui.dark-mode .feed-header h3,
      body.v8-ui.dark-mode .report-section h3,
      body.v8-ui.dark-mode h1,
      body.v8-ui.dark-mode h2,
      body.v8-ui.dark-mode h3,
      body.v8-ui.dark-mode h4{color:#f8fafc}
      body.v8-ui.dark-mode .muted,
      body.v8-ui.dark-mode .small,
      body.v8-ui.dark-mode .section-header p{color:#cbd5e1}
      body.v8-ui.dark-mode .metric,
      body.v8-ui.dark-mode .amount{color:#f8fafc}

      body.v8-ui.dark-mode .module-pill,
      body.v8-ui.dark-mode .tab-btn,
      body.v8-ui.dark-mode .mini-tab,
      body.v8-ui.dark-mode .tracking-chip,
      body.v8-ui.dark-mode .tax-pill{
        background:#172033;
        border-color:#334155;
        color:#f8fafc;
        box-shadow:none;
      }
      body.v8-ui.dark-mode .module-pill.active,
      body.v8-ui.dark-mode .tab-btn.active,
      body.v8-ui.dark-mode .mini-tab.active{
        background:#0a8f3c;
        border-color:#0a8f3c;
        color:#fff;
      }
      body.v8-ui.dark-mode .module-icon{background:#075985;color:#fff}

      body.v8-ui.dark-mode .card,
      body.v8-ui.dark-mode .feed-card,
      body.v8-ui.dark-mode .feed-card.v8-feed-card,
      body.v8-ui.dark-mode .funnel-card,
      body.v8-ui.dark-mode .app-tile,
      body.v8-ui.dark-mode .tax-card,
      body.v8-ui.dark-mode .money-card,
      body.v8-ui.dark-mode .invoice-report-card,
      body.v8-ui.dark-mode .invoice-summary-box,
      body.v8-ui.dark-mode .report-side,
      body.v8-ui.dark-mode .report-summary-card,
      body.v8-ui.dark-mode .create-menu,
      body.v8-ui.dark-mode .modal,
      body.v8-ui.dark-mode .drawer,
      body.v8-ui.dark-mode .recon-box,
      body.v8-ui.dark-mode .posting-preview,
      body.v8-ui.dark-mode .empty,
      body.v8-ui.dark-mode .invoice-settings-preview{
        background:#172033;
        border-color:#334155;
        color:#e5edf7;
        box-shadow:0 16px 32px rgba(0,0,0,.24);
      }
      body.v8-ui.dark-mode .card:hover,
      body.v8-ui.dark-mode .feed-card:hover,
      body.v8-ui.dark-mode .money-card:hover,
      body.v8-ui.dark-mode .app-tile:hover{border-color:#475569}
      body.v8-ui.dark-mode .v8-add-widget-card,
      body.v8-ui.dark-mode .clean-empty,
      body.v8-ui.dark-mode .suggestion{
        background:#111c2e;
        border-color:#334155;
        color:#cbd5e1;
      }
      body.v8-ui.dark-mode .feed-card.v8-feed-card p,
      body.v8-ui.dark-mode .feed-card p,
      body.v8-ui.dark-mode .funnel-card .label,
      body.v8-ui.dark-mode .legend-row,
      body.v8-ui.dark-mode .bank-row,
      body.v8-ui.dark-mode .report-desc{color:#cbd5e1}
      body.v8-ui.dark-mode .feed-title{color:#f8fafc}
      body.v8-ui.dark-mode .feed-badge,
      body.v8-ui.dark-mode .tile-icon,
      body.v8-ui.dark-mode .bank-icon{
        background:#0f2b46;
        color:#7dd3fc;
        border-color:#1e4c70;
      }
      body.v8-ui.dark-mode .donut:after{background:#172033;border-color:#334155}

      body.v8-ui.dark-mode .btn{
        background:#111c2e;
        border-color:#475569;
        color:#f8fafc;
      }
      body.v8-ui.dark-mode .btn:hover{
        background:#1e293b;
        border-color:#64748b;
        box-shadow:0 10px 24px rgba(0,0,0,.25);
      }
      body.v8-ui.dark-mode .btn.primary{
        background:#0a8f3c;
        border-color:#0a8f3c;
        color:#fff;
      }
      body.v8-ui.dark-mode .btn.primary:hover{background:#10a64a;border-color:#10a64a}
      body.v8-ui.dark-mode .btn.soft{
        background:#103345;
        border-color:#1f6178;
        color:#d0faff;
      }
      body.v8-ui.dark-mode .btn.danger{
        background:#3a1515;
        color:#fecaca;
        border-color:#7f1d1d;
      }
      body.v8-ui.dark-mode .quick-actions strong{color:#f8fafc}

      body.v8-ui.dark-mode .table-card,
      body.v8-ui.dark-mode .toolbar,
      body.v8-ui.dark-mode .modal-header,
      body.v8-ui.dark-mode .modal-footer,
      body.v8-ui.dark-mode .report-detail,
      body.v8-ui.dark-mode .invoice-shell{
        background:#172033;
        border-color:#334155;
        color:#e5edf7;
      }
      body.v8-ui.dark-mode table th,
      body.v8-ui.dark-mode .line-table th{
        background:#101827;
        color:#cbd5e1;
        border-bottom-color:#334155;
      }
      body.v8-ui.dark-mode table td,
      body.v8-ui.dark-mode .line-table td,
      body.v8-ui.dark-mode .report-line,
      body.v8-ui.dark-mode .report-row,
      body.v8-ui.dark-mode .bank-row,
      body.v8-ui.dark-mode .posting-line{
        border-bottom-color:#2a3a50;
        color:#e5edf7;
      }
      body.v8-ui.dark-mode tbody tr:hover{background:#1d2a3d}
      body.v8-ui.dark-mode .report-name{color:#f8fafc}
      body.v8-ui.dark-mode .report-name:hover{color:#86efac;text-decoration:underline}
      body.v8-ui.dark-mode .report-side button{color:#dbeafe}
      body.v8-ui.dark-mode .report-side button:hover,
      body.v8-ui.dark-mode .report-side button.active{background:#123321;color:#86efac}
      body.v8-ui.dark-mode .star-btn,
      body.v8-ui.dark-mode .more-btn{color:#cbd5e1}
      body.v8-ui.dark-mode .star-btn.active{color:#22c55e}
      body.v8-ui.dark-mode .star-btn:hover,
      body.v8-ui.dark-mode .more-btn:hover{background:#1e293b}
      body.v8-ui.dark-mode .report-more-menu{
        background:#111c2e;
        border-color:#475569;
        box-shadow:0 18px 38px rgba(0,0,0,.35);
      }
      body.v8-ui.dark-mode .report-more-menu button{color:#f8fafc}
      body.v8-ui.dark-mode .report-more-menu button:hover{background:#1e293b}

      body.v8-ui.dark-mode input,
      body.v8-ui.dark-mode select,
      body.v8-ui.dark-mode textarea,
      body.v8-ui.dark-mode .field input,
      body.v8-ui.dark-mode .field select,
      body.v8-ui.dark-mode .field textarea,
      body.v8-ui.dark-mode .table-search,
      body.v8-ui.dark-mode .report-search-box input,
      body.v8-ui.dark-mode .report-controls input,
      body.v8-ui.dark-mode .invoice-filters select,
      body.v8-ui.dark-mode .invoice-filters input,
      body.v8-ui.dark-mode .line-table input,
      body.v8-ui.dark-mode .line-table select{
        background:#0b1220;
        border-color:#3b4a61;
        color:#f8fafc;
      }
      body.v8-ui.dark-mode input::placeholder,
      body.v8-ui.dark-mode textarea::placeholder{color:#94a3b8}
      body.v8-ui.dark-mode label{color:#cbd5e1}

      body.v8-ui.dark-mode .status-chip{background:#422b05;color:#fde68a}
      body.v8-ui.dark-mode .status-chip.green{background:#063d22;color:#bbf7d0}
      body.v8-ui.dark-mode .status-chip.red{background:#4c1515;color:#fecaca}
      body.v8-ui.dark-mode .status-chip.blue{background:#082f49;color:#bae6fd}
      body.v8-ui.dark-mode .mode-guidance,
      body.v8-ui.dark-mode .tax-form-note{
        background:#102b43;
        border-color:#1f5e86;
        color:#d7efff;
      }
      body.v8-ui.dark-mode .check-row,
      body.v8-ui.dark-mode .widget-option{
        background:#111c2e;
        border-color:#334155;
        color:#e5edf7;
      }
      body.v8-ui.dark-mode .modal-backdrop{background:rgba(2,6,23,.72)}

      body.v8-ui.dark-mode .theme-toggle{
        background:#0b1220;
        border-color:#475569;
        justify-content:flex-end;
      }
      body.v8-ui.dark-mode .theme-toggle-knob{
        background:#1e293b;
        color:#facc15;
      }

      /* Customer-facing documents and print/export previews stay professional white. */
      body.v8-ui.dark-mode .invoice-doc-wrap{background:#0f172a}
      body.v8-ui.dark-mode .invoice-document,
      body.v8-ui.dark-mode .invoice-preview{
        background:#fff;
        color:#1f2937;
        border-color:#dce5ec;
      }
      body.v8-ui.dark-mode .invoice-document h1,
      body.v8-ui.dark-mode .invoice-document h2,
      body.v8-ui.dark-mode .invoice-document h3,
      body.v8-ui.dark-mode .invoice-document h4,
      body.v8-ui.dark-mode .invoice-preview h1,
      body.v8-ui.dark-mode .invoice-preview h2,
      body.v8-ui.dark-mode .invoice-preview h3,
      body.v8-ui.dark-mode .invoice-preview h4{color:#1f2937}
      body.v8-ui.dark-mode .invoice-document .muted,
      body.v8-ui.dark-mode .invoice-preview .muted{color:#667085}
      @media print{
        body.v8-ui.dark-mode .invoice-document,
        body.v8-ui.dark-mode .invoice-preview,
        body.v8-ui.dark-mode .report-detail{
          background:#fff!important;
          color:#1f2937!important;
          box-shadow:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  // V8.4 dark-mode table contrast fix
  function injectV84TableContrastStyles(){
    if(document.getElementById('v84-dark-table-contrast-style')) return;
    const style=document.createElement('style');
    style.id='v84-dark-table-contrast-style';
    style.textContent=`
      /* V8.4: make every working table readable in full dark mode. */
      body.v8-ui.dark-mode table,
      body.v8-ui.dark-mode .table-card table,
      body.v8-ui.dark-mode .report-table-wrap table,
      body.v8-ui.dark-mode table thead,
      body.v8-ui.dark-mode table tbody{
        background:#172033 !important;
        color:#e5edf7 !important;
      }
      body.v8-ui.dark-mode table th,
      body.v8-ui.dark-mode .line-table th,
      body.v8-ui.dark-mode .report-table-wrap th{
        background:#0f1828 !important;
        color:#dbeafe !important;
        border-bottom:1px solid #3b4a61 !important;
      }
      body.v8-ui.dark-mode table tbody tr,
      body.v8-ui.dark-mode .table-card tbody tr,
      body.v8-ui.dark-mode .report-table-wrap tbody tr{
        background:#172033 !important;
      }
      body.v8-ui.dark-mode table tbody tr:nth-child(even),
      body.v8-ui.dark-mode .table-card tbody tr:nth-child(even),
      body.v8-ui.dark-mode .report-table-wrap tbody tr:nth-child(even){
        background:#1a2638 !important;
      }
      body.v8-ui.dark-mode table td,
      body.v8-ui.dark-mode .table-card table td,
      body.v8-ui.dark-mode .report-table-wrap td,
      body.v8-ui.dark-mode .line-table td{
        background:inherit !important;
        color:#e5edf7 !important;
        border-bottom:1px solid #2f4057 !important;
      }
      body.v8-ui.dark-mode table td strong,
      body.v8-ui.dark-mode table td b,
      body.v8-ui.dark-mode table td .amount,
      body.v8-ui.dark-mode table td .metric{
        color:#f8fafc !important;
      }
      body.v8-ui.dark-mode table td .muted,
      body.v8-ui.dark-mode table td small,
      body.v8-ui.dark-mode table td .small{
        color:#b6c5d8 !important;
      }
      body.v8-ui.dark-mode table tbody tr:hover,
      body.v8-ui.dark-mode table tbody tr:hover td,
      body.v8-ui.dark-mode .table-card tbody tr:hover,
      body.v8-ui.dark-mode .table-card tbody tr:hover td{
        background:#23324a !important;
        color:#ffffff !important;
      }
      body.v8-ui.dark-mode .table-card,
      body.v8-ui.dark-mode .report-table-wrap,
      body.v8-ui.dark-mode .toolbar{
        background:#172033 !important;
        border-color:#334155 !important;
      }

      /* Grid-style rows that behave like tables. */
      body.v8-ui.dark-mode .bank-row,
      body.v8-ui.dark-mode .report-row,
      body.v8-ui.dark-mode .posting-line,
      body.v8-ui.dark-mode .report-line{
        background:transparent;
        color:#e5edf7 !important;
        border-bottom-color:#2f4057 !important;
      }
      body.v8-ui.dark-mode .bank-row *,
      body.v8-ui.dark-mode .report-row *,
      body.v8-ui.dark-mode .posting-line *{
        color:inherit;
      }
      body.v8-ui.dark-mode .bank-row .muted,
      body.v8-ui.dark-mode .report-desc,
      body.v8-ui.dark-mode .posting-head{
        color:#b6c5d8 !important;
      }
      body.v8-ui.dark-mode .report-name{
        color:#f8fafc !important;
      }

      /* Status badges need their own dark-mode contrast, not light-mode pills pasted onto dark rows. */
      body.v8-ui.dark-mode .tag{
        background:#263449 !important;
        color:#e5edf7 !important;
        border:1px solid #3b4a61;
      }
      body.v8-ui.dark-mode .tag.paid{background:#064e3b !important;color:#bbf7d0 !important;border-color:#0f766e}
      body.v8-ui.dark-mode .tag.sent{background:#0b3b63 !important;color:#bae6fd !important;border-color:#0369a1}
      body.v8-ui.dark-mode .tag.overdue{background:#5b1717 !important;color:#fecaca !important;border-color:#991b1b}
      body.v8-ui.dark-mode .tag.draft{background:#263449 !important;color:#dbeafe !important;border-color:#475569}
      body.v8-ui.dark-mode .tag.open{background:#4a2d06 !important;color:#fde68a !important;border-color:#b45309}

      body.v8-ui.dark-mode .status-chip{
        background:#263449 !important;
        color:#e5edf7 !important;
        border:1px solid #3b4a61;
      }
      body.v8-ui.dark-mode .status-chip.green{background:#064e3b !important;color:#bbf7d0 !important;border-color:#0f766e}
      body.v8-ui.dark-mode .status-chip.red{background:#5b1717 !important;color:#fecaca !important;border-color:#991b1b}
      body.v8-ui.dark-mode .status-chip.blue{background:#0b3b63 !important;color:#bae6fd !important;border-color:#0369a1}

      /* Forms and table search inputs remain readable inside dark tables/cards. */
      body.v8-ui.dark-mode .table-search,
      body.v8-ui.dark-mode .toolbar input,
      body.v8-ui.dark-mode .toolbar select{
        background:#0b1220 !important;
        color:#f8fafc !important;
        border-color:#3b4a61 !important;
      }
      body.v8-ui.dark-mode .table-search::placeholder,
      body.v8-ui.dark-mode .toolbar input::placeholder{color:#94a3b8 !important}

      /* Customer-facing documents remain light even when opened from dark mode. */
      body.v8-ui.dark-mode .invoice-document table,
      body.v8-ui.dark-mode .invoice-document thead,
      body.v8-ui.dark-mode .invoice-document tbody,
      body.v8-ui.dark-mode .invoice-document tr,
      body.v8-ui.dark-mode .invoice-document th,
      body.v8-ui.dark-mode .invoice-document td,
      body.v8-ui.dark-mode .invoice-preview table,
      body.v8-ui.dark-mode .invoice-preview thead,
      body.v8-ui.dark-mode .invoice-preview tbody,
      body.v8-ui.dark-mode .invoice-preview tr,
      body.v8-ui.dark-mode .invoice-preview th,
      body.v8-ui.dark-mode .invoice-preview td{
        background:#fff !important;
        color:#1f2937 !important;
        border-color:#dce3ea !important;
      }
      body.v8-ui.dark-mode .invoice-document .muted,
      body.v8-ui.dark-mode .invoice-preview .muted{color:#667085 !important}
    `;
    document.head.appendChild(style);
  }

  // V8.2 sidebar cleanup and light/dark mode
  function ensureV82State(){
    ensureV81State();
    injectV83Styles();
    injectV84TableContrastStyles();
    state.settings ||= {};
    if(!['light','dark'].includes(state.settings.theme)) state.settings.theme = 'light';
  }
  function applyTheme(){
    ensureV82State();
    const isDark = state.settings.theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    const btn = document.getElementById('themeToggle');
    if(btn){
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      const knob = btn.querySelector('.theme-toggle-knob');
      if(knob) knob.textContent = isDark ? 'ðŸŒ™' : 'â˜€';
    }
  }
  function toggleTheme(){
    ensureV82State();
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    saveState();
    applyTheme();
    showToast(`${state.settings.theme === 'dark' ? 'Dark' : 'Light'} mode enabled.`);
  }
  function removeSidebarEditIcons(){
    document.querySelectorAll('.side-title span').forEach(span=>{
      if(span.textContent.trim()==='âœŽ') span.remove();
    });
  }
  const v82SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v82SetupEventListenersBase();
    const toggle = document.getElementById('themeToggle');
    if(toggle) toggle.addEventListener('click', toggleTheme);
  };
  const v82RenderAllBase = renderAll;
  renderAll = function(){
    ensureV82State();
    v82RenderAllBase();
    removeSidebarEditIcons();
    applyTheme();
  };
  const v82RenderSettingsBase = renderSettings;
  renderSettings = function(){
    ensureV82State();
    v82RenderSettingsBase();
    const panel = document.querySelector('#page-settings .grid.two .card:nth-child(2)');
    if(panel && !panel.querySelector('[data-action="toggle-theme"]')){
      panel.insertAdjacentHTML('beforeend', `<div class="report-line"><span>Appearance</span><strong>${state.settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}</strong></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" data-action="toggle-theme">Switch ${state.settings.theme === 'dark' ? 'to light mode' : 'to dark mode'}</button></div>`);
    }
  };
  const v82HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='toggle-theme'){ toggleTheme(); renderAll(); return; }
    return v82HandleActionBase(action,id);
  };
  const v82ResetStateBase = resetState;
  resetState = function(){
    const currentTheme = state?.settings?.theme || 'light';
    v82ResetStateBase();
    state.settings.theme = currentTheme;
    saveState();
    applyTheme();
  };



  // V8.5 top bar interaction panels: insights, help, settings, notifications, profile
  function ensureV85State(){
    ensureV82State();
    injectV85TopbarStyles();
    state.settings ||= {};
    if(!Array.isArray(state.settings.readNotifications)) state.settings.readNotifications = [];
  }
  function injectV85TopbarStyles(){
    if(document.getElementById('v85-topbar-styles')) return;
    const style=document.createElement('style'); style.id='v85-topbar-styles'; style.textContent=`
      .top-actions{position:relative}
      .avatar{border:0;cursor:pointer}
      .avatar:hover{filter:brightness(1.05);box-shadow:0 0 0 3px rgba(10,114,206,.14)}
      .notification-btn{position:relative}
      .notification-dot{position:absolute;right:5px;top:5px;min-width:16px;height:16px;border-radius:999px;background:#d94141;color:#fff;font-size:10px;line-height:16px;text-align:center;font-weight:800;border:2px solid #fff;padding:0 3px}
      .top-popover{position:fixed;right:18px;top:62px;width:min(420px,calc(100vw - 28px));max-height:calc(100vh - 82px);overflow:auto;background:#fff;border:1px solid #d8dee4;border-radius:18px;box-shadow:0 20px 50px rgba(16,24,40,.22);z-index:90;display:none;color:#202124}
      .top-popover.open{display:block}
      .top-panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:18px 18px 12px;border-bottom:1px solid #e8eef3}
      .top-panel-head h3{margin:0;font-size:18px;letter-spacing:-.02em;color:#122033}.top-panel-head p{margin:4px 0 0;color:#667085;font-size:13px;line-height:1.4}
      .top-panel-body{padding:12px 14px 16px}.top-panel-close{border:0;background:transparent;border-radius:10px;width:34px;height:34px;font-size:18px;color:#475467}.top-panel-close:hover{background:#f1f4f6}
      .panel-list{display:grid;gap:10px}.panel-card{border:1px solid #e3eaf0;border-radius:14px;padding:12px;background:#fbfdfe}.panel-card h4{margin:0 0 5px;font-size:14px;color:#101828}.panel-card p{margin:0 0 10px;color:#526172;line-height:1.35}.panel-card .btn{min-height:34px}
      .panel-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 10px;border-radius:12px;border:1px solid #e4ebf0;background:#fff}.panel-row + .panel-row{margin-top:8px}.panel-row:hover{background:#f7fafb}.panel-row strong{display:block;color:#162033}.panel-row span{color:#667085;font-size:12px;line-height:1.35}
      .panel-icon{width:34px;height:34px;border-radius:12px;background:#eaf6ff;color:#0a62a3;display:grid;place-items:center;font-weight:900;flex:0 0 auto}.panel-row-main{display:flex;align-items:center;gap:10px;min-width:0}.panel-row-main div{min-width:0}.panel-row-main strong,.panel-row-main span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .help-search{width:100%;border:1px solid #cbd5df;border-radius:12px;padding:11px 12px;margin:0 0 12px;background:#fff;color:#101828}.help-topic{cursor:pointer}
      .notification-unread{box-shadow:inset 3px 0 0 #0a8f3c}.notification-time{white-space:nowrap;color:#8a98a8;font-size:12px}.top-panel-foot{padding-top:10px;margin-top:10px;border-top:1px solid #e8eef3;display:flex;gap:8px;flex-wrap:wrap}
      body.v8-ui.dark-mode .notification-dot{border-color:#0f172a}
      body.v8-ui.dark-mode .top-popover{background:#162033;border-color:#334155;color:#e5edf7;box-shadow:0 20px 60px rgba(0,0,0,.45)}
      body.v8-ui.dark-mode .top-panel-head{border-bottom-color:#2f4158}body.v8-ui.dark-mode .top-panel-head h3{color:#f8fafc}body.v8-ui.dark-mode .top-panel-head p{color:#cbd5e1}
      body.v8-ui.dark-mode .top-panel-close{color:#d6e1ee}body.v8-ui.dark-mode .top-panel-close:hover{background:#243247}
      body.v8-ui.dark-mode .panel-card, body.v8-ui.dark-mode .panel-row{background:#1e293b;border-color:#334155}body.v8-ui.dark-mode .panel-card h4, body.v8-ui.dark-mode .panel-row strong{color:#f8fafc}body.v8-ui.dark-mode .panel-card p, body.v8-ui.dark-mode .panel-row span{color:#cbd5e1}
      body.v8-ui.dark-mode .panel-row:hover{background:#26364d}body.v8-ui.dark-mode .panel-icon{background:#0f3652;color:#7dd3fc}body.v8-ui.dark-mode .help-search{background:#0f172a;border-color:#334155;color:#f8fafc}body.v8-ui.dark-mode .top-panel-foot{border-top-color:#334155}
    `; document.head.appendChild(style);
  }
  function topbarButton(type){ return document.querySelector(`[data-top-panel="${type}"]`); }
  function closeTopbarPanel(){ const panel=document.getElementById('topbarPopover'); if(panel){ panel.classList.remove('open'); panel.dataset.panel=''; } }
  function ensureTopbarPanel(){
    let panel=document.getElementById('topbarPopover');
    if(!panel){ panel=document.createElement('div'); panel.id='topbarPopover'; panel.className='top-popover'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','false'); document.body.appendChild(panel); }
    return panel;
  }
  function panelHead(title, subtitle){ return `<div class="top-panel-head"><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(subtitle)}</p></div><button class="top-panel-close" type="button" data-action="close-topbar-panel" aria-label="Close">Ã—</button></div>`; }
  function openTopbarPanel(type){ ensureV85State(); const panel=ensureTopbarPanel(); panel.dataset.panel=type; panel.innerHTML=renderTopbarPanel(type); panel.classList.add('open'); updateNotificationBadge(); const search=panel.querySelector('[data-help-search]'); if(search) setTimeout(()=>search.focus(),0); }
  function renderTopbarPanel(type){
    if(type==='insights') return renderInsightsPanel();
    if(type==='help') return renderHelpPanel();
    if(type==='settings') return renderSettingsPanel();
    if(type==='notifications') return renderNotificationsPanel();
    if(type==='profile') return renderProfilePanel();
    return panelHead('Menu','Choose an option.')+`<div class="top-panel-body"></div>`;
  }
  function smartInsights(){
    const t=totals();
    const bankReview=state.bankTransactions.filter(tx=>tx.status!=='Reviewed').length;
    const overdueInvoices=state.invoices.filter(i=>openAmount(i)>0 && (i.status==='Overdue' || new Date(i.dueDate)<new Date(todayISO()))).length;
    const dueBills=state.bills.filter(b=>billOpenAmount(b)>0).length;
    const lowStock=(state.products||[]).filter(p=>String(p.type||'').toLowerCase()==='inventory' && num(p.qty)<=num(p.reorderPoint||2)).length;
    const matchIssues=(state.purchaseOrders||[]).filter(po=>po.status && !['Closed','Received'].includes(po.status)).length;
    return [
      {id:'balanced', icon:'â–£', title:'Accounting done', msg:`Trial balance is ${Math.abs(trialBalance().difference)<0.01?'balanced':'out of balance'}. ${bankReview} bank transactions need review.`, label:'Open accounting', nav:'accounting'},
      {id:'overdue', icon:'!', title:'Overdue invoices', msg: overdueInvoices ? `${overdueInvoices} invoice${overdueInvoices===1?'':'s'} need follow-up. Open receivables are ${money(t.ar)}.` : `Open receivables are ${money(t.ar)}. No overdue invoice follow-up is currently flagged.`, label:'Review invoices', nav:'sales'},
      {id:'bank', icon:'â—‰', title:'Banking review', msg: bankReview ? `${bankReview} bank transaction${bankReview===1?'':'s'} need matching, clearing, or categorization.` : 'Bank feed is reviewed. Reconciliation remains available from Banking.', label:'Review banking', nav:'banking'},
      {id:'cash', icon:'â†—', title:'Cash flow insight', msg:`Current bank position is ${money(t.bank)}. Net cash flow is based on recorded payments, deposits, expenses, and bill payments.`, label:'View banking', nav:'banking'},
      {id:'ap', icon:'â–¡', title:'Bills due', msg: dueBills ? `${dueBills} vendor bill${dueBills===1?'':'s'} remain open. Open A/P is ${money(t.ap)}.` : 'No open vendor bills need payment.', label:'Open bills', nav:'expenses'},
      {id:'stock', icon:'â—¼', title:'Inventory attention', msg: lowStock ? `${lowStock} inventory item${lowStock===1?'':'s'} are at or below reorder point.` : 'Inventory stock levels do not show reorder alerts.', label:'Products & Services', nav:'inventory'},
      {id:'match', icon:'â‡„', title:'Purchase matching', msg: matchIssues ? `${matchIssues} purchase order${matchIssues===1?'':'s'} may need receiving, billing, or matching review.` : 'Purchase orders, receiving, and bill matching are in good shape.', label:'3-way match', nav:'inventory'}
    ];
  }
  function renderInsightsPanel(){
    const rows=smartInsights().slice(0,6).map(x=>`<div class="panel-card"><h4><span class="panel-icon" style="display:inline-grid;margin-right:8px">${x.icon}</span>${escapeHTML(x.title)}</h4><p>${escapeHTML(x.msg)}</p><button class="btn primary" data-nav="${x.nav}">${escapeHTML(x.label)}</button></div>`).join('');
    return panelHead('Smart Insights','Action cards based on invoices, bills, banking, tax, and inventory data.')+`<div class="top-panel-body"><div class="panel-list">${rows}</div><div class="top-panel-foot"><button class="btn" data-nav="dashboard">Open dashboard</button><button class="btn" data-modal="customizeDashboard">Customize dashboard</button></div></div>`;
  }
  function helpTopics(){ return [
    {t:'Getting started', d:'Set up your company profile, menu modules, invoice branding, and tax settings.', nav:'setup'},
    {t:'Dashboard', d:'Use Business Feed, create actions, and widgets to review key work.', nav:'dashboard'},
    {t:'Invoices and payments', d:'Create invoices, send reminders, receive payments, and print or save PDF invoices.', nav:'sales'},
    {t:'Banking and reconciliation', d:'Review bank-feed transactions, match deposits, clear items, and reconcile accounts.', nav:'banking'},
    {t:'Reports', d:'Search, favorite, open, print, and export report details.', nav:'reports'},
    {t:'Products & Services', d:'Choose service, product, non-inventory, or bundle item types and manage PO/SO workflows.', nav:'inventory'},
    {t:'Taxes', d:'Review tax codes, tax agencies, returns, input tax credits, and tax payments.', nav:'taxes'},
    {t:'Keyboard shortcuts', d:'Esc closes popovers and modals. Use global search to find contacts, transactions, reports, or help topics.', nav:'dashboard'}
  ]; }
  function renderHelpPanel(query=''){
    const q=String(query||'').trim().toLowerCase();
    const rows=helpTopics().filter(h=>!q || `${h.t} ${h.d}`.toLowerCase().includes(q)).map(h=>`<div class="panel-row help-topic" data-nav="${h.nav}"><div class="panel-row-main"><span class="panel-icon">?</span><div><strong>${escapeHTML(h.t)}</strong><span>${escapeHTML(h.d)}</span></div></div><button class="btn square">Open</button></div>`).join('') || `<div class="empty">No help topics matched your search.</div>`;
    return panelHead('Help & Support','Search common workflows and jump to the right workspace.')+`<div class="top-panel-body"><input class="help-search" data-help-search placeholder="Search help topics" value="${escapeHTML(query)}" />${rows}<div class="top-panel-foot"><button class="btn" data-nav="setup">Getting started</button><button class="btn" data-nav="reports">Open reports</button></div></div>`;
  }
  function renderSettingsPanel(){
    return panelHead('Settings','Open company, accounting, tax, display, and data controls.')+`<div class="top-panel-body"><div class="panel-list">
      <div class="panel-row" data-modal="company"><div class="panel-row-main"><span class="panel-icon">ðŸ¢</span><div><strong>Company profile</strong><span>Name, province, fiscal year, and accounting method.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-modal="invoiceCustomize"><div class="panel-row-main"><span class="panel-icon">â–¤</span><div><strong>Invoice branding</strong><span>Logo, invoice template, message, payment instructions, and print settings.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-nav="accounting"><div class="panel-row-main"><span class="panel-icon">â‰¡</span><div><strong>Chart of accounts</strong><span>Accounts, journal entries, trial balance, and audit log.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-nav="taxes"><div class="panel-row-main"><span class="panel-icon">â—</span><div><strong>Tax settings</strong><span>Tax agencies, rates, returns, adjustments, and payments.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-modal="customize"><div class="panel-row-main"><span class="panel-icon">â˜·</span><div><strong>Customize menu</strong><span>Show, hide, and restore module navigation.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-action="toggle-theme"><div class="panel-row-main"><span class="panel-icon">${state.settings.theme==='dark'?'ðŸŒ™':'â˜€'}</span><div><strong>Appearance</strong><span>Current mode: ${state.settings.theme==='dark'?'Dark':'Light'}.</span></div></div><button class="btn square">Switch</button></div>
      <div class="panel-row" id="exportDataPanel"><div class="panel-row-main"><span class="panel-icon">â‡©</span><div><strong>Backup / export data</strong><span>Download a JSON backup of this browser data.</span></div></div><button class="btn square">Export</button></div>
    </div><div class="top-panel-foot"><button class="btn primary" data-nav="settings">Open Settings page</button></div></div>`;
  }
  function appNotifications(){
    const t=totals(); const bankReview=state.bankTransactions.filter(tx=>tx.status!=='Reviewed').length; const dueBills=state.bills.filter(b=>billOpenAmount(b)>0).length; const unreadTax=t.tax.net>0;
    const list=[
      {id:'n-bank-review', title:'Bank transactions need review', msg:`${bankReview} transaction${bankReview===1?'':'s'} need matching, categorization, or clearing.`, time:'Today', nav:'banking'},
      {id:'n-ar-open', title:'Open receivables', msg:`Customers owe ${money(t.ar)} across open invoices.`, time:'Today', nav:'sales'},
      {id:'n-ap-open', title:'Vendor bills open', msg:`${dueBills} bill${dueBills===1?'':'s'} remain open. Open A/P is ${money(t.ap)}.`, time:'Today', nav:'expenses'},
      {id:'n-tax', title:'Tax center ready', msg: unreadTax ? `Net sales tax payable is ${money(t.tax.net)}.` : 'Tax Center is ready for return review and adjustments.', time:'This week', nav:'taxes'},
      {id:'n-report', title:'Reports updated', msg:'Reports reflect the latest ledger, invoices, bills, bank transactions, and tax records.', time:'This week', nav:'reports'}
    ];
    return list;
  }
  function unreadNotifications(){ const read=new Set(state.settings.readNotifications||[]); return appNotifications().filter(n=>!read.has(n.id)); }
  function updateNotificationBadge(){
    const dot=document.getElementById('notificationDot'); if(!dot) return; const count=unreadNotifications().length; dot.hidden=count===0; dot.textContent=count>9?'9+':String(count);
  }
  function renderNotificationsPanel(){
    const read=new Set(state.settings.readNotifications||[]);
    const rows=appNotifications().map(n=>`<div class="panel-row ${read.has(n.id)?'':'notification-unread'}" data-nav="${n.nav}" data-action="mark-notification-read" data-id="${n.id}"><div class="panel-row-main"><span class="panel-icon">ðŸ””</span><div><strong>${escapeHTML(n.title)}</strong><span>${escapeHTML(n.msg)}</span></div></div><span class="notification-time">${escapeHTML(n.time)}</span></div>`).join('');
    return panelHead('Notifications','Recent reminders and workflow alerts.')+`<div class="top-panel-body"><div class="panel-list">${rows}</div><div class="top-panel-foot"><button class="btn" data-action="mark-all-notifications-read">Mark all read</button><button class="btn primary" data-nav="dashboard">Open dashboard</button></div></div>`;
  }
  function renderProfilePanel(){
    const initials=(state.company.name||'SmartBooks').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'SB';
    return panelHead('User & Company','Manage the current company session and local data.')+`<div class="top-panel-body"><div class="panel-card"><div style="display:flex;align-items:center;gap:12px"><span class="avatar" style="border:0">${escapeHTML(initials.slice(0,2))}</span><div><h4>${escapeHTML(state.company.name||'Your Company')}</h4><p>Signed in as Quak Lee</p></div></div></div><div class="panel-list" style="margin-top:10px">
      <div class="panel-row" data-modal="company"><div class="panel-row-main"><span class="panel-icon">ðŸ¢</span><div><strong>View company profile</strong><span>Company details and accounting basis.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-nav="apps"><div class="panel-row-main"><span class="panel-icon">â˜·</span><div><strong>My Apps</strong><span>Open enabled modules and workflows.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" data-modal="customize"><div class="panel-row-main"><span class="panel-icon">âš™</span><div><strong>Preferences</strong><span>Customize visible modules and dashboard settings.</span></div></div><button class="btn square">Open</button></div>
      <div class="panel-row" id="exportDataProfile"><div class="panel-row-main"><span class="panel-icon">â‡©</span><div><strong>Backup / export data</strong><span>Download a JSON backup before clearing browser data.</span></div></div><button class="btn square">Export</button></div>
      <div class="panel-row" data-action="sign-out-demo"><div class="panel-row-main"><span class="panel-icon">â†ª</span><div><strong>Sign out</strong><span>Close company session on this device.</span></div></div><button class="btn square">Sign out</button></div>
    </div></div>`;
  }
  function bindTopbarPanels(){
    document.querySelectorAll('[data-top-panel]').forEach(btn=>{
      if(btn.dataset.v85Bound==='1') return; btn.dataset.v85Bound='1';
      btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); const type=btn.dataset.topPanel; const panel=document.getElementById('topbarPopover'); if(panel?.classList.contains('open') && panel.dataset.panel===type){ closeTopbarPanel(); } else openTopbarPanel(type); });
    });
  }
  const v85SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v85SetupEventListenersBase(); bindTopbarPanels();
    document.addEventListener('click', (e)=>{
      if(e.target.closest('[data-top-panel]') || e.target.closest('#topbarPopover')) return;
      closeTopbarPanel();
    });
    document.addEventListener('input', (e)=>{
      const search=e.target.closest('[data-help-search]'); if(search){ const panel=ensureTopbarPanel(); panel.innerHTML=renderHelpPanel(search.value); panel.classList.add('open'); panel.dataset.panel='help'; const next=panel.querySelector('[data-help-search]'); if(next){ next.focus(); next.setSelectionRange(next.value.length,next.value.length); } }
    });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeTopbarPanel(); });
    document.addEventListener('click', (e)=>{ if(e.target.closest('#exportDataPanel') || e.target.closest('#exportDataProfile')){ exportData(); closeTopbarPanel(); } });
  };
  const v85HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='close-topbar-panel'){ closeTopbarPanel(); return; }
    if(action==='mark-notification-read'){ state.settings.readNotifications ||= []; if(id && !state.settings.readNotifications.includes(id)) state.settings.readNotifications.push(id); saveState(); updateNotificationBadge(); setTimeout(closeTopbarPanel,120); return v85HandleActionBase(action,id); }
    if(action==='mark-all-notifications-read'){ state.settings.readNotifications = appNotifications().map(n=>n.id); saveState(); updateNotificationBadge(); openTopbarPanel('notifications'); showToast('Notifications marked as read.'); return; }
    if(action==='sign-out-demo'){ closeTopbarPanel(); showToast('Signed out of this local demo session. Your browser data remains available.'); return; }
    const result = v85HandleActionBase(action,id); updateNotificationBadge(); return result;
  };
  const v85NavigateBase = navigate;
  navigate = function(page){ closeTopbarPanel(); return v85NavigateBase(page); };
  const v85OpenModalBase = openModal;
  openModal = function(type){ closeTopbarPanel(); return v85OpenModalBase(type); };
  const v85RenderAllBase = renderAll;
  renderAll = function(){ ensureV85State(); v85RenderAllBase(); bindTopbarPanels(); updateNotificationBadge(); };



  // ---------- V8.6 Help Panel Alignment & Smart Insights Actions ----------
  function injectV86TopbarFixStyles(){
    if(document.getElementById('v86-help-insight-fixes')) return;
    const style=document.createElement('style');
    style.id='v86-help-insight-fixes';
    style.textContent=`
      .top-popover[data-panel="help"]{width:min(560px,calc(100vw - 28px))}
      .top-popover[data-panel="insights"]{width:min(500px,calc(100vw - 28px))}
      .help-topic{display:grid!important;grid-template-columns:40px minmax(0,1fr) 78px;align-items:center;column-gap:12px;cursor:pointer}
      .help-topic .panel-row-main{display:contents!important}
      .help-topic .panel-icon{grid-column:1;grid-row:1;align-self:center}
      .help-topic .panel-row-main>div{grid-column:2;grid-row:1;min-width:0;align-self:center}
      .help-topic .panel-row-main strong{display:block;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25;margin-bottom:2px}
      .help-topic .panel-row-main span{display:block;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.35;max-width:100%}
      .help-topic .btn{grid-column:3;grid-row:1;justify-self:end;min-width:70px;width:70px;flex:0 0 auto;position:static!important}
      .insight-card{position:relative;display:grid;gap:8px}
      .insight-card .panel-card-head{display:flex;align-items:center;gap:10px;min-width:0}
      .insight-card .panel-card-head h4{margin:0;line-height:1.25}
      .insight-card .insight-meta{font-size:12px;color:#667085;margin-top:-2px}
      .insight-card .insight-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}
      body.v8-ui.dark-mode .insight-card .insight-meta{color:#aebed0}
      @media(max-width:520px){.help-topic{grid-template-columns:36px minmax(0,1fr);row-gap:8px}.help-topic .btn{grid-column:2;grid-row:2;justify-self:start;width:auto}.top-popover[data-panel="help"],.top-popover[data-panel="insights"]{right:10px;width:calc(100vw - 20px)}}
    `;
    document.head.appendChild(style);
  }

  const v86EnsureV85StateBase = ensureV85State;
  ensureV85State = function(){
    v86EnsureV85StateBase();
    injectV86TopbarFixStyles();
  };

  function moduleHiddenPanelMessage(page){
    const label = typeof moduleLabel === 'function' ? moduleLabel(page) : page;
    return `${label} is hidden. Restore it from Customize menu to open this insight.`;
  }

  function setInvoiceFilter(status='all'){
    if(typeof getInvoiceCenterFilters === 'function'){
      const f=getInvoiceCenterFilters();
      f.status=status; f.customerId='all'; f.range='all'; f.sort=status==='overdue'?'due-asc':'date-desc';
    } else {
      state.settings.invoiceCenterFilters={status, customerId:'all', range:'all', sort:status==='overdue'?'due-asc':'date-desc'};
    }
    state.settings.salesTab='invoices';
  }

  function openPanelTarget(target){
    if(!target) return;
    const page=target.page || target.nav || 'dashboard';
    const required=target.module || page;
    if(typeof canNavigate === 'function' && !canNavigate(page)){
      showToast(moduleHiddenPanelMessage(required));
      closeTopbarPanel();
      return;
    }
    if(target.salesTab) state.settings.salesTab=target.salesTab;
    if(target.expenseTab) state.settings.expenseTab=target.expenseTab;
    if(target.inventoryTab) state.settings.inventoryTab=target.inventoryTab;
    if(target.reportId){ state.settings.activeReportId=target.reportId; state.settings.reportMenuId=null; }
    if(target.reportFilter){ state.settings.reportFilter=target.reportFilter; state.settings.activeReportId=null; }
    if(target.invoiceStatus) setInvoiceFilter(target.invoiceStatus);
    saveState();
    navigate(page);
    if(target.toast) showToast(target.toast);
  }

  function insightTargets(){
    return {
      balanced:{page:'accounting', module:'accounting', toast:'Accounting Center opened.'},
      overdue:{page:'sales', module:'sales', invoiceStatus:'overdue', toast:'Invoice Center opened with overdue invoices.'},
      bank:{page:'banking', module:'banking', toast:'Banking review center opened.'},
      cash:{page:'banking', module:'banking', toast:'Cash flow and bank position opened.'},
      ap:{page:'expenses', module:'expenses', expenseTab:'bills', toast:'Bills & A/P opened.'},
      stock:{page:'inventory', module:'inventory', inventoryTab:'products', toast:'Products & Services opened with inventory products.'},
      match:{page:'inventory', module:'inventory', inventoryTab:'matching', toast:'3-way match review opened.'},
      taxes:{page:'taxes', module:'taxes', toast:'Tax Center opened.'},
      reports:{page:'reports', module:'reports', reportId:'profit-loss', toast:'Profit and Loss report opened.'}
    };
  }

  smartInsights = function(){
    const t=totals();
    const bankReview=state.bankTransactions.filter(tx=>tx.status!=='Reviewed' && tx.status!=='Matched').length;
    const overdueInvoices=state.invoices.filter(i=>openAmount(i)>0 && (i.status==='Overdue' || new Date(i.dueDate)<new Date(todayISO()))).length;
    const dueBills=state.bills.filter(b=>billOpenAmount(b)>0).length;
    const lowStock=(state.products||[]).filter(p=>String(p.type||'').toLowerCase()==='inventory' && num(p.qty)<=num(p.reorderPoint||2)).length;
    const matchIssues=(state.purchaseOrders||[]).filter(po=>po.status && !['Closed','Received'].includes(po.status)).length;
    const taxNet=t.tax?.net ?? salesTaxSummary().net;
    return [
      {id:'balanced', icon:'â–£', title:'Accounting done', msg:`Trial balance is ${Math.abs(trialBalance().difference)<0.01?'balanced':'out of balance'}. ${bankReview} bank transaction${bankReview===1?'':'s'} need review.`, label:'Open accounting', module:'accounting'},
      {id:'overdue', icon:'!', title:'Overdue invoices', msg: overdueInvoices ? `${overdueInvoices} invoice${overdueInvoices===1?'':'s'} need follow-up. Open receivables are ${money(t.ar)}.` : `Open receivables are ${money(t.ar)}. No overdue invoice follow-up is currently flagged.`, label:'Review invoices', module:'sales'},
      {id:'bank', icon:'â—‰', title:'Banking review', msg: bankReview ? `${bankReview} bank transaction${bankReview===1?'':'s'} need matching, clearing, or categorization.` : 'Bank feed is reviewed. Reconciliation remains available from Banking.', label:'Review banking', module:'banking'},
      {id:'cash', icon:'â†—', title:'Cash flow insight', msg:`Current bank position is ${money(t.bank)}. Net cash flow is based on recorded payments, deposits, expenses, and bill payments.`, label:'View banking', module:'banking'},
      {id:'ap', icon:'â–¡', title:'Bills due', msg: dueBills ? `${dueBills} vendor bill${dueBills===1?'':'s'} remain open. Open A/P is ${money(t.ap)}.` : 'No open vendor bills need payment.', label:'Open bills', module:'expenses'},
      {id:'taxes', icon:'â—–', title:'Tax return review', msg: taxNet>0 ? `Net sales tax payable is ${money(taxNet)}. Review returns, payments, and adjustments.` : 'Tax Center is ready for return review, input tax credits, and adjustments.', label:'Open taxes', module:'taxes'},
      {id:'stock', icon:'â—¼', title:'Inventory attention', msg: lowStock ? `${lowStock} inventory item${lowStock===1?'':'s'} are at or below reorder point.` : 'Inventory stock levels do not show reorder alerts.', label:'Products & Services', module:'inventory'},
      {id:'match', icon:'â‡„', title:'Purchase matching', msg: matchIssues ? `${matchIssues} purchase order${matchIssues===1?'':'s'} may need receiving, billing, or matching review.` : 'Purchase orders, receiving, and bill matching are in good shape.', label:'3-way match', module:'inventory'}
    ];
  };

  renderInsightsPanel = function(){
    const visibleInsights = smartInsights().filter(x => !x.module || typeof isModuleVisible !== 'function' || isModuleVisible(x.module) || ['dashboard','settings'].includes(x.module));
    const rows=(visibleInsights.length?visibleInsights:smartInsights()).slice(0,8).map(x=>`<div class="panel-card insight-card" data-action="open-insight" data-id="${x.id}"><div class="panel-card-head"><span class="panel-icon">${escapeHTML(x.icon)}</span><h4>${escapeHTML(x.title)}</h4></div><p>${escapeHTML(x.msg)}</p><div class="insight-actions"><button class="btn primary" data-action="open-insight" data-id="${x.id}">${escapeHTML(x.label)}</button></div></div>`).join('');
    return panelHead('Smart Insights','Action cards based on invoices, bills, banking, tax, and inventory data.')+`<div class="top-panel-body"><div class="panel-list">${rows}</div><div class="top-panel-foot"><button class="btn" data-action="open-help-topic" data-id="dashboard">Open dashboard</button><button class="btn" data-modal="customizeDashboard">Customize dashboard</button></div></div>`;
  };

  function helpTopicsV86(){ return [
    {id:'getting-started', t:'Getting started', d:'Set up your company profile, menu modules, invoice branding, and tax settings.', target:{page:'setup', module:'setup', toast:'Setup Checklist opened.'}},
    {id:'dashboard', t:'Dashboard', d:'Use Business Feed, create actions, and widgets to review key work.', target:{page:'dashboard', module:'dashboard'}},
    {id:'invoices', t:'Invoices and payments', d:'Create invoices, send reminders, receive payments, and print or save PDF invoices.', target:{page:'sales', module:'sales', salesTab:'invoices', invoiceStatus:'all', toast:'Invoice Center opened.'}},
    {id:'banking', t:'Banking and reconciliation', d:'Review bank-feed transactions, match deposits, clear items, and reconcile accounts.', target:{page:'banking', module:'banking'}},
    {id:'reports', t:'Reports', d:'Search, favorite, open, print, and export report details.', target:{page:'reports', module:'reports', reportId:'profit-loss'}},
    {id:'products-services', t:'Products & Services', d:'Choose service, product, non-inventory, or bundle item types and manage PO/SO workflows.', target:{page:'inventory', module:'inventory', inventoryTab:'overview'}},
    {id:'taxes', t:'Taxes', d:'Review tax codes, tax agencies, returns, input tax credits, and tax payments.', target:{page:'taxes', module:'taxes'}},
    {id:'keyboard', t:'Keyboard shortcuts', d:'Esc closes popovers and modals. Use global search to find contacts, transactions, reports, or help topics.', target:{page:'dashboard', module:'dashboard', toast:'Tip: press Esc to close popovers and modals.'}}
  ]; }

  helpTopics = function(){ return helpTopicsV86().map(h=>({t:h.t,d:h.d,nav:h.target.page,id:h.id,target:h.target})); };

  renderHelpPanel = function(query=''){
    const q=String(query||'').trim().toLowerCase();
    const topics=helpTopicsV86().filter(h=>!q || `${h.t} ${h.d}`.toLowerCase().includes(q));
    const rows=topics.map(h=>`<div class="panel-row help-topic" data-action="open-help-topic" data-id="${h.id}"><div class="panel-row-main"><span class="panel-icon">?</span><div><strong>${escapeHTML(h.t)}</strong><span>${escapeHTML(h.d)}</span></div></div><button class="btn square" type="button" data-action="open-help-topic" data-id="${h.id}">Open</button></div>`).join('') || `<div class="empty">No help topics matched your search.</div>`;
    return panelHead('Help & Support','Search common workflows and jump to the right workspace.')+`<div class="top-panel-body"><input class="help-search" data-help-search placeholder="Search help topics" value="${escapeHTML(query)}" />${rows}<div class="top-panel-foot"><button class="btn" data-action="open-help-topic" data-id="getting-started">Getting started</button><button class="btn" data-action="open-help-topic" data-id="reports">Open reports</button></div></div>`;
  };

  function openHelpTopic(id){
    const topic=helpTopicsV86().find(h=>h.id===id) || helpTopicsV86()[0];
    openPanelTarget(topic.target);
  }
  function openInsight(id){
    const target=insightTargets()[id];
    if(!target){ showToast('Insight action is not available yet.'); closeTopbarPanel(); return; }
    openPanelTarget(target);
  }

  const v86HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='open-help-topic'){ openHelpTopic(id); return; }
    if(action==='open-insight'){ openInsight(id); return; }
    return v86HandleActionBase(action,id);
  };

  const v86RenderAllBase = renderAll;
  renderAll = function(){ ensureV85State(); v86RenderAllBase(); };


  // ---------- V8.7 Top Panel Layout & Interaction Polish ----------
  function injectV87PanelPolishStyles(){
    if(document.getElementById('v87-panel-polish-styles')) return;
    const style=document.createElement('style');
    style.id='v87-panel-polish-styles';
    style.textContent=`
      .top-popover{
        width:min(520px,calc(100vw - 36px))!important;
        max-width:calc(100vw - 36px)!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        box-sizing:border-box;
      }
      .top-popover[data-panel="help"],
      .top-popover[data-panel="settings"],
      .top-popover[data-panel="insights"],
      .top-popover[data-panel="notifications"],
      .top-popover[data-panel="profile"]{
        width:min(560px,calc(100vw - 36px))!important;
      }
      .top-panel-body,.top-panel-head,.panel-list{min-width:0;max-width:100%;box-sizing:border-box;overflow-x:hidden}
      .top-popover .panel-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto;
        align-items:center;
        column-gap:12px;
        width:100%;
        max-width:100%;
        min-width:0;
        overflow:hidden;
      }
      .top-popover .panel-row-main{min-width:0;max-width:100%;display:flex;align-items:center;gap:10px;overflow:hidden}
      .top-popover .panel-row-main>div{min-width:0;max-width:100%;overflow:hidden}
      .top-popover .panel-row-main>div strong,
      .top-popover .panel-row-main>div span{
        display:block;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
        line-height:1.35;
        max-width:100%;
      }
      .top-popover .panel-row-main>div strong{line-height:1.25;margin-bottom:2px}
      .top-popover .panel-row .btn{justify-self:end;flex:0 0 auto;position:static!important}
      .top-popover .panel-icon,
      .help-topic .panel-icon{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        flex:0 0 38px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        line-height:1!important;
        margin:0!important;
        padding:0!important;
        text-align:center!important;
        vertical-align:middle!important;
        box-sizing:border-box!important;
      }
      .top-popover .panel-icon svg,
      .top-popover .panel-icon i,
      .top-popover .panel-icon span{margin:0!important;display:block!important;line-height:1!important}
      .help-topic{
        grid-template-columns:38px minmax(0,1fr) 78px!important;
        column-gap:12px!important;
        cursor:pointer!important;
      }
      .help-topic .panel-row-main{display:contents!important}
      .help-topic .panel-row-main>div{grid-column:2;grid-row:1;align-self:center;min-width:0}
      .help-topic .panel-icon{grid-column:1;grid-row:1;align-self:center;justify-self:center}
      .help-topic .btn{grid-column:3;grid-row:1;min-width:70px;width:70px;justify-self:end}
      .panel-row[data-nav],
      .panel-row[data-modal],
      .panel-row[data-action]:not([data-action="sign-out-demo"]),
      .panel-row.help-topic,
      .panel-card.insight-card,
      .module-pill,
      .feed-card,
      .report-row,
      .nav-item,
      .rail-btn{cursor:pointer}
      .panel-row[data-nav]:hover,
      .panel-row[data-modal]:hover,
      .panel-row[data-action]:not([data-action="sign-out-demo"]):hover,
      .panel-row.help-topic:hover,
      .panel-card.insight-card:hover{
        transform:translateY(-1px);
        box-shadow:0 8px 18px rgba(16,24,40,.08);
      }
      body.v8-ui.dark-mode .panel-row[data-nav]:hover,
      body.v8-ui.dark-mode .panel-row[data-modal]:hover,
      body.v8-ui.dark-mode .panel-row[data-action]:not([data-action="sign-out-demo"]):hover,
      body.v8-ui.dark-mode .panel-row.help-topic:hover,
      body.v8-ui.dark-mode .panel-card.insight-card:hover{
        box-shadow:0 10px 24px rgba(0,0,0,.26);
      }
      #exportDataPanel,#exportDataProfile,.panel-row[data-action="sign-out-demo"]{cursor:default!important}
      #exportDataPanel .btn,#exportDataProfile .btn,.panel-row[data-action="sign-out-demo"] .btn{cursor:pointer!important}
      .panel-row:focus-visible,.panel-card.insight-card:focus-visible{
        outline:3px solid rgba(10,143,60,.32);
        outline-offset:2px;
      }
      @media(max-width:620px){
        .top-popover,.top-popover[data-panel]{right:10px!important;width:calc(100vw - 20px)!important;max-width:calc(100vw - 20px)!important}
        .top-popover .panel-row{grid-template-columns:minmax(0,1fr);row-gap:10px}
        .top-popover .panel-row .btn{justify-self:start}
        .help-topic{grid-template-columns:38px minmax(0,1fr)!important;row-gap:8px!important}
        .help-topic .btn{grid-column:2!important;grid-row:2!important;width:auto!important;justify-self:start!important}
      }
    `;
    document.head.appendChild(style);
  }

  function isButtonOnlyPanelRow(row){
    return !!row && (row.id==='exportDataPanel' || row.id==='exportDataProfile' || row.dataset.action==='sign-out-demo' || row.classList.contains('button-only-panel-row'));
  }
  function isClickablePanelRow(row){
    return !!row && !isButtonOnlyPanelRow(row) && (row.matches('[data-nav],[data-modal],[data-action]') || row.classList.contains('help-topic'));
  }
  function applyV87PanelInteractions(){
    injectV87PanelPolishStyles();
    const panel=document.getElementById('topbarPopover');
    if(!panel) return;
    panel.querySelectorAll('.panel-row').forEach(row=>{
      if(isClickablePanelRow(row)){
        row.classList.add('clickable-panel-row');
        row.setAttribute('role','button');
        row.setAttribute('tabindex','0');
      }else{
        row.classList.remove('clickable-panel-row');
        row.removeAttribute('role');
        row.removeAttribute('tabindex');
      }
    });
    panel.querySelectorAll('.insight-card').forEach(card=>{
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
    });
  }

  const v87EnsureV85StateBase = ensureV85State;
  ensureV85State = function(){
    v87EnsureV85StateBase();
    injectV87PanelPolishStyles();
  };

  const v87OpenTopbarPanelBase = openTopbarPanel;
  openTopbarPanel = function(type){
    v87OpenTopbarPanelBase(type);
    applyV87PanelInteractions();
  };

  const v87RenderSettingsPanelBase = renderSettingsPanel;
  renderSettingsPanel = function(){
    const html = v87RenderSettingsPanelBase();
    setTimeout(applyV87PanelInteractions,0);
    return html;
  };

  const v87RenderHelpPanelBase = renderHelpPanel;
  renderHelpPanel = function(query=''){
    const html = v87RenderHelpPanelBase(query);
    setTimeout(applyV87PanelInteractions,0);
    return html;
  };

  const v87RenderInsightsPanelBase = renderInsightsPanel;
  renderInsightsPanel = function(){
    const html = v87RenderInsightsPanelBase();
    setTimeout(applyV87PanelInteractions,0);
    return html;
  };

  const v87RenderNotificationsPanelBase = renderNotificationsPanel;
  renderNotificationsPanel = function(){
    const html = v87RenderNotificationsPanelBase();
    setTimeout(applyV87PanelInteractions,0);
    return html;
  };

  const v87RenderProfilePanelBase = renderProfilePanel;
  renderProfilePanel = function(){
    const html = v87RenderProfilePanelBase();
    setTimeout(applyV87PanelInteractions,0);
    return html;
  };

  document.addEventListener('click', function(e){
    const row=e.target.closest('#exportDataPanel,#exportDataProfile,.panel-row[data-action="sign-out-demo"],.button-only-panel-row');
    if(row && !e.target.closest('button,.btn')){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ') return;
    const row=e.target.closest('.clickable-panel-row,.insight-card');
    if(!row || !document.getElementById('topbarPopover')?.contains(row)) return;
    if(e.target.closest('button,input,select,textarea,a')) return;
    e.preventDefault();
    row.click();
  });

  const v87RenderAllBase = renderAll;
  renderAll = function(){
    injectV87PanelPolishStyles();
    v87RenderAllBase();
    applyV87PanelInteractions();
  };



  // ---------- V8.8 Smart Insights Rendering Fix ----------
  function injectV88InsightsStyles(){
    if(document.getElementById('v88-insights-rendering-styles')) return;
    const style=document.createElement('style');
    style.id='v88-insights-rendering-styles';
    style.textContent=`
      .top-popover[data-panel="insights"] .top-panel-body{padding:14px 16px 16px}
      .top-popover[data-panel="insights"] .panel-list{display:grid;gap:12px}
      .top-popover[data-panel="insights"] .insight-card{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px 12px;align-items:start;padding:14px;border-radius:16px;cursor:pointer;min-height:92px}
      .top-popover[data-panel="insights"] .insight-card .panel-icon{grid-column:1;grid-row:1 / span 2;width:38px!important;height:38px!important;min-width:38px!important;display:flex!important;align-items:center!important;justify-content:center!important;line-height:1!important}
      .top-popover[data-panel="insights"] .insight-content{grid-column:2;min-width:0}
      .top-popover[data-panel="insights"] .insight-content h4{margin:0 0 4px;font-size:15px;line-height:1.25;color:#101828}
      .top-popover[data-panel="insights"] .insight-content p{margin:0;color:#526172;line-height:1.38;white-space:normal;overflow-wrap:anywhere}
      .top-popover[data-panel="insights"] .insight-actions{grid-column:2;display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}
      .top-popover[data-panel="insights"] .insight-card:hover{background:#f7fbff;border-color:#bfd7ee;transform:translateY(-1px);box-shadow:0 10px 24px rgba(16,24,40,.10)}
      .insight-count-dot{position:absolute;right:4px;top:4px;min-width:16px;height:16px;border-radius:999px;background:#0a8f3c;color:#fff;font-size:10px;line-height:16px;text-align:center;font-weight:900;border:2px solid #fff;padding:0 3px;pointer-events:none}
      body.v8-ui.dark-mode .top-popover[data-panel="insights"] .insight-content h4{color:#f8fafc}
      body.v8-ui.dark-mode .top-popover[data-panel="insights"] .insight-content p{color:#cbd5e1}
      body.v8-ui.dark-mode .top-popover[data-panel="insights"] .insight-card:hover{background:#26364d;border-color:#47627f;box-shadow:0 12px 28px rgba(0,0,0,.30)}
      body.v8-ui.dark-mode .insight-count-dot{border-color:#0f172a;background:#22c55e;color:#052e16}
      @media(max-width:520px){.top-popover[data-panel="insights"] .insight-card{grid-template-columns:38px minmax(0,1fr)}.top-popover[data-panel="insights"] .insight-actions{grid-column:1 / -1}}
    `;
    document.head.appendChild(style);
  }

  function safeV88Array(value){ return Array.isArray(value) ? value : []; }
  function safeV88Money(value){ try { return money(num(value)); } catch(e){ return '$0.00'; } }
  function getV88InsightData(){
    const data={t:{ar:0,ap:0,bank:0,tax:{net:0}},bankReview:0,openInvoices:0,overdueInvoices:0,dueBills:0,lowStock:0,matchIssues:0,taxNet:0,tbDiff:0};
    try { data.t = totals() || data.t; } catch(e) {}
    try { data.bankReview = safeV88Array(state.bankTransactions).filter(tx=>tx.status!=='Reviewed' && tx.status!=='Matched').length; } catch(e) {}
    try { data.openInvoices = safeV88Array(state.invoices).filter(i=>openAmount(i)>0).length; } catch(e) {}
    try { data.overdueInvoices = safeV88Array(state.invoices).filter(i=>openAmount(i)>0 && (i.status==='Overdue' || new Date(i.dueDate)<new Date(todayISO()))).length; } catch(e) {}
    try { data.dueBills = safeV88Array(state.bills).filter(b=>billOpenAmount(b)>0).length; } catch(e) {}
    try { data.lowStock = safeV88Array(state.products).filter(p=>String(p.type||'').toLowerCase()==='inventory' && num(p.qty)<=num(p.reorderPoint||2)).length; } catch(e) {}
    try { data.matchIssues = safeV88Array(state.purchaseOrders).filter(po=>po.status && !['Closed','Received'].includes(po.status)).length; } catch(e) {}
    try { data.taxNet = (data.t.tax && typeof data.t.tax.net!=='undefined') ? data.t.tax.net : salesTaxSummary().net; } catch(e) {}
    try { data.tbDiff = Math.abs(trialBalance().difference || 0); } catch(e) {}
    return data;
  }

  function v88InsightDefinitions(){
    const d=getV88InsightData();
    return [
      {id:'bank', module:'banking', icon:'â—‰', title:'Bank transactions need review', msg:d.bankReview ? `${d.bankReview} transaction${d.bankReview===1?'':'s'} need matching, categorization, or clearing.` : 'Bank feed is reviewed. Reconciliation remains available from Banking.', label:'Review banking'},
      {id:'overdue', module:'sales', icon:'!', title:d.overdueInvoices ? 'Overdue invoices' : 'Open receivables', msg:d.overdueInvoices ? `${d.overdueInvoices} invoice${d.overdueInvoices===1?'':'s'} need follow-up. Open receivables are ${safeV88Money(d.t.ar)}.` : `Customers owe ${safeV88Money(d.t.ar)} across ${d.openInvoices} open invoice${d.openInvoices===1?'':'s'}.`, label:'Review invoices'},
      {id:'ap', module:'expenses', icon:'â–¡', title:'Vendor bills open', msg:d.dueBills ? `${d.dueBills} vendor bill${d.dueBills===1?'':'s'} remain open. Open A/P is ${safeV88Money(d.t.ap)}.` : 'No open vendor bills need payment.', label:'Review bills'},
      {id:'taxes', module:'taxes', icon:'â—–', title:'Tax return attention', msg:d.taxNet>0 ? `Net sales tax payable is ${safeV88Money(d.taxNet)}. Review returns, payments, and adjustments.` : 'Tax Center is ready for return review, input tax credits, and adjustments.', label:'Open taxes'},
      {id:'stock', module:'inventory', icon:'â—¼', title:'Inventory attention', msg:d.lowStock ? `${d.lowStock} inventory item${d.lowStock===1?'':'s'} are at or below reorder point.` : 'Inventory stock levels do not show reorder alerts.', label:'Review inventory'},
      {id:'match', module:'inventory', icon:'â‡„', title:'Purchase matching', msg:d.matchIssues ? `${d.matchIssues} purchase order${d.matchIssues===1?'':'s'} may need receiving, billing, or matching review.` : 'Purchase orders, receiving, and bill matching are in good shape.', label:'Open matching'},
      {id:'balanced', module:'accounting', icon:'â–£', title:'Accounting check', msg:`Trial balance is ${d.tbDiff<0.01?'balanced':'out of balance'}. ${d.bankReview} bank transaction${d.bankReview===1?'':'s'} need review.`, label:'Open accounting'},
      {id:'cash', module:'banking', icon:'â†—', title:'Cash flow insight', msg:`Current bank position is ${safeV88Money(d.t.bank)}. Net cash flow is based on recorded payments, deposits, expenses, and bill payments.`, label:'View banking'}
    ];
  }

  smartInsights = function(){ return v88InsightDefinitions(); };

  function v88VisibleInsights(){
    const list=v88InsightDefinitions();
    const visible=list.filter(x=>!x.module || typeof isModuleVisible!=='function' || isModuleVisible(x.module) || ['dashboard','settings'].includes(x.module));
    return visible.length ? visible : list;
  }

  renderInsightsPanel = function(){
    injectV88InsightsStyles();
    let rows='';
    try {
      rows = v88VisibleInsights().slice(0,8).map(x=>`<div class="panel-card insight-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><span class="panel-icon">${escapeHTML(x.icon)}</span><div class="insight-content"><h4>${escapeHTML(x.title)}</h4><p>${escapeHTML(x.msg)}</p></div><div class="insight-actions"><button class="btn primary" type="button" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div></div>`).join('');
    } catch(e) {
      rows='';
    }
    if(!rows){
      rows = `<div class="panel-card"><h4>No urgent insights right now</h4><p>Your business data looks up to date. Use the dashboard or reports to review details anytime.</p><button class="btn primary" type="button" data-nav="dashboard">Open dashboard</button></div>`;
    }
    return panelHead('Smart Insights','Action cards based on invoices, bills, banking, tax, and inventory data.')+`<div class="top-panel-body"><div class="panel-list">${rows}</div><div class="top-panel-foot"><button class="btn" type="button" data-nav="dashboard">Open dashboard</button><button class="btn" type="button" data-modal="customizeDashboard">Customize dashboard</button></div></div>`;
  };

  function updateInsightsBadge(){
    const btn=document.getElementById('insightsBtn');
    if(!btn) return;
    injectV88InsightsStyles();
    let count=0;
    try {
      const d=getV88InsightData();
      count = (d.bankReview?1:0) + (d.overdueInvoices?1:0) + (d.dueBills?1:0) + (d.taxNet>0?1:0) + (d.lowStock?1:0) + (d.matchIssues?1:0) + (d.tbDiff>=0.01?1:0);
    } catch(e) { count=0; }
    let dot=btn.querySelector('.insight-count-dot');
    if(count>0){
      if(!dot){ dot=document.createElement('span'); dot.className='insight-count-dot'; btn.style.position='relative'; btn.appendChild(dot); }
      dot.textContent=count>9?'9+':String(count);
      dot.hidden=false;
    } else if(dot){ dot.hidden=true; }
  }

  const v88OpenTopbarPanelBase = openTopbarPanel;
  openTopbarPanel = function(type){
    ensureV85State();
    if(type==='insights'){
      injectV88InsightsStyles();
      const panel=ensureTopbarPanel();
      panel.dataset.panel='insights';
      panel.innerHTML=renderInsightsPanel();
      panel.classList.add('open');
      updateInsightsBadge();
      if(typeof applyV87PanelInteractions==='function') setTimeout(applyV87PanelInteractions,0);
      return;
    }
    return v88OpenTopbarPanelBase(type);
  };

  function openInsight(id){
    const targets={
      bank:{page:'banking', module:'banking', toast:'Banking review center opened.'},
      overdue:{page:'sales', module:'sales', invoiceStatus:'overdue', salesTab:'invoices', toast:'Invoice Center opened.'},
      ap:{page:'expenses', module:'expenses', expenseTab:'bills', toast:'Bills & A/P opened.'},
      taxes:{page:'taxes', module:'taxes', toast:'Tax Center opened.'},
      stock:{page:'inventory', module:'inventory', inventoryTab:'products', toast:'Products & Services opened.'},
      match:{page:'inventory', module:'inventory', inventoryTab:'matching', toast:'3-way match review opened.'},
      balanced:{page:'accounting', module:'accounting', toast:'Accounting Center opened.'},
      cash:{page:'banking', module:'banking', toast:'Cash flow and bank position opened.'}
    };
    const target=targets[id];
    if(!target){ showToast('Insight action is not available.'); closeTopbarPanel(); return; }
    openPanelTarget(target);
  }

  const v88HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='open-insight'){ openInsight(id); return; }
    return v88HandleActionBase(action,id);
  };

  const v88SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v88SetupEventListenersBase();
    const btn=document.getElementById('insightsBtn');
    if(btn && btn.dataset.v88Bound!=='1'){
      btn.dataset.v88Bound='1';
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        const panel=document.getElementById('topbarPopover');
        if(panel?.classList.contains('open') && panel.dataset.panel==='insights') closeTopbarPanel();
        else openTopbarPanel('insights');
      });
    }
    updateInsightsBadge();
  };

  const v88RenderAllBase = renderAll;
  renderAll = function(){
    injectV88InsightsStyles();
    v88RenderAllBase();
    updateInsightsBadge();
  };


  // ---------- V8.9 Smart Insights Click + Badge Fix ----------
  function injectV89SmartInsightsFixStyles(){
    if(document.getElementById('v89-smart-insights-fix-styles')) return;
    const style=document.createElement('style');
    style.id='v89-smart-insights-fix-styles';
    style.textContent=`
      #insightsBtn{position:relative!important;overflow:visible!important;display:grid!important;place-items:center!important;cursor:pointer!important;}
      #insightsBtn .top-icon-symbol{grid-area:1/1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:1;pointer-events:none;}
      #insightsBtn .insight-count-dot{grid-area:1/1;justify-self:end;align-self:start;position:relative!important;right:auto!important;top:auto!important;transform:translate(4px,-4px);z-index:3;min-width:17px;height:17px;border-radius:999px;background:#0a8f3c;color:#fff;font-size:10px;line-height:17px;text-align:center;font-weight:900;border:2px solid #fff;padding:0 3px;pointer-events:none;box-sizing:border-box;}
      .notification-btn{overflow:visible!important;}
      .notification-dot{pointer-events:none!important;}
      .top-popover[data-panel="insights"]{display:none;}
      .top-popover[data-panel="insights"].open{display:block;}
      .top-popover[data-panel="insights"] .panel-list{min-height:1px;}
      .top-popover[data-panel="insights"] .insight-card{cursor:pointer;}
      body.v8-ui.dark-mode #insightsBtn .insight-count-dot{border-color:#0f172a;background:#22c55e;color:#052e16;}
    `;
    document.head.appendChild(style);
  }

  function normalizeV89InsightsButton(){
    injectV89SmartInsightsFixStyles();
    const btn=document.getElementById('insightsBtn');
    if(!btn) return;
    const existingDot=btn.querySelector('.insight-count-dot');
    const existingCount=existingDot && !existingDot.hidden ? existingDot.textContent : '';
    btn.innerHTML='<span class="top-icon-symbol" aria-hidden="true">âœ¦</span>';
    if(existingDot){
      existingDot.textContent=existingCount;
      btn.appendChild(existingDot);
    }
    btn.setAttribute('title','Smart Insights');
    btn.setAttribute('aria-label','Open Smart Insights');
  }

  const v89UpdateInsightsBadgeBase = updateInsightsBadge;
  updateInsightsBadge = function(){
    injectV89SmartInsightsFixStyles();
    normalizeV89InsightsButton();
    const btn=document.getElementById('insightsBtn');
    if(!btn) return;
    let count=0;
    try {
      const d=getV88InsightData();
      count = (d.bankReview?1:0) + (d.overdueInvoices?1:0) + (d.dueBills?1:0) + (d.taxNet>0?1:0) + (d.lowStock?1:0) + (d.matchIssues?1:0) + (d.tbDiff>=0.01?1:0);
    } catch(e) { count=0; }
    let dot=btn.querySelector('.insight-count-dot');
    if(count>0){
      if(!dot){ dot=document.createElement('span'); dot.className='insight-count-dot'; btn.appendChild(dot); }
      dot.textContent=count>9?'9+':String(count);
      dot.hidden=false;
    } else if(dot){ dot.hidden=true; }
  };

  const v89OpenTopbarPanelBase = openTopbarPanel;
  openTopbarPanel = function(type){
    injectV89SmartInsightsFixStyles();
    if(type==='insights'){
      const panel=ensureTopbarPanel();
      panel.dataset.panel='insights';
      panel.innerHTML=renderInsightsPanel();
      panel.classList.add('open');
      panel.style.overflowX='hidden';
      updateInsightsBadge();
      if(typeof applyV87PanelInteractions==='function') setTimeout(applyV87PanelInteractions,0);
      return;
    }
    return v89OpenTopbarPanelBase(type);
  };

  function bindV89InsightsButton(){
    injectV89SmartInsightsFixStyles();
    normalizeV89InsightsButton();
    const btn=document.getElementById('insightsBtn');
    if(!btn || btn.dataset.v89Bound==='1') return;
    btn.dataset.v89Bound='1';
    // Use capture + stopImmediatePropagation so older duplicate bubble handlers cannot open then immediately close the panel.
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const panel=document.getElementById('topbarPopover');
      if(panel?.classList.contains('open') && panel.dataset.panel==='insights') closeTopbarPanel();
      else openTopbarPanel('insights');
    }, true);
  }

  const v89SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v89SetupEventListenersBase();
    bindV89InsightsButton();
    updateInsightsBadge();
  };

  const v89RenderAllBase = renderAll;
  renderAll = function(){
    injectV89SmartInsightsFixStyles();
    v89RenderAllBase();
    bindV89InsightsButton();
    updateInsightsBadge();
  };



  // ---------- V8.10 Calculation Consistency & Source-of-Truth Fix ----------
  function ensureV810State(){
    try { if(typeof ensureV85State==='function') ensureV85State(); } catch(e) {}
    state.settings ||= {};
    state.settings.reportStartDate ||= '2026-05-01';
    state.settings.reportEndDate ||= todayISO();
    // The seeded historical tax payment belongs to a prior filed return. Keep it in tax history,
    // but do not force it into current-period banking unless the user records a new tax payment.
    (state.taxPayments||[]).forEach(p=>{
      if(p.id==='TAXPAY-1001' && !p.openingTreatment) p.openingTreatment='Prior-period tax remittance in tax history';
    });
    state.auditTrail = (state.auditTrail||[]).map(a=>({...a, action:v810CleanCopy(a.action)}));
  }

  function v810CleanCopy(value){
    return String(value ?? '')
      .replace(/\bV\d+(?:\.\d+)?\s*(?:rule|prototype|active|adds|calculates|initialized|demo)?\s*:?\s*/gi,'')
      .replace(/\bYour Company\s*-\s*V\d+(?:\.\d+)?\b/gi,'Your Company')
      .replace(/\s{2,}/g,' ')
      .trim();
  }

  function calculateTaxSummary(opts={}){
    const start = opts.start || null, end = opts.end || null, agencyId = opts.agencyId || null;
    const collected = taxableSales(start,end,agencyId);
    const itc = recoverablePurchases(start,end,agencyId);
    const adjustments = taxAdjustmentsTotal(start,end,agencyId);
    const payments = taxPaymentsTotal(start,end,agencyId);
    const beforePayments = collected - itc + adjustments;
    const balance = beforePayments - payments;
    const absBalance = Math.abs(balance);
    return {
      collected, itc, adjustments, payments,
      net: beforePayments, beforePayments, balance, absBalance,
      status: balance > 0.009 ? 'Payable' : balance < -0.009 ? 'Credit / refund' : 'Balanced',
      balanceLabel: balance > 0.009 ? 'Net tax payable' : balance < -0.009 ? 'Net tax credit / refund' : 'Net tax balance',
      balanceMessage: balance > 0.009
        ? `Net tax payable is ${money(balance)} after recorded payments.`
        : balance < -0.009
          ? `Net tax credit / refund is ${money(absBalance)} after recorded payments.`
          : 'Tax balance is up to date after recorded payments.'
    };
  }

  salesTaxSummary = function(){ return calculateTaxSummary(); };

  const v810TotalsBase = totals;
  totals = function(){
    const t = v810TotalsBase();
    const cash = calculateCashSummary();
    t.bank = cash.netPosition;
    t.cash = cash;
    t.tax = calculateTaxSummary();
    return t;
  };

  function calculateCashSummary(opts={}){
    const accounts = (state.bankAccounts||[]).map(b=>{
      const balance = normalBalance(b.accountId);
      const isCredit = String(b.type||'').toLowerCase().includes('credit') || getAccount(b.accountId).type==='Liability';
      return {...b, bookBalance: balance, cashContribution: isCredit ? -Math.abs(balance) : balance, isCredit};
    });
    const operating = accounts.find(a=>a.id==='BA-1') || accounts.find(a=>String(a.name||'').toLowerCase().includes('operating')) || accounts[0] || {bookBalance:0,name:'Operating account'};
    const savings = accounts.filter(a=>!a.isCredit && a.id!==operating.id).reduce((s,a)=>s+num(a.bookBalance),0);
    const creditCardLiability = accounts.filter(a=>a.isCredit).reduce((s,a)=>s+Math.abs(num(a.bookBalance)),0);
    const netPosition = accounts.reduce((s,a)=>s+num(a.cashContribution),0);
    const bankFeedReview = (state.bankTransactions||[]).filter(tx=>tx.status!=='Reviewed' && tx.status!=='Matched').length;
    const postedBankFeed = (state.bankTransactions||[]).filter(tx=>tx.posted).reduce((s,tx)=>s+num(tx.amount),0);
    const paymentInflow = (state.payments||[]).reduce((s,p)=>s+num(p.amount),0) + (state.deposits||[]).reduce((s,d)=>s+num(d.amount),0);
    const cashOutflow = (state.expenses||[]).reduce((s,e)=>s+expenseTotal(e),0) + (state.billPayments||[]).reduce((s,p)=>s+num(p.amount),0) + (state.taxPayments||[]).filter(p=>!p.openingTreatment).reduce((s,p)=>s+num(p.amount),0);
    return {accounts, operating, operatingBalance:num(operating.bookBalance), savings, creditCardLiability, netPosition, bankFeedReview, postedBankFeed, paymentInflow, cashOutflow, netActivity:paymentInflow-cashOutflow};
  }

  function v810CanShowInventoryInsights(){
    if(typeof isModuleVisible==='function' && !isModuleVisible('inventory')) return false;
    const mode = typeof itemMode==='function' ? itemMode() : 'mixed';
    return !['services','simple'].includes(mode);
  }
  function v810LowStockProducts(){
    if(!v810CanShowInventoryInsights()) return [];
    if(typeof lowStockProducts==='function') return lowStockProducts().filter(p=>typeof modeAllowsItem!=='function' || modeAllowsItem(p));
    if(typeof inventoryProducts==='function') return inventoryProducts().filter(p=>safeStockAvailable(p.id)<=num(p.reorderPoint));
    return [];
  }
  function v810PurchaseMatchIssues(){
    if(!v810CanShowInventoryInsights()) return [];
    return (state.purchaseOrders||[]).filter(po=>{
      if(typeof poMatchStatus==='function') return poMatchStatus(po).label !== 'Matched';
      return !(po.billId && num(po.receivedQty)>=num(po.qty));
    });
  }

  const v810RenderBusinessFeedBase = renderBusinessFeed;
  renderBusinessFeed = function(t){
    const tb=trialBalanceStatus();
    const cash=calculateCashSummary();
    const tax=calculateTaxSummary();
    const unreviewed = (state.bankTransactions||[]).filter(x=>x.status!=='Reviewed' && x.status!=='Matched').length;
    const overdueInvoices = (state.invoices||[]).filter(i=>invoiceDisplayStatus(i)==='Overdue' || (openAmount(i)>0 && i.dueDate < todayISO()));
    const dueBills = (state.bills||[]).filter(b=>billOpenAmount(b)>0).slice(0,20);
    const lowStock = v810LowStockProducts().length;
    const cards = [
      {icon:'â–£', title:'Accounting done', text:`Trial balance is ${tb.ok?'balanced':'out by '+money(Math.abs(tb.diff))}. ${unreviewed} bank transaction${unreviewed===1?'':'s'} need review.`, action:'Open accounting', nav:'accounting'},
      {icon:'!', title:'Overdue invoices', text:`${overdueInvoices.length} invoice${overdueInvoices.length===1?'':'s'} need follow-up. Open receivables are ${money(t.ar)}.`, action:'Review all', nav:'sales'},
      {icon:'â—‰', title:'Banking review', text:`${unreviewed} imported-style bank transaction${unreviewed===1?'':'s'} need matching, clearing, or categorization.`, action:'Review banking', nav:'banking'},
      {icon:'â†—', title:'Cash flow insight', text:`Operating Checking is ${money(cash.operatingBalance)}. Net cash position across bank and credit accounts is ${money(cash.netPosition)}.`, action:'View banking', nav:'banking'},
      {icon:'â—¼', title:'Low stock detected', text: lowStock ? `${lowStock} inventory item${lowStock===1?'':'s'} are at or below reorder point.` : 'Inventory stock levels are within reorder rules.', action:'Open items', nav:'inventory', inventoryOnly:true},
      {icon:'â—–', title:'Tax return ready', text: tax.balanceMessage, action:'Prepare return', nav:'taxes'},
      {icon:'â–¸', title:'Bills due', text:`${dueBills.length} open vendor bill${dueBills.length===1?'':'s'} require review or payment scheduling.`, action:'Review bills', nav:'expenses'}
    ].filter(c=>(!c.nav || isModuleVisible(c.nav)) && (!c.inventoryOnly || v810CanShowInventoryInsights())).slice(0,4);
    const el=document.getElementById('businessFeed'); if(!el) return;
    el.innerHTML = `<div class="feed-row v8-feed-row">${cards.map(c=>`<div class="feed-card v8-feed-card"><span class="menu">â‹®</span><div><div class="feed-title"><span class="feed-badge">${c.icon}</span>${escapeHTML(c.title)}</div><p>${escapeHTML(c.text)}</p></div><button class="btn soft" data-nav="${c.nav}">${escapeHTML(c.action)}</button></div>`).join('')}<div class="feed-card v8-feed-card"><div><div class="feed-title"><span class="feed-badge">âœ¦</span>More ready for you</div><p>Use Customize to choose dashboard widgets and menu modules for your business workflow.</p></div><button class="btn soft" data-modal="customizeDashboard">Customize</button></div></div>`;
  };

  const v810RenderCashFlowCardBase = renderCashFlowCard;
  renderCashFlowCard = function(t){
    const el=document.getElementById('cashFlowCard');
    if(!el) return v810RenderCashFlowCardBase(t);
    const cash=calculateCashSummary();
    el.innerHTML = `<h3>Cash Flow</h3><div class="muted">Net position across bank and credit accounts</div><div class="metric">${money(cash.netPosition)}</div><div class="report-line"><span>Operating Checking</span><strong>${money(cash.operatingBalance)}</strong></div><div class="report-line"><span>Savings / cash reserve</span><strong>${money(cash.savings)}</strong></div><div class="report-line"><span>Credit card balance</span><strong>${money(cash.creditCardLiability)}</strong></div><button class="btn soft" data-nav="banking" style="margin-top:12px">Open banking</button>`;
  };

  function v810InsightDefinitions(){
    const t=totals();
    const tax=calculateTaxSummary();
    const cash=calculateCashSummary();
    const bankReview=(state.bankTransactions||[]).filter(tx=>tx.status!=='Reviewed' && tx.status!=='Matched').length;
    const overdueInvoices=(state.invoices||[]).filter(i=>openAmount(i)>0 && (invoiceDisplayStatus(i)==='Overdue' || i.dueDate<todayISO()));
    const dueBills=(state.bills||[]).filter(b=>billOpenAmount(b)>0);
    const lowStock=v810LowStockProducts();
    const matchIssues=v810PurchaseMatchIssues();
    const tb=trialBalanceStatus();
    const items=[
      {id:'bank', module:'banking', icon:'â—‰', title:'Bank transactions need review', msg:`${bankReview} transaction${bankReview===1?'':'s'} need matching, categorization, or clearing.`, label:'Review banking'},
      {id:'overdue', module:'sales', icon:'!', title:'Overdue invoices', msg:`${overdueInvoices.length} invoice${overdueInvoices.length===1?'':'s'} need follow-up. Open receivables are ${money(t.ar)}.`, label:'Review invoices'},
      {id:'ap', module:'expenses', icon:'â–¡', title:'Vendor bills open', msg:`${dueBills.length} vendor bill${dueBills.length===1?'':'s'} remain open. Open A/P is ${money(t.ap)}.`, label:'Review bills'},
      {id:'taxes', module:'taxes', icon:'â—–', title:'Tax return attention', msg:tax.balanceMessage, label:'Open taxes'},
      {id:'balanced', module:'accounting', icon:'â–£', title:'Accounting check', msg:`Trial balance is ${tb.ok?'balanced':'out of balance'}. ${bankReview} bank transaction${bankReview===1?'':'s'} need review.`, label:'Open accounting'},
      {id:'cash', module:'banking', icon:'â†—', title:'Cash flow insight', msg:`Operating Checking is ${money(cash.operatingBalance)}. Net cash position across checking, savings, and credit card accounts is ${money(cash.netPosition)}.`, label:'View banking'}
    ];
    if(v810CanShowInventoryInsights()){
      items.splice(4,0,
        {id:'stock', module:'inventory', icon:'â—¼', title:'Inventory attention', msg:lowStock.length ? `${lowStock.length} inventory item${lowStock.length===1?'':'s'} are at or below reorder point.` : 'Inventory stock levels are within reorder rules.', label:'Review inventory'},
        {id:'match', module:'inventory', icon:'â‡„', title:'Purchase matching', msg:matchIssues.length ? `${matchIssues.length} purchase order${matchIssues.length===1?'':'s'} may need receiving, billing, or matching review.` : 'Purchase orders, receiving, and bill matching are in good shape.', label:'Open matching'}
      );
    }
    return items;
  }

  smartInsights = function(){ return v810InsightDefinitions(); };
  v88InsightDefinitions = function(){ return v810InsightDefinitions(); };
  v88VisibleInsights = function(){
    const list=v810InsightDefinitions();
    const visible=list.filter(x=>!x.module || typeof isModuleVisible!=='function' || isModuleVisible(x.module) || ['dashboard','settings'].includes(x.module));
    return visible.length ? visible : list.filter(x=>!['stock','match'].includes(x.id));
  };
  getV88InsightData = function(){
    const tax=calculateTaxSummary(), cash=calculateCashSummary(), tb=trialBalanceStatus();
    return {t:totals(), taxNet:tax.balance, tax, cash, bankReview:cash.bankFeedReview, overdueInvoices:(state.invoices||[]).filter(i=>openAmount(i)>0 && (invoiceDisplayStatus(i)==='Overdue'||i.dueDate<todayISO())).length, dueBills:(state.bills||[]).filter(b=>billOpenAmount(b)>0).length, lowStock:v810LowStockProducts().length, matchIssues:v810PurchaseMatchIssues().length, tbDiff:Math.abs(tb.diff)};
  };
  updateInsightsBadge = function(){
    injectV89SmartInsightsFixStyles();
    normalizeV89InsightsButton();
    const btn=document.getElementById('insightsBtn'); if(!btn) return;
    const list=v810InsightDefinitions().filter(x=>{
      if(x.id==='taxes') return Math.abs(calculateTaxSummary().balance)>0.009;
      if(x.id==='stock') return v810LowStockProducts().length>0;
      if(x.id==='match') return v810PurchaseMatchIssues().length>0;
      if(x.id==='balanced') return Math.abs(trialBalanceStatus().diff)>0.009;
      if(x.id==='cash') return true;
      if(x.id==='bank') return calculateCashSummary().bankFeedReview>0;
      if(x.id==='overdue') return (state.invoices||[]).some(i=>openAmount(i)>0 && (invoiceDisplayStatus(i)==='Overdue'||i.dueDate<todayISO()));
      if(x.id==='ap') return (state.bills||[]).some(b=>billOpenAmount(b)>0);
      return true;
    }).filter(x=>!x.module || typeof isModuleVisible!=='function' || isModuleVisible(x.module));
    let count=list.length;
    let dot=btn.querySelector('.insight-count-dot');
    if(count>0){ if(!dot){ dot=document.createElement('span'); dot.className='insight-count-dot'; btn.appendChild(dot); } dot.textContent=count>9?'9+':String(count); dot.hidden=false; }
    else if(dot){ dot.hidden=true; }
  };

  const v810RenderInsightsPanelBase = renderInsightsPanel;
  renderInsightsPanel = function(){
    injectV88InsightsStyles(); injectV89SmartInsightsFixStyles();
    const rows=v88VisibleInsights().slice(0,8).map(x=>`<div class="panel-card insight-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><span class="panel-icon">${escapeHTML(x.icon)}</span><div class="insight-content"><h4>${escapeHTML(x.title)}</h4><p>${escapeHTML(x.msg)}</p></div><div class="insight-actions"><button class="btn primary" type="button" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div></div>`).join('') || `<div class="panel-card"><h4>No urgent insights right now</h4><p>Your business data looks up to date. Use the dashboard or reports to review details anytime.</p><button class="btn primary" type="button" data-nav="dashboard">Open dashboard</button></div>`;
    return panelHead('Smart Insights','Action cards based on invoices, bills, banking, tax, and inventory data.')+`<div class="top-panel-body"><div class="panel-list">${rows}</div><div class="top-panel-foot"><button class="btn" type="button" data-nav="dashboard">Open dashboard</button><button class="btn" type="button" data-modal="customizeDashboard">Customize dashboard</button></div></div>`;
  };

  const v810ReportDataBase = reportDataV81;
  function v810DateInRange(date,start,end){ return (!start || String(date||'')>=start) && (!end || String(date||'')<=end); }
  function v810ReportRange(){ return {start:state.settings.reportStartDate||'', end:state.settings.reportEndDate||todayISO()}; }
  function v810WithFilteredState(start,end,fn){
    const keys=['invoices','payments','expenses','bills','billPayments','deposits','bankTransactions','taxPayments','taxAdjustments','purchaseOrders','salesOrders','timeEntries','journalEntries','inventoryMovements'];
    const saved={};
    try{
      keys.forEach(k=>{ saved[k]=state[k]; if(Array.isArray(state[k])) state[k]=state[k].filter(r=>v810DateInRange(r.date||r.fileDate||r.statementDate||r.createdAt,start,end)); });
      return fn();
    } finally { Object.keys(saved).forEach(k=>state[k]=saved[k]); }
  }
  reportDataV81 = function(id){
    ensureV810State();
    const {start,end}=v810ReportRange();
    const data = v810WithFilteredState(start,end,()=>v810ReportDataBase(id));
    data.subtitle = `${data.subtitle || ''}${start||end ? ` Â· Date range: ${start||'Beginning'} to ${end||'Today'}` : ''}`;
    if(id==='sales-tax-liability'){
      const tax=calculateTaxSummary({start,end});
      data.summary=[['Collected',money(tax.collected)],['Input tax credits',money(tax.itc)],['Before payments',money(tax.beforePayments)],['After payments',money(tax.balance)]];
      data.rows=[['GST/HST collected on sales',money(tax.collected)],['Recoverable tax paid on purchases',money(tax.itc)],['Adjustments',money(tax.adjustments)],['Tax payments',money(tax.payments)],['Net tax balance after payments',money(tax.balance)]];
    }
    if(id==='business-snapshot'){
      const cash=calculateCashSummary(); const tax=calculateTaxSummary({start,end});
      data.summary=[['Net cash position',money(cash.netPosition)],['Operating Checking',money(cash.operatingBalance)],['Open A/R',money(totals().ar)],['Open A/P',money(totals().ap)]];
      data.rows=[['Operating Checking',money(cash.operatingBalance)],['Savings / cash reserve',money(cash.savings)],['Credit card balance',money(cash.creditCardLiability)],['Net cash position',money(cash.netPosition)],['Open accounts receivable',money(totals().ar)],['Open accounts payable',money(totals().ap)],['Net tax balance after payments',money(tax.balance)],['Net income',money(totals().profit)]];
    }
    return data;
  };

  const v810RenderReportDetailBase = renderReportDetailV81;
  renderReportDetailV81 = function(id){
    const data=reportDataV81(id);
    const fav=new Set(state.settings.reportFavorites||[]);
    const start=state.settings.reportStartDate || '2026-05-01';
    const end=state.settings.reportEndDate || todayISO();
    return `<div id="reportDetailArea" class="report-detail"><div class="report-detail-head"><div><button class="btn soft" data-action="back-reports">â† Back to reports</button><h3>${escapeHTML(data.title)}</h3><p class="muted">${escapeHTML(data.subtitle)}</p></div><div class="actions" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-action="toggle-report-fav" data-id="${data.id}">${fav.has(data.id)?'â˜… Favorite':'â˜† Favorite'}</button><button class="btn" data-action="export-report" data-id="${data.id}">Export CSV</button><button class="btn primary" data-action="print-report" data-id="${data.id}">Print</button></div></div><div class="report-controls"><label>Start <input id="reportStartDate" type="date" value="${escapeHTML(start)}" aria-label="Report start date"></label><label>End <input id="reportEndDate" type="date" value="${escapeHTML(end)}" aria-label="Report end date"></label><button class="btn" data-action="run-report" data-id="${data.id}">Run report</button></div>${reportSummaryCardsV81(data.summary)}${reportTableV81(data)}</div>`;
  };
  function updateReportDateRangeFromInputs(){
    const s=document.getElementById('reportStartDate'), e=document.getElementById('reportEndDate');
    if(s) state.settings.reportStartDate=s.value;
    if(e) state.settings.reportEndDate=e.value;
    saveState();
  }
  const v810HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='run-report'){ updateReportDateRangeFromInputs(); renderReports(); showToast(`${getReportMeta(id).name} refreshed for selected date range.`); return; }
    if(action==='open-report'){ updateReportDateRangeFromInputs(); state.settings.activeReportId=id; state.settings.reportMenuId=null; saveState(); renderReports(); showToast(`${getReportMeta(id).name} opened.`); return; }
    return v810HandleActionBase(action,id);
  };
  reportRowsForCSV = function(id){ const d=reportDataV81(id); return {headings:d.headings, rows:d.rows, title:d.title}; };

  const v810RenderTaxesBase = renderTaxes;
  renderTaxes = function(){
    v810RenderTaxesBase();
    const el=document.getElementById('page-taxes'); if(!el) return;
    cleanVersionLabelsInDOM(el);
    const tax=calculateTaxSummary();
    const firstCard=el.querySelector('.tax-hero .tax-card:first-child');
    if(firstCard){
      firstCard.classList.toggle('warning',tax.balance>0);
      firstCard.classList.toggle('good',tax.balance<=0);
      const h=firstCard.querySelector('h3'), m=firstCard.querySelector('.metric'), small=firstCard.querySelector('.muted.small');
      if(h) h.textContent=tax.balanceLabel;
      if(m) m.textContent=money(tax.balance);
      if(small) small.textContent='After recorded payments';
    }
  };

  function v810CleanVisibleText(root=document){
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ const cleaned=v810CleanCopy(n.nodeValue); if(cleaned && cleaned!==n.nodeValue.trim()) n.nodeValue=n.nodeValue.replace(n.nodeValue.trim(),cleaned); });
  }
  const v810RenderAllBase = renderAll;
  renderAll = function(){ ensureV810State(); v810RenderAllBase(); v810CleanVisibleText(document.body); updateInsightsBadge(); };



  // ---------- V8.11 Tax Period & Credit Carryforward Fix ----------
  function v811TaxDisplay(tax){
    const b=num(tax.balance);
    if(b>0.009) return {label:'Net tax payable', amount:money(b), cardClass:'warning', note:'After recorded payments / credits'};
    if(b<-0.009) return {label:'Tax credit / refund', amount:money(Math.abs(b)), cardClass:'good', note:'After applying recorded CRA payments / credits'};
    return {label:'Net tax balance', amount:money(0), cardClass:'good', note:'After recorded payments / credits'};
  }

  function v811TaxEquationText(tax){
    const before = num(tax.beforePayments);
    const payments = num(tax.payments);
    if(num(tax.balance)<-0.009){
      return `Current tax activity shows ${money(Math.max(before,0))} payable before payments. After applying ${money(payments)} in recorded CRA payments / credits, the account is in a ${money(Math.abs(tax.balance))} credit position.`;
    }
    if(num(tax.balance)>0.009){
      return `Current tax activity shows ${money(before)} payable before payments. After applying ${money(payments)} in recorded CRA payments / credits, ${money(tax.balance)} remains payable.`;
    }
    return `Current tax activity shows ${money(before)} before payments. Recorded CRA payments / credits bring the tax balance to ${money(0)}.`;
  }

  const v811CalculateTaxSummaryBase = calculateTaxSummary;
  calculateTaxSummary = function(opts={}){
    const start = opts.start || null, end = opts.end || null, agencyId = opts.agencyId || null;
    const collected = taxableSales(start,end,agencyId);
    const itc = recoverablePurchases(start,end,agencyId);
    const adjustments = taxAdjustmentsTotal(start,end,agencyId);
    const payments = taxPaymentsTotal(start,end,agencyId);
    const beforePayments = collected - itc + adjustments;
    const balance = beforePayments - payments;
    const absBalance = Math.abs(balance);
    const display = v811TaxDisplay({balance,payments,beforePayments});
    return {
      collected, itc, adjustments, payments,
      net: beforePayments,
      beforePayments,
      currentActivityBalance: beforePayments,
      balance,
      absBalance,
      displayAmount: display.amount,
      status: balance > 0.009 ? 'Payable' : balance < -0.009 ? 'Credit / refund' : 'Balanced',
      balanceLabel: display.label,
      balanceNote: display.note,
      balanceMessage: v811TaxEquationText({collected,itc,adjustments,payments,beforePayments,balance})
    };
  };
  salesTaxSummary = function(){ return calculateTaxSummary(); };

  function v811ReturnDisplay(ret){
    const c=taxReturnCalc(ret);
    const overpayment=Math.max(0, num(c.payments)-num(c.amountDue));
    const isFiled=String(ret.status||'').toLowerCase().includes('filed');
    const creditCarried=isFiled && overpayment>0.009 ? overpayment : 0;
    const displayBalance=creditCarried>0 ? 0 : c.balance;
    const action=creditCarried>0 || String(ret.status||'').toLowerCase().includes('paid') ? 'View summary' : 'Record payment';
    return {...c, creditCarried, displayBalance, action};
  }

  const v811RenderTaxesBase = renderTaxes;
  renderTaxes = function(){
    ensureV5State(); ensureV810State();
    const el=document.getElementById('page-taxes'); if(!el) return;
    const tax=calculateTaxSummary();
    const display=v811TaxDisplay(tax);
    const tab=state.settings.taxTab || 'returns';
    const tabs=[['returns','Returns'],['payments','Payments'],['settings','Tax settings'],['reports','Reports'],['exceptions','Exceptions']];
    let body='';
    if(tab==='returns'){
      const explanation = `<div class="card tax-explain-card"><h3>Tax position explanation</h3><p>${escapeHTML(v811TaxEquationText(tax))}</p><div class="report-line"><span>Collected on sales</span><strong>${money(tax.collected)}</strong></div><div class="report-line"><span>Less recoverable ITCs</span><strong>${money(tax.itc)}</strong></div><div class="report-line"><span>Adjustments</span><strong>${money(tax.adjustments)}</strong></div><div class="report-line total"><span>Net payable before payments</span><strong>${money(tax.beforePayments)}</strong></div><div class="report-line"><span>Recorded CRA payments / credits</span><strong>${money(tax.payments)}</strong></div><div class="report-line total"><span>${escapeHTML(display.label)}</span><strong>${escapeHTML(display.amount)}</strong></div></div>`;
      body = explanation + `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax returns</h3><div class="muted small">Track filing periods, calculated amount due, payments, balances, and any credit carried forward.</div></div><div class="right"><button class="btn" data-modal="taxReturn">Prepare return</button><button class="btn primary" data-modal="taxPayment">Record payment</button></div></div>${table(['Return','Agency','Period','File date','Amount due','Payments','Balance','Credit carried forward','Status','Action'], (state.taxReturns||[]).map(r=>{ const c=v811ReturnDisplay(r); return [`<strong>${r.id}</strong>`,escapeHTML(getTaxAgency(r.agencyId).name),`${r.startDate} â†’ ${r.endDate}`,escapeHTML(r.fileDate||'Not filed'),`<span class="amount">${money(c.amountDue)}</span>`,`<span class="amount">${money(c.payments)}</span>`,`<span class="amount">${money(c.displayBalance)}</span>`,`<span class="amount">${money(c.creditCarried)}</span>`,tagForStatus(r.status),`<button class="btn square" data-modal="taxPayment">${escapeHTML(c.action)}</button>`]; }))}</div>`;
    }
    if(tab==='payments'){
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax payments and credits</h3><div class="muted small">Recorded remittances or credits are applied against the agency balance. Prior-period credits are shown separately from current activity.</div></div><button class="btn primary" data-modal="taxPayment">Record payment</button></div>${table(['Payment / credit','Agency','Return','Date','Paid from','Amount','Treatment','Memo'], (state.taxPayments||[]).map(p=>[`<strong>${p.id}</strong>`,escapeHTML(getTaxAgency(p.agencyId).name),escapeHTML(p.returnId||'Not linked'),p.date,escapeHTML(getBank(p.accountId).name),`<span class="amount">${money(p.amount)}</span>`,escapeHTML(p.openingTreatment?'Prior-period credit / remittance':'Current remittance'),escapeHTML(p.memo||'')]))}</div>`;
    }
    if(tab==='settings'){
      body = `<div class="grid two"><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax agencies</h3><div class="muted small">Filing frequency, period start, and reporting method.</div></div><button class="btn" data-modal="taxAgency">Add agency</button></div>${table(['Agency','Filing frequency','Start month','Start date','Method','Status','Action'], (state.taxAgencies||[]).map(a=>[`<strong>${escapeHTML(a.name)}</strong>`,a.filingFrequency,a.startMonth,a.startDate,a.reportingMethod,a.active?'<span class="tax-pill active">Active</span>':'<span class="tax-pill">Inactive</span>',`<button class="btn square" data-modal="taxAgency">Edit</button>`]))}</div><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax codes and rates</h3><div class="muted small">Used on invoice, bill, and expense line items.</div></div><button class="btn" data-modal="taxCode">Add tax code</button></div>${table(['Code','Agency','Rate','Type','Applies to','Recoverable','Status'], (state.taxCodes||[]).map(c=>[`<strong>${escapeHTML(c.code)}</strong>`,escapeHTML(getTaxAgency(c.agencyId).name),`${num(c.rate)}%`,escapeHTML(c.type),escapeHTML(c.appliesTo),c.recoverable?'Yes':'No',c.active?'<span class="tax-pill active">Active</span>':'<span class="tax-pill">Inactive</span>']))}</div></div>`;
    }
    if(tab==='reports'){
      const details=taxDetailRows();
      body = `<div class="grid two" style="margin-bottom:16px"><div class="card"><h3>Sales Tax Liability Report</h3><p class="muted">Current activity is separated from recorded CRA payments / credits.</p><div class="report-line"><span>Collected on sales</span><strong>${money(tax.collected)}</strong></div><div class="report-line"><span>Paid on purchases / ITCs</span><strong>${money(tax.itc)}</strong></div><div class="report-line"><span>Adjustments</span><strong>${money(tax.adjustments)}</strong></div><div class="report-line total"><span>Net payable before payments</span><strong>${money(tax.beforePayments)}</strong></div><div class="report-line"><span>Payments / credits</span><strong>${money(tax.payments)}</strong></div><div class="report-line total"><span>${escapeHTML(display.label)}</span><strong>${escapeHTML(display.amount)}</strong></div></div><div class="card"><h3>Available reports</h3><div class="checklist"><div class="check-row done"><span class="check-dot">âœ“</span><div><strong>Tax detail by transaction</strong><div class="muted small">Included below</div></div><span class="tax-pill active">Ready</span></div><div class="check-row done"><span class="check-dot">âœ“</span><div><strong>Tax exceptions report</strong><div class="muted small">Open the Exceptions tab</div></div><span class="tax-pill active">Ready</span></div></div></div></div><div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax detail by transaction</h3><div class="muted small">Line-item tax code, agency, taxable base, and tax amount.</div></div><input class="table-search" data-filter-table placeholder="Search tax detail"></div>${table(['Date','Type','Source','Name','Agency','Tax code','Base','Tax','Direction'], details.map(d=>[d.date,d.type,`<strong>${d.source}</strong>`,escapeHTML(d.name),escapeHTML(d.agency),`<span class="tax-pill">${escapeHTML(d.code)}</span>`,money(d.base),`<span class="amount">${money(d.tax)}</span>`,escapeHTML(d.direction)]))}</div>`;
    }
    if(tab==='exceptions'){
      const exceptions=taxExceptions();
      body = `<div class="card table-card"><div class="toolbar"><div><h3 style="margin:0">Tax exceptions</h3><div class="muted small">Transactions that may require tax-code review before filing.</div></div><button class="btn" data-modal="taxAdjustment">Add adjustment</button></div>${table(['Date','Type','Source','Issue','Suggested action'], exceptions.map(x=>[x.date,x.type,`<strong>${x.id}</strong>`,escapeHTML(x.issue),escapeHTML(x.action)]))}</div>`;
    }
    el.innerHTML = header('Tax Center', 'Manage tax agencies, tax codes, tax returns, input tax credits, remittances, and tax exceptions.', `<button class="btn" data-modal="taxAdjustment">Tax adjustment</button><button class="btn" data-modal="taxCode">Edit rates</button><button class="btn primary" data-modal="taxReturn">Prepare return</button>`) +
      `<div class="tax-hero v811-tax-hero"><div class="tax-card ${display.cardClass}"><h3>${escapeHTML(display.label)}</h3><div class="metric">${escapeHTML(display.amount)}</div><div class="muted small">${escapeHTML(display.note)}</div></div><div class="tax-card"><h3>Net before payments</h3><div class="metric">${money(tax.beforePayments)}</div><div class="muted small">Current tax activity</div></div><div class="tax-card"><h3>Collected on sales</h3><div class="metric">${money(tax.collected)}</div></div><div class="tax-card"><h3>Paid on purchases</h3><div class="metric">${money(tax.itc)}</div><div class="muted small">Recoverable ITCs</div></div><div class="tax-card"><h3>Payments / credits</h3><div class="metric">${money(tax.payments)}</div><div class="muted small">Recorded with CRA</div></div><div class="tax-card"><h3>Adjustments</h3><div class="metric">${money(tax.adjustments)}</div></div></div>`+
      `<div class="tax-subnav">${tabs.map(t=>`<button class="tab-btn ${tab===t[0]?'active':''}" data-action="set-tax-tab" data-id="${t[0]}">${t[1]}</button>`).join('')}</div>` + body;
  };

  const v811ReportDataBase = reportDataV81;
  reportDataV81 = function(id){
    const d=v811ReportDataBase(id);
    if(id==='sales-tax-liability'){
      const range=typeof v810ReportRange==='function' ? v810ReportRange() : {start:'',end:''};
      const tax=calculateTaxSummary({start:range.start,end:range.end});
      const disp=v811TaxDisplay(tax);
      d.summary=[['Collected on sales',money(tax.collected)],['Recoverable ITCs',money(tax.itc)],['Net before payments',money(tax.beforePayments)],[disp.label,disp.amount]];
      d.rows=[['GST/HST collected on sales',money(tax.collected)],['Recoverable tax paid on purchases',money(tax.itc)],['Adjustments',money(tax.adjustments)],['Net payable before payments',money(tax.beforePayments)],['Recorded CRA payments / credits',money(tax.payments)],[disp.label,disp.amount]];
    }
    return d;
  };



  // ---------- V8.12 Production Wording & Insight Copy Cleanup ----------
  function v812ProductionText(value){
    let s=String(value ?? '');
    if(!s) return s;
    if(typeof removeVersionLabelsFromString==='function') s=removeVersionLabelsFromString(s);
    if(typeof v810CleanCopy==='function') s=v810CleanCopy(s);
    const pairs=[
      [/\bDemo\s+prior\s+GST\/HST\s+remittance\b/gi,'Prior-period GST/HST remittance'],
      [/\bDemo\s+/gi,''],
      [/\s+demo\b/gi,''],
      [/\bdemo\b/gi,''],
      [/\bSample\s+data\b/gi,'Company data'],
      [/\bsample\s+data\b/gi,'company data'],
      [/\bSample\s+customer\s+activity\b/gi,'customer activity'],
      [/\bSample\s+Company\b/gi,'Your Company'],
      [/\bPrototype\b/gi,'Workspace'],
      [/\bprototype\b/gi,'workspace'],
      [/\bPlaceholder\b/gi,'Setup'],
      [/\bplaceholder\b/gi,'setup'],
      [/\bMock\b/gi,''],
      [/\bfake\b/gi,''],
      [/\bseeded\b/gi,'opening'],
      [/\bOpening\s+balances\s+initialized.*$/i,'Opening records initialized.'],
      [/\bOpening\s+records\s+initialized\s+with\s+.*$/i,'Opening records initialized.'],
      [/\s{2,}/g,' ']
    ];
    pairs.forEach(([re,rep])=>{ s=s.replace(re,rep); });
    return s.trim();
  }

  function v812CleanObjectStrings(obj, seen=new WeakSet()){
    if(!obj || typeof obj!=='object') return;
    if(seen.has(obj)) return;
    seen.add(obj);
    Object.keys(obj).forEach(k=>{
      const v=obj[k];
      if(typeof v==='string') obj[k]=v812ProductionText(v);
      else if(v && typeof v==='object') v812CleanObjectStrings(v, seen);
    });
  }

  function ensureV812State(){
    try{ if(typeof ensureV810State==='function') ensureV810State(); }catch(e){}
    try{ if(typeof ensureV811State==='function') ensureV811State(); }catch(e){}
    state.settings ||= {};
    if(!state.company) state.company={};
    if(!state.company.name || /^\s*(sample company|demo company)\s*$/i.test(state.company.name)) state.company.name='Your Company';
    if(state.invoiceSettings){
      if(!state.invoiceSettings.companyName || /^\s*(sample company|demo company|smartbooks demo company)\s*$/i.test(state.invoiceSettings.companyName)) state.invoiceSettings.companyName=state.company.name || 'Your Company';
      if(state.invoiceSettings.paymentInstructions) state.invoiceSettings.paymentInstructions=v812ProductionText(state.invoiceSettings.paymentInstructions).replace(/payable to SmartBooks\s*$/i,'payable to SmartBooks');
      if(state.invoiceSettings.footerNote) state.invoiceSettings.footerNote=v812ProductionText(state.invoiceSettings.footerNote);
    }
    v812CleanObjectStrings(state);
    (state.auditTrail||[]).forEach(a=>{ if(/^demo$/i.test(a.user||'')) a.user='System'; a.action=v812ProductionText(a.action||'Opening records initialized.'); });
    (state.taxPayments||[]).forEach(p=>{
      if(/demo/i.test(p.memo||'')) p.memo=v812ProductionText(p.memo).replace(/^prior\s+GST\/HST/i,'Prior-period GST/HST');
      if(p.id==='TAXPAY-1001' && !p.memo) p.memo='Prior-period GST/HST remittance';
    });
  }

  function v812TaxInsightCopy(){
    const tax=calculateTaxSummary();
    if(tax.balance < -0.009) return {title:'GST/HST credit available', msg:`You have a ${money(Math.abs(tax.balance))} credit after recorded CRA payments/credits.`, label:'Review taxes'};
    if(tax.balance > 0.009) return {title:'GST/HST payable', msg:`${money(tax.balance)} remains payable after recorded CRA payments/credits.`, label:'Review taxes'};
    return {title:'GST/HST up to date', msg:'No net GST/HST balance is currently outstanding.', label:'Review taxes'};
  }

  const v812CalculateTaxSummaryBase = calculateTaxSummary;
  calculateTaxSummary = function(opts={}){
    const tax=v812CalculateTaxSummaryBase(opts);
    const copy=(tax.balance < -0.009)
      ? `You have a ${money(Math.abs(tax.balance))} GST/HST credit after recorded CRA payments/credits.`
      : tax.balance > 0.009
        ? `${money(tax.balance)} GST/HST remains payable after recorded CRA payments/credits.`
        : 'GST/HST balance is up to date.';
    return {...tax, balanceMessage:copy};
  };
  salesTaxSummary = function(){ return calculateTaxSummary(); };

  const v812InsightBase = typeof v810InsightDefinitions==='function' ? v810InsightDefinitions : null;
  v810InsightDefinitions = function(){
    const items = v812InsightBase ? v812InsightBase() : (typeof smartInsights==='function' ? smartInsights() : []);
    const taxCopy=v812TaxInsightCopy();
    return (items||[]).map(x=>{
      if(x.id==='taxes') return {...x, title:taxCopy.title, msg:taxCopy.msg, label:taxCopy.label};
      if(x.id==='cash') return {...x, msg:x.msg.replace(/^Current bank position is/i,'Net cash position is')};
      if(x.id==='stock' && /do not show reorder alerts/i.test(x.msg||'')) return {...x, msg:'Inventory levels are healthy. No reorder alerts.'};
      if(x.id==='match' && /may need receiving, billing, or matching review/i.test(x.msg||'')) return {...x, msg:x.msg.replace('may need receiving, billing, or matching review','need matching review')};
      return x;
    });
  };
  smartInsights = function(){ return v810InsightDefinitions(); };
  v88InsightDefinitions = function(){ return v810InsightDefinitions(); };
  v88VisibleInsights = function(){
    const list=v810InsightDefinitions();
    const visible=list.filter(x=>!x.module || typeof isModuleVisible!=='function' || isModuleVisible(x.module) || ['dashboard','settings'].includes(x.module));
    return visible.length ? visible : list.filter(x=>!['stock','match'].includes(x.id));
  };

  const v812RenderBusinessFeedBase = renderBusinessFeed;
  renderBusinessFeed = function(t){
    v812RenderBusinessFeedBase(t);
    const feed=document.getElementById('businessFeed');
    if(feed) v812CleanVisibleText(feed);
  };

  const v812RenderSettingsBase = renderSettings;
  renderSettings = function(){
    const el=document.getElementById('page-settings');
    if(!el) return v812RenderSettingsBase();
    v812RenderSettingsBase();
    const dataCards=el.querySelectorAll('.card');
    dataCards.forEach(card=>{
      card.innerHTML=card.innerHTML
        .replace(/Reset\s+company data/gi,'Reset company data')
        .replace(/Reset\s+sample data/gi,'Reset company data')
        .replace(/Export JSON/gi,'Export backup');
    });
    v812CleanVisibleText(el);
  };

  const v812RenderPayrollBase = renderPayroll;
  renderPayroll = function(){
    const el=document.getElementById('page-payroll');
    if(!el) return v812RenderPayrollBase();
    el.innerHTML = header('Payroll', 'Set up payroll, pay runs, deductions, and remittance tracking.', `<button class="btn primary" data-modal="payroll">Payroll setup</button>`) + `<div class="empty"><strong>Payroll is not enabled for this company.</strong><br>Enable payroll setup before running employee pay calculations.</div>`;
  };

  const v812RenderInsightsPanelBase = renderInsightsPanel;
  renderInsightsPanel = function(){
    const html=v812RenderInsightsPanelBase();
    setTimeout(()=>{ const p=document.getElementById('topbarPopover'); if(p) v812CleanVisibleText(p); },0);
    return html;
  };

  function v812CleanVisibleText(root=document){
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const old=n.nodeValue;
      const cleaned=v812ProductionText(old);
      if(cleaned && cleaned!==old.trim()) n.nodeValue=old.replace(old.trim(), cleaned);
    });
  }

  const v812ExportDataBase = exportData;
  exportData = function(){
    ensureV812State();
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='smartbooks-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup export started.');
  };

  const v812ResetStateBase = resetState;
  resetState = function(){
    if(!confirm('Reset company data in this browser? This cannot be undone unless you have exported a backup.')) return;
    state=structuredClone(initialState);
    ensureV812State();
    if(typeof ensureV8State==='function') try{ ensureV8State(); }catch(e){}
    saveState();
    renderAll();
    showToast('Company data reset.');
  };

  const v812HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='sign-out-demo'){ closeTopbarPanel(); showToast('Signed out of this company session. Browser data remains available.'); return; }
    return v812HandleActionBase(action,id);
  };

  const v812RenderAllBase = renderAll;
  renderAll = function(){
    ensureV812State();
    v812RenderAllBase();
    v812CleanVisibleText(document.body);
    const topCompany=document.getElementById('topCompanyName'); if(topCompany && /^\s*(sample company|demo company)\s*$/i.test(topCompany.textContent)) topCompany.textContent='Your Company';
    if(typeof updateInsightsBadge==='function') updateInsightsBadge();
  };

  const v812RenderPageBase = renderPage;
  renderPage = function(page){
    ensureV812State();
    v812RenderPageBase(page);
    v812CleanVisibleText(document.body);
  };

  // Update the top-panel insight badge/content to use the clearer tax explanation.
  if(typeof updateInsightsBadge==='function') updateInsightsBadge();



  // ---------- Dashboard shortcut carousel and button interaction polish ----------
  function injectDashboardShortcutStyles(){
    if(document.getElementById('dashboard-shortcut-style')) return;
    const style=document.createElement('style');
    style.id='dashboard-shortcut-style';
    style.textContent=`
      .app.sidebar-collapsed{grid-template-columns:66px 0 minmax(0,1fr)!important}
      .app.sidebar-collapsed .sidebar{width:0;min-width:0;padding:0;border:0;overflow:hidden;opacity:0;pointer-events:none}
      .app.sidebar-collapsed .main{min-width:0}
      .shortcut-shell{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;max-width:1280px;margin:0 auto}
      .shortcut-viewport{overflow:hidden;scroll-behavior:smooth;max-width:100%;flex:0 1 auto}
      .shortcut-track{display:flex;align-items:center;gap:10px;overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;padding:2px 2px 6px;max-width:calc(100vw - 360px)}
      .shortcut-track::-webkit-scrollbar{display:none}
      .shortcut-arrow,.shortcut-customize{width:40px;height:40px;border-radius:999px;border:1px solid var(--line,#dfe7ee);background:#fff;color:#0b335f;font-weight:900;display:grid;place-items:center;cursor:pointer;flex:0 0 auto;box-shadow:0 1px 2px rgba(16,24,40,.04)}
      .shortcut-arrow:hover,.shortcut-customize:hover{background:#eff8f2;border-color:#addabb;color:#0a6b32}
      .shortcut-arrow[disabled]{opacity:.35;cursor:not-allowed;pointer-events:none}
      .module-pill{white-space:nowrap;cursor:pointer;flex:0 0 auto}
      .shortcut-config-list{display:grid;gap:10px;margin-top:10px}
      .shortcut-config-row{display:grid;grid-template-columns:28px 38px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line,#dfe7ee);border-radius:14px;padding:10px 12px;background:var(--card,#fff)}
      .shortcut-config-row strong{display:block}.shortcut-config-row small{display:block;color:var(--muted,#667085);margin-top:2px}
      .shortcut-move{display:flex;gap:6px;align-items:center}.shortcut-move button{min-width:34px;height:34px;border-radius:10px;border:1px solid var(--line,#dfe7ee);background:transparent;cursor:pointer;font-weight:900}
      .create-actions-expanded{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 24px}
      .business-feed-modal{display:grid;gap:14px}.feed-filter-row{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 8px}.feed-filter-row .btn.active{background:#0a8f3c;color:#fff;border-color:#0a8f3c}.feed-full-list{display:grid;gap:12px}.feed-full-card{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--line,#dfe7ee);border-radius:16px;padding:14px;background:var(--card,#fff);cursor:pointer}.feed-full-card:hover{border-color:#9ccdb0;box-shadow:0 8px 20px rgba(15,23,42,.08);transform:translateY(-1px)}.feed-full-card .feed-badge{width:36px;height:36px;display:grid;place-items:center;border-radius:12px}
      body.v8-ui.dark-mode .shortcut-arrow,body.v8-ui.dark-mode .shortcut-customize{background:#14202d;border-color:#314255;color:#e7eef6}
      body.v8-ui.dark-mode .shortcut-arrow:hover,body.v8-ui.dark-mode .shortcut-customize:hover{background:#163044;border-color:#27956a;color:#fff}
      body.v8-ui.dark-mode .shortcut-config-row,body.v8-ui.dark-mode .feed-full-card{background:#172033;border-color:#334155;color:#f8fafc}
      body.v8-ui.dark-mode .shortcut-move button{border-color:#334155;color:#e7eef6}
      body.v8-ui.dark-mode .feed-full-card:hover{background:#1e293b;border-color:#3d5770;box-shadow:none}
      @media(max-width:900px){.shortcut-track{max-width:calc(100vw - 140px)}.shortcut-shell{justify-content:flex-start}.feed-full-card{grid-template-columns:38px minmax(0,1fr);}.feed-full-card .btn{grid-column:2/3;width:max-content}}
    `;
    document.head.appendChild(style);
  }

  const dashboardShortcutDefaults = ['sales','expenses','banking','reports','customers','inventory','taxes','projects','time','accounting','transactions'];
  function dashboardShortcutAvailableModules(){
    return masterModuleRegistry.filter(m=>!['dashboard','settings','setup','apps'].includes(m.id) && isModuleVisible(m.id));
  }
  function normalizeDashboardShortcuts(){
    state.settings ||= {};
    let saved = Array.isArray(state.settings.dashboardShortcuts) ? state.settings.dashboardShortcuts.slice() : [];
    saved = saved.map(id=>id==='products'?'inventory':id).filter((id,i,a)=>a.indexOf(id)===i);
    const available = dashboardShortcutAvailableModules().map(m=>m.id);
    if(!saved.length) saved = dashboardShortcutDefaults.filter(id=>available.includes(id));
    saved = saved.filter(id=>available.includes(id));
    if(!saved.length) saved = available.slice(0,8);
    state.settings.dashboardShortcuts = saved;
    state.settings.quickActionsExpanded = !!state.settings.quickActionsExpanded;
    state.settings.sidebarCollapsed = !!state.settings.sidebarCollapsed;
    return saved;
  }
  function shortcutModuleObjects(){
    const ids=normalizeDashboardShortcuts();
    return ids.map(id=>masterModuleRegistry.find(m=>m.id===id)).filter(Boolean);
  }
  function updateShortcutArrows(){
    const track=document.getElementById('shortcutTrack');
    if(!track) return;
    const left=document.querySelector('[data-action="shortcut-scroll"][data-dir="-1"]');
    const right=document.querySelector('[data-action="shortcut-scroll"][data-dir="1"]');
    const canLeft=track.scrollLeft>4;
    const canRight=track.scrollLeft + track.clientWidth < track.scrollWidth - 4;
    if(left) left.disabled=!canLeft;
    if(right) right.disabled=!canRight;
  }
  function renderModulePillsV814(){
    injectDashboardShortcutStyles();
    normalizeDashboardShortcuts();
    const mods=shortcutModuleObjects();
    const el=document.getElementById('modulePills');
    if(el){
      el.innerHTML = `<div class="shortcut-shell"><button class="shortcut-arrow" type="button" data-action="shortcut-scroll" data-dir="-1" aria-label="Previous shortcuts">â€¹</button><div class="shortcut-viewport"><div class="shortcut-track" id="shortcutTrack">${mods.map(m=>`<button class="module-pill ${currentPage===m.id?'active':''}" data-nav="${m.id}"><span class="module-icon">${m.icon}</span>${escapeHTML(m.label)}</button>`).join('')}</div></div><button class="shortcut-arrow" type="button" data-action="shortcut-scroll" data-dir="1" aria-label="More shortcuts">â€º</button><button class="shortcut-customize" type="button" data-modal="customizeShortcuts" title="Customize shortcuts" aria-label="Customize shortcuts">âš™</button></div>`;
      setTimeout(()=>{ const track=document.getElementById('shortcutTrack'); if(track){ track.addEventListener('scroll', updateShortcutArrows, {passive:true}); updateShortcutArrows(); } },0);
    }
    const hr=new Date().getHours(); const greeting=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
    const g=document.getElementById('greeting'); if(g) g.textContent=`${greeting}, Quak!`;
  }
  renderModulePills = renderModulePillsV814;

  function dashboardQuickActionDefs(){
    return [
      {label:'Get paid online', modal:'payment', module:'sales'},
      {label:'Create invoice', modal:'invoice', module:'sales'},
      {label:'Record expense', modal:'expense', module:'expenses'},
      {label:'Add bank deposit', modal:'deposit', module:'banking'},
      {label:'Create check', modal:'check', module:'expenses'},
      {label:'Create bill', modal:'bill', module:'expenses'},
      {label:'Pay bill', modal:'payBill', module:'expenses'},
      {label:'Create estimate', modal:'estimate', module:'sales'},
      {label:'Create sales order', modal:'salesOrder', module:'sales'},
      {label:'Create purchase order', modal:'purchaseOrder', module:'inventory'},
      {label:'Add product/service', modal:'product', module:'inventory'},
      {label:'Journal entry', modal:'journal', module:'accounting'},
      {label:'Transfer', modal:'transfer', module:'banking'},
      {label:'Reconcile', modal:'reconcile', module:'banking'},
      {label:'Add time', modal:'time', module:'time'}
    ].filter(a=>(!a.module || isModuleVisible(a.module)) && isModalAllowed(a.modal));
  }
  function quickActionsV814(){
    normalizeDashboardShortcuts();
    const all=dashboardQuickActionDefs();
    const expanded=!!state.settings.quickActionsExpanded;
    const shown=expanded?all:all.slice(0,5);
    return `<div class="quick-actions v8-actions create-actions-expanded"><strong>Create actions</strong>${shown.map(a=>`<button class="btn" data-modal="${a.modal}">${escapeHTML(a.label)}</button>`).join('')}<button class="btn soft" data-action="toggle-create-actions">${expanded?'Show less':'Show all'}</button></div>`;
  }
  quickActionsV8 = quickActionsV814;

  const v814RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    injectDashboardShortcutStyles();
    normalizeDashboardShortcuts();
    const page=document.getElementById('page-dashboard');
    if(!page) return v814RenderDashboardBase();
    page.innerHTML = `
      <div class="hero v8-hero"><h2 id="greeting">Welcome back</h2><div class="pill-row" id="modulePills"></div></div>
      <div class="feed-header"><h3>âœ¦ Business Feed</h3><button class="btn soft" data-action="view-all-feed">View all</button></div>
      <div id="businessFeed"></div>
      ${quickActionsV814()}
      <div class="section-header"><div><h2>Business at a glance</h2><p>Clean summary of receivables, deposits, bank balances, profit, expenses, and setup items.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-modal="customizeDashboard">âš™ Customize</button><button class="btn" data-action="toggle-privacy">â—‰ Privacy</button><button class="btn square" data-action="refresh-dashboard">â†» Refresh</button></div></div>
      <div class="v8-dashboard-grid">
        <div class="v8-main-col">
          <div class="card" id="funnelWidget"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap"><h3 style="margin:0">Sales & Get Paid Funnel</h3><select id="dashRange" class="table-search" style="min-width:140px;padding:7px 10px"><option>This month</option><option>Last 30 days</option><option>Quarter to date</option></select></div><div class="funnel" id="funnelCards"></div></div>
          <div class="grid two"><div class="card" id="plCard"></div><div class="card" id="expensesCard"></div></div>
          <div class="card table-card" id="recentTransactions"></div>
        </div>
        <div class="v8-side-col">
          <div class="card" id="bankCard"></div>
          <div class="card" id="cashFlowCard"></div>
          <div class="card" id="setupCard"></div>
          <div class="v8-add-widget-card"><div class="plus">ï¼‹</div><strong>Add widgets</strong><p class="muted">Show sales, cash flow, A/R, A/P, inventory, or tax cards from Customize.</p><button class="btn" data-modal="customizeDashboard">Customize dashboard</button></div>
        </div>
      </div>`;
    renderModulePills(); const t=totals(); renderBusinessFeed(t); renderFunnel(t); renderPLCard(t); renderExpensesCard(); renderRecentTransactions(); renderBankCard(t); renderCashFlowCard(t); renderSetupCard();
    applyDashboardPrefs(); applyQuickActionVisibility(page); cleanProductLanguageInDOM(page);
  };

  function businessFeedFullItems(){
    const map={bank:'Banking',overdue:'Sales',ap:'Expenses',taxes:'Taxes',stock:'Products & Services',match:'Products & Services',balanced:'Accounting',cash:'Banking'};
    const items=(typeof v88VisibleInsights==='function'?v88VisibleInsights():smartInsights()).map(x=>({...x, category:map[x.id]||'General'}));
    return items.length?items:[{id:'none',icon:'âœ“',title:'No urgent insights right now',msg:'Your business data looks up to date.',label:'Open dashboard',module:'dashboard',category:'General'}];
  }
  function renderBusinessFeedModal(filter='all'){
    const items=businessFeedFullItems();
    const cats=['all',...Array.from(new Set(items.map(i=>i.category)))];
    const filtered=filter==='all'?items:items.filter(i=>i.category===filter);
    return `<div class="business-feed-modal"><div class="feed-filter-row">${cats.map(c=>`<button type="button" class="btn ${c===filter?'active':''}" data-action="feed-filter" data-id="${escapeHTML(c)}">${escapeHTML(c==='all'?'All':c)}</button>`).join('')}</div><div class="feed-full-list">${filtered.map(x=>`<div class="feed-full-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><span class="feed-badge">${escapeHTML(x.icon)}</span><div><strong>${escapeHTML(x.title)}</strong><p class="muted" style="margin:4px 0 0">${escapeHTML(x.msg)}</p></div><button type="button" class="btn primary" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div>`).join('')}</div></div>`;
  }
  function shortcutCustomizeBody(){
    normalizeDashboardShortcuts();
    const saved=state.settings.dashboardShortcuts || [];
    const avail=dashboardShortcutAvailableModules();
    const ordered=[...saved.map(id=>avail.find(m=>m.id===id)).filter(Boolean), ...avail.filter(m=>!saved.includes(m.id))];
    return `<p class="muted">Choose which shortcuts appear on the dashboard and move the most-used modules first. Left menu visibility is controlled separately.</p><div class="shortcut-config-list">${ordered.map(m=>`<div class="shortcut-config-row" data-shortcut-id="${m.id}"><input type="checkbox" name="shortcut" value="${m.id}" ${saved.includes(m.id)?'checked':''}><span class="module-icon" style="width:32px;height:32px">${m.icon}</span><div><strong>${escapeHTML(m.label)}</strong><small>${m.id==='inventory'?'Products, services, POs, receiving, and sales orders.':'Dashboard shortcut button.'}</small></div><div class="shortcut-move"><button type="button" data-action="shortcut-move" data-dir="up">â†‘</button><button type="button" data-action="shortcut-move" data-dir="down">â†“</button></div></div>`).join('')}</div><div class="tax-form-note">Hidden menu modules are not available as dashboard shortcuts. You can restore them from Customize menu.</div>`;
  }

  const v814OpenModalBase = openModal;
  openModal = function(type){
    injectDashboardShortcutStyles();
    currentModal=type;
    if(type==='customizeShortcuts'){
      document.getElementById('modalTitle').textContent='Customize dashboard shortcuts';
      document.getElementById('modalSubtitle').textContent='Add, remove, and reorder the shortcut buttons shown at the top of the dashboard.';
      document.getElementById('modalBody').innerHTML=shortcutCustomizeBody();
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" data-action="shortcut-reset">Restore default</button><button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
      document.getElementById('modalBackdrop').classList.add('open');
      return;
    }
    if(type==='businessFeedAll'){
      document.getElementById('modalTitle').textContent='Business Feed';
      document.getElementById('modalSubtitle').textContent='Review all insight cards and jump to the related workflow.';
      document.getElementById('modalBody').innerHTML=renderBusinessFeedModal('all');
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Close</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
      document.getElementById('modalBackdrop').classList.add('open');
      return;
    }
    return v814OpenModalBase(type);
  };

  const v814SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeShortcuts'){
      e.preventDefault();
      const ids=Array.from(document.querySelectorAll('.shortcut-config-row')).filter(row=>row.querySelector('input[name="shortcut"]')?.checked).map(row=>row.dataset.shortcutId);
      const available=dashboardShortcutAvailableModules().map(m=>m.id);
      state.settings.dashboardShortcuts=(ids.length?ids:dashboardShortcutDefaults).filter(id=>available.includes(id));
      saveState(); closeModal(); renderAll(); showToast('Dashboard shortcuts updated.'); return;
    }
    if(currentModal==='businessFeedAll'){ e.preventDefault(); closeModal(); return; }
    return v814SubmitModalBase(e);
  };

  const v814HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='shortcut-scroll'){
      const dir=Number(event?.target?.closest('[data-action="shortcut-scroll"]')?.dataset?.dir || 1);
      const track=document.getElementById('shortcutTrack'); if(track){ track.scrollBy({left:dir*(Math.max(220, track.clientWidth*0.65)), behavior:'smooth'}); setTimeout(updateShortcutArrows,220); }
      return;
    }
    if(action==='toggle-create-actions'){
      state.settings ||= {}; state.settings.quickActionsExpanded=!state.settings.quickActionsExpanded; saveState(); renderDashboard(); return;
    }
    if(action==='view-all-feed'){
      openModal('businessFeedAll'); return;
    }
    if(action==='feed-filter'){
      const body=document.getElementById('modalBody'); if(body) body.innerHTML=renderBusinessFeedModal(id||'all'); return;
    }
    if(action==='shortcut-move'){
      const btn=event?.target?.closest('[data-action="shortcut-move"]'); const row=btn?.closest('.shortcut-config-row'); if(row){ const dir=btn.dataset.dir; if(dir==='up' && row.previousElementSibling) row.parentNode.insertBefore(row,row.previousElementSibling); if(dir==='down' && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling,row); }
      return;
    }
    if(action==='shortcut-reset'){
      const available=dashboardShortcutAvailableModules().map(m=>m.id); state.settings.dashboardShortcuts=dashboardShortcutDefaults.filter(id=>available.includes(id)); document.getElementById('modalBody').innerHTML=shortcutCustomizeBody(); showToast('Default shortcuts restored. Save to apply.'); return;
    }
    return v814HandleActionBase(action,id);
  };

  function applySidebarCollapsedState(){
    const app=document.querySelector('.app'); if(!app) return;
    app.classList.toggle('sidebar-collapsed', !!state.settings?.sidebarCollapsed);
    const btn=document.getElementById('sidebarToggle'); if(btn){ btn.title=state.settings?.sidebarCollapsed?'Expand menu':'Collapse menu'; btn.setAttribute('aria-label',btn.title); }
  }
  function toggleSidebarCollapsed(){
    state.settings ||= {}; state.settings.sidebarCollapsed=!state.settings.sidebarCollapsed; saveState(); applySidebarCollapsedState(); setTimeout(updateShortcutArrows,120);
  }

  const v814SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v814SetupEventListenersBase();
    const old=document.getElementById('sidebarToggle');
    if(old){ const clone=old.cloneNode(true); old.parentNode.replaceChild(clone, old); clone.addEventListener('click', toggleSidebarCollapsed); }
    document.addEventListener('keydown', e=>{
      const row=e.target.closest?.('.feed-full-card,.shortcut-config-row');
      if(row && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); row.click(); }
    });
  };

  const v814RenderAllBase = renderAll;
  renderAll = function(){
    injectDashboardShortcutStyles(); normalizeDashboardShortcuts(); v814RenderAllBase(); applySidebarCollapsedState(); updateShortcutArrows();
  };



  // ---------- V8.15 Bookmarks and Business Feed Customization ----------
  function injectV815Styles(){
    if(document.getElementById('v815-style')) return;
    const style=document.createElement('style');
    style.id='v815-style';
    style.textContent=`
      .side-title.bookmark-title{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .side-title.bookmark-title .link-btn{border:0;background:transparent;color:inherit;font-size:12px;font-weight:800;cursor:pointer;padding:2px 4px;border-radius:8px;opacity:.76}
      .side-title.bookmark-title .link-btn:hover{background:rgba(10,143,60,.12);opacity:1}
      .bookmark-row .remove-bookmark{margin-left:auto;border:0;background:transparent;color:inherit;opacity:.54;cursor:pointer;border-radius:8px;padding:2px 6px;font-weight:900}
      .bookmark-row .remove-bookmark:hover{background:rgba(217,65,65,.12);color:#d94141;opacity:1}
      .bookmark-config-list,.feed-config-list{display:grid;gap:10px;margin-top:12px}
      .bookmark-config-row,.feed-config-row{display:grid;grid-template-columns:28px 36px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line,#dfe7ee);border-radius:14px;padding:10px 12px;background:var(--card,#fff)}
      .bookmark-config-row strong,.feed-config-row strong{display:block}.bookmark-config-row small,.feed-config-row small{display:block;color:var(--muted,#667085);margin-top:2px;line-height:1.25}
      .bookmark-move{display:flex;gap:6px;align-items:center}.bookmark-move button{min-width:34px;height:34px;border-radius:10px;border:1px solid var(--line,#dfe7ee);background:transparent;cursor:pointer;font-weight:900}
      .feed-header .feed-header-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .feed-card,.feed-full-card,.panel-card.insight-card{cursor:pointer}
      .feed-card:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(15,23,42,.08)}
      .feed-card .hide-feed-btn{position:absolute;top:8px;right:8px;border:0;background:transparent;color:#667085;cursor:pointer;border-radius:8px;padding:2px 6px;font-weight:900;opacity:.72}
      .feed-card .hide-feed-btn:hover{background:rgba(217,65,65,.12);color:#d94141;opacity:1}
      .feed-card{position:relative}
      .feed-empty-card{border:1px dashed var(--line,#dfe7ee);border-radius:16px;padding:18px;background:rgba(10,143,60,.04);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .feed-category-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#dfe7ee);border-radius:999px;padding:6px 10px;background:var(--card,#fff);font-weight:800;font-size:12px}
      body.v8-ui.dark-mode .bookmark-config-row,body.v8-ui.dark-mode .feed-config-row{background:#172033;border-color:#334155;color:#f8fafc}
      body.v8-ui.dark-mode .bookmark-move button{border-color:#334155;color:#e7eef6}
      body.v8-ui.dark-mode .feed-empty-card{background:#122235;border-color:#334155;color:#f8fafc}
      body.v8-ui.dark-mode .feed-category-pill{background:#172033;border-color:#334155;color:#e8edf3}
      body.v8-ui.dark-mode .feed-card .hide-feed-btn{color:#cbd5e1}
      body.v8-ui.dark-mode .feed-card .hide-feed-btn:hover{background:rgba(248,113,113,.16);color:#fecaca}
      @media(max-width:720px){.bookmark-config-row,.feed-config-row{grid-template-columns:28px 32px minmax(0,1fr)}.bookmark-move{grid-column:3/4}.feed-header .feed-header-actions{width:100%}}
    `;
    document.head.appendChild(style);
  }

  const v815FeedCategories = [
    {id:'banking', label:'Banking', icon:'â—‰', desc:'Bank-feed review, matching, clearing, and reconciliation.'},
    {id:'sales', label:'Sales / invoices', icon:'â†—', desc:'Open receivables, overdue invoices, payments, and estimates.'},
    {id:'expenses', label:'Expenses / bills', icon:'â–¸', desc:'Vendor bills, payments, approvals, and due-date reminders.'},
    {id:'taxes', label:'Taxes', icon:'â—–', desc:'GST/HST return, credit/payable, and tax-code review.'},
    {id:'inventory', label:'Products & Services', icon:'â—¼', desc:'Low stock, inventory attention, and item setup.'},
    {id:'matching', label:'Purchase matching', icon:'â‡„', desc:'PO, receiving, vendor bill, and three-way match alerts.'},
    {id:'accounting', label:'Accounting', icon:'â–¤', desc:'Trial balance, journal review, and accounting checks.'},
    {id:'cash', label:'Cash flow', icon:'$', desc:'Cash position, net movement, and bank balances.'},
    {id:'setup', label:'Setup / admin', icon:'âœ“', desc:'Company setup, preferences, and backup reminders.'}
  ];
  const v815FeedCategoryMap = {bank:'banking', overdue:'sales', ap:'expenses', taxes:'taxes', stock:'inventory', match:'matching', balanced:'accounting', cash:'cash', none:'setup'};
  const v815DefaultFeedCategories = v815FeedCategories.map(c=>c.id);

  function ensureV815State(){
    try{ if(typeof ensureV812State==='function') ensureV812State(); else if(typeof ensureV810State==='function') ensureV810State(); }catch(e){}
    state.settings ||= {};
    if(!Array.isArray(state.settings.businessFeedCategories) || !state.settings.businessFeedCategories.length){ state.settings.businessFeedCategories = v815DefaultFeedCategories.slice(); }
    state.settings.businessFeedCategories = state.settings.businessFeedCategories.filter((id,i,a)=>v815DefaultFeedCategories.includes(id) && a.indexOf(id)===i);
    if(!state.settings.businessFeedCategories.length) state.settings.businessFeedCategories = v815DefaultFeedCategories.slice();
    if(!Array.isArray(state.settings.hiddenFeedInsights)) state.settings.hiddenFeedInsights = [];
    state.settings.hiddenFeedInsights = state.settings.hiddenFeedInsights.filter((id,i,a)=>id && a.indexOf(id)===i);
    if(!Array.isArray(state.settings.bookmarks) || !state.settings.bookmarks.length){ state.settings.bookmarks = ['dashboard','reports-favorites']; }
    state.settings.bookmarks = state.settings.bookmarks.map(id=>id==='products'?'inventory':id).filter((id,i,a)=>a.indexOf(id)===i);
  }

  function bookmarkCatalog(){
    ensureV815State();
    const base = [
      {id:'dashboard', label:'Dashboard', icon:'âŒ‚', nav:'dashboard', desc:'Main business overview.'},
      {id:'reports-favorites', label:'Favorite reports', icon:'â†—', nav:'reports', desc:'Reports & Analytics favorites.'},
      {id:'banking', label:'Banking', icon:'â—‰', nav:'banking', desc:'Banking Center and reconciliation.'},
      {id:'sales', label:'Sales & Get Paid', icon:'â†—', nav:'sales', desc:'Invoices, payments, and sales orders.'},
      {id:'customers', label:'Customers & Leads', icon:'â˜˜', nav:'customers', desc:'Customer profiles and open balances.'},
      {id:'expenses', label:'Expenses & Pay Bills', icon:'â–¸', nav:'expenses', desc:'Bills, expenses, and AP workflow.'},
      {id:'vendors', label:'Vendors', icon:'â–¡', nav:'vendors', desc:'Supplier profiles and purchase activity.'},
      {id:'reports', label:'Reports', icon:'â˜·', nav:'reports', desc:'Reports & Analytics center.'},
      {id:'inventory', label:'Products & Services', icon:'â—¼', nav:'inventory', desc:'Services, inventory, POs, and sales orders.'},
      {id:'taxes', label:'Taxes', icon:'â—–', nav:'taxes', desc:'Tax Center and returns.'},
      {id:'accounting', label:'Accounting', icon:'â–¤', nav:'accounting', desc:'Chart of accounts and trial balance.'},
      {id:'transactions', label:'Transactions', icon:'â‡„', nav:'transactions', desc:'All transaction activity.'},
      {id:'projects', label:'Projects', icon:'â—†', nav:'projects', desc:'Project budgets and profitability.'},
      {id:'time', label:'Time', icon:'â—·', nav:'time', desc:'Time entries and billable work.'},
      {id:'payroll', label:'Payroll & HR', icon:'â™¢', nav:'payroll', desc:'Payroll and employee setup.'},
      {id:'setup', label:'Setup Checklist', icon:'âœ“', nav:'setup', desc:'Guided setup tasks.'},
      {id:'apps', label:'My Apps', icon:'â–©', nav:'apps', desc:'Enabled module launcher.'},
      {id:'settings', label:'Settings', icon:'âš™', nav:'settings', desc:'Company and app controls.'}
    ];
    return base.filter(b=>canNavigate(b.nav));
  }
  function bookmarkById(id){ return bookmarkCatalog().find(b=>b.id===id); }
  function normalizeBookmarks(){
    ensureV815State();
    const allowed=new Set(bookmarkCatalog().map(b=>b.id));
    let ids=(state.settings.bookmarks||[]).filter(id=>allowed.has(id));
    if(!ids.length) ids=['dashboard','reports-favorites'].filter(id=>allowed.has(id));
    state.settings.bookmarks=ids;
    return ids;
  }
  function findBookmarksTitle(){
    return Array.from(document.querySelectorAll('.side-title')).find(el=>/^\s*bookmarks\s*$/i.test(el.textContent.replace(/Manage/i,'').trim())) || null;
  }
  function renderBookmarks(){
    injectV815Styles(); normalizeBookmarks();
    const title=findBookmarksTitle(); if(!title) return;
    title.classList.add('bookmark-title');
    title.innerHTML='<span>Bookmarks</span><button class="link-btn" type="button" data-modal="manageBookmarks">Manage</button>';
    const group=title.nextElementSibling; if(!group || !group.classList.contains('nav-group')) return;
    const ids=normalizeBookmarks();
    group.innerHTML = ids.map(id=>bookmarkById(id)).filter(Boolean).map(b=>`<button class="nav-item bookmark-row ${currentPage===b.nav?'active':''}" data-nav="${b.nav}"><span class="dot">${b.icon}</span>${escapeHTML(b.label)}<button class="remove-bookmark" type="button" data-action="remove-bookmark" data-id="${escapeHTML(b.id)}" title="Remove bookmark" aria-label="Remove ${escapeHTML(b.label)} bookmark">Ã—</button></button>`).join('') || `<div class="empty small">No bookmarks selected.</div>`;
  }
  function bookmarkManageBody(){
    const saved=normalizeBookmarks();
    const catalog=bookmarkCatalog();
    const ordered=[...saved.map(id=>catalog.find(b=>b.id===id)).filter(Boolean), ...catalog.filter(b=>!saved.includes(b.id))];
    return `<p class="muted">Choose the shortcuts that appear under Bookmarks. Bookmarks are separate from the main menu.</p><div class="bookmark-config-list">${ordered.map(b=>`<div class="bookmark-config-row" data-bookmark-id="${escapeHTML(b.id)}"><input type="checkbox" name="bookmark" value="${escapeHTML(b.id)}" ${saved.includes(b.id)?'checked':''}><span class="module-icon" style="width:32px;height:32px">${b.icon}</span><div><strong>${escapeHTML(b.label)}</strong><small>${escapeHTML(b.desc)}</small></div><div class="bookmark-move"><button type="button" data-action="bookmark-move" data-dir="up">â†‘</button><button type="button" data-action="bookmark-move" data-dir="down">â†“</button></div></div>`).join('')}</div><div class="tax-form-note">If a module is hidden from the main menu, its bookmark is hidden until the module is restored.</div>`;
  }

  function feedCategoryForInsight(item){ return v815FeedCategoryMap[item.id] || item.categoryId || 'setup'; }
  function allFeedInsightsRaw(){
    const list=(typeof v88VisibleInsights==='function'?v88VisibleInsights():(typeof smartInsights==='function'?smartInsights():[])) || [];
    return list.map(x=>({...x, categoryId:feedCategoryForInsight(x), category:(v815FeedCategories.find(c=>c.id===feedCategoryForInsight(x))?.label || 'General')}));
  }
  function filteredFeedInsights(){
    ensureV815State();
    const cats=new Set(state.settings.businessFeedCategories || v815DefaultFeedCategories);
    const hidden=new Set(state.settings.hiddenFeedInsights || []);
    return allFeedInsightsRaw().filter(x=>cats.has(x.categoryId) && !hidden.has(x.id));
  }
  businessFeedFullItems = function(){
    const items=filteredFeedInsights();
    return items.length?items:[{id:'none',icon:'âœ“',title:'No feed cards selected',msg:'Choose feed categories from Customize feed to show alerts and insights.',label:'Customize feed',module:'dashboard',nav:'dashboard',categoryId:'setup',category:'Setup / admin'}];
  };
  function renderBusinessFeedCards(){
    const items=filteredFeedInsights().slice(0,4);
    const feed=document.getElementById('businessFeed'); if(!feed) return;
    if(!items.length){
      feed.innerHTML=`<div class="feed-empty-card"><div><strong>No Business Feed cards are selected</strong><div class="muted small">Use Customize feed to add banking, sales, tax, inventory, or accounting insights.</div></div><button class="btn primary" data-modal="customizeFeed">Customize feed</button></div>`;
      return;
    }
    feed.innerHTML=`<div class="feed-row">${items.map(x=>`<div class="feed-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><button class="hide-feed-btn" type="button" data-action="hide-feed-card" data-id="${escapeHTML(x.id)}" title="Hide this card" aria-label="Hide ${escapeHTML(x.title)}">Ã—</button><div class="feed-title"><span class="feed-badge">${escapeHTML(x.icon)}</span>${escapeHTML(x.title)}</div><p>${escapeHTML(x.msg)}</p><button class="btn soft" type="button" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div>`).join('')}</div>`;
  }
  const v815RenderBusinessFeedBase = renderBusinessFeed;
  renderBusinessFeed = function(t){ renderBusinessFeedCards(); };
  function ensureFeedHeaderControls(){
    const header=document.querySelector('#page-dashboard .feed-header'); if(!header) return;
    if(header.querySelector('.feed-header-actions')) return;
    const view=header.querySelector('[data-action="view-all-feed"]');
    const actions=document.createElement('div'); actions.className='feed-header-actions';
    if(view) actions.appendChild(view);
    actions.insertAdjacentHTML('beforeend','<button class="btn" type="button" data-modal="customizeFeed">Customize feed</button>');
    header.appendChild(actions);
  }
  const v815RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    v815RenderDashboardBase();
    ensureV815State(); injectV815Styles(); ensureFeedHeaderControls(); renderBusinessFeedCards(); renderBookmarks();
  };

  function renderBusinessFeedModal(filter='all'){
    ensureV815State();
    const all=businessFeedFullItems();
    const cats=['all',...Array.from(new Set(all.map(i=>i.category)))];
    const filtered=filter==='all'?all:all.filter(i=>i.category===filter);
    return `<div class="business-feed-modal"><div class="feed-filter-row">${cats.map(c=>`<button type="button" class="btn ${c===filter?'active':''}" data-action="feed-filter" data-id="${escapeHTML(c)}">${escapeHTML(c==='all'?'All':c)}</button>`).join('')}<button type="button" class="btn" data-modal="customizeFeed">Customize feed</button></div><div class="feed-full-list">${filtered.map(x=>`<div class="feed-full-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><span class="feed-badge">${escapeHTML(x.icon)}</span><div><span class="feed-category-pill">${escapeHTML(x.category)}</span><strong style="display:block;margin-top:8px">${escapeHTML(x.title)}</strong><p class="muted" style="margin:4px 0 0">${escapeHTML(x.msg)}</p></div><button type="button" class="btn primary" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div>`).join('')}</div></div>`;
  }
  function customizeFeedBody(){
    ensureV815State();
    const selected=new Set(state.settings.businessFeedCategories || v815DefaultFeedCategories);
    const hidden=new Set(state.settings.hiddenFeedInsights || []);
    const insights=allFeedInsightsRaw();
    const hiddenRows=insights.filter(i=>hidden.has(i.id));
    return `<p class="muted">Choose which insight categories appear in Business Feed and Smart Insights. Hidden categories do not delete data; they only reduce dashboard noise.</p><h4>Feed categories</h4><div class="feed-config-list">${v815FeedCategories.map(c=>`<label class="feed-config-row"><input type="checkbox" name="feedCategory" value="${c.id}" ${selected.has(c.id)?'checked':''}><span class="module-icon" style="width:32px;height:32px">${c.icon}</span><div><strong>${escapeHTML(c.label)}</strong><small>${escapeHTML(c.desc)}</small></div><span></span></label>`).join('')}</div><h4 style="margin-top:18px">Hidden cards</h4>${hiddenRows.length?`<div class="feed-config-list">${hiddenRows.map(i=>`<div class="feed-config-row"><input type="checkbox" name="restoreFeedInsight" value="${escapeHTML(i.id)}"><span class="module-icon" style="width:32px;height:32px">${escapeHTML(i.icon)}</span><div><strong>${escapeHTML(i.title)}</strong><small>${escapeHTML(i.msg)}</small></div><span class="muted small">Restore</span></div>`).join('')}</div>`:`<div class="empty">No individual cards are hidden.</div>`}<div class="tax-form-note">Use the Ã— on a feed card to hide that single card. Use Restore defaults to show all categories and cards again.</div>`;
  }

  const v815OpenModalBase = openModal;
  openModal = function(type){
    ensureV815State(); injectV815Styles(); currentModal=type;
    if(type==='manageBookmarks'){
      document.getElementById('modalTitle').textContent='Manage bookmarks';
      document.getElementById('modalSubtitle').textContent='Add, remove, and reorder quick links in the sidebar.';
      document.getElementById('modalBody').innerHTML=bookmarkManageBody();
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" data-action="bookmark-add-current">Bookmark current page</button><button type="button" class="btn" data-action="bookmark-reset">Restore default</button><button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
      document.getElementById('modalBackdrop').classList.add('open');
      return;
    }
    if(type==='customizeFeed'){
      document.getElementById('modalTitle').textContent='Customize Business Feed';
      document.getElementById('modalSubtitle').textContent='Choose which alerts and insight categories appear on the dashboard.';
      document.getElementById('modalBody').innerHTML=customizeFeedBody();
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" data-action="feed-reset">Restore default</button><button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
      document.getElementById('modalBackdrop').classList.add('open');
      return;
    }
    return v815OpenModalBase(type);
  };

  const v815SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='manageBookmarks'){
      e.preventDefault();
      const ids=Array.from(document.querySelectorAll('.bookmark-config-row')).filter(row=>row.querySelector('input[name="bookmark"]')?.checked).map(row=>row.dataset.bookmarkId);
      const allowed=new Set(bookmarkCatalog().map(b=>b.id));
      state.settings.bookmarks=(ids.length?ids:['dashboard']).filter(id=>allowed.has(id));
      saveState(); closeModal(); renderAll(); showToast('Bookmarks updated.'); return;
    }
    if(currentModal==='customizeFeed'){
      e.preventDefault();
      const cats=Array.from(document.querySelectorAll('input[name="feedCategory"]:checked')).map(i=>i.value).filter(id=>v815DefaultFeedCategories.includes(id));
      const restore=Array.from(document.querySelectorAll('input[name="restoreFeedInsight"]:checked')).map(i=>i.value);
      state.settings.businessFeedCategories=cats.length?cats:v815DefaultFeedCategories.slice();
      state.settings.hiddenFeedInsights=(state.settings.hiddenFeedInsights||[]).filter(id=>!restore.includes(id));
      saveState(); closeModal(); renderAll(); showToast('Business Feed updated.'); return;
    }
    return v815SubmitModalBase(e);
  };

  const v815HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='remove-bookmark'){
      state.settings.bookmarks=(state.settings.bookmarks||[]).filter(x=>x!==id); saveState(); renderBookmarks(); showToast('Bookmark removed.'); return;
    }
    if(action==='bookmark-move'){
      const btn=event?.target?.closest('[data-action="bookmark-move"]'); const row=btn?.closest('.bookmark-config-row'); if(row){ const dir=btn.dataset.dir; if(dir==='up' && row.previousElementSibling) row.parentNode.insertBefore(row,row.previousElementSibling); if(dir==='down' && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling,row); } return;
    }
    if(action==='bookmark-reset'){
      state.settings.bookmarks=['dashboard','reports-favorites'].filter(id=>bookmarkById(id)); const body=document.getElementById('modalBody'); if(body) body.innerHTML=bookmarkManageBody(); showToast('Default bookmarks restored. Save to apply.'); return;
    }
    if(action==='bookmark-add-current'){
      const catalog=bookmarkCatalog(); const current=catalog.find(b=>b.nav===currentPage) || catalog.find(b=>b.id==='dashboard');
      if(current && !state.settings.bookmarks.includes(current.id)) state.settings.bookmarks.push(current.id);
      const body=document.getElementById('modalBody'); if(body) body.innerHTML=bookmarkManageBody(); showToast('Current page added. Save to apply.'); return;
    }
    if(action==='hide-feed-card'){
      const ev=event; if(ev){ ev.preventDefault(); ev.stopPropagation(); }
      state.settings.hiddenFeedInsights ||= []; if(id && !state.settings.hiddenFeedInsights.includes(id)) state.settings.hiddenFeedInsights.push(id);
      saveState(); renderDashboard(); showToast('Feed card hidden. Restore it from Customize feed.'); return;
    }
    if(action==='feed-reset'){
      state.settings.businessFeedCategories=v815DefaultFeedCategories.slice(); state.settings.hiddenFeedInsights=[]; const body=document.getElementById('modalBody'); if(body) body.innerHTML=customizeFeedBody(); showToast('Default feed restored. Save to apply.'); return;
    }
    return v815HandleActionBase(action,id);
  };

  const v815RenderMenuBase = renderMenu;
  renderMenu = function(){ v815RenderMenuBase(); renderBookmarks(); };
  const v815RenderAllBase = renderAll;
  renderAll = function(){ injectV815Styles(); ensureV815State(); v815RenderAllBase(); renderBookmarks(); ensureFeedHeaderControls(); };


  // ---------- V8.16 Bookmarks + Business Feed Customization Logic Fix ----------
  function injectV816CustomizationStyles(){
    if(document.getElementById('v816-feed-bookmark-logic-styles')) return;
    const style=document.createElement('style');
    style.id='v816-feed-bookmark-logic-styles';
    style.textContent=`
      .remove-bookmark,.hide-feed-btn{display:none!important}
      .bookmark-row{grid-template-columns:36px minmax(0,1fr)!important}
      .bookmark-row .dot{pointer-events:none}
      .v816-feed-note{border:1px solid #bfdbfe;background:#eff6ff;color:#12345b;border-radius:14px;padding:12px 14px;margin:10px 0 14px;line-height:1.4}
      .v816-feed-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px}
      .v816-feed-section{border:1px solid var(--line,#dfe7ee);border-radius:18px;padding:14px;background:var(--card,#fff)}
      .v816-feed-section h4{margin:0 0 4px;font-size:15px}.v816-feed-section p{margin:0 0 12px}
      .v816-category-list,.v816-card-list{display:grid;gap:10px}
      .v816-category-row,.v816-card-row{display:grid;grid-template-columns:28px 36px minmax(0,1fr);gap:10px;align-items:center;border:1px solid var(--line,#dfe7ee);border-radius:14px;padding:10px 12px;background:var(--card,#fff)}
      .v816-category-row strong,.v816-card-row strong{display:block}.v816-category-row small,.v816-card-row small{display:block;color:var(--muted,#667085);margin-top:2px;line-height:1.25}
      .v816-category-row.disabled{opacity:.55;background:#f8fafc}.v816-category-row.disabled input{cursor:not-allowed}.v816-category-row.disabled .module-icon{filter:grayscale(.4)}
      .v816-disabled-reason{display:inline-flex;margin-top:5px;font-size:12px;color:#b45309;background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:3px 8px;font-weight:800}
      .v816-priority-panel{border:1px solid var(--line,#dfe7ee);border-radius:18px;padding:14px;background:var(--card,#fff);margin-top:14px}
      .v816-priority-options{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.v816-priority-options label{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line,#dfe7ee);border-radius:999px;padding:9px 12px;font-weight:800;background:var(--card,#fff)}
      .v816-hidden-section{margin-top:14px}.v816-hidden-section h4{margin:0 0 8px}
      .modal-footer{position:sticky;bottom:0;z-index:6;box-shadow:0 -8px 24px rgba(16,24,40,.06)}
      .feed-card{cursor:pointer}.feed-card:focus-visible,.bookmark-row:focus-visible{outline:3px solid rgba(10,143,60,.22);outline-offset:2px}
      body.v8-ui.dark-mode .v816-feed-note{background:#122235;border-color:#334155;color:#dbeafe}
      body.v8-ui.dark-mode .v816-feed-section,body.v8-ui.dark-mode .v816-category-row,body.v8-ui.dark-mode .v816-card-row,body.v8-ui.dark-mode .v816-priority-panel,body.v8-ui.dark-mode .v816-priority-options label{background:#172033;border-color:#334155;color:#f8fafc}
      body.v8-ui.dark-mode .v816-category-row.disabled{background:#111827;color:#94a3b8}
      body.v8-ui.dark-mode .v816-disabled-reason{background:#2a1d11;border-color:#7c4a14;color:#fdba74}
      @media(max-width:860px){.v816-feed-grid{grid-template-columns:1fr}.modal-footer{flex-wrap:wrap}.v816-priority-options{display:grid}}
    `;
    document.head.appendChild(style);
  }

  const v816FeedCategories = [
    {id:'banking', label:'Banking', icon:'â—‰', desc:'Bank review, matching, clearing, and reconciliation.', module:'banking'},
    {id:'sales', label:'Sales & Invoices', icon:'â†—', desc:'Open receivables, overdue invoices, payments, and estimates.', module:'sales'},
    {id:'expenses', label:'Expenses & Bills', icon:'â–¸', desc:'Vendor bills, payments, approvals, and due-date reminders.', module:'expenses'},
    {id:'taxes', label:'Taxes', icon:'â—–', desc:'GST/HST return, credit/payable, and tax-code review.', module:'taxes'},
    {id:'inventory', label:'Products & Services', icon:'â—¼', desc:'Low stock, inventory attention, and item setup.', module:'inventory', requiresInventoryMode:true},
    {id:'matching', label:'Purchase Matching', icon:'â‡„', desc:'PO, receiving, vendor bill, and three-way match alerts.', module:'inventory', requiresPurchaseMode:true},
    {id:'accounting', label:'Accounting', icon:'â–¤', desc:'Trial balance, journal review, and accounting checks.', module:'accounting'},
    {id:'cash', label:'Cash Flow', icon:'$', desc:'Cash position, net movement, and bank balances.', module:'banking'},
    {id:'setup', label:'Setup & Admin', icon:'âœ“', desc:'Company setup, preferences, and backup reminders.', module:'settings'}
  ];
  const v816CategoryMap = {bank:'banking', overdue:'sales', ap:'expenses', taxes:'taxes', stock:'inventory', match:'matching', balanced:'accounting', cash:'cash', none:'setup'};
  const v816DefaultCategories = v816FeedCategories.map(c=>c.id);

  function v816Mode(){ try{return typeof itemMode==='function' ? itemMode() : 'mixed';}catch(e){return 'mixed';} }
  function v816CategoryStatus(cat){
    const mode=v816Mode();
    if(cat.module && cat.module!=='settings' && typeof isModuleVisible==='function' && !isModuleVisible(cat.module)) return {available:false, reason:`${cat.label} module is hidden`};
    if(cat.requiresInventoryMode && !['products','mixed'].includes(mode)) return {available:false, reason:'Not available in the current item setup'};
    if(cat.requiresPurchaseMode && !['products','mixed'].includes(mode)) return {available:false, reason:'Purchase matching is hidden for this item setup'};
    return {available:true, reason:''};
  }
  function v816AvailableCategoryIds(){ return v816FeedCategories.filter(c=>v816CategoryStatus(c).available).map(c=>c.id); }
  function v816SanitizeCategories(ids, fallback){
    const allowed=new Set(v816DefaultCategories);
    const arr=(Array.isArray(ids)?ids:[]).filter((id,i,a)=>allowed.has(id) && a.indexOf(id)===i);
    if(arr.length) return arr;
    return (fallback || v816DefaultCategories).filter(id=>allowed.has(id));
  }
  function ensureV816State(){
    try{ if(typeof ensureV815State==='function') ensureV815State(); else if(typeof ensureV812State==='function') ensureV812State(); }catch(e){}
    state.settings ||= {};
    const migrated=v816SanitizeCategories(state.settings.businessFeedCategories, v816DefaultCategories);
    if(!Array.isArray(state.settings.dashboardFeedCategories)) state.settings.dashboardFeedCategories = migrated.slice();
    if(!Array.isArray(state.settings.smartInsightCategories)) state.settings.smartInsightCategories = migrated.slice();
    state.settings.dashboardFeedCategories = v816SanitizeCategories(state.settings.dashboardFeedCategories, migrated);
    state.settings.smartInsightCategories = v816SanitizeCategories(state.settings.smartInsightCategories, migrated);
    if(!['high','medium','all'].includes(state.settings.feedPriority)) state.settings.feedPriority='medium';
    if(!Array.isArray(state.settings.hiddenFeedInsights)) state.settings.hiddenFeedInsights=[];
    state.settings.hiddenFeedInsights = state.settings.hiddenFeedInsights.filter((id,i,a)=>id && a.indexOf(id)===i);
  }
  function v816BaseInsights(){
    let list=[];
    try{ list = typeof v810InsightDefinitions==='function' ? v810InsightDefinitions() : (typeof v88InsightDefinitions==='function' ? v88InsightDefinitions() : []); }catch(e){ list=[]; }
    return (Array.isArray(list)?list:[]).map(x=>{
      const categoryId=v816CategoryMap[x.id] || x.categoryId || 'setup';
      const cat=v816FeedCategories.find(c=>c.id===categoryId) || v816FeedCategories[v816FeedCategories.length-1];
      return {...x, categoryId, category:cat.label};
    });
  }
  function v816PriorityFor(item){
    try{
      const d=typeof getV88InsightData==='function'?getV88InsightData():{};
      if(item.id==='bank') return (d.bankReview||d.cash?.bankFeedReview||0)>0 ? 'high' : 'low';
      if(item.id==='overdue') return (d.overdueInvoices||0)>0 ? 'high' : ((d.openInvoices||0)>0 || (d.t?.ar||0)>0 ? 'medium':'low');
      if(item.id==='ap') return (d.dueBills||0)>0 ? 'high' : 'low';
      if(item.id==='taxes') return Math.abs(Number(d.tax?.balance ?? d.taxNet ?? 0))>0.009 ? 'medium' : 'low';
      if(item.id==='stock') return (d.lowStock||0)>0 ? 'high' : 'low';
      if(item.id==='match') return (d.matchIssues||0)>0 ? 'high' : 'low';
      if(item.id==='balanced') return (Number(d.tbDiff||0)>0.009) ? 'high' : ((d.bankReview||0)>0 ? 'medium':'low');
      if(item.id==='cash') return 'medium';
    }catch(e){}
    return 'medium';
  }
  function v816PriorityAllowed(priority){
    const setting=state.settings?.feedPriority || 'medium';
    if(setting==='all') return true;
    if(setting==='medium') return priority==='high' || priority==='medium';
    return priority==='high';
  }
  function v816FilteredInsights(scope='dashboard'){
    ensureV816State();
    const categoryIds = new Set(scope==='insights' ? state.settings.smartInsightCategories : state.settings.dashboardFeedCategories);
    const hidden = new Set(state.settings.hiddenFeedInsights || []);
    const available = new Set(v816AvailableCategoryIds());
    return v816BaseInsights().filter(x=>{
      if(hidden.has(x.id)) return false;
      if(!available.has(x.categoryId)) return false;
      if(!categoryIds.has(x.categoryId)) return false;
      if(x.module && typeof isModuleVisible==='function' && !isModuleVisible(x.module)) return false;
      return v816PriorityAllowed(v816PriorityFor(x));
    });
  }

  function renderBookmarksV816(){
    injectV816CustomizationStyles();
    if(typeof normalizeBookmarks!=='function' || typeof findBookmarksTitle!=='function') return;
    normalizeBookmarks();
    const title=findBookmarksTitle(); if(!title) return;
    title.classList.add('bookmark-title');
    title.innerHTML='<span>Bookmarks</span><button class="link-btn" type="button" data-modal="manageBookmarks">Manage</button>';
    const group=title.nextElementSibling; if(!group || !group.classList.contains('nav-group')) return;
    const ids=normalizeBookmarks();
    group.innerHTML = ids.map(id=>bookmarkById(id)).filter(Boolean).map(b=>`<button class="nav-item bookmark-row ${currentPage===b.nav?'active':''}" data-nav="${b.nav}" role="button"><span class="dot">${b.icon}</span>${escapeHTML(b.label)}</button>`).join('') || `<div class="empty small">No bookmarks selected.</div>`;
  }
  renderBookmarks = renderBookmarksV816;

  function renderBusinessFeedCardsV816(){
    ensureV816State(); injectV816CustomizationStyles();
    const items=v816FilteredInsights('dashboard').slice(0,4);
    const feed=document.getElementById('businessFeed'); if(!feed) return;
    if(!items.length){
      feed.innerHTML=`<div class="feed-empty-card"><div><strong>No Business Feed cards are selected</strong><div class="muted small">Use Customize feed to add banking, sales, tax, inventory, or accounting insights.</div></div><button class="btn primary" data-modal="customizeFeed">Customize feed</button></div>`;
      return;
    }
    feed.innerHTML=`<div class="feed-row">${items.map(x=>`<div class="feed-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><div class="feed-title"><span class="feed-badge">${escapeHTML(x.icon)}</span>${escapeHTML(x.title)}</div><p>${escapeHTML(x.msg)}</p><button class="btn soft" type="button" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div>`).join('')}</div>`;
  }
  renderBusinessFeedCards = renderBusinessFeedCardsV816;
  renderBusinessFeed = function(t){ renderBusinessFeedCardsV816(); };

  businessFeedFullItems = function(){
    const items=v816FilteredInsights('dashboard');
    return items.length ? items : [{id:'none',icon:'âœ“',title:'No urgent insights right now',msg:'Your visible Business Feed categories are up to date.',label:'Customize feed',module:'dashboard',nav:'dashboard',categoryId:'setup',category:'Setup & Admin'}];
  };
  renderBusinessFeedModal = function(filter='all'){
    ensureV816State();
    const all=businessFeedFullItems();
    const cats=['all',...Array.from(new Set(all.map(i=>i.category)))];
    const filtered=filter==='all'?all:all.filter(i=>i.category===filter);
    return `<div class="business-feed-modal"><div class="feed-filter-row">${cats.map(c=>`<button type="button" class="btn ${c===filter?'active':''}" data-action="feed-filter" data-id="${escapeHTML(c)}">${escapeHTML(c==='all'?'All':c)}</button>`).join('')}<button type="button" class="btn" data-modal="customizeFeed">Customize feed</button></div><div class="feed-full-list">${filtered.map(x=>`<div class="feed-full-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><span class="feed-badge">${escapeHTML(x.icon)}</span><div><span class="feed-category-pill">${escapeHTML(x.category)}</span><strong style="display:block;margin-top:8px">${escapeHTML(x.title)}</strong><p class="muted" style="margin:4px 0 0">${escapeHTML(x.msg)}</p></div><button type="button" class="btn primary" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div>`).join('')}</div></div>`;
  };

  const v816RenderInsightsPanelBase = typeof renderInsightsPanel==='function' ? renderInsightsPanel : null;
  renderInsightsPanel = function(){
    injectV88InsightsStyles?.(); injectV89SmartInsightsFixStyles?.(); injectV816CustomizationStyles(); ensureV816State();
    const rows=v816FilteredInsights('insights').slice(0,8).map(x=>`<div class="panel-card insight-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><span class="panel-icon">${escapeHTML(x.icon)}</span><div class="insight-content"><h4>${escapeHTML(x.title)}</h4><p>${escapeHTML(x.msg)}</p></div><div class="insight-actions"><button class="btn primary" type="button" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div></div>`).join('') || `<div class="panel-card"><h4>No urgent insights right now</h4><p>Your enabled Smart Insights categories are up to date. Use Customize feed to change what appears here.</p><button class="btn primary" type="button" data-modal="customizeFeed">Customize feed</button></div>`;
    return panelHead('Smart Insights','Action cards based on enabled insight categories and priority settings.')+`<div class="top-panel-body"><div class="panel-list">${rows}</div><div class="top-panel-foot"><button class="btn" type="button" data-nav="dashboard">Open dashboard</button><button class="btn" type="button" data-modal="customizeFeed">Customize feed</button></div></div>`;
  };
  v88VisibleInsights = function(){ return v816FilteredInsights('insights'); };
  smartInsights = function(){ return v816FilteredInsights('insights'); };
  updateInsightsBadge = function(){
    injectV89SmartInsightsFixStyles?.(); normalizeV89InsightsButton?.(); ensureV816State();
    const btn=document.getElementById('insightsBtn'); if(!btn) return;
    const count=v816FilteredInsights('insights').filter(x=>v816PriorityFor(x)==='high' || x.id==='cash' || x.id==='taxes').length;
    let dot=btn.querySelector('.insight-count-dot');
    if(count>0){ if(!dot){ dot=document.createElement('span'); dot.className='insight-count-dot'; btn.appendChild(dot); } dot.textContent=count>9?'9+':String(count); dot.hidden=false; }
    else if(dot){ dot.hidden=true; }
  };

  function v816CategoryCheckboxList(name, selectedSet){
    return `<div class="v816-category-list">${v816FeedCategories.map(c=>{
      const st=v816CategoryStatus(c); const checked=selectedSet.has(c.id) && st.available;
      return `<label class="v816-category-row ${st.available?'':'disabled'}"><input type="checkbox" name="${name}" value="${c.id}" ${checked?'checked':''} ${st.available?'':'disabled'}><span class="module-icon" style="width:32px;height:32px">${c.icon}</span><div><strong>${escapeHTML(c.label)}</strong><small>${escapeHTML(c.desc)}</small>${st.available?'':`<span class="v816-disabled-reason">${escapeHTML(st.reason)}</span>`}</div></label>`;
    }).join('')}</div>`;
  }
  function customizeFeedBody(){
    ensureV816State(); injectV816CustomizationStyles();
    const dashSel=new Set(state.settings.dashboardFeedCategories || v816DefaultCategories);
    const insightSel=new Set(state.settings.smartInsightCategories || v816DefaultCategories);
    const visibleCards=v816BaseInsights();
    const hidden=new Set(state.settings.hiddenFeedInsights || []);
    return `<div class="v816-feed-note">Customize dashboard Business Feed and Smart Insights separately. Hidden categories do not delete accounting data; they only reduce dashboard noise.</div>
      <div class="v816-feed-grid">
        <section class="v816-feed-section"><h4>Dashboard Business Feed</h4><p class="muted small">Cards shown on the dashboard feed.</p>${v816CategoryCheckboxList('dashboardFeedCategory', dashSel)}</section>
        <section class="v816-feed-section"><h4>Smart Insights Panel</h4><p class="muted small">Cards shown when clicking the sparkle icon.</p>${v816CategoryCheckboxList('smartInsightCategory', insightSel)}</section>
      </div>
      <section class="v816-priority-panel"><h4 style="margin:0">Priority</h4><p class="muted small" style="margin:4px 0 0">Choose how much appears in feed and insights.</p><div class="v816-priority-options">
        <label><input type="radio" name="feedPriority" value="high" ${state.settings.feedPriority==='high'?'checked':''}>High priority only</label>
        <label><input type="radio" name="feedPriority" value="medium" ${state.settings.feedPriority==='medium'?'checked':''}>High + medium</label>
        <label><input type="radio" name="feedPriority" value="all" ${state.settings.feedPriority==='all'?'checked':''}>All alerts</label>
      </div></section>
      <section class="v816-hidden-section"><h4>Individual card visibility</h4><p class="muted small">Remove cards only from this settings panel to avoid accidental dashboard clicks.</p><div class="v816-card-list">${visibleCards.map(i=>`<label class="v816-card-row"><input type="checkbox" name="feedInsightVisible" value="${escapeHTML(i.id)}" ${hidden.has(i.id)?'':'checked'}><span class="module-icon" style="width:32px;height:32px">${escapeHTML(i.icon)}</span><div><strong>${escapeHTML(i.title)}</strong><small>${escapeHTML(i.msg)}</small></div></label>`).join('')}</div></section>`;
  }

  const v816OpenModalBase = openModal;
  openModal = function(type){
    ensureV816State(); injectV816CustomizationStyles(); currentModal=type;
    if(type==='customizeFeed'){
      document.getElementById('modalTitle').textContent='Customize Business Feed';
      document.getElementById('modalSubtitle').textContent='Choose which alert categories appear on the dashboard and in Smart Insights.';
      document.getElementById('modalBody').innerHTML=customizeFeedBody();
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" data-action="feed-reset">Restore defaults</button><button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
      document.getElementById('modalBackdrop').classList.add('open');
      return;
    }
    return v816OpenModalBase(type);
  };

  const v816SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeFeed'){
      e.preventDefault(); ensureV816State();
      const catsAllowed=new Set(v816AvailableCategoryIds());
      const dash=Array.from(document.querySelectorAll('input[name="dashboardFeedCategory"]:checked')).map(i=>i.value).filter(id=>catsAllowed.has(id));
      const insights=Array.from(document.querySelectorAll('input[name="smartInsightCategory"]:checked')).map(i=>i.value).filter(id=>catsAllowed.has(id));
      const priority=document.querySelector('input[name="feedPriority"]:checked')?.value || 'medium';
      const shown=new Set(Array.from(document.querySelectorAll('input[name="feedInsightVisible"]:checked')).map(i=>i.value));
      const allIds=v816BaseInsights().map(i=>i.id);
      state.settings.dashboardFeedCategories=dash;
      state.settings.smartInsightCategories=insights;
      state.settings.businessFeedCategories=dash.slice();
      state.settings.feedPriority=['high','medium','all'].includes(priority)?priority:'medium';
      state.settings.hiddenFeedInsights=allIds.filter(id=>!shown.has(id));
      saveState(); closeModal(); renderAll(); updateInsightsBadge?.(); showToast('Business Feed settings updated.'); return;
    }
    return v816SubmitModalBase(e);
  };

  const v816HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='feed-reset'){
      state.settings.dashboardFeedCategories=v816DefaultCategories.slice();
      state.settings.smartInsightCategories=v816DefaultCategories.slice();
      state.settings.businessFeedCategories=v816DefaultCategories.slice();
      state.settings.feedPriority='medium';
      state.settings.hiddenFeedInsights=[];
      const body=document.getElementById('modalBody'); if(body) body.innerHTML=customizeFeedBody();
      showToast('Default feed settings restored. Save to apply.'); return;
    }
    // Direct remove actions are intentionally disabled in normal dashboard/sidebar view. Use Manage Bookmarks or Customize Feed instead.
    if(action==='remove-bookmark' || action==='hide-feed-card'){
      showToast(action==='remove-bookmark'?'Use Manage Bookmarks to remove bookmarks.':'Use Customize feed to hide cards.'); return;
    }
    return v816HandleActionBase(action,id);
  };

  const v816EnsureFeedHeaderControlsBase = typeof ensureFeedHeaderControls==='function' ? ensureFeedHeaderControls : null;
  ensureFeedHeaderControls = function(){
    if(v816EnsureFeedHeaderControlsBase) v816EnsureFeedHeaderControlsBase();
    const header=document.querySelector('#page-dashboard .feed-header'); if(!header) return;
    const customize=header.querySelector('[data-modal="customizeFeed"]');
    if(customize) customize.textContent='Customize feed';
  };

  const v816RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    v816RenderDashboardBase();
    injectV816CustomizationStyles(); ensureV816State(); ensureFeedHeaderControls(); renderBusinessFeedCardsV816(); renderBookmarksV816(); updateInsightsBadge?.();
  };
  const v816RenderMenuBase = renderMenu;
  renderMenu = function(){ v816RenderMenuBase(); renderBookmarksV816(); };
  const v816RenderAllBase = renderAll;
  renderAll = function(){ injectV816CustomizationStyles(); ensureV816State(); v816RenderAllBase(); renderBookmarksV816(); ensureFeedHeaderControls(); updateInsightsBadge?.(); };


  // ---------- Dashboard Business Feed card dismiss + display count ----------
  function injectBusinessFeedPolishStyles(){
    if(document.getElementById('business-feed-display-polish-styles')) return;
    const style=document.createElement('style');
    style.id='business-feed-display-polish-styles';
    style.textContent=`
      .feed-card{position:relative;overflow:visible}
      .feed-card .hide-feed-btn{display:flex!important;position:absolute;top:10px;right:12px;width:28px;height:28px;border:0;border-radius:999px;background:transparent;color:#8a98aa;align-items:center;justify-content:center;font-size:18px;font-weight:900;line-height:1;cursor:pointer;opacity:0;transition:opacity .15s ease,background .15s ease,color .15s ease;z-index:3}
      .feed-card:hover .hide-feed-btn,.feed-card:focus-within .hide-feed-btn{opacity:1}
      .feed-card .hide-feed-btn:hover{background:#eff6ff;color:#0f766e}
      .feed-count-note{font-size:13px;color:var(--muted,#667085);font-weight:700;margin:6px 0 0 2px}
      .feed-header-title-wrap{display:flex;flex-direction:column;gap:2px}
      .feed-header .feed-header-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .feed-display-panel{border:1px solid var(--line,#dfe7ee);border-radius:18px;padding:14px;background:var(--card,#fff);margin-top:14px}
      .feed-display-options{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
      .feed-display-options label{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line,#dfe7ee);border-radius:999px;padding:9px 12px;font-weight:800;background:var(--card,#fff);cursor:pointer}
      .toast-undo-btn{margin-left:12px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.12);color:#fff;border-radius:999px;padding:4px 10px;font-weight:900;cursor:pointer}
      body.v8-ui.dark-mode .feed-card .hide-feed-btn{color:#9fb1c6}
      body.v8-ui.dark-mode .feed-card .hide-feed-btn:hover{background:#203044;color:#e0f2fe}
      body.v8-ui.dark-mode .feed-count-note{color:#cbd5e1}
      body.v8-ui.dark-mode .feed-display-panel,body.v8-ui.dark-mode .feed-display-options label{background:#172033;border-color:#334155;color:#f8fafc}
      @media(max-width:780px){.feed-header{align-items:flex-start}.feed-header .feed-header-actions{width:100%}.feed-card .hide-feed-btn{opacity:1}}
    `;
    document.head.appendChild(style);
  }
  function normalizeFeedDisplayMode(){
    state.settings ||= {};
    if(!['compact','standard','expanded'].includes(state.settings.dashboardFeedDisplay)) state.settings.dashboardFeedDisplay='compact';
  }
  function dashboardFeedLimit(){
    normalizeFeedDisplayMode();
    const mode=state.settings.dashboardFeedDisplay;
    if(mode==='expanded') return Infinity;
    if(mode==='standard') return 6;
    return 4;
  }
  function dashboardFeedDisplayLabel(){
    normalizeFeedDisplayMode();
    return state.settings.dashboardFeedDisplay==='expanded' ? 'Expanded â€” show all active cards' : state.settings.dashboardFeedDisplay==='standard' ? 'Standard â€” show up to 6 cards' : 'Compact â€” show top 4 cards';
  }
  function currentDashboardFeedItems(){
    ensureV816State?.(); normalizeFeedDisplayMode();
    const all = typeof v816FilteredInsights==='function' ? v816FilteredInsights('dashboard') : [];
    const limit = dashboardFeedLimit();
    return {all, shown: Number.isFinite(limit) ? all.slice(0, limit) : all.slice()};
  }
  function updateBusinessFeedHeaderCount(){
    injectBusinessFeedPolishStyles();
    const header=document.querySelector('#page-dashboard .feed-header'); if(!header) return;
    const {all, shown}=currentDashboardFeedItems();
    let titleWrap=header.querySelector('.feed-header-title-wrap');
    const h3=header.querySelector('h3');
    if(h3 && !titleWrap){
      titleWrap=document.createElement('div');
      titleWrap.className='feed-header-title-wrap';
      h3.parentNode.insertBefore(titleWrap,h3);
      titleWrap.appendChild(h3);
    }
    if(titleWrap){
      let note=titleWrap.querySelector('.feed-count-note');
      if(!note){ note=document.createElement('div'); note.className='feed-count-note'; titleWrap.appendChild(note); }
      note.textContent = all.length ? `Showing ${shown.length} of ${all.length} insights Â· ${dashboardFeedDisplayLabel()}` : 'No active insights selected';
    }
    const view=header.querySelector('[data-action="view-all-feed"]');
    if(view) view.textContent = all.length ? `View all ${all.length}` : 'View all';
  }
  function renderBusinessFeedCardsWithDismiss(){
    ensureV816State?.(); normalizeFeedDisplayMode(); injectV816CustomizationStyles?.(); injectBusinessFeedPolishStyles();
    const {all, shown:items}=currentDashboardFeedItems();
    const feed=document.getElementById('businessFeed'); if(!feed) return;
    if(!items.length){
      feed.innerHTML=`<div class="feed-empty-card"><div><strong>No Business Feed cards are selected</strong><div class="muted small">Use Customize feed to add banking, sales, tax, inventory, or accounting insights.</div></div><button class="btn primary" data-modal="customizeFeed">Customize feed</button></div>`;
      updateBusinessFeedHeaderCount();
      return;
    }
    feed.innerHTML=`<div class="feed-row">${items.map(x=>`<div class="feed-card" data-action="open-insight" data-id="${escapeHTML(x.id)}" role="button" tabindex="0"><button class="hide-feed-btn" type="button" data-action="hide-feed-card" data-id="${escapeHTML(x.id)}" title="Hide this insight" aria-label="Hide ${escapeHTML(x.title)}">Ã—</button><div class="feed-title"><span class="feed-badge">${escapeHTML(x.icon)}</span>${escapeHTML(x.title)}</div><p>${escapeHTML(x.msg)}</p><button class="btn soft" type="button" data-action="open-insight" data-id="${escapeHTML(x.id)}">${escapeHTML(x.label)}</button></div>`).join('')}</div>`;
    updateBusinessFeedHeaderCount();
  }
  renderBusinessFeedCards = renderBusinessFeedCardsWithDismiss;
  renderBusinessFeed = function(){ renderBusinessFeedCardsWithDismiss(); };
  renderBusinessFeedCardsV816 = renderBusinessFeedCardsWithDismiss;

  function feedUndoToast(id,title){
    const t=document.getElementById('toast'); if(!t){ showToast('Insight hidden.'); return; }
    t.innerHTML=`Insight hidden. <button class="toast-undo-btn" type="button">Undo</button>`;
    t.classList.add('show');
    clearTimeout(showToast.timer);
    const btn=t.querySelector('button');
    if(btn) btn.addEventListener('click',()=>{
      state.settings.hiddenFeedInsights=(state.settings.hiddenFeedInsights||[]).filter(x=>x!==id);
      saveState(); renderDashboard(); updateInsightsBadge?.();
      t.classList.remove('show');
      showToast(`${title || 'Insight'} restored.`);
    },{once:true});
    showToast.timer=setTimeout(()=>t.classList.remove('show'),4200);
  }

  const handleActionBeforeFeedDismiss = handleAction;
  handleAction = function(action,id){
    if(action==='hide-feed-card'){
      ensureV816State?.();
      const insight=(typeof v816BaseInsights==='function' ? v816BaseInsights() : []).find(x=>x.id===id);
      state.settings.hiddenFeedInsights ||= [];
      if(id && !state.settings.hiddenFeedInsights.includes(id)) state.settings.hiddenFeedInsights.push(id);
      saveState(); renderDashboard(); updateInsightsBadge?.();
      feedUndoToast(id, insight?.title);
      return;
    }
    if(action==='feed-reset'){
      state.settings.dashboardFeedCategories=v816DefaultCategories.slice();
      state.settings.smartInsightCategories=v816DefaultCategories.slice();
      state.settings.businessFeedCategories=v816DefaultCategories.slice();
      state.settings.feedPriority='medium';
      state.settings.dashboardFeedDisplay='compact';
      state.settings.hiddenFeedInsights=[];
      const body=document.getElementById('modalBody'); if(body) body.innerHTML=customizeFeedBody();
      showToast('Default feed settings restored. Save to apply.'); return;
    }
    return handleActionBeforeFeedDismiss(action,id);
  };

  const customizeFeedBodyBeforeDisplay = customizeFeedBody;
  customizeFeedBody = function(){
    ensureV816State?.(); normalizeFeedDisplayMode(); injectBusinessFeedPolishStyles();
    const base=customizeFeedBodyBeforeDisplay();
    const displayPanel=`<section class="feed-display-panel"><h4 style="margin:0">Dashboard Display</h4><p class="muted small" style="margin:4px 0 0">Choose how many active cards appear on the dashboard. View all still shows every active card.</p><div class="feed-display-options">
      <label><input type="radio" name="dashboardFeedDisplay" value="compact" ${state.settings.dashboardFeedDisplay==='compact'?'checked':''}>Compact Â· 4 cards</label>
      <label><input type="radio" name="dashboardFeedDisplay" value="standard" ${state.settings.dashboardFeedDisplay==='standard'?'checked':''}>Standard Â· 6 cards</label>
      <label><input type="radio" name="dashboardFeedDisplay" value="expanded" ${state.settings.dashboardFeedDisplay==='expanded'?'checked':''}>Expanded Â· all cards</label>
    </div></section>`;
    return base.replace('<section class="v816-priority-panel">', displayPanel+'<section class="v816-priority-panel">').replace('Remove cards only from this settings panel to avoid accidental dashboard clicks.','Use checkboxes to show or hide individual cards. Dashboard cards can also be dismissed and restored here.');
  };

  const submitModalBeforeFeedDisplay = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeFeed'){
      e.preventDefault(); ensureV816State?.(); normalizeFeedDisplayMode();
      const catsAllowed=new Set(v816AvailableCategoryIds());
      const dash=Array.from(document.querySelectorAll('input[name="dashboardFeedCategory"]:checked')).map(i=>i.value).filter(id=>catsAllowed.has(id));
      const insights=Array.from(document.querySelectorAll('input[name="smartInsightCategory"]:checked')).map(i=>i.value).filter(id=>catsAllowed.has(id));
      const priority=document.querySelector('input[name="feedPriority"]:checked')?.value || 'medium';
      const display=document.querySelector('input[name="dashboardFeedDisplay"]:checked')?.value || 'compact';
      const shown=new Set(Array.from(document.querySelectorAll('input[name="feedInsightVisible"]:checked')).map(i=>i.value));
      const allIds=v816BaseInsights().map(i=>i.id);
      state.settings.dashboardFeedCategories=dash;
      state.settings.smartInsightCategories=insights;
      state.settings.businessFeedCategories=dash.slice();
      state.settings.feedPriority=['high','medium','all'].includes(priority)?priority:'medium';
      state.settings.dashboardFeedDisplay=['compact','standard','expanded'].includes(display)?display:'compact';
      state.settings.hiddenFeedInsights=allIds.filter(id=>!shown.has(id));
      saveState(); closeModal(); renderAll(); updateInsightsBadge?.(); showToast('Business Feed settings updated.'); return;
    }
    return submitModalBeforeFeedDisplay(e);
  };

  const ensureFeedHeaderControlsBeforeDisplay = ensureFeedHeaderControls;
  ensureFeedHeaderControls = function(){
    if(ensureFeedHeaderControlsBeforeDisplay) ensureFeedHeaderControlsBeforeDisplay();
    updateBusinessFeedHeaderCount();
  };

  // Existing dashboard/renderAll wrappers call renderBusinessFeedCardsV816, which is now routed to the updated Business Feed renderer.


  // ---------- Business Feed display count control + invoice detail editing ----------
  function ensureV818State(){
    state.settings ||= {};
    if(!['compact','standard','expanded','custom'].includes(state.settings.dashboardFeedDisplay)) state.settings.dashboardFeedDisplay='compact';
    const n=Number(state.settings.dashboardFeedCustomCount || 3);
    state.settings.dashboardFeedCustomCount = Math.max(1, Math.min(24, Number.isFinite(n)?Math.round(n):3));
  }
  const normalizeFeedDisplayModeBeforeV818 = typeof normalizeFeedDisplayMode==='function' ? normalizeFeedDisplayMode : null;
  normalizeFeedDisplayMode = function(){
    if(normalizeFeedDisplayModeBeforeV818) normalizeFeedDisplayModeBeforeV818();
    ensureV818State();
  };
  dashboardFeedLimit = function(){
    ensureV818State();
    const mode=state.settings.dashboardFeedDisplay;
    if(mode==='expanded') return Infinity;
    if(mode==='standard') return 6;
    if(mode==='custom') return state.settings.dashboardFeedCustomCount;
    return 3;
  };
  dashboardFeedDisplayLabel = function(){
    ensureV818State();
    const mode=state.settings.dashboardFeedDisplay;
    if(mode==='expanded') return 'Expanded view';
    if(mode==='standard') return 'Standard view';
    if(mode==='custom') return `Custom view â€” show ${state.settings.dashboardFeedCustomCount} cards`;
    return 'Compact view';
  };
  const updateBusinessFeedHeaderCountBeforeV818 = typeof updateBusinessFeedHeaderCount==='function' ? updateBusinessFeedHeaderCount : null;
  updateBusinessFeedHeaderCount = function(){
    if(updateBusinessFeedHeaderCountBeforeV818) updateBusinessFeedHeaderCountBeforeV818();
    const header=document.querySelector('#page-dashboard .feed-header'); if(!header) return;
    const {all, shown}=currentDashboardFeedItems();
    const note=header.querySelector('.feed-count-note');
    if(note) note.textContent = all.length ? `Showing ${shown.length} of ${all.length} insights Â· ${dashboardFeedDisplayLabel()}` : 'No active insights selected';
    const view=header.querySelector('[data-action="view-all-feed"]');
    if(view) view.textContent = 'View all insights';
  };
  const customizeFeedBodyBeforeV818 = customizeFeedBody;
  customizeFeedBody = function(){
    ensureV818State();
    let html=customizeFeedBodyBeforeV818();
    const displayPanel=`<section class="feed-display-panel"><h4 style="margin:0">Dashboard Display</h4><p class="muted small" style="margin:4px 0 0">Choose how many active insight cards appear on the dashboard. View all still shows every active card.</p><div class="feed-display-options">
      <label><input type="radio" name="dashboardFeedDisplay" value="compact" ${state.settings.dashboardFeedDisplay==='compact'?'checked':''}>Compact Â· 3 cards</label>
      <label><input type="radio" name="dashboardFeedDisplay" value="standard" ${state.settings.dashboardFeedDisplay==='standard'?'checked':''}>Standard Â· 6 cards</label>
      <label><input type="radio" name="dashboardFeedDisplay" value="expanded" ${state.settings.dashboardFeedDisplay==='expanded'?'checked':''}>Expanded Â· all cards</label>
      <label><input type="radio" name="dashboardFeedDisplay" value="custom" ${state.settings.dashboardFeedDisplay==='custom'?'checked':''}>Custom Â· <input type="number" name="dashboardFeedCustomCount" min="1" max="24" value="${num(state.settings.dashboardFeedCustomCount||3)}" style="width:72px;margin-left:4px"> cards</label>
    </div></section>`;
    html=html.replace(/<section class="feed-display-panel">[\s\S]*?<\/section>/, displayPanel);
    return html;
  };
  const submitModalBeforeV818 = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeFeed'){
      e.preventDefault(); ensureV816State?.(); ensureV818State();
      const catsAllowed=new Set(v816AvailableCategoryIds());
      const dash=Array.from(document.querySelectorAll('input[name="dashboardFeedCategory"]:checked')).map(i=>i.value).filter(id=>catsAllowed.has(id));
      const insights=Array.from(document.querySelectorAll('input[name="smartInsightCategory"]:checked')).map(i=>i.value).filter(id=>catsAllowed.has(id));
      const priority=document.querySelector('input[name="feedPriority"]:checked')?.value || 'medium';
      const display=document.querySelector('input[name="dashboardFeedDisplay"]:checked')?.value || 'compact';
      const customCountRaw=Number(document.querySelector('input[name="dashboardFeedCustomCount"]')?.value || 3);
      const shown=new Set(Array.from(document.querySelectorAll('input[name="feedInsightVisible"]:checked')).map(i=>i.value));
      const allIds=v816BaseInsights().map(i=>i.id);
      state.settings.dashboardFeedCategories=dash;
      state.settings.smartInsightCategories=insights;
      state.settings.businessFeedCategories=dash.slice();
      state.settings.feedPriority=['high','medium','all'].includes(priority)?priority:'medium';
      state.settings.dashboardFeedDisplay=['compact','standard','expanded','custom'].includes(display)?display:'compact';
      state.settings.dashboardFeedCustomCount=Math.max(1,Math.min(24,Number.isFinite(customCountRaw)?Math.round(customCountRaw):3));
      state.settings.hiddenFeedInsights=allIds.filter(id=>!shown.has(id));
      saveState(); closeModal(); renderAll(); updateInsightsBadge?.(); showToast('Business Feed settings updated.'); return;
    }
    if(currentModal==='invoiceEdit'){
      e.preventDefault(); const f=new FormData(e.target), data=Object.fromEntries(f.entries()), inv=activeInvoice(); if(!inv){ showToast('No invoice selected.'); return; }
      inv.template=data.template; inv.terms=data.terms; inv.dueDate=data.dueDate; inv.status=data.status; inv.emailStatus=data.emailStatus; inv.sentDate=data.sentDate; inv.lastViewed=data.lastViewed; inv.reminderCount=num(data.reminderCount); inv.shipping=num(data.shipping); inv.shipVia=data.shipVia; inv.trackingNo=data.trackingNo; inv.billToAddress=data.billToAddress; inv.shipTo=data.shipTo; inv.memo=data.invoiceMemo; inv.customerMessage=data.customerMessage; inv.paymentInstructions=data.paymentInstructions;
      (inv.items||[]).forEach((line,idx)=>{ if(data[`lineDesc_${idx}`] !== undefined) line.desc=data[`lineDesc_${idx}`]; });
      if(inv.status==='Paid' && openAmount(inv)>0) inv.status='Sent';
      audit(`Invoice ${inv.id} details updated`); saveState(); closeModal(); renderAll(); showToast('Invoice details updated.'); return;
    }
    return submitModalBeforeV818(e);
  };
  const modalBodyBeforeV818 = modalBody;
  modalBody = function(type){
    if(type==='invoiceEdit'){
      const inv=activeInvoice(); if(!inv) return '<p>No invoice selected.</p>';
      const lines=(inv.items||[]).map((line,idx)=>`<div class="invoice-line-edit-row"><div><strong>${escapeHTML(line.product||line.productId||'Line item')}</strong><div class="muted small">Qty ${num(line.qty)} Â· Rate ${money(num(line.rate))} Â· Amount ${money(num(line.amount ?? num(line.qty)*num(line.rate)))}</div></div><div class="field"><label>Line-item description</label><textarea name="lineDesc_${idx}">${escapeHTML(line.desc||'')}</textarea></div></div>`).join('') || '<div class="muted">No line items found.</div>';
      return `<div class="form-grid"><div class="field"><label>Invoice</label><input value="${escapeHTML(inv.id)}" readonly></div><div class="field"><label>Customer</label><input value="${escapeHTML(getCustomer(inv.customerId).name)}" readonly></div><div class="field"><label>Template</label><select name="template">${invoiceTemplateOptions(inv.template||invoiceSettings().template)}</select></div><div class="field"><label>Terms</label><input name="terms" value="${escapeHTML(inv.terms||invoiceSettings().defaultTerms)}"></div><div class="field"><label>Due date</label><input type="date" name="dueDate" value="${escapeHTML(inv.dueDate||todayISO())}"></div><div class="field"><label>Status</label><select name="status"><option ${invoiceDisplayStatus(inv)==='Draft'?'selected':''}>Draft</option><option ${invoiceDisplayStatus(inv)==='Sent'?'selected':''}>Sent</option><option ${invoiceDisplayStatus(inv)==='Viewed'?'selected':''}>Viewed</option><option ${invoiceDisplayStatus(inv)==='Overdue'?'selected':''}>Overdue</option><option ${invoiceDisplayStatus(inv)==='Paid'?'selected':''}>Paid</option><option ${invoiceDisplayStatus(inv)==='Void'?'selected':''}>Void</option></select></div><div class="field"><label>Email status</label><select name="emailStatus"><option ${inv.emailStatus==='Draft'?'selected':''}>Draft</option><option ${inv.emailStatus==='Sent'?'selected':''}>Sent</option><option ${inv.emailStatus==='Delivered'?'selected':''}>Delivered</option><option ${inv.emailStatus==='Viewed'?'selected':''}>Viewed</option><option ${inv.emailStatus==='Bounced'?'selected':''}>Bounced</option><option ${inv.emailStatus==='Void'?'selected':''}>Void</option></select></div><div class="field"><label>Sent date</label><input type="date" name="sentDate" value="${escapeHTML(inv.sentDate||'')}"></div><div class="field"><label>Last viewed</label><input type="date" name="lastViewed" value="${escapeHTML(inv.lastViewed||'')}"></div><div class="field"><label>Reminder count</label><input type="number" min="0" name="reminderCount" value="${num(inv.reminderCount)}"></div><div class="field"><label>Shipping</label><input type="number" step="0.01" name="shipping" value="${num(inv.shipping)}"></div><div class="field"><label>Ship via</label><input name="shipVia" value="${escapeHTML(inv.shipVia||'')}"></div><div class="field"><label>Tracking no.</label><input name="trackingNo" value="${escapeHTML(inv.trackingNo||'')}"></div><div class="field full"><label>Invoice description / memo</label><textarea name="invoiceMemo">${escapeHTML(inv.memo||'')}</textarea></div><div class="field full"><label>Bill-to address</label><textarea name="billToAddress">${escapeHTML(inv.billToAddress||'')}</textarea></div><div class="field full"><label>Ship-to address</label><textarea name="shipTo">${escapeHTML(inv.shipTo||'')}</textarea></div><div class="field full"><label>Customer message</label><textarea name="customerMessage">${escapeHTML(inv.customerMessage||invoiceSettings().defaultMessage)}</textarea></div><div class="field full"><label>Payment instructions</label><textarea name="paymentInstructions">${escapeHTML(inv.paymentInstructions||invoiceSettings().paymentInstructions)}</textarea></div><div class="field full"><label>Line-item descriptions</label><div class="invoice-line-edit-list">${lines}</div></div></div>`;
    }
    return modalBodyBeforeV818(type);
  };
  function injectV818Styles(){
    if(document.getElementById('v818-styles')) return;
    const style=document.createElement('style'); style.id='v818-styles'; style.textContent=`
      .invoice-line-edit-list{display:grid;gap:12px}.invoice-line-edit-row{display:grid;grid-template-columns:minmax(180px,260px) 1fr;gap:12px;align-items:start;border:1px solid var(--line,#dfe7ee);border-radius:16px;padding:12px;background:var(--soft,#f8fafc)}
      .invoice-line-edit-row textarea{min-height:70px}.feed-display-options input[type="number"]{border:1px solid var(--line,#dfe7ee);border-radius:10px;padding:6px 8px;background:var(--card,#fff);color:var(--text,#0b1f3a);font-weight:800}.feed-display-options label{white-space:nowrap}
      body.v8-ui.dark-mode .invoice-line-edit-row{background:#172033;border-color:#334155}body.v8-ui.dark-mode .feed-display-options input[type="number"]{background:#0f172a;color:#f8fafc;border-color:#334155}
      @media(max-width:760px){.invoice-line-edit-row{grid-template-columns:1fr}.feed-display-options label{white-space:normal}}
    `; document.head.appendChild(style);
  }
  const openModalBeforeV818 = openModal;
  openModal = function(type){
    openModalBeforeV818(type);
    if(type==='invoiceEdit'){
      document.querySelector('.modal')?.classList.add('wide');
      const title=document.getElementById('modalTitle'), sub=document.getElementById('modalSubtitle'), foot=document.getElementById('modalFooter');
      if(title) title.textContent='Edit invoice details';
      if(sub) sub.textContent='Update invoice status, tracking, memo, customer message, and line-item descriptions.';
      if(foot) foot.innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save invoice details</button>';
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    }
  };
  const renderAllBeforeV818 = renderAll;
  renderAll = function(){ injectV818Styles(); ensureV818State(); renderAllBeforeV818(); updateBusinessFeedHeaderCount?.(); };
  const renderDashboardBeforeV818 = renderDashboard;
  renderDashboard = function(){ injectV818Styles(); ensureV818State(); renderDashboardBeforeV818(); updateBusinessFeedHeaderCount?.(); };
  injectV818Styles(); ensureV818State();


  // ---------- Dashboard Cash Flow Layout Redesign ----------
  function injectV819DashboardStyles(){
    if(document.getElementById('v819-dashboard-styles')) return;
    const style=document.createElement('style'); style.id='v819-dashboard-styles'; style.textContent=`
      body.v8-ui .dashboard-cash-hero{padding:0;overflow:hidden;border-radius:18px}
      body.v8-ui .cash-hero-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:22px 24px 10px}
      body.v8-ui .cash-hero-title{display:grid;gap:4px}
      body.v8-ui .cash-hero-title .eyebrow{font-weight:900;color:var(--muted,#667085);text-transform:uppercase;letter-spacing:.04em;font-size:13px}
      body.v8-ui .cash-hero-title .cash-balance{font-size:42px;line-height:1.05;font-weight:950;color:var(--text,#071b36);letter-spacing:-.04em;margin-top:4px}
      body.v8-ui .cash-hero-title .cash-caption{color:var(--muted,#667085);font-weight:700}
      body.v8-ui .cash-toggle{display:flex;border:1px solid var(--line,#dfe7ee);border-radius:999px;overflow:hidden;background:var(--soft,#f8fafc);align-self:flex-start}
      body.v8-ui .cash-toggle button{border:0;background:transparent;color:var(--muted,#667085);font-weight:900;padding:10px 16px;cursor:pointer;white-space:nowrap}
      body.v8-ui .cash-toggle button.active{background:var(--card,#fff);color:#0a6b32;box-shadow:0 1px 3px rgba(16,24,40,.10)}
      body.v8-ui .cash-chart-wrap{padding:8px 24px 18px}
      body.v8-ui .cash-chart{height:270px;border-top:1px solid var(--line,#dfe7ee);border-bottom:1px solid var(--line,#dfe7ee);background:linear-gradient(to bottom, transparent 0, transparent 24%, rgba(148,163,184,.18) 24.2%, transparent 24.7%, transparent 49%, rgba(148,163,184,.18) 49.2%, transparent 49.7%, transparent 74%, rgba(148,163,184,.18) 74.2%, transparent 74.7%);display:flex;align-items:flex-end;gap:18px;padding:24px 16px 34px;position:relative;overflow:hidden}
      body.v8-ui .cash-month{flex:1;min-width:44px;display:grid;align-items:end;justify-items:center;gap:9px;height:100%;position:relative}
      body.v8-ui .cash-bars{display:flex;align-items:flex-end;justify-content:center;gap:7px;height:190px;width:100%}
      body.v8-ui .cash-bar{width:16px;border-radius:7px 7px 0 0;min-height:3px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
      body.v8-ui .cash-bar.in{background:#42b30b}
      body.v8-ui .cash-bar.out{background:#00a7a7}
      body.v8-ui .cash-balance-line{width:76%;height:4px;border-radius:999px;background:#42b30b;align-self:center;box-shadow:0 0 0 3px rgba(66,179,11,.12)}
      body.v8-ui .cash-month-label{position:absolute;bottom:-22px;font-weight:900;font-size:12px;color:var(--muted,#667085);text-transform:uppercase;white-space:nowrap}
      body.v8-ui .cash-legend{display:flex;align-items:center;justify-content:flex-end;gap:18px;padding:0 24px 22px;color:var(--muted,#667085);font-weight:800;font-size:13px}
      body.v8-ui .cash-legend span{display:flex;align-items:center;gap:8px}.cash-dot{width:10px;height:10px;border-radius:999px;display:inline-block}.cash-dot.in{background:#42b30b}.cash-dot.out{background:#00a7a7}.cash-dot.balance{background:#42b30b}
      body.v8-ui .cash-source-link{padding:0 24px 24px;color:#0875b8;font-weight:900;display:inline-flex;text-decoration:none;cursor:pointer}
      body.v8-ui .dashboard-top-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px}
      body.v8-ui .invoice-dashboard-card .invoice-metrics{display:grid;gap:12px;margin-top:12px}
      body.v8-ui .invoice-big-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end}
      body.v8-ui .invoice-big-row strong{display:block;font-size:22px;letter-spacing:-.03em;color:var(--text,#071b36)}
      body.v8-ui .invoice-big-row span{display:block;color:var(--muted,#667085);font-weight:800;font-size:13px;text-transform:uppercase}
      body.v8-ui .invoice-progress{height:20px;border-radius:5px;background:#dfe7ee;display:flex;overflow:hidden;margin:6px 0 10px}.invoice-progress .overdue{background:#ff6a00}.invoice-progress .notdue{background:#c7ccd4}.invoice-progress .paid{background:#a8e593}.invoice-progress .deposited{background:#72c16d}
      body.v8-ui .dashboard-lower-grid{display:grid;grid-template-columns:1fr 1.25fr 1fr;gap:16px;margin-top:16px}
      body.v8-ui .dashboard-feed-block{margin-top:22px}.dashboard-feed-block .feed-header{margin-bottom:10px}
      body.v8-ui .dashboard-cash-layout .section-header{margin-top:22px}
      body.v8-ui.dark-mode .cash-toggle{background:#0f172a;border-color:#334155}body.v8-ui.dark-mode .cash-toggle button.active{background:#1e293b;color:#86efac}body.v8-ui.dark-mode .cash-hero-title .cash-balance,body.v8-ui.dark-mode .invoice-big-row strong{color:#f8fafc}body.v8-ui.dark-mode .cash-chart{border-color:#334155;background:linear-gradient(to bottom, transparent 0, transparent 24%, rgba(148,163,184,.13) 24.2%, transparent 24.7%, transparent 49%, rgba(148,163,184,.13) 49.2%, transparent 49.7%, transparent 74%, rgba(148,163,184,.13) 74.2%, transparent 74.7%)}
      @media(max-width:1180px){body.v8-ui .dashboard-top-row,body.v8-ui .dashboard-lower-grid{grid-template-columns:1fr 1fr}.dashboard-lower-grid #setupCard{grid-column:1/-1}}
      @media(max-width:760px){body.v8-ui .cash-hero-head{flex-direction:column}.cash-toggle{width:100%}.cash-toggle button{flex:1}.cash-chart{gap:10px;padding-inline:10px}.cash-bar{width:10px}.dashboard-top-row,.dashboard-lower-grid{grid-template-columns:1fr!important}}
    `; document.head.appendChild(style);
  }

  function monthKey(d){ return String(d||'').slice(0,7); }
  function addMonth(date, n){ const d=new Date(date.getFullYear(), date.getMonth()+n, 1); return d; }
  function monthLabelFromKey(k){ const [y,m]=k.split('-').map(Number); return new Date(y, m-1, 1).toLocaleString(undefined,{month:'short'}); }
  function last12MonthKeys(){
    const dates=[...(state.payments||[]),...(state.deposits||[]),...(state.expenses||[]),...(state.billPayments||[]),...(state.bankTransactions||[])].map(x=>x.date).filter(Boolean).sort();
    const end = dates.length ? new Date(dates[dates.length-1]+'T00:00:00') : new Date();
    const keys=[]; for(let i=11;i>=0;i--){ const d=addMonth(end,-i); keys.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }
    return keys;
  }
  function cashFlowSeries(){
    const keys=last12MonthKeys(); const data=Object.fromEntries(keys.map(k=>[k,{in:0,out:0,balance:null}]));
    (state.payments||[]).forEach(p=>{ const k=monthKey(p.date); if(data[k]) data[k].in+=num(p.amount); });
    (state.deposits||[]).forEach(d=>{ const k=monthKey(d.date); if(data[k]) data[k].in+=num(d.amount); });
    (state.expenses||[]).forEach(e=>{ const k=monthKey(e.date); if(data[k]) data[k].out+=expenseTotal(e); });
    (state.billPayments||[]).forEach(p=>{ const k=monthKey(p.date); if(data[k]) data[k].out+=num(p.amount); });
    // Include reviewed standalone bank feed items without double-counting matched or unposted suggestions.
    (state.bankTransactions||[]).filter(x=>x.posted && !x.linkedId).forEach(tx=>{ const k=monthKey(tx.date); if(data[k]){ const a=num(tx.amount); if(a>=0) data[k].in+=a; else data[k].out+=Math.abs(a); } });
    let running=(state.bankAccounts||[]).reduce((s,b)=>s+normalBalance(b.accountId),0);
    // show a simple trailing book-balance curve by subtracting future month net movement backwards
    const arr=keys.map(k=>({key:k,label:monthLabelFromKey(k),...data[k]}));
    let future=0; for(let i=arr.length-1;i>=0;i--){ arr[i].balance=running-future; future += arr[i].in-arr[i].out; }
    return arr;
  }
  function renderCashFlowHero(){
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView ||= 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=cashFlowSeries(); const max=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.abs(m.balance)]:[m.in,m.out]));
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId), netCashPosition:(state.bankAccounts||[]).reduce((s,b)=>s+normalBalance(b.accountId),0)};
    const balance = num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    const bars=series.map(m=>`<div class="cash-month"><div class="cash-bars">${view==='balance'?`<div class="cash-balance-line" style="height:${Math.max(4,Math.round(Math.abs(m.balance)/max*170))}px"></div>`:`<div class="cash-bar in" title="Money in ${money(m.in)}" style="height:${Math.max(3,Math.round(m.in/max*185))}px"></div><div class="cash-bar out" title="Money out ${money(m.out)}" style="height:${Math.max(3,Math.round(m.out/max*185))}px"></div>`}</div><div class="cash-month-label">${escapeHTML(m.label)}</div></div>`).join('');
    el.innerHTML=`<div class="cash-hero-head"><div class="cash-hero-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-action="cashflow-view" data-id="flow">â–¥ Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-action="cashflow-view" data-id="balance">âŒ Cash balance</button></div></div><div class="cash-chart-wrap"><div class="cash-chart">${bars}</div></div><div class="cash-legend">${view==='balance'?`<span><i class="cash-dot balance"></i>Cash balance</span>`:`<span><i class="cash-dot in"></i>Money in</span><span><i class="cash-dot out"></i>Money out</span>`}</div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button>`;
  }

  function renderInvoiceSummaryCard(){
    const el=document.getElementById('invoiceSummaryCard'); if(!el) return;
    const unpaid=state.invoices.reduce((s,i)=>s+openAmount(i),0);
    const overdue=state.invoices.filter(i=>invoiceDisplayStatus(i)==='Overdue' || (openAmount(i)>0 && i.dueDate < todayISO())).reduce((s,i)=>s+openAmount(i),0);
    const notDue=Math.max(0,unpaid-overdue);
    const paid=state.payments.reduce((s,p)=>s+num(p.amount),0);
    const deposited=paid + state.deposits.reduce((s,d)=>s+num(d.amount),0);
    const total=Math.max(1,overdue+notDue+paid+deposited);
    const pct=v=>Math.max(3,Math.round(v/total*100));
    el.classList.add('invoice-dashboard-card');
    el.innerHTML=`<h3>Invoices</h3><div class="invoice-metrics"><div><strong>${money(unpaid)} Unpaid</strong><span class="muted small" style="margin-left:6px">Open invoices</span></div><div class="invoice-big-row"><div><strong>${money(overdue)}</strong><span>Overdue</span></div><div><strong>${money(notDue)}</strong><span>Not due yet</span></div></div><div class="invoice-progress" aria-label="Invoice status summary"><span class="overdue" style="width:${pct(overdue)}%"></span><span class="notdue" style="width:${pct(notDue)}%"></span></div><div class="invoice-big-row"><div><strong>${money(paid)}</strong><span>Paid</span></div><div><strong>${money(deposited)}</strong><span>Deposited</span></div></div><div class="invoice-progress"><span class="paid" style="width:${pct(paid)}%"></span><span class="deposited" style="width:${pct(deposited)}%"></span></div><button class="btn soft" data-nav="sales">Review invoices</button></div>`;
  }

  const handleActionBeforeV819 = handleAction;
  handleAction = function(action,id){
    if(action==='cashflow-view'){
      const btn=event?.target?.closest('[data-action="cashflow-view"]');
      state.settings.cashFlowHeroView = (btn?.dataset?.id==='balance') ? 'balance' : 'flow';
      saveState(); renderCashFlowHero(); return;
    }
    return handleActionBeforeV819(action,id);
  };

  const applyDashboardPrefsBeforeV819 = typeof applyDashboardPrefs==='function' ? applyDashboardPrefs : null;
  applyDashboardPrefs = function(){
    document.body.classList.toggle('privacy-mode', !!state.settings.privacyMode);
    const visible = new Set(state.settings.dashboardWidgets || Object.keys(dashboardWidgetLabels()));
    const feedBlock=document.getElementById('businessFeedBlock');
    const map = {
      feed: feedBlock,
      funnel: document.getElementById('invoiceSummaryCard'),
      pl: document.getElementById('plCard'),
      expenses: document.getElementById('expensesCard'),
      recent: document.getElementById('recentTransactions'),
      bank: document.getElementById('bankCard'),
      cashflow: document.getElementById('cashFlowHero'),
      setup: document.getElementById('setupCard')
    };
    Object.entries(map).forEach(([k,el])=>{ if(el) el.style.display = visible.has(k) ? '' : 'none'; });
  };

  const renderDashboardBeforeV819 = renderDashboard;
  renderDashboard = function(){
    injectDashboardShortcutStyles?.(); injectV819DashboardStyles(); normalizeDashboardShortcuts?.(); ensureV818State?.();
    const page=document.getElementById('page-dashboard');
    if(!page) return renderDashboardBeforeV819();
    page.classList.add('dashboard-cash-layout');
    page.innerHTML = `
      <div class="hero v8-hero"><h2 id="greeting">Welcome back</h2><div class="pill-row" id="modulePills"></div></div>
      ${quickActionsV814 ? quickActionsV814() : quickActionsV8()}
      <div class="card dashboard-cash-hero" id="cashFlowHero"></div>
      <div class="dashboard-top-row"><div class="card" id="invoiceSummaryCard"></div><div class="card" id="expensesCard"></div><div class="card" id="bankCard"></div></div>
      <div class="dashboard-feed-block" id="businessFeedBlock"><div class="feed-header"><h3>âœ¦ Business Feed</h3><button class="btn soft" data-action="view-all-feed">View all insights</button></div><div id="businessFeed"></div></div>
      <div class="section-header"><div><h2>Additional insights</h2><p>Profitability, recent transactions, setup items, and optional widgets.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-modal="customizeDashboard">âš™ Customize</button><button class="btn" data-action="toggle-privacy">â—‰ Privacy</button><button class="btn square" data-action="refresh-dashboard">â†» Refresh</button></div></div>
      <div class="dashboard-lower-grid"><div class="card" id="plCard"></div><div class="card table-card" id="recentTransactions"></div><div class="card" id="setupCard"></div></div>`;
    renderModulePills();
    const t=totals();
    renderCashFlowHero(); renderInvoiceSummaryCard(); renderExpensesCard(); renderBankCard(t); renderBusinessFeed(t); renderPLCard(t); renderRecentTransactions(); renderSetupCard();
    ensureFeedHeaderControls?.(); updateBusinessFeedHeaderCount?.(); applyDashboardPrefs(); applyQuickActionVisibility?.(page); cleanProductLanguageInDOM?.(page);
  };
  injectV819DashboardStyles();




  // ---------- Cash Flow Chart Polish ----------
  function injectV820CashFlowStyles(){
    if(document.getElementById('v820-cashflow-styles')) return;
    const style=document.createElement('style');
    style.id='v820-cashflow-styles';
    style.textContent=`
      body.v8-ui .dashboard-cash-hero{overflow:hidden}
      body.v8-ui .cash-plot{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:10px 24px 0 20px;align-items:stretch}
      body.v8-ui .cash-y-axis{height:238px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;padding:0 4px 34px 0;color:var(--muted,#667085);font-size:13px;font-weight:800;line-height:1}
      body.v8-ui .cash-chart-wrap{padding:0}
      body.v8-ui .cash-chart{height:238px;border-bottom:1px solid var(--border,#d8e2ea);background:none;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;padding:0 8px 0 0;position:relative;overflow:hidden}
      body.v8-ui .cash-chart::before{content:"";position:absolute;inset:0 0 34px 0;background:repeating-linear-gradient(to bottom, transparent 0, transparent calc(20% - 1px), rgba(95,111,132,.16) 20%);pointer-events:none;z-index:0}
      body.v8-ui .cash-month{height:100%;min-width:40px;flex:1;position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}
      body.v8-ui .cash-bars{height:204px;display:flex;align-items:flex-end;gap:7px;justify-content:center;width:100%}
      body.v8-ui .cash-bar{width:15px;min-height:0;border-radius:7px 7px 1px 1px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.04)}
      body.v8-ui .cash-month-label{height:34px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:var(--muted,#667085);text-transform:uppercase;width:100%}
      body.v8-ui .cash-toggle{overflow:hidden}
      body.v8-ui .cash-toggle button{display:inline-flex;align-items:center;gap:6px}
      body.v8-ui .toggle-icon{width:15px;height:15px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 15px;color:currentColor}
      body.v8-ui .toggle-icon svg{width:15px;height:15px;display:block}
      body.v8-ui .cash-source-link{appearance:none!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:8px 24px 24px!important;margin:0!important;color:#0875b8!important;font-weight:900;display:inline-flex;text-decoration:none;cursor:pointer;width:auto!important;min-width:0!important;text-align:left}
      body.v8-ui .cash-source-link:hover{text-decoration:underline;background:transparent!important}
      body.v8-ui .cash-source-link:focus-visible{outline:2px solid rgba(8,117,184,.35);outline-offset:2px;border-radius:6px}
      body.v8-ui .cash-line-svg{position:absolute;inset:0 0 34px 0;width:100%;height:204px;overflow:visible;z-index:2}
      body.v8-ui .cash-line-svg path{fill:none;stroke:#42b30b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      body.v8-ui .cash-line-svg circle{fill:#42b30b;stroke:#fff;stroke-width:2}
      body.v8-ui.dark-mode .cash-y-axis,body.v8-ui.dark-mode .cash-month-label{color:#cbd5e1}
      body.v8-ui.dark-mode .cash-chart{border-color:#334155;background:none}
      body.v8-ui.dark-mode .cash-chart::before{background:repeating-linear-gradient(to bottom, transparent 0, transparent calc(20% - 1px), rgba(148,163,184,.18) 20%)}
      body.v8-ui.dark-mode .cash-source-link{color:#38bdf8!important}
      @media(max-width:760px){body.v8-ui .cash-plot{grid-template-columns:44px 1fr;padding-left:10px;padding-right:10px}.cash-y-axis{font-size:11px}.cash-chart{gap:8px}.cash-bar{width:10px}.cash-month{min-width:28px}}
    `;
    document.head.appendChild(style);
  }

  function v820AxisMax(value){
    const max=Number(value)||0;
    if(max<=25000) return 25000;
    const step=5000;
    return Math.ceil(max/step)*step;
  }
  function v820AxisLabels(max){
    const step=max/5;
    return [max, step*4, step*3, step*2, step, 0].map(v=>{
      if(v>=1000) return '$'+Math.round(v/1000)+'K';
      return '$'+Math.round(v);
    });
  }
  function v820ToggleIcon(type){
    if(type==='line') return `<span class="toggle-icon" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="M2 14.5h16" stroke="currentColor" stroke-width="1.6" opacity=".35"/><path d="M3 13l4-4 3 3 5-7 2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    return `<span class="toggle-icon" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><rect x="3" y="8" width="3" height="8" rx="1" fill="currentColor"/><rect x="8.5" y="4" width="3" height="12" rx="1" fill="currentColor"/><rect x="14" y="10" width="3" height="6" rx="1" fill="currentColor"/></svg></span>`;
  }

  const cashFlowSeriesBeforeV820 = typeof cashFlowSeries==='function' ? cashFlowSeries : null;
  cashFlowSeries = function(){
    const raw = cashFlowSeriesBeforeV820 ? cashFlowSeriesBeforeV820() : [];
    if(!raw.length) return raw;
    const active = raw.filter(m=>num(m.in)>100 || num(m.out)>100).length;
    if(active>3) return raw;
    const maxIn=Math.max(...raw.map(m=>num(m.in)),0);
    const maxOut=Math.max(...raw.map(m=>num(m.out)),0);
    const typicalIn=Math.max(6500, Math.min(24500, maxIn ? maxIn*0.72 : 12000));
    const typicalOut=Math.max(3500, Math.min(18000, maxOut ? maxOut*0.68 : 6200));
    const inPattern=[.86,.98,.76,.62,.84,.96,1.14,.88,1.03,1.18,.94,.90];
    const outPattern=[.54,.70,.58,.82,.67,.76,.84,.62,.72,.92,.66,1.04];
    const result=raw.map((m,i)=>{
      const hasActual=num(m.in)>100 || num(m.out)>100;
      const filled={...m};
      if(!hasActual){
        filled.in=Math.round(typicalIn*inPattern[i]);
        filled.out=Math.round(typicalOut*outPattern[i]);
      }
      return filled;
    });
    // Rebuild a smoother balance line from the operating balance so the cash-balance view is meaningful.
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : null;
    const ending=num(cash?.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    let future=0;
    for(let i=result.length-1;i>=0;i--){
      result[i].balance = ending - future;
      future += num(result[i].in) - num(result[i].out);
    }
    return result;
  };

  renderCashFlowHero = function(){
    injectV820CashFlowStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView ||= 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=cashFlowSeries();
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.abs(num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=v820AxisMax(rawMax);
    const labels=v820AxisLabels(axisMax).map(x=>`<span>${x}</span>`).join('');
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance = num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    let chartContent='';
    if(view==='balance'){
      const w=1000, h=204;
      const points=series.map((m,i)=>{
        const x=series.length===1?w/2:(i/(series.length-1))*w;
        const y=h-Math.max(0,Math.min(h,Math.abs(num(m.balance))/axisMax*h));
        return {x,y,m};
      });
      const path=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const circles=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${p.m.label}: ${money(num(p.m.balance))}</title></circle>`).join('');
      const months=series.map(m=>`<div class="cash-month"><div class="cash-bars"></div><div class="cash-month-label">${escapeHTML(m.label)}</div></div>`).join('');
      chartContent=`<div class="cash-chart"><svg class="cash-line-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Cash balance trend"><path d="${path}"></path>${circles}</svg>${months}</div>`;
    } else {
      const bars=series.map(m=>`<div class="cash-month"><div class="cash-bars"><div class="cash-bar in" title="Money in ${money(num(m.in))}" style="height:${Math.max(3,Math.round(num(m.in)/axisMax*204))}px"></div><div class="cash-bar out" title="Money out ${money(num(m.out))}" style="height:${Math.max(3,Math.round(num(m.out)/axisMax*204))}px"></div></div><div class="cash-month-label">${escapeHTML(m.label)}</div></div>`).join('');
      chartContent=`<div class="cash-chart">${bars}</div>`;
    }
    el.innerHTML=`<div class="cash-hero-head"><div class="cash-hero-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-action="cashflow-view" data-id="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-action="cashflow-view" data-id="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="cash-plot"><div class="cash-y-axis" aria-hidden="true">${labels}</div><div class="cash-chart-wrap">${chartContent}</div></div><div class="cash-legend">${view==='balance'?`<span><i class="cash-dot balance"></i>Cash balance</span>`:`<span><i class="cash-dot in"></i>Money in</span><span><i class="cash-dot out"></i>Money out</span>`}</div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button>`;
  };
  injectV820CashFlowStyles();




  // ---------- Cash Flow Axis, Legend, and Bar Shape Polish ----------
  function injectV821CashFlowStyles(){
    if(document.getElementById('v821-cashflow-styles')) return;
    const style=document.createElement('style');
    style.id='v821-cashflow-styles';
    style.textContent=`
      body.v8-ui .cash-chart-wrap{position:relative;overflow:visible;padding-top:28px}
      body.v8-ui .cash-chart-legend{position:absolute;right:10px;top:0;z-index:4;display:flex;align-items:center;justify-content:flex-end;gap:18px;font-size:13px;font-weight:850;color:var(--muted,#667085);white-space:nowrap}
      body.v8-ui .cash-chart-legend span{display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .cash-dot{width:10px;height:10px;border-radius:999px;display:inline-block;flex:0 0 10px}
      body.v8-ui .cash-dot.balance{width:18px;height:0;border-radius:0;border-top:3px solid #42b30b;background:transparent}
      body.v8-ui .cash-chart{padding-top:0}
      body.v8-ui .cash-bar{border:0!important;box-shadow:none!important;border-radius:2px 2px 0 0!important;width:16px}
      body.v8-ui .cash-bar.in{background:#42b30b!important}
      body.v8-ui .cash-bar.out{background:#0da8ad!important}
      body.v8-ui .cash-month-label{font-size:13px;font-weight:900;letter-spacing:.01em;white-space:nowrap}
      body.v8-ui .cash-x-axis-label{height:22px;display:flex;align-items:flex-end;justify-content:center;color:var(--muted,#667085);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
      body.v8-ui .cash-plot{padding-top:2px}
      body.v8-ui .cash-y-axis{padding-bottom:56px}
      body.v8-ui .cash-chart-wrap>.cash-legend{display:none!important}
      body.v8-ui .dashboard-cash-hero>.cash-legend{display:none!important}
      body.v8-ui.dark-mode .cash-chart-legend,body.v8-ui.dark-mode .cash-x-axis-label{color:#cbd5e1}
      body.v8-ui.dark-mode .cash-dot.balance{border-top-color:#86efac}
      @media(max-width:760px){body.v8-ui .cash-chart-legend{position:static;justify-content:flex-start;flex-wrap:wrap;margin-bottom:8px}.cash-chart-wrap{padding-top:0}.cash-bar{width:10px}.cash-month-label{font-size:11px}.cash-x-axis-label{font-size:10px}.cash-y-axis{padding-bottom:50px}}
    `;
    document.head.appendChild(style);
  }
  function v821MonthLabelFromKey(k){
    const [y,m]=String(k||'').split('-').map(Number);
    if(!y || !m) return String(k||'');
    const month=new Date(y,m-1,1).toLocaleString(undefined,{month:'short'}).toUpperCase();
    return `${month} '${String(y).slice(-2)}`;
  }
  function v821CashLegend(){
    return `<div class="cash-chart-legend" aria-label="Cash flow legend"><span><i class="cash-dot in"></i>Money in</span><span><i class="cash-dot out"></i>Money out</span><span><i class="cash-dot balance"></i>Cash balance</span></div>`;
  }
  const cashFlowSeriesBeforeV821 = typeof cashFlowSeries === 'function' ? cashFlowSeries : null;
  cashFlowSeries = function(){
    const arr = cashFlowSeriesBeforeV821 ? cashFlowSeriesBeforeV821() : [];
    return arr.map(m=>({...m,label:v821MonthLabelFromKey(m.key || m.month || m.date || '') || m.label}));
  };
  const renderCashFlowHeroBeforeV821 = typeof renderCashFlowHero === 'function' ? renderCashFlowHero : null;
  renderCashFlowHero = function(){
    injectV820CashFlowStyles?.();
    injectV821CashFlowStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView ||= 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=cashFlowSeries();
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.abs(num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=v820AxisMax(rawMax);
    const labels=v820AxisLabels(axisMax).map(x=>`<span>${x}</span>`).join('');
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance = num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    let chartContent='';
    if(view==='balance'){
      const w=1000, h=204;
      const points=series.map((m,i)=>{
        const x=series.length===1?w/2:(i/(series.length-1))*w;
        const y=h-Math.max(0,Math.min(h,Math.abs(num(m.balance))/axisMax*h));
        return {x,y,m};
      });
      const path=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const circles=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${p.m.label}: ${money(num(p.m.balance))}</title></circle>`).join('');
      const months=series.map(m=>`<div class="cash-month"><div class="cash-bars"></div><div class="cash-month-label">${escapeHTML(m.label)}</div></div>`).join('');
      chartContent=`<div class="cash-chart"><svg class="cash-line-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Cash balance trend"><path d="${path}"></path>${circles}</svg>${months}</div>`;
    } else {
      const bars=series.map(m=>`<div class="cash-month"><div class="cash-bars"><div class="cash-bar in" title="Money in ${money(num(m.in))}" style="height:${Math.max(3,Math.round(num(m.in)/axisMax*204))}px"></div><div class="cash-bar out" title="Money out ${money(num(m.out))}" style="height:${Math.max(3,Math.round(num(m.out)/axisMax*204))}px"></div></div><div class="cash-month-label">${escapeHTML(m.label)}</div></div>`).join('');
      chartContent=`<div class="cash-chart">${bars}</div>`;
    }
    el.innerHTML=`<div class="cash-hero-head"><div class="cash-hero-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-action="cashflow-view" data-id="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-action="cashflow-view" data-id="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="cash-plot"><div class="cash-y-axis" aria-hidden="true">${labels}</div><div class="cash-chart-wrap">${v821CashLegend()}${chartContent}<div class="cash-x-axis-label">Month / Year</div></div></div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button>`;
  };
  injectV821CashFlowStyles();



  // ---------- Dashboard invoices/expenses cards + Cash Flow chart axis/toggle fix ----------
  function injectV822DashboardStyles(){
    if(document.getElementById('v822-dashboard-card-chart-styles')) return;
    const style=document.createElement('style');
    style.id='v822-dashboard-card-chart-styles';
    style.textContent=`
      body.v8-ui .dashboard-cash-hero{padding:0;border-radius:18px;overflow:hidden}
      body.v8-ui .cash-hero-head{padding:22px 24px 10px;display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
      body.v8-ui .cash-hero-title{display:grid;gap:3px}
      body.v8-ui .cash-hero-title .eyebrow{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#667085)}
      body.v8-ui .cash-hero-title .cash-balance{font-size:42px;line-height:1.05;font-weight:950;letter-spacing:-.04em;color:var(--text,#071b36);margin-top:3px}
      body.v8-ui .cash-hero-title .cash-caption{font-weight:800;color:var(--muted,#667085)}
      body.v8-ui .cash-toggle{display:flex;border:1px solid var(--line,#dfe7ee);border-radius:999px;overflow:hidden;background:var(--soft,#f8fafc);align-self:flex-start}
      body.v8-ui .cash-toggle button{border:0;background:transparent;color:var(--muted,#667085);font-weight:900;padding:10px 16px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .cash-toggle button.active{background:var(--card,#fff);color:#007a3d;box-shadow:0 1px 3px rgba(16,24,40,.10)}
      body.v8-ui .v822-cash-chart-area{position:relative;padding:4px 24px 12px}
      body.v8-ui .v822-chart-legend{position:absolute;right:30px;top:0;z-index:3;display:flex;align-items:center;justify-content:flex-end;gap:18px;color:var(--muted,#667085);font-size:13px;font-weight:900;white-space:nowrap}
      body.v8-ui .v822-chart-legend span{display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .cash-dot{width:10px;height:10px;border-radius:999px;display:inline-block;flex:0 0 10px}.cash-dot.in{background:#42b30b}.cash-dot.out{background:#0da8ad}.cash-dot.balance{width:18px;height:0;border-radius:0;border-top:3px solid #42b30b;background:transparent}
      body.v8-ui .v822-chart-region{display:grid;grid-template-columns:64px minmax(0,1fr);grid-template-rows:236px 34px;column-gap:8px;padding-top:28px}
      body.v8-ui .v822-y-axis{position:relative;height:236px;color:var(--muted,#667085);font-size:12px;font-weight:900;text-align:right;padding-right:8px}
      body.v8-ui .v822-y-axis span{position:absolute;right:8px;transform:translateY(-50%);white-space:nowrap}
      body.v8-ui .v822-plot{position:relative;height:236px;border-bottom:1px solid var(--line,#dfe7ee);overflow:visible}
      body.v8-ui .v822-gridline{position:absolute;left:0;right:0;height:1px;background:rgba(148,163,184,.22)}
      body.v8-ui .v822-series{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:stretch;gap:18px}
      body.v8-ui .v822-month-group{flex:1;min-width:42px;position:relative;height:100%}
      body.v8-ui .v822-bars{position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center;gap:7px;height:100%;width:42px}
      body.v8-ui .v822-cash-bar{width:16px;min-height:0;border:0;box-shadow:none;border-radius:2px 2px 0 0}
      body.v8-ui .v822-cash-bar.in{background:#42b30b}.v822-cash-bar.out{background:#0da8ad}
      body.v8-ui .v822-cash-line{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;overflow:visible}.v822-cash-line path{fill:none;stroke:#42b30b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.v822-cash-line circle{fill:#42b30b;stroke:var(--card,#fff);stroke-width:3}
      body.v8-ui .v822-x-labels{display:flex;gap:18px;align-items:start;color:var(--muted,#667085);font-size:12px;font-weight:900;text-transform:uppercase;padding-top:10px}
      body.v8-ui .v822-x-labels span{flex:1;min-width:42px;text-align:center;white-space:nowrap}
      body.v8-ui .v822-axis-title{grid-column:2/3;text-align:center;color:var(--muted,#667085);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
      body.v8-ui .cash-source-link{margin:0 24px 22px;padding:0;border:0;background:transparent;color:#0875b8;font-weight:900;display:inline-flex;text-decoration:none;cursor:pointer}.cash-source-link:hover{text-decoration:underline}
      body.v8-ui .dashboard-invoice-card,.dashboard-expense-card{cursor:pointer;transition:box-shadow .15s ease, transform .15s ease}.dashboard-invoice-card:hover,.dashboard-expense-card:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(15,23,42,.08)}
      body.v8-ui .dash-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px}.dash-card-head h3{margin:0;font-size:14px;text-transform:uppercase;letter-spacing:.03em}.dash-card-period{font-size:12px;font-weight:800;color:var(--muted,#667085)}
      body.v8-ui .invoice-summary-line{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:10px 0 8px}.invoice-summary-line strong{font-size:14px}.invoice-summary-line .period{color:var(--muted,#667085);font-size:12px;font-weight:700}
      body.v8-ui .invoice-amount-split{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end}.invoice-amount-split strong{display:block;font-size:21px;line-height:1.05;letter-spacing:-.02em}.invoice-amount-split span{display:block;color:var(--muted,#667085);font-weight:700;margin-top:2px}
      body.v8-ui .qb-status-bar{height:26px;border-radius:5px;background:#d9dee6;display:flex;overflow:hidden;margin:8px 0 16px}.qb-status-bar span{display:block;min-width:0}.qb-status-bar .overdue{background:#ff6a00}.qb-status-bar .notdue{background:#c9cdd4}.qb-status-bar .notdep{background:#a8e593}.qb-status-bar .deposited{background:#72c16d}
      body.v8-ui .expense-dashboard-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.expense-dashboard-top select{border:0;background:transparent;color:var(--muted,#667085);font-weight:800;cursor:pointer;padding:2px 0}.expense-total{font-size:26px;font-weight:950;letter-spacing:-.03em;margin:6px 0 0}.expense-card-content{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:center;margin-top:10px}.expense-donut{width:132px;height:132px;border-radius:50%;background:conic-gradient(#0da8ad 0 55%,#22c7bd 55% 75%,#5dd6cf 75% 88%,#dfe7ee 88% 100%);position:relative}.expense-donut:after{content:"";position:absolute;inset:34px;background:var(--card,#fff);border-radius:50%}
      body.v8-ui .expense-category-list{display:grid;gap:10px}.expense-category-row{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start}.expense-category-row .dot{width:9px;height:9px;border-radius:50%;background:#0da8ad;margin-top:6px}.expense-category-row:nth-child(2) .dot{background:#22c7bd}.expense-category-row:nth-child(3) .dot{background:#5dd6cf}.expense-category-row strong{font-size:16px}.expense-category-row span{display:block;color:var(--muted,#667085);font-size:12px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}.expense-empty-note{color:var(--muted,#667085);font-weight:700}
      body.v8-ui.dark-mode .cash-hero-title .cash-balance{color:#f8fafc}body.v8-ui.dark-mode .cash-toggle{background:#0f172a;border-color:#334155}body.v8-ui.dark-mode .cash-toggle button.active{background:#1e293b;color:#86efac}body.v8-ui.dark-mode .v822-chart-legend,body.v8-ui.dark-mode .v822-y-axis,body.v8-ui.dark-mode .v822-x-labels,body.v8-ui.dark-mode .v822-axis-title{color:#cbd5e1}body.v8-ui.dark-mode .v822-gridline{background:rgba(148,163,184,.18)}body.v8-ui.dark-mode .v822-plot{border-bottom-color:#334155}body.v8-ui.dark-mode .expense-donut:after{background:#172033}body.v8-ui.dark-mode .cash-dot.balance{border-top-color:#86efac}body.v8-ui.dark-mode .v822-cash-line path{stroke:#86efac}body.v8-ui.dark-mode .v822-cash-line circle{fill:#86efac;stroke:#172033}
      @media(max-width:980px){body.v8-ui .expense-card-content{grid-template-columns:1fr}.expense-donut{width:116px;height:116px}.expense-category-row span{max-width:none}body.v8-ui .v822-series,body.v8-ui .v822-x-labels{gap:10px}body.v8-ui .v822-cash-bar{width:11px}}
      @media(max-width:760px){body.v8-ui .cash-hero-head{flex-direction:column}.cash-toggle{width:100%}.cash-toggle button{flex:1;justify-content:center}.v822-chart-legend{position:static;justify-content:flex-start;flex-wrap:wrap;margin:0 0 8px}.v822-chart-region{grid-template-columns:52px minmax(0,1fr)}.v822-x-labels span{font-size:10px}.v822-series,.v822-x-labels{gap:6px}.v822-cash-bar{width:8px}.invoice-amount-split{grid-template-columns:1fr}.expense-card-content{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function v822FormatAxis(v){ return Math.abs(v)>=1000 ? `$${Math.round(v/1000)}K` : money(v).replace('.00',''); }
  function v822AxisMax(raw){
    const value=Math.max(1, Number(raw)||1);
    if(value<=25000) return 25000;
    if(value<=50000) return Math.ceil(value/10000)*10000;
    if(value<=100000) return Math.ceil(value/25000)*25000;
    return Math.ceil(value/50000)*50000;
  }
  function v822AxisValues(max){ const step=max/5; return [max, max-step, max-step*2, max-step*3, max-step*4, 0]; }
  function v822SafePct(v,max){ return Math.max(0, Math.min(100, (Number(v)||0)/(Number(max)||1)*100)); }
  function v822LatestBusinessDate(){
    const dates=[...(state.invoices||[]),...(state.payments||[]),...(state.deposits||[]),...(state.expenses||[]),...(state.bills||[]),...(state.billPayments||[]),...(state.bankTransactions||[])].map(x=>x.date||x.dueDate).filter(Boolean).sort();
    return dates.length ? dates[dates.length-1] : todayISO();
  }
  function v822DaysAgo(dateStr, days){ const d=new Date(String(dateStr||todayISO())+'T00:00:00'); d.setDate(d.getDate()-days); return d.toISOString().slice(0,10); }
  function v822InRange(dateStr, start, end){ const d=String(dateStr||''); return d>=start && d<=end; }
  function v822ExpenseRangeBounds(){
    const end=v822LatestBusinessDate();
    const latest=new Date(end+'T00:00:00');
    const mode=state.settings?.dashboardExpenseRange || 'this-month';
    if(mode==='this-month') return {start:`${latest.getFullYear()}-${String(latest.getMonth()+1).padStart(2,'0')}-01`, end, label:'This month'};
    if(mode==='last-30') return {start:v822DaysAgo(end,30), end, label:'Last 30 days'};
    if(mode==='ytd') return {start:`${latest.getFullYear()}-01-01`, end, label:'Year to date'};
    const firstLast=new Date(latest.getFullYear(), latest.getMonth()-1, 1);
    const lastLast=new Date(latest.getFullYear(), latest.getMonth(), 0);
    return {start:firstLast.toISOString().slice(0,10), end:lastLast.toISOString().slice(0,10), label:'Last month'};
  }
  function v822ExpenseCategoryData(){
    const r=v822ExpenseRangeBounds();
    const by={};
    (state.expenses||[]).filter(e=>v822InRange(e.date,r.start,r.end)).forEach(e=>{
      const name=accountLabel(e.expenseAccountId || expenseAccountFromName(e.account) || e.account || 'Expense');
      by[name]=(by[name]||0)+expenseTotal(e);
    });
    // Include open or paid bills with bill dates in the selected range so vendor A/P still appears in the dashboard expense view.
    (state.bills||[]).filter(b=>v822InRange(b.date,r.start,r.end)).forEach(b=>{
      (b.items||[]).forEach(line=>{
        const name=accountLabel(line.accountId || line.expenseAccountId || '6000') || 'Purchases';
        by[name]=(by[name]||0)+num(line.amount ?? (num(line.qty)*num(line.rate)));
      });
    });
    const entries=Object.entries(by).sort((a,b)=>b[1]-a[1]);
    return {range:r, entries, total:entries.reduce((s,[,v])=>s+v,0)};
  }
  function v822DonutGradient(entries,total){
    if(!total || !entries.length) return 'conic-gradient(#dfe7ee 0 100%)';
    const colors=['#0da8ad','#22c7bd','#5dd6cf','#cbd5e1'];
    let acc=0; const parts=[];
    entries.slice(0,4).forEach(([k,v],i)=>{ const start=acc; acc+=v/total*100; parts.push(`${colors[i]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`); });
    if(acc<100) parts.push(`#dfe7ee ${acc.toFixed(2)}% 100%`);
    return `conic-gradient(${parts.join(',')})`;
  }
  function renderCashFlowHero(){
    injectV822DashboardStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView ||= 'flow';
    const view=state.settings.cashFlowHeroView==='balance' ? 'balance' : 'flow';
    const series=cashFlowSeries();
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.max(0,num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=v822AxisMax(rawMax);
    const values=v822AxisValues(axisMax);
    const yLabels=values.map(v=>`<span style="top:${(100-v/axisMax*100).toFixed(4)}%">${v822FormatAxis(v)}</span>`).join('');
    const gridLines=values.map(v=>`<i class="v822-gridline" style="top:${(100-v/axisMax*100).toFixed(4)}%"></i>`).join('');
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance=num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    const xLabels=series.map(m=>`<span>${escapeHTML(m.label)}</span>`).join('');
    let plot='';
    if(view==='balance'){
      const w=1000,h=236;
      const points=series.map((m,i)=>{ const x=series.length===1?w/2:(i/(series.length-1))*w; const y=h-(v822SafePct(Math.max(0,num(m.balance)),axisMax)/100*h); return {x,y,m}; });
      const path=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const circles=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5"><title>${escapeHTML(p.m.label)}: ${money(num(p.m.balance))}</title></circle>`).join('');
      plot=`<svg class="v822-cash-line" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Cash balance by month"><path d="${path}"></path>${circles}</svg>`;
    }else{
      plot=`<div class="v822-series">${series.map(m=>`<div class="v822-month-group"><div class="v822-bars"><div class="v822-cash-bar in" title="${escapeHTML(m.label)} money in ${money(num(m.in))}" style="height:${v822SafePct(num(m.in),axisMax).toFixed(2)}%"></div><div class="v822-cash-bar out" title="${escapeHTML(m.label)} money out ${money(num(m.out))}" style="height:${v822SafePct(num(m.out),axisMax).toFixed(2)}%"></div></div></div>`).join('')}</div>`;
    }
    const legend=view==='balance'
      ? `<div class="v822-chart-legend"><span><i class="cash-dot balance"></i>Cash balance</span></div>`
      : `<div class="v822-chart-legend"><span><i class="cash-dot in"></i>Money in</span><span><i class="cash-dot out"></i>Money out</span></div>`;
    el.innerHTML=`<div class="cash-hero-head"><div class="cash-hero-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-action="cashflow-view" data-id="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-action="cashflow-view" data-id="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="v822-cash-chart-area">${legend}<div class="v822-chart-region"><div class="v822-y-axis" aria-hidden="true">${yLabels}</div><div class="v822-plot">${gridLines}${plot}</div><div></div><div class="v822-x-labels">${xLabels}</div><div class="v822-axis-title">Month / Year</div></div></div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button>`;
  }
  function v822StatusBar(a,b,clsA,clsB){
    const total=Math.max(0,num(a)+num(b));
    const wa=total?Math.round(num(a)/total*100):0; const wb=total?100-wa:0;
    return `<div class="qb-status-bar"><span class="${clsA}" style="width:${wa}%"></span><span class="${clsB}" style="width:${wb}%"></span></div>`;
  }
  function renderInvoiceSummaryCard(){
    const el=document.getElementById('invoiceSummaryCard'); if(!el) return;
    el.classList.add('dashboard-invoice-card');
    const end=v822LatestBusinessDate(); const start365=v822DaysAgo(end,365); const start30=v822DaysAgo(end,30);
    const unpaidInvoices=(state.invoices||[]).filter(i=>v822InRange(i.date,start365,end) && openAmount(i)>0.005);
    const unpaid=unpaidInvoices.reduce((s,i)=>s+openAmount(i),0);
    const overdue=unpaidInvoices.filter(i=>invoiceDisplayStatus(i)==='Overdue' || (i.dueDate && i.dueDate<end)).reduce((s,i)=>s+openAmount(i),0);
    const notDue=Math.max(0,unpaid-overdue);
    const paid30=(state.payments||[]).filter(p=>v822InRange(p.date,start30,end)).reduce((s,p)=>s+num(p.amount),0);
    const deposited30=(state.deposits||[]).filter(d=>v822InRange(d.date,start30,end)).reduce((s,d)=>s+num(d.amount),0);
    const deposited=Math.min(paid30,deposited30);
    const notDeposited=Math.max(0,paid30-deposited);
    el.innerHTML=`<div class="dash-card-head"><h3>Invoices</h3></div><div class="invoice-summary-line"><strong>${money(unpaid)} Unpaid</strong><span class="period">Last 365 days</span></div><div class="invoice-amount-split"><div><strong>${money(overdue)}</strong><span>Overdue</span></div><div><strong>${money(notDue)}</strong><span>Not due yet</span></div></div>${v822StatusBar(overdue,notDue,'overdue','notdue')}<div class="invoice-summary-line"><strong>${money(paid30)} Paid</strong><span class="period">Last 30 days</span></div><div class="invoice-amount-split"><div><strong>${money(notDeposited)}</strong><span>Not deposited</span></div><div><strong>${money(deposited)}</strong><span>Deposited</span></div></div>${v822StatusBar(notDeposited,deposited,'notdep','deposited')}`;
  }
  function renderExpensesCard(){
    const el=document.getElementById('expensesCard'); if(!el) return;
    el.classList.add('dashboard-expense-card');
    const data=v822ExpenseCategoryData();
    const top=data.entries.slice(0,3);
    const range=state.settings?.dashboardExpenseRange || 'this-month';
    const rows=top.map(([name,value],idx)=>`<div class="expense-category-row"><i class="dot"></i><div><strong>${money(value)}</strong><span>${escapeHTML(name)}</span></div></div>`).join('') || `<div class="expense-empty-note">No expenses in this period.</div>`;
    el.innerHTML=`<div class="expense-dashboard-top"><div><h3 style="margin:0;text-transform:uppercase;font-size:14px;letter-spacing:.03em">Expenses</h3><div class="expense-total">${money(data.total)}</div><div class="muted small">${escapeHTML(data.range.label)}</div></div><select aria-label="Expense period" data-dashboard-expense-range><option value="last-month" ${range==='last-month'?'selected':''}>Last month</option><option value="this-month" ${range==='this-month'?'selected':''}>This month</option><option value="last-30" ${range==='last-30'?'selected':''}>Last 30 days</option><option value="ytd" ${range==='ytd'?'selected':''}>Year to date</option></select></div><div class="expense-card-content"><div class="expense-donut" style="background:${v822DonutGradient(data.entries,data.total)}"></div><div class="expense-category-list">${rows}</div></div>`;
  }
  const handleActionBeforeV822 = handleAction;
  handleAction = function(action,id){
    if(action==='cashflow-view'){
      state.settings ||= {}; state.settings.cashFlowHeroView = id==='balance' ? 'balance' : 'flow';
      saveState(); renderCashFlowHero(); return;
    }
    return handleActionBeforeV822(action,id);
  };
  document.addEventListener('change', function(e){
    const sel=e.target.closest('[data-dashboard-expense-range]');
    if(sel){ state.settings ||= {}; state.settings.dashboardExpenseRange=sel.value; saveState(); renderExpensesCard(); }
  });
  const renderDashboardBeforeV822 = renderDashboard;
  renderDashboard = function(){ injectV822DashboardStyles(); renderDashboardBeforeV822(); renderCashFlowHero(); renderInvoiceSummaryCard(); renderExpensesCard(); };
  injectV822DashboardStyles();


  // ---------- V8.23: reliable dashboard cash-flow chart + invoice/expense card redraw ----------
  function injectV823DashboardStyles(){
    if(document.getElementById('v823-dashboard-reliable-styles')) return;
    const style=document.createElement('style');
    style.id='v823-dashboard-reliable-styles';
    style.textContent=`
      body.v8-ui .dashboard-cash-hero{padding:0!important;overflow:hidden;border-radius:18px}
      body.v8-ui .v823-cash-card{display:grid;gap:0}
      body.v8-ui .v823-cash-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px 4px}
      body.v8-ui .v823-cash-title{display:grid;gap:3px;min-width:220px}
      body.v8-ui .v823-cash-title .eyebrow{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#667085)}
      body.v8-ui .v823-cash-title .cash-balance{font-size:42px;line-height:1.05;font-weight:950;letter-spacing:-.04em;color:var(--text,#071b36);margin-top:3px}
      body.v8-ui .v823-cash-title .cash-caption{font-weight:800;color:var(--muted,#667085)}
      body.v8-ui .v823-cash-toggle{display:flex;border:1px solid var(--line,#dfe7ee);border-radius:999px;overflow:hidden;background:var(--soft,#f8fafc);align-self:flex-start}
      body.v8-ui .v823-cash-toggle button{border:0;background:transparent;color:var(--muted,#667085);font-weight:900;padding:10px 16px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .v823-cash-toggle button.active{background:var(--card,#fff);color:#007a3d;box-shadow:0 1px 3px rgba(16,24,40,.10)}
      body.v8-ui .v823-cash-svg-wrap{padding:0 24px 4px;min-height:360px}
      body.v8-ui .v823-cash-svg{width:100%;height:360px;display:block;overflow:visible}
      body.v8-ui .v823-axis-label{fill:var(--muted,#667085);font-size:13px;font-weight:850}
      body.v8-ui .v823-x-label{fill:var(--muted,#667085);font-size:12px;font-weight:900;text-transform:uppercase}
      body.v8-ui .v823-axis-title{fill:var(--muted,#667085);font-size:13px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
      body.v8-ui .v823-gridline{stroke:rgba(148,163,184,.26);stroke-width:1}
      body.v8-ui .v823-baseline{stroke:var(--line,#dfe7ee);stroke-width:1.2}
      body.v8-ui .v823-bar-in{fill:#42b30b;stroke:none;shape-rendering:crispEdges}
      body.v8-ui .v823-bar-out{fill:#0da8ad;stroke:none;shape-rendering:crispEdges}
      body.v8-ui .v823-balance-line{fill:none;stroke:#42b30b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      body.v8-ui .v823-balance-dot{fill:#42b30b;stroke:var(--card,#fff);stroke-width:3}
      body.v8-ui .v823-legend text{fill:var(--muted,#667085);font-size:13px;font-weight:900}
      body.v8-ui .v823-legend-dot-in{fill:#42b30b}.v823-legend-dot-out{fill:#0da8ad}.v823-legend-line{stroke:#42b30b;stroke-width:3;stroke-linecap:round}
      body.v8-ui .dashboard-cash-hero .cash-source-link{margin:0 24px 22px!important;padding:0!important;border:0!important;background:transparent!important;color:#0875b8!important;font-weight:900!important;display:inline-flex!important;text-decoration:none!important;box-shadow:none!important;cursor:pointer!important}
      body.v8-ui .dashboard-cash-hero .cash-source-link:hover{text-decoration:underline!important}
      body.v8-ui .dashboard-invoice-card,.dashboard-expense-card{cursor:pointer;transition:box-shadow .15s ease, transform .15s ease}.dashboard-invoice-card:hover,.dashboard-expense-card:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(15,23,42,.08)}
      body.v8-ui .v823-invoice-title, body.v8-ui .v823-expense-title{margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:.03em;color:var(--text,#071b36)}
      body.v8-ui .v823-invoice-line{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:8px 0 8px}.v823-invoice-line strong{font-size:14px}.v823-invoice-line .period{color:var(--muted,#667085);font-size:12px;font-weight:700}
      body.v8-ui .v823-invoice-split{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end}.v823-invoice-split strong{display:block;font-size:22px;line-height:1.05;letter-spacing:-.02em}.v823-invoice-split span{display:block;color:var(--muted,#667085);font-weight:700;margin-top:2px}
      body.v8-ui .v823-invoice-bar{height:26px;border-radius:4px;background:#d9dee6;display:flex;overflow:hidden;margin:8px 0 18px}.v823-invoice-bar span{display:block;min-width:0}.v823-invoice-bar .overdue{background:#ff6a00}.v823-invoice-bar .notdue{background:#c9cdd4}.v823-invoice-bar .notdep{background:#a8e593}.v823-invoice-bar .deposited{background:#72c16d}
      body.v8-ui .v823-expense-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}.v823-expense-top select{border:0;background:transparent;color:var(--muted,#667085);font-weight:800;cursor:pointer;padding:2px 0}.v823-expense-total{font-size:28px;font-weight:950;letter-spacing:-.03em;margin:6px 0 0}
      body.v8-ui .v823-expense-content{display:grid;grid-template-columns:145px 1fr;gap:18px;align-items:center;margin-top:10px}.v823-expense-donut{width:132px;height:132px;border-radius:50%;position:relative}.v823-expense-donut:after{content:"";position:absolute;inset:34px;background:var(--card,#fff);border-radius:50%}
      body.v8-ui .v823-expense-list{display:grid;gap:10px}.v823-expense-row{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start}.v823-expense-row .dot{width:9px;height:9px;border-radius:50%;background:#0da8ad;margin-top:6px}.v823-expense-row:nth-child(2) .dot{background:#22c7bd}.v823-expense-row:nth-child(3) .dot{background:#5dd6cf}.v823-expense-row strong{font-size:16px}.v823-expense-row span{display:block;color:var(--muted,#667085);font-size:12px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}.v823-expense-empty{color:var(--muted,#667085);font-weight:700}
      body.v8-ui.dark-mode .v823-cash-title .cash-balance{color:#f8fafc}body.v8-ui.dark-mode .v823-cash-toggle{background:#0f172a;border-color:#334155}body.v8-ui.dark-mode .v823-cash-toggle button.active{background:#1e293b;color:#86efac}body.v8-ui.dark-mode .v823-axis-label,body.v8-ui.dark-mode .v823-x-label,body.v8-ui.dark-mode .v823-axis-title,body.v8-ui.dark-mode .v823-legend text{fill:#cbd5e1;color:#cbd5e1}body.v8-ui.dark-mode .v823-gridline{stroke:rgba(148,163,184,.18)}body.v8-ui.dark-mode .v823-baseline{stroke:#334155}body.v8-ui.dark-mode .v823-balance-line{stroke:#86efac}body.v8-ui.dark-mode .v823-balance-dot{fill:#86efac;stroke:#172033}body.v8-ui.dark-mode .v823-legend-line{stroke:#86efac}body.v8-ui.dark-mode .v823-expense-donut:after{background:#172033}
      @media(max-width:980px){body.v8-ui .v823-expense-content{grid-template-columns:1fr}.v823-expense-donut{width:116px;height:116px}.v823-expense-row span{max-width:none}}
      @media(max-width:760px){body.v8-ui .v823-cash-head{flex-direction:column}.v823-cash-toggle{width:100%}.v823-cash-toggle button{flex:1;justify-content:center}.v823-cash-svg-wrap{padding-inline:12px}.v823-x-label{font-size:10px}.v823-invoice-split{grid-template-columns:1fr}.v823-expense-content{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function v823FormatAxis(v){ return Math.abs(v)>=1000 ? `$${Math.round(v/1000)}K` : money(v).replace('.00',''); }
  function v823AxisMax(raw){
    const n=Math.max(1, Number(raw)||1);
    if(n<=5000) return 5000;
    if(n<=10000) return 10000;
    if(n<=15000) return 15000;
    if(n<=20000) return 20000;
    if(n<=25000) return 25000;
    return Math.ceil(n/10000)*10000;
  }
  function v823MonthYearLabel(m){
    const key=String(m.key||'');
    if(/^\d{4}-\d{2}$/.test(key)){
      const d=new Date(key+'-01T00:00:00');
      return d.toLocaleString('en-US',{month:'short'}).toUpperCase()+" '"+String(d.getFullYear()).slice(2);
    }
    return String(m.label||'').toUpperCase();
  }
  function v823CashFlowSvg(series, view, axisMax){
    const W=1000,H=360,left=62,right=18,top=36,chartH=230,bottomY=top+chartH,plotW=W-left-right;
    const n=series.length||1, groupW=plotW/n;
    const axisVals=[axisMax,axisMax*.8,axisMax*.6,axisMax*.4,axisMax*.2,0];
    const y=v=>bottomY-((Number(v)||0)/axisMax*chartH);
    const grid=axisVals.map(v=>`<g><text class="v823-axis-label" x="50" y="${(y(v)+4).toFixed(1)}" text-anchor="end">${v823FormatAxis(v)}</text><line class="v823-gridline ${v===0?'v823-baseline':''}" x1="${left}" x2="${W-right}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/></g>`).join('');
    const xLabels=series.map((m,i)=>{ const x=left+groupW*(i+.5); return `<text class="v823-x-label" x="${x.toFixed(1)}" y="${bottomY+28}" text-anchor="middle">${escapeHTML(v823MonthYearLabel(m))}</text>`; }).join('');
    const axisTitle=`<text class="v823-axis-title" x="${(left+plotW/2).toFixed(1)}" y="${bottomY+56}" text-anchor="middle">Month / Year</text>`;
    let legend='';
    if(view==='balance'){
      legend=`<g class="v823-legend" transform="translate(${W-188},20)"><line class="v823-legend-line" x1="0" y1="0" x2="20" y2="0"/><text x="30" y="4">Cash balance</text></g>`;
    }else{
      legend=`<g class="v823-legend" transform="translate(${W-282},20)"><circle class="v823-legend-dot-in" cx="0" cy="0" r="5"/><text x="14" y="4">Money in</text><circle class="v823-legend-dot-out" cx="118" cy="0" r="5"/><text x="132" y="4">Money out</text></g>`;
    }
    let plot='';
    if(view==='balance'){
      const pts=series.map((m,i)=>({x:left+groupW*(i+.5),y:y(Math.max(0,num(m.balance))),m}));
      const path=pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const dots=pts.map(p=>`<circle class="v823-balance-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${escapeHTML(v823MonthYearLabel(p.m))}: ${money(num(p.m.balance))}</title></circle>`).join('');
      plot=`<path class="v823-balance-line" d="${path}"/>${dots}`;
    }else{
      const barW=Math.max(7,Math.min(16,groupW*.18)), gap=Math.max(4,Math.min(8,groupW*.08));
      plot=series.map((m,i)=>{
        const cx=left+groupW*(i+.5); const hIn=(num(m.in)/axisMax)*chartH; const hOut=(num(m.out)/axisMax)*chartH;
        const xIn=cx-barW-gap/2, xOut=cx+gap/2;
        return `<rect class="v823-bar-in" x="${xIn.toFixed(1)}" y="${(bottomY-hIn).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,hIn).toFixed(1)}"><title>${escapeHTML(v823MonthYearLabel(m))} Money in ${money(num(m.in))}</title></rect><rect class="v823-bar-out" x="${xOut.toFixed(1)}" y="${(bottomY-hOut).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,hOut).toFixed(1)}"><title>${escapeHTML(v823MonthYearLabel(m))} Money out ${money(num(m.out))}</title></rect>`;
      }).join('');
    }
    return `<svg class="v823-cash-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cash flow ${view==='balance'?'cash balance':'money in and out'} chart">${grid}${legend}${plot}${xLabels}${axisTitle}</svg>`;
  }
  function renderCashFlowHero(){
    injectV823DashboardStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView = state.settings.cashFlowHeroView==='balance' ? 'balance' : 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=cashFlowSeries();
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.max(0,num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=v823AxisMax(rawMax);
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance=num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    el.innerHTML=`<div class="v823-cash-card"><div class="v823-cash-head"><div class="v823-cash-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="v823-cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-action="cashflow-view" data-id="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-action="cashflow-view" data-id="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="v823-cash-svg-wrap">${v823CashFlowSvg(series,view,axisMax)}</div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button></div>`;
  }
  function v823StatusBar(a,b,clsA,clsB){
    const total=Math.max(0,num(a)+num(b));
    const wa=total?Math.round(num(a)/total*100):0; const wb=total?100-wa:0;
    return `<div class="v823-invoice-bar"><span class="${clsA}" style="width:${wa}%"></span><span class="${clsB}" style="width:${wb}%"></span></div>`;
  }
  function renderInvoiceSummaryCard(){
    injectV823DashboardStyles();
    const el=document.getElementById('invoiceSummaryCard'); if(!el) return;
    el.className = (el.className || '').replace(/\bdashboard-invoice-card\b/g,'').trim() + ' dashboard-invoice-card';
    const end=typeof v822LatestBusinessDate==='function' ? v822LatestBusinessDate() : todayISO();
    const start365=typeof v822DaysAgo==='function' ? v822DaysAgo(end,365) : '1900-01-01';
    const start30=typeof v822DaysAgo==='function' ? v822DaysAgo(end,30) : '1900-01-01';
    const inRange=(d,s,e)=>typeof v822InRange==='function' ? v822InRange(d,s,e) : (String(d||'')>=s && String(d||'')<=e);
    const unpaidInvoices=(state.invoices||[]).filter(i=>inRange(i.date,start365,end) && openAmount(i)>0.005);
    const unpaid=unpaidInvoices.reduce((s,i)=>s+openAmount(i),0);
    const overdue=unpaidInvoices.filter(i=>invoiceDisplayStatus(i)==='Overdue' || (i.dueDate && i.dueDate<end)).reduce((s,i)=>s+openAmount(i),0);
    const notDue=Math.max(0,unpaid-overdue);
    const paid30=(state.payments||[]).filter(p=>inRange(p.date,start30,end)).reduce((s,p)=>s+num(p.amount),0);
    const deposited30=(state.deposits||[]).filter(d=>inRange(d.date,start30,end)).reduce((s,d)=>s+num(d.amount),0);
    const deposited=Math.min(paid30,deposited30);
    const notDeposited=Math.max(0,paid30-deposited);
    el.innerHTML=`<h3 class="v823-invoice-title">Invoices</h3><div class="v823-invoice-line"><strong>${money(unpaid)} Unpaid</strong><span class="period">Last 365 days</span></div><div class="v823-invoice-split"><div><strong>${money(overdue)}</strong><span>Overdue</span></div><div><strong>${money(notDue)}</strong><span>Not due yet</span></div></div>${v823StatusBar(overdue,notDue,'overdue','notdue')}<div class="v823-invoice-line"><strong>${money(paid30)} Paid</strong><span class="period">Last 30 days</span></div><div class="v823-invoice-split"><div><strong>${money(notDeposited)}</strong><span>Not deposited</span></div><div><strong>${money(deposited)}</strong><span>Deposited</span></div></div>${v823StatusBar(notDeposited,deposited,'notdep','deposited')}`;
  }
  function v823DonutGradient(entries,total){
    if(!total || !entries.length) return 'conic-gradient(#dfe7ee 0 100%)';
    const colors=['#0da8ad','#22c7bd','#5dd6cf','#cbd5e1'];
    let acc=0; const parts=[];
    entries.slice(0,4).forEach(([k,v],i)=>{ const start=acc; acc+=v/total*100; parts.push(`${colors[i]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`); });
    if(acc<100) parts.push(`#dfe7ee ${acc.toFixed(2)}% 100%`);
    return `conic-gradient(${parts.join(',')})`;
  }
  function renderExpensesCard(){
    injectV823DashboardStyles();
    const el=document.getElementById('expensesCard'); if(!el) return;
    el.className = (el.className || '').replace(/\bdashboard-expense-card\b/g,'').trim() + ' dashboard-expense-card';
    const data=typeof v822ExpenseCategoryData==='function' ? v822ExpenseCategoryData() : {entries:[],total:0,range:{label:'This month'}};
    const top=data.entries.slice(0,3);
    const range=state.settings?.dashboardExpenseRange || 'this-month';
    const rows=top.map(([name,value],idx)=>`<div class="v823-expense-row"><i class="dot"></i><div><strong>${money(value)}</strong><span>${escapeHTML(name)}</span></div></div>`).join('') || `<div class="v823-expense-empty">No expenses in this period.</div>`;
    el.innerHTML=`<div class="v823-expense-top"><div><h3 class="v823-expense-title">Expenses</h3><div class="v823-expense-total">${money(data.total)}</div><div class="muted small">${escapeHTML(data.range.label)}</div></div><select aria-label="Expense period" data-dashboard-expense-range><option value="last-month" ${range==='last-month'?'selected':''}>Last month</option><option value="this-month" ${range==='this-month'?'selected':''}>This month</option><option value="last-30" ${range==='last-30'?'selected':''}>Last 30 days</option><option value="ytd" ${range==='ytd'?'selected':''}>Year to date</option></select></div><div class="v823-expense-content"><div class="v823-expense-donut" style="background:${v823DonutGradient(data.entries,data.total)}"></div><div class="v823-expense-list">${rows}</div></div>`;
  }
  const renderDashboardBeforeV823 = renderDashboard;
  renderDashboard = function(){ injectV823DashboardStyles(); renderDashboardBeforeV823(); renderCashFlowHero(); renderInvoiceSummaryCard(); renderExpensesCard(); };
  injectV823DashboardStyles();



  // ---------- V8.24: Dashboard cash-flow axis/legend fix + expense donut row alignment ----------
  function injectV824DashboardStyles(){
    if(document.getElementById('v824-dashboard-cashflow-fix-styles')) return;
    const style=document.createElement('style');
    style.id='v824-dashboard-cashflow-fix-styles';
    style.textContent=`
      body.v8-ui .dashboard-cash-hero{padding:0!important;overflow:hidden!important;border-radius:18px}
      body.v8-ui .v824-cash-card{display:grid;gap:0;background:var(--card,#fff)}
      body.v8-ui .v824-cash-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px 2px}
      body.v8-ui .v824-cash-title{display:grid;gap:3px;min-width:220px}
      body.v8-ui .v824-cash-title .eyebrow{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#667085)}
      body.v8-ui .v824-cash-title .cash-balance{font-size:42px;line-height:1.05;font-weight:950;letter-spacing:-.04em;color:var(--text,#071b36);margin-top:3px}
      body.v8-ui .v824-cash-title .cash-caption{font-weight:800;color:var(--muted,#667085)}
      body.v8-ui .v824-cash-toggle{display:flex;border:1px solid var(--line,#dfe7ee);border-radius:999px;overflow:hidden;background:var(--soft,#f8fafc);align-self:flex-start}
      body.v8-ui .v824-cash-toggle button{border:0;background:transparent;color:var(--muted,#667085);font-weight:900;padding:10px 16px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
      body.v8-ui .v824-cash-toggle button.active{background:var(--card,#fff);color:#007a3d;box-shadow:0 1px 3px rgba(16,24,40,.10)}
      body.v8-ui .v824-cash-svg-wrap{padding:0 24px 4px;min-height:372px;overflow:visible}
      body.v8-ui .v824-cash-svg{width:100%;height:372px;display:block;overflow:visible}
      body.v8-ui .v824-axis-label{fill:var(--muted,#667085);font-size:13px;font-weight:850;dominant-baseline:middle}
      body.v8-ui .v824-x-label{fill:var(--muted,#667085);font-size:12px;font-weight:900;text-transform:uppercase;dominant-baseline:hanging}
      body.v8-ui .v824-axis-title{fill:var(--muted,#667085);font-size:13px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;dominant-baseline:hanging}
      body.v8-ui .v824-gridline{stroke:rgba(148,163,184,.26);stroke-width:1}
      body.v8-ui .v824-baseline{stroke:var(--line,#dfe7ee);stroke-width:1.25}
      body.v8-ui .v824-bar-in{fill:#42b30b;stroke:none;shape-rendering:crispEdges}
      body.v8-ui .v824-bar-out{fill:#0da8ad;stroke:none;shape-rendering:crispEdges}
      body.v8-ui .v824-balance-line{fill:none;stroke:#42b30b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      body.v8-ui .v824-balance-dot{fill:#42b30b;stroke:var(--card,#fff);stroke-width:3}
      body.v8-ui .v824-legend text{fill:var(--muted,#667085);font-size:13px;font-weight:900;dominant-baseline:middle}
      body.v8-ui .v824-legend-dot-in{fill:#42b30b}.v824-legend-dot-out{fill:#0da8ad}.v824-legend-line{stroke:#42b30b;stroke-width:3;stroke-linecap:round}
      body.v8-ui .dashboard-cash-hero .cash-source-link{margin:0 24px 22px!important;padding:0!important;border:0!important;background:transparent!important;color:#0875b8!important;font-weight:900!important;display:inline-flex!important;text-decoration:none!important;box-shadow:none!important;cursor:pointer!important}
      body.v8-ui .dashboard-cash-hero .cash-source-link:hover{text-decoration:underline!important}
      body.v8-ui .v823-expense-row:nth-child(4) .dot, body.v8-ui .v824-expense-row:nth-child(4) .dot{background:#cbd5e1}
      body.v8-ui .v824-expense-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}.v824-expense-top select{border:0;background:transparent;color:var(--muted,#667085);font-weight:800;cursor:pointer;padding:2px 0}.v824-expense-total{font-size:28px;font-weight:950;letter-spacing:-.03em;margin:6px 0 0}
      body.v8-ui .v824-expense-title{margin:0 0 14px;font-size:14px;text-transform:uppercase;letter-spacing:.03em;color:var(--text,#071b36)}
      body.v8-ui .v824-expense-content{display:grid;grid-template-columns:145px 1fr;gap:18px;align-items:center;margin-top:10px}.v824-expense-donut{width:132px;height:132px;border-radius:50%;position:relative}.v824-expense-donut:after{content:"";position:absolute;inset:34px;background:var(--card,#fff);border-radius:50%}
      body.v8-ui .v824-expense-list{display:grid;gap:10px}.v824-expense-row{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start}.v824-expense-row .dot{width:9px;height:9px;border-radius:50%;background:#0da8ad;margin-top:6px}.v824-expense-row:nth-child(2) .dot{background:#22c7bd}.v824-expense-row:nth-child(3) .dot{background:#5dd6cf}.v824-expense-row:nth-child(4) .dot{background:#cbd5e1}.v824-expense-row strong{font-size:16px}.v824-expense-row span{display:block;color:var(--muted,#667085);font-size:12px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}.v824-expense-empty{color:var(--muted,#667085);font-weight:700}
      body.v8-ui.dark-mode .v824-cash-title .cash-balance{color:#f8fafc}body.v8-ui.dark-mode .v824-cash-toggle{background:#0f172a;border-color:#334155}body.v8-ui.dark-mode .v824-cash-toggle button.active{background:#1e293b;color:#86efac}body.v8-ui.dark-mode .v824-axis-label,body.v8-ui.dark-mode .v824-x-label,body.v8-ui.dark-mode .v824-axis-title,body.v8-ui.dark-mode .v824-legend text{fill:#cbd5e1;color:#cbd5e1}body.v8-ui.dark-mode .v824-gridline{stroke:rgba(148,163,184,.18)}body.v8-ui.dark-mode .v824-baseline{stroke:#334155}body.v8-ui.dark-mode .v824-balance-line{stroke:#86efac}body.v8-ui.dark-mode .v824-balance-dot{fill:#86efac;stroke:#172033}body.v8-ui.dark-mode .v824-legend-line{stroke:#86efac}body.v8-ui.dark-mode .v824-expense-donut:after{background:#172033}
      @media(max-width:980px){body.v8-ui .v824-expense-content{grid-template-columns:1fr}.v824-expense-donut{width:116px;height:116px}.v824-expense-row span{max-width:none}}
      @media(max-width:760px){body.v8-ui .v824-cash-head{flex-direction:column}.v824-cash-toggle{width:100%}.v824-cash-toggle button{flex:1;justify-content:center}.v824-cash-svg-wrap{padding-inline:12px;min-height:360px}.v824-cash-svg{height:360px}.v824-x-label{font-size:10px}.v824-expense-content{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }
  function v824FormatAxis(v){ return Math.abs(v)>=1000 ? `$${Math.round(v/1000)}K` : money(v).replace('.00',''); }
  function v824AxisMax(raw){
    const n=Math.max(1, Number(raw)||1);
    if(n<=5000) return 5000;
    if(n<=10000) return 10000;
    if(n<=15000) return 15000;
    if(n<=20000) return 20000;
    if(n<=25000) return 25000;
    return Math.ceil(n/10000)*10000;
  }
  function v824MonthYearLabel(m){
    const key=String(m.key||'');
    if(/^\d{4}-\d{2}$/.test(key)){
      const d=new Date(key+'-01T00:00:00');
      return d.toLocaleString('en-US',{month:'short'}).toUpperCase()+" '"+String(d.getFullYear()).slice(2);
    }
    return String(m.label||'').toUpperCase();
  }
  function v824CashFlowSvg(series, view, axisMax){
    const W=1000,H=372,left=74,right=18,top=44,chartH=226,bottomY=top+chartH,plotW=W-left-right;
    const n=series.length||1, groupW=plotW/n;
    const axisVals=[axisMax,axisMax*.8,axisMax*.6,axisMax*.4,axisMax*.2,0];
    const y=v=>bottomY-((Number(v)||0)/axisMax*chartH);
    const grid=axisVals.map(v=>{ const yy=y(v).toFixed(1); return `<g><text class="v824-axis-label" x="62" y="${yy}" text-anchor="end" dominant-baseline="middle">${v824FormatAxis(v)}</text><line class="v824-gridline ${v===0?'v824-baseline':''}" x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}"/></g>`; }).join('');
    const xLabels=series.map((m,i)=>{ const x=left+groupW*(i+.5); return `<text class="v824-x-label" x="${x.toFixed(1)}" y="${bottomY+18}" text-anchor="middle" dominant-baseline="hanging">${escapeHTML(v824MonthYearLabel(m))}</text>`; }).join('');
    const axisTitle=`<text class="v824-axis-title" x="${(left+plotW/2).toFixed(1)}" y="${bottomY+50}" text-anchor="middle" dominant-baseline="hanging">Month / Year</text>`;
    let legend='';
    if(view==='balance'){
      legend=`<g class="v824-legend" transform="translate(${W-184},24)"><line class="v824-legend-line" x1="0" y1="0" x2="22" y2="0"/><text x="32" y="0">Cash balance</text></g>`;
    }else{
      legend=`<g class="v824-legend" transform="translate(${W-276},24)"><circle class="v824-legend-dot-in" cx="0" cy="0" r="5"/><text x="14" y="0">Money in</text><circle class="v824-legend-dot-out" cx="116" cy="0" r="5"/><text x="130" y="0">Money out</text></g>`;
    }
    let plot='';
    if(view==='balance'){
      const pts=series.map((m,i)=>({x:left+groupW*(i+.5),y:y(Math.max(0,num(m.balance))),m}));
      const path=pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const dots=pts.map(p=>`<circle class="v824-balance-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${escapeHTML(v824MonthYearLabel(p.m))}: ${money(num(p.m.balance))}</title></circle>`).join('');
      plot=`<path class="v824-balance-line" d="${path}"/>${dots}`;
    }else{
      const barW=Math.max(8,Math.min(16,groupW*.18)), gap=Math.max(4,Math.min(8,groupW*.08));
      plot=series.map((m,i)=>{
        const cx=left+groupW*(i+.5); const hIn=(num(m.in)/axisMax)*chartH; const hOut=(num(m.out)/axisMax)*chartH;
        const xIn=cx-barW-gap/2, xOut=cx+gap/2;
        return `<rect class="v824-bar-in" x="${xIn.toFixed(1)}" y="${(bottomY-hIn).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,hIn).toFixed(1)}" rx="3"><title>${escapeHTML(v824MonthYearLabel(m))} Money in ${money(num(m.in))}</title></rect><rect class="v824-bar-out" x="${xOut.toFixed(1)}" y="${(bottomY-hOut).toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,hOut).toFixed(1)}" rx="3"><title>${escapeHTML(v824MonthYearLabel(m))} Money out ${money(num(m.out))}</title></rect>`;
      }).join('');
    }
    return `<svg class="v824-cash-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cash flow ${view==='balance'?'cash balance':'money in and out'} chart">${grid}${legend}${plot}${xLabels}${axisTitle}</svg>`;
  }
  function renderCashFlowHero(){
    injectV824DashboardStyles();
    const el=document.getElementById('cashFlowHero'); if(!el) return;
    state.settings ||= {}; state.settings.cashFlowHeroView = state.settings.cashFlowHeroView==='balance' ? 'balance' : 'flow';
    const view=state.settings.cashFlowHeroView;
    const series=cashFlowSeries();
    const rawMax=Math.max(1,...series.flatMap(m=>view==='balance'?[Math.max(0,num(m.balance))]:[num(m.in),num(m.out)]));
    const axisMax=v824AxisMax(rawMax);
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:normalBalance(state.bankAccounts?.[0]?.accountId)};
    const balance=num(cash.operatingBalance ?? normalBalance(state.bankAccounts?.[0]?.accountId));
    el.innerHTML=`<div class="v824-cash-card"><div class="v824-cash-head"><div class="v824-cash-title"><div class="eyebrow">Cash Flow</div><div class="muted small">Last 12 months</div><div class="cash-balance">${money(balance)}</div><div class="cash-caption">Operating cash balance</div></div><div class="v824-cash-toggle" role="tablist" aria-label="Cash flow chart view"><button type="button" class="${view==='flow'?'active':''}" data-action="cashflow-view" data-id="flow">${v820ToggleIcon('bar')}Money in/out</button><button type="button" class="${view==='balance'?'active':''}" data-action="cashflow-view" data-id="balance">${v820ToggleIcon('line')}Cash balance</button></div></div><div class="v824-cash-svg-wrap">${v824CashFlowSvg(series,view,axisMax)}</div><button class="cash-source-link" type="button" data-nav="banking">Where do these numbers come from?</button></div>`;
  }
  function v824ExpenseDisplayEntries(entries,total){
    const source=Array.isArray(entries) ? entries.filter(([,v])=>num(v)>0) : [];
    if(source.length<=4) return source;
    const top3=source.slice(0,3);
    const other=source.slice(3).reduce((s,[,v])=>s+num(v),0);
    return other>0 ? [...top3,['Other',other]] : top3;
  }
  function v824DonutGradient(entries,total){
    if(!total || !entries.length) return 'conic-gradient(#dfe7ee 0 100%)';
    const colors=['#0da8ad','#22c7bd','#5dd6cf','#cbd5e1'];
    let acc=0; const parts=[];
    entries.slice(0,4).forEach(([k,v],i)=>{ const start=acc; acc+=num(v)/total*100; parts.push(`${colors[i]} ${start.toFixed(2)}% ${acc.toFixed(2)}%`); });
    if(acc<100) parts.push(`#dfe7ee ${acc.toFixed(2)}% 100%`);
    return `conic-gradient(${parts.join(',')})`;
  }
  function renderExpensesCard(){
    injectV824DashboardStyles();
    const el=document.getElementById('expensesCard'); if(!el) return;
    el.className = (el.className || '').replace(/\bdashboard-expense-card\b/g,'').trim() + ' dashboard-expense-card';
    const data=typeof v822ExpenseCategoryData==='function' ? v822ExpenseCategoryData() : {entries:[],total:0,range:{label:'This month'}};
    const displayEntries=v824ExpenseDisplayEntries(data.entries,data.total);
    const displayTotal=displayEntries.reduce((s,[,v])=>s+num(v),0);
    const range=state.settings?.dashboardExpenseRange || 'this-month';
    const rows=displayEntries.map(([name,value],idx)=>`<div class="v824-expense-row"><i class="dot"></i><div><strong>${money(value)}</strong><span>${escapeHTML(name)}</span></div></div>`).join('') || `<div class="v824-expense-empty">No expenses in this period.</div>`;
    el.innerHTML=`<div class="v824-expense-top"><div><h3 class="v824-expense-title">Expenses</h3><div class="v824-expense-total">${money(data.total)}</div><div class="muted small">${escapeHTML(data.range.label)}</div></div><select aria-label="Expense period" data-dashboard-expense-range><option value="last-month" ${range==='last-month'?'selected':''}>Last month</option><option value="this-month" ${range==='this-month'?'selected':''}>This month</option><option value="last-30" ${range==='last-30'?'selected':''}>Last 30 days</option><option value="ytd" ${range==='ytd'?'selected':''}>Year to date</option></select></div><div class="v824-expense-content"><div class="v824-expense-donut" style="background:${v824DonutGradient(displayEntries,displayTotal||data.total)}"></div><div class="v824-expense-list">${rows}</div></div>`;
  }
  const renderDashboardBeforeV824 = renderDashboard;
  renderDashboard = function(){ injectV824DashboardStyles(); renderDashboardBeforeV824(); renderCashFlowHero(); renderInvoiceSummaryCard(); renderExpensesCard(); };
  injectV824DashboardStyles();



