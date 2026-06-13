# Security Policy / 安全策略

## Supported Versions / 支持的版本

We release updates regularly and recommend using the latest version.

我们定期发布更新，建议使用最新版本。

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| 1.4.x   | :white_check_mark: |
| < 1.4   | :x:                |

## Reporting a Vulnerability / 报告安全漏洞

**Please do not report security vulnerabilities through public GitHub issues.**

**请勿通过公开的 GitHub Issue 报告安全漏洞。**

### English

If you discover a security vulnerability, please send an email to:

**[security@jobpilot.dev](mailto:security@jobpilot.dev)** (or open a private security advisory)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will:
- Acknowledge your email within 48 hours
- Send a detailed response within 7 days
- Keep you informed of the progress
- Credit you in the fix announcement (unless you prefer to remain anonymous)

### 中文

如果你发现安全漏洞，请发送邮件至：

**[security@jobpilot.dev](mailto:security@jobpilot.dev)**（或创建私密安全建议）

请包含：
- 漏洞描述
- 复现步骤
- 潜在影响
- 修复建议（如有）

我们将：
- 48 小时内确认收到
- 7 天内发送详细回复
- 持续告知处理进展
- 在修复公告中致谢（除非你希望匿名）

## Security Best Practices / 安全最佳实践

### For Users / 用户须知

- **API Keys**: Store API keys in the system keyring (enabled by default)
- **WebDAV Sync**: Use encrypted connections (HTTPS) for WebDAV
- **Updates**: Keep JobPilot updated to the latest version
- **Privacy**: Enable data masking when exporting resumes for sharing

### For Developers / 开发者须知

- Never commit API keys or credentials
- Use environment variables for sensitive data during development
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for secure coding practices
- Run security checks before submitting PRs

## Privacy / 隐私

JobPilot is **local-first**:
- ✅ Resume data stored locally in SQLite
- ✅ API keys stored in OS keyring (Windows Credential Manager / macOS Keychain)
- ✅ No telemetry or usage tracking
- ✅ AI API calls go directly to your configured provider
- ✅ Optional WebDAV sync is end-to-end encrypted

JobPilot 采用**本地优先**架构：
- ✅ 简历数据存储在本地 SQLite
- ✅ API 密钥存储在系统密钥链（Windows 凭据管理器 / macOS 钥匙串）
- ✅ 无遥测或使用跟踪
- ✅ AI API 调用直接发送到你配置的服务商
- ✅ 可选的 WebDAV 同步采用端到端加密

---

**Thank you for helping keep JobPilot secure! / 感谢你帮助保持 JobPilot 的安全！**
