# Package Agent Guide

## Package Context

This package is `@raurus/react`, a React 19 component library compiled with React Compiler. Components are browser-tested via vitest-browser + Playwright, and a Vite playground provides manual development iteration.

This file extends the root [AGENTS.md](../../AGENTS.md).

## Architecture

```
src/
├── index.ts            # Public barrel — re-exports all components
├── MyButton.tsx        # Initial starter component
└── *.tsx              # Component files (colocate with tests)

playground/
├── index.html          # Vite entry for manual dev testing
└── src/
    ├── index.tsx       # Playground app entry
    ├── App.tsx         # Playground app component
    └── style.css       # Playground styles

tsdown.config.ts        # Build config with React Compiler babel plugin, CSS injection, and Tailwind
vite.config.ts          # Vite config for playground dev server + vitest browser testing
```

## Key Concepts

- **React Compiler** — Components are compiled through the babel plugin (`babel-plugin-react-compiler`) wired in both `tsdown.config.ts` (for production builds) and `vite.config.ts` (for playground and tests). The `reactCompilerPreset()` from `@vitejs/plugin-react` is reused in the tsdown babel plugin chain.
- **Browser testing** — Vitest runs component tests in a headless Chromium browser via `@vitest/browser-playwright` and `vitest-browser-react`. Tests render components in a real DOM and assertions run against the rendered output.
- **Playground** — The Vite dev server (`bun run play`) serves `playground/index.html` for manual component iteration. Playground code is not bundled into the library.
- **Styling** — Tailwind CSS is injected at build time via `@bosh-code/tsdown-plugin-tailwindcss` and `@bosh-code/tsdown-plugin-inject-css`. CSS module declarations are typed via the `css.d.ts` file at the package root.

## Conventions

- Colocate test files next to components with the `*.test.tsx` suffix
- Render components into the DOM using `render()` from `vitest-browser-react` — do not import `@testing-library/react`
- Run tests headlessly by default; see `vite.config.ts` `browser.headless` for the current mode
- Keep playground components in `playground/src/` — they are not part of the library surface
- `tsconfig.json` extends `@tsconfig/strictest` directly, not `@raurus/tsconfig`, because the react package needs DOM lib, JSX, and browser-specific types that differ from the shared base

## Dependencies

- **Runtime**: `@raurus/client` (workspace)
- **Peer**: `react` ^19.2.0, `react-dom` ^19.2.0
- **Build**: tsdown with `@rolldown/plugin-babel`, `@bosh-code/tsdown-plugin-inject-css`, `@bosh-code/tsdown-plugin-tailwindcss`
- **Test**: vitest, `@vitest/browser-playwright`, `vitest-browser-react`, `@vitejs/plugin-react`

## Workflow

- Read the root `AGENTS.md` before planning or implementing changes in this package
- Build with `bun run build` (tsdown with dts, minify, exports mode)
- Run tests with `bun run test` (vitest with browser provider)
- Type-check with `bun run typecheck`
- Run the playground with `bun run play` (Vite dev server)

## Package Notes

- This package was initialized from a React component library starter template — placeholder metadata (author, repository, homepage) in `package.json` should be updated before publishing
- The only public entry point is `src/index.ts` — add new components as named exports there
- CSS for components is processed at build time via Tailwind — no runtime CSS-in-JS
