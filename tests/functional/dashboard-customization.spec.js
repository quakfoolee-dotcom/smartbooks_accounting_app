const {
  expect,
  expectDashboardCustomizeControls,
  installSmartBooksChecks,
  openFreshApp,
  openModal,
  state,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

test("dashboard customization supports cancel, save, and restore defaults", async ({ page }) => {
  await openFreshApp(page);

  const initial = (await state(page)).settings.dashboardLayout;
  await openModal(page, "customizeDashboard");
  await expectDashboardCustomizeControls(page);
  await page.locator('.v25-layout-row[data-v25-layout-row="cashflow"] [data-id="cashflow:down"]').click();
  await page.locator("#cancelModal").click();
  expect((await state(page)).settings.dashboardLayout).toEqual(initial);

  await openModal(page, "customizeDashboard");
  await page.locator('.v25-layout-row[data-v25-layout-row="cashflow"] [data-id="cashflow:down"]').click();
  await submitModal(page);
  expect((await state(page)).settings.dashboardLayout.slice(0, 2)).toEqual(["arAging", "cashflow"]);

  await openModal(page, "customizeDashboard");
  await page.locator('[data-action="dashboard-layout-reset"]').click();
  await submitModal(page);
  expect((await state(page)).settings.dashboardLayout.slice(0, 4)).toEqual(["cashflow", "arAging", "apAging", "salesPipeline"]);
});

test("dashboard operations console summarizes attention, money, cash, and work", async ({ page }) => {
  await openFreshApp(page);

  const console = page.locator(".v25-ops-console");
  await expect(console).toBeVisible();
  await expect(console.locator(".v25-ops-lead")).toContainText("Operations console");
  await expect(console.locator(".v25-ops-item")).toHaveCount(5);

  await expect(console.locator(".v25-ops-item").nth(0)).toContainText("Attention needed");
  await expect(console.locator(".v25-ops-item").nth(1)).toContainText("Money in");
  await expect(console.locator(".v25-ops-item").nth(2)).toContainText("Money out");
  await expect(console.locator(".v25-ops-item").nth(3)).toContainText("Cash position");
  await expect(console.locator(".v25-ops-item").nth(4)).toContainText("Open work");

  const persistence = console.locator(".v30-persistence-panel");
  await expect(persistence).toBeVisible();
  await expect(persistence).toContainText("Persistence");
  await expect(persistence).toContainText("Local browser persistence");
  await expect(persistence).toContainText("Mode");
  await expect(persistence).toContainText("local");
  await expect(persistence).toContainText("Endpoint");
  await expect(persistence).toContainText("/api/state");
  await expect(persistence).toContainText("Backend reads");
  await expect(persistence).toContainText("Backend writes");
  await expect(persistence).toContainText("Errors");

  await expect(console.locator('[data-modal="payment"]')).toBeVisible();
  await expect(console.locator('[data-modal="payBill"]')).toBeVisible();
  await expect(console.locator('[data-nav="banking"]')).toBeVisible();
  await expect(console.locator('[data-action="open-setup-checklist"]')).toBeVisible();
  await console.locator('[data-action="open-setup-checklist"]').click();
  await expect(page.locator("#page-setup.active")).toContainText("Setup Checklist");
  await expect(page.locator("#page-setup.active")).toContainText("Progress");
});
