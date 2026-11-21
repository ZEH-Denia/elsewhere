# GitHub 协作入门

项目仓库为公开仓库。浏览与克隆可匿名进行，写入权限由团队授予。 [ZEH-Denia/elsewhere](https://github.com/ZEH-Denia/elsewhere)

## 获取和更新

在另一台电脑首次获取项目时运行以下命令。之后的运行方式见 [同事接手指南](同事接手指南.md)。

```sh
git clone https://github.com/ZEH-Denia/elsewhere.git
cd elsewhere
git switch task-003
```

已有仓库先检查 `git status --short --branch`。需要更新现有分支时，用 `git fetch origin` 获取远程状态，在对应分支运行 `git pull --ff-only`。存在本地修改、远程分歧或权限错误时保留现场，由负责人处理。

## 分支和交付

- `main` 保存权威项目说明、当前任务和审查记录。
- `task-003` 保存最新应用实现及可供本地阅读的文档副本。
- Codex 按 [协作协议](COLLABORATION.md) 检查、提交和推送，完成后比对远程提交号。应用合并、发布及访问权限变更由团队批准。
- 提交范围为项目源码、锁文件、文档和相关证据。本机剧本原稿、站点绑定文件、依赖及构建产物留在本地。
