const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

const STARTUP_BUDGET_MS = Number(process.env.SMARTBOOKS_STARTUP_BUDGET_MS || 12000);
const BACKEND_STARTUP_BUDGET_MS = Number(process.env.SMARTBOOKS_BACKEND_STARTUP_BUDGET_MS || 15000);
const BACKEND_SAVE_BUDGET_MS = Number(process.env.SMARTBOOKS_BACKEND_SAVE_BUDGET_MS || 5000);
const API_READ_BUDGET_MS = Number(process.env.SMARTBOOKS_API_READ_BUDGET_MS || 3000);
const LARGE_STARTUP_BUDGET_MS = Number(process.env.SMARTBOOKS_LARGE_STARTUP_BUDGET_MS || 35000);
const LARGE_BACKEND_STARTUP_BUDGET_MS = Number(process.env.SMARTBOOKS_LARGE_BACKEND_STARTUP_BUDGET_MS || 30000);
const LARGE_BACKEND_SAVE_BUDGET_MS = Number(process.env.SMARTBOOKS_LARGE_BACKEND_SAVE_BUDGET_MS || 12000);
const LARGE_NAVIGATION_BUDGET_MS = Number(process.env.SMARTBOOKS_LARGE_NAVIGATION_BUDGET_MS || 8000);

function now(){
  return Date.now();
}

function assertWithinBudget(label, actualMs, budgetMs){
  expect(
    actualMs,
    `${label} took ${actualMs}ms, budget is ${budgetMs}ms`
  ).toBeLessThanOrEqual(budgetMs);
}

async function navigationTiming(page){
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    if(!nav) return null;
    return {
      domContentLoadedMs:Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      loadMs:Math.round(nav.loadEventEnd - nav.startTime),
      transferMs:Math.round(nav.responseEnd - nav.requestStart)
    };
  });
}

async function attachMetrics(testInfo, name, metrics){
  await testInfo.attach(name, {
    body:JSON.stringify(metrics, null, 2),
    contentType:"application/json"
  });
}

function dateInMay(day){
  return `2026-05-${String(((day - 1) % 28) + 1).padStart(2, "0")}`;
}

function dueDate(day){
  return `2026-06-${String(((day - 1) % 28) + 1).padStart(2, "0")}`;
}

function largeStateFixture(){
  const customers = Array.from({ length:120 }, (_, index) => {
    const n = index + 1;
    return {
      id:`C-L${String(n).padStart(4, "0")}`,
      name:`Large Customer ${n}`,
      company:`Large Customer ${n} Co`,
      email:`customer${n}@example.com`,
      phone:`555-20${String(n).padStart(4, "0")}`,
      type:n % 5 === 0 ? "Government" : "Commercial"
    };
  });
  const vendors = Array.from({ length:60 }, (_, index) => {
    const n = index + 1;
    return {
      id:`V-L${String(n).padStart(4, "0")}`,
      name:`Large Vendor ${n}`,
      email:`vendor${n}@example.com`,
      phone:`555-30${String(n).padStart(4, "0")}`,
      category:n % 3 === 0 ? "Utilities" : "Operations"
    };
  });
  const invoices = Array.from({ length:320 }, (_, index) => {
    const n = index + 1;
    const subtotal = 120 + (n % 17) * 35;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;
    const paid = n % 4 === 0 ? total : (n % 5 === 0 ? Math.round(total * 0.35 * 100) / 100 : 0);
    return {
      id:`INV-L${String(n).padStart(5, "0")}`,
      customerId:customers[index % customers.length].id,
      date:dateInMay(n),
      dueDate:dueDate(n),
      status:paid >= total ? "Paid" : (n % 7 === 0 ? "Overdue" : "Sent"),
      subtotal,
      tax,
      paid,
      incomeAccountId:n % 6 === 0 ? "4020" : "4000",
      items:[{ desc:`Large service line ${n}`, qty:(n % 5) + 1, rate:subtotal / ((n % 5) + 1) }]
    };
  });
  const payments = invoices
    .filter(invoice => invoice.paid > 0)
    .map((invoice, index) => ({
      id:`PMT-L${String(index + 1).padStart(5, "0")}`,
      invoiceId:invoice.id,
      customerId:invoice.customerId,
      date:dateInMay(index + 3),
      accountId:index % 3 === 0 ? "1400" : "BA-1",
      amount:invoice.paid,
      memo:`Payment for ${invoice.id}`
    }));
  const expenses = Array.from({ length:260 }, (_, index) => {
    const n = index + 1;
    const amount = 35 + (n % 23) * 18;
    return {
      id:`EXP-L${String(n).padStart(5, "0")}`,
      vendorId:vendors[index % vendors.length].id,
      date:dateInMay(n),
      expenseAccountId:n % 4 === 0 ? "6100" : "6000",
      account:n % 4 === 0 ? "Utilities Expense" : "Office Expenses",
      memo:`Large expense ${n}`,
      amount,
      tax:Math.round(amount * 0.05 * 100) / 100,
      paymentMethod:n % 2 === 0 ? "Credit card" : "Bank transfer",
      bankAccountId:n % 2 === 0 ? "BA-2" : "BA-1"
    };
  });
  const bills = Array.from({ length:180 }, (_, index) => {
    const n = index + 1;
    const amount = 80 + (n % 19) * 24;
    const tax = Math.round(amount * 0.05 * 100) / 100;
    const total = amount + tax;
    const paid = n % 5 === 0 ? total : 0;
    return {
      id:`BILL-L${String(n).padStart(5, "0")}`,
      vendorId:vendors[index % vendors.length].id,
      date:dateInMay(n),
      dueDate:dueDate(n),
      status:paid ? "Paid" : (n % 6 === 0 ? "Overdue" : "Open"),
      expenseAccountId:n % 4 === 0 ? "6100" : "6000",
      amount,
      tax,
      paid
    };
  });
  const billPayments = bills
    .filter(bill => bill.paid > 0)
    .map((bill, index) => ({
      id:`BP-L${String(index + 1).padStart(5, "0")}`,
      billId:bill.id,
      vendorId:bill.vendorId,
      date:dateInMay(index + 8),
      accountId:"BA-1",
      amount:bill.paid,
      memo:`Payment for ${bill.id}`
    }));
  const bankTransactions = Array.from({ length:300 }, (_, index) => {
    const n = index + 1;
    const isDeposit = n % 3 === 0;
    return {
      id:`BFT-L${String(n).padStart(5, "0")}`,
      date:dateInMay(n),
      description:isDeposit ? `Large customer deposit ${n}` : `Large vendor withdrawal ${n}`,
      amount:isDeposit ? 150 + (n % 11) * 50 : -(45 + (n % 17) * 20),
      bankAccountId:n % 4 === 0 ? "BA-2" : "BA-1",
      status:n % 5 === 0 ? "Reviewed" : (n % 4 === 0 ? "Matched" : "Suggested"),
      suggestedAccountId:isDeposit ? "1200" : "6000",
      matchType:isDeposit ? "Invoice payment" : "Expense category",
      linkedId:null,
      posted:n % 5 === 0,
      cleared:n % 6 === 0,
      note:`Large bank feed item ${n}`
    };
  });

  return {
    company:{ name:"Large Performance Co", province:"BC", fiscalYear:"2026", salesTax:5, accountingMethod:"Accrual" },
    settings:{
      visibleModules:["dashboard","banking","transactions","accounting","sales","customers","expenses","vendors","reports","inventory","settings"],
      dashboardWidgets:["cashflow","invoices","expenses","bank","feed","pl","recent","setup"]
    },
    customers,
    vendors,
    invoices,
    payments,
    expenses,
    bills,
    billPayments,
    bankTransactions
  };
}

