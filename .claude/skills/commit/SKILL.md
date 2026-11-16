---
name: commit
description: Commit staged or unstaged work as one or more Conventional Commits with a title-only message and no AI attribution. Use when asked to commit, check something in, or when invoked explicitly as /commit.
---

# Committing

One line, Conventional Commits, no body, no attribution. That is the whole
format:

```
<type>(<scope>): <subject>
```

## Workflow

1. **See what there is.** `git status -sb` and `git diff` (plus
   `git diff --staged` if anything is already staged). Read the actual changes —
   the message describes what the diff does, not what was asked for.

2. **Stage deliberately.** If the user staged files already, commit exactly
   those. Otherwise stage the files belonging to the change by path. Never
   `git add -A` without looking: scratch files, local config, `vendor/`,
   Cypress screenshots/videos and unrelated formatting churn must not ride
   along.

3. **Split unrelated work.** Two unrelated changes are two commits, even when
   they arrived together — e.g. a new command and a CI change. Don't invent
   splits for a single coherent change that happens to touch several files
   (a new command usually touches `index.js`, `types/index.d.ts`, the
   `README.md` and the e2e spec together — that is one commit).

4. **Write the title** (see rules below) and commit:

   ```bash
   git commit -m "feat(commands): add mhGetMailsByCc"
   ```

5. **Verify and report.** `git log -1 --format='%s'` and `git status -sb`.
   Report the subject line and anything left uncommitted on purpose.

Commit only when asked. **Never push** unless the user asks for that too.
Code changes go through a pull request, so if you are on `main`, branch first
(`feat/…`, `fix/…`, `chore/…`). Version bumps (`chore(version): …`) are the
exception and are committed on `main` at release time.

## Title rules

- **Type**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`.
- **Scope**: the area touched, **lowercase**. Matching the existing history:
  - `commands`, `filters`, `helpers`, `attachments`, `config` — areas of the
    plugin in `index.js` / `types/index.d.ts`
  - `test-server` — the Docker test setup and e2e specs
  - `readme`, `dev` — documentation and repo tooling (PR template, skills,
    release drafter)
  - `deps`, `cypress` — dependency upgrades
  - `version` — package version bumps
- **Subject**: imperative mood, lowercase start, no trailing period. Keep the
  whole line under ~72 characters.
- **No body.** Nothing after the subject line — no bullet lists, no explanation,
  no `Refs:` trailers. If a change genuinely cannot be summarized in one line,
  that is a sign it should be more than one commit.
- **No AI attribution.** No `Co-Authored-By` trailer, no "Generated with Claude
  Code", nothing naming a tool or model.

Matching the existing history:

```
feat(config): utilizes Cypress.expose() and cy.env()
feat(attachments): adds mhGetAttachments() that yields string list of attachments of mail
test(filters): adds test to prove that filters can be chained together
docs(readme): remove instructions for pre cypress 10
chore(version): bump package version
```

## Before committing code

If the change touches `index.js`, `types/` or `test-server/`, typecheck first —
`npx tsc --noEmit -p .` in the repo root and in `test-server/` — and fix what it
flags. For behavior changes, run the Cypress suite too
(`cd test-server && yarn test`, needs Docker). A failing check is worth
mentioning to the user rather than committing over.
