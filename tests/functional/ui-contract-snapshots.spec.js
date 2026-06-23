const fs = require("node:fs");
const path = require("node:path");
const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  sidebarLabels,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

const baselinePath = path.join(__dirname, "snapshots", "ui-contract-baseline.json");

function readBaseline() {
  return JSON.parse(fs.readFileSync(baselinePath, "utf8"));
}

async function checkboxState(page, menuId) {
  const checkbox = page.locator(`.v29-menu-row[data-menu-id="${menuId}"] input[name="menuItem"]`);
  await expect(checkbox, `${menuId} checkbox should exist in Manage menu`).toHaveCount(1);
  return {
    checked: await checkbox.isChecked(),
    disabled: await checkbox.isDisabled()
  };
}

test("core UI contract matches the approved structured snapshot", async ({ page }) => {
  await openFreshApp(page);

  const contract = {
    dashboard: {
      activePage: await page.locator(".page.active").getAttribute("id"),
      defaultSidebarLabels: await sidebarLabels(page),
      hiddenDefaultMenuItems: {
        apps: await page.locator('#menuList [data-nav="apps"]:visible').count() > 0,
        settings: await page.locator('#menuList [data-nav="settings"]:visible').count() > 0,
        setup: await page.locator('#menuList [data-nav="setup"]:visible').count() > 0
      },
      quickActions: await page.locator(".quick-actions .btn:visible").evaluateAll(buttons =>
        buttons.map(button => button.textContent.replace(/\s+/g, " ").trim())
      )
    }
  };

  await page.locator("#railCustomize").click();
  await expect(page.locator("#modalTitle")).toHaveText("Manage menu");

  contract.manageMenu = {
    title: await page.locator("#modalTitle").textContent(),
    optionalShortcuts: {
      apps: await checkboxState(page, "apps"),
      settings: await checkboxState(page, "settings"),
      setup: await checkboxState(page, "setup")
    },
    dashboard: await checkboxState(page, "dashboard")
  };

  expect(contract).toEqual(readBaseline());
});
