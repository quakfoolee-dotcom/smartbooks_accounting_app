# Issue 83 Playwright Shards Snapshot

Date: 2026-06-30

## Objective

Split Playwright functional coverage into CI-friendly shards so high-value tests run predictably without hiding the slower performance suite.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| CI functional job | CI ran one full `npm run test:functional` browser job. | CI now runs UI, accounting, persistence, and performance shards through a matrix. |
| Runtime visibility | A slow or failing spec appeared under one broad functional job. | Each shard has a named job and shard-specific Playwright failure artifact. |
| Local iteration | Developers could run the full functional suite or individual spec files manually. | Developers can run `npm run test:functional:ui`, `:accounting`, `:persistence`, `:performance`, or `:ci`. |
| Performance tests | Performance coverage was mixed into the full suite. | Performance coverage is explicit in `npm run test:functional:performance` while still included in the CI gate. |
| Documentation | CI and testing docs described the full functional suite only. | README, CI quality gate docs, testing strategy, and `docs/functional-test-shards.md` now explain shard scope and usage. |

## Shard Map

| Shard | Command | Expected specs |
|---|---|---|
| UI | `npm run test:functional:ui` | startup/navigation, menu customization, dashboard customization, search, accessibility/visual, UI contracts, utilities |
| Accounting | `npm run test:functional:accounting` | accounting workflows |
| Persistence | `npm run test:functional:persistence` | persistence runtime workflows |
| Performance | `npm run test:functional:performance` | performance budgets |

## QC Results

| Check | Result |
|---|---|
| Syntax and docs check | Passed: `npm run check` |
| UI shard | Passed: `npm run test:functional:ui`, 18/18 |
| Accounting shard | Passed: `npm run test:functional:accounting`, 7/7 |
| Persistence shard | Passed: `npm run test:functional:persistence`, 7/7 |
| Performance shard | Passed: `npm run test:functional:performance`, 4/4 |
| Combined functional shard command | Passed: `npm run test:functional:ci`, 36/36 |
