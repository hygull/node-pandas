---
name: publishing-npm
description: Publish a new version of node-pandas to the npm registry. Validates auth, branch, working tree, and tests; bumps version (patch/minor/major); generates changelog from commits since last tag; creates an annotated git tag; runs npm publish; logs the release to .kiro/published-versions.md. Always shows a dry-run preview and waits for explicit user approval before publishing. Has rollback on failure.
---

# Publishing NPM

Publish a new release of `node-pandas` to the npm registry. The skill is a strict, gated workflow — every release goes through validation, dry-run preview, user approval, then execution.

## Invocation

- `/publishing-npm` — defaults to `patch`, dry-run preview first
- `/publishing-npm patch|minor|major` — specify bump type
- `/publishing-npm patch --dry-run` — preview only, never publish

## Workflow

Execute strictly in order. Never skip the user-approval gate at step 6.

### 1. Pre-flight validation (hard fails)

Run all of the following. **Stop and report if any fails. Do NOT continue.**

| Check | Command | Pass condition |
|---|---|---|
| npm auth | `npm whoami` | Returns a username (exit 0) |
| Branch | `git rev-parse --abbrev-ref HEAD` | Output is `master` or `main` |
| Working tree clean | `git status --porcelain` | Empty output |
| Remote sync | `git fetch && git status -sb` | Shows `## master...origin/master` with no `[ahead`/`[behind` |
| Tests pass | `npm test` | Exit 0 |
| package.json valid | parse JSON | No syntax errors; `name`, `version`, `main`, `license`, `repository` present |
| Version not on registry | `npm view node-pandas@<new-version> version 2>&1` | Returns "404" or empty (i.e. version does NOT yet exist) |

If npm auth fails: tell the user to run `npm login` themselves (it's interactive — don't try to run it from the skill). Stop.
If branch is wrong: tell the user to switch to `master`/`main`. Stop.
If working tree is dirty: tell the user to commit or stash. Stop.
If local is ahead/behind remote: tell the user to push or pull. Stop.
If tests fail: report which suites failed. Stop.

### 2. Determine current and next version

- Read `version` field from `package.json`. Call it `CURRENT`.
- Determine bump type from invocation arg (default `patch`). Call it `BUMP`.
- Compute `NEXT`:
  - `patch`: increment the third number, e.g. `2.3.0` → `2.3.1`
  - `minor`: increment the second number, reset third to 0, e.g. `2.3.5` → `2.4.0`
  - `major`: increment the first number, reset others to 0, e.g. `2.3.5` → `3.0.0`
- Verify `NEXT` does not already exist on the npm registry (already done in step 1).

### 3. Generate changelog scaffold

- Find the last release tag: `git describe --tags --abbrev=0` (or `git tag --sort=-v:refname | head -1`). If no tags exist, use `git log --reverse --format=%H | head -1` for first commit.
- Read commits since that tag: `git log <last-tag>..HEAD --pretty=format:'%h %s'`.
- Group by conventional commit type:
  - `feat:` / `feat(...)` → **Added**
  - `fix:` / `fix(...)` → **Fixed**
  - `refactor:`, `perf:` → **Changed**
  - `BREAKING CHANGE:` anywhere in commit body, or `feat!:`/`fix!:` → **Breaking Changes**
  - Other types (`docs`, `test`, `chore`) → **Other** (or omit if `BUMP` is `patch`)
- Build a CHANGELOG entry:

```markdown
## [NEXT] - YYYY-MM-DD

### Added
- ...

### Fixed
- ...

### Changed
- ...

### Breaking Changes
- ...
```

Strip empty sections. If `BUMP` is `major` and there's no Breaking Changes section, **stop and ask the user** to confirm — major bumps without documented breaking changes is a smell.

### 4. Build dry-run preview

Show the user this exact format:

```
Publishing NPM — DRY-RUN preview
================================

Pre-flight: ✓ all checks pass
  npm whoami:     <username>
  branch:         master
  working tree:   clean
  remote sync:    up-to-date with origin/master
  tests:          N/N passing

Version bump
  Current:        CURRENT
  Bump type:      BUMP
  Next version:   NEXT

Changelog entry to be PREPENDED to CHANGELOG.md
-----------------------------------------------
## [NEXT] - YYYY-MM-DD

### Added
- ...
### Fixed
- ...

(<N commits> since vCURRENT)
-----------------------------------------------

Files to be modified
  - package.json   (version: CURRENT → NEXT)
  - CHANGELOG.md   (new entry prepended)

Git tag
  - vNEXT (annotated, message: "Release vNEXT")

NPM publish
  - Package: node-pandas@NEXT
  - Registry: https://registry.npmjs.org/

Approve? (yes / edit changelog / cancel)
```

Wait for user response.

