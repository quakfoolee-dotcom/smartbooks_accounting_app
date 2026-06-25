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

## 0.1.0 - 2026-06-25

### Added

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

### Changed

- Backend persistence now uses a file adapter boundary so future database storage can plug into the same contract.
- Frontend backend/hybrid persistence now sends company scope, request ID, and state revision headers.
- Hybrid migration keeps local backups before saving browser state to backend storage.
- Settings, setup, and persistence documentation now describe production-readiness gates before database work begins.

### Fixed

- Fixed setup review action routing so the `Review setup` dashboard action opens the expected setup workflow.
- Fixed hidden-module navigation leakage so hidden modules are not exposed through shortcuts or actions.
- Fixed dark-mode readability for estimate-to-payment workflow cards.
- Fixed dark-mode workflow contrast fallback so cards switch to dark backgrounds when `body.dark-mode` is active.

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

### Tests

- Added adapter and API tests for backend state read/write, company scope, revision conflict handling, backup/list/restore, invalid restore requests, and oversized payloads.
- Added frontend storage tests for backend company headers, revision propagation, and conflict error preservation.
- Added Playwright coverage for backend persistence runtime behavior and dark-mode workflow contrast.
- Added broader visual/accessibility checks for keyboard access, modal behavior, button sizing, workflow table layout, and dark-mode card readability.
