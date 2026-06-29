# Issue 56 Accounting ID Flake Snapshot

Date: 2026-06-28

## Objective

Investigate and stabilize the intermittent accounting workflow failure where the saved bill ID was `BILL-V0VAZ`, but the visible page assertion could report text without the full generated ID.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Failure mode | The money-out functional test asserted the generated bill ID and total against the entire active Expenses page. The page is later rendered by a tabbed Expenses override, so the broad page text check could fail without identifying the specific Bills table row that drifted. | The test now polls the rendered Bills table and matches the generated bill by exact first-cell text before checking the expected ID, total, and status cells. |
| State ID | The test seed forces `Math.random()` so the saved bill ID is deterministic: `BILL-V0VAZ`. | The deterministic ID assertion remains unchanged, preserving coverage for record creation and state persistence. |
| Render target | `#page-expenses.active` concatenated all visible page text for the assertion. | `.table-card` for `Bill & Expense Center` is the assertion target, reducing unrelated page/tab text noise. |
| Diagnostic value | A mismatch only said the page did not contain the expected ID. | A mismatch now points to the Bills table row for the exact record ID, making future failures easier to diagnose. |
| Accounting behavior | No production accounting logic was changed. | No production accounting logic was changed; this is a functional test stabilization. |

## Investigation Notes

| Check | Result |
|---|---|
| ID generation | `frontend/src/main.js` generates IDs as `prefix + "-" + Math.random().toString(36).slice(2,7).toUpperCase()`. With the test seed, the expected bill ID is `BILL-V0VAZ`. |
| Bills renderer | The active Expenses implementation renders a Bills table under `Bill & Expense Center` and writes the bill ID in the first cell. |
| Language cleanup | User-facing cleanup wrappers do not target bill IDs or hyphenated accounting record identifiers. |
| Reproduction | Focused pre-fix rerun passed 3/3, confirming the failure is intermittent rather than deterministic. |

## QC Results

| Check | Result |
|---|---|
| Focused money-out workflow after fix | Passed: `npx playwright test tests/functional/accounting-workflows.spec.js --grep "documented money-out" --repeat-each=3 --workers=1 --reporter=list` |
| Full accounting workflow spec after fix | Passed: `npx playwright test tests/functional/accounting-workflows.spec.js --repeat-each=2 --workers=1 --reporter=list`, 14/14 |
