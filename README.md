# SmartBooks Accounting App

<p align="left">
  <img src="docs/assets/smartbooks-logo.svg" alt="SmartBooks Accounting App logo" width="420">
</p>

SmartBooks is a browser-based accounting app prototype for small-business workflows. It started as a single HTML file and has been refactored into a maintainable app structure with separate frontend, backend, shared constants, unit tests, functional Playwright tests, GitHub Actions CI, GitHub Pages deployment, and live-site smoke testing.

The current app is still a demo/prototype. It uses browser `localStorage` for app data, so it is useful for testing workflows and UI behavior, but it is not yet a production accounting system.

## Live Demo

Public GitHub Pages test deployment:

```text
https://quakfoolee-dotcom.github.io/smartbooks_accounting_app/
```

Important: the public demo stores data in your browser only. Do not enter real customer records, private company data, credentials, tax records, or production accounting information.

## Current Capabilities

- Dashboard with business feed, cash flow, invoice, expense, setup, and accounting summary widgets.
- Left rail and sidebar navigation with customizable menu order, visibility, and bookmarks.
- Dashboard layout customization with save, cancel, reset, and widget ordering controls.
- Global search for records, workflows, reports, and fallback suggestions.
- Core accounting demo workflows:
  - create invoice
  - receive payment
  - record expense
  - create bill
  - pay bill
  - review bank transaction
  - open reports
- Local data utilities:
  - export JSON
  - reset demo company data
- Icon normalization layer that replaces legacy mojibake/emoji glyphs with stable inline SVG icons.
- Browser-level functional tests for high-risk workflows.
- Live GitHub Pages smoke test after deployment.

## Technology Stack

- Frontend: plain HTML, CSS, and classic browser JavaScript.
- Backend: small Node.js HTTP server for local static serving and future API-backed persistence.
- Persistence today: browser `localStorage`.
- Tests: Node.js unit tests and Playwright Chromium functional tests.
- CI/CD: GitHub Actions.
- Deployment: GitHub Pages from the `frontend/` folder.

No frontend build step is required today. The app is served directly from `frontend/index.html` and ordered classic scripts.

## Repository Layout

```text
.github/
  dependabot.yml
  workflows/
    ci.yml
    deploy-pages.yml
    pages-smoke.yml
backend/
  src/
    server.js
  data/
docs/
  assets/
    smartbooks-logo.svg
    ui-ux-audit/
    user-manual/
  business-logic-test-cases.md
  codebase-health-audit.md
  navigation-settings-architecture.md
  release-checklist.md
  release-workflow.md
  style-conventions.md
  migration-notes.md
  testing-checklist.md
  testing-strategy.md
  ui-ux-audit.md
  user-manual.md
  visual-snapshot-testing-plan.md
frontend/
  index.html
  src/
    features/
      dashboard-widgets.js
      menu-customization.js
      navigation-search.js
      record-workflows.js
      sales-tax-inventory-ui.js
      sidebar-navigation.js
      workflows-and-reporting.js
    runtime/
      stability-and-api.js
    services/
      accounting-service.js
      icon-service.js
      navigation-model.js
      storage-service.js
    main.js
    styles.css
shared/
  constants.js
scripts/
  run-coverage.js
tests/
  functional/
    accessibility-and-visual.spec.js
    accounting-workflows.spec.js
    customize-menu.spec.js
    dashboard-customization.spec.js
    global-search.spec.js
    pages-smoke.spec.js
    startup-navigation.spec.js
    support/
      smartbooks-app.js
    snapshots/
      ui-contract-baseline.json
    ui-contract-snapshots.spec.js
    utilities.spec.js
  unit/
    accounting-service.test.js
    services.test.js
playwright.config.js
playwright.pages.config.js
package.json
```

## Local Setup

Install dependencies:

```powershell
npm install
```

Start the local app server:

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

The server also exposes a basic health endpoint:

```text
http://localhost:3000/api/health
```

## Test Commands

Run syntax checks:

```powershell
npm run check
```

Run documentation link and screenshot-asset checks:

```powershell
npm run docs:check
```

Run unit tests:

```powershell
npm test
```

Run focused business logic and accounting workflow tests:

```powershell
npm run test:business
```

Generate a service coverage report:

```powershell
npm run coverage
```

Run structured UI contract snapshot tests:

```powershell
npm run test:ui-contracts
```

Run local browser functional tests:

```powershell
npm run test:functional
```

Run local browser functional test shards:

```powershell
npm run test:functional:ui
npm run test:functional:accounting
npm run test:functional:persistence
npm run test:functional:performance
```

Run the deployed GitHub Pages smoke test:

```powershell
npm run test:pages-smoke
```

Run the normal local release gate:

```powershell
npm run test:all
```

