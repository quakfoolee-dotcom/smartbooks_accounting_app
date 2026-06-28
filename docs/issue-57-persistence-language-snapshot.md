# Issue 57 Persistence Language Snapshot

Date: 2026-06-28

## Goal

Make backend/local/hybrid persistence status language easier for a non-technical user or admin to understand while keeping precise troubleshooting details visible.

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Local storage headline | The settings panel said `Saved in this browser`, with grid labels such as `Mode` and raw value `local`. | The panel now says `Saved on this device`, labels the location as `Save location`, and shows `This browser`. |
| Backend/hybrid health | Healthy states used implementation language such as `Backend sync healthy`. | Backend mode now reads `Shared storage connected`; hybrid mode reads `Migration storage connected`. |
| Failure state | Errors were introduced as `Storage needs attention` and `Last backend action failed`. | The panel now says `Company data needs attention` and `The last storage action failed`, which is clearer while preserving the actual error text. |
| Revision conflict | Conflict copy said `Newer backend data available` and referenced backend data changing in another session. | Conflict copy now says `Newer company data is available` and tells the user to export the current session if needed, then reload before saving again. |
| Action labels | Buttons used technical labels such as `Retry load`, `Retry save`, `Export session`, and `Open settings`. | Buttons now use action-oriented labels: `Try loading again`, `Try saving again`, `Export safety backup`, `Export current session`, and `Review settings`. |
| Diagnostic labels | The details grid exposed technical labels such as `Endpoint`, `Revision`, `Backend reads`, `Backend writes`, and `Errors`. | The grid now uses admin-facing labels: `Service address`, `Saved version`, `Shared loads`, `Shared saves`, and `Issues`. |
| Toast messages | Retry feedback referred to backend save/load availability. | Retry feedback now refers to company data and shared storage so it matches the panel language. |

## Files Changed

| File | Change |
| --- | --- |
| `frontend/src/services/dashboard-operations-service.js` | Added friendly mode labels and revised persistence headlines, details, and action labels. |
| `frontend/src/features/dashboard-widgets.js` | Rendered the friendlier labels in the settings panel and updated retry toast copy. |
| `tests/unit/dashboard-operations-service.test.js` | Updated unit expectations for local, backend/hybrid, error, and conflict summaries. |
| `tests/functional/dashboard-customization.spec.js` | Updated settings-panel assertions for the local storage state. |
| `tests/functional/persistence-runtime.spec.js` | Updated backend, hybrid, failure, and conflict assertions for the new language. |

## QC Results

| Check | Result |
| --- | --- |
| Unit tests | Passed: `npm run test:unit` |
| Targeted functional tests | Passed: `npx playwright test tests/functional/dashboard-customization.spec.js tests/functional/persistence-runtime.spec.js` |
| Project syntax/docs check | Passed: `npm run check` |

## Follow-Up

This keeps #57 focused on language. The next persistence/admin issue should be #49 so the clearer status panel gains stronger retry, fallback, and backup guidance when backend storage is unhealthy.

