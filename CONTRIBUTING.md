# Contributing to JobPilot / 贡献指南

[English](#english) | [中文](#中文)

---

## English

Thank you for your interest in contributing to JobPilot! This document provides guidelines for contributing to the project.

### 🚀 Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `pnpm install`
3. **Start development mode**: `pnpm run dev:tauri`
4. **Make your changes** in a new branch
5. **Test thoroughly** on your platform
6. **Submit a Pull Request**

### 📋 Development Setup

#### Prerequisites
- Node.js 20+
- pnpm 9+
- Rust stable (for desktop builds)
- Tauri 2 prerequisites for your platform

#### Running the App
```bash
# Desktop development
pnpm run dev:tauri

# Web development (if applicable)
pnpm run dev:web
```

#### Building
```bash
# Build desktop app
pnpm run build:tauri

# Type check
pnpm run type-check

# Lint
pnpm run lint
```

### 🐛 Reporting Bugs

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- Include your platform, version, and steps to reproduce
- Add logs or screenshots if possible

### ✨ Requesting Features

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml)
- Clearly describe the problem and proposed solution
- Explain why this feature would be useful

### 💻 Code Contributions

#### Branch Naming
- `feat/your-feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-you-updated` - Documentation
- `refactor/what-you-refactored` - Code refactoring

#### Commit Messages
Follow conventional commits format:
- `feat: add dark mode toggle`
- `fix: resolve PDF export crash`
- `docs: update installation guide`
- `refactor: simplify AI chat state management`

#### Code Style
- Use TypeScript for all frontend code
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and small

#### Pull Request Process
1. Update documentation if needed
2. Ensure all tests pass and no new warnings
3. Fill out the PR template completely
4. Link related issues
5. Request review from maintainers

### 🎯 Areas We Need Help With

- 🌍 **Translations**: Add support for more languages
- 🎨 **UI/UX**: Design improvements and accessibility
- 📝 **Templates**: New resume templates
- 🐛 **Bug Fixes**: Check [open issues](https://github.com/jlifeng/JobPilot/issues)
- 📖 **Documentation**: Improve guides and examples
- ✅ **Testing**: Add test coverage

### 📁 Project Structure

```
JobPilot/
├── desktop/              # Tauri desktop app
│   ├── src/             # React frontend
│   ├── src-tauri/       # Rust backend
│   └── public/          # Static assets
├── src/                 # Shared code (if web version exists)
├── scripts/             # Build and utility scripts
└── images/              # Screenshots and assets
```

### 🔍 Key Files to Know

- `desktop/src/stores/` - Zustand state management
- `desktop/src-tauri/src/ai.rs` - AI tool calling logic
- `desktop/src/i18n.ts` - Internationalization
- `desktop/src/components/` - React components

### ❓ Questions?

- Open a [Discussion](https://github.com/jlifeng/JobPilot/discussions)
- Join our [Linux.do Community](https://linux.do/)
- Check existing [Issues](https://github.com/jlifeng/JobPilot/issues)

### 📜 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

## 中文

感谢你对 JobPilot 项目的关注！本文档提供贡献指南。

### 🚀 快速开始

1. **Fork 仓库**并克隆到本地
2. **安装依赖**：`pnpm install`
3. **启动开发模式**：`pnpm run dev:tauri`
4. **在新分支中**进行修改
5. **充分测试**你的改动
6. **提交 Pull Request**

### 📋 开发环境配置

#### 环境要求
- Node.js 20+
- pnpm 9+
- Rust stable（桌面端构建需要）
- 对应平台的 Tauri 2 前置条件

#### 运行应用
```bash
# 桌面端开发
pnpm run dev:tauri

# Web 端开发（如适用）
pnpm run dev:web
```

#### 构建
```bash
# 构建桌面应用
pnpm run build:tauri

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint
```

### 🐛 报告 Bug

- 使用 [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.yml)
- 包含平台、版本和复现步骤
- 尽可能添加日志或截图

### ✨ 功能请求

- 使用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.yml)
- 清晰描述问题和建议的解决方案
- 说明为什么这个功能有用

### 💻 代码贡献

#### 分支命名
- `feat/功能名称` - 新功能
- `fix/bug描述` - Bug 修复
- `docs/更新内容` - 文档更新
- `refactor/重构内容` - 代码重构

#### 提交信息
遵循 conventional commits 格式：
- `feat: 添加深色模式切换`
- `fix: 修复 PDF 导出崩溃`
- `docs: 更新安装指南`
- `refactor: 简化 AI 聊天状态管理`

#### 代码风格
- 所有前端代码使用 TypeScript
- 遵循现有代码模式
- 为复杂逻辑添加注释
- 保持函数专注和简洁

#### Pull Request 流程
1. 如需要，更新文档
2. 确保所有测试通过，无新警告
3. 完整填写 PR 模板
4. 关联相关 Issue
5. 请求维护者审查

### 🎯 我们需要帮助的领域

- 🌍 **翻译**：添加更多语言支持
- 🎨 **UI/UX**：设计改进和无障碍优化
- 📝 **模板**：新的简历模板
- 🐛 **Bug 修复**：查看[开放的 Issue](https://github.com/jlifeng/JobPilot/issues)
- 📖 **文档**：改进指南和示例
- ✅ **测试**：增加测试覆盖率

### 📁 项目结构

```
JobPilot/
├── desktop/              # Tauri 桌面应用
│   ├── src/             # React 前端
│   ├── src-tauri/       # Rust 后端
│   └── public/          # 静态资源
├── src/                 # 共享代码（如有 Web 版本）
├── scripts/             # 构建和工具脚本
└── images/              # 截图和资源
```

### 🔍 重要文件

- `desktop/src/stores/` - Zustand 状态管理
- `desktop/src-tauri/src/ai.rs` - AI 工具调用逻辑
- `desktop/src/i18n.ts` - 国际化
- `desktop/src/components/` - React 组件

### ❓ 有问题？

- 开启 [Discussion](https://github.com/jlifeng/JobPilot/discussions)
- 加入 [Linux.do 社区](https://linux.do/)
- 查看现有 [Issues](https://github.com/jlifeng/JobPilot/issues)

### 📜 许可证

贡献代码即表示你同意你的贡献将按照 Apache License 2.0 许可。

---

**Thank you for contributing! / 感谢你的贡献！** 🎉
