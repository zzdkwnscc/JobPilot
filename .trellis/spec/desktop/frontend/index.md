# Desktop Frontend Development Guidelines

> Best practices for the desktop frontend (Tauri + React + Vite).

---

## Overview

This directory contains guidelines for the **desktop frontend** at `desktop/src/`. The desktop app is built with Vite, React 19, TanStack Router, Zustand 5, and Tailwind CSS 4. It communicates with a Rust/Tauri backend via `invoke()` commands.

For the shared web frontend (Next.js), see `../frontend/`. For the Rust backend contract, see `../guides/desktop-runtime-boundary.md`.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Module organization, file layout, `@/` alias | Customized |
| [Component Guidelines](./component-guidelines.md) | Component patterns, shared vs desktop components, styling | Customized |
| [Hook Guidelines](./hook-guidelines.md) | Data fetching via desktop-api, no custom hooks | Customized |
| [State Management](./state-management.md) | Zustand stores, autosave, undo/redo | Customized |
| [Quality Guidelines](./quality-guidelines.md) | Lint, build, forbidden patterns, review checklist | Customized |
| [Type Safety](./type-safety.md) | Type organization, date/string divergence, API types | Customized |

---

## How to Use These Guidelines

1. Read this index before starting desktop frontend work.
2. Open the specific guide that matches the change you are about to make.
3. If working with the Rust backend, also read the `desktop-runtime-boundary.md` guide.
4. If modifying shared UI components, read the shared `frontend/component-guidelines.md`.
5. Follow the documented examples before introducing a new pattern.

---

**Language**: All documentation should be written in **English**.
