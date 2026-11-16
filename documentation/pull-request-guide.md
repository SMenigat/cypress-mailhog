# Pull Request Guide

This guide provides step-by-step instructions for creating pull requests.

## PR Creation Workflow

### 1. Verify Changes Are Ready

Before creating a PR, ensure:

- The Cypress test suite passes (see [Running the tests](#running-the-tests))
- The TypeScript definitions typecheck (`npx tsc --noEmit -p .` in the repo root
  and in `test-server/`)
- New or changed commands are covered in `test-server/cypress/e2e/MailHog.cy.ts`,
  typed in `types/index.d.ts` and documented in the `README.md`
- Commits follow semantic commit conventions
- Branch is up to date with `main`

#### Running the tests

The suite runs MailHog, a small PHP mail-sending page and Cypress in Docker —
the same setup the GitHub Actions workflow uses:

```bash
cd test-server
composer install
yarn test   # docker compose ... up --exit-code-from cypress
```

### 2. PR Title Format

PR titles should follow this format based on the type of change:

- **Features**: `[Feat] Brief description of the feature`
- **Bug Fixes**: `[Fix] Brief description of the fix`
- **Refactoring/Improvements**: `[Chore] Brief description of changes`
- **CI/DevOps**: `[CI] Brief description of CI/DevOps changes`
- **Documentation**: `[Docs] Brief description of documentation changes`

**Examples:**

- `[Feat] Add mhGetMailsByCc command`
- `[Fix] Retry mhSearchMails until the timeout is reached`
- `[Chore] Support Cypress 16 via Cypress.expose() and cy.env()`
- `[CI] Run the Cypress suite on pull requests`
- `[Docs] Add instructions for creating pull requests`

### 3. PR Description Structure

Every PR description follows this simple pattern. When opening a PR on GitHub it
is pre-filled from
[.github/pull_request_template.md](../.github/pull_request_template.md) — just
fill in the placeholders and delete what doesn't apply.

```markdown
## Description

Short description of what has been done goes here.

- rough change 1
- rough change 2

## Demo

Test run output, screenshot or usage snippet showing the change goes here.
```

When an issue is related to the PR, add a quote block at the very top of the
Description section:

```markdown
## Description

> relates to #123

Short description of what has been done goes here.
```

Rules:

- Keep the description short — 1-2 sentences on what has been done.
- Below it, optionally add a bullet list giving a top-level overview of the
  rough changes, so a reviewer sees the scope at a glance. Keep it to a handful
  of bullets, one line each — no file-by-file breakdowns or implementation
  details.
- Always use `relates to #123` — never "Closes" or "Fixes".
- The Demo section shows the change working. This package has no UI of its own,
  so the usual demo is one of:
  - the results table of the Cypress run (`yarn test` in `test-server/`)
  - a screenshot of the Cypress runner (`yarn cypress:open`) showing the new or
    changed command in the command log
  - a short usage snippet for a new command

  For CI or docs changes, state that briefly instead.

- **Upload screenshots with `gh-upload`.** It takes files and hands back the
  markdown to paste straight into the PR body, so the Demo section can be filled
  in before the PR is opened rather than left as a placeholder:

  ```bash
  gh-upload ~/Desktop/cypress-run.png          # → ![cypress-run](https://github.com/user-attachments/...)
  gh-upload ~/Desktop/*.png --quiet            # links only, one per line
  ```

  It reads the repo from the current directory's git remote (`--repo owner/name`
  overrides) and authenticates from a stored browser session — `gh-upload status`
  says whose, `gh-upload login` refreshes it. Name the files for what they show,
  and keep them out of the repo.

**Example:**

```markdown
## Description

> relates to #61

Replaces `Cypress.env()`, which was removed in Cypress 16, with `Cypress.expose()`
for the MailHog url and `cy.env()` for the credentials.

- MailHog url read from `expose`, falling back to `env` and the `e2e` config
- basic auth credentials read via `cy.env()`
- test server and CI upgraded to Cypress 16.3.0

## Demo

All 22 specs pass against Cypress 16.3.0:

![Cypress run](https://github.com/.../cypress-run.png)
```

### 4. Applying Labels

Based on the release drafter configuration, apply appropriate labels:

**Available Labels:**

- `feature` / `enhancement` - New features or enhancements (🚀 Features section)
- `fix` / `bugfix` / `bug` - Bug fixes (🐛 Bug Fixes section)
- `chore` / `refactor` / `debug` / `docs` / `Testing` - Maintenance work (🧰 Maintenance section)
- `CI` / `devops` - CI/DevOps changes (🏗️ CI/DevOps section)
- `documentation` / `docs` - Documentation updates (📖 Documentation section)
- `dependencies` / `dependabot` - Dependency updates (🔗 Dependencies section)

**Label Selection Guidelines:**

- Use `feature` for new functionality
- Use `fix` for bug corrections
- Use `chore` for refactoring, improvements, or non-functional changes
- Use `CI` for GitHub Actions, workflow, or DevOps tooling changes
- Use `docs` for documentation-only changes
- Use `dependencies` for package/dependency updates

## PR Creation Checklist

Before submitting your PR, verify:

- [ ] PR title follows format: `[Type] Brief description`
- [ ] Description section is short and starts with `> relates to #123` when an issue exists
- [ ] Optional bullet list stays top-level — a quick overview, not a change log
- [ ] Demo section shows the change working (test run, screenshot or snippet)
- [ ] Appropriate labels applied for release notes categorization
- [ ] Cypress test suite passes
- [ ] `README.md` and `types/index.d.ts` updated for new or changed commands

## Integration with Release Notes

[Release Drafter](https://github.com/release-drafter/release-drafter) keeps a
draft release up to date on every push to `main`
([.github/release-drafter.yml](../.github/release-drafter.yml)). The labels you
apply determine where your PR appears in the release notes:

- `feature` / `enhancement` → 🚀 Features
- `fix` / `bugfix` → 🐛 Bug Fixes
- `chore` / `refactor` / `docs` → 🧰 Maintenance
- `CI` / `devops` → 🏗️ CI/DevOps
- `documentation` → 📖 Documentation
- `dependencies` → 🔗 Dependencies

Choose labels carefully to ensure your work is properly categorized in release communications.
