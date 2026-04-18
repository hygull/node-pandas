---
name: committing-smart
description: Create a Jira SMART-formatted git commit (TICKET-ID #time Xm #comment <message>) for the node-pandas project. Auto-detects the ticket ID from the current branch name, falls back to the most recent entry in .kiro/time-log.md, and asks the user only if neither is found. Estimates time from file count and generates a conventional-commit-prefixed message from the staged diff. Always presents the proposed commit for user approval before executing.
---

# Committing Smart

Create a Jira SMART-formatted commit for the `node-pandas` project. The format is:

```
<type>(<scope>): TICKET-ID #time Xm #comment <message>
```

Where `<type>` is a conventional commit type (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`) and `<scope>` is optional (e.g. `series`, `dataframe`).

## Workflow

Execute these steps in order. **Never skip the user-confirmation step at the end.**

### 1. Verify there are staged changes

Run `git diff --cached --name-only` (skip if you have already committed the changes a minute before — in that case feel free to push the changes instead).

If empty:
- Run `git status --short` to see if there are unstaged changes.
- If unstaged changes exist, ask the user whether to stage them (suggest specific files; never `git add -A` or `git add .`).
- If no changes at all, stop and report "nothing to commit".

### 2. Determine the ticket ID

Try these in order; stop at the first match.

**a. From the current branch name.**
- Run `git rev-parse --abbrev-ref HEAD` to get the branch.
- Match the regex `[A-Z]+-\d+` against the branch name (case-sensitive on the letters).
- Examples that match: `DSA-42`, `feat/DSA-100-add-pivot`, `bugfix/TSH-7-fix-merge`, `DSA-3` → take the **first** match.
- Examples that don't match: `master`, `main`, `develop`, `feat/add-pivot` (no ticket).

**b. From the most recent time-log entry.**
- Read `.kiro/time-log.md` (path relative to the repo root).
- Parse rows from the markdown table; the `Ticket` column holds the ID.
- Use the **last** (most recent) row's ticket.
- If the file doesn't exist or has no rows, move to (c).

**c. Ask the user.**
- Present: "No ticket ID found in branch name `<branch>` or `.kiro/time-log.md`. What ticket should I use? (e.g. DSA-42)"
- Wait for response. Validate against `[A-Z]+-\d+`. Re-ask if invalid.

### 3. Estimate time

Count files changed: `git diff --cached --name-only | wc -l`.

| File count | Time estimate |
|---|---|
| 1-2  | `10m` |
| 3-5  | `20m` |
| 6-10 | `30m` |
| 11+  | `45m` |

The user can override in step 6 (the approval prompt accepts a different time).

### 4. Generate the commit message

Run `git diff --cached --stat` and `git diff --cached` (truncate the latter mentally if huge — read enough to understand intent).

Pick a conventional commit **type** from the changes:
- Only doc files (`*.md`, `docs/`, `README*`) → `docs`
- Only test files (`tests/`, `*.test.js`, `*.spec.js`) → `test`
- Only config (`package.json`, `.gitignore`, `jest.config.js`, `.kiro/**` non-spec) → `chore`
- Only `CHANGELOG.md` + version bump in `package.json` → `chore(release)`
- Code in `src/` adding capability → `feat`
- Code in `src/` fixing broken behavior → `fix`
- Code in `src/` restructuring without behavior change → `refactor`
- Code in `src/` improving speed/memory → `perf`
- Mixed → choose the dominant type, or `refactor` if truly mixed

Pick a **scope** (optional but encouraged):
- Files touch primarily `src/series/` → `series`
- Files touch primarily `src/dataframe/` → `dataframe`
- Files touch primarily `src/features/` → name the feature (e.g. `groupBy`)
- Files touch primarily `src/utils/` → `utils`
- README/docs only → no scope, just `docs:`

Write the **message body** (the part after `#comment`):
- One line, ≤ 80 characters.
- Imperative mood ("Add", "Fix", "Update", not "Added", "Adds").
- Describe **what changed** at a useful level — not the file list, not the why (the why goes in the PR description).
- Examples:
  - `Add setIndex and resetIndex methods to DataFrame`
  - `Fix off-by-one in rolling window mean for first element`
  - `Document camelCase aliases for snake_case Series methods`

### 5. Assemble the full commit message

```
<type>(<scope>): TICKET-ID #time Xm #comment <message>
```

Examples:
- `feat(series): DSA-42 #time 20m #comment Add setIndex and resetIndex with drop option`
- `docs: DSA-100 #time 10m #comment Document naming convention and snake_case aliases`
- `chore(release): DSA-50 #time 10m #comment Bump version to 2.3.0 with indexing foundation`

### 6. Present for approval

Show the user the proposed commit in this format:

```
Proposed commit:

  Branch:   <current-branch>
  Ticket:   <TICKET-ID>           (source: branch | time-log | user-provided)
  Time:     <Xm>                  (estimate based on N files; override OK)
  Type:     <type>(<scope>)
  Message:  <message body>

Full commit message:
  <type>(<scope>): TICKET-ID #time Xm #comment <message>

Files (N):
  M src/series/series.js
  A tests/unit/setIndex.test.js
  M README.md

Approve? (yes / edit ticket / edit time / edit message / cancel)
```

Wait for the user's response. Handle each case:
- **yes** → proceed to step 7.
- **edit ticket** → ask for new ticket, validate, redisplay.
- **edit time** → ask for new time (must match `\d+m` or `\d+h(\s\d+m)?`), redisplay.
- **edit message** → ask for new message body, redisplay.
- **cancel** → stop, do nothing.

### 7. Execute the commit

Use a HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): TICKET-ID #time Xm #comment <message>
EOF
)"
```

**Do not** add `Co-Authored-By` lines. The SMART format is the project's convention; no other footers.

If the commit fails because of a pre-commit hook, do **not** retry with `--no-verify`. Investigate the hook output, fix the underlying issue, re-stage, and **create a NEW commit** (never `--amend` to recover from hook failure — the original commit didn't happen).

### 8. Update the time log

Append a row to `.kiro/time-log.md`. Format (preserves the existing table layout):

```
| YYYY-MM-DD | TICKET-ID | Xm | <short-hash> | <message body> |
```

- Date: today, ISO format (use the conversation context's `currentDate` if available, else `date +%Y-%m-%d`).
- Short hash: first 7 chars from `git rev-parse --short HEAD`.

If the file is missing the table header, skip the update silently — don't auto-create a new file structure (that's a separate spec).

### 9. Report success

```
Committed <short-hash> on <branch>
  <full commit message>

Time log updated.
```

Do **not** push. Pushing is a separate, deliberate action; the user can run `git push` themselves or use the project's commit-and-push command (e.g. `/cap`) for the combined flow.

## Boundaries

- **Never** commit without showing the proposal and getting explicit approval.
- **Never** use `git add -A` or `git add .` — only stage files the user explicitly mentioned, or what was already staged.
- **Never** force-push, amend, or rebase from this skill. Those are separate workflows.
- **Never** skip hooks (`--no-verify`). If a hook fails, fix the underlying issue.
- **Never** invent a ticket ID. If branch and time-log both fail to provide one, ask.
- **Never** push to `master` / `main` from this skill (don't push at all).

## When this skill applies

Use when the user asks to "commit", "make a commit", "smart commit", or invokes `/committing-smart`. If the user wants to commit AND push in one step, use the project's combined commit-and-push flow instead. If the user wants a non-SMART commit (e.g. for a fork or a non-Jira project), don't force the SMART format — fall back to a plain conventional commit.

## History

This skill replaces the older `.kiro/agents/git-committer-agent.md` agent definition. The agent's "Phase 1: skip diff if you've already committed a minute ago" hint is preserved in step 1 above. Other agent-specific phases (8-step display format, time-log auto-creation) were dropped in favor of this skill's tighter workflow.
