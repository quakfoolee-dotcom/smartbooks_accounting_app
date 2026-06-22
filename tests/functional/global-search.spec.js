const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

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
