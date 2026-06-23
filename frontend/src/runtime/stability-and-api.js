// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

  // ---------- V58: structural refactor for state, render, and event stability ----------
  // V58 is intentionally installed as the final runtime layer. Earlier builds kept
  // adding patch-specific listeners and render paths; this layer centralizes the final
  // state reconciliation, submit routing, duplicate-action guard, and post-render sync.
  const v58Runtime = {
    renderScheduled:false,
    reconciling:false,
    rendering:false,
    lastActionKey:'',
    lastActionAt:0,
    installed:false
  };

  function v58InjectStabilityStyles(){
    if(document.getElementById('v58-stability-styles')) return;
    const style=document.createElement('style');
    style.id='v58-stability-styles';
    style.textContent=`
      body.v8-ui .btn,
      body.v8-ui button.btn,
      body.v8-ui a.btn{appearance:none;-webkit-appearance:none;text-decoration:none;line-height:1.2}
      body.v8-ui .toolbar .btn,
      body.v8-ui .invoice-actions .btn,
      body.v8-ui .row-actions .btn,
      body.v8-ui .table-actions .btn{font-weight:800}
      body.v8-ui .btn.primary{background:var(--green)!important;border-color:var(--green)!important;color:#fff!important}
      body.v8-ui .btn.danger{background:#fff5f5!important;color:#b42318!important;border-color:#f4b9b5!important}
      body.v8-ui.dark-mode .btn.danger{background:#2a1418!important;color:#ffb4ac!important;border-color:#6b2e32!important}
      body.v8-ui .v58-sync-note{border:1px solid #d7eedc;background:#f6fbf7;color:#123524;border-radius:14px;padding:10px 12px;margin:0 0 12px;font-size:12px;line-height:1.45;font-weight:800}
      body.v8-ui.dark-mode .v58-sync-note{background:#0f2536;border-color:#264b67;color:#c8e6ff}
      body.v8-ui .v58-workflow-intake{display:grid;gap:14px}
      body.v8-ui .v58-workflow-intake .v58-sync-note{margin:0}
    `;
    document.head.appendChild(style);
  }

  function v58Blank(v){ return v===undefined || v===null || String(v).trim()===''; }
  function v58Norm(v){ return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g,''); }
  function v58Money(v){ const n=num(v); return Number.isFinite(n) ? n : 0; }
  function v58Collection(name){ if(!Array.isArray(state[name])) state[name]=[]; return state[name]; }
  function v58ArrayKey(parts){ return parts.map(v=>v58Norm(v)).filter(Boolean).join('|'); }

  function v58StatusRank(status, type){
    const s=String(status||'').trim().toLowerCase();
    if(type==='estimate') return {draft:1,sent:2,accepted:3,approved:3,declined:4,rejected:4,converted:5,invoiced:5,'invoice created':5}[s] || 1;
    if(type==='invoice') return {draft:1,sent:2,open:2,overdue:3,paid:4,closed:4,void:5,voided:5}[s] || 2;
    if(type==='bill') return {draft:1,open:2,overdue:3,paid:4,closed:4,void:5,voided:5}[s] || 2;
    return 1;
  }
  function v58StrongestStatus(a,b,type){
    return v58StatusRank(b,type) > v58StatusRank(a,type) ? b : a;
  }

  function v58MergeRecord(base, incoming, type){
    if(!base || !incoming || base===incoming) return base || incoming;
    Object.keys(incoming).forEach(k=>{
      const next=incoming[k], cur=base[k];
      if(k==='status'){
        base[k]=v58StrongestStatus(cur, next, type);
      }else if(Array.isArray(next)){
        if(!Array.isArray(cur) || cur.length===0) base[k]=structuredClone ? structuredClone(next) : JSON.parse(JSON.stringify(next));
      }else if(typeof next==='object' && next!==null){
        if(!cur || typeof cur!=='object') base[k]=next;
      }else if(v58Blank(cur) && !v58Blank(next)){
        base[k]=next;
      }else if(['paid','subtotal','tax','total','amount'].includes(k) && v58Money(cur)===0 && v58Money(next)!==0){
        base[k]=next;
      }
    });
    return base;
  }

  function v58DedupeCollection(name, keyFn, type){
    const list=v58Collection(name);
    const seen=new Map();
    const out=[];
    let changed=false;
    list.forEach(rec=>{
      const key=keyFn(rec);
      if(key && seen.has(key)){
        v58MergeRecord(seen.get(key), rec, type);
        changed=true;
      }else{
        if(key) seen.set(key, rec);
        out.push(rec);
      }
    });
    if(changed) state[name]=out;
    return changed;
  }

  function v58BusinessKey(type, rec){
    if(!rec) return '';
    if(type==='customer'){
      return v58Norm(rec.id) || v58ArrayKey([rec.name, rec.email || rec.phone || rec.company]);
    }
    if(type==='vendor'){
      return v58Norm(rec.id) || v58ArrayKey([rec.name, rec.email || rec.phone || rec.category]);
    }
    if(type==='invoice'){
      return v58Norm(rec.id || rec.invoiceNo || rec.number) ||
        v58ArrayKey([rec.customerId, rec.date, rec.dueDate, rec.subtotal, rec.tax, rec.status, (rec.items||[]).map(i=>`${i.desc}:${i.qty}:${i.rate}`).join(';')]);
    }
    if(type==='estimate'){
      try{ if(typeof v55EstimateKey==='function') return v55EstimateKey(rec); }catch(e){}
      return v58Norm(rec.id || rec.estimateNo || rec.estimateNumber || rec.number) ||
        v58ArrayKey([rec.customerId, rec.date, rec.total, rec.status]);
    }
    if(type==='bill'){
      return v58Norm(rec.id || rec.billNo || rec.number) || v58ArrayKey([rec.vendorId, rec.date, rec.dueDate, rec.amount, rec.tax]);
    }
    if(type==='expense'){
      return v58Norm(rec.id) || v58ArrayKey([rec.vendorId, rec.date, rec.amount, rec.tax, rec.memo, rec.bankAccountId]);
    }
    if(type==='payment'){
      return v58Norm(rec.id) || v58ArrayKey([rec.invoiceId, rec.customerId, rec.date, rec.accountId, rec.amount, rec.memo]);
    }
    if(type==='billPayment'){
      return v58Norm(rec.id) || v58ArrayKey([rec.billId, rec.vendorId, rec.date, rec.accountId, rec.amount, rec.memo]);
    }
    return v58Norm(rec.id);
  }

  function v58PaymentTotals(collectionName, linkField){
    const map=new Map();
    (state[collectionName]||[]).forEach(p=>{
      const id=String(p?.[linkField]||'').trim();
      if(!id) return;
      map.set(id, (map.get(id)||0)+v58Money(p.amount));
    });
    return map;
  }

  function v58NormalizeInvoiceStatuses(){
    const today=todayISO();
    const paidByInvoice=v58PaymentTotals('payments','invoiceId');
    (state.invoices||[]).forEach(inv=>{
      const total=typeof invoiceTotal==='function' ? invoiceTotal(inv) : v58Money(inv.subtotal)+v58Money(inv.tax);
      const paidFromPayments=paidByInvoice.get(inv.id)||0;
      if(paidFromPayments>0 && Math.abs(v58Money(inv.paid)-paidFromPayments)>0.01){
        inv.paid=Math.max(v58Money(inv.paid), paidFromPayments);
      }
      const open=Math.max(0,total-v58Money(inv.paid));
      const raw=String(inv.status||'').toLowerCase();
      if(open<=0.01) inv.status='Paid';
      else if(raw==='paid' || raw==='closed') inv.status='Sent';
      else if(inv.dueDate && inv.dueDate < today && raw!=='draft' && raw!=='voided') inv.status='Overdue';
      else if(!inv.status) inv.status='Sent';
    });
  }

  function v58NormalizeBillStatuses(){
    const today=todayISO();
    const paidByBill=v58PaymentTotals('billPayments','billId');
    (state.bills||[]).forEach(bill=>{
      const total=typeof billTotal==='function' ? billTotal(bill) : v58Money(bill.amount)+v58Money(bill.tax);
      const paidFromPayments=paidByBill.get(bill.id)||0;
      if(paidFromPayments>0 && Math.abs(v58Money(bill.paid)-paidFromPayments)>0.01){
        bill.paid=Math.max(v58Money(bill.paid), paidFromPayments);
      }
      const open=Math.max(0,total-v58Money(bill.paid));
      const raw=String(bill.status||'').toLowerCase();
      if(open<=0.01) bill.status='Paid';
      else if(raw==='paid' || raw==='closed') bill.status='Open';
      else if(bill.dueDate && bill.dueDate < today && raw!=='draft' && raw!=='voided') bill.status='Overdue';
      else if(!bill.status) bill.status='Open';
    });
  }

  function v58NormalizeEstimateStatuses(){
    try{ if(typeof v54ReconcileConvertedEstimates==='function') v54ReconcileConvertedEstimates(true); }catch(e){}
    (state.estimates||[]).forEach(e=>{
      let linked='';
      try{ linked=typeof v54LinkedInvoiceId==='function' ? v54LinkedInvoiceId(e) : (e.convertedInvoiceId || e.linkedInvoiceId || e.invoiceId || ''); }catch(err){ linked=e.convertedInvoiceId || e.linkedInvoiceId || e.invoiceId || ''; }
      if(linked){
        e.status='Converted';
        e.convertedInvoiceId=linked;
        e.linkedInvoiceId=linked;
      }else{
        try{ if(typeof v55BestGroupStatus==='function') e.status=v55BestGroupStatus(e); }catch(err){ e.status=e.status || 'Draft'; }
      }
    });
  }

  function v58ReconcileData(){
    if(v58Runtime.reconciling) return false;
    v58Runtime.reconciling=true;
    let changed=false;
    try{
      ['customers','vendors','products','invoices','payments','estimates','expenses','bills','billPayments','deposits','transfers','bankTransactions','journalEntries'].forEach(v58Collection);
      changed = v58DedupeCollection('customers', r=>v58BusinessKey('customer',r), 'customer') || changed;
      changed = v58DedupeCollection('vendors', r=>v58BusinessKey('vendor',r), 'vendor') || changed;
      changed = v58DedupeCollection('invoices', r=>v58BusinessKey('invoice',r), 'invoice') || changed;
      changed = v58DedupeCollection('estimates', r=>v58BusinessKey('estimate',r), 'estimate') || changed;
      changed = v58DedupeCollection('bills', r=>v58BusinessKey('bill',r), 'bill') || changed;
      changed = v58DedupeCollection('expenses', r=>v58BusinessKey('expense',r), 'expense') || changed;
      changed = v58DedupeCollection('payments', r=>v58BusinessKey('payment',r), 'payment') || changed;
      changed = v58DedupeCollection('billPayments', r=>v58BusinessKey('billPayment',r), 'billPayment') || changed;
      const before=JSON.stringify({
        inv:(state.invoices||[]).map(i=>[i.id,i.status,i.paid,i.convertedEstimateId,i.estimateId]),
        est:(state.estimates||[]).map(e=>[e.id,e.status,e.convertedInvoiceId,e.linkedInvoiceId]),
        bills:(state.bills||[]).map(b=>[b.id,b.status,b.paid])
      });
      v58NormalizeInvoiceStatuses();
      v58NormalizeBillStatuses();
      v58NormalizeEstimateStatuses();
      const after=JSON.stringify({
        inv:(state.invoices||[]).map(i=>[i.id,i.status,i.paid,i.convertedEstimateId,i.estimateId]),
        est:(state.estimates||[]).map(e=>[e.id,e.status,e.convertedInvoiceId,e.linkedInvoiceId]),
        bills:(state.bills||[]).map(b=>[b.id,b.status,b.paid])
      });
      changed = changed || before!==after;
      try{
        if(typeof v52SelectedCustomers==='function') v52SelectedCustomers();
        if(typeof v53SelectedVendors==='function') v53SelectedVendors();
        if(typeof v25EnsureDashboardState==='function') v25EnsureDashboardState();
      }catch(e){}
    }catch(err){
      console.warn('V58 state reconciliation skipped', err);
    }finally{
      v58Runtime.reconciling=false;
    }
    return changed;
  }

  function v58InvalidateDynamicCaches(){
    try{ v47InvalidateSearch?.(); }catch(e){}
    try{ v45RouteCache?.clear?.(); }catch(e){}
    try{ v40PageCache?.clear?.(); }catch(e){}
  }

  function v58AfterRender(){
    try{ if(typeof applyDashboardPrefs==='function') applyDashboardPrefs(); }catch(e){}
    try{ if(typeof v26RestoreVisibleWidgetDisplays==='function') v26RestoreVisibleWidgetDisplays(); }catch(e){}
    try{ if(typeof v26HydrateEmptyWidgets==='function') v26HydrateEmptyWidgets(); }catch(e){}
    try{ if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(document.getElementById('page-'+currentPage) || document); }catch(e){}
  }

  function v58ScheduleRender(){
    if(v58Runtime.renderScheduled) return;
    v58Runtime.renderScheduled=true;
    const run=()=>{
      v58Runtime.renderScheduled=false;
      try{ renderAll(); }catch(err){ console.warn('V58 scheduled render failed', err); }
    };
    if(typeof requestAnimationFrame==='function') requestAnimationFrame(run);
    else setTimeout(run,0);
  }

  const v58SaveStateBase = saveState;
  saveState = function(){
    v58ReconcileData();
    return v58SaveStateBase.apply(this, arguments);
  };

  const v58RenderAllBase = renderAll;
  renderAll = function(){
    if(v58Runtime.rendering) return v58RenderAllBase.apply(this, arguments);
    v58Runtime.rendering=true;
    try{
      v58InjectStabilityStyles();
      v58ReconcileData();
      v58InvalidateDynamicCaches();
      const result=v58RenderAllBase.apply(this, arguments);
      v58AfterRender();
      return result;
    }finally{
      v58Runtime.rendering=false;
    }
  };

  const v58RenderSalesBase = renderSales;
  renderSales = function(){ v58ReconcileData(); return v58RenderSalesBase.apply(this, arguments); };
  const v58RenderCustomersBase = renderCustomers;
  renderCustomers = function(){ v58ReconcileData(); return v58RenderCustomersBase.apply(this, arguments); };
  const v58RenderVendorsBase = renderVendors;
  renderVendors = function(){ v58ReconcileData(); return v58RenderVendorsBase.apply(this, arguments); };
  const v58RenderDashboardBase = renderDashboard;
  renderDashboard = function(){ v58ReconcileData(); const r=v58RenderDashboardBase.apply(this, arguments); v58AfterRender(); return r; };

  function v58ActionLooksMutating(action){
    return /^(mark|pay|save|create|convert|delete|void|archive|customer-|vendor-|estimate-|invoice-|bill-|dashboard-|clear-|unclear-|review-|match-|refresh-|record-|post-|approve-|print|export|toggle|menu-|v56-refresh)/i.test(String(action||''));
  }
  const v58HandleActionBase = handleAction;
  handleAction = function(action,id){
    const key=String(action||'')+'|'+String(id||'');
    const now=(typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
    if(key===v58Runtime.lastActionKey && now-v58Runtime.lastActionAt<350) return;
    v58Runtime.lastActionKey=key;
    v58Runtime.lastActionAt=now;
    const result=v58HandleActionBase.apply(this, arguments);
    if(v58ActionLooksMutating(action)){
      try{ v58ReconcileData(); v58InvalidateDynamicCaches(); }catch(e){}
      if(!/^view-|^open-|tracking/i.test(String(action||''))) v58ScheduleRender();
    }
    return result;
  };

  function v58WorkflowLabel(type){
    return String(type||'workflow').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  }

  function v58InstallPlaceholderPrevention(){
    const baseOpenModal=openModal;
    openModal=function(type){
      const result=baseOpenModal.apply(this, arguments);
      try{
        const body=document.getElementById('modalBody');
        const footer=document.getElementById('modalFooter');
        const isPlaceholder=body && /not available yet|choose an available action|placeholder action/i.test(body.textContent||'');
        if(isPlaceholder){
          const original=String(type||'workflow');
          currentModal='workflowIntake:'+original;
          document.getElementById('modalTitle').textContent='New '+v58WorkflowLabel(original);
          document.getElementById('modalSubtitle').textContent='Capture the workflow record with usable accounting context instead of a placeholder.';
          body.innerHTML=`<div class="v58-workflow-intake">
            <div class="v58-sync-note">This form records the workflow request and keeps it visible in the audit/action log. Use the dedicated workflow page when more detail is needed.</div>
            <div class="form-grid">
              <div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div>
              <div class="field"><label>Status</label><select name="status"><option>Draft</option><option>Open</option><option>Ready for review</option><option>Completed</option></select></div>
              <div class="field"><label>Reference / name</label><input name="name" value="${escapeHTML(v58WorkflowLabel(original))}"></div>
              <div class="field"><label>Amount</label><input type="number" step="0.01" name="amount" value="0"></div>
              <div class="field full"><label>Notes</label><textarea name="notes" placeholder="Enter workflow details, contact, and next action."></textarea></div>
            </div>
          </div>`;
          if(footer) footer.innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save workflow</button>';
          document.getElementById('cancelModal')?.addEventListener('click', closeModal);
        }
      }catch(err){ console.warn('V58 placeholder prevention skipped', err); }
      return result;
    };
  }

  const v58SubmitModalBase = submitModal;
  submitModal = function(e){
    const s=String(currentModal||'');
    if(s.startsWith('workflowIntake:')){
      e.preventDefault();
      const d=Object.fromEntries(new FormData(e.target).entries());
      state.workflowItems ||= [];
      const type=s.split(':').slice(1).join(':') || 'workflow';
      const rec={id:uid('WF'), type, date:d.date||todayISO(), status:d.status||'Open', name:d.name||v58WorkflowLabel(type), amount:v58Money(d.amount), notes:d.notes||'', createdAt:new Date().toISOString()};
      state.workflowItems.unshift(rec);
      audit(`Workflow ${rec.id} saved: ${v58WorkflowLabel(type)}`);
      saveState(); closeModal(); renderAll(); showToast('Workflow record saved.');
      return;
    }
    const before=JSON.stringify({
      customers:(state.customers||[]).length,
      vendors:(state.vendors||[]).length,
      invoices:(state.invoices||[]).length,
      estimates:(state.estimates||[]).length,
      bills:(state.bills||[]).length,
      payments:(state.payments||[]).length
    });
    const result=v58SubmitModalBase.apply(this, arguments);
    try{
      v58ReconcileData();
      const after=JSON.stringify({
        customers:(state.customers||[]).length,
        vendors:(state.vendors||[]).length,
        invoices:(state.invoices||[]).length,
        estimates:(state.estimates||[]).length,
        bills:(state.bills||[]).length,
        payments:(state.payments||[]).length
      });
      if(before!==after || ['customizeDashboard','customize','manageMenu','manageBookmarks'].includes(s)){
        v58InvalidateDynamicCaches();
        v58ScheduleRender();
      }
    }catch(err){ console.warn('V58 submit reconciliation skipped', err); }
    return result;
  };

  function v58InstallSubmitRouter(){
    const form=document.getElementById('modalForm');
    if(!form || form.dataset.v58SubmitRouter==='1') return;
    form.dataset.v58SubmitRouter='1';
    form.addEventListener('submit', function(e){
      const s=String(currentModal||'');
      if(s==='customer' || s.startsWith('customerEdit:') || s==='vendor' || s.startsWith('vendorEdit:')){
        // V50 owns these master-data edit routes and already stops the old stale submit listener.
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      if(form.dataset.v58Submitting==='1') return;
      form.dataset.v58Submitting='1';
      try{ submitModal(e); }
      finally{ setTimeout(()=>{ form.dataset.v58Submitting='0'; }, 300); }
    }, true);
  }

  function v58InstallCoreClickRouter(){
    if(document.body.dataset.v58CoreClickRouter==='1') return;
    document.body.dataset.v58CoreClickRouter='1';
    document.addEventListener('click', function(e){
      const openCreate=e.target.closest?.('[data-open-create]');
      const action=e.target.closest?.('[data-action]');
      const modal=e.target.closest?.('[data-modal]');
      const nav=e.target.closest?.('[data-nav]');
      if(openCreate){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        toggleCreateMenu();
        return;
      }
      if(action){
        if(action.disabled || action.getAttribute('aria-disabled')==='true') return;
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        handleAction(action.dataset.action, action.dataset.id);
        document.getElementById('createMenu')?.classList.remove('open');
        return;
      }
      if(modal){
        if(modal.disabled || modal.getAttribute('aria-disabled')==='true') return;
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openModal(modal.dataset.modal);
        document.getElementById('createMenu')?.classList.remove('open');
        return;
      }
      if(nav){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        navigate(nav.dataset.nav);
        document.getElementById('createMenu')?.classList.remove('open');
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('mobileOverlay')?.classList.remove('open');
      }
    }, true);
  }

  function v58Install(){
    if(v58Runtime.installed) return;
    v58Runtime.installed=true;
    v58InjectStabilityStyles();
    v58InstallPlaceholderPrevention();
    v58InstallSubmitRouter();
    v58InstallCoreClickRouter();
    try{ v58ReconcileData(); saveState(); }catch(e){ console.warn('V58 initial reconciliation skipped', e); }
  }

  try{ v58Install(); }catch(e){ console.warn('V58 stability layer install skipped', e); }





  // ---------- V59: post-refactor audit fixes for persistence, natural dedupe, and status sync ----------
  // This layer keeps V58's central routing model, but tightens confirmed audit findings:
  // 1) persistence now saves through a guarded writer with a last-good backup.
  // 2) duplicate detection uses natural business keys where IDs differ because of duplicate submits.
  // 3) customer/vendor/invoice/estimate/bill references are rewired after dedupe.
  // 4) status reconciliation is dirty-gated to reduce menu/icon click latency.
  // 5) dashboard refresh and sidebar Manage styling are delegated after dynamic re-renders.
  const v59Runtime = {
    installed:false,
    dirty:true,
    lastReconcileAt:0,
    lastSavedAt:0,
    lastSaveError:null
  };

  function v59MarkDirty(){ v59Runtime.dirty=true; }
  function v59Clone(value){
    try{ return structuredClone(value); }
    catch(err){ return value===undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  }
  function v59Norm(v){ return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g,''); }
  function v59Text(v){ return String(v ?? '').trim(); }
  function v59Money(v){ const n=Number(v); return Number.isFinite(n) ? n : 0; }
  function v59Digits(v){ return String(v ?? '').replace(/\D+/g,''); }
  function v59Array(name){ if(!Array.isArray(state[name])) state[name]=[]; return state[name]; }
  function v59LineSignature(lines){
    return (Array.isArray(lines)?lines:[]).map(x=>[
      v59Norm(x.desc || x.description || x.name || x.item || x.productId),
      v59Money(x.qty ?? x.quantity),
      v59Money(x.rate ?? x.price),
      v59Money(x.amount)
    ].join(':')).join(';');
  }
  function v59RecordRichness(rec){
    if(!rec || typeof rec!=='object') return 0;
    return Object.values(rec).reduce((score,val)=>{
      if(Array.isArray(val)) return score + val.length * 2;
      if(val && typeof val==='object') return score + Object.keys(val).length;
      return score + (v59Text(val) ? 1 : 0);
    },0);
  }
  function v59ReferenceCount(id, fields){
    if(!id) return 0;
    let count=0;
    Object.values(state||{}).forEach(list=>{
      if(!Array.isArray(list)) return;
      list.forEach(rec=>{
        if(!rec || typeof rec!=='object') return;
        fields.forEach(f=>{ if(String(rec[f]||'')===String(id)) count++; });
      });
    });
    return count;
  }
  function v59MergeRecord(base, incoming, type){
    if(!base || !incoming || base===incoming) return base || incoming;
    Object.keys(incoming).forEach(k=>{
      const next=incoming[k], cur=base[k];
      if(k==='status'){
        base[k]=typeof v58StrongestStatus==='function' ? v58StrongestStatus(cur,next,type) : (cur || next);
      }else if(Array.isArray(next)){
        if(!Array.isArray(cur) || cur.length===0) base[k]=v59Clone(next);
      }else if(next && typeof next==='object'){
        if(!cur || typeof cur!=='object') base[k]=v59Clone(next);
      }else if((cur===undefined || cur===null || String(cur).trim()==='') && !(next===undefined || next===null || String(next).trim()==='')){
        base[k]=next;
      }else if(['paid','subtotal','tax','total','amount','balance','openingBalance'].includes(k) && v59Money(cur)===0 && v59Money(next)!==0){
        base[k]=next;
      }
    });
    return base;
  }

  function v59CustomerKey(c){
    const email=v59Norm(c?.email);
    if(email) return 'email:'+email;
    const name=v59Norm(c?.name || c?.company);
    const phone=v59Digits(c?.phone);
    if(name && phone) return 'name-phone:'+name+'|'+phone;
    const company=v59Norm(c?.company);
    if(name && company) return 'name-company:'+name+'|'+company;
    return '';
  }
  function v59VendorKey(v){
    const email=v59Norm(v?.email);
    if(email) return 'email:'+email;
    const name=v59Norm(v?.name || v?.company);
    const phone=v59Digits(v?.phone);
    if(name && phone) return 'name-phone:'+name+'|'+phone;
    const category=v59Norm(v?.category || v?.type);
    if(name && category) return 'name-category:'+name+'|'+category;
    return name ? 'name:'+name : '';
  }
  function v59InvoiceKey(inv){
    const explicit=v59Norm(inv?.invoiceNo || inv?.invoiceNumber || inv?.number);
    if(explicit) return 'no:'+explicit;
    const total=(typeof invoiceTotal==='function') ? invoiceTotal(inv) : v59Money(inv?.subtotal)+v59Money(inv?.tax);
    const lines=v59LineSignature(inv?.items || inv?.lines);
    if(inv?.customerId && inv?.date && total && lines) return ['sig',inv.customerId,inv.date,inv.dueDate||'',total.toFixed(2),lines].map(v59Norm).join('|');
    return '';
  }
  function v59EstimateKey(e){
    const explicit=v59Norm(e?.estimateNumber || e?.estimateNo || e?.number || e?.no);
    if(explicit) return 'no:'+explicit;
    const total=(typeof estimateAmount==='function') ? estimateAmount(e) : v59Money(e?.total || e?.subtotal);
    const lines=v59LineSignature(e?.items || e?.lines);
    if(e?.customerId && e?.date && total) return ['sig',e.customerId,e.date,e.expiryDate||e.dueDate||'',total.toFixed(2),lines].map(v59Norm).join('|');
    return '';
  }
  function v59BillKey(b){
    const explicit=v59Norm(b?.billNo || b?.billNumber || b?.number);
    if(explicit) return 'no:'+explicit;
    const total=(typeof billTotal==='function') ? billTotal(b) : v59Money(b?.amount)+v59Money(b?.tax);
    if(b?.vendorId && (b?.date || b?.dueDate) && total) return ['sig',b.vendorId,b.date||'',b.dueDate||'',total.toFixed(2),v59Norm(b?.memo||'')].join('|');
    return '';
  }
  function v59ExpenseKey(e){
    const total=(typeof expenseTotal==='function') ? expenseTotal(e) : v59Money(e?.amount)+v59Money(e?.tax);
    if(e?.vendorId && e?.date && total) return ['sig',e.vendorId,e.date,total.toFixed(2),v59Norm(e?.memo||''),v59Norm(e?.bankAccountId||'')].join('|');
    return '';
  }

  function v59ChooseKeeper(a,b,refFields){
    const aRefs=v59ReferenceCount(a?.id, refFields);
    const bRefs=v59ReferenceCount(b?.id, refFields);
    if(bRefs>aRefs) return b;
    if(aRefs>bRefs) return a;
    return v59RecordRichness(b)>v59RecordRichness(a) ? b : a;
  }
  function v59DedupeByNaturalKey(name, keyFn, type, refFields=[]){
    const list=v59Array(name);
    const seen=new Map();
    const out=[];
    const idMap=new Map();
    let changed=false;
    list.forEach(rec=>{
      const key=keyFn(rec);
      if(!key){ out.push(rec); return; }
      const existing=seen.get(key);
      if(!existing){
        seen.set(key,rec);
        out.push(rec);
        return;
      }
      const keeper=v59ChooseKeeper(existing,rec,refFields);
      const drop=keeper===existing ? rec : existing;
      v59MergeRecord(keeper, drop, type);
      seen.set(key,keeper);
      if(keeper!==existing){
        const idx=out.indexOf(existing);
        if(idx>=0) out[idx]=keeper;
      }
      if(drop?.id && keeper?.id && drop.id!==keeper.id) idMap.set(String(drop.id), String(keeper.id));
      changed=true;
    });
    if(changed) state[name]=out;
    return {changed,idMap};
  }
  function v59RewriteReferences(idMap, fields){
    if(!idMap || idMap.size===0) return false;
    let changed=false;
    Object.values(state||{}).forEach(list=>{
      if(!Array.isArray(list)) return;
      list.forEach(rec=>{
        if(!rec || typeof rec!=='object') return;
        fields.forEach(field=>{
          const value=String(rec[field]||'');
          if(idMap.has(value)){
            rec[field]=idMap.get(value);
            changed=true;
          }
        });
      });
    });
    return changed;
  }

  function v59ReconcileNaturalDuplicates(){
    let changed=false;
    const customer=v59DedupeByNaturalKey('customers', v59CustomerKey, 'customer', ['customerId','clientId','billToCustomerId','shipToCustomerId']);
    changed = customer.changed || v59RewriteReferences(customer.idMap, ['customerId','clientId','billToCustomerId','shipToCustomerId']) || changed;
    const vendor=v59DedupeByNaturalKey('vendors', v59VendorKey, 'vendor', ['vendorId','supplierId']);
    changed = vendor.changed || v59RewriteReferences(vendor.idMap, ['vendorId','supplierId']) || changed;
    const invoice=v59DedupeByNaturalKey('invoices', v59InvoiceKey, 'invoice', ['invoiceId','matchedInvoiceId','linkedInvoiceId','convertedInvoiceId']);
    changed = invoice.changed || v59RewriteReferences(invoice.idMap, ['invoiceId','matchedInvoiceId','linkedInvoiceId','convertedInvoiceId']) || changed;
    const estimate=v59DedupeByNaturalKey('estimates', v59EstimateKey, 'estimate', ['estimateId','sourceEstimateId','convertedFromEstimateId']);
    changed = estimate.changed || v59RewriteReferences(estimate.idMap, ['estimateId','sourceEstimateId','convertedFromEstimateId']) || changed;
    const bill=v59DedupeByNaturalKey('bills', v59BillKey, 'bill', ['billId','matchedBillId']);
    changed = bill.changed || v59RewriteReferences(bill.idMap, ['billId','matchedBillId']) || changed;
    changed = v59DedupeByNaturalKey('expenses', v59ExpenseKey, 'expense', []).changed || changed;
    return changed;
  }

  function v59InvoiceOpen(inv){
    const total=(typeof invoiceTotal==='function') ? invoiceTotal(inv) : v59Money(inv?.subtotal)+v59Money(inv?.tax);
    return Math.max(0, total - v59Money(inv?.paid));
  }
  function v59BillOpen(bill){
    const total=(typeof billTotal==='function') ? billTotal(bill) : v59Money(bill?.amount)+v59Money(bill?.tax);
    return Math.max(0, total - v59Money(bill?.paid));
  }
  function v59PaymentTotals(collectionName, linkField){
    const map=new Map();
    (state[collectionName]||[]).forEach(p=>{
      const id=String(p?.[linkField]||'').trim();
      if(id) map.set(id,(map.get(id)||0)+v59Money(p.amount));
    });
    return map;
  }
  function v59NormalizeLiveStatuses(){
    const today=todayISO();
    const paidByInvoice=v59PaymentTotals('payments','invoiceId');
    (state.invoices||[]).forEach(inv=>{
      const paid=Math.max(v59Money(inv.paid), paidByInvoice.get(inv.id)||0);
      if(Math.abs(paid-v59Money(inv.paid))>0.01) inv.paid=paid;
      const open=v59InvoiceOpen(inv);
      const raw=String(inv.status||'').trim().toLowerCase();
      if(['void','voided'].includes(raw)) return;
      if(open<=0.01) inv.status='Paid';
      else if(paid>0.01) inv.status='Partially Paid';
      else if(inv.dueDate && inv.dueDate < today && raw!=='draft') inv.status='Overdue';
      else if(raw==='draft') inv.status='Draft';
      else inv.status=inv.status || 'Sent';
    });
    const paidByBill=v59PaymentTotals('billPayments','billId');
    (state.bills||[]).forEach(bill=>{
      const paid=Math.max(v59Money(bill.paid), paidByBill.get(bill.id)||0);
      if(Math.abs(paid-v59Money(bill.paid))>0.01) bill.paid=paid;
      const open=v59BillOpen(bill);
      const raw=String(bill.status||'').trim().toLowerCase();
      if(['void','voided'].includes(raw)) return;
      if(open<=0.01) bill.status='Paid';
      else if(paid>0.01) bill.status='Partially Paid';
      else if(bill.dueDate && bill.dueDate < today && raw!=='draft') bill.status='Overdue';
      else if(raw==='draft') bill.status='Draft';
      else bill.status=bill.status || 'Open';
    });
  }
  function v59FindInvoiceForEstimate(e){
    if(!e) return null;
    const ids=[e.convertedInvoiceId,e.linkedInvoiceId,e.invoiceId].map(v=>String(v||'').trim()).filter(Boolean);
    if(ids.length){
      const direct=(state.invoices||[]).find(inv=>ids.includes(String(inv.id||'')) || ids.includes(String(inv.invoiceNo||'')) || ids.includes(String(inv.number||'')));
      if(direct) return direct;
    }
    const estIds=[e.id,e.estimateNumber,e.estimateNo,e.number,e.no].map(v=>String(v||'').trim()).filter(Boolean);
    return (state.invoices||[]).find(inv=>{
      const refs=[inv.sourceEstimateId, inv.estimateId, inv.convertedFromEstimateId, inv.convertedEstimateId, inv.estimateNumber, inv.sourceEstimateNo, inv.sourceEstimateNumber].map(v=>String(v||'').trim()).filter(Boolean);
      return refs.some(r=>estIds.includes(r));
    }) || null;
  }
  function v59ReconcileEstimateInvoiceLinks(){
    let changed=false;
    (state.estimates||[]).forEach(e=>{
      const inv=v59FindInvoiceForEstimate(e);
      if(inv?.id){
        if(e.status!=='Converted'){ e.status='Converted'; changed=true; }
        if(e.convertedInvoiceId!==inv.id){ e.convertedInvoiceId=inv.id; changed=true; }
        if(e.linkedInvoiceId!==inv.id){ e.linkedInvoiceId=inv.id; changed=true; }
        if(!inv.sourceEstimateId && e.id){ inv.sourceEstimateId=e.id; changed=true; }
      }
    });
    return changed;
  }

  const v59V58ReconcileBase = (typeof v58ReconcileData==='function') ? v58ReconcileData : function(){ return false; };
  v58ReconcileData = function(force=false){
    const now=(typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
    if(!force && !v59Runtime.dirty && now-v59Runtime.lastReconcileAt<900) return false;
    let changed=false;
    try{ changed = !!v59V58ReconcileBase(); }catch(err){ console.warn('V59 base reconciliation skipped', err); }
    try{ changed = v59ReconcileNaturalDuplicates() || changed; }catch(err){ console.warn('V59 natural duplicate reconciliation skipped', err); }
    try{ v59NormalizeLiveStatuses(); }catch(err){ console.warn('V59 live status reconciliation skipped', err); }
    try{ changed = v59ReconcileEstimateInvoiceLinks() || changed; }catch(err){ console.warn('V59 estimate/invoice link reconciliation skipped', err); }
    v59Runtime.dirty=false;
    v59Runtime.lastReconcileAt=now;
    return changed;
  };

  function v59SafeLocalStorageSave(){
    try{
      v59Runtime.dirty=true;
      v58ReconcileData(true);
      const persistence = window.SmartBooksPersistence;
      const result = persistence
        ? persistence.save(state, { key:STORE_KEY, backupKey:STORE_KEY+'_v59_last_good' })
        : { ok:true, payload:JSON.stringify(state) };
      if(!persistence){
        localStorage.setItem(STORE_KEY, result.payload);
        try{ localStorage.setItem(STORE_KEY+'_v59_last_good', result.payload); }catch(backupErr){ console.warn('V59 backup save skipped', backupErr); }
      }
      if(!result.ok) throw result.error;
      v59Runtime.lastSavedAt=Date.now();
      v59Runtime.lastSaveError=null;
      return true;
    }catch(err){
      v59Runtime.lastSaveError=err;
      console.warn('V59 localStorage save failed', err);
      try{
        if(window.SmartBooksPersistence) window.SmartBooksPersistence.saveSessionCopy(state, { key:STORE_KEY+'_v59_unsaved_session_copy' });
        else sessionStorage.setItem(STORE_KEY+'_v59_unsaved_session_copy', JSON.stringify(state));
      }catch(sessionErr){}
      try{ showToast('Save warning: browser storage did not accept the latest update. Export a backup.'); }catch(toastErr){}
      return false;
    }
  }
  saveState = function(){ return v59SafeLocalStorageSave(); };

  function v59InvalidateViews(){
    try{ v47InvalidateSearch?.(); }catch(e){}
    try{ v45RouteCache?.clear?.(); }catch(e){}
    try{ v40PageCache?.clear?.(); }catch(e){}
    try{ v41InvalidateDashboardCache?.(); }catch(e){}
  }
  function v59NormalizeManageButtons(){
    try{
      document.querySelectorAll('.side-title button, .side-title .link-btn').forEach(btn=>{
        btn.classList.add('link-btn');
        btn.type='button';
        btn.removeAttribute('style');
      });
    }catch(err){}
  }
  function v59InjectAuditStyles(){
    if(document.getElementById('v59-audit-fix-styles')) return;
    const style=document.createElement('style');
    style.id='v59-audit-fix-styles';
    style.textContent=`
      body.v8-ui .side-title button.link-btn,
      body.v8-ui .side-title .link-btn,
      .side-title button.link-btn,
      .side-title .link-btn{
        appearance:none!important;-webkit-appearance:none!important;border:0!important;background:transparent!important;
        color:inherit!important;font:inherit!important;font-size:12px!important;font-weight:800!important;text-transform:none!important;
        letter-spacing:0!important;line-height:1.2!important;padding:2px 4px!important;margin:0!important;border-radius:8px!important;
        width:auto!important;height:auto!important;min-height:0!important;box-shadow:none!important;opacity:.78!important;cursor:pointer!important;
      }
      body.v8-ui .side-title button.link-btn:hover,
      body.v8-ui .side-title button.link-btn:focus-visible,
      .side-title button.link-btn:hover,
      .side-title button.link-btn:focus-visible{background:rgba(10,143,60,.12)!important;color:var(--green)!important;opacity:1!important;outline:0!important}
      body.v8-ui .v59-save-warning{border:1px solid #fedf89;background:#fffaeb;color:#7a4b00;border-radius:14px;padding:10px 12px;margin:0 0 12px;font-weight:800;font-size:12px}
      body.v8-ui.dark-mode .v59-save-warning{background:#2b210d;border-color:#7a5b11;color:#ffd37a}
    `;
    document.head.appendChild(style);
  }

  const v59HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(typeof v58ActionLooksMutating==='function' ? v58ActionLooksMutating(action) : /^(mark|pay|save|create|convert|delete|void|archive|customer-|vendor-|estimate-|invoice-|bill-|dashboard-|clear-|unclear-|review-|match-|refresh-|record-|post-|approve|toggle|menu-)/i.test(String(action||''))){
      v59MarkDirty();
    }
    const result=v59HandleActionBase.apply(this, arguments);
    if(v59Runtime.dirty){
      try{ v58ReconcileData(true); v59InvalidateViews(); }catch(err){}
    }
    return result;
  };

  const v59SubmitModalBase = submitModal;
  submitModal = function(e){
    v59MarkDirty();
    const result=v59SubmitModalBase.apply(this, arguments);
    try{ v58ReconcileData(true); v59InvalidateViews(); }catch(err){}
    return result;
  };

  const v59RenderAllBase = renderAll;
  renderAll = function(){
    const result=v59RenderAllBase.apply(this, arguments);
    v59NormalizeManageButtons();
    return result;
  };
  const v59RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    v58ReconcileData(false);
    const result=v59RenderDashboardBase.apply(this, arguments);
    try{ applyDashboardPrefs?.(); }catch(err){}
    return result;
  };
  const v59RenderMenuBase = renderMenu;
  renderMenu = function(){
    const result=v59RenderMenuBase.apply(this, arguments);
    v59NormalizeManageButtons();
    return result;
  };

  function v59InstallDirectDelegates(){
    if(document.body.dataset.v59Delegates==='1') return;
    document.body.dataset.v59Delegates='1';
    document.addEventListener('click', function(e){
      const refresh=e.target.closest?.('#dashboardRefresh');
      if(refresh){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        v59MarkDirty();
        try{ v58ReconcileData(true); v59InvalidateViews(); renderDashboard(); showToast('Dashboard refreshed.'); }catch(err){ console.warn('V59 dashboard refresh failed', err); }
      }
    }, true);
  }

  function v59InstallPlaceholderHardening(){
    const baseOpenModal=openModal;
    openModal=function(type){
      const result=baseOpenModal.apply(this, arguments);
      try{
        const body=document.getElementById('modalBody');
        if(!body) return result;
        const text=(body.textContent||'').toLowerCase();
        const hasRealForm=!!body.querySelector('input,select,textarea,[data-action],[data-modal]');
        if(!hasRealForm && /(not available yet|choose an available action|placeholder action|available for setup|ready for setup)/i.test(text)){
          currentModal='workflowIntake:'+String(type||'workflow');
          document.getElementById('modalTitle').textContent='New '+v58WorkflowLabel(type||'workflow');
          document.getElementById('modalSubtitle').textContent='Capture the workflow request with usable accounting context.';
          body.innerHTML=`<div class="v58-workflow-intake">
            <div class="v58-sync-note">V59 replaced a placeholder with a usable workflow intake form so the save action creates a real record.</div>
            <div class="form-grid">
              <div class="field"><label>Date</label><input type="date" name="date" value="${todayISO()}"></div>
              <div class="field"><label>Status</label><select name="status"><option>Open</option><option>Draft</option><option>Ready for review</option><option>Completed</option></select></div>
              <div class="field"><label>Reference / name</label><input name="name" value="${escapeHTML(v58WorkflowLabel(type||'workflow'))}"></div>
              <div class="field"><label>Amount</label><input type="number" step="0.01" name="amount" value="0"></div>
              <div class="field full"><label>Notes</label><textarea name="notes" placeholder="Enter workflow details, contact, and next action."></textarea></div>
            </div>
          </div>`;
          const footer=document.getElementById('modalFooter');
          if(footer) footer.innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save workflow</button>';
          document.getElementById('cancelModal')?.addEventListener('click', closeModal);
        }
      }catch(err){ console.warn('V59 placeholder hardening skipped', err); }
      return result;
    };
  }

  function v59Install(){
    if(v59Runtime.installed) return;
    v59Runtime.installed=true;
    v59InjectAuditStyles();
    v59InstallDirectDelegates();
    v59InstallPlaceholderHardening();
    try{ v58ReconcileData(true); v59InvalidateViews(); v59NormalizeManageButtons(); saveState(); }catch(err){ console.warn('V59 install reconciliation skipped', err); }
  }

  try{ v59Install(); }catch(e){ console.warn('V59 audit-fix layer install skipped', e); }





  // ---------- V60: silent automated sync UI cleanup ----------
  // Sync/reconciliation remains active, but developer/debug banners are removed
  // from the user interface. Users should see clean Estimates pages; data sync
  // runs on load, save, edit, conversion, and render without a manual button.
  const v60Runtime = { installed:false, lastSilentSyncAt:0 };

  function v60InjectSilentSyncStyles(){
    if(document.getElementById('v60-silent-sync-styles')) return;
    const style=document.createElement('style');
    style.id='v60-silent-sync-styles';
    style.textContent=`
      body.v8-ui .v54-sync-note,
      body.v8-ui .v55-reconciled-note,
      .v54-sync-note,
      .v55-reconciled-note{
        display:none!important;
        visibility:hidden!important;
        height:0!important;
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        overflow:hidden!important;
      }
      body.v8-ui [data-action="estimate-sync-refresh"],
      [data-action="estimate-sync-refresh"]{display:none!important;}
    `;
    document.head.appendChild(style);
  }

  function v60RunSilentSync(force=false){
    const now=(typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
    if(!force && now-v60Runtime.lastSilentSyncAt<250) return false;
    v60Runtime.lastSilentSyncAt=now;
    let changed=false;
    try{ changed = (typeof v58ReconcileData==='function' ? !!v58ReconcileData(!!force) : false) || changed; }catch(err){ console.warn('V60 silent data reconciliation skipped', err); }
    try{ changed = (typeof v54ReconcileConvertedEstimates==='function' ? !!v54ReconcileConvertedEstimates(true) : false) || changed; }catch(err){ console.warn('V60 silent estimate reconciliation skipped', err); }
    try{ if(changed){ v47InvalidateSearch?.(); v49InvalidateDynamicViews?.(); v41InvalidateDashboardCache?.(); } }catch(err){}
    return changed;
  }

  function v60CleanSyncHTML(html){
    return String(html || '')
      .replace(/<div\s+class=["']v55-reconciled-note["'][\s\S]*?<\/div>\s*/gi,'')
      .replace(/<div\s+class=["']v54-sync-note["'][\s\S]*?<\/div>\s*/gi,'')
      .replace(/<button\s+class=["']btn["']\s+data-action=["']estimate-sync-refresh["'][\s\S]*?<\/button>/gi,'');
  }

  function v60RemoveVisibleSyncChrome(){
    try{
      document.querySelectorAll('.v55-reconciled-note,.v54-sync-note').forEach(el=>el.remove());
      document.querySelectorAll('[data-action="estimate-sync-refresh"]').forEach(btn=>{
        const note=btn.closest('.v54-sync-note');
        if(note) note.remove(); else btn.remove();
      });
      document.querySelectorAll('.v58-sync-note').forEach(note=>{
        const txt=String(note.textContent||'');
        if(/V59 replaced|placeholder/i.test(txt)){
          note.textContent='This workflow request will be saved as an actionable record for follow-up.';
        }
      });
    }catch(err){}
  }

  const v60RenderEstimateHubBase = (typeof renderEstimateHub==='function') ? renderEstimateHub : null;
  if(v60RenderEstimateHubBase){
    renderEstimateHub = function(){
      try{ v60RunSilentSync(true); }catch(err){}
      return v60CleanSyncHTML(v60RenderEstimateHubBase.apply(this, arguments));
    };
  }

  if(typeof v49EstimateCustomerActivityHTML==='function'){
    const v60CustomerActivityBase = v49EstimateCustomerActivityHTML;
    v49EstimateCustomerActivityHTML = function(){
      try{ v60RunSilentSync(false); }catch(err){}
      const html=v60CustomerActivityBase.apply(this, arguments);
      return String(html||'').replace('Status and actions use the same reconciliation as the main Estimates table.','Status and actions stay aligned with the main Estimates table.');
    };
  }

  const v60HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(String(action||'')==='estimate-sync-refresh'){
      try{ v60RunSilentSync(true); v60RemoveVisibleSyncChrome(); renderAll(); }catch(err){ console.warn('V60 silent sync refresh skipped', err); }
      return;
    }
    const result=v60HandleActionBase.apply(this, arguments);
    if(/^(mark-estimate|convert-estimate|edit-estimate|invoice-|estimate-|customer-|vendor-|pay|save|create|delete|void|record-)/i.test(String(action||''))){
      try{ v60RunSilentSync(true); }catch(err){}
    }
    try{ v60RemoveVisibleSyncChrome(); }catch(err){}
    return result;
  };

  const v60SubmitModalBase = submitModal;
  submitModal = function(){
    const result=v60SubmitModalBase.apply(this, arguments);
    try{ v60RunSilentSync(true); v60RemoveVisibleSyncChrome(); }catch(err){}
    return result;
  };

  const v60OpenModalBase = openModal;
  openModal = function(){
    const result=v60OpenModalBase.apply(this, arguments);
    try{ v60RemoveVisibleSyncChrome(); }catch(err){}
    return result;
  };

  const v60RenderAllBase = renderAll;
  renderAll = function(){
    try{ v60RunSilentSync(false); }catch(err){}
    const result=v60RenderAllBase.apply(this, arguments);
    try{ v60RemoveVisibleSyncChrome(); }catch(err){}
    return result;
  };

  const v60RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    try{ v60RunSilentSync(false); }catch(err){}
    const result=v60RenderDashboardBase.apply(this, arguments);
    try{ v60RemoveVisibleSyncChrome(); }catch(err){}
    return result;
  };

  function v60InstallSilentSync(){
    if(v60Runtime.installed) return;
    v60Runtime.installed=true;
    try{ document.title='SmartBooks Accounting App V61'; }catch(err){}
    v60InjectSilentSyncStyles();
    try{ v60RunSilentSync(true); }catch(err){}
    try{ v60RemoveVisibleSyncChrome(); }catch(err){}
  }

  try{ v60InstallSilentSync(); }catch(e){ console.warn('V60 silent sync install skipped', e); }


  // ---------- V61 recovery: non-invasive backend-ready data layer ----------
  // Recovery note: the first V61 attempt wrapped core render/save/action paths too aggressively.
  // This version keeps the proven V60 runtime intact and exposes a safe data/service layer
  // for future Flask/PostgreSQL integration without changing normal page rendering.
  (function installV61SafeDataLayer(){
    if(window.__smartbooksV61SafeLayerInstalled) return;
    window.__smartbooksV61SafeLayerInstalled = true;

    const VERSION = 'V61';
    const ARCH = 'backend-ready-local-data-layer';
    const runtime = {
      version: VERSION,
      architecture: ARCH,
      installedAt: new Date().toISOString(),
      mode: 'local',
      stats: { events:0, reads:0, writes:0, backups:0, reconciles:0 },
      lastError: null
    };

    function safeWarn(label, err){
      runtime.lastError = { label, message: String(err && err.message || err), at: new Date().toISOString() };
      try{ console.warn(label, err); }catch(e){}
    }
    function canUseState(){ return typeof state === 'object' && state !== null; }
    function clone(value){
      try{ return (typeof structuredClone === 'function') ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
      catch(e){ return value; }
    }
    function text(v){ return String(v ?? '').trim(); }
    function norm(v){ return text(v).toLowerCase().replace(/&amp;/g,'&').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' '); }
    function money(v){ const n = Number(v); return Number.isFinite(n) ? Math.round(n*100)/100 : 0; }
    function todaySafe(){ try{ return todayISO(); }catch(e){ return new Date().toISOString().slice(0,10); } }
    function collection(name){
      if(!canUseState()) return [];
      if(!Array.isArray(state[name])) state[name] = [];
      return state[name];
    }
    function saveExisting(){
      try{
        if(typeof saveState === 'function'){
          saveState();
          runtime.stats.writes++;
          return true;
        }
      }catch(err){ safeWarn('V61 safe data save failed', err); }
      return false;
    }
    function silentReconcile(force){
      runtime.stats.reconciles++;
      let changed = false;
      try{ if(typeof v60RunSilentSync === 'function') changed = !!v60RunSilentSync(!!force) || changed; }catch(err){ safeWarn('V61 safe v60 sync skipped', err); }
      try{ if(typeof v58ReconcileData === 'function') changed = !!v58ReconcileData(!!force) || changed; }catch(err){ safeWarn('V61 safe legacy reconcile skipped', err); }
      return changed;
    }
    function recordIdPrefix(name){ return String(name || 'rec').slice(0,3).toUpperCase(); }
    function newId(name){
      try{ return uid(recordIdPrefix(name)); }catch(e){ return recordIdPrefix(name)+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7); }
    }
    function keyFor(name, rec){
      if(!rec || typeof rec !== 'object') return '';
      if(['invoices','estimates','bills'].includes(name)){
        const no = norm(rec.number || rec.no || rec.invoiceNo || rec.invoiceNumber || rec.estimateNo || rec.estimateNumber || rec.billNo || rec.billNumber);
        if(no) return 'no:'+no;
      }
      if(name === 'customers' || name === 'vendors'){
        const email = norm(rec.email);
        if(email) return 'email:'+email;
        const phone = text(rec.phone).replace(/\D+/g,'');
        const nm = norm(rec.name || rec.company || rec.displayName || rec.contactName);
        if(nm && phone) return 'name-phone:'+nm+'|'+phone;
      }
      if(rec.id) return 'id:'+String(rec.id);
      return '';
    }
    function mergeRecord(target, incoming){
      if(!target || !incoming) return target || incoming;
      Object.keys(incoming).forEach(k => {
        if(k === 'id') return;
        const cur = target[k], next = incoming[k];
        if(Array.isArray(next)){
          if(!Array.isArray(cur) || !cur.length) target[k] = clone(next);
        }else if(next && typeof next === 'object'){
          if(!cur || typeof cur !== 'object') target[k] = clone(next);
          else target[k] = Object.assign({}, cur, next);
        }else if((cur === undefined || cur === null || cur === '') && next !== undefined && next !== null && next !== ''){
          target[k] = next;
        }else if(k === 'status' && next){
          try{ target[k] = (typeof v58StrongestStatus === 'function') ? v58StrongestStatus(cur, next, '') : (cur || next); }
          catch(e){ target[k] = cur || next; }
        }
      });
      target.updatedAt = new Date().toISOString();
      return target;
    }
    function find(name, id){ return collection(name).find(x => String(x && x.id) === String(id)); }
    function findByKey(name, rec){
      const key = keyFor(name, rec);
      if(!key) return null;
      return collection(name).find(x => keyFor(name, x) === key);
    }

    const Events = (() => {
      const listeners = new Map();
      function on(name, fn){
        if(typeof fn !== 'function') return function(){};
        const key = String(name || '*');
        if(!listeners.has(key)) listeners.set(key, new Set());
        listeners.get(key).add(fn);
        return () => listeners.get(key)?.delete(fn);
      }
      function emit(name, payload){
        runtime.stats.events++;
        const event = { name:String(name||''), payload:payload || {}, at:new Date().toISOString() };
        [listeners.get(event.name), listeners.get('*')].forEach(set => set && set.forEach(fn => { try{ fn(event); }catch(err){ safeWarn('V61 event listener failed', err); } }));
        return event;
      }
      return { on, emit, listeners };
    })();

    const Status = {
      invoice(inv){
        if(!inv) return 'Draft';
        const raw = text(inv.status).toLowerCase();
        if(['void','voided','cancelled','canceled'].includes(raw)) return inv.status || 'Void';
        let total = money(inv.total);
        try{ if(typeof invoiceTotal === 'function') total = money(invoiceTotal(inv)); }catch(e){}
        if(!total) total = money(inv.subtotal) + money(inv.tax);
        const paid = money(inv.paid);
        if(total > 0 && paid >= total - 0.01) return 'Paid';
        if(paid > 0) return 'Partially Paid';
        if(raw === 'draft') return 'Draft';
        if(inv.dueDate && String(inv.dueDate).slice(0,10) < todaySafe()) return 'Overdue';
        return inv.status || 'Sent';
      },
      estimate(est){
        if(!est) return 'Draft';
        const raw = text(est.status).toLowerCase();
        if(['converted','rejected','declined','expired'].includes(raw)) return est.status || 'Converted';
        try{
          const id = String(est.id || '');
          const found = collection('invoices').some(inv => [inv.estimateId, inv.sourceEstimateId, inv.convertedFromEstimateId].map(String).includes(id));
          if(found) return 'Converted';
        }catch(e){}
        if(['accepted','approved'].includes(raw)) return 'Accepted';
        if(['sent','viewed'].includes(raw)) return est.status || 'Sent';
        return est.status || 'Draft';
      },
      bill(bill){
        if(!bill) return 'Open';
        const raw = text(bill.status).toLowerCase();
        if(['void','voided','cancelled','canceled'].includes(raw)) return bill.status || 'Void';
        let total = money(bill.total) || money(bill.amount) + money(bill.tax);
        try{ if(typeof billTotal === 'function') total = money(billTotal(bill)); }catch(e){}
        const paid = money(bill.paid);
        if(total > 0 && paid >= total - 0.01) return 'Paid';
        if(paid > 0) return 'Partially Paid';
        if(bill.dueDate && String(bill.dueDate).slice(0,10) < todaySafe()) return 'Overdue';
        return bill.status || 'Open';
      },
      customer(c){ return text(c && c.status) || (c && c.inactive ? 'Inactive' : 'Active'); },
      vendor(v){ return text(v && v.status) || (v && v.inactive ? 'Inactive' : 'Active'); }
    };

    const Storage = {
      key: (typeof STORE_KEY !== 'undefined') ? STORE_KEY : 'smartbooks_state',
      get mode(){ return window.SmartBooksPersistence?.mode || 'local'; },
      set mode(value){ window.SmartBooksPersistence?.configure?.({ mode:value }); },
      getState(){ return canUseState() ? state : null; },
      export(){ return window.SmartBooksPersistence ? window.SmartBooksPersistence.exportState(canUseState() ? state : {}) : clone(canUseState() ? state : {}); },
      save(){ return saveExisting(); },
      backup(label){
        if(!canUseState()) return false;
        try{
          const suffix = label ? String(label).replace(/[^a-z0-9_-]/gi,'_') : 'manual';
          if(window.SmartBooksPersistence){
            const result = window.SmartBooksPersistence.backup(state, 'v61_' + suffix, { key:this.key });
            if(!result.ok) throw result.error;
          }else{
            localStorage.setItem(this.key + '_v61_' + suffix + '_backup', JSON.stringify(state));
          }
          runtime.stats.backups++;
          return true;
        }catch(err){ safeWarn('V61 backup failed', err); return false; }
      }
    };

    const Data = {
      list(name){ runtime.stats.reads++; return clone(collection(name)); },
      get(name, id){ runtime.stats.reads++; return clone(find(name, id)); },
      create(name, data, options={}){
        const arr = collection(name);
        const rec = Object.assign({}, data || {});
        const existing = findByKey(name, rec);
        if(existing){ mergeRecord(existing, rec); Events.emit('data:merged', { collection:name, id:existing.id }); }
        else { rec.id = rec.id || newId(name); rec.createdAt = rec.createdAt || new Date().toISOString(); rec.updatedAt = rec.updatedAt || rec.createdAt; arr.unshift(rec); Events.emit('data:created', { collection:name, id:rec.id }); }
        if(options.reconcile !== false) silentReconcile(true);
        if(options.save !== false) saveExisting();
        if(options.render && typeof renderAll === 'function') { try{ renderAll(); }catch(err){ safeWarn('V61 render after create failed', err); } }
        return clone(existing || rec);
      },
      update(name, id, data, options={}){
        const rec = find(name, id) || findByKey(name, data) || { id:id || newId(name) };
        if(!find(name, rec.id)) collection(name).unshift(rec);
        mergeRecord(rec, Object.assign({}, data || {}, { id:rec.id }));
        Events.emit('data:updated', { collection:name, id:rec.id });
        if(options.reconcile !== false) silentReconcile(true);
        if(options.save !== false) saveExisting();
        if(options.render && typeof renderAll === 'function') { try{ renderAll(); }catch(err){ safeWarn('V61 render after update failed', err); } }
        return clone(rec);
      },
      remove(name, id, options={}){
        const arr = collection(name);
        const before = arr.length;
        state[name] = arr.filter(x => String(x && x.id) !== String(id));
        const changed = before !== state[name].length;
        if(changed){ Events.emit('data:removed', { collection:name, id }); if(options.save !== false) saveExisting(); }
        if(changed && options.render && typeof renderAll === 'function') { try{ renderAll(); }catch(err){ safeWarn('V61 render after remove failed', err); } }
        return changed;
      },
      reconcile(options={}){ const changed = silentReconcile(!!options.force); if(changed && options.save) saveExisting(); return changed; }
    };

    const API = {
      get mode(){ return runtime.mode; },
      set mode(value){
        runtime.mode = ['local','backend','hybrid'].includes(String(value)) ? String(value) : 'local';
        try{ window.SmartBooksPersistence?.configure?.({ mode:runtime.mode }); }catch(e){}
      },
      customers:{ list:()=>Data.list('customers'), create:(d,o)=>Data.create('customers',d,o), update:(id,d,o)=>Data.update('customers',id,d,o) },
      vendors:{ list:()=>Data.list('vendors'), create:(d,o)=>Data.create('vendors',d,o), update:(id,d,o)=>Data.update('vendors',id,d,o) },
      estimates:{ list:()=>Data.list('estimates'), create:(d,o)=>Data.create('estimates',d,o), update:(id,d,o)=>Data.update('estimates',id,d,o) },
      invoices:{ list:()=>Data.list('invoices'), create:(d,o)=>Data.create('invoices',d,o), update:(id,d,o)=>Data.update('invoices',id,d,o) },
      payments:{ list:()=>Data.list('payments'), create:(d,o)=>Data.create('payments',d,o) },
      bills:{ list:()=>Data.list('bills'), create:(d,o)=>Data.create('bills',d,o), update:(id,d,o)=>Data.update('bills',id,d,o) },
      storage: Storage,
      persistence: window.SmartBooksPersistence || null,
      events: Events,
      status: Status,
      runtime: runtime
    };

    try{ document.title = 'SmartBooks Accounting App V61'; }catch(e){}
    window.SmartBooks = Object.assign(window.SmartBooks || {}, {
      version: VERSION,
      architecture: ARCH,
      data: Data,
      storage: Storage,
      status: Status,
      events: Events,
      api: API,
      runtime: runtime,
      getState: () => canUseState() ? state : null
    });
    window.SmartBooksData = Data;
    window.SmartBooksStorage = Storage;
    window.SmartBooksStatus = Status;
    window.SmartBooksEvents = Events;
    window.SmartBooksAPI = API;

    try{ silentReconcile(false); }catch(err){ safeWarn('V61 initial safe reconcile skipped', err); }
    Events.emit('architecture:installed', { version:VERSION, architecture:ARCH, mode:runtime.mode });
  })();

  // ---------- V62: UI design stabilization baseline ----------
  // Keeps the audit priorities enforceable while the legacy UI is still being
  // refactored in small pieces: one active styling mode, common page rhythm,
  // predictable tables, centered icon controls, and calmer mobile wrapping.
  function v62InjectUiStabilizationStyles(){
    if(document.getElementById('v62-ui-stabilization-styles')) return;
    const style=document.createElement('style');
    style.id='v62-ui-stabilization-styles';
    style.textContent=`
      body.v8-ui{
        --sb-space-1:4px;
        --sb-space-2:8px;
        --sb-space-3:12px;
        --sb-space-4:16px;
        --sb-space-5:20px;
        --sb-space-6:24px;
        --sb-radius-sm:10px;
        --sb-radius-md:14px;
        --sb-radius-lg:18px;
        --sb-shadow-soft:0 2px 10px rgba(16,24,40,.04);
      }
      body.v8-ui .section-header,
      body.v8-ui .v25-dashboard-toolbar,
      body.v8-ui .sales-page-header-card .section-header{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        align-items:start!important;
        gap:var(--sb-space-5)!important;
        margin:0 0 var(--sb-space-5)!important;
      }
      body.v8-ui .page > .section-header,
      body.v8-ui .v25-dashboard-toolbar,
      body.v8-ui .sales-page-header-card{
        padding:var(--sb-space-5)!important;
        background:var(--panel,#fff)!important;
        border:1px solid #dbe5ee!important;
        border-radius:var(--sb-radius-lg)!important;
        box-shadow:var(--sb-shadow-soft)!important;
      }
      body.v8-ui .page > .section-header h2,
      body.v8-ui .v25-dashboard-toolbar h2,
      body.v8-ui .sales-page-header-card .section-header h2{
        margin:0!important;
        font-size:26px!important;
        line-height:1.12!important;
        letter-spacing:0!important;
        color:#061b37!important;
      }
      body.v8-ui .page > .section-header p,
      body.v8-ui .v25-dashboard-toolbar p,
      body.v8-ui .sales-page-header-card .section-header p{
        margin:6px 0 0!important;
        max-width:760px!important;
        color:var(--muted,#667085)!important;
        line-height:1.45!important;
      }
      body.v8-ui .section-header > div:last-child,
      body.v8-ui .v25-toolbar-actions,
      body.v8-ui .sales-header-actions,
      body.v8-ui .toolbar .right{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:var(--sb-space-2)!important;
        flex-wrap:wrap!important;
        min-width:0!important;
      }
      body.v8-ui .toolbar{
        min-height:68px!important;
        padding:var(--sb-space-4) var(--sb-space-5)!important;
        background:#fff!important;
        border-bottom:1px solid #e5ebf0!important;
      }
      body.v8-ui .toolbar h3{
        margin:0!important;
        font-size:14px!important;
        line-height:1.25!important;
        letter-spacing:.02em!important;
      }
      body.v8-ui .card{
        border-color:#e1e8ef!important;
        border-radius:var(--sb-radius-lg)!important;
        box-shadow:var(--sb-shadow-soft)!important;
      }
      body.v8-ui .card h3,
      body.v8-ui .card h4{
        letter-spacing:.02em!important;
      }
      body.v8-ui .metric,
      body.v8-ui .money-value,
      body.v8-ui .amount{
        font-variant-numeric:tabular-nums!important;
      }
      body.v8-ui .table-card{
        overflow:auto!important;
        border-radius:var(--sb-radius-lg)!important;
      }
      body.v8-ui .table-card table{
        min-width:720px;
      }
      body.v8-ui .table-card th{
        padding:11px 14px!important;
        font-size:11px!important;
        line-height:1.2!important;
        letter-spacing:.04em!important;
        color:#667085!important;
        background:#f8fafc!important;
      }
      body.v8-ui .table-card td{
        padding:12px 14px!important;
        line-height:1.35!important;
      }
      body.v8-ui .table-card th.amount,
      body.v8-ui .table-card td.amount,
      body.v8-ui .table-card th.money-col,
      body.v8-ui .table-card td.money-col{
        text-align:right!important;
        white-space:nowrap!important;
      }
      body.v8-ui .btn.square.sb-icon-only,
      body.v8-ui .icon-btn,
      body.v8-ui .hamburger,
      body.v8-ui .theme-toggle-knob,
      body.v8-ui .v25-layout-actions .btn.square,
      body.v8-ui .v29-menu-actions button{
        display:inline-grid!important;
        place-items:center!important;
        width:36px!important;
        height:36px!important;
        min-width:36px!important;
        min-height:36px!important;
        padding:0!important;
        line-height:0!important;
        text-align:center!important;
      }
      body.v8-ui .btn.square.sb-icon-only .sb-icon,
      body.v8-ui .icon-btn .sb-icon,
      body.v8-ui .hamburger .sb-icon,
      body.v8-ui .theme-toggle-knob .sb-icon,
      body.v8-ui .v29-menu-actions button .sb-icon{
        width:17px!important;
        height:17px!important;
        margin:0!important;
      }
      body.v8-ui .sb-icon-only span,
      body.v8-ui .v29-menu-actions button span,
      body.v8-ui .v25-layout-actions .btn.square span{
        display:none!important;
      }
      body.v8-ui .modal-backdrop{
        align-items:center!important;
        padding:24px!important;
      }
      body.v8-ui .modal{
        width:min(780px,calc(100vw - 32px))!important;
        border-radius:20px!important;
        border-color:#dbe5ee!important;
        box-shadow:0 18px 52px rgba(16,24,40,.22)!important;
      }
      body.v8-ui .modal.wide{
        width:min(1080px,calc(100vw - 32px))!important;
      }
      body.v8-ui .modal-header{
        padding:22px 24px!important;
        gap:var(--sb-space-5)!important;
      }
      body.v8-ui .modal-header h2{
        margin:0!important;
        font-size:22px!important;
        line-height:1.18!important;
        letter-spacing:0!important;
      }
      body.v8-ui .modal-header p{
        line-height:1.45!important;
      }
      body.v8-ui .modal-body{
        padding:22px 24px!important;
      }
      body.v8-ui .modal-footer{
        position:sticky!important;
        bottom:0!important;
        z-index:2!important;
        padding:16px 24px!important;
        border-top:1px solid #e6edf2!important;
        background:#fbfcfd!important;
        display:flex!important;
        justify-content:flex-end!important;
        gap:10px!important;
      }
      body.v8-ui .form-grid{
        gap:14px 16px!important;
      }
      body.v8-ui .field label{
        color:#475467!important;
        font-size:11px!important;
        letter-spacing:.04em!important;
      }
      body.v8-ui .field input,
      body.v8-ui .field select,
      body.v8-ui .field textarea,
      body.v8-ui .table-search{
        min-height:40px!important;
        border-radius:12px!important;
      }
      body.v8-ui .inline-total{
        border-radius:var(--sb-radius-md)!important;
        margin-top:var(--sb-space-5)!important;
      }
      body.v8-ui .quick-actions{
        align-items:center!important;
        gap:var(--sb-space-2)!important;
      }
      body.v8-ui .quick-actions strong{
        flex:0 0 auto!important;
      }
      body.v8-ui.dark-mode{
        --ink:#e8edf3;
        --text:#f3f7fb;
        --panel:#14202d;
        --card:#14202d;
        --soft:#101b27;
        --muted:#b7c4d4;
        --line:#2a3c4f;
        --sb-shadow-soft:0 12px 32px rgba(0,0,0,.28);
      }
      body.v8-ui.dark-mode .page > .section-header,
      body.v8-ui.dark-mode .v25-dashboard-toolbar,
      body.v8-ui.dark-mode .sales-page-header-card,
      body.v8-ui.dark-mode .toolbar,
      body.v8-ui.dark-mode .modal-footer{
        background:#14202d!important;
        border-color:#2a3c4f!important;
        color:#e8edf3!important;
      }
      body.v8-ui.dark-mode .page > .section-header h2,
      body.v8-ui.dark-mode .v25-dashboard-toolbar h2,
      body.v8-ui.dark-mode .sales-page-header-card .section-header h2,
      body.v8-ui.dark-mode .modal-header h2{
        color:#f3f7fb!important;
      }
      body.v8-ui.dark-mode .page > .section-header p,
      body.v8-ui.dark-mode .v25-dashboard-toolbar p,
      body.v8-ui.dark-mode .sales-page-header-card .section-header p{
        color:#aab8c7!important;
      }
      body.v8-ui.dark-mode .table-card th{
        background:#101b27!important;
        color:#cbd5e1!important;
      }
      body.v8-ui.dark-mode .card,
      body.v8-ui.dark-mode .feed-card,
      body.v8-ui.dark-mode .funnel-card,
      body.v8-ui.dark-mode .app-tile,
      body.v8-ui.dark-mode .kpi-card,
      body.v8-ui.dark-mode .service-metric,
      body.v8-ui.dark-mode .service-card,
      body.v8-ui.dark-mode .invoice-report-card,
      body.v8-ui.dark-mode .estimate-kpi,
      body.v8-ui.dark-mode .v27-metric,
      body.v8-ui.dark-mode .dashboard-cash-hero,
      body.v8-ui.dark-mode .v22-cash-card,
      body.v8-ui.dark-mode .v823-cash-card,
      body.v8-ui.dark-mode .v824-cash-card{
        background:#14202d!important;
        border-color:#2a3c4f!important;
        color:#e8edf3!important;
        box-shadow:var(--sb-shadow-soft)!important;
      }
      body.v8-ui.dark-mode .card h3,
      body.v8-ui.dark-mode .card h4,
      body.v8-ui.dark-mode .kpi-card strong,
      body.v8-ui.dark-mode .service-metric strong,
      body.v8-ui.dark-mode .service-card strong,
      body.v8-ui.dark-mode .invoice-report-card strong,
      body.v8-ui.dark-mode .estimate-kpi strong,
      body.v8-ui.dark-mode .v27-metric strong,
      body.v8-ui.dark-mode .v824-cash-title .cash-balance,
      body.v8-ui.dark-mode .v823-cash-title .cash-balance,
      body.v8-ui.dark-mode .v22-cash-title .cash-balance{
        color:#f8fafc!important;
      }
      body.v8-ui.dark-mode .kpi-card h4,
      body.v8-ui.dark-mode .kpi-card .hint,
      body.v8-ui.dark-mode .service-metric h4,
      body.v8-ui.dark-mode .service-metric .item-note,
      body.v8-ui.dark-mode .service-card .item-note,
      body.v8-ui.dark-mode .invoice-report-card h4,
      body.v8-ui.dark-mode .estimate-kpi span,
      body.v8-ui.dark-mode .v27-metric span,
      body.v8-ui.dark-mode .v27-metric em,
      body.v8-ui.dark-mode .cash-caption,
      body.v8-ui.dark-mode .v824-cash-title .eyebrow,
      body.v8-ui.dark-mode .v823-cash-title .eyebrow,
      body.v8-ui.dark-mode .v22-cash-title .eyebrow{
        color:#b7c4d4!important;
      }
      body.v8-ui.dark-mode .ops-tab{
        background:#14202d!important;
        border-color:#2f4255!important;
        color:#e7eef6!important;
      }
      body.v8-ui.dark-mode .ops-tab.active{
        background:var(--green)!important;
        border-color:var(--green)!important;
        color:#fff!important;
      }
      body.v8-ui.dark-mode .v22-axis-label,
      body.v8-ui.dark-mode .v22-x-label,
      body.v8-ui.dark-mode .v22-axis-title,
      body.v8-ui.dark-mode .v22-legend text,
      body.v8-ui.dark-mode .v823-axis-label,
      body.v8-ui.dark-mode .v823-x-label,
      body.v8-ui.dark-mode .v823-axis-title,
      body.v8-ui.dark-mode .v823-legend text,
      body.v8-ui.dark-mode .v824-axis-label,
      body.v8-ui.dark-mode .v824-x-label,
      body.v8-ui.dark-mode .v824-axis-title,
      body.v8-ui.dark-mode .v824-legend text{
        fill:#cbd5e1!important;
        color:#cbd5e1!important;
      }
      body.v8-ui.dark-mode .v22-gridline,
      body.v8-ui.dark-mode .v823-gridline,
      body.v8-ui.dark-mode .v824-gridline{
        stroke:rgba(203,213,225,.18)!important;
      }
      body.v8-ui.dark-mode .v22-baseline,
      body.v8-ui.dark-mode .v823-baseline,
      body.v8-ui.dark-mode .v824-baseline{
        stroke:#526579!important;
      }
      @media(max-width:980px){
        body.v8-ui .section-header,
        body.v8-ui .v25-dashboard-toolbar,
        body.v8-ui .sales-page-header-card .section-header{
          grid-template-columns:1fr!important;
        }
        body.v8-ui .section-header > div:last-child,
        body.v8-ui .v25-toolbar-actions,
        body.v8-ui .sales-header-actions{
          justify-content:flex-start!important;
        }
      }
      @media(max-width:720px){
        body.v8-ui .content{
          padding:18px 12px 48px!important;
        }
        body.v8-ui .topbar{
          min-height:58px!important;
          height:auto!important;
          grid-template-columns:auto minmax(0,1fr) auto!important;
          gap:8px!important;
          padding:8px 10px!important;
        }
        body.v8-ui .search input{
          min-width:0!important;
        }
        body.v8-ui .page > .section-header,
        body.v8-ui .v25-dashboard-toolbar,
        body.v8-ui .sales-page-header-card{
          padding:16px!important;
          border-radius:16px!important;
        }
        body.v8-ui .page > .section-header h2,
        body.v8-ui .v25-dashboard-toolbar h2,
        body.v8-ui .sales-page-header-card .section-header h2{
          font-size:22px!important;
        }
        body.v8-ui .quick-actions{
          display:grid!important;
          grid-template-columns:1fr 1fr!important;
          gap:8px!important;
        }
        body.v8-ui .quick-actions strong{
          grid-column:1 / -1!important;
        }
        body.v8-ui .quick-actions .btn{
          width:100%!important;
          min-width:0!important;
          white-space:normal!important;
          text-align:center!important;
        }
        body.v8-ui .modal-backdrop{
          align-items:flex-start!important;
          padding:10px!important;
        }
        body.v8-ui .modal,
        body.v8-ui .modal.wide{
          width:calc(100vw - 20px)!important;
          max-height:calc(100vh - 20px)!important;
          border-radius:16px!important;
        }
        body.v8-ui .modal-header,
        body.v8-ui .modal-body,
        body.v8-ui .modal-footer{
          padding:16px!important;
        }
        body.v8-ui .modal-footer{
          justify-content:stretch!important;
        }
        body.v8-ui .modal-footer .btn{
          flex:1 1 auto!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function v62InstallUiStabilization(){
    document.body?.classList?.add('v8-ui');
    v62InjectUiStabilizationStyles();
    document.querySelectorAll('#dashboardRefresh,[data-action="refresh-dashboard"]').forEach(btn => {
      btn.classList.add('sb-icon-only');
      if(!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Refresh dashboard');
      if(!btn.getAttribute('title')) btn.setAttribute('title', 'Refresh dashboard');
    });
  }

  const v62RenderAllBase = renderAll;
  renderAll = function(){
    const result = v62RenderAllBase.apply(this, arguments);
    v62InstallUiStabilization();
    return result;
  };

  try{ v62InstallUiStabilization(); v47InvalidateSearch?.(); renderAll(); v62InstallUiStabilization(); }catch(e){ console.warn('V62 refresh skipped', e); }

  let buttonConsistencyObserver = null;
  let buttonConsistencyTimer = null;

  function scheduleButtonConsistency(){
    clearTimeout(buttonConsistencyTimer);
    buttonConsistencyTimer = setTimeout(() => {
      try{ installButtonConsistency(); }catch(e){ console.warn('Button consistency refresh skipped', e); }
    }, 0);
  }

  function startButtonConsistencyObserver(){
    if(buttonConsistencyObserver || !document.body) return;
    buttonConsistencyObserver = new MutationObserver(scheduleButtonConsistency);
    buttonConsistencyObserver.observe(document.body, { childList:true, subtree:true });
    document.addEventListener('click', scheduleButtonConsistency, true);
    document.addEventListener('change', scheduleButtonConsistency, true);
  }

  function injectButtonConsistencyStyles(){
    if(document.getElementById('smartbooks-button-consistency-styles')) return;
    const style = document.createElement('style');
    style.id = 'smartbooks-button-consistency-styles';
    style.textContent = `
      body.v8-ui{
        --sb-button-height:38px;
        --sb-button-compact-height:34px;
        --sb-button-icon-size:36px;
        --sb-row-action-width:124px;
        --sb-button-gap:8px;
      }
      body.v8-ui .btn,
      body.v8-ui button.btn,
      body.v8-ui a.btn{
        box-sizing:border-box!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:var(--sb-button-height)!important;
        padding:8px 14px!important;
        border-radius:999px!important;
        line-height:1.2!important;
        font-size:14px!important;
        gap:7px!important;
        text-align:center!important;
        white-space:nowrap!important;
      }
      body.v8-ui .section-header > div:last-child,
      body.v8-ui .v25-toolbar-actions,
      body.v8-ui .sales-header-actions,
      body.v8-ui .toolbar .left,
      body.v8-ui .toolbar .right,
      body.v8-ui .quick-actions,
      body.v8-ui .gtd-hero > div:last-child{
        display:flex!important;
        align-items:center!important;
        gap:var(--sb-button-gap)!important;
        flex-wrap:wrap!important;
      }
      body.v8-ui .section-header .btn:not(.sb-icon-only),
      body.v8-ui .v25-toolbar-actions .btn:not(.sb-icon-only),
      body.v8-ui .sales-header-actions .btn:not(.sb-icon-only),
      body.v8-ui .toolbar .btn:not(.sb-icon-only),
      body.v8-ui .quick-actions .btn:not(.sb-icon-only),
      body.v8-ui .gtd-hero .btn:not(.sb-icon-only),
      body.v8-ui .modal-footer .btn:not(.sb-icon-only){
        min-width:112px!important;
      }
      body.v8-ui .tabbar,
      body.v8-ui .ops-tabbar,
      body.v8-ui .mini-tabs,
      body.v8-ui .gtd-tabs{
        display:flex!important;
        align-items:center!important;
        gap:var(--sb-button-gap)!important;
        flex-wrap:wrap!important;
      }
      body.v8-ui .tab-btn,
      body.v8-ui .ops-tab,
      body.v8-ui .mini-tab,
      body.v8-ui .gtd-tab{
        box-sizing:border-box!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:var(--sb-button-height)!important;
        padding:8px 14px!important;
        border-radius:999px!important;
        line-height:1.15!important;
        font-size:14px!important;
        text-align:center!important;
        white-space:nowrap!important;
      }
      body.v8-ui .mini-tab{
        min-height:36px!important;
        font-size:13px!important;
      }
      body.v8-ui .btn.square:not(.sb-icon-only){
        min-height:var(--sb-button-compact-height)!important;
        padding:7px 10px!important;
        border-radius:12px!important;
        white-space:normal!important;
      }
      body.v8-ui .table-card td:last-child .sb-action-grid{
        display:grid!important;
        grid-template-columns:repeat(2,var(--sb-row-action-width))!important;
        gap:6px!important;
        align-items:start!important;
        justify-content:start!important;
        max-width:calc((var(--sb-row-action-width) * 2) + 6px)!important;
        white-space:normal!important;
      }
      body.v8-ui .table-card td:last-child .sb-action-grid .btn:not(.sb-icon-only),
      body.v8-ui .table-card td:last-child > .btn:not(.sb-icon-only),
      body.v8-ui .panel-row > .btn.square:not(.sb-icon-only){
        width:var(--sb-row-action-width)!important;
        min-width:var(--sb-row-action-width)!important;
        max-width:var(--sb-row-action-width)!important;
        min-height:var(--sb-button-compact-height)!important;
        padding:7px 8px!important;
        font-size:12px!important;
        line-height:1.14!important;
        justify-content:center!important;
        text-align:center!important;
        white-space:normal!important;
      }
      body.v8-ui .invoice-actions:not(.sb-action-grid){
        min-width:118px!important;
        max-width:150px!important;
      }
      body.v8-ui .invoice-actions:not(.sb-action-grid) .invoice-more summary.btn{
        min-height:var(--sb-button-compact-height)!important;
        padding:7px 10px!important;
        width:100%!important;
      }
      body.v8-ui .invoice-more-menu .btn,
      body.v8-ui .invoice-more-menu button{
        min-height:var(--sb-button-compact-height)!important;
        padding:7px 9px!important;
        font-size:12px!important;
        line-height:1.15!important;
      }
      body.v8-ui .check-row .btn.square:not(.sb-icon-only){
        min-width:84px!important;
        min-height:var(--sb-button-compact-height)!important;
        padding:7px 10px!important;
        font-size:12px!important;
      }
      body.v8-ui .btn.square.sb-icon-only,
      body.v8-ui .icon-btn,
      body.v8-ui .hamburger,
      body.v8-ui .theme-toggle-knob,
      body.v8-ui .v25-layout-actions .btn.square,
      body.v8-ui .v26-control-group .btn.square[data-action^="dashboard-widget-"],
      body.v8-ui .v29-menu-actions button{
        box-sizing:border-box!important;
        display:inline-grid!important;
        place-items:center!important;
        width:var(--sb-button-icon-size)!important;
        height:var(--sb-button-icon-size)!important;
        min-width:var(--sb-button-icon-size)!important;
        min-height:var(--sb-button-icon-size)!important;
        max-width:var(--sb-button-icon-size)!important;
        padding:0!important;
        border-radius:12px!important;
        line-height:1!important;
        text-align:center!important;
        flex:0 0 auto!important;
      }
      body.v8-ui .btn.square.sb-icon-only .sb-icon,
      body.v8-ui .icon-btn .sb-icon,
      body.v8-ui .hamburger .sb-icon,
      body.v8-ui .theme-toggle-knob .sb-icon,
      body.v8-ui .v25-layout-actions .btn.square .sb-icon,
      body.v8-ui .v29-menu-actions button .sb-icon{
        width:17px!important;
        height:17px!important;
        margin:0!important;
      }
      body.v8-ui .v25-widget-buttons{
        gap:6px!important;
      }
      body.v8-ui .v25-widget-buttons .btn.square[data-action="dashboard-widget-hide"]{
        min-width:72px!important;
        min-height:var(--sb-button-compact-height)!important;
        padding:7px 10px!important;
        font-size:12px!important;
      }
      @media(max-width:760px){
        body.v8-ui .table-card td:last-child .sb-action-grid{
          grid-template-columns:1fr!important;
          max-width:none!important;
        }
        body.v8-ui .table-card td:last-child .sb-action-grid .btn:not(.sb-icon-only),
        body.v8-ui .table-card td:last-child > .btn:not(.sb-icon-only),
        body.v8-ui .panel-row > .btn.square:not(.sb-icon-only){
          width:100%!important;
          min-width:0!important;
          max-width:none!important;
        }
        body.v8-ui .section-header .btn:not(.sb-icon-only),
        body.v8-ui .v25-toolbar-actions .btn:not(.sb-icon-only),
        body.v8-ui .sales-header-actions .btn:not(.sb-icon-only),
        body.v8-ui .toolbar .btn:not(.sb-icon-only),
        body.v8-ui .quick-actions .btn:not(.sb-icon-only),
        body.v8-ui .gtd-hero .btn:not(.sb-icon-only){
          min-width:0!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function installButtonConsistency(){
    document.body?.classList?.add('v8-ui');
    injectButtonConsistencyStyles();
    startButtonConsistencyObserver();

    const iconText = new Set(['x','×','✕','+','＋','✓','✔','↑','↓','←','→','↖','↗','↘','↙','⇱','⇲','↔','⇄','⇅','↻','★','☆']);
    document.querySelectorAll('.btn.square').forEach(button => {
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
      const isIconGroup = Boolean(button.closest('.v25-layout-actions,.v26-control-group'));
      const isKnownIconAction = button.matches('#closeModal,.top-panel-close,#dashboardRefresh,[data-action="refresh-dashboard"],[data-action="dashboard-widget-move"],[data-action="dashboard-widget-width-cycle"]');
      const isIconOnlyText = text.length <= 3 && iconText.has(text.toLowerCase());
      if(isIconGroup || isKnownIconAction || isIconOnlyText){
        if(text.length > 3){
          const visibleIcon = text.match(/[x×✕+＋✓✔↑↓←→↖↗↘↙⇱⇲↔⇄⇅↻★☆]/i)?.[0];
          if(visibleIcon) button.textContent = visibleIcon;
        }
        button.classList.add('sb-icon-only');
        if(!button.getAttribute('aria-label')){
          button.setAttribute('aria-label', button.getAttribute('title') || button.dataset.action?.replace(/-/g, ' ') || 'Button action');
        }
      }
    });

    document.querySelectorAll('.tx-actions,.row-actions,.table-actions,.estimate-actions,.v49-estimate-row-actions').forEach(group => {
      group.classList.add('sb-action-grid');
    });
    document.querySelectorAll('.invoice-actions').forEach(group => {
      if(group.querySelector('.invoice-more')) group.classList.remove('sb-action-grid');
      else group.classList.add('sb-action-grid');
    });
  }

  const buttonConsistencyRenderAllBase = renderAll;
  renderAll = function(){
    const result = buttonConsistencyRenderAllBase.apply(this, arguments);
    installButtonConsistency();
    return result;
  };

  try{ installButtonConsistency(); renderAll(); installButtonConsistency(); }catch(e){ console.warn('Button consistency refresh skipped', e); }
