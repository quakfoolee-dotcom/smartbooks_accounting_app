const {
  expect,
  installSmartBooksChecks,
  openFreshApp,
  openModal,
  state,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

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
