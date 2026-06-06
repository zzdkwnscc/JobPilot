# WebDAV 同步踩坑实录：从 405 到数据恢复不生效的完整排查

> 在 Tauri v2 桌面应用中实现 WebDAV 备份/恢复功能时，踩了 7 个坑。本文记录每个问题的现象、根因和解决方案，供同样在做 WebDAV 集成的开发者参考。

## 1. Tauri v2 命令权限：新增 command 后前端报 "not allowed"

**现象：** Rust 侧新增了 `#[tauri::command]` 并在 `invoke_handler` 中注册，但前端调用时报 `update_webdav_sync_settings not allowed. Command not found`。

**根因：** Tauri v2 引入了基于 capability 的权限系统。自定义 command 必须在 `permissions/*.toml` 文件中显式声明，否则即使 Rust 侧注册了，前端也无法调用。

**解决：** 在 `permissions/desktop-core.toml` 的 `commands.allow` 数组中添加 command 标识符（snake_case）：

```toml
commands.allow = [
  # ... existing commands ...
  "get_webdav_sync_status",
  "update_webdav_sync_settings",
  "test_webdav_connection",
  "upload_webdav_snapshot",
  "restore_webdav_snapshot",
]
```

**教训：** 编辑 toml 文件后一定要用 grep 验证内容确实写入了——我的编辑工具曾静默失败，报了成功但文件内容没变。

---

## 2. 云盘 WebDAV 不支持 MKCOL：创建子目录返回 405

**现象：** 上传快照时 `ensure_remote_collections` 尝试 MKCOL 创建 `snapshots/` 子目录，123云盘返回 `405 Method Not Allowed`。

**根因：** 很多云盘的 WebDAV 实现是阉割版的。它们只支持 GET/PUT/DELETE/PROPFIND 等基本操作，不支持 MKCOL（创建集合/目录）。RFC 4918 要求 WebDAV 服务器支持 MKCOL，但现实是另一回事。

**解决：**

- **架构调整：** 放弃子目录结构，快照文件直接放在用户指定的远端目录根下（`latest.json` 和 `jobpilot-snapshot-xxx.json` 并列）
- **兼容策略：** `mkcol_if_needed_at_path` 先用 PROPFIND 检查目录是否存在，不存在才尝试 MKCOL；MKCOL 失败后再次 PROPFIND 确认，避免把"不支持 MKCOL"误判为"目录已存在"
- **用户指引：** 提示用户在云盘客户端手动创建远端目录

---

## 3. 测试连接的 PUT 写入被拒绝

**现象：** 测试连接时尝试 PUT 一个 `.jobpilot-webdav-test.txt` 文件，123云盘返回 405。

**根因：** 某些 WebDAV 服务对"写入测试文件"和"写入正式文件"的行为不一致。测试文件可能因为文件名以 `.` 开头（隐藏文件）或其他策略被拒绝，但正式上传是成功的。

**解决：** 测试连接时 PUT 返回 405 不再直接报错。只要 PROPFIND 确认远端目录可访问，就视为连接成功。真正的写入问题会在实际上传时暴露。

```rust
if response.status() == StatusCode::METHOD_NOT_ALLOWED {
    // PUT rejected — but PROPFIND already confirmed the collection exists.
    // Consider the connection test passed; write issues will surface at upload time.
    return Ok(());
}
```

---

## 4. PUT 请求必须带 Content-Type

**现象：** 部分 WebDAV 服务器对不带 `Content-Type` header 的 PUT 请求返回错误。

**根因：** HTTP 规范不强制要求 PUT 带 Content-Type，但很多 WebDAV 实现（尤其是云盘的）会检查这个 header。

**解决：** 所有 PUT 请求都显式设置 Content-Type：

```rust
// 测试文件
client.put(&url).header("Content-Type", "text/plain").body(...)

// 快照文件
client.put(&url).header("Content-Type", "application/octet-stream").body(...)
```

---

## 5. 恢复快照后数据不生效：SQLite 连接缓存陷阱

**现象：** 恢复 WebDAV 快照后，API 返回成功，但应用里的数据没有任何变化——简历列表、设置项都是旧的。

**根因：** `apply_snapshot_database` 直接用 `fs::write` 覆盖了 `rolerover.db` 文件，但应用进程中的 SQLite 连接仍然打开着。SQLite 在 WAL 模式下会持有内存缓存和 WAL 锁，文件被外部替换后，旧连接继续从缓存读取，完全看不到磁盘上的新数据。

**解决：** 恢复成功后调用 `app.restart()` 重启应用。新进程会打开全新的数据库连接，自然读到最新数据。

```rust
// lib.rs
async fn restore_webdav_snapshot(app: AppHandle, input: ...) -> Result<...> {
    let receipt = sync::restore_webdav_snapshot(&app, input).await?;
    app.restart(); // ← 关键：让新进程打开新的 SQLite 连接
}
```

前端侧也需要配合：因为 app 会立即重启，`restoreWebdavSnapshot` 的返回值实际上到不了前端。所以前端不再依赖 receipt 数据，恢复成功提示改为"应用即将重启…"。

---

## 6. 前端 remotePath 未绑定用户输入

**现象：** 用户在 UI 中修改了远端目录名称，但保存后实际使用的还是默认值 "JobPilot"。

**根因：** `handleSaveWebdavSettings` 中 `remotePath` 的值取自 `webdavStatus?.remotePath`（服务端返回的当前值），而不是用户在输入框中修改的值。

```tsx
// 错误：用了服务端状态而非用户输入
remotePath: webdavStatus?.remotePath ?? "JobPilot",

// 正确：用独立的 state
remotePath: webdavRemotePath,
```

**解决：** 添加 `webdavRemotePath` state，从 `loadWebdavSettings` 初始化，保存时使用 state 值。UI 中添加"远端目录"输入框。

---

## 7. 常见 WebDAV 服务路径格式速查

不同服务的 WebDAV 入口路径差异很大，这里整理一份速查表：

| 服务 | Server URL | 特殊限制 |
|------|-----------|---------|
| 123云盘 | `https://webdav.123pan.cn/webdav` | 不支持 MKCOL，需手动创建目录 |
| 坚果云 | `https://dav.jianguoyun.com/dav/` | 需用应用专用密码（非登录密码） |
| Nextcloud | `https://example.com/remote.php/dav/files/username/` | 完整 WebDAV 支持 |
| ownCloud | `https://example.com/remote.php/dav/files/username/` | 完整 WebDAV 支持 |
| Alist | `http://localhost:5244/dav/` | 本地代理，完整支持 |
| Synology | `https://nas:5006/webdav/` | 需启用 WebDAV 服务 |

---

## 总结

WebDAV 看起来是标准协议（RFC 4918），但现实中的实现千差万别。核心经验：

1. **不要假设服务器支持完整的 WebDAV**——MKCOL、LOCK、PROPPATCH 都可能不支持
2. **PROPFIND 是最可靠的探活手段**——用它检查目录存在性，比 MKCOL 的返回值更可信
3. **PUT 要带 Content-Type**——虽然规范不要求，但很多实现会检查
4. **文件替换后必须重启**——SQLite 的 WAL 缓存不会自动失效
5. **前端 state 和服务端状态要分清**——表单输入绑 state，不绑 API 返回值
