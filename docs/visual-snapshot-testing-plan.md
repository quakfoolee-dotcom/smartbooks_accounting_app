# Visual Snapshot Testing Plan

SmartBooks now uses a structured UI contract snapshot as the first formal snapshot layer. Full pixel screenshots can come later after the UI system stabilizes further.

## Current Snapshot Layer

Implemented test:

```text
tests/functional/ui-contract-snapshots.spec.js
```

Approved baseline:

```text
tests/functional/snapshots/ui-contract-baseline.json
```

Run it with:

```powershell
npm run test:ui-contracts
```

This snapshot verifies:

- dashboard is the startup page
- default sidebar order
- My Apps, Settings, and Setup Checklist are hidden by default
- Manage menu exposes those optional shortcuts unchecked and enabled
- Dashboard remains checked and disabled
- dashboard quick actions remain present

## Why Structured First

Structured snapshots are less noisy than pixel snapshots. They catch the product contract we care about today without failing because of font rendering, anti-aliasing, operating system differences, or small spacing changes.

This is the correct first step because the app is still actively changing its UI layout, button sizing, table layout, and dark-mode contrast.

## When To Add Pixel Snapshots

Add full visual snapshots after these conditions are stable:

- sidebar information architecture is settled
- button sizing and action groups are normalized across major pages
- dark mode contrast is consistently passing
- side-by-side table-card layout regressions are under control
- core workflows have stable demo data

Recommended first pixel snapshot screens:

- dashboard, light mode
- dashboard, dark mode
- Manage menu
- Customize dashboard layout
- Reports detail
- Expenses page with table actions

## Pixel Snapshot Rules

When pixel snapshots are added:

- Use Chromium first.
- Prefer one or two high-value screens per PR, not the whole app.
- Mask timestamps, generated IDs, and changing chart values where possible.
- Keep viewport sizes explicit.
- Store approved screenshots under `tests/functional/snapshots/visual/`.
- Update screenshots only when the UI change is intentional and reviewed.

## CI Guidance

The structured snapshot should remain part of the normal Playwright suite.

Pixel snapshots should begin as non-blocking or targeted tests until the baseline proves stable. Once false positives are low, promote them into the required functional test gate.

