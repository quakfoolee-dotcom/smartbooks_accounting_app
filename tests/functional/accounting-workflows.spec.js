const {
  expect,
  installSmartBooksChecks,
  navigateTo,
  openFreshApp,
  openModal,
  state,
  submitModal,
  test
} = require("./support/smartbooks-app");

installSmartBooksChecks();

async function accountingTotals(page) {
  const appState = await state(page);
  return page.evaluate(savedState => window.SmartBooksAccounting.totals(savedState), appState);
}

async function normalBalance(page, accountId) {
  const appState = await state(page);
  return page.evaluate(({ savedState, accountId: ledgerAccountId }) =>
    window.SmartBooksAccounting.normalBalance(savedState, ledgerAccountId), { savedState:appState, accountId });
}

async function ledgerRowsFor(page, source, sourceId) {
  const appState = await state(page);
  return page.evaluate(({ savedState, sourceName, id }) =>
    window.SmartBooksAccounting.ledger(savedState)
      .filter(row => row.source === sourceName && row.sourceId === id)
      .map(row => [row.accountId, row.debit, row.credit]), { savedState:appState, sourceName:source, id:sourceId });
}

function money(value) {
  return new Intl.NumberFormat("en-CA", { style:"currency", currency:"CAD" }).format(Number(value) || 0);
}

async function reportSummary(page) {
  const appState = await state(page);
  return page.evaluate(savedState => {
    const income = window.SmartBooksAccounting.sumTypes(savedState, ["Income"]);
    const expenses = window.SmartBooksAccounting.sumTypes(savedState, ["Expense", "COGS"]);
    return { income, expenses, net:income - expenses };
  }, appState);
}

async function openReportDetail(page, reportId) {
  await page.locator(`[data-action="open-report"][data-id="${reportId}"]`).first().click();
  const detail = page.locator("#reportDetailArea");
  await expect(detail).toBeVisible();
  await page.locator("#reportStartDate").fill("2026-01-01");
  await page.locator("#reportEndDate").fill("2026-12-31");
  await page.locator(`[data-action="run-report"][data-id="${reportId}"]`).click();
  return detail;
}

async function expectAgingBucketColumns(detail) {
  for(const heading of ["Current", "1-30", "31-60", "61+"]) {
    await expect(detail).toContainText(heading);
  }
}

async function expectTableRowByFirstCell(table, firstCell, expectedCells) {
  await expect(table, `${firstCell} table should be visible`).toBeVisible();
  await expect.poll(async () => table.locator("tbody tr").evaluateAll((rows, target) => {
    const normalizedRows = rows.map(row =>
      Array.from(row.cells, cell => (cell.textContent || "").replace(/\s+/g, " ").trim())
    );
    return normalizedRows.find(cells => cells[0] === target) || [];
  }, firstCell), { message:`Table should render row for ${firstCell}` }).toEqual(expect.arrayContaining(expectedCells));
}

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

