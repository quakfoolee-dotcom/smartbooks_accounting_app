// SmartBooks menu customization feature.
// Owns Manage menu modal behavior, sidebar visibility state, and bookmark handoff.

function v29MenuModules(){
  return (typeof masterModuleRegistry !== 'undefined' && Array.isArray(masterModuleRegistry)) ? masterModuleRegistry : menuModules;
}

function injectV29MenuManagementStyles(){
  if(document.getElementById('v29-menu-management-styles')) return;
  const style=document.createElement('style');
  style.id='v29-menu-management-styles';
  style.textContent=`
    body.v8-ui .side-title.menu-title{display:flex;align-items:center;justify-content:space-between;gap:8px;}
    body.v8-ui .side-title.menu-title .link-btn,
    .side-title.menu-title .link-btn{border:0;background:transparent;color:inherit;font-size:12px;font-weight:800;cursor:pointer;padding:2px 4px;border-radius:8px;opacity:.76;}
    body.v8-ui .side-title.menu-title .link-btn:hover,
    .side-title.menu-title .link-btn:hover{background:rgba(10,143,60,.12);opacity:1;}
    .v29-menu-note{border:1px solid #cfe6f7;background:#f4faff;color:#18476b;border-radius:14px;padding:11px 12px;font-size:12px;line-height:1.45;margin:10px 0 12px;}
    .v29-menu-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:8px 0 12px;}
    .v29-menu-list{display:grid;gap:10px;margin-top:10px;}
    .v29-menu-row{display:grid;grid-template-columns:28px 34px minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line,#dfe7ee);border-radius:14px;padding:10px 12px;background:var(--card,#fff);}
    .v29-menu-row.is-hidden{opacity:.58;background:#fbfcfd;}
    .v29-menu-row.is-locked{border-style:solid;background:linear-gradient(180deg,#fff,#fbfcfd);}
    .v29-menu-row strong{display:block;line-height:1.2;}
    .v29-menu-row small{display:block;color:var(--muted,#667085);margin-top:2px;line-height:1.25;}
    .v29-menu-actions{display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap;}
    .v29-menu-actions button{min-width:34px;height:34px;border-radius:10px;border:1px solid var(--line,#dfe7ee);background:#fff;cursor:pointer;font-weight:900;color:#344054;}
    .v29-menu-actions button:hover{border-color:var(--green,#0a8f3c);color:var(--green,#0a8f3c);background:#eef6f6;}
    .v29-menu-actions button[disabled]{opacity:.38;cursor:not-allowed;}
    .v29-menu-actions button.is-bookmarked{border-color:var(--green,#0a8f3c);color:var(--green,#0a8f3c);background:#eef8f2;}
    .v29-chip{display:inline-flex;align-items:center;border:1px solid #d6e3ec;border-radius:999px;background:#fff;padding:4px 8px;font-size:11px;font-weight:900;color:#475467;}
    .v29-add-bookmarks{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    body.v8-ui.dark-mode .v29-menu-note{background:#0f2536;border-color:#264b67;color:#c8e6ff;}
    body.v8-ui.dark-mode .v29-menu-row{background:#14202d;border-color:#2a3c4f;color:#e8edf3;}
    body.v8-ui.dark-mode .v29-menu-row.is-hidden{background:#101b27;}
    body.v8-ui.dark-mode .v29-menu-actions button{background:#101b27;border-color:#34495e;color:#e8edf3;}
    body.v8-ui.dark-mode .v29-chip{background:#101b27;border-color:#34495e;color:#cbd5e1;}
    @media(max-width:720px){.v29-menu-row{grid-template-columns:28px 32px minmax(0,1fr);}.v29-menu-actions{grid-column:3/4;justify-content:flex-start;}.v29-menu-toolbar{display:block}.v29-add-bookmarks{margin-top:8px;}}
  `;
  document.head.appendChild(style);
}

function v29DefaultMenuOrder(){
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.defaultMenuOrder(v29MenuModules());
  const modules=v29MenuModules();
  const moduleIds=modules.map(m=>m.id);
  const preferred=['getthingsdone','dashboard','reports','apps','settings','setup','banking','transactions','accounting','sales','customers','expenses','vendors','inventory','projects','time','payroll','taxes'];
  return [...preferred.filter(id=>id==='getthingsdone' || moduleIds.includes(id)), ...moduleIds.filter(id=>!preferred.includes(id) && id!=='getthingsdone')];
}