- **yes** → proceed to step 5.
- **edit changelog** → ask the user for the revised changelog body, redisplay full preview, ask again.
- **cancel** → stop. Make no changes. Report "publish cancelled".

If invocation included `--dry-run`, **do not show the approval prompt** — just print the preview and stop.

### 5. Execute publish

Once user approves, do these in order. **If any step fails, jump immediately to step 7 (Rollback).**

a. Update `package.json`: change `"version": "CURRENT"` to `"version": "NEXT"`.
b. Prepend the changelog entry to `CHANGELOG.md` (immediately after the top heading and intro lines, before the previous top entry).
c. Stage and commit:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "$(cat <<'EOF'
   chore(release): TICKET-ID #time 10m #comment Bump version to NEXT
   EOF
   )"
   ```
   (Get TICKET-ID from the most recent row of `.kiro/time-log.md`. If none, use `RELEASE`.)
d. Create annotated tag:
   ```bash
   git tag -a vNEXT -m "Release vNEXT"
   ```
e. Push commit and tag:
   ```bash
   git push origin master
   git push origin vNEXT
   ```
f. Publish to npm:
   ```bash
   npm publish
   ```
   Capture stdout/stderr. Wait for the command to complete.
g. Verify publication:
   ```bash
   npm view node-pandas@NEXT version
   ```
   Should print `NEXT`. May take 30-60s for the registry to propagate; retry up to 3 times with 10s sleep between attempts.

### 6. Log the release

Append a row to `.kiro/published-versions.md`. Format:

```
| YYYY-MM-DD | NEXT | <short-hash> | vNEXT | published | https://www.npmjs.com/package/node-pandas/v/NEXT |
```

If `.kiro/published-versions.md` doesn't have a table header, skip silently — don't auto-create the file structure.

Report success:

```
✓ Published node-pandas@NEXT
  Commit:   <short-hash>
  Tag:      vNEXT (pushed)
  Registry: https://www.npmjs.com/package/node-pandas/v/NEXT

Follow-ups (manual):
  - Open a GitHub release from tag vNEXT (gh release create vNEXT --notes-file <changelog-snippet>)
  - Verify install: npm install node-pandas@NEXT
```

### 7. Rollback (only if step 5 failed)

The order matters: undo in reverse of what succeeded.

| Step that failed | Rollback actions |
|---|---|
| f or g (publish failed) | Delete remote tag: `git push --delete origin vNEXT`. Delete local tag: `git tag -d vNEXT`. Revert commit: `git reset --hard HEAD~1`. Force-push master with `--force-with-lease` (carefully — only if you pushed in step e). |
| e (push failed) | Delete local tag: `git tag -d vNEXT`. Reset commit: `git reset --hard HEAD~1`. (Nothing was pushed; remote is untouched.) |
| d (tag failed) | Reset commit: `git reset --hard HEAD~1`. |
| c (commit failed) | `git restore --staged package.json CHANGELOG.md && git checkout -- package.json CHANGELOG.md`. |
| a or b (file edit failed) | `git checkout -- package.json CHANGELOG.md`. |

After rollback: report what was undone and why the original step failed. Surface the actual error to the user. Do NOT retry automatically.

## Boundaries

- **Never** publish without showing the dry-run preview and getting explicit user approval.
- **Never** publish from a branch other than `master`/`main`.
- **Never** publish with a dirty working tree.
- **Never** publish with failing tests. Don't suggest `--ignore-scripts` to bypass.
- **Never** run `npm unpublish` from this skill. Unpublishing is destructive and outside scope.
- **Never** run `npm login` from this skill (it's interactive).
- **Never** force-push `master` without rollback context. The only `--force-with-lease` is in step 7 and only if step e succeeded but f/g failed.
- **Never** create a GitHub release from this skill (separate workflow; flagged as manual follow-up).
- **Never** test the published package by installing it in a temp directory (slow, fragile; the `npm view` check in step 5g is sufficient).

## When this skill applies

Use when the user asks to "publish", "release", "ship to npm", "cut a new version", or invokes `/publishing-npm`. If the user wants to publish AND just made code changes that need to be committed first, run `committing-smart` (or `/cap`) first, then `publishing-npm`. The two skills compose; `publishing-npm` itself only handles the version-bump commit.

## History

This skill replaces the older `.kiro/agents/npm-publisher-agent.md` agent definition. Behaviors trimmed from the agent (over-engineered for routine releases): GitHub release creation (now a manual follow-up), in-temp-dir install verification (redundant with `npm view`), npm release-notes string generation (npm shows the README), package-integrity download verification (atomic publish makes this redundant), full setup-instructions section (onboarding docs, not runtime). Behaviors preserved: pre-flight validation, version bump rules, changelog scaffold from conventional commits, annotated git tag, dry-run mode, rollback on failure, version log at `.kiro/published-versions.md`.