test("business workflow totals update for invoices, payments, bills, and bank review", async ({ page }) => {
  await openFreshApp(page);

  const initial = await accountingTotals(page);

  await openModal(page, "invoice");
  await page.locator('[name="desc"]').fill("Business logic invoice");
  await page.locator('[name="qty"]').fill("2");
  await page.locator('[name="rate"]').fill("100");
  await submitModal(page);

  const afterInvoiceState = await state(page);
  const invoice = afterInvoiceState.invoices[0];
  const invoiceTotal = invoice.subtotal + invoice.tax;
  expect(invoice.subtotal).toBeGreaterThan(0);
  expect(invoice.paid).toBe(0);

  const afterInvoiceTotals = await accountingTotals(page);
  expect(afterInvoiceTotals.ar).toBeCloseTo(initial.ar + invoiceTotal, 2);
  expect(afterInvoiceTotals.invoiceRevenue).toBeCloseTo(initial.invoiceRevenue + invoice.subtotal, 2);
  expect(afterInvoiceTotals.tax.collected).toBeCloseTo(initial.tax.collected + invoice.tax, 2);

  await openModal(page, "payment");
  await page.locator('[name="invoiceId"]').selectOption(invoice.id);
  await page.locator('[name="amount"]').fill("50");
  await submitModal(page);

  const afterPartialState = await state(page);
  const partiallyPaidInvoice = afterPartialState.invoices.find(item => item.id === invoice.id);
  expect(partiallyPaidInvoice.paid).toBe(50);
  expect(partiallyPaidInvoice.status).not.toBe("Paid");
  expect(afterPartialState.payments[0].amount).toBe(50);

  const afterPartialTotals = await accountingTotals(page);
  expect(afterPartialTotals.ar).toBeCloseTo(initial.ar + invoiceTotal - 50, 2);

  await openModal(page, "payment");
  await page.locator('[name="invoiceId"]').selectOption(invoice.id);
  await page.locator('[name="amount"]').fill("9999");
  await submitModal(page);

  const afterFinalPaymentState = await state(page);
  const paidInvoice = afterFinalPaymentState.invoices.find(item => item.id === invoice.id);
  expect(paidInvoice.paid).toBe(invoiceTotal);
  expect(paidInvoice.status).toBe("Paid");
  expect(afterFinalPaymentState.payments[0].amount).toBe(invoiceTotal - 50);

  const afterFinalPaymentTotals = await accountingTotals(page);
  expect(afterFinalPaymentTotals.ar).toBeCloseTo(initial.ar, 2);

  await openModal(page, "bill");
  await page.locator('[name="amount"]').fill("100");
  await submitModal(page);

  const afterBillState = await state(page);
  const bill = afterBillState.bills[0];
  const billTotal = bill.amount + bill.tax;
  const afterBillTotals = await accountingTotals(page);
  expect(bill.amount).toBeGreaterThan(0);
  expect(afterBillTotals.ap).toBeCloseTo(initial.ap + billTotal, 2);
  expect(afterBillTotals.tax.itc).toBeCloseTo(afterFinalPaymentTotals.tax.itc + bill.tax, 2);

  await openModal(page, "payBill");
  await page.locator('[name="billId"]').selectOption(bill.id);
  await page.locator('[name="amount"]').fill("25");
  await submitModal(page);

  const afterPartialBillState = await state(page);
  const partialBill = afterPartialBillState.bills.find(item => item.id === bill.id);
  expect(partialBill.paid).toBe(25);
  expect(partialBill.status).not.toBe("Paid");
  expect(afterPartialBillState.billPayments[0].amount).toBe(25);

  const afterPartialBillTotals = await accountingTotals(page);
  expect(afterPartialBillTotals.ap).toBeCloseTo(initial.ap + billTotal - 25, 2);

  await openModal(page, "payBill");
  await page.locator('[name="billId"]').selectOption(bill.id);
  await page.locator('[name="amount"]').fill("9999");
  await submitModal(page);

  const afterFinalBillState = await state(page);
  const paidBill = afterFinalBillState.bills.find(item => item.id === bill.id);
  expect(paidBill.paid).toBe(billTotal);
  expect(paidBill.status).toBe("Paid");
  expect(afterFinalBillState.billPayments[0].amount).toBe(billTotal - 25);

  const afterFinalBillTotals = await accountingTotals(page);
  expect(afterFinalBillTotals.ap).toBeCloseTo(initial.ap, 2);

  const reviewTx = afterFinalBillState.bankTransactions.find(tx => tx.id === "BFT-1002");
  await page.locator('[data-nav="banking"]').first().click();
  await page.locator('[data-action="review-banktx"][data-id="BFT-1002"]').first().click();
  const afterBankReviewState = await state(page);
  expect(afterBankReviewState.bankTransactions.find(tx => tx.id === "BFT-1002").status).toBe("Reviewed");

  const afterBankReviewTotals = await accountingTotals(page);
  expect(afterBankReviewTotals.expenses).toBeCloseTo(afterFinalBillTotals.expenses + Math.abs(reviewTx.amount), 2);

  await page.locator('[data-nav="reports"]').first().click();
  await expect(page.locator("#page-reports.active")).toContainText(/Profit|Loss|Trial|Balance|Reports/);
});

