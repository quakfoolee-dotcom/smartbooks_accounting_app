# SmartBooks Testing Strategy

This document explains the automated testing layers for SmartBooks and what each layer is expected to protect.

SmartBooks is still a browser-based prototype with localStorage persistence, so the test strategy is intentionally pragmatic:

- put pure business rules under fast unit tests
- protect critical workflows with Playwright browser tests
- keep live GitHub Pages smoke testing small and reliable
- add regression tests for every serious defect found manually

## Test Layers

### Syntax Gate

Command:

```powershell
npm run check
```

Purpose:

- catches invalid JavaScript before runtime
- checks backend, frontend services, feature modules, Playwright configs, unit tests, and functional tests
- gives quick feedback before opening a pull request

This is not a substitute for unit or browser tests. It only proves files parse.

### Unit Tests

Command:

```powershell
npm test
```

Files:

```text
tests/unit/services.test.js
tests/unit/accounting-service.test.js
```

Current coverage:

- navigation order normalization
- sidebar visibility rules
- bookmark ID mapping
- localStorage persistence behavior
- icon inference and mojibake repair
- accounting totals and open balances
- ledger balance and trial balance checks
- sales tax collected / input tax credit summary
- invoice and bill overpayment clamping
- A/R and A/P aging bucket calculations
- bank-feed posting lines

Unit tests should stay fast and deterministic. They should not depend on a real browser, GitHub Pages, network calls, timers, or UI layout.

### Service Coverage

Command:

```powershell
npm run coverage
```

Threshold check:

```powershell
npm run coverage:check
```

Purpose:

- measures unit coverage for `frontend/src/services/**/*.js`
- produces text, HTML, and lcov reports in `coverage/`
- enforces conservative service-level thresholds before broader refactors

The GitHub Actions coverage job runs `npm run coverage:check`, uploads a `coverage-report` artifact, and feeds into the required `SmartBooks CI / CI Result` gate. When coverage fails, inspect the coverage artifact before changing thresholds.

## Accounting Service Tests

The accounting rules live in:

```text
frontend/src/services/accounting-service.js
```

This file is intentionally pure. It should not touch the DOM, localStorage, network, or global app state except for exposing `window.SmartBooksAccounting` to the browser.

When adding accounting behavior, prefer this order:

1. Add or update a pure helper in `accounting-service.js`.
2. Add direct unit coverage in `tests/unit/accounting-service.test.js`.
3. Wire the helper into the UI workflow.
4. Add a functional regression test if the workflow has user-visible behavior.

High-value accounting cases to test:

- invoice subtotal, tax, total, paid, and open amount
- payment application and overpayment prevention
- bill total, paid, and open amount
- bill payment application and overpayment prevention
- expense total and tax input credit
- bank-feed posting lines
- A/R and A/P aging buckets
- A/R, A/P, bank, income, expense, profit, and sales-tax summaries

## Functional Browser Tests

Command:

```powershell
npm run test:functional
```

Configuration:

```text
playwright.config.js
```

Files:

```text
tests/functional/accessibility-and-visual.spec.js
tests/functional/accounting-workflows.spec.js
tests/functional/customize-menu.spec.js
tests/functional/dashboard-customization.spec.js
tests/functional/global-search.spec.js
tests/functional/startup-navigation.spec.js
tests/functional/utilities.spec.js
tests/functional/support/smartbooks-app.js
```

The local functional suite starts the Node server with `npm start`, opens Chromium, clears SmartBooks localStorage before each test, and runs against a fresh browser state.

Current coverage:

- startup and dashboard shell rendering
- visible mojibake/icon corruption failure detection
- sidebar information architecture and rail navigation
- centered topbar icon controls
- sidebar arrow icon identity, size, and centering
- Manage menu save/cancel behavior
- bookmark persistence and duplicate prevention
- module hide/show, restore defaults, and menu reorder
- dashboard layout save/cancel/restore
- dashboard customize control dimensions
- global search records, keyboard flow, and fallback suggestions
- create invoice, receive payment, record expense, create bill, pay bill
- invalid modal save behavior
- invoice and bill overpayment clamping in the real UI workflow
- bank transaction review
- reports page rendering
- export JSON and reset company data
- modal accessibility, icon-only close, Escape close, and focus return

## Live Pages Smoke Test

Command:

```powershell
npm run test:pages-smoke
```

Configuration:

```text
playwright.pages.config.js
```

File:

```text
tests/functional/pages-smoke.spec.js
```

Default target:

```text
https://quakfoolee-dotcom.github.io/smartbooks_accounting_app/
```

The live smoke test intentionally stays smaller than the local functional suite. Its purpose is to prove the deployed GitHub Pages app loads and can perform a few core interactions after deployment.

Current coverage:

- deployed app shell loads
- dashboard renders
- no failed document/script/style assets
- no browser console/page errors
- no visible mojibake in core UI
- sidebar chevrons render as right arrows
- Manage menu opens
- Reports navigation works

Use `SMARTBOOKS_PAGES_URL` to target another deployed URL:

```powershell
$env:SMARTBOOKS_PAGES_URL="https://example.com/smartbooks/"
npm run test:pages-smoke
```

## Regression Test Rule

When a defect is fixed, add the smallest test that would have failed before the fix.

Examples from recent work:

- mojibake and emoji corruption -> visible text and icon checks
- sidebar arrow issue -> sidebar arrow identity and centering checks
- bookmark not persisting -> Manage menu save/cancel/bookmark tests
- duplicate bookmarks -> duplicate-prevention test
- overpayment bug -> unit and functional payment-clamping tests
- modal close text issue -> accessible icon-only close test

## What Not To Test Yet

Do not add broad end-to-end coverage for every page just to increase test count. The app still has legacy UI modules and localStorage state. Overly broad tests will become noisy and slow.

Avoid for now:

- full screenshot snapshot testing
- cross-browser testing
- testing archived/original HTML
- testing every report variant
- testing every placeholder workflow
- testing implementation details of legacy compatibility patches

Add these later when the codebase is more modular and the highest-risk workflows are already covered.

## Adding A New Functional Test

Use the closest workflow file:

- startup/sidebar/navigation -> `startup-navigation.spec.js`
- Manage menu/bookmarks/sidebar customization -> `customize-menu.spec.js`
- dashboard card layout -> `dashboard-customization.spec.js`
- search -> `global-search.spec.js`
- accounting workflows -> `accounting-workflows.spec.js`
- accessibility or layout regressions -> `accessibility-and-visual.spec.js`
- export/reset utilities -> `utilities.spec.js`

Use shared helpers from:

```text
tests/functional/support/smartbooks-app.js
```

Preferred patterns:

- call `openFreshApp(page)` at the start of each test
- inspect localStorage through the shared `state(page)` helper
- use stable `data-*` selectors when possible
- assert that modals close only after valid saves
- keep each test focused on one workflow risk

## Local Release Gate

Before pushing a normal code change, run:

```powershell
npm run test:all
```

For a fast service-only check while iterating, run:

```powershell
npm run test:unit
```

When touching service logic, also run:

```powershell
npm run coverage
```

Before or after deployment-related work, also run:

```powershell
npm run test:pages-smoke
```

GitHub Actions will run the required `SmartBooks CI / CI Result` PR gate, but local validation keeps feedback faster and easier to debug.
