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

### `GET /api/state`

Returns the current persisted state envelope.

Response:

```json
{
  "ok": true,
  "data": {
    "schemaVersion": 1,
    "savedAt": "2026-06-23T00:00:00.000Z",
    "source": "backend",
    "companyId": "demo-company",
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
  "state": {}
}
```

Response:

```json
{
  "ok": true,
  "savedAt": "2026-06-23T00:00:00.000Z"
}
```

### `POST /api/state/backup`

Future endpoint. Creates a named backup copy before destructive resets or migrations.

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
- Unknown `companyId` once company scoping exists

Frontend validation should normalize:

- Missing settings
- Missing arrays for core entities
- Legacy navigation/dashboard settings
- Legacy records that predate current accounting helpers

## Error Handling

- Backend unavailable: show a non-destructive warning and keep local data available.
- Save failure: keep the in-memory state, record the error in persistence status, and offer export/backup.
- Load failure: do not reset state automatically.
- Conflict: future work should add revision IDs before multi-user editing.

## Security Notes

Before production, backend persistence must add:

- Authentication
- Company/user authorization
- CSRF protection or token-based API rules
- Request size limits
- Server-side schema validation
- Audit logging for save/reset/import actions
- Encryption and backup policy for sensitive accounting data

## Test Plan

Minimum tests before enabling backend mode:

- Unit tests for storage-service local, backend, and hybrid modes.
- Backend API tests for `GET /api/state` and `PUT /api/state`.
- Migration test from localStorage to backend envelope.
- Failure tests for invalid JSON, network errors, oversized payloads, and backend `500`.
- Functional test that reloads the app and verifies saved backend state is restored.
- Manual QA for export, reset, backup, and reload.

## Implementation Sequence

1. Add backend envelope read/write while preserving legacy raw-state compatibility. **Completed in the first backend persistence slice.**
2. Add async backend methods to `storage-service.js`. **Completed as an opt-in bridge; localStorage remains the default.**
3. Add hybrid migration behavior behind an explicit setting or dev flag.
4. Add tests for backend save/load and migration failure behavior.
5. Only then consider making backend mode the default.
