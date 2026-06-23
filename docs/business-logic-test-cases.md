# SmartBooks Business Logic Test Cases

This matrix defines the accounting and workflow rules that SmartBooks tests should protect. It is written as a product/accounting contract first, not as implementation notes.

The app is still a prototype, but these rules should stay stable as the codebase moves from browser localStorage toward API-backed persistence.

## Coverage Priorities

1. Money totals must be correct.
2. Posting logic must stay balanced.
3. Open balances must not go negative.
4. UI workflows must save the same amounts that accounting helpers calculate.
5. Reports must reflect saved records and ledger rows.

## Invoices

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Invoice total | No payment applied | Create invoice with subtotal 300 and tax 15 | Invoice total is 315, paid is 0 | Debit A/R 315, credit income 300, credit GST/HST payable 15 | Invoice appears open for 315 |
| Zero invoice | Qty, rate, subtotal, and tax are zero | Save or calculate invoice | Total is 0, open amount is 0 | No meaningful net movement | Should not create misleading receivable |
| Partial payment | Invoice total 315, paid 100 | Calculate open amount | Open amount is 215 | A/R balance remains 215 | Invoice remains open/sent |
| Full payment | Invoice total 315, paid 315 | Calculate open amount | Open amount is 0 | A/R cleared for that invoice | Invoice status is Paid |
| Overpayment | Invoice total 315, paid 100 | User enters payment 999 | Saved payment amount is 215, not 999 | Debit bank 215, credit A/R 215 | Invoice is Paid, no negative open balance |

## Payments

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Default payment | Open invoice selected, amount left blank or zero | Receive payment | Payment applies remaining open balance | Bank or undeposited funds debited, A/R credited | Invoice closes if fully paid |
| Partial payment | Open invoice 315 | Receive 100 | Payment amount is 100 | A/R decreases by 100 | Invoice still open for 215 |
| Exact payment | Open invoice 315 | Receive 315 | Payment amount is 315 | A/R becomes 0 | Invoice status becomes Paid |
| Overpayment | Open invoice 315 | Receive 999 | Payment amount is clamped to 315 | No over-credit to A/R | No negative invoice balance |
| Invalid payment | No invoice or amount <= 0 | Submit payment | No payment saved | No ledger movement | Modal stays open or shows validation message |

## Deposits

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Undeposited payment | Payment received to account 1400 | Select payment in Bank Deposit | Deposit stores paymentIds and linkedPaymentTotal | Debit bank, credit 1400 | Payment no longer appears in deposit queue |
| Standalone deposit | No selected payments, amount 500 | Save bank deposit | Deposit additionalAmount is 500 | Debit bank, credit selected income/equity/liability account | Deposit appears in bank register |
| Mixed deposit | Selected payment 125 plus extra 25 | Save bank deposit | Deposit amount is 150, linkedPaymentTotal 125, additionalAmount 25 | Debit bank 150, credit 1400 for 125, credit selected account for 25 | Undeposited Funds clears without overstating income |
| Empty deposit | No selected payments and zero amount | Submit deposit | No deposit saved | No ledger movement | Modal stays open or shows validation message |

## Expenses

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Expense total | Amount 80, tax 4 | Record expense | Expense total is 84 | Debit expense 80, debit ITC 4, credit bank/card 84 | Expense appears in expense report |
| No-tax expense | Amount 80, tax 0 | Record expense | Expense total is 80 | Debit expense 80, credit bank/card 80 | Tax summary unchanged |
| Category fallback | Expense account missing, name contains software | Calculate account | Uses software account 6300 | Posts to software expense | Report groups under software |
| Credit card expense | Paid from credit card | Record expense | bankAccountId maps to card liability | Credit card payable credited | Bank summary subtracts card liability correctly |

