# Production Persistence Hardening Plan

This plan turns backend persistence from a prototype file-backed state store into a production-ready path. It should be completed before backend mode becomes the default or before real customer accounting data is stored outside the browser.

## Current Posture

| Area | Current State | Production Gap |
|---|---|---|
| Storage | One JSON state document in `backend/data/smartbooks-state.json`. | Needs database-backed storage, backups, recovery, and revision control. |
| Identity | Backend state requests now require a company scope header and carry a request ID. | Needs authenticated user identity and explicit company membership. |
| Authorization | Company-scoped reads/writes are guarded for the file-backed state document. | Needs role-aware permissions before real data. |
| Validation | Request size, JSON shape, schema version, and envelope validation are covered. | Needs deeper server-side domain validation and unknown-field policy. |
| Migration | Hybrid local-to-backend migration is guarded and backed up locally. | Needs production backup, rollback, and audit trail. |
| Observability | Functional and performance tests cover baseline behavior. | Needs request IDs, structured logs, audit events, and operational alerts. |

## Production Readiness Gates

Do not enable backend persistence by default until each gate has an owner, implementation, and test coverage.

| Gate | Required Capability | Acceptance Criteria |
|---|---|---|
| Identity | Authenticated user context is available for every state request. | API rejects anonymous writes and records user identity on write/audit events. |
| Company scoping | Every state document belongs to a company ID controlled by the signed-in user. | A user cannot read or write another company's state; tests cover allowed and denied access. |
| Authorization | Role-aware permissions decide who can read, write, import, export, reset, and backup. | Viewer/editor/admin roles are enforced at API boundaries. |
| Audit logging | Mutating actions produce durable audit records. | Save, import, reset, backup, and migration events include user, company, timestamp, action, and result. |
| Revision control | State writes include optimistic concurrency protection. | Stale writes are rejected with a conflict response instead of overwriting newer data. |
| Backup and recovery | Server-side backups exist before destructive or migratory operations. | Backup creation, restore, and rollback are tested with failure paths. |
| Schema validation | Server validates persisted document shape beyond envelope checks. | Invalid core accounting arrays, malformed entities, and unsupported schema versions are rejected. |
| Database readiness | Storage adapter supports file and database implementations behind one contract. | Tests run against the adapter contract without changing frontend persistence code. |
| Observability | API emits request IDs and structured operational logs. | Errors can be traced from frontend report to backend request and audit event. |
| Performance | Startup, save, and read budgets stay within accepted thresholds. | `tests/functional/performance.spec.js` passes with agreed CI budgets. |

## Recommended Implementation Order

1. Introduce a persistence adapter boundary on the backend.
   - Keep the current file adapter as the default. **Completed for read/write/backup.**
   - Add contract tests for read, write, backup, and revision behavior. **Completed for read/write/backup; revision conflict handling remains a separate P1 issue.**
   - Make the future database adapter plug into the same interface. **Started with the file adapter contract.**

2. Add request context and company scoping.
   - Parse a temporary development identity header only in non-production mode. **Partially completed with required company scope headers and generated/requested request IDs.**
   - Require `companyId` on state reads and writes. **Completed through `X-SmartBooks-Company-Id`.**
   - Reject unknown company IDs instead of silently falling back to `demo-company`. **Completed for cross-company access against the current persisted file-backed state.**

3. Add audit events for state mutations.
   - Record `state.save`, `state.migration`, `state.backup`, `state.restore`, and `state.reset`.
   - Store audit metadata separately from the accounting state document.
   - Include request ID, user ID, company ID, source, result, and timestamp.

4. Add revision IDs and conflict handling.
   - Include a revision or ETag in `GET /api/state`. **Completed for the file-backed adapter.**
   - Require the latest revision on `PUT /api/state`. **Completed for existing backend documents.**
   - Return `409 Conflict` for stale writes and keep the newer backend state intact. **Covered by adapter, API, storage, and browser tests.**

5. Add server-side backups and restore workflow.
   - Implement `POST /api/state/backup`.
   - Add restore as an explicit admin-only operation.
   - Test backup failure, restore failure, and oversized backup rejection.

6. Add database adapter behind the proven contract.
   - Start with one company, one state document, and audit rows.
   - Avoid multi-user collaboration until revision conflict handling is reliable.
   - Keep export/import available as a user-facing safety valve.

7. Tighten production security.
   - Enforce HTTPS at deployment.
   - Use secure auth tokens or same-site session cookies.
   - Add CSRF protection when cookie-authenticated writes are used.
   - Store secrets outside source control.
   - Apply rate limits to write/import/reset endpoints.

## API Contract Extensions

The existing persistence envelope remains valid, but production mode should add these fields:

```json
{
  "schemaVersion": 1,
  "savedAt": "2026-06-24T00:00:00.000Z",
  "source": "backend",
  "companyId": "demo-company",
  "revision": "rev_000001",
  "savedBy": "user_123",
  "state": {}
}
```

`PUT /api/state` should eventually require:

- `companyId`
- current `revision` **Completed for the current backend persistence contract.**
- authenticated user context
- valid state envelope

Expected conflict response:

```json
{
  "ok": false,
  "error": "State revision conflict.",
  "code": "STATE_REVISION_CONFLICT",
  "expectedRevision": "rev_000001",
  "currentRevision": "rev_000002"
}
```

## Test Coverage To Add

| Test Area | Coverage |
|---|---|
| Adapter contract | File adapter and future database adapter pass the same read/write/backup/revision tests. |
| Company scoping | Allowed company can read/write; unauthorized company gets `403`. **Covered for backend state API.** |
| Anonymous access | Anonymous write attempts fail in production mode. |
| Audit events | Mutating endpoints create audit records with user/company/action/result. |
| Revision conflicts | Stale writes return `409` and do not overwrite newer state. **Covered for the current file-backed backend.** |
| Backup/restore | Backup, restore, and rollback paths work and preserve prior data. |
| Performance | Larger state fixture stays within accepted startup and save budgets. |

## Next Issues To Create

| Priority | Issue | Reason |
|---|---|---|
| P1 | Add backend persistence adapter contract | Completed for file-backed read/write/backup; extend the same contract when the database adapter is introduced. |
| P1 | Add request identity and company scoping guard | Completed for request headers, frontend propagation, and cross-company read/write rejection. |
| P1 | Add revision conflict protection | Completed for the current file-backed backend; revisit when the database adapter lands. |
| P2 | Add audit logging for state mutations | Creates operational and compliance traceability. |
| P2 | Add server-side backup and restore endpoints | Gives recovery path before database migration. |
| P2 | Add large-state performance fixture | Measures database-readiness with realistic data volume. |

## Definition Of Done For Production Default

Backend persistence can be considered for default enablement only when:

- all P1 issues above are merged,
- backup and export paths are tested,
- performance budgets have CI thresholds,
- manual QA passes for migration, reload, backup, restore, export, reset, and conflict handling,
- the deployment environment has documented auth, secrets, HTTPS, and backup configuration.
