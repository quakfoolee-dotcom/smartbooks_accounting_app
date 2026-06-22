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

test("accounting modals reject invalid saves and clamp overpayments", async ({ page }) => {
  await openFreshApp(page);

  const startingCustomerCount = (await state(page)).customers.length;
  await openModal(page, "customer");
  await page.locator('#modalForm button[type="submit"]').click();
  await expect(page.locator("#modalBackdrop")).toHaveClass(/open/);
  expect((await state(page)).customers).toHaveLength(startingCustomerCount);
  await page.locator("#cancelModal").click();

  const beforePayment = await state(page);
  const invoice = beforePayment.invoices.find(item => item.id === "INV-1001");
  const openBalance = invoice.subtotal + invoice.tax - invoice.paid;

  await openModal(page, "payment");
  await page.locator('[name="invoiceId"]').selectOption("INV-1001");
  await page.locator('[name="amount"]').fill("999999");
  await submitModal(page);

  const afterPayment = await state(page);
  const savedPayment = afterPayment.payments[0];
  const paidInvoice = afterPayment.invoices.find(item => item.id === "INV-1001");
  expect(savedPayment.invoiceId).toBe("INV-1001");
  expect(savedPayment.amount).toBe(openBalance);
  expect(paidInvoice.paid).toBe(invoice.subtotal + invoice.tax);
  expect(paidInvoice.status).toBe("Paid");

  const billBefore = afterPayment.bills.find(item => item.id === "BILL-9001");
  const billOpen = billBefore.amount + billBefore.tax - billBefore.paid;
  await openModal(page, "payBill");
  await page.locator('[name="billId"]').selectOption("BILL-9001");
  await page.locator('[name="amount"]').fill("999999");
  await submitModal(page);

  const afterBillPayment = await state(page);
  const savedBillPayment = afterBillPayment.billPayments[0];
  const paidBill = afterBillPayment.bills.find(item => item.id === "BILL-9001");
  expect(savedBillPayment.billId).toBe("BILL-9001");
  expect(savedBillPayment.amount).toBe(billOpen);
  expect(paidBill.paid).toBe(billBefore.amount + billBefore.tax);
  expect(paidBill.status).toBe("Paid");
});
