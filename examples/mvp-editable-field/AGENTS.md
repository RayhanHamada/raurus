# vite-react

Minimal Vite + React 19 + Tailwind CSS v4 example used to validate and demonstrate framework features in isolation.

## Components

| Component            | Purpose                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `App`                | Root component — composes feature demos                                                                                                          |
| `SelectableEditable` | Two-click contentEditable: first click selects the element (visual highlight), second click enables editing with caret. Click outside deselects. |

## Conventions

- All components are co-located in `src/` as standalone `.tsx` files (no subdirectories)
- Components use Tailwind utility classes for styling — no CSS modules or external stylesheets
- Each feature-demo component is self-contained with its own state and effects; no shared state or context across components
- Build: `tsc -b && vite build`
