# Branch Hygiene Audit

Date: 2026-06-23

## Current Finding

GitHub `origin/main` contains the current SmartBooks work, including:

- Dashboard operations console
- Updated handoff notes
- Reference working checklist
- UI audit pass 2 notes

The remote Codex branches checked during this audit had `0` commits ahead of `origin/main`. They are stale or behind `main`; they do not contain unique unmerged work that needs to be rescued.

## Local Main Note

The local `main` branch had two redundant merge commits ahead of `origin/main` during the audit. Those commits did not contain file-content differences from GitHub `main`.

Do not push those local-only merge commits. Start new work from `origin/main` instead:

```powershell
git fetch origin
git switch -c codex/<new-work-name> origin/main
```

## How To Check For Missing Work

Use these commands before asking whether Codex work is still unmerged:

```powershell
git fetch origin
git status -sb
git log --oneline origin/main..HEAD
git diff --name-status origin/main..HEAD
```

Interpretation:

- No output from `git log --oneline origin/main..HEAD` means the current branch has no commits missing from GitHub `main`.
- No output from `git diff --name-status origin/main..HEAD` means the current branch has no file-content differences from GitHub `main`.
- Remote branches with `0` commits ahead of `origin/main` can usually be treated as already merged or stale.

## Recommended Branch Policy

- Keep `main` protected and use pull requests for user-visible or production-path changes.
- Enable GitHub auto-merge after required checks pass.
- Delete or archive stale `origin/codex/*` branches only after the owner confirms they are no longer needed.
- Avoid pushing local merge-only commits when GitHub `main` already has the same content.
