# Issue 49 Persistence Diagnostics Snapshot

Date: 2026-06-28

## Goal

Make backend persistence problems actionable from the app UI without risking local or shared company data.

## Before And After

| Area | Before | After |
| --- | --- | --- |
| Warning guidance | The panel showed the last storage error and retry/export buttons, but did not explain what to do if the warning stayed visible. | Warning states now include compact fallback guidance that tells users to retry shared storage, then export or save a local copy if the warning persists. |
| Backend load/save failure actions | Backend warning states offered retry load, retry save, export backup, and settings review. | Backend warning states also offer `Save local copy`, a non-backend fallback action for preserving the current browser session. |
| Revision conflict actions | Conflict states told users to export the current session and reload shared data. | Conflict states now also include the local copy action and clarify that reload only reads from shared storage. |
| Local fallback behavior | Users had to infer that export was the only safe fallback while backend storage was unhealthy. | The UI can save a browser safety copy using existing persistence helpers. This action writes to local/session storage only and does not send backend PUT requests. |
| Diagnostic visibility | The panel already showed save location, service address, saved version, last shared save, shared loads, shared saves, and issue count. | Those diagnostics remain visible while the warning copy and action row make the next step explicit. |

## Files Changed

| File | Change |
| --- | --- |
| `frontend/src/services/dashboard-operations-service.js` | Added warning guidance, exposed last error text, and added the `Save local copy` action for persistence warning states. |
| `frontend/src/features/dashboard-widgets.js` | Rendered guidance copy and handled `save-local-fallback-copy` through local/session persistence helpers only. |
| `tests/unit/dashboard-operations-service.test.js` | Updated persistence summary expectations for backend errors and revision conflicts. |
| `tests/functional/persistence-runtime.spec.js` | Added Playwright coverage for warning guidance, local safety-copy creation, and no backend writes during fallback. |

## QC Results

| Check | Result |
| --- | --- |
| Unit tests | Passed: `npm run test:unit` |
| Targeted functional tests | Passed: `npx playwright test tests/functional/persistence-runtime.spec.js tests/functional/dashboard-customization.spec.js` |
| Project syntax/docs check | Passed: `npm run check` |

## Follow-Up

After this lands, the next persistence priority is to connect these diagnostics to the production backend deployment checklist so operators know when a warning reflects configuration, service health, or data conflict.
