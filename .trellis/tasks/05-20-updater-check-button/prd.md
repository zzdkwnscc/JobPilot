# updater: 检查更新按钮 + 版本显示

## Goal

1. 在导航栏设置按钮旁边添加"关于"按钮，显示版本号和检查更新功能
2. 解决 macOS updater 未检测到新版本的问题

## What I already know

### 现有实现
- `app-update-store.ts` - Zustand store 管理更新状态
- `update-dialog.tsx` - 更新对话框组件
- `settings.tsx` - 设置页面有完整的更新检查功能
- `root.tsx` - 应用启动时自动调用 `performInitialCheck()`
- 更新 badge 显示在顶部导航栏

### 设置按钮风格
```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8"
  onClick={() => setSettingsDialogOpen(true)}
>
  <Settings className="h-4 w-4" />
</Button>
```
- 使用 Lucide SVG 图标
- `variant="ghost"`, `size="icon"`, `h-8 w-8`

### 问题：macOS 检测不到更新

**根因定位：** `.github/workflows/release-desktop.yml` 的 merge 步骤中 PowerShell 脚本有 bug：

```powershell
$artifactName = $_.FullName.Split([IO.Path]::DirectorySeparatorChar)[1]
```

对于绝对路径 `/home/runner/.../build-artifacts/build-aarch64-apple-darwin/...`：
- `Split('/')` 的 `[1]` 是 `"home"`，不是 artifact name
- 结果所有 manifest 都被命名为 `latest-home.json`，互相覆盖
- 最后只剩一个 manifest（Windows 的）

## Requirements

### 1. 导航栏"关于"按钮

**位置：** 设置按钮右边，语言选择器左边

**样式：** 与设置按钮一致
```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8"
  onClick={() => setAboutDialogOpen(true)}
  aria-label={t("navAbout")}
>
  <Info className="h-4 w-4" />
</Button>
```

**点击后显示弹窗内容：**
- 应用名称 + Logo
- 当前版本号（如 `v1.1.3`）
- "检查更新"按钮
- 关闭按钮

**交互：**
- 点击"检查更新"：
  - 有新版本 → 打开 `UpdateDialog`
  - 无新版本 → 显示 toast 或 inline 提示"已是最新版本"

### 2. macOS updater 修复

**修复方案：** 修改 `.github/workflows/release-desktop.yml` 中 "Collect and merge updater manifests" 步骤：

```powershell
# 原来的 bug 代码：
$artifactName = $_.FullName.Split([IO.Path]::DirectorySeparatorChar)[1]

# 修复方案：找到 "build-artifacts" 目录后面的部分
$pathParts = $_.FullName.Split([IO.Path]::DirectorySeparatorChar)
$buildArtifactsIndex = 0
for ($i = 0; $i -lt $pathParts.Length; $i++) {
  if ($pathParts[$i] -eq "build-artifacts") {
    $buildArtifactsIndex = $i
    break
  }
}
$artifactName = $pathParts[$buildArtifactsIndex + 1]
```

或者更简单：直接从 `build-artifacts` 的子目录名获取。

## Acceptance Criteria

- [ ] 导航栏设置按钮旁边有"关于"图标按钮
- [ ] 点击显示弹窗，包含版本号和"检查更新"按钮
- [ ] 点击检查更新能正确检测新版本
- [ ] macOS 能正确检测到新版本（修复 CI 后）
- [ ] 按钮样式与设置按钮一致

## Out of Scope

- 版本说明内容优化（保持自动生成）
- 独立的"关于"页面（只需要弹窗）

## Technical Notes

### 文件改动

1. `desktop/src/routes/root.tsx`
   - 添加 AboutDialog state
   - 添加"关于"按钮（Info 图标）
   - 渲染 AboutDialog 组件

2. `desktop/src/components/about-dialog.tsx`（新建）
   - 弹窗组件
   - 显示 Logo + 版本号
   - "检查更新"按钮（调用 `useAppUpdateStore`）

3. `desktop/src/i18n.ts` / `messages/*.json`
   - 添加翻译 key: `navAbout`, `aboutTitle`, `checkForUpdates`, `upToDate` 等

4. `.github/workflows/release-desktop.yml`
   - 修复 PowerShell 脚本中 artifact name 提取逻辑
