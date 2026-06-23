# SmartBooks Style Conventions

These conventions keep SmartBooks readable as it continues moving from a split-up legacy prototype toward a maintainable app. Follow them for new work and use them as the target direction when touching existing code.

## Guiding Principles

- Prefer small, focused changes over broad rewrites.
- Keep behavior close to the feature that owns it.
- Preserve working user workflows while improving structure incrementally.
- Make UI changes testable through unit or functional tests when the workflow is important.
- Avoid reintroducing mojibake, emoji-only controls, or one-off patch layers when a shared helper already exists.

## File Ownership

Use the existing folders as ownership boundaries:

- `frontend/src/services/`
  - Cross-feature logic with no direct page ownership.
  - Examples: navigation model, icon normalization, persistence.
- `frontend/src/features/`
  - User-facing workflow areas and feature-specific rendering/event behavior.
  - Examples: dashboard widgets, menu customization, search, sidebar navigation.
- `frontend/src/runtime/`
  - Final runtime reconciliation, compatibility, and app-wide integration glue.
  - Keep this small. Do not add feature-specific behavior here unless it truly coordinates multiple feature modules.
- `backend/src/`
  - Local server and future API-backed persistence.
- `tests/unit/`
  - Pure logic and service tests.
- `tests/functional/`
  - Browser-level workflows.
- `docs/`
  - Handoff, testing, architecture, and style guidance.

When a change touches more than one ownership area, describe why in the PR.

## JavaScript Style

- Use plain browser JavaScript. Do not introduce a framework or build step without an explicit architecture decision.
- Prefer `const` by default and `let` only when reassignment is needed.
- Keep functions small enough to scan. If a function grows because it handles multiple workflows, split out named helpers.
- Name helper functions by behavior, not version number. Existing `vNN` helpers are legacy migration artifacts; avoid adding new version-numbered names.
- Avoid large anonymous event handlers. Route actions to named functions when the behavior is more than a few lines.
- Prefer structured data and existing model helpers over parsing UI text.
- Escape user/display data with existing escaping helpers before inserting HTML.
- Keep DOM selectors stable and specific:
  - prefer `data-action`, `data-nav`, `data-id`, and named classes used by tests
  - avoid selectors based only on visible text when a stable attribute is available
- Do not silently swallow errors. If a catch is necessary, show a user-safe message or add diagnostic context for tests.

## State And Persistence

- Treat `state` as the current demo data model.
- Normalize settings before rendering when a feature depends on them.
- Keep defaults in shared helpers where possible, especially for navigation/menu/dashboard settings.
- Do not store private or production data in committed files.
- Do not commit `backend/data/*.json`.
- When adding a persistence-related feature, include:
  - default state behavior
  - save behavior
  - reset behavior
  - reload behavior

## Rendering And Events

- Render from state, then attach behavior through existing event delegation where possible.
- Prefer one app-level delegated listener for repeated controls over adding many per-row listeners.
- Use `data-action` for command buttons and `data-modal` for modal launchers.
- Keep save/cancel semantics explicit:
  - Save persists state.
  - Cancel does not persist state.
  - Restore defaults inside a modal should be clear about whether it is preview-only or immediate.
- Avoid hidden side effects during render. Rendering should not unexpectedly persist data.

## Icon And Text Conventions

- Use `SmartBooksIcons` for icon normalization.
- Avoid raw emoji and legacy mojibake glyphs in new UI.
- Icon-only buttons must keep an accessible name with `aria-label` or `title`.
- Icon-only buttons should not display their accessible label as visible text.
- Sidebar chevrons should stay `arrowRight`, not inherit module icons.
- If adding a new icon pattern, add it to `icon-service.js` and include a unit or functional test when it affects core navigation.

## CSS And UI Style

- Prefer shared CSS classes over inline styles for repeated UI.
- Use stable dimensions for icon buttons, toolbar controls, rows, and compact repeated components.
- Use `display: grid` or `inline-grid` with `place-items: center` for icon-only controls.
- Keep cards for real repeated items, modals, and framed tools. Avoid nesting cards inside cards.
- Avoid decorative gradients, blobs, or one-off visual effects that do not support the workflow.
- Keep operational screens dense, clear, and scan-friendly.
- Do not scale font size with viewport width.
- Make mobile and desktop layouts explicit with responsive constraints.
- When fixing visual regressions, add functional checks for computed layout or visible behavior when practical.

### Table Layout Decision Rule

- Do not place two direct `.table-card` sections side by side inside `.grid.two` for workflow pages. Each table creates its own horizontal scroll area and hides columns.
- Combine tables when they answer the same user question or represent the same workflow at different statuses. Use a `Type` or `Status` column plus filters/tabs when needed.
- Stack tables full-width when they are different object types, setup records, or parent-child data. Example: tax agencies should sit above tax codes rather than beside them.
- Keep two-column grids for compact summary cards, metrics, comparisons, and non-table guidance panels.
- Add a functional layout check when converting a high-risk workflow so the side-by-side table pattern does not come back quietly.

