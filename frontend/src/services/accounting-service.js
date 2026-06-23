// Pure accounting helpers shared by the app and unit tests.
(function(global){
  "use strict";

  function num(value){
    return Number(value) || 0;
  }

  function invoiceTotal(invoice){
    return num(invoice?.subtotal) + num(invoice?.tax);
  }

  function expenseTotal(expense){
    return num(expense?.amount) + num(expense?.tax);
  }

  function billTotal(bill){
    return num(bill?.amount) + num(bill?.tax);
  }

  function openAmount(invoice){
    return Math.max(0, invoiceTotal(invoice) - num(invoice?.paid));
  }

  function billOpenAmount(bill){
    return Math.max(0, billTotal(bill) - num(bill?.paid));
  }

  function expenseAccountFromName(name){
    const normalized = String(name || "").toLowerCase();
    if(normalized.includes("utility")) return "6100";
    if(normalized.includes("market")) return "6200";
    if(normalized.includes("software")) return "6300";
    if(normalized.includes("professional")) return "6400";
    return "6000";
  }

  function getAccount(state, id){
    return (state?.chartOfAccounts || []).find(account => account.id === id) || {
      id,
      code: id,
      name: "Unknown account",
      type: "Other",
      normal: "Debit"
    };
  }

  function getBank(state, id){
    return (state?.bankAccounts || []).find(bank => bank.id === id) || (state?.bankAccounts || [])[0] || null;
  }

  function bankAccountIdToLedger(state, id){
    const requestedId = String(id || "");
    const bank = (state?.bankAccounts || []).find(account => String(account.id) === requestedId);
    if(bank?.accountId) return bank.accountId;
    const chartAccount = (state?.chartOfAccounts || []).find(account =>
      String(account.id) === requestedId || String(account.code) === requestedId
    );
    if(chartAccount) return chartAccount.id;
    return getBank(state, id)?.accountId || "1000";
  }

  function line(source, sourceId, date, memo, accountId, debit, credit){
    return { source, sourceId, date, memo, accountId, debit:num(debit), credit:num(credit) };
  }

  function bankTransactionPostingLines(state, transaction){
    const bankAccount = bankAccountIdToLedger(state, transaction.bankAccountId);
    const amount = Math.abs(num(transaction.amount));
    const category = transaction.suggestedAccountId || (num(transaction.amount) >= 0 ? "4100" : "6000");
    if(num(transaction.amount) >= 0) {
      return [
        line("Bank feed", transaction.id, transaction.date, transaction.description, bankAccount, amount, 0),
        line("Bank feed", transaction.id, transaction.date, transaction.description, category, 0, amount)
      ];
    }
    return [
      line("Bank feed", transaction.id, transaction.date, transaction.description, category, amount, 0),
      line("Bank feed", transaction.id, transaction.date, transaction.description, bankAccount, 0, amount)
    ];
  }

  function ledger(state, labels = {}){
    const rows = [];
    const customerName = labels.customerName || (() => "Unknown customer");
    const vendorName = labels.vendorName || (() => "Unknown vendor");

    (state?.journalEntries || [])
      .filter(entry => entry.status !== "Draft")
      .forEach(entry => (entry.lines || []).forEach(entryLine => {
        rows.push(line("Journal", entry.id, entry.date, entry.memo, entryLine.accountId, entryLine.debit, entryLine.credit));
      }));

    (state?.invoices || []).forEach(invoice => {
      rows.push(line("Invoice", invoice.id, invoice.date, `Invoice to ${customerName(invoice.customerId)}`, "1200", invoiceTotal(invoice), 0));
      rows.push(line("Invoice", invoice.id, invoice.date, `Revenue: ${invoice.items?.[0]?.desc || invoice.id}`, invoice.incomeAccountId || "4000", 0, invoice.subtotal));
      if(num(invoice.tax) > 0) rows.push(line("Invoice", invoice.id, invoice.date, `Sales tax collected on ${invoice.id}`, "2200", 0, invoice.tax));
    });

    (state?.payments || []).forEach(payment => {
      rows.push(line("Payment", payment.id, payment.date, payment.memo || `Payment for ${payment.invoiceId}`, bankAccountIdToLedger(state, payment.accountId), payment.amount, 0));
      rows.push(line("Payment", payment.id, payment.date, payment.memo || `Payment for ${payment.invoiceId}`, "1200", 0, payment.amount));
    });

    (state?.expenses || []).forEach(expense => {
      const total = expenseTotal(expense);
      const bank = expense.bankAccountId || (expense.paymentMethod === "Credit card" ? "BA-2" : "BA-1");
      rows.push(line("Expense", expense.id, expense.date, expense.memo, expense.expenseAccountId || expenseAccountFromName(expense.account), expense.amount, 0));
      if(num(expense.tax) > 0) rows.push(line("Expense", expense.id, expense.date, `Input tax credit: ${expense.memo}`, "2210", expense.tax, 0));
      rows.push(line("Expense", expense.id, expense.date, expense.memo, bankAccountIdToLedger(state, bank), 0, total));
    });

    (state?.bills || []).forEach(bill => {
      rows.push(line("Bill", bill.id, bill.date, `Bill from ${vendorName(bill.vendorId)}`, bill.expenseAccountId || "6000", bill.amount, 0));
      if(num(bill.tax) > 0) rows.push(line("Bill", bill.id, bill.date, `Input tax credit on ${bill.id}`, "2210", bill.tax, 0));
      rows.push(line("Bill", bill.id, bill.date, `Accounts payable: ${bill.id}`, "2000", 0, billTotal(bill)));
    });

    (state?.billPayments || []).forEach(payment => {
      rows.push(line("Bill payment", payment.id, payment.date, payment.memo || `Payment for ${payment.billId}`, "2000", payment.amount, 0));
      rows.push(line("Bill payment", payment.id, payment.date, payment.memo || `Payment for ${payment.billId}`, bankAccountIdToLedger(state, payment.accountId), 0, payment.amount));
    });

    (state?.deposits || []).forEach(deposit => {
      const total = num(deposit.amount);
      const hasDepositBreakdown = deposit.linkedPaymentTotal !== undefined || deposit.additionalAmount !== undefined || (deposit.paymentIds || []).length;
      const linkedPaymentTotal = hasDepositBreakdown
        ? (deposit.linkedPaymentTotal !== undefined ? num(deposit.linkedPaymentTotal) : num((state?.payments || [])
          .filter(payment => (deposit.paymentIds || []).includes(payment.id))
          .reduce((sum, payment) => sum + num(payment.amount), 0)))
        : 0;
      const additionalAmount = hasDepositBreakdown
        ? (deposit.additionalAmount !== undefined ? Math.max(0, num(deposit.additionalAmount)) : Math.max(0, total - linkedPaymentTotal))
        : total;
      rows.push(line("Deposit", deposit.id, deposit.date, deposit.memo, bankAccountIdToLedger(state, deposit.accountId), total, 0));
      if(linkedPaymentTotal > 0) rows.push(line("Deposit", deposit.id, deposit.date, deposit.memo, deposit.clearingAccountId || "1400", 0, linkedPaymentTotal));
      if(additionalAmount > 0 || linkedPaymentTotal <= 0) rows.push(line("Deposit", deposit.id, deposit.date, deposit.memo, deposit.incomeAccountId || "4100", 0, additionalAmount || total));
    });

    (state?.transfers || []).forEach(transfer => {
      rows.push(line("Transfer", transfer.id, transfer.date, transfer.memo || "Bank transfer", bankAccountIdToLedger(state, transfer.toAccountId), transfer.amount, 0));
      rows.push(line("Transfer", transfer.id, transfer.date, transfer.memo || "Bank transfer", bankAccountIdToLedger(state, transfer.fromAccountId), 0, transfer.amount));
    });

    (state?.bankTransactions || [])
      .filter(transaction => transaction.posted && !transaction.linkedId)
      .forEach(transaction => rows.push(...bankTransactionPostingLines(state, transaction)));

    return rows.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(a.source).localeCompare(String(b.source)));
  }

  function accountBalances(state){
    const balances = {};
    (state?.chartOfAccounts || []).forEach(account => {
      balances[account.id] = { debit:0, credit:0, net:0 };
    });
    ledger(state).forEach(entry => {
      if(!balances[entry.accountId]) balances[entry.accountId] = { debit:0, credit:0, net:0 };
      balances[entry.accountId].debit += entry.debit;
      balances[entry.accountId].credit += entry.credit;
      balances[entry.accountId].net = balances[entry.accountId].debit - balances[entry.accountId].credit;
    });
    return balances;
  }

  function normalBalance(state, accountId){
    const account = getAccount(state, accountId);
    const balance = accountBalances(state)[accountId] || { net:0 };
    return account.normal === "Credit" ? -balance.net : balance.net;
  }

  function sumTypes(state, types){
    return (state?.chartOfAccounts || [])
      .filter(account => types.includes(account.type))
      .reduce((sum, account) => sum + normalBalance(state, account.id), 0);
  }

  function salesTaxSummary(state){
    const collected = (state?.invoices || []).reduce((sum, invoice) => sum + num(invoice.tax), 0);
    const itc = (state?.expenses || []).reduce((sum, expense) => sum + num(expense.tax), 0) +
      (state?.bills || []).reduce((sum, bill) => sum + num(bill.tax), 0);
    return { collected, itc, net:collected - itc };
  }

  function totals(state){
    const invoiceRevenue = (state?.invoices || []).reduce((sum, invoice) => sum + num(invoice.subtotal), 0);
    const paidRevenue = (state?.payments || []).reduce((sum, payment) => sum + num(payment.amount), 0);
    const ar = normalBalance(state, "1200");
    const overdue = (state?.invoices || [])
      .filter(invoice => invoice.status === "Overdue")
      .reduce((sum, invoice) => sum + openAmount(invoice), 0);
    const expenses = sumTypes(state, ["Expense", "COGS"]);
    const ap = normalBalance(state, "2000");
    const bank = normalBalance(state, "1000") + normalBalance(state, "1010") - normalBalance(state, "2100");
    const profit = sumTypes(state, ["Income"]) - expenses;
    return { invoiceRevenue, paidRevenue, ar, overdue, expenses, ap, bank, profit, tax:salesTaxSummary(state) };
  }

  function trialBalanceStatus(state){
    const rows = ledger(state);
    const debits = rows.reduce((sum, entry) => sum + entry.debit, 0);
    const credits = rows.reduce((sum, entry) => sum + entry.credit, 0);
    const diff = debits - credits;
    return { debits, credits, diff, ok:Math.abs(diff) < 0.01 };
  }

  function paymentApplication(record, requestedAmount, totalFn){
    const total = totalFn(record);
    const currentlyPaid = num(record?.paid);
    const requested = num(requestedAmount);
    const open = Math.max(0, total - currentlyPaid);
    const appliedAmount = requested > 0 ? Math.min(open, requested) : open;
    const paid = Math.min(total, currentlyPaid + appliedAmount);
    const remaining = Math.max(0, total - paid);
    return {
      requestedAmount:requested,
      appliedAmount,
      paid,
      openAmount:remaining,
      fullyPaid:remaining <= 0.01
    };
  }

  function depositApplication(payments, paymentIds, additionalAmount, fallbackIncomeAccountId = "4100"){
    const ids = new Set((paymentIds || []).map(id => String(id)).filter(Boolean));
    const selectedPayments = (payments || []).filter(payment =>
      ids.has(String(payment.id)) && !payment.depositId && String(payment.accountId || "1400") === "1400"
    );
    const linkedPaymentTotal = selectedPayments.reduce((sum, payment) => sum + num(payment.amount), 0);
    const additional = Math.max(0, num(additionalAmount));
    const total = linkedPaymentTotal + additional;
    return {
      canDeposit:total > 0,
      selectedPayments,
      paymentIds:selectedPayments.map(payment => payment.id),
      linkedPaymentTotal,
      additionalAmount:additional,
      total,
      incomeAccountId:fallbackIncomeAccountId || "4100",
      clearingAccountId:"1400"
    };
  }

  function bankInvoiceMatchApplication(invoice, transaction){
    if(!invoice || num(transaction?.amount) <= 0) {
      return { canMatch:false, appliedAmount:0, paid:num(invoice?.paid), openAmount:openAmount(invoice), status:invoice?.status || "Sent" };
    }
    const open = openAmount(invoice);
    const appliedAmount = Math.min(open, Math.abs(num(transaction.amount)));
    const paid = Math.min(invoiceTotal(invoice), num(invoice.paid) + appliedAmount);
    const remaining = Math.max(0, invoiceTotal(invoice) - paid);
    return {
      canMatch:appliedAmount > 0,
      appliedAmount,
      paid,
      openAmount:remaining,
      status:remaining <= 0.01 ? "Paid" : "Partially Paid"
    };
  }

  function bankBillMatchApplication(bill, transaction){
    if(!bill || num(transaction?.amount) >= 0) {
      return { canMatch:false, appliedAmount:0, paid:num(bill?.paid), openAmount:billOpenAmount(bill), status:bill?.status || "Open" };
    }
    const open = billOpenAmount(bill);
    const appliedAmount = Math.min(open, Math.abs(num(transaction.amount)));
    const paid = Math.min(billTotal(bill), num(bill.paid) + appliedAmount);
    const remaining = Math.max(0, billTotal(bill) - paid);
    return {
      canMatch:appliedAmount > 0,
      appliedAmount,
      paid,
      openAmount:remaining,
      status:remaining <= 0.01 ? "Paid" : (bill.status || "Open")
    };
  }

  global.SmartBooksAccounting = {
    accountBalances,
    bankBillMatchApplication,
    bankAccountIdToLedger,
    bankInvoiceMatchApplication,
    bankTransactionPostingLines,
    billOpenAmount,
    billPaymentApplication: bill => amount => paymentApplication(bill, amount, billTotal),
    billTotal,
    depositApplication,
    expenseAccountFromName,
    expenseTotal,
    invoicePaymentApplication: invoice => amount => paymentApplication(invoice, amount, invoiceTotal),
    invoiceTotal,
    ledger,
    normalBalance,
    num,
    openAmount,
    paymentApplication,
    salesTaxSummary,
    sumTypes,
    totals,
    trialBalanceStatus
  };
})(window);
