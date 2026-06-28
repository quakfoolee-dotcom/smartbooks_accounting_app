# Persistence Snapshot Guide

Use this guide when a change affects backend persistence, storage diagnostics, setup/admin persistence controls, production persistence readiness, or database adapter planning.

The goal is not to duplicate a pull request body. The snapshot should preserve stable maintenance knowledge: what changed, why it reduced risk, how it was checked, and what remains.

## When To Add A Snapshot

Add or update a snapshot when the change:

- changes backend/local/hybrid persistence behavior,
- changes persistence diagnostics, storage warnings, backup, restore, reset, import, or export flows,
- changes production-readiness expectations for backend/database storage,
- changes setup/settings/admin surfaces that control or explain persistence,
- adds a new persistence contract, adapter, database, or security boundary,
- closes a roadmap item where future maintainers need before/after context.

## Snapshot Template

```markdown
# Issue NN Short Snapshot Title

Date: YYYY-MM-DD

## Goal

One or two sentences describing the maintenance objective.

## Before And After

| Area | Before | Change Point | Risk Reduced |
| --- | --- | --- | --- |
| Example area | What was true before. | What changed in stable product or code behavior. | Why the change matters for maintenance, data safety, UX, or production readiness. |

## Files Changed

| File | Change |
| --- | --- |
| `path/to/file` | Stable summary of the role this file now plays. |

## QC Evidence

| Check | Result |
| --- | --- |
| `command` | Passed, failed with reason, or intentionally not run with reason. |

## Follow-Up

What should happen next, especially if the snapshot closes one roadmap slice but leaves production-readiness work.
```

## Field Rules

| Field | Use It For | Avoid |
| --- | --- | --- |
| Goal | The maintenance objective and boundary. | Repeating the full GitHub issue body. |
| Before And After | Observable behavior, contract, or documentation state before and after the change. | Low-level line-by-line implementation notes. |
| Change Point | The stable thing future maintainers should know changed. | Temporary PR mechanics. |
| Risk Reduced | Data loss, confusion, regression, deployment, audit, or production-readiness risk. | Generic claims such as "improves code." |
| Files Changed | The ownership or responsibility added to each file. | Exhaustive diffs. |
| QC Evidence | Commands, targeted specs, doc checks, manual checks, and known gaps. | Unverified claims. |
| Follow-Up | The next concrete roadmap or hardening step. | Open-ended wish lists. |

## Current Snapshot Index

| Flow | Snapshot | Maintenance Knowledge Preserved |
| --- | --- | --- |
| Request company scoping | `docs/issue-45-request-scope-snapshot.md` | Backend state access requires explicit company/request scope and rejects cross-company writes. |
| Revision conflicts | `docs/issue-46-revision-conflict-snapshot.md` | Stale backend writes are rejected with a conflict response instead of overwriting newer state. |
| Backup and restore | `docs/issue-47-backup-restore-snapshot.md` | File-backed backend recovery endpoints and restore guardrails are documented. |
| Persistence diagnostics | `docs/issue-49-persistence-diagnostics-snapshot.md` | Warning states include retry, export, and local safety-copy guidance. |
| Production environment | `docs/issue-51-production-environment-snapshot.md` | Backend persistence deployment prerequisites and operator response notes are linked. |
| Database adapter contract | `docs/issue-52-database-adapter-contract-snapshot.md` | Database-shaped adapter, table model, company isolation, revision, and backup contract decisions are recorded. |
| Admin flow polish | `docs/issue-53-admin-flow-polish-snapshot.md` | Setup/settings/admin surfaces and persistence diagnostics are tied into one admin workflow. |
| Persistence language | `docs/issue-57-persistence-language-snapshot.md` | Admin-facing language for local, shared, hybrid, failure, and conflict states is preserved. |

## Maintenance Checklist

Before opening a persistence/admin PR:

- add or update the relevant snapshot,
- link the snapshot from `README.md` or this guide when it becomes a durable reference,
- run `npm run docs:check`,
- run `npm run check` when JavaScript, tests, or package scripts changed,
- record any intentionally skipped checks in the snapshot.
