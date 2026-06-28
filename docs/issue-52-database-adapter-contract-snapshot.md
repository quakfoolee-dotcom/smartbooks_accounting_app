# Issue 52 Database Adapter Contract Snapshot

Date: 2026-06-28

## Goal

Design and prove the database persistence adapter boundary for Supabase/PostgreSQL without switching production data to a database.

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Adapter boundary | The backend had a file-backed adapter contract for envelopes, revisions, backups, and restore. | A database-shaped adapter test double now implements the same method surface for company-scoped state and backups. |
| Database schema | Database storage was referenced in production-readiness docs but table mapping was not explicit. | `docs/database-persistence-adapter-contract.md` defines proposed `smartbooks_company_state` and `smartbooks_state_backups` tables, columns, indexes, and transaction rules. |
| Company scope | The file adapter supported one file-backed company state at a time. | The database test double proves multiple company IDs can be isolated in separate state and backup records. |
| Revision checks | Existing tests covered stale revision rejection in the file adapter. | New database adapter tests cover stale revision rejection without overwriting current company state. |
| Backup/restore | Existing backup tests were file-path based. | New tests prove database-shaped backup metadata, backup listing, read, and guarded restore without file paths. |
| Production impact | A real database path did not exist. | A real database path still does not exist; this is intentionally a contract spike with no live database requirement. |

## Files Changed

| File | Change |
| --- | --- |
| `backend/src/database-persistence-adapter.js` | Added the in-memory database-shaped adapter and table metadata helper. |
| `tests/unit/database-persistence-adapter.test.js` | Added contract tests for table shape, empty reads, writes, stale revisions, company isolation, backups, and restore. |
| `docs/database-persistence-adapter-contract.md` | Documented adapter methods, proposed tables, indexes, revision rules, and Supabase/PostgreSQL open decisions. |
| `docs/persistence-contract.md` | Added the database adapter spike to the implementation sequence. |
| `package.json` | Added database adapter syntax and unit tests to the standard check/test scripts. |
| `README.md` | Linked the database adapter contract and this before/after report. |

## QC Results

| Check | Result |
| --- | --- |
| Database adapter unit test | Passed: `node tests/unit/database-persistence-adapter.test.js` |
| Unit tests | Passed: `npm test` |
| Project syntax/docs check | Passed: `npm run check` |

## Follow-Up

The next implementation issue should add the real Supabase/PostgreSQL adapter behind server-side configuration, plus SQL migrations, secrets documentation, RLS/auth decisions, and performance budgets before database mode is enabled for real data.
