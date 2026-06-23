# SmartBooks Release Workflow

This workflow keeps `main` deployable while the app is still moving quickly.

## Release Chain

```text
Pull request -> SmartBooks CI -> merge to main -> Deploy SmartBooks Pages -> Live Pages Smoke
```

## Required Branch Protection

Protect `main` with a branch ruleset that requires:

- Pull request before merge.
- Branch up to date before merge.
- Required status check: `SmartBooks CI / CI Result`.
- Block force pushes.
- Block branch deletion.

Do not require `Deploy SmartBooks Pages` or `Live Pages Smoke` before merge. Those run after code lands on `main`.

## Pull Request Gate

Every pull request to `main` runs `SmartBooks CI`.

The CI workflow has separate jobs for:

- `Syntax Check`
- `Unit Tests`
- `Coverage Report`
- `Functional Browser Tests`
- `CI Result`

Use `CI Result` as the required branch-protection check. It fails if any upstream CI job fails, and it stays stable if more jobs are added later.

`Coverage Report` is currently informational. It uploads the service coverage artifact for review, but it is intentionally not included in the required `CI Result` gate until the project has a stable baseline.

## Local Pre-Push Gate

Before pushing normal app changes, run:

```powershell
npm run test:all
```

When changing service or accounting logic, also run:

```powershell
npm run coverage
```

Before or after deployment-related changes, also run:

```powershell
npm run test:pages-smoke
```

## Deployment

`Deploy SmartBooks Pages` runs after `SmartBooks CI` succeeds on `main`.

The deploy workflow:

- uses the exact commit that passed CI
- publishes the `frontend/` directory
- uses the `github-pages` environment
- cancels stale deploy attempts when a newer deploy starts

## Live Smoke

`Live Pages Smoke` runs after Pages deployment succeeds, can be triggered manually, and also runs weekly.

The smoke test verifies the deployed app loads cleanly and catches public-site regressions such as:

- startup failures
- browser console errors
- visible mojibake or icon corruption
- broken sidebar, Manage menu, or Reports navigation

Manual runs can target another URL with the `pages_url` input.

## Failure Response

When CI fails:

1. Open the failed job first, not the aggregate `CI Result`.
2. Download Playwright artifacts if a browser test failed.
3. Reproduce locally with the smallest matching command.
4. Fix the defect in a new commit.
5. Push and wait for `CI Result` to pass.

When deployment fails:

1. Confirm Pages source is `GitHub Actions`.
2. Confirm Actions workflow permissions allow Pages deployment.
3. Check the deploy job logs.
4. Re-run `Deploy SmartBooks Pages` only after the root cause is understood.

When live smoke fails:

1. Open the deployed site manually.
2. Download Playwright artifacts.
3. Confirm whether the failure is deployment-specific or reproducible locally.
4. If deployment-specific, re-run deploy after checking artifact contents.
