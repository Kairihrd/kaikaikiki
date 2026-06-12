# Claude Code Collaboration Rules

Multiple team members may use Claude Code in this repository.
To avoid conflicts, Claude Code must follow these rules strictly.

## Before Starting Work
- Always check the current branch with `git branch`.
- Always check the working tree with `git status`.
- Always pull the latest changes before starting:
  - `git pull`
- Do not start work if there are uncommitted changes from another person.
- If uncommitted changes exist, ask the user what to do before editing.

## Branch Ownership
- Each member should work on their own branch.
- Do not work directly on `main`.
- Use branch names like:
  - `feature/<member-name>-<task>`
  - `fix/<member-name>-<task>`
  - `docs/<member-name>-<task>`
- Do not switch branches if there are uncommitted changes.
- Do not delete or rename another member's branch.

## Editing Scope
- Only edit files related to the requested task.
- Do not refactor unrelated files.
- Do not reformat entire files unless explicitly requested.
- Do not rename directories or move files without confirmation.
- Do not overwrite another member's work.
- If a task requires touching files likely owned by another member, ask first.

## Claude Code Prompting Rules
When the user asks Claude Code to implement something, Claude Code should confirm:
- goal of the task
- files likely to be changed
- files that should not be touched
- expected behavior
- how to test

If the request is ambiguous, ask a clarifying question before editing.

## Conflict Prevention
- Keep commits small.
- Commit after each meaningful unit of work.
- Before pushing, run:
  - `git status`
  - `git pull --rebase`
- If a merge conflict occurs, do not guess.
- Explain the conflict and ask the user before resolving it.
- Never use `git push --force` unless explicitly instructed.

## After Completing Work
Report the following:
- summary of changes
- branch name
- files changed
- commands run
- tests/checks run
- whether push succeeded
- any risks or TODOs

## Prohibited Actions
Claude Code must not:
- commit `.env` or secrets
- force push
- delete teammate work
- make broad refactors during feature work
- install new dependencies without explaining why
- change framework, package manager, or deployment settings without confirmation
- edit files outside the task scope