function v29MenuRegistry(){
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.menuRegistry(v29MenuModules());
  return [{id:'getthingsdone', label:'Get Things Done', icon:'✓', locked:false, special:true, desc:'Guided workflow hub.'}, ...v29MenuModules().map(m=>({
    id:m.id,
    label:m.label,
    icon:m.icon,
    locked:!!m.locked || m.id==='dashboard' || m.id==='settings',
    module:true,
    desc:'Module workspace.'
  }))];
}

function v29NormalizeMenuOrder(order){
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.normalizeOrder(order, v29MenuModules());
  const defaults=v29DefaultMenuOrder();
  const allowed=new Set(defaults);
  const seen=[];
  (Array.isArray(order)?order:[]).forEach(id=>{ if(allowed.has(id) && !seen.includes(id)) seen.push(id); });
  defaults.forEach(id=>{ if(!seen.includes(id)) seen.push(id); });
  return seen;
}

function v29NormalizeVisibleMenuItems(items){
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.normalizeVisible(items, v29MenuModules());
  const allowed=new Set(v29DefaultMenuOrder());
  const seen=[];
  (Array.isArray(items)?items:[]).forEach(id=>{ if(allowed.has(id) && !seen.includes(id)) seen.push(id); });
  ['dashboard','settings'].forEach(id=>{ if(allowed.has(id) && !seen.includes(id)) seen.push(id); });
  return seen;
}

function ensureV29MenuState(){
  try{ if(typeof ensureV74State==='function') ensureV74State(); }catch(e){}
  try{ if(typeof ensureV10GetThingsDonePage==='function') ensureV10GetThingsDonePage(); }catch(e){}
  state.settings ||= {};
  if(window.SmartBooksNavigation){
    window.SmartBooksNavigation.syncSettings(state.settings, v29MenuModules(), typeof normalizeVisibleModules==='function' ? normalizeVisibleModules : null);
  }else{
    state.settings.menuOrder=v29NormalizeMenuOrder(state.settings.menuOrder);
    state.settings.visibleMenuItems=v29NormalizeVisibleMenuItems(state.settings.visibleMenuItems || v29DefaultMenuOrder());
    const moduleIds=v29MenuModules().map(m=>m.id);
    const visible=state.settings.visibleMenuItems.filter(id=>moduleIds.includes(id));
    state.settings.visibleModules = typeof normalizeVisibleModules==='function' ? normalizeVisibleModules(visible) : visible;
  }
  ['dashboard','settings'].forEach(id=>{ if(!state.settings.visibleMenuItems.includes(id)) state.settings.visibleMenuItems.push(id); });
}

function v29MenuItemById(id){ return v29MenuRegistry().find(m=>m.id===id); }

function v29IsMenuItemVisible(id){
  ensureV29MenuState();
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.isVisible(id, state.settings, v29MenuModules());
  if(id==='dashboard' || id==='settings') return true;
  return (state.settings.visibleMenuItems || []).includes(id);
}

function v29OrderedMenuItems(includeHidden=false){
  ensureV29MenuState();
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.orderedItems(v29MenuModules(), state.settings, includeHidden);
  return state.settings.menuOrder.map(id=>v29MenuItemById(id)).filter(Boolean).filter(item=>includeHidden || v29IsMenuItemVisible(item.id));
}

function renderMenuTitleV29(){
  injectV29MenuManagementStyles();
  const list=document.getElementById('menuList');
  const title=list?.previousElementSibling;
  if(!title || !title.classList?.contains('side-title')) return;
  title.classList.add('menu-title');
  title.innerHTML='<span>Menu</span><button class="link-btn" type="button" data-modal="manageMenu">Manage</button>';
}

function v29IconForMenu(id){
  if(typeof v30IconMarkup==='function') return v30IconMarkup(id);
  const item=v29MenuItemById(id);
  return escapeHTML(item?.icon || '');
}

