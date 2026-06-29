# Issue 82 CI Quality Gate Snapshot

Date: 2026-06-29

## Objective

Add and document the GitHub Actions gate that runs SmartBooks quality checks on pull requests and `main` branch updates.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| CI workflow | `SmartBooks CI` already ran syntax, documentation, unit, coverage, and full functional browser jobs. | The workflow now centralizes the Node version, installs dependencies consistently for documentation checks, and keeps the full functional browser suite in the PR gate. |
| Local equivalent | Developers could combine `npm run check`, unit tests, coverage, and functional tests manually. | `npm run test:ci` now mirrors the local app CI gate in one command. |
| CI visibility | The aggregate `CI Result` job printed upstream job status to logs only. | `CI Result` now writes a GitHub step summary table for faster failure triage. |
| Documentation | CI behavior was documented across README and release workflow notes. | `docs/ci-quality-gate.md` now provides a dedicated job map, local command map, diagnostics steps, and branch-protection guidance. |
| Failure artifacts | Browser and coverage jobs already uploaded relevant artifacts. | Documentation now tells maintainers when to use Playwright failure artifacts and coverage artifacts before changing code or thresholds. |

## CI Gate Coverage

| Gate | Command or workflow behavior |
|---|---|
| Syntax and docs | `npm run check` |
| Documentation-only check | `npm run docs:check` |
| Unit tests | `npm run test:unit` |
| Coverage threshold | `npm run coverage:check` |
| Functional browser suite | `npm run test:functional` |
| Local combined gate | `npm run test:ci` |

## QC Results

| Check | Result |
|---|---|
| Syntax and docs check | Passed: `npm run check` |
| Unit test gate | Passed: `npm run test:unit` |
| Coverage threshold gate | Passed: `npm run coverage:check` |
| Targeted functional smoke | Passed: `npx playwright test tests/functional/accessibility-and-visual.spec.js --workers=1 --reporter=list`, 6/6 |
| Local CI mirror | Passed: `npm run test:ci`, including full functional suite, 36/36 |
