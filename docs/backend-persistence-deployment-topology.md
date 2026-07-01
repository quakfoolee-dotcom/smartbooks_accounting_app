# Backend Persistence Deployment Topology And Migration Path

Date: 2026-07-01

Use this guide when moving SmartBooks persistence from browser-only storage to backend file-backed storage, and later from file-backed storage to a database-backed adapter. This document describes the deployment topology and migration path. It intentionally links to the persistence contract and environment guides instead of repeating every API field.

## Recommended Production Topology

Backend persistence is still opt-in. For production-like deployments, the recommended target topology is:

| Layer | Recommended Role | Current Status |
|---|---|---|
| Frontend | Static SmartBooks app served from the deployment host or CDN. | Supported. GitHub Pages serves static-only mode; backend persistence needs a reachable API endpoint. |
| Backend API | Node.js service exposing state, backup, restore, liveness, readiness, and metrics endpoints. | Supported with file-backed persistence. |
| State store | Private persistent storage behind the backend service. | File-backed adapter is available; database-backed adapter is a future production target. |
| Backup store | Private backup location for state snapshots before migrations, restores, resets, and deploys. | File-backed backups exist under the data directory; retention policy remains a production gate. |
| Identity | Authenticated user and company context for every state request. | Company scope headers exist; real authentication and authorization remain future gates. |
| Monitoring | Liveness, readiness, metrics, logs, and request IDs. | `/api/live`, `/api/ready`, `/api/metrics`, and request IDs exist; structured logs and alerts remain future gates. |

Do not enter real customer, payroll, banking, tax, or credential data until the production gates in `docs/production-persistence-hardening.md` are complete.

## Supported Persistence Modes

| Mode | Storage Location | Use When | Production Notes |
|---|---|---|---|
| `local` | Browser `localStorage`. | Default demo/dev mode, static hosting, and safe fallback. | No server recovery. User data remains in the browser profile. |
| `hybrid` | Backend first, with local migration prompt when backend is empty. | Controlled migration from existing local browser state to backend state. | Use only after backup/export guidance is clear for the target company. |
| `backend` | Backend `/api/state` routes. | Production-like persistence validation, shared browser reload state, and future hosted state. | Requires `SMARTBOOKS_DATA_DIR`, company scope, backups, readiness checks, and rollback plan. |
| future `database` adapter | Backend service talks to PostgreSQL/Supabase-shaped storage. | Multi-company production readiness after auth, audit, migrations, and backup retention exist. | Not wired as a live runtime mode yet; see `docs/database-persistence-adapter-contract.md`. |

## Current Deployment Shapes

| Shape | Topology | Use Case | Risk To Watch |
|---|---|---|---|
| Static-only | Browser loads static frontend and uses `localStorage`. | Public demo, GitHub Pages, local product review. | No backend state, backup, or cross-browser continuity. |
| Single service | Node backend serves frontend assets and `/api/*`. | Local production-style smoke, small internal test deployment. | Persistent data directory must be private and outside the repo checkout. |
| Split frontend/backend | Static frontend points to an absolute backend API endpoint. | CDN/static host plus API service. | CORS, HTTPS, endpoint configuration, and company ID must be checked before enabling backend mode. |
| Future database-backed | Backend API uses the database adapter behind the same state contract. | Production persistence after readiness gates. | SQL migrations, transaction isolation, RLS/auth, audit, and backup retention must be proven first. |

## Environment And Request Identity

Runtime settings are documented in `docs/production-backend-environment.md`. The deployment topology depends on these core values:

| Area | Setting Or Header | Required For | Notes |
|---|---|---|---|
| Backend port | `PORT` | Backend process | Defaults to `3000` locally. Hosted platforms may inject this value. |
| State directory | `SMARTBOOKS_DATA_DIR` | File-backed backend mode | Must point to a private persistent volume outside the repository. |
| Frontend mode | `window.SMARTBOOKS_PERSISTENCE_MODE`, `sb_persistence`, or `persistence` | Backend or hybrid mode | Use `local`, `hybrid`, or `backend`. Keep `local` unless intentionally testing backend persistence. |
| Backend endpoint | `window.SMARTBOOKS_BACKEND_ENDPOINT`, `sb_backend_endpoint`, or `backendEndpoint` | Split frontend/backend hosting | Use an absolute HTTPS URL when frontend and backend are hosted separately. |
| Company scope | `window.SMARTBOOKS_COMPANY_ID`, `sb_company_id`, or `companyId` | Backend and hybrid requests | Sent as `X-SmartBooks-Company-Id`. |
| Request trace | `X-SmartBooks-Request-Id` | Support and incident diagnosis | Optional client header; backend echoes or generates request IDs. |
| Revision guard | `X-SmartBooks-State-Revision` or request `revision` | Writes and restores | Required when overwriting an existing backend state envelope. |

## Backend Endpoints In The Topology

| Endpoint | Deployment Role |
|---|---|
| `GET /api/live` | Confirms the backend process is running. Use for liveness probes. |
| `GET /api/ready` | Confirms the configured persistence adapter can be read. Use for traffic readiness. |
| `GET /api/metrics` | Provides safe operational counters for request volume, failures, routes, memory, and durations. |
| `GET /api/state` | Reads the scoped company state envelope. |
| `PUT /api/state` or `POST /api/state` | Saves the scoped company state envelope with revision protection. |
| `POST /api/state/backup` | Creates a backend-side backup before risky operations. |
| `GET /api/state/backups` | Lists valid backups for the scoped company. |
| `POST /api/state/restore` | Restores a selected backup through the same revision guard used by normal writes. |

