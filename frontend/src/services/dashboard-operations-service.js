// Pure dashboard operations summary helpers shared by the dashboard and unit tests.
(function(global){
  "use strict";

  function num(value){
    return Number(value) || 0;
  }

  function defaultToday(){
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysISO(today, days){
    const date = new Date(`${today || defaultToday()}T00:00:00`);
    date.setDate(date.getDate() + num(days));
    return date.toISOString().slice(0, 10);
  }

  function dateWithin(date, today, days){
    const value = String(date || "");
    if(!value) return false;
    return value <= addDaysISO(today, days);
  }

  function plural(count, singular, pluralValue){
    return `${count} ${count === 1 ? singular : (pluralValue || `${singular}s`)}`;
  }

  function compactError(error){
    if(!error) return "";
    if(typeof error === "string") return error;
    if(error && typeof error.message === "string") return error.message;
    return String(error);
  }

  function errorCode(error){
    return error && typeof error === "object" ? error.code : "";
  }

  function timestampLabel(value){
    if(!value) return "Not saved yet";
    if(typeof value === "string") return value;
    const date = new Date(value);
    if(Number.isNaN(date.getTime())) return String(value);
    return date.toISOString();
  }

  function modeLabel(mode){
    if(mode === "backend") return "Shared backend";
    if(mode === "hybrid") return "Local + backend migration";
    return "This browser";
  }

  function persistenceSummary(status = {}){
    const mode = ["local", "backend", "hybrid"].includes(String(status.mode)) ? String(status.mode) : "local";
    const stats = status.stats || {};
    const endpoint = status.backendEndpoint || "/api/state";
    const backendEnabled = mode === "backend" || mode === "hybrid";
    const lastError = compactError(stats.lastError);
    const conflict = errorCode(stats.lastError) === "STATE_REVISION_CONFLICT";
    const level = lastError ? "warn" : (backendEnabled ? "good" : "neutral");
    const fallbackCopyAction = { label:"Save local copy", actionAttr:"data-action=\"save-local-fallback-copy\"" };
    const headline = conflict
      ? "Newer company data is available"
      : lastError
      ? "Company data needs attention"
      : (mode === "backend"
          ? "Shared storage connected"
          : mode === "hybrid"
          ? "Migration storage connected"
          : "Saved on this device");
    const detail = conflict
      ? "Another session saved newer company data. Export this session if needed, then reload before saving again."
      : lastError
      ? `The last storage action failed: ${lastError}`
      : (mode === "backend"
          ? "This company can load and save through the configured backend service."
          : mode === "hybrid"
          ? "Migration mode keeps a local backup while saving through the backend service."
          : "This browser keeps the working copy. Export a backup before clearing browser data or switching devices.");
    const guidance = conflict
      ? "Reload only reads from shared storage. Export this session first if you need to keep local edits."
      : lastError
      ? (backendEnabled
          ? "Retry shared storage, then export or save a local copy if this warning stays visible."
          : "Export or save a local copy before making more changes if this warning stays visible.")
      : "";
    const actions = conflict ? [
      { label:"Reload company data", actionAttr:"data-action=\"retry-backend-load\"" },
      { label:"Export current session", actionAttr:"data-action=\"export-persistence-backup\"" },
      fallbackCopyAction,
      { label:"Review settings", actionAttr:"data-action=\"open-persistence-settings\"" }
    ] : lastError ? [
      ...(backendEnabled ? [
        { label:"Try loading again", actionAttr:"data-action=\"retry-backend-load\"" },
        { label:"Try saving again", actionAttr:"data-action=\"retry-backend-save\"" }
      ] : []),
      { label:"Export safety backup", actionAttr:"data-action=\"export-persistence-backup\"" },
      fallbackCopyAction,
      { label:"Review settings", actionAttr:"data-action=\"open-persistence-settings\"" }
    ] : backendEnabled ? [
      { label:"Try saving again", actionAttr:"data-action=\"retry-backend-save\"" },
      { label:"Export safety backup", actionAttr:"data-action=\"export-persistence-backup\"" },
      { label:"Review settings", actionAttr:"data-action=\"open-persistence-settings\"" }
    ] : [
      { label:"Export safety backup", actionAttr:"data-action=\"export-persistence-backup\"" },
      { label:"Review settings", actionAttr:"data-action=\"open-persistence-settings\"" }
    ];

    return {
      mode,
      modeLabel: modeLabel(mode),
      endpoint,
      level,
      headline,
      detail,
      guidance,
      lastError,
      backendEnabled,
      revision: stats.lastBackendRevision || "Not loaded",
      lastBackendSavedAt: timestampLabel(stats.lastBackendSavedAt),
      actions,
      counters: {
        reads: num(stats.backendReads),
        writes: num(stats.backendWrites),
        errors: num(stats.errors)
      }
    };
  }

  function fallbackOpenAmount(invoice){
    return Math.max(0, num(invoice?.subtotal) + num(invoice?.tax) - num(invoice?.paid));
  }

  function fallbackBillOpenAmount(bill){
    return Math.max(0, num(bill?.amount) + num(bill?.tax) - num(bill?.paid));
  }

  function fallbackInvoiceStatus(invoice, openAmount, today){
    if(num(openAmount) <= 0.005 && num(invoice?.subtotal) + num(invoice?.tax) > 0) return "Paid";
    if(openAmount > 0.005 && invoice?.dueDate && invoice.dueDate < today && invoice.status !== "Draft") return "Overdue";
    return String(invoice?.status || "Draft");
  }

  function operationsSummary(state, helpers = {}){
    const today = helpers.today || defaultToday();
    const openAmount = helpers.openAmount || fallbackOpenAmount;
    const billOpenAmount = helpers.billOpenAmount || fallbackBillOpenAmount;
    const invoiceStatus = helpers.invoiceStatus || ((invoice, amount) => fallbackInvoiceStatus(invoice, amount, today));
    const totals = typeof helpers.totals === "function" ? helpers.totals() : (helpers.totals || {});
    const cash = typeof helpers.cashSummary === "function" ? helpers.cashSummary() : (helpers.cashSummary || null);

    const openInvoices = (state?.invoices || []).filter(invoice => openAmount(invoice) > 0.005);
    const overdueInvoices = openInvoices.filter(invoice => {
      const amount = openAmount(invoice);
      const status = invoiceStatus(invoice, amount);
      return status === "Overdue" || (invoice.dueDate && invoice.dueDate < today);
    });
    const openBills = (state?.bills || []).filter(bill => billOpenAmount(bill) > 0.005);
    const dueBills = openBills.filter(bill => dateWithin(bill.dueDate, today, 7));
    const bankReview = (state?.bankTransactions || []).filter(tx => !["Reviewed", "Matched"].includes(String(tx.status || ""))).length;
    const setupTasks = (state?.setupTasks || []).filter(task => !task.hidden);
    const openSetup = setupTasks.filter(task => !task.done).length;
    const taxNet = num(totals?.tax?.net);
    const cashBalance = num(cash?.operatingBalance ?? totals?.bank);
    const attentionCount = overdueInvoices.length + dueBills.length + bankReview + (taxNet > 0 ? 1 : 0);
    const moneyIn = openInvoices.reduce((sum, invoice) => sum + openAmount(invoice), 0);
    const moneyOut = openBills.reduce((sum, bill) => sum + billOpenAmount(bill), 0);

    return {
      attentionCount,
      headline: attentionCount ? `${plural(attentionCount, "item")} need attention` : "No urgent exceptions",
      metrics: [
        {
          id: "attention",
          title: "Attention needed",
          value: String(attentionCount),
          detail: `${overdueInvoices.length} overdue invoices, ${dueBills.length} bills due soon, ${bankReview} bank items`,
          actionLabel: "Open work queue",
          actionAttr: "data-nav=\"getthingsdone\"",
          level: attentionCount ? "warn" : "good"
        },
        {
          id: "moneyIn",
          title: "Money in",
          moneyValue: moneyIn,
          detail: plural(overdueInvoices.length, "overdue invoice"),
          actionLabel: "Receive payment",
          actionAttr: "data-modal=\"payment\"",
          level: overdueInvoices.length ? "warn" : "neutral"
        },
        {
          id: "moneyOut",
          title: "Money out",
          moneyValue: moneyOut,
          detail: `${plural(dueBills.length, "bill")} due in the next 7 days`,
          actionLabel: "Pay bill",
          actionAttr: "data-modal=\"payBill\"",
          level: dueBills.length ? "warn" : "neutral"
        },
        {
          id: "cash",
          title: "Cash position",
          moneyValue: cashBalance,
          detail: `Net tax ${taxNet >= 0 ? "payable" : "credit"}`,
          moneyDetailValue: Math.abs(taxNet),
          actionLabel: "Review cash",
          actionAttr: "data-nav=\"banking\"",
          level: cashBalance >= 0 ? "good" : "warn"
        },
        {
          id: "openWork",
          title: "Open work",
          value: String(bankReview + openSetup),
          detail: `${bankReview} bank review, ${plural(openSetup, "setup task")}`,
          actionLabel: "Review setup",
          actionAttr: "data-action=\"open-setup-checklist\"",
          level: bankReview || openSetup ? "neutral" : "good"
        }
      ],
      raw: {
        openInvoices: openInvoices.length,
        overdueInvoices: overdueInvoices.length,
        openBills: openBills.length,
        dueBills: dueBills.length,
        bankReview,
        openSetup,
        taxNet,
        cashBalance,
        moneyIn,
        moneyOut
      }
    };
  }

  global.SmartBooksDashboardOperations = {
    operationsSummary,
    persistenceSummary,
    dateWithin,
    addDaysISO
  };
})(typeof window !== "undefined" ? window : globalThis);
