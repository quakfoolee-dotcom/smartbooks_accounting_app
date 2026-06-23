const {
  expect,
  expectCenteredIconControls,
  expectSidebarArrows,
  installSmartBooksChecks,
  openFreshApp,
  sidebarLabels,
  submitModal,
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
  await expectSidebarArrows(page);

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

test("sidebar defaults hide optional admin shortcuts until managed", async ({ page }) => {
  await openFreshApp(page);

  await expect.poll(() => sidebarLabels(page)).toEqual([
    "Get Things Done",
    "Dashboards",
    "Reports",
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

  for(const nav of ["apps", "settings", "setup"]) {
    await expect(page.locator(`#menuList [data-nav="${nav}"]`)).toHaveCount(0);
  }

  await page.locator("#railCustomize").click();
  await expect(page.locator("#modalTitle")).toHaveText("Manage menu");
  for(const nav of ["apps", "settings", "setup"]) {
    const checkbox = page.locator(`.v29-menu-row[data-menu-id="${nav}"] input[name="menuItem"]`);
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toBeEnabled();
    await checkbox.check();
  }
  await submitModal(page);

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
    ["apps", "My Apps"],
    ["setup", "Setup Checklist"],
    ["settings", "Settings"]
  ]) {
    await page.locator(`#menuList [data-nav="${nav}"]`).click();
    await expect(page.locator(`#page-${nav}.active`)).toContainText(heading);
  }
});
