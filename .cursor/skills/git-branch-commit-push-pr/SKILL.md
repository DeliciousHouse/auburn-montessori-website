---
name: git-branch-commit-push-pr
description: Creates a dedicated git branch for current work, commits with a clear message, pushes to origin, and opens a pull request against the repository default branch (main or master). Use when the user wants changes isolated on a branch, pushed remotely, and submitted as a PR, or when they say ship, open a PR, branch and PR, or similar.
---

# Git: branch, commit, push, open PR

## Preconditions

- User intends to ship **uncommitted** (and optionally unstaged) work, or explicitly wants a **new branch** before committing.
- Remote is `origin` unless the user specifies otherwise.
- Do **not** force-push or rewrite shared history unless the user explicitly asks.

## Workflow

1. **Inspect state**
   - `git status` — note modified/untracked files.
   - If nothing to commit, stop and tell the user.

2. **Choose base branch**
   - Prefer the remote default branch:
     - `git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'`
     - If that fails: `git branch -a` and prefer `origin/main`, else `origin/master`, else ask.
   - Ensure local base is up to date when appropriate: `git fetch origin` then `git checkout <base>` and `git pull` only if the user wants a clean sync (do not blindly merge without context).

3. **Create and switch to a feature branch**
   - Naming: `feat/<short-topic>`, `fix/<short-topic>`, or `chore/<short-topic>` — lowercase, hyphens, no spaces.
   - `git checkout -b <branch-name>` from the chosen base (or from current HEAD if the user said “from here”).

4. **Stage and commit**
   - Stage only what belongs to this task: `git add` with explicit paths, or `git add -p` for partial hunks when mixing concerns.
   - Message: imperative, scoped when helpful, body with *what* and *why* if non-obvious.
   - Example: `feat(contact): single Friday tour window`

5. **Push and set upstream**
   - First push: `git push -u origin HEAD`
   - Subsequent pushes on same branch: `git push`

6. **Open pull request**
   - If `gh` is available and authenticated:  
     `gh pr create --base <default-branch> --head <branch-name> --title "..." --body "..."`
   - **Base branch** must be the repo default (`main` or `master`), not a guess from local only — confirm with `origin/HEAD` or GitHub default.
   - If `gh` is missing: give the user the “Compare & pull request” URL from `git remote get-url origin` and branch name, or document installing `gh` / using the GitHub UI.

7. **Report back**
   - Branch name, commit hash (short), PR URL, and any follow-ups (CI, review).

## Edge cases

- **Dirty working tree with unrelated changes**: stash or split into another branch; do not commit unrelated files.
- **Already on a feature branch**: ask whether to commit on it or create a new branch from current HEAD.
- **PR already exists for branch**: `gh pr view` or push updates to the same branch instead of opening a duplicate PR.

## Verification

- `git status` clean after commit (except intentional untracked, e.g. local-only dirs).
- Remote branch exists: `git ls-remote --heads origin <branch-name>`
