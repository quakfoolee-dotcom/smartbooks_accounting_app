# Issue 87 Persistence Topology Snapshot

Date: 2026-07-01

## Objective

Document the recommended backend persistence deployment topology and migration path from local browser state to file-backed backend state and later to database-backed backend state.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Deployment topology | Environment and runbook docs described settings and operations, but there was no single topology view connecting frontend, backend, state store, backups, identity, and monitoring. | `docs/backend-persistence-deployment-topology.md` now describes supported deployment shapes and the recommended production target topology. |
| Persistence modes | `local`, `hybrid`, and `backend` behavior was documented in the persistence contract and environment guide. | The new topology doc explains when each mode should be used and how future database-backed storage fits behind the same contract. |
| Migration path | Local-to-backend migration rules existed, and the database adapter contract existed, but maintainers had to assemble the migration sequence from multiple docs. | The new doc provides preflight, backup, migration, validation, monitoring, and rollback steps for local-to-backend and file-to-database paths. |
| Request identity | Company and request headers were documented in the contract/environment docs. | The topology doc maps environment settings and request headers to deployment responsibilities. |
| Follow-up planning | Production gaps were listed in the hardening plan. | The topology doc turns those gaps into follow-up implementation areas for live database, SQL migrations, auth, audit logging, backup retention, and alerts. |

## Documentation Added

| File | Purpose |
|---|---|
| `docs/backend-persistence-deployment-topology.md` | Main topology and migration guide for issue #87. |
| `docs/production-backend-environment.md` | Linked the topology guide from the production environment guide. |
| `docs/production-deployment-runbook.md` | Linked the topology guide from the deployment runbook related docs. |

## Acceptance Criteria Coverage

| Criterion | Coverage |
|---|---|
| Recommended production topology is identified. | Covered in the recommended topology and current deployment shapes sections. |
| Migration steps include preflight, backup, validation, and rollback. | Covered for local-to-backend and file-to-database migration paths. |
| Existing persistence contract docs are linked rather than duplicated. | Related docs link to the persistence contract, database adapter contract, environment guide, hardening plan, and runbook. |
| Maintainers have context to create follow-up implementation issues. | Follow-up section lists live database adapter, SQL migrations, auth/authorization, audit logging, backup retention, and alerts. |

## QC Results

| Check | Result |
|---|---|
| Documentation links | Passed: `npm run docs:check` |
| Manual review against persistence contract | Completed: topology links to `docs/persistence-contract.md` for envelope, headers, conflicts, backup, and restore details. |
| Manual review against production backend environment | Completed: topology links to `docs/production-backend-environment.md` for runtime settings and endpoint requirements. |