function fixtureCounts(fixture){
  return Object.fromEntries(["customers", "vendors", "invoices", "payments", "expenses", "bills", "billPayments", "bankTransactions"].map(key => [key, fixture[key]?.length || 0]));
}

async function timedStep(label, action){
  const started = now();
  await action();
  return { label, ms:now() - started };
}

test("local startup stays within baseline performance budget", async ({ page }, testInfo) => {
  const started = now();
  await openFreshApp(page, "/");
  const readyMs = now() - started;
  const metrics = {
    mode:"local",
    readyMs,
    navigation:await navigationTiming(page),
    budgetMs:STARTUP_BUDGET_MS
  };

  await attachMetrics(testInfo, "local-startup-performance.json", metrics);
  assertWithinBudget("local startup", readyMs, STARTUP_BUDGET_MS);
});

test("backend startup and save stay within baseline performance budgets", async ({ page }, testInfo) => {
  const writes = [];
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({
          ok:true,
          data:{
            schemaVersion:1,
            savedAt:"2026-06-24T06:00:00.000Z",
            source:"backend",
            companyId:"demo-company",
            state:{ company:{ name:"Performance Backend" }, settings:{} }
          }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes.push(JSON.parse(request.postData() || "{}"));
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T06:01:00.000Z" })
      });
      return;
    }
    await route.continue();
  });

  const startupStarted = now();
  await openFreshApp(page, "/?sb_persistence=backend");
  const readyMs = now() - startupStarted;
  await expect(page.locator("#topCompanyName")).toContainText("Performance Backend");

  const saveStarted = now();
  await page.locator('[data-action="toggle-privacy"]').click();
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.flushSaves?.());
  await expect.poll(() => writes.length, { message:"backend save should complete" }).toBeGreaterThan(0);
  const saveMs = now() - saveStarted;

  const metrics = {
    mode:"backend",
    readyMs,
    saveMs,
    writes:writes.length,
    navigation:await navigationTiming(page),
    budgets:{
      startupMs:BACKEND_STARTUP_BUDGET_MS,
      saveMs:BACKEND_SAVE_BUDGET_MS
    }
  };

  await attachMetrics(testInfo, "backend-persistence-performance.json", metrics);
  assertWithinBudget("backend startup", readyMs, BACKEND_STARTUP_BUDGET_MS);
  assertWithinBudget("backend save", saveMs, BACKEND_SAVE_BUDGET_MS);
});

