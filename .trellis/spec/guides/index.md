# Guides & Contracts

> Cross-layer contracts, operational checklists, and thinking guides.

---

## Overview

This directory contains three kinds of documents:

- **Contracts** — executable cross-layer specifications with concrete payloads, error matrices, and validation rules.
- **Checklists** — operational verification steps for releases and smoke testing.
- **Thinking Guides** — meta-guides for catching issues before they become bugs.

---

## Directory

| Document | Type | Purpose | When to Use |
|----------|------|---------|-------------|
| [Desktop Runtime Boundary](./desktop-runtime-boundary.md) | Contract | Cross-layer contract for Tauri/Rust desktop shell | Any work touching desktop ↔ Rust boundary |
| [AI Web Tools Contract](./ai-web-tools-contract.md) | Contract | MCP sidecar web tools contract for AI chat | Modifying AI tool execution or MCP integration |
| [Windows Release Smoke Checklist](./windows-release-smoke-checklist.md) | Checklist | Windows desktop release verification | Before any Windows release |
| [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md) | Thinking Guide | Think through data flow across layers | Features spanning multiple layers |
| [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md) | Thinking Guide | Identify patterns and reduce duplication | When you notice repeated patterns |

---

## Thinking Triggers

### When to Think About Cross-Layer Issues

- [ ] Feature touches 3+ layers (API, Service, Component, Database)
- [ ] Data format changes between layers
- [ ] Multiple consumers need the same data
- [ ] You're not sure where to put some logic

→ Read [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md)

### When to Think About Code Reuse

- [ ] You're writing similar code to something that exists
- [ ] You see the same pattern repeated 3+ times
- [ ] You're adding a new field to multiple places
- [ ] **You're modifying any constant or config**
- [ ] **You're creating a new utility/helper function** ← Search first!

→ Read [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md)

---

## Pre-Modification Rule (CRITICAL)

> **Before changing ANY value, ALWAYS search first!**

```bash
grep -r "value_to_change" .
```

This single habit prevents most "forgot to update X" bugs.

---

**Language**: All documentation should be written in **English**.
