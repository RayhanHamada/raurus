<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Example: Next.js

`next-example` lives in `examples/next-example/`. It is a Next.js 16 + React 19 + Tailwind CSS v4 app that integrates `@raurus/react` to demonstrate visual editing in an App Router context.

## Architecture

```
examples/next-example/
├── src/
│   └── app/
│       ├── favicon.ico
│       ├── globals.css         # Tailwind v4 imports + Geist font variables
│       ├── layout.tsx          # Root layout — wraps children in RaurusClientProvider
│       └── page.tsx            # Home page — renders EditableDiv components
├── public/                     # Static assets
├── next.config.ts              # Next.js config with reactCompiler: true
├── package.json
├── postcss.config.mjs          # PostCSS config for @tailwindcss/postcss
└── tsconfig.json
```

## Key Concepts

- **RaurusClientProvider integration** — The root layout wraps children in `<RaurusClientProvider url="http://localhost:3000" defaultEditMode={true}>`, providing edit-mode state to all pages
- **Editable components** — Pages import editable components from `@raurus/react/client` and render them with `id` and `className` props
- **React Compiler** — Next.js config enables `reactCompiler: true` for compile-time optimizations
- **Fonts** — Uses Geist and Geist Mono via `next/font/google` with CSS variables

## Conventions

- All pages use the App Router (no Pages Router)
- Components import from `@raurus/react/client` (client-side exports)
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- `suppressContentEditableWarning` is handled internally by `@raurus/react` — do not suppress it at the app level
- `tsconfig.json` extends `@raurus/tsconfig` with JSX and DOM lib overrides

## Workflow

- `bun run dev` starts the Next.js dev server
- `bun run build` builds for production
- Dependencies on `@raurus/react` and `@raurus/server` use `workspace:*`