test("documented money-out manual flows preserve expense, A/P, and cash impact", async ({ page }) => {
  await openFreshApp(page);

  const initial = await accountingTotals(page);
  const initialOperatingChecking = await normalBalance(page, "1000");

  await openModal(page, "expense");
  await page.locator('[name="vendorId"]').selectOption("V-2001");
  await page.locator('[name="expenseAccountId"]').selectOption("6000");
  await page.locator('[name="paymentMethod"]').selectOption({ label:"Bank transfer" });
  await page.locator('[name="bankAccountId"]').selectOption("BA-1");
  await page.locator('[name="amount"]').fill("240");
  await page.locator('[name="memo"]').fill("User manual office supplies");
  await submitModal(page);

  const afterExpenseState = await state(page);
  const expense = afterExpenseState.expenses[0];
  expect(expense.amount).toBe(240);
  expect(expense.tax).toBe(12);
  expect(expense.paymentMethod).toBe("Bank transfer");
  expect(expense.bankAccountId).toBe("BA-1");

  const afterExpenseTotals = await accountingTotals(page);
  expect(afterExpenseTotals.expenses).toBeCloseTo(initial.expenses + 240, 2);
  expect(afterExpenseTotals.tax.itc).toBeCloseTo(initial.tax.itc + 12, 2);
  expect(await normalBalance(page, "1000")).toBeCloseTo(initialOperatingChecking - 252, 2);

  await page.locator('[data-nav="expenses"]').first().click();
  await page.locator('[data-action="set-expense-tab"][data-id="expenses"]').click();
  const expensesPage = page.locator("#page-expenses.active");
  await expect(expensesPage).toContainText(expense.id);
  await expect(expensesPage).toContainText(money(252));

  const beforeBillTotals = await accountingTotals(page);
  const beforeBillOperatingChecking = await normalBalance(page, "1000");

  await page.evaluate(() => {
    window.__smartBooksOriginalRandom = Math.random;
    Math.random = () => ({ toString: () => "0.v0vaz" });
  });
  try {
    await openModal(page, "bill");
    await page.locator('[name="vendorId"]').selectOption("V-2002");
    await page.locator('[name="expenseAccountId"]').selectOption("6100");
    await page.locator('[name="status"]').selectOption({ label:"Open" });
    await page.locator('[name="amount"]').fill("360");
    await submitModal(page);
  } finally {
    await page.evaluate(() => {
      if(window.__smartBooksOriginalRandom) Math.random = window.__smartBooksOriginalRandom;
    });
  }

  const afterBillState = await state(page);
  const bill = afterBillState.bills[0];
  expect(bill.id).toBe("BILL-V0VAZ");
  expect(bill.amount).toBe(360);
  expect(bill.tax).toBe(18);
  expect(bill.paid).toBe(0);
  expect(bill.status).toBe("Open");

  const afterBillTotals = await accountingTotals(page);
  expect(afterBillTotals.ap).toBeCloseTo(beforeBillTotals.ap + 378, 2);
  expect(afterBillTotals.expenses).toBeCloseTo(beforeBillTotals.expenses + 360, 2);
  expect(afterBillTotals.tax.itc).toBeCloseTo(beforeBillTotals.tax.itc + 18, 2);
  expect(await normalBalance(page, "1000")).toBeCloseTo(beforeBillOperatingChecking, 2);

  await page.locator('[data-nav="expenses"]').first().click();
  await page.locator('[data-action="set-expense-tab"][data-id="bills"]').click();
  const billsTable = expensesPage.locator(".table-card", { hasText:"Bill & Expense Center" }).locator("table").first();
  await expectTableRowByFirstCell(billsTable, bill.id, [bill.id, money(378), "Open"]);

  await openModal(page, "payBill");
  await page.locator('[name="billId"]').selectOption(bill.id);
  await page.locator('[name="accountId"]').selectOption("BA-1");
  await page.locator('[name="amount"]').fill("378");
  await page.locator('[name="memo"]').fill(`User manual payment for ${bill.id}`);
  await submitModal(page);

  const afterPaymentState = await state(page);
  const paidBill = afterPaymentState.bills.find(item => item.id === bill.id);
  const billPayment = afterPaymentState.billPayments[0];
  expect(paidBill.status).toBe("Paid");
  expect(paidBill.paid).toBe(378);
  expect(billPayment.billId).toBe(bill.id);
  expect(billPayment.amount).toBe(378);
  expect(billPayment.accountId).toBe("BA-1");

  const afterPaymentTotals = await accountingTotals(page);
  expect(afterPaymentTotals.ap).toBeCloseTo(beforeBillTotals.ap, 2);
  expect(await normalBalance(page, "1000")).toBeCloseTo(beforeBillOperatingChecking - 378, 2);

  await navigateTo(page, "reports");
  const detail = await openReportDetail(page, "ap-aging");
  await expect(detail).toContainText("Accounts Payable Aging Summary");
  await expectAgingBucketColumns(detail);
  await expect(detail).not.toContainText(bill.id);
  await expect(detail).toContainText(money(beforeBillTotals.ap));
});

