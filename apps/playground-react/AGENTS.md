# Package Agent Guide

## Package Context

This app is `@raurus/playground-react`, the end-to-end React playground used to validate Raurus V0 ergonomics.

## Package Standards

- Keep the app focused on demonstrating the public Raurus APIs rather than introducing app-only abstractions
- Preserve the V0 scope: editable images, local storage, SQLite metadata, and basic permissions only
- Prefer wiring through the published workspace package names and public APIs instead of importing implementation details into components

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this app
- Use React-focused skills and guidance for provider, UI, and interaction work
- Update this file when the playground introduces app-specific setup, scripts, or verification expectations

## Package Notes

- The playground is the primary integration proof for the V0 editing flow
- Uploaded files are served from `public/uploads/`
- The app may include lightweight dev-only server wiring to exercise the real adapters locally
