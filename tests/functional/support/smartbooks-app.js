const { test, expect } = require("@playwright/test");

const STORE_KEY = "smartbooks_v71_state";
const MOJIBAKE_PATTERN = /(?:Ã¢|Ã¯|Ã°Å¸|Ãƒ|Ã‚)/;

let pageProblems = [];

async function openFreshApp(page, options = {}) {
  const path = typeof options === "string" ? options : (options.path || "/");
  const ignoredConsole = typeof options === "string" ? [] : (options.ignoredConsole || []);
  pageProblems = [];
  page.on("console", message => {
    const text = message.text();
    const ignored = ignoredConsole.some(pattern => pattern instanceof RegExp ? pattern.test(text) : String(text).includes(String(pattern)));
    if(message.type() === "error" && !/favicon/i.test(text) && !ignored) {
      pageProblems.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", error => pageProblems.push(`page error: ${error.message}`));
  await page.addInitScript(key => {
    localStorage.removeItem(key);
    sessionStorage.clear();
  }, STORE_KEY);
  await page.goto(path);
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

function installSmartBooksChecks() {
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => window.SmartBooksIcons?.fix(document));
    await expectCleanVisibleText(page);
    await expectNoPageProblems();
  });
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

async function expectSidebarArrows(page) {
  const metrics = await page.locator("#menuList .nav-chevron").evaluateAll(arrows =>
    arrows
      .filter(arrow => {
        const box = arrow.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map(arrow => {
        const box = arrow.getBoundingClientRect();
        const icon = arrow.querySelector(".sb-icon");
        const iconBox = icon?.getBoundingClientRect();
        return {
          label: arrow.closest("[data-nav]")?.getAttribute("data-nav") || arrow.textContent.trim(),
          icon: arrow.dataset.icon,
          width: box.width,
          height: box.height,
          dx: iconBox ? Math.abs((iconBox.left + iconBox.width / 2) - (box.left + box.width / 2)) : null,
          dy: iconBox ? Math.abs((iconBox.top + iconBox.height / 2) - (box.top + box.height / 2)) : null
        };
      })
  );

  expect(metrics.length, "sidebar arrow controls should render").toBeGreaterThan(0);
  for(const metric of metrics) {
    expect(metric.icon, `${metric.label} arrow icon`).toBe("arrowRight");
    expect(metric.width, `${metric.label} arrow width`).toBeGreaterThanOrEqual(12);
    expect(metric.height, `${metric.label} arrow height`).toBeGreaterThanOrEqual(12);
    expect(metric.dx, `${metric.label} arrow horizontal center`).not.toBeNull();
    expect(metric.dy, `${metric.label} arrow vertical center`).not.toBeNull();
    expect(metric.dx, `${metric.label} arrow horizontal center`).toBeLessThanOrEqual(2);
    expect(metric.dy, `${metric.label} arrow vertical center`).toBeLessThanOrEqual(2);
  }
}

async function expectDashboardCustomizeControls(page) {
  const buttons = page.locator('#modalBody [data-action="dashboard-widget-move"]');
  const count = await buttons.count();
  expect(count, "dashboard customize arrow buttons should render").toBeGreaterThan(0);

  const metrics = await buttons.evaluateAll(items =>
    items
      .filter(item => {
        const box = item.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map(item => {
        const box = item.getBoundingClientRect();
        const icon = item.querySelector(".sb-icon");
        const iconBox = icon?.getBoundingClientRect();
        return {
          label: item.getAttribute("aria-label") || item.getAttribute("title") || item.textContent.trim(),
          width: box.width,
          height: box.height,
          dx: iconBox ? Math.abs((iconBox.left + iconBox.width / 2) - (box.left + box.width / 2)) : null,
          dy: iconBox ? Math.abs((iconBox.top + iconBox.height / 2) - (box.top + box.height / 2)) : null
        };
      })
  );

  for(const metric of metrics) {
    expect(Math.abs(metric.width - metric.height), `${metric.label} should be square`).toBeLessThanOrEqual(3);
    if(metric.dx !== null && metric.dy !== null) {
      expect(metric.dx, `${metric.label} icon horizontal center`).toBeLessThanOrEqual(3);
      expect(metric.dy, `${metric.label} icon vertical center`).toBeLessThanOrEqual(3);
    }
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

async function navigateTo(page, nav) {
  const item = page.locator(`[data-nav="${nav}"]:visible`).first();
  await expect(item, `${nav} navigation item should be visible`).toBeVisible();
  await item.click();
  await expect(page.locator(`#page-${nav}.active`), `${nav} page should be active`).toBeVisible();
}

async function sidebarLabels(page) {
  return page.locator("#menuList .nav-item .nav-label").evaluateAll(items =>
    items.map(item => item.textContent.replace(/\s+/g, " ").trim())
  );
}

module.exports = {
  expect,
  expectCenteredIconControls,
  expectDashboardCustomizeControls,
  expectSidebarArrows,
  installSmartBooksChecks,
  openFreshApp,
  openModal,
  navigateTo,
  sidebarLabels,
  state,
  submitModal,
  test
};
