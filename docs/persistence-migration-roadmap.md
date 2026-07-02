# Persistence Migration Roadmap

Date: 2026-07-01

This roadmap tracks SmartBooks persistence migration from browser-only storage toward production-ready backend persistence. It summarizes what is complete, what remains open, and the recommended next issue order.

Backend persistence is still opt-in. Do not use real customer accounting data until the production gates in `docs/production-persistence-hardening.md` are complete.

## Current Roadmap Status

| Area | Status | Evidence |
|---|---|---|
| Browser-local baseline | Complete | `local` remains the default mode in `docs/persistence-contract.md`. |
| Backend state envelope | Complete | Backend state routes read/write the persistence envelope with schema, company, source, saved time, and revision fields. |
| Runtime backend/hybrid modes | Complete | Frontend storage can use local, backend, or hybrid migration modes. |
| Migration safeguards | Complete | Hybrid migration keeps local fallback behavior and avoids silent backend overwrites. |
| Request identity and company scoping | Complete | State requests require `X-SmartBooks-Company-Id` and carry request IDs. |
| Revision conflict handling | Complete | Existing backend state writes and restores require current revisions and reject stale writes. |
| Server-side backup and restore | Complete for file-backed mode | Backup/list/restore paths exist and are revision guarded. |
| Performance baselines | Complete for current app shape | Functional performance budgets cover startup, backend read/save, dashboard render, and navigation. |
| CI automation | Complete for current queue | CI gates, Playwright sharding, and diagnostics artifacts are documented and wired. |
| Backend integration coverage | Complete for current file and database-shaped adapters | Storage mode integration and database fixture coverage exist. |
| Production deployment readiness docs | Complete for current opt-in backend mode | Health/readiness/metrics endpoints, deployment runbook, smoke tests, and topology docs are in place. |
| Live database runtime | Not started | Database adapter contract exists, but no live SQL adapter is wired into production runtime. |
| Production auth and authorization | Not started | Company headers exist, but real user identity and role-aware permissions remain open. |
| Durable audit logging | Not started | State mutations do not yet write separate audit events. |
| Backup retention and restore drills | Not started | File backups exist, but production retention and off-host recovery policy remain open. |

## Recently Completed Roadmap Slice

| Issue | Result |
|---|---|
| #82 | Added GitHub Actions quality gate coverage for checks and functional suite. |
| #83 | Added Playwright functional sharding for more reliable CI runtime. |
| #84 | Captured Playwright diagnostics and failure artifacts. |
| #85 | Added backend persistence integration tests across storage modes. |
| #86 | Added database adapter integration fixture coverage. |
| #87 | Documented backend persistence deployment topology and migration path. |
| #88 | Added production health, liveness, readiness, and metrics endpoints. |
| #89 | Added production deployment runbook and backend smoke guidance. |
| #90 | Added deployment smoke test for critical SmartBooks workflows. |

## Current Open Work

The next open issues are refactoring and code-smell work. This matters because persistence and deployment foundations are now strong enough that maintainability risk is the next bottleneck.

| Recommended Order | Issue | Code Smell Type | Why This Order |
|---|---|---|---|
| 1 | #93 Replace runtime monkey patching with explicit lifecycle hooks | Change blocker, coupler | Reduces hidden runtime coupling before deeper startup and persistence refactors. |
| 2 | #96 Route all app persistence access through storage service | Coupler | Keeps persistence behavior behind one access boundary. |
| 3 | #92 Split seed data and startup orchestration out of `main.js` | Bloater | Makes app startup easier to reason about before larger domain splits. |
| 4 | #91 Refactor dashboard card rendering out of sales-tax inventory module | Bloater, change blocker | Removes dashboard UI ownership from a feature-specific module. |
| 5 | #94 Consolidate delegated UI action listeners into a dispatcher | Change blocker | Gives UI events a clearer extension point after lifecycle/startup boundaries improve. |
| 6 | #97 Extract accounting workflow mutations into command services | Coupler | Separates business actions from UI surfaces after event/lifecycle seams are cleaner. |
| 7 | #95 Move stable injected CSS blocks into shared stylesheet | Dispensable | Removes duplicated style injection after feature ownership is clearer. |
| 8 | #98 Replace legacy mojibake icon literals at source | Dispensable | Corrective cleanup with lower architectural risk. |

## Production Gates Still Required

| Gate | Required Next Capability | Likely Follow-Up Issue |
|---|---|---|
| Live database storage | Implement a real PostgreSQL/Supabase adapter behind the database adapter contract. | Add live database adapter runtime configuration and tests. |
| SQL migrations | Add versioned schema migrations for company state, backups, and future audit rows. | Add backend migrations folder and migration validation. |
| Authentication | Attach real signed-in user identity to every backend state request. | Add production auth boundary for state APIs. |
| Authorization | Enforce company membership and role-aware permissions. | Add viewer/editor/admin permission checks for state routes. |
| Audit logging | Store durable audit events for save, migration, backup, restore, reset, and failures. | Add state mutation audit event store. |
| Backup retention | Define retention, off-host backups, and restore drills. | Add production backup retention and restore runbook. |
| Operational alerts | Alert on readiness failures, save failures, restore failures, and storage errors. | Add production monitoring thresholds and alert docs. |
| Data protection | Document encryption, key management, rate limits, and abuse controls. | Add production security hardening implementation issue. |

## Backend Default Decision Gate

Backend persistence should not become the default until all of these are true:

| Requirement | Current State |
|---|---|
| Authenticated identity exists for backend state requests. | Open |
| Company membership and roles are enforced server-side. | Open |
| Mutating state actions create durable audit events. | Open |
| Live database adapter passes the same contract as the file adapter. | Open |
| Backup retention and restore drills are documented and tested. | Open |
| Production monitoring alerts exist for readiness and state failures. | Open |
| Manual QA passes local, hybrid, backend, backup, restore, export, reset, and conflict flows. | Partially covered; needs release-specific QA. |

## Validation Commands

Use these commands when changing the persistence roadmap or related docs:

```powershell
npm run docs:check
npm run check
```

When changing runtime persistence behavior, also run the relevant persistence and deployment tests:

```powershell
npm run test:integration:database
npm run smoke:backend
npm run test:deployment-smoke
```

Related docs:

| Doc | Purpose |
|---|---|
| `docs/persistence-contract.md` | Current state envelope, API contract, migration rules, and implementation sequence. |
| `docs/backend-persistence-deployment-topology.md` | Deployment shapes and migration path from local to backend to database-backed persistence. |
| `docs/database-persistence-adapter-contract.md` | Future database adapter contract, proposed tables, and database fixture coverage. |
| `docs/production-persistence-hardening.md` | Production readiness gates before backend persistence can store real data. |
| `docs/production-backend-environment.md` | Required backend and frontend runtime settings. |
| `docs/production-deployment-runbook.md` | Deployment sequence, smoke tests, monitoring, rollback, and evidence. |
