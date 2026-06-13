# Marketing & Promotion / 营销与推广

This document contains ready-to-use content for promoting JobPilot on social media, forums, and communities.

本文档包含在社交媒体、论坛和社区推广 JobPilot 的即用内容。

---

## Product Hunt Launch (English)

### Tagline
**Your AI-powered resume workbench. Local-first, privacy-focused, and completely free.**

### Short Description
JobPilot is a desktop app that brings AI to your resume workflow—without uploading your data. Generate, edit, polish, and export resumes with 50+ templates, all powered by your choice of OpenAI, Anthropic, or Google AI.

### Key Features (for listing)
- 🔐 100% local-first architecture—your data never leaves your computer
- 🤖 Native AI integration with tool calling for precise edits
- 📝 50+ professional resume templates
- 🎯 JD matching, ATS checking, and mock interviews
- 💾 Encrypted WebDAV sync for backups
- 🎨 Privacy-aware export with data masking
- 🆓 Completely free and open source

### First Comment (template)
👋 Hey Product Hunt! I'm the creator of JobPilot.

**Why I built this:**
Existing resume builders either:
- Store your data on their servers (privacy risk)
- Charge monthly fees (expensive)
- Replace your entire resume with AI (no control)

JobPilot is different:
✅ **Local-first**: All data stored on your machine
✅ **Precision AI**: Uses Anthropic's tool calling to edit specific sections
✅ **Free forever**: No subscriptions, no paywalls

**Tech stack:** Tauri 2, React 19, Rust, TypeScript

**Try it:** Download from GitHub Releases (Windows & macOS)

Happy to answer any questions! 🚀

---

## Twitter/X Posts (English)

### Launch Tweet
🚀 Introducing JobPilot: Your AI-powered resume workbench

✅ 100% local—your data never leaves your computer
✅ Precision AI editing with tool calling
✅ 50+ templates
✅ Free & open source

Download: [github.com/jlifeng/JobPilot]

#OpenSource #AI #CareerTools

### Feature Highlight Tweet 1
🔐 Privacy-first resume building

Unlike online tools, JobPilot stores everything locally:
• Resumes → SQLite
• API keys → OS keyring
• No telemetry
• No tracking

Your data stays yours. Period.

[GIF showing local storage]

### Feature Highlight Tweet 2
🤖 Smart AI editing, not AI replacement

JobPilot uses Anthropic's tool calling to:
✓ Edit specific sections
✓ Apply changes selectively
✓ Keep you in control

No more "AI rewrote my entire resume" disasters.

[GIF showing AI polish button]

### Feature Highlight Tweet 3
💼 Complete job-search workflow:

📝 Resume editing
🎯 JD matching
✅ ATS checking
🗣️ Mock interviews
📄 Multi-format export
☁️ Encrypted sync

All in one desktop app. No server required.

---

## Reddit Posts (English)

### r/resumes Post

**Title:** [Tool] I built a privacy-focused AI resume editor (free, open source, local-first)

**Body:**
Hey r/resumes,

I've been working on JobPilot—a desktop resume editor that uses AI but keeps all your data local.

**Why this might interest you:**
- Your resume stays on your computer, not uploaded to servers
- AI can polish specific sections without rewriting everything
- 50+ templates designed for ATS systems
- Completely free, no subscriptions

**Key features:**
- AI resume generation & polishing
- JD matching and ATS checks
- Mock interview practice
- Export to PDF/HTML/Markdown with privacy masking
- Encrypted WebDAV backup

**Tech:** Built with Tauri (like Notion desktop app), so it's fast and lightweight.

Download: [GitHub Releases link]

Open to feedback! I'm still actively developing it.

### r/selfhosted Post

**Title:** JobPilot - Local-first AI resume workbench with optional WebDAV sync

**Body:**
Sharing a tool I built for privacy-conscious resume building.

**What is it:**
JobPilot is a desktop app (Windows/macOS) that manages resumes locally with optional AI features.

**Self-hosted features:**
- SQLite local database
- API keys in OS keyring (never plaintext)
- Optional WebDAV sync to your Nextcloud/ownCloud
- End-to-end encrypted backups
- No telemetry, no external requests except to your configured AI provider

**Tech stack:**
- Tauri 2 (Rust backend)
- React 19 + TypeScript frontend
- Better-sqlite3 for data
- Vercel AI SDK for provider abstraction

**License:** Apache 2.0

GitHub: [link]

Contributions welcome!

---

## Hacker News Post (English)

**Title:** JobPilot – Local-first AI resume workbench (Windows/macOS)

**Suggested first comment:**
Author here. I built JobPilot because I was frustrated with online resume builders that:

1. Store your data on their servers
2. Charge $10-30/month for basic features
3. Use AI to rewrite your entire resume (no selective edits)

**Technical approach:**
- Tauri 2 for the desktop shell (Rust + WebView)
- React 19 + Zustand for state management
- SQLite for local storage, OS keyring for API keys
- Vercel AI SDK for provider-agnostic AI calls
- Anthropic tool calling for precise resume patches

