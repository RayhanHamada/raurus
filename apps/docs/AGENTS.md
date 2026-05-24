# Package Agent Guide

## Package Context

This app is `@raurus/docs`, the VitePress documentation site for Raurus.

## Package Standards

- Keep docs focused on the current public Raurus APIs and user-facing workflows rather than internal implementation details
- Preserve the VitePress structure: site config and theme wiring live under `.vitepress/`, while page content lives in top-level Markdown files
- Treat `.vitepress/cache/` as generated output and do not edit it as source content

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this app
- Verify docs app changes with `bun docs:build` when navigation, theme config, or page content changes materially
- Update this file when the docs app introduces app-specific structure, scripts, or verification expectations

## Package Notes

- Navigation, sidebar, and social links are configured in `.vitepress/config.mts`
- Theme extension entrypoints live under `.vitepress/theme/`
- The docs currently include Markdown example pages and API example content that should stay aligned with the workspace packages
