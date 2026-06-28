# Issue 48 Large-State Performance Snapshot

This report records the before/after state for GitHub issue #48: adding realistic large-state performance coverage and configurable budgets before database-backed persistence becomes the default path.

## Before

| Area | Before #48 | Risk |
|---|---|---|
| Fixture volume | Startup and backend checks mostly used default/demo state. | Database-readiness could look healthy while realistic record counts were untested. |
| Timing coverage | Baseline artifacts covered startup, default backend save, and default backend reads. | Large-state dashboard render and backend read latency were not separated from startup timing. |
| Budget profile | Budgets were configurable through single environment variables. | Local and CI thresholds could not evolve independently without replacing the same values. |
| Documentation | `docs/performance-baseline.md` listed broad performance intent. | The issue-specific before/after record was missing. |

## After

| Area | After #48 | Action Taken |
|---|---|---|
| Large fixture | `tests/functional/performance.spec.js` generates deterministic customers, vendors, invoices, payments, expenses, bills, bill payments, and bank transactions. | Added realistic state volume without committing bulky fixture files. |
| Startup metrics | The performance spec runs default local startup, backend startup, and large-state local/backend startup. | Keeps startup regressions visible for both default and large data. |
| Dashboard metric | The large-state artifact includes a `dashboard.renderMs` timing. | Separates dashboard render cost from page startup. |
| Backend read metric | The large-state artifact includes `backend.readMs` and response size. | Separates fixture-backed backend read latency from backend startup. |
| Backend save metric | The large-state artifact includes `backend.saveMs` and write count. | Confirms a large state can still pass through the backend save path. |
| Navigation metrics | The large-state artifact includes per-step navigation timings and max step duration. | Tracks Sales, Expenses, Reports, and Profit and Loss report flow cost. |
| Budgets | Budget selection supports `*_BUDGET_LOCAL_MS`, `*_BUDGET_CI_MS`, and legacy `*_BUDGET_MS` names. | Lets developer machines and CI runners use separate guardrails while preserving existing overrides. |

## Validation

| Check | Result |
|---|---|
| `npx playwright test tests/functional/performance.spec.js` | Passed: 4 tests |
| `npm run check` | Passed |
| `npm test` | Passed |

## Follow-Up

| Next Step | Reason |
|---|---|
| Publish performance artifacts from CI | Makes timing drift reviewable across pull requests. |
| Add accounting workflow timing | Invoice creation, payment posting, and reconciliation will matter once database mode is real. |
| Revisit budgets after hosted CI data | CI thresholds should be based on observed runner behavior instead of guesses. |
