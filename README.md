# Elsewhere：未接来电

> 2026-11-19：TASK-003 已复审 PASS；PR #3 已合并较早版本，后续调整仍在 task-003，等待团队决定下一任务及合并。

接到来自平行世界自己的电话，通过互动剧情探索另一种人生。

**组员从这里开始：[团队快速了解（约三分钟）](docs/团队快速了解.md)**，了解产品体验、当前进度、团队分工与可参与的工作。

GitHub 仓库：[ZEH-Denia/elsewhere](https://github.com/ZEH-Denia/elsewhere)，当前为公开仓库（2026-11-16 实查）。异地获取项目与更新方式见 [GitHub 协作入门](docs/GITHUB_COLLABORATION.md)。

## 当前状态

2026-11-17：TASK-001 的工程、首页与可返回前言，以及 TASK-002 的视觉和首通来电均已 PASS。TASK-002 的确认退出焦点返修已通过复审，见 [审查报告](tasks/reviews/TASK-002.md)。

当前 **TASK-003 / PASS**：task-003 已完成两次选择与四种结局、真实状态路径校验、定稿文案同步，以及统一暖米无框视觉、全局选项预览、主次行动和桌面一屏优化。四种结局由两次选择共同决定，不含评分或正确选项；后续调整尚未批准合并 main 或发布。

## 复审与交接

完整实现、逐轮修复和真实验证证据见 [TASK-003 执行报告](tasks/reports/TASK-003.md)。Codex 最终复审见 [TASK-003 审查](tasks/reviews/TASK-003.md)，团队决定下一任务。

当前[Qoder 开发交接入口](docs/QODER_START.md)记录任务交接方式；具体范围以 TASK-003 当前任务为准。同一台电脑直接打开现有项目目录，沿用已有工程与已验收实现。

## 文档入口

| 文档 | 用途 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 角色、权限和工作边界 |
| [当前任务](tasks/current.md) | TASK-003 的目标、范围及验收标准 |
| [Qoder 开工交接](docs/QODER_START.md) | 可直接复制的开发指令、分支与交还步骤 |
| [协作协议](docs/COLLABORATION.md) | 交接、执行报告、审查与返修 |
| [GitHub 协作入门](docs/GITHUB_COLLABORATION.md) | 组员访问、下载与同步项目 |
| [产品定义](docs/PRODUCT.md) | MVP 体验与范围 |
| [技术方案](docs/ARCHITECTURE.md) | 技术约束与演进方向 |
| [路线图](docs/ROADMAP.md) | 顺序、里程碑与进入条件 |
| [开发与参赛详细计划](docs/DETAILED_PLAN.md) | 逐日排期、分支剧情、任务门槛、验证与提交安排 |
| [界面美化方向](docs/VISUAL_DIRECTION.md) | 已纳入 TASK-002 的首页、来电和对话视觉方向 |
| [首通来电执行用稿](docs/STORY_OPENING.md) | 首通主线、第一次选择及反馈的固定内容 |
| [分支与结局执行用稿](docs/STORY_BRANCHES.md) | TASK-003 的第二次选择、反馈与四种结局 |
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
npm run test:story
npm run build
npm run preview
```

生产构建输出到 `dist/`（不提交），预览服务默认地址为 `http://127.0.0.1:4173/`。`npm run test:story` 检查两次选择、四种结局映射、分支可达性、重复选择、重置、异常进度与坏剧情图。

当前版本完成第一通来电的两次选择和四种剧情结局；所有界面采用统一的低亮度暖米无框风格，选项在悬停或键盘聚焦时可预览对应场景，16 张场景一次加载，切换时无透明度动画，界面亮度保持恒定。开始体验、进入来电与接听共享桌面主行动位置，减少鼠标移动。桌面短视口会压缩标题、卡片与留白，1366×768 和 1440×900 的全剧情页面均可在一屏内阅读；手机端保留自然滚动。首页、主线、选择和结局使用代码生成的本地“雨夜双城·暖光版”SVG 背景，并随剧情节点切换。可用 `node scripts/generate-backgrounds.mjs` 重新生成 16 张背景。双世界时间线与结尾来信尚未实现，也没有分享、存档或后端功能。不需要 API Key、账号或远程素材，不保存剧情进度；刷新页面会回到首页。

MVP 不要求用户提供 API Key，也不要求配置后端。团队已持续授权每轮改动完成并检查后自动提交、推送：指挥文档同步 main，Qoder 开发与返修同步任务分支。代码合并 main、网站部署与赛事投稿按协作协议另行批准。
