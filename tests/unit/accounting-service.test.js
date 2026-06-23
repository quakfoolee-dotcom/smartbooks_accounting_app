const assert = require("node:assert/strict");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

function plain(value){
  return JSON.parse(JSON.stringify(value));
}

function loadAccountingService(){
  const modulePath = path.join(root, "frontend/src/services/accounting-service.js");
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, "window");
  const previousWindow = globalThis.window;
  const sandbox = { window:{} };
  sandbox.window = sandbox;
  try{
    globalThis.window = sandbox.window;
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
    return sandbox.window.SmartBooksAccounting;
  }finally{
    delete require.cache[require.resolve(modulePath)];
    if(hadWindow) globalThis.window = previousWindow;
    else delete globalThis.window;
  }
}

function test(name, fn){
  try{
    fn();
    console.log(`ok - ${name}`);
  }catch(error){
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function sampleState(){
  return {
    chartOfAccounts:[
      { id:"1000", code:"1000", name:"Operating Checking", type:"Asset", normal:"Debit" },
      { id:"1010", code:"1010", name:"Savings Reserve", type:"Asset", normal:"Debit" },
      { id:"1200", code:"1200", name:"Accounts Receivable", type:"Asset", normal:"Debit" },
      { id:"1400", code:"1400", name:"Undeposited Funds", type:"Asset", normal:"Debit" },
      { id:"2000", code:"2000", name:"Accounts Payable", type:"Liability", normal:"Credit" },
      { id:"2100", code:"2100", name:"Credit Card Payable", type:"Liability", normal:"Credit" },
      { id:"2200", code:"2200", name:"GST/HST Payable", type:"Liability", normal:"Credit" },
      { id:"2210", code:"2210", name:"GST/HST ITC", type:"Asset", normal:"Debit" },
      { id:"3000", code:"3000", name:"Owner Equity", type:"Equity", normal:"Credit" },
      { id:"4000", code:"4000", name:"Service Revenue", type:"Income", normal:"Credit" },
      { id:"4100", code:"4100", name:"Other Income", type:"Income", normal:"Credit" },
      { id:"6000", code:"6000", name:"Office Expenses", type:"Expense", normal:"Debit" }
    ],
    bankAccounts:[
      { id:"BA-1", accountId:"1000", name:"Operating Checking" },
      { id:"BA-2", accountId:"2100", name:"Credit Card" }
    ],
    journalEntries:[
      { id:"JE-OPEN", date:"2026-01-01", memo:"Opening balance", status:"Posted", lines:[
        { accountId:"1000", debit:1000, credit:0 },
        { accountId:"3000", debit:0, credit:1000 }
      ] }
    ],
    invoices:[
      { id:"INV-1", customerId:"C-1", date:"2026-02-01", status:"Overdue", subtotal:200, tax:10, paid:50, incomeAccountId:"4000", items:[{ desc:"Service", qty:2, rate:100 }] }
    ],
    payments:[
      { id:"PMT-1", invoiceId:"INV-1", customerId:"C-1", date:"2026-02-02", accountId:"BA-1", amount:50, memo:"Payment for INV-1" }
    ],
    expenses:[
      { id:"EXP-1", vendorId:"V-1", date:"2026-02-03", expenseAccountId:"6000", memo:"Office supplies", amount:80, tax:4, paymentMethod:"Credit card", bankAccountId:"BA-2" }
    ],
    bills:[
      { id:"BILL-1", vendorId:"V-1", date:"2026-02-04", status:"Open", expenseAccountId:"6000", amount:100, tax:5, paid:25 }
    ],
    billPayments:[
      { id:"BP-1", billId:"BILL-1", vendorId:"V-1", date:"2026-02-05", accountId:"BA-1", amount:25, memo:"Payment for BILL-1" }
    ],
    deposits:[],
    transfers:[],
    bankTransactions:[
      { id:"BFT-1", date:"2026-02-06", description:"Bank service fee", amount:-12, bankAccountId:"BA-1", suggestedAccountId:"6000", posted:true, linkedId:null },
      { id:"BFT-2", date:"2026-02-07", description:"Interest", amount:7, bankAccountId:"BA-1", suggestedAccountId:"4100", posted:true, linkedId:null }
    ]
  };
}

test("accounting service calculates totals and open balances", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  assert.equal(accounting.invoiceTotal(state.invoices[0]), 210);
  assert.equal(accounting.openAmount(state.invoices[0]), 160);
  assert.equal(accounting.expenseTotal(state.expenses[0]), 84);
  assert.equal(accounting.billTotal(state.bills[0]), 105);
  assert.equal(accounting.billOpenAmount(state.bills[0]), 80);
  assert.deepEqual(plain(accounting.salesTaxSummary(state)), { collected:10, itc:9, net:1 });
});

test("accounting service handles zero and invalid numeric inputs safely", () => {
  const accounting = loadAccountingService();
  assert.equal(accounting.invoiceTotal({ subtotal:0, tax:0, paid:0 }), 0);
  assert.equal(accounting.openAmount({ subtotal:0, tax:0, paid:10 }), 0);
  assert.equal(accounting.expenseTotal({ amount:"not-a-number", tax:undefined }), 0);
  assert.equal(accounting.billTotal({ amount:null, tax:"5.25" }), 5.25);
  assert.deepEqual(plain(accounting.salesTaxSummary({ invoices:[], expenses:[], bills:[] })), {
    collected:0,
    itc:0,
    net:0
  });
});

test("accounting service buckets receivables and payables by due date aging", () => {
  const accounting = loadAccountingService();

  assert.equal(accounting.ageInDays("2026-06-15", "2026-06-20"), 5);
  assert.equal(accounting.ageInDays("2026-06-25", "2026-06-20"), 0);
  assert.equal(accounting.ageInDays("", "2026-06-20"), 0);
  assert.equal(accounting.agingBucketFor("2026-06-25", "2026-06-20"), "current");
  assert.equal(accounting.agingBucketFor("2026-06-01", "2026-06-20"), "d1_30");
  assert.equal(accounting.agingBucketFor("2026-05-01", "2026-06-20"), "d31_60");
  assert.equal(accounting.agingBucketFor("2026-03-01", "2026-06-20"), "d61_plus");

  const invoices = [
    { id:"INV-CURRENT", dueDate:"2026-06-25", subtotal:100, tax:5, paid:0 },
    { id:"INV-30", dueDate:"2026-06-01", subtotal:200, tax:10, paid:50 },
    { id:"INV-60", dueDate:"2026-05-01", subtotal:300, tax:15, paid:0 },
    { id:"INV-61", dueDate:"2026-03-01", subtotal:400, tax:20, paid:0 },
    { id:"INV-PAID", dueDate:"2026-03-01", subtotal:100, tax:5, paid:105 }
  ];
  assert.deepEqual(plain(accounting.receivablesAging(invoices, "2026-06-20")), {
    current:105,
    d1_30:160,
    d31_60:315,
    d61_plus:420,
    total:1000
  });

  const bills = [
    { id:"BILL-CURRENT", dueDate:"2026-06-25", amount:100, tax:5, paid:0 },
    { id:"BILL-30", dueDate:"2026-06-01", amount:200, tax:10, paid:50 },
    { id:"BILL-60", dueDate:"2026-05-01", amount:300, tax:15, paid:0 },
    { id:"BILL-61", dueDate:"2026-03-01", amount:400, tax:20, paid:0 },
    { id:"BILL-PAID", dueDate:"2026-03-01", amount:100, tax:5, paid:105 }
  ];
  assert.deepEqual(plain(accounting.payablesAging(bills, "2026-06-20")), {
    current:105,
    d1_30:160,
    d31_60:315,
    d61_plus:420,
    total:1000
  });
});

test("aging reports ignore fully paid and overpaid records", () => {
  const accounting = loadAccountingService();
  const invoices = [
    { id:"INV-OPEN", dueDate:"2026-06-01", subtotal:200, tax:10, paid:50 },
    { id:"INV-PAID", dueDate:"2026-05-01", subtotal:100, tax:5, paid:105 },
    { id:"INV-OVERPAID", dueDate:"2026-03-01", subtotal:100, tax:5, paid:150 }
  ];
  const bills = [
    { id:"BILL-OPEN", dueDate:"2026-06-01", amount:200, tax:10, paid:50 },
    { id:"BILL-PAID", dueDate:"2026-05-01", amount:100, tax:5, paid:105 },
    { id:"BILL-OVERPAID", dueDate:"2026-03-01", amount:100, tax:5, paid:150 }
  ];

  assert.deepEqual(plain(accounting.receivablesAging(invoices, "2026-06-20")), {
    current:0,
    d1_30:160,
    d31_60:0,
    d61_plus:0,
    total:160
  });
  assert.deepEqual(plain(accounting.payablesAging(bills, "2026-06-20")), {
    current:0,
    d1_30:160,
    d31_60:0,
    d61_plus:0,
    total:160
  });
});

test("accounting service maps expense names to expected fallback accounts", () => {
  const accounting = loadAccountingService();
  assert.equal(accounting.expenseAccountFromName("Utility bill"), "6100");
  assert.equal(accounting.expenseAccountFromName("Marketing campaign"), "6200");
  assert.equal(accounting.expenseAccountFromName("Software subscription"), "6300");
  assert.equal(accounting.expenseAccountFromName("Professional services"), "6400");
  assert.equal(accounting.expenseAccountFromName("Office supplies"), "6000");
});

test("accounting service builds balanced ledger rows and report totals", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  assert.equal(accounting.bankAccountIdToLedger(state, "BA-1"), "1000");
  assert.equal(accounting.bankAccountIdToLedger(state, "1400"), "1400");

  const trialBalance = accounting.trialBalanceStatus(state);
  assert.equal(trialBalance.ok, true);
  assert.equal(trialBalance.debits, trialBalance.credits);

  const totals = accounting.totals(state);
  assert.equal(totals.invoiceRevenue, 200);
  assert.equal(totals.paidRevenue, 50);
  assert.equal(totals.overdue, 160);
  assert.equal(totals.tax.net, 1);
  assert.equal(accounting.normalBalance(state, "1200"), 160);
  assert.equal(accounting.normalBalance(state, "2000"), 80);
});