function v29MenuManagerBody(orderOverride=null, visibleOverride=null, bookmarkOverride=null){
  injectV29MenuManagementStyles(); ensureV29MenuState();
  try{ if(typeof injectV30IconStyles==='function') injectV30IconStyles(); }catch(e){}
  const order=v29NormalizeMenuOrder(orderOverride || state.settings.menuOrder);
  const visibleSet=new Set(v29NormalizeVisibleMenuItems(visibleOverride || state.settings.visibleMenuItems || ['getthingsdone', ...(state.settings.visibleModules || []), 'dashboard','settings']));
  const bookmarkSet=new Set(Array.isArray(bookmarkOverride) ? bookmarkOverride : (Array.isArray(state.settings.bookmarks) ? state.settings.bookmarks : []));
  const rows=order.map((id,idx)=>{
    const item=v29MenuItemById(id); if(!item) return '';
    const locked=item.locked || id==='dashboard' || id==='settings';
    const checked=locked || visibleSet.has(id);
    const hiddenCls=checked?'':'is-hidden';
    const lockChip=locked?'<span class="v29-chip">Always on</span>':'';
    const bookmarkable=id!=='settings';
    const bookmarked=bookmarkSet.has(id);
    return `<div class="v29-menu-row ${hiddenCls} ${locked?'is-locked':''}" data-menu-id="${escapeHTML(id)}">
      <input type="checkbox" name="menuItem" value="${escapeHTML(id)}" ${checked?'checked':''} ${locked?'disabled':''} aria-label="Show ${escapeHTML(item.label)}">
      <span class="module-icon" style="width:32px;height:32px">${v29IconForMenu(id)}</span>
      <div><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(item.desc||'Menu item.')}</small></div>
      <div class="v29-menu-actions">
        ${lockChip}
        <button type="button" data-v29-action="menu-move" data-dir="top" title="Move to top" ${idx===0?'disabled':''}>↟</button>
        <button type="button" data-v29-action="menu-move" data-dir="up" title="Move up" ${idx===0?'disabled':''}>↑</button>
        <button type="button" data-v29-action="menu-move" data-dir="down" title="Move down" ${idx===order.length-1?'disabled':''}>↓</button>
        <button type="button" data-v29-action="menu-move" data-dir="bottom" title="Move to bottom" ${idx===order.length-1?'disabled':''}>↡</button>
        ${bookmarkable?`<button type="button" class="${bookmarked?'is-bookmarked':''}" data-v29-action="bookmark-one" title="${bookmarked?'Already in Bookmarks':'Add to Bookmarks'}" aria-label="${bookmarked?'Already in Bookmarks':'Add to Bookmarks'}">★</button>`:''}
      </div>
    </div>`;
  }).join('');
  return `<div class="v29-menu-note"><strong>Menu management:</strong> choose which modules appear in the left menu, reorder them, or add selected items to Bookmarks.</div>
    <div class="v29-menu-toolbar"><div class="muted small">Dashboards and Settings stay available for safety.</div><div class="v29-add-bookmarks"><button class="btn" type="button" data-v29-action="add-checked-bookmarks">★ Add checked to Bookmarks</button></div></div>
    <div class="v29-menu-list">${rows}</div>`;
}

function v29MenuOrderFromModal(){
  return Array.from(document.querySelectorAll('#modalBody .v29-menu-row')).map(row=>row.dataset.menuId).filter(Boolean);
}

function v29VisibleFromModal(){
  const checked=Array.from(document.querySelectorAll('#modalBody .v29-menu-row input[name="menuItem"]:checked')).map(i=>i.value);
  ['dashboard','settings'].forEach(id=>{ if(!checked.includes(id)) checked.push(id); });
  return v29NormalizeVisibleMenuItems(checked);
}

function v29BookmarkIdsFromModal(){
  const body=document.getElementById('modalBody');
  if(body?.dataset?.v29Bookmarks){
    try{ const parsed=JSON.parse(body.dataset.v29Bookmarks); if(Array.isArray(parsed)) return parsed.filter(Boolean); }catch(e){}
  }
  return Array.isArray(state.settings.bookmarks) ? state.settings.bookmarks.slice() : [];
}

function v29SetModalBookmarks(ids){
  const body=document.getElementById('modalBody');
  if(body) body.dataset.v29Bookmarks=JSON.stringify(Array.from(new Set((ids||[]).filter(Boolean))));
}

