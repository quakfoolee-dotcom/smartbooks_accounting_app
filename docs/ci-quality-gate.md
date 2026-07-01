# SmartBooks CI Quality Gate

This guide describes the pull request gate for SmartBooks and the closest local commands to run before pushing.

## Workflow

`SmartBooks CI` runs on pull requests to `main`, pushes to `main`, and manual dispatches.

| CI job | Purpose | Local equivalent |
|---|---|---|
| Syntax Check | Runs documentation link checks and JavaScript syntax checks through the project quality script. | `npm run check` |
| Documentation Checks | Runs the documentation link and asset checker as a separate visible job. | `npm run docs:check` |
| Unit Tests | Runs service, backend, persistence, and accounting unit tests. | `npm run test:unit` |
| Coverage Report | Enforces the service coverage threshold and uploads the coverage artifact. | `npm run coverage:check` |
| Functional Browser Tests | Installs Chromium, runs UI, accounting, persistence, and performance Playwright shards, and uploads diagnostics artifacts on failure. | `npm run test:functional:ci` |
| CI Result | Summarizes upstream job status and provides the stable branch-protection check. | Review upstream job results |

## Local Gate

Before pushing normal app changes, run:

```powershell
npm run test:ci
```

For a faster targeted check while iterating on accessibility or visual coverage, run:

```powershell
npx playwright test tests/functional/accessibility-and-visual.spec.js --workers=1 --reporter=list
```

## Functional Shards

| Shard | Command | Coverage |
|---|---|---|
| UI | `npm run test:functional:ui` | startup, navigation, menu customization, dashboard customization, search, accessibility, visual checks, UI contracts, utilities |
| Accounting | `npm run test:functional:accounting` | invoices, payments, expenses, bills, deposits, bank-feed matching, reports |
| Persistence | `npm run test:functional:persistence` | backend mode, hybrid migration, restore behavior, revision conflicts |
| Performance | `npm run test:functional:performance` | startup, backend save/read, API, large-state budgets |

## Failure Diagnostics

When the CI gate fails:

1. Open the specific failed upstream job before inspecting `CI Result`.
2. Reproduce locally with the matching command from the table above.
3. For browser failures, download the matching `playwright-diagnostics-*` artifact and inspect the summary, report, traces, screenshots, or retained video.
4. For coverage failures, download the `coverage-report` artifact before changing thresholds.
5. Push the fix and wait for `SmartBooks CI / CI Result` to pass.

## Branch Protection

Use `SmartBooks CI / CI Result` as the required status check for `main`. The aggregate job stays stable even when individual CI jobs are added or renamed.

For browser failure artifact handling, see `docs/playwright-ci-diagnostics.md`.
