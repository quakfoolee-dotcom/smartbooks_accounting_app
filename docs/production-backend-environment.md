# Production Backend Environment Setup

This guide documents the environment required before SmartBooks backend persistence is used outside local development. Use `docs/production-deployment-runbook.md` for the deployment sequence, smoke tests, rollback, and post-deploy monitoring. Backend mode is still opt-in and is not production-safe for real accounting data until the remaining production gates in `docs/production-persistence-hardening.md` are complete.

## Current Backend Posture

| Area | Current Behavior | Production Requirement |
| --- | --- | --- |
| Hosting | `backend/src/server.js` runs a small Node.js HTTP server. | Run behind a managed HTTPS platform or reverse proxy. Do not expose plain HTTP for production data. |
| Static app | The Node server can serve `frontend/index.html` and assets. GitHub Pages serves only the static frontend. | If backend persistence is enabled, deploy the frontend with a reachable backend API endpoint. |
| Storage | File-backed state at `SMARTBOOKS_DATA_DIR/smartbooks-state.json`, defaulting to `backend/data/smartbooks-state.json`. | Use a persistent, private, backed-up storage volume outside the repo checkout. |
| Backups | File-backed backups are written under the state directory's `backups/` folder. | Back up the whole state directory, test restore, and define retention before using real data. |
| Identity | Requests carry `X-SmartBooks-Company-Id` and optional/generated request IDs. | Add authenticated user identity and company membership checks before real use. |
| Authorization | Company-scope checks prevent cross-company access to the current file-backed state. | Add role-based permissions for read, write, import, export, reset, backup, and restore. |
| Observability | Server logs to stdout/stderr, API responses include request IDs for state routes, and backend exposes liveness, readiness, and safe JSON metrics endpoints. | Capture structured logs, alert on failed saves/restores, and retain audit events. |

## Required Runtime Settings

### Backend process

| Setting | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | HTTP port used by the Node server. |
| `SMARTBOOKS_DATA_DIR` | Strongly recommended | `backend/data` | Directory that stores `smartbooks-state.json` and `backups/`. Use a persistent private path in deployed environments. |

Example local backend run:

```powershell
$env:PORT = "3000"
$env:SMARTBOOKS_DATA_DIR = "C:\SmartBooks\data"
npm start
```

### Frontend backend-mode configuration

The frontend defaults to local browser storage. Backend persistence must be enabled explicitly.

| Configuration | Values | Purpose |
| --- | --- | --- |
| `window.SMARTBOOKS_PERSISTENCE_MODE` or `sb_persistence` / `persistence` query parameter | `local`, `backend`, `hybrid` | Chooses browser-only, backend-only, or migration mode. |
| `window.SMARTBOOKS_BACKEND_ENDPOINT` or `sb_backend_endpoint` / `backendEndpoint` query parameter | URL path or absolute URL | Points the frontend at the backend state endpoint. Default is `/api/state`. |
| `window.SMARTBOOKS_COMPANY_ID` or `sb_company_id` / `companyId` query parameter | Company scope ID | Sends `X-SmartBooks-Company-Id` on backend requests. Default is `demo-company`. |

Example local URL:

```text
http://localhost:3000/?sb_persistence=backend&sb_company_id=demo-company
```

For split frontend/backend hosting, set the backend endpoint to the deployed API URL:

```text
https://example.com/smartbooks/?sb_persistence=backend&sb_backend_endpoint=https://api.example.com/api/state&sb_company_id=demo-company
```

## Production Backend Smoke

Before enabling backend persistence in a new runtime, run the local production-style backend smoke:

```powershell
npm run smoke:backend
```

The smoke starts the real backend server on a temporary local port with an isolated temporary state directory. It verifies:

| Gate | What it proves |
| --- | --- |
| Liveness | `/api/live` returns a live process response. |
| Readiness | `/api/ready` can read persistence without exposing filesystem paths. |
| State read | `/api/state` returns a company-scoped envelope and request ID. |
| Revision-safe save | `PUT /api/state` writes only with the latest revision. |
| Saved state readback | The saved company state can be read back with the new revision. |
| Metrics | `/api/metrics` includes route counts without leaking storage paths. |

