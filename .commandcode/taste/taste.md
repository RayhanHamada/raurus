# architecture

- Adapter implementations should live in their own workspace packages under `packages/` rather than inline in apps. Confidence: 0.65
- Organize adapters by category under `adapters/<category>/` (e.g. `adapters/metadata/`, `adapters/storage/`, `adapters/auth/`) with an `index.ts` barrel export. Confidence: 0.80

# workflow

- Do not manually edit auto-generated client type files (e.g. `openapi.gen.ts`); the user regenerates them themselves. Confidence: 0.65

# typescript

- Avoid phantom brand types (like `__adapterId`) on factory return types when the adapter interface already carries the same information via an `id` field. Remove unused type-level branding unless there's a concrete consumer that narrows on it. Confidence: 0.70
