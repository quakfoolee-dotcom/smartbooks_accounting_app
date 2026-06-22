// SmartBooks icon adapter.
// Replaces legacy mojibake glyphs with stable inline SVG icons.
(function(global){
  const svgAttrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  const paths = {
    plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    reports:'<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
    apps:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-1.9.3 1.7 1.7 0 0 0-.8 1.6V22H9v-.2a1.7 1.7 0 0 0-.8-1.6 1.7 1.7 0 0 0-1.9-.3l-.2.1-2-3.4.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.4-1.1H3V10h.2a1.7 1.7 0 0 0 1.4-1.1 1.7 1.7 0 0 0-.3-1.9L4.2 7l2-3.4.2.1a1.7 1.7 0 0 0 1.9-.3A1.7 1.7 0 0 0 9 1.8V2h6v-.2a1.7 1.7 0 0 0 .8 1.6 1.7 1.7 0 0 0 1.9.3l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
    home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
    reset:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/>',
    download:'<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    sparkle:'<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A8 8 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.8 2.8 0 1 1 4.7 2c-.9.8-1.7 1.2-1.7 2.5"/><path d="M12 17h.01"/>',
    privacy:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><path d="M18 2v5h-5"/><path d="M6 22v-5h5"/>',
    banking:'<path d="M3 10l9-6 9 6"/><path d="M5 10h14"/><path d="M6 10v8"/><path d="M10 10v8"/><path d="M14 10v8"/><path d="M18 10v8"/><path d="M4 18h16"/><path d="M3 21h18"/>',
    transactions:'<path d="M7 7h11l-3-3"/><path d="M17 17H6l3 3"/><path d="M18 7l-3 3"/><path d="M6 17l3-3"/>',
    accounting:'<path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    sales:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    customers:'<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M2 21v-2a4 4 0 0 1 3-3.9"/>',
    expenses:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/>',
    vendors:'<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    inventory:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    projects:'<path d="M12 2l10 10-10 10L2 12 12 2z"/><path d="M12 6l6 6-6 6-6-6 6-6z"/>',
    time:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    payroll:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><path d="M14 10h4"/><path d="M14 14h3"/>',
    taxes:'<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    close:'<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
    more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    arrowUp:'<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    arrowDown:'<path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>',
    arrowLeft:'<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
    arrowRight:'<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
    cash:'<path d="M4 7h16v10H4z"/><circle cx="12" cy="12" r="2"/><path d="M7 10v4"/><path d="M17 10v4"/>'
  };

  const navIcons = {
    dashboard:'dashboard', reports:'reports', apps:'apps', settings:'settings', setup:'check',
    banking:'banking', transactions:'transactions', accounting:'accounting', sales:'sales',
    customers:'customers', expenses:'expenses', vendors:'vendors', inventory:'inventory',
    projects:'projects', time:'time', payroll:'payroll', taxes:'taxes'
  };

  function html(name, className){
    const key = paths[name] ? name : 'dashboard';
    return `<svg class="sb-icon ${className || ''}" ${svgAttrs}>${paths[key]}</svg>`;
  }

  function textOf(el){
    return String(el?.textContent || '').trim().toLowerCase();
  }

  const mojibakePattern = /[\u00c2\u00c3\u00e2\u00ef\u00f0]/;
  const cp1252Bytes = {
    0x20ac:0x80, 0x201a:0x82, 0x0192:0x83, 0x201e:0x84, 0x2026:0x85, 0x2020:0x86, 0x2021:0x87, 0x02c6:0x88,
    0x2030:0x89, 0x0160:0x8a, 0x2039:0x8b, 0x0152:0x8c, 0x017d:0x8e, 0x2018:0x91, 0x2019:0x92, 0x201c:0x93,
    0x201d:0x94, 0x2022:0x95, 0x2013:0x96, 0x2014:0x97, 0x02dc:0x98, 0x2122:0x99, 0x0161:0x9a, 0x203a:0x9b,
    0x0153:0x9c, 0x017e:0x9e, 0x0178:0x9f
  };

  function byteForChar(char){
    const code = char.charCodeAt(0);
    if(code <= 0xff) return code;
    return cp1252Bytes[code];
  }

  function decodeMojibakeOnce(value){
    if(!mojibakePattern.test(value) || typeof TextDecoder !== 'function') return value;
    const bytes = [];
    for(const char of value){
      const byte = byteForChar(char);
      if(byte === undefined) return value;
      bytes.push(byte);
    }
    try{ return new TextDecoder('utf-8').decode(new Uint8Array(bytes)); }
    catch(error){ return value; }
  }

  function repairMojibake(value){
    let current = String(value ?? '');
    for(let i = 0; i < 3 && mojibakePattern.test(current); i++){
      const next = decodeMojibakeOnce(current);
      if(next === current) break;
      current = next;
    }
    return current.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
  }

  function nameFromText(text){
    const t = String(text || '').toLowerCase();
    if(!t) return '';
    if(t.includes('new') || t.includes('create') || t.includes('add') || t.includes('plus')) return 'plus';
    if(t.includes('dash') || t.includes('business overview')) return 'dashboard';
    if(t.includes('report')) return 'reports';
    if(t.includes('app')) return 'apps';
    if(t.includes('setting') || t.includes('customize')) return 'settings';
    if(t.includes('reset')) return 'reset';
    if(t.includes('export') || t.includes('download')) return 'download';
    if(t.includes('menu')) return 'menu';
    if(t.includes('insight') || t.includes('feed')) return 'sparkle';
    if(t.includes('help')) return 'help';
    if(t.includes('notification')) return 'bell';
    if(t.includes('privacy')) return 'privacy';
    if(t.includes('refresh')) return 'refresh';
    if(t.includes('close')) return 'close';
    if(t.includes('bank')) return 'banking';
    if(t.includes('transaction') || t.includes('matching')) return 'transactions';
    if(t.includes('accounting') || t.includes('ledger')) return 'accounting';
    if(t.includes('sales') || t.includes('invoice') || t.includes('paid')) return 'sales';
    if(t.includes('customer')) return 'customers';
    if(t.includes('expense') || t.includes('bill')) return 'expenses';
    if(t.includes('vendor')) return 'vendors';
    if(t.includes('inventory') || t.includes('product')) return 'inventory';
    if(t.includes('project')) return 'projects';
    if(t.includes('time')) return 'time';
    if(t.includes('payroll')) return 'payroll';
    if(t.includes('tax')) return 'taxes';
    if(t.includes('setup') || t.includes('ready') || t.includes('balanced')) return 'check';
    if(t.includes('dark') || t.includes('moon')) return 'moon';
    if(t.includes('light') || t.includes('sun')) return 'sun';
    return '';
  }

  function infer(el){
    const explicit = el.getAttribute('data-icon');
    if(explicit) return explicit;
    const action = el.closest('[data-action]')?.getAttribute('data-action') || '';
    if(el.classList?.contains('nav-chevron')) return 'arrowRight';
    if(el.classList?.contains('shortcut-arrow')){
      return el.closest('[data-dir="-1"]') || el.getAttribute('data-dir') === '-1' ? 'arrowLeft' : 'arrowRight';
    }
    const nav = el.closest('[data-nav]')?.getAttribute('data-nav');
    if(nav && navIcons[nav]) return navIcons[nav];
    if(action.includes('refresh')) return 'refresh';
    if(action.includes('privacy')) return 'privacy';
    if(action.includes('remove') || action.includes('hide')) return 'close';
    if(action.includes('move') && el.closest('[data-dir="up"]')) return 'arrowUp';
    if(action.includes('move') && el.closest('[data-dir="down"]')) return 'arrowDown';
    const button = el.closest('button');
    const byId = button?.id || el.id || '';
    if(byId.includes('sidebarToggle')) return 'menu';
    if(byId.includes('settings') || byId.includes('Customize')) return 'settings';
    if(byId.includes('insights')) return 'sparkle';
    if(byId.includes('help')) return 'help';
    if(byId.includes('notifications')) return 'bell';
    if(byId.includes('theme')) return 'sun';
    return nameFromText(button?.getAttribute('aria-label') || button?.getAttribute('title') || button?.textContent || el.closest('.feed-card,.app-tile,.bookmark-config-row,.shortcut-config-row')?.textContent || el.textContent);
  }

  const legacyTokens = [
    ['＋','plus'], ['＋','plus'],
    ['⚙','settings'], ['⚙','settings'],
    ['◉','privacy'], ['◉','privacy'],
    ['↻','refresh'], ['↻','refresh'],
    ['‹','arrowLeft'], ['‹','arrowLeft'],
    ['›','arrowRight'], ['›','arrowRight'],
    ['↑','arrowUp'], ['↑','arrowUp'],
    ['↓','arrowDown'], ['↓','arrowDown'],
    ['✦','sparkle'], ['✦','sparkle'],
    ['✓','check'], ['✓','check'],
    ['⇩','download'], ['↺','reset'],
    ['⌂','home'], ['▦','dashboard'], ['▩','apps'],
    ['🔔','bell'], ['×','close'], ['×','close']
  ];

  const repairedPrefixIcons = [
    ['+','plus'], ['\uFF0B','plus'], ['\u2699','settings'], ['\u25C9','privacy'],
    ['\u21BB','refresh'], ['\u21BA','reset'], ['\u2039','arrowLeft'], ['\u203A','arrowRight'],
    ['\u2191','arrowUp'], ['\u2193','arrowDown'], ['\u2713','check'], ['\u2714','check'],
    ['\u2726','sparkle'], ['\u2728','sparkle'], ['\u2302','home'], ['\u21E9','download'],
    ['\u2715','close'], ['\u00D7','close']
  ];

  function stripLegacyPrefix(text){
    let value = repairMojibake(String(text || '').trim());
    let icon = '';
    for(const [token, name] of legacyTokens){
      if(value.startsWith(token)){
        icon = name;
        value = value.slice(token.length).trim();
        break;
      }
    }
    if(!icon){
      for(const [token, name] of repairedPrefixIcons){
        if(value.startsWith(token)){
          icon = name;
          value = value.slice(token.length).trim();
          break;
        }
      }
    }
    return { icon, label:value };
  }

  function replace(el, name){
    if(!el || el.querySelector('.sb-icon')) return;
    const iconName = name || infer(el);
    if(!iconName) return;
    const notificationDot = el.querySelector('.notification-dot');
    el.dataset.icon = iconName;
    el.innerHTML = html(iconName);
    if(notificationDot) el.appendChild(notificationDot);
  }

  function fixButtonLabel(button){
    if(!button || button.querySelector('.sb-icon')) return;
    const parsed = stripLegacyPrefix(button.textContent);
    if(!parsed.icon) return;
    const iconOnly = button.classList?.contains('square') || button.classList?.contains('icon-btn') || button.classList?.contains('top-panel-close');
    const fallbackLabel = iconOnly ? '' : (button.getAttribute('aria-label') || button.getAttribute('title') || '');
    const label = parsed.label || fallbackLabel;
    button.dataset.icon = parsed.icon;
    button.innerHTML = `${html(parsed.icon)}${label ? `<span>${escapeText(label)}</span>` : ''}`;
  }

  function escapeText(value){
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function fixTextNode(node){
    if(!node || node.nodeType !== 3) return;
    const parent = node.parentElement;
    if(!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION)$/i.test(parent.tagName)) return;
    const repaired = repairMojibake(node.nodeValue);
    if(repaired !== node.nodeValue) node.nodeValue = repaired;
  }

  function fixTextNodes(root){
    if(!root) return;
    if(root.nodeType === 3) return fixTextNode(root);
    if(!root.querySelectorAll || !document.createTreeWalker) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(fixTextNode);
  }

  function fixStandaloneSymbol(el){
    if(!el || el.querySelector('.sb-icon')) return;
    const value = repairMojibake(el.textContent).trim();
    const map = {
      '\u203A':'arrowRight', '\u2039':'arrowLeft', '\u2192':'arrowRight', '\u2190':'arrowLeft',
      '\u2191':'arrowUp', '\u2193':'arrowDown', '\u22EE':'more', '\u2713':'check',
      '\u2714':'check', '\u2726':'sparkle', '\u2699':'settings', '\u00D7':'close'
    };
    if(!map[value]) return;
    el.dataset.icon = map[value];
    el.innerHTML = html(map[value]);
  }

  function fixDecorativeHeading(el){
    if(!el || el.querySelector('.sb-icon')) return;
    const parsed = stripLegacyPrefix(el.textContent);
    if(!parsed.icon || !parsed.label) return;
    el.dataset.icon = parsed.icon;
    el.innerHTML = `${html(parsed.icon)}<span>${escapeText(parsed.label)}</span>`;
  }

  function fix(root){
    const scope = root && root.querySelectorAll ? root : document;
    fixTextNodes(scope);
    scope.querySelectorAll('.rail-icon,.dot,.module-icon,.tile-icon,.feed-badge,.mode-icon,.bank-icon,.icon-btn,.hamburger,.theme-toggle-knob,.top-panel-close,.menu,.nav-chevron,.shortcut-arrow,.shortcut-customize,.remove-bookmark,.hide-feed-btn,.check-dot,.estimate-payment-icon,.v33-search-icon,.v47-search-icon,.gtd-step-icon,.gtd-task-icon').forEach(el => replace(el));
    scope.querySelectorAll('button,.btn').forEach(fixButtonLabel);
    scope.querySelectorAll('h1,h2,h3,h4,.feed-header h3').forEach(fixDecorativeHeading);
    scope.querySelectorAll('.mini-flow b,.gtd-flow-arrow,.gtd-lane-arrow,.workflow-arrow').forEach(fixStandaloneSymbol);
  }

  function observe(){
    fix(document);
    setTimeout(() => fix(document), 0);
    setTimeout(() => fix(document), 150);
    const observer = new MutationObserver(mutations => {
      for(const mutation of mutations){
        if(mutation.type === 'characterData') fixTextNode(mutation.target);
        mutation.addedNodes.forEach(node => {
          if(node.nodeType === 1 || node.nodeType === 3) fix(node);
        });
      }
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
  }

  const api = { html, fix, infer, navIcons, repairMojibake };
  global.SmartBooksIcons = api;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once:true });
  else observe();
})(window);
