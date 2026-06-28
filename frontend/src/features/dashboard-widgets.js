// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

  // ---------- V25: Dashboard Widget Layout Customization ----------
  // Converts the dashboard into movable widgets. Users can choose visibility, order, and card width.
  function v25DashboardDefs(){
    return {
      cashflow:{label:'Cash Flow', width:'full', html:()=>`<div class="card dashboard-cash-hero" id="cashFlowHero"></div>`},
      invoices:{label:'Invoices', width:'third', html:()=>`<div class="card" id="invoiceSummaryCard"></div>`},
      expenses:{label:'Expenses', width:'third', html:()=>`<div class="card" id="expensesCard"></div>`},
      bank:{label:'Bank Accounts', width:'third', html:()=>`<div class="card" id="bankCard"></div>`},
      feed:{label:'Business Feed', width:'full', html:()=>`<div class="dashboard-feed-block" id="businessFeedBlock"><div class="feed-header"><h3>✦ Business Feed</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="muted small" id="businessFeedCountLabel">Compact view</span><button class="btn soft" data-action="view-all-feed">View all insights</button></div></div><div id="businessFeed"></div></div>`},
      pl:{label:'Profit & Loss', width:'third', html:()=>`<div class="card" id="plCard"></div>`},
      recent:{label:'Recent Transactions', width:'third', html:()=>`<div class="card table-card" id="recentTransactions"></div>`},
      setup:{label:'Setup Checklist', width:'third', html:()=>`<div class="card" id="setupCard"></div>`},
      funnel:{label:'Sales & Get Paid Funnel', width:'full', html:()=>`<div class="card" id="funnelWidget"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap"><h3 style="margin:0">Sales & Get Paid Funnel</h3><select id="dashRange" class="table-search" style="min-width:140px;padding:7px 10px"><option>This month</option><option>Last 30 days</option><option>Quarter to date</option></select></div><div class="funnel" id="funnelCards"></div></div>`}
    };
  }
  function v25DefaultOrder(){ return ['cashflow','invoices','expenses','bank','feed','pl','recent','setup']; }
  function v25DefaultVisible(){ return ['cashflow','invoices','expenses','bank','feed','pl','recent','setup']; }
  function v25DefaultWidths(){
    const defs=v25DashboardDefs();
    return Object.fromEntries(Object.entries(defs).map(([id,def])=>[id,def.width]));
  }
  function v25AllWidgetIds(){ return Object.keys(v25DashboardDefs()); }
  function v25SanitizeList(list, fallback){
    const valid=new Set(v25AllWidgetIds());
    const out=[];
    (Array.isArray(list)?list:[]).forEach(id=>{ if(valid.has(id) && !out.includes(id)) out.push(id); });
    (fallback||[]).forEach(id=>{ if(valid.has(id) && !out.includes(id)) out.push(id); });
    return out;
  }
  function v25EnsureDashboardState(){
    state.settings ||= {};
    const all=v25AllWidgetIds();
    const defaults=v25DefaultOrder();
    if(!state.settings.v25DashboardLayoutInitialized){
      // Preserve visible widgets where possible, but keep the V24 dashboard default clean by not auto-adding the old funnel card.
      const existing=Array.isArray(state.settings.dashboardWidgets) ? state.settings.dashboardWidgets.filter(id=>all.includes(id) && id!=='funnel') : [];
      state.settings.dashboardWidgets = existing.length ? existing : v25DefaultVisible();
      state.settings.dashboardLayout = v25SanitizeList(state.settings.dashboardLayout, defaults);
      state.settings.dashboardWidgetWidths = {...v25DefaultWidths(), ...(state.settings.dashboardWidgetWidths||{})};
      state.settings.v25DashboardLayoutInitialized = true;
    }else{
      state.settings.dashboardWidgets = v25SanitizeList(state.settings.dashboardWidgets, v25DefaultVisible()).filter(id=>all.includes(id));
      state.settings.dashboardLayout = v25SanitizeList(state.settings.dashboardLayout, defaults);
      state.settings.dashboardWidgetWidths = {...v25DefaultWidths(), ...(state.settings.dashboardWidgetWidths||{})};
    }
    if(!state.settings.dashboardWidgets.length) state.settings.dashboardWidgets = v25DefaultVisible();
  }
  function v25WidgetWidth(id){
    v25EnsureDashboardState();
    const val=state.settings.dashboardWidgetWidths?.[id] || v25DashboardDefs()[id]?.width || 'third';
    return ['full','two-thirds','half','third'].includes(val) ? val : 'third';
  }
  function v25WidgetClasses(id){
    return `v25-widget v25-${v25WidgetWidth(id)}`;
  }
  function v25WidgetControls(id){
    const defs=v25DashboardDefs();
    if(!state.settings?.dashboardEditMode) return '';
    return `<div class="v25-widget-controls"><div><span class="v25-drag-handle" aria-hidden="true">⋮⋮</span><strong>${escapeHTML(defs[id]?.label||id)}</strong></div><div class="v25-widget-buttons"><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:top" title="Move to top">⇱</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:up" title="Move up">↑</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:down" title="Move down">↓</button><button type="button" class="btn square" data-action="dashboard-widget-width-cycle" data-id="${id}" title="Change width">↔</button><button type="button" class="btn square danger" data-action="dashboard-widget-hide" data-id="${id}" title="Hide card">Hide</button></div></div>`;
  }
  function v25WidgetHtml(id){
    const def=v25DashboardDefs()[id];
    if(!def) return '';
    const draggable=state.settings?.dashboardEditMode ? ' draggable="true"' : '';
    return `<section class="${v25WidgetClasses(id)}" data-v25-widget="${id}"${draggable}>${v25WidgetControls(id)}${def.html()}</section>`;
  }
  function v25MoveWidget(id,direction){
    if(currentModal==='customizeDashboard'){
      v25MoveModalLayoutRow(id,direction);
      return false;
    }
    v25EnsureDashboardState();
    const order=v25SanitizeList(state.settings.dashboardLayout, v25DefaultOrder());
    const i=order.indexOf(id);
    if(i<0) return false;
    if(direction==='top'){
      order.splice(i,1); order.unshift(id);
    }else if(direction==='bottom'){
      order.splice(i,1); order.push(id);
    }else if(direction==='up' && i>0){
      [order[i-1],order[i]]=[order[i],order[i-1]];
    }else if(direction==='down' && i<order.length-1){
      [order[i],order[i+1]]=[order[i+1],order[i]];
    }else return false;
    state.settings.dashboardLayout=order;
    return true;
  }
  function v25MoveModalLayoutRow(id,direction){
    if(currentModal!=='customizeDashboard') return false;
    const rows=Array.from(document.querySelectorAll('#modalBody .v25-layout-row'));
    const row=rows.find(el=>el.getAttribute('data-v25-layout-row')===id);
    const list=row?.parentElement;
    if(!row || !list) return false;
    const current=Array.from(list.children).filter(el=>el.classList?.contains('v25-layout-row'));
    const index=current.indexOf(row);
    if(direction==='top' && index>0){
      list.insertBefore(row,current[0]);
    }else if(direction==='bottom' && index<current.length-1){
      list.appendChild(row);
    }else if(direction==='up' && index>0){
      list.insertBefore(row,current[index-1]);
    }else if(direction==='down' && index<current.length-1){
      list.insertBefore(current[index+1],row);
    }else{
      return false;
    }
    return true;
  }
  function v25CycleWidth(id){
    v25EnsureDashboardState();
    const seq=['third','half','two-thirds','full'];
    const current=v25WidgetWidth(id);
    const next=seq[(seq.indexOf(current)+1)%seq.length] || 'third';
    state.settings.dashboardWidgetWidths[id]=next;
    return next;
  }
  function v25RenderDashboardWidgets(){
    v25EnsureDashboardState();
    const visible=new Set(state.settings.dashboardWidgets || v25DefaultVisible());
    const order=v25SanitizeList(state.settings.dashboardLayout, v25DefaultOrder());
    return order.filter(id=>visible.has(id)).map(v25WidgetHtml).join('') || `<div class="empty v25-empty-dashboard">No dashboard cards are visible. Open Customize dashboard and restore the default layout.</div>`;
  }
  function v25StatusLabel(level){
    if(level==='warn') return 'Needs review';
    if(level==='good') return 'On track';
    return 'Monitor';
  }
  function v25OpsMetric(title,value,detail,actionLabel,actionAttr,level='neutral'){
    return `<div class="v25-ops-item ${level}">
      <div class="v25-ops-item-head"><span>${escapeHTML(title)}</span><strong>${escapeHTML(v25StatusLabel(level))}</strong></div>
      <div class="v25-ops-value">${value}</div>
      <p>${escapeHTML(detail)}</p>
      ${actionLabel&&actionAttr?`<button type="button" class="btn" ${actionAttr}>${escapeHTML(actionLabel)}</button>`:''}
    </div>`;
  }
  function v30PersistenceDiagnostics(options={}){
    const service=window.SmartBooksDashboardOperations;
    const rawStatus=window.SmartBooksPersistence?.getStatus ? window.SmartBooksPersistence.getStatus() : {};
    const info=service?.persistenceSummary ? service.persistenceSummary(rawStatus) : {
      mode:'local',
      endpoint:'/api/state',
      level:'neutral',
      headline:'Local browser persistence',
      detail:'Local storage remains the default until migration safeguards are complete.',
      revision:'Not loaded',
      lastBackendSavedAt:'Not saved yet',
      actions:[
        {label:'Export safety backup', actionAttr:'data-action="export-persistence-backup"'},
        {label:'Review settings', actionAttr:'data-action="open-persistence-settings"'}
      ],
      counters:{reads:0,writes:0,errors:0}
    };
    const counters=info.counters || {};
    const diagnosticsActions=(info.actions||[]).filter(action => options.includeSettingsAction !== false || !/open-persistence-settings/.test(action.actionAttr || ''));
    const actions=diagnosticsActions.map(action =>
      `<button type="button" class="btn" ${action.actionAttr || ''}>${escapeHTML(action.label)}</button>`
    ).join('');
    return `<div class="v30-persistence-panel ${escapeHTML(info.level || 'neutral')}" aria-label="Company data storage status">
      <div class="v30-persistence-copy">
        <span>Company data</span>
        <strong>${escapeHTML(info.headline)}</strong>
        <p>${escapeHTML(info.detail)}</p>
        ${actions ? `<div class="v30-persistence-actions">${actions}</div>` : ''}
      </div>
      <div class="v30-persistence-grid">
        <div><span>Save location</span><strong>${escapeHTML(info.modeLabel || info.mode)}</strong></div>
        <div><span>Service address</span><strong title="${escapeHTML(info.endpoint)}">${escapeHTML(info.endpoint)}</strong></div>
        <div><span>Saved version</span><strong>${escapeHTML(info.revision || 'Not loaded')}</strong></div>
        <div><span>Last shared save</span><strong>${escapeHTML(info.lastBackendSavedAt)}</strong></div>
        <div><span>Shared loads</span><strong>${Number(counters.reads)||0}</strong></div>
        <div><span>Shared saves</span><strong>${Number(counters.writes)||0}</strong></div>
        <div><span>Issues</span><strong>${Number(counters.errors)||0}</strong></div>
      </div>
    </div>`;
  }
  function v25RenderOperationsConsole(){
    const service=window.SmartBooksDashboardOperations;
    const summary=service?.operationsSummary ? service.operationsSummary(state, {
      today:todayISO(),
      openAmount,
      billOpenAmount,
      invoiceStatus:(invoice)=> typeof invoiceDisplayStatus==='function' ? invoiceDisplayStatus(invoice) : invoice.status,
      totals:()=>totals(),
      cashSummary:typeof calculateCashSummary==='function' ? () => calculateCashSummary() : null
    }) : {headline:'No urgent exceptions', metrics:[]};
    const metrics=(summary.metrics||[]).map(metric=>{
      const value=metric.moneyValue!==undefined ? money(metric.moneyValue) : String(metric.value ?? '');
      const detail=metric.moneyDetailValue!==undefined ? `${metric.detail} ${money(metric.moneyDetailValue)}` : metric.detail;
      return v25OpsMetric(metric.title,value,detail,metric.actionLabel,metric.actionAttr,metric.level);
    });
    return `<section class="v25-ops-console" aria-label="Dashboard operations summary">
      <div class="v25-ops-lead">
        <span>Operations console</span>
        <h3>${escapeHTML(summary.headline)}</h3>
        <p>Receivables, payables, cash, banking, and setup health for today's review.</p>
      </div>
      <div class="v25-ops-grid">
        ${metrics.join('')}
      </div>
    </section>`;
  }
  function v25RenderAllWidgetContent(){
    const t=totals();
    if(document.getElementById('cashFlowHero')) renderCashFlowHero();
    if(document.getElementById('invoiceSummaryCard')) renderInvoiceSummaryCard();
    if(document.getElementById('expensesCard')) renderExpensesCard();
    if(document.getElementById('bankCard')) renderBankCard(t);
    if(document.getElementById('businessFeed')) renderBusinessFeed(t);
    if(document.getElementById('plCard')) renderPLCard(t);
    if(document.getElementById('recentTransactions')) renderRecentTransactions();
    if(document.getElementById('setupCard')) renderSetupCard();
    if(document.getElementById('funnelCards')) renderFunnel(t);
    ensureFeedHeaderControls?.(); updateBusinessFeedHeaderCount?.(); applyDashboardPrefs?.(); applyQuickActionVisibility?.(document.getElementById('page-dashboard')); cleanProductLanguageInDOM?.(document.getElementById('page-dashboard'));
    if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(document.getElementById('page-dashboard') || document);
  }
  function injectV25DashboardStyles(){
    if(document.getElementById('v25-dashboard-layout-styles')) return;
    const style=document.createElement('style');
    style.id='v25-dashboard-layout-styles';
    style.textContent=`
      /* V31 dashboard header card cleanup */
      body.v8-ui .v25-dashboard-toolbar{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:18px 0 18px;padding:18px 20px;background:var(--panel,#fff);border:1px solid #d8e2ea;border-radius:20px;box-shadow:0 2px 10px rgba(16,24,40,.04)}
      body.v8-ui .v25-dashboard-toolbar h2{font-size:28px;margin:0;letter-spacing:-.035em;line-height:1.12;color:#061b37}
      body.v8-ui .v25-dashboard-toolbar p{margin:6px 0 0;color:var(--muted,#667085);line-height:1.45;max-width:660px}
      body.v8-ui .v25-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;align-items:center}
      body.v8-ui .v25-ops-console{display:grid;grid-template-columns:minmax(220px,.72fr) minmax(0,2.4fr);gap:16px;align-items:stretch;margin:0 0 16px;padding:16px;background:var(--panel,#fff);border:1px solid #d8e2ea;border-radius:20px;box-shadow:0 2px 10px rgba(16,24,40,.04)}
      body.v8-ui .v25-ops-lead{border-right:1px solid #e4ebf1;padding-right:16px;display:flex;flex-direction:column;justify-content:center}
      body.v8-ui .v25-ops-lead span{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#1d6f8f}
      body.v8-ui .v25-ops-lead h3{margin:7px 0 6px;font-size:22px;line-height:1.15;color:#061b37}
      body.v8-ui .v25-ops-lead p{margin:0;color:var(--muted,#667085);line-height:1.45}
      body.v8-ui .v25-ops-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
      body.v8-ui .v25-ops-item{min-width:0;border:1px solid #e2e8ef;border-radius:14px;background:#fbfcfd;padding:12px;display:flex;flex-direction:column;gap:8px}
      body.v8-ui .v25-ops-item.warn{border-color:#fed7aa;background:#fffaf2}.v25-ops-item.good{border-color:#bbf7d0;background:#f6fff8}
      body.v8-ui .v25-ops-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      body.v8-ui .v25-ops-item-head span{font-size:12px;font-weight:900;color:#475467}.v25-ops-item-head strong{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#667085;white-space:nowrap}
      body.v8-ui .v25-ops-value{font-size:20px;font-weight:900;line-height:1.1;color:#061b37;font-variant-numeric:tabular-nums}
      body.v8-ui .v25-ops-item p{margin:0;color:var(--muted,#667085);font-size:12px;line-height:1.35;min-height:32px}
      body.v8-ui .v25-ops-item .btn{margin-top:auto;min-height:34px;padding:7px 10px;font-size:12px;width:100%}
      body.v8-ui .v30-persistence-panel{grid-column:1/-1;display:grid;grid-template-columns:minmax(220px,.72fr) minmax(0,2.4fr);gap:14px;align-items:center;border:1px solid #d8e2ea;border-radius:16px;background:#fbfcfd;padding:13px 14px}
      body.v8-ui .v30-persistence-panel.warn{border-color:#fed7aa;background:#fffaf2}.v30-persistence-panel.good{border-color:#bbf7d0;background:#f6fff8}
      body.v8-ui .v30-persistence-copy span{display:block;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#1d6f8f}.v30-persistence-copy strong{display:block;margin:4px 0 3px;font-size:16px;color:#061b37}.v30-persistence-copy p{margin:0;color:var(--muted,#667085);line-height:1.4}
      body.v8-ui .v30-persistence-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.v30-persistence-actions .btn{min-height:32px;padding:7px 10px;font-size:12px}
      body.v8-ui .v30-persistence-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}
      body.v8-ui .v30-persistence-grid div{min-width:0;border:1px solid #e2e8ef;border-radius:12px;background:#fff;padding:9px 10px}.v30-persistence-grid span{display:block;font-size:11px;font-weight:900;color:#667085;text-transform:uppercase;letter-spacing:.04em}.v30-persistence-grid strong{display:block;margin-top:4px;color:#061b37;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
      body.v8-ui .v25-dashboard-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;align-items:start}
      body.v8-ui .v25-widget{grid-column:span 4;min-width:0;position:relative}
      body.v8-ui .v25-widget.v25-full{grid-column:1 / -1}.v25-widget.v25-two-thirds{grid-column:span 8}.v25-widget.v25-half{grid-column:span 6}.v25-widget.v25-third{grid-column:span 4}
      body.v8-ui .v25-widget[draggable="true"]{cursor:grab}.v25-widget.v25-drag-over{outline:3px dashed rgba(10,143,60,.45);outline-offset:4px;border-radius:18px}
      body.v8-ui .v25-widget-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px dashed #b9c7d4;background:#f8fbfb;color:#172033;border-radius:14px;padding:8px 10px;margin-bottom:8px;box-shadow:0 2px 8px rgba(16,24,40,.04)}
      body.v8-ui .v25-widget-controls>div:first-child{display:flex;align-items:center;gap:8px;min-width:0}.v25-drag-handle{font-weight:900;color:#98a2b3;letter-spacing:-.15em}.v25-widget-buttons{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.v25-widget-buttons .btn{padding:6px 9px;font-size:12px}
      body.v8-ui .v25-edit-on{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.v25-empty-dashboard{grid-column:1/-1}
      body.v8-ui .v25-layout-list{display:grid;gap:10px;margin-top:12px}.v25-layout-row{display:grid;grid-template-columns:minmax(220px,1fr) 150px auto;gap:10px;align-items:center;border:1px solid #e1e8ef;border-radius:16px;background:#fff;padding:12px}.v25-layout-row label{display:flex;align-items:center;gap:9px;font-weight:900}.v25-layout-row select{border:1px solid #cbd5df;border-radius:10px;padding:8px 9px;background:#fff}.v25-layout-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}.v25-layout-actions .btn{padding:6px 9px;font-size:12px}.v25-layout-help{border:1px solid #cfe6f7;background:#f4faff;color:#18476b;border-radius:14px;padding:11px 12px;margin:0 0 12px;line-height:1.4}.v25-privacy-row{display:flex;align-items:center;gap:12px;margin-top:14px;padding:12px;border:1px solid #e1e8ef;border-radius:14px;background:#fbfcfd}
      body.v8-ui.dark-mode .v25-dashboard-toolbar,body.v8-ui.dark-mode .v25-ops-console{background:#14202d;border-color:#2a3c4f;box-shadow:0 12px 32px rgba(0,0,0,.22)}body.v8-ui.dark-mode .v25-dashboard-toolbar h2,body.v8-ui.dark-mode .v25-ops-lead h3,body.v8-ui.dark-mode .v25-ops-value,body.v8-ui.dark-mode .v30-persistence-copy strong,body.v8-ui.dark-mode .v30-persistence-grid strong{color:#f3f7fb}body.v8-ui.dark-mode .v25-widget-controls,body.v8-ui.dark-mode .v25-layout-row,body.v8-ui.dark-mode .v25-privacy-row,body.v8-ui.dark-mode .v25-ops-item,body.v8-ui.dark-mode .v30-persistence-panel,body.v8-ui.dark-mode .v30-persistence-grid div{background:#101b27;border-color:#2a3c4f;color:#e8edf3}body.v8-ui.dark-mode .v25-layout-row select{background:#0f1924;border-color:#3a5065;color:#edf3f8}body.v8-ui.dark-mode .v25-layout-help{background:#0f2536;border-color:#264b67;color:#c8e6ff}body.v8-ui.dark-mode .v25-ops-lead{border-color:#2a3c4f}body.v8-ui.dark-mode .v25-ops-lead span,body.v8-ui.dark-mode .v30-persistence-copy span{color:#8ecae6}body.v8-ui.dark-mode .v25-ops-item.warn,body.v8-ui.dark-mode .v30-persistence-panel.warn{background:#2b2116;border-color:#8a5a22}body.v8-ui.dark-mode .v25-ops-item.good,body.v8-ui.dark-mode .v30-persistence-panel.good{background:#10271b;border-color:#2f6845}
      @media(max-width:1180px){body.v8-ui .v25-ops-console,body.v8-ui .v30-persistence-panel{grid-template-columns:1fr}.v25-ops-lead{border-right:0!important;border-bottom:1px solid #e4ebf1;padding-right:0;padding-bottom:12px}.v25-ops-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.v30-persistence-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}body.v8-ui .v25-widget.v25-third,body.v8-ui .v25-widget.v25-half{grid-column:span 6}.v25-widget.v25-two-thirds{grid-column:1/-1}.v25-layout-row{grid-template-columns:1fr}}
      @media(max-width:760px){body.v8-ui .v25-dashboard-toolbar{flex-direction:column;align-items:flex-start;padding:16px;margin:14px 0 16px}.v25-toolbar-actions{justify-content:flex-start}.v25-toolbar-actions .btn{padding:8px 11px}.v25-ops-console{padding:14px}.v25-ops-grid,.v30-persistence-grid{grid-template-columns:1fr!important}.v25-dashboard-grid{grid-template-columns:1fr}.v25-widget,.v25-widget.v25-third,.v25-widget.v25-half,.v25-widget.v25-two-thirds,.v25-widget.v25-full{grid-column:1/-1!important}.v25-widget-controls{align-items:flex-start;flex-direction:column}.v25-layout-actions{justify-content:flex-start}}
    `;
    document.head.appendChild(style);
  }
  dashboardWidgetLabels = function(){
    return Object.fromEntries(Object.entries(v25DashboardDefs()).map(([id,def])=>[id,def.label]));
  };
  const renderDashboardBeforeV25 = renderDashboard;
  renderDashboard = function(){
    injectV25DashboardStyles(); injectV22CashFlowAxisStyles?.(); ensureV818State?.(); v25EnsureDashboardState();
    const page=document.getElementById('page-dashboard');
    if(!page) return renderDashboardBeforeV25();
    page.classList.add('dashboard-cash-layout','v25-dashboard-page');
    const edit=!!state.settings.dashboardEditMode;
    page.innerHTML=`
      <div class="hero v8-hero"><h2 id="greeting">Good afternoon, Quak!</h2><div class="pill-row" id="modulePills"></div></div>
      ${quickActionsV814 ? quickActionsV814() : quickActionsV8()}
      <div class="v25-dashboard-toolbar"><div><h2>Dashboard</h2><p>Move cards into the order that matches your workflow. Layout is saved on this device.</p></div><div class="v25-toolbar-actions"><button class="btn ${edit?'v25-edit-on':''}" data-action="dashboard-edit-mode">${edit?'Done customizing':'Customize layout'}</button><button class="btn" data-modal="customizeDashboard">⚙ Customize dashboard</button><button class="btn" data-action="toggle-privacy">◉ Privacy</button><button class="btn square" data-action="refresh-dashboard">↻ Refresh</button></div></div>
      ${v25RenderOperationsConsole()}
      <div class="v25-dashboard-grid" id="dashboardWidgetGrid">${v25RenderDashboardWidgets()}</div>`;
    renderModulePills();
    v25RenderAllWidgetContent();
  };
  const renderSettingsBeforeV30 = renderSettings;
  renderSettings = function(){
    injectV25DashboardStyles();
    renderSettingsBeforeV30();
    const el=document.getElementById('page-settings');
    if(!el || el.querySelector('.v30-persistence-panel')) return;
    el.insertAdjacentHTML('beforeend', `<div class="settings-storage-status" style="margin-top:16px">${v30PersistenceDiagnostics({includeSettingsAction:false})}</div>`);
  };
  function v25CustomizeDashboardBody(){
    v25EnsureDashboardState();
    const defs=v25DashboardDefs();
    const visible=new Set(state.settings.dashboardWidgets || v25DefaultVisible());
    const order=v25SanitizeList(state.settings.dashboardLayout, v25DefaultOrder());
    const rows=order.map(id=>{
      const def=defs[id];
      if(!def) return '';
      const w=v25WidgetWidth(id);
      return `<div class="v25-layout-row" data-v25-layout-row="${id}"><label><input type="checkbox" name="v25WidgetVisible" value="${id}" ${visible.has(id)?'checked':''}><input type="hidden" name="v25DashboardOrder" value="${id}">${escapeHTML(def.label)}</label><select name="v25WidgetWidth_${id}" aria-label="${escapeHTML(def.label)} width"><option value="third" ${w==='third'?'selected':''}>Card width: 1/3 row</option><option value="half" ${w==='half'?'selected':''}>Card width: 1/2 row</option><option value="two-thirds" ${w==='two-thirds'?'selected':''}>Card width: 2/3 row</option><option value="full" ${w==='full'?'selected':''}>Card width: full row</option></select><div class="v25-layout-actions"><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:top" title="Move to top">⇱</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:up" title="Move up">↑</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:down" title="Move down">↓</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:bottom" title="Move to bottom">⇲</button></div></div>`;
    }).join('');
    return `<div class="v25-layout-help"><strong>Dashboard layout customization:</strong> use the arrows to move cards above or below other cards, choose each card width, and uncheck cards you do not want to show. For example, Profit & Loss can be moved above Business Feed, or Invoices can be moved above Cash Flow.</div><div class="v25-layout-list">${rows}</div><label class="v25-privacy-row"><input type="checkbox" name="privacyMode" ${state.settings.privacyMode?'checked':''}> <strong>Privacy mode: mask dollar values on the dashboard</strong></label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button type="button" class="btn" data-action="dashboard-layout-reset">Restore default layout</button><button type="button" class="btn" data-action="dashboard-edit-mode">${state.settings.dashboardEditMode?'Exit on-page customize mode':'Use on-page customize mode'}</button></div>`;
  }
  const v25ModalBodyContentBase = modalBodyContent;
  modalBodyContent = function(type){
    if(type==='customizeDashboard') return v25CustomizeDashboardBody();
    return v25ModalBodyContentBase(type);
  };
  const v25OpenModalBase = openModal;
  openModal = function(type){
    v25OpenModalBase(type);
    if(type==='customizeDashboard'){
      document.getElementById('modalTitle').textContent='Customize dashboard layout';
      document.getElementById('modalSubtitle').textContent='Choose visible cards, move cards, and set each card width.';
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save layout</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
    }
  };
  const v25SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeDashboard'){
      e.preventDefault();
      v25EnsureDashboardState();
      const f=new FormData(e.target);
      const checked=f.getAll('v25WidgetVisible').filter(Boolean);
      const order=v25SanitizeList(f.getAll('v25DashboardOrder'), v25DefaultOrder());
      const widths={...v25DefaultWidths()};
      v25AllWidgetIds().forEach(id=>{ const v=f.get(`v25WidgetWidth_${id}`); if(['full','two-thirds','half','third'].includes(v)) widths[id]=v; });
      state.settings.dashboardWidgets = checked.length ? checked : v25DefaultVisible();
      state.settings.dashboardLayout = order;
      state.settings.dashboardWidgetWidths = widths;
      state.settings.privacyMode = f.has('privacyMode');
      audit('Dashboard layout customized');
      saveState(); closeModal(); renderAll(); showToast('Dashboard layout saved.');
      return;
    }
    return v25SubmitModalBase(e);
  };
  const v25HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='dashboard-edit-mode'){
      state.settings ||= {}; state.settings.dashboardEditMode=!state.settings.dashboardEditMode; saveState();
      if(currentModal==='customizeDashboard' && document.getElementById('modalBody')) document.getElementById('modalBody').innerHTML=v25CustomizeDashboardBody();
      renderDashboard(); showToast(state.settings.dashboardEditMode?'Dashboard customize mode on.':'Dashboard customize mode off.'); return;
    }
    if(action==='export-persistence-backup'){
      exportData(); return;
    }
    if(action==='open-persistence-settings'){
      navigate('settings'); showToast('Storage settings opened.'); return;
    }
    if(action==='retry-backend-save'){
      const runtime=window.SmartBooksRuntimePersistence;
      if(runtime?.saveStateAsync){
        runtime.saveStateAsync().then(ok=>{
          if(ok) showToast('Company data save retried.');
          else showToast('Company data save still needs attention.');
          renderDashboard();
        });
      }else{
        showToast('Shared storage is not turned on.');
      }
      return;
    }
    if(action==='retry-backend-load'){
      const runtime=window.SmartBooksRuntimePersistence;
      if(runtime?.bootstrap){
        runtime.backendLoaded=false;
        runtime.backendLoadFailed=false;
        runtime.backendLoadState='not-started';
        runtime.bootstrap().then(ok=>{
          renderAll();
          showToast(ok ? 'Latest company data loaded.' : 'Company data load still needs attention.');
        });
      }else{
        showToast('Shared storage is not turned on.');
      }
      return;
    }
    if(action==='dashboard-widget-move'){
      const [wid,dir]=String(id||'').split(':');
      if(v25MoveModalLayoutRow(wid,dir||'down')){ showToast('Dashboard card moved. Save layout to apply.'); return; }
      if(v25MoveWidget(wid,dir||'down')){ saveState(); if(currentModal==='customizeDashboard' && document.getElementById('modalBody')) document.getElementById('modalBody').innerHTML=v25CustomizeDashboardBody(); renderDashboard(); showToast('Dashboard card moved.'); }
      return;
    }
    if(action==='dashboard-widget-hide'){
      v25EnsureDashboardState();
      state.settings.dashboardWidgets=(state.settings.dashboardWidgets||[]).filter(x=>x!==id);
      if(!state.settings.dashboardWidgets.length) state.settings.dashboardWidgets=v25DefaultVisible();
      saveState(); renderDashboard(); showToast('Dashboard card hidden. Restore it from Customize dashboard.'); return;
    }
    if(action==='dashboard-widget-width-cycle'){
      const next=v25CycleWidth(id); saveState(); renderDashboard(); showToast(`Card width changed to ${next.replace('-', ' ')}.`); return;
    }
    if(action==='dashboard-layout-reset'){
      if(currentModal==='customizeDashboard'){
        const snapshot={
          layout:state.settings?.dashboardLayout,
          widgets:state.settings?.dashboardWidgets,
          widths:state.settings?.dashboardWidgetWidths,
          heights:state.settings?.dashboardWidgetHeights,
          privacyMode:state.settings?.privacyMode
        };
        state.settings.dashboardLayout=v25DefaultOrder();
        state.settings.dashboardWidgets=v25DefaultVisible();
        state.settings.dashboardWidgetWidths=v25DefaultWidths();
        if(typeof v26DefaultHeights==='function') state.settings.dashboardWidgetHeights=v26DefaultHeights();
        state.settings.privacyMode=false;
        document.getElementById('modalBody').innerHTML=v25CustomizeDashboardBody();
        state.settings.dashboardLayout=snapshot.layout;
        state.settings.dashboardWidgets=snapshot.widgets;
        state.settings.dashboardWidgetWidths=snapshot.widths;
        state.settings.dashboardWidgetHeights=snapshot.heights;
        state.settings.privacyMode=snapshot.privacyMode;
        showToast('Default dashboard layout restored in the manager. Save to apply.');
        return;
      }
      state.settings ||= {}; state.settings.dashboardLayout=v25DefaultOrder(); state.settings.dashboardWidgets=v25DefaultVisible(); state.settings.dashboardWidgetWidths=v25DefaultWidths(); saveState();
      if(currentModal==='customizeDashboard' && document.getElementById('modalBody')) document.getElementById('modalBody').innerHTML=v25CustomizeDashboardBody();
      renderDashboard(); showToast('Default dashboard layout restored.'); return;
    }
    return v25HandleActionBase(action,id);
  };
  document.addEventListener('dragstart', function(e){
    const card=e.target.closest?.('.v25-widget[draggable="true"]');
    if(!card) return;
    e.dataTransfer?.setData('text/plain', card.getAttribute('data-v25-widget')||'');
    e.dataTransfer.effectAllowed='move';
  });
  document.addEventListener('dragover', function(e){
    const card=e.target.closest?.('.v25-widget[draggable="true"]');
    if(!card) return;
    e.preventDefault(); card.classList.add('v25-drag-over');
  });
  document.addEventListener('dragleave', function(e){
    const card=e.target.closest?.('.v25-widget.v25-drag-over');
    if(card) card.classList.remove('v25-drag-over');
  });
  document.addEventListener('drop', function(e){
    const target=e.target.closest?.('.v25-widget[draggable="true"]');
    if(!target) return;
    e.preventDefault(); target.classList.remove('v25-drag-over');
    const from=e.dataTransfer?.getData('text/plain'); const to=target.getAttribute('data-v25-widget');
    if(!from || !to || from===to) return;
    v25EnsureDashboardState();
    const order=v25SanitizeList(state.settings.dashboardLayout, v25DefaultOrder());
    const fromIdx=order.indexOf(from), toIdx=order.indexOf(to);
    if(fromIdx<0 || toIdx<0) return;
    order.splice(fromIdx,1); order.splice(toIdx,0,from); state.settings.dashboardLayout=order;
    saveState(); renderDashboard(); showToast('Dashboard card moved.');
  });


  // ---------- V26: Dashboard widget hydration + resize controls ----------
  // Keeps the V25 move/top/up/down/across/hide workflow and adds independent
  // size and height controls so table-heavy cards can be widened or made taller.
  const v26WidgetWidths = ['third','half','two-thirds','full'];
  const v26WidgetHeights = ['compact','standard','tall','auto'];
  function v26DefaultWidths(){
    return {
      cashflow:'full',
      invoices:'third',
      expenses:'third',
      bank:'third',
      feed:'full',
      pl:'third',
      recent:'full',
      setup:'third',
      funnel:'full'
    };
  }
  function v26DefaultHeights(){
    return {
      cashflow:'standard',
      invoices:'standard',
      expenses:'standard',
      bank:'standard',
      feed:'standard',
      pl:'standard',
      recent:'tall',
      setup:'standard',
      funnel:'standard'
    };
  }
  v25DefaultWidths = function(){ return v26DefaultWidths(); };
  const v26BaseEnsureDashboardState = v25EnsureDashboardState;
  v25EnsureDashboardState = function(){
    v26BaseEnsureDashboardState();
    state.settings ||= {};
    state.settings.dashboardWidgetWidths = {...v26DefaultWidths(), ...(state.settings.dashboardWidgetWidths||{})};
    state.settings.dashboardWidgetHeights = {...v26DefaultHeights(), ...(state.settings.dashboardWidgetHeights||{})};
    if(!state.settings.v26DashboardSizingInitialized){
      // V25 allowed table-heavy cards to stay too narrow. Use safer first-load defaults,
      // while still allowing the user to change them after loading V26.
      if(!state.settings.dashboardWidgetWidths.recent || state.settings.dashboardWidgetWidths.recent==='third') state.settings.dashboardWidgetWidths.recent='full';
      if(!state.settings.dashboardWidgetHeights.recent || state.settings.dashboardWidgetHeights.recent==='standard') state.settings.dashboardWidgetHeights.recent='tall';
      state.settings.v26DashboardSizingInitialized=true;
    }
    Object.keys(state.settings.dashboardWidgetWidths||{}).forEach(id=>{
      if(!v25AllWidgetIds().includes(id)) delete state.settings.dashboardWidgetWidths[id];
      else if(!v26WidgetWidths.includes(state.settings.dashboardWidgetWidths[id])) state.settings.dashboardWidgetWidths[id]=v26DefaultWidths()[id]||'third';
    });
    Object.keys(state.settings.dashboardWidgetHeights||{}).forEach(id=>{
      if(!v25AllWidgetIds().includes(id)) delete state.settings.dashboardWidgetHeights[id];
      else if(!v26WidgetHeights.includes(state.settings.dashboardWidgetHeights[id])) state.settings.dashboardWidgetHeights[id]=v26DefaultHeights()[id]||'standard';
    });
  };
  function v26WidgetHeight(id){
    v25EnsureDashboardState();
    const val=state.settings.dashboardWidgetHeights?.[id] || v26DefaultHeights()[id] || 'standard';
    return v26WidgetHeights.includes(val) ? val : 'standard';
  }
  v25WidgetClasses = function(id){
    return `v25-widget v25-${v25WidgetWidth(id)} v26-h-${v26WidgetHeight(id)}`;
  };
  function v26Option(value,current,label){
    return `<option value="${value}" ${value===current?'selected':''}>${label}</option>`;
  }
  function v26WidthSelect(id){
    const w=v25WidgetWidth(id);
    return `<label class="v26-control-label"><span>Size</span><select class="v26-size-select" data-v26-widget-width="${escapeHTML(id)}" aria-label="${escapeHTML((v25DashboardDefs()[id]||{}).label||id)} width">${v26Option('third',w,'Small')}${v26Option('half',w,'Medium')}${v26Option('two-thirds',w,'Large')}${v26Option('full',w,'Full')}</select></label>`;
  }
  function v26HeightSelect(id){
    const h=v26WidgetHeight(id);
    return `<label class="v26-control-label"><span>Height</span><select class="v26-height-select" data-v26-widget-height="${escapeHTML(id)}" aria-label="${escapeHTML((v25DashboardDefs()[id]||{}).label||id)} height">${v26Option('compact',h,'Compact')}${v26Option('standard',h,'Standard')}${v26Option('tall',h,'Tall')}${v26Option('auto',h,'Auto')}</select></label>`;
  }
  v25WidgetControls = function(id){
    const defs=v25DashboardDefs();
    if(!state.settings?.dashboardEditMode) return '';
    return `<div class="v25-widget-controls v26-widget-controls"><div class="v26-widget-title"><span class="v25-drag-handle" aria-hidden="true">⋮⋮</span><strong>${escapeHTML(defs[id]?.label||id)}</strong></div><div class="v25-widget-buttons v26-widget-buttons"><div class="v26-control-group" aria-label="Move controls"><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:top" title="Move to top">⇱</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:up" title="Move up">↑</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:down" title="Move down">↓</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:bottom" title="Move to bottom">⇲</button><button type="button" class="btn square" data-action="dashboard-widget-width-cycle" data-id="${id}" title="Cycle width / move across row">↔</button></div><div class="v26-control-group">${v26WidthSelect(id)}${v26HeightSelect(id)}</div><button type="button" class="btn square danger" data-action="dashboard-widget-hide" data-id="${id}" title="Hide card">Hide</button></div></div>`;
  };
  function v26RestoreVisibleWidgetDisplays(){
    const page=document.getElementById('page-dashboard');
    if(!page) return;
    page.querySelectorAll('.v25-widget').forEach(section=>{
      section.style.display='';
      section.querySelectorAll('#invoiceSummaryCard,#expensesCard,#bankCard,#cashFlowHero,#businessFeedBlock,#plCard,#recentTransactions,#setupCard,#funnelWidget,#funnelCards,#businessFeed').forEach(el=>{ el.style.display=''; });
    });
    document.body.classList.toggle('privacy-mode', !!state.settings?.privacyMode);
  }
  function v26IsEmptyElement(id){
    const el=document.getElementById(id);
    if(!el) return false;
    return !String(el.innerHTML||'').trim() || el.style.display==='none';
  }
  function v26HydrateEmptyWidgets(){
    const t=totals();
    v26RestoreVisibleWidgetDisplays();
    if(v26IsEmptyElement('cashFlowHero')) renderCashFlowHero();
    if(v26IsEmptyElement('invoiceSummaryCard')) renderInvoiceSummaryCard();
    if(v26IsEmptyElement('expensesCard')) renderExpensesCard();
    if(v26IsEmptyElement('bankCard')) renderBankCard(t);
    if(document.getElementById('businessFeed') && v26IsEmptyElement('businessFeed')) renderBusinessFeed(t);
    if(v26IsEmptyElement('plCard')) renderPLCard(t);
    if(v26IsEmptyElement('recentTransactions')) renderRecentTransactions();
    if(v26IsEmptyElement('setupCard')) renderSetupCard();
    if(document.getElementById('funnelCards') && v26IsEmptyElement('funnelCards')) renderFunnel(t);
    if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(document.getElementById('page-dashboard') || document);
  }
  v25RenderAllWidgetContent = function(){
    const t=totals();
    v26RestoreVisibleWidgetDisplays();
    if(document.getElementById('cashFlowHero')) renderCashFlowHero();
    if(document.getElementById('invoiceSummaryCard')) renderInvoiceSummaryCard();
    if(document.getElementById('expensesCard')) renderExpensesCard();
    if(document.getElementById('bankCard')) renderBankCard(t);
    if(document.getElementById('businessFeed')) renderBusinessFeed(t);
    if(document.getElementById('plCard')) renderPLCard(t);
    if(document.getElementById('recentTransactions')) renderRecentTransactions();
    if(document.getElementById('setupCard')) renderSetupCard();
    if(document.getElementById('funnelCards')) renderFunnel(t);
    ensureFeedHeaderControls?.();
    updateBusinessFeedHeaderCount?.();
    applyQuickActionVisibility?.(document.getElementById('page-dashboard'));
    cleanProductLanguageInDOM?.(document.getElementById('page-dashboard'));
    v26RestoreVisibleWidgetDisplays();
    v26HydrateEmptyWidgets();
  };
  function injectV26DashboardStyles(){
    if(document.getElementById('v26-dashboard-resize-styles')) return;
    const style=document.createElement('style');
    style.id='v26-dashboard-resize-styles';
    style.textContent=`
      body.v8-ui .v26-widget-controls{align-items:flex-start;gap:12px}
      body.v8-ui .v26-widget-title{display:flex;align-items:center;gap:8px;min-width:160px;padding-top:5px}
      body.v8-ui .v26-widget-buttons{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;flex:1}
      body.v8-ui .v26-control-group{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      body.v8-ui .v26-control-label{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:900;color:#667085;text-transform:uppercase;letter-spacing:.035em}
      body.v8-ui .v26-control-label select{border:1px solid #cbd5df;background:#fff;color:#172033;border-radius:999px;padding:6px 26px 6px 10px;font-size:12px;font-weight:900;text-transform:none;letter-spacing:0;min-width:92px}
      body.v8-ui .v25-widget.v26-h-compact>.card, body.v8-ui .v25-widget.v26-h-compact>.dashboard-feed-block{max-height:330px;overflow:auto}
      body.v8-ui .v25-widget.v26-h-standard>.card, body.v8-ui .v25-widget.v26-h-standard>.dashboard-feed-block{min-height:0}
      body.v8-ui .v25-widget.v26-h-tall>.card, body.v8-ui .v25-widget.v26-h-tall>.dashboard-feed-block{min-height:520px}
      body.v8-ui .v25-widget.v26-h-auto>.card, body.v8-ui .v25-widget.v26-h-auto>.dashboard-feed-block{min-height:0;max-height:none;overflow:visible}
      body.v8-ui .v25-widget[data-v25-widget="recent"] #recentTransactions{overflow-x:auto;overflow-y:auto}
      body.v8-ui .v25-widget[data-v25-widget="recent"] #recentTransactions table{min-width:720px}
      body.v8-ui .v25-widget[data-v25-widget="recent"].v26-h-compact #recentTransactions{max-height:360px}
      body.v8-ui .v25-widget[data-v25-widget="recent"].v26-h-standard #recentTransactions{max-height:520px}
      body.v8-ui .v25-widget[data-v25-widget="recent"].v26-h-tall #recentTransactions{max-height:720px}
      body.v8-ui .v25-widget[data-v25-widget="recent"].v26-h-auto #recentTransactions{max-height:none}
      body.v8-ui .v26-layout-row{grid-template-columns:minmax(190px,1fr) 148px 148px auto!important}
      body.v8-ui .v26-layout-row select{min-width:132px}
      body.v8-ui.dark-mode .v26-control-label{color:#aab8c7}
      body.v8-ui.dark-mode .v26-control-label select{background:#0f1924;border-color:#3a5065;color:#edf3f8}
      @media(max-width:1180px){body.v8-ui .v26-layout-row{grid-template-columns:1fr!important}.v26-widget-buttons{justify-content:flex-start!important}}
      @media(max-width:760px){body.v8-ui .v26-widget-buttons{justify-content:flex-start}.v26-control-label{width:100%;justify-content:space-between}.v26-control-label select{min-width:140px}}
    `;
    document.head.appendChild(style);
  }
  const v26RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    injectV26DashboardStyles();
    v25EnsureDashboardState();
    v26RenderDashboardBase();
    injectV26DashboardStyles();
    v26RestoreVisibleWidgetDisplays();
    v26HydrateEmptyWidgets();
    if(typeof requestAnimationFrame==='function') requestAnimationFrame(()=>v26HydrateEmptyWidgets());
  };
  v25CustomizeDashboardBody = function(){
    v25EnsureDashboardState();
    const defs=v25DashboardDefs();
    const visible=new Set(state.settings.dashboardWidgets || v25DefaultVisible());
    const order=v25SanitizeList(state.settings.dashboardLayout, v25DefaultOrder());
    const rows=order.map(id=>{
      const def=defs[id];
      if(!def) return '';
      const w=v25WidgetWidth(id);
      const h=v26WidgetHeight(id);
      return `<div class="v25-layout-row v26-layout-row" data-v25-layout-row="${id}"><label><input type="checkbox" name="v25WidgetVisible" value="${id}" ${visible.has(id)?'checked':''}><input type="hidden" name="v25DashboardOrder" value="${id}">${escapeHTML(def.label)}</label><select name="v25WidgetWidth_${id}" aria-label="${escapeHTML(def.label)} width">${v26Option('third',w,'Size: Small / 1/3 row')}${v26Option('half',w,'Size: Medium / 1/2 row')}${v26Option('two-thirds',w,'Size: Large / 2/3 row')}${v26Option('full',w,'Size: Full row')}</select><select name="v26WidgetHeight_${id}" aria-label="${escapeHTML(def.label)} height">${v26Option('compact',h,'Height: Compact')}${v26Option('standard',h,'Height: Standard')}${v26Option('tall',h,'Height: Tall')}${v26Option('auto',h,'Height: Auto')}</select><div class="v25-layout-actions" aria-label="${escapeHTML(def.label)} move controls"><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:top" title="Move to top" aria-label="Move ${escapeHTML(def.label)} to top">↖</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:up" title="Move up" aria-label="Move ${escapeHTML(def.label)} up">↑</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:down" title="Move down" aria-label="Move ${escapeHTML(def.label)} down">↓</button><button type="button" class="btn square" data-action="dashboard-widget-move" data-id="${id}:bottom" title="Move to bottom" aria-label="Move ${escapeHTML(def.label)} to bottom">↘</button></div></div>`;
    }).join('');
    return `<div class="v25-layout-help"><strong>Dashboard layout customization:</strong> move cards with the arrows, resize width with Small/Medium/Large/Full, and resize height with Compact/Standard/Tall/Auto. Movement controls remain available after resizing.</div><div class="v25-layout-list">${rows}</div><label class="v25-privacy-row"><input type="checkbox" name="privacyMode" ${state.settings.privacyMode?'checked':''}> <strong>Privacy mode: mask dollar values on the dashboard</strong></label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button type="button" class="btn" data-action="dashboard-layout-reset">Restore default layout</button><button type="button" class="btn" data-action="dashboard-edit-mode">${state.settings.dashboardEditMode?'Exit on-page customize mode':'Use on-page customize mode'}</button></div>`;
  };
  const v26SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeDashboard'){
      e.preventDefault();
      v25EnsureDashboardState();
      const f=new FormData(e.target);
      const checked=f.getAll('v25WidgetVisible').filter(Boolean);
      const order=v25SanitizeList(f.getAll('v25DashboardOrder'), v25DefaultOrder());
      const widths={...v26DefaultWidths()};
      const heights={...v26DefaultHeights()};
      v25AllWidgetIds().forEach(id=>{
        const w=f.get(`v25WidgetWidth_${id}`);
        const h=f.get(`v26WidgetHeight_${id}`);
        if(v26WidgetWidths.includes(w)) widths[id]=w;
        if(v26WidgetHeights.includes(h)) heights[id]=h;
      });
      state.settings.dashboardWidgets = checked.length ? checked : v25DefaultVisible();
      state.settings.dashboardLayout = order;
      state.settings.dashboardWidgetWidths = widths;
      state.settings.dashboardWidgetHeights = heights;
      state.settings.privacyMode = f.has('privacyMode');
      audit('Dashboard layout and sizing customized');
      saveState(); closeModal(); renderAll(); showToast('Dashboard layout and sizing saved.');
      return;
    }
    return v26SubmitModalBase(e);
  };
  const v26HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='dashboard-layout-reset'){
      state.settings ||= {};
      state.settings.dashboardLayout=v25DefaultOrder();
      state.settings.dashboardWidgets=v25DefaultVisible();
      state.settings.dashboardWidgetWidths=v26DefaultWidths();
      state.settings.dashboardWidgetHeights=v26DefaultHeights();
      state.settings.v26DashboardSizingInitialized=true;
      saveState();
      if(currentModal==='customizeDashboard' && document.getElementById('modalBody')) document.getElementById('modalBody').innerHTML=v25CustomizeDashboardBody();
      renderDashboard(); showToast('Default dashboard layout and sizing restored.'); return;
    }
    if(action==='dashboard-widget-height-cycle'){
      v25EnsureDashboardState();
      const current=v26WidgetHeight(id);
      const next=v26WidgetHeights[(v26WidgetHeights.indexOf(current)+1)%v26WidgetHeights.length] || 'standard';
      state.settings.dashboardWidgetHeights[id]=next;
      saveState(); renderDashboard(); showToast(`Card height changed to ${next}.`); return;
    }
    return v26HandleActionBase(action,id);
  };
  document.addEventListener('change', function(e){
    const widthEl=e.target.closest?.('[data-v26-widget-width]');
    if(widthEl){
      const id=widthEl.getAttribute('data-v26-widget-width');
      const val=widthEl.value;
      if(v25AllWidgetIds().includes(id) && v26WidgetWidths.includes(val)){
        v25EnsureDashboardState(); state.settings.dashboardWidgetWidths[id]=val; saveState(); renderDashboard(); showToast(`Card size changed to ${widthEl.options[widthEl.selectedIndex]?.text || val}.`);
      }
      return;
    }
    const heightEl=e.target.closest?.('[data-v26-widget-height]');
    if(heightEl){
      const id=heightEl.getAttribute('data-v26-widget-height');
      const val=heightEl.value;
      if(v25AllWidgetIds().includes(id) && v26WidgetHeights.includes(val)){
        v25EnsureDashboardState(); state.settings.dashboardWidgetHeights[id]=val; saveState(); renderDashboard(); showToast(`Card height changed to ${heightEl.options[heightEl.selectedIndex]?.text || val}.`);
      }
      return;
    }
  });


  // ---------- V27: Dashboard Widget Library + financial insight widgets ----------
  // Adds optional dashboard cards for A/R aging, A/P aging, estimates pipeline,
  // GST/HST summary, cash forecast, revenue mix, expense trend, bank review queue,
  // and credits. These widgets inherit the V25/V26 move, hide, width, and height controls.
  function v27TodayDate(){ return new Date(todayISO()+'T00:00:00'); }
  function v27Date(v){ const d=new Date(String(v||todayISO())+'T00:00:00'); return isNaN(d.getTime()) ? v27TodayDate() : d; }
  function v27DaysPastDue(dueDate){ return Math.floor((v27TodayDate()-v27Date(dueDate))/86400000); }
  function v27IsCurrentMonth(date){ return String(date||'').slice(0,7) === todayISO().slice(0,7); }
  function v27ShortName(s,n=26){ const t=String(s||''); return t.length>n ? escapeHTML(t.slice(0,n-1)+'…') : escapeHTML(t); }
  function v27Pct(value,total){ return total>0 ? Math.round((num(value)/num(total))*100) : 0; }
  function v27Bar(value,total,cls=''){
    const pct=Math.max(0,Math.min(100,v27Pct(value,total)));
    return `<div class="v27-mini-bar ${cls}"><span style="width:${pct}%"></span></div>`;
  }
  function v27MiniMetric(label,value,sub=''){
    return `<div class="v27-metric"><span>${escapeHTML(label)}</span><strong>${value}</strong>${sub?`<em>${escapeHTML(sub)}</em>`:''}</div>`;
  }
  function v27OpenInvoices(){ return (state.invoices||[]).filter(i=>openAmount(i)>0.005); }
  function v27OpenBills(){ return (state.bills||[]).filter(b=>billOpenAmount(b)>0.005); }
  function v27AgingTotals(rows){
    const buckets={current:0,d30:0,d60:0,d90:0,d90p:0,overdue:0,total:0};
    rows.forEach(r=>{
      const amt=num(r.amount); const days=num(r.days);
      buckets.total += amt;
      if(days<=0) buckets.current += amt;
      else if(days<=30) buckets.d30 += amt;
      else if(days<=60) buckets.d60 += amt;
      else if(days<=90) buckets.d90 += amt;
      else buckets.d90p += amt;
      if(days>0) buckets.overdue += amt;
    });
    return buckets;
  }
  function v27WidgetHeader(title,subtitle='',actions=''){
    return `<div class="v27-widget-head"><div><h3>${escapeHTML(title)}</h3>${subtitle?`<p>${escapeHTML(subtitle)}</p>`:''}</div>${actions?`<div class="v27-widget-actions">${actions}</div>`:''}</div>`;
  }
  function renderARAgingWidget(){
    const el=document.getElementById('arAgingCard'); if(!el) return;
    const rows=v27OpenInvoices().map(i=>({id:i.id,name:getCustomer(i.customerId).name,due:i.dueDate,amount:openAmount(i),days:v27DaysPastDue(i.dueDate),status:i.status})).sort((a,b)=>b.days-a.days || b.amount-a.amount);
    const b=v27AgingTotals(rows);
    const top=rows.slice(0,5).map(r=>`<div class="v27-list-row"><div><strong>${v27ShortName(r.name,24)}</strong><span>${escapeHTML(r.id)} · due ${escapeHTML(r.due)}</span></div><div class="amount">${money(r.amount)}</div></div>`).join('');
    el.innerHTML=`${v27WidgetHeader('A/R Aging','Open customer invoices by due-date bucket','<button class="btn" data-nav="customers">Open A/R</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Open A/R',money(b.total))}${v27MiniMetric('Overdue',money(b.overdue),`${rows.filter(r=>r.days>0).length} invoice${rows.filter(r=>r.days>0).length===1?'':'s'}`)}</div>
      <div class="v27-aging-grid">
        ${v27MiniMetric('Current',money(b.current))}${v27MiniMetric('1–30',money(b.d30))}${v27MiniMetric('31–60',money(b.d60))}${v27MiniMetric('61–90',money(b.d90))}${v27MiniMetric('90+',money(b.d90p))}
      </div>
      <div class="v27-card-note">Largest open balances</div><div class="v27-list">${top || '<div class="empty">No open receivables.</div>'}</div>`;
  }
  function renderAPAgingWidget(){
    const el=document.getElementById('apAgingCard'); if(!el) return;
    const rows=v27OpenBills().map(b=>({id:b.id,name:getVendor(b.vendorId).name,due:b.dueDate,amount:billOpenAmount(b),days:v27DaysPastDue(b.dueDate),status:b.status})).sort((a,b)=>b.days-a.days || b.amount-a.amount);
    const buckets=v27AgingTotals(rows);
    const due7=rows.filter(r=>r.days<=0 && r.days>=-7).reduce((s,r)=>s+r.amount,0);
    const top=rows.slice(0,5).map(r=>`<div class="v27-list-row"><div><strong>${v27ShortName(r.name,24)}</strong><span>${escapeHTML(r.id)} · due ${escapeHTML(r.due)}</span></div><div class="amount">${money(r.amount)}</div></div>`).join('');
    el.innerHTML=`${v27WidgetHeader('A/P Aging','Open vendor bills and upcoming cash requirements','<button class="btn" data-nav="expenses">Review bills</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Open A/P',money(buckets.total))}${v27MiniMetric('Due next 7 days',money(due7))}${v27MiniMetric('Overdue',money(buckets.overdue))}</div>
      <div class="v27-aging-grid">${v27MiniMetric('Current',money(buckets.current))}${v27MiniMetric('1–30',money(buckets.d30))}${v27MiniMetric('31–60',money(buckets.d60))}${v27MiniMetric('61–90',money(buckets.d90))}${v27MiniMetric('90+',money(buckets.d90p))}</div>
      <div class="v27-card-note">Bills needing payment attention</div><div class="v27-list">${top || '<div class="empty">No open payables.</div>'}</div>`;
  }
  function v27EstimateAmount(e){
    if(typeof estimateAmount==='function') return estimateAmount(e);
    return num(e.total ?? (num(e.subtotal)+num(e.tax)-num(e.discount)));
  }
  function v27EstimateStatus(e){
    if(typeof v18EstimateDisplayStatus==='function') return v18EstimateDisplayStatus(e);
    return e?.convertedInvoiceId || String(e?.status||'')==='Converted' ? 'Converted' : String(e?.status||'Draft');
  }
  function renderSalesPipelineWidget(){
    const el=document.getElementById('salesPipelineCard'); if(!el) return;
    const estimates=(state.estimates||[]).map(e=>({...e,_status:v27EstimateStatus(e),_amount:v27EstimateAmount(e)}));
    const total=estimates.reduce((s,e)=>s+e._amount,0);
    const draft=estimates.filter(e=>/draft/i.test(e._status)); const sent=estimates.filter(e=>/sent/i.test(e._status)); const accepted=estimates.filter(e=>/accepted/i.test(e._status)); const converted=estimates.filter(e=>/converted/i.test(e._status)); const expired=estimates.filter(e=>/expired/i.test(e._status));
    const acceptedAmt=accepted.reduce((s,e)=>s+e._amount,0), convertedAmt=converted.reduce((s,e)=>s+e._amount,0);
    const decided=accepted.length+converted.length+expired.length; const winRate=decided?Math.round(((accepted.length+converted.length)/decided)*100):0;
    const lines=[['Draft',draft],['Sent',sent],['Accepted',accepted],['Converted',converted],['Expired',expired]].map(([label,list])=>{
      const amt=list.reduce((s,e)=>s+e._amount,0);
      return `<div class="v27-pipeline-row"><span>${label}</span>${v27Bar(amt,total,'pipeline')}<strong>${money(amt)}</strong><em>${list.length}</em></div>`;
    }).join('');
    el.innerHTML=`${v27WidgetHeader('Sales Pipeline / Estimates','Quote value before invoicing','<button class="btn" data-nav="sales">Open estimates</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Pipeline value',money(total),`${estimates.length} estimate${estimates.length===1?'':'s'}`)}${v27MiniMetric('Accepted waiting',money(acceptedAmt),`${accepted.length} to convert`)}${v27MiniMetric('Win rate',winRate+'%','accepted / decided')}</div>
      <div class="v27-pipeline-list">${lines}</div>`;
  }
  function renderTaxSummaryWidget(){
    const el=document.getElementById('taxSummaryCard'); if(!el) return;
    const t=totals(); const collected=num(t.tax?.collected); const itc=num(t.tax?.itc); const net=collected-itc;
    const exceptions=[...(state.invoices||[]).filter(i=>num(i.tax)<=0).map(i=>`Invoice ${i.id}`),...(state.expenses||[]).filter(e=>num(e.tax)<=0).map(e=>`Expense ${e.id}`),...(state.bills||[]).filter(b=>num(b.tax)<=0).map(b=>`Bill ${b.id}`)];
    const nextPeriod=`${todayISO().slice(0,7)} filing review`;
    el.innerHTML=`${v27WidgetHeader('GST/HST Tax Summary','Collected tax less input tax credits','<button class="btn" data-nav="taxes">Open taxes</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Collected',money(collected))}${v27MiniMetric('Input credits',money(itc))}${v27MiniMetric('Net payable',money(net),nextPeriod)}</div>
      <div class="v27-tax-balance ${net>=0?'payable':'credit'}"><span>${net>=0?'Estimated amount payable':'Estimated refund / credit'}</span><strong>${money(Math.abs(net))}</strong></div>
      <div class="v27-card-note">Tax coding exceptions: ${exceptions.length || 'none'}</div>`;
  }
  function renderCashForecastWidget(){
    const el=document.getElementById('cashForecastCard'); if(!el) return;
    const cash=typeof calculateCashSummary==='function' ? calculateCashSummary() : {operatingBalance:totals().bank};
    const balance=num(cash.operatingBalance ?? totals().bank);
    const openInv=v27OpenInvoices(); const openBills=v27OpenBills();
    const in7=openInv.filter(i=>v27DaysPastDue(i.dueDate)>=-7).reduce((s,i)=>s+openAmount(i),0);
    const out7=openBills.filter(b=>v27DaysPastDue(b.dueDate)>=-7).reduce((s,b)=>s+billOpenAmount(b),0);
    const in30=openInv.filter(i=>v27DaysPastDue(i.dueDate)>=-30).reduce((s,i)=>s+openAmount(i),0);
    const out30=openBills.filter(b=>v27DaysPastDue(b.dueDate)>=-30).reduce((s,b)=>s+billOpenAmount(b),0);
    const forecast7=balance+in7-out7, forecast30=balance+in30-out30;
    el.innerHTML=`${v27WidgetHeader('Cash Forecast','Projected cash after receivables and payables','<button class="btn" data-nav="banking">Review cash</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Today',money(balance),'operating cash')}${v27MiniMetric('7-day forecast',money(forecast7),`${money(in7)} in · ${money(out7)} out`)}${v27MiniMetric('30-day forecast',money(forecast30),`${money(in30)} in · ${money(out30)} out`)}</div>
      <div class="v27-forecast-track"><div><span>Expected receipts</span>${v27Bar(in30,Math.max(in30,out30,1),'in')}</div><div><span>Upcoming bills</span>${v27Bar(out30,Math.max(in30,out30,1),'out')}</div></div>`;
  }
  function renderRevenueCustomerWidget(){
    const el=document.getElementById('revenueCustomerCard'); if(!el) return;
    const rows=Object.entries((state.invoices||[]).reduce((acc,i)=>{ const name=getCustomer(i.customerId).name; acc[name]=(acc[name]||0)+num(i.subtotal); return acc; },{})).sort((a,b)=>b[1]-a[1]);
    const total=rows.reduce((s,r)=>s+r[1],0);
    const html=rows.slice(0,6).map(([name,val])=>`<div class="v27-list-row with-bar"><div><strong>${v27ShortName(name,28)}</strong>${v27Bar(val,total,'in')}</div><div class="amount">${money(val)}<span>${v27Pct(val,total)}%</span></div></div>`).join('');
    el.innerHTML=`${v27WidgetHeader('Revenue by Customer','Top customers by invoiced revenue','<button class="btn" data-nav="customers">Customers</button>')}<div class="v27-list">${html || '<div class="empty">No customer revenue yet.</div>'}</div>`;
  }
  function renderRevenueProductWidget(){
    const el=document.getElementById('revenueProductCard'); if(!el) return;
    const acc={};
    (state.invoices||[]).forEach(i=>{
      const items=Array.isArray(i.items)&&i.items.length?i.items:[{desc:'Invoice revenue',qty:1,rate:num(i.subtotal)}];
      items.forEach(x=>{ const label=x.desc || getProduct(x.productId||'').name || 'Revenue'; const amt=num(x.amount ?? (num(x.qty)||1)*num(x.rate)); acc[label]=(acc[label]||0)+amt; });
    });
    const rows=Object.entries(acc).sort((a,b)=>b[1]-a[1]); const total=rows.reduce((s,r)=>s+r[1],0);
    const html=rows.slice(0,6).map(([name,val])=>`<div class="v27-list-row with-bar"><div><strong>${v27ShortName(name,28)}</strong>${v27Bar(val,total,'in')}</div><div class="amount">${money(val)}<span>${v27Pct(val,total)}%</span></div></div>`).join('');
    el.innerHTML=`${v27WidgetHeader('Revenue by Product / Service','What you sell most','<button class="btn" data-nav="inventory">Products</button>')}<div class="v27-list">${html || '<div class="empty">No product/service revenue yet.</div>'}</div>`;
  }
  function renderExpenseTrendWidget(){
    const el=document.getElementById('expenseTrendCard'); if(!el) return;
    const current=(state.expenses||[]).filter(e=>v27IsCurrentMonth(e.date));
    const byCat=Object.entries(current.reduce((acc,e)=>{ const name=(getAccount(e.expenseAccountId||expenseAccountFromName(e.account)).name)||e.account||'Expense'; acc[name]=(acc[name]||0)+expenseTotal(e); return acc; },{})).sort((a,b)=>b[1]-a[1]);
    const total=byCat.reduce((s,r)=>s+r[1],0);
    const html=byCat.slice(0,6).map(([cat,val])=>`<div class="v27-list-row with-bar"><div><strong>${v27ShortName(cat,28)}</strong>${v27Bar(val,total,'out')}</div><div class="amount">${money(val)}<span>${v27Pct(val,total)}%</span></div></div>`).join('');
    el.innerHTML=`${v27WidgetHeader('Expense Trend / Budget Watch','Current-month expense concentration','<button class="btn" data-nav="expenses">Expenses</button>')}<div class="v27-metric-grid">${v27MiniMetric('This month',money(total),`${current.length} expense${current.length===1?'':'s'}`)}${v27MiniMetric('Largest category',byCat[0]?money(byCat[0][1]):money(0),byCat[0]?.[0]||'—')}</div><div class="v27-list">${html || '<div class="empty">No current-month expenses.</div>'}</div>`;
  }
  function renderBankReviewQueueWidget(){
    const el=document.getElementById('bankQueueCard'); if(!el) return;
    const tx=(state.bankTransactions||[]); const need=tx.filter(x=>x.status!=='Reviewed' && x.status!=='Matched'); const suggested=need.filter(x=>String(x.status||'').toLowerCase()==='suggested'); const unreviewed=need.filter(x=>String(x.status||'').toLowerCase()==='unreviewed');
    const recs=(state.reconciliations||[]).slice().sort((a,b)=>String(b.statementDate).localeCompare(String(a.statementDate))); const last=recs[0];
    const rows=need.slice(0,5).map(x=>`<div class="v27-list-row"><div><strong>${v27ShortName(x.description,30)}</strong><span>${escapeHTML(x.date)} · ${escapeHTML(x.status||'Unreviewed')}</span></div><div class="amount">${money(x.amount)}</div></div>`).join('');
    el.innerHTML=`${v27WidgetHeader('Bank Review Queue','Transactions needing matching, categorization, or clearing','<button class="btn" data-nav="banking">Review banking</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Need review',String(need.length))}${v27MiniMetric('Suggested matches',String(suggested.length))}${v27MiniMetric('Unreviewed',String(unreviewed.length))}</div>
      <div class="v27-card-note">Last reconciliation: ${last?`${escapeHTML(last.statementDate)} · difference ${money(last.difference)}`:'No reconciliation recorded'}</div><div class="v27-list">${rows || '<div class="empty">No bank transactions need review.</div>'}</div>`;
  }
  function v27CreditTotal(list){ return (list||[]).filter(x=>!['Applied','Void','Voided'].includes(String(x.status||''))).reduce((s,x)=>s+num(x.total ?? (num(x.amount)+num(x.tax))),0); }
  function renderCreditsSummaryWidget(){
    const el=document.getElementById('creditsSummaryCard'); if(!el) return;
    ensureV11State?.();
    const customerCredits=v27CreditTotal(state.creditMemos)+v27CreditTotal(state.delayedCredits);
    const vendorCredits=v27CreditTotal(state.vendorCredits)+v27CreditTotal(state.creditCardCredits);
    const count=(state.creditMemos||[]).length+(state.delayedCredits||[]).length+(state.vendorCredits||[]).length+(state.creditCardCredits||[]).length;
    el.innerHTML=`${v27WidgetHeader('Credits Summary','Customer and vendor credits available to apply','<button class="btn" data-nav="transactions">Transactions</button>')}
      <div class="v27-metric-grid">${v27MiniMetric('Customer credits',money(customerCredits))}${v27MiniMetric('Vendor credits',money(vendorCredits))}${v27MiniMetric('Credit records',String(count))}</div>
      <div class="v27-card-note">Use this card to catch unapplied credits before sending invoices or paying bills.</div>`;
  }
  function v27RenderWidgets(){
    renderARAgingWidget(); renderAPAgingWidget(); renderSalesPipelineWidget(); renderTaxSummaryWidget(); renderCashForecastWidget();
    renderRevenueCustomerWidget(); renderRevenueProductWidget(); renderExpenseTrendWidget(); renderBankReviewQueueWidget(); renderCreditsSummaryWidget();
    if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(document.getElementById('page-dashboard') || document);
  }
  const v27BaseDashboardDefs = v25DashboardDefs;
  v25DashboardDefs = function(){
    return {
      ...v27BaseDashboardDefs(),
      arAging:{label:'A/R Aging', width:'half', html:()=>`<div class="card" id="arAgingCard"></div>`},
      apAging:{label:'A/P Aging', width:'half', html:()=>`<div class="card" id="apAgingCard"></div>`},
      salesPipeline:{label:'Sales Pipeline / Estimates', width:'half', html:()=>`<div class="card" id="salesPipelineCard"></div>`},
      taxSummary:{label:'GST/HST Tax Summary', width:'half', html:()=>`<div class="card" id="taxSummaryCard"></div>`},
      cashForecast:{label:'Cash Forecast', width:'full', html:()=>`<div class="card" id="cashForecastCard"></div>`},
      revenueCustomer:{label:'Revenue by Customer', width:'half', html:()=>`<div class="card" id="revenueCustomerCard"></div>`},
      revenueProduct:{label:'Revenue by Product / Service', width:'half', html:()=>`<div class="card" id="revenueProductCard"></div>`},
      expenseTrend:{label:'Expense Trend / Budget Watch', width:'half', html:()=>`<div class="card" id="expenseTrendCard"></div>`},
      bankQueue:{label:'Bank Review Queue', width:'half', html:()=>`<div class="card" id="bankQueueCard"></div>`},
      creditsSummary:{label:'Credits Summary', width:'third', html:()=>`<div class="card" id="creditsSummaryCard"></div>`}
    };
  };
  v25DefaultOrder = function(){ return ['cashflow','arAging','apAging','salesPipeline','taxSummary','invoices','expenses','bank','feed','pl','recent','setup','cashForecast','revenueCustomer','revenueProduct','expenseTrend','bankQueue','creditsSummary','funnel']; };
  v25DefaultVisible = function(){ return ['cashflow','arAging','apAging','salesPipeline','taxSummary','invoices','expenses','bank','feed','pl','recent','setup']; };
  const v27BaseDefaultWidths = v26DefaultWidths;
  v26DefaultWidths = function(){ return {...v27BaseDefaultWidths(), arAging:'half', apAging:'half', salesPipeline:'half', taxSummary:'half', cashForecast:'full', revenueCustomer:'half', revenueProduct:'half', expenseTrend:'half', bankQueue:'half', creditsSummary:'third'}; };
  const v27BaseDefaultHeights = v26DefaultHeights;
  v26DefaultHeights = function(){ return {...v27BaseDefaultHeights(), arAging:'standard', apAging:'standard', salesPipeline:'standard', taxSummary:'standard', cashForecast:'standard', revenueCustomer:'standard', revenueProduct:'standard', expenseTrend:'standard', bankQueue:'standard', creditsSummary:'standard'}; };
  function v27EnsureDashboardState(){
    state.settings ||= {};
    v25EnsureDashboardState();
    const all=v25AllWidgetIds();
    state.settings.dashboardLayout=v25SanitizeList(state.settings.dashboardLayout, v25DefaultOrder());
    state.settings.dashboardWidgetWidths={...v26DefaultWidths(), ...(state.settings.dashboardWidgetWidths||{})};
    state.settings.dashboardWidgetHeights={...v26DefaultHeights(), ...(state.settings.dashboardWidgetHeights||{})};
    if(!state.settings.v27DashboardInsightsInitialized){
      const visible=new Set(state.settings.dashboardWidgets||[]);
      ['arAging','apAging','salesPipeline','taxSummary'].forEach(id=>visible.add(id));
      state.settings.dashboardWidgets=Array.from(visible).filter(id=>all.includes(id));
      state.settings.v27DashboardInsightsInitialized=true;
    }
  }
  const v27RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    injectV27DashboardStyles();
    v27EnsureDashboardState();
    v27RenderDashboardBase();
    injectV27DashboardStyles();
    v27RenderWidgets();
  };
  const v27RenderAllWidgetContentBase = v25RenderAllWidgetContent;
  v25RenderAllWidgetContent = function(){ v27RenderAllWidgetContentBase(); v27RenderWidgets(); };
  const v27OpenModalBase = openModal;
  openModal = function(type){
    v27OpenModalBase(type);
    if(type==='customizeDashboard'){
      const sub=document.getElementById('modalSubtitle');
      if(sub) sub.textContent='Choose visible cards, move cards, and set card width/height. V27 adds A/R, A/P, estimates, tax, cash forecast, revenue, expense, bank queue, and credits widgets.';
    }
  };
  function injectV27DashboardStyles(){
    if(document.getElementById('v27-dashboard-widget-library-styles')) return;
    const style=document.createElement('style');
    style.id='v27-dashboard-widget-library-styles';
    style.textContent=`
      body.v8-ui .v27-widget-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
      body.v8-ui .v27-widget-head h3{margin:0;font-size:15px;text-transform:uppercase;letter-spacing:.02em;color:#344054}
      body.v8-ui .v27-widget-head p{margin:4px 0 0;color:#667085;line-height:1.35}.v27-widget-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      body.v8-ui .v27-metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:10px 0 14px}.v27-metric{border:1px solid #e4ebf2;background:#fbfcfd;border-radius:14px;padding:11px;min-width:0}.v27-metric span{display:block;color:#667085;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.035em}.v27-metric strong{display:block;font-size:20px;margin-top:4px;letter-spacing:-.03em;font-variant-numeric:tabular-nums}.v27-metric em{display:block;font-style:normal;color:#667085;font-size:12px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      body.v8-ui .v27-aging-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:10px 0 14px}.v27-aging-grid .v27-metric{padding:9px}.v27-aging-grid .v27-metric strong{font-size:15px}.v27-aging-grid .v27-metric span{font-size:11px}
      body.v8-ui .v27-list{display:grid;gap:0;border-top:1px solid #edf2f7;margin-top:8px}.v27-list-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border-bottom:1px solid #edf2f7;padding:9px 0}.v27-list-row strong{display:block}.v27-list-row span{display:block;color:#667085;font-size:12px;margin-top:2px}.v27-list-row .amount{font-weight:900;text-align:right;white-space:nowrap}.v27-list-row .amount span{font-weight:700}.v27-list-row.with-bar{grid-template-columns:minmax(0,1fr) 120px}
      body.v8-ui .v27-mini-bar{height:8px;background:#e9eef3;border-radius:999px;overflow:hidden;margin-top:7px}.v27-mini-bar span{display:block;height:100%;background:var(--green);border-radius:999px}.v27-mini-bar.out span{background:var(--orange)}.v27-mini-bar.pipeline span{background:var(--blue)}.v27-mini-bar.in span{background:var(--green)}
      body.v8-ui .v27-pipeline-list{display:grid;gap:8px;margin-top:10px}.v27-pipeline-row{display:grid;grid-template-columns:84px minmax(80px,1fr) 96px 28px;align-items:center;gap:10px}.v27-pipeline-row>span{font-weight:800}.v27-pipeline-row strong{text-align:right;font-variant-numeric:tabular-nums}.v27-pipeline-row em{font-style:normal;color:#667085;text-align:right}
      body.v8-ui .v27-tax-balance{border:1px solid #d7eedc;background:#f6fff8;border-radius:16px;padding:14px;display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}.v27-tax-balance.credit{background:#eef6ff;border-color:#c9def8}.v27-tax-balance span{font-weight:900;color:#344054}.v27-tax-balance strong{font-size:22px;font-variant-numeric:tabular-nums}.v27-card-note{color:#667085;font-size:12px;line-height:1.4;margin-top:8px}
      body.v8-ui .v27-forecast-track{display:grid;gap:12px}.v27-forecast-track span{font-weight:900;color:#344054;font-size:12px;text-transform:uppercase;letter-spacing:.035em}
      body.v8-ui.dark-mode .v27-widget-head h3,body.v8-ui.dark-mode .v27-tax-balance span,body.v8-ui.dark-mode .v27-forecast-track span{color:#f3f7fb}body.v8-ui.dark-mode .v27-widget-head p,body.v8-ui.dark-mode .v27-card-note,body.v8-ui.dark-mode .v27-list-row span,.v8-ui.dark-mode .v27-metric span,.v8-ui.dark-mode .v27-metric em{color:#aab8c7}body.v8-ui.dark-mode .v27-metric{background:#101b27;border-color:#2a3c4f}body.v8-ui.dark-mode .v27-list,body.v8-ui.dark-mode .v27-list-row{border-color:#27394b}body.v8-ui.dark-mode .v27-tax-balance{background:#112c25;border-color:#23543c}body.v8-ui.dark-mode .v27-tax-balance.credit{background:#0f2536;border-color:#264b67}
      @media(max-width:1180px){body.v8-ui .v27-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v27-aging-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:760px){body.v8-ui .v27-metric-grid,.v27-aging-grid{grid-template-columns:1fr}.v27-pipeline-row{grid-template-columns:1fr}.v27-pipeline-row strong,.v27-pipeline-row em{text-align:left}.v27-list-row.with-bar{grid-template-columns:1fr}.v27-widget-head{flex-direction:column}}
    `;
    document.head.appendChild(style);
  }



  // ---------- V28: Dashboard widget responsive sizing + aging bucket overflow fix ----------
  // Makes Small / Medium / Large / Full visibly different on the 12-column dashboard grid,
  // while protecting narrow dashboard widgets from currency-value overflow.
  function injectV28DashboardSizingStyles(){
    if(document.getElementById('v28-dashboard-responsive-sizing-styles')) return;
    const style=document.createElement('style');
    style.id='v28-dashboard-responsive-sizing-styles';
    style.textContent=`
      /* V28 hardens the width mapping so size controls have an obvious effect. */
      body.v8-ui .v25-dashboard-grid{
        display:grid!important;
        grid-template-columns:repeat(12,minmax(0,1fr))!important;
        gap:16px!important;
        align-items:start!important;
      }
      body.v8-ui .v25-dashboard-grid > .v25-widget{min-width:0!important;max-width:100%!important;}
      body.v8-ui .v25-dashboard-grid > .v25-widget.v25-third{grid-column:span 4!important;}
      body.v8-ui .v25-dashboard-grid > .v25-widget.v25-half{grid-column:span 6!important;}
      body.v8-ui .v25-dashboard-grid > .v25-widget.v25-two-thirds{grid-column:span 8!important;}
      body.v8-ui .v25-dashboard-grid > .v25-widget.v25-full{grid-column:1 / -1!important;}

      /* Keep the same span logic on tablet widths instead of making Small and Medium look the same. */
      @media (max-width:1180px) and (min-width:861px){
        body.v8-ui .v25-dashboard-grid{grid-template-columns:repeat(12,minmax(0,1fr))!important;}
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-third{grid-column:span 4!important;}
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-half{grid-column:span 6!important;}
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-two-thirds{grid-column:span 8!important;}
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-full{grid-column:1 / -1!important;}
      }
      @media (max-width:860px){
        body.v8-ui .v25-dashboard-grid{grid-template-columns:1fr!important;}
        body.v8-ui .v25-dashboard-grid > .v25-widget,
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-third,
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-half,
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-two-thirds,
        body.v8-ui .v25-dashboard-grid > .v25-widget.v25-full{grid-column:1 / -1!important;}
      }

      /* General card content overflow protection. */
      body.v8-ui .v25-widget > .card{min-width:0!important;overflow:hidden;}
      body.v8-ui .v27-metric{min-width:0;overflow:hidden;}
      body.v8-ui .v27-metric strong{
        display:block;
        max-width:100%;
        font-variant-numeric:tabular-nums lining-nums;
        font-feature-settings:"tnum" 1,"lnum" 1;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:clip;
      }

      /* Metric grids respond to widget width, not only viewport width. */
      body.v8-ui .v25-widget.v25-third .v27-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
      body.v8-ui .v25-widget.v25-third .v27-aging-grid{grid-template-columns:repeat(2,minmax(118px,1fr))!important;}
      body.v8-ui .v25-widget.v25-half .v27-aging-grid{grid-template-columns:repeat(auto-fit,minmax(112px,1fr))!important;}
      body.v8-ui .v25-widget.v25-two-thirds .v27-aging-grid,
      body.v8-ui .v25-widget.v25-full .v27-aging-grid{grid-template-columns:repeat(auto-fit,minmax(118px,1fr))!important;}

      /* A/R and A/P aging need special protection in Small size. */
      body.v8-ui .v25-widget[data-v25-widget="arAging"].v25-third .v27-aging-grid,
      body.v8-ui .v25-widget[data-v25-widget="apAging"].v25-third .v27-aging-grid{
        grid-template-columns:repeat(2,minmax(126px,1fr))!important;
      }
      body.v8-ui .v25-widget[data-v25-widget="arAging"].v25-third .v27-aging-grid .v27-metric,
      body.v8-ui .v25-widget[data-v25-widget="apAging"].v25-third .v27-aging-grid .v27-metric{
        padding:10px!important;
      }
      body.v8-ui .v25-widget[data-v25-widget="arAging"].v25-third .v27-aging-grid .v27-metric strong,
      body.v8-ui .v25-widget[data-v25-widget="apAging"].v25-third .v27-aging-grid .v27-metric strong{
        font-size:clamp(14px,1.35vw,18px)!important;
        letter-spacing:-.02em!important;
      }
      body.v8-ui .v25-widget.v25-third .v27-metric strong{font-size:clamp(15px,1.55vw,20px)!important;}
      body.v8-ui .v25-widget.v25-third .v27-widget-head{flex-direction:column;align-items:flex-start;}
      body.v8-ui .v25-widget.v25-third .v27-widget-actions{justify-content:flex-start;}

      /* When a card is extremely narrow, stack the bucket cards instead of squeezing currency. */
      @media (max-width:1120px){
        body.v8-ui .v25-widget.v25-third .v27-aging-grid{grid-template-columns:1fr!important;}
        body.v8-ui .v25-widget.v25-third .v27-aging-grid .v27-metric{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;}
        body.v8-ui .v25-widget.v25-third .v27-aging-grid .v27-metric strong{margin-top:0!important;text-align:right!important;}
      }
      @media (max-width:860px){
        body.v8-ui .v25-widget .v27-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
        body.v8-ui .v25-widget .v27-aging-grid{grid-template-columns:repeat(2,minmax(126px,1fr))!important;}
      }
      @media (max-width:560px){
        body.v8-ui .v25-widget .v27-metric-grid,
        body.v8-ui .v25-widget .v27-aging-grid{grid-template-columns:1fr!important;}
        body.v8-ui .v27-aging-grid .v27-metric{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;}
        body.v8-ui .v27-aging-grid .v27-metric strong{margin-top:0!important;text-align:right!important;}
      }

      /* Table cards should not visually crop content in narrow sizes. */
      body.v8-ui .v25-widget[data-v25-widget="recent"] #recentTransactions{overflow:auto!important;}
      body.v8-ui .v25-widget[data-v25-widget="recent"] table{min-width:720px!important;}
      body.v8-ui .v25-widget.v25-third[data-v25-widget="recent"],
      body.v8-ui .v25-widget.v25-half[data-v25-widget="recent"]{grid-column:span 8!important;}
      @media(max-width:860px){
        body.v8-ui .v25-widget.v25-third[data-v25-widget="recent"],
        body.v8-ui .v25-widget.v25-half[data-v25-widget="recent"]{grid-column:1 / -1!important;}
      }
    `;
    document.head.appendChild(style);
  }

  const v28RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    injectV28DashboardSizingStyles();
    v28RenderDashboardBase();
    injectV28DashboardSizingStyles();
  };

  const v28OpenModalBase = openModal;
  openModal = function(type){
    v28OpenModalBase(type);
    if(type==='customizeDashboard'){
      const sub=document.getElementById('modalSubtitle');
      if(sub) sub.textContent='Choose visible cards, move cards, and set Small / Medium / Large / Full widths. V28 makes the sizes visually distinct and prevents aging bucket values from overflowing.';
    }
  };



  // ---------- V29 Sidebar Menu Management ----------
  // Moved to frontend/src/features/menu-customization.js.


  // ---------- V30 Sidebar Icon Consistency Fix ----------
  // Moved to frontend/src/features/sidebar-navigation.js.


  // V33 Global Smart Search Fix
  // Moved to frontend/src/features/navigation-search.js.


  /* V35 unified invoice row action dropdown: one View dropdown per row */
  renderInvoiceActions = function(inv){
    const open = openAmount(inv), st = invoiceDisplayStatus(inv);
    const safeId = escapeHTML(inv.id);
    const receive = open > 0 && st !== 'Draft' && st !== 'Void'
      ? `<button class="btn square suggested-action" data-action="mark-paid" data-id="${safeId}">Receive payment</button>`
      : (open > 0 && st === 'Draft'
          ? `<button class="btn square" disabled title="Mark the invoice as sent before receiving payment">Receive payment</button>`
          : '');
    const send = (st === 'Draft' || !inv.sentDate) && st !== 'Void'
      ? `<button class="btn square" data-action="send-invoice" data-id="${safeId}">Send / mark sent</button>`
      : `<button class="btn square" data-action="open-send-invoice" data-id="${safeId}">Send reminder</button>`;
    const voidBtn = st !== 'Void'
      ? `<button class="btn square danger" data-action="void-invoice" data-id="${safeId}">Void</button>`
      : '';
    const menu = `
      <button class="btn square" data-action="view-invoice" data-id="${safeId}">View</button>
      ${receive}
      <button class="btn square" data-action="edit-invoice" data-id="${safeId}">Edit</button>
      ${send}
      <button class="btn square" data-action="print-invoice" data-id="${safeId}">Print / PDF</button>
      <button class="btn square" data-action="duplicate-invoice" data-id="${safeId}">Duplicate</button>
      ${voidBtn}
    `;
    return `<div class="invoice-actions"><details class="invoice-more"><summary class="btn square row-action-summary">View <span aria-hidden="true">▾</span></summary><div class="invoice-more-menu">${menu}</div></details></div>`;
  };

  function setupV35RowActionDropdowns(){
    if(document.body.dataset.v35RowActionsBound==='true') return;
    document.body.dataset.v35RowActionsBound='true';
    document.addEventListener('toggle', e=>{
      const current=e.target;
      if(!(current instanceof HTMLDetailsElement) || !current.classList.contains('invoice-more') || !current.open) return;
      document.querySelectorAll('details.invoice-more[open]').forEach(d=>{ if(d!==current) d.open=false; });
    }, true);
    document.addEventListener('click', e=>{
      if(!e.target.closest('details.invoice-more')){
        document.querySelectorAll('details.invoice-more[open]').forEach(d=>{ d.open=false; });
      }
      if(e.target.closest('details.invoice-more .invoice-more-menu button:not([disabled])')){
        setTimeout(()=>{ document.querySelectorAll('details.invoice-more[open]').forEach(d=>{ d.open=false; }); }, 0);
      }
    }, true);
  }

  const v35SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v35SetupEventListenersBase();
    setupV35RowActionDropdowns();
  };


  /* V37 invoice tracking popover cleanup: compact table cell + click-through details */
  function v37TrackingDate(value){ return value ? escapeHTML(value) : '—'; }
  function v37InvoiceTrackingSummary(inv){
    const parts=[];
    if(inv.lastViewed) parts.push('Viewed');
    const reminders=num(inv.reminderCount);
    if(reminders>0) parts.push(`${reminders} reminder${reminders===1?'':'s'}`);
    if(!parts.length && (inv.emailStatus||'Draft')==='Draft') parts.push('Not sent');
    return parts.join(' · ');
  }
  function v37TrackingStatusLabel(inv){
    const status=inv.emailStatus || invoiceDisplayStatus(inv) || 'Draft';
    if(invoiceDisplayStatus(inv)==='Overdue' && status==='Draft') return 'Not sent';
    return status;
  }
  function v37RenderInvoiceTrackingCell(inv){
    const label=v37TrackingStatusLabel(inv);
    const summary=v37InvoiceTrackingSummary(inv);
    return `<div class="tracking-cell"><button type="button" class="tracking-chip tracking-clickable" data-action="view-invoice-tracking" data-id="${escapeHTML(inv.id)}" aria-label="View tracking details for ${escapeHTML(inv.id)}">${escapeHTML(label)}</button>${summary?`<span class="tracking-mini">${escapeHTML(summary)}</span>`:''}</div>`;
  }
  function v37CloseInvoiceTrackingPopover(){
    document.querySelectorAll('.invoice-tracking-popover').forEach(p=>p.remove());
  }
  function v37OpenInvoiceTrackingPopover(id, anchor){
    const inv=(state.invoices||[]).find(i=>i.id===id);
    if(!inv || !anchor) return;
    v37CloseInvoiceTrackingPopover();
    const customer=getCustomer(inv.customerId);
    const reminders=num(inv.reminderCount);
    const nextAction=(invoiceDisplayStatus(inv)==='Draft' || !inv.sentDate) ? 'Send invoice' : 'Send reminder';
    const nextActionCode=(invoiceDisplayStatus(inv)==='Draft' || !inv.sentDate) ? 'send-invoice' : 'open-send-invoice';
    const pop=document.createElement('div');
    pop.className='invoice-tracking-popover';
    pop.setAttribute('role','dialog');
    pop.setAttribute('aria-label',`Invoice tracking ${inv.id}`);
    pop.innerHTML=`
      <div class="tracking-popover-head">
        <div><h4>Invoice tracking</h4><p>${escapeHTML(inv.id)} · ${escapeHTML(customer?.name||'Customer')}</p></div>
        <button type="button" class="tracking-popover-close" aria-label="Close tracking details">×</button>
      </div>
      <div class="tracking-popover-list">
        <div class="tracking-popover-row"><span>Status</span><strong>${escapeHTML(v37TrackingStatusLabel(inv))}</strong></div>
        <div class="tracking-popover-row"><span>Sent date</span><strong>${v37TrackingDate(inv.sentDate)}</strong></div>
        <div class="tracking-popover-row"><span>Last viewed</span><strong>${v37TrackingDate(inv.lastViewed)}</strong></div>
        <div class="tracking-popover-row"><span>Reminders</span><strong>${reminders}</strong></div>
        <div class="tracking-popover-row"><span>Delivery</span><strong>${escapeHTML(inv.deliveryMethod||'Email')}</strong></div>
        ${inv.sentTo?`<div class="tracking-popover-row"><span>Sent to</span><strong>${escapeHTML(inv.sentTo)}</strong></div>`:''}
      </div>
      <div class="tracking-popover-actions">
        <button type="button" class="btn" data-action="view-invoice" data-id="${escapeHTML(inv.id)}">View invoice</button>
        <button type="button" class="btn primary" data-action="${nextActionCode}" data-id="${escapeHTML(inv.id)}">${nextAction}</button>
        <button type="button" class="btn" data-action="edit-invoice" data-id="${escapeHTML(inv.id)}">Edit tracking</button>
      </div>`;
    document.body.appendChild(pop);
    const r=anchor.getBoundingClientRect();
    const margin=12;
    let left=Math.min(Math.max(margin, r.left), window.innerWidth - pop.offsetWidth - margin);
    let top=r.bottom + 10;
    if(top + pop.offsetHeight > window.innerHeight - margin) top=Math.max(margin, r.top - pop.offsetHeight - 10);
    pop.style.left=left+'px';
    pop.style.top=top+'px';
    const close=pop.querySelector('.tracking-popover-close');
    close?.focus({preventScroll:true});
  }

  renderInvoiceCenter = function(){
    const rows=getInvoiceCenterInvoices(), s=invoiceSettings(), activeId=state.settings.activeInvoiceId;
    const focus=activeId?`<div class="v18-focus-note"><span>Active invoice: <strong>${escapeHTML(activeId)}</strong></span><button class="btn" data-action="clear-active-invoice">Clear focus</button></div>`:'';
    return `<div class="card"><div class="toolbar"><div><h3 style="margin:0">Invoice Center</h3><div class="muted small">View invoices, track delivery from the status chip, print/PDF, receive payments, and export invoice reports.</div></div><div class="right"><button class="btn" data-action="clear-invoice-filters">Clear filters</button><button class="btn" data-action="export-invoices-csv">Export CSV</button><button class="btn" data-modal="invoiceCustomize">Customize invoice</button><button class="btn primary" data-modal="invoice">Create invoice</button></div></div>${focus}<div class="invoice-center-controls"><span class="template-chip">Current template: ${templateName(s.template)}</span><select data-invoice-template>${invoiceTemplateOptions(s.template)}</select><button class="btn soft" data-action="preview-template">Preview template</button></div>${renderInvoiceMoneybar()}${renderInvoiceFilters()}<div class="table-card">${table(['Invoice','Customer','Invoice date','Due date','Template','Status','Sent tracking','Total','Open balance','Deposit status','Actions'], rows.map(i=>{ const customer=getCustomer(i.customerId); const isActive=activeId===i.id; const invCell=`<strong class="${isActive?'v18-active-invoice':''}">${escapeHTML(i.id)}</strong>${i.sourceEstimateId?`<div class="muted small">From estimate ${escapeHTML(i.estimateNumber||i.sourceEstimateId)}</div>`:''}${num(i.depositRequired)>0?`<div class="v18-info-pill">Deposit required: ${money(i.depositRequired)} not paid</div>`:''}`; const paid=v18InvoicePaidAmount(i), dep=invoiceDepositedAmount(i); const depStatus=paid>0?`${money(dep)} deposited of ${money(paid)} paid`:'No payment'; return [invCell,escapeHTML(customer.name),i.date,i.dueDate,templateName(i.template||s.template),tagForStatus(invoiceDisplayStatus(i)),v37RenderInvoiceTrackingCell(i),`<span class="amount">${money(invoiceTotal(i))}</span>`,`<span class="amount">${money(openAmount(i))}</span>`,escapeHTML(depStatus),renderInvoiceActions(i)]; }))}</div>${invoiceReportsHTML(rows)}</div>`;
  };

  function setupV37InvoiceTrackingPopover(){
    if(document.body.dataset.v37TrackingPopoverBound==='true') return;
    document.body.dataset.v37TrackingPopoverBound='true';
    document.addEventListener('click', e=>{
      const btn=e.target.closest('[data-action="view-invoice-tracking"]');
      if(btn){
        e.preventDefault(); e.stopImmediatePropagation();
        v37OpenInvoiceTrackingPopover(btn.dataset.id, btn);
        return;
      }
      if(e.target.closest('.tracking-popover-close')){
        e.preventDefault(); v37CloseInvoiceTrackingPopover(); return;
      }
      if(e.target.closest('.invoice-tracking-popover [data-action]')){
        setTimeout(v37CloseInvoiceTrackingPopover, 0); return;
      }
      if(!e.target.closest('.invoice-tracking-popover')) v37CloseInvoiceTrackingPopover();
    }, true);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') v37CloseInvoiceTrackingPopover(); }, true);
  }
  const v37SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v37SetupEventListenersBase();
    setupV37InvoiceTrackingPopover();
  };


  /* V38 Sales & Get Paid Header Organization Fix */
  function injectV38SalesHeaderStyles(){
    if(document.getElementById('v38-sales-header-style')) return;
    const style=document.createElement('style');
    style.id='v38-sales-header-style';
    style.textContent=`
      .sales-page-header-card{
        background:#fff;
        border:1px solid #dbe5ee;
        border-radius:22px;
        box-shadow:0 2px 10px rgba(16,24,40,.04);
        padding:20px;
        margin:0 0 18px;
      }
      .sales-page-header-card .section-header{
        margin:0;
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        gap:18px;
        align-items:start;
      }
      .sales-page-header-card .section-header h2{
        margin:0;
        font-size:28px;
        letter-spacing:-.035em;
      }
      .sales-page-header-card .section-header p{
        margin:6px 0 0;
        color:var(--muted);
        line-height:1.45;
        max-width:680px;
      }
      .sales-header-actions{
        display:flex !important;
        gap:8px !important;
        align-items:center;
        justify-content:flex-end;
        flex-wrap:nowrap !important;
        white-space:nowrap;
      }
      .sales-header-actions .btn{padding:9px 14px;}
      .sales-tabbar-v38{
        margin:18px 0 0;
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        align-items:center;
      }
      .sales-tabbar-v38 .tab-btn{margin:0;}
      .sales-more-tabs{
        position:relative;
        display:inline-flex;
        align-items:center;
      }
      .sales-more-trigger.active,
      .sales-more-tabs:focus-within .sales-more-trigger,
      .sales-more-tabs:hover .sales-more-trigger{
        background:var(--green);
        border-color:var(--green);
        color:#fff;
      }
      .sales-more-menu{
        position:absolute;
        right:0;
        top:calc(100% + 8px);
        min-width:230px;
        background:#fff;
        border:1px solid #d8e2ea;
        border-radius:16px;
        box-shadow:0 18px 44px rgba(16,24,40,.16);
        padding:8px;
        display:none;
        z-index:90;
      }
      .sales-more-tabs:hover .sales-more-menu,
      .sales-more-tabs:focus-within .sales-more-menu,
      .sales-more-tabs.open .sales-more-menu{display:grid;gap:6px;}
      .sales-more-menu .tab-btn{
        width:100%;
        justify-content:flex-start;
        border-radius:12px;
        text-align:left;
      }
      body.dark-mode .sales-page-header-card,
      body.v8-ui.dark-mode .sales-page-header-card{
        background:#14202d;
        border-color:#2a3c4f;
        box-shadow:0 12px 32px rgba(0,0,0,.28);
      }
      body.dark-mode .sales-page-header-card .section-header h2,
      body.v8-ui.dark-mode .sales-page-header-card .section-header h2{color:#f3f7fb;}
      body.dark-mode .sales-page-header-card .section-header p,
      body.v8-ui.dark-mode .sales-page-header-card .section-header p{color:#aab8c7;}
      body.dark-mode .sales-more-menu,
      body.v8-ui.dark-mode .sales-more-menu{
        background:#101b27;
        border-color:#34495e;
        box-shadow:0 18px 44px rgba(0,0,0,.45);
      }
      @media(max-width:1180px){
        .sales-page-header-card .section-header{grid-template-columns:1fr;}
        .sales-header-actions{justify-content:flex-start;flex-wrap:wrap !important;}
      }
      @media(max-width:720px){
        .sales-page-header-card{padding:16px;border-radius:18px;}
        .sales-page-header-card .section-header h2{font-size:24px;}
        .sales-header-actions .btn{flex:1 1 calc(50% - 8px);}
        .sales-tabbar-v38{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;}
        .sales-tabbar-v38 .tab-btn{flex:0 0 auto;}
        .sales-more-menu{left:0;right:auto;}
      }
    `;
    document.head.appendChild(style);
  }

  function v38SalesTabsList(){
    return [
      ['overview','Overview'],
      ['transactions','Sales Transactions'],
      ['estimates','Estimates'],
      ['invoices','Invoice Center'],
      ['paymentLinks','Payment Links'],
      ['recurring','Recurring Payments'],
      ['salesOrders','Sales Orders'],
      ['salesChannels','Sales Channels'],
      ['payouts','Payouts'],
      ['productsServices','Products & Services']
    ];
  }
  function v38SalesTabbar(){
    const active=state.settings.salesTab || 'overview';
    const primaryIds=new Set(['overview','transactions','estimates','invoices','paymentLinks','recurring']);
    const tabs=v38SalesTabsList();
    const primary=tabs.filter(t=>primaryIds.has(t[0]));
    const more=tabs.filter(t=>!primaryIds.has(t[0]));
    const tabButton=([id,label], extra='')=>`<button class="tab-btn ${active===id?'active':''} ${extra}" data-action="set-sales-tab" data-id="${id}">${escapeHTML(label)}</button>`;
    const moreActive=more.some(([id])=>id===active);
    return `<div class="tabbar sales-tabbar-v38">${primary.map(t=>tabButton(t)).join('')}<div class="sales-more-tabs"><button type="button" class="tab-btn sales-more-trigger ${moreActive?'active':''}" aria-haspopup="true" aria-expanded="false">More ▾</button><div class="sales-more-menu">${more.map(t=>tabButton(t)).join('')}</div></div></div>`;
  }
  salesTabbar = v38SalesTabbar;
  if(typeof v17SalesTabs === 'function') v17SalesTabs = v38SalesTabbar;

  function v38OrganizeSalesHeader(){
    injectV38SalesHeaderStyles();
    const page=document.getElementById('page-sales');
    if(!page || page.querySelector(':scope > .sales-page-header-card')) return;
    const children=Array.from(page.children);
    const headerEl=children.find(el=>el.classList && el.classList.contains('section-header'));
    if(!headerEl) return;
    const tabbar=Array.from(page.children).find(el=>el.classList && el.classList.contains('tabbar'));
    const title=headerEl.querySelector('h2');
    const subtitle=headerEl.querySelector('p');
    if(title) title.textContent='Sales & Get Paid';
    if(subtitle) subtitle.textContent='Manage invoices, payments, estimates, sales orders, and customer activity.';
    const actionBox=headerEl.children[1];
    if(actionBox){
      actionBox.className='sales-header-actions';
      actionBox.removeAttribute('style');
      actionBox.innerHTML=`<button class="btn" data-modal="payment">Receive payment</button><button class="btn" data-modal="paymentLink">Payment link</button><button class="btn" data-modal="salesOrder">Sales order</button><button class="btn primary" data-modal="invoice">Create invoice</button>`;
    }
    const card=document.createElement('div');
    card.className='sales-page-header-card';
    page.insertBefore(card, headerEl);
    card.appendChild(headerEl);
    if(tabbar){
      tabbar.classList.add('sales-tabbar-v38');
      card.appendChild(tabbar);
    }
  }

  const v38RenderSalesBase = renderSales;
  renderSales = function(){
    v38RenderSalesBase();
    v38OrganizeSalesHeader();
  };
  const v38RenderPageBase = renderPage;
  renderPage = function(page){
    v38RenderPageBase(page);
    if(page==='sales') v38OrganizeSalesHeader();
  };



