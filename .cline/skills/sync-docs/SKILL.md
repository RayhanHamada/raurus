---
name: sync-docs
description: Synchronize the project current state with both AGENTS.md files and human-readable documentation. Use when docs/, README files, and AGENTS.md files all need to stay aligned after feature changes or drift detection.
---

Synchronize the project current state with both `AGENTS.md` files and human-readable documentation.

Use `/sync-agents` when only `AGENTS.md` files need attention. Use `/sync-docs` when the repository's broader documentation set should stay aligned as one workflow.

**Input**: Optionally specify a scope after `/sync-docs` (for example `/sync-docs apps/web-cms` or `/sync-docs openspec`). If omitted, audit the whole repository.

**Steps**

1. **Read the root guide first**

    Read the repository root `AGENTS.md` before planning or editing anything.

2. **Discover the relevant documentation surface**

    Find the documentation files that govern the requested scope:
    - All existing `AGENTS.md` files
    - Human-readable docs under `docs/`
    - Maintained README files that act as user-facing entry points for a workspace area

    If a scope was provided:
    - Prioritize the nearest `AGENTS.md` files and docs that govern that scope
    - Still update root-level docs if repository-wide facts changed

3. **Inspect the current project state**

    For the requested scope, inspect the actual codebase and tooling so documentation matches reality.

    Focus on facts such as:
    - Maintained apps and packages
    - Public exports and package purpose
    - Current feature and route locations
    - Important commands and scripts
    - Tooling directories that are intentionally part of the repository workflow
    - Current constraints or caveats that a human or agent should know

4. **Identify documentation drift**

    Compare the current project state with both agent-facing and human-readable docs.

    Look for:
    - Stale paths or moved features
    - Missing or outdated package/app descriptions
    - Commands that no longer match `package.json`
    - Human-readable docs that still contain generated starter boilerplate
    - Contradictions between `AGENTS.md` files and human-readable docs
    - Facts that describe planned architecture instead of what exists today

5. **Update all necessary docs**

    Edit only the files that need synchronization.

    Keep the two documentation surfaces distinct:
    - `AGENTS.md` files: concise, operational, close to the code they describe
    - Human-readable docs: explanatory, navigable, and readable by people new to the repo

    When the root docs surface is missing or incomplete, create or maintain a curated set under `docs/`, including:
    - `docs/README.md`
    - a quick-start or onboarding guide
    - a current repository or feature overview
    - an `AGENTS.md` writing and maintenance guide

    If a maintained package exists without a package-level `AGENTS.md`, add one.

6. **Verify the documentation**

    Re-read every updated file and confirm it matches the inspected codebase.

    Ensure:
    - Shared facts are consistent across `AGENTS.md`, `docs/`, and any maintained README files
    - Paths, package names, route names, and commands are correct
    - The docs describe what exists today, not what might exist later

7. **Summarize the sync**

    Report:
    - Which `AGENTS.md` files were updated
    - Which human-readable docs were updated or created
    - What facts were synchronized
    - Whether any areas still need clarification

**Guardrails**

- Do not invent features or future architecture
- Do not update unrelated runtime code unless needed to verify a documented fact
- Prefer the narrowest useful documentation edits for the requested scope
- Keep package-specific or app-specific details in the nearest relevant doc instead of overloading the root docs
- If repository state is ambiguous or mid-migration, ask one short clarification question before documenting assumptions
