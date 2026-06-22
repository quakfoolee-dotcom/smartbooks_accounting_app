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
