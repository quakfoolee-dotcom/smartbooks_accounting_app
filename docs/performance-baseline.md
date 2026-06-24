# SmartBooks Performance Baseline

This document describes the first repeatable speed checks for SmartBooks. The goal is to catch major regressions before backend persistence becomes the default or database work begins.

## Covered Metrics

- Local startup readiness: open the app in local mode and wait for the dashboard shell to become usable.
- Backend startup readiness: open the app in backend mode, load state through `/api/state`, and wait for the dashboard shell to become usable.
- Backend save latency: trigger a user save in backend mode and wait for the backend write path to finish.
- Backend read latency: call `/api/health` and `GET /api/state` through Playwright's API client.

The test attaches JSON timing artifacts for each metric so the actual local baseline can be reviewed after every run.

## Current Guardrail Budgets

These budgets are intentionally broad. They are meant to catch severe regressions without making local development flaky.

| Metric | Default Budget |
|---|---:|
| Local startup | 12,000 ms |
| Backend startup | 15,000 ms |
| Backend save | 5,000 ms |
| Backend API reads | 3,000 ms |

Budgets can be overridden for stricter CI runs:

```powershell
$env:SMARTBOOKS_STARTUP_BUDGET_MS="8000"
$env:SMARTBOOKS_BACKEND_STARTUP_BUDGET_MS="10000"
$env:SMARTBOOKS_BACKEND_SAVE_BUDGET_MS="2500"
$env:SMARTBOOKS_API_READ_BUDGET_MS="1500"
npx playwright test tests/functional/performance.spec.js
```

## How To Run

```powershell
npx playwright test tests/functional/performance.spec.js
```

The full functional suite also runs this spec:

```powershell
npx playwright test
```

## Next Performance Work

- Add a larger-state fixture once the database schema direction is chosen.
- Track performance results in CI so budget changes are intentional.
- Add workflow timing for common accounting flows such as invoice creation, payment posting, and report rendering.
