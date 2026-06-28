# SmartBooks Persistence Contract

This document defines the contract that should be agreed before replacing browser `localStorage` with backend-backed persistence.

## Current State

- The frontend calls `window.SmartBooksPersistence`.
- `frontend/src/services/storage-service.js` currently defaults to `localStorage`.
- `backend/src/server.js` exposes starter state routes:
  - `GET /api/state`
  - `POST /api/state`
  - `PUT /api/state`
- The backend currently stores the whole state document as JSON in `backend/data/smartbooks-state.json`.

## Goals

- Preserve the current demo-data behavior during migration.
- Avoid data loss when switching from local-only state to backend-backed state.
- Keep save, backup, reset, export, and reload behavior explicit.
- Support future authentication, authorization, company scoping, audit logging, and database-backed storage.

## Non-Goals For The First Backend Mode

- Multi-user collaboration
- Real authentication
- Role-based permissions
- Partial document sync
- Database schema normalization
- Payment, banking, or third-party API integration

## State Ownership

For the first backend-backed mode, the frontend still owns the SmartBooks state shape. The backend stores and returns one normalized company state document.

Required state envelope:

```json
{
  "schemaVersion": 1,
  "savedAt": "2026-06-23T00:00:00.000Z",
  "source": "local|backend|migration",
  "companyId": "demo-company",
  "state": {}
}
```

The backend may accept legacy raw state during migration, but it should respond with the envelope shape.

## API Contract

All `/api/state` requests must include request scope headers:

```http
X-SmartBooks-Company-Id: demo-company
X-SmartBooks-Request-Id: sb-optional-trace-id
```

`X-SmartBooks-Company-Id` is required for reads and writes. The backend rejects missing, malformed, or cross-company requests instead of silently falling back to `demo-company`. `X-SmartBooks-Request-Id` is echoed in API responses when supplied, or generated server-side when omitted.

### `GET /api/state`

Returns the current persisted state envelope.

Response:

```json
{
  "ok": true,
  "requestId": "sb-optional-trace-id",
  "data": {
    "schemaVersion": 1,
    "savedAt": "2026-06-23T00:00:00.000Z",
    "source": "backend",
    "companyId": "demo-company",
    "revision": "rev_000001",
    "state": {}
  }
}
```

If no backend state exists, return an empty state envelope instead of `404`.

### `PUT /api/state`

Replaces the current state document.

Request:

```json
{
  "schemaVersion": 1,
  "companyId": "demo-company",
  "revision": "rev_000001",
  "state": {}
}
```

The current revision may also be sent as a request header:

```http
X-SmartBooks-State-Revision: rev_000001
```

When backend state already exists, the write must include the latest revision from `GET /api/state`. First writes into an empty backend are allowed without a revision so migration can initialize storage safely.

Response:

```json
{
  "ok": true,
  "requestId": "sb-optional-trace-id",
  "companyId": "demo-company",
  "savedAt": "2026-06-23T00:00:00.000Z",
  "revision": "rev_000002"
}
```

Stale or missing revisions against an existing backend document return `409 Conflict` and leave the newer backend state intact:

```json
{
  "ok": false,
  "error": "State revision conflict.",
  "code": "STATE_REVISION_CONFLICT",
  "expectedRevision": "rev_000001",
  "currentRevision": "rev_000002"
}
```

### `POST /api/state/backup`

Creates a named backup copy before destructive resets, restores, or migrations.

Request:

```json
{
  "label": "before-import"
}
```

Response:

```json
{
  "ok": true,
  "requestId": "sb-optional-trace-id",
  "backup": {
    "id": "2026-06-24T12-00-00-000Z-before-import.json",
    "label": "before-import",
    "createdAt": "2026-06-24T12:00:00.000Z",
    "sizeBytes": 1024,
    "savedAt": "2026-06-24T11:55:00.000Z",
    "companyId": "demo-company",
    "source": "backend",
    "revision": "rev_000002"
  }
}
```

### `GET /api/state/backups`

Lists available backups for the scoped company.

Response:

```json
{
  "ok": true,
  "requestId": "sb-optional-trace-id",
  "backups": []
}
```

### `POST /api/state/restore`

Restores a selected backup for the scoped company. Restore is guarded by the current backend revision, just like state writes.

Request:

```json
{
  "backupId": "2026-06-24T12-00-00-000Z-before-import.json",
  "revision": "rev_000003"
}
```

Response:

```json
{
  "ok": true,
  "requestId": "sb-optional-trace-id",
  "backupId": "2026-06-24T12-00-00-000Z-before-import.json",
  "companyId": "demo-company",
  "savedAt": "2026-06-24T12:05:00.000Z",
  "revision": "rev_000004"
}
```

