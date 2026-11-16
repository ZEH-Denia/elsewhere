# GitHub 协作入门

仓库：**[ZEH-Denia/elsewhere](https://github.com/ZEH-Denia/elsewhere)**，当前为私有仓库。建立日期：2026-11-16。

## 先获取访问权限

每位组员准备自己的 GitHub 账号，把用户名交给项目负责人。负责人在仓库 Settings → Collaborators 中邀请，组员接受后再访问。当前尚未根据组员名单发送邀请。

只阅读介绍、任务和报告，可以登录后直接在 GitHub 网页打开。手机上也可先查看文档，不必安装开发环境。

## 在自己的电脑获取项目

有 Git 的开发设备，在终端进入自己存放项目的目录，执行：

```sh
git clone https://github.com/ZEH-Denia/elsewhere.git
cd elsewhere
```

私有仓库需要使用已获权限的 GitHub 账号认证。使用 GitHub CLI 的同学可先运行 `gh auth login`，再用 `gh repo clone ZEH-Denia/elsewhere`；也可使用 GitHub Desktop 克隆。

将克隆得到的 `elsewhere` 文件夹作为 Qoder IDE 的项目根目录。已存在的本项目目录直接继续使用，无需在其中再次克隆。

## 每次开始前更新

先确认没有未保存工作和未交接改动，再在仓库目录运行：

```sh
git status
git switch main
git pull --ff-only origin main
```

若有本地修改、切换失败或拉取失败，保留现场，把输出交给负责人或 Codex；不要用强制覆盖或删除文件来“同步”。GitHub 同步发生在提交、推送和拉取时，本机保存文件不会自动出现在其他设备上。

## 现在从哪里看进度？

| 想了解的内容 | 文件 |
| --- | --- |
| 项目介绍与个人可参与的工作 | [团队快速了解](团队快速了解.md) |
| 当前开发任务与验收标准 | [tasks/current.md](../tasks/current.md) |
| 开发方实际完成情况 | [tasks/reports/](../tasks/reports/README.md) |
| Codex 审核与修复要求 | [tasks/reviews/](../tasks/reviews/README.md) |
| 接管基线和状态记录 | [项目现状](PROJECT_STATUS.md) |

初次上传只有项目文档、协作约定、TASK-001 和忽略规则，尚无可启动应用。Qoder 完成工程后，以 README 的真实安装和运行说明为准。

## 后续改动如何汇总？

1. 团队确定当前任务的唯一开发执行人；其他人可以准备剧情和素材、记录体验问题。
2. 执行人在自己的设备用 Qoder 按任务开发，生成执行报告并交 Codex 审核。
3. 团队明确授权同步后，将任务相关改动提交到任务分支（例如 `task-001`），推送后发起 Pull Request（PR，合并申请）；记录审核所依据的提交号。
4. Codex 给出审核意见，执行人处理返修；团队批准后再合并到 `main`。其他组员拉取 `main` 获取已合并结果。

本次“先上 GitHub”授权的是初始文档上传。TASK-001 的本地开发范围、代码审核和发布边界不变；Qoder 不因此自动获得推送或合并授权。

只推送源码、依赖锁文件、文档和必要的验收证据；`node_modules/`、`dist/`、本地环境密钥和缓存已由 `.gitignore` 排除。GitHub 仓库用于协作与备份，网站部署另行安排。
