# SmartBooks Performance Baseline

This document describes the first repeatable speed checks for SmartBooks. The goal is to catch major regressions before backend persistence becomes the default or database work begins.

## Covered Metrics

- Local startup readiness: open the app in local mode and wait for the dashboard shell to become usable.
- Backend startup readiness: open the app in backend mode, load state through `/api/state`, and wait for the dashboard shell to become usable.
- Backend save latency: trigger a user save in backend mode and wait for the backend write path to finish.
- Backend read latency: call `/api/health` and `GET /api/state` through Playwright's API client.
- Large-state readiness: load a deterministic company fixture with hundreds of customers, vendors, invoices, bills, expenses, payments, and bank-feed rows.
- Large-state navigation latency: move through Sales, Expenses, Reports, and Profit and Loss report rendering with realistic record volume.

The test attaches JSON timing artifacts for each metric so the actual local baseline can be reviewed after every run.

## Current Guardrail Budgets

These budgets are intentionally broad. They are meant to catch severe regressions without making local development flaky.

| Metric | Default Budget |
|---|---:|
| Local startup | 12,000 ms |
| Backend startup | 15,000 ms |
| Backend save | 5,000 ms |
| Backend API reads | 3,000 ms |
| Large-state local startup | 35,000 ms |
| Large-state backend startup | 30,000 ms |
| Large-state backend save | 12,000 ms |
| Large-state navigation step | 8,000 ms |

Budgets can be overridden for stricter CI runs:

```powershell
$env:SMARTBOOKS_STARTUP_BUDGET_MS="8000"
$env:SMARTBOOKS_BACKEND_STARTUP_BUDGET_MS="10000"
$env:SMARTBOOKS_BACKEND_SAVE_BUDGET_MS="2500"
$env:SMARTBOOKS_API_READ_BUDGET_MS="1500"
$env:SMARTBOOKS_LARGE_STARTUP_BUDGET_MS="18000"
$env:SMARTBOOKS_LARGE_BACKEND_STARTUP_BUDGET_MS="22000"
$env:SMARTBOOKS_LARGE_BACKEND_SAVE_BUDGET_MS="7000"
$env:SMARTBOOKS_LARGE_NAVIGATION_BUDGET_MS="5000"
npx playwright test tests/functional/performance.spec.js
```

## Large-State Fixture

The large fixture is generated deterministically inside `tests/functional/performance.spec.js` so it does not require committed test data files. It currently includes:

| Record type | Count |
|---|---:|
| Customers | 120 |
| Vendors | 60 |
| Invoices | 320 |
| Payments | 144 |
| Expenses | 260 |
| Bills | 180 |
| Bill payments | 36 |
| Bank transactions | 300 |

The large-state test writes a `large-state-performance.json` artifact with:

- record counts
- local startup timing
- backend startup timing
- backend save timing
- per-step navigation/report timings
- configured budgets

## How To Run

```powershell
npx playwright test tests/functional/performance.spec.js
```

The full functional suite also runs this spec:

```powershell
npx playwright test
```

## Next Performance Work

- Track performance results in CI so budget changes are intentional.
- Add workflow timing for common accounting flows such as invoice creation and payment posting.
- Split local and CI budget profiles if hosted runners prove consistently slower than developer workstations.
