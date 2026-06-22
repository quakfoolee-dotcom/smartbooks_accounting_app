# SmartBooks Handoff Notes

Last updated: 2026-06-22

## Current state

- The app has been split into frontend feature and service files.
- Navigation state is centralized in `frontend/src/services/navigation-model.js`.
- Sidebar rendering is owned by `frontend/src/features/sidebar-navigation.js`.
- Menu customization is owned by `frontend/src/features/menu-customization.js`.
- Global search is owned by `frontend/src/features/navigation-search.js`.
- `frontend/src/features/dashboard-widgets.js` is smaller, but still contains dashboard work plus some later sales/invoice UI fixes.

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

## Important fixes already made

- Bookmark mapping now preserves explicit bookmark catalog `nav` mappings before falling back to generated menu IDs.
- Modal live-calculation callbacks were made safer for search-opened invoice, expense, and bill modals.
- Mojibake scans should stay clean for `frontend/src`, `frontend/index.html`, `tests`, and `package.json`.

## Suggested next steps

1. Continue shrinking `dashboard-widgets.js` by moving invoice/sales UI fixes into a dedicated sales feature module.
2. Add unit tests around `SmartBooksNavigation.menuIdsToBookmarkIds` whenever bookmark behavior changes.
3. Add E2E coverage for Customize menu, sidebar navigation, and global search as repeatable scripts.
4. Consider replacing the ad hoc unit runner with Node's built-in test runner once test count grows.
