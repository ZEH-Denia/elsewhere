# 技术方案与边界

当前应用基线为 `task-003@510568b`。运行方法见 [README](../README.md)，验收范围见 [TASK-003 审查](../tasks/reviews/TASK-003.md)。

| 部分 | 当前实现 |
| --- | --- |
| 前端 | React + TypeScript + Vite 单页应用 |
| 页面与样式 | `src/App.tsx` 组装各阶段与页面状态，`src/components/` 保存复用组件，Tailwind CSS 与 `src/index.css` 管理样式 |
| 叙事 | `src/story/opening.ts` 处理首通来电，`src/story/expansion*.ts` 处理身份、职业线路、信件与最终回电 |
| 状态 | React 本地状态记录当前节点、分支、职业来信和解锁进度。重新加载从首页开始 |
| 素材 | 系统字体与本地 SVG。场景资源位于 `public/backgrounds/`，可用 `node scripts/generate-backgrounds.mjs` 重新生成 |
| 交付 | npm 与 `package-lock.json`，Vite 输出静态构建至 `dist/` |

剧情使用稳定的节点和结局 ID。两个二元选择具有完整的四项映射，剧情测试覆盖合法路径、异常引用和重置，并检查扩展线路的来信与解锁。应用使用当前轻量技术栈，暂缓新增路由、全局状态库、大型组件套件、远程素材、后端、登录和追踪。

类型检查、剧情测试与构建使用项目已有 npm 命令。视觉和交互变更须查看桌面生产预览，验证键盘焦点、减少动态效果偏好以及实际的剧情操作。手机版开发和窄屏验收暂缓。