test("backend read endpoints stay within baseline API budget", async ({ request }, testInfo) => {
  const healthStarted = now();
  const health = await request.get("/api/health");
  const healthMs = now() - healthStarted;
  expect(health.ok()).toBe(true);

  const stateStarted = now();
  const state = await request.get("/api/state", {
    headers:{
      "X-SmartBooks-Company-Id":"demo-company",
      "X-SmartBooks-Request-Id":"performance-api-read"
    }
  });
  const stateMs = now() - stateStarted;
  expect(state.ok()).toBe(true);
  const body = await state.json();
  expect(body.ok).toBe(true);

  const metrics = {
    healthMs,
    stateReadMs:stateMs,
    budgetMs:API_READ_BUDGET_MS
  };

  await attachMetrics(testInfo, "backend-api-read-performance.json", metrics);
  assertWithinBudget("backend health API read", healthMs, API_READ_BUDGET_MS);
  assertWithinBudget("backend state API read", stateMs, API_READ_BUDGET_MS);
});

test("large-state fixture stays within startup, navigation, and backend save budgets", async ({ page }, testInfo) => {
  test.setTimeout(180000);
  const fixture = largeStateFixture();
  const localStartupStarted = now();
  await openFreshApp(page, { path:"/", localState:fixture });
  const localStartupMs = now() - localStartupStarted;
  await expect(page.locator("#topCompanyName")).toContainText("Large Performance Co");

  const navigation = [];
  navigation.push(await timedStep("sales page", async () => {
    await page.locator('[data-nav="sales"]').first().click();
    await expect(page.locator("#page-sales.active")).toContainText("Sales");
  }));
  navigation.push(await timedStep("expenses page", async () => {
    await page.locator('[data-nav="expenses"]').first().click();
    await expect(page.locator("#page-expenses.active")).toContainText("Expenses");
  }));
  navigation.push(await timedStep("reports page", async () => {
    await page.locator('[data-nav="reports"]').first().click();
    await expect(page.locator("#page-reports.active")).toContainText(/Reports|Profit|Loss/);
  }));
  navigation.push(await timedStep("profit and loss report", async () => {
    await page.locator('[data-action="open-report"][data-id="profit-loss"]').first().click();
    await expect(page.locator("#reportDetailArea")).toContainText("Profit and Loss");
    await page.locator('[data-action="run-report"][data-id="profit-loss"]').click();
    await expect(page.locator("#reportDetailArea")).toContainText(/Net income/i);
  }));

  const writes = [];
  await page.route("**/api/state", async route => {
    const request = route.request();
    if(request.method() === "GET") {
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({
          ok:true,
          data:{
            schemaVersion:1,
            savedAt:"2026-06-24T06:30:00.000Z",
            source:"backend",
            companyId:"demo-company",
            revision:"rev_large_0001",
            state:fixture
          }
        })
      });
      return;
    }
    if(request.method() === "PUT") {
      writes.push(JSON.parse(request.postData() || "{}"));
      await route.fulfill({
        status:200,
        contentType:"application/json",
        body:JSON.stringify({ ok:true, savedAt:"2026-06-24T06:31:00.000Z", revision:"rev_large_0002" })
      });
      return;
    }
    await route.continue();
  });

  const backendStartupStarted = now();
  await openFreshApp(page, "/?sb_persistence=backend");
  const backendStartupMs = now() - backendStartupStarted;
  await expect(page.locator("#topCompanyName")).toContainText("Large Performance Co");

  const backendSaveStarted = now();
  await page.evaluate(() => window.SmartBooksRuntimePersistence?.saveStateAsync?.());
  await expect.poll(() => writes.length, { message:"large backend save should complete" }).toBeGreaterThan(0);
  const backendSaveMs = now() - backendSaveStarted;

  const metrics = {
    fixture:"large-state",
    counts:fixtureCounts(fixture),
    localStartupMs,
    backendStartupMs,
    backendSaveMs,
    navigation,
    navigationMaxMs:Math.max(...navigation.map(item => item.ms)),
    writes:writes.length,
    budgets:{
      localStartupMs:LARGE_STARTUP_BUDGET_MS,
      backendStartupMs:LARGE_BACKEND_STARTUP_BUDGET_MS,
      backendSaveMs:LARGE_BACKEND_SAVE_BUDGET_MS,
      navigationMs:LARGE_NAVIGATION_BUDGET_MS
    },
    navigationTiming:await navigationTiming(page)
  };

  await attachMetrics(testInfo, "large-state-performance.json", metrics);
  assertWithinBudget("large local startup", localStartupMs, LARGE_STARTUP_BUDGET_MS);
  assertWithinBudget("large backend startup", backendStartupMs, LARGE_BACKEND_STARTUP_BUDGET_MS);
  assertWithinBudget("large backend save", backendSaveMs, LARGE_BACKEND_SAVE_BUDGET_MS);
  for(const step of navigation) {
    assertWithinBudget(`large-state navigation: ${step.label}`, step.ms, LARGE_NAVIGATION_BUDGET_MS);
  }
});
