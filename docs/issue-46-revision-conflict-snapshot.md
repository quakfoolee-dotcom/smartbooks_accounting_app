# Issue 46 Revision Conflict Snapshot

Date: 2026-06-24

## Goal

Prevent stale browser sessions from overwriting newer backend state when backend persistence is enabled.

## Completed Changes

| Area | Change | App Impact |
|---|---|---|
| Backend adapter | State envelopes now include a `revision` field starting at `rev_000001`, and successful writes advance the revision. | Backend state has a version marker that can be checked before overwrites. |
| Backend API | `PUT /api/state` and `POST /api/state` accept the revision in the body or `X-SmartBooks-State-Revision`; stale or missing revisions against existing backend state return `409`. | Stale sessions receive a clear conflict response instead of silently replacing current data. |
| Frontend storage | Backend loads remember the latest revision, and backend saves send it back in both the request body and header. | Normal save flow remains automatic while protecting against outdated browser tabs. |
| Diagnostics UI | The persistence panel shows the active revision and gives reload guidance when a revision conflict occurs. | Users get visible direction when a save is rejected because backend data changed elsewhere. |
| Contract docs | Persistence contract and production hardening notes now document revision handling and the conflict response shape. | Future database work has a clear compatibility rule to implement. |

## Conflict Response

```json
{
  "ok": false,
  "error": "State revision conflict.",
  "code": "STATE_REVISION_CONFLICT",
  "expectedRevision": "rev_000001",
  "currentRevision": "rev_000002"
}
```

## QC Scope

- Adapter contract tests for revision generation and stale-write preservation.
- Backend API tests for revision responses, stale revision rejection, missing revision rejection, and current-state preservation.
- Frontend storage tests for revision propagation and structured conflict errors.
- Dashboard diagnostics tests for conflict-specific reload guidance.
- Functional backend persistence test for browser-visible conflict handling.
