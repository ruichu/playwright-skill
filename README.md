# Playwright Skill

**面向编码 Agent 的通用 Playwright 自动化**

这是一个 [Agent Skill](https://agentskills.io)，让编码 Agent 能够即时编写并执行 Playwright 自动化脚本，从简单的页面测试到复杂的多步骤流程。它同时被打包为 [Claude Code 插件](https://code.claude.com/docs/en/plugins)，方便安装使用。

Claude 会根据你的浏览器自动化需求，自主决定何时使用这个 skill，并且只加载完成当前任务所需的最少信息。

使用 Claude Code 制作。

## 特性

- **任意自动化任务** - Claude 为你的具体需求编写自定义代码，不局限于预置脚本
- **默认显示浏览器** - 通过 `headless: false` 实时查看自动化过程
- **可移植的执行器** - 以稳定的模块解析方式运行文件脚本和内联脚本
- **渐进式披露** - SKILL.md 简洁精炼，完整的 API 参考仅在需要时加载
- **安全的清理机制** - 智能管理临时文件，避免竞态条件
- **全面的辅助函数** - 针对常见任务的可选工具函数

## 安装

> **本仓库是自用翻译 fork**：本节的所有安装命令（`npx skills add`、`/plugin marketplace add` 等）
> 均指向**上游原版** [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)，
> 安装的是未经翻译的英文原版。如需使用本 fork 的版本，请把命令中的仓库地址替换为
> `ruichu/playwright-skill`，或直接复制本仓库的 `skills/playwright-skill/` 目录。

本仓库包含一个标准的 Agent Skill 以及一个 Claude Code 插件封装。推荐的安装方式是 Vercel 的 [`skills`](https://github.com/vercel-labs/skills) CLI，它会把 skill 安装到受支持 Agent 的原生位置。

## 为什么选择这个 skill？

当 Agent 需要编写真正的 Playwright 程序时，请使用这个 skill：循环、断言、多上下文、网络拦截、截图、录屏，或者你想要保存并重复运行的脚本。它还提供开发服务器检测和少量聚焦的辅助函数。

对于简单的交互式浏览，可以从 Microsoft 官方的
[`@playwright/cli`](https://github.com/microsoft/playwright-cli) 入手，并用
`playwright-cli install --skills` 安装它的 agent skills。如果需要基于工具调用、
带无障碍快照的浏览器控制，请使用
[`playwright-mcp`](https://github.com/microsoft/playwright-mcp)。当自动化脚本本身就是
有价值的产出时，本项目是代码优先（code-first）的选择。

### 理解项目结构

本仓库采用带嵌套结构的插件格式：

```
playwright-skill/              # Plugin root
├── .claude-plugin/           # Plugin metadata
└── skills/
    └── playwright-skill/     # The actual skill
        └── SKILL.md
```

仓库把 skill 放在插件的 `skills/` 目录中。安装器会自动处理这种布局；手动复制只是面向没有安装器的客户端的后备方案。

---

### 方式 1：使用 `skills` 安装（推荐）

为你的用户全局安装：

```bash
npx skills add lackeyjb/playwright-skill --skill playwright-skill --global --yes
```

省略 `--global` 则只为当前项目安装：

```bash
npx skills add lackeyjb/playwright-skill --skill playwright-skill --yes
```

要针对特定的 Agent 安装，请添加 `--agent` 并跟上一个或多个 agent ID：

```bash
npx skills add lackeyjb/playwright-skill --skill playwright-skill --agent claude-code cursor --global --yes
```

安装完成后，在已安装的 skill 目录中运行 setup：

```bash
npm run setup
```

受支持的 Agent 和可用选项请参阅 [`skills` CLI 文档](https://github.com/vercel-labs/skills)。

### 方式 2：Claude Code 插件

通过 Claude Code 的插件系统安装，可获得自动更新和团队分发能力：

```bash
# Add this repository as a marketplace
/plugin marketplace add lackeyjb/playwright-skill

# Install the plugin
/plugin install playwright-skill@playwright-skill

# Navigate to the skill directory and run setup
cd ~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
npm run setup
```

运行 `/help` 验证安装，确认 skill 已可用。

---

### 方式 3：其他 Agent 的安装方式

Agent Skills 受 Claude Code、Cursor、GitHub Copilot、Codex、
Gemini CLI、OpenCode 及其他客户端支持。使用客户端文档中说明的 skill
路径安装包含 `SKILL.md` 的目录。如果客户端没有安装器，则将
`skills/playwright-skill/` 复制到其文档说明的 skill 目录中，并在那里运行
`npm run setup`。

### 方式 4：下载 Release

1. 从 [GitHub Releases](https://github.com/lackeyjb/playwright-skill/releases) 下载并解压最新的 release
2. 只将 `skills/playwright-skill/` 文件夹复制到以下位置：
   - 全局：`~/.claude/skills/playwright-skill`
   - 项目：`/path/to/your/project/.claude/skills/playwright-skill`
3. 进入 skill 目录并运行 setup：
   ```bash
   cd ~/.claude/skills/playwright-skill  # or your project path
   npm run setup
   ```

---

### 验证安装

运行 `/help` 确认 skill 已加载，然后让 Claude 执行一个简单的浏览器任务，例如 "Test if google.com loads"。

## 快速开始

安装后，让你的 agent 去测试或自动化某个浏览器任务。它会编写自定义的 Playwright 代码，执行代码，并返回带有截图和控制台输出的结果。

## 使用示例

### 测试任意页面

```
"Test the homepage"
"Check if the contact form works"
"Verify the signup flow"
```

### 视觉测试

```
"Take screenshots of the dashboard in mobile and desktop"
"Test responsive design across different viewports"
```

### 交互测试

```
"Fill out the registration form and submit it"
"Click through the main navigation"
"Test the search functionality"
```

### 验证

```
"Check for broken links"
"Verify all images load"
"Test form validation"
```

## 工作原理

1. 描述你想要测试或自动化的内容
2. 你的 agent 为该任务编写自定义的 Playwright 代码
3. 通用执行器（run.js）以正确的模块解析方式运行代码
4. 浏览器打开（默认可见）并执行自动化操作
5. 展示结果，附带控制台输出和截图

## 配置

默认设置：

- **无头模式（Headless）：** `false`（除非明确要求，浏览器始终可见）
- **慢速执行（Slow Motion）：** 默认 `0ms`；需要时可设置 `SLOW_MO`
- **截图（Screenshots）：** 辅助函数的截图保存在操作系统临时目录；设置 `PW_ARTIFACT_DIR` 可指定其他位置

## 项目结构

```
playwright-skill/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata for distribution
│   └── marketplace.json     # Marketplace configuration
├── skills/
│   └── playwright-skill/    # The actual skill (Claude discovers this)
│       ├── SKILL.md         # What Claude reads
│       ├── run.js           # Universal executor (proper module resolution)
│       ├── package.json     # Dependencies & setup scripts
│       ├── API_REFERENCE.md # Full Playwright API reference
│       └── lib/
│           └── helpers.js   # Optional utility functions
├── README.md                # This file - user documentation
├── CONTRIBUTING.md          # Contribution guidelines
└── LICENSE                  # MIT License
```

## 高级用法

当需要关于选择器、网络拦截、身份认证、视觉回归测试、移动端仿真、性能测试和调试的完整文档时，Claude 会自动加载 `API_REFERENCE.md`。

## 依赖

- Node.js
- Playwright（通过 `npm run setup` 安装）
- Chromium（通过 `npm run setup` 安装）

## 故障排除

**Playwright 未安装？**
进入 skill 目录并运行 `npm run setup`。

**出现 Module not found 错误？**
确保自动化脚本通过 `run.js` 运行，由它来处理模块解析。

**浏览器没有打开？**
检查是否设置了 `headless: false`。除非明确要求无头模式，这个 skill 默认使用可见浏览器。

**想安装所有浏览器？**
在 skill 目录中运行 `npm run install-all-browsers`。

## 什么是 Skill？

[Agent Skills](https://agentskills.io) 是由指令、脚本和资源组成的文件夹，Agent 可以发现并使用它们，从而更准确、更高效地完成任务。当你让 Claude 测试网页或自动化浏览器交互时，Claude 会发现这个 skill，加载必要的指令，执行自定义的 Playwright 代码，并返回带有截图和控制台输出的结果。

这个 Playwright skill 实现了[开放的 Agent Skills 规范](https://agentskills.io)，因此可跨 Agent 平台使用。

## 贡献

欢迎贡献。Fork 本仓库，创建功能分支，进行修改，然后提交 pull request。详情参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 了解更多

- [Agent Skills 规范](https://agentskills.io) - Agent skills 的开放规范
- [Claude Code Skills 文档](https://docs.claude.com/en/docs/claude-code/skills)
- [Claude Code 插件文档](https://docs.claude.com/en/docs/claude-code/plugins)
- [插件市场](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)
- [API_REFERENCE.md](skills/playwright-skill/API_REFERENCE.md) - 完整的 Playwright 文档
- [GitHub Issues](https://github.com/lackeyjb/playwright-skill/issues)

## 许可证

MIT 许可证 - 详情见 [LICENSE](LICENSE) 文件。

## 声明

本项目 fork 自 [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)，在此感谢原作者的工作。上游仓库包含本项目的完整历史与最新更新，欢迎前往查看。
