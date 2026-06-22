// SmartBooks sidebar navigation feature.
// Owns sidebar icons, sidebar rendering, bookmark rows, module pills, and app launcher tiles.

  // ---------- V30 Sidebar Icon Consistency Fix ----------
  function injectV30IconStyles(){
    if(document.getElementById('v30-icon-styles')) return;
    const style=document.createElement('style');
    style.id='v30-icon-styles';
    style.textContent=`
      body.v8-ui .dot .v30-icon,
      body.v8-ui .module-icon .v30-icon,
      body.v8-ui .tile-icon .v30-icon,
      body.v8-ui .feed-badge .v30-icon,
      .dot .v30-icon,
      .module-icon .v30-icon,
      .tile-icon .v30-icon,
      .feed-badge .v30-icon{
        width:18px;height:18px;display:block;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;
      }
      body.v8-ui .module-icon .v30-icon,
      body.v8-ui .tile-icon .v30-icon,
      .module-icon .v30-icon,
      .tile-icon .v30-icon{width:17px;height:17px;}
      body.v8-ui .v29-menu-row .module-icon .v30-icon,
      .v29-menu-row .module-icon .v30-icon{width:18px;height:18px;}
      body.v8-ui .dot{font-size:0;}
      body.v8-ui .module-icon,
      body.v8-ui .tile-icon{font-size:0;}
      body.v8-ui .nav-item .dot{background:#06457c;color:#fff;}
      body.v8-ui .nav-item.active .dot{background:var(--green,#0a8f3c);color:#fff;}
      body.v8-ui.dark-mode .nav-item .dot{background:#0b4a82;color:#fff;}
    `;
    document.head.appendChild(style);
  }

  const v30FallbackIcons = {
    home:'⌂', dashboard:'▦', getthingsdone:'✓', setup:'☑', apps:'▩', banking:'$', transactions:'⇄', accounting:'▤', sales:'↗', customers:'👥', expenses:'▾', vendors:'⌂', reports:'▥', inventory:'▣', projects:'▰', time:'◷', payroll:'ID', taxes:'%', settings:'⚙', reportsFavorite:'★'
  };
  const v30IconAliases = {'reports-favorites':'reportsFavorite'};
  const v30IconParts = {
    home:`<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M10 20v-5h4v5"/>`,
    dashboard:`<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>`,
    getthingsdone:`<circle cx="12" cy="12" r="8"/><path d="m8.5 12.4 2.2 2.2 4.8-5.1"/>`,
    setup:`<path d="M9 4h8a2 2 0 0 1 2 2v13H5V6a2 2 0 0 1 2-2h2"/><path d="M9 4a3 3 0 0 0 6 0"/><path d="m8 12 2 2 5-5"/>`,
    apps:`<rect x="4" y="4" width="5" height="5" rx="1"/><rect x="15" y="4" width="5" height="5" rx="1"/><rect x="4" y="15" width="5" height="5" rx="1"/><rect x="15" y="15" width="5" height="5" rx="1"/><path d="M12 7h.01M12 17h.01"/>`,
    banking:`<path d="M4 9h16"/><path d="M5 9 12 4l7 5"/><path d="M6 9v8M10 9v8M14 9v8M18 9v8"/><path d="M4 17h16M3 20h18"/>`,
    transactions:`<path d="M7 7h13"/><path d="m16 4 4 3-4 3"/><path d="M17 17H4"/><path d="m8 14-4 3 4 3"/>`,
    accounting:`<path d="M5 4h10a4 4 0 0 1 4 4v12H7a2 2 0 0 1-2-2V4Z"/><path d="M8 8h7M8 12h7M8 16h5"/>`,
    sales:`<path d="M6 3h10l3 3v15H6z"/><path d="M16 3v4h4"/><path d="M9 15l3-3 2 2 3-4"/><path d="M17 10h-4v4"/>`,
    customers:`<path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M17 11a2.5 2.5 0 1 0 0-5"/><path d="M15.5 14.2A4.8 4.8 0 0 1 20.5 20"/>`,
    expenses:`<path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2z"/><path d="M9 8h6M9 12h6M9 16h3"/>`,
    vendors:`<path d="M4 10h16l-1.2-5H5.2Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/><path d="M4 10c1.4 2 3.2 2 4.6 0 1.4 2 3.2 2 4.6 0 1.4 2 3.2 2 4.8 0"/>`,
    reports:`<path d="M6 3h10l3 3v15H6z"/><path d="M16 3v4h4"/><path d="M9 17v-4M12 17V9M15 17v-6"/>`,
    inventory:`<path d="M4 8 12 4l8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8"/><path d="M12 12v8"/>`,
    projects:`<path d="M3.5 7.5h6l1.8 2H20.5v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M3.5 7.5V6a2 2 0 0 1 2-2h4l1.8 2H18a2 2 0 0 1 2 2v1.5"/>`,
    time:`<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.5 2"/>`,
    payroll:`<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M7 16a3 3 0 0 1 4 0"/><path d="M14 10h3M14 14h3"/>`,
    taxes:`<path d="M7 17 17 7"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/>`,
    settings:`<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`,
    reportsFavorite:`<path d="M6 3h10l3 3v15H6z"/><path d="M16 3v4h4"/><path d="m12 10 1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z"/>`
  };
  function v30IconKey(id){ return v30IconAliases[id] || id || 'dashboard'; }
  function v30IconMarkup(id, cls='v30-icon'){
    const key=v30IconKey(id);
    const part=v30IconParts[key] || v30IconParts.dashboard;
    return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${part}</svg>`;
  }
  function v30IconFallback(id){ return v30FallbackIcons[v30IconKey(id)] || '□'; }
  function v30UpdateRegistryIcons(){
    const apply = (m)=>{ if(m && m.id) m.icon = v30IconFallback(m.id); };
    try{ if(Array.isArray(menuModules)) menuModules.forEach(apply); }catch(e){}
    try{ if(Array.isArray(masterModuleRegistry)) masterModuleRegistry.forEach(apply); }catch(e){}
  }
  function v30BookmarkIconKey(b){
    if(!b) return 'dashboard';
    if(b.id==='dashboard') return 'home';
    if(b.id==='reports-favorites') return 'reportsFavorite';
    if(b.id==='getthingsdone') return 'getthingsdone';
    return b.nav || b.id;
  }
  function v31SidebarLabel(item){
    if(window.SmartBooksNavigation) return window.SmartBooksNavigation.displayLabel(item);
    const labels = {dashboard:'Dashboards', apps:'My Apps', inventory:'Products & Services', expenses:'Expenses & Pay Bills'};
    return labels[item.id] || item.label || item.id;
  }
  function v31SidebarItems(){
    const modules=(typeof masterModuleRegistry !== 'undefined' && Array.isArray(masterModuleRegistry)) ? masterModuleRegistry : menuModules;
    if(window.SmartBooksNavigation) return window.SmartBooksNavigation.orderedItems(modules, state.settings, false);
    return (typeof v29OrderedMenuItems==='function') ? v29OrderedMenuItems(false) : menuModules.filter(m=>(state.settings.visibleModules||[]).includes(m.id));
  }
  function v31RefreshSidebarBookmarks(){
    document.querySelectorAll('.sidebar-bookmarks-hidden').forEach(el => {
      el.classList.remove('sidebar-bookmarks-hidden');
      el.style.removeProperty('display');
    });
  }

  const v30RenderMenuBase = renderMenu;
  renderMenu = function(){
    injectV30IconStyles(); v30UpdateRegistryIcons();
    try{ injectV29MenuManagementStyles(); ensureV29MenuState(); }catch(e){}
    const list=document.getElementById('menuList');
    if(!list){ return v30RenderMenuBase(); }
    const items = v31SidebarItems();
    list.innerHTML = items.map(m=>`<button class="nav-item ${currentPage===m.id?'active':''}" data-nav="${escapeHTML(m.id)}"><span class="dot">${v30IconMarkup(m.id)}</span><span class="nav-label">${escapeHTML(v31SidebarLabel(m))}</span><span class="nav-chevron">›</span></button>`).join('');
    try{ renderMenuTitleV29(); }catch(e){}
    try{ if(typeof renderBookmarksV816==='function') renderBookmarksV816(); else if(typeof renderBookmarks==='function') renderBookmarks(); }catch(e){}
    v31RefreshSidebarBookmarks();
  };

  renderModulePills = function(){
    injectV30IconStyles(); v30UpdateRegistryIcons();
    try{ injectDashboardShortcutStyles(); normalizeDashboardShortcuts(); }catch(e){}
    const mods = (typeof shortcutModuleObjects==='function') ? shortcutModuleObjects() : (typeof visibleModulesForPillsV8==='function' ? visibleModulesForPillsV8() : menuModules);
    const el=document.getElementById('modulePills');
    if(el){
      el.innerHTML = `<div class="shortcut-shell"><button class="shortcut-arrow" type="button" data-action="shortcut-scroll" data-dir="-1" aria-label="Previous shortcuts">‹</button><div class="shortcut-viewport"><div class="shortcut-track" id="shortcutTrack">${mods.map(m=>`<button class="module-pill ${currentPage===m.id?'active':''}" data-nav="${escapeHTML(m.id)}"><span class="module-icon">${v30IconMarkup(m.id)}</span>${escapeHTML(m.label)}</button>`).join('')}</div></div><button class="shortcut-arrow" type="button" data-action="shortcut-scroll" data-dir="1" aria-label="More shortcuts">›</button><button class="shortcut-customize" type="button" data-modal="customizeShortcuts" title="Customize shortcuts" aria-label="Customize shortcuts">⚙</button></div>`;
      setTimeout(()=>{ const track=document.getElementById('shortcutTrack'); if(track){ track.addEventListener('scroll', updateShortcutArrows, {passive:true}); updateShortcutArrows(); } },0);
    }
    const hr=new Date().getHours(); const greeting=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
    const g=document.getElementById('greeting'); if(g) g.textContent=`${greeting}, Quak!`;
  };

  if(typeof renderBookmarksV816==='function'){
    renderBookmarksV816 = function(){
      injectV30IconStyles();
      try{ injectV816CustomizationStyles(); }catch(e){}
      if(typeof normalizeBookmarks!=='function' || typeof findBookmarksTitle!=='function') return;
      normalizeBookmarks();
      const title=findBookmarksTitle(); if(!title) return;
      title.classList.add('bookmark-title');
      title.innerHTML='<span>Bookmarks</span><button class="link-btn" type="button" data-modal="manageBookmarks">Manage</button>';
      const group=title.nextElementSibling; if(!group || !group.classList.contains('nav-group')) return;
      const ids=normalizeBookmarks();
      group.innerHTML = ids.map(id=>bookmarkById(id)).filter(Boolean).map(b=>`<button class="nav-item bookmark-row ${currentPage===b.nav?'active':''}" data-nav="${escapeHTML(b.nav)}" role="button"><span class="dot">${v30IconMarkup(v30BookmarkIconKey(b))}</span>${escapeHTML(b.label)}</button>`).join('') || `<div class="empty small">No bookmarks selected.</div>`;
      v31RefreshSidebarBookmarks();
    };
    renderBookmarks = renderBookmarksV816;
  }

  if(typeof bookmarkManageBody==='function'){
    bookmarkManageBody = function(){
      injectV30IconStyles();
      const saved=normalizeBookmarks();
      const catalog=bookmarkCatalog();
      const ordered=[...saved.map(id=>catalog.find(b=>b.id===id)).filter(Boolean), ...catalog.filter(b=>!saved.includes(b.id))];
      return `<p class="muted">Choose the shortcuts that appear under Bookmarks. Bookmarks are separate from the main menu.</p><div class="bookmark-config-list">${ordered.map(b=>`<div class="bookmark-config-row" data-bookmark-id="${escapeHTML(b.id)}"><input type="checkbox" name="bookmark" value="${escapeHTML(b.id)}" ${saved.includes(b.id)?'checked':''}><span class="module-icon" style="width:32px;height:32px">${v30IconMarkup(v30BookmarkIconKey(b))}</span><div><strong>${escapeHTML(b.label)}</strong><small>${escapeHTML(b.desc)}</small></div><div class="bookmark-move"><button type="button" data-action="bookmark-move" data-dir="up">↑</button><button type="button" data-action="bookmark-move" data-dir="down">↓</button></div></div>`).join('')}</div><div class="tax-form-note">If a module is hidden from the main menu, its bookmark is hidden until the module is restored.</div>`;
    };
  }

  if(typeof renderApps==='function'){
    const v30RenderAppsBase = renderApps;
    renderApps = function(){
      injectV30IconStyles(); v30UpdateRegistryIcons();
      try{ ensureV8State(); }catch(e){}
      const el=document.getElementById('page-apps'); if(!el) return v30RenderAppsBase();
      const menuDescriptions = new Map((typeof v29MenuRegistry==='function' ? v29MenuRegistry() : []).map(item => [item.id, item.desc]));
      const apps=masterModuleRegistry.filter(m=>isModuleVisible(m.id));
      el.innerHTML = header('My Apps', 'Open the modules enabled for this company. Hidden modules can be restored from Settings.', `<button class="btn" data-modal="customize">Customize app menus</button>`) + `<div class="app-grid">${apps.map(m=>`<div class="app-tile"><span class="tile-icon">${v30IconMarkup(m.id)}</span><h3>${escapeHTML(v31SidebarLabel(m))}</h3><p class="muted">${escapeHTML(menuDescriptions.get(m.id)||'Module workspace.')}</p><button class="btn" data-nav="${escapeHTML(m.id)}">Open</button></div>`).join('')}</div>`;
    };
  }

  const v30RenderAllBase = renderAll;
  renderAll = function(){ injectV30IconStyles(); v30UpdateRegistryIcons(); v30RenderAllBase(); try{ renderMenu(); renderBookmarksV816(); }catch(e){} };

  window.SmartBooksSidebarNavigation = Object.assign(window.SmartBooksSidebarNavigation || {}, {
    injectIconStyles: injectV30IconStyles,
    iconMarkup: v30IconMarkup,
    iconKey: v30IconKey,
    bookmarkIconKey: v30BookmarkIconKey,
    sidebarItems: v31SidebarItems,
    sidebarLabel: v31SidebarLabel,
    refreshBookmarks: v31RefreshSidebarBookmarks
  });
