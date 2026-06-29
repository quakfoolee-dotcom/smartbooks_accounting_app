# Issue 62 Dark Mode Contrast Snapshot

Date: 2026-06-28

## Objective

Expand dark-mode contrast coverage across workflow, dashboard, setup/admin, report, and settings cards so injected card sections do not regress to pale backgrounds behind dark-mode text.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Test coverage | Dark-mode contrast coverage focused on the estimate-to-payment workflow steps only. | Coverage now audits high-risk dashboard, workflow, expenses, reports, settings, and setup/admin card surfaces. |
| Card backgrounds | The test suite could miss injected cards that kept light backgrounds in dark mode unless they were part of the estimate-to-payment workflow. | The new audit fails if visible card-like sections keep a pale background in dark mode, excluding intentional document/print preview surfaces. |
| Text coverage | Headline and detail text were checked only for estimate-to-payment workflow steps. | The audit checks headings, body/muted text, status pills, badges, setup states, and buttons inside the covered card surfaces. |
| Setup/admin coverage | Setup rows and admin cards were not part of the dark-mode contrast test. | Setup rows, setup status pills, admin cards, and setup stats are included. |
| Production CSS | Existing dark-mode token coverage already passed for the audited surfaces. | No production CSS change was needed; this issue adds regression coverage to protect the current dark-mode behavior. |

## Audited Surfaces

| Surface | Coverage |
|---|---|
| Dashboard | Core dashboard cards, feed cards, funnel cards, KPI-style widgets |
| Get Things Done | Workflow steps, task cards, workflow templates, estimate-to-payment cards |
| Expenses | Bills, capture, expenses, and payments tabs |
| Reports | Report cards and table-card sections |
| Settings | Admin/settings cards and risk cards |
| Setup | Setup cards, checklist rows, setup stats, and setup state pills |

## QC Results

| Check | Result |
|---|---|
| Syntax and docs check | Passed: `npm run check` |
| Accessibility and visual functional spec | Passed: `npx playwright test tests/functional/accessibility-and-visual.spec.js --workers=1 --reporter=list`, 6/6 |
| UI contract snapshot spec | Passed: `npx playwright test tests/functional/ui-contract-snapshots.spec.js --workers=1 --reporter=list`, 1/1 |

