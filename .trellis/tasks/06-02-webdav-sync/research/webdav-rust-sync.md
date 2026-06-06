# WebDAV Rust Sync Research

## Sources

* https://docs.rs/crate/reqwest_dav/latest
* https://docs.rs/reqwest_dav/latest/reqwest_dav/struct.Client.html
* https://docs.rs/webdav-meta
* https://www.rfc-editor.org/info/rfc4918

## Findings

* `reqwest_dav` is an async Rust WebDAV client built on `reqwest`; it supports Basic and Digest auth plus common file operations: `GET`, `PUT`, `DELETE`, `MKCOL`, copy/move, and list/`PROPFIND`.
* `reqwest_dav` expects remote paths in server-specific WebDAV path form; provider setup UX should make the base URL and remote folder/path explicit and test them before sync.
* `webdav-meta` provides RFC 4918 method/header definitions such as `PROPFIND` and `MKCOL`, but it is lower-level and still requires an HTTP client integration.
* RFC 4918 defines WebDAV as HTTP extensions including `PROPFIND`, `MKCOL`, and ETag-related behavior. ETags can support conflict detection, but provider support and consistency vary.

## Repo Constraints

* The desktop app already depends on `reqwest = 0.12` with JSON, stream, and rustls TLS features.
* Existing Tauri commands in `desktop/src-tauri/src/lib.rs` delegate to Rust modules and are exposed through typed wrappers in `desktop/src/lib/desktop-api.ts`.
* Existing credentials are stored through `settings.rs::write_secret_value/read_secret_value` using secret keys such as `provider.openai.api_key`.
* Local core data lives in SQLite at `workspace/rolerover.db`; the database uses WAL mode, so syncing the raw DB file directly is risky unless the snapshot is created through a safe export/backup path.

## Feasible Approaches

### Approach A: Manual Snapshot Backup/Restore (Recommended MVP)

Export the local desktop data into a versioned JSON snapshot, upload it with WebDAV `PUT`, and restore by downloading the snapshot and applying it after creating a local backup.

Pros:

* Avoids SQLite WAL file-copy hazards.
* Avoids complex merge logic in the first release.
* Clear user mental model: upload local backup, restore remote backup.
* Compatible with many WebDAV providers.

Cons:

* Not true continuous multi-device sync.
* Restore can overwrite local changes unless the UI forces an explicit confirmation.

### Approach B: Manual Two-Way Sync with Last-Write-Wins

Maintain a remote manifest with update timestamps and hashes; compare local and remote state on user-triggered sync; upload or download the newer side, with conflict warnings.

Pros:

* Closer to user expectations for "sync".
* Still avoids background complexity.

Cons:

* Needs robust conflict UI.
* Last-write-wins can lose edits if two devices changed different documents.

### Approach C: Automatic Background Sync

Periodically sync after local autosave and at startup/shutdown, using remote metadata to detect conflicts.

Pros:

* Best user convenience once stable.

Cons:

* Highest risk: conflicts, network failures, partial writes, autosave races, and surprising overwrites.
* Needs more UX states and likely a sync queue.

## Recommendation

Start with Approach A as the MVP, but shape file formats and commands so Approach B can be added later:

* `test_webdav_connection`
* `get_webdav_sync_status`
* `push_webdav_snapshot`
* `pull_webdav_snapshot`
* optional future `sync_webdav`

Keep secrets out of the snapshot by default. WebDAV password/app-password should be stored through the existing secret vault with a key such as `sync.webdav.password`.