test("deposit workflow clears undeposited payments and separates extra deposit income", async ({ page }) => {
  await openFreshApp(page);

  await openModal(page, "payment");
  await page.locator('[name="invoiceId"]').selectOption("INV-1001");
  await page.locator('[name="accountId"]').selectOption("1400");
  await page.locator('[name="amount"]').fill("123");
  await submitModal(page);

  const afterPaymentState = await state(page);
  const payment = afterPaymentState.payments[0];
  expect(payment.invoiceId).toBe("INV-1001");
  expect(payment.accountId).toBe("1400");
  expect(payment.amount).toBe(123);
  expect(payment.depositId ?? null).toBeNull();
  expect(await normalBalance(page, "1400")).toBeCloseTo(123, 2);

  await openModal(page, "deposit");
  await page.locator(`[name="paymentIds"][value="${payment.id}"]`).check();
  await page.locator('[name="incomeAccountId"]').selectOption("4100");
  await page.locator("#v18DepositExtraAmount").fill("10");
  await submitModal(page);

  const afterDepositState = await state(page);
  const savedDeposit = afterDepositState.deposits[0];
  const depositedPayment = afterDepositState.payments.find(item => item.id === payment.id);
  expect(savedDeposit.amount).toBe(133);
  expect(savedDeposit.paymentIds).toEqual([payment.id]);
  expect(savedDeposit.linkedPaymentTotal).toBe(123);
  expect(savedDeposit.additionalAmount).toBe(10);
  expect(savedDeposit.incomeAccountId).toBe("4100");
  expect(savedDeposit.clearingAccountId).toBe("1400");
  expect(depositedPayment.depositId).toBe(savedDeposit.id);
  expect(depositedPayment.depositedToAccountId).toBe(savedDeposit.accountId);
  expect(await normalBalance(page, "1400")).toBeCloseTo(0, 2);
  expect(await ledgerRowsFor(page, "Deposit", savedDeposit.id)).toEqual([
    ["1000", 133, 0],
    ["1400", 0, 123],
    ["4100", 0, 10]
  ]);
});

