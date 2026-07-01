# Functional Test Shards

SmartBooks functional browser coverage is split into predictable Playwright shards for CI and local debugging.

| Shard | Command | Specs | Primary risk covered |
|---|---|---|---|
| UI | `npm run test:functional:ui` | `startup-navigation`, `customize-menu`, `dashboard-customization`, `global-search`, `accessibility-and-visual`, `ui-contract-snapshots`, `utilities` | App shell, navigation, customization, search, accessibility, visual readability, export/import/reset utilities |
| Accounting | `npm run test:functional:accounting` | `accounting-workflows` | Ledger-backed invoices, payments, expenses, bills, deposits, bank feed, and reports |
| Persistence | `npm run test:functional:persistence` | `persistence-runtime` | Backend mode, hybrid migration, reload safety, revision conflict handling |
| Performance | `npm run test:functional:performance` | `performance` | Startup, backend save/read, API, large-state, and navigation budgets |

## Local Commands

Run all functional shards sequentially:

```powershell
npm run test:functional:ci
```

Run the full Playwright suite without manual sharding:

```powershell
npm run test:functional
```

Run one shard while iterating:

```powershell
npm run test:functional:ui
npm run test:functional:accounting
npm run test:functional:persistence
npm run test:functional:performance
```

## CI Behavior

`SmartBooks CI` runs the four shards through a GitHub Actions matrix. Each shard gets its own job name and diagnostics artifact name on failure, while the aggregate `CI Result` job remains the stable branch-protection check.

Use the performance shard deliberately. It includes the slow large-state budget test, so it is the right shard for runtime and persistence-risk changes, while the UI, accounting, and persistence shards provide faster targeted feedback during everyday iteration.

When a shard fails in CI, download the matching `playwright-diagnostics-*` artifact and start with `playwright-diagnostics/*-summary.md`.
