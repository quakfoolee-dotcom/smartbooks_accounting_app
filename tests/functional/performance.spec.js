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
  const state = await request.get("/api/state");
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