test("sales tax summary agrees with ledger tax control accounts", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  const summary = accounting.salesTaxSummary(state);

  assert.equal(summary.collected, accounting.normalBalance(state, "2200"));
  assert.equal(summary.itc, accounting.normalBalance(state, "2210"));
  assert.equal(summary.net, summary.collected - summary.itc);
  assert.equal(summary.net, accounting.normalBalance(state, "2200") - accounting.normalBalance(state, "2210"));
});

test("bank summary includes savings and subtracts credit card liability", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  state.journalEntries.push({
    id:"JE-SAVINGS",
    date:"2026-02-12",
    memo:"Move cash into savings reserve",
    status:"Posted",
    lines:[
      { accountId:"1010", debit:250, credit:0 },
      { accountId:"3000", debit:0, credit:250 }
    ]
  });

  const expectedBank =
    accounting.normalBalance(state, "1000") +
    accounting.normalBalance(state, "1010") -
    accounting.normalBalance(state, "2100");

  assert.equal(accounting.normalBalance(state, "1010"), 250);
  assert.equal(accounting.normalBalance(state, "2100"), 84);
  assert.equal(accounting.totals(state).bank, expectedBank);
  assert.equal(accounting.trialBalanceStatus(state).ok, true);
});

test("payment application supports partial, exact, default, and invalid invoice payments", () => {
  const accounting = loadAccountingService();
  const invoice = { subtotal:300, tax:15, paid:100 };

  const partial = accounting.invoicePaymentApplication(invoice)(50);
  assert.equal(partial.appliedAmount, 50);
  assert.equal(partial.paid, 150);
  assert.equal(partial.openAmount, 165);
  assert.equal(partial.fullyPaid, false);

  const exact = accounting.invoicePaymentApplication(invoice)(215);
  assert.equal(exact.appliedAmount, 215);
  assert.equal(exact.paid, 315);
  assert.equal(exact.openAmount, 0);
  assert.equal(exact.fullyPaid, true);

  const defaultRemaining = accounting.invoicePaymentApplication(invoice)(0);
  assert.equal(defaultRemaining.appliedAmount, 215);
  assert.equal(defaultRemaining.paid, 315);

  const invalidNegative = accounting.invoicePaymentApplication(invoice)(-50);
  assert.equal(invalidNegative.appliedAmount, 215);
  assert.equal(invalidNegative.paid, 315);
});

