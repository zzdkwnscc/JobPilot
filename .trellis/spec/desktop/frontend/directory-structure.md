# Desktop Frontend Directory Structure

> How the desktop frontend code is organized.

---

## Overview

The desktop frontend lives under `desktop/src/` and is built with **Vite + React + TanStack Router**. It is NOT a Next.js app — routing is code-defined, not filesystem-based. The Vite alias `@` resolves to `../src/` (the shared web frontend), so desktop code can import shared UI components and utilities with the same `@/` prefix used by the web app.

---

## Directory Layout

```
desktop/src/
├── main.tsx                       # Entry point: renders RouterProvider, imports i18n + globals.css
├── router.tsx                     # TanStack Router route tree definition
├── i18n.ts                        # react-i18next initialization (loads shared messages/)
├── styles.css                     # Desktop-only Tailwind overrides
├── types/
│   ├── resume.ts                  # Resume types (duplicated from shared with string dates)
│   └── interview.ts               # Interview-specific types
├── routes/
│   ├── root.tsx                   # Root layout: header, nav, settings dialog, update badge
│   ├── home.tsx                   # Home/landing page
│   ├── dashboard.tsx              # Document library (main list view)
│   ├── editor.tsx                 # Resume editor (full-screen, no header)
│   ├── templates.tsx              # Template gallery
│   ├── settings.tsx               # Settings page
│   ├── interview.tsx              # Interview lobby
│   ├── interview-new.tsx          # New interview setup
│   ├── interview-session.tsx      # Active interview session
│   └── interview-report.tsx       # Interview report view
├── components/
│   ├── editor/                    # Editor components (sections, fields, DnD, theme, export)
│   ├── dashboard/                 # Library view components (create, upload, import dialogs)
│   ├── ai/                        # AI chat panel and specialist dialogs (desktop versions)
│   ├── interview/                 # Interview room, setup form, session card, report
│   ├── app-update/                # Tauri updater dialog and badge
│   └── about-dialog.tsx           # About dialog with version info
├── stores/
│   ├── resume-store.ts            # Core resume editing state + autosave
│   ├── editor-store.ts            # Editor UI state (selection, undo/redo, panels)
│   ├── ui-store.ts                # Global UI state (sidebar, modals, theme)
│   └── app-update-store.ts        # Tauri updater integration
└── lib/
    ├── desktop-api.ts             # Typed wrappers for all Tauri invoke() calls
    ├── desktop-document-mappers.ts # Converts Rust document types to shared Resume types
    ├── desktop-read-models.ts     # Derived view models for route surfaces
    └── desktop-loaders.ts         # Route data loaders (Promise.all parallel fetches)
```

---

## Module Organization

### Routes
Each route file defines its route object via `createRoute()` and exports it. Routes are imported and assembled into the route tree in `router.tsx`. Route loaders fetch data in parallel via helpers in `desktop-loaders.ts`.

Reference: `desktop/src/router.tsx`, `desktop/src/routes/root.tsx`

### Components
Desktop components mirror the shared component structure but are desktop-specific implementations. They use `@/components/ui/*` (shared shadcn components) for the UI primitives, then compose desktop-specific behavior around them.

Components that are desktop-only (e.g., Tauri updater, import dialogs) live entirely in `desktop/src/components/`. Components that share visual design with the web version but differ in data layer (e.g., AI chat, editor) are reimplemented here using `desktop-api.ts` instead of Next.js API routes.

### Lib
`desktop-api.ts` is the single gateway to the Rust backend. Every Tauri `invoke()` call goes through this file. Components and stores should never call `invoke()` directly — always go through the typed wrappers.

`desktop-document-mappers.ts` converts the Rust serialization format (epoch-ms timestamps, JSON strings for theme/content) into the shared `Resume` type used by preview components.

---

## Naming Conventions

| Pattern | Convention | Examples |
|---------|-----------|----------|
| Route files | kebab-case | `interview-new.tsx`, `interview-session.tsx` |
| Component files | kebab-case | `section-editor.tsx`, `ai-chat-panel.tsx` |
| Component names | PascalCase | `SectionEditor`, `AiChatPanel` |
| Store files | kebab-case with `-store` suffix | `resume-store.ts`, `editor-store.ts` |
| Hook files | `use-` prefix, kebab-case | (hooks are in shared `src/hooks/`) |
| Lib files | kebab-case | `desktop-api.ts`, `desktop-read-models.ts` |
| Type files | kebab-case | `resume.ts`, `interview.ts` |

---

## The `@/` Alias

The Vite alias `@` resolves to `../src/` (the shared web `src/` directory). This is configured in `desktop/vite.config.ts` and `desktop/tsconfig.app.json`. Desktop code imports shared code like:

```ts
import { Button } from "@/components/ui/button";
import type { Resume } from "@/types/resume";
import { cn } from "@/lib/utils";
```

Desktop-specific imports use relative paths:

```ts
import { saveDocument } from "../lib/desktop-api";
import { useResumeStore } from "../stores/resume-store";
```

---

## What Is Shared vs Desktop-Only

**Shared via `@/`** (do not duplicate):
- `src/components/ui/*` — All shadcn UI primitives
- `src/lib/utils.ts` — `cn()` utility
- `src/lib/constants.ts` — Section types, template lists
- `src/lib/template-renderer/*` — Unified template system
- `src/lib/template-labels.ts` — Template i18n label map
- `src/lib/section-content.ts` — Content normalization

**Desktop-only** (in `desktop/src/`):
- All routes, stores, and most components
- `lib/desktop-api.ts` — Tauri invoke layer
- `types/resume.ts` — Duplicated with `string` dates (not `Date`)

**Known duplication**: `desktop/src/types/resume.ts` duplicates `src/types/resume.ts` with the difference that `createdAt`/`updatedAt` are `string` (ISO) in the desktop copy vs `Date` in the shared copy. This exists because the Rust backend serializes timestamps as epoch-ms numbers, and the mapper converts them to ISO strings.
