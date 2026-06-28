# Refactoring Code Smells Audit

Audit date: 2026-06-28

This audit uses refactoring as a maintenance technique: improve code structure without changing behavior. The goal is cleaner, more self-documenting code that is easier to read, change, and test.

## Audit Method

The review focused on the current frontend and runtime implementation because that is where most maintainability risk remains. Evidence came from file size, repeated render patterns, version-numbered compatibility layers, inline markup/style injection, global state access, and cross-module monkey patching.

Largest frontend hotspots:

| File | Approx. Lines | Observed Risk |
| --- | ---: | --- |
| `frontend/src/features/sales-tax-inventory-ui.js` | 6,143 | Large feature module with repeated dashboard/chart generations and many versioned patches. |
| `frontend/src/features/workflows-and-reporting.js` | 2,447 | Mixed workflow rendering, reporting, DOM mutation, and event handling. |
| `frontend/src/features/navigation-search.js` | 2,154 | Large navigation/search surface with broad UI responsibility. |
| `frontend/src/runtime/stability-and-api.js` | 2,055 | App-wide compatibility and stabilization layer that wraps core functions. |
| `frontend/src/features/dashboard-widgets.js` | 1,366 | Dashboard layout, render fragments, injected styles, drag/drop behavior, and widget state in one module. |
| `frontend/src/features/record-workflows.js` | 1,364 | Form and record workflow handling concentrated in one feature file. |
| `frontend/src/main.js` | 851 | Original app shell still owns seed data, persistence startup, rendering, modal routing, and global helpers. |

## Code Smells And Refactoring Actions

