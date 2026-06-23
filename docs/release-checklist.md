# SmartBooks Release Checklist

Use this checklist before merging a release or stabilization branch into `main`.

## 1. Branch Hygiene

- Start from a clean working tree.
- Pull `main` with fast-forward only.
- Create a focused feature branch with the `codex/` prefix.
- Do not push directly to `main`.
- Delete merged local branches after their PRs are closed.

## 2. Local Quality Gates

Run these before opening or updating a PR:

```powershell
npm run check
npm test
npm run coverage:check
npm run test:functional
```

For accounting workflow changes, also run:

```powershell
npm run test:business
```

For UI/navigation contract changes, also run:

```powershell
npm run test:ui-contracts
```

For deployment or public runtime changes, also run:

```powershell
npm run test:pages-smoke
```

## 3. PR Review Gate

The PR should include:

- Summary of the user-facing change.
- Rationale for the change.
- Tests run locally.
- Any screenshots or manual observations for visual work.
- Known follow-up work, if any.

Wait for the required GitHub status check:

```text
SmartBooks CI / CI Result
```

## 4. Post-Merge Verification

After merging into `main`, confirm:

- `SmartBooks CI` passes on `main`.
- `Deploy SmartBooks Pages` succeeds.
- `Live Pages Smoke` succeeds.
- The public Pages URL loads the expected version.
- No visible mojibake, broken icons, or console errors appear.

## 5. Release Evidence Template

| Gate | Command or Workflow | Result | Notes |
| --- | --- | --- | --- |
| Syntax and docs | `npm run check` |  |  |
| Unit tests | `npm test` |  |  |
| Coverage thresholds | `npm run coverage:check` |  |  |
| Functional browser tests | `npm run test:functional` |  |  |
| Business workflows | `npm run test:business` |  |  |
| UI contract snapshot | `npm run test:ui-contracts` |  |  |
| Live Pages smoke | `npm run test:pages-smoke` |  |  |
| GitHub CI | `SmartBooks CI / CI Result` |  |  |
| Pages deploy | `Deploy SmartBooks Pages` |  |  |

## 6. Failure Response

- If syntax, unit, coverage, or functional tests fail, fix the branch before merge.
- If the live Pages smoke test fails after merge, check whether the deploy used the expected commit and rerun the workflow once.
- If a public-site regression is confirmed, open a hotfix branch from `main`, keep the change narrow, and run the full local gate before PR.
- If a UI snapshot fails intentionally, update the baseline in the same PR and explain the contract change.

