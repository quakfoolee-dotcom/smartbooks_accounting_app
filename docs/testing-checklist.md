# SmartBooks Testing Checklist

Use this checklist before larger releases or after changes to navigation, icons, dashboard customization, workflows, or deployment.

## Automated Checks

- Confirm `SmartBooks CI / CI Result` passes on GitHub Actions.
- Confirm `Deploy SmartBooks Pages` succeeds after CI.
- Confirm `Live Pages Smoke` succeeds after Pages deploy.
- Run locally when changing app logic: `npm run test:all`.
- Run deployed-site smoke locally when checking production: `npm run test:pages-smoke`.

## Deployed Site Smoke

- Open `https://quakfoolee-dotcom.github.io/smartbooks_accounting_app/`.
- Confirm the dashboard loads with the topbar, left rail, sidebar, and dashboard widgets.
- Confirm sidebar chevrons show right arrows, not module icons.
- Confirm there is no visible mojibake text such as `â`, `Ã`, or `ðŸ`.
- Open the Manage menu and close it.
- Open the create menu and close it.

## Sidebar And Menu

- Confirm the default order starts with Get Things Done, Dashboards, and Reports, and does not show My Apps, Settings, or Setup Checklist until they are added from Manage.
- Open Customize from the rail.
- Add a bookmark with the star button, save, and verify it appears in Bookmarks.
- Cancel a bookmark change and verify it does not persist.
- Hide and restore a module.
- Move a module up, down, top, and bottom.
- Restore menu defaults.

## Dashboard Customization

- Open Customize dashboard layout.
- Move a dashboard widget and save.
- Reload the app and confirm the order persists.
- Move a widget and cancel, then confirm the order does not persist.
- Restore default dashboard layout.
- Confirm arrow controls are square icon buttons.

## Search

- Search for an invoice, customer, vendor, report, and workflow term.
- Use keyboard navigation with ArrowDown and Enter.
- Verify fallback suggestions appear for a no-result query.
- Open create invoice, payment, and expense workflows from search.

## Accounting Workflows

- Create an invoice.
- Receive a payment.
- Record an expense.
- Create a bill.
- Pay a bill.
- Review or categorize a bank transaction.
- Open reports and confirm report tables are populated.

## Utilities

- Export JSON and confirm a file downloads.
- Reset company data and confirm demo data returns.
- Confirm browser storage remains local and no private data is committed.

## Repository Safety

- Confirm `backend/data/*.json`, `test-results/`, and `playwright-report/` are ignored.
- Confirm no API keys, credentials, customer records, or private accounting data are committed before pushing.