function v29MenuIdsToBookmarkIds(ids, existing=v29BookmarkIdsFromModal()){
  const catalog = typeof bookmarkCatalog==='function' ? bookmarkCatalog() : [];
  const registry = typeof v29MenuRegistry==='function' ? v29MenuRegistry() : [];
  if(window.SmartBooksNavigation) return window.SmartBooksNavigation.menuIdsToBookmarkIds(ids, catalog, registry, existing);
  const fullCatalog=[...catalog];
  registry.forEach(item=>{ if(!fullCatalog.some(b=>b.id===item.id)) fullCatalog.push({id:item.id,label:item.label,icon:item.icon,nav:item.id,desc:item.desc}); });
  const byNav=new Map(fullCatalog.map(b=>[b.nav,b.id]));
  const byId=new Set(fullCatalog.map(b=>b.id));
  const next=existing.slice();
  const before=next.length;
  (Array.isArray(ids)?ids:[]).forEach(id=>{
    const bookmarkId=byId.has(id) ? id : byNav.get(id);
    if(bookmarkId && !next.includes(bookmarkId)) next.push(bookmarkId);
  });
  return {ids:next, added:next.length-before};
}

function v29RenderMenuManagerBody(order=v29MenuOrderFromModal(), visible=v29VisibleFromModal(), bookmarks=v29BookmarkIdsFromModal()){
  const body=document.getElementById('modalBody');
  if(!body) return;
  body.innerHTML=v29MenuManagerBody(order, visible, bookmarks);
  v29SetModalBookmarks(bookmarks);
}

function v29ApplyMenuModalState({save=false}={}){
  const order=v29NormalizeMenuOrder(v29MenuOrderFromModal());
  const visible=v29NormalizeVisibleMenuItems(v29VisibleFromModal());
  state.settings.menuOrder=order;
  state.settings.visibleMenuItems=visible;
  if(window.SmartBooksNavigation){
    state.settings.visibleModules=window.SmartBooksNavigation.moduleVisibilityFromMenu(visible, v29MenuModules(), typeof normalizeVisibleModules==='function' ? normalizeVisibleModules : null);
  }else{
    const moduleIds=v29MenuModules().map(m=>m.id);
    const moduleVisible=visible.filter(id=>moduleIds.includes(id));
    state.settings.visibleModules = typeof normalizeVisibleModules==='function' ? normalizeVisibleModules(moduleVisible) : moduleVisible;
  }
  if(save) saveState();
}

function v29ResetMenuModal(){
  v29RenderMenuManagerBody(v29DefaultMenuOrder(), v29DefaultMenuOrder(), v29BookmarkIdsFromModal());
}

function v29InstallBookmarkCatalog(){
  if(window.SmartBooksMenuCustomization?.bookmarkCatalogInstalled || typeof bookmarkCatalog!=='function') return;
  const baseBookmarkCatalog=bookmarkCatalog;
  bookmarkCatalog=function(){
    const base=baseBookmarkCatalog().slice();
    if(v29IsMenuItemVisible('getthingsdone') && !base.some(b=>b.id==='getthingsdone')){
      base.unshift({id:'getthingsdone', label:'Get Things Done', icon:'✓', nav:'getthingsdone', desc:'Guided workflow hub.'});
    }
    return base.filter(b=>b.id!=='getthingsdone' || v29IsMenuItemVisible('getthingsdone'));
  };
  window.SmartBooksMenuCustomization.bookmarkCatalogInstalled=true;
}