## Bills

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Bill total | Amount 100, tax 5 | Create bill | Bill total is 105, paid is 0 | Debit expense 100, debit ITC 5, credit A/P 105 | Bill appears open for 105 |
| Paid bill on create | Bill saved as Paid | Create bill | Bill paid equals bill total, payment record exists | A/P created and cleared | Bill status is Paid |
| Partial bill payment | Bill total 105, paid 25 | Pay 40 | Bill paid becomes 65 | Debit A/P 40, credit bank 40 | Bill remains open for 40 |
| Full bill payment | Bill total 105, paid 25 | Pay 80 | Bill paid becomes 105 | A/P cleared | Bill status becomes Paid |
| Bill overpayment | Bill total 105, paid 25 | Pay 999 | Saved bill payment amount is 80 | No over-debit to A/P | No negative bill open balance |

## Bank Feed

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Expense categorization | Bank transaction -12, suggested office expense | Review transaction | status Reviewed, posted true | Debit expense 12, credit bank 12 | Transaction leaves review queue |
| Income categorization | Bank transaction +7, suggested other income | Review transaction | status Reviewed, posted true | Debit bank 7, credit income 7 | Income appears in reports |
| Invoice match | Deposit matches open invoice | Match invoice | Payment created, transaction linked, posted false | Payment posts bank/A/R, bank feed does not double-post | Invoice open amount decreases |
| Bill match | Withdrawal matches open bill | Match bill | Bill payment created, transaction linked, posted false | Bill payment posts A/P/bank, bank feed does not double-post | Bill open amount decreases |
| Cleared toggle | Any bank transaction | Clear/unclear | cleared flag toggles only | No ledger amount change | Reconciliation status changes |

## Sales Tax

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Sales tax collected | Invoice tax 10 | Calculate tax summary | collected is 10 | GST/HST payable credited 10 | Tax summary net increases |
| ITC from expense | Expense tax 4 | Calculate tax summary | ITC includes 4 | ITC asset debited 4 | Tax summary net decreases |
| ITC from bill | Bill tax 5 | Calculate tax summary | ITC includes 5 | ITC asset debited 5 | Tax summary net decreases |
| Empty tax summary | No records | Calculate tax summary | collected 0, ITC 0, net 0 | No ledger rows | Tax summary displays zero values |

## Reports

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Trial balance | Mixed posted transactions | Calculate trial balance | N/A | Debits equal credits | Trial balance status is balanced |
| A/R report | Invoice 315, payment 100 | Calculate totals | N/A | A/R normal balance 215 | Open receivables show 215 |
| A/P report | Bill 105, payment 25 | Calculate totals | N/A | A/P normal balance 80 | Open payables show 80 |
| Profit report | Income 300, expense 80 | Calculate totals | N/A | Income minus expenses is 220 | Profit & Loss shows 220 before tax-only effects |
| Bank summary | Checking, savings, credit card balances | Calculate totals | N/A | Bank total equals debit bank balances minus credit card liability | Dashboard bank value matches ledger |

## Utilities

| Case | Starting State | Action | Expected Saved Record | Expected Ledger Effect | Expected UI / Report Effect |
| --- | --- | --- | --- | --- | --- |
| Export JSON | Any current state | Export data | Download contains current state | No ledger change | Backup download starts |
| Reset company data | Mutated state | Reset company data | State returns to defaults | Ledger returns to default demo state | Dashboard/menu/report values reset |

## Current Automation Map

| Area | Unit Coverage | Functional Coverage |
| --- | --- | --- |
| Invoice totals and open amount | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Payment clamping | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Expense totals and ITC | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Bill totals and bill payment clamping | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Deposit application and split deposit ledger lines | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Bank feed posting lines | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Bank feed invoice/bill matching | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Trial balance and report totals | `tests/unit/accounting-service.test.js` | `tests/functional/accounting-workflows.spec.js` |
| Reset/export utilities | Service tests indirectly; functional coverage primary | `tests/functional/utilities.spec.js` |

## Gaps To Close Next

- Add report-table row assertions for A/R, A/P, and P&L once report selectors are stabilized.
- Add date-aging cases for overdue invoices and bills once aging buckets are formalized.
