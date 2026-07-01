const { test, expect } = require("@playwright/test");
const { submitModal } = require("./support/smartbooks-app");

const STORE_KEY = "smartbooks_v71_state";
const TARGET_URL = process.env.SMARTBOOKS_DEPLOYMENT_URL || process.env.SMARTBOOKS_PAGES_URL || "http://127.0.0.1:3218/";
const SMOKE_COMPANY_ID = process.env.SMARTBOOKS_DEPLOYMENT_COMPANY_ID || `deployment-smoke-${Date.now()}`;
const MOJIBAKE_PATTERN = /(?:ÃƒÂ¢|ÃƒÂ¯|ÃƒÂ°Ã…Â¸|ÃƒÆ’|Ãƒâ€š|Ã¢â‚¬|Ã¢Å“|Ã°Å¸)/;

function appUrl() {
  const url = new URL(TARGET_URL);
  url.searchParams.set("sb_persistence", "local");
  url.searchParams.set("sb_company_id", SMOKE_COMPANY_ID);
  return url.toString();
}

async function savedState(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || "{}"), STORE_KEY);
}

async function openApp(page, problems, failedAssets) {
  page.on("console", message => {
    if(message.type() === "error" && !/favicon/i.test(message.text())) {
      problems.push(`console error: ${message.text()}`);
    }
  });
  page.on("pageerror", error => problems.push(`page error: ${error.message}`));
  page.on("response", response => {
    const request = response.request();
    if(["document", "script", "stylesheet"].includes(request.resourceType()) && response.status() >= 400) {
      failedAssets.push(`${response.status()} ${request.resourceType()} ${response.url()}`);
    }
  });
  await page.addInitScript(key => {
    if(!sessionStorage.getItem("smartbooks_deployment_smoke_started")) {
      localStorage.removeItem(key);
      sessionStorage.clear();
      sessionStorage.setItem("smartbooks_deployment_smoke_started", "1");
    }
  }, STORE_KEY);
  await page.goto(appUrl(), { waitUntil:"networkidle" });
  await expect(page.locator(".app")).toBeVisible();
  await expect(page.locator("#page-dashboard.active")).toBeVisible();
  await page.evaluate(() => window.SmartBooksIcons?.fix(document));
}

test("deployment app loads, persists state, and posts a money-in workflow", async ({ page }) => {
  const problems = [];
  const failedAssets = [];
  await openApp(page, problems, failedAssets);

  await expect(page.locator("#globalSearch")).toBeVisible();
  await page.locator('[data-nav="sales"]').first().click();
  await expect(page.locator("#page-sales.active")).toContainText(/Sales|Invoices|Payments/);

  await page.locator('#page-sales [data-modal="invoice"]').first().click();
  await expect(page.locator("#modalTitle")).toContainText(/invoice/i);
  await page.locator('[name="desc"]').fill("Deployment smoke service");
  await page.locator('[name="qty"]').fill("1");
  await page.locator('[name="rate"]').fill("125");
  await submitModal(page);

  const afterInvoice = await savedState(page);
  const invoice = afterInvoice.invoices[0];
  const invoiceTotal = Number(invoice.subtotal || 0) + Number(invoice.tax || 0);
  expect(invoice.items[0].desc).toBe("Deployment smoke service");
  expect(invoiceTotal).toBeGreaterThan(0);
  expect(invoice.paid || 0).toBe(0);

  await page.locator('#page-sales [data-modal="payment"]').first().click();
  await expect(page.locator("#modalTitle")).toContainText(/payment/i);
  await page.locator('[name="invoiceId"]').selectOption(invoice.id);
  await page.locator('[name="amount"]').fill(String(invoiceTotal));
  await submitModal(page);

  const afterPayment = await savedState(page);
  const paidInvoice = afterPayment.invoices.find(item => item.id === invoice.id);
  const payment = afterPayment.payments[0];
  expect(payment.invoiceId).toBe(invoice.id);
  expect(payment.amount).toBeCloseTo(invoiceTotal, 2);
  expect(paidInvoice.status).toBe("Paid");
  expect(paidInvoice.paid).toBeCloseTo(invoiceTotal, 2);

  await page.locator('[data-nav="reports"]').first().click();
  await expect(page.locator("#page-reports.active")).toContainText(/Reports|Profit|Loss/);

  await page.reload({ waitUntil:"networkidle" });
  await expect(page.locator(".app")).toBeVisible();
  const afterReload = await savedState(page);
  const reloadedInvoice = afterReload.invoices.find(item => item.id === invoice.id);
  expect(reloadedInvoice.status).toBe("Paid");
  expect(reloadedInvoice.paid).toBeCloseTo(invoiceTotal, 2);

  const text = await page.locator("body").innerText();
  expect(text, "deployment UI text should not contain mojibake").not.toMatch(MOJIBAKE_PATTERN);
  expect(failedAssets, "deployment smoke should not have failed document/script/style assets").toEqual([]);
  expect(problems, "deployment smoke should not emit browser errors").toEqual([]);
});
