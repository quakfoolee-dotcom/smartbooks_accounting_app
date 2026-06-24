# SmartBooks Handoff Notes

Last updated: 2026-06-23

## Current state

- The app has been split into frontend feature and service files.
- Navigation state is centralized in `frontend/src/services/navigation-model.js`.
- Sidebar rendering is owned by `frontend/src/features/sidebar-navigation.js`.
- Menu customization is owned by `frontend/src/features/menu-customization.js`.
- Global search is owned by `frontend/src/features/navigation-search.js`.
- `frontend/src/features/dashboard-widgets.js` is smaller, but still contains dashboard work plus some later sales/invoice UI fixes.
- Dashboard operations summary calculations are owned by `frontend/src/services/dashboard-operations-service.js`.

## Verification

Run these before pushing future changes:

```powershell
npm run check
npm test
```

Current unit coverage:

- Navigation order, visibility, settings sync, and bookmark mapping.
- Storage fallback, save, backup, invalid JSON handling, and status counters.
- Icon SVG rendering, fallback behavior, mojibake repair, and icon inference.
- Accounting totals, aging buckets, ledger balance, payment application, deposits, and bank-feed posting helpers.
- Dashboard operations summary, attention counts, due-soon logic, and dashboard money/work buckets.

Current functional coverage:

- Startup navigation, sidebar defaults, Customize menu, dashboard customization, global search, and accounting workflows.
- Accessibility and visual-contract checks for modal behavior, keyboard reachability, button sizing, and table layout.
- Structured UI contract snapshots for default navigation and Manage menu behavior.

## Important fixes already made

- Bookmark mapping now preserves explicit bookmark catalog `nav` mappings before falling back to generated menu IDs.
- Modal live-calculation callbacks were made safer for search-opened invoice, expense, and bill modals.
- Mojibake scans should stay clean for `frontend/src`, `frontend/index.html`, `tests`, and `package.json`.

## Suggested next steps

1. Keep dashboard stabilization focused on the operations-console model before adding pixel-level visual snapshots.
2. Continue shrinking `dashboard-widgets.js` by moving invoice/sales UI fixes into a dedicated sales feature module when touching those flows.
3. Add unit tests around `SmartBooksNavigation.menuIdsToBookmarkIds` whenever bookmark behavior changes.
4. Use `docs/persistence-contract.md` as the gate before switching the storage adapter away from localStorage.
5. Consider replacing the ad hoc unit runner with Node's built-in test runner once test count grows.
