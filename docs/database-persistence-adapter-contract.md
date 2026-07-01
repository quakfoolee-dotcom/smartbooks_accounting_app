# Database Persistence Adapter Contract

Date: 2026-06-28

## Purpose

This document defines the database-backed persistence adapter boundary for a future Supabase/PostgreSQL implementation. It is a spike contract only: SmartBooks still defaults to local browser storage or the existing file-backed backend adapter unless a later issue wires a real database adapter into runtime configuration.

## Adapter Methods

The database adapter must match the current backend persistence adapter surface:

| Method | Responsibility | Database expectation |
| --- | --- | --- |
| `read({ companyId })` | Return the latest state envelope for one company. | Select one row from `smartbooks_company_state` by `company_id`; return an empty envelope when no row exists. |
| `write(envelope, { expectedRevision })` | Replace the company state when revision checks pass. | Run in a transaction; lock or compare the current row revision; reject stale revisions with `STATE_REVISION_CONFLICT`; store a new revision. |
| `backup(label, { companyId })` | Create a restorable copy of the current company envelope. | Insert a row into `smartbooks_state_backups` with the current envelope JSON and metadata. |
| `listBackups({ companyId })` | List valid backups for one company. | Select backup metadata scoped by `company_id`, newest first. |
| `readBackup(id, { companyId })` | Load one backup envelope. | Select by `(company_id, backup_id)` and reject missing/unsafe IDs. |
| `restoreBackup(id, { companyId, expectedRevision })` | Restore a backup through the normal write path. | Read the backup, then write it as `source: "restore"` with the same revision guard as normal state writes. |

## Proposed Tables

### `smartbooks_company_state`

| Column | Type | Notes |
| --- | --- | --- |
| `company_id` | `text primary key` | Matches `X-SmartBooks-Company-Id`. |
| `schema_version` | `integer not null` | Starts at `1`. |
| `revision` | `text not null` | Same `rev_000001` sequence contract used by the file adapter. |
| `source` | `text not null` | `backend`, `migration`, or `restore`. |
| `saved_at` | `timestamptz not null` | Envelope save timestamp. |
| `state_json` | `jsonb not null` | Full SmartBooks app state. |
| `created_at` | `timestamptz not null default now()` | Row creation timestamp. |
| `updated_at` | `timestamptz not null default now()` | Row update timestamp. |

Recommended indexes:

| Index | Purpose |
| --- | --- |
| `primary key (company_id)` | One current state row per company. |
| `index (company_id, revision)` | Fast conflict checks and diagnostics. |
| `gin (state_json)` | Optional future search/diagnostics, not required for first implementation. |

### `smartbooks_state_backups`

| Column | Type | Notes |
| --- | --- | --- |
| `backup_id` | `text not null` | Safe backup filename/id. |
| `company_id` | `text not null` | Backup owner. |
| `label` | `text not null` | Human label after sanitization. |
| `revision` | `text not null` | Revision captured by the backup. |
| `source` | `text not null` | Source captured by the backup. |
| `saved_at` | `timestamptz not null` | Envelope saved timestamp captured by the backup. |
| `created_at` | `timestamptz not null default now()` | Backup creation timestamp. |
| `size_bytes` | `integer not null` | Serialized envelope size. |
| `state_json` | `jsonb not null` | Full backed-up state envelope. |

Recommended indexes:

| Index | Purpose |
| --- | --- |
| `primary key (company_id, backup_id)` | Prevent cross-company restore and duplicate IDs. |
| `index (company_id, created_at desc)` | Backup list ordering. |
| `index (company_id, revision)` | Restore and audit diagnostics. |

## Revision And Transaction Rules

- First write for an empty company may omit `expectedRevision`.
- Every overwrite of an existing company state must include the current revision.
- Stale or missing revisions against existing state return `STATE_REVISION_CONFLICT`.
- Database writes should use a transaction and either row locking or an atomic `where company_id = ? and revision = ?` update.
- Restore must call the same write path used by normal saves so stale restore requests cannot overwrite newer state.

## Supabase/PostgreSQL Open Decisions

| Decision | Current recommendation |
| --- | --- |
| Migrations | Add SQL migrations under a dedicated backend migrations folder before enabling the live adapter. |
| Secrets | Use server-side environment variables only; never expose service-role keys to the frontend. |
| Row-level security | Enable RLS before any direct Supabase client access; backend service access still needs explicit company authorization. |
| Auth mapping | Map authenticated user/company membership to `company_id` before calling the adapter. |
| Backup retention | Define retention windows and export/restore procedures before real customer data. |
| Audit logging | Add separate audit rows for state save, backup, restore, reset, and migration events. |
| JSON validation | Keep the envelope validator, then add stricter schema validation before production. |
| Performance | Add large-state read/write budgets before database mode becomes default. |

## Current Spike Implementation

`backend/src/database-persistence-adapter.js` provides `InMemoryDatabaseStatePersistenceAdapter`, a database-shaped test double with two in-memory tables:

- `companyState`
- `stateBackups`

It proves the database contract can support:

- per-company empty envelopes,
- normalized writes,
- optimistic revision conflicts,
- company-scoped backups,
- backup restore through the guarded write path,
- metadata for proposed table columns.

No production code path uses a live database in this spike.

## Integration Fixture

`tests/integration/database-persistence-adapter.fixture.test.js` adds a deterministic integration-style fixture around the in-memory database adapter. It creates shared table maps and multiple adapter instances to mimic separate request/session lifecycles using the same database state.

Run it with:

```powershell
npm run test:integration:database
```

The fixture proves:

| Area | Fixture proof |
| --- | --- |
| Shared persistence | State written through one adapter instance can be read by another adapter instance using the same tables. |
| Create/read/update lifecycle | Empty envelopes, first writes, guarded updates, and subsequent reads preserve normalized envelope fields. |
| Revision conflicts | Stale revisions fail with `STATE_REVISION_CONFLICT` and do not overwrite the newer row. |
| Company isolation | Company A and Company B state rows remain separate. |
| Backup isolation | Backup lists and backup reads are scoped by company. |
| Restore path | Restore flows through the guarded write path and uses `source: "restore"`. |
| Cleanup | Fixture setup and teardown clear all in-memory rows after each integration scenario. |

The fixture does not prove network connectivity, SQL migration syntax, transaction isolation level, database locks, RLS policies, or cloud-specific authentication. Those still need environment-specific validation when a live Supabase/PostgreSQL adapter is introduced.

