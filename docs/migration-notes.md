# SmartBooks Migration Notes

The original `smartbooks_accounting_app.html` file has been split into a conventional app structure while preserving the current browser behavior.

## Current Structure

- `frontend/index.html` contains the app shell and markup.
- `frontend/src/styles.css` contains the extracted CSS.
- `frontend/src/services/icon-service.js` replaces legacy corrupted icon glyphs with stable inline SVG icons.
- `frontend/src/main.js` contains the core app bootstrap and original state/render foundation.
- `frontend/src/services/storage-service.js` provides the frontend storage adapter. It still defaults to `localStorage`, but app code now calls the adapter instead of owning storage directly.
- `frontend/src/features/` contains ordered feature modules split from the original script.
- `frontend/src/runtime/stability-and-api.js` contains late-stage state hardening and the backend-ready API layer.
- `backend/src/server.js` serves the frontend and exposes starter API routes.
- `backend/data/` is reserved for local backend data files.
- `shared/constants.js` contains values shared by backend code and future frontend modules.

## Backend Handoff Plan

The current app still saves data through the frontend storage adapter, which defaults to `localStorage` to match the original behavior. The backend exposes these starter routes for the next migration step:

- `GET /api/health`
- `GET /api/state`
- `POST /api/state`
- `PUT /api/state`

Next, add an asynchronous backend mode to `frontend/src/services/storage-service.js`, then switch that adapter to call `/api/state`.

Before implementing that switch, use `docs/persistence-contract.md` as the working contract for the backend state envelope, migration behavior, error handling, validation, and test plan.

Backend progress:

- `/api/state` now returns `{ ok, data }` with a versioned state envelope.
- `PUT /api/state` and `POST /api/state` write the envelope form and preserve legacy raw-state compatibility.
- Backend state API behavior is covered by `tests/unit/backend-state-api.test.js`.

Frontend progress:

- `frontend/src/services/storage-service.js` now exposes async backend persistence methods.
- The app still defaults to localStorage mode.
- Backend and hybrid save/load behavior is covered by `tests/unit/storage-backend-service.test.js`.

## Next Refactor Targets

- Continue splitting the feature modules by domain: customers, vendors, invoices, banking, reports, settings, and dashboard.
- Move formatting and calculation helpers into `frontend/src/utils/`.
- Move data access into `frontend/src/state/` and `frontend/src/services/`.
- Replace the starter file-backed backend state with a database once the API shape is stable.
