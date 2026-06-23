# Navigation And Settings Architecture

This document records the current SmartBooks navigation rules so sidebar, rail, Customize, search, and settings behavior stay consistent.

## Source Of Truth

`frontend/src/services/navigation-model.js` owns:

- default menu order
- default visible menu items
- hidden optional shortcuts
- menu normalization
- locked items
- menu-to-bookmark mapping

Feature modules should not invent their own default sidebar order. They should use the navigation model or a state value produced by the navigation model.

## Default Sidebar Rule

The default sidebar should show core work areas only:

- Get Things Done
- Dashboards
- Reports
- Banking
- Transactions
- Accounting
- Sales & Get Paid
- Customers & Leads
- Expenses & Pay Bills
- Vendors
- Products & Services
- Projects
- Time
- Payroll & HR
- Taxes

The following shortcuts are optional by default and should appear only when the user enables them through Manage menu:

- My Apps
- Settings
- Setup Checklist

Rationale: these are useful administrative shortcuts, but they are not daily accounting workflow destinations for every user. Keeping them optional lowers sidebar noise while still preserving user control.

## Always Available Controls

Hiding optional shortcuts from the sidebar must not remove the underlying capability.

- Settings should remain available through app controls and search.
- Setup Checklist should remain available through Manage menu, search, and relevant workflow entry points.
- My Apps should remain available when the user adds it or searches for it.
- Dashboard should remain locked on for safety.

## Customize Menu Responsibilities

`frontend/src/features/menu-customization.js` owns the Manage menu UI:

- show and hide menu items
- reorder menu items
- add selected items to bookmarks
- save, cancel, and restore defaults

It should delegate default order, visibility, and bookmark mapping to `SmartBooksNavigation`.

## Sidebar Responsibilities

`frontend/src/features/sidebar-navigation.js` owns rendering:

- menu item labels
- menu item icons
- sidebar chevrons
- bookmark rows
- active item state

It should render the normalized model. It should not decide which optional shortcuts are visible by default.

## Functional Test Contract

Navigation tests should use shared helpers from:

```text
tests/functional/support/smartbooks-app.js
```

The current UI contract snapshot is:

```text
tests/functional/snapshots/ui-contract-baseline.json
```

This snapshot protects:

- default sidebar labels and order
- My Apps, Settings, and Setup Checklist being hidden by default
- Manage menu optional shortcut checkbox states
- Dashboard staying locked on

## Migration Rules

When changing navigation behavior:

1. Update `navigation-model.js`.
2. Update functional tests if the visible contract intentionally changes.
3. Update `tests/functional/snapshots/ui-contract-baseline.json` in the same PR.
4. Update this document if the business rule changes.

