const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
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
