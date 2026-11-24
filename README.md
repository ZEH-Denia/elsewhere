# Elsewhere：未接来电

接到来自平行世界自己的电话，通过互动剧情探索另一种人生。

第一通来电有两次选择和四种结局。随后可选择三种身份，进入医生、教师、设计师和创业者四条职业线路。职业线路共 16 个结局和对应来信。读完任一封职业来信即可解锁最终回电。

TASK-003 的 28 项桌面视觉改进已通过验收并合入 `main`，验收基线为 `510568b`。Qoder Sites 已公开发布 `7991016`，包含雨夜插画和快速点击对白修复。手机版开发和窄屏验收暂缓。 [公网体验](https://elsewhere-missed-call-gfiycnjh8f0.qoder.zone/) · [桌面验收](tasks/reviews/TASK-003.md)

## 本地运行

工程使用 React、TypeScript、Vite 和 Tailwind CSS。需要 Git、npm，以及 Node.js 20.19.0 或更新的 20.x，或 Node.js 22.12.0 及以上。已有克隆可在工作树干净时从仓库根目录执行以下命令。

```sh
git fetch origin
git switch main
git pull --ff-only origin main
npm ci
npm run dev
```

打开终端显示的地址，开发服务默认使用 `http://127.0.0.1:5173/`。生产预览先运行构建，默认地址为 `http://127.0.0.1:4173/`。

```sh
npm run typecheck
npm run test:story
npm run build
npm run preview
```

剧情数据与插画均在本地。刷新页面会回到首页，体验无需账号或 API Key。

## 文档入口

| 要找什么 | 从这里开始 |
| --- | --- |
| 项目作用与完整体验 | [项目介绍](docs/项目介绍.md) |
| 团队快速入门与分工 | [团队快速了解](docs/团队快速了解.md) |
| 获取项目与更新本地副本 | [同事接手指南](docs/同事接手指南.md) |
| 当前范围、进度和验收 | [项目现状](docs/PROJECT_STATUS.md) · [当前任务](tasks/current.md) · [审查记录](tasks/reviews/README.md) |
| 开发与 Git 同步约定 | [协作协议](docs/COLLABORATION.md) · [GitHub 协作入门](docs/GITHUB_COLLABORATION.md) |
| 从本项目复用开发方法 | [互动叙事网页开发手册](docs/INTERACTIVE_STORY_PLAYBOOK.md) |
| 产品、技术和候选任务 | [产品定义](docs/PRODUCT.md) · [技术方案](docs/ARCHITECTURE.md) · [路线图](docs/ROADMAP.md) |
| 既有执行记录 | [历史报告](tasks/reports/README.md) · [原始交接](CODEX_HANDOFF.md) |

Codex 负责实现、验证和记录。`main` 包含当前应用、项目说明和验收记录。
