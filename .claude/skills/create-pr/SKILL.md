---
name: create-pr
description: Open a GitHub pull request for the current branch following the cypress-mailhog PR conventions (title format, description sections, labels). Use when asked to create/open a PR, raise a PR, or when invoked explicitly as /create-pr.
---

# Creating a cypress-mailhog pull request

The canonical guide is
[documentation/pull-request-guide.md](../../../documentation/pull-request-guide.md)
— **read it and follow it**. It is the source of truth; keep this skill in sync
with it.

Goal: from a pushed branch, open the PR in one go with a correct title,
description, and labels. Drive the whole thing with `gh` — don't just hand the
user text to paste.

## Workflow

1. **Verify the branch is ready.**
   - `git status -sb` — branch must be pushed and in sync with its remote
     (`git push -u origin HEAD` first if not).
   - The base branch is `master`.
   - Sanity-check tests were run for the change (don't claim "all tests pass"
     unless they were actually run this session). The suite runs in Docker:
     `cd test-server && yarn test`.

2. **Gather the diff** against the base:
   `git log --oneline origin/master..HEAD` and
   `git diff --stat origin/master...HEAD`, then read the full diff
   (`git diff origin/master...HEAD`). Describe what shipped, not what was
   requested.

3. **Quickly review the diff before opening the PR.** A fast sanity pass, not a
   full audit — you are looking for things that shouldn't reach a reviewer:
   - leftover debug output, commented-out code, `TODO`/`FIXME` added in passing
   - committed secrets, credentials, or local config
   - stray files that don't belong to the change (`node_modules`, `vendor`,
     Cypress screenshots/videos, scratch files, unrelated formatting churn)
   - obvious breakage: unfinished edits, wrong imports, tests that were
     disabled or deleted rather than fixed
   - a new or changed command that is missing from `types/index.d.ts` or the
     `README.md`

   If something looks off, **tell the user and ask before creating the PR** —
   don't silently fix it and don't open the PR anyway. If the change is large or
   the user wants depth, suggest `/code-review` instead of doing it here.

4. **Title** — `[Type] Brief description` (under 80 chars). Type is one of
   `[Feat]`, `[Fix]`, `[Chore]`, `[CI]`, `[Docs]` (see guide §2). This is the
   PR-title convention and is **separate** from the Conventional Commits format
   used for commit messages.

5. **Description** — exactly two sections (guide §3), nothing more. The same
   shape lives in `.github/pull_request_template.md` for manually opened PRs;
   when passing `--body` to `gh`, write the filled-in version (no HTML comment
   placeholders):
   - `## Description`: 1–2 sentences on what has been done, optionally followed
     by a short bullet list giving a top-level overview of the rough changes
     (a handful of one-line bullets — not a file-by-file change log). When a
     related issue exists, put `> relates to #123` as a quote block at the very
     top of the section — never `Closes`/`Fixes`.
   - `## Demo`: show the change working. This package has no UI, so use the
     results of the Cypress run from this session (pass/fail counts and the
     Cypress version it ran against), a usage snippet for a new command, or a
     screenshot of the Cypress runner uploaded with `gh-upload`
     (`gh-upload <file>` returns the markdown to paste into `--body`). For CI or
     docs changes, state that briefly instead.

6. **Create the PR** with `gh`:

   ```bash
   gh pr create --base master --title "[Type] ..." --body "$(cat <<'EOF'
   ## Description

   > relates to #123

   ...

   - rough change 1
   - rough change 2

   ## Demo

   ...
   EOF
   )"
   ```

7. **Apply labels** for release-notes categorization (guide §4): `feature` /
   `fix` / `chore` / `refactor` / `CI` / `documentation` / `dependencies`. Match
   the label to the PR type: `gh pr edit <url> --add-label feature`. If a label
   doesn't exist in the repo, skip it rather than failing.

8. **Report** the PR URL back to the user, and flag anything still needed from
   them (a missing issue reference, or screenshots if `gh-upload` could not be
   used) plus anything the review in step 3 turned up.

## Conventions

- **No AI attribution** in the PR title or body — no "Generated with Claude
  Code", no Co-Authored-By trailer.
- Follow the checklist in the guide (§ "PR Creation Checklist") before
  finishing.
