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

- The notes app is plain Node.js 22 with no dependencies (nothing to install, no build, no typecheck): tests run with `node --test` over `tests/*.test.js`, and `node src/server.js` starts it on `PORT` (default 3000). Notes live in memory, so a restart empties them. Until the notes spec's tickets add the files, the `unit` suite and the areas' globs match nothing.
