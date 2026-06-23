# SmartBooks User Manual

This starter manual documents one high-value business flow in SmartBooks:

```text
Create invoice -> Receive payment -> Verify Accounts Receivable
```

The screenshots were captured from the current app UI with default demo data. Use this guide as both a user walkthrough and a business-logic reference when testing invoice and payment behavior.

## Flow 1: Create Invoice, Receive Payment, Verify A/R

### Business Logic Summary

| Step | User action | Expected accounting result |
| --- | --- | --- |
| Create invoice | Save a customer invoice for services | Debit Accounts Receivable, credit service revenue, credit GST/HST payable |
| Receive payment | Apply a payment to the invoice | Debit bank or undeposited funds, credit Accounts Receivable |
| Verify A/R | Open the A/R Aging Summary report | Paid invoice should no longer appear as an open receivable |

For the example below, the invoice uses:

| Field | Value |
| --- | --- |
| Customer | County Parks Department |
| Product / Service | Consulting |
| Quantity | 2 |
| Rate | 150 |
| Tax code | GST 5% |
| Subtotal | 300 |
| Tax | 15 |
| Invoice total | 315 |

### Step 1: Start From The Dashboard

Open SmartBooks and confirm the dashboard, sidebar, topbar, create controls, and widgets are visible.

![SmartBooks dashboard](assets/user-manual/invoice-flow-01-dashboard.png)

Expected result:

- The app loads without mojibake or broken icons.
- The left sidebar shows Dashboard, Reports, My Apps, Settings, and Setup Checklist near the top.
- The create button and dashboard widgets are available.

### Step 2: Create The Invoice

Open the create invoice workflow, then enter the customer, invoice details, product/service, quantity, rate, tax code, and customer message.

![Create professional invoice modal](assets/user-manual/invoice-flow-02-create-invoice.png)

Use these example values:

| Field | Value |
| --- | --- |
| Template | Standard |
| Customer | County Parks Department |
| Invoice date | 2026-06-23 |
| Due date | 2026-07-23 |
| Terms | Net 30 |
| Product / Service | SERV-CONSULT - Consulting |
| Quantity / Hours | 2 |
| Rate | 150 |
| Description | User manual implementation service |
| Shipping | 0 |
| Income account | 4000 - Service Revenue |

Click **Create invoice**.

Expected result:

- SmartBooks creates a new invoice.
- Invoice subtotal is 300.
- GST/HST is 15.
- Invoice total is 315.
- Accounts Receivable increases by 315.
- Service revenue increases by 300.
- GST/HST payable increases by 15.

### Step 3: Confirm The Invoice Posted

Open the Sales & Get Paid area and confirm the new invoice appears as an open invoice.

![Invoice posted in sales workflow](assets/user-manual/invoice-flow-03-invoice-posted-sales.png)

Expected result:

- The invoice appears in the sales workflow.
- The invoice is still unpaid or open.
- The open invoice balance matches the invoice total.

### Step 4: Receive Payment

Open the receive payment workflow and apply a 315 payment to the invoice.

![Receive payment modal](assets/user-manual/invoice-flow-04-receive-payment.png)

Use these example values:

| Field | Value |
| --- | --- |
| Customer | County Parks Department |
| Amount received | 315 |
| Payment method | Bank transfer, cash, cheque, or another configured method |
| Deposit account | Bank or undeposited funds |
| Invoice selected | The invoice created in Step 2 |

Click **Receive payment**.

Expected result:

- Payment is saved.
- Accounts Receivable decreases by 315.
- Bank or undeposited funds increases by 315.
- The invoice balance becomes 0.

### Step 5: Confirm The Invoice Is Paid

Return to Sales & Get Paid and confirm the invoice is no longer open.

![Invoice paid in sales workflow](assets/user-manual/invoice-flow-05-invoice-paid-sales.png)

Expected result:

- The invoice status changes to paid.
- The invoice no longer contributes to open A/R.
- Payment activity is reflected in the customer and sales workflow.

### Step 6: Verify A/R Aging

Open Reports, then run **Accounts Receivable Aging Summary** for a date range that includes the invoice date.

![Accounts Receivable Aging Summary](assets/user-manual/invoice-flow-06-ar-report.png)

Use this date range for the example:

| Field | Value |
| --- | --- |
| Start | 2026-01-01 |
| End | 2026-12-31 |

Expected result:

- The report runs without errors.
- The paid invoice does not appear as an open receivable.
- Open A/R only includes unpaid invoices from the demo data.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Invoice does not appear after save | Confirm the invoice modal was submitted with **Create invoice** and no required fields were blank. |
| Payment does not close the invoice | Confirm the selected customer and selected invoice match, and that the payment amount equals the invoice balance. |
| A/R report still shows the paid invoice | Refresh or rerun the report, confirm the payment was saved, and confirm the report date range includes the invoice date. |
| Values differ from this manual | Demo data may have changed. Reset company data before retesting the exact example values. |

## Next Manual Candidates

Use this same format for the next business flows:

- Record expense -> Verify expense report and bank/cash impact.
- Create bill -> Pay bill -> Verify A/P Aging Summary.
- Review bank transaction -> Categorize -> Verify banking and ledger impact.
- Customize menu -> Add bookmark -> Save -> Confirm sidebar persistence.
