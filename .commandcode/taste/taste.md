# architecture

- Adapter implementations should live in their own workspace packages under `packages/` rather than inline in apps. Confidence: 0.65
- Organize adapters by category under `adapters/<category>/` (e.g. `adapters/metadata/`, `adapters/storage/`, `adapters/auth/`) with an `index.ts` barrel export. Confidence: 0.80
