# Workflow profile: pairnexus-starter-web (prose)

What every session and reviewer reads beside `profile.toml`. Point to the project's own rules; don't copy them here, so nothing drifts.

## The project's rules

The list of rule documents is `project.rules` in `profile.toml` (one source; reviewers and briefings read it). Today that is `CLAUDE.md`; the project has no rules of its own beyond it yet.

## Sensitive data

What counts as sensitive here, and where it must never appear (issues, comments, PR bodies, logs, notifications, screenshots kept in the repo):

- The contents of users' notes. Refer to notes by id only; use made-up text in tests, fixtures and screenshots.
- Personal data: users' emails, names and account details. Refer to users by id only.

The guard checks outward GitHub posts against `[sensitive].patterns` in `profile.toml`. Patterns catch only what they describe; this list is the rule.

## Secrets

- Never print, commit or post a secret. Config files that hold keys are the owner's to add.
- Writing a secret anywhere (a parameter store, a CI secret) is outside a ticket session's reach; for the conductor it needs a charter grant and goes in the ledger.

## Anything else sessions should know

- The repository is a starter with no app code yet: no dependencies, build, tests or start command. As they arrive, fill in `[commands]` (setup, typecheck, the suites), `ci.required_checks` and `ui.start` in `profile.toml`. Until then the `unit` suite is the template's placeholder and matches no file.