Use `SMARTBOOKS_SMOKE_COMPANY_ID` to override the default smoke company ID:

```powershell
$env:SMARTBOOKS_SMOKE_COMPANY_ID = "deployment-check"
npm run smoke:backend
```

## API And Header Requirements

Backend state routes require company scope:

```http
X-SmartBooks-Company-Id: demo-company
X-SmartBooks-Request-Id: optional-trace-id
```

State writes and restores must include the latest revision when backend state already exists:

```http
X-SmartBooks-State-Revision: rev_000001
```

Operational endpoints:

```text
GET /api/health
GET /api/live
GET /api/ready
GET /api/metrics
```

State endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Backward-compatible liveness check for basic process availability. |
| `GET /api/live` | Liveness check for deployment platforms that distinguish liveness from readiness. |
| `GET /api/ready` | Readiness check that verifies the configured persistence adapter can be read without mutating state. Returns `503` when degraded. |
| `GET /api/metrics` | Safe JSON metrics with uptime, memory, request counts, status groups, route counts, and request durations. Does not expose file paths or secrets. |
| `GET /api/state` | Load current company state envelope. |
| `PUT /api/state` or `POST /api/state` | Save current company state envelope with revision protection. |
| `POST /api/state/backup` | Create a server-side file backup. |
| `GET /api/state/backups` | List valid company-scoped backups. |
| `POST /api/state/restore` | Restore a backup when revision and company scope match. |

## Deployment Checklist

| Category | Required Before Real Data |
| --- | --- |
| HTTPS | Terminate TLS at the hosting platform or reverse proxy. Redirect HTTP to HTTPS. |
| Storage path | Set `SMARTBOOKS_DATA_DIR` to a private persistent volume outside the repository. |
| File permissions | Limit read/write access to the backend service account. |
| Backups | Schedule backups for `smartbooks-state.json` and `backups/`; test restore before launch. |
| Secrets | Keep future database URLs, auth secrets, and API keys in the hosting secret manager, never in source control. |
| Logs | Capture stdout/stderr and include request IDs in support/debug reports. |
| Monitoring | Use `/api/live` for liveness, `/api/ready` for readiness, and `/api/metrics` for safe operational counters. Alert on readiness failures, backend process failure, repeated save failures, restore failures, and storage-volume errors. |
| Data policy | Do not enter real customer, payroll, banking, tax, or credential data until auth, authorization, audit logging, encryption policy, and backup retention are implemented. |

## Not Production-Safe Yet

Backend persistence must not become the default for real customer data until these gaps are closed:

| Gap | Current State |
| --- | --- |
| Authentication | No real sign-in or user identity is enforced by the backend. |
| Authorization | No role model exists for viewer/editor/admin permissions. |
| Database storage | File-backed adapter is useful for contract testing but is not the final multi-company storage model. |
| Audit logging | Mutating operations do not yet create durable audit records outside the accounting state. |
| Encryption policy | No documented encryption-at-rest or key-management plan exists for production accounting data. |
| Rate limits and abuse controls | The backend has request-size validation but no production rate limiting. |
| Domain validation | Envelope validation exists; deeper accounting-domain validation is still future work. |

## Operational Runbook

| Scenario | Operator Action |
| --- | --- |
| Backend will not start | Check `PORT`, Node version, filesystem permissions for `SMARTBOOKS_DATA_DIR`, and server logs. |
| Save fails | Do not reset data. Export local data if available, inspect the request ID, check storage permissions and disk space, then retry. |
| Revision conflict | Reload the latest backend state before saving again. The backend keeps the newer state intact. |
| Backup fails | Stop destructive actions. Verify the state directory and `backups/` directory are writable by the backend process. |
| Restore fails | Leave current state untouched. Verify backup ID, company ID, current revision, and backup file integrity. |

