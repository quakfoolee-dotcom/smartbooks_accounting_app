# Issue 93 Lifecycle Hooks Snapshot

Date: 2026-07-02

## Objective

Replace one high-risk runtime monkey-patch path with an explicit lifecycle hook contract, then document the remaining reassignment paths for future refactor slices.

## Before And After Fix Report

| Area | Before | After |
|---|---|---|
| Save/render lifecycle | V58 directly reassigned `saveState` and `renderAll` in `frontend/src/runtime/stability-and-api.js` to reconcile state, invalidate caches, inject styles, and run post-render cleanup. | `frontend/src/runtime/lifecycle-hooks.js` now provides `beforeSave`, `normalizeState`, `beforeRender`, and `afterRender` hook registration. V58 behavior is registered through named hooks. |
| Hook order | Save/render behavior depended on script load order and wrapper nesting. | Hook callbacks run in deterministic registration order and are covered by unit tests. |
| Runtime install contract | Each slice owned its own wrapper around global functions. | `SmartBooksLifecycle.installCoreHooks()` installs one core save/render wrapper and returns `false` on repeat install attempts. |
| Test coverage | No focused unit test proved hook order or install idempotence. | `tests/unit/lifecycle-hooks.test.js` proves registration order, unregister behavior, and one-time save/render wrapping. |
| Compatibility | V58 save/render reconciliation behavior was embedded in anonymous reassignment wrappers. | V58 still reconciles before save/render, invalidates dynamic caches before render, and runs post-render sync through explicit hook names. |

## Hook Contract Added

| Hook | Current V58 Use |
|---|---|
| `normalizeState` | Runs `v58ReconcileData()`. |
| `beforeSave` | Runs the `normalizeState` hook before the base `saveState`. |
| `beforeRender` | Injects stability styles, runs `normalizeState`, and invalidates dynamic caches before the base `renderAll`. |
| `afterRender` | Runs dashboard/widget/money-alignment post-render cleanup. |

## Remaining Monkey-Patch Follow-Ups

| Area | Remaining Pattern | Suggested Follow-Up |
|---|---|---|
| Runtime actions | `stability-and-api.js` still reassigns `handleAction` and `submitModal` for V58/V59/V60 behavior. | Add action and modal-submit lifecycle dispatchers, then migrate one runtime wrapper at a time. |
| Runtime save bridge | V59 and V63 still reassign `saveState` for safe local storage and async backend persistence. | Move persistence-specific behavior into `beforeSave` or a dedicated `saveStrategy` hook once backend/local mode ordering is covered. |
| Runtime render layers | V59, V60, V62, and button consistency still reassign `renderAll`. | Move UI stabilization and button consistency into `beforeRender`/`afterRender` hooks. |
| Feature modules | Feature files still wrap `renderAll`, `handleAction`, `submitModal`, and `resetState` directly. | Convert feature modules to explicit `install` functions that register hooks and action handlers. |
| Reset behavior | Several feature modules still reassign `resetState` to ensure versioned state. | Add a `normalizeInitialState` or `afterReset` lifecycle hook before changing reset wrappers. |

## QC Results

| Check | Result |
|---|---|
| Lifecycle hook unit test | Passed: `node tests/unit/lifecycle-hooks.test.js` |
| Unit suite | Passed: `npm run test:unit` |
| Syntax and docs check | Passed: `npm run check` |
| Persistence runtime smoke | Passed: `npm run test:functional:persistence` |
| Startup navigation smoke | Passed: `npx playwright test tests/functional/startup-navigation.spec.js` |
