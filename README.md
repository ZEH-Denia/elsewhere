# Elsewhere：未接来电

接到来自平行世界自己的电话，通过互动剧情探索另一种人生。

**组员从这里开始：[团队快速了解（约三分钟）](docs/团队快速了解.md)**，了解产品体验、当前进度、团队分工与可参与的工作。

GitHub 仓库：[ZEH-Denia/elsewhere](https://github.com/ZEH-Denia/elsewhere)，当前为公开仓库（2026-11-16 实查）。异地获取项目与更新方式见 [GitHub 协作入门](docs/GITHUB_COLLABORATION.md)。

## 当前状态

2026-11-17：TASK-001 的工程、首页与可返回前言已完成并 PASS，R1 已关闭，见 [审查报告](tasks/reviews/TASK-001.md)；最新执行方记录为 [task-001 补证报告](https://github.com/ZEH-Denia/elsewhere/blob/0da563b86ea2395f8fb8efb9d083ba20335632d5/tasks/reports/TASK-001.md)。TASK-001 [已归档](tasks/archive/TASK-001.md)。

团队已要求下一轮交接，当前 **TASK-002 / READY**：视觉打磨、剧情来电、接听、首段对话和一次有效选择。任务与内容稿已准备；**上述新增功能尚未开发或验收，完整剧情也未实现**。

## 在 Qoder IDE 中开始

用 Qoder 打开本项目根目录，在对话中发送：

> 请阅读 docs/QODER_START.md、AGENTS.md、docs/COLLABORATION.md 和 tasks/current.md，切换并更新 task-002，按 TASK-002 执行开发和验证。完成后写入 tasks/reports/TASK-002.md，自动提交推送 task-002，提供提交号和预览地址，停止修改，等待 Codex 审核。

当前[Qoder 开发交接入口](docs/QODER_START.md)针对 TASK-002，包含 task-002 分支操作、提交推送与交还方式。同一台电脑直接打开现有项目目录，沿用已有工程；完成交接准备不表示 Qoder 已经执行开发。

## 文档入口

| 文档 | 用途 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 角色、权限和工作边界 |
| [当前任务](tasks/current.md) | TASK-002 的目标、范围及十项验收标准 |
| [Qoder 开工交接](docs/QODER_START.md) | 可直接复制的开发指令、分支与交还步骤 |
| [协作协议](docs/COLLABORATION.md) | 交接、执行报告、审查与返修 |
| [GitHub 协作入门](docs/GITHUB_COLLABORATION.md) | 组员访问、下载与同步项目 |
| [产品定义](docs/PRODUCT.md) | MVP 体验与范围 |
| [技术方案](docs/ARCHITECTURE.md) | 技术约束与演进方向 |
| [路线图](docs/ROADMAP.md) | 顺序、里程碑与进入条件 |
| [开发与参赛详细计划](docs/DETAILED_PLAN.md) | 逐日排期、分支剧情、任务门槛、验证与提交安排 |
| [界面美化方向](docs/VISUAL_DIRECTION.md) | 已纳入 TASK-002 的首页、来电和对话视觉方向 |
| [首通来电执行用稿](docs/STORY_OPENING.md) | TASK-002 的固定对话、选项、反馈与本段结束内容 |
| [项目现状](docs/PROJECT_STATUS.md) | 检查证据、已完成事项和未验证事项 |
| [GitHub 内容核查](docs/GITHUB_CONTENT_AUDIT.md) | 远程文件一致性、现状核查结果与修正记录 |
| [原始交接](CODEX_HANDOFF.md) | 接管依据，保持原文 |

## 本地运行

工程使用 React、TypeScript、Vite 与 Tailwind CSS，包管理器为 npm。`package.json` 遵循 Vite 的运行要求：Node.js 20 系列需 20.19.0 或更高版本，其他版本需 22.12.0 或更高版本；本轮实际使用 Node.js v24.16.0、npm 11.13.0。

```bash
npm ci
npm run dev
```

开发服务默认地址为 `http://127.0.0.1:5173/`。另开终端可执行：

```bash
npm run typecheck
npm run build
npm run preview
```

生产构建输出到 `dist/`（不提交），预览服务默认地址为 `http://127.0.0.1:4173/`。当前版本不需要 API Key、后端、账号或远程素材，刷新页面会回到首页。

MVP 不要求用户提供 API Key，也不要求配置后端。团队已持续授权每轮改动完成并检查后自动提交、推送：指挥文档同步 main，Qoder 开发与返修同步任务分支。代码合并 main、网站部署与赛事投稿按协作协议另行批准。
