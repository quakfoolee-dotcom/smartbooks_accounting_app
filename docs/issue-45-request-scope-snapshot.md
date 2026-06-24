# Issue 45 Request Scope Snapshot

Date: 2026-06-24

## Objective

Add a request identity and company scoping guard before deeper backend/database persistence work.

## Critical Snapshots

| Step | Snapshot | Result |
|---|---|---|
| Before | `/api/state` accepted reads/writes without an explicit request company header and defaulted missing company identity to `demo-company`. | Risk: future backend/database mode could accidentally read or overwrite another company's state. |
| Backend guard | `backend/src/server.js` now requires `X-SmartBooks-Company-Id`, accepts/generates `X-SmartBooks-Request-Id`, rejects malformed scopes, rejects payload/request company mismatch, and blocks cross-company read/write against an existing state file. | Backend state access is explicitly company-scoped. |
| Frontend propagation | `frontend/src/services/storage-service.js` sends company and request headers on backend/hybrid load and save. `frontend/src/main.js` allows `sb_company_id`, `companyId`, or `window.SMARTBOOKS_COMPANY_ID` to configure scope. | Normal app backend persistence still works while carrying scope metadata. |
| Tests | Backend API and storage service tests now cover missing scope, mismatched payload scope, cross-company blocking, and outgoing request headers. | Regression coverage exists for the new persistence boundary. |

## QC Results

| Check | Result |
|---|---|
| Focused backend API unit test | Passed: `node tests/unit/backend-state-api.test.js` |
| Focused storage backend unit test | Passed: `node tests/unit/storage-backend-service.test.js` |
| `npm run check` | Passed |
| `npm test` | Passed |
| Persistence/performance functional specs | Passed: `npx playwright test tests/functional/persistence-runtime.spec.js tests/functional/performance.spec.js` |
| Accounting workflow rerun | Passed: `npx playwright test tests/functional/accounting-workflows.spec.js:242` after one unrelated flaky full-suite failure |
| Full functional suite | Passed: `npm run test:functional`, 31/31 |

## Follow-Up

This completes the first company-scope guard for the current file-backed backend state. The next persistence-hardening task should be optimistic revision conflict handling so stale browser sessions cannot overwrite newer backend state.