test("bank feed matching links invoices and bills without double posting bank feed rows", async ({ page }) => {
  await openFreshApp(page);

  const beforeState = await state(page);
  const invoiceBefore = beforeState.invoices.find(item => item.id === "INV-1001");
  const billBefore = beforeState.bills.find(item => item.id === "BILL-9001");
  const invoiceOpen = invoiceBefore.subtotal + invoiceBefore.tax - invoiceBefore.paid;
  const billOpen = billBefore.amount + billBefore.tax - billBefore.paid;

  await page.locator('[data-nav="banking"]').first().click();
  await page.locator('[data-action="match-invoice-banktx"][data-id="BFT-1001"]').first().click();

  const afterInvoiceMatch = await state(page);
  const invoiceTx = afterInvoiceMatch.bankTransactions.find(item => item.id === "BFT-1001");
  const matchedPayment = afterInvoiceMatch.payments.find(item => item.id === invoiceTx.linkedId);
  const invoiceAfter = afterInvoiceMatch.invoices.find(item => item.id === "INV-1001");
  expect(invoiceTx.status).toBe("Matched");
  expect(invoiceTx.posted).toBe(false);
  expect(matchedPayment.invoiceId).toBe("INV-1001");
  expect(matchedPayment.amount).toBe(invoiceOpen);
  expect(matchedPayment.accountId).toBe(invoiceTx.bankAccountId);
  expect(invoiceAfter.paid).toBe(invoiceBefore.subtotal + invoiceBefore.tax);
  expect(invoiceAfter.status).toBe("Paid");
  expect(await ledgerRowsFor(page, "Bank feed", "BFT-1001")).toEqual([]);

  await page.locator('[data-action="match-bill-banktx"][data-id="BFT-1005"]').first().click();

  const afterBillMatch = await state(page);
  const billTx = afterBillMatch.bankTransactions.find(item => item.id === "BFT-1005");
  const matchedBillPayment = afterBillMatch.billPayments.find(item => item.id === billTx.linkedId);
  const billAfter = afterBillMatch.bills.find(item => item.id === "BILL-9001");
  expect(billTx.status).toBe("Matched");
  expect(billTx.posted).toBe(false);
  expect(matchedBillPayment.billId).toBe("BILL-9001");
  expect(matchedBillPayment.amount).toBe(billOpen);
  expect(matchedBillPayment.accountId).toBe(billTx.bankAccountId);
  expect(billAfter.paid).toBe(billBefore.amount + billBefore.tax);
  expect(billAfter.status).toBe("Paid");
  expect(await ledgerRowsFor(page, "Bank feed", "BFT-1005")).toEqual([]);
});

test("reports display ledger-backed profit, receivable, and payable values", async ({ page }) => {
  await openFreshApp(page);

  const appState = await state(page);
  const totals = await accountingTotals(page);
  const summary = await reportSummary(page);
  const openInvoice = appState.invoices.find(item => item.id === "INV-1001");
  const openBill = appState.bills.find(item => item.id === "BILL-9001");
  const openInvoiceAmount = openInvoice.subtotal + openInvoice.tax - openInvoice.paid;
  const openBillAmount = openBill.amount + openBill.tax - openBill.paid;

  await navigateTo(page, "reports");
  const reports = page.locator("#page-reports.active");
  await expect(reports).toContainText("Profit and Loss");
  await expect(reports).toContainText(`Open A/R ${money(totals.ar)}`);
  await expect(reports).toContainText(`Open A/P ${money(totals.ap)}`);

  let detail = await openReportDetail(page, "profit-loss");
  await expect(detail).toContainText("Profit and Loss");
  await expect(detail).toContainText(money(summary.income));
  await expect(detail).toContainText(money(summary.expenses));
  await expect(detail).toContainText(money(summary.net));
  await page.locator('[data-action="back-reports"]').click();

  detail = await openReportDetail(page, "ar-aging");
  await expect(detail).toContainText("Accounts Receivable Aging Summary");
  await expectAgingBucketColumns(detail);
  await expect(reports).toContainText("INV-1001");
  await expect(reports).toContainText(money(openInvoiceAmount));
  await page.locator('[data-action="back-reports"]').click();

  detail = await openReportDetail(page, "ap-aging");
  await expect(detail).toContainText("Accounts Payable Aging Summary");
  await expectAgingBucketColumns(detail);
  await expect(reports).toContainText("BILL-9001");
  await expect(reports).toContainText(money(openBillAmount));
});