## Frontend Storage Modes

### `local`

Current behavior. Load and save use `localStorage`.

### `backend`

Load and save use `/api/state`. If backend load fails, show a user-safe error and do not silently overwrite backend data with fallback demo data.

### `hybrid`

Migration mode. Load from backend first. If backend is empty and local state exists, offer to migrate local state into the backend. Keep a local backup copy before migration.

## Migration Rules

- Never delete localStorage during the first successful backend save.
- Save a local backup before migrating to backend mode.
- Record `source: "migration"` and `savedAt` on migrated state.
- If backend save fails, keep using local mode and show a visible message.
- If backend load returns invalid JSON or an invalid envelope, do not overwrite local data.

## Validation Rules

Backend request validation should reject:

- Non-object payloads
- Payloads larger than the configured limit
- Missing `state`
- Unsupported `schemaVersion`
- Missing or malformed `X-SmartBooks-Company-Id`
- Payload `companyId` that does not match the request company scope
- Reads or writes that would cross an existing persisted company scope
- Stale or missing revisions when an existing backend state document is being overwritten
- Restore requests without a valid `backupId`
- Restore requests that reference missing, malformed, cross-company, or stale-revision backups

Frontend validation should normalize:

- Missing settings
- Missing arrays for core entities
- Legacy navigation/dashboard settings
- Legacy records that predate current accounting helpers

## Error Handling

- Backend unavailable: show a non-destructive warning and keep local data available.
- Save failure: keep the in-memory state, record the error in persistence status, and offer export/backup.
- Load failure: do not reset state automatically.
- Conflict: keep an unsaved session copy, show reload guidance in persistence diagnostics, and do not overwrite the newer backend state.
- Restore failure: leave the current backend state untouched and return the specific validation, missing backup, scope, or revision error.

## Security Notes

Before production, backend persistence must add:

- Authentication
- Company/user authorization
- CSRF protection or token-based API rules
- Request size limits
- Server-side schema validation
- Audit logging for save/reset/import actions
- Encryption and backup policy for sensitive accounting data

Use `docs/production-persistence-hardening.md` as the detailed readiness plan before backend mode becomes the default or database-backed storage is introduced.

Use `docs/production-backend-environment.md` for the required runtime settings, deployment assumptions, storage path, backup, logging, and HTTPS setup before enabling backend persistence outside local development.

## Test Plan

Minimum tests before enabling backend mode:

- Unit tests for storage-service local, backend, and hybrid modes.
- Backend API tests for `GET /api/state` and `PUT /api/state`.
- Migration test from localStorage to backend envelope. **Covered for approve, decline, and save-failure paths.**
- Failure tests for invalid JSON, network errors, oversized payloads, and backend `500`. **Covered across storage, backend API, and functional tests.**
- Functional test that reloads the app and verifies saved backend state is restored. **Covered for backend mode without relying on localStorage.**
- Baseline speed tests for local startup, backend startup/save, backend read latency, and large-state dashboard/navigation coverage. **Covered with guardrail budgets in `tests/functional/performance.spec.js` and documented in `docs/performance-baseline.md`.**
- Manual QA for export, reset, backup, and reload.

## Implementation Sequence

1. Add backend envelope read/write while preserving legacy raw-state compatibility. **Completed in the first backend persistence slice.**
2. Add async backend methods to `storage-service.js`. **Completed as an opt-in bridge; localStorage remains the default.**
3. Wire the app runtime to opt-in async backend and hybrid load/save modes. **Completed behind explicit runtime configuration; localStorage remains the default.**
4. Add hybrid migration behavior behind an explicit setting or dev flag. **Completed with a confirmation prompt, pre-migration backup, `source: "migration"` writes, and local-mode fallback on migration save failure.**
5. Add tests for backend save/load and migration failure behavior. **Completed for invalid JSON, invalid envelopes, backend `500`, oversized payloads, migration approval, migration decline, migration save failure, and backend reload restoration.**
6. Plan production persistence hardening before database work. **Completed with a readiness gate plan for identity, company scoping, audit logging, revision conflicts, backups, validation, observability, and performance.**
7. Add a backend persistence adapter contract. **Completed for file-backed read, write, and backup behavior so a future database adapter can share one server contract.**
8. Add request identity and company scoping guard. **Completed for required company scope headers, request IDs, cross-company read/write rejection, and frontend backend/hybrid header propagation.**
9. Spike the database persistence adapter contract. **Completed with an in-memory database-shaped adapter test double and `docs/database-persistence-adapter-contract.md`; no live database is required yet.**
10. Add large-state performance fixture and budget coverage. **Completed with deterministic large-state startup, dashboard render, backend read/save, and navigation timings.**
11. Only then consider making backend mode the default.