**Privacy design:**
- All resume data in local SQLite
- AI API calls go directly to your provider (OpenAI/Anthropic/Google)
- Optional WebDAV sync with AES-256-GCM encryption
- No analytics, no telemetry

**License:** Apache 2.0

Would love feedback on architecture, features, or UX!

GitHub: [link]

---

## 中文推广内容

### V2EX 发帖

**标题：** [开源] JobPilot - 本地优先的 AI 简历工作台

**内容：**
大家好，

分享一个我开发的简历工具 JobPilot，主要特点是**本地优先 + AI 辅助**。

**为什么做这个：**
- 在线简历工具要把数据传到服务器（隐私风险）
- 大部分按月收费（每月 ¥30-100）
- AI 功能通常是整份替换（不能精确编辑）

**JobPilot 的不同：**
✅ 数据 100% 存储在本地（SQLite）
✅ 使用 Anthropic 工具调用，可以精确修改指定模块
✅ 50+ 简历模板
✅ 完全免费开源

**主要功能：**
- AI 生成/润色简历
- JD 匹配分析
- ATS 系统检查
- 模拟面试训练
- 导出时数据脱敏（隐藏姓名/手机/邮箱）
- WebDAV 加密同步（支持坚果云/123云盘）

**技术栈：**
- Tauri 2（Rust + WebView）
- React 19 + TypeScript
- SQLite + OS Keyring

**下载：** [GitHub Releases 链接]

**开源协议：** Apache 2.0

欢迎提建议和贡献代码！

### 知乎文章标题建议

1. 《我做了一个本地优先的 AI 简历工具，数据不上传，完全免费》
2. 《为什么我不用在线简历工具？用 Tauri 开发了本地化方案》
3. 《JobPilot：开源的 AI 简历工作台，支持精确编辑和隐私保护》
4. 《从隐私焦虑到本地优先：我如何用 Rust + React 重构简历工具》

### 掘金文章大纲

**标题：** 开源项目分享：JobPilot - 本地优先的 AI 简历工作台

**内容结构：**
1. **痛点分析**
   - 在线简历工具的隐私问题
   - 订阅制的成本问题
   - AI 全文替换的控制问题

2. **解决方案**
   - 本地优先架构
   - 精确 AI 编辑
   - 隐私保护设计

3. **技术实现**
   - Tauri 2 跨平台方案
   - SQLite 本地存储
   - Anthropic 工具调用
   - WebDAV 加密同步

4. **功能演示**
   - 截图 + GIF
   - 核心功能介绍

5. **开源地址**
   - GitHub 链接
   - 欢迎贡献

---

## LinkedIn Post (English)

🎯 Excited to share JobPilot—an open-source, local-first AI resume workbench I've been building!

**Why local-first?**
Your resume contains sensitive information. Unlike online tools, JobPilot stores everything on your machine—no uploads, no cloud storage, no data leaks.

**What makes it unique:**
✅ Precision AI editing with Anthropic tool calling
✅ 50+ ATS-friendly templates
✅ JD matching & mock interviews
✅ Privacy-aware export (mask sensitive data)
✅ Completely free & open source

**Tech stack:** Tauri 2, React 19, Rust, TypeScript

Perfect for job seekers who care about privacy and developers who want to contribute!

Download: [GitHub link]

#OpenSource #AI #CareerDevelopment #Privacy

---

## GitHub README Social Preview Settings

**Recommended settings for repository social preview image:**

**Dimensions:** 1280x640px

**Content suggestions:**
- Logo in center
- Tagline: "Local-First AI Resume Workbench"
- Key badges: Apache 2.0, Tauri 2, React 19
- Visual: Screenshot of main interface or split view (light/dark mode)

---

## Community Engagement Templates

### Response to "Why not just use Google Docs/Word?"

Great question! Google Docs/Word are excellent for general documents, but JobPilot is specifically designed for resumes:

1. **AI Integration**: Native tool calling for precise edits (not just "rewrite everything")
2. **Templates**: 50+ ATS-optimized resume templates
3. **JD Matching**: Analyze how well your resume matches job descriptions
4. **Privacy**: Export with data masking for sharing
5. **Structure**: Enforces resume best practices (section management, consistent formatting)

It's like the difference between using Notepad vs. an IDE for coding—specialized tools for specialized tasks.

### Response to "Is my data really safe?"

Yes! Here's exactly how JobPilot handles your data:

**Local Storage:**
- Resumes → SQLite database in `~/.jobpilot/`
- API keys → OS keyring (Windows Credential Manager / macOS Keychain)
- No network requests except to your configured AI provider

**AI Calls:**
- Go directly from your computer to OpenAI/Anthropic/Google
- We're a client, not a middleman
- You can verify this with network monitoring tools

**Optional Sync:**
- WebDAV uses AES-256-GCM encryption
- Encryption key never leaves your device
- Even if someone accesses your WebDAV server, they see encrypted blobs

**No Telemetry:**
- Zero analytics
- Zero crash reporting to external services
- Zero usage tracking

The code is open source—you can audit every network call.

---

**Good luck with promotion! / 祝推广顺利！** 🚀
