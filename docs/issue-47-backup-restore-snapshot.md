# Issue 47 Backup Restore Snapshot

Date: 2026-06-24

## Goal

Add a server-side recovery path for backend-persisted company data before backend mode becomes the default or a database adapter is introduced.

## Completed Changes

| Area | Change | App Impact |
|---|---|---|
| File adapter | Added backup metadata, backup listing, backup read, and restore helpers. | The current file-backed backend now has the same recovery primitives a future database adapter must support. |
| Backend API | Added `POST /api/state/backup`, `GET /api/state/backups`, and `POST /api/state/restore`. | Backend state can be backed up, reviewed, and restored without manual file access. |
| Restore guardrails | Restore uses company scope checks, backup ID validation, envelope normalization, and current revision checks. | A restore cannot use unsafe paths, cross-company backups, malformed envelopes, or stale browser revisions. |
| Contract docs | Updated the persistence contract and production hardening plan. | Future frontend/admin UI and database work have a clear API shape to target. |
| Tests | Added adapter and backend API tests for create/list/restore and invalid restore requests. | Regression coverage protects the recovery path. |

## Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/state/backup` | Create a company-scoped backup of the current backend state. |
| `GET /api/state/backups` | List valid backups for the request company. |
| `POST /api/state/restore` | Restore a selected backup when the request revision matches the current backend revision. |

## QC Scope

- Adapter tests for backup metadata, listing, restore, unsafe IDs, and missing backup IDs.
- Backend API tests for backup create/list/restore, missing `backupId`, unsafe IDs, missing backups, stale restore revisions, and state preservation after failed restore.
- Project syntax and documentation checks.
