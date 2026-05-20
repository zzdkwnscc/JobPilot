# Desktop Frontend Type Safety

> Type safety patterns in the desktop frontend.

---

## Overview

The desktop frontend uses **strict TypeScript** with its own type definitions in `desktop/src/types/`. The key difference from the shared web types is that timestamps are `string` (ISO format) rather than `Date` objects, because the Rust backend serializes them as epoch-ms numbers and the mapper converts to ISO strings.

---

## Type Organization

| Location | Purpose |
|----------|---------|
| `desktop/src/types/resume.ts` | Desktop `Resume` type with `string` dates |
| `desktop/src/types/interview.ts` | Interview-specific types |
| `desktop/src/lib/desktop-api.ts` | Tauri command input/output interfaces |
| `src/types/resume.ts` (shared) | Canonical resume type definitions (via `@/`) |
| `src/types/ai.ts` (shared) | AI chat types (via `@/`) |
| `src/types/auth.ts` (shared) | Auth types (via `@/`) |

### The Date/String Divergence

The shared `src/types/resume.ts` defines `createdAt`/`updatedAt` as `Date`. The desktop `desktop/src/types/resume.ts` defines them as `string`. This is intentional:

- Rust backend → epoch-ms number → `desktop-document-mappers.ts` → ISO string
- The desktop `Resume` type uses `string` to match this flow
- Shared template components receive `string` dates and handle both types

When adding new timestamp fields, follow this pattern: the desktop type uses `string`, the shared type uses `Date`, and the mapper converts between them.

---

## Desktop API Types

All Tauri command input/output types are defined in `desktop-api.ts` as exported interfaces. These mirror the Rust struct definitions with `#[serde(rename_all = "camelCase")]`.

```ts
// Defined in desktop-api.ts
export interface SaveDocumentInput {
  id: string;
  title: string;
  template: string;
  language: string;
  themeJson: string;
  sections: SaveDocumentSectionInput[];
  // ...
}
```

Components should import these types from `desktop-api.ts` when constructing payloads.

---

## Validation

The desktop frontend does **not** use Zod or any runtime validation library. Validation happens in two places:

1. **Rust backend** — All Tauri commands validate inputs and return `Result<T, String>` errors.
2. **TypeScript types** — Static type checking ensures correct shapes at compile time.

This is different from the web app, which uses Zod at API route boundaries. The desktop app doesn't need Zod because the Rust backend provides stronger validation guarantees.

---

## Common Patterns

### Type assertions in mappers

`desktop-document-mappers.ts` uses `as unknown as SectionContent` when converting from parsed JSON. This is acceptable because the Rust backend guarantees the JSON shape. Do not introduce additional `as` casts elsewhere.

### Discriminated unions

Interview types use discriminated unions for message kinds:

```ts
// desktop/src/types/interview.ts
export type InterviewTurnKind = "question" | "answer" | "feedback";
```

### The `DesktopRuntimeMode` type

```ts
export type DesktopRuntimeMode = "tauri" | "browser_fallback";
```

Used to detect whether the app is running in Tauri or a browser for development. Check via `isBrowserFallbackRuntime(context)`.

---

## Forbidden Patterns

- **No new `any` types** — Use `unknown` and narrow with type guards.
- **No broad `as` assertions** — The mapper's `as unknown as` is the only acceptable case, because Rust guarantees the shape.
- **Don't import `Date`-typed fields from shared types** — Use the desktop `string` date types. Convert via `new Date(isoString)` when needed for display.
- **Don't duplicate type definitions** — If a type is needed in both web and desktop, define it in `src/types/` and import via `@/`. Only types with fundamentally different shapes (like resume timestamps) should be duplicated.