| Code Smell Type | Specific Smell | Evidence | Impact | Refactoring Action To Fix |
| --- | --- | --- | --- | --- |
| Bloater | Large modules with too many responsibilities | `sales-tax-inventory-ui.js`, `workflows-and-reporting.js`, `navigation-search.js`, and `stability-and-api.js` are each over 1,900 lines or carry broad feature/runtime duties. | New changes require reading unrelated workflows, which raises regression risk and slows review. | Split by domain when touching behavior. Start with dashboard cash-flow/invoice/expense rendering from `sales-tax-inventory-ui.js`, then move pure calculations into `frontend/src/services/` and keep DOM rendering in focused feature modules. |
| Bloater | Long inline HTML render functions | `main.js` render methods assign large template strings through `innerHTML` for menu, dashboard cards, tables, page bodies, and modals. | Rendering logic is hard to test independently and repeated markup encourages inconsistent UI fixes. | Extract named render fragments such as `renderPageHeader`, `renderDataTable`, `renderMetricCard`, and modal footer builders. Add unit tests for pure string/data helpers and functional tests for changed workflows. |
| Bloater | Seed data, configuration, runtime persistence, and UI bootstrap live together | `main.js` contains `menuModules`, `initialState`, persistence configuration, state normalization, render routing, event setup, and modal handling. | The startup file is a change magnet and any edit can affect unrelated app behavior. | Move demo seed data into a data module or service, move startup persistence decisions behind `SmartBooksPersistence`, and leave `main.js` as orchestration only. |
| Change blocker | Version-numbered patch layers override previous behavior | Functions and style injectors named `v820`, `v821`, `v822`, `v823`, `v824`, and later patch blocks repeat dashboard rendering in `sales-tax-inventory-ui.js`; `stability-and-api.js` has V58 through V63 stabilization layers. | It is unclear which version is authoritative, so simple UI or data changes require tracing override order. | Collapse the latest accepted implementation into canonical non-versioned functions. Keep one compatibility adapter only where old persisted data requires migration. |
| Change blocker | Monkey patching core functions at runtime | `stability-and-api.js` saves base references and reassigns `saveState`, `renderAll`, `renderSales`, `renderCustomers`, `renderVendors`, and `renderDashboard`. | Call order becomes implicit and future refactors can break because behavior is installed by load order rather than explicit imports/contracts. | Replace function reassignment with explicit lifecycle hooks: `beforeSave`, `normalizeState`, `afterRender`, and feature-specific `install` functions. Cover hook order with unit tests. |
| Change blocker | Broad delegated listeners distributed across feature files | Multiple modules register document-level `click`, `change`, `input`, `keydown`, drag, drop, and toggle listeners. | New actions can conflict or fire twice, especially when versioned modules install overlapping handlers. | Consolidate action routing into a small dispatcher keyed by `data-action`, `data-modal`, and `data-nav`. Feature modules should register named handlers with the dispatcher. |
| Dispensable | Repeated injected CSS blocks and historical visual overrides | Many `injectV*Styles` functions append large `<style>` blocks while `frontend/src/styles.css` is already the shared stylesheet. | Obsolete CSS stays active, increases cascade complexity, and makes visual defects hard to locate. | Move stable styles into `frontend/src/styles.css` by surface. Delete superseded injected CSS after visual/functional snapshots pass. Keep runtime style injection only for true compatibility or diagnostics. |
| Dispensable | Legacy mojibake and icon cleanup paths remain in normal rendering | `main.js` still defines menu icons with mojibake glyphs while `icon-service.js` later replaces legacy symbols. | The app renders incorrect source values first, then relies on cleanup. That adds noise and hides real icon ownership. | Replace legacy icon literals at source with stable icon names or service calls. Then shrink `icon-service.js` to migration-only cleanup for saved/old markup. |
| Dispensable | TODO and historical comments preserve migration context but not current ownership | `main.js` starts with a TODO to continue splitting the original single-file app; several files state they were split from a legacy script. | Comments explain history but do not identify the next owner or extraction boundary. | Convert broad TODOs into tracked refactor tasks in this document or issue backlog. Keep only comments that explain current behavior or migration constraints. |
| Coupler | Feature modules depend on shared globals instead of explicit inputs | Frontend modules directly use `state`, `saveState`, `renderAll`, `currentPage`, `window.SmartBooksPersistence`, and global helpers such as `money`, `num`, and `escapeHTML`. | Functions are difficult to unit test and cannot be safely reused without the full browser app loaded. | Pass dependencies through module installers or function parameters. Move shared formatting and accounting helpers into services with explicit exports on `window.SmartBooks*` only at the boundary. |
| Coupler | Persistence is partly abstracted but still leaks to app code | `main.js` and `stability-and-api.js` still read and write `localStorage` directly alongside `SmartBooksPersistence`. | Backend, hybrid, and local modes are harder to reason about because storage behavior has multiple owners. | Route all app storage through `frontend/src/services/storage-service.js`. Keep direct `localStorage` access only inside storage service tests or migration helpers. |
| Coupler | UI rendering, state mutation, and accounting workflow actions are interleaved | Functions such as invoice/payment/bill/dashboard flows often mutate `state`, call `saveState`, render, and show toasts in the same branch. | Business rules cannot be validated without DOM behavior, and UI changes may alter accounting side effects. | Extract command services for accounting mutations, return result objects, and let UI handlers perform render/toast behavior. Expand unit tests around mutation results before moving UI code. |

## Recommended Fix Sequence

1. Freeze behavior with focused tests before each extraction.
2. Pick one surface at a time, starting with dashboard cash-flow, invoice summary, and expense cards because they show clear repeated versions.
3. Extract pure calculations first: date ranges, totals, axis values, status grouping, and display rows.
4. Replace version-numbered render functions with one canonical named implementation.
5. Move stable CSS from injected blocks into `styles.css`, then remove the superseded injector.
6. Introduce explicit app lifecycle hooks to replace monkey patching in `stability-and-api.js`.
7. Encapsulate persistence so app code stops touching `localStorage` directly.

## Definition Of Done For Each Refactor

| Refactor Area | Done When |
| --- | --- |
| Extracted helper | Has a descriptive non-versioned name, receives explicit inputs, and has unit coverage when logic is non-trivial. |
| Render extraction | Preserves existing selectors used by functional tests and escapes display data at the render boundary. |
| CSS consolidation | Uses shared classes in `styles.css`; no superseded runtime style block remains for that surface. |
| Runtime hook replacement | Hook order is explicit, covered by tests, and does not depend on script load side effects. |
| Persistence cleanup | All load/save/backup calls go through `SmartBooksPersistence` or `storage-service.js`. |
