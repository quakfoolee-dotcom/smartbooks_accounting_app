# SmartBooks Accounting App

SmartBooks has been converted from a single HTML file into a basic app development structure.

## Live App

The public test deployment is hosted on GitHub Pages:

```text
https://quakfoolee-dotcom.github.io/smartbooks_accounting_app/
```

The deployed app uses browser localStorage for demo data. Do not enter private customer records, credentials, or production accounting data into the public test site.

## Run Locally

```powershell
npm start
```

Then open:

```text
http://localhost:3000
```

## Test Commands

```powershell
npm run check
npm test
npm run test:functional
npm run test:pages-smoke
npm run test:all
```

- `npm run check` verifies JavaScript syntax across app, test, and Playwright config files.
- `npm test` runs unit tests for shared services.
- `npm run test:functional` runs local Chromium workflow tests against the Node server.
- `npm run test:pages-smoke` verifies the deployed GitHub Pages site loads cleanly.
- `npm run test:all` runs the normal local release gate: syntax, unit, and local functional tests.

## GitHub Workflows

- `SmartBooks CI` runs on pushes and pull requests to `main`. It installs dependencies, installs Chromium, runs syntax checks, unit tests, and local Playwright functional tests.
- `Deploy SmartBooks Pages` runs after `SmartBooks CI` succeeds on `main` and publishes the `frontend/` folder to GitHub Pages.
- `Live Pages Smoke` runs after the Pages deploy, can be started manually, and also runs weekly. It checks the public Pages site for load failures, console/page errors, visible mojibake, sidebar chevrons, and the Manage menu.
- `Dependabot Updates` checks npm dependencies weekly.

The `main` branch is protected by repository rules. Changes should go through a pull request and pass `Check, Unit, and Functional Tests` before merging.

## Project Layout

```text
.github/
  workflows/
    ci.yml
    deploy-pages.yml
    pages-smoke.yml
frontend/
  index.html
  src/
    services/
      icon-service.js
      storage-service.js
    main.js
    features/
      sales-tax-inventory-ui.js
      workflows-and-reporting.js
      dashboard-widgets.js
      navigation-search.js
      record-workflows.js
    runtime/
      stability-and-api.js
    styles.css
backend/
  src/
    server.js
  data/
shared/
  constants.js
docs/
  migration-notes.md
  testing-checklist.md
tests/
  functional/
    smartbooks.spec.js
    pages-smoke.spec.js
  unit/
    services.test.js
```

The frontend currently preserves the original localStorage behavior. The backend is ready for the next step: replacing browser-only storage with API-backed persistence.

The JavaScript has been split into ordered classic scripts. `frontend/src/services/icon-service.js` normalizes legacy icon glyphs into inline SVG, `frontend/src/services/storage-service.js` owns browser persistence, `frontend/src/main.js` initializes the legacy app core, feature modules extend the UI and workflows, and `frontend/src/runtime/stability-and-api.js` installs the backend-ready API layer.

## Release Checklist

Use `docs/testing-checklist.md` before larger releases or after changes to navigation, dashboard customization, icons, workflows, or deployment.
