// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

  // ---------- V49: Live Estimate Refresh + Customer/Vendor Edit Workflows ----------
  // Fixes: live recent-estimate refresh, customer/vendor editable master records,
  // detail modal actions, no duplicate record creation on edit, clickable estimates,
  // converted-estimate invoice links, and data/cache refresh after saves.
  function injectV49MasterDataStyles(){
    if(document.getElementById('v49-master-data-styles')) return;
    const style=document.createElement('style');
    style.id='v49-master-data-styles';
    style.textContent=`
      body.v8-ui .v49-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:flex-start}
      body.v8-ui .v49-actions .btn{padding:7px 9px;font-size:12px}
      body.v8-ui .v49-record-button{border:0;background:transparent;padding:0;margin:0;color:#071b37;font-weight:900;text-align:left;cursor:pointer;text-decoration:none}
      body.v8-ui .v49-record-button:hover{color:var(--green);text-decoration:underline}
      body.v8-ui .v49-status{display:inline-flex;align-items:center;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:900;background:#dcfce7;color:#166534}
      body.v8-ui .v49-status.inactive{background:#eef2f6;color:#475467}
      body.v8-ui .v49-muted-row{opacity:.68}
      body.v8-ui .v49-detail-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      body.v8-ui .v49-note{border:1px solid #d9e9f8;background:#f4f9ff;border-radius:14px;padding:10px 12px;color:#18476b;font-size:12px;line-height:1.45;margin:0 0 14px}
      body.v8-ui .v49-estimate-focus{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap}
      body.v8-ui .v49-estimate-link{font-size:12px;color:#344054;margin-top:3px}
      body.v8-ui .v49-estimate-row-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
      body.v8-ui .v49-estimate-row-actions .btn{padding:6px 8px;font-size:12px}
      body.v8-ui .v49-required:after{content:' *';color:#b42318}
      body.v8-ui.dark-mode .v49-record-button{color:#f3f7fb}
      body.v8-ui.dark-mode .v49-record-button:hover{color:#63d297}
      body.v8-ui.dark-mode .v49-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      body.v8-ui.dark-mode .v49-estimate-link{color:#cbd5e1}
    `;
    document.head.appendChild(style);
  }
  function v49InvalidateDynamicViews(){
    try{ if(typeof v47InvalidateSearch==='function') v47InvalidateSearch(); }catch(e){}
    try{ if(typeof v40PageCache!=='undefined' && v40PageCache?.clear) v40PageCache.clear(); }catch(e){}
    try{ if(typeof v40DataVersion!=='undefined') v40DataVersion += 1; }catch(e){}
  }
  const v49SaveStateBase = saveState;
  saveState = function(){ v49InvalidateDynamicViews(); return v49SaveStateBase.apply(this, arguments); };
  function v49IsInactive(r){ return String(r?.status||'Active').toLowerCase()==='inactive' || r?.active===false; }
  function v49StatusTag(r){ return `<span class="v49-status ${v49IsInactive(r)?'inactive':''}">${v49IsInactive(r)?'Inactive':'Active'}</span>`; }
  function v49Option(value,label,selected){ return `<option value="${escapeHTML(value)}" ${String(value)===String(selected)?'selected':''}>${escapeHTML(label)}</option>`; }
  function v49TextInput(name,label,value='',extra=''){
    return `<div class="field"><label ${extra.includes('required')?'class="v49-required"':''}>${escapeHTML(label)}</label><input name="${escapeHTML(name)}" value="${escapeHTML(value||'')}" ${extra}></div>`;
  }
  function v49Textarea(name,label,value=''){
    return `<div class="field full"><label>${escapeHTML(label)}</label><textarea name="${escapeHTML(name)}">${escapeHTML(value||'')}</textarea></div>`;
  }
  function v49CustomerFormHTML(record=null){
    const c=record||{};
    const status=v49IsInactive(c)?'Inactive':'Active';
    return `<div class="v49-note"><strong>${record?'Edit customer':'New customer'}:</strong> Customer master data is used by invoices, estimates, payments, A/R reports, and search. Editing updates the same customer ID and does not create a duplicate.</div>
      <div class="form-grid">
        ${v49TextInput('name','Customer name',c.name,'required')}
        ${v49TextInput('company','Company name',c.company||c.name)}
        ${v49TextInput('contact','Contact person',c.contact||c.contactPerson||'')}
        ${v49TextInput('email','Email',c.email,'type="email"')}
        ${v49TextInput('phone','Phone',c.phone)}
        <div class="field"><label>Customer type</label><select name="type">${['Commercial','Government','Residential','Education','Non-profit','Other'].map(x=>v49Option(x,x,c.type||'Commercial')).join('')}</select></div>
        <div class="field"><label>Payment terms</label><select name="terms">${['Due on receipt','Net 15','Net 30','Net 45','Net 60'].map(x=>v49Option(x,x,c.terms||'Net 30')).join('')}</select></div>
        <div class="field"><label>Tax setting</label><select name="taxSetting">${['Taxable','Tax exempt','Out of scope'].map(x=>v49Option(x,x,c.taxSetting||'Taxable')).join('')}</select></div>
        <div class="field"><label>Opening balance</label><input type="number" step="0.01" name="openingBalance" value="${escapeHTML(c.openingBalance||0)}"></div>
        <div class="field"><label>Status</label><select name="status">${['Active','Inactive'].map(x=>v49Option(x,x,status)).join('')}</select></div>
        ${v49Textarea('billingAddress','Billing address',c.billingAddress||c.address||'')}
        ${v49Textarea('shippingAddress','Shipping address',c.shippingAddress||'')}
        ${v49Textarea('notes','Notes',c.notes||'')}
      </div>`;
  }
  function v49VendorFormHTML(record=null){
    const v=record||{};
    const status=v49IsInactive(v)?'Inactive':'Active';
    return `<div class="v49-note"><strong>${record?'Edit vendor':'New vendor'}:</strong> Vendor master data is used by bills, expenses, A/P reports, and search. Editing updates the same vendor ID and does not create a duplicate.</div>
      <div class="form-grid">
        ${v49TextInput('name','Vendor name',v.name,'required')}
        ${v49TextInput('company','Company name',v.company||v.name)}
        ${v49TextInput('contact','Contact person',v.contact||v.contactPerson||'')}
        ${v49TextInput('email','Email',v.email,'type="email"')}
        ${v49TextInput('phone','Phone',v.phone)}
        <div class="field"><label>Default category</label><input name="category" value="${escapeHTML(v.category||'Office expenses')}"></div>
        <div class="field"><label>Payment terms</label><select name="terms">${['Due on receipt','Net 15','Net 30','Net 45','Net 60'].map(x=>v49Option(x,x,v.terms||'Net 30')).join('')}</select></div>
        <div class="field"><label>Default expense account</label><select name="expenseAccountId">${typeof accountOptions==='function'?accountOptions(['Expense','COGS']):''}</select></div>
        <div class="field"><label>Tax setting</label><select name="taxSetting">${['Taxable','Tax exempt','Out of scope'].map(x=>v49Option(x,x,v.taxSetting||'Taxable')).join('')}</select></div>
        <div class="field"><label>Opening balance</label><input type="number" step="0.01" name="openingBalance" value="${escapeHTML(v.openingBalance||0)}"></div>
        <div class="field"><label>Status</label><select name="status">${['Active','Inactive'].map(x=>v49Option(x,x,status)).join('')}</select></div>
        ${v49Textarea('address','Address',v.address||'')}
        ${v49Textarea('notes','Notes',v.notes||'')}
      </div>`;
  }
  const v49ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){
    const s=String(type||'');
    if(s==='customer') return v49CustomerFormHTML();
    if(s.startsWith('customerEdit:')){ const id=s.split(':')[1]; return v49CustomerFormHTML((state.customers||[]).find(c=>c.id===id)); }
    if(s==='vendor') return v49VendorFormHTML();
    if(s.startsWith('vendorEdit:')){ const id=s.split(':')[1]; return v49VendorFormHTML((state.vendors||[]).find(v=>v.id===id)); }
    return v49ModalBodyBase(type);
  };
  const v49OpenModalBase = openModal;
  openModal = function(type){
    injectV49MasterDataStyles();
    v49OpenModalBase(type);
    const s=String(type||''), footer=document.getElementById('modalFooter');
    if(s==='customer' || s.startsWith('customerEdit:')){
      document.getElementById('modalTitle').textContent = s.startsWith('customerEdit:') ? 'Edit customer' : 'Add customer';
      document.getElementById('modalSubtitle').textContent = 'Maintain customer contact, billing, terms, status, and notes.';
      if(footer) footer.innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save customer</button>';
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
      currentModal=type;
    }
    if(s==='vendor' || s.startsWith('vendorEdit:')){
      document.getElementById('modalTitle').textContent = s.startsWith('vendorEdit:') ? 'Edit vendor' : 'Add vendor';
      document.getElementById('modalSubtitle').textContent = 'Maintain vendor contact, category, payment terms, status, and notes.';
      if(footer) footer.innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save vendor</button>';
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
      currentModal=type;
      const id=s.split(':')[1]; const v=(state.vendors||[]).find(x=>x.id===id); const acct=document.querySelector('[name="expenseAccountId"]'); if(acct && v?.expenseAccountId) acct.value=v.expenseAccountId;
    }
    if(s.startsWith('v47CustomerDetail:')){
      const id=s.split(':')[1], c=(state.customers||[]).find(x=>x.id===id), label=v49IsInactive(c)?'Make active':'Make inactive';
      document.getElementById('modalTitle').textContent='Customer detail';
      document.getElementById('modalSubtitle').textContent='View customer activity or update master-data details.';
      if(footer) footer.innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn" data-action="edit-customer" data-id="${escapeHTML(id)}">Edit customer</button><button type="button" class="btn" data-action="create-estimate-for-customer" data-id="${escapeHTML(id)}">Create estimate</button><button type="button" class="btn primary" data-action="create-invoice-for-customer" data-id="${escapeHTML(id)}">Create invoice</button><button type="button" class="btn danger" data-action="toggle-customer-active" data-id="${escapeHTML(id)}">${label}</button>`;
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    }
    if(s.startsWith('v47VendorDetail:')){
      const id=s.split(':')[1], v=(state.vendors||[]).find(x=>x.id===id), label=v49IsInactive(v)?'Make active':'Make inactive';
      document.getElementById('modalTitle').textContent='Vendor detail';
      document.getElementById('modalSubtitle').textContent='View vendor activity or update master-data details.';
      if(footer) footer.innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn" data-action="edit-vendor" data-id="${escapeHTML(id)}">Edit vendor</button><button type="button" class="btn" data-action="record-expense-for-vendor" data-id="${escapeHTML(id)}">Record expense</button><button type="button" class="btn primary" data-action="create-bill-for-vendor" data-id="${escapeHTML(id)}">Create bill</button><button type="button" class="btn danger" data-action="toggle-vendor-active" data-id="${escapeHTML(id)}">${label}</button>`;
      document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    }
  };
  function v49FormData(form){ return Object.fromEntries(new FormData(form).entries()); }
  function v49SaveCustomerFromForm(form, editId=null){
    const d=v49FormData(form); const name=String(d.name||'').trim(); if(!name){ showToast('Customer name is required.'); return false; }
    const rec={name, company:d.company||name, contact:d.contact||'', email:d.email||'', phone:d.phone||'', type:d.type||'Commercial', terms:d.terms||'Net 30', taxSetting:d.taxSetting||'Taxable', openingBalance:num(d.openingBalance), billingAddress:d.billingAddress||'', shippingAddress:d.shippingAddress||'', notes:d.notes||'', status:d.status||'Active', active:String(d.status||'Active')!=='Inactive', updatedAt:new Date().toISOString()};
    const idx=(state.customers||[]).findIndex(c=>c.id===editId);
    if(idx>=0){ state.customers[idx]={...state.customers[idx],...rec,id:state.customers[idx].id}; audit(`Customer updated: ${name}`); showToast('Customer updated.'); }
    else { state.customers.unshift({id:uid('C'),...rec,createdAt:new Date().toISOString()}); audit(`Customer added: ${name}`); showToast('Customer added.'); }
    return true;
  }
  function v49SaveVendorFromForm(form, editId=null){
    const d=v49FormData(form); const name=String(d.name||'').trim(); if(!name){ showToast('Vendor name is required.'); return false; }
    const rec={name, company:d.company||name, contact:d.contact||'', email:d.email||'', phone:d.phone||'', category:d.category||'', terms:d.terms||'Net 30', expenseAccountId:d.expenseAccountId||'6000', taxSetting:d.taxSetting||'Taxable', openingBalance:num(d.openingBalance), address:d.address||'', notes:d.notes||'', status:d.status||'Active', active:String(d.status||'Active')!=='Inactive', updatedAt:new Date().toISOString()};
    const idx=(state.vendors||[]).findIndex(v=>v.id===editId);
    if(idx>=0){ state.vendors[idx]={...state.vendors[idx],...rec,id:state.vendors[idx].id}; audit(`Vendor updated: ${name}`); showToast('Vendor updated.'); }
    else { state.vendors.unshift({id:uid('V'),...rec,createdAt:new Date().toISOString()}); audit(`Vendor added: ${name}`); showToast('Vendor added.'); }
    return true;
  }
  const v49SubmitModalBase = submitModal;
  submitModal = function(e){
    const s=String(currentModal||'');
    if(s==='customer' || s.startsWith('customerEdit:')){
      e.preventDefault(); const id=s.startsWith('customerEdit:')?s.split(':')[1]:null; if(!v49SaveCustomerFromForm(e.target,id)) return; saveState(); closeModal(); renderAll(); if(currentPage!=='customers') navigate('customers'); return;
    }
    if(s==='vendor' || s.startsWith('vendorEdit:')){
      e.preventDefault(); const id=s.startsWith('vendorEdit:')?s.split(':')[1]:null; if(!v49SaveVendorFromForm(e.target,id)) return; saveState(); closeModal(); renderAll(); if(currentPage!=='vendors') navigate('vendors'); return;
    }
    return v49SubmitModalBase(e);
  };
  function v49CustomerDetail(id){
    const c=(state.customers||[]).find(x=>x.id===id); if(!c) return v47DetailMissing('Customer',id);
    const invoices=(state.invoices||[]).filter(i=>i.customerId===id); const estimates=(state.estimates||[]).filter(e=>e.customerId===id); const open=(typeof customerOpenBalance==='function'?customerOpenBalance(id):invoices.reduce((s,i)=>s+v47InvOpen(i),0));
    return `<div class="v49-note">Customer master record. Use <strong>Edit customer</strong> to update billing, contact, terms, tax setting, status, and notes without changing the customer ID.</div>
      <div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(c.name||'Customer')} ${v49StatusTag(c)}</h3>${v47Line('Customer ID',c.id)}${v47Line('Company',c.company||'â€”')}${v47Line('Contact',c.contact||'â€”')}${v47Line('Email',c.email||'â€”')}${v47Line('Phone',c.phone||'â€”')}${v47Line('Terms',c.terms||'â€”')}${v47Line('Tax setting',c.taxSetting||'â€”')}</div><div class="v47-detail-card"><h3>Receivables</h3>${v47Line('Open balance',v47Money(open))}${v47Line('Invoice count',invoices.length)}${v47Line('Estimates',estimates.length)}${v47Line('Billing address',c.billingAddress||c.address||'â€”')}</div></div>
      <div class="card table-card v47-detail-table" style="margin-top:14px">${table(['Invoice','Date','Status','Total','Open'], invoices.slice(0,8).map(i=>[`<button type="button" class="v49-record-button" data-action="view-invoice" data-id="${escapeHTML(i.id)}">${escapeHTML(i.id)}</button>`,i.date||'',i.status||'',v47Money(v47InvTotal(i)),v47Money(v47InvOpen(i))]))}</div>`;
  }
  function v49VendorDetail(id){
    const v=(state.vendors||[]).find(x=>x.id===id); if(!v) return v47DetailMissing('Vendor',id);
    const bills=(state.bills||[]).filter(b=>b.vendorId===id), expenses=(state.expenses||[]).filter(x=>x.vendorId===id), open=bills.reduce((s,b)=>s+v47BillOpen(b),0);
    return `<div class="v49-note">Vendor master record. Use <strong>Edit vendor</strong> to update contact, category, terms, default expense account, status, and notes without changing the vendor ID.</div>
      <div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(v.name||'Vendor')} ${v49StatusTag(v)}</h3>${v47Line('Vendor ID',v.id)}${v47Line('Company',v.company||'â€”')}${v47Line('Contact',v.contact||'â€”')}${v47Line('Email',v.email||'â€”')}${v47Line('Phone',v.phone||'â€”')}${v47Line('Category',v.category||'â€”')}${v47Line('Terms',v.terms||'â€”')}</div><div class="v47-detail-card"><h3>Payables</h3>${v47Line('Open bills',v47Money(open))}${v47Line('Bill count',bills.length)}${v47Line('Expense count',expenses.length)}${v47Line('Default expense account',v47AccountLabel(v.expenseAccountId||''))}</div></div>
      <div class="card table-card v47-detail-table" style="margin-top:14px">${table(['Bill','Due','Status','Total','Open'], bills.slice(0,8).map(b=>[`<button type="button" class="v49-record-button" data-action="view-bill" data-id="${escapeHTML(b.id)}">${escapeHTML(b.id)}</button>`,b.dueDate||'',b.status||'',v47Money(v47BillTotal(b)),v47Money(v47BillOpen(b))]))}</div>`;
  }
  try{ v47CustomerDetail = v49CustomerDetail; v47VendorDetail = v49VendorDetail; }catch(e){}
  function v49SortEstimates(rows){
    return (rows||[]).slice().sort((a,b)=>String(b.updatedAt||b.createdAt||b.date||b.id||'').localeCompare(String(a.updatedAt||a.createdAt||a.date||a.id||'')));
  }
  function v49EstimateStatus(e){ return typeof v18EstimateDisplayStatus==='function'?v18EstimateDisplayStatus(e):(e.convertedInvoiceId?'Converted':String(e.status||'Draft')); }
  function v49EstimateCustomerActivityHTML(){
    const estimates=v49SortEstimates(state.estimates||[]).slice(0,10);
    if(!estimates.length) return '';
    const rows=estimates.map(e=>{
      const status=v49EstimateStatus(e);
      const converted=e.convertedInvoiceId?`<div class="v49-estimate-link">Linked invoice: <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(e.convertedInvoiceId)}">${escapeHTML(e.convertedInvoiceId)}</button></div>`:'';
      const actions=`<div class="v49-estimate-row-actions"><button type="button" class="btn" data-action="view-estimate" data-id="${escapeHTML(e.id)}">View</button>${status==='Converted'?`<button type="button" class="btn primary" data-action="open-converted-invoice" data-id="${escapeHTML(e.convertedInvoiceId||'')}">View invoice</button>`:`<button type="button" class="btn" data-action="edit-estimate" data-id="${escapeHTML(e.id)}">Edit</button>`}</div>`;
      return [`<button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${escapeHTML(e.estimateNumber||e.id)}</button>${converted}`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),typeof v17EstimateStatusTag==='function'?v17EstimateStatusTag(e):estimateStatusTag(e.status),`<span class="amount">${money(estimateAmount(e))}</span>`,actions];
    });
    return `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Recent estimates</h3><div class="muted small">Newest estimates created from + New or Sales â†’ Estimates. Click an estimate to view, edit, convert, or open the linked invoice.</div></div><button class="btn" data-modal="estimate">New estimate</button></div>${table(['Estimate','Customer','Date','Status','Total','Actions'], rows)}</div>`;
  }
  function v49CustomerActions(c){
    const id=escapeHTML(c.id), inactive=v49IsInactive(c);
    return `<div class="v49-actions"><button class="btn" data-action="view-customer" data-id="${id}">View</button><button class="btn" data-action="edit-customer" data-id="${id}">Edit</button><button class="btn" data-action="create-invoice-for-customer" data-id="${id}">Invoice</button><button class="btn" data-action="create-estimate-for-customer" data-id="${id}">Estimate</button><button class="btn ${inactive?'':'danger'}" data-action="toggle-customer-active" data-id="${id}">${inactive?'Make active':'Make inactive'}</button></div>`;
  }
  function v49VendorActions(v){
    const id=escapeHTML(v.id), inactive=v49IsInactive(v);
    return `<div class="v49-actions"><button class="btn" data-action="view-vendor" data-id="${id}">View</button><button class="btn" data-action="edit-vendor" data-id="${id}">Edit</button><button class="btn primary" data-action="create-bill-for-vendor" data-id="${id}">Create bill</button><button class="btn" data-action="record-expense-for-vendor" data-id="${id}">Expense</button><button class="btn ${inactive?'':'danger'}" data-action="toggle-vendor-active" data-id="${id}">${inactive?'Make active':'Make inactive'}</button></div>`;
  }
  const v49RenderCustomersBase = renderCustomers;
  renderCustomers = function(){
    injectV49MasterDataStyles();
    const el=document.getElementById('page-customers'); if(!el){ return v49RenderCustomersBase(); }
    const active=(state.customers||[]).filter(c=>!v49IsInactive(c)).length, inactive=(state.customers||[]).length-active, ar=typeof customerOpenBalance==='function'?(state.customers||[]).reduce((s,c)=>s+customerOpenBalance(c.id),0):0;
    const rows=(state.customers||[]).map(c=>[`<input type="checkbox"/>`,`<button type="button" class="v49-record-button" data-action="view-customer" data-id="${escapeHTML(c.id)}">${escapeHTML(c.name)}</button><div class="muted small">${escapeHTML(c.id)}</div>`,escapeHTML(c.company||''),escapeHTML(c.email||''),escapeHTML(c.phone||''),escapeHTML(c.type||''),v49StatusTag(c),`<span class="amount">${money(customerOpenBalance(c.id))}</span>`,v49CustomerActions(c)]);
    el.innerHTML = header('Customers','Manage customer records, contact details, terms, status, open balances, estimates, and invoices.',`<button class="btn" data-modal="estimate">New estimate</button><button class="btn primary" data-modal="customer">New customer</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/R</h3><div class="metric">${money(ar)}</div><div class="muted small">Open customer balances</div></div><div class="card"><h3>Active customers</h3><div class="metric">${active}</div><div class="muted small">Usable in new sales records</div></div><div class="card"><h3>Inactive</h3><div class="metric">${inactive}</div><div class="muted small">Kept for history</div></div><div class="card"><h3>Estimates</h3><div class="metric">${(state.estimates||[]).length}</div><div class="muted small">Draft/accepted/converted</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search customers" /></div><div class="right"><button class="btn" data-modal="invoice">Create invoice</button><button class="btn primary" data-modal="customer">Add customer</button></div></div>${table(['','Name','Company','Email','Phone','Type','Status','Open balance','Actions'], rows)}</div>`+
      `<div data-estimate-customer-activity>${v49EstimateCustomerActivityHTML()}</div>`;
  };
  const v49RenderVendorsBase = renderVendors;
  renderVendors = function(){
    injectV49MasterDataStyles();
    const el=document.getElementById('page-vendors'); if(!el){ return v49RenderVendorsBase(); }
    const active=(state.vendors||[]).filter(v=>!v49IsInactive(v)).length, inactive=(state.vendors||[]).length-active, ap=(state.vendors||[]).reduce((s,v)=>s+vendorOpenBalance(v.id),0);
    const rows=(state.vendors||[]).map(v=>[`<button type="button" class="v49-record-button" data-action="view-vendor" data-id="${escapeHTML(v.id)}">${escapeHTML(v.name)}</button><div class="muted small">${escapeHTML(v.id)}</div>`,escapeHTML(v.company||''),escapeHTML(v.email||''),escapeHTML(v.phone||''),escapeHTML(v.category||''),v49StatusTag(v),`<span class="amount">${money(vendorOpenBalance(v.id))}</span>`,v49VendorActions(v)]);
    el.innerHTML = header('Vendors','Track supplier records, contact details, terms, categories, open bills, and payment status.',`<button class="btn" data-modal="payBill">Pay bill</button><button class="btn primary" data-modal="vendor">Add vendor</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/P</h3><div class="metric">${money(ap)}</div><div class="muted small">Open vendor balances</div></div><div class="card"><h3>Active vendors</h3><div class="metric">${active}</div><div class="muted small">Usable in new expense records</div></div><div class="card"><h3>Inactive</h3><div class="metric">${inactive}</div><div class="muted small">Kept for history</div></div><div class="card"><h3>Bills</h3><div class="metric">${(state.bills||[]).length}</div><div class="muted small">Open/paid vendor bills</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search vendors" /></div><div class="right"><button class="btn" data-modal="expense">Record expense</button><button class="btn primary" data-modal="vendor">Add vendor</button></div></div>${table(['Vendor','Company','Email','Phone','Category','Status','Open balance','Actions'], rows)}</div>`;
  };
  const v49RenderEstimateHubBase = renderEstimateHub;
  renderEstimateHub = function(){
    injectV49MasterDataStyles();
    injectEstimateWorkflowStyles?.(); injectV17WorkflowStyles?.(); v17EnsureState?.();
    const estimates=v49SortEstimates(state.estimates||[]);
    const draft=estimates.filter(e=>v49EstimateStatus(e)==='Draft').length;
    const sent=estimates.filter(e=>v49EstimateStatus(e)==='Sent').length;
    const accepted=estimates.filter(e=>v49EstimateStatus(e)==='Accepted').length;
    const converted=estimates.filter(e=>v49EstimateStatus(e)==='Converted').length;
    const total=estimates.reduce((s,e)=>s+estimateAmount(e),0);
    const rows=estimates.map(e=>{
      const status=v49EstimateStatus(e), inv=e.convertedInvoiceId;
      const statusCell=`${typeof v17EstimateStatusTag==='function'?v17EstimateStatusTag(e):estimateStatusTag(e.status)}${inv?`<div class="v49-estimate-link">Invoice <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">${escapeHTML(inv)}</button></div>`:''}`;
      return [`<button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${escapeHTML(e.estimateNumber||e.id)}</button><div class="muted small">${escapeHTML(e.projectName||'')}</div>`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),escapeHTML(e.expiryDate||''),statusCell,`<span class="amount">${money(estimateAmount(e))}</span>`,typeof v17EstimateActionButtons==='function'?v17EstimateActionButtons(e):`<button class="btn" data-action="edit-estimate" data-id="${escapeHTML(e.id)}">Edit</button>`];
    });
    return `<div class="estimate-hub"><div class="v17-route-note">Saved estimates appear here and in customer activity. Estimate numbers are clickable; converted estimates link directly to their draft invoice.</div>
      <div class="section-header"><div><h2>Estimates</h2><p>Create, send, accept, decline, and convert non-posting estimates into invoices.</p></div><button class="btn primary" data-modal="estimate">Create estimate</button></div>
      <div class="estimate-kpi-grid"><div class="estimate-kpi"><span>Total estimate value</span><strong>${money(total)}</strong></div><div class="estimate-kpi"><span>Draft</span><strong>${draft}</strong></div><div class="estimate-kpi"><span>Sent / accepted</span><strong>${sent+accepted}</strong></div><div class="estimate-kpi"><span>Converted</span><strong>${converted}</strong></div></div>
      <div class="card table-card">${table(['Estimate','Customer','Date','Expiry','Status','Total','Actions'], rows)}</div></div>`;
  };
  function v49OpenCustomerInvoice(id){ openModal('invoice'); setTimeout(()=>{ const s=document.querySelector('[name="customerId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } },0); }
  function v49OpenCustomerEstimate(id){ openModal('estimate'); setTimeout(()=>{ const s=document.querySelector('[name="customerId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } },0); }
  function v49OpenVendorBill(id){ openModal('bill'); setTimeout(()=>{ const s=document.querySelector('[name="vendorId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } },0); }
  function v49OpenVendorExpense(id){ openModal('expense'); setTimeout(()=>{ const s=document.querySelector('[name="vendorId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } const acct=document.querySelector('[name="expenseAccountId"]'); const v=(state.vendors||[]).find(x=>x.id===id); if(acct && v?.expenseAccountId) acct.value=v.expenseAccountId; },0); }
  const v49HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='view-customer'){ openModal('v47CustomerDetail:'+id); return; }
    if(action==='edit-customer'){ openModal('customerEdit:'+id); return; }
    if(action==='create-invoice-for-customer'){ v49OpenCustomerInvoice(id); return; }
    if(action==='create-estimate-for-customer'){ v49OpenCustomerEstimate(id); return; }
    if(action==='toggle-customer-active'){
      const c=(state.customers||[]).find(x=>x.id===id); if(!c){ showToast('Customer not found.'); return; }
      c.status=v49IsInactive(c)?'Active':'Inactive'; c.active=c.status==='Active'; c.updatedAt=new Date().toISOString(); audit(`Customer ${c.name} marked ${c.status}`); saveState(); closeModal(); renderAll(); showToast(`Customer marked ${c.status}.`); return;
    }
    if(action==='view-vendor'){ openModal('v47VendorDetail:'+id); return; }
    if(action==='edit-vendor'){ openModal('vendorEdit:'+id); return; }
    if(action==='create-bill-for-vendor'){ v49OpenVendorBill(id); return; }
    if(action==='record-expense-for-vendor'){ v49OpenVendorExpense(id); return; }
    if(action==='toggle-vendor-active'){
      const v=(state.vendors||[]).find(x=>x.id===id); if(!v){ showToast('Vendor not found.'); return; }
      v.status=v49IsInactive(v)?'Active':'Inactive'; v.active=v.status==='Active'; v.updatedAt=new Date().toISOString(); audit(`Vendor ${v.name} marked ${v.status}`); saveState(); closeModal(); renderAll(); showToast(`Vendor marked ${v.status}.`); return;
    }
    if(action==='view-bill'){ openModal('v47BillDetail:'+id); return; }
    return v49HandleActionBase(action,id);
  };
  const v49BuildSearchIndexBase = v47BuildSearchIndex;
  v47BuildSearchIndex = function(){
    const rows=v49BuildSearchIndexBase();
    rows.forEach(r=>{
      if(r.target?.kind==='customer'){
        r.actions=[{label:'View',action:'view',primary:true},{label:'Edit',action:'edit'},{label:'Invoice',action:'invoice'},{label:'Estimate',action:'estimate'}];
        r.keywords=v47Lower([r.keywords,'edit customer customer status active inactive payment terms billing address contact phone email'].join(' ')); r.norm=v47Norm([r.norm,r.keywords].join(' '));
      }
      if(r.target?.kind==='vendor'){
        r.actions=[{label:'View',action:'view',primary:true},{label:'Edit',action:'edit'},{label:'Create bill',action:'bill'},{label:'Expense',action:'expense'}];
        r.keywords=v47Lower([r.keywords,'edit vendor supplier status active inactive payment terms address default expense account contact phone email'].join(' ')); r.norm=v47Norm([r.norm,r.keywords].join(' '));
      }
    });
    return rows;
  };
  const v49RunTargetBase = v47RunTarget;
  v47RunTarget = function(target, action, title){
    const t=target||{};
    if(t.kind==='customer'){
      if(action==='edit'){ v47SetFocus?.('customers',t.id); v47Navigate?.('customers',()=>openModal('customerEdit:'+t.id)); return; }
      if(action==='invoice'){ v47SetFocus?.('customers',t.id); v47Navigate?.('customers',()=>v49OpenCustomerInvoice(t.id)); return; }
      if(action==='estimate'){ v47SetFocus?.('customers',t.id); v47Navigate?.('customers',()=>v49OpenCustomerEstimate(t.id)); return; }
    }
    if(t.kind==='vendor'){
      if(action==='edit'){ v47SetFocus?.('vendors',t.id); v47Navigate?.('vendors',()=>openModal('vendorEdit:'+t.id)); return; }
      if(action==='bill'){ v47SetFocus?.('vendors',t.id); v47Navigate?.('vendors',()=>v49OpenVendorBill(t.id)); return; }
      if(action==='expense'){ v47SetFocus?.('vendors',t.id); v47Navigate?.('vendors',()=>v49OpenVendorExpense(t.id)); return; }
    }
    return v49RunTargetBase(target, action, title);
  };
  customerOptions = function(){ return (state.customers||[]).map(c=>`<option value="${escapeHTML(c.id)}">${escapeHTML(c.name)}${v49IsInactive(c)?' (inactive)':''}</option>`).join(''); };
  vendorOptions = function(){ return (state.vendors||[]).map(v=>`<option value="${escapeHTML(v.id)}">${escapeHTML(v.name)}${v49IsInactive(v)?' (inactive)':''}</option>`).join(''); };

  // ---------- V50: reliable customer/vendor edit submit routing ----------
  // The original app attached the submit listener before later submitModal wrappers were added.
  // This capture-phase router intercepts customer/vendor create/edit saves first, then blocks the old listener.
  function v50AttachMasterDataSubmitRouter(){
    const form=document.getElementById('modalForm');
    if(!form || form.dataset.v50MasterSubmitRouter==='1') return;
    form.dataset.v50MasterSubmitRouter='1';
    form.addEventListener('submit', function(e){
      const s=String(currentModal||'');
      const isCustomer=(s==='customer' || s.startsWith('customerEdit:'));
      const isVendor=(s==='vendor' || s.startsWith('vendorEdit:'));
      if(!isCustomer && !isVendor) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const editId=s.includes(':') ? s.split(':')[1] : null;
      const ok=isCustomer ? v49SaveCustomerFromForm(e.currentTarget, editId) : v49SaveVendorFromForm(e.currentTarget, editId);
      if(!ok) return;

      try{ saveState(); }catch(err){ console.warn('V50 saveState failed', err); }
      try{ closeModal(); }catch(err){ console.warn('V50 closeModal failed', err); }
      try{ v49InvalidateDynamicViews(); }catch(err){}
      try{ renderAll(); }catch(err){ console.warn('V50 renderAll failed', err); }
      try{
        if(isCustomer && currentPage!=='customers') navigate('customers');
        if(isVendor && currentPage!=='vendors') navigate('vendors');
      }catch(err){ console.warn('V50 navigate failed', err); }
    }, true);
  }

  // Keep the capture router attached even if the modal form is reused by later renders.
  v50AttachMasterDataSubmitRouter();
  const v50OpenModalBase = openModal;
  openModal = function(type){
    const result = v50OpenModalBase.apply(this, arguments);
    try{ v50AttachMasterDataSubmitRouter(); }catch(e){ console.warn('V50 submit router attach skipped', e); }
    return result;
  };

  try{ injectV49MasterDataStyles(); v49InvalidateDynamicViews(); v50AttachMasterDataSubmitRouter(); renderAll(); }catch(e){ console.warn('V50 refresh skipped', e); }


  // ---------- V51: Customer/Vendor Contact Column Cleanup ----------
  // Replace low-value Company columns with Contact columns in customer/vendor master tables.
  // Keep company name in the edit form and detail view, but use contact-first display in lists/search.
  function v51ContactDisplay(record){
    const raw = (record && (record.contact || record.contactPerson || record.primaryContact || record.attention || record.email || record.phone)) || '';
    return String(raw || '').trim() || 'â€”';
  }
  function v51ContactSearchText(record){
    return [record?.contact, record?.contactPerson, record?.primaryContact, record?.attention, record?.email, record?.phone].filter(Boolean).join(' ');
  }

  const v51RenderCustomersBase = renderCustomers;
  renderCustomers = function(){
    try{ injectV49MasterDataStyles?.(); }catch(e){}
    const el=document.getElementById('page-customers');
    if(!el){ return v51RenderCustomersBase.apply(this, arguments); }
    const customers=(state.customers||[]);
    const active=customers.filter(c=>!v49IsInactive(c)).length;
    const inactive=customers.length-active;
    const ar=typeof customerOpenBalance==='function'?customers.reduce((s,c)=>s+customerOpenBalance(c.id),0):0;
    const rows=customers.map(c=>[
      `<input type="checkbox"/>`,
      `<button type="button" class="v49-record-button" data-action="view-customer" data-id="${escapeHTML(c.id)}">${escapeHTML(c.name)}</button><div class="muted small">${escapeHTML(c.id)}</div>`,
      escapeHTML(v51ContactDisplay(c)),
      escapeHTML(c.email||''),
      escapeHTML(c.phone||''),
      escapeHTML(c.type||''),
      v49StatusTag(c),
      `<span class="amount">${money(customerOpenBalance(c.id))}</span>`,
      v49CustomerActions(c)
    ]);
    el.innerHTML = header('Customers','Manage customer records, contact details, terms, status, open balances, estimates, and invoices.',`<button class="btn" data-modal="estimate">New estimate</button><button class="btn primary" data-modal="customer">New customer</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/R</h3><div class="metric">${money(ar)}</div><div class="muted small">Open customer balances</div></div><div class="card"><h3>Active customers</h3><div class="metric">${active}</div><div class="muted small">Usable in new sales records</div></div><div class="card"><h3>Inactive</h3><div class="metric">${inactive}</div><div class="muted small">Kept for history</div></div><div class="card"><h3>Estimates</h3><div class="metric">${(state.estimates||[]).length}</div><div class="muted small">Draft/accepted/converted</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search customers by name, contact, email, phone, type, or balance" /></div><div class="right"><button class="btn" data-modal="invoice">Create invoice</button><button class="btn primary" data-modal="customer">Add customer</button></div></div>${table(['','Name','Contact','Email','Phone','Type','Status','Open balance','Actions'], rows)}</div>`+
      `<div data-estimate-customer-activity>${v49EstimateCustomerActivityHTML()}</div>`;
  };

  const v51RenderVendorsBase = renderVendors;
  renderVendors = function(){
    try{ injectV49MasterDataStyles?.(); }catch(e){}
    const el=document.getElementById('page-vendors');
    if(!el){ return v51RenderVendorsBase.apply(this, arguments); }
    const vendors=(state.vendors||[]);
    const active=vendors.filter(v=>!v49IsInactive(v)).length;
    const inactive=vendors.length-active;
    const ap=vendors.reduce((s,v)=>s+vendorOpenBalance(v.id),0);
    const rows=vendors.map(v=>[
      `<button type="button" class="v49-record-button" data-action="view-vendor" data-id="${escapeHTML(v.id)}">${escapeHTML(v.name)}</button><div class="muted small">${escapeHTML(v.id)}</div>`,
      escapeHTML(v51ContactDisplay(v)),
      escapeHTML(v.email||''),
      escapeHTML(v.phone||''),
      escapeHTML(v.category||''),
      v49StatusTag(v),
      `<span class="amount">${money(vendorOpenBalance(v.id))}</span>`,
      v49VendorActions(v)
    ]);
    el.innerHTML = header('Vendors','Track supplier records, contact details, terms, categories, open bills, and payment status.',`<button class="btn" data-modal="payBill">Pay bill</button><button class="btn primary" data-modal="vendor">Add vendor</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/P</h3><div class="metric">${money(ap)}</div><div class="muted small">Open vendor balances</div></div><div class="card"><h3>Active vendors</h3><div class="metric">${active}</div><div class="muted small">Usable in new expense records</div></div><div class="card"><h3>Inactive</h3><div class="metric">${inactive}</div><div class="muted small">Kept for history</div></div><div class="card"><h3>Bills</h3><div class="metric">${(state.bills||[]).length}</div><div class="muted small">Open/paid vendor bills</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search vendors by name, contact, email, phone, category, or balance" /></div><div class="right"><button class="btn" data-modal="expense">Record expense</button><button class="btn primary" data-modal="vendor">Add vendor</button></div></div>${table(['Vendor','Contact','Email','Phone','Category','Status','Open balance','Actions'], rows)}</div>`;
  };

  // Update customer/vendor detail cards so Contact is visible as the practical second-line field.
  function v51CustomerDetail(id){
    const c=(state.customers||[]).find(x=>x.id===id); if(!c) return '<div class="empty">Customer not found.</div>';
    const invoices=(state.invoices||[]).filter(i=>i.customerId===id), estimates=(state.estimates||[]).filter(e=>e.customerId===id), open=typeof customerOpenBalance==='function'?customerOpenBalance(id):0;
    return `<div class="v49-note">Customer master record. Use <strong>Edit customer</strong> to update contact, billing, terms, tax setting, status, and notes without changing the customer ID.</div>
      <div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(c.name||'Customer')} ${v49StatusTag(c)}</h3>${v47Line('Customer ID',c.id)}${v47Line('Contact',v51ContactDisplay(c))}${v47Line('Email',c.email||'â€”')}${v47Line('Phone',c.phone||'â€”')}${v47Line('Company / organization',c.company||'â€”')}${v47Line('Terms',c.terms||'â€”')}${v47Line('Tax setting',c.taxSetting||'â€”')}</div><div class="v47-detail-card"><h3>Receivables</h3>${v47Line('Open balance',v47Money(open))}${v47Line('Invoice count',invoices.length)}${v47Line('Estimates',estimates.length)}${v47Line('Billing address',c.billingAddress||c.address||'â€”')}</div></div>
      <div class="card table-card v47-detail-table" style="margin-top:14px">${table(['Invoice','Date','Status','Total','Open'], invoices.slice(0,8).map(i=>[`<button type="button" class="v49-record-button" data-action="view-invoice" data-id="${escapeHTML(i.id)}">${escapeHTML(i.id)}</button>`,i.date||'',i.status||'',v47Money(v47InvTotal(i)),v47Money(v47InvOpen(i))]))}</div>`;
  }
  function v51VendorDetail(id){
    const v=(state.vendors||[]).find(x=>x.id===id); if(!v) return '<div class="empty">Vendor not found.</div>';
    const bills=(state.bills||[]).filter(b=>b.vendorId===id), expenses=(state.expenses||[]).filter(x=>x.vendorId===id), open=typeof vendorOpenBalance==='function'?vendorOpenBalance(id):0;
    return `<div class="v49-note">Vendor master record. Use <strong>Edit vendor</strong> to update contact, category, terms, default expense account, status, and notes without changing the vendor ID.</div>
      <div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(v.name||'Vendor')} ${v49StatusTag(v)}</h3>${v47Line('Vendor ID',v.id)}${v47Line('Contact',v51ContactDisplay(v))}${v47Line('Email',v.email||'â€”')}${v47Line('Phone',v.phone||'â€”')}${v47Line('Company / organization',v.company||'â€”')}${v47Line('Category',v.category||'â€”')}${v47Line('Terms',v.terms||'â€”')}</div><div class="v47-detail-card"><h3>Payables</h3>${v47Line('Open bills',v47Money(open))}${v47Line('Bill count',bills.length)}${v47Line('Expense count',expenses.length)}${v47Line('Default expense account',v47AccountLabel(v.expenseAccountId||''))}</div></div>
      <div class="card table-card v47-detail-table" style="margin-top:14px">${table(['Bill','Due','Status','Total','Open'], bills.slice(0,8).map(b=>[`<button type="button" class="v49-record-button" data-action="view-bill" data-id="${escapeHTML(b.id)}">${escapeHTML(b.id)}</button>`,b.dueDate||'',b.status||'',v47Money(v47BillTotal(b)),v47Money(v47BillOpen(b))]))}</div>`;
  }
  try{ v47CustomerDetail = v51CustomerDetail; v47VendorDetail = v51VendorDetail; }catch(e){}

  // Rewrite search result context and keywords to emphasize Contact instead of Company for master data.
  const v51BuildSearchIndexBase = v47BuildSearchIndex;
  v47BuildSearchIndex = function(){
    const rows=v51BuildSearchIndexBase.apply(this, arguments) || [];
    rows.forEach(r=>{
      if(r?.target?.kind==='customer'){
        const c=(state.customers||[]).find(x=>x.id===r.target.id);
        if(c){
          const open=(typeof customerOpenBalance==='function'?customerOpenBalance(c.id):0);
          r.desc=`Contact: ${v51ContactDisplay(c)} Â· ${c.email||''} Â· Open balance ${v47Money(open)}`;
          r.keywords=v47Lower([r.title,r.desc,r.badge,r.path,r.target.id,c.name,c.company,v51ContactSearchText(c),c.type,'customer contact receivable invoice estimate'].join(' '));
          r.norm=v47Norm([r.title,r.desc,r.badge,r.path,r.target.id,r.keywords].join(' '));
        }
      }
      if(r?.target?.kind==='vendor'){
        const v=(state.vendors||[]).find(x=>x.id===r.target.id);
        if(v){
          r.desc=`Contact: ${v51ContactDisplay(v)} Â· ${v.category||'Vendor'} Â· ${v.email||''}`;
          r.keywords=v47Lower([r.title,r.desc,r.badge,r.path,r.target.id,v.name,v.company,v51ContactSearchText(v),v.category,'vendor supplier payable bill contact'].join(' '));
          r.norm=v47Norm([r.title,r.desc,r.badge,r.path,r.target.id,r.keywords].join(' '));
        }
      }
    });
    return rows;
  };



  // ---------- V52: Customer Bulk Actions + Estimate/Invoice Sync ----------
  // Fixes: customer checkbox now has real bulk actions; converted estimates are
  // reconciled from invoice links so Recent Estimates and Sales -> Estimates do
  // not show stale Draft/Accepted statuses after conversion.
  function injectV52BulkAndEstimateSyncStyles(){
    if(document.getElementById('v52-bulk-estimate-sync-styles')) return;
    const style=document.createElement('style');
    style.id='v52-bulk-estimate-sync-styles';
    style.textContent=`
      body.v8-ui .v52-bulk-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 18px 12px;padding:12px 14px;border:1px solid #d7eedc;background:#f6fbf7;border-radius:14px;color:#123524}
      body.v8-ui .v52-bulk-toolbar[hidden]{display:none!important}
      body.v8-ui .v52-bulk-toolbar strong{font-weight:900}
      body.v8-ui .v52-bulk-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      body.v8-ui .v52-select-cell{width:34px;text-align:center!important;padding-right:8px!important}
      body.v8-ui .v52-select-cell input{width:16px;height:16px;accent-color:var(--green)}
      body.v8-ui .v52-converted-note{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;color:#344054;font-size:12px;margin-top:4px}
      body.v8-ui.dark-mode .v52-bulk-toolbar{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      body.v8-ui.dark-mode .v52-converted-note{color:#cbd5e1}
    `;
    document.head.appendChild(style);
  }
  function v52Settings(){ state.settings ||= {}; return state.settings; }
  function v52CustomerSelection(){ const s=v52Settings(); if(!Array.isArray(s.v52CustomerSelection)) s.v52CustomerSelection=[]; return s.v52CustomerSelection; }
  function v52ValidCustomerIds(){ return new Set((state.customers||[]).map(c=>String(c.id))); }
  function v52SelectedCustomers(){
    const valid=v52ValidCustomerIds();
    const unique=[...new Set(v52CustomerSelection().map(String))].filter(id=>valid.has(id));
    v52Settings().v52CustomerSelection=unique;
    return unique;
  }
  function v52SetCustomerSelection(ids){ v52Settings().v52CustomerSelection=[...new Set((ids||[]).map(String))].filter(id=>v52ValidCustomerIds().has(id)); }
  function v52CustomerBulkToolbar(){
    const selected=v52SelectedCustomers();
    const count=selected.length;
    return `<div class="v52-bulk-toolbar" ${count?'':'hidden'} data-v52-customer-bulk-toolbar><div><strong>${count} customer${count===1?'':'s'} selected</strong><div class="muted small">Apply a bulk action without deleting transaction history.</div></div><div class="v52-bulk-actions"><button type="button" class="btn" data-action="customer-bulk-make-active">Make active</button><button type="button" class="btn danger" data-action="customer-bulk-make-inactive">Make inactive</button><button type="button" class="btn" data-action="customer-bulk-statements">Send statement</button><button type="button" class="btn" data-action="customer-bulk-export-csv">Export CSV</button><button type="button" class="btn" data-action="customer-bulk-clear">Clear selection</button></div></div>`;
  }
  function v52ExportSelectedCustomersCSV(){
    const selected=new Set(v52SelectedCustomers());
    const rows=(state.customers||[]).filter(c=>selected.has(String(c.id)));
    if(!rows.length){ showToast('Select at least one customer first.'); return; }
    const headers=['Customer ID','Customer','Contact','Email','Phone','Type','Status','Open Balance','Company','Terms','Billing Address','Notes'];
    const csv=[headers, ...rows.map(c=>[c.id,c.name,v51ContactDisplay(c),c.email||'',c.phone||'',c.type||'',v49IsInactive(c)?'Inactive':'Active',customerOpenBalance(c.id),c.company||'',c.terms||'',c.billingAddress||c.address||'',c.notes||''])]
      .map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='smartbooks-selected-customers.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    showToast(`Exported ${rows.length} customer${rows.length===1?'':'s'} to CSV.`);
  }
  function v52OpenCustomerStatementBatch(){
    const selected=new Set(v52SelectedCustomers());
    const rows=(state.customers||[]).filter(c=>selected.has(String(c.id)));
    if(!rows.length){ showToast('Select at least one customer first.'); return; }
    currentModal='v52CustomerStatements';
    document.getElementById('modalTitle').textContent='Customer statements';
    document.getElementById('modalSubtitle').textContent='Statement batch preview for selected customers.';
    document.getElementById('modalBody').innerHTML=`<div class="v49-note"><strong>Statement batch:</strong> This prepares statements for the selected customers. No emails are sent automatically in this demo app.</div>${table(['Customer','Contact','Email','Open balance','Status'], rows.map(c=>[`<strong>${escapeHTML(c.name||'')}</strong><div class="muted small">${escapeHTML(c.id)}</div>`,escapeHTML(v51ContactDisplay(c)),escapeHTML(c.email||'â€”'),`<span class="amount">${money(customerOpenBalance(c.id))}</span>`,v49StatusTag(c)]))}`;
    document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Close</button><button type="button" class="btn primary" data-action="customer-bulk-export-csv">Export CSV</button>';
    document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').classList.add('open');
  }
  function v52InstallCustomerBulkHandlers(){
    if(document.documentElement.dataset.v52CustomerBulkBound==='1') return;
    document.documentElement.dataset.v52CustomerBulkBound='1';
    document.addEventListener('change', e=>{
      const all=e.target.closest('[data-customer-select-all]');
      const one=e.target.closest('[data-customer-select]');
      if(!all && !one) return;
      if(all){
        const ids=(state.customers||[]).map(c=>String(c.id));
        v52SetCustomerSelection(all.checked ? ids : []);
        renderCustomers();
        return;
      }
      const id=String(one.value||one.dataset.id||'');
      const selected=new Set(v52SelectedCustomers());
      if(one.checked) selected.add(id); else selected.delete(id);
      v52SetCustomerSelection([...selected]);
      renderCustomers();
    });
  }

  function v52FindLinkedInvoice(e){
    if(!e) return null;
    const estId=String(e.id||'').trim();
    const estNo=String(e.estimateNumber||e.number||e.no||'').trim();
    const knownInvoiceId=String(e.convertedInvoiceId||e.linkedInvoiceId||e.invoiceId||'').trim();
    if(knownInvoiceId){
      const direct=(state.invoices||[]).find(inv=>String(inv.id||'')===knownInvoiceId || String(inv.invoiceNo||'')===knownInvoiceId);
      if(direct) return direct;
    }
    return (state.invoices||[]).find(inv=>{
      const invSourceId=String(inv.sourceEstimateId||inv.estimateId||inv.convertedFromEstimateId||'').trim();
      const invEstNo=String(inv.estimateNumber||inv.sourceEstimateNo||inv.sourceEstimateNumber||'').trim();
      return (estId && invSourceId===estId) || (estNo && invEstNo===estNo) || (estId && invEstNo===estId);
    }) || null;
  }
  function v52LinkedInvoiceId(e){
    const inv=v52FindLinkedInvoice(e);
    return inv?.id || e?.convertedInvoiceId || e?.linkedInvoiceId || e?.invoiceId || '';
  }
  function v52EstimateDisplayStatus(e){
    if(!e) return 'Draft';
    if(v52LinkedInvoiceId(e)) return 'Converted';
    const s=String(e.status||'Draft');
    return s || 'Draft';
  }
  function v52EstimateStatusTag(e){
    const s=v52EstimateDisplayStatus(e);
    if(s==='Converted') return '<span class="v17-estimate-converted">Converted</span>';
    return estimateStatusTag(s);
  }
  function v52ReconcileConvertedEstimates(mutates=true){
    let changed=0;
    (state.estimates||[]).forEach(e=>{
      const inv=v52FindLinkedInvoice(e);
      if(inv){
        if(mutates && (e.status!=='Converted' || e.convertedInvoiceId!==inv.id)){
          e.status='Converted';
          e.convertedInvoiceId=inv.id;
          e.linkedInvoiceId=inv.id;
          e.convertedAt=e.convertedAt || inv.date || todayISO();
          e.updatedAt=new Date().toISOString();
          changed++;
        }
      }
    });
    return changed;
  }
  function v52RefreshAfterEstimateSync(message){
    try{ v47InvalidateSearch?.(); }catch(e){}
    try{ v49InvalidateDynamicViews?.(); }catch(e){}
    try{ saveState(); }catch(e){ console.warn('V52 saveState skipped', e); }
    try{ renderAll(); }catch(e){ console.warn('V52 renderAll skipped', e); }
    if(message) showToast(message);
  }

  try{
    const v52V18EstimateDisplayStatusBase = typeof v18EstimateDisplayStatus==='function' ? v18EstimateDisplayStatus : null;
    v18EstimateDisplayStatus = function(e){ return v52EstimateDisplayStatus(e) || (v52V18EstimateDisplayStatusBase ? v52V18EstimateDisplayStatusBase(e) : 'Draft'); };
  }catch(e){}
  try{
    const v52V17EstimateDisplayStatusBase = typeof v17EstimateDisplayStatus==='function' ? v17EstimateDisplayStatus : null;
    v17EstimateDisplayStatus = function(e){ return v52EstimateDisplayStatus(e) || (v52V17EstimateDisplayStatusBase ? v52V17EstimateDisplayStatusBase(e) : 'Draft'); };
    v17EstimateStatusTag = function(e){ return v52EstimateStatusTag(e); };
  }catch(e){}
  try{
    const v52V49EstimateStatusBase = typeof v49EstimateStatus==='function' ? v49EstimateStatus : null;
    v49EstimateStatus = function(e){ return v52EstimateDisplayStatus(e) || (v52V49EstimateStatusBase ? v52V49EstimateStatusBase(e) : 'Draft'); };
  }catch(e){}

  const v52ConvertEstimateToInvoiceBase = convertEstimateToInvoice;
  convertEstimateToInvoice = function(id){
    v17EnsureState?.();
    const e=(state.estimates||[]).find(x=>String(x.id)===String(id) || String(x.estimateNumber||'')===String(id));
    if(!e){ showToast('Estimate not found.'); return; }
    const existing=v52FindLinkedInvoice(e);
    if(existing){
      e.status='Converted'; e.convertedInvoiceId=existing.id; e.linkedInvoiceId=existing.id; e.convertedAt=e.convertedAt || existing.date || todayISO(); e.updatedAt=new Date().toISOString();
      state.settings.salesTab='invoices'; state.settings.activeInvoiceId=existing.id;
      v52RefreshAfterEstimateSync(`Estimate already links to invoice ${existing.id}.`);
      return;
    }
    const beforeIds=new Set((state.invoices||[]).map(inv=>inv.id));
    v52ConvertEstimateToInvoiceBase.apply(this, arguments);
    const after=(state.invoices||[]).find(inv=>!beforeIds.has(inv.id) && (String(inv.sourceEstimateId||'')===String(e.id) || String(inv.estimateNumber||'')===String(e.estimateNumber||e.id)));
    const linked=after || v52FindLinkedInvoice(e);
    if(linked){
      e.status='Converted'; e.convertedInvoiceId=linked.id; e.linkedInvoiceId=linked.id; e.convertedAt=e.convertedAt || linked.date || todayISO(); e.updatedAt=new Date().toISOString();
      try{ v47InvalidateSearch?.(); v49InvalidateDynamicViews?.(); saveState(); renderAll(); }catch(err){ console.warn('V52 post-conversion refresh skipped', err); }
    }
  };

  v49EstimateCustomerActivityHTML = function(){
    v52ReconcileConvertedEstimates(true);
    const estimates=v49SortEstimates(state.estimates||[]).slice(0,10);
    if(!estimates.length) return '';
    const rows=estimates.map(e=>{
      const status=v52EstimateDisplayStatus(e);
      const inv=v52LinkedInvoiceId(e);
      const linked=inv?`<div class="v49-estimate-link">Linked invoice: <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">${escapeHTML(inv)}</button></div>`:'';
      const actions=`<div class="v49-estimate-row-actions"><button type="button" class="btn" data-action="view-estimate" data-id="${escapeHTML(e.id)}">View</button>${status==='Converted'?`<button type="button" class="btn primary" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">View invoice</button>`:`<button type="button" class="btn" data-action="edit-estimate" data-id="${escapeHTML(e.id)}">Edit</button>`}</div>`;
      return [`<button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${escapeHTML(e.estimateNumber||e.id)}</button>${linked}`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),v52EstimateStatusTag(e),`<span class="amount">${money(estimateAmount(e))}</span>`,actions];
    });
    return `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Recent estimates</h3><div class="muted small">Newest estimates created from + New or Sales â†’ Estimates. Converted estimates reconcile from linked invoices automatically.</div></div><button class="btn" data-modal="estimate">New estimate</button></div>${table(['Estimate','Customer','Date','Status','Total','Actions'], rows)}</div>`;
  };

  const v52RenderEstimateHubBase = renderEstimateHub;
  renderEstimateHub = function(){
    injectV49MasterDataStyles?.(); injectV52BulkAndEstimateSyncStyles(); injectEstimateWorkflowStyles?.(); injectV17WorkflowStyles?.(); v17EnsureState?.();
    v52ReconcileConvertedEstimates(true);
    const estimates=v49SortEstimates(state.estimates||[]);
    const draft=estimates.filter(e=>v52EstimateDisplayStatus(e)==='Draft').length;
    const sent=estimates.filter(e=>v52EstimateDisplayStatus(e)==='Sent').length;
    const accepted=estimates.filter(e=>v52EstimateDisplayStatus(e)==='Accepted').length;
    const converted=estimates.filter(e=>v52EstimateDisplayStatus(e)==='Converted').length;
    const total=estimates.reduce((s,e)=>s+estimateAmount(e),0);
    const rows=estimates.map(e=>{
      const inv=v52LinkedInvoiceId(e);
      const statusCell=`${v52EstimateStatusTag(e)}${inv?`<div class="v49-estimate-link">Invoice <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">${escapeHTML(inv)}</button></div>`:''}`;
      return [`<button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${escapeHTML(e.estimateNumber||e.id)}</button><div class="muted small">${escapeHTML(e.projectName||'')}</div>`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),escapeHTML(e.expiryDate||''),statusCell,`<span class="amount">${money(estimateAmount(e))}</span>`,typeof v17EstimateActionButtons==='function'?v17EstimateActionButtons(e):`<button class="btn" data-action="edit-estimate" data-id="${escapeHTML(e.id)}">Edit</button>`];
    });
    return `<div class="estimate-hub"><div class="v17-route-note">Saved estimates appear here and in customer activity. Converted status is synchronized from linked invoices.</div>
      <div class="section-header"><div><h2>Estimates</h2><p>Create, send, accept, decline, and convert non-posting estimates into invoices.</p></div><button class="btn primary" data-modal="estimate">Create estimate</button></div>
      <div class="estimate-kpi-grid"><div class="estimate-kpi"><span>Total estimate value</span><strong>${money(total)}</strong></div><div class="estimate-kpi"><span>Draft</span><strong>${draft}</strong></div><div class="estimate-kpi"><span>Sent / accepted</span><strong>${sent+accepted}</strong></div><div class="estimate-kpi"><span>Converted</span><strong>${converted}</strong></div></div>
      <div class="card table-card">${table(['Estimate','Customer','Date','Expiry','Status','Total','Actions'], rows)}</div></div>`;
  };

  const v52RenderCustomersBase = renderCustomers;
  renderCustomers = function(){
    try{ injectV49MasterDataStyles?.(); injectV52BulkAndEstimateSyncStyles(); }catch(e){}
    const el=document.getElementById('page-customers');
    if(!el){ return v52RenderCustomersBase.apply(this, arguments); }
    const customers=(state.customers||[]);
    const selected=new Set(v52SelectedCustomers());
    const active=customers.filter(c=>!v49IsInactive(c)).length;
    const inactive=customers.length-active;
    const ar=typeof customerOpenBalance==='function'?customers.reduce((s,c)=>s+customerOpenBalance(c.id),0):0;
    const allSelected=customers.length>0 && customers.every(c=>selected.has(String(c.id)));
    const rows=customers.map(c=>[
      `<input type="checkbox" data-customer-select data-id="${escapeHTML(c.id)}" value="${escapeHTML(c.id)}" ${selected.has(String(c.id))?'checked':''} aria-label="Select ${escapeHTML(c.name||'customer')}">`,
      `<button type="button" class="v49-record-button" data-action="view-customer" data-id="${escapeHTML(c.id)}">${escapeHTML(c.name)}</button><div class="muted small">${escapeHTML(c.id)}</div>`,
      escapeHTML(v51ContactDisplay(c)),
      escapeHTML(c.email||''),
      escapeHTML(c.phone||''),
      escapeHTML(c.type||''),
      v49StatusTag(c),
      `<span class="amount">${money(customerOpenBalance(c.id))}</span>`,
      v49CustomerActions(c)
    ]);
    el.innerHTML = header('Customers','Manage customer records, contact details, terms, status, open balances, estimates, and invoices.',`<button class="btn" data-modal="estimate">New estimate</button><button class="btn primary" data-modal="customer">New customer</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/R</h3><div class="metric">${money(ar)}</div><div class="muted small">Open customer balances</div></div><div class="card"><h3>Active customers</h3><div class="metric">${active}</div><div class="muted small">Usable in new sales records</div></div><div class="card"><h3>Inactive</h3><div class="metric">${inactive}</div><div class="muted small">Kept for history</div></div><div class="card"><h3>Estimates</h3><div class="metric">${(state.estimates||[]).length}</div><div class="muted small">Draft/accepted/converted</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search customers by name, contact, email, phone, type, or balance" /></div><div class="right"><button class="btn" data-modal="invoice">Create invoice</button><button class="btn primary" data-modal="customer">Add customer</button></div></div>${v52CustomerBulkToolbar()}${table([`<span class="v52-select-cell"><input type="checkbox" data-customer-select-all ${allSelected?'checked':''} aria-label="Select all customers"></span>`,'Name','Contact','Email','Phone','Type','Status','Open balance','Actions'], rows)}</div>`+
      `<div data-estimate-customer-activity>${v49EstimateCustomerActivityHTML()}</div>`;
  };

  const v52HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='customer-bulk-clear'){
      v52SetCustomerSelection([]); renderCustomers(); showToast('Customer selection cleared.'); return;
    }
    if(action==='customer-bulk-make-active' || action==='customer-bulk-make-inactive'){
      const selected=new Set(v52SelectedCustomers());
      if(!selected.size){ showToast('Select at least one customer first.'); return; }
      const status=action==='customer-bulk-make-active'?'Active':'Inactive';
      let count=0;
      (state.customers||[]).forEach(c=>{ if(selected.has(String(c.id))){ c.status=status; c.active=status==='Active'; c.updatedAt=new Date().toISOString(); count++; } });
      v52SetCustomerSelection([]);
      audit(`${count} customer${count===1?'':'s'} marked ${status}`);
      saveState(); renderAll(); showToast(`${count} customer${count===1?'':'s'} marked ${status}.`); return;
    }
    if(action==='customer-bulk-export-csv'){ v52ExportSelectedCustomersCSV(); return; }
    if(action==='customer-bulk-statements'){ v52OpenCustomerStatementBatch(); return; }
    return v52HandleActionBase.apply(this, arguments);
  };

  const v52BuildSearchIndexBase = v47BuildSearchIndex;
  v47BuildSearchIndex = function(){
    try{ v52ReconcileConvertedEstimates(true); }catch(e){}
    const rows=v52BuildSearchIndexBase.apply(this, arguments) || [];
    rows.forEach(r=>{
      if(r?.target?.kind==='estimate'){
        const e=(state.estimates||[]).find(x=>x.id===r.target.id);
        if(e){
          const status=v52EstimateDisplayStatus(e), inv=v52LinkedInvoiceId(e);
          r.desc=`${status} Â· ${e.date||''} Â· ${v47Money(estimateAmount(e))}${inv?' Â· Invoice '+inv:''}`;
          r.keywords=v47Lower([r.keywords,status,inv,'converted linked invoice estimate quote'].join(' '));
          r.norm=v47Norm([r.title,r.desc,r.path,r.keywords].join(' '));
        }
      }
    });
    return rows;
  };

  const v52SaveStateBase = saveState;
  saveState = function(){
    try{ v52ReconcileConvertedEstimates(true); }catch(e){}
    return v52SaveStateBase.apply(this, arguments);
  };
  const v52RenderAllBase = renderAll;
  renderAll = function(){
    try{ v52ReconcileConvertedEstimates(true); }catch(e){}
    return v52RenderAllBase.apply(this, arguments);
  };


  // ---------- V53: Vendor Bulk Actions ----------
  // Mirrors the V52 customer selection pattern for vendor master records.
  // Vendor checkboxes now expose useful batch actions rather than acting as
  // visual-only controls.
  function v53VendorSelection(){
    const s=v52Settings();
    if(!Array.isArray(s.v53VendorSelection)) s.v53VendorSelection=[];
    return s.v53VendorSelection;
  }
  function v53ValidVendorIds(){ return new Set((state.vendors||[]).map(v=>String(v.id))); }
  function v53SelectedVendors(){
    const valid=v53ValidVendorIds();
    const unique=[...new Set(v53VendorSelection().map(String))].filter(id=>valid.has(id));
    v52Settings().v53VendorSelection=unique;
    return unique;
  }
  function v53SetVendorSelection(ids){
    v52Settings().v53VendorSelection=[...new Set((ids||[]).map(String))].filter(id=>v53ValidVendorIds().has(id));
  }
  function v53VendorBulkToolbar(){
    const selected=v53SelectedVendors();
    const count=selected.length;
    return `<div class="v52-bulk-toolbar" ${count?'':'hidden'} data-v53-vendor-bulk-toolbar><div><strong>${count} vendor${count===1?'':'s'} selected</strong><div class="muted small">Apply a bulk action without deleting purchase or payment history.</div></div><div class="v52-bulk-actions"><button type="button" class="btn" data-action="vendor-bulk-make-active">Make active</button><button type="button" class="btn danger" data-action="vendor-bulk-make-inactive">Make inactive</button><button type="button" class="btn" data-action="vendor-bulk-enter-bill">Enter bill</button><button type="button" class="btn" data-action="vendor-bulk-record-expense">Record expense</button><button type="button" class="btn" data-action="vendor-bulk-export-csv">Export CSV</button><button type="button" class="btn" data-action="vendor-bulk-clear">Clear selection</button></div></div>`;
  }
  function v53ExportSelectedVendorsCSV(){
    const selected=new Set(v53SelectedVendors());
    const rows=(state.vendors||[]).filter(v=>selected.has(String(v.id)));
    if(!rows.length){ showToast('Select at least one vendor first.'); return; }
    const headers=['Vendor ID','Vendor','Contact','Email','Phone','Category','Status','Open Balance','Company','Terms','Default Expense Account','Address','Notes'];
    const csv=[headers, ...rows.map(v=>[v.id,v.name,v51ContactDisplay(v),v.email||'',v.phone||'',v.category||'',v49IsInactive(v)?'Inactive':'Active',vendorOpenBalance(v.id),v.company||'',v.terms||'',v47AccountLabel(v.expenseAccountId||''),v.address||'',v.notes||''])]
      .map(r=>r.map(value=>'"'+String(value??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='smartbooks-selected-vendors.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    showToast(`Exported ${rows.length} vendor${rows.length===1?'':'s'} to CSV.`);
  }
  function v53RequireOneSelectedVendor(actionLabel){
    const selected=v53SelectedVendors();
    if(selected.length!==1){ showToast(`Select one vendor to ${actionLabel}.`); return null; }
    return selected[0];
  }
  function v53InstallVendorBulkHandlers(){
    if(document.documentElement.dataset.v53VendorBulkBound==='1') return;
    document.documentElement.dataset.v53VendorBulkBound='1';
    document.addEventListener('change', e=>{
      const all=e.target.closest('[data-vendor-select-all]');
      const one=e.target.closest('[data-vendor-select]');
      if(!all && !one) return;
      if(all){
        const ids=(state.vendors||[]).map(v=>String(v.id));
        v53SetVendorSelection(all.checked ? ids : []);
        renderVendors();
        return;
      }
      const id=String(one.value||one.dataset.id||'');
      const selected=new Set(v53SelectedVendors());
      if(one.checked) selected.add(id); else selected.delete(id);
      v53SetVendorSelection([...selected]);
      renderVendors();
    });
  }

  const v53RenderVendorsBase = renderVendors;
  renderVendors = function(){
    try{ injectV49MasterDataStyles?.(); injectV52BulkAndEstimateSyncStyles?.(); }catch(e){}
    const el=document.getElementById('page-vendors');
    if(!el){ return v53RenderVendorsBase.apply(this, arguments); }
    const vendors=(state.vendors||[]);
    const selected=new Set(v53SelectedVendors());
    const active=vendors.filter(v=>!v49IsInactive(v)).length;
    const inactive=vendors.length-active;
    const ap=vendors.reduce((s,v)=>s+vendorOpenBalance(v.id),0);
    const allSelected=vendors.length>0 && vendors.every(v=>selected.has(String(v.id)));
    const rows=vendors.map(v=>[
      `<input type="checkbox" data-vendor-select data-id="${escapeHTML(v.id)}" value="${escapeHTML(v.id)}" ${selected.has(String(v.id))?'checked':''} aria-label="Select ${escapeHTML(v.name||'vendor')}">`,
      `<button type="button" class="v49-record-button" data-action="view-vendor" data-id="${escapeHTML(v.id)}">${escapeHTML(v.name)}</button><div class="muted small">${escapeHTML(v.id)}</div>`,
      escapeHTML(v51ContactDisplay(v)),
      escapeHTML(v.email||''),
      escapeHTML(v.phone||''),
      escapeHTML(v.category||''),
      v49StatusTag(v),
      `<span class="amount">${money(vendorOpenBalance(v.id))}</span>`,
      v49VendorActions(v)
    ]);
    el.innerHTML = header('Vendors','Track supplier records, contact details, terms, categories, open bills, and payment status.',`<button class="btn" data-modal="payBill">Pay bill</button><button class="btn primary" data-modal="vendor">Add vendor</button>`)+
      `<div class="grid four" style="margin-bottom:16px"><div class="card"><h3>Open A/P</h3><div class="metric">${money(ap)}</div><div class="muted small">Open vendor balances</div></div><div class="card"><h3>Active vendors</h3><div class="metric">${active}</div><div class="muted small">Usable in new expense records</div></div><div class="card"><h3>Inactive</h3><div class="metric">${inactive}</div><div class="muted small">Kept for history</div></div><div class="card"><h3>Bills</h3><div class="metric">${(state.bills||[]).length}</div><div class="muted small">Open/paid vendor bills</div></div></div>`+
      `<div class="card table-card"><div class="toolbar"><div class="left"><input class="table-search" data-filter-table placeholder="Search vendors by name, contact, email, phone, category, or balance" /></div><div class="right"><button class="btn" data-modal="expense">Record expense</button><button class="btn primary" data-modal="vendor">Add vendor</button></div></div>${v53VendorBulkToolbar()}${table([`<span class="v52-select-cell"><input type="checkbox" data-vendor-select-all ${allSelected?'checked':''} aria-label="Select all vendors"></span>`,'Vendor','Contact','Email','Phone','Category','Status','Open balance','Actions'], rows)}</div>`;
  };

  const v53HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='vendor-bulk-clear'){
      v53SetVendorSelection([]); renderVendors(); showToast('Vendor selection cleared.'); return;
    }
    if(action==='vendor-bulk-make-active' || action==='vendor-bulk-make-inactive'){
      const selected=new Set(v53SelectedVendors());
      if(!selected.size){ showToast('Select at least one vendor first.'); return; }
      const status=action==='vendor-bulk-make-active'?'Active':'Inactive';
      let count=0;
      (state.vendors||[]).forEach(v=>{ if(selected.has(String(v.id))){ v.status=status; v.active=status==='Active'; v.updatedAt=new Date().toISOString(); count++; } });
      v53SetVendorSelection([]);
      audit(`${count} vendor${count===1?'':'s'} marked ${status}`);
      try{ v47InvalidateSearch?.(); }catch(e){}
      saveState(); renderAll(); showToast(`${count} vendor${count===1?'':'s'} marked ${status}.`); return;
    }
    if(action==='vendor-bulk-export-csv'){ v53ExportSelectedVendorsCSV(); return; }
    if(action==='vendor-bulk-enter-bill'){
      const vendorId=v53RequireOneSelectedVendor('enter a bill');
      if(!vendorId) return;
      v49OpenVendorBill(vendorId); return;
    }
    if(action==='vendor-bulk-record-expense'){
      const vendorId=v53RequireOneSelectedVendor('record an expense');
      if(!vendorId) return;
      v49OpenVendorExpense(vendorId); return;
    }
    return v53HandleActionBase.apply(this, arguments);
  };

  // ---------- V54: Centralized estimate status reconciliation ----------
  // Fixes stale Draft/Accepted statuses by using one normalized estimate record
  // across Sales -> Estimates, customer activity, search, and the invoice workflow.
  // The reconciler supports both explicit links and legacy/manual invoices that
  // match the estimate by customer + total amount + reasonable date window.
  function injectV54EstimateSyncStyles(){
    if(document.getElementById('v54-estimate-sync-styles')) return;
    const style=document.createElement('style');
    style.id='v54-estimate-sync-styles';
    style.textContent=`
      body.v8-ui .v54-sync-note{border:1px solid #cfe6f7;background:#f4faff;color:#18476b;border-radius:14px;padding:11px 13px;margin:0 0 12px;font-weight:800;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      body.v8-ui .v54-linked-invoice{display:inline-flex;gap:5px;align-items:center;flex-wrap:wrap;margin-top:4px;color:#344054;font-size:12px;font-weight:800}
      body.v8-ui .v54-match-pill{display:inline-flex;align-items:center;border:1px solid #d0d7de;border-radius:999px;padding:2px 7px;background:#fff;color:#667085;font-size:11px;font-weight:900;margin-left:4px}
      body.v8-ui.dark-mode .v54-sync-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      body.v8-ui.dark-mode .v54-linked-invoice{color:#cbd5e1}
      body.v8-ui.dark-mode .v54-match-pill{background:#101b27;border-color:#34495e;color:#aab8c7}
    `;
    document.head.appendChild(style);
  }
  function v54Str(v){ return String(v ?? '').trim(); }
  function v54Norm(v){ return v54Str(v).toLowerCase().replace(/[^a-z0-9]+/g,''); }
  function v54DateMs(v){ const t=Date.parse(v54Str(v)); return Number.isFinite(t) ? t : 0; }
  function v54DaysBetween(a,b){ const am=v54DateMs(a), bm=v54DateMs(b); if(!am || !bm) return 0; return Math.round((bm-am)/86400000); }
  function v54MoneyValue(v){ const n=num(v); return Number.isFinite(n) ? n : 0; }
  function v54InvoiceTotal(inv){
    try{ if(typeof invoiceTotal==='function') return v54MoneyValue(invoiceTotal(inv)); }catch(e){}
    return v54MoneyValue(inv?.total ?? inv?.amount ?? (v54MoneyValue(inv?.subtotal)+v54MoneyValue(inv?.tax)+v54MoneyValue(inv?.shipping)));
  }
  function v54EstimateTotal(e){
    try{ if(typeof estimateAmount==='function') return v54MoneyValue(estimateAmount(e)); }catch(err){}
    return v54MoneyValue(e?.total ?? e?.amount ?? (v54MoneyValue(e?.subtotal)-v54MoneyValue(e?.discount)+v54MoneyValue(e?.tax)+v54MoneyValue(e?.shipping)));
  }
  function v54IsInvoiceVoided(inv){
    const st=v54Str(inv?.status).toLowerCase();
    const em=v54Str(inv?.emailStatus).toLowerCase();
    return !!inv?.voided || st==='void' || st==='voided' || em==='void';
  }
  function v54InvoiceSearchText(inv){
    return [
      inv?.id, inv?.invoiceNo, inv?.estimateNumber, inv?.sourceEstimateNo, inv?.sourceEstimateNumber,
      inv?.memo, inv?.notes, inv?.description, inv?.customerMessage, inv?.scope, inv?.projectName,
      ...(Array.isArray(inv?.items)?inv.items.map(x=>[x.desc,x.description,x.memo].join(' ')):[])
    ].map(v54Str).join(' ');
  }
  function v54CandidateScore(e, inv){
    if(!e || !inv || v54IsInvoiceVoided(inv)) return -1;
    const estId=v54Str(e.id), estNo=v54Str(e.estimateNumber || e.number || e.no || e.id);
    const estIdN=v54Norm(estId), estNoN=v54Norm(estNo);
    const invId=v54Str(inv.id || inv.invoiceNo);
    const invSourceId=v54Str(inv.sourceEstimateId || inv.estimateId || inv.convertedFromEstimateId || inv.originalEstimateId);
    const invEstNo=v54Str(inv.estimateNumber || inv.sourceEstimateNo || inv.sourceEstimateNumber || inv.estimateNo);
    const invSourceN=v54Norm(invSourceId), invEstNoN=v54Norm(invEstNo);
    const knownInvoiceId=v54Str(e.convertedInvoiceId || e.linkedInvoiceId || e.invoiceId);
    if(knownInvoiceId && (v54Str(inv.id)===knownInvoiceId || v54Str(inv.invoiceNo)===knownInvoiceId)) return 1200;
    if(estId && invSourceId===estId) return 1150;
    if(estNo && invSourceId===estNo) return 1125;
    if(estNo && invEstNo===estNo) return 1100;
    if(estId && invEstNo===estId) return 1075;
    if((estIdN && invSourceN===estIdN) || (estNoN && invEstNoN===estNoN) || (estIdN && invEstNoN===estIdN)) return 1050;
    const textN=v54Norm(v54InvoiceSearchText(inv));
    if((estNoN && textN.includes(estNoN)) || (estIdN && textN.includes(estIdN))) return 980;

    // Legacy/manual conversion fallback: same customer + same amount + invoice on/after estimate.
    if(v54Str(inv.customerId) !== v54Str(e.customerId)) return -1;
    const estTotal=v54EstimateTotal(e), invTotal=v54InvoiceTotal(inv);
    const amountDiff=Math.abs(estTotal-invTotal);
    if(estTotal <= 0 || invTotal <= 0 || amountDiff > Math.max(0.01, estTotal*0.0025)) return -1;
    const days=v54DaysBetween(e.date || e.createdAt, inv.date || inv.createdAt || inv.sentDate);
    // Allow a small back-date tolerance because users may date an invoice earlier than the conversion click.
    if(days < -14 || days > 395) return -1;
    let score=720;
    if(days>=0) score += Math.max(0, 80-Math.min(days,80));
    if(v54Str(inv.emailStatus).toLowerCase() !== 'draft' || v54Str(inv.sentDate)) score += 35;
    if(v54Str(inv.status).toLowerCase() !== 'draft') score += 20;
    if(v54InvoiceSearchText(inv).toLowerCase().includes('estimate')) score += 25;
    // If multiple estimates share customer + amount, prefer one with closest estimate date.
    score -= Math.min(Math.abs(days),120) * 0.5;
    return score;
  }
  function v54FindLinkedInvoice(e){
    let best=null, bestScore=-1;
    (state.invoices||[]).forEach(inv=>{
      const score=v54CandidateScore(e, inv);
      if(score>bestScore){ bestScore=score; best=inv; }
    });
    return bestScore>=700 ? best : null;
  }
  function v54EstimateNormalizedRecord(e, mutates=false){
    const inv=v54FindLinkedInvoice(e);
    const rawStatus=v54Str(e?.status || 'Draft') || 'Draft';
    const status=inv ? 'Converted' : rawStatus;
    if(mutates && e && inv){
      let changed=false;
      if(e.status!=='Converted'){ e.status='Converted'; changed=true; }
      if(e.convertedInvoiceId!==inv.id){ e.convertedInvoiceId=inv.id; changed=true; }
      if(e.linkedInvoiceId!==inv.id){ e.linkedInvoiceId=inv.id; changed=true; }
      if(!e.convertedAt){ e.convertedAt=inv.sentDate || inv.date || todayISO(); changed=true; }
      if(inv.sourceEstimateId!==e.id){ inv.sourceEstimateId=e.id; changed=true; }
      if((e.estimateNumber||e.id) && inv.estimateNumber!==(e.estimateNumber||e.id)){ inv.estimateNumber=e.estimateNumber||e.id; changed=true; }
      if(changed) e.updatedAt=new Date().toISOString();
    }
    return {estimate:e, invoice:inv, invoiceId:inv?.id || e?.convertedInvoiceId || e?.linkedInvoiceId || e?.invoiceId || '', status, amount:v54EstimateTotal(e)};
  }
  function v54EstimateDisplayStatus(e){ return v54EstimateNormalizedRecord(e, false).status || 'Draft'; }
  function v54LinkedInvoiceId(e){ return v54EstimateNormalizedRecord(e, false).invoiceId || ''; }
  function v54EstimateStatusTag(e){
    const s=v54EstimateDisplayStatus(e);
    if(s==='Converted') return '<span class="v17-estimate-converted">Converted</span>';
    return estimateStatusTag(s);
  }
  function v54ReconcileConvertedEstimates(mutates=true){
    let changed=0;
    (state.estimates||[]).forEach(e=>{
      const before=[e.status,e.convertedInvoiceId,e.linkedInvoiceId,e.updatedAt].join('|');
      v54EstimateNormalizedRecord(e, mutates);
      const after=[e.status,e.convertedInvoiceId,e.linkedInvoiceId,e.updatedAt].join('|');
      if(before!==after) changed++;
    });
    return changed;
  }
  function v54EstimateActionButtons(e){
    const n=v54EstimateNormalizedRecord(e,false);
    const id=escapeHTML(e.id);
    const invId=escapeHTML(n.invoiceId || '');
    const buttons=[`<button class="btn" data-action="view-estimate" data-id="${id}">View</button>`];
    if(n.status==='Converted'){
      buttons.push(`<button class="btn primary" data-action="open-converted-invoice" data-id="${invId}">View invoice</button>`);
    }else if(n.status==='Accepted'){
      buttons.push(`<button class="btn primary" data-action="convert-estimate-invoice" data-id="${id}">Convert</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
    }else if(n.status==='Sent'){
      buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
    }else if(n.status==='Draft'){
      buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Mark sent</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
      buttons.push(`<button class="btn" disabled title="Convert after acceptance">Convert</button>`);
    }else{
      buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Reopen</button>`);
    }
    return `<div class="estimate-actions">${buttons.join('')}</div>`;
  }

  // Route all estimate status/link lookups through V54.
  try{ v52FindLinkedInvoice = v54FindLinkedInvoice; }catch(e){}
  try{ v52LinkedInvoiceId = v54LinkedInvoiceId; }catch(e){}
  try{ v52EstimateDisplayStatus = v54EstimateDisplayStatus; }catch(e){}
  try{ v52EstimateStatusTag = v54EstimateStatusTag; }catch(e){}
  try{ v52ReconcileConvertedEstimates = v54ReconcileConvertedEstimates; }catch(e){}
  try{ v17EstimateDisplayStatus = v54EstimateDisplayStatus; v17EstimateStatusTag = v54EstimateStatusTag; v17EstimateActionButtons = v54EstimateActionButtons; }catch(e){}
  try{ v18EstimateDisplayStatus = v54EstimateDisplayStatus; }catch(e){}
  try{ v49EstimateStatus = v54EstimateDisplayStatus; }catch(e){}

  v49EstimateCustomerActivityHTML = function(){
    v54ReconcileConvertedEstimates(true);
    const estimates=v49SortEstimates(state.estimates||[]).slice(0,10);
    if(!estimates.length) return '';
    const rows=estimates.map(e=>{
      const n=v54EstimateNormalizedRecord(e,false);
      const inv=n.invoiceId;
      const linked=inv?`<div class="v54-linked-invoice">Linked invoice: <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">${escapeHTML(inv)}</button></div>`:'';
      return [`<button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${escapeHTML(e.estimateNumber||e.id)}</button>${linked}`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),v54EstimateStatusTag(e),`<span class="amount">${money(n.amount)}</span>`,v54EstimateActionButtons(e)];
    });
    return `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Recent estimates</h3><div class="muted small">Newest estimates created from + New or Sales â†’ Estimates. Status is reconciled from linked and matching invoices.</div></div><button class="btn" data-modal="estimate">New estimate</button></div>${table(['Estimate','Customer','Date','Status','Total','Actions'], rows)}</div>`;
  };

  renderEstimateHub = function(){
    injectV54EstimateSyncStyles(); injectV49MasterDataStyles?.(); injectV52BulkAndEstimateSyncStyles?.(); injectEstimateWorkflowStyles?.(); injectV17WorkflowStyles?.(); v17EnsureState?.();
    v54ReconcileConvertedEstimates(true);
    const estimates=v49SortEstimates(state.estimates||[]);
    const draft=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Draft').length;
    const sent=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Sent').length;
    const accepted=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Accepted').length;
    const converted=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Converted').length;
    const total=estimates.reduce((s,e)=>s+v54EstimateTotal(e),0);
    const rows=estimates.map(e=>{
      const n=v54EstimateNormalizedRecord(e,false);
      const inv=n.invoiceId;
      const statusCell=`${v54EstimateStatusTag(e)}${inv?`<div class="v54-linked-invoice">Invoice <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">${escapeHTML(inv)}</button></div>`:''}`;
      return [`<button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${escapeHTML(e.estimateNumber||e.id)}</button><div class="muted small">${escapeHTML(e.projectName||'')}</div>`,escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),escapeHTML(e.expiryDate||''),statusCell,`<span class="amount">${money(n.amount)}</span>`,v54EstimateActionButtons(e)];
    });
    return `<div class="estimate-hub"><div class="v54-sync-note"><span>Estimate status is now centralized: converted status is derived from explicit links, invoice references, and legacy customer/amount/date matches.</span><button class="btn" data-action="estimate-sync-refresh">Refresh sync</button></div>
      <div class="section-header"><div><h2>Estimates</h2><p>Create, send, accept, decline, and convert non-posting estimates into invoices.</p></div><button class="btn primary" data-modal="estimate">Create estimate</button></div>
      <div class="estimate-kpi-grid"><div class="estimate-kpi"><span>Total estimate value</span><strong>${money(total)}</strong></div><div class="estimate-kpi"><span>Draft</span><strong>${draft}</strong></div><div class="estimate-kpi"><span>Sent / accepted</span><strong>${sent+accepted}</strong></div><div class="estimate-kpi"><span>Converted</span><strong>${converted}</strong></div></div>
      <div class="card table-card">${table(['Estimate','Customer','Date','Expiry','Status','Total','Actions'], rows)}</div></div>`;
  };

  const v54RenderAllBase = renderAll;
  renderAll = function(){
    try{ injectV54EstimateSyncStyles(); const c=v54ReconcileConvertedEstimates(true); if(c){ try{ v47InvalidateSearch?.(); }catch(e){} } }catch(e){ console.warn('V54 estimate sync skipped', e); }
    return v54RenderAllBase.apply(this, arguments);
  };

  const v54HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='estimate-sync-refresh'){
      const count=v54ReconcileConvertedEstimates(true);
      try{ v47InvalidateSearch?.(); v49InvalidateDynamicViews?.(); saveState(); renderAll(); }catch(e){ console.warn('V54 manual sync refresh skipped', e); }
      showToast(count ? `Estimate sync refreshed: ${count} estimate${count===1?'':'s'} updated.` : 'Estimate sync refreshed. No stale estimates found.');
      return;
    }
    if(action==='open-converted-invoice'){
      if(id){ state.settings.salesTab='invoices'; state.settings.activeInvoiceId=id; saveState(); navigate('sales'); showToast(`Invoice ${id} opened in Invoice Center.`); return; }
      state.settings.salesTab='invoices'; saveState(); navigate('sales'); showToast('Invoice Center opened.'); return;
    }
    if(action==='mark-estimate-sent' || action==='mark-estimate-accepted' || action==='mark-estimate-declined'){
      const e=(state.estimates||[]).find(x=>String(x.id)===String(id) || String(x.estimateNumber||'')===String(id));
      if(e && v54EstimateDisplayStatus(e)==='Converted'){
        showToast('This estimate is already converted. Open the linked invoice instead.');
        return;
      }
    }
    return v54HandleActionBase.apply(this, arguments);
  };

  try{ injectV54EstimateSyncStyles(); v54ReconcileConvertedEstimates(true); }catch(e){ console.warn('V54 setup skipped', e); }


  try{ injectV52BulkAndEstimateSyncStyles(); v52InstallCustomerBulkHandlers(); v53InstallVendorBulkHandlers(); v54ReconcileConvertedEstimates(true); }catch(e){ console.warn('V54 setup skipped', e); }


  // ---------- V55: Estimate status/action unification fix ----------
  // Purpose: prevent the same estimate from showing different statuses in
  // Sales -> Estimates versus Customers -> Recent Estimates. All estimate
  // tables now use the same normalized status/action helper and duplicate
  // legacy rows with the same estimate number are promoted to the strongest
  // workflow status: Converted > Declined > Accepted > Sent > Draft.
  function injectV55EstimateStatusStyles(){
    if(document.getElementById('v55-estimate-status-styles')) return;
    const style=document.createElement('style');
    style.id='v55-estimate-status-styles';
    style.textContent=`
      body.v8-ui .v55-estimate-cell{display:flex;flex-direction:column;gap:3px;align-items:flex-start;min-width:0}
      body.v8-ui .v55-linked-invoice{display:flex;gap:5px;align-items:center;flex-wrap:wrap;color:#344054;font-size:12px;font-weight:800;line-height:1.25;margin-top:2px}
      body.v8-ui .v55-status-cell{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      body.v8-ui .v55-reconciled-note{border:1px solid #d9e9f8;background:#f4f9ff;border-radius:14px;padding:10px 12px;color:#18476b;font-size:12px;line-height:1.45;margin:0 0 12px;font-weight:800}
      body.v8-ui.dark-mode .v55-linked-invoice{color:#cbd5e1}
      body.v8-ui.dark-mode .v55-reconciled-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}
    `;
    document.head.appendChild(style);
  }
  function v55CanonicalStatus(status){
    const s=String(status||'').trim().toLowerCase();
    if(['converted','invoiced','invoice created'].includes(s)) return 'Converted';
    if(['declined','rejected','lost'].includes(s)) return 'Declined';
    if(['accepted','approved','won'].includes(s)) return 'Accepted';
    if(['sent','submitted','issued','emailed'].includes(s)) return 'Sent';
    return 'Draft';
  }
  function v55StatusRank(status){
    return {Draft:1, Sent:2, Accepted:3, Declined:4, Converted:5}[v55CanonicalStatus(status)] || 1;
  }
  function v55EstimateKey(e){
    const raw=String(e?.estimateNumber || e?.number || e?.no || e?.id || '').trim();
    return raw.toLowerCase().replace(/[^a-z0-9]+/g,'');
  }
  function v55SameEstimateGroup(e){
    const key=v55EstimateKey(e);
    if(!key) return e ? [e] : [];
    return (state.estimates||[]).filter(x=>v55EstimateKey(x)===key);
  }
  function v55RawLinkedInvoiceId(x){
    const direct=String(x?.convertedInvoiceId || x?.linkedInvoiceId || x?.invoiceId || '').trim();
    if(direct) return direct;
    try{
      const inv=typeof v54FindLinkedInvoice==='function' ? v54FindLinkedInvoice(x) : null;
      return String(inv?.id || inv?.invoiceNo || inv?.number || '').trim();
    }catch(err){ return ''; }
  }
  function v55BestGroupStatus(e){
    let best=v55CanonicalStatus(e?.status);
    let bestRank=v55StatusRank(best);
    v55SameEstimateGroup(e).forEach(x=>{
      let st=v55CanonicalStatus(x?.status);
      const linked=v55RawLinkedInvoiceId(x);
      if(linked) st='Converted';
      const rank=v55StatusRank(st);
      if(rank>bestRank){ best=st; bestRank=rank; }
    });
    return best;
  }

  const v55V54EstimateNormalizedRecordBase = typeof v54EstimateNormalizedRecord==='function' ? v54EstimateNormalizedRecord : null;
  v54EstimateNormalizedRecord = function(e, mutates=false){
    const base = v55V54EstimateNormalizedRecordBase ? v55V54EstimateNormalizedRecordBase(e, mutates) : {estimate:e, invoice:null, invoiceId:e?.convertedInvoiceId||e?.linkedInvoiceId||e?.invoiceId||'', status:v55CanonicalStatus(e?.status), amount:typeof estimateAmount==='function'?estimateAmount(e):num(e?.total)};
    if(!e) return base;
    const groupStatus = base.invoiceId ? 'Converted' : v55BestGroupStatus(e);
    base.status = groupStatus;
    if(mutates){
      let changed=false;
      v55SameEstimateGroup(e).forEach(x=>{
        const xLinked = base.invoiceId || v55RawLinkedInvoiceId(x);
        const targetStatus = xLinked ? 'Converted' : groupStatus;
        if(v55CanonicalStatus(x.status)!==targetStatus){ x.status=targetStatus; changed=true; }
        if(targetStatus==='Converted' && base.invoiceId){
          if(x.convertedInvoiceId!==base.invoiceId){ x.convertedInvoiceId=base.invoiceId; changed=true; }
          if(x.linkedInvoiceId!==base.invoiceId){ x.linkedInvoiceId=base.invoiceId; changed=true; }
          if(!x.convertedAt){ x.convertedAt=base.invoice?.sentDate || base.invoice?.date || todayISO(); changed=true; }
        }
        if(changed) x.updatedAt=new Date().toISOString();
      });
    }
    return base;
  };
  v54EstimateDisplayStatus = function(e){ return v54EstimateNormalizedRecord(e,false).status || 'Draft'; };
  v54LinkedInvoiceId = function(e){ return v54EstimateNormalizedRecord(e,false).invoiceId || ''; };
  v54EstimateStatusTag = function(e){
    const s=v54EstimateDisplayStatus(e);
    if(s==='Converted') return '<span class="v17-estimate-converted">Converted</span>';
    return estimateStatusTag(s);
  };
  v54ReconcileConvertedEstimates = function(mutates=true){
    let changed=0;
    (state.estimates||[]).forEach(e=>{
      const before=[e.status,e.convertedInvoiceId,e.linkedInvoiceId,e.updatedAt].join('|');
      v54EstimateNormalizedRecord(e, mutates);
      const after=[e.status,e.convertedInvoiceId,e.linkedInvoiceId,e.updatedAt].join('|');
      if(before!==after) changed++;
    });
    return changed;
  };
  v54EstimateActionButtons = function(e){
    const n=v54EstimateNormalizedRecord(e,false);
    const id=escapeHTML(e.id);
    const invId=escapeHTML(n.invoiceId || '');
    const buttons=[`<button class="btn" data-action="view-estimate" data-id="${id}">View</button>`];
    if(n.status==='Converted'){
      buttons.push(`<button class="btn primary" data-action="open-converted-invoice" data-id="${invId}">View invoice</button>`);
    }else if(n.status==='Accepted'){
      buttons.push(`<button class="btn primary" data-action="convert-estimate-invoice" data-id="${id}">Convert</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
    }else if(n.status==='Sent'){
      buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-declined" data-id="${id}">Decline</button>`);
    }else if(n.status==='Declined'){
      buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Reopen</button>`);
    }else{
      buttons.push(`<button class="btn" data-action="edit-estimate" data-id="${id}">Edit</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-sent" data-id="${id}">Mark sent</button>`);
      buttons.push(`<button class="btn" data-action="mark-estimate-accepted" data-id="${id}">Accept</button>`);
    }
    return `<div class="estimate-actions">${buttons.join('')}</div>`;
  };
  try{ v52EstimateDisplayStatus = v54EstimateDisplayStatus; v52EstimateStatusTag = v54EstimateStatusTag; v52LinkedInvoiceId = v54LinkedInvoiceId; v52ReconcileConvertedEstimates = v54ReconcileConvertedEstimates; }catch(e){}
  try{ v17EstimateDisplayStatus = v54EstimateDisplayStatus; v17EstimateStatusTag = v54EstimateStatusTag; v17EstimateActionButtons = v54EstimateActionButtons; }catch(e){}
  try{ v18EstimateDisplayStatus = v54EstimateDisplayStatus; v49EstimateStatus = v54EstimateDisplayStatus; }catch(e){}

  function v55EstimateNumberCell(e, invId){
    const no=escapeHTML(e.estimateNumber||e.id);
    const linked=invId ? `<div class="v55-linked-invoice">Linked invoice: <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(invId)}">${escapeHTML(invId)}</button></div>` : '';
    return `<div class="v55-estimate-cell"><button type="button" class="v49-record-button" data-action="view-estimate" data-id="${escapeHTML(e.id)}">${no}</button>${linked}</div>`;
  }
  function v55EstimateStatusCell(e){
    const inv=v54LinkedInvoiceId(e);
    const inline=inv ? `<span class="v55-linked-invoice">Invoice <button type="button" class="v49-record-button" data-action="open-converted-invoice" data-id="${escapeHTML(inv)}">${escapeHTML(inv)}</button></span>` : '';
    return `<div class="v55-status-cell">${v54EstimateStatusTag(e)}${inline}</div>`;
  }
  function v55SortEstimates(rows){
    const list=(typeof v49SortEstimates==='function') ? v49SortEstimates(rows||[]) : (rows||[]).slice().sort((a,b)=>String(b.updatedAt||b.createdAt||b.date||'').localeCompare(String(a.updatedAt||a.createdAt||a.date||'')));
    // Keep the newest record per estimate number/id in Recent Estimates to avoid legacy duplicate rows showing a stale status.
    const seen=new Set();
    const dedup=[];
    list.forEach(e=>{ const key=v55EstimateKey(e) || String(e.id||''); if(!seen.has(key)){ seen.add(key); dedup.push(e); } });
    return dedup;
  }

  v49EstimateCustomerActivityHTML = function(){
    injectV55EstimateStatusStyles();
    v54ReconcileConvertedEstimates(true);
    const estimates=v55SortEstimates(state.estimates||[]).slice(0,10);
    if(!estimates.length) return '';
    const rows=estimates.map(e=>{
      const n=v54EstimateNormalizedRecord(e,false);
      return [v55EstimateNumberCell(e,n.invoiceId),escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),v55EstimateStatusCell(e),`<span class="amount">${money(n.amount)}</span>`,v54EstimateActionButtons(e)];
    });
    return `<div class="card table-card" style="margin-top:16px"><div class="toolbar"><div><h3 style="margin:0">Recent estimates</h3><div class="muted small">Newest estimates created from + New or Sales â†’ Estimates. Status and actions use the same reconciliation as the main Estimates table.</div></div><button class="btn" data-modal="estimate">New estimate</button></div>${table(['Estimate','Customer','Date','Status','Total','Actions'], rows)}</div>`;
  };

  renderEstimateHub = function(){
    injectV54EstimateSyncStyles(); injectV55EstimateStatusStyles(); injectV49MasterDataStyles?.(); injectV52BulkAndEstimateSyncStyles?.(); injectEstimateWorkflowStyles?.(); injectV17WorkflowStyles?.(); v17EnsureState?.();
    v54ReconcileConvertedEstimates(true);
    const estimates=v55SortEstimates(state.estimates||[]);
    const draft=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Draft').length;
    const sent=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Sent').length;
    const accepted=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Accepted').length;
    const converted=estimates.filter(e=>v54EstimateDisplayStatus(e)==='Converted').length;
    const total=estimates.reduce((s,e)=>s+v54EstimateTotal(e),0);
    const rows=estimates.map(e=>{
      const n=v54EstimateNormalizedRecord(e,false);
      return [v55EstimateNumberCell(e,n.invoiceId),escapeHTML(getCustomer(e.customerId).name),escapeHTML(e.date||''),escapeHTML(e.expiryDate||''),v55EstimateStatusCell(e),`<span class="amount">${money(n.amount)}</span>`,v54EstimateActionButtons(e)];
    });
    return `<div class="estimate-hub"><div class="v55-reconciled-note">V55 sync: Sales â†’ Estimates and Recent Estimates use one status/action helper. Accepted estimates stay Accepted and cannot be downgraded to Sent by older activity widgets.</div>
      <div class="v54-sync-note"><span>Estimate status is centralized: Converted status is derived from explicit links, invoice references, and legacy customer/amount/date matches.</span><button class="btn" data-action="estimate-sync-refresh">Refresh sync</button></div>
      <div class="section-header"><div><h2>Estimates</h2><p>Create, send, accept, decline, and convert non-posting estimates into invoices.</p></div><button class="btn primary" data-modal="estimate">Create estimate</button></div>
      <div class="estimate-kpi-grid"><div class="estimate-kpi"><span>Total estimate value</span><strong>${money(total)}</strong></div><div class="estimate-kpi"><span>Draft</span><strong>${draft}</strong></div><div class="estimate-kpi"><span>Sent / accepted</span><strong>${sent+accepted}</strong></div><div class="estimate-kpi"><span>Converted</span><strong>${converted}</strong></div></div>
      <div class="card table-card">${table(['Estimate','Customer','Date','Expiry','Status','Total','Actions'], rows)}</div></div>`;
  };

  const v55HandleActionBase = handleAction;
  handleAction = function(action,id){
    const estimateActions=['mark-estimate-sent','mark-estimate-accepted','mark-estimate-declined','convert-estimate-invoice','edit-estimate','view-estimate'];
    const result = v55HandleActionBase.apply(this, arguments);
    if(estimateActions.includes(action)){
      try{ v54ReconcileConvertedEstimates(true); v47InvalidateSearch?.(); v49InvalidateDynamicViews?.(); saveState(); }catch(e){}
      try{ if(['mark-estimate-sent','mark-estimate-accepted','mark-estimate-declined','convert-estimate-invoice'].includes(action)) renderAll(); }catch(e){}
    }
    return result;
  };

  const v55RenderAllBase = renderAll;
  renderAll = function(){
    try{ injectV55EstimateStatusStyles(); v54ReconcileConvertedEstimates(true); }catch(e){ console.warn('V55 estimate status sync skipped', e); }
    return v55RenderAllBase.apply(this, arguments);
  };

  try{ injectV55EstimateStatusStyles(); v54ReconcileConvertedEstimates(true); }catch(e){ console.warn('V55 setup skipped', e); }


  // ---------- V56: Sales & Customers route hydration regression fix ----------
  // V45 introduced an instant route shell with a deferred hydration step. After the
  // later estimate/customer/vendor patches, Sales & Get Paid and Customers & Leads
  // could remain on the lightweight "Ready" shell instead of rendering the full
  // workspace body. V56 makes the route renderer deterministic: navigation activates
  // the target page and renders the real page immediately, with no cached shell.
  function injectV56RouteHydrationFixStyles(){
    if(document.getElementById('v56-route-hydration-fix-styles')) return;
    const style=document.createElement('style');
    style.id='v56-route-hydration-fix-styles';
    style.textContent=`
      body.v8-ui .v56-render-error{background:#fff;border:1px solid #ffd0c8;border-left:5px solid #d94141;border-radius:18px;padding:16px;margin-top:14px;color:#172033;box-shadow:0 2px 10px rgba(16,24,40,.04)}
      body.v8-ui .v56-render-error h3{margin:0 0 6px;color:#b42318;text-transform:none;font-size:16px;letter-spacing:0}
      body.v8-ui .v56-render-error p{margin:0 0 10px;color:#53657d;line-height:1.45}
      body.v8-ui.dark-mode .v56-render-error{background:#14202d;border-color:#6b2e32;color:#e8edf3}
      body.v8-ui.dark-mode .v56-render-error h3{color:#ffb4ac}
      body.v8-ui.dark-mode .v56-render-error p{color:#aab8c7}
    `;
    document.head.appendChild(style);
  }

  function v56NormalizePage(page){
    page=String(page||'dashboard');
    if(page==='products') page='inventory';
    if(page!=='dashboard' && !document.getElementById('page-'+page)) page='dashboard';
    return page;
  }
  function v56RouteShellPattern(){ return /v40-route-loading-card|v42-fallback-card|v43-workspace-card|v44-instant-shell|v45-route-shell/; }
  function v56IsRouteShell(el){ return !!(el && v56RouteShellPattern().test(String(el.innerHTML||''))); }
  function v56ActivatePage(page){
    currentPage=page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const el=document.getElementById('page-'+page);
    if(el) el.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>{
      const active=b.dataset.nav===page;
      b.classList.toggle('active', active);
      b.classList.toggle('v45-fast-active', active);
    });
    setTimeout(()=>document.querySelectorAll('.v45-fast-active').forEach(b=>b.classList.remove('v45-fast-active')),120);
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('open');
    document.getElementById('createMenu')?.classList.remove('open');
    if(typeof closeSmartSearch==='function') closeSmartSearch();
  }
  function v56RenderError(page, err){
    injectV56RouteHydrationFixStyles();
    const el=document.getElementById('page-'+page);
    if(!el) return;
    const label=(typeof v45PageLabel==='function') ? v45PageLabel(page) : (page==='sales'?'Sales & Get Paid':page==='customers'?'Customers & Leads':page);
    const actions=(typeof v45PageActions==='function') ? v45PageActions(page) : '<button class="btn primary" data-open-create>ï¼‹ New</button>';
    el.innerHTML=`${header(escapeHTML(label), 'This workspace opened, but one content block could not render.', actions)}<div class="v56-render-error"><h3>Workspace content render issue</h3><p>${escapeHTML(err?.message || String(err || 'Unknown render error'))}</p><button class="btn" data-action="v56-refresh-active">Try refresh</button></div>`;
  }
  function v56RenderWorkspace(page){
    page=v56NormalizePage(page);
    injectV56RouteHydrationFixStyles();
    try{ if(typeof v54ReconcileConvertedEstimates==='function') v54ReconcileConvertedEstimates(true); }catch(e){}
    v56ActivatePage(page);
    const el=document.getElementById('page-'+page);
    try{
      if(el && v56IsRouteShell(el)) el.innerHTML='';
      if(page==='dashboard'){
        renderDashboard();
      }else if(page==='sales'){
        renderSales();
      }else if(page==='customers'){
        renderCustomers();
      }else if(page==='vendors'){
        renderVendors();
      }else{
        renderPage(page);
      }
      const pageEl=document.getElementById('page-'+page);
      // Do not allow the lightweight route shell to remain as the final visible page.
      if(pageEl && v56IsRouteShell(pageEl)){
        pageEl.innerHTML='';
        if(page==='sales') renderSales();
        else if(page==='customers') renderCustomers();
        else if(page==='vendors') renderVendors();
        else if(page==='dashboard') renderDashboard();
        else renderPage(page);
      }
      try{ if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(pageEl || document); }catch(e){}
      try{ if(typeof renderMenu==='function') renderMenu(); }catch(e){}
      try{ if(typeof v47InvalidateSearch==='function') v47InvalidateSearch(); }catch(e){}
    }catch(err){
      console.error('V56 direct route render failed for '+page, err);
      v56RenderError(page, err);
    }
  }

  // Replace the deferred route shell renderer and all public navigation paths.
  try{ v45RouteCache?.clear?.(); }catch(e){}
  try{ v40PageCache?.clear?.(); }catch(e){}
  try{ if(typeof v45NavigateFast==='function') v45NavigateFast = function(page, options={}){ v56RenderWorkspace(page || currentPage || 'dashboard'); }; }catch(e){}
  navigate = function(page){ v56RenderWorkspace(page || 'dashboard'); };

  const v56RenderAllBase = renderAll;
  renderAll = function(){
    try{
      document.getElementById('topCompanyName').textContent = state.company.name;
      if(typeof renderMenu==='function') renderMenu();
      if(typeof renderModulePills==='function') renderModulePills();
      v56RenderWorkspace(currentPage || 'dashboard');
    }catch(err){
      console.warn('V56 renderAll fallback used', err);
      try{ return v56RenderAllBase.apply(this, arguments); }catch(inner){ v56RenderError(currentPage || 'dashboard', inner); }
    }
  };

  const v56HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='v56-refresh-active'){
      try{ v45RouteCache?.clear?.(); v40PageCache?.clear?.(); }catch(e){}
      v56RenderWorkspace(currentPage || 'dashboard');
      showToast?.('Workspace refreshed.');
      return;
    }
    return v56HandleActionBase.apply(this, arguments);
  };




  // ---------- V57: estimate reconciliation call-stack hardening ----------
  // V57 keeps the V55 unified estimate status/action behavior but removes the remaining
  // recursive dependency between normalized estimate records and linked-invoice lookup.
  try{
    const v57RawFindLinkedInvoice = function(e){
      if(!e) return null;
      const known=String(e.convertedInvoiceId || e.linkedInvoiceId || e.invoiceId || '').trim();
      if(known){
        const explicit=(state.invoices||[]).find(inv=>String(inv.id||'')===known || String(inv.invoiceNo||'')===known || String(inv.number||'')===known);
        if(explicit) return explicit;
      }
      let best=null, bestScore=-1;
      (state.invoices||[]).forEach(inv=>{
        let score=-1;
        try{ score=v54CandidateScore(e, inv); }catch(err){ score=-1; }
        if(score>bestScore){ bestScore=score; best=inv; }
      });
      return bestScore>=700 ? best : null;
    };
    v54FindLinkedInvoice = v57RawFindLinkedInvoice;
    v52FindLinkedInvoice = v57RawFindLinkedInvoice;
    v47InvalidateSearch?.();
  }catch(e){ console.warn('V57 call-stack hardening setup skipped', e); }


