# Issue 86 Database Adapter Fixture Snapshot

Date: 2026-07-01

## Objective

Add an integration-style fixture for the database persistence adapter contract beyond pure unit expectations.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Database adapter validation | Unit tests covered table metadata, empty reads, writes, conflicts, backups, restore, and company isolation in one adapter instance. | `npm run test:integration:database` now exercises shared database-shaped tables through multiple adapter instances. |
| Lifecycle realism | Tests mostly proved method-level behavior. | The fixture proves create, read, guarded update, stale conflict, backup, restore, and cleanup as lifecycle scenarios. |
| Cross-session behavior | Shared persistence across separate adapter instances was implied by table injection. | The fixture explicitly writes through one adapter and reads through another against the same tables. |
| Company isolation | Unit tests covered company-scoped state and backups. | The fixture repeats company A/B isolation through shared tables and validates cross-company backup reads fail. |
| Documentation | The contract documented the in-memory spike but not a repeatable integration command or limits. | `docs/database-persistence-adapter-contract.md` now documents the fixture, command, proofs, and live database gaps. |

## Fixture Coverage

| Scenario | Verified Behavior |
|---|---|
| Shared persistence | Multiple adapter instances see the same database-shaped table rows. |
| Create/read lifecycle | Empty state reads return a scoped envelope, and first write creates a normalized row. |
| Guarded update | Updates require the latest revision once state exists. |
| Stale conflict | Stale writes return `STATE_REVISION_CONFLICT` without overwriting current state. |
| Company isolation | Separate company rows remain isolated. |
| Backup isolation | Backup lists and backup reads are scoped by company. |
| Restore | Restore writes through the normal guarded save path with `source: "restore"`. |
| Cleanup | Fixture teardown clears in-memory rows so no local state is left behind. |

## Limits

| Limit | Follow-Up Need |
|---|---|
| No live SQL engine | Add a live Supabase/PostgreSQL fixture when database credentials and migrations exist. |
| No transaction isolation proof | Validate row locks or atomic revision updates against the selected database. |
| No RLS/auth proof | Validate production auth, company membership, and row-level security separately. |
| No cloud connectivity proof | Validate secrets, network, latency, and backup retention in the target deployment environment. |

## QC Results

| Check | Result |
|---|---|
| Database adapter unit tests | Passed: `node tests/unit/database-persistence-adapter.test.js` |
| Database adapter integration fixture | Passed: `npm run test:integration:database` |
| Syntax and docs check | Passed: `npm run check` |