Use `docs/persistence-contract.md` for the full envelope, validation, conflict, backup, and restore contract.

## Migration Path 1: Local Browser State To Backend State

Use this path when a user or test company already has browser-local SmartBooks data and needs it copied into backend persistence.

| Phase | Action | Validation |
|---|---|---|
| Preflight | Confirm the backend is deployed, HTTPS is active, and `GET /api/live` returns healthy. | Liveness returns `ok:true`. |
| Readiness | Confirm `GET /api/ready` can read the configured persistence adapter. | Readiness returns `status:ready`; do not migrate when degraded. |
| Company scope | Choose the target company ID and confirm all requests send `X-SmartBooks-Company-Id`. | State responses include the same company ID. |
| Local safety copy | Export or keep a browser-local backup before approving migration. | User can still recover local data if backend save fails. |
| Backend backup | If backend state already exists, create `POST /api/state/backup` before importing local state. | Backup ID and current revision are recorded. |
| Migration write | Use `hybrid` mode or an explicit save to write the local state as `source:"migration"`. | Write returns `ok:true` and a new revision. |
| Reload check | Reload in `backend` mode and confirm the migrated state appears without relying on localStorage. | `GET /api/state` and the app UI show expected data. |
| Monitoring | Review `/api/metrics` and backend logs for failed state requests. | No repeated failed saves, restore errors, or readiness degradation. |

Rollback: keep local mode available, stop further backend saves, and restore the pre-migration backend backup only after confirming the target company ID and current revision.

## Migration Path 2: File-Backed Backend To Database-Backed Backend

Use this path only after a live database adapter, SQL migrations, auth mapping, audit logging, and backup retention are implemented. The in-memory database fixture proves the adapter contract, not production database readiness.

| Phase | Action | Validation |
|---|---|---|
| Schema preflight | Apply database migrations for current state and backup tables. | Migration command succeeds in the target environment. |
| Secret setup | Store database connection values in the hosting secret manager. | Secrets are not present in source control or frontend assets. |
| Auth mapping | Map authenticated user/company membership to the backend `companyId`. | Unauthorized company access is rejected before adapter calls. |
| Freeze risky writes | Pause imports, restores, resets, and bulk edits during the cutover window. | Operators know the active migration window. |
| File backup | Preserve `smartbooks-state.json` and `backups/` from `SMARTBOOKS_DATA_DIR`. | Backup location, company ID, and revision are recorded. |
| Database import | Insert the current envelope into the database adapter table for the same company ID and revision. | Database read returns the same envelope metadata and state summary. |
| Adapter switch | Point backend runtime at the database adapter behind the same API contract. | `/api/ready` returns ready and `GET /api/state` returns expected company data. |
| Smoke tests | Run backend smoke and deployment smoke against the database-backed runtime. | Read, write, revision conflict, backup, restore, and reload behavior pass. |
| Monitor | Watch readiness, metrics failures, request durations, and audit logs. | No repeated save failures, stale restore attempts, or cross-company access errors. |

Rollback: switch the backend service back to the file adapter while preserving the file backup and the database copy. Do not copy database state back into files until an operator compares revision, company ID, and audit trail.

## Backup And Restore Expectations

| Operation | Required Evidence |
|---|---|
| Before local-to-backend migration | Local export or local backup, backend company ID, and pre-migration backend revision when one exists. |
| Before file-to-database migration | File state backup, backup directory copy, database migration version, company ID, and current revision. |
| Before restore | Backup ID, company ID, current backend revision, operator reason, and expected post-restore validation. |
| After restore | New revision, UI reload check, metrics review, and preserved copy of the replaced state. |

Backups must be company-scoped. A restore must never overwrite a newer state revision without an explicit current revision match.

## Validation And Rollback Checklist

| Gate | Command Or Check | Pass Criteria |
|---|---|---|
| Documentation links | `npm run docs:check` | All Markdown links resolve. |
| Backend smoke | `npm run smoke:backend` | Liveness, readiness, state read/write, readback, and metrics pass. |
| Database fixture | `npm run test:integration:database` | Database-shaped adapter lifecycle and isolation scenarios pass. |
| Deployment smoke | `npm run test:deployment-smoke` | Hosted/public app workflow can persist isolated local test state. |
| Manual state read | `GET /api/state` with company header | Company ID, source, savedAt, and revision match expectations. |
| Rollback readiness | Backup location and current revision recorded | Operator can safely return to prior runtime or restore prior state. |

## Follow-Up Implementation Issues

This topology leaves several implementation issues intentionally open:

| Area | Follow-Up Need |
|---|---|
| Live database adapter | Wire a real PostgreSQL/Supabase adapter behind the proven persistence adapter contract. |
| SQL migrations | Add versioned SQL migrations and repeatable migration validation. |
| Auth and authorization | Enforce signed-in user identity, company membership, and role-aware permissions. |
| Audit logging | Store durable audit rows for save, migration, backup, restore, reset, and failed attempts. |
| Backup retention | Define retention windows, restore drills, and off-host backup storage. |
| Production alerts | Convert readiness, metrics failures, and save/restore errors into operator alerts. |

Related docs:

| Doc | Purpose |
|---|---|
| `docs/persistence-contract.md` | State envelope, headers, validation, conflicts, backup, and restore contract. |
| `docs/database-persistence-adapter-contract.md` | Future database adapter boundary, proposed tables, and fixture coverage. |
| `docs/production-backend-environment.md` | Runtime settings, endpoints, and operational environment requirements. |
| `docs/production-persistence-hardening.md` | Remaining gates before real production accounting data. |
| `docs/production-deployment-runbook.md` | Deployment sequence, smoke tests, monitoring, and rollback. |
