# brainstorm: add webdav data sync

## Goal

Add WebDAV-based data sync for the JobPilot desktop app so users can back up and synchronize their local resume data across devices through their own WebDAV-compatible storage.

## What I already know

* User wants to add WebDAV data sync.
* Project is a Tauri 2 + React + Rust desktop app.
* Desktop data is stored independently from the web app, with Rust + rusqlite handling local persistence.
* API keys and sensitive settings already use OS keyring with a plaintext fallback when keyring is unavailable.
* Local core desktop data lives in `workspace/rolerover.db`.
* Workspace settings live in `workspace/settings/workspace-settings.json`.
* Secret values use the existing secret vault flow in `desktop/src-tauri/src/settings.rs`; plaintext secrets must not be returned to the renderer.
* Desktop frontend API calls must go through `desktop/src/lib/desktop-api.ts`.
* Native write commands must fail explicitly and must not silently fall back in browser-only mode.

## Assumptions (temporary)

* Sync is intended for desktop app data, not the web app.
* WebDAV credentials should be stored securely using the existing settings/keyring pattern.
* The first usable version should prioritize reliable explicit backup/restore over complex real-time multi-device merge.
* WebDAV credentials should use a secret key such as `sync.webdav.password`.

## Open Questions

* None.

## Requirements (evolving)

* Provide a way to configure WebDAV endpoint and credentials.
* Store WebDAV credentials securely.
* Sync local desktop data through a WebDAV-compatible remote target.
* Provide a connection test before attempting sync.
* Surface sync status and errors in the desktop settings UI.
* MVP sync behavior is manual snapshot backup/restore:
  * User explicitly uploads a local snapshot to WebDAV.
  * User explicitly restores from a remote snapshot.
  * Restore requires clear overwrite confirmation and should create a local pre-restore backup.
* Snapshot scope should cover the complete workspace:
  * SQLite business data, including resumes, AI chat/analysis records, interview records, migration audit, and workspace metadata.
  * Workspace settings files.
  * Secret-backed settings, including AI API keys, if the user confirms the protection model.
* API keys and other secret values must be included in the WebDAV snapshot through password-based encryption.
* User must provide a sync backup password to create or restore snapshots that contain secrets.
* Password-protected snapshot encryption uses RustCrypto:
  * `argon2` for backup-password key derivation.
  * `chacha20poly1305` / `XChaCha20Poly1305` for authenticated encryption.
  * `rand_core` for salt/nonce generation.
  * `base64` for JSON-safe binary encoding.

## Acceptance Criteria

* [x] User can configure WebDAV connection details.
* [x] User can verify/test the WebDAV connection before syncing.
* [x] User can upload a complete workspace snapshot to a WebDAV remote path.
* [x] User can restore from a complete workspace snapshot after explicit confirmation.
* [x] Restore creates a local pre-restore backup before replacing local data.
* [x] Snapshot includes settings and API-key-backed secret values only through the selected secret protection model.
* [x] API keys are encrypted in the snapshot and are not uploaded as plaintext.
* [x] Restore requires the correct backup password before importing encrypted secrets.
* [x] Snapshot crypto metadata records KDF/encryption algorithm, KDF parameters, salt, nonce, and ciphertext.
* [x] Sync errors are surfaced clearly in the desktop UI.

## Definition of Done (team quality bar)

* Tests added/updated where appropriate.
* Lint / typecheck / CI checks are green or failures are documented.
* Docs/notes updated if behavior changes.
* Rollout/rollback considered if risky.

## Out of Scope (explicit)

* Background automatic sync is out of scope unless explicitly selected.
* Per-document conflict merge is out of scope for the recommended MVP.
* Manual two-way sync is out of scope for the MVP.
* Automatic background sync is out of scope for the MVP.
* Uploading plaintext API keys to WebDAV without an explicit protection decision is out of scope.

## Decision (ADR-lite)

**Context**: WebDAV data sync can range from simple remote backup to automatic multi-device sync. The local data store is SQLite with WAL mode, and automatic or two-way sync would need conflict handling to avoid data loss.

**Decision**: MVP will implement manual snapshot backup/restore. User selected complete workspace snapshot scope and wants settings files plus API keys included. User selected password-based encryption for API keys and other secrets inside the WebDAV snapshot.

**Consequences**: This gives users a reliable WebDAV backup path with lower data-loss risk. It does not provide continuous sync or conflict merge in the first release, but the snapshot contract and WebDAV commands should leave room for future two-way sync. Because secrets are included, the implementation must encrypt secret payloads before upload and require the backup password during restore.

## Research References

* [`research/webdav-rust-sync.md`](research/webdav-rust-sync.md) — Rust WebDAV client options, WebDAV method constraints, and recommended MVP shape.
* https://docs.rs/argon2 — RustCrypto Argon2 supports Argon2id and key-derivation usage.
* https://docs.rs/chacha20poly1305 — RustCrypto XChaCha20Poly1305 supports AEAD encryption with random nonces.
* https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html — OWASP recommends Argon2id for password hashing/KDF scenarios.

## Research Notes

### Feasible approaches

**Approach A: Manual Snapshot Backup/Restore** (Recommended)