Run the local app CI gate:

```powershell
npm run test:ci
```

What each command covers:

- `npm run check` verifies documentation links/assets and JavaScript syntax across app files, Playwright configs, unit tests, and functional tests.
- `npm run docs:check` verifies local Markdown links and user-manual screenshot assets.
- `npm test` validates service-level behavior such as navigation normalization, bookmark mapping, storage handling, icon inference, accounting totals, ledger balance, payment clamping, and bank-feed posting lines.
- `npm run test:business` runs accounting service tests plus browser workflow tests for invoices, payments, expenses, bills, bank feed, deposits, and reports.
- `npm run coverage` runs the unit suite through `c8` and writes service coverage reports to `coverage/`.
- `npm run coverage:check` applies the current service coverage thresholds for local quality review.
- `npm run test:ui-contracts` verifies the approved structured UI contract snapshot for startup navigation, optional shortcuts, and Manage menu defaults.
- `npm run test:functional` starts the local Node server and runs Chromium workflow tests against startup, navigation, Customize, dashboard layout, search, accounting workflows, accessibility, visual regressions, and utilities.
- `npm run test:functional:ui` runs the UI, navigation, search, accessibility, visual, utility, and UI contract shard.
- `npm run test:functional:accounting` runs invoice, payment, expense, bill, deposit, bank-feed, and report workflows.
- `npm run test:functional:persistence` runs backend and hybrid storage runtime workflows.
- `npm run test:functional:performance` runs startup, backend, API, and large-state performance budgets.
- `npm run test:functional:ci` runs all functional shards sequentially for local CI parity.
- `npm run test:pages-smoke` opens the live GitHub Pages URL and checks for load failures, browser errors, visible mojibake, sidebar chevrons, Manage menu, and Reports navigation.
- `npm run test:ci` mirrors the local app CI gate by running `check`, unit tests, coverage threshold checks, and the local functional browser shards.
- `npm run test:all` runs `check`, unit tests, and local functional tests.

For the full testing strategy, coverage map, and rules for adding new tests, see:

```text
docs/testing-strategy.md
```

## GitHub Actions

This repository uses five GitHub automation layers:

- `SmartBooks CI`
  - Runs on pushes and pull requests to `main`.
  - Splits checks into syntax, documentation, unit, service coverage, and functional browser jobs.
  - Publishes a final `CI Result` job for branch protection.
  - Runs service coverage thresholds and uploads a `coverage-report` artifact.
  - Uploads Playwright failure artifacts when browser tests fail.

- `Deploy SmartBooks Pages`
  - Runs after `SmartBooks CI` succeeds on `main`.
  - Deploys the exact commit that passed CI.
  - Publishes the `frontend/` folder to GitHub Pages.

- `Live Pages Smoke`
  - Runs after Pages deployment succeeds.
  - Can be triggered manually with an optional target URL.
  - Also runs weekly.
  - Verifies the public deployed app loads cleanly.

- `Dependabot Updates`
  - Checks npm dependencies weekly.
  - Groups development dependency updates.

## Branch And PR Workflow

The `main` branch is protected by repository rules.

Expected workflow:

1. Create a feature branch.
2. Commit changes to that branch.
3. Open a pull request into `main`.
4. Wait for `SmartBooks CI / CI Result` to pass.
5. Merge the pull request.
6. Confirm Pages deploy and Live Pages Smoke succeed on `main`.

Direct pushes to `main` are blocked by design.

Detailed release steps live in:

```text
docs/release-workflow.md
```

The CI quality gate reference lives in:

```text
docs/ci-quality-gate.md
```

The practical pre-merge and post-merge checklist lives in:

```text
docs/release-checklist.md
```

## Deployment

GitHub Pages deploys from the `frontend/` directory. The app uses relative script and stylesheet paths, so it works under the repository Pages path:

```text
/smartbooks_accounting_app/
```

After a successful merge to `main`, the normal deployment chain is:

```text
SmartBooks CI -> Deploy SmartBooks Pages -> Live Pages Smoke
```

If Pages deployment fails, check:

- repository visibility and Pages availability
- Settings -> Pages -> Source is `GitHub Actions`
- Settings -> Actions -> Workflow permissions allow Pages deployment
- `Deploy SmartBooks Pages` logs

## Manual Testing

Use the manual checklist before larger releases:

```text
docs/testing-checklist.md
```

The starter user manual provides a step-by-step invoice and payment walkthrough with screenshots:

```text
docs/user-manual.md
```

Focus areas:

- sidebar and rail navigation
- bookmarks
- Manage menu customization
- dashboard layout customization
- global search
- invoice/payment/expense/bill workflows
- bank transaction review
- report rendering
- export/reset utilities
- deployed-site icon and mojibake checks

