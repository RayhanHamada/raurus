---
name: sync-agents
description: Synchronize the project current state with all necessary AGENTS.md files. Use when AGENTS.md files need to be brought in sync with codebase reality, after feature changes, or when docs drift is suspected.
---

Synchronize the project current state with all necessary `AGENTS.md` files.

Use `/sync-docs` when human-readable docs such as `docs/*.md` or maintained README files should be updated alongside `AGENTS.md` files.

**Input**: Optionally specify a scope after `/sync-agents` (for example `/sync-agents apps/web-cms` or `/sync-agents openspec`). If omitted, audit the whole repository.

**Steps**

1. **Read the root guide first**

    Read the repository root `AGENTS.md` before planning or editing anything.

2. **Discover all relevant AGENTS files**

    Find every existing `AGENTS.md` in the repository.

    If a scope was provided:
    - Prioritize the nearest `AGENTS.md` files that govern that scope
    - Still update the root `AGENTS.md` if repository-level facts changed

3. **Inspect the current project state**

    For the requested scope, inspect the actual codebase and tooling so the docs match reality.

    Focus on facts such as:
    - Maintained apps and packages
    - Public exports and package purpose
    - Current feature locations
    - Important commands and scripts
    - Tooling directories that are intentionally part of the repository workflow
    - Constraints or caveats that are true today

4. **Identify documentation drift**

    Compare the current state with each relevant `AGENTS.md`.

    Look for:
    - Stale paths or moved features
    - Missing or outdated package/app descriptions
    - Commands that no longer match `package.json`
    - Facts that describe planned architecture instead of current reality
    - Newly maintained packages that need their own `AGENTS.md`

5. **Update all necessary AGENTS files**

    Edit only the `AGENTS.md` files that need synchronization.

    Keep updates:
    - Factual
    - Concise
    - Present-tense
    - Close to the code they describe

    If a maintained package exists without a package-level `AGENTS.md`, add one.

6. **Verify the documentation**

    Re-read every updated `AGENTS.md` and confirm it matches the inspected codebase.

    Ensure:
    - Root guidance and package guidance do not contradict each other
    - Paths and package names are correct
    - The docs describe what exists today, not what might exist later

7. **Summarize the sync**

    Report:
    - Which `AGENTS.md` files were updated
    - What facts were synchronized
    - Whether any areas still need user clarification

**Guardrails**

- Do not invent features or future architecture
- Do not update unrelated runtime code unless needed to verify a documented fact
- Prefer updating existing `AGENTS.md` files over creating extra documentation
- If repository state is ambiguous or mid-migration, ask one short clarification question before documenting assumptions
- Keep package-specific details in the nearest package-level `AGENTS.md` whenever possible
