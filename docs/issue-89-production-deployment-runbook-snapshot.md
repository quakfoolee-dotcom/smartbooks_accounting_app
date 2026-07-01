# Issue 89 Production Deployment Runbook Snapshot

Date: 2026-07-01

## Objective

Create a production deployment runbook that covers environment setup, release steps, smoke tests, rollback, and post-deploy monitoring.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Deployment runbook | Production guidance existed across release, persistence, and backend environment docs, but no single runbook covered the deployment sequence. | `docs/production-deployment-runbook.md` now provides a clean checkout-to-post-deploy operator flow. |
| Environment setup | Backend environment requirements were documented, but not assembled into deployment readiness steps. | The runbook lists runtime settings, frontend/backend persistence configuration, and readiness expectations. |
| Smoke tests | Operators had manual endpoint probes and Pages smoke, but no backend production-smoke command. | `npm run smoke:backend` verifies liveness, readiness, state read/write, readback, and metrics using the real backend server with temporary storage. |
| Stateful release safety | Backup expectations were described in production persistence docs but not in release order. | The runbook includes pre-deploy backup, revision recording, and safe restore expectations before stateful releases. |
| Rollback and triage | Rollback guidance was scattered and mostly implied by troubleshooting docs. | The runbook includes rollback scenarios for frontend, backend, readiness degradation, bad state writes, and failed migrations. |
| Release checklist | Deployment changes called out only Pages smoke. | `docs/release-checklist.md` now includes backend production smoke and links to the runbook. |

## Runbook Coverage

| Section | Coverage |
|---|---|
| Pre-deploy readiness | Branch hygiene, dependencies, runtime version, environment docs, and stateful-change review. |
| Runtime settings | `PORT`, `SMARTBOOKS_DATA_DIR`, smoke company ID, frontend persistence mode, backend endpoint, and company ID. |
| Local quality gate | `npm run check`, `npm test`, `npm run coverage:check`, `npm run test:functional`, `npm run smoke:backend`, and Pages smoke. |
| Pre-deploy backup | Storage identification, state copy, revision recording, restore-path verification, and write freeze guidance. |
| Deployment steps | Merge, deploy frontend, deploy backend, probe liveness/readiness/metrics/state, and run smoke tests. |
| Monitoring | Live, ready, metrics, frontend console, and state save signals. |
| Rollback | Static frontend, backend process, readiness degradation, bad state write, and failed migration rollback paths. |
| Incident triage | Backend startup, save failure, revision conflict, Pages smoke failure, and unsafe metrics checks. |

## Backend Smoke Gates

| Gate | Verified Behavior |
|---|---|
| Liveness | `GET /api/live` returns `ok:true` and `status:live`. |
| Readiness | `GET /api/ready` returns `ok:true`, `status:ready`, and persistence status `pass`. |
| State read | `GET /api/state` returns a state envelope and request ID. |
| Revision-safe save | `PUT /api/state` uses the current revision and receives a new backend revision. |
| Saved state readback | A second `GET /api/state` returns the saved company state. |
| Metrics | `GET /api/metrics` includes live, ready, state read, and state write route counters with zero failures. |

## QC Results

| Check | Result |
|---|---|
| Backend production smoke | Passed: `npm run smoke:backend` |
| Syntax and docs check | Passed: `npm run check` |