### Button Sizing Contract

- Command buttons use a shared 38px minimum height, pill radius, centered content, and consistent horizontal padding.
- Header, toolbar, modal footer, and quick-action buttons should use the shared `.btn` class and avoid one-off inline padding or height.
- Tab buttons (`.tab-btn`, `.ops-tab`, `.mini-tab`, `.gtd-tab`) should share the same height rhythm. Width can follow label length, but padding and vertical sizing should be consistent.
- Table action columns should use grouped action containers (`.tx-actions`, `.row-actions`, `.table-actions`, `.invoice-actions`, `.estimate-actions`, `.v49-actions`, or `.v49-estimate-row-actions`) so action buttons normalize to a predictable compact width and height.
- Icon-only controls should be square, centered, and accessible through `aria-label` or `title`. Do not show helper words like "Close" inside icon-only controls.
- Avoid using `.btn.square` as a catch-all. Text actions may be compact but should not become icon-size squares unless they are genuinely icon-only.

### UI Stabilization Baseline

- Runtime UI rules should live in one explicit styling mode, currently `body.v8-ui`.
- Shared page headers should use the same hierarchy:
  - page title and concise subtitle on the left
  - primary and secondary actions grouped on the right
  - actions wrap below the title on narrow screens
- Financial tables should use one scan pattern:
  - compact uppercase headers
  - stable row padding
  - right-aligned money columns
  - tabular numeric spacing
  - final-column row actions
- Modals should use one form rhythm:
  - consistent header/body/footer padding
  - icon-only close control
  - two-column form grid on desktop
  - single-column form grid on mobile
  - sticky footer for long forms
- Dashboard and report controls should use shared button sizing and avoid one-off icon dimensions.
- Do not add new version-numbered CSS patches unless they replace or consolidate an older behavior. Prefer improving the shared baseline layer.

### Design System Hardening Queue

Use this sequence when improving UI consistency:

1. Normalize controls first: shared `.btn`, icon-only square controls, tab height, and action group sizing.
2. Normalize table layouts next: avoid two table cards side by side, right-align money, and keep row actions predictable.
3. Normalize theme contrast after the layout is stable: light and dark mode tokens should keep body text, muted text, metrics, chart labels, and table headers readable.
4. Add or update functional checks for each repeated rule.
5. Move to pixel snapshots only after the structured UI contract is stable.

The design goal is a quiet accounting workspace: dense, scannable, predictable, and consistent across workflows.

## Modal Conventions

- Modal open/close behavior should be deterministic.
- Submit buttons should be visible and enabled before tests click them.
- Form validation should leave clear user feedback.
- Required fields should have sensible demo defaults when the workflow test expects a quick save.
- After a successful save, the modal should close and state should persist.

## Testing Conventions

Use the lowest test level that catches the risk:

- Unit tests for pure helpers, normalization, storage, icon inference, and data mapping.
- Functional tests for user workflows and UI persistence.
- Live Pages smoke tests for deployed asset loading and public-site regressions.

Required local checks before opening a PR:

```powershell
npm run check
npm test
```

For app behavior changes, also run:

```powershell
npm run test:functional
```

For accounting workflow changes, also run:

```powershell
npm run test:business
```

For navigation/default-UI contract changes, also run:

```powershell
npm run test:ui-contracts
```

For deployment or public-site changes, also run:

```powershell
npm run test:pages-smoke
```

Functional tests should:

- clear SmartBooks localStorage before each test
- fail on console errors, page errors, and visible mojibake
- use stable selectors rather than brittle text-only selectors
- include enough diagnostics to explain failures in CI artifacts
- avoid depending on the live Pages site unless the test uses `playwright.pages.config.js`
- prefer structured UI contract snapshots before full pixel snapshots

## Git And Pull Requests

- Work on a feature branch. Direct pushes to `main` are blocked.
- Keep commits focused and named by outcome.
- PR descriptions should include:
  - what changed
  - why it changed
  - validation performed
  - any known follow-up
- Wait for `Check, Unit, and Functional Tests` before merging.
- After merge, confirm Pages deploy and Live Pages Smoke when the change can affect deployment or runtime UI.

## Documentation Conventions

- Update `README.md` when changing setup, workflows, deployment, or high-level architecture.
- Update `docs/testing-checklist.md` when adding or changing user workflows that need manual QA.
- Update this file when a convention becomes repeated practice.
- Prefer concise examples over broad theory.

## Refactoring Rules

- Refactor in small pieces with tests around risky behavior.
- Do not move code and change behavior in the same large edit unless necessary.
- When replacing legacy code, keep the old behavior covered by a functional test first.
- Delete obsolete compatibility code only after proving no current workflow depends on it.

## Definition Of Done

A change is ready when:

- the intended user behavior works locally
- relevant tests pass
- no visible mojibake or broken icons are introduced
- README/docs are updated if setup, deployment, or workflow changed
- the PR passes required GitHub checks
