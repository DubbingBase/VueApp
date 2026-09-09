# Git Hooks

> **Note for agents:** These hooks fire automatically on git operations and will block the operation if they fail.

## `pre-commit` — husky

- **mise**: `mise run format-staged`
- **npx**: `npx --yes codesight --wiki && git add .codesight`

_Source: .husky/pre-commit_
