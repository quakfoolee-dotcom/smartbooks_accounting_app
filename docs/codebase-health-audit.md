# Codebase Health Audit

This audit captures the next maintainability moves for SmartBooks after the CI, deployment, README, testing checklist, and style conventions work.

## Current Health Summary

The project has a strong external safety net:

- protected `main` branch
- required GitHub Actions CI
- local functional workflow tests
- GitHub Pages deployment
- live deployed-site smoke test
- style conventions and manual testing documentation

The remaining risk is mostly inside the app implementation. The frontend still carries legacy migration patterns from the original single-file app, including large feature modules, version-numbered patch functions, inline HTML strings, and shared global state.

## Highest-Risk Areas

1. `frontend/src/features/sales-tax-inventory-ui.js`
   - Very large feature module.
   - Contains many version-numbered compatibility layers.
   - Mixes rendering, state normalization, event handling, and workflow logic.
   - Best next move: split by domain only when touching related behavior, not as a single large rewrite.

2. `frontend/src/main.js`
   - Still owns app initialization and several legacy render/workflow paths.
   - Best next move: move reusable model helpers and repeated render fragments into services or focused feature modules.

3. `frontend/src/styles.css`
   - Large stylesheet with historical layers and repeated overrides.
   - Best next move: group styles by surface and gradually replace repeated inline styles with reusable classes.

4. Modal and form workflows
   - High user impact.
   - Multiple workflows depend on default demo data, form validation, submit routing, and modal close behavior.
   - Best next move: keep strengthening focused functional tests before refactoring modal internals.

5. State persistence boundary
   - Browser `localStorage` is still the real store.
   - Backend state endpoints exist as a handoff point, but frontend persistence is not API-backed yet.
   - Best next move: design the persistence contract before implementation.

## Completed During This Audit

- Split the monolithic local Playwright file into workflow-focused specs:
  - `startup-navigation.spec.js`
  - `customize-menu.spec.js`
  - `dashboard-customization.spec.js`
  - `global-search.spec.js`
  - `accounting-workflows.spec.js`
  - `utilities.spec.js`
- Moved shared Playwright helpers into `tests/functional/support/smartbooks-app.js`.
- Kept `pages-smoke.spec.js` isolated behind `playwright.pages.config.js`.
- Updated local Playwright config so PR CI runs local app workflows only.

## Recommended Refactor Sequence

### 1. Keep Tests Organized By Workflow

Use one functional spec file per user workflow area. Add new browser tests to the closest existing file unless the workflow is large enough to deserve a new file.

### 2. Extract Pure Model Helpers First

When touching a feature, look for pure logic that can move out of render functions:

- sorting
- filtering
- default generation
- status calculation
- totals and open-balance calculations

Put reusable logic in services or focused feature helpers and cover it with unit tests.

### 3. Reduce Inline Markup Gradually

The app currently renders many HTML strings. Do not rewrite all rendering at once. Instead:

- extract repeated row/card/button fragments into named functions
- use stable `data-*` attributes for controls
- keep escaping close to the render boundary
- add functional tests for any changed workflow

### 4. Consolidate CSS As Surfaces Are Touched

Do not attempt a full CSS rewrite. For new fixes:

- prefer reusable classes over inline styles
- keep icon-only controls on shared square/grid rules
- group related styles by app surface
- remove obsolete overrides only when tests cover the affected UI

### 5. Design API Persistence Before Coding It

Before replacing `localStorage`, write a short design document covering:

- state shape and ownership
- load/save/reset endpoints
- migration from existing localStorage data
- offline/error handling
- test strategy

## Near-Term Backlog

- Add a persistence design document before backend storage work.
- Add unit tests around accounting totals and posting helpers where pure helpers exist.
- Identify top repeated HTML fragments and extract one small group as a pattern.
- Add screenshots or visual checks for the most fragile icon/sidebar/dashboard surfaces.
- Review `sales-tax-inventory-ui.js` for the first safe domain split.

## Senior Engineering Recommendation

Avoid a broad rewrite. The app now has enough automated coverage to support steady improvement, but not enough to justify replacing whole modules in one pass. The best path is incremental: test first, extract pure helpers, reduce inline UI duplication, then move persistence behind an API boundary.