function v29InstallMenuModal(){
  if(window.SmartBooksMenuCustomization?.modalInstalled) return;
  const baseOpenModal=openModal;
  openModal=function(type){
    if(type==='customize') type='manageMenu';
    if(type==='manageMenu'){
      injectV29MenuManagementStyles(); ensureV29MenuState(); currentModal='manageMenu';
      document.getElementById('modalTitle').textContent='Manage menu';
      document.getElementById('modalSubtitle').textContent='Show, hide, reorder, and bookmark sidebar menu items.';
      document.getElementById('modalBody').innerHTML=v29MenuManagerBody();
      v29SetModalBookmarks(state.settings.bookmarks || []);
      document.getElementById('modalFooter').innerHTML='<button type="button" class="btn" data-v29-action="reset-menu">Restore defaults</button><button type="button" class="btn" id="cancelModal">Cancel</button><button type="submit" class="btn primary">Save menu</button>';
      document.getElementById('cancelModal').addEventListener('click', closeModal);
      document.getElementById('modalBackdrop').classList.add('open');
      return;
    }
    return baseOpenModal(type);
  };

  const baseSubmitModal=submitModal;
  submitModal=function(e){
    if(currentModal==='manageMenu'){
      e.preventDefault(); ensureV29MenuState();
      const bookmarks=v29BookmarkIdsFromModal();
      v29ApplyMenuModalState({save:false});
      state.settings.bookmarks=bookmarks;
      try{ if(typeof normalizeBookmarks==='function') normalizeBookmarks(); }catch(err){}
      saveState();
      if(!v29IsMenuItemVisible(currentPage) && currentPage==='getthingsdone') currentPage='dashboard';
      if(typeof canNavigate==='function' && !canNavigate(currentPage)) currentPage='dashboard';
      closeModal(); renderAll(); showToast('Menu updated.'); return;
    }
    return baseSubmitModal(e);
  };
  window.SmartBooksMenuCustomization.modalInstalled=true;
}

function v29InstallMenuClickHandlers(){
  if(window.SmartBooksMenuCustomization?.clickHandlersInstalled) return;
  document.addEventListener('click', function(e){
    const menuItem=e.target.closest?.('#modalBody .v29-menu-row input[name="menuItem"]');
    if(menuItem){
      e.stopImmediatePropagation();
      const row=menuItem.closest('.v29-menu-row');
      if(row) row.classList.toggle('is-hidden', !menuItem.checked);
      return;
    }
    const btn=e.target.closest?.('[data-v29-action]');
    if(!btn) return;
    e.stopImmediatePropagation();
    const action=btn.dataset.v29Action;
    if(action==='menu-move'){
      e.preventDefault();
      const row=btn.closest('.v29-menu-row'); if(!row) return;
      const list=row.parentNode; const dir=btn.dataset.dir;
      if(dir==='top') list.insertBefore(row, list.firstElementChild);
      if(dir==='up' && row.previousElementSibling) list.insertBefore(row, row.previousElementSibling);
      if(dir==='down' && row.nextElementSibling) list.insertBefore(row.nextElementSibling, row);
      if(dir==='bottom') list.appendChild(row);
      v29RenderMenuManagerBody(v29MenuOrderFromModal(), v29VisibleFromModal(), v29BookmarkIdsFromModal());
      return;
    }
    if(action==='reset-menu'){
      e.preventDefault(); v29ResetMenuModal(); showToast('Default menu restored in the manager. Save to apply.'); return;
    }
    if(action==='bookmark-one'){
      e.preventDefault();
      const row=btn.closest('.v29-menu-row'); const id=row?.dataset.menuId;
      if(id){
        const next=v29MenuIdsToBookmarkIds([id]);
        v29RenderMenuManagerBody(v29MenuOrderFromModal(), v29VisibleFromModal(), next.ids);
        showToast(next.added ? 'Bookmark will be added when you save.' : 'Already in Bookmarks.');
      }
      return;
    }
    if(action==='add-checked-bookmarks'){
      e.preventDefault();
      const ids=v29VisibleFromModal().filter(id=>id!=='settings');
      const next=v29MenuIdsToBookmarkIds(ids);
      v29RenderMenuManagerBody(v29MenuOrderFromModal(), v29VisibleFromModal(), next.ids);
      showToast(next.added ? `${next.added} checked item${next.added===1?'':'s'} will be added when you save.` : 'Checked items are already in Bookmarks.');
    }
  }, true);
  window.SmartBooksMenuCustomization.clickHandlersInstalled=true;
}

window.SmartBooksMenuCustomization = Object.assign(window.SmartBooksMenuCustomization || {}, {
  install(){
    injectV29MenuManagementStyles();
    ensureV29MenuState();
    v29InstallBookmarkCatalog();
    v29InstallMenuModal();
    v29InstallMenuClickHandlers();
    try{ renderMenuTitleV29(); }catch(e){}
  },
  state: {
    defaultOrder: v29DefaultMenuOrder,
    orderedItems: v29OrderedMenuItems,
    isVisible: v29IsMenuItemVisible
  }
});

window.SmartBooksMenuCustomization.install();
