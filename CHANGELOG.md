# Changelog

All notable changes to SmartBooks Accounting App are tracked in this file.

This project follows a simple Keep a Changelog-style format:

- `Added` for new capabilities.
- `Changed` for updates to existing behavior.
- `Fixed` for bug fixes.
- `Security` for safety, scoping, and data-protection changes.
- `Docs` for documentation-only updates.
- `Tests` for validation and regression coverage.

## Unreleased

Use this section for the next pull request before moving entries into a dated release section.

### Added

- Added a deterministic large-state performance fixture with startup, navigation, report rendering, and backend save budget checks.
- Added actionable storage diagnostics controls for retrying backend load/save, exporting a backup, and opening settings from the dashboard operations console.

### Changed

- Reworded persistence/admin status labels so local, backend, warning, and conflict states are clearer for non-technical users.

### Tests

- Added dashboard and persistence runtime coverage for the new storage diagnostics actions, including retrying a failed backend load.

## 0.1.0 - 2026-06-25

### Added

- Added dashboard operations console for monitoring open work and setup activity.
- Added backend state envelope support with schema version, company ID, saved timestamp, source, and revision metadata.
- Added request company scope and request ID handling for backend state reads and writes.
- Added optimistic revision conflict handling so stale backend saves return `409 STATE_REVISION_CONFLICT` instead of overwriting newer state.
- Added server-side backend backup, backup listing, and restore endpoints:
  - `POST /api/state/backup`
  - `GET /api/state/backups`
  - `POST /api/state/restore`
- Added persistence diagnostics for backend mode, including revision visibility and conflict-specific reload guidance.
- Added initial performance baseline checks for local startup, backend startup/save, and backend read latency.
- Added GitHub project issue tracking for upcoming maintenance work, including dark-mode contrast coverage.
- Added CI workflow summary publishing for GitHub Actions visibility.
- Added user manual coverage for starter, invoice, expense, and bill workflows.
- Added business logic test matrix coverage for accounting workflow expectations.
- Added project README updates, logo documentation, and coding style conventions.

### Changed

- Backend persistence now uses a file adapter boundary so future database storage can plug into the same contract.
- Frontend backend/hybrid persistence now sends company scope, request ID, and state revision headers.
- Hybrid migration keeps local backups before saving browser state to backend storage.
- Settings, setup, and persistence documentation now describe production-readiness gates before database work begins.
- Core UI patterns were stabilized across dashboard cards, workflow surfaces, and transaction action groups.
- Sidebar defaults and workflow layouts were refined for easier scanning.
- Contact, transaction, bank, and general action button groups were normalized for more consistent sizing and hierarchy.

### Fixed

- Fixed setup review action routing so the `Review setup` dashboard action opens the expected setup workflow.
- Fixed hidden-module navigation leakage so hidden modules are not exposed through shortcuts or actions.
- Fixed dark-mode readability for estimate-to-payment workflow cards.
- Fixed dark-mode workflow contrast fallback so cards switch to dark backgrounds when `body.dark-mode` is active.
- Fixed dashboard and workflow dark-mode contrast regressions found during manual review.
- Fixed inconsistent bank action button widths and transaction action sizing issues.

### Security

- Backend state API rejects missing, malformed, or cross-company `X-SmartBooks-Company-Id` requests.
- Backend writes reject payloads whose `companyId` does not match request scope.
- Restore requests validate backup IDs, company scope, envelope shape, and current revision before writing.
- Oversized backend state payloads are rejected before persistence.

### Docs

- Added production persistence hardening guidance.
- Added persistence contract documentation for state read/write, revisions, backups, and restore behavior.
- Added issue snapshots for request scoping, revision conflicts, and backup/restore work.
- Added maintenance classification and GitHub issue planning for corrective, perfective, and adaptive work.
- Added UI/UX audit report and reference working checklist.
- Added GitHub project planning notes for stabilization, persistence migration, and upcoming maintenance work.

### Tests

- Added adapter and API tests for backend state read/write, company scope, revision conflict handling, backup/list/restore, invalid restore requests, and oversized payloads.
- Added frontend storage tests for backend company headers, revision propagation, and conflict error preservation.
- Added Playwright coverage for backend persistence runtime behavior and dark-mode workflow contrast.
- Added broader visual/accessibility checks for keyboard access, modal behavior, button sizing, workflow table layout, and dark-mode card readability.
- Added service coverage, aging, report value, deposit, bank match, and workflow business-rule tests.
- Added manual flow and documentation checks to CI.
- Added performance and restoration checks for backend persistence readiness.

### Backfilled Development Timeline

#### Persistence and Backend Readiness

- `#25` added the persistence plan and dashboard operations service.
- `#26` added the backend state envelope API.
- `#27` added the opt-in frontend/backend storage bridge.
- `#36` added the persistence diagnostics panel.
- `#37` wired runtime behavior to async backend persistence modes.
- `#38` added persistence migration and failure hardening.
- `#39` added backend restoration functional testing.
- `#40` added performance baseline testing.
- `#41` documented production persistence hardening.
- `#43` introduced the backend persistence adapter contract.
- `#55` added request company scope guarding.
- `#59` added optimistic revision conflict handling.
- `#63` added server-side backup, listing, and restore endpoints.

#### UX, Navigation, and Workflow Polish

- `#17` and `#18` documented and addressed early UI/UX audit findings.
- `#19` through `#22` normalized button sizing and action groups across bank, transaction, contact, and workflow surfaces.
- `#23` and `#24` added stabilization hardening, the dashboard operations console, and the reference working checklist.
- `#44` fixed the setup review dashboard action.
- `#54` audited hidden-module navigation and action leakage.
- `#60` and `#61` fixed dark-mode workflow card contrast and fallback behavior.

#### Quality, CI, and Test Coverage

- `#6` organized functional tests and added a health audit.
- `#9` added the business logic test matrix and accounting workflow assertions.
- `#10` hardened CI/CD release workflow behavior.
- `#11` through `#13` expanded service coverage, aging tests, focused unit coverage, and coverage gate enforcement.
- `#14` through `#16` added user manual coverage and manual bill/invoice flow checks.

#### Documentation and Project Operations

- Added README expansion, SmartBooks logo documentation, and project style conventions.
- Added UI/UX audit reporting, user manuals, and production persistence guidance.
- Added GitHub project issue planning for corrective, perfective, and adaptive maintenance.
- `#64` created the changelog file so future completed work has a single release-history home.
