# Ultracite Code Standards

## Project Context

Raurus is a monorepo for a simple inline editing library for web apps.

## Monorepo Rules

- Every package in this monorepo must be named with the `@raurus/<package>` prefix
- Every package in this monorepo should be scaffolded with `tsdown`
- Every package must remain tree-shakeable: prefer explicit exports, avoid unnecessary module side effects, and keep package build configuration aligned with tree-shaking

## Agent Workflow

- For every planning task, read `AGENTS.md` first before proposing or executing work
- For every implementation task, read `AGENTS.md` first before making changes
- Maintain an `AGENTS.md` file inside each monorepo package or app with area-specific instructions and documentation relevant to work in that area
- When a task relates to a specific package or app, read that area's `AGENTS.md` after the root `AGENTS.md` and follow both sets of instructions
- Before planning or implementing, load and use any relevant skills available to the current agent, especially from the agent-specific skills folder when applicable
- Choose skills based on the task domain. For example, use React-related skills when working on React code or seeking React references
- Use available tools and MCP integrations when they are relevant and necessary to complete the task effectively
- After each implementation task, update `AGENTS.md` accordingly to reflect any new or changed repository conventions, workflows, or expectations introduced by the work
- If an implementation task modifies a specific package or app, update that area's `AGENTS.md` by the end of the task when area-specific instructions or documentation should change
- Use the `/sync-agents` opencode command when you need to reconcile current repository, package, or app state with durable `AGENTS.md` guidance

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

- Always apply clean code principles, modularity, reusability, and scope-aware code placement
- Be as type-safe as reasonably possible throughout the implementation

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- For UI work such as React components, apply atomic design principles where they fit the existing project structure
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- If the project uses shadcn components, never edit shadcn-generated components directly
- When shadcn customization is needed, derive from the existing component first; if that is insufficient, create a specific custom component instead
- Use semantic HTML and ARIA attributes for accessibility:
    - Provide meaningful alt text for images
    - Use proper heading hierarchy
    - Add labels for form inputs
    - Include keyboard event handlers alongside mouse events
    - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun x ultracite fix` before committing to ensure compliance.
