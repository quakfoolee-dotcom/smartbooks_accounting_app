# Issue 90 Deployment Workflow Smoke Snapshot

Date: 2026-07-01

## Objective

Add a deployment smoke test that verifies a deployed SmartBooks app can load, persist isolated state, and complete a critical money-in workflow.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Deployment smoke depth | Live Pages smoke proved the app shell, assets, menu modal, and Reports navigation. | `npm run test:deployment-smoke` verifies startup, Sales navigation, invoice creation, payment receipt, Reports navigation, reload, and persisted paid invoice state. |
| Target configuration | Pages smoke used `SMARTBOOKS_PAGES_URL`. | Deployment workflow smoke can target `SMARTBOOKS_DEPLOYMENT_URL` or `SMARTBOOKS_PAGES_URL`; without either, it starts the local backend server on a smoke port. |
| Test data isolation | Deployed smoke avoided mutating app state beyond a few local UI interactions. | Workflow smoke clears browser/session storage in the test context, forces local persistence, and uses an isolated smoke company ID. |
| Failure signal | Deployed workflow issues could be mixed into broad functional tests or manual checks. | A dedicated Playwright config and command identify startup, assets, persistence, or money-in workflow failures. |
| CI automation | The Live Pages Smoke workflow only ran the lightweight Pages smoke. | The workflow now runs both `npm run test:pages-smoke` and `npm run test:deployment-smoke` against the deployed URL. |
| Documentation | Release docs listed Pages smoke and backend smoke but not a critical workflow smoke. | Release, testing strategy, and deployment runbook docs include the new workflow smoke command and expected coverage. |

## Smoke Coverage

| Gate | Verified Behavior |
|---|---|
| Startup | App shell, dashboard, and global search render at the target URL. |
| Assets | Document, script, and stylesheet responses do not fail. |
| Navigation | Sales and Reports routes activate through deployed UI controls. |
| Persistence | Local test state is written and survives a reload. |
| Money-in workflow | A new invoice is created, a payment is received, and the invoice becomes paid. |
| Clean runtime | Browser console/page errors and visible mojibake are treated as failures. |

## Commands

| Command | Purpose |
|---|---|
| `npm run test:deployment-smoke` | Run locally with an auto-started backend server. |
| `$env:SMARTBOOKS_DEPLOYMENT_URL="https://example.com/smartbooks/"; npm run test:deployment-smoke` | Run against a deployed preview or production URL. |
| `$env:SMARTBOOKS_DEPLOYMENT_COMPANY_ID="deployment-check"; npm run test:deployment-smoke` | Override the isolated smoke company ID. |

## QC Results

| Check | Result |
|---|---|
| Deployment workflow smoke | Passed: `npm run test:deployment-smoke`, 1/1 |
| Syntax and docs check | Passed: `npm run check` |
