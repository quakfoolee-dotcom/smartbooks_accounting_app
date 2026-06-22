const {
  expect,
  expectCenteredIconControls,
  installSmartBooksChecks,
  openFreshApp,
  sidebarLabels,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

test("startup renders the dashboard shell without corrupted icons", async ({ page }) => {
  await openFreshApp(page);

  await expect(page.locator("aside.rail")).toBeVisible();
  await expect(page.locator("#menuList .nav-item").first()).toBeVisible();
  await expect(page.locator("#globalSearch")).toBeVisible();
  await expect(page.locator("#businessFeed, #businessFeedBlock").first()).toBeVisible();
  await expect(page.locator("#dashboardWidgetGrid")).toBeVisible();
  await expectCenteredIconControls(page);
  const sidebarChevronIcons = await page.locator("#menuList .nav-chevron").evaluateAll(items => items.map(item => item.dataset.icon));
  expect(sidebarChevronIcons.length, "sidebar chevrons should render").toBeGreaterThan(0);
  expect(new Set(sidebarChevronIcons), "sidebar chevrons should stay right arrows").toEqual(new Set(["arrowRight"]));

  await page.locator("#settingsBtn").click();
  await expect(page.locator("#topbarPopover")).toHaveClass(/open/);
  await expect(page.locator(".top-panel-close")).toHaveAccessibleName("Close");
  await expect(page.locator(".top-panel-close")).toHaveText("");
  await page.locator(".top-panel-close").click();
  await expect(page.locator("#topbarPopover")).not.toHaveClass(/open/);

  await page.locator("[data-open-create]").first().click();
  await expect(page.locator("#createMenu")).toHaveClass(/open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#createMenu")).not.toHaveClass(/open/);
});

test("sidebar order and rail navigation keep settings and setup near the top", async ({ page }) => {
  await openFreshApp(page);

  await expect.poll(() => sidebarLabels(page)).toEqual([
    "Get Things Done",
    "Dashboards",
    "Reports",
    "My Apps",
    "Settings",
    "Setup Checklist",
    "Banking",
    "Transactions",
    "Accounting",
    "Sales & Get Paid",
    "Customers & Leads",
    "Expenses & Pay Bills",
    "Vendors",
    "Products & Services",
    "Projects",
    "Time",
    "Payroll & HR",
    "Taxes"
  ]);

  for(const [nav, heading] of [
    ["dashboard", "Dashboard"],
    ["reports", "Reports"],
    ["apps", "My Apps"],
    ["setup", "Setup Checklist"],
    ["settings", "Settings"]
  ]) {
    await page.locator(`.rail [data-nav="${nav}"]`).click();
    await expect(page.locator(`#page-${nav}.active`)).toContainText(heading);
  }
});
