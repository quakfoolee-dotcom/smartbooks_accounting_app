const {
  expect,
  installSmartBooksChecks,
  navigateTo,
  openFreshApp,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

test("modal accessibility supports icon-only close, escape, and focus return", async ({ page }) => {
  await openFreshApp(page);

  const invoiceButton = page.locator('.quick-actions [data-modal="invoice"]').first();
  await invoiceButton.click();
  await expect(page.locator("#modalBackdrop")).toHaveAttribute("role", "dialog");
  await expect(page.locator("#modalBackdrop")).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("#closeModal")).toHaveAccessibleName("Close");
  await expect(page.locator("#closeModal")).not.toHaveText(/Close/i);

  await page.keyboard.press("Escape");
  await expect(page.locator("#modalBackdrop")).not.toHaveClass(/open/);
  await expect(invoiceButton).toBeFocused();
});

test("keyboard can reach search, sidebar, and modal actions", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#globalSearch").focus();
  await page.keyboard.type("invoice");
  await expect(page.locator("#globalSearchResults")).toHaveClass(/open/);
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#globalSearch")).toHaveAttribute("aria-activedescendant", /v47-result-/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#globalSearchResults")).not.toHaveClass(/open/);

  await page.locator('[data-nav="settings"]').first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#page-settings.active")).toBeVisible();

  await page.locator("[data-open-create]").first().click();
  await expect(page.locator("#createMenu")).toHaveClass(/open/);
  await page.locator('#createMenu [data-modal="expense"]').click();
  await expect(page.locator("#modalTitle")).toHaveText("Record expense");
  await page.keyboard.press("Escape");
  await expect(page.locator("#modalBackdrop")).not.toHaveClass(/open/);
});

test("button sizing stays consistent across sections, tabs, and action columns", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#railCustomize").click();
  const setupShortcut = page.locator('.v29-menu-row[data-menu-id="setup"] input[name="menuItem"]');
  if(!(await setupShortcut.isChecked())) await setupShortcut.check();
  await submitModal(page);

  const pages = ["dashboard", "banking", "transactions", "customers", "sales", "expenses", "vendors", "settings", "setup"];
  const totals = { actionGroups: 0, tabGroups: 0, iconButtons: 0 };

  for(const nav of pages) {
    await navigateTo(page, nav);
    await page.evaluate(() => window.SmartBooksIcons?.fix(document));
    await page.waitForTimeout(75);

    const audit = await page.evaluate(() => {
      const failures = [];
      const visible = element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const label = element => {
        const classes = Array.from(element.classList || []).slice(0, 3).join(".");
        const text = (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 48);
        return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ""}${text ? `: ${text}` : ""}`;
      };
      const size = element => {
        const rect = element.getBoundingClientRect();
        return { width: Math.round(rect.width * 10) / 10, height: Math.round(rect.height * 10) / 10 };
      };
      const checkUniform = (elements, context, options = {}) => {
        if(elements.length < 2) return;
        const tolerance = options.tolerance || 2;
        const sizes = elements.map(size);
        const heights = sizes.map(item => item.height);
        const widths = sizes.map(item => item.width);
        if(Math.max(...heights) - Math.min(...heights) > tolerance) {
          failures.push(`${context} heights differ: ${JSON.stringify(sizes)}`);
        }
        if(options.width && Math.max(...widths) - Math.min(...widths) > tolerance) {
          failures.push(`${context} widths differ: ${JSON.stringify(sizes)}`);
        }
      };

      let actionGroups = 0;
      document.querySelectorAll(".table-card td:last-child .sb-action-grid,.table-card td:last-child .v49-actions").forEach((group, index) => {
        const buttons = Array.from(group.querySelectorAll(".btn:not(.sb-icon-only)")).filter(visible);
        if(buttons.length > 1) {
          actionGroups += 1;
          checkUniform(buttons, `action group ${index}`, { width: true });
        }
      });

      let tabGroups = 0;
      document.querySelectorAll(".tabbar,.ops-tabbar,.mini-tabs,.gtd-tabs").forEach((group, index) => {
        const tabs = Array.from(group.querySelectorAll(".tab-btn,.ops-tab,.mini-tab,.gtd-tab")).filter(visible);
        if(tabs.length > 1) {
          tabGroups += 1;
          checkUniform(tabs, `tab group ${index}`);
        }
      });

      document.querySelectorAll(".section-header > div:last-child,.v25-toolbar-actions,.sales-header-actions,.toolbar .right,.quick-actions").forEach((group, index) => {
        const buttons = Array.from(group.querySelectorAll(".btn:not(.sb-icon-only)")).filter(visible);
        checkUniform(buttons, `command group ${index}`);
      });

      const compactButtons = Array.from(document.querySelectorAll(".table-card td:last-child .btn:not(.sb-icon-only),.panel-row > .btn.square:not(.sb-icon-only),.check-row .btn.square:not(.sb-icon-only)")).filter(visible);
      compactButtons.forEach(button => {
        const rect = size(button);
        if(rect.height < 32) failures.push(`${label(button)} is too short: ${JSON.stringify(rect)}`);
      });

      let iconButtons = 0;
      Array.from(document.querySelectorAll(".sb-icon-only,.icon-btn,.hamburger,.theme-toggle-knob,.v29-menu-actions button")).filter(visible).forEach(button => {
        iconButtons += 1;
        const rect = size(button);
        if(Math.abs(rect.width - rect.height) > 2) failures.push(`${label(button)} is not square: ${JSON.stringify(rect)}`);
        if(rect.width < 32 || rect.height < 32) failures.push(`${label(button)} is too small: ${JSON.stringify(rect)}`);
      });

      return { failures, actionGroups, tabGroups, iconButtons };
    });

    expect(audit.failures, `${nav} button sizing`).toEqual([]);
    totals.actionGroups += audit.actionGroups;
    totals.tabGroups += audit.tabGroups;
    totals.iconButtons += audit.iconButtons;
  }

  expect(totals.actionGroups, "action button groups audited").toBeGreaterThan(0);
  expect(totals.tabGroups, "tab groups audited").toBeGreaterThan(0);
  expect(totals.iconButtons, "icon buttons audited").toBeGreaterThan(0);
});

test("workflow table sections avoid side-by-side table-card grids", async ({ page }) => {
  await openFreshApp(page);

  const assertNoTablePairs = async (context) => {
    const offenders = await page.evaluate(() => {
      const visible = element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      return Array.from(document.querySelectorAll(".page.active .grid.two"))
        .map(grid => {
          const tableCards = Array.from(grid.children).filter(child => child.matches?.(".table-card") && visible(child));
          const title = tableCards.map(card => card.querySelector("h3")?.textContent?.trim() || "Untitled table").join(" + ");
          return { title, count: tableCards.length };
        })
        .filter(item => item.count > 1)
        .map(item => item.title);
    });
    expect(offenders, `${context} should not render two table cards side by side`).toEqual([]);
  };

  for(const nav of ["accounting", "sales", "expenses", "time", "payroll", "reports"]) {
    await navigateTo(page, nav);
    await assertNoTablePairs(nav);
  }

  await navigateTo(page, "inventory");
  const receivingTab = page.locator('[data-action="set-inventory-tab"][data-id="receiving"]');
  if(await receivingTab.count()) {
    await receivingTab.click();
    await assertNoTablePairs("inventory receiving");
  }

  await navigateTo(page, "taxes");
  await page.locator('[data-action="set-tax-tab"][data-id="settings"]').click();
  await assertNoTablePairs("tax settings");
});
