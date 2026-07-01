# SmartBooks Production Deployment Runbook

Use this runbook before deploying SmartBooks to a hosted environment or enabling backend persistence outside local development. Backend persistence remains opt-in and must not store real customer accounting data until the remaining gates in `docs/production-persistence-hardening.md` are complete.

## 1. Pre-Deploy Readiness

| Area | Action | Expected Result |
|---|---|---|
| Branch | Start from a clean branch based on current `main`. | `git status --short` has no unrelated changes. |
| Dependencies | Install dependencies from `package-lock.json`. | `npm install` completes without dependency drift. |
| Runtime | Confirm Node.js meets `package.json` engines. | Node.js is version 18 or newer. |
| Environment | Review `docs/production-backend-environment.md`. | Required backend and frontend settings are known for the target host. |
| Persistence | Confirm whether this release changes state storage. | Stateful changes have backup and rollback notes. |

## 2. Required Runtime Settings

| Setting | Required For | Expected Value |
|---|---|---|
| `PORT` | Backend hosting | Platform-provided port or explicit service port. |
| `SMARTBOOKS_DATA_DIR` | Backend persistence | Private persistent storage outside the repository checkout. |
| `SMARTBOOKS_SMOKE_COMPANY_ID` | Optional smoke override | Stable company scope used only for deployment smoke checks. |
| Frontend `sb_persistence` or `window.SMARTBOOKS_PERSISTENCE_MODE` | Backend or hybrid storage | `local`, `backend`, or `hybrid`. Keep `local` unless intentionally testing backend persistence. |
| Frontend `sb_backend_endpoint` or `window.SMARTBOOKS_BACKEND_ENDPOINT` | Split frontend/backend hosting | Absolute deployed API state endpoint, such as `https://api.example.com/api/state`. |
| Frontend `sb_company_id` or `window.SMARTBOOKS_COMPANY_ID` | Backend or hybrid storage | Company scope approved for the deployment test. |

## 3. Local Quality Gate

Run these before opening or updating the deployment PR:

```powershell
npm run check
npm test
npm run coverage:check
npm run test:functional
```

For deployment or public runtime changes, also run:

```powershell
npm run smoke:backend
npm run test:pages-smoke
npm run test:deployment-smoke
```

Expected results:

| Command | Expected Result |
|---|---|
| `npm run check` | Documentation links pass and all checked JavaScript files parse. |
| `npm test` | Unit suite passes. |
| `npm run coverage:check` | Coverage thresholds pass. |
| `npm run test:functional` | Local Playwright functional suite passes. |
| `npm run smoke:backend` | Liveness, readiness, state read/write, readback, and metrics gates pass. |
| `npm run test:pages-smoke` | Deployed/public Pages smoke passes for the configured target URL. |
| `npm run test:deployment-smoke` | Deployed/public app loads, persists isolated local test state, posts a money-in workflow, reloads, and preserves the paid invoice state. |

## 4. Pre-Deploy Backup

Before deploying a change that can alter backend state:

| Step | Action |
|---|---|
| Identify storage | Confirm the active `SMARTBOOKS_DATA_DIR` and backup directory. |
| Preserve current state | Copy `smartbooks-state.json` and the `backups/` directory to a private backup location. |
| Record revision | Read `GET /api/state` for the deployment company and record the current revision. |
| Verify restore path | Confirm an operator can restore the backup without overwriting newer state. |
| Freeze risky writes | Avoid imports, restores, or large migrations while deployment is in progress. |

## 5. Deployment Steps

| Step | Action | Validation |
|---|---|---|
| 1 | Merge the deployment PR after GitHub CI passes. | `SmartBooks CI / CI Result` is green. |
| 2 | Deploy static frontend assets. | `Deploy SmartBooks Pages` succeeds when Pages is the target. |
| 3 | Deploy or restart backend service. | Process starts without storage permission errors. |
| 4 | Verify liveness. | `GET /api/live` returns `ok:true`. |
| 5 | Verify readiness. | `GET /api/ready` returns `status:ready`; if it returns `degraded`, remove the backend from traffic. |
| 6 | Verify metrics. | `GET /api/metrics` returns request counters without secrets or filesystem paths. |
| 7 | Verify state route. | `GET /api/state` returns the expected company scope and revision. |
| 8 | Run smoke tests. | Backend smoke, Pages smoke, and deployment workflow smoke pass. |

## 6. Post-Deploy Monitoring

Monitor these signals for at least one normal usage window after deployment:

| Signal | Watch For | Response |
|---|---|---|
| `/api/live` | Non-200 response or timeout. | Restart service or roll back host deployment. |
| `/api/ready` | `503` or `status:degraded`. | Remove backend from traffic and inspect storage permissions/volume health. |
| `/api/metrics` | Rising failures, repeated state route errors, or high request duration. | Correlate by request IDs and inspect backend logs. |
| Frontend console | Broken assets, startup errors, or persistence warnings. | Compare with local reproduction and Pages diagnostics. |
| State saves | Revision conflicts or failed writes. | Reload latest state before retrying; do not force overwrite. |

## 7. Rollback

| Scenario | Safe Rollback |
|---|---|
| Static frontend regression | Revert or redeploy the last known good Pages artifact/commit, then rerun live Pages smoke. |
| Backend process regression | Roll back backend service to the last known good image/commit while keeping the current state directory intact. |
| Readiness degradation | Remove the backend from traffic, preserve current state files, inspect storage permissions, then restart or roll back. |
| Bad state write | Do not overwrite immediately. Export current state, compare revision and backup, then use the documented restore endpoint only with the expected current revision. |
| Failed migration | Keep local fallback/session copies, stop further migration attempts, restore from pre-deploy backup only after confirming target company and revision. |

## 8. Incident Triage

| Symptom | First Checks |
|---|---|
| Backend will not start | `PORT`, Node version, `SMARTBOOKS_DATA_DIR`, service account file permissions, backend logs. |
| Save fails | Request ID, company ID, current revision, storage volume health, metrics failure counters. |
| Revision conflict | Current backend revision versus client revision; reload before saving again. |
| Pages smoke fails | Deployment URL, expected commit SHA, browser console, `pages-smoke-diagnostics` artifact. |
| Metrics look unsafe | Confirm responses do not expose secrets, filesystem paths, or full payload state. |

## 9. Evidence To Keep

Record this evidence in the PR, release notes, or deployment ticket:

| Evidence | Example |
|---|---|
| Commit or PR | Deployment PR number and merge SHA. |
| Local validation | Commands run and pass/fail results. |
| Backend smoke | Output from `npm run smoke:backend`. |
| GitHub Actions | `SmartBooks CI`, Pages deploy, and Live Pages Smoke results. |
| State safety | Backup location, company scope, and pre-deploy revision for stateful releases. |

## Related Docs

| Doc | Purpose |
|---|---|
| `docs/backend-persistence-deployment-topology.md` | Backend persistence topology, supported modes, migration path, backup expectations, and rollback checklist. |
| `docs/production-backend-environment.md` | Backend environment variables, persistence endpoints, and operational requirements. |
| `docs/production-persistence-hardening.md` | Remaining gates before real production accounting data. |
| `docs/release-checklist.md` | Release validation checklist and evidence template. |
| `docs/playwright-ci-diagnostics.md` | How to inspect browser failure artifacts. |
| `docs/persistence-contract.md` | Backend persistence envelope and revision contract. |
