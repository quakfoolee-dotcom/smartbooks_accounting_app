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
