const { test, expect } = require("@playwright/test");

const STORE_KEY = "smartbooks_v71_state";
const TARGET_URL = process.env.SMARTBOOKS_PAGES_URL || "https://quakfoolee-dotcom.github.io/smartbooks_accounting_app/";
const MOJIBAKE_PATTERN = /(?:Ã¢|Ã¯|Ã°Å¸|Ãƒ|Ã‚|â€|âœ|ðŸ)/;

test("deployed GitHub Pages app loads cleanly", async ({ page }) => {
  const problems = [];
  const failedAssets = [];

  page.on("console", message => {
    if(message.type() === "error" && !/favicon/i.test(message.text())) {
      problems.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", error => problems.push(`page error: ${error.message}`));
  page.on("response", response => {
    const request = response.request();
    if(["script", "stylesheet", "document"].includes(request.resourceType()) && response.status() >= 400) {
      failedAssets.push(`${response.status()} ${request.resourceType()} ${response.url()}`);
    }
  });

  await page.addInitScript(key => {
    localStorage.removeItem(key);
    sessionStorage.clear();
  }, STORE_KEY);

  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await expect(page.locator(".app")).toBeVisible();
  await expect(page.locator("#page-dashboard.active")).toBeVisible();
  await expect(page.locator("#globalSearch")).toBeVisible();
  await expect(page.locator("#dashboardWidgetGrid")).toBeVisible();

  await page.evaluate(() => window.SmartBooksIcons?.fix(document));
  await page.waitForTimeout(200);

  const text = await page.locator("body").innerText();
  expect(text, "deployed UI text should not contain mojibake").not.toMatch(MOJIBAKE_PATTERN);

  const sidebarChevronIcons = await page.locator("#menuList .nav-chevron").evaluateAll(items => items.map(item => item.dataset.icon));
  expect(sidebarChevronIcons.length, "sidebar chevrons should render").toBeGreaterThan(0);
  expect(new Set(sidebarChevronIcons), "sidebar chevrons should stay right arrows").toEqual(new Set(["arrowRight"]));

  await page.locator("#railCustomize").click();
  await expect(page.locator("#modalTitle")).toHaveText("Manage menu");
  await page.locator("#cancelModal").click();

  expect(failedAssets, "deployed page should not have failed document/script/style assets").toEqual([]);
  expect(problems, "deployed page should not emit browser errors").toEqual([]);
});
