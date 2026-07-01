# Issue 85 Persistence Integration Snapshot

Date: 2026-07-01

## Objective

Add integration coverage that proves SmartBooks persistence modes preserve the browser-to-backend contract across local, backend, and hybrid storage paths.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Local mode isolation | Backend and hybrid paths were well covered, but local mode did not have a focused guard proving configured backend settings stay unused. | Unit coverage now proves local mode reads and writes only `localStorage`, even when a backend endpoint and company ID are configured. |
| Browser-to-server headers | Unit tests verified backend headers, but the functional browser flow did not assert that company and request headers crossed the Playwright API boundary. | The backend runtime Playwright test now captures live API requests and verifies company ID, request ID, and revision headers. |
| Company scope | Backend tests mostly used the default `demo-company` scope. | The primary backend runtime test now uses `sb_company_id=playwright-company` and verifies the same scope in request headers and saved envelopes. |
| Revision continuity | Functional coverage already checked revision persistence through save payloads. | Functional coverage also confirms the `X-SmartBooks-State-Revision` header is sent with the save request. |
| Documentation | Issue evidence was spread across unit and functional test files. | This snapshot records the mode matrix, before/after behavior, and validation commands for future production readiness work. |

## Persistence Mode Coverage

| Mode | Covered Behavior | Validation Surface |
|---|---|---|
| Local | Loads and saves local browser state without backend reads or writes. | `tests/unit/storage-backend-service.test.js` |
| Backend | Loads startup state from `/api/state`, saves runtime edits through PUT, carries company ID, request ID, and revision headers, and preserves backend revision. | `tests/functional/persistence-runtime.spec.js` and `tests/unit/storage-backend-service.test.js` |
| Hybrid | Migrates local state to an empty backend after confirmation, supports decline, keeps local mode active on migration save failure, and keeps a local copy when backend save fails. | `tests/functional/persistence-runtime.spec.js` and `tests/unit/storage-backend-service.test.js` |
| Error handling | Backend load failure avoids saving fallback/demo data, revision conflicts surface reload guidance, invalid backend envelopes fall back safely, and conflict metadata is preserved. | `tests/functional/persistence-runtime.spec.js` and `tests/unit/storage-backend-service.test.js` |

## QC Results

| Check | Result |
|---|---|
| Storage backend unit tests | Passed: `node tests/unit/storage-backend-service.test.js` |
| Backend state API unit tests | Passed: `node tests/unit/backend-state-api.test.js` |
| Syntax and docs check | Passed: `npm run check` |
| Persistence functional shard | Passed: `npm run test:functional:persistence`, 7/7 |
