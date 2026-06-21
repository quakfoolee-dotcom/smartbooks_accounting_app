// SmartBooks legacy module split from the original single-file script.
// Loaded by frontend/index.html in dependency order.

  // ---------- V39: Customize Layout Save Performance Fix ----------
  // Saves the small dashboard layout JSON first, closes the modal immediately,
  // then re-renders only the current view on the next animation frame. This keeps
  // Save layout from feeling stuck while cards/charts are rebuilt.
  function injectV39CustomizeSaveStyles(){
    if(document.getElementById('v39-customize-save-styles')) return;
    const style=document.createElement('style');
    style.id='v39-customize-save-styles';
    style.textContent=`
      .btn.v39-saving{position:relative;pointer-events:none;opacity:.82;}
      .btn.v39-saving::after{content:'';width:12px;height:12px;border:2px solid rgba(255,255,255,.55);border-top-color:#fff;border-radius:50%;display:inline-block;margin-left:8px;vertical-align:-2px;animation:v39spin .75s linear infinite;}
      @keyframes v39spin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(style);
  }
  function v39DashboardLayoutSnapshot(){
    v25EnsureDashboardState?.();
    return JSON.stringify({
      widgets:state.settings?.dashboardWidgets || [],
      layout:state.settings?.dashboardLayout || [],
      widths:state.settings?.dashboardWidgetWidths || {},
      heights:state.settings?.dashboardWidgetHeights || {},
      privacy:!!state.settings?.privacyMode
    });
  }
  function v39ReadDashboardLayoutForm(form){
    v25EnsureDashboardState?.();
    const f=new FormData(form);
    const checked=f.getAll('v25WidgetVisible').filter(Boolean);
    const order=v25SanitizeList(f.getAll('v25DashboardOrder'), v25DefaultOrder());
    const widths={...(typeof v26DefaultWidths==='function' ? v26DefaultWidths() : v25DefaultWidths())};
    const heights={...(typeof v26DefaultHeights==='function' ? v26DefaultHeights() : {})};
    v25AllWidgetIds().forEach(id=>{
      const w=f.get(`v25WidgetWidth_${id}`);
      const h=f.get(`v26WidgetHeight_${id}`);
      if((typeof v26WidgetWidths!=='undefined' ? v26WidgetWidths : ['third','half','two-thirds','full']).includes(w)) widths[id]=w;
      if((typeof v26WidgetHeights!=='undefined' ? v26WidgetHeights : ['compact','standard','tall','auto']).includes(h)) heights[id]=h;
    });
    return {
      widgets: checked.length ? checked : v25DefaultVisible(),
      layout: order,
      widths,
      heights,
      privacy: f.has('privacyMode')
    };
  }
  let v39DashboardRenderScheduled=false;
  function v39ScheduleDashboardRefresh(message='Dashboard layout saved.'){
    if(v39DashboardRenderScheduled) return;
    v39DashboardRenderScheduled=true;
    const run=()=>{
      v39DashboardRenderScheduled=false;
      try{
        if(currentPage==='dashboard'){
          renderDashboard();
        }else if(typeof renderPage==='function'){
          renderPage(currentPage);
        }
        if(typeof v26HydrateEmptyWidgets==='function') v26HydrateEmptyWidgets();
      }catch(err){
        console.error('Dashboard refresh failed after layout save', err);
      }
      showToast(message);
    };
    if(typeof requestAnimationFrame==='function') requestAnimationFrame(run);
    else setTimeout(run,0);
  }
  let v39SavingDashboardLayout=false;
  function v39SaveCustomizeDashboard(form, submitButton){
    if(v39SavingDashboardLayout) return;
    v39SavingDashboardLayout=true;
    injectV39CustomizeSaveStyles();
    if(submitButton){
      submitButton.dataset.v39OriginalText=submitButton.textContent || 'Save layout';
      submitButton.textContent='Savingâ€¦';
      submitButton.classList.add('v39-saving');
      submitButton.disabled=true;
    }
    const before=v39DashboardLayoutSnapshot();
    const next=v39ReadDashboardLayoutForm(form);
    state.settings ||= {};
    state.settings.dashboardWidgets = next.widgets;
    state.settings.dashboardLayout = next.layout;
    state.settings.dashboardWidgetWidths = next.widths;
    state.settings.dashboardWidgetHeights = next.heights;
    state.settings.privacyMode = next.privacy;
    const changed = before !== v39DashboardLayoutSnapshot();
    audit('Dashboard layout and sizing customized');
    saveState();
    closeModal();
    setTimeout(()=>{ v39SavingDashboardLayout=false; }, 250);
    if(!changed){
      showToast('No dashboard layout changes to save.');
      return;
    }
    v39ScheduleDashboardRefresh('Dashboard layout saved.');
  }
  const v39SubmitModalBase = submitModal;
  submitModal = function(e){
    if(currentModal==='customizeDashboard'){
      e.preventDefault();
      v39SaveCustomizeDashboard(e.target, e.submitter || document.querySelector('#modalFooter button[type="submit"]'));
      return;
    }
    return v39SubmitModalBase(e);
  };
  const v39HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(currentModal==='customizeDashboard' && action==='dashboard-widget-move'){
      const [wid,dir]=String(id||'').split(':');
      if(v25MoveWidget(wid,dir||'down')){
        saveState();
        const body=document.getElementById('modalBody');
        if(body) body.innerHTML=v25CustomizeDashboardBody();
        showToast('Dashboard card moved. Save layout to apply.');
      }
      return;
    }
    if(currentModal==='customizeDashboard' && action==='dashboard-layout-reset'){
      state.settings ||= {};
      state.settings.dashboardLayout=v25DefaultOrder();
      state.settings.dashboardWidgets=v25DefaultVisible();
      state.settings.dashboardWidgetWidths=typeof v26DefaultWidths==='function' ? v26DefaultWidths() : v25DefaultWidths();
      state.settings.dashboardWidgetHeights=typeof v26DefaultHeights==='function' ? v26DefaultHeights() : {};
      state.settings.v26DashboardSizingInitialized=true;
      saveState();
      const body=document.getElementById('modalBody');
      if(body) body.innerHTML=v25CustomizeDashboardBody();
      showToast('Default layout selected. Save layout to apply.');
      return;
    }
    return v39HandleActionBase(action,id);
  };
  const v39OpenModalBase = openModal;
  openModal = function(type){
    v39OpenModalBase(type);
    if(type==='customizeDashboard'){
      injectV39CustomizeSaveStyles();
      const saveBtn=document.querySelector('#modalFooter button[type="submit"]');
      if(saveBtn){
        saveBtn.textContent='Save layout';
        saveBtn.disabled=false;
        saveBtn.classList.remove('v39-saving');
      }
    }
  };



  // ---------- V40: Navigation Speed / Lazy Render Fix ----------
  // Keeps sidebar/menu clicks responsive by activating the route immediately,
  // showing cached content when available, and deferring heavy page rendering until
  // after the browser has had a chance to paint the active state.
  function injectV40NavigationStyles(){
    if(document.getElementById('v40-navigation-speed-styles')) return;
    const style=document.createElement('style');
    style.id='v40-navigation-speed-styles';
    style.textContent=`
      body.v8-ui .v40-route-loading-card{background:#fff;border:1px solid #d8e2eb;border-radius:22px;padding:22px;box-shadow:0 2px 10px rgba(16,24,40,.04);margin-bottom:16px;}
      body.v8-ui .v40-route-loading-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
      body.v8-ui .v40-route-loading-title{font-size:28px;font-weight:900;letter-spacing:-.035em;color:#071b37;margin:0;}
      body.v8-ui .v40-route-loading-subtitle{margin:7px 0 0;color:#53657d;line-height:1.45;}
      body.v8-ui .v40-skeleton-lines{display:grid;gap:12px;margin-top:20px;}
      body.v8-ui .v40-skeleton-line{height:16px;border-radius:999px;background:linear-gradient(90deg,#eef3f7,#f7fafb,#eef3f7);background-size:220% 100%;animation:v40Shimmer 1.1s linear infinite;}
      body.v8-ui .v40-skeleton-line.short{width:42%;}.v40-skeleton-line.mid{width:66%;}.v40-skeleton-line.long{width:92%;}
      body.v8-ui .v40-nav-loading-indicator{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:900;color:#0a6f35;background:#e7f6ec;border:1px solid #c5e8d2;border-radius:999px;padding:7px 10px;white-space:nowrap;}
      body.v8-ui .v40-nav-loading-indicator:before{content:'';width:9px;height:9px;border-radius:50%;border:2px solid rgba(10,143,60,.25);border-top-color:#0a8f3c;animation:v40spin .75s linear infinite;}
      @keyframes v40Shimmer{to{background-position:-220% 0;}}
      @keyframes v40spin{to{transform:rotate(360deg);}}
      body.v8-ui.dark-mode .v40-route-loading-card{background:#14202d;border-color:#2a3c4f;color:#e8edf3;box-shadow:0 12px 32px rgba(0,0,0,.22);}
      body.v8-ui.dark-mode .v40-route-loading-title{color:#f3f7fb;}
      body.v8-ui.dark-mode .v40-route-loading-subtitle{color:#aab8c7;}
      body.v8-ui.dark-mode .v40-skeleton-line{background:linear-gradient(90deg,#223246,#182536,#223246);background-size:220% 100%;}
      body.v8-ui.dark-mode .v40-nav-loading-indicator{background:#102d22;border-color:#1f6042;color:#baf3d0;}
      @media(max-width:760px){body.v8-ui .v40-route-loading-head{display:block}.v40-nav-loading-indicator{margin-top:12px}.v40-route-loading-title{font-size:23px!important}}
    `;
    document.head.appendChild(style);
  }

  let v40DataVersion = 0;
  let v40NavToken = 0;
  let v40NavTimer = null;
  const v40PageCache = new Map();

  const v40SaveStateBase = saveState;
  saveState = function(){
    v40DataVersion += 1;
    v40PageCache.clear();
    return v40SaveStateBase.apply(this, arguments);
  };

  function v40GetPageLabel(page){
    const labels={
      dashboard:'Dashboard', banking:'Banking', transactions:'Transactions', accounting:'Accounting', sales:'Sales & Get Paid', customers:'Customers & Leads', expenses:'Expenses & Pay Bills', vendors:'Vendors', reports:'Reports & Analytics', inventory:'Products & Services', products:'Products & Services', projects:'Projects', time:'Time', payroll:'Payroll & HR', taxes:'Taxes', apps:'My Apps', setup:'Setup Checklist', settings:'Settings'
    };
    return labels[page] || String(page||'Workspace').replace(/[-_]/g,' ').replace(/\b\w/g, m=>m.toUpperCase());
  }

  function v40IsHeavyPage(page){
    return ['dashboard','sales','reports','banking','transactions','accounting','taxes','expenses','vendors','customers','inventory','apps'].includes(page);
  }

  function v40FastActivatePage(page){
    injectV40NavigationStyles();
    currentPage = page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const el=document.getElementById('page-'+page);
    if(el) el.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('open');
    document.getElementById('createMenu')?.classList.remove('open');
    if(typeof closeSmartSearch==='function') closeSmartSearch();
  }

  function v40ShowPageSkeleton(page){
    const el=document.getElementById('page-'+page);
    if(!el) return;
    const label=v40GetPageLabel(page);
    el.innerHTML=`<div class="v40-route-loading-card" aria-live="polite"><div class="v40-route-loading-head"><div><h2 class="v40-route-loading-title">${escapeHTML(label)}</h2><p class="v40-route-loading-subtitle">Opening this workspace. Large tables and charts load after the page appears so navigation stays responsive.</p></div><span class="v40-nav-loading-indicator">Loading</span></div><div class="v40-skeleton-lines"><span class="v40-skeleton-line long"></span><span class="v40-skeleton-line mid"></span><span class="v40-skeleton-line short"></span></div></div>`;
  }

  function v40AfterPageRender(page){
    try{
      const el=document.getElementById('page-'+page);
      if(el && page !== 'dashboard' && !el.querySelector('.v40-route-loading-card')){
        v40PageCache.set(page, {version:v40DataVersion, html:el.innerHTML, stamp:Date.now()});
      }
      if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(el || document);
      if(page==='dashboard' && typeof v26HydrateEmptyWidgets==='function') v26HydrateEmptyWidgets();
    }catch(err){ console.warn('V40 post-render cache skipped', err); }
  }

  function v40DeferRender(fn){
    const run=()=>{
      if(typeof requestAnimationFrame==='function') requestAnimationFrame(fn);
      else setTimeout(fn,0);
    };
    if(typeof requestAnimationFrame==='function') requestAnimationFrame(run);
    else setTimeout(run,0);
  }

  const v40RenderPageBase = renderPage;
  renderPage = function(page){
    const result = v40RenderPageBase.apply(this, arguments);
    v40AfterPageRender(page);
    return result;
  };

  const v40RenderDashboardBase = renderDashboard;
  renderDashboard = function(){
    const result = v40RenderDashboardBase.apply(this, arguments);
    v40AfterPageRender('dashboard');
    return result;
  };

  function v40NavigateToDashboard(token){
    const dash=document.getElementById('page-dashboard');
    // If dashboard already has content, show it immediately and refresh after paint.
    if(dash && !dash.innerHTML.trim()) v40ShowPageSkeleton('dashboard');
    v40DeferRender(()=>{
      if(token !== v40NavToken || currentPage !== 'dashboard') return;
      renderDashboard();
    });
  }

  const v40NavigateBase = navigate;
  navigate = function(page){
    page = page || 'dashboard';
    const token=++v40NavToken;
    if(v40NavTimer) clearTimeout(v40NavTimer);
    v40FastActivatePage(page);

    if(page === 'dashboard'){
      v40NavigateToDashboard(token);
      return;
    }

    const el=document.getElementById('page-'+page);
    const cached=v40PageCache.get(page);
    if(el && cached && cached.version===v40DataVersion){
      // Cached HTML makes the page appear instantly. A deferred refresh follows to
      // restore any direct widget listeners and keep the data current.
      el.innerHTML=cached.html;
      v40AfterPageRender(page);
    }else if(v40IsHeavyPage(page) || (el && !el.innerHTML.trim())){
      v40ShowPageSkeleton(page);
    }

    v40DeferRender(()=>{
      if(token !== v40NavToken || currentPage !== page) return;
      try{
        v40RenderPageBase(page);
        v40AfterPageRender(page);
      }catch(err){
        console.error('Navigation render failed for '+page, err);
        // Fall back to the pre-V40 navigate path only if the lazy path fails.
        try{ v40NavigateBase(page); }catch(fallbackErr){ console.error('Fallback navigation failed', fallbackErr); }
      }
    });
  };

  // Make manual refresh explicit and lightweight: render only the current page.
  const v40HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='refresh-dashboard'){
      if(currentPage==='dashboard'){
        renderDashboard();
        showToast('Dashboard refreshed.');
      }else{
        renderPage(currentPage);
        showToast('Current page refreshed.');
      }
      return;
    }
    return v40HandleActionBase(action,id);
  };




  // ---------- V41: Dashboard Widget Visibility Save Fix ----------
  // Fixes a visibility-state bug where hidden/default dashboard widgets (for example
  // A/R Aging and A/P Aging) were added back by the state normalizer after Save layout.
  // Visibility is now treated as an explicit user preference: sanitize valid ids only,
  // do not append default widgets unless the preference has never been created.
  function v41UniqueValidWidgetIds(list){
    const valid=new Set(typeof v25AllWidgetIds==='function' ? v25AllWidgetIds() : []);
    const out=[];
    (Array.isArray(list)?list:[]).forEach(id=>{
      id=String(id||'');
      if(valid.has(id) && !out.includes(id)) out.push(id);
    });
    return out;
  }
  function v41DefaultVisibleWidgets(){
    return v41UniqueValidWidgetIds(typeof v25DefaultVisible==='function' ? v25DefaultVisible() : []);
  }
  function v41NormalizeDashboardVisibility(){
    state.settings ||= {};
    if(Array.isArray(state.settings.dashboardWidgets)){
      // Preserve explicit empty selection too. Empty means no widgets visible.
      state.settings.dashboardWidgets = v41UniqueValidWidgetIds(state.settings.dashboardWidgets);
      state.settings.v41DashboardVisibilityExplicit = true;
    }else{
      state.settings.dashboardWidgets = v41DefaultVisibleWidgets();
      state.settings.v41DashboardVisibilityExplicit = false;
    }
  }
  function v41NormalizeWidgetSizing(){
    state.settings ||= {};
    const all=typeof v25AllWidgetIds==='function' ? v25AllWidgetIds() : [];
    const allSet=new Set(all);
    const widthDefaults = typeof v26DefaultWidths==='function' ? v26DefaultWidths() : (typeof v25DefaultWidths==='function' ? v25DefaultWidths() : {});
    const heightDefaults = typeof v26DefaultHeights==='function' ? v26DefaultHeights() : {};
    const allowedWidths = (typeof v26WidgetWidths!=='undefined' && Array.isArray(v26WidgetWidths)) ? v26WidgetWidths : ['third','half','two-thirds','full'];
    const allowedHeights = (typeof v26WidgetHeights!=='undefined' && Array.isArray(v26WidgetHeights)) ? v26WidgetHeights : ['compact','standard','tall','auto'];
    state.settings.dashboardLayout = typeof v25SanitizeList==='function' ? v25SanitizeList(state.settings.dashboardLayout, typeof v25DefaultOrder==='function' ? v25DefaultOrder() : all) : all;
    state.settings.dashboardWidgetWidths = {...widthDefaults, ...(state.settings.dashboardWidgetWidths||{})};
    state.settings.dashboardWidgetHeights = {...heightDefaults, ...(state.settings.dashboardWidgetHeights||{})};
    Object.keys(state.settings.dashboardWidgetWidths||{}).forEach(id=>{
      if(!allSet.has(id)) delete state.settings.dashboardWidgetWidths[id];
      else if(!allowedWidths.includes(state.settings.dashboardWidgetWidths[id])) state.settings.dashboardWidgetWidths[id]=widthDefaults[id]||'third';
    });
    Object.keys(state.settings.dashboardWidgetHeights||{}).forEach(id=>{
      if(!allSet.has(id)) delete state.settings.dashboardWidgetHeights[id];
      else if(!allowedHeights.includes(state.settings.dashboardWidgetHeights[id])) state.settings.dashboardWidgetHeights[id]=heightDefaults[id]||'standard';
    });
  }

  const v41PriorV25EnsureDashboardState = typeof v25EnsureDashboardState==='function' ? v25EnsureDashboardState : null;
  v25EnsureDashboardState = function(){
    const hadExplicitVisibility = Array.isArray(state.settings?.dashboardWidgets);
    const explicitVisibility = hadExplicitVisibility ? v41UniqueValidWidgetIds(state.settings.dashboardWidgets) : null;
    if(v41PriorV25EnsureDashboardState){
      try{ v41PriorV25EnsureDashboardState(); }catch(err){ console.warn('V41 prior dashboard ensure skipped', err); }
    }
    state.settings ||= {};
    if(hadExplicitVisibility){
      state.settings.dashboardWidgets = explicitVisibility;
      state.settings.v41DashboardVisibilityExplicit = true;
    }else if(!Array.isArray(state.settings.dashboardWidgets)){
      state.settings.dashboardWidgets = v41DefaultVisibleWidgets();
      state.settings.v41DashboardVisibilityExplicit = false;
    }else{
      // Prior ensure may have created defaults for a fresh company file.
      state.settings.dashboardWidgets = v41UniqueValidWidgetIds(state.settings.dashboardWidgets);
    }
    v41NormalizeWidgetSizing();
  };

  if(typeof v27EnsureDashboardState==='function'){
    v27EnsureDashboardState = function(){
      state.settings ||= {};
      const hadExplicitVisibility = Array.isArray(state.settings.dashboardWidgets);
      v25EnsureDashboardState();
      // Only auto-add V27 insight widgets for first-time/default layouts. Once a user
      // has a saved widget list, hidden widgets must stay hidden.
      if(!state.settings.v27DashboardInsightsInitialized && !hadExplicitVisibility && !state.settings.v41DashboardVisibilityExplicit){
        const all=typeof v25AllWidgetIds==='function' ? v25AllWidgetIds() : [];
        const visible=new Set(state.settings.dashboardWidgets||[]);
        ['arAging','apAging','salesPipeline','taxSummary'].forEach(id=>visible.add(id));
        state.settings.dashboardWidgets=Array.from(visible).filter(id=>all.includes(id));
      }
      state.settings.v27DashboardInsightsInitialized=true;
      v41NormalizeDashboardVisibility();
      v41NormalizeWidgetSizing();
    };
  }

  if(typeof v39ReadDashboardLayoutForm==='function'){
    v39ReadDashboardLayoutForm = function(form){
      v25EnsureDashboardState?.();
      const f=new FormData(form);
      const checked=v41UniqueValidWidgetIds(f.getAll('v25WidgetVisible'));
      const order=typeof v25SanitizeList==='function' ? v25SanitizeList(f.getAll('v25DashboardOrder'), typeof v25DefaultOrder==='function' ? v25DefaultOrder() : []) : f.getAll('v25DashboardOrder');
      const widths={...(typeof v26DefaultWidths==='function' ? v26DefaultWidths() : (typeof v25DefaultWidths==='function' ? v25DefaultWidths() : {}))};
      const heights={...(typeof v26DefaultHeights==='function' ? v26DefaultHeights() : {})};
      (typeof v25AllWidgetIds==='function' ? v25AllWidgetIds() : []).forEach(id=>{
        const w=f.get(`v25WidgetWidth_${id}`);
        const h=f.get(`v26WidgetHeight_${id}`);
        const allowedWidths=(typeof v26WidgetWidths!=='undefined' && Array.isArray(v26WidgetWidths)) ? v26WidgetWidths : ['third','half','two-thirds','full'];
        const allowedHeights=(typeof v26WidgetHeights!=='undefined' && Array.isArray(v26WidgetHeights)) ? v26WidgetHeights : ['compact','standard','tall','auto'];
        if(allowedWidths.includes(w)) widths[id]=w;
        if(allowedHeights.includes(h)) heights[id]=h;
      });
      return {widgets:checked, layout:order, widths, heights, privacy:f.has('privacyMode')};
    };
  }

  // Clear any stale dashboard markup after layout/visibility changes. V40 already clears
  // its page cache in saveState(); this extra invalidation is a no-op if the cache does
  // not exist, but protects dashboard refreshes in older browser states.
  function v41InvalidateDashboardCache(){
    try{
      if(typeof v40PageCache!=='undefined' && v40PageCache?.delete) v40PageCache.delete('dashboard');
    }catch(err){}
  }
  const v41PriorSaveCustomizeDashboard = typeof v39SaveCustomizeDashboard==='function' ? v39SaveCustomizeDashboard : null;
  if(v41PriorSaveCustomizeDashboard){
    v39SaveCustomizeDashboard = function(form, submitButton){
      const result=v41PriorSaveCustomizeDashboard(form, submitButton);
      state.settings ||= {};
      state.settings.dashboardWidgets = v41UniqueValidWidgetIds(state.settings.dashboardWidgets);
      state.settings.v41DashboardVisibilityExplicit = true;
      v41InvalidateDashboardCache();
      return result;
    };
  }



  // ---------- V42: Global Menu Loading Reliability Fix ----------
  // V40 made navigation responsive by showing a lazy loading shell first, but a few
  // lower-use workspaces could stay on that shell if a renderer was slow, missing, or
  // cached in an incomplete state. V42 keeps the instant menu activation, limits lazy
  // loading to truly heavy workspaces, renders lightweight pages immediately, and
  // provides a safety fallback so no menu page can remain stuck on "Loading".
  function injectV42NavigationReliabilityStyles(){
    if(document.getElementById('v42-navigation-reliability-styles')) return;
    const style=document.createElement('style');
    style.id='v42-navigation-reliability-styles';
    style.textContent=`
      body.v8-ui .v42-fallback-card{background:#fff;border:1px solid #d8e2eb;border-radius:22px;padding:24px;box-shadow:0 2px 10px rgba(16,24,40,.05);margin-bottom:16px;}
      body.v8-ui .v42-fallback-card h2{font-size:28px;line-height:1.1;letter-spacing:-.035em;margin:0 0 8px;color:#071b37;}
      body.v8-ui .v42-fallback-card p{margin:0;color:#53657d;line-height:1.48;max-width:760px;}
      body.v8-ui .v42-fallback-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;}
      body.v8-ui .v42-mini-status{display:inline-flex;align-items:center;gap:7px;border:1px solid #d6e3ec;background:#f8fbfd;color:#43546a;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;margin-top:14px;}
      body.v8-ui .v42-mini-status:before{content:'';width:7px;height:7px;border-radius:50%;background:#0a8f3c;}
      body.v8-ui.dark-mode .v42-fallback-card{background:#14202d;border-color:#2a3c4f;color:#e8edf3;box-shadow:0 12px 32px rgba(0,0,0,.22);}
      body.v8-ui.dark-mode .v42-fallback-card h2{color:#f3f7fb;}
      body.v8-ui.dark-mode .v42-fallback-card p{color:#aab8c7;}
      body.v8-ui.dark-mode .v42-mini-status{background:#101b27;border-color:#34495e;color:#c9d6e2;}
      @media(max-width:760px){body.v8-ui .v42-fallback-card h2{font-size:23px}.v42-fallback-actions .btn{width:100%;}}
    `;
    document.head.appendChild(style);
  }

  const v42HeavyPages = new Set(['dashboard','sales','reports','banking','transactions','accounting','taxes']);
  const v42ImmediatePages = new Set(['customers','expenses','vendors','inventory','projects','time','payroll','apps','settings','setup']);
  const v42FallbackDelayMs = 850;
  const v42RenderPageBase = (typeof v40RenderPageBase === 'function') ? v40RenderPageBase : renderPage;
  const v42RenderDashboardBase = (typeof v40RenderDashboardBase === 'function') ? v40RenderDashboardBase : renderDashboard;

  function v42IsRenderablePage(page){
    return !!document.getElementById('page-'+page) || page==='dashboard';
  }

  function v42CleanLoadingCache(){
    try{
      if(typeof v40PageCache !== 'undefined' && v40PageCache?.forEach){
        v40PageCache.forEach((entry,key)=>{
          if(!entry || /v40-route-loading-card|v42-fallback-card/.test(String(entry.html||''))) v40PageCache.delete(key);
        });
      }
    }catch(err){}
  }

  function v42ActionButtons(page){
    const actions={
      sales:`<button class="btn primary" data-modal="invoice">Create invoice</button><button class="btn" data-modal="payment">Receive payment</button>`,
      banking:`<button class="btn primary" data-modal="bankTx">Add bank transaction</button><button class="btn" data-modal="reconcile">Reconcile</button>`,
      transactions:`<button class="btn primary" data-open-create>ï¼‹ New</button><button class="btn" data-nav="reports">Open reports</button>`,
      accounting:`<button class="btn primary" data-modal="journal">Journal entry</button><button class="btn" data-modal="account">Add account</button>`,
      reports:`<button class="btn primary" data-action="open-report" data-id="pl">Run Profit & Loss</button><button class="btn" data-action="open-report" data-id="balanceSheet">Balance Sheet</button>`,
      expenses:`<button class="btn primary" data-modal="expense">Record expense</button><button class="btn" data-modal="bill">Create bill</button>`,
      customers:`<button class="btn primary" data-modal="customer">Add customer</button><button class="btn" data-modal="estimate">New estimate</button>`,
      vendors:`<button class="btn primary" data-modal="vendor">Add vendor</button><button class="btn" data-modal="purchaseOrder">Purchase order</button>`,
      inventory:`<button class="btn primary" data-modal="product">Add product/service</button>`,
      projects:`<button class="btn primary" data-modal="project">New project</button>`,
      time:`<button class="btn primary" data-modal="time">Add time</button>`,
      payroll:`<button class="btn primary" data-modal="payroll">Payroll setup</button>`,
      taxes:`<button class="btn primary" data-modal="taxPayment">Record tax payment</button><button class="btn" data-nav="reports">Tax reports</button>`,
      apps:`<button class="btn primary" data-nav="banking">Open banking</button><button class="btn" data-nav="settings">Settings</button>`,
      settings:`<button class="btn primary" data-modal="company">Company settings</button><button class="btn" data-modal="customize">Customize menu</button>`,
      setup:`<button class="btn primary" data-nav="dashboard">Back to dashboard</button><button class="btn" data-modal="customizeDashboard">Customize dashboard</button>`
    };
    return actions[page] || `<button class="btn primary" data-open-create>ï¼‹ New</button><button class="btn" data-nav="dashboard">Back to dashboard</button>`;
  }

  function v42PageDescription(page){
    const desc={
      dashboard:'Business overview, widgets, and quick actions.',
      sales:'Manage invoices, payments, estimates, sales orders, and customer sales activity.',
      reports:'Open financial, tax, sales, banking, inventory, and management reports.',
      banking:'Review bank activity, matching, categorization, clearing, and reconciliation.',
      transactions:'Review posted and imported transaction activity across the company.',
      accounting:'Manage the chart of accounts, journals, trial balance, and audit trail.',
      taxes:'Track GST/HST collected, input tax credits, filings, and payments.',
      expenses:'Record expenses, manage vendor bills, approvals, and payments.',
      customers:'Manage customer records, open balances, estimates, and invoices.',
      vendors:'Manage supplier records, open bills, purchase orders, and credits.',
      inventory:'Manage products, services, inventory, purchase orders, sales orders, and item setup.',
      projects:'Track project budgets, costs, revenue, and profitability.',
      time:'Capture billable time by team member, customer, and project.',
      payroll:'Prepare payroll setup, employee records, contractors, deductions, and pay runs.',
      apps:'Open enabled modules and integration workspaces.',
      settings:'Manage company profile, menu customization, invoice branding, and local data controls.',
      setup:'Complete guided setup tasks for the modules shown in your menu.'
    };
    return desc[page] || 'This workspace is ready.';
  }

  function v42ShowFallback(page, reason){
    injectV42NavigationReliabilityStyles();
    const el=document.getElementById('page-'+page);
    if(!el) return;
    const label=(typeof v40GetPageLabel==='function') ? v40GetPageLabel(page) : String(page||'Workspace');
    const message = reason ? 'The full workspace did not finish loading, so a safe workspace card is shown instead.' : v42PageDescription(page);
    el.innerHTML=`<div class="v42-fallback-card"><h2>${escapeHTML(label)}</h2><p>${escapeHTML(message)}</p><div class="v42-fallback-actions">${v42ActionButtons(page)}</div><span class="v42-mini-status">Ready for navigation</span></div>`;
    try{ if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(el); }catch(err){}
  }

  function v42EnsureNotStuck(page, token){
    setTimeout(()=>{
      if(token !== v40NavToken || currentPage !== page) return;
      const el=document.getElementById('page-'+page);
      if(!el) return;
      const stuck = !el.innerHTML.trim() || !!el.querySelector('.v40-route-loading-card');
      if(stuck) v42ShowFallback(page, 'timeout');
    }, v42FallbackDelayMs);
  }

  function v42PostRender(page){
    try{
      const el=document.getElementById('page-'+page);
      if(el && (!el.innerHTML.trim() || el.querySelector('.v40-route-loading-card'))){
        v42ShowFallback(page, 'empty');
        return;
      }
      if(typeof v40AfterPageRender==='function') v40AfterPageRender(page);
      else if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(el || document);
    }catch(err){ console.warn('V42 post-render skipped', err); }
  }

  function v42RenderPageNow(page, token){
    if(token !== v40NavToken || currentPage !== page) return;
    try{
      if(page==='dashboard') v42RenderDashboardBase();
      else v42RenderPageBase(page);
      v42PostRender(page);
    }catch(err){
      console.error('V42 navigation render failed for '+page, err);
      v42ShowFallback(page, 'error');
    }
  }

  function v42Defer(fn){
    const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb)=>setTimeout(cb,0);
    raf(()=>raf(fn));
  }

  // Replace the V40 lazy navigator with a stricter no-stuck router.
  navigate = function(page){
    page = page || 'dashboard';
    injectV42NavigationReliabilityStyles();
    v42CleanLoadingCache();
    const token=++v40NavToken;
    if(v40NavTimer) clearTimeout(v40NavTimer);

    if(!v42IsRenderablePage(page)){
      page='dashboard';
    }

    // Always update route/sidebar first so the click feels immediate.
    if(typeof v40FastActivatePage==='function') v40FastActivatePage(page);
    else {
      currentPage=page;
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      document.getElementById('page-'+page)?.classList.add('active');
      document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('mobileOverlay')?.classList.remove('open');
      document.getElementById('createMenu')?.classList.remove('open');
    }

    const el=document.getElementById('page-'+page);
    const cached=(typeof v40PageCache!=='undefined' && v40PageCache?.get) ? v40PageCache.get(page) : null;
    const safeCached=cached && cached.version===v40DataVersion && cached.html && !/v40-route-loading-card|v42-fallback-card/.test(String(cached.html));

    if(page==='dashboard'){
      // Dashboard already has a shell in the HTML. Refresh after paint; never cache a loading shell.
      v42EnsureNotStuck(page, token);
      v42Defer(()=>v42RenderPageNow(page, token));
      return;
    }

    if(safeCached && el){
      el.innerHTML=cached.html;
      v42PostRender(page);
      if(v42HeavyPages.has(page)) v42Defer(()=>v42RenderPageNow(page, token));
      return;
    }

    // Lightweight pages should not show a loading shell. Render them directly so
    // Projects, Time, Payroll, Vendors, Products & Services, etc. open immediately.
    if(v42ImmediatePages.has(page) || !v42HeavyPages.has(page)){
      v42RenderPageNow(page, token);
      return;
    }

    // Heavy pages get a short skeleton, with a hard fallback timer.
    if(el && (!el.innerHTML.trim() || el.querySelector('.v42-fallback-card'))) {
      if(typeof v40ShowPageSkeleton==='function') v40ShowPageSkeleton(page);
      else v42ShowFallback(page, null);
    }else if(el && !el.querySelector('.v40-route-loading-card')){
      // Existing content can remain visible while the heavy page refreshes.
    }
    v42EnsureNotStuck(page, token);
    v42Defer(()=>v42RenderPageNow(page, token));
  };




  // ---------- V43: Navigation Simplification / Loading Shell Removal Fix ----------
  // V42 prevented endless loading by adding safety fallbacks, but the route-level
  // loading shell still appeared in too many normal menu paths. V43 removes the
  // generic workspace loading shell from menu navigation and renders the page shell
  // directly. Heavy pages can still refresh after paint when real content already
  // exists, but a user should never be left looking at a Loading card for menu clicks.
  function injectV43NavigationSimplificationStyles(){
    if(document.getElementById('v43-navigation-simplification-styles')) return;
    const style=document.createElement('style');
    style.id='v43-navigation-simplification-styles';
    style.textContent=`
      body.v8-ui .v43-workspace-card{background:#fff;border:1px solid #d8e2eb;border-radius:22px;padding:24px;box-shadow:0 2px 10px rgba(16,24,40,.04);margin-bottom:16px;}
      body.v8-ui .v43-workspace-card h2{font-size:28px;font-weight:900;letter-spacing:-.035em;color:#071b37;margin:0 0 6px;}
      body.v8-ui .v43-workspace-card p{margin:0;color:#53657d;line-height:1.45;max-width:780px;}
      body.v8-ui .v43-workspace-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}
      body.v8-ui .v43-workspace-status{display:inline-flex;align-items:center;gap:7px;margin-top:16px;font-size:12px;font-weight:900;color:#0a6f35;background:#e7f6ec;border:1px solid #c5e8d2;border-radius:999px;padding:6px 10px;}
      body.v8-ui .v43-workspace-status:before{content:'';width:8px;height:8px;border-radius:50%;background:#0a8f3c;}
      body.v8-ui.dark-mode .v43-workspace-card{background:#14202d;border-color:#2a3c4f;color:#e8edf3;box-shadow:0 12px 32px rgba(0,0,0,.22);}
      body.v8-ui.dark-mode .v43-workspace-card h2{color:#f3f7fb;}
      body.v8-ui.dark-mode .v43-workspace-card p{color:#aab8c7;}
      body.v8-ui.dark-mode .v43-workspace-status{background:#102d22;border-color:#1f6042;color:#baf3d0;}
      @media(max-width:760px){body.v8-ui .v43-workspace-card h2{font-size:23px}.v43-workspace-actions .btn{width:100%;}}
    `;
    document.head.appendChild(style);
  }

  function v43NormalizePageId(page){
    page = page || 'dashboard';
    if(page==='products') page='inventory';
    if(!document.getElementById('page-'+page) && page!=='dashboard') page='dashboard';
    return page;
  }

  function v43RouteHasOnlyLoading(el){
    if(!el) return false;
    return !!el.querySelector('.v40-route-loading-card') || !!el.querySelector('.v42-fallback-card');
  }

  function v43PurgeLoadingCache(){
    try{
      if(typeof v40PageCache !== 'undefined' && v40PageCache?.forEach){
        v40PageCache.forEach((entry,key)=>{
          const html=String(entry?.html||'');
          if(!html || /v40-route-loading-card|v42-fallback-card/.test(html)) v40PageCache.delete(key);
        });
      }
    }catch(err){}
  }

  function v43ActionButtons(page){
    if(typeof v42ActionButtons==='function') return v42ActionButtons(page);
    return `<button class="btn primary" data-open-create>ï¼‹ New</button><button class="btn" data-nav="dashboard">Back to dashboard</button>`;
  }

  function v43PageDescription(page){
    if(typeof v42PageDescription==='function') return v42PageDescription(page);
    return 'This workspace is ready.';
  }

  function v43ShowWorkspaceCard(page, note){
    injectV43NavigationSimplificationStyles();
    const el=document.getElementById('page-'+page);
    if(!el) return;
    const label=(typeof v40GetPageLabel==='function') ? v40GetPageLabel(page) : String(page||'Workspace');
    const desc=note || v43PageDescription(page);
    el.innerHTML=`<div class="v43-workspace-card"><h2>${escapeHTML(label)}</h2><p>${escapeHTML(desc)}</p><div class="v43-workspace-actions">${v43ActionButtons(page)}</div><span class="v43-workspace-status">Ready</span></div>`;
  }

  function v43ActivateRoute(page){
    currentPage=page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const el=document.getElementById('page-'+page);
    if(el) el.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('open');
    document.getElementById('createMenu')?.classList.remove('open');
    if(typeof closeSmartSearch==='function') closeSmartSearch();
  }

  function v43AfterRender(page){
    const el=document.getElementById('page-'+page);
    if(!el) return;
    if(!el.innerHTML.trim() || v43RouteHasOnlyLoading(el)){
      v43ShowWorkspaceCard(page);
      return;
    }
    try{
      if(typeof v21ApplyMoneyAlignment==='function') v21ApplyMoneyAlignment(el);
      if(page==='dashboard' && typeof v26HydrateEmptyWidgets==='function') v26HydrateEmptyWidgets();
      if(typeof v40PageCache !== 'undefined' && page!=='dashboard' && !v43RouteHasOnlyLoading(el)){
        v40PageCache.set(page, {version:v40DataVersion, html:el.innerHTML, stamp:Date.now()});
      }
    }catch(err){ console.warn('V43 post-render skipped', err); }
  }

  const v43RenderPageBase = (typeof v42RenderPageBase === 'function') ? v42RenderPageBase : ((typeof v40RenderPageBase === 'function') ? v40RenderPageBase : renderPage);
  const v43RenderDashboardBase = (typeof v42RenderDashboardBase === 'function') ? v42RenderDashboardBase : ((typeof v40RenderDashboardBase === 'function') ? v40RenderDashboardBase : renderDashboard);

  function v43RenderRouteNow(page, token){
    if(token !== v40NavToken || currentPage !== page) return;
    try{
      const el=document.getElementById('page-'+page);
      if(el && v43RouteHasOnlyLoading(el)) el.innerHTML='';
      if(page==='dashboard') v43RenderDashboardBase();
      else v43RenderPageBase(page);
      v43AfterRender(page);
    }catch(err){
      console.error('V43 navigation render failed for '+page, err);
      v43ShowWorkspaceCard(page, 'This workspace is ready, but one section did not finish rendering. Use the actions below or try Refresh.');
    }
  }

  function v43ScheduleBackgroundRefresh(page, token){
    const run=()=>v43RenderRouteNow(page, token);
    if(typeof requestIdleCallback==='function') requestIdleCallback(()=>run(), {timeout:900});
    else if(typeof requestAnimationFrame==='function') requestAnimationFrame(()=>requestAnimationFrame(run));
    else setTimeout(run, 0);
  }

  // Override the route-level loading helper so any remaining legacy calls cannot
  // paint the old generic Loading card.
  if(typeof v40ShowPageSkeleton === 'function'){
    v40ShowPageSkeleton = function(page){
      page=v43NormalizePageId(page);
      v43ShowWorkspaceCard(page);
    };
  }

  navigate = function(page){
    page=v43NormalizePageId(page);
    injectV43NavigationSimplificationStyles();
    v43PurgeLoadingCache();
    const token=++v40NavToken;
    if(v40NavTimer) clearTimeout(v40NavTimer);
    v43ActivateRoute(page);

    const el=document.getElementById('page-'+page);
    const hasRealContent = !!(el && el.innerHTML.trim() && !v43RouteHasOnlyLoading(el));

    // If real content already exists, show it instantly and refresh after paint.
    // If this is the first visit or a legacy loading shell is present, render the
    // real page immediately instead of showing a loading state.
    if(hasRealContent){
      v43AfterRender(page);
      v43ScheduleBackgroundRefresh(page, token);
    }else{
      v43RenderRouteNow(page, token);
    }
  };

  // Manual refresh should also avoid any loading/fallback route shell.
  const v43HandleActionBase = handleAction;
  handleAction = function(action,id){
    if(action==='refresh-dashboard'){
      const page=v43NormalizePageId(currentPage || 'dashboard');
      const token=++v40NavToken;
      v43RenderRouteNow(page, token);
      showToast(page==='dashboard' ? 'Dashboard refreshed.' : 'Current page refreshed.');
      return;
    }
    return v43HandleActionBase(action,id);
  };




  // ---------- V44: Left Rail Shortcut Navigation Performance Fix ----------
  // The narrow rail shortcuts should feel instant. V43 simplified normal menu
  // navigation, but rail clicks could still take the synchronous route when a
  // heavy page such as Reports was first opened. V44 gives rail buttons their
  // own shell-first path: active state updates immediately, cached content is
  // reused when safe, and heavier rendering is deferred until after the browser
  // paints the click response.
  function injectV44RailPerformanceStyles(){
    if(document.getElementById('v44-rail-performance-styles')) return;
    const style=document.createElement('style');
    style.id='v44-rail-performance-styles';
    style.textContent=`
      body.v8-ui .rail-btn{will-change:background,color,box-shadow;transform:translateZ(0);}
      body.v8-ui .rail-btn.v44-pending{background:#fff;color:var(--green);box-shadow:0 3px 10px rgba(16,24,40,.08);}
      body.v8-ui .v44-instant-shell{background:#fff;border:1px solid #d8e2eb;border-radius:22px;padding:24px;box-shadow:0 2px 10px rgba(16,24,40,.04);margin-bottom:16px;}
      body.v8-ui .v44-instant-shell-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
      body.v8-ui .v44-instant-shell h2{font-size:28px;font-weight:900;letter-spacing:-.035em;color:#071b37;margin:0 0 6px;}
      body.v8-ui .v44-instant-shell p{margin:0;color:#53657d;line-height:1.45;max-width:780px;}
      body.v8-ui .v44-instant-shell-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}
      body.v8-ui .v44-instant-shell-note{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:900;color:#0a6f35;background:#e7f6ec;border:1px solid #c5e8d2;border-radius:999px;padding:6px 10px;white-space:nowrap;}
      body.v8-ui .v44-instant-shell-note:before{content:'';width:8px;height:8px;border-radius:50%;background:#0a8f3c;}
      body.v8-ui.dark-mode .rail-btn.v44-pending{background:#1d2b3a;color:#63d297;box-shadow:0 8px 16px rgba(0,0,0,.25);}
      body.v8-ui.dark-mode .v44-instant-shell{background:#14202d;border-color:#2a3c4f;color:#e8edf3;box-shadow:0 12px 32px rgba(0,0,0,.22);}
      body.v8-ui.dark-mode .v44-instant-shell h2{color:#f3f7fb;}
      body.v8-ui.dark-mode .v44-instant-shell p{color:#aab8c7;}
      body.v8-ui.dark-mode .v44-instant-shell-note{background:#102d22;border-color:#1f6042;color:#baf3d0;}
      @media(max-width:760px){body.v8-ui .v44-instant-shell-head{display:block}.v44-instant-shell-note{margin-top:12px}.v44-instant-shell h2{font-size:23px!important}.v44-instant-shell-actions .btn{width:100%;}}
    `;
    document.head.appendChild(style);
  }

  function v44IsRailShortcutPage(page){
    return ['dashboard','reports','apps'].includes(String(page||''));
  }

  function v44IsSafeRealContent(el){
    if(!el || !el.innerHTML.trim()) return false;
    const html=el.innerHTML;
    return !/v40-route-loading-card|v42-fallback-card|v44-instant-shell/.test(html) && !(typeof v43RouteHasOnlyLoading==='function' && v43RouteHasOnlyLoading(el));
  }

  function v44ShellDescription(page){
    const map={
      dashboard:'Business overview, cash flow, insights, and dashboard widgets.',
      reports:'Search, favorite, and open financial, sales, tax, banking, inventory, and management reports.',
      apps:'Open enabled SmartBooks modules and restore hidden modules from Settings.'
    };
    return map[page] || (typeof v43PageDescription==='function' ? v43PageDescription(page) : 'This workspace is ready.');
  }

  function v44ShellActions(page){
    if(page==='dashboard') return '<button class="btn primary" data-modal="customizeDashboard">Customize dashboard</button><button class="btn" data-action="refresh-dashboard">Refresh</button>';
    if(page==='reports') return '<button class="btn primary" data-action="report-filter" data-id="all">Open reports</button><button class="btn" data-nav="dashboard">Back to dashboard</button>';
    if(page==='apps') return '<button class="btn primary" data-modal="customize">Customize menu</button><button class="btn" data-nav="dashboard">Back to dashboard</button>';
    return typeof v43ActionButtons==='function' ? v43ActionButtons(page) : '<button class="btn primary" data-open-create>ï¼‹ New</button>';
  }

  function v44ShowInstantShell(page){
    injectV44RailPerformanceStyles();
    const el=document.getElementById('page-'+page);
    if(!el || v44IsSafeRealContent(el)) return;
    const label=(typeof v40GetPageLabel==='function') ? v40GetPageLabel(page) : String(page||'Workspace');
    el.innerHTML=`<div class="v44-instant-shell"><div class="v44-instant-shell-head"><div><h2>${escapeHTML(label)}</h2><p>${escapeHTML(v44ShellDescription(page))}</p></div><span class="v44-instant-shell-note">Ready</span></div><div class="v44-instant-shell-actions">${v44ShellActions(page)}</div></div>`;
  }

  function v44SafeCache(page){
    try{
      if(typeof v40PageCache==='undefined' || !v40PageCache?.get) return null;
      const cached=v40PageCache.get(page);
      const html=String(cached?.html||'');
      if(cached && cached.version===v40DataVersion && html && !/v40-route-loading-card|v42-fallback-card|v44-instant-shell/.test(html)) return cached;
    }catch(err){}
    return null;
  }

  function v44DeferRender(fn){
    // Let the click highlight and route switch paint first. requestIdleCallback is
    // preferred, with a timeout so the page still hydrates quickly.
    if(typeof requestIdleCallback==='function') requestIdleCallback(fn, {timeout:550});
    else if(typeof requestAnimationFrame==='function') requestAnimationFrame(()=>requestAnimationFrame(fn));
    else setTimeout(fn,0);
  }

  function v44RailActivateButton(page){
    document.querySelectorAll('.rail .rail-btn').forEach(btn=>{
      const active=btn.dataset.nav===page;
      btn.classList.toggle('active', active);
      btn.classList.toggle('v44-pending', active);
    });
    setTimeout(()=>document.querySelectorAll('.rail .rail-btn.v44-pending').forEach(b=>b.classList.remove('v44-pending')), 180);
  }

  function v44RenderRailPage(page, token){
    if(token !== v40NavToken || currentPage !== page) return;
    try{
      if(page==='dashboard'){
        if(typeof v43RenderDashboardBase==='function') v43RenderDashboardBase();
        else renderDashboard();
      }else{
        if(typeof v43RenderPageBase==='function') v43RenderPageBase(page);
        else renderPage(page);
      }
      if(typeof v43AfterRender==='function') v43AfterRender(page);
      else if(typeof v40AfterPageRender==='function') v40AfterPageRender(page);
    }catch(err){
      console.error('V44 rail render failed for '+page, err);
      if(typeof v43ShowWorkspaceCard==='function') v43ShowWorkspaceCard(page, 'This shortcut opened, but one section did not finish rendering. Use the actions below or try Refresh.');
      else v44ShowInstantShell(page);
    }
  }

  function v44NavigateRail(page){
    page = typeof v43NormalizePageId==='function' ? v43NormalizePageId(page) : (page || 'dashboard');
    injectV44RailPerformanceStyles();

    // Guard repeated clicks on the currently active rail shortcut. This prevents
    // accidental heavy re-rendering when the user clicks the same icon again.
    if(page===currentPage){
      v44RailActivateButton(page);
      document.getElementById('createMenu')?.classList.remove('open');
      if(typeof closeSmartSearch==='function') closeSmartSearch();
      return;
    }

    const token=++v40NavToken;
    if(v40NavTimer) clearTimeout(v40NavTimer);

    if(typeof v43ActivateRoute==='function') v43ActivateRoute(page);
    else if(typeof v40FastActivatePage==='function') v40FastActivatePage(page);
    else{
      currentPage=page;
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      document.getElementById('page-'+page)?.classList.add('active');
      document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active', b.dataset.nav===page));
    }
    v44RailActivateButton(page);

    const el=document.getElementById('page-'+page);
    const cached=v44SafeCache(page);
    if(cached && el){
      el.innerHTML=cached.html;
      if(typeof v43AfterRender==='function') v43AfterRender(page);
      v44DeferRender(()=>v44RenderRailPage(page, token));
      return;
    }

    if(v44IsSafeRealContent(el)){
      if(typeof v43AfterRender==='function') v43AfterRender(page);
      v44DeferRender(()=>v44RenderRailPage(page, token));
      return;
    }

    // First visit: show an actual shortcut shell, not a loading screen, then hydrate.
    v44ShowInstantShell(page);
    v44DeferRender(()=>v44RenderRailPage(page, token));
  }

  function v44OpenCreateFromRail(){
    injectV44RailPerformanceStyles();
    document.querySelectorAll('.rail .rail-btn').forEach(btn=>btn.classList.remove('v44-pending'));
    const menu=document.getElementById('createMenu');
    if(menu) menu.classList.toggle('open');
    if(typeof applyCreateMenuVisibility==='function') applyCreateMenuVisibility();
  }

  function v44PrewarmRailPages(){
    const pages=['apps','reports'];
    let i=0;
    const next=()=>{
      if(i>=pages.length) return;
      const page=pages[i++];
      const el=document.getElementById('page-'+page);
      if(el && !v44IsSafeRealContent(el)){
        v44DeferRender(()=>{
          // Only prewarm while the user remains elsewhere, and never replace the
          // active page. This builds cache for rail shortcuts without blocking.
          if(currentPage!==page){
            try{
              if(typeof v43RenderPageBase==='function') v43RenderPageBase(page);
              else renderPage(page);
              if(typeof v43AfterRender==='function') v43AfterRender(page);
            }catch(err){ console.warn('V44 prewarm skipped for '+page, err); }
          }
          next();
        });
      }else{
        next();
      }
    };
    const start=()=>next();
    if(typeof requestIdleCallback==='function') requestIdleCallback(start, {timeout:1600});
    else setTimeout(start, 900);
  }

  function v44SetupRailShortcutPerformance(){
    injectV44RailPerformanceStyles();
    document.querySelectorAll('.rail [data-nav]').forEach(btn=>{
      if(btn.dataset.v44RailBound==='1') return;
      btn.dataset.v44RailBound='1';
      btn.addEventListener('click', (e)=>{
        const page=btn.dataset.nav;
        if(!v44IsRailShortcutPage(page)) return;
        e.preventDefault();
        e.stopPropagation();
        if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
        v44NavigateRail(page);
      }, true);
    });
    document.querySelectorAll('.rail [data-open-create]').forEach(btn=>{
      if(btn.dataset.v44CreateBound==='1') return;
      btn.dataset.v44CreateBound='1';
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
        v44OpenCreateFromRail();
      }, true);
    });
    v44PrewarmRailPages();
  }

  const v44SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v44SetupEventListenersBase.apply(this, arguments);
    v44SetupRailShortcutPerformance();
  };




  // ---------- V45: Unified Navigation Performance Refactor ----------
  // V40-V44 improved symptoms, but multiple navigation wrappers still meant that
  // a normal menu click could synchronously rebuild large pages before the browser
  // had a chance to paint the active state. V45 makes every navigation entry point
  // use one fast route function. The click response paints first; full page
  // hydration is deferred and cached. The old route-loading shell is bypassed.
  function injectV45NavigationCoreStyles(){
    if(document.getElementById('v45-navigation-core-styles')) return;
    const style=document.createElement('style');
    style.id='v45-navigation-core-styles';
    style.textContent=`
      body.v8-ui .nav-item, body.v8-ui .rail-btn, body.v8-ui .module-pill{touch-action:manipulation;}
      body.v8-ui .nav-item.v45-fast-active, body.v8-ui .module-pill.v45-fast-active{background:#e7f6ec!important;color:#05603a!important;}
      body.v8-ui .v45-route-shell{background:#fff;border:1px solid #d8e2eb;border-radius:22px;padding:24px;box-shadow:0 2px 10px rgba(16,24,40,.04);margin-bottom:16px;}
      body.v8-ui .v45-route-shell-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
      body.v8-ui .v45-route-shell h2{font-size:28px;font-weight:900;letter-spacing:-.035em;color:#071b37;margin:0 0 6px;}
      body.v8-ui .v45-route-shell p{margin:0;color:#53657d;line-height:1.45;max-width:780px;}
      body.v8-ui .v45-route-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}
      body.v8-ui .v45-route-status{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:900;color:#0a6f35;background:#e7f6ec;border:1px solid #c5e8d2;border-radius:999px;padding:6px 10px;white-space:nowrap;}
      body.v8-ui .v45-route-status:before{content:'';width:8px;height:8px;border-radius:50%;background:#0a8f3c;}
      body.v8-ui.dark-mode .nav-item.v45-fast-active, body.v8-ui.dark-mode .module-pill.v45-fast-active{background:#102d22!important;color:#baf3d0!important;}
      body.v8-ui.dark-mode .v45-route-shell{background:#14202d;border-color:#2a3c4f;color:#e8edf3;box-shadow:0 12px 32px rgba(0,0,0,.22);}
      body.v8-ui.dark-mode .v45-route-shell h2{color:#f3f7fb;}
      body.v8-ui.dark-mode .v45-route-shell p{color:#aab8c7;}
      body.v8-ui.dark-mode .v45-route-status{background:#102d22;border-color:#1f6042;color:#baf3d0;}
      @media(max-width:760px){body.v8-ui .v45-route-shell-head{display:block}.v45-route-status{margin-top:12px}.v45-route-shell h2{font-size:23px!important}.v45-route-actions .btn{width:100%;}}
    `;
    document.head.appendChild(style);
  }

  let v45RouteToken = 0;
  let v45RouteTimer = null;
  const v45RouteCache = new Map();
  const v45LoadingPattern = /v40-route-loading-card|v42-fallback-card|v43-workspace-card|v44-instant-shell|v45-route-shell/;

  function v45NormalizePageId(page){
    page = String(page || 'dashboard');
    if(typeof v43NormalizePageId === 'function') return v43NormalizePageId(page);
    if(page === 'products') page = 'inventory';
    if(!document.getElementById('page-'+page) && page !== 'dashboard') page = 'dashboard';
    return page;
  }

  function v45PageLabel(page){
    if(typeof v40GetPageLabel === 'function') return v40GetPageLabel(page);
    return String(page || 'Workspace').replace(/[-_]/g,' ').replace(/\b\w/g, m=>m.toUpperCase());
  }

  function v45PageDescription(page){
    if(typeof v43PageDescription === 'function') return v43PageDescription(page);
    if(typeof v42PageDescription === 'function') return v42PageDescription(page);
    return 'This workspace is ready.';
  }

  function v45PageActions(page){
    if(typeof v43ActionButtons === 'function') return v43ActionButtons(page);
    if(typeof v42ActionButtons === 'function') return v42ActionButtons(page);
    return '<button class="btn primary" data-open-create>ï¼‹ New</button><button class="btn" data-nav="dashboard">Back to dashboard</button>';
  }

  function v45IsRouteShellHtml(html){
    return v45LoadingPattern.test(String(html || ''));
  }

  function v45HasRealContent(el){
    return !!(el && el.innerHTML && el.innerHTML.trim() && !v45IsRouteShellHtml(el.innerHTML));
  }

  function v45CacheGet(page){
    const local = v45RouteCache.get(page);
    if(local && local.html && !v45IsRouteShellHtml(local.html)) return local.html;
    try{
      const v40 = (typeof v40PageCache !== 'undefined' && v40PageCache?.get) ? v40PageCache.get(page) : null;
      if(v40 && v40.html && !v45IsRouteShellHtml(v40.html)) return v40.html;
    }catch(err){}
    return '';
  }

  function v45CacheSet(page, html){
    html = String(html || '');
    if(!html.trim() || v45IsRouteShellHtml(html)) return;
    v45RouteCache.set(page, {html, stamp:Date.now()});
    try{
      if(typeof v40PageCache !== 'undefined' && page !== 'dashboard' && v40PageCache?.set){
        v40PageCache.set(page, {version:typeof v40DataVersion !== 'undefined' ? v40DataVersion : 0, html, stamp:Date.now()});
      }
    }catch(err){}
  }

  function v45InvalidateRouteCache(reason){
    v45RouteCache.clear();
    try{ if(typeof v40PageCache !== 'undefined' && v40PageCache?.clear) v40PageCache.clear(); }catch(err){}
  }

  function v45PurgeShellCache(){
    try{
      for(const [key, entry] of v45RouteCache.entries()){
        if(!entry || v45IsRouteShellHtml(entry.html)) v45RouteCache.delete(key);
      }
      if(typeof v40PageCache !== 'undefined' && v40PageCache?.forEach){
        v40PageCache.forEach((entry,key)=>{ if(!entry || v45IsRouteShellHtml(entry.html)) v40PageCache.delete(key); });
      }
    }catch(err){}
  }

  function v45ActivateRoute(page){
    injectV45NavigationCoreStyles();
    currentPage = page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const el = document.getElementById('page-'+page);
    if(el) el.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>{
      const active = b.dataset.nav === page;
      b.classList.toggle('active', active);
      b.classList.toggle('v45-fast-active', active);
    });
    setTimeout(()=>document.querySelectorAll('.v45-fast-active').forEach(b=>b.classList.remove('v45-fast-active')), 160);
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('open');
    document.getElementById('createMenu')?.classList.remove('open');
    if(typeof closeSmartSearch === 'function') closeSmartSearch();
  }

  function v45ShowRouteShell(page){
    injectV45NavigationCoreStyles();
    const el = document.getElementById('page-'+page);
    if(!el || v45HasRealContent(el)) return;
    el.innerHTML = `<div class="v45-route-shell"><div class="v45-route-shell-head"><div><h2>${escapeHTML(v45PageLabel(page))}</h2><p>${escapeHTML(v45PageDescription(page))}</p></div><span class="v45-route-status">Ready</span></div><div class="v45-route-actions">${v45PageActions(page)}</div></div>`;
  }

  function v45AfterHydrate(page){
    const el = document.getElementById('page-'+page);
    if(!el) return;
    try{
      if(!v45HasRealContent(el)){
        v45ShowRouteShell(page);
      }else{
        if(typeof v21ApplyMoneyAlignment === 'function') v21ApplyMoneyAlignment(el);
        if(page === 'dashboard' && typeof v26HydrateEmptyWidgets === 'function') v26HydrateEmptyWidgets();
        v45CacheSet(page, el.innerHTML);
      }
    }catch(err){ console.warn('V45 post-route hydration skipped', err); }
  }

  function v45HydrateRoute(page, token){
    if(token !== v45RouteToken || currentPage !== page) return;
    try{
      const el = document.getElementById('page-'+page);
      if(el && v45IsRouteShellHtml(el.innerHTML)) el.innerHTML = '';
      if(page === 'dashboard'){
        if(typeof v43RenderDashboardBase === 'function') v43RenderDashboardBase();
        else if(typeof v42RenderDashboardBase === 'function') v42RenderDashboardBase();
        else if(typeof v40RenderDashboardBase === 'function') v40RenderDashboardBase();
        else renderDashboard();
      }else{
        if(typeof v43RenderPageBase === 'function') v43RenderPageBase(page);
        else if(typeof v42RenderPageBase === 'function') v42RenderPageBase(page);
        else if(typeof v40RenderPageBase === 'function') v40RenderPageBase(page);
        else renderPage(page);
      }
      v45AfterHydrate(page);
    }catch(err){
      console.error('V45 route hydrate failed for '+page, err);
      v45ShowRouteShell(page);
      showToast?.('Opened '+v45PageLabel(page)+'. Some content did not finish rendering.');
    }
  }

  function v45DeferHydration(fn){
    // The point is not just to delay work, but to let the active button/page switch
    // paint before table/chart work begins.
    const run = ()=>{
      if(typeof requestIdleCallback === 'function') requestIdleCallback(fn, {timeout:420});
      else setTimeout(fn, 24);
    };
    if(typeof requestAnimationFrame === 'function') requestAnimationFrame(()=>requestAnimationFrame(run));
    else setTimeout(run, 0);
  }

  function v45NavigateFast(page, options={}){
    page = v45NormalizePageId(page);
    injectV45NavigationCoreStyles();
    v45PurgeShellCache();
    if(v45RouteTimer) clearTimeout(v45RouteTimer);

    const el = document.getElementById('page-'+page);
    const alreadyHere = currentPage === page && v45HasRealContent(el);
    if(alreadyHere && !options.force){
      v45ActivateRoute(page);
      return;
    }

    const token = ++v45RouteToken;
    if(typeof v40NavToken !== 'undefined') v40NavToken++;
    v45ActivateRoute(page);

    const cachedHtml = v45CacheGet(page);
    if(el && cachedHtml && !v45HasRealContent(el)){
      el.innerHTML = cachedHtml;
      v45AfterHydrate(page);
    }else if(!v45HasRealContent(el)){
      v45ShowRouteShell(page);
    }else{
      v45AfterHydrate(page);
    }

    // Hydrate only when the page has no real content, when explicitly forced, or
    // when a stale shell/cache was used. Existing pages no longer refresh on every
    // click, which was the main perceived slowness.
    if(options.force || !el || !v45HasRealContent(el) || v45IsRouteShellHtml(el.innerHTML)){
      v45DeferHydration(()=>v45HydrateRoute(page, token));
    }
  }

  // Keep normal state saving, but invalidate route caches only after actual saves.
  // This avoids retaining stale tables while avoiding the previous full render path.
  const v45SaveStateBase = (typeof v40SaveStateBase === 'function') ? v40SaveStateBase : saveState;
  saveState = function(){
    v45InvalidateRouteCache('saveState');
    return v45SaveStateBase.apply(this, arguments);
  };

  // Render only what is needed. The original renderAll rebuilt dashboard plus the
  // active page, which made unrelated actions and navigation feel slower over time.
  const v45RenderAllBase = renderAll;
  renderAll = function(){
    try{
      document.getElementById('topCompanyName').textContent = state.company.name;
      if(typeof renderMenu === 'function') renderMenu();
      if(typeof renderModulePills === 'function') renderModulePills();
      const page = v45NormalizePageId(currentPage || 'dashboard');
      const token = ++v45RouteToken;
      v45ActivateRoute(page);
      v45HydrateRoute(page, token);
    }catch(err){
      console.warn('V45 renderAll fallback used', err);
      return v45RenderAllBase.apply(this, arguments);
    }
  };

  // Make every menu source use the same fast route, and prevent legacy bubbling
  // handlers from also firing. This covers sidebar menu, bookmarks, dashboard pills,
  // left rail, search result buttons, and any card buttons with data-nav.
  function v45InstallUnifiedNavigationCapture(){
    if(document.documentElement.dataset.v45UnifiedNavBound === '1') return;
    document.documentElement.dataset.v45UnifiedNavBound = '1';
    document.addEventListener('click', (e)=>{
      const nav = e.target.closest('[data-nav]');
      if(!nav || !nav.dataset.nav) return;
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      v45NavigateFast(nav.dataset.nav);
    }, true);
  }

  // Disable V44 background prewarm. It could make the UI feel busy shortly after
  // startup without helping normal sidebar navigation enough.
  if(typeof v44PrewarmRailPages === 'function'){
    v44PrewarmRailPages = function(){};
  }

  const v45SetupEventListenersBase = setupEventListeners;
  setupEventListeners = function(){
    v45SetupEventListenersBase.apply(this, arguments);
    v45InstallUnifiedNavigationCapture();
  };

  // Replace the public navigate function as well, so code paths that call
  // navigate('sales') directly still use the new core route.
  navigate = function(page){
    v45NavigateFast(page);
  };

  // ---------- V47: Global Search Command Center ----------
  // Converts global search from page navigation into record-level search, quick actions,
  // category filtering, fuzzy/exact ranking, recent records, no-result suggestions,
  // keyboard accessibility, and cached search indexing.
  let v47SearchResults = [];
  let v47SearchActiveIndex = -1;
  let v47SearchFilter = 'All';
  let v47SearchIndexCache = null;
  let v47SearchStamp = '';

  function injectV47SearchStyles(){
    if(document.getElementById('v47-search-command-center-style')) return;
    const style=document.createElement('style');
    style.id='v47-search-command-center-style';
    style.textContent=`
      .topbar .search{position:relative;z-index:90}
      .v47-search-dropdown{position:absolute;left:0;right:0;top:calc(100% + 8px);background:#fff;border:1px solid #d7e2ea;border-radius:18px;box-shadow:0 18px 44px rgba(16,24,40,.20);overflow:hidden;display:none;max-height:min(76vh,660px);z-index:140;color:#0b1f3a}
      .v47-search-dropdown.open{display:block}
      .v47-search-head{padding:12px 14px 10px;border-bottom:1px solid #edf2f6;background:#fbfdff;display:grid;gap:9px}
      .v47-search-titlebar{display:flex;align-items:center;justify-content:space-between;gap:12px}.v47-search-titlebar strong{font-size:13px;color:#172033}.v47-search-titlebar span{font-size:12px;color:#667085;white-space:nowrap}
      .v47-search-filters{display:flex;gap:6px;flex-wrap:wrap}.v47-filter-chip{border:1px solid #d6e3ec;background:#fff;color:#344054;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:900;cursor:pointer}.v47-filter-chip.active{background:var(--green);border-color:var(--green);color:#fff}.v47-filter-chip .count{opacity:.75;margin-left:3px}
      .v47-search-scroll{max-height:560px;overflow:auto;padding:8px}.v47-search-group{padding:6px 0}.v47-search-group-title{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#667085;font-weight:900;padding:8px 10px 4px}
      .v47-search-row{width:100%;border:0;background:transparent;border-radius:14px;padding:10px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:10px;text-align:left;align-items:start;color:#0b1f3a;cursor:pointer;outline:0}.v47-search-row:hover,.v47-search-row.active{background:#eef8f2;color:#063e25}.v47-search-row:focus-visible{box-shadow:0 0 0 3px rgba(10,143,60,.18)}
      .v47-search-icon{width:36px;height:36px;border-radius:13px;background:#eaf3ff;color:#0a62a3;display:grid;place-items:center;font-weight:900;line-height:1;font-size:12px}.v47-search-row.active .v47-search-icon,.v47-search-row:hover .v47-search-icon{background:#dff7e7;color:#067032}
      .v47-search-main{min-width:0;display:grid;gap:4px}.v47-search-title{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v47-search-desc{color:#667085;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v47-search-path{font-size:11px;color:#73839a;font-weight:800}.v47-search-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}.v47-search-action{border:1px solid #d6e3ec;background:#fff;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900;color:#344054}.v47-search-action.primary{background:var(--green);border-color:var(--green);color:#fff}.v47-search-action:hover{box-shadow:0 2px 8px rgba(16,24,40,.12)}
      .v47-search-badge{font-size:11px;font-weight:900;border:1px solid #d8e2ea;border-radius:999px;padding:4px 7px;color:#526173;background:#fff;white-space:nowrap}.v47-search-empty{padding:18px;color:#667085;background:#fbfcfd;border:1px dashed #d0d7de;border-radius:14px;margin:8px;text-align:center}.v47-search-empty h4{margin:0 0 6px;color:#172033}.v47-search-tips{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-top:12px}.v47-search-tip{border:1px solid #d6e3ec;border-radius:999px;padding:6px 9px;background:#fff;color:#344054;font-weight:900;font-size:12px}.v47-search-tip.primary{background:var(--green);color:#fff;border-color:var(--green)}
      mark.v47-mark{background:#fff2a8;color:inherit;border-radius:4px;padding:0 1px}.v47-search-focus{outline:3px solid rgba(10,143,60,.34)!important;outline-offset:-2px!important;box-shadow:0 0 0 4px rgba(10,143,60,.10)!important}.v47-search-focus td{background:#eef8f2!important}
      .v47-detail-card{border:1px solid #e2e8ee;border-radius:16px;background:#fbfcfd;padding:14px}.v47-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.v47-detail-table{margin-top:12px}.v47-inline-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      body.dark-mode .v47-search-dropdown, body.v8-ui.dark-mode .v47-search-dropdown{background:#14202d;border-color:#2a3c4f;color:#e8edf3;box-shadow:0 18px 44px rgba(0,0,0,.45)}
      body.dark-mode .v47-search-head, body.v8-ui.dark-mode .v47-search-head{background:#101b27;border-bottom-color:#2a3c4f}.v8-ui.dark-mode .v47-search-titlebar strong,body.dark-mode .v47-search-titlebar strong,body.dark-mode .v47-search-title,body.v8-ui.dark-mode .v47-search-title{color:#f3f7fb}body.dark-mode .v47-search-titlebar span,body.v8-ui.dark-mode .v47-search-titlebar span,body.dark-mode .v47-search-desc,body.v8-ui.dark-mode .v47-search-desc,body.dark-mode .v47-search-path,body.v8-ui.dark-mode .v47-search-path,body.dark-mode .v47-search-group-title,body.v8-ui.dark-mode .v47-search-group-title{color:#aebdcc}
      body.dark-mode .v47-search-row, body.v8-ui.dark-mode .v47-search-row{color:#e8edf3}body.dark-mode .v47-search-row:hover,body.v8-ui.dark-mode .v47-search-row:hover,body.dark-mode .v47-search-row.active,body.v8-ui.dark-mode .v47-search-row.active{background:#1d2b3a;color:#fff}body.dark-mode .v47-search-icon,body.v8-ui.dark-mode .v47-search-icon{background:#102b44;color:#bfe3ff}body.dark-mode .v47-search-badge,body.v8-ui.dark-mode .v47-search-badge,body.dark-mode .v47-filter-chip,body.v8-ui.dark-mode .v47-filter-chip,body.dark-mode .v47-search-tip,body.v8-ui.dark-mode .v47-search-tip,body.dark-mode .v47-search-action,body.v8-ui.dark-mode .v47-search-action{background:#101b27;border-color:#34495e;color:#e8edf3}body.dark-mode .v47-filter-chip.active,body.v8-ui.dark-mode .v47-filter-chip.active,body.dark-mode .v47-search-action.primary,body.v8-ui.dark-mode .v47-search-action.primary,body.dark-mode .v47-search-tip.primary,body.v8-ui.dark-mode .v47-search-tip.primary{background:var(--green);border-color:var(--green);color:#fff}body.dark-mode .v47-search-empty,body.v8-ui.dark-mode .v47-search-empty{background:#101b27;border-color:#34495e;color:#cbd5e1}body.dark-mode .v47-search-empty h4,body.v8-ui.dark-mode .v47-search-empty h4{color:#f3f7fb}body.dark-mode .v47-detail-card,body.v8-ui.dark-mode .v47-detail-card{background:#101b27;border-color:#2a3c4f}
      @media(max-width:720px){.v47-search-dropdown{position:fixed;left:12px;right:12px;top:64px}.v47-search-row{grid-template-columns:30px minmax(0,1fr)}.v47-search-badge{display:none}.v47-detail-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function v47Clean(v){ return String(v ?? '').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(); }
  function v47Lower(v){ return v47Clean(v).toLowerCase(); }
  function v47Norm(v){ return v47Lower(v).normalize ? v47Lower(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'') : v47Lower(v).replace(/[^a-z0-9]+/g,''); }
  function v47Tokens(v){ return v47Lower(v).split(/[^a-z0-9$]+/).filter(t=>t.length>1); }
  function v47Money(v){ try{return money(v);}catch(e){return '$'+(Number(v)||0).toFixed(2);} }
  function v47Num(v){ try{return num(v);}catch(e){return Number(v)||0;} }
  function v47Customer(id){ try{return getCustomer(id)||{};}catch(e){ return (state.customers||[]).find(c=>c.id===id)||{}; } }
  function v47Vendor(id){ try{return getVendor(id)||{};}catch(e){ return (state.vendors||[]).find(v=>v.id===id)||{}; } }
  function v47CustomerName(id){ const c=v47Customer(id); return c.name || id || ''; }
  function v47VendorName(id){ const v=v47Vendor(id); return v.name || id || ''; }
  function v47AccountLabel(id){ try{return accountLabel(id);}catch(e){ const a=(state.chartOfAccounts||[]).find(x=>x.id===id||x.code===id); return a?`${a.code} Â· ${a.name}`:(id||''); } }
  function v47InvTotal(i){ try{return invoiceTotal(i);}catch(e){return v47Num(i.subtotal)+v47Num(i.tax);} }
  function v47InvOpen(i){ try{return openAmount(i);}catch(e){return Math.max(0,v47InvTotal(i)-v47Num(i.paid));} }
  function v47BillTotal(b){ try{return billTotal(b);}catch(e){return v47Num(b.amount)+v47Num(b.tax);} }
  function v47BillOpen(b){ try{return billOpenAmount(b);}catch(e){return Math.max(0,v47BillTotal(b)-v47Num(b.paid));} }
  function v47Esc(v){ return escapeHTML(v47Clean(v)); }
  function v47Icon(label){ const s=v47Clean(label); return s.length<=2 ? s : s.slice(0,2).toUpperCase(); }
  function v47Path(group, badge){
    if(group==='Transactions' && badge==='Invoice') return 'Sales > Invoices';
    if(group==='Transactions' && badge==='Payment') return 'Sales > Payments';
    if(group==='Transactions' && badge==='Estimate') return 'Sales > Estimates';
    if(group==='Transactions' && badge==='Bill') return 'Expenses > Bills';
    if(group==='Transactions' && badge==='Expense') return 'Expenses > Expenses';
    if(group==='Transactions' && badge==='Deposit') return 'Banking > Deposits';
    if(group==='Transactions' && badge==='Bank feed') return 'Banking > Bank review';
    if(group==='Customers') return 'Customers';
    if(group==='Vendors') return 'Vendors';
    if(group==='Products & Services') return 'Inventory > Products & Services';
    if(group==='Accounting') return 'Accounting > Chart of Accounts';
    return group;
  }
  function v47Add(list, group, title, desc, badge, icon, keywords, target, priority, actions){
    const path=v47Path(group,badge);
    const recordId=target && target.id ? String(target.id) : '';
    const hay=[title,desc,badge,path,recordId,keywords].join(' ');
    list.push({group,title:v47Clean(title),desc:v47Clean(desc),badge:v47Clean(badge||group),icon:v47Clean(icon||v47Icon(title)),path,keywords:v47Lower(hay),norm:v47Norm(hay),target,priority:priority||0,actions:actions||[]});
  }
  function v47GroupForFilter(g){ return g==='Products & Services'?'Products':g; }
  function v47AllFilters(){ return ['All','Transactions','Customers','Vendors','Reports','Actions','Accounting','Products','Help','Pages']; }
  function v47InvalidateSearch(){ v47SearchIndexCache=null; v47SearchStamp=''; }
  function v47SearchDataStamp(){
    try{
      return JSON.stringify({
        inv:(state.invoices||[]).map(x=>[x.id,x.customerId,x.status,x.date,x.dueDate,x.paid,x.subtotal,x.tax,x.total]).join('|'),
        pmt:(state.payments||[]).map(x=>[x.id,x.invoiceId,x.customerId,x.amount,x.date]).join('|'),
        est:(state.estimates||[]).map(x=>[x.id,x.estimateNumber,x.customerId,x.status,x.total,x.date]).join('|'),
        exp:(state.expenses||[]).map(x=>[x.id,x.vendorId,x.amount,x.tax,x.date,x.memo]).join('|'),
        bills:(state.bills||[]).map(x=>[x.id,x.vendorId,x.status,x.amount,x.tax,x.dueDate,x.paid]).join('|'),
        cust:(state.customers||[]).map(x=>[x.id,x.name,x.company,x.email,x.phone]).join('|'),
        vend:(state.vendors||[]).map(x=>[x.id,x.name,x.email,x.phone]).join('|'),
        prod:(state.products||[]).map(x=>[x.id,x.name,x.type,x.price,x.sku]).join('|'),
        acct:(state.chartOfAccounts||[]).map(x=>[x.id,x.code,x.name,x.type]).join('|')
      });
    }catch(e){ return String(Date.now()); }
  }

  function v47QueryAliases(q){
    const s=v47Lower(q), a=[];
    if(/\bp\s*&\s*l\b|\bpnl\b|\bpl\b|profit|income statement/.test(s)) a.push('profit loss income statement net income revenue expenses report');
    if(/\ba\/?r\b|receivable|owed|owe me|customer balance|open invoice|unpaid invoice/.test(s)) a.push('accounts receivable ar aging open invoices customer balance unpaid overdue who owes you');
    if(/\ba\/?p\b|payable|bill|owe|vendor balance/.test(s)) a.push('accounts payable ap aging unpaid bills vendor balance pay bills');
    if(/gst|hst|tax|cra|sales tax|remit/.test(s)) a.push('gst hst sales tax liability tax detail cra remittance input tax credit');
    if(/cash|bank|deposit|reconcile|review|cleared/.test(s)) a.push('cash flow banking bank transactions reconciliation bank review queue deposits clear match categorize');
    if(/estimate|quote|proposal|pipeline/.test(s)) a.push('sales pipeline estimates quotes accepted draft converted proposal');
    if(/new|create|add/.test(s)) a.push('action create add new invoice bill customer vendor product expense estimate');
    if(/setup|settings|customize|menu|dashboard|layout/.test(s)) a.push('settings setup customize menu dashboard layout widgets');
    return [s, ...a].join(' ');
  }

  function v47BuildSearchIndex(){
    const stamp=v47SearchDataStamp();
    if(v47SearchIndexCache && stamp===v47SearchStamp) return v47SearchIndexCache;
    const rows=[];
    const moduleDescriptions={
      dashboard:'Business overview, cash flow, widgets, invoices, bank accounts, and business feed.',
      banking:'Bank feed, review, matching, categorization, clearing, and reconciliation.',
      transactions:'All posted invoices, payments, expenses, bills, deposits, and bank feed transactions.',
      accounting:'Chart of accounts, journal entries, general ledger, trial balance, debits, and credits.',
      sales:'Invoices, estimates, sales orders, payments, payment links, recurring payments, and customers.',
      customers:'Customer list, open balances, A/R, estimates, invoices, and contact details.',
      expenses:'Expenses, bills, pay bills, vendor credits, checks, and credit card credits.',
      vendors:'Supplier records, open bills, vendor credits, and payment history.',
      reports:'Profit and Loss, Balance Sheet, A/R Aging, A/P Aging, tax, sales, and management reports.',
      inventory:'Products, services, SKUs, inventory value, purchase orders, receiving.',
      projects:'Project budgets, costs, revenue, and project profitability.', time:'Time entries, billable hours, and team activity.', payroll:'Payroll records, employees, contractors, and pay runs.',
      taxes:'GST/HST collected, input tax credits, tax liability, and tax detail.', apps:'Enabled app modules and shortcuts.', settings:'Company profile, menu customization, dashboard widgets, invoice branding, and data controls.', setup:'Guided setup checklist and onboarding tasks.', getthingsdone:'Work queue for delayed charges, credits, time review, checks, payroll, and setup items.'
    };
    const modules=[]; try{ if(Array.isArray(masterModuleRegistry)) modules.push(...masterModuleRegistry); }catch(e){} if(!modules.length && Array.isArray(menuModules)) modules.push(...menuModules);
    modules.forEach(m=>v47Add(rows,'Pages',m.label||m.id,moduleDescriptions[m.id]||'Open workspace','Page',v47Icon(m.label||m.id),`${m.id} ${m.label||''}`,{kind:'nav',page:m.id},10,[{label:'Open',action:'open',primary:true}]));
    v47Add(rows,'Pages','Dashboard','Business overview, widgets, cash flow and quick actions.','Page','âŒ‚','home business overview',{kind:'nav',page:'dashboard'},15,[{label:'Open',action:'open',primary:true}]);

    const actions=[
      ['Create invoice','Create a customer invoice and post A/R.','invoice','invoice sales get paid bill customer'],['Receive payment','Record customer payment against an invoice.','payment','payment receive paid deposit customer ar'],['Create estimate','Create a non-posting quote / estimate.','estimate','quote sales pipeline proposal'],['Create sales order','Create a sales order workflow record.','salesOrder','sales order'],['Record expense','Record a paid business expense.','expense','expense receipt payment vendor'],['Create bill','Create a vendor bill and A/P balance.','bill','bill accounts payable vendor'],['Pay bills','Pay an open vendor bill.','payBill','pay bill accounts payable vendor'],['Bank deposit','Add a bank deposit transaction.','deposit','bank deposit money in'],['Bank transaction','Add/import a bank transaction for review.','bankTx','bank feed review categorize'],['Reconcile bank account','Open bank reconciliation workflow.','reconcile','bank reconcile reconciliation'],['Journal entry','Create a manual journal entry.','journal','journal debit credit accounting'],['Add customer','Create a customer record.','customer','customer lead contact'],['Add vendor','Create a vendor/supplier record.','vendor','vendor supplier'],['Add product/service','Create a product or service item.','product','product service item sku inventory'],['Customize dashboard','Show, hide, resize, and reorder dashboard widgets.','customizeDashboard','dashboard customize widgets layout'],['Customize menu','Show, hide, and reorder sidebar menu modules.','manageMenu','menu manage navigation sidebar']
    ];
    actions.forEach(([title,desc,modal,keywords])=>v47Add(rows,'Actions',title,desc,'Action','ï¼‹',keywords,{kind:'modal',modal},22,[{label:'Open',action:'open',primary:true}]));

    try{ const reports=(typeof reportCatalogV8==='function') ? reportCatalogV8() : []; reports.forEach(r=>{ let aliases=''; if(r.id==='profit-loss') aliases='p&l pnl profit loss income statement net income revenue expenses'; if(r.id==='ar-aging') aliases='ar a/r accounts receivable who owes you aging unpaid overdue open invoices'; if(r.id==='ap-aging') aliases='ap a/p accounts payable what you owe aging unpaid bills vendors'; if(r.id==='sales-tax-liability') aliases='gst hst tax cra sales tax liability remittance'; if(r.id==='balance-sheet') aliases='assets liabilities equity financial position'; if(r.id==='cash-flow') aliases='cash flow bank money in money out'; v47Add(rows,'Reports',r.name,r.desc||r.category,'Report','â–¤',`${r.id} ${r.category} ${aliases}`,{kind:'report',reportId:r.id},20,[{label:'Open report',action:'open',primary:true}]); }); }catch(e){}

    (state.invoices||[]).forEach(i=>{ const c=v47Customer(i.customerId), cname=c.name||i.customerId||'', total=v47InvTotal(i), open=v47InvOpen(i), st=(typeof invoiceDisplayStatus==='function'?invoiceDisplayStatus(i):i.status)||'Invoice'; const itemText=(i.items||[]).map(x=>`${x.desc||''} ${x.productId||''}`).join(' '); const actions=[{label:'View',action:'view',primary:true}]; if(open>0.01) actions.push({label:'Receive payment',action:'receive'}); actions.push({label:(i.sentDate?'Send reminder':'Send'),action:'send'},{label:'Print/PDF',action:'print'}); v47Add(rows,'Transactions',`${i.id} Â· ${cname}`,`${st} Â· ${i.date||''} Â· Due ${i.dueDate||'â€”'} Â· Total ${v47Money(total)} Â· Open ${v47Money(open)}`,'Invoice','INV',`${i.id} ${cname} ${c.company||''} ${c.email||''} ${st} ${i.date||''} ${i.dueDate||''} ${total} ${open} ${i.memo||''} ${itemText} ${v47AccountLabel(i.incomeAccountId||'4000')} accounts receivable open overdue paid sent`,{kind:'invoice',id:i.id},38,actions); });
    (state.payments||[]).forEach(p=>{ const cname=v47CustomerName(p.customerId); const actions=[{label:'View',action:'view',primary:true}]; if(p.invoiceId) actions.push({label:'Open invoice',action:'invoice'}); if(!p.depositId) actions.push({label:'Deposit',action:'deposit'}); v47Add(rows,'Transactions',`${p.id} Â· ${cname}`,`Payment Â· ${p.date||''} Â· ${v47Money(p.amount)}${p.invoiceId?' Â· '+p.invoiceId:''}`,'Payment','$',`${p.id} ${cname} ${p.invoiceId||''} ${p.amount} ${p.date||''} received paid deposit ${p.memo||''}`,{kind:'payment',id:p.id},32,actions); });
    (state.estimates||[]).forEach(e=>{ const cname=v47CustomerName(e.customerId); const numId=e.estimateNumber||e.id; const total=v47Num(e.total ?? e.amount); const st=(typeof v18EstimateDisplayStatus==='function'?v18EstimateDisplayStatus(e):e.status)||'Estimate'; const actions=[{label:'View',action:'view',primary:true},{label:'Edit',action:'edit'}]; if(st==='Accepted' && !e.convertedInvoiceId) actions.push({label:'Convert',action:'convert'}); v47Add(rows,'Transactions',`${numId} Â· ${cname}`,`${st} Â· ${e.date||''} Â· ${v47Money(total)}${e.convertedInvoiceId?' Â· Invoice '+e.convertedInvoiceId:''}`,'Estimate','EST',`${e.id} ${e.estimateNumber||''} ${cname} quote estimate proposal pipeline ${st} ${e.date||''} ${e.expiryDate||''} ${total} ${e.scope||''} ${e.terms||''}`,{kind:'estimate',id:e.id},32,actions); });
    (state.expenses||[]).forEach(x=>{ const vname=v47VendorName(x.vendorId); const total=v47Num(x.total ?? x.amount)+v47Num(x.tax); v47Add(rows,'Transactions',`${x.id} Â· ${vname}`,`Expense Â· ${x.date||''} Â· ${v47Money(total)} Â· ${x.memo||x.account||''}`,'Expense','EXP',`${x.id} ${vname} ${x.memo||''} ${x.paymentMethod||''} ${total} ${x.date||''} ${v47AccountLabel(x.expenseAccountId||'')} ${x.account||''}`,{kind:'expense',id:x.id},28,[{label:'View',action:'view',primary:true}]); });
    (state.bills||[]).forEach(b=>{ const vname=v47VendorName(b.vendorId); const open=v47BillOpen(b); const actions=[{label:'View',action:'view',primary:true}]; if(open>0.01) actions.push({label:'Pay bill',action:'pay'}); v47Add(rows,'Transactions',`${b.id} Â· ${vname}`,`${b.status||'Bill'} Â· Due ${b.dueDate||'â€”'} Â· Total ${v47Money(v47BillTotal(b))} Â· Open ${v47Money(open)}`,'Bill','BILL',`${b.id} ${vname} ${b.status||''} ${b.dueDate||''} ${open} ${v47BillTotal(b)} accounts payable ap vendor bill pay due ${b.memo||''}`,{kind:'bill',id:b.id},30,actions); });
    (state.deposits||[]).forEach(d=>v47Add(rows,'Transactions',`${d.id} Â· Deposit`,`${d.date||''} Â· ${v47Money(d.amount)} Â· ${d.memo||''}`,'Deposit','DEP',`${d.id} bank deposit ${d.amount} ${d.date||''} ${d.memo||''}`,{kind:'deposit',id:d.id},26,[{label:'View',action:'view',primary:true}]));
    (state.bankTransactions||[]).forEach(tx=>v47Add(rows,'Transactions',`${tx.id} Â· ${tx.description}`,`${tx.date||''} Â· ${v47Money(tx.amount)} Â· ${tx.status||'Bank feed'} Â· ${tx.matchType||''}`,'Bank feed','BANK',`${tx.id} ${tx.description} ${tx.amount} ${tx.date||''} ${tx.note||''} bank review reconcile match categorize clear ${tx.linkedId||''}`,{kind:'banktx',id:tx.id},30,[{label:'View',action:'view',primary:true},{label:'Review',action:'review'}]));

    (state.customers||[]).forEach(c=>{ const open=(typeof customerOpenBalance==='function'?customerOpenBalance(c.id):0); v47Add(rows,'Customers',c.name,`${c.company||''} Â· ${c.email||''} Â· Open balance ${v47Money(open)}`,'Customer','ðŸ‘¥',`${c.id} ${c.name||''} ${c.company||''} ${c.email||''} ${c.phone||''} ${c.type||''} receivable invoice estimate customer`,{kind:'customer',id:c.id},28,[{label:'View',action:'view',primary:true},{label:'Invoice',action:'invoice'},{label:'Estimate',action:'estimate'}]); });
    (state.vendors||[]).forEach(v=>v47Add(rows,'Vendors',v.name,`${v.category||'Vendor'} Â· ${v.email||''} Â· ${v.phone||''}`,'Vendor','ðŸª',`${v.id} ${v.name||''} ${v.email||''} ${v.phone||''} ${v.category||''} bill supplier payable`,{kind:'vendor',id:v.id},28,[{label:'View',action:'view',primary:true},{label:'Create bill',action:'bill'}]));
    (state.products||[]).forEach(p=>v47Add(rows,'Products & Services',p.name,`${p.type||'Item'} Â· ${v47Money(p.price)} Â· ${v47AccountLabel(p.incomeAccountId||'')}`,'Item','â–£',`${p.id} ${p.name||''} ${p.sku||''} ${p.type||''} ${p.price} product service sku inventory item revenue ${v47AccountLabel(p.incomeAccountId||'')}`,{kind:'product',id:p.id},24,[{label:'View',action:'view',primary:true}]));
    (state.chartOfAccounts||[]).forEach(a=>v47Add(rows,'Accounting',`${a.code} Â· ${a.name}`,`${a.type} Â· ${a.detail||''} Â· Balance ${v47Money((typeof normalBalance==='function')?normalBalance(a.id):0)}`,'Account','â–¤',`${a.id} ${a.code} ${a.name||''} ${a.type||''} ${a.normal||''} ${a.detail||''} chart of accounts ledger debit credit balance`,{kind:'account',id:a.id},22,[{label:'View',action:'view',primary:true},{label:'Ledger',action:'ledger'}]));

    v47Add(rows,'Help','Search tips','Use invoice numbers, customer names, vendor names, amounts, due dates, report names, or commands such as â€œnew invoiceâ€.','Help','?','help keyboard search tips exact match fuzzy search commands',{kind:'help',id:'search-tips'},12,[{label:'Open help',action:'open',primary:true}]);
    v47Add(rows,'Help','Bank transactions need review','Open the bank review queue for matching and categorization.','Help','?','review banking transactions match categorize clearing',{kind:'nav',page:'banking'},13,[{label:'Open queue',action:'open',primary:true}]);
    v47SearchIndexCache=rows; v47SearchStamp=stamp; return rows;
  }

  function v47Levenshtein(a,b){
    a=String(a||''); b=String(b||''); if(Math.abs(a.length-b.length)>2) return 99; const dp=Array(b.length+1).fill(0).map((_,i)=>i); for(let i=1;i<=a.length;i++){ let prev=dp[0]; dp[0]=i; for(let j=1;j<=b.length;j++){ const tmp=dp[j]; dp[j]=Math.min(dp[j]+1, dp[j-1]+1, prev+(a[i-1]===b[j-1]?0:1)); prev=tmp; } } return dp[b.length];
  }
  function v47FuzzyHit(token, hayTokens){
    if(!token || token.length<4) return false;
    return hayTokens.some(h=>h.length>=4 && (h.startsWith(token.slice(0,3)) || token.startsWith(h.slice(0,3))) && v47Levenshtein(token,h)<=2);
  }
  function v47Score(item, query){
    const q=v47Lower(query); if(!q) return item.priority||0;
    const qNorm=v47Norm(q), hay=item.keywords||'', norm=item.norm||'', title=v47Lower(item.title), badge=v47Lower(item.badge), idNorm=v47Norm(item.target?.id||'');
    const aliases=v47QueryAliases(q); const terms=[...new Set(v47Tokens(aliases))]; const directTerms=[...new Set(v47Tokens(q))]; const hayTerms=[...new Set(v47Tokens(hay))];
    let score=item.priority||0;
    if(idNorm && idNorm===qNorm) score+=650;
    if(idNorm && idNorm.startsWith(qNorm)) score+=380;
    if(v47Norm(item.title)===qNorm) score+=360;
    if(title.startsWith(q)) score+=180;
    if(title.includes(q)) score+=145;
    if(badge.includes(q)) score+=75;
    if(hay.includes(q)) score+=120;
    if(qNorm && norm.includes(qNorm)) score+=105;
    directTerms.forEach(t=>{ const tn=v47Norm(t); if(!tn) return; if(norm.includes(tn)) score+=34; else if(v47FuzzyHit(t, hayTerms)) score+=13; });
    terms.forEach(t=>{ const tn=v47Norm(t); if(tn && norm.includes(tn)) score+=12; });
    if(directTerms.length && directTerms.every(t=>norm.includes(v47Norm(t)) || v47FuzzyHit(t, hayTerms))) score+=55;
    if(/^(new|create|add|record|pay|receive|open|view|print|send)\b/.test(q) && item.group==='Actions') score+=55;
    return score;
  }
  function v47CandidateResults(query){
    const q=v47Lower(query), index=v47BuildSearchIndex();
    let results;
    if(!q){
      const recent=(state.settings?.v47RecentRecords||[]).map(x=>({...x, group:x.group||'Recent', priority:45, keywords:v47Lower([x.title,x.desc,x.badge,x.path].join(' ')), norm:v47Norm([x.title,x.desc,x.badge,x.path].join(' '))}));
      const recentSearches=(state.settings?.v47RecentSearches||[]).slice(0,4).map(s=>({group:'Recent',title:`Search again: ${s}`,desc:'Recent search',badge:'Recent',icon:'âŒ•',path:'Recent searches',keywords:v47Lower(s),norm:v47Norm(s),target:{kind:'search',query:s},priority:42,actions:[{label:'Search',action:'open',primary:true}]}));
      const preferred=['Create invoice','Receive payment','Profit and Loss','Accounts Receivable Aging Summary','Bank transactions need review','GST/HST Tax Summary','Dashboard'];
      const suggested=index.filter(x=>preferred.some(p=>v47Lower(x.title).includes(v47Lower(p)) || (x.keywords||'').includes(v47Lower(p)))).slice(0,9);
      results=[...recent, ...recentSearches, ...suggested];
    }else{
      results=index.map(item=>({...item,score:v47Score(item,q)})).filter(item=>item.score>36).sort((a,b)=>b.score-a.score || String(a.title).localeCompare(String(b.title))).slice(0,42);
    }
    return results;
  }
  function v47ApplyFilter(results){ if(v47SearchFilter==='All') return results; return results.filter(r=>v47GroupForFilter(r.group)===v47SearchFilter); }
  function v47ResultsFor(query){ return v47ApplyFilter(v47CandidateResults(query)).slice(0,28); }
  function v47CountsFor(query){ const c={All:v47CandidateResults(query).length}; v47CandidateResults(query).forEach(r=>{ const g=v47GroupForFilter(r.group); c[g]=(c[g]||0)+1; }); return c; }
  function v47Highlight(text, query){
    let safe=escapeHTML(v47Clean(text)); const tokens=[...new Set(v47Tokens(query).sort((a,b)=>b.length-a.length))].filter(t=>t.length>1); if(!tokens.length) return safe;
    tokens.forEach(t=>{ try{ const re=new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'); safe=safe.replace(re,'<mark class="v47-mark">$1</mark>'); }catch(e){} }); return safe;
  }
  function v47Dropdown(){
    injectV47SearchStyles(); let box=document.getElementById('globalSearchResults'); const holder=document.querySelector('.topbar .search');
    if(!box && holder){ box=document.createElement('div'); box.id='globalSearchResults'; holder.appendChild(box); }
    if(box){ box.className='v47-search-dropdown'; box.setAttribute('role','listbox'); box.setAttribute('aria-label','Global search results'); }
    return box;
  }
  function v47NoResultsHTML(q){
    return `<div class="v47-search-head"><div class="v47-search-titlebar"><strong>No matching result</strong><span>Try a record ID, name, amount, report, or command</span></div>${v47FilterChipsHTML(q)}</div><div class="v47-search-empty"><h4>No result for â€œ${escapeHTML(q)}â€</h4><div>Search checks invoices, payments, estimates, bills, expenses, customers, vendors, products, accounts, reports, and actions.</div><div class="v47-search-tips"><button class="v47-search-tip primary" data-v47-fallback="create-invoice">Create invoice</button><button class="v47-search-tip" data-v47-tip="invoice">invoice</button><button class="v47-search-tip" data-v47-tip="AR aging">AR aging</button><button class="v47-search-tip" data-v47-tip="bank review">bank review</button><button class="v47-search-tip" data-v47-fallback="transactions">Search all transactions</button></div></div>`;
  }
  function v47FilterChipsHTML(query){ const counts=v47CountsFor(query); return `<div class="v47-search-filters">${v47AllFilters().filter(f=>f==='All' || counts[f]).map(f=>`<button type="button" class="v47-filter-chip ${v47SearchFilter===f?'active':''}" data-v47-filter="${escapeHTML(f)}">${escapeHTML(f)}<span class="count">${counts[f]||0}</span></button>`).join('')}</div>`; }
  function v47RenderSearchResults(query){
    const box=v47Dropdown(); if(!box) return; const q=v47Clean(query); v47SearchResults=v47ResultsFor(q); v47SearchActiveIndex=v47SearchResults.length?0:-1;
    const input=document.getElementById('globalSearch'); if(input){ input.setAttribute('aria-expanded','true'); input.setAttribute('aria-activedescendant', v47SearchActiveIndex>=0?`v47-result-${v47SearchActiveIndex}`:''); }
    if(!v47SearchResults.length){ box.innerHTML=v47NoResultsHTML(q); box.classList.add('open'); return; }
    const grouped=[]; v47SearchResults.forEach((r,i)=>{ let g=grouped.find(x=>x.group===r.group); if(!g){ g={group:r.group,items:[]}; grouped.push(g); } g.items.push([r,i]); });
    const recentSearches=(state.settings?.v47RecentSearches||[]).slice(0,5);
    const recentHTML=(!q && recentSearches.length)?`<div class="v47-search-tips" style="justify-content:flex-start;margin-top:0">${recentSearches.map(s=>`<button class="v47-search-tip" data-v47-tip="${escapeHTML(s)}">${escapeHTML(s)}</button>`).join('')}</div>`:'';
    box.innerHTML=`<div class="v47-search-head"><div class="v47-search-titlebar"><strong>${q ? 'Search results for â€œ'+escapeHTML(q)+'â€' : 'Suggested shortcuts and recent records'}</strong><span>â†‘ â†“ Enter Â· Esc</span></div>${v47FilterChipsHTML(q)}${recentHTML}</div><div class="v47-search-scroll">${grouped.map(g=>`<div class="v47-search-group"><div class="v47-search-group-title">${escapeHTML(g.group)}</div>${g.items.map(([r,i])=>`<div id="v47-result-${i}" class="v47-search-row ${i===v47SearchActiveIndex?'active':''}" data-v47-search-result="${i}" role="option" aria-selected="${i===v47SearchActiveIndex?'true':'false'}" tabindex="-1"><span class="v47-search-icon">${escapeHTML(r.icon)}</span><span class="v47-search-main"><span class="v47-search-title">${v47Highlight(r.title,q)}</span><span class="v47-search-desc">${v47Highlight(r.desc,q)}</span><span class="v47-search-path">${escapeHTML(r.path||g.group)}</span>${(r.actions||[]).length?`<span class="v47-search-actions">${r.actions.slice(0,4).map(a=>`<button type="button" class="v47-search-action ${a.primary?'primary':''}" data-v47-search-action="${escapeHTML(a.action)}" data-v47-result-index="${i}">${escapeHTML(a.label)}</button>`).join('')}</span>`:''}</span><span class="v47-search-badge">${escapeHTML(r.badge||r.group)}</span></div>`).join('')}</div>`).join('')}</div>`;
    box.classList.add('open');
  }
  function v47CloseSearch(){ const box=document.getElementById('globalSearchResults'); if(box) box.classList.remove('open'); const input=document.getElementById('globalSearch'); if(input){ input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); } v47SearchActiveIndex=-1; }
  function v47RefreshActive(){ const box=document.getElementById('globalSearchResults'); const input=document.getElementById('globalSearch'); if(!box) return; box.querySelectorAll('[data-v47-search-result]').forEach(btn=>{ const active=Number(btn.dataset.v47SearchResult)===v47SearchActiveIndex; btn.classList.toggle('active',active); btn.setAttribute('aria-selected',active?'true':'false'); if(active){ btn.scrollIntoView({block:'nearest'}); if(input) input.setAttribute('aria-activedescendant', btn.id||''); } }); }
  function v47RememberSearch(q){ q=v47Clean(q); if(q.length<2) return; state.settings=state.settings||{}; const arr=(state.settings.v47RecentSearches||[]).filter(x=>v47Lower(x)!==v47Lower(q)); arr.unshift(q); state.settings.v47RecentSearches=arr.slice(0,8); try{ saveState(); }catch(e){} }
  function v47RememberRecord(r){ if(!r || !r.target || ['search'].includes(r.target.kind)) return; state.settings=state.settings||{}; const arr=(state.settings.v47RecentRecords||[]).filter(x=>JSON.stringify(x.target)!==JSON.stringify(r.target)); arr.unshift({group:'Recent',title:r.title,desc:r.desc,badge:r.badge,icon:r.icon,path:r.path,target:r.target,actions:r.actions}); state.settings.v47RecentRecords=arr.slice(0,8); try{ saveState(); }catch(e){} }
  function v47SetFocus(page,id){ state.settings=state.settings||{}; state.settings.v47SearchFocus={page,id,stamp:Date.now()}; try{ saveState(); }catch(e){} setTimeout(v47HighlightFocusedRecord,120); setTimeout(v47HighlightFocusedRecord,420); }
  function v47HighlightFocusedRecord(){ try{ const f=state.settings?.v47SearchFocus; if(!f || !f.id) return; const page=f.page||currentPage; const el=document.getElementById('page-'+page); if(!el) return; el.querySelectorAll('.v47-search-focus').forEach(x=>x.classList.remove('v47-search-focus')); const id=String(f.id); const candidates=[...el.querySelectorAll('tr,.card,.bank-row,.panel-row')]; const row=candidates.find(x=>(x.textContent||'').includes(id)); if(row){ row.classList.add('v47-search-focus'); row.scrollIntoView({block:'center',behavior:'smooth'}); } }catch(e){} }

  function v47Navigate(page, done){ navigate(page); if(typeof done==='function') setTimeout(done,90); }
  function v47OpenInvoicePayment(id){ setActiveInvoice?.(id); openModal('payment'); setTimeout(()=>{ const sel=document.getElementById('paymentInvoiceSelect') || document.querySelector('[name="invoiceId"]'); if(sel){ sel.value=id; sel.dispatchEvent(new Event('change',{bubbles:true})); } const inv=(state.invoices||[]).find(x=>x.id===id); const amt=document.getElementById('paymentAmount'); if(amt && inv) amt.value=Number(v47InvOpen(inv)||0).toFixed(2); },0); }
  function v47OpenBillPay(id){ openModal('payBill'); setTimeout(()=>{ const s=document.querySelector('[name="billId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } },0); }
  function v47OpenCustomerInvoice(id){ openModal('invoice'); setTimeout(()=>{ const s=document.querySelector('[name="customerId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } },0); }
  function v47OpenCustomerEstimate(id){ openModal('estimate'); setTimeout(()=>{ const s=document.querySelector('[name="customerId"]'); if(s){ s.value=id; s.dispatchEvent(new Event('change',{bubbles:true})); } },0); }

  function v47RunTarget(target, action, title){
    const t=target||{}; action=action||'view';
    if(t.kind==='search'){ const input=document.getElementById('globalSearch'); if(input){ input.value=t.query||''; v47SearchFilter='All'; v47RenderSearchResults(input.value); input.focus(); } return; }
    if(t.kind==='nav'){ v47SetFocus(t.page,t.id||''); v47Navigate(t.page); showToast(title?`${title} opened.`:'Workspace opened.'); return; }
    if(t.kind==='modal'){ openModal(t.modal); showToast(`${title||'Action'} opened.`); return; }
    if(t.kind==='report'){ state.settings.activeReportId=t.reportId; state.settings.reportMenuId=null; saveState(); v47SetFocus('reports',t.reportId); v47Navigate('reports'); showToast(`${title||'Report'} opened.`); return; }
    if(t.kind==='invoice'){
      state.settings.salesTab='invoices'; setActiveInvoice?.(t.id); saveState(); v47SetFocus('sales',t.id); v47Navigate('sales',()=>{ if(action==='edit') openModal('invoiceEdit'); else if(action==='print') openModal('invoicePrint'); else if(action==='send') openModal('invoiceSend'); else if(action==='receive') v47OpenInvoicePayment(t.id); else openModal('invoiceDetail'); }); return;
    }
    if(t.kind==='estimate'){
      state.settings.salesTab='estimates'; saveState(); v47SetFocus('sales',t.id); v47Navigate('sales',()=>{ if(action==='edit') openModal('estimateEdit:'+t.id); else if(action==='convert') handleAction('convert-estimate-invoice',t.id); else openModal('estimateView:'+t.id); }); return;
    }
    if(t.kind==='payment'){
      state.settings.salesTab='payments'; saveState(); v47SetFocus('sales',t.id); v47Navigate('sales',()=>{ if(action==='invoice'){ const p=(state.payments||[]).find(x=>x.id===t.id); if(p?.invoiceId) v47RunTarget({kind:'invoice',id:p.invoiceId},'view','Invoice'); } else if(action==='deposit') openModal('deposit'); else openModal('v47PaymentDetail:'+t.id); }); return;
    }
    if(t.kind==='bill'){
      v47SetFocus('expenses',t.id); v47Navigate('expenses',()=>{ if(action==='pay') v47OpenBillPay(t.id); else openModal('v47BillDetail:'+t.id); }); return;
    }
    if(t.kind==='expense'){ v47SetFocus('expenses',t.id); v47Navigate('expenses',()=>openModal('v47ExpenseDetail:'+t.id)); return; }
    if(t.kind==='deposit'){ v47SetFocus('banking',t.id); v47Navigate('banking',()=>openModal('v47DepositDetail:'+t.id)); return; }
    if(t.kind==='banktx'){ v47SetFocus('banking',t.id); v47Navigate('banking',()=>{ if(action==='review') handleAction('review-banktx',t.id); else openModal('bankTxDetail:'+t.id); }); return; }
    if(t.kind==='customer'){ v47SetFocus('customers',t.id); v47Navigate('customers',()=>{ if(action==='invoice') v47OpenCustomerInvoice(t.id); else if(action==='estimate') v47OpenCustomerEstimate(t.id); else openModal('v47CustomerDetail:'+t.id); }); return; }
    if(t.kind==='vendor'){ v47SetFocus('vendors',t.id); v47Navigate('vendors',()=>{ if(action==='bill') openModal('bill'); else openModal('v47VendorDetail:'+t.id); }); return; }
    if(t.kind==='product'){ v47SetFocus('inventory',t.id); v47Navigate('inventory',()=>openModal('v47ProductDetail:'+t.id)); return; }
    if(t.kind==='account'){ v47SetFocus('accounting',t.id); v47Navigate('accounting',()=>openModal('v47AccountDetail:'+t.id)); return; }
    if(t.kind==='help'){ v47Navigate('dashboard'); showToast('Tip: search supports IDs, names, amounts, dates, reports, and commands.'); return; }
  }
  function v47OpenResult(index, action){ const r=v47SearchResults[index]; if(!r) return; const input=document.getElementById('globalSearch'); const q=input?.value||''; v47RememberSearch(q); v47RememberRecord(r); if(input) input.value=''; v47CloseSearch(); try{ document.getElementById('createMenu')?.classList.remove('open'); }catch(e){} v47RunTarget(r.target, action||'view', r.title); }

  function setupGlobalSmartSearchV47(){
    const input=document.getElementById('globalSearch'); if(!input) return; injectV47SearchStyles(); v47Dropdown();
    if(input.dataset.v47Bound==='true') return; input.dataset.v47Bound='true'; input.dataset.v33Bound='true';
    input.setAttribute('autocomplete','off'); input.setAttribute('role','combobox'); input.setAttribute('aria-haspopup','listbox'); input.setAttribute('aria-controls','globalSearchResults'); input.setAttribute('aria-expanded','false');
    input.addEventListener('input', e=>{ e.stopImmediatePropagation(); v47RenderSearchResults(input.value); }, true);
    input.addEventListener('focus', ()=>v47RenderSearchResults(input.value));
    input.addEventListener('keydown', e=>{ const open=document.getElementById('globalSearchResults')?.classList.contains('open'); if(e.key==='ArrowDown'){ e.preventDefault(); e.stopImmediatePropagation(); if(!open) v47RenderSearchResults(input.value); if(v47SearchResults.length){ v47SearchActiveIndex=(v47SearchActiveIndex+1)%v47SearchResults.length; v47RefreshActive(); } } else if(e.key==='ArrowUp'){ e.preventDefault(); e.stopImmediatePropagation(); if(v47SearchResults.length){ v47SearchActiveIndex=(v47SearchActiveIndex-1+v47SearchResults.length)%v47SearchResults.length; v47RefreshActive(); } } else if(e.key==='Enter'){ if(open && v47SearchActiveIndex>=0){ e.preventDefault(); e.stopImmediatePropagation(); v47OpenResult(v47SearchActiveIndex); } } else if(e.key==='Escape'){ v47CloseSearch(); input.blur(); } }, true);
    if(document.body.dataset.v47SearchDocBound!=='true'){
      document.body.dataset.v47SearchDocBound='true';
      document.addEventListener('mousedown', e=>{ const actionBtn=e.target.closest('[data-v47-search-action]'); if(actionBtn){ e.preventDefault(); e.stopImmediatePropagation(); v47OpenResult(Number(actionBtn.dataset.v47ResultIndex), actionBtn.dataset.v47SearchAction); return; } const filter=e.target.closest('[data-v47-filter]'); if(filter){ e.preventDefault(); e.stopImmediatePropagation(); v47SearchFilter=filter.dataset.v47Filter||'All'; v47RenderSearchResults(document.getElementById('globalSearch')?.value||''); return; } const tip=e.target.closest('[data-v47-tip]'); if(tip){ e.preventDefault(); e.stopImmediatePropagation(); const inp=document.getElementById('globalSearch'); if(inp){ inp.value=tip.dataset.v47Tip||''; v47SearchFilter='All'; v47RenderSearchResults(inp.value); inp.focus(); } return; } const fallback=e.target.closest('[data-v47-fallback]'); if(fallback){ e.preventDefault(); e.stopImmediatePropagation(); const f=fallback.dataset.v47Fallback; if(f==='create-invoice') v47RunTarget({kind:'modal',modal:'invoice'},'open','Create invoice'); else if(f==='transactions') v47RunTarget({kind:'nav',page:'transactions'},'open','Transactions'); v47CloseSearch(); return; } const row=e.target.closest('[data-v47-search-result]'); if(row){ e.preventDefault(); e.stopImmediatePropagation(); v47OpenResult(Number(row.dataset.v47SearchResult)); return; } if(!e.target.closest('.topbar .search')) v47CloseSearch(); }, true);
      document.addEventListener('click', e=>{ const btn=e.target.closest('[data-v47-modal-action]'); if(!btn) return; const action=btn.dataset.v47ModalAction, id=btn.dataset.id; if(action==='customer-invoice') v47OpenCustomerInvoice(id); if(action==='customer-estimate') v47OpenCustomerEstimate(id); if(action==='vendor-bill') openModal('bill'); if(action==='bill-pay') v47OpenBillPay(id); if(action==='payment-invoice'){ const p=(state.payments||[]).find(x=>x.id===id); if(p?.invoiceId) v47RunTarget({kind:'invoice',id:p.invoiceId},'view','Invoice'); } }, true);
    }
  }
  setupGlobalSmartSearchV33 = setupGlobalSmartSearchV47;
  try{ window.closeSmartSearch = v47CloseSearch; }catch(e){}

  function v47Line(label,value){ return `<div class="report-line"><span>${escapeHTML(label)}</span><strong>${escapeHTML(v47Clean(value))}</strong></div>`; }
  function v47DetailMissing(type,id){ return `<div class="empty">${escapeHTML(type)} ${escapeHTML(id||'')} was not found. It may have been deleted or renamed.</div>`; }
  function v47PaymentDetail(id){ const p=(state.payments||[]).find(x=>x.id===id); if(!p) return v47DetailMissing('Payment',id); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>Payment</h3>${v47Line('Payment ID',p.id)}${v47Line('Customer',v47CustomerName(p.customerId))}${v47Line('Invoice',p.invoiceId||'â€”')}${v47Line('Date',p.date||'')}${v47Line('Amount',v47Money(p.amount))}</div><div class="v47-detail-card"><h3>Deposit status</h3>${v47Line('Account',v47AccountLabel(p.accountId||p.depositedToAccountId||''))}${v47Line('Deposit ID',p.depositId||'Undeposited')}${v47Line('Deposited date',p.depositedDate||'â€”')}<p class="muted small">${escapeHTML(p.memo||'No memo')}</p></div></div>`; }
  function v47BillDetail(id){ const b=(state.bills||[]).find(x=>x.id===id); if(!b) return v47DetailMissing('Bill',id); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>Bill</h3>${v47Line('Bill ID',b.id)}${v47Line('Vendor',v47VendorName(b.vendorId))}${v47Line('Bill date',b.date||'â€”')}${v47Line('Due date',b.dueDate||'â€”')}${v47Line('Status',b.status||'Bill')}</div><div class="v47-detail-card"><h3>Amounts</h3>${v47Line('Subtotal',v47Money(b.amount||b.subtotal||0))}${v47Line('Tax',v47Money(b.tax||0))}${v47Line('Total',v47Money(v47BillTotal(b)))}${v47Line('Open',v47Money(v47BillOpen(b)))}</div></div>`; }
  function v47ExpenseDetail(id){ const x=(state.expenses||[]).find(e=>e.id===id); if(!x) return v47DetailMissing('Expense',id); const total=v47Num(x.total ?? x.amount)+v47Num(x.tax); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>Expense</h3>${v47Line('Expense ID',x.id)}${v47Line('Vendor',v47VendorName(x.vendorId))}${v47Line('Date',x.date||'')}${v47Line('Payment method',x.paymentMethod||'â€”')}${v47Line('Total',v47Money(total))}</div><div class="v47-detail-card"><h3>Posting context</h3>${v47Line('Expense account',v47AccountLabel(x.expenseAccountId||x.account||''))}${v47Line('Tax',v47Money(x.tax||0))}<p class="muted small">${escapeHTML(x.memo||'No memo')}</p></div></div>`; }
  function v47DepositDetail(id){ const d=(state.deposits||[]).find(x=>x.id===id); if(!d) return v47DetailMissing('Deposit',id); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>Deposit</h3>${v47Line('Deposit ID',d.id)}${v47Line('Date',d.date||'')}${v47Line('Amount',v47Money(d.amount))}${v47Line('Bank account',v47AccountLabel(d.accountId||''))}</div><div class="v47-detail-card"><h3>Linked payments</h3>${v47Line('Payment count',(d.paymentIds||[]).length)}${v47Line('Linked payment total',v47Money(d.linkedPaymentTotal||0))}<p class="muted small">${escapeHTML(d.memo||'No memo')}</p></div></div>`; }
  function v47CustomerDetail(id){ const c=(state.customers||[]).find(x=>x.id===id); if(!c) return v47DetailMissing('Customer',id); const invoices=(state.invoices||[]).filter(i=>i.customerId===id); const open=(typeof customerOpenBalance==='function'?customerOpenBalance(id):invoices.reduce((s,i)=>s+v47InvOpen(i),0)); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(c.name||'Customer')}</h3>${v47Line('Company',c.company||'â€”')}${v47Line('Email',c.email||'â€”')}${v47Line('Phone',c.phone||'â€”')}${v47Line('Type',c.type||'â€”')}</div><div class="v47-detail-card"><h3>Receivables</h3>${v47Line('Open balance',v47Money(open))}${v47Line('Invoice count',invoices.length)}${v47Line('Estimates',(state.estimates||[]).filter(e=>e.customerId===id).length)}</div></div><div class="card table-card v47-detail-table">${table(['Invoice','Date','Status','Total','Open'], invoices.slice(0,8).map(i=>[`<strong>${escapeHTML(i.id)}</strong>`,i.date||'',i.status||'',v47Money(v47InvTotal(i)),v47Money(v47InvOpen(i))]))}</div>`; }
  function v47VendorDetail(id){ const v=(state.vendors||[]).find(x=>x.id===id); if(!v) return v47DetailMissing('Vendor',id); const bills=(state.bills||[]).filter(b=>b.vendorId===id), open=bills.reduce((s,b)=>s+v47BillOpen(b),0); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(v.name||'Vendor')}</h3>${v47Line('Category',v.category||'â€”')}${v47Line('Email',v.email||'â€”')}${v47Line('Phone',v.phone||'â€”')}</div><div class="v47-detail-card"><h3>Payables</h3>${v47Line('Open bills',v47Money(open))}${v47Line('Bill count',bills.length)}</div></div><div class="card table-card v47-detail-table">${table(['Bill','Due','Status','Total','Open'], bills.slice(0,8).map(b=>[`<strong>${escapeHTML(b.id)}</strong>`,b.dueDate||'',b.status||'',v47Money(v47BillTotal(b)),v47Money(v47BillOpen(b))]))}</div>`; }
  function v47ProductDetail(id){ const p=(state.products||[]).find(x=>x.id===id); if(!p) return v47DetailMissing('Product / Service',id); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(p.name||'Item')}</h3>${v47Line('Type',p.type||'Item')}${v47Line('SKU',p.sku||p.id||'â€”')}${v47Line('Price',v47Money(p.price||0))}</div><div class="v47-detail-card"><h3>Accounting</h3>${v47Line('Income account',v47AccountLabel(p.incomeAccountId||'4000'))}${v47Line('Expense account',v47AccountLabel(p.expenseAccountId||''))}${v47Line('Inventory account',v47AccountLabel(p.assetAccountId||''))}</div></div>`; }
  function v47AccountDetail(id){ const a=(state.chartOfAccounts||[]).find(x=>x.id===id||x.code===id); if(!a) return v47DetailMissing('Account',id); const bal=(typeof normalBalance==='function'?normalBalance(a.id):0); return `<div class="v47-detail-grid"><div class="v47-detail-card"><h3>${escapeHTML(a.code+' Â· '+a.name)}</h3>${v47Line('Type',a.type||'')}${v47Line('Normal balance',a.normal||'')}${v47Line('Current balance',v47Money(bal))}</div><div class="v47-detail-card"><h3>Details</h3><p class="muted">${escapeHTML(a.detail||'No details entered.')}</p></div></div>`; }
  const v47ModalBodyBase = modalBodyContent;
  modalBodyContent = function(type){ const s=String(type||''); if(s.startsWith('v47PaymentDetail:')) return v47PaymentDetail(s.split(':')[1]); if(s.startsWith('v47BillDetail:')) return v47BillDetail(s.split(':')[1]); if(s.startsWith('v47ExpenseDetail:')) return v47ExpenseDetail(s.split(':')[1]); if(s.startsWith('v47DepositDetail:')) return v47DepositDetail(s.split(':')[1]); if(s.startsWith('v47CustomerDetail:')) return v47CustomerDetail(s.split(':')[1]); if(s.startsWith('v47VendorDetail:')) return v47VendorDetail(s.split(':')[1]); if(s.startsWith('v47ProductDetail:')) return v47ProductDetail(s.split(':')[1]); if(s.startsWith('v47AccountDetail:')) return v47AccountDetail(s.split(':')[1]); return v47ModalBodyBase(type); };
  const v47OpenModalBase = openModal;
  openModal = function(type){ v47OpenModalBase(type); const s=String(type||''); if(!s.startsWith('v47')) return; const id=s.split(':')[1]||''; const titleMap={v47PaymentDetail:'Payment detail',v47BillDetail:'Bill detail',v47ExpenseDetail:'Expense detail',v47DepositDetail:'Deposit detail',v47CustomerDetail:'Customer detail',v47VendorDetail:'Vendor detail',v47ProductDetail:'Product / service detail',v47AccountDetail:'Account detail'}; const key=s.split(':')[0]; document.getElementById('modalTitle').textContent=titleMap[key]||'Record detail'; document.getElementById('modalSubtitle').textContent='Opened directly from global search.'; const footer=document.getElementById('modalFooter'); if(footer){ let extras=''; if(key==='v47CustomerDetail') extras=`<button type="button" class="btn" data-v47-modal-action="customer-estimate" data-id="${escapeHTML(id)}">Create estimate</button><button type="button" class="btn primary" data-v47-modal-action="customer-invoice" data-id="${escapeHTML(id)}">Create invoice</button>`; if(key==='v47VendorDetail') extras=`<button type="button" class="btn primary" data-v47-modal-action="vendor-bill" data-id="${escapeHTML(id)}">Create bill</button>`; if(key==='v47BillDetail' && v47BillOpen((state.bills||[]).find(b=>b.id===id)||{})>0.01) extras=`<button type="button" class="btn primary" data-v47-modal-action="bill-pay" data-id="${escapeHTML(id)}">Pay bill</button>`; if(key==='v47PaymentDetail') extras=`<button type="button" class="btn" data-v47-modal-action="payment-invoice" data-id="${escapeHTML(id)}">Open invoice</button>`; footer.innerHTML=`<button type="button" class="btn" id="cancelModal">Close</button>${extras}`; document.getElementById('cancelModal')?.addEventListener('click', closeModal); } };
  const v47SaveStateBase = saveState;
  saveState = function(){ v47InvalidateSearch(); return v47SaveStateBase.apply(this, arguments); };
  const v47RenderAllBase = renderAll;
  renderAll = function(){ v47RenderAllBase.apply(this, arguments); setTimeout(v47HighlightFocusedRecord,80); };

  // ---------- V48: Explicit Customer / Vendor / Invoice Number Search Coverage ----------
  // Makes the global search visibly and functionally support customer names,
  // vendor names, invoice numbers, bill numbers, SKUs, account codes, amounts,
  // and scoped searches such as "customer: County", "vendor: Office", or "invoice: INV-1001".
  function v48SearchAliasText(item){
    const target=item?.target||{};
    const kind=String(target.kind||'');
    const id=String(target.id||'');
    const title=String(item?.title||'');
    const badge=String(item?.badge||'');
    const group=String(item?.group||'');
    const digits=id.replace(/\D+/g,'');
    const compact=v47Norm([id,title,badge].join(' '));
    const aliases=[];
    if(kind==='invoice') aliases.push('invoice invoice number invoice no invoice # inv inv number inv no inv# customer invoice sales invoice accounts receivable ar open invoice unpaid invoice', id, digits, compact);
    if(kind==='estimate') aliases.push('estimate estimate number estimate no estimate # quote quotation proposal sales quote', id, digits, compact);
    if(kind==='payment') aliases.push('payment payment number payment id receipt received customer payment deposit undeposited', id, digits, compact);
    if(kind==='bill') aliases.push('bill bill number vendor invoice supplier invoice accounts payable ap pay bill unpaid bill', id, digits, compact);
    if(kind==='expense') aliases.push('expense receipt purchase paid expense vendor expense card cash cheque check', id, digits, compact);
    if(kind==='deposit') aliases.push('deposit bank deposit money in deposit number bank account', id, digits, compact);
    if(kind==='banktx') aliases.push('bank transaction bank feed bank review cleared uncleared match categorize reconciliation', id, digits, compact);
    if(kind==='customer') aliases.push('customer client buyer bill to sold to customer name customer id receivable ar invoice estimate contact', id, digits, compact);
    if(kind==='vendor') aliases.push('vendor supplier payee merchant vendor name vendor id payable ap bill expense contact', id, digits, compact);
    if(kind==='product') aliases.push('product service item sku item code inventory service item product code', id, digits, compact);
    if(kind==='account') aliases.push('account chart of accounts coa gl general ledger account code debit credit balance', id, digits, compact);
    if(group==='Reports') aliases.push('report statement summary aging detail financial report management report');
    if(group==='Actions') aliases.push('command action shortcut create add new open record');
    return aliases.filter(Boolean).join(' ');
  }

  const v48BuildSearchIndexBase = v47BuildSearchIndex;
  v47BuildSearchIndex = function(){
    const rows=v48BuildSearchIndexBase();
    rows.forEach(r=>{
      if(r._v48SearchAliasesApplied) return;
      const extra=v48SearchAliasText(r);
      if(extra){
        r.keywords=v47Lower([r.keywords,extra].join(' '));
        r.norm=v47Norm([r.norm,r.keywords,extra].join(' '));
      }
      r._v48SearchAliasesApplied=true;
    });
    return rows;
  };

  const v48ScopeMap={
    customer:{label:'Customers',match:r=>r.target?.kind==='customer'||r.group==='Customers'},
    cust:{label:'Customers',match:r=>r.target?.kind==='customer'||r.group==='Customers'},
    client:{label:'Customers',match:r=>r.target?.kind==='customer'||r.group==='Customers'},
    vendor:{label:'Vendors',match:r=>r.target?.kind==='vendor'||r.group==='Vendors'},
    supplier:{label:'Vendors',match:r=>r.target?.kind==='vendor'||r.group==='Vendors'},
    payee:{label:'Vendors',match:r=>r.target?.kind==='vendor'||r.group==='Vendors'},
    invoice:{label:'Invoices',match:r=>r.target?.kind==='invoice'||r.badge==='Invoice'},
    inv:{label:'Invoices',match:r=>r.target?.kind==='invoice'||r.badge==='Invoice'},
    bill:{label:'Bills',match:r=>r.target?.kind==='bill'||r.badge==='Bill'},
    estimate:{label:'Estimates',match:r=>r.target?.kind==='estimate'||r.badge==='Estimate'},
    quote:{label:'Estimates',match:r=>r.target?.kind==='estimate'||r.badge==='Estimate'},
    payment:{label:'Payments',match:r=>r.target?.kind==='payment'||r.badge==='Payment'},
    receipt:{label:'Payments',match:r=>r.target?.kind==='payment'||r.badge==='Payment'},
    product:{label:'Products',match:r=>r.target?.kind==='product'||r.group==='Products & Services'},
    service:{label:'Products',match:r=>r.target?.kind==='product'||r.group==='Products & Services'},
    sku:{label:'Products',match:r=>r.target?.kind==='product'||r.group==='Products & Services'},
    item:{label:'Products',match:r=>r.target?.kind==='product'||r.group==='Products & Services'},
    account:{label:'Accounts',match:r=>r.target?.kind==='account'||r.group==='Accounting'},
    coa:{label:'Accounts',match:r=>r.target?.kind==='account'||r.group==='Accounting'},
    report:{label:'Reports',match:r=>r.group==='Reports'},
    action:{label:'Actions',match:r=>r.group==='Actions'},
    command:{label:'Actions',match:r=>r.group==='Actions'}
  };
  function v48ScopeFromQuery(query){
    const raw=v47Clean(query);
    if(!raw) return null;
    const m=raw.match(/^\s*(customer|cust|client|vendor|supplier|payee|invoice|inv|bill|estimate|quote|payment|receipt|product|service|sku|item|account|coa|report|action|command)\s*(?:number|no\.?|#|id)?\s*[:#-]?\s+(.+)$/i)
      || raw.match(/^\s*(customer|cust|client|vendor|supplier|payee|invoice|inv|bill|estimate|quote|payment|receipt|product|service|sku|item|account|coa|report|action|command)\s*[:#]\s*(.+)$/i);
    if(!m) return null;
    const key=m[1].toLowerCase();
    const q=v47Clean(m[2]);
    if(!q) return null;
    const spec=v48ScopeMap[key];
    if(!spec) return null;
    return {key,label:spec.label,query:q,match:spec.match};
  }

  const v48ScoreBase = v47Score;
  v47Score = function(item, query){
    const scope=v48ScopeFromQuery(query);
    if(!scope) return v48ScoreBase(item,query);
    const base=v48ScoreBase(item,scope.query);
    const scoped=scope.match(item);
    return base + (scoped ? 260 : -260);
  };

  const v48CandidateBase = v47CandidateResults;
  v47CandidateResults = function(query){
    const scope=v48ScopeFromQuery(query);
    let results=v48CandidateBase(query);
    if(scope){
      results=results.filter(scope.match).map(r=>({...r,desc:`${scope.label} match Â· ${r.desc}`}));
    }
    return results;
  };

  const v48NoResultsBase = v47NoResultsHTML;
  v47NoResultsHTML = function(q){
    const base=v48NoResultsBase(q);
    const examples=`<div class="v48-search-examples"><strong>Search examples:</strong><button class="v48-example" data-v48-tip="customer: County">customer: County</button><button class="v48-example" data-v48-tip="vendor: Office">vendor: Office</button><button class="v48-example" data-v48-tip="invoice: INV-1001">invoice: INV-1001</button><button class="v48-example" data-v48-tip="bill: BILL">bill: BILL</button><button class="v48-example" data-v48-tip="sku:">sku:</button><button class="v48-example" data-v48-tip="amount 2730">amount 2730</button></div>`;
    return base.replace('</div></div>',`${examples}</div></div>`);
  };

  function v48EnhanceSearchDropdown(query){
    const box=document.getElementById('globalSearchResults');
    if(!box) return;
    const head=box.querySelector('.v47-search-head');
    if(head && !head.querySelector('.v48-search-coverage')){
      const coverage=document.createElement('div');
      coverage.className='v48-search-coverage';
      coverage.innerHTML=`<span>Search by:</span><button data-v48-tip="customer:">Customer</button><button data-v48-tip="vendor:">Vendor</button><button data-v48-tip="invoice:">Invoice #</button><button data-v48-tip="bill:">Bill #</button><button data-v48-tip="sku:">SKU / Item</button><button data-v48-tip="report:">Report</button>`;
      const filters=head.querySelector('.v47-search-filters');
      head.insertBefore(coverage, filters || null);
    }
    const scope=v48ScopeFromQuery(query||'');
    const titlebar=box.querySelector('.v47-search-titlebar strong');
    if(titlebar && scope){ titlebar.innerHTML=`${escapeHTML(scope.label)} search for â€œ${escapeHTML(scope.query)}â€`; }
  }

  const v48RenderSearchBase = v47RenderSearchResults;
  v47RenderSearchResults = function(query){
    v48RenderSearchBase(query);
    v48EnhanceSearchDropdown(query);
  };

  function v48FocusSearchWith(text){
    const input=document.getElementById('globalSearch');
    if(!input) return;
    input.value=text||'';
    input.focus();
    if(/:\s*$/.test(input.value)) input.setSelectionRange(input.value.length,input.value.length);
    v47SearchFilter='All';
    v47RenderSearchResults(input.value);
  }

  const v48SetupSearchBase = setupGlobalSmartSearchV47;
  setupGlobalSmartSearchV47 = function(){
    v48SetupSearchBase();
    const input=document.getElementById('globalSearch');
    if(input){
      input.placeholder='Search customer, vendor, invoice #, bill #, SKU, amount, report, or action';
      input.title='Examples: customer: County, vendor: Office, invoice: INV-1001, bill: BILL-1001, sku: frame, amount 2730, report: A/R';
      if(input.dataset.v48SearchBound!=='true'){
        input.dataset.v48SearchBound='true';
        input.addEventListener('keydown', e=>{
          if((e.ctrlKey||e.metaKey) && String(e.key||'').toLowerCase()==='k'){
            e.preventDefault(); input.focus(); input.select(); v47RenderSearchResults(input.value);
          }
        });
      }
    }
    if(document.body.dataset.v48SearchDocBound!=='true'){
      document.body.dataset.v48SearchDocBound='true';
      document.addEventListener('mousedown', e=>{
        const tip=e.target.closest('[data-v48-tip]');
        if(!tip) return;
        e.preventDefault(); e.stopPropagation(); if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
        v48FocusSearchWith(tip.dataset.v48Tip||'');
      }, true);
    }
  };
  setupGlobalSmartSearchV33 = setupGlobalSmartSearchV47;

  function injectV48SearchStyles(){
    if(document.getElementById('v48-search-coverage-style')) return;
    const style=document.createElement('style');
    style.id='v48-search-coverage-style';
    style.textContent=`
      .v48-search-coverage{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;color:#667085}
      .v48-search-coverage span{font-weight:900;text-transform:uppercase;letter-spacing:.04em}
      .v48-search-coverage button,.v48-example{border:1px solid #d6e3ec;background:#fff;border-radius:999px;padding:5px 8px;font-size:12px;font-weight:900;color:#344054;cursor:pointer}
      .v48-search-coverage button:hover,.v48-example:hover{border-color:var(--green);color:var(--green);box-shadow:0 2px 8px rgba(16,24,40,.08)}
      .v48-search-examples{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-top:12px;align-items:center}
      .v48-search-examples strong{font-size:12px;color:#475467}
      body.dark-mode .v48-search-coverage,body.v8-ui.dark-mode .v48-search-coverage{color:#aebdcc}
      body.dark-mode .v48-search-coverage button,body.v8-ui.dark-mode .v48-search-coverage button,body.dark-mode .v48-example,body.v8-ui.dark-mode .v48-example{background:#101b27;border-color:#34495e;color:#e8edf3}
      body.dark-mode .v48-search-examples strong,body.v8-ui.dark-mode .v48-search-examples strong{color:#cbd5e1}
    `;
    document.head.appendChild(style);
  }
  try{ injectV48SearchStyles(); }catch(e){}




  v19RepairState();

  ensureV810State(); applyTheme(); saveState();
  setupEventListeners(); renderAll();

  // ---------- V46 Sidebar Manage Button Style Consistency Fix ----------
  function injectV46SidebarManageStyles(){
    if(document.getElementById('v46-sidebar-manage-style')) return;
    const style=document.createElement('style');
    style.id='v46-sidebar-manage-style';
    style.textContent=`
      .side-title.bookmark-title,.side-title.menu-title,body.v8-ui .side-title.bookmark-title,body.v8-ui .side-title.menu-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;}
      .side-title .link-btn,.side-title.bookmark-title .link-btn,.side-title.menu-title .link-btn,body.v8-ui .side-title .link-btn{appearance:none!important;-webkit-appearance:none!important;border:0!important;outline:0!important;background:transparent!important;color:inherit!important;font-size:12px!important;line-height:1.2!important;font-weight:800!important;font-family:inherit!important;text-transform:none!important;letter-spacing:0!important;padding:2px 4px!important;margin:0!important;border-radius:8px!important;opacity:.76!important;cursor:pointer!important;box-shadow:none!important;min-height:0!important;width:auto!important;height:auto!important;}
      .side-title .link-btn:hover,.side-title .link-btn:focus-visible,body.v8-ui .side-title .link-btn:hover,body.v8-ui .side-title .link-btn:focus-visible{background:rgba(10,143,60,.12)!important;color:var(--green)!important;opacity:1!important;text-decoration:none!important;}
      body.dark-mode .side-title .link-btn,body.v8-ui.dark-mode .side-title .link-btn{color:inherit!important;background:transparent!important;}
      body.dark-mode .side-title .link-btn:hover,body.dark-mode .side-title .link-btn:focus-visible,body.v8-ui.dark-mode .side-title .link-btn:hover,body.v8-ui.dark-mode .side-title .link-btn:focus-visible{background:rgba(99,210,151,.16)!important;color:#63d297!important;}
    `;
    document.head.appendChild(style);
  }
  try{ injectV46SidebarManageStyles(); }catch(e){}
  const v46RenderMenuBase = renderMenu;
  renderMenu = function(){
    injectV46SidebarManageStyles();
    v46RenderMenuBase();
    const bookmarkTitle = Array.from(document.querySelectorAll('.side-title')).find(el=>/^\s*bookmarks\s*$/i.test(el.textContent.replace(/Manage/i,'').trim()));
    if(bookmarkTitle) bookmarkTitle.classList.add('bookmark-title');
    const menuList=document.getElementById('menuList');
    const menuTitle=menuList?.previousElementSibling;
    if(menuTitle) menuTitle.classList.add('menu-title');
  };
  const v46RenderAllBase = renderAll;
  renderAll = function(){ injectV46SidebarManageStyles(); v46RenderAllBase(); };


