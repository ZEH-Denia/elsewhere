# Qoder 开发交接入口

> 最新状态：TASK-003 初审 FIX；Qoder 请阅读 tasks/reviews/TASK-003.md 并按 R1 返修，详见当前任务。

> 最新状态：TASK-002 已 PASS 并归档；团队要求准备下一步，TASK-003 已下发至 task-003。Qoder 以 [当前任务](../tasks/current.md)及剧情用稿为准；下文先前任务交接保留为历史。

> 2026-11-17 最新状态：TASK-002 的 R1 已复审 **PASS**，等待团队批准下一任务及开发实现合并；下文原交接和初审内容为历史记录，实时状态见 [项目现状](PROJECT_STATUS.md)。

交接/初审日期：2026-11-17。当前唯一任务：**TASK-002 / IN_PROGRESS（FIX / R1）**。TASK-001 已 PASS 并归档，不重新初始化或返修。

## 直接复制到 Qoder

在 Qoder IDE 打开项目根目录后，发送：

> 请阅读 AGENTS.md、docs/COLLABORATION.md、tasks/current.md 和 tasks/reviews/TASK-002.md。先保留现场，工作区干净时更新 task-002，仅按 R1 修复确认结束通话后首页“开始体验”的焦点恢复；保留取消/Escape 与正常返回行为。按审查复验并追加 tasks/reports/TASK-002.md，保留原证据，自动提交推送 task-002 后停止修改，等待 Codex 复审。不进入 TASK-003，不合并 main，不部署。

## 开工分支与目录

1. 同一台电脑直接使用现有项目目录；其他电脑从 [GitHub](https://github.com/ZEH-Denia/elsewhere) 获取项目后，在 Qoder 打开仓库根目录。
2. `git status --short --branch` 确认现场；已有未交接改动先保留并报告，禁止强制切换、覆盖、删除或回滚。
3. 干净时执行 `git fetch origin`。已有本地分支用 `git switch task-002`；没有则用 `git switch --track origin/task-002`。再执行 `git pull --ff-only origin task-002`。
4. 检查 `git log -1 --oneline` 和 `tasks/current.md`，确认有本轮交接文档，任务编号为 TASK-002。分支缺失、分歧或权限受阻时报告，不改 main，不继续 task-001。
5. 核对实际 Node/npm。现有工程已通过 Node v26.13.0 / npm 11.20.0 的独立检查，也曾由 Qoder 在 Node v24.16.0 / npm 11.13.0 开发；本轮环境不同需报告，不自行改全局配置。

Codex 从本轮 main 交接提交准备 task-002；首次开工不需要重装脚手架。Git 写权限仍由实际账号决定，推送失败应说明，不能声称已同步。

## 本轮交付与证据

- 完整要求见 [当前任务](../tasks/current.md)，剧情逐句使用 [首通来电执行用稿](STORY_OPENING.md)，视觉按 [界面方向](VISUAL_DIRECTION.md) 和任务边界执行。
- 现有 390×844、1440×900 的 TASK-001 截图可作为视觉对照；必要时在修改前自己采集同尺寸截图，不改写旧证据。
- 检查安装、类型、生产构建、剧情逻辑；如有 lint 一并执行。真实浏览器覆盖两条反馈路径、重听、返回、刷新、中途确认/取消和新页面适配。
- 截图与日志仅保存本任务必要片段至 `tasks/reports/assets/TASK-002/`。IDE 截图不可得时及时保存原始会话/工具记录，注明实际来源、日期、截断和脱敏，不事后表演、不上传其他会话或凭证。
- README 可按任务更新实际功能和运行命令；Codex 指挥文档、archive 和 reviews 不由 Qoder 修改。
- 没有能力执行的验证明确标为未验证，不以截图代替原始过程，也不以构建代替交互。

## 完成后交还

写入 `tasks/reports/TASK-002.md`，逐项列出 AC-01～AC-10 的真实结果与证据。检查改动清单后自动提交、推送 task-002 并核对远程；不合并 main，不部署，不进入 TASK-003。

最终交接消息包含：**分支、已推送提交号、执行报告路径、实际预览地址或未启动说明、已知问题和未验证项**。报告不等于审核 PASS；交还后停止修改。

团队之后向 Codex 发送：

> 审核 TASK-002。Qoder 已停止修改，提交号：填写实际已推送提交号；报告：tasks/reports/TASK-002.md。

2026-11-17 初审已完成，结论 FIX；原始开发已完成，当前仅返修 R1，未批准下一任务。
