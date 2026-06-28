const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

function loadDashboardOperationsService(){
  const modulePath = path.join(root, "frontend/src/services/dashboard-operations-service.js");
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, "window");
  const previousWindow = globalThis.window;
  const sandbox = { window:{} };
  sandbox.window = sandbox;
  try{
    globalThis.window = sandbox.window;
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
    return sandbox.window.SmartBooksDashboardOperations;
  }finally{
    delete require.cache[require.resolve(modulePath)];
    if(hadWindow) globalThis.window = previousWindow;
    else delete globalThis.window;
  }
}

function test(name, fn){
  try{
    fn();
    console.log(`ok - ${name}`);
  }catch(error){
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function sampleState(){
  return {
    invoices:[
      { id:"INV-1", dueDate:"2026-06-01", status:"Sent", subtotal:200, tax:10, paid:50 },
      { id:"INV-2", dueDate:"2026-06-28", status:"Sent", subtotal:100, tax:5, paid:105 }
    ],
    bills:[
      { id:"BILL-1", dueDate:"2026-06-25", amount:100, tax:5, paid:25 },
      { id:"BILL-2", dueDate:"2026-07-15", amount:300, tax:15, paid:0 }
    ],
    bankTransactions:[
      { id:"BT-1", status:"Suggested" },
      { id:"BT-2", status:"Reviewed" },
      { id:"BT-3", status:"" }
    ],
    setupTasks:[
      { id:"S-1", done:false },
      { id:"S-2", done:true },
      { id:"S-3", done:false, hidden:true }
    ]
  };
}

test("dashboard operations summary calculates attention and money buckets", () => {
  const service = loadDashboardOperationsService();
  const summary = service.operationsSummary(sampleState(), {
    today:"2026-06-23",
    totals:{ bank:1500, tax:{ net:42 } },
    cashSummary:{ operatingBalance:1800 }
  });

  assert.equal(summary.attentionCount, 5);
  assert.equal(summary.headline, "5 items need attention");
  assert.equal(summary.raw.overdueInvoices, 1);
  assert.equal(summary.raw.dueBills, 1);
  assert.equal(summary.raw.bankReview, 2);
  assert.equal(summary.raw.openSetup, 1);
  assert.equal(summary.raw.moneyIn, 160);
  assert.equal(summary.raw.moneyOut, 395);
  assert.equal(summary.raw.cashBalance, 1800);

  assert.deepEqual(summary.metrics.map(metric => metric.id), ["attention", "moneyIn", "moneyOut", "cash", "openWork"]);
  assert.equal(summary.metrics[0].level, "warn");
  assert.equal(summary.metrics[1].moneyValue, 160);
  assert.equal(summary.metrics[2].moneyValue, 395);
});

test("dashboard operations summary reports good state when no work needs attention", () => {
  const service = loadDashboardOperationsService();
  const summary = service.operationsSummary({
    invoices:[],
    bills:[],
    bankTransactions:[{ status:"Reviewed" }],
    setupTasks:[{ done:true }]
  }, {
    today:"2026-06-23",
    totals:{ bank:250, tax:{ net:0 } }
  });

  assert.equal(summary.attentionCount, 0);
  assert.equal(summary.headline, "No urgent exceptions");
  assert.equal(summary.metrics[0].level, "good");
  assert.equal(summary.metrics[3].level, "good");
  assert.equal(summary.metrics[4].level, "good");
});

test("dashboard operations date helper treats overdue and next seven days as due soon", () => {
  const service = loadDashboardOperationsService();
  assert.equal(service.dateWithin("2026-06-20", "2026-06-23", 7), true);
  assert.equal(service.dateWithin("2026-06-30", "2026-06-23", 7), true);
  assert.equal(service.dateWithin("2026-07-01", "2026-06-23", 7), false);
  assert.equal(service.dateWithin("", "2026-06-23", 7), false);
});

test("persistence summary reports local mode defaults", () => {
  const service = loadDashboardOperationsService();
  const summary = service.persistenceSummary({
    mode:"local",
    backendEndpoint:"/api/state",
    stats:{}
  });

  assert.equal(summary.mode, "local");
  assert.equal(summary.modeLabel, "This browser");
  assert.equal(summary.endpoint, "/api/state");
  assert.equal(summary.level, "neutral");
  assert.equal(summary.headline, "Saved on this device");
  assert.equal(summary.backendEnabled, false);
  assert.deepEqual(summary.actions.map(action => action.label), ["Export safety backup", "Review settings"]);
  assert.deepEqual(summary.counters, { reads:0, writes:0, errors:0 });
});

test("persistence summary reports healthy backend diagnostics", () => {
  const service = loadDashboardOperationsService();
  const summary = service.persistenceSummary({
    mode:"hybrid",
    backendEndpoint:"/api/state-test",
    stats:{
      backendReads:2,
      backendWrites:3,
      errors:0,
      lastBackendRevision:"rev_000009",
      lastBackendSavedAt:"2026-06-24T04:15:00.000Z"
    }
  });

  assert.equal(summary.mode, "hybrid");
  assert.equal(summary.modeLabel, "Local + backend migration");
  assert.equal(summary.endpoint, "/api/state-test");
  assert.equal(summary.level, "good");
  assert.equal(summary.headline, "Migration storage connected");
  assert.equal(summary.backendEnabled, true);
  assert.equal(summary.revision, "rev_000009");
  assert.equal(summary.lastBackendSavedAt, "2026-06-24T04:15:00.000Z");
  assert.deepEqual(summary.actions.map(action => action.label), ["Try saving again", "Export safety backup", "Review settings"]);
  assert.deepEqual(summary.counters, { reads:2, writes:3, errors:0 });
});

test("persistence summary surfaces backend errors for review", () => {
  const service = loadDashboardOperationsService();
  const summary = service.persistenceSummary({
    mode:"backend",
    backendEndpoint:"/api/state",
    stats:{
      backendReads:1,
      backendWrites:1,
      errors:2,
      lastError:new Error("Backend save failed with HTTP 500.")
    }
  });

  assert.equal(summary.level, "warn");
  assert.equal(summary.headline, "Company data needs attention");
  assert.equal(summary.detail, "The last storage action failed: Backend save failed with HTTP 500.");
  assert.deepEqual(summary.actions.map(action => action.label), ["Try loading again", "Try saving again", "Export safety backup", "Review settings"]);
  assert.deepEqual(summary.counters, { reads:1, writes:1, errors:2 });
});

test("persistence summary surfaces revision conflicts with reload guidance", () => {
  const service = loadDashboardOperationsService();
  const error = new Error("State revision conflict.");
  error.code = "STATE_REVISION_CONFLICT";
  const summary = service.persistenceSummary({
    mode:"backend",
    backendEndpoint:"/api/state",
    stats:{
      backendReads:1,
      backendWrites:1,
      errors:1,
      lastBackendRevision:"rev_000020",
      lastError:error
    }
  });

  assert.equal(summary.level, "warn");
  assert.equal(summary.headline, "Newer company data is available");
  assert.match(summary.detail, /reload before saving again/);
  assert.equal(summary.revision, "rev_000020");
  assert.deepEqual(summary.actions.map(action => action.label), ["Reload company data", "Export current session", "Review settings"]);
});

console.log("All dashboard operations service tests passed.");
