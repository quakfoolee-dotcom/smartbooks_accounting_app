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
    main.js
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
