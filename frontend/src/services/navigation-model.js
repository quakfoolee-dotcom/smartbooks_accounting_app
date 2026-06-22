// SmartBooks navigation model.
// Centralizes menu order, visibility, labels, and bookmark mapping so rail,
// sidebar, apps, and Customize do not invent separate navigation rules.
(function(global){
  const DEFAULT_ORDER = [
    "getthingsdone",
    "dashboard",
    "apps",
    "banking",
    "transactions",
    "accounting",
    "sales",
    "customers",
    "expenses",
    "vendors",
    "reports",
    "inventory",
    "projects",
    "time",
    "payroll",
    "taxes",
    "settings",
    "setup"
  ];

  const ALWAYS_VISIBLE = new Set(["dashboard", "settings"]);

  const LABELS = {
    dashboard: "Dashboards",
    apps: "My Apps",
    inventory: "Products & Services",
    expenses: "Expenses & Pay Bills"
  };

  const DESCRIPTIONS = {
    dashboard: "Dashboard and company overview.",
    getthingsdone: "Guided action hub for common money-in, money-out, banking, and reporting workflows.",
    settings: "Company and app controls.",
    setup: "Guided setup tasks.",
    apps: "Enabled module launcher.",
    banking: "Bank accounts, bank feed review, and reconciliation.",
    transactions: "All transaction activity.",
    accounting: "Chart of accounts, journal entries, and trial balance.",
    sales: "Estimates, invoices, payments, and sales orders.",
    customers: "Customer profiles and open receivables.",
    expenses: "Expenses, bills, payments, and AP workflow.",
    vendors: "Vendor records and purchase activity.",
    reports: "Financial, sales, tax, and management reports.",
    inventory: "Products, services, inventory, POs, and receiving.",
    projects: "Project budgets, costs, revenue, and profitability.",
    time: "Time entries and billable work.",
    payroll: "Payroll and employee setup.",
    taxes: "GST/HST returns, rates, and remittances."
  };

  function unique(items){
    const out = [];
    (Array.isArray(items) ? items : []).forEach(id => {
      if(id && !out.includes(id)) out.push(id);
    });
    return out;
  }

  function moduleIds(modules){
    return unique((Array.isArray(modules) ? modules : []).map(m => m && m.id).filter(Boolean));
  }

  function defaultMenuOrder(modules){
    const ids = moduleIds(modules);
    return [
      ...DEFAULT_ORDER.filter(id => id === "getthingsdone" || ids.includes(id)),
      ...ids.filter(id => !DEFAULT_ORDER.includes(id) && id !== "getthingsdone")
    ];
  }

  function normalizeOrder(order, modules){
    const defaults = defaultMenuOrder(modules);
    const allowed = new Set(defaults);
    const seen = [];
    (Array.isArray(order) ? order : []).forEach(id => {
      if(allowed.has(id) && !seen.includes(id)) seen.push(id);
    });
    defaults.forEach(id => {
      if(!seen.includes(id)) seen.push(id);
    });
    return seen;
  }

  function normalizeVisible(items, modules){
    const allowed = new Set(defaultMenuOrder(modules));
    const seen = [];
    (Array.isArray(items) ? items : []).forEach(id => {
      if(allowed.has(id) && !seen.includes(id)) seen.push(id);
    });
    ALWAYS_VISIBLE.forEach(id => {
      if(allowed.has(id) && !seen.includes(id)) seen.push(id);
    });
    return seen;
  }

  function menuRegistry(modules){
    const items = (Array.isArray(modules) ? modules : []).map(m => ({
      id: m.id,
      label: LABELS[m.id] || m.label || m.id,
      icon: m.icon,
      locked: !!m.locked || ALWAYS_VISIBLE.has(m.id),
      module: true,
      desc: DESCRIPTIONS[m.id] || "Module workspace."
    }));
    return [
      {
        id: "getthingsdone",
        label: "Get Things Done",
        icon: "✓",
        locked: false,
        special: true,
        desc: DESCRIPTIONS.getthingsdone
      },
      ...items
    ];
  }

  function isVisible(id, settings, modules){
    if(ALWAYS_VISIBLE.has(id)) return true;
    const visible = normalizeVisible(settings && settings.visibleMenuItems, modules);
    return visible.includes(id);
  }

  function moduleVisibilityFromMenu(visibleMenuItems, modules, normalizeVisibleModules){
    const ids = moduleIds(modules);
    const visible = normalizeVisible(visibleMenuItems, modules).filter(id => ids.includes(id));
    return typeof normalizeVisibleModules === "function" ? normalizeVisibleModules(visible) : visible;
  }

  function syncSettings(settings, modules, normalizeVisibleModules){
    const s = settings || {};
    if(!Array.isArray(s.menuOrder) || !s.menuOrder.length) s.menuOrder = defaultMenuOrder(modules);
    s.menuOrder = normalizeOrder(s.menuOrder, modules);

    if(Array.isArray(s.visibleMenuItems) && s.visibleMenuItems.length){
      s.visibleMenuItems = normalizeVisible(s.visibleMenuItems, modules);
    }else{
      s.visibleMenuItems = normalizeVisible(defaultMenuOrder(modules), modules);
    }
    s.visibleModules = moduleVisibilityFromMenu(s.visibleMenuItems, modules, normalizeVisibleModules);
    return s;
  }

  function orderedItems(modules, settings, includeHidden){
    const registry = menuRegistry(modules);
    const byId = new Map(registry.map(item => [item.id, item]));
    const order = normalizeOrder(settings && settings.menuOrder, modules);
    return order.map(id => byId.get(id)).filter(Boolean).filter(item => includeHidden || isVisible(item.id, settings, modules));
  }

  function displayLabel(item){
    return LABELS[item && item.id] || (item && item.label) || (item && item.id) || "";
  }

  function menuIdsToBookmarkIds(ids, catalog, registry, existing){
    const fullCatalog = Array.isArray(catalog) ? catalog.slice() : [];
    (Array.isArray(registry) ? registry : []).forEach(item => {
      if(item && item.id && !fullCatalog.some(b => b.id === item.id)){
        fullCatalog.push({
          id: item.id,
          label: item.label,
          icon: item.icon,
          nav: item.id,
          desc: item.desc
        });
      }
    });

    const byNav = new Map(fullCatalog.map(b => [b.nav, b.id]));
    const byId = new Set(fullCatalog.map(b => b.id));
    const next = Array.isArray(existing) ? existing.slice() : [];
    const before = next.length;
    (Array.isArray(ids) ? ids : []).forEach(id => {
      const bookmarkId = byId.has(id) ? id : byNav.get(id);
      if(bookmarkId && !next.includes(bookmarkId)) next.push(bookmarkId);
    });
    return { ids: next, added: next.length - before };
  }

  global.SmartBooksNavigation = {
    defaultMenuOrder,
    normalizeOrder,
    normalizeVisible,
    menuRegistry,
    isVisible,
    moduleVisibilityFromMenu,
    syncSettings,
    orderedItems,
    displayLabel,
    menuIdsToBookmarkIds
  };
})(window);
