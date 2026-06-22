# SmartBooks Accounting App

SmartBooks has been converted from a single HTML file into a basic app development structure.

## Run Locally

```powershell
npm start
```

Then open:

```text
http://localhost:3000
```

## Project Layout

```text
frontend/
  index.html
  src/
    services/
      icon-service.js
      storage-service.js
    main.js
    features/
      sales-tax-inventory-ui.js
      workflows-and-reporting.js
      dashboard-widgets.js
      navigation-search.js
      record-workflows.js
    runtime/
      stability-and-api.js
    styles.css
backend/
  src/
    server.js
  data/
shared/
  constants.js
docs/
  migration-notes.md
```

The frontend currently preserves the original localStorage behavior. The backend is ready for the next step: replacing browser-only storage with API-backed persistence.

The JavaScript has been split into ordered classic scripts. `frontend/src/services/icon-service.js` normalizes legacy icon glyphs into inline SVG, `frontend/src/services/storage-service.js` owns browser persistence, `frontend/src/main.js` initializes the legacy app core, feature modules extend the UI and workflows, and `frontend/src/runtime/stability-and-api.js` installs the backend-ready API layer.