## Business Logic Test Cases

The business-rule matrix for accounting workflows is documented here:

```text
docs/business-logic-test-cases.md
```

It defines expected saved records, ledger effects, and UI/report outcomes for invoices, payments, expenses, bills, bank feed, sales tax, reports, and utilities.

## Code Style Conventions

Use the project style guide before adding or refactoring app code:

```text
docs/style-conventions.md
```

It covers module ownership, JavaScript patterns, state handling, rendering/event conventions, icon rules, CSS/UI patterns, testing expectations, pull request workflow, and documentation rules.

The sidebar, Manage menu, and optional Settings/Setup/My Apps shortcut rules are documented here:

```text
docs/navigation-settings-architecture.md
```

The structured UI snapshot plan and future pixel snapshot path are documented here:

```text
docs/visual-snapshot-testing-plan.md
```

## UI/UX Audit

The current UI/UX audit and design-stabilization plan are documented here:

```text
docs/ui-ux-audit.md
```

It covers current strengths, prioritized design findings, recommended UI improvement sequence, and snapshot-readiness criteria.

## Codebase Health

The current maintainability audit is documented here:

```text
docs/codebase-health-audit.md
```

It lists the highest-risk modules, completed test-suite organization work, and the recommended refactor sequence.

The refactoring code-smells audit is documented here:

```text
docs/refactoring-code-smells-audit.md
```

It maps the codebase to the four smell categories from the refactoring guide: bloaters, change blockers, dispensables, and couplers.

## Data And Security Notes

- `backend/data/*.json` is ignored and should not be committed.
- `test-results/` and `playwright-report/` are ignored.
- Do not commit API keys, credentials, customer data, payroll data, tax records, or real accounting files.
- The public GitHub Pages app is for testing only.
- Browser data can be cleared with the app's reset utility or through browser storage tools.

Backend persistence production setup is documented here:

```text
docs/production-backend-environment.md
```

It covers runtime settings, HTTPS, storage paths, backup expectations, secrets, logs, monitoring, and the remaining gaps that block real customer data.

Persistence diagnostics UI improvements are documented here:

```text
docs/issue-49-persistence-diagnostics-snapshot.md
```

It records the before/after behavior for retry actions, fallback guidance, local safety copies, and backend warning coverage.

Setup, settings, and persistence admin flow polish is documented here:

```text
docs/issue-53-admin-flow-polish-snapshot.md
```

It records the before/after behavior for dashboard admin grouping, setup task states, settings sections, and hidden-module setup guidance.

Database persistence adapter contract planning is documented here:

```text
docs/database-persistence-adapter-contract.md
docs/issue-52-database-adapter-contract-snapshot.md
```

It defines the future Supabase/PostgreSQL adapter boundary, proposed tables, revision and backup rules, open decisions, and the #52 before/after report.

Critical persistence/admin snapshot guidance is documented here:

```text
docs/persistence-snapshot-guide.md
docs/issue-58-persistence-snapshot-documentation.md
```

It defines the reusable before/after snapshot format for persistence roadmap work and indexes the current persistence/admin reports.

## Architecture Notes

The frontend preserves the original localStorage behavior while separating responsibilities:

- `frontend/src/main.js` initializes the app core and legacy workflows.
- `frontend/src/services/icon-service.js` repairs mojibake text and normalizes icons into inline SVG.
- `frontend/src/services/navigation-model.js` owns menu ordering, visibility, and bookmark mapping.
- `frontend/src/services/storage-service.js` owns browser persistence.
- `frontend/src/features/*` modules extend app areas such as dashboard widgets, menu customization, search, sidebar navigation, and accounting workflows.
- `frontend/src/runtime/stability-and-api.js` centralizes final runtime reconciliation and backend-ready API behavior.
- `backend/src/server.js` serves the frontend locally and provides starter API endpoints for future state persistence.

## Known Limitations

- Data is stored in browser `localStorage`, not a real database.
- No authentication or user accounts yet.
- No multi-company backend persistence yet.
- GitHub Pages serves only the static frontend; the Node backend is for local development and future hosting.
- Accounting logic is demo-grade and should be reviewed before any production use.

## Suggested Roadmap

Near-term:

- Continue live manual QA using `docs/testing-checklist.md`.
- Improve any remaining UI/workflow defects discovered on the Pages site.
- Add more focused tests when bugs are found.

Next architecture step:

- Move persistence from browser-only `localStorage` toward backend API-backed state.
- Add authentication and company/user boundaries before storing real data.
- Add database-backed persistence once data contracts stabilize.

Production-readiness step:

- Add a real hosting target for the Node backend.
- Add environment-based configuration.
- Add security review, audit logging, backups, and data export/import hardening.
