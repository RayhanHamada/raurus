---
description: Sync current project state into the relevant AGENTS.md files
---

Sync the current project state into the appropriate `AGENTS.md` files.

Use this after implementation work when the repository structure, workflows, conventions, verification steps, or package-specific expectations have changed and the agent guidance should catch up.

**Input**: Optionally specify a scope after `/sync-agents` such as a package path, app path, or area of change. If omitted, infer the touched areas from the current conversation and recent repository changes.

**Steps**

1. **Establish scope**

    Determine which parts of the repository changed:
    - Use the user-provided scope if present
    - Otherwise infer likely scope from the conversation
    - Check the current worktree to identify touched files and packages
    - Always include the root `AGENTS.md` in the assessment

    If scope is still ambiguous, ask a short clarification question before editing.

2. **Read current guidance and changed areas**

    Read:
    - Root `AGENTS.md`
    - Each package or app `AGENTS.md` that matches the scope
    - If a scoped package or app has no `AGENTS.md`, inspect that area and create a concise package-level `AGENTS.md` before finishing
    - Representative changed files in those areas

    Focus on facts that belong in agent guidance:
    - New repository or package conventions
    - New setup or verification commands
    - New structural expectations
    - New boundaries between packages
    - Important caveats future agents should know before editing

3. **Decide what should change**

    Update guidance only when the current files are missing information that future agents need.

    Good additions:
    - Durable rules that should apply to future work
    - Short notes about package responsibilities or boundaries
    - Verification steps that are now expected

    Avoid adding:
    - Temporary implementation notes
    - Change-history prose
    - Restatements of obvious code details that are unlikely to help future work

4. **Edit the appropriate `AGENTS.md` files**

    Keep edits minimal and factual.
    - Update root `AGENTS.md` for monorepo-wide workflow or conventions
    - If a scoped package or app has no `AGENTS.md`, add one with durable package-specific guidance based on the current codebase state
    - Update only the package or app `AGENTS.md` files affected by the scoped changes
    - Preserve the existing tone and section structure where possible
    - When creating a new package-level `AGENTS.md`, keep it short and focused on package context, standards, workflow, and important boundaries

5. **Verify the result**

    Re-read the edited files and check that:
    - Guidance matches the current codebase state
    - No temporary or speculative instructions were added
    - The updated files still read as durable instructions for future agents

6. **Report what changed**

    Summarize:
    - Which `AGENTS.md` files were updated
    - What durable guidance was added or adjusted
    - Which areas were reviewed but needed no documentation change

**Output**

Use a concise summary such as:

```md
Updated AGENTS guidance:

- `AGENTS.md`: added monorepo verification guidance for adapter changes
- `packages/react/AGENTS.md`: clarified `EditableAsset` editor-mode expectations
- `packages/core/AGENTS.md`: reviewed, no update needed
```

**Guardrails**

- Base updates on the current repository state, not guesses
- Prefer the smallest correct documentation change
- Keep guidance durable and implementation-oriented
- If no durable guidance changed, say so explicitly instead of forcing edits
- When scope is package-specific, avoid changing unrelated package `AGENTS.md` files
