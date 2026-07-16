# Repository Instructions

This repository publishes `markdown-link-check-config-nick2bad4u`.

## Public surfaces

- Treat `.markdown-link-check.json`, every file under `presets/`, and the
  typed loader/factory API as public contracts.
- Keep raw JSON usable through markdown-link-check's `--config` option.
- Never add project-specific domains, private headers, or authentication data
  to a shared preset.
- Arrays intentionally replace preset arrays in the factory.

## Verification

Run `npm run release:verify`. The tests must exercise the real CLI against a
local HTTP server so they do not depend on public network availability.