test("bill payment application supports partial, exact, default, and invalid bill payments", () => {
  const accounting = loadAccountingService();
  const bill = { amount:100, tax:5, paid:25 };

  const partial = accounting.billPaymentApplication(bill)(40);
  assert.equal(partial.appliedAmount, 40);
  assert.equal(partial.paid, 65);
  assert.equal(partial.openAmount, 40);
  assert.equal(partial.fullyPaid, false);

  const exact = accounting.billPaymentApplication(bill)(80);
  assert.equal(exact.appliedAmount, 80);
  assert.equal(exact.paid, 105);
  assert.equal(exact.openAmount, 0);
  assert.equal(exact.fullyPaid, true);

  const defaultRemaining = accounting.billPaymentApplication(bill)(0);
  assert.equal(defaultRemaining.appliedAmount, 80);
  assert.equal(defaultRemaining.paid, 105);

  const invalidNegative = accounting.billPaymentApplication(bill)(-20);
  assert.equal(invalidNegative.appliedAmount, 80);
  assert.equal(invalidNegative.paid, 105);
});

test("payment application clamps overpayments to open invoice and bill balances", () => {
  const accounting = loadAccountingService();
  const invoice = { subtotal:100, tax:5, paid:40 };
  const invoiceApplied = accounting.invoicePaymentApplication(invoice)(999);
  assert.equal(invoiceApplied.appliedAmount, 65);
  assert.equal(invoiceApplied.paid, 105);
  assert.equal(invoiceApplied.openAmount, 0);
  assert.equal(invoiceApplied.fullyPaid, true);

  const bill = { amount:50, tax:2.5, paid:10 };
  const billApplied = accounting.billPaymentApplication(bill)(100);
  assert.equal(billApplied.appliedAmount, 42.5);
  assert.equal(billApplied.paid, 52.5);
  assert.equal(billApplied.fullyPaid, true);
});

