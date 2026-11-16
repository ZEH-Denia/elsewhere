# Elsewhere：未接来电

接到来自平行世界自己的电话，通过互动剧情探索另一种人生。

**组员从这里开始：[团队快速了解（约三分钟）](docs/团队快速了解.md)**，了解产品体验、当前进度、团队分工与可参与的工作。

GitHub 私有仓库：[ZEH-Denia/elsewhere](https://github.com/ZEH-Denia/elsewhere)。异地获取项目与更新方式见 [GitHub 协作入门](docs/GITHUB_COLLABORATION.md)。

## 当前状态

2026-11-16 接管时仅有交接文档。现已建立本地 Git 仓库与协作文档；**应用尚未开发，当前不能启动网页**。TASK-001 等待 Qoder IDE 执行，尚无执行报告或验收结论。

## 在 Qoder IDE 中开始

用 Qoder 打开本项目根目录，在对话中发送：

> 请阅读 AGENTS.md、docs/COLLABORATION.md 和 tasks/current.md，按 TASK-001 的允许范围执行开发和验证，完成后写入 tasks/reports/TASK-001.md 并停止，等待 Codex 审核。

## 文档入口

| 文档 | 用途 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 角色、权限和工作边界 |
| [当前任务](tasks/current.md) | TASK-001 的目标、范围及验收标准 |
| [协作协议](docs/COLLABORATION.md) | 交接、执行报告、审查与返修 |
| [GitHub 协作入门](docs/GITHUB_COLLABORATION.md) | 组员访问、下载与同步项目 |
| [产品定义](docs/PRODUCT.md) | MVP 体验与范围 |
| [技术方案](docs/ARCHITECTURE.md) | 技术约束与演进方向 |
| [路线图](docs/ROADMAP.md) | 顺序、里程碑与进入条件 |
| [项目现状](docs/PROJECT_STATUS.md) | 检查证据、已完成事项和未验证事项 |
| [原始交接](CODEX_HANDOFF.md) | 接管依据，保持原文 |

## 本地运行

待 TASK-001 落地后由 Qoder 补充安装、开发、类型检查、构建和预览的**实际命令**、Node 版本与访问地址。当前没有 `package.json`，不要将预期命令当作已验证命令。

MVP 不要求用户提供 API Key，也不要求配置后端。已连接 GitHub 私有远程仓库，本次团队授权上传初始文档；后续提交、推送与合并按任务授权执行，公开部署另需授权。
