# pairnexus-starter-web

A notes app starter.

## Workflow

Work here follows the pairnexus workflow kit's flow: `.claude/workflow/flow.md` (plan → spec → build tickets → one session per ticket → review panel → merge), with this project's profile in `.claude/workflow/profile.toml` and `.claude/workflow/profile.md`. Read both before acting.

- A session starts with the guided start: the `start` skill asks "What are we working on?" (or type `/start`).
- When the workflow guard's hook times out and blocks a command, say so and offer to split or simplify the command.

## Agent skills

### Issue tracker

Issues and specs are GitHub issues in `medTech-group/pairnexus-starter-web`, used through the GitHub MCP tools or `gh api`. See `docs/agents/issue-tracker.md`.

### Triage labels

The default five: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root, created when needed. See `docs/agents/domain.md`.