test("deposit application links undeposited payments and additional deposits", () => {
  const accounting = loadAccountingService();
  const payments = [
    { id:"PMT-1", amount:125, accountId:"1400" },
    { id:"PMT-2", amount:75, accountId:"1400", depositId:"DEP-OLD" },
    { id:"PMT-3", amount:50, accountId:"BA-1" }
  ];

  const deposit = accounting.depositApplication(payments, ["PMT-1", "PMT-2", "PMT-3", "missing"], 25, "4100");
  assert.equal(deposit.canDeposit, true);
  assert.deepEqual(plain(deposit.paymentIds), ["PMT-1"]);
  assert.equal(deposit.linkedPaymentTotal, 125);
  assert.equal(deposit.additionalAmount, 25);
  assert.equal(deposit.total, 150);
  assert.equal(deposit.incomeAccountId, "4100");
  assert.equal(deposit.clearingAccountId, "1400");
});

test("deposit application supports standalone deposits and rejects empty deposits", () => {
  const accounting = loadAccountingService();
  const standalone = accounting.depositApplication([], [], 500, "4100");
  assert.equal(standalone.canDeposit, true);
  assert.equal(standalone.total, 500);
  assert.equal(standalone.linkedPaymentTotal, 0);
  assert.equal(standalone.additionalAmount, 500);
  assert.equal(standalone.incomeAccountId, "4100");

  const empty = accounting.depositApplication([], [], 0, "4100");
  assert.equal(empty.canDeposit, false);
  assert.equal(empty.total, 0);

  const negative = accounting.depositApplication([], [], -20, "4100");
  assert.equal(negative.canDeposit, false);
  assert.equal(negative.additionalAmount, 0);
});

test("deposit ledger clears undeposited funds and credits extra deposits separately", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  state.payments.push({ id:"PMT-UND", invoiceId:"INV-1", customerId:"C-1", date:"2026-02-12", accountId:"1400", amount:125, memo:"Undeposited customer payment" });
  state.deposits.push({
    id:"DEP-TEST",
    date:"2026-02-13",
    accountId:"BA-1",
    incomeAccountId:"4100",
    clearingAccountId:"1400",
    amount:150,
    memo:"Mixed bank deposit",
    paymentIds:["PMT-UND"],
    linkedPaymentTotal:125,
    additionalAmount:25
  });

  const depositRows = accounting.ledger(state).filter(row => row.source === "Deposit" && row.sourceId === "DEP-TEST");
  assert.deepEqual(plain(depositRows.map(row => [row.accountId, row.debit, row.credit])), [
    ["1000", 150, 0],
    ["1400", 0, 125],
    ["4100", 0, 25]
  ]);
  assert.equal(accounting.normalBalance(state, "1400"), 0);
  assert.equal(accounting.trialBalanceStatus(state).ok, true);
});

