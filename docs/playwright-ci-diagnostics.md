# Playwright CI Diagnostics

SmartBooks CI keeps Playwright failure artifacts short-lived and shard-specific so failed browser checks can be diagnosed without rerunning blindly.

## When Artifacts Appear

Passing Playwright jobs do not upload large browser artifacts. When a functional shard or live Pages smoke test fails, GitHub Actions uploads a diagnostics artifact for that failed job.

| Workflow job | Artifact name | Retention |
|---|---|---|
| Functional Browser Tests (ui) | `playwright-diagnostics-ui` | 7 days |
| Functional Browser Tests (accounting) | `playwright-diagnostics-accounting` | 7 days |
| Functional Browser Tests (persistence) | `playwright-diagnostics-persistence` | 7 days |
| Functional Browser Tests (performance) | `playwright-diagnostics-performance` | 7 days |
| Live Pages Smoke | `pages-smoke-diagnostics` | 7 days |

## What Is Included

| Path | Purpose |
|---|---|
| `playwright-diagnostics/*-summary.md` | Concise failure summary, failed test names, first error lines, and artifact manifest. |
| `playwright-diagnostics/*-manifest.json` | Machine-readable list of artifact files and failed tests. |
| `test-results/playwright-results.json` | Playwright JSON report for the failed shard. |
| `test-results/**` | Traces, screenshots, videos, and test attachments retained on failure. |
| `playwright-report/` | HTML report generated only in CI. |

## How To Inspect

1. Open the failed GitHub Actions run.
2. Open the failed shard job before opening `CI Result`.
3. Download the shard artifact from the run's artifact list.
4. Unzip the artifact locally.
5. Read `playwright-diagnostics/*-summary.md` first.
6. Open the HTML report:

```powershell
npx playwright show-report playwright-report
```

7. Open a trace ZIP when the summary or report points to one:

```powershell
npx playwright show-trace path\to\trace.zip
```

8. If performance timing changed, inspect attached JSON files under `test-results/`.

## Diagnostic Rules

- Do not change a test threshold before checking the artifact.
- Map the failure to the shard first, then the spec, then the failing test title.
- Treat screenshots and traces as the source of truth for UI state.
- Keep intentional-failure validation temporary and revert it before opening a PR.