* Export a versioned JSON snapshot of app data, upload/download it via WebDAV, and require explicit user action to restore.
* Pros: avoids SQLite WAL file-copy hazards, avoids merge complexity, reduces accidental data loss risk.
* Cons: not true continuous multi-device sync.

**Approach B: Manual Two-Way Sync With Last-Write-Wins**

* Maintain remote metadata, compare local/remote hashes and timestamps, then push or pull the newer side on user-triggered sync.
* Pros: closer to "sync" expectations.
* Cons: can still lose edits when two devices changed different data; requires conflict warnings.

**Approach C: Automatic Background Sync**

* Sync on startup, after autosave, and periodically in the background.
* Pros: most convenient once mature.
* Cons: highest implementation and data-loss risk; needs queueing, retries, conflict handling, and more UX states.

### Secret encryption options

**Option 1: Argon2id + XChaCha20Poly1305** (Recommended)

* Add RustCrypto crates for memory-hard password key derivation and authenticated encryption.
* Snapshot stores algorithm, KDF parameters, salt, nonce, and ciphertext metadata.
* Pros: modern, explicit, cross-device restore works with the backup password.
* Cons: requires adding new Rust crypto dependencies.

**Option 2: OS keyring-bound protection**

* Avoid new crypto dependencies and rely on native keyring-bound data.
* Pros: fewer dependencies.
* Cons: cross-device restore of API keys is weak or impossible, which conflicts with the selected WebDAV backup goal.

**Option 3: Plaintext secret export**

* Do not encrypt secret payloads.
* Pros: simplest.
* Cons: unacceptable cloud-storage risk; rejected for this task.

## Technical Approach

Implement a desktop-native WebDAV snapshot backup/restore surface:

* Rust module exposes native commands for reading WebDAV status, testing connection, uploading a snapshot, downloading the latest remote snapshot, and restoring it.
* WebDAV connection settings are persisted in workspace settings; WebDAV password/app-password is stored through the existing secret vault.
* Snapshot creation exports SQLite business tables, workspace settings files, and secret descriptors/values into a versioned JSON snapshot.
* Secret values are encrypted with a key derived from the user-provided backup password before upload.
* Restore downloads and validates the snapshot, decrypts secrets with the backup password, creates a local pre-restore backup, then applies data and writes restored secrets through the existing secret vault.
* Frontend adds a settings-page sync section with configure/test/upload/restore controls and explicit browser-fallback disabled states.

## Implementation Notes

* Added `desktop/src-tauri/src/sync.rs` for WebDAV HTTP operations, SQLite snapshot export, Argon2id key derivation, XChaCha20Poly1305 encryption, and restore safety.
* Added WebDAV sync settings to `WorkspaceSettingsDocument` under `sync.webdav`.
* Added Tauri commands:
  * `get_webdav_sync_status`
  * `update_webdav_sync_settings`
  * `test_webdav_connection`
  * `upload_webdav_snapshot`
  * `restore_webdav_snapshot`
* Added desktop API wrappers, settings loader data, and a Settings -> Sync tab.
* Remote backup currently writes `latest.json` plus `snapshots/<snapshot-name>.json`; restore uses `latest.json`.

## Verification

* [x] `cargo check --manifest-path desktop/src-tauri/Cargo.toml --target-dir .codex-cargo-target/desktop-tauri` passed.
* [x] `pnpm build:desktop-shell` passed.
* [x] `pnpm lint` desktop blocking surfaces passed with warnings only; pure web-reference observation surface still reports pre-existing lint debt.

## Implementation Plan

* PR1: Rust sync module, snapshot schema, crypto helpers, WebDAV HTTP helpers, command registration.
* PR2: Desktop API wrappers, settings loader data, settings-page UI, i18n strings.
* PR3: Restore safety, local pre-restore backup, validation, lint/build/cargo checks, PRD/spec notes.

## Technical Notes

* `desktop/src-tauri/src/storage.rs` bootstraps SQLite schema and uses WAL mode.
* Raw SQLite file sync is risky because WAL mode can leave important state in companion files unless a proper backup/export path is used.
* `desktop/src-tauri/Cargo.toml` already includes `reqwest = 0.12`, so WebDAV can be implemented either with direct HTTP methods or a crate layered over reqwest.
* Recommended WebDAV MVP can use existing `reqwest` with explicit `MKCOL`, `PROPFIND`/`HEAD`, `PUT`, and `GET` requests instead of adding a WebDAV-specific crate.
* Password-protected secret backup likely needs new direct Rust dependencies:
  * `argon2`
  * `chacha20poly1305`
  * `rand_core` or equivalent OS RNG support
  * optionally `base64` for compact JSON-safe binary encoding
* User selected the RustCrypto dependency set.
* Existing secret APIs can be reused for WebDAV password/app-password storage.
* Relevant specs read:
  * `.trellis/spec/desktop/frontend/index.md`
  * `.trellis/spec/desktop/frontend/directory-structure.md`
  * `.trellis/spec/desktop/frontend/state-management.md`
  * `.trellis/spec/desktop/frontend/type-safety.md`
  * `.trellis/spec/desktop/frontend/quality-guidelines.md`
  * `.trellis/spec/guides/desktop-runtime-boundary.md`
  * `.trellis/spec/guides/cross-layer-thinking-guide.md`
