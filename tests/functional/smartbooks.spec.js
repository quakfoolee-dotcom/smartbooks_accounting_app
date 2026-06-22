const { test, expect } = require("@playwright/test");

const STORE_KEY = "smartbooks_v71_state";
const MOJIBAKE_PATTERN = /(?:â|ï|ðŸ|Ã|Â)/;

let pageProblems = [];

async function openFreshApp(page) {
  pageProblems = [];
  page.on("console", message => {
    if(message.type() === "error" && !/favicon/i.test(message.text())) {
      pageProblems.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", error => pageProblems.push(`page error: ${error.message}`));
  await page.addInitScript(key => {
    localStorage.removeItem(key);
    sessionStorage.clear();
  }, STORE_KEY);
  await page.goto("/");
  await expect(page.locator(".app")).toBeVisible();
  await expect(page.locator("#page-dashboard.active")).toBeVisible();
  await page.evaluate(() => window.SmartBooksIcons?.fix(document));
  await page.waitForTimeout(150);
}

async function state(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || "{}"), STORE_KEY);
}

async function expectCleanVisibleText(page) {
  const text = await page.locator("body").innerText();
  expect(text, "visible UI text should not contain mojibake").not.toMatch(MOJIBAKE_PATTERN);
}

async function expectNoPageProblems() {
  expect(pageProblems, "browser console/page errors").toEqual([]);
}

async function expectCenteredIconControls(page) {
  const metrics = await page.locator(".top-actions .icon-btn, .hamburger, .theme-toggle-knob").evaluateAll(controls =>
    controls
      .filter(control => {
        const box = control.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map(control => {
        const box = control.getBoundingClientRect();
        const icon = control.querySelector(".sb-icon");
        const iconBox = icon?.getBoundingClientRect();
        return {
          label: control.id || control.getAttribute("aria-label") || control.className || control.textContent.trim(),
          width: box.width,
          height: box.height,
          dx: iconBox ? Math.abs((iconBox.left + iconBox.width / 2) - (box.left + box.width / 2)) : null,
          dy: iconBox ? Math.abs((iconBox.top + iconBox.height / 2) - (box.top + box.height / 2)) : null
        };
      })
  );

  expect(metrics.length, "topbar icon controls should render").toBeGreaterThan(0);
  for(const metric of metrics) {
    expect(metric.width, `${metric.label} width`).toBeGreaterThanOrEqual(24);
    expect(metric.height, `${metric.label} height`).toBeGreaterThanOrEqual(24);
    expect(Math.abs(metric.width - metric.height), `${metric.label} should be square`).toBeLessThanOrEqual(2);
    expect(metric.dx, `${metric.label} icon horizontal center`).not.toBeNull();
    expect(metric.dy, `${metric.label} icon vertical center`).not.toBeNull();
    expect(metric.dx, `${metric.label} icon horizontal center`).toBeLessThanOrEqual(2);
    expect(metric.dy, `${metric.label} icon vertical center`).toBeLessThanOrEqual(2);
  }
}

async function openModal(page, modalName) {
  await page.evaluate(modal => window.openModal(modal), modalName);
  await expect(page.locator("#modalBackdrop")).toHaveClass(/open/);
  await page.evaluate(() => window.SmartBooksIcons?.fix(document));
  await expect(page.locator("#modalForm button[type='submit']")).toBeEnabled();
  await page.waitForTimeout(75);
}

async function submitModal(page) {
  const modalTitle = await page.locator("#modalTitle").textContent();
  const submit = page.locator("#modalForm button[type='submit']");
  await expect(submit, `Save button should be ready for ${modalTitle}`).toBeVisible();
  await expect(submit, `Save button should be enabled for ${modalTitle}`).toBeEnabled();
  await submit.click();
  try {
    await expect(page.locator("#modalBackdrop"), `${modalTitle} should close after saving`).not.toHaveClass(/open/);
  } catch (error) {
    const snapshot = await page.locator("#modalBackdrop").evaluate(backdrop => {
      const form = backdrop.querySelector("#modalForm");
      return {
        title: backdrop.querySelector("#modalTitle")?.textContent?.trim(),
        activeElement: document.activeElement?.outerHTML?.slice(0, 240),
        invalidFields: Array.from(form?.elements || [])
          .filter(field => field.willValidate && !field.checkValidity())
          .map(field => ({
            name: field.name,
            type: field.type,
            value: field.value,
            validationMessage: field.validationMessage
          })),
        toast: document.querySelector("#toast")?.textContent?.trim()
      };
    });
    throw new Error(`Modal did not close after save: ${JSON.stringify(snapshot)}\n${error.message}`);
  }
}

async function sidebarLabels(page) {
  return page.locator("#menuList .nav-item .nav-label").evaluateAll(items =>
    items.map(item => item.textContent.replace(/\s+/g, " ").trim())
  );
}

test.afterEach(async ({ page }) => {
  await page.evaluate(() => window.SmartBooksIcons?.fix(document));
  await expectCleanVisibleText(page);
  await expectNoPageProblems();
});

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

test("customize menu saves bookmarks and cancels unsaved changes", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#railCustomize").click();
  await expect(page.locator("#modalTitle")).toHaveText("Manage menu");
  await page.locator('.v29-menu-row[data-menu-id="banking"] [data-v29-action="bookmark-one"]').click();
  await page.locator("#cancelModal").click();
  await expect(page.locator("#modalBackdrop")).not.toHaveClass(/open/);
  await expect(page.locator(".bookmark-row", { hasText: "Banking" })).toHaveCount(0);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="banking"] [data-v29-action="bookmark-one"]').click();
  await submitModal(page);
  await expect(page.locator(".bookmark-row", { hasText: "Banking" })).toHaveCount(1);

  await page.locator("#railCustomize").click();
  await page.locator('[data-v29-action="add-checked-bookmarks"]').click();
  await submitModal(page);
  const saved = await state(page);
  expect(saved.settings.bookmarks).toContain("reports-favorites");
});

test("customize menu can hide, restore, and reorder modules", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="banking"] input[name="menuItem"]').uncheck();
  await submitModal(page);
  await expect(page.locator('#menuList [data-nav="banking"]')).toHaveCount(0);

  await page.locator("#railCustomize").click();
  await page.locator('[data-v29-action="reset-menu"]').click();
  await submitModal(page);
  await expect(page.locator('#menuList [data-nav="banking"]')).toHaveCount(1);

  await page.locator("#railCustomize").click();
  await page.locator('.v29-menu-row[data-menu-id="taxes"] [data-dir="top"]').click();
  await submitModal(page);
  await expect.poll(() => sidebarLabels(page).then(labels => labels[0])).toBe("Taxes");
});

