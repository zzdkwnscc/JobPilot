# ContactInfo 组件迁移指南

## 背景

`ContactInfo` 是共享的个人信息渲染组件，统一了所有模板的联系方式排版：
- 两行布局：第一行短字段（phone、location、linkedin、github 等），第二行长字段（email、wechat、website、customLinks）
- `variant="profile"` 可用于个人信息更完整的模板：第一行优先展示岗位匹配和主联系方式（jobTitle、yearsOfExperience、location、phone、email），第二行展示补充联系方式和身份信息（wechat、website、gender、age、hometown、politicalStatus）
- 每个字段带语义 Lucide icon
- 支持 `align`（center/left）和 `iconColor` 自定义

## 三层架构

| 层级 | 路径 | 用途 | 优先级 |
|------|------|------|--------|
| Unified | `src/lib/template-renderer/templates/*.tsx` | React 预览 + PDF 导出 | **最高** |
| Legacy React | `src/components/preview/templates/*.tsx` | React 预览 | 中 |
| Legacy Export | `src/app/api/resume/[id]/export/templates/*.ts` | PDF 导出 | 最低 |

**渲染优先级**：Unified > Legacy React（预览）/ Legacy Export（PDF）

**关键点**：
- 有 Unified 版本的模板，PDF 导出走 `unifiedTemplate.buildHtml()`
- 无 Unified 版本的模板，PDF 导出走 `TEMPLATE_BUILDERS[template]`（Legacy Export）

## 迁移步骤

### 1. 确认模板版本

检查是否存在 unified 版本（`src/lib/template-renderer/templates/`）。

| 情况 | 需要修改的文件 |
|------|---------------|
| 有 Unified | Unified（React + HTML export）+ Legacy React |
| 无 Unified | Legacy React + Legacy Export |

### 2. 导入组件

**Unified / Legacy React：**
```tsx
import { ContactInfo, buildContactEntries } from '../contact-info';
```

**Legacy Export（`.ts` 文件）：**
```ts
import { buildContactEntries } from '@/lib/template-renderer/contact-info';
```

> Legacy Export 只有 HTML 字符串构建，无法使用 React 组件，需要 `buildContactEntries` 手动渲染。

### 3. 替换 React 渲染

删除模板中 inline 的联系方式渲染代码（通常是 `contacts.map(...)` 或逐字段 `<span>`），替换为：

```tsx
<ContactInfo pi={pi} align="left" iconColor="#e94560" style={{ color: '#d4d4d8' }} />
```

**Props 选择：**

| Prop | 说明 | 示例 |
|------|------|------|
| `align` | `"center"` 居中（默认），`"left"` 左对齐 | Classic → center, Modern → left |
| `iconColor` | icon 颜色，默认 `#71717a`（zinc-500） | Professional → `#1e3a5f`, Creative → `rgba(255,255,255,0.6)` |
| `iconSize` | icon 尺寸，默认 13 | Minimal → 12（更紧凑） |
| `variant` | 字段分组顺序，默认 `"default"`，个人资料密集布局用 `"profile"` | Modern Minimal → profile |
| `style` | 覆盖容器样式，常用于深色背景文字颜色 | `{ color: '#d4d4d8' }` |
| `className` | 额外 CSS class | — |

**常见场景：**

- 白色背景 + 居中：`<ContactInfo pi={pi} />`
- 白色背景 + 左对齐：`<ContactInfo pi={pi} align="left" />`
- 白色背景 + 主题色 icon：`<ContactInfo pi={pi} iconColor="#1e40af" />`
- 个人资料密集布局：`<ContactInfo pi={pi} variant="profile" />`
- 深色背景 + 左对齐：`<ContactInfo pi={pi} align="left" iconColor="rgba(255,255,255,0.6)" style={{ color: 'rgba(255,255,255,0.7)' }} />`

### 4. 替换 Legacy Export（无 Unified 版本的模板）

`src/app/api/resume/[id]/export/templates/<name>.ts` 文件需要手动构建 HTML：

```ts
const { row1, row2 } = buildContactEntries(pi);

const iconColor = '#71717a';
const textColor = '#6B7280';
const textAlign = 'center'; // 或 'left'

const renderRow = (entries: typeof row1) =>
  entries.map((c) => `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 6px"><span style="color:${iconColor};font-size:12px">${c.htmlIcon}</span><span style="color:${textColor}">${esc(c.value)}</span></span>`).join('');

const contactHtml = (row1.length > 0 || row2.length > 0)
  ? `<div style="margin-top:4px;font-size:13px;text-align:${textAlign}">${renderRow(row1)}${row2.length > 0 ? `</div><div style="margin-top:2px;font-size:13px;text-align:${textAlign}">${renderRow(row2)}` : ''}</div>`
  : '';
```

在 `buildXxxHtml` 函数中用 `${contactHtml}` 替换原来的联系方式 HTML。

Unified 模板的 `buildHtml` 函数需要手动构建 HTML 字符串：

```tsx
function buildContactHtml(pi: PersonalInfoContent): string {
  const { row1, row2 } = buildContactEntries(pi);
  if (row1.length === 0 && row2.length === 0) return '';

  const iconColor = '#71717a';  // 根据模板调整
  const textColor = '#6B7280';  // 根据模板调整
  const textAlign = 'left';     // center 或 left

  const renderRow = (entries: typeof row1) =>
    entries.map((c) => `<span style="display:inline-flex;align-items:center;gap:6px;margin:2px 8px"><span style="color:${iconColor};font-size:13px;flex-shrink:0">${c.htmlIcon}</span><span style="color:${textColor}">${esc(c.value)}</span></span>`).join('');

  const r1 = row1.length > 0
    ? `<div style="margin-top:4px;font-size:13px;text-align:${textAlign}">${renderRow(row1)}</div>`
    : '';
  const r2 = row2.length > 0
    ? `<div style="margin-top:${row1.length > 0 ? '2px' : '4px'};font-size:13px;text-align:${textAlign}">${renderRow(row2)}</div>`
    : '';

  return r1 + r2;
}
```

在 `buildXxxHtml` 函数中用 `${buildContactHtml(pi)}` 替换原来的联系方式 HTML。

### 5. 删除废弃代码

- 删除模板中的 `contacts` 变量、`getContactList` 导入
- 删除逐字段渲染的 JSX/HTML

### 6. 运行类型检查

```bash
pnpm type-check
```

## 已迁移模板

| 模板 | Unified | Legacy React | Legacy Export | align | iconColor |
|------|---------|--------------|---------------|-------|-----------|
| Classic | ✅ | ✅ | — | center | 默认 |
| Modern | ✅ | ✅ | — | left | `#e94560` |
| Modern Minimal | ✅ | — | — | left | `#2563EB` |
| Minimal | — | ✅ | ✅ | left | 默认 |
| Professional | — | ✅ | ✅ | center | `#1e3a5f` |
| Creative | — | ✅ | ✅ | left | `rgba(255,255,255,0.6)` |
| ATS | — | ✅ | ✅ | center | `#525252` |
