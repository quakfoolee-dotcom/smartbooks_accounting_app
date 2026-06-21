# SmartBooks Migration Notes

The original `smartbooks_accounting_app.html` file has been split into a conventional app structure while preserving the current browser behavior.

## Current Structure

- `frontend/index.html` contains the app shell and markup.
- `frontend/src/styles.css` contains the extracted CSS.
- `frontend/src/main.js` contains the core app bootstrap and original state/render foundation.
- `frontend/src/features/` contains ordered feature modules split from the original script.
- `frontend/src/runtime/stability-and-api.js` contains late-stage state hardening and the backend-ready API layer.
- `backend/src/server.js` serves the frontend and exposes starter API routes.
- `backend/data/` is reserved for local backend data files.
- `shared/constants.js` contains values shared by backend code and future frontend modules.

## Backend Handoff Plan

The current app still saves data through `localStorage`, matching the original behavior. The backend exposes these starter routes for the next migration step:

- `GET /api/health`
- `GET /api/state`
- `POST /api/state`
- `PUT /api/state`

Next, move the localStorage access in `frontend/src/main.js` behind a small storage adapter, then switch that adapter to call `/api/state`.

## Next Refactor Targets

- Continue splitting the feature modules by domain: customers, vendors, invoices, banking, reports, settings, and dashboard.
- Move formatting and calculation helpers into `frontend/src/utils/`.
- Move data access into `frontend/src/state/` and `frontend/src/services/`.
- Replace the starter file-backed backend state with a database once the API shape is stable.