test("dashboard customization supports cancel, save, and restore defaults", async ({ page }) => {
  await openFreshApp(page);

  const initial = (await state(page)).settings.dashboardLayout;
  await openModal(page, "customizeDashboard");
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

test("global search opens records, actions, fallback suggestions, and keyboard results", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#globalSearch").fill("invoice: INV-1001");
  await expect(page.locator("#globalSearchResults")).toHaveClass(/open/);
  await expect(page.locator("#globalSearchResults")).toContainText("INV-1001");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("#page-sales.active")).toBeVisible();
  if((await page.locator("#modalBackdrop").getAttribute("class")).includes("open")) {
    await page.locator("#cancelModal").click();
  }

  await page.locator("#globalSearch").fill("zxqvjjkwpz");
  await expect(page.locator("#globalSearchResults")).toContainText("No result");
  await page.locator('[data-v47-fallback="create-invoice"]').click();
  await expect(page.locator("#modalTitle")).toContainText(/Invoice|invoice/);
  await page.locator("#cancelModal").click();
});

test("core accounting workflows create and post records", async ({ page }) => {
  await openFreshApp(page);

  await openModal(page, "invoice");
  await page.locator('[name="desc"]').fill("Functional test service");
  await page.locator('[name="qty"]').fill("2");
  await page.locator('[name="rate"]').fill("150");
  await submitModal(page);
  expect((await state(page)).invoices[0].items[0].desc).toBe("Functional test service");

  await openModal(page, "payment");
  await submitModal(page);
  expect((await state(page)).payments[0].invoiceId).toBe((await state(page)).invoices[0].id);

  await openModal(page, "expense");
  await page.locator('[name="memo"]').fill("Functional test expense");
  await submitModal(page);
  expect((await state(page)).expenses[0].memo).toBe("Functional test expense");

  await openModal(page, "bill");
  await submitModal(page);
  const billId = (await state(page)).bills[0].id;
  await openModal(page, "payBill");
  await submitModal(page);
  expect((await state(page)).billPayments[0].billId).toBe(billId);

  await page.locator('[data-nav="banking"]').first().click();
  await page.locator('[data-action="review-banktx"][data-id="BFT-1002"]').first().click();
  expect((await state(page)).bankTransactions.find(tx => tx.id === "BFT-1002").status).toBe("Reviewed");

  await page.locator('[data-nav="reports"]').first().click();
  await expect(page.locator("#page-reports.active")).toContainText(/Profit|Loss|Report|Reports/);
});

test("utilities export data and reset company data", async ({ page }) => {
  await openFreshApp(page);

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportData").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^smartbooks.*\.json$/);

  await openModal(page, "invoice");
  await page.locator('[name="desc"]').fill("Temporary reset invoice");
  await submitModal(page);
  expect((await state(page)).invoices).toHaveLength(5);

  await page.locator("#resetDemo").scrollIntoViewIfNeeded();
  page.once("dialog", dialog => dialog.accept());
  await page.locator("#resetDemo").click();
  await expect.poll(() => state(page).then(saved => saved.invoices.length)).toBe(4);
});