test("bank invoice matching applies positive deposits without overpaying", () => {
  const accounting = loadAccountingService();
  const invoice = { subtotal:300, tax:15, paid:100, status:"Sent" };

  const partial = accounting.bankInvoiceMatchApplication(invoice, { amount:50 });
  assert.equal(partial.canMatch, true);
  assert.equal(partial.appliedAmount, 50);
  assert.equal(partial.paid, 150);
  assert.equal(partial.openAmount, 165);
  assert.equal(partial.status, "Partially Paid");

  const full = accounting.bankInvoiceMatchApplication(invoice, { amount:999 });
  assert.equal(full.canMatch, true);
  assert.equal(full.appliedAmount, 215);
  assert.equal(full.paid, 315);
  assert.equal(full.openAmount, 0);
  assert.equal(full.status, "Paid");

  const invalidWithdrawal = accounting.bankInvoiceMatchApplication(invoice, { amount:-50 });
  assert.equal(invalidWithdrawal.canMatch, false);

  const closed = accounting.bankInvoiceMatchApplication({ subtotal:100, tax:5, paid:105, status:"Paid" }, { amount:105 });
  assert.equal(closed.canMatch, false);
  assert.equal(closed.appliedAmount, 0);
});

test("bank bill matching applies withdrawals without overpaying", () => {
  const accounting = loadAccountingService();
  const bill = { amount:100, tax:5, paid:25, status:"Open" };

  const partial = accounting.bankBillMatchApplication(bill, { amount:-40 });
  assert.equal(partial.canMatch, true);
  assert.equal(partial.appliedAmount, 40);
  assert.equal(partial.paid, 65);
  assert.equal(partial.openAmount, 40);
  assert.equal(partial.status, "Open");

  const full = accounting.bankBillMatchApplication(bill, { amount:-999 });
  assert.equal(full.canMatch, true);
  assert.equal(full.appliedAmount, 80);
  assert.equal(full.paid, 105);
  assert.equal(full.openAmount, 0);
  assert.equal(full.status, "Paid");

  const invalidDeposit = accounting.bankBillMatchApplication(bill, { amount:40 });
  assert.equal(invalidDeposit.canMatch, false);

  const closed = accounting.bankBillMatchApplication({ amount:100, tax:5, paid:105, status:"Paid" }, { amount:-105 });
  assert.equal(closed.canMatch, false);
  assert.equal(closed.appliedAmount, 0);
});

test("mixed transactions keep trial balance balanced and calculate normal balances", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  state.invoices.push({ id:"INV-2", customerId:"C-2", date:"2026-02-08", status:"Sent", subtotal:300, tax:15, paid:100, incomeAccountId:"4000", items:[{ desc:"Project", qty:1, rate:300 }] });
  state.payments.push({ id:"PMT-2", invoiceId:"INV-2", customerId:"C-2", date:"2026-02-09", accountId:"BA-1", amount:100, memo:"Partial payment" });
  state.bills.push({ id:"BILL-2", vendorId:"V-2", date:"2026-02-10", status:"Open", expenseAccountId:"6000", amount:50, tax:2.5, paid:20 });
  state.billPayments.push({ id:"BP-2", billId:"BILL-2", vendorId:"V-2", date:"2026-02-11", accountId:"BA-1", amount:20, memo:"Partial bill payment" });

  const trialBalance = accounting.trialBalanceStatus(state);
  assert.equal(trialBalance.ok, true);
  assert.equal(accounting.openAmount(state.invoices.find(invoice => invoice.id === "INV-2")), 215);
  assert.equal(accounting.billOpenAmount(state.bills.find(bill => bill.id === "BILL-2")), 32.5);
  assert.equal(accounting.normalBalance(state, "1200"), 375);
  assert.equal(accounting.normalBalance(state, "2000"), 112.5);
});

test("bank feed posting lines debit and credit the expected accounts", () => {
  const accounting = loadAccountingService();
  const state = sampleState();
  const withdrawal = accounting.bankTransactionPostingLines(state, state.bankTransactions[0]);
  assert.deepEqual(plain(withdrawal.map(row => [row.accountId, row.debit, row.credit])), [
    ["6000", 12, 0],
    ["1000", 0, 12]
  ]);

  const deposit = accounting.bankTransactionPostingLines(state, state.bankTransactions[1]);
  assert.deepEqual(plain(deposit.map(row => [row.accountId, row.debit, row.credit])), [
    ["1000", 7, 0],
    ["4100", 0, 7]
  ]);
});

console.log("All accounting service tests passed.");
