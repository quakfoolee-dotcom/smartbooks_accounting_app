# Issue 53 Admin Flow Polish Snapshot

Date: 2026-06-28

## Goal

Make setup, settings, dashboard operations, and persistence diagnostics feel like one coherent admin/setup workflow without changing accounting calculations or persistence behavior.

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Dashboard operations console | The console mixed daily work and setup/admin work with the same visual treatment. | The console now labels `Daily work` and `Admin setup`, and the setup/admin metric gets a distinct dashed treatment while preserving the compact five-card layout. |
| Setup checklist card | The dashboard card counted setup tasks but did not distinguish active setup from hidden or unavailable tasks. | The card now reports active tasks and notes hidden/unavailable tasks that can be reviewed on the setup page. |
| Setup checklist page | Hidden tasks were dimmed, but tasks blocked by hidden modules could still look like normal openable actions. | Each task now shows a clear state: `Complete`, `Ready`, `Hidden`, or `Module hidden`. Module-hidden tasks use `Configure` instead of a dead navigation action. |
| Settings page | Settings mixed company, dashboard, data, import/export, and reset controls across broad cards. | Settings now groups the admin surface into `Company profile`, `Workspace setup`, `Dashboard controls`, `Storage status`, `Backup and import`, and a visually distinct reset section. |
| Persistence/admin flow | Persistence diagnostics existed below settings, but the surrounding page did not clearly connect storage status to backup/import/reset controls. | The settings page now surfaces storage mode and endpoint near export/import actions, while the detailed persistence diagnostics panel remains visible below. |
| Hidden/unavailable states | Hidden module tasks could leave users unsure whether to restore a module or open a workflow. | Hidden-module setup rows explain the module is hidden and provide a configuration action. Existing hidden-navigation regression coverage was expanded. |

## Files Changed

| File | Change |
| --- | --- |
| `frontend/src/features/dashboard-widgets.js` | Added daily/admin grouping labels and admin styling to the operations console. |
| `frontend/src/features/sales-tax-inventory-ui.js` | Added the admin/setup polish layer for setup cards, setup page task states, settings page grouping, and topbar settings copy. |
| `tests/functional/dashboard-customization.spec.js` | Added assertions for operations grouping, settings admin sections, and setup state summaries. |
| `tests/functional/customize-menu.spec.js` | Added hidden-module setup assertions for `Module hidden` and `Configure` actions. |
| `README.md` | Linked this before/after report from the persistence/admin documentation area. |

## QC Results

| Check | Result |
| --- | --- |
| Project syntax/docs check | Passed: `npm run check` |
| Targeted functional tests | Passed: `npx playwright test tests/functional/dashboard-customization.spec.js tests/functional/customize-menu.spec.js tests/functional/persistence-runtime.spec.js tests/functional/startup-navigation.spec.js` |
| Unit tests | Passed: `npm test` |
| Accessibility/button sizing | Passed: `npx playwright test tests/functional/accessibility-and-visual.spec.js` |

## Follow-Up

This closes the UX cleanup slice for setup/settings/admin surfaces. The next roadmap choice should be #52 for database adapter design, #48 for performance budgets, or #58 for broader persistence snapshot documentation.
