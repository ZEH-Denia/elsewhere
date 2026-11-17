# TASK-003 执行报告：第二次选择与四条结局

日期：2026-11-17（Asia/Shanghai）。执行：Qoder IDE。状态：**开发与本轮验证完成，等待 Codex 审核；不代表 PASS。**

基线为 task-003 的 `ab71c1c`，已确认包含 TASK-002 复审通过的 `2f81fce`。保留首页、前言、来电、七条主线、第一次选择及两条反馈，按 `docs/STORY_BRANCHES.md` 增加旁白衔接、第二次选择、行动反馈、共同末句和四种剧情结局。未进入 TASK-004，未合并 main，未部署。

## 1. 实现范围

- `src/story/opening.ts`：以 `choiceId`、`nextStepId` 分别记录两次选择；第二次选择 ID 为 `next-step`，选项为 `make-space`、`reach-out`。四个 `EndNode` 使用固定结局 ID，并由两次选择确定，不随机结算。
- `src/App.tsx`：显示旁白、另一个你的第二次提问、第二轮反馈、共同末句、两次选择记录及对应结局；结局仅提供“重听这通来电”和“返回首页”。保留原生确认对话框及先关闭模态再恢复首页焦点的 R1 修复。
- `tests/opening.test.mjs`：九项测试覆盖完整四组合、两条路径的二选可达性、不同标题和摘要、继续/跨组选项不能绕过选择、快速重复选择、全部进度重置、异常进度、安全引用及无结束循环。
- `README.md`：如实更新为两次选择和四种剧情结局；时间线、结尾来信、分享和存档仍未实现。
- 未新增依赖、服务、账号、AI、个人数据收集、远程素材或无功能按钮；`package.json` 与锁文件未改。

## 2. 工程检查

实际环境：macOS arm64，Node.js `v24.16.0`，npm `11.13.0`。命令均在本轮最终源码上执行，退出码均为 0。

| 检查 | 实际结果 | 原始输出 |
| --- | --- | --- |
| `npm ci --registry=https://registry.npmjs.org` | added 43 packages；audited 50；0 vulnerabilities | [npm-ci.txt](assets/TASK-003/npm-ci.txt) |
| `npm run typecheck` | `tsc --noEmit` 通过 | [typecheck.txt](assets/TASK-003/typecheck.txt) |
| `npm run test:story` | 9/9 通过，0 failed | [test-story.txt](assets/TASK-003/test-story.txt) |
| `npm run build` | 18 modules；CSS 20.94 kB / gzip 5.68 kB；JS 237.34 kB / gzip 74.22 kB | [build.txt](assets/TASK-003/build.txt) |
| lint | `package.json` 未配置 lint script，因此未声称执行 | [package.json](../../package.json) |
| 环境记录 | Node、npm、arm64 实值 | [environment.txt](assets/TASK-003/environment.txt) |

中间编写测试时曾把节点总数误算为 20，实际为 21；修正测试计数后通过。该错误不涉及剧情实现，最终原始输出以以上文件为准。

## 3. 真实生产浏览器验收

浏览器为 Microsoft Edge `157.0.4341.60` / HeadlessChrome 157，通过 CDP 操作独立临时配置并带 `--disable-extensions`。预览为本轮 `npm run build` 后的 `http://127.0.0.1:4173/`。最终脚本全部断言通过，退出码 0：[browser-run.txt](assets/TASK-003/browser-run.txt)。完整步骤、焦点、文案、布局、控制台与网络记录见 [browser-checks.json](assets/TASK-003/browser-checks.json)，可复跑脚本为 [browser-checks.mjs](assets/TASK-003/browser-checks.mjs)。

### 四种组合

每条路径均从首页实际进入来电、主动接听、走完七条主线，再完成两次选择、对应反馈、共同末句和结局；不是只调用状态机或读取静态数据。

| 第一次 / 第二次 | 第二轮反馈 | 结局 ID / 标题 | 实际结局摘要 | 截图 |
| --- | --- | --- | --- | --- |
| regret / make-space | 不用急着证明什么。先给自己留下一小段时间，也许就够了。 | `regret-make-space` / 把旋律找回来 | 你承认了遗憾，决定先为音乐留出一点时间。另一条路没有消失，它可以从一个小小的练习开始。 | [390 结局](assets/TASK-003/01-regret-make-space-390-ending.png) |
| regret / reach-out | 说出来不一定马上有答案，但你不必一个人想完所有事。 | `regret-reach-out` / 让遗憾被听见 | 你承认了遗憾，也愿意找信任的人聊聊。那些未说出口的愿望，终于有了被听见的机会。 | [390 重听后结局](assets/TASK-003/02-regret-reach-out-390-ending.png) |
| cherish-present / make-space | 不用急着证明什么。先给自己留下一小段时间，也许就够了。 | `cherish-make-space` / 给今天留一首歌 | 你珍惜已有的生活，也为喜欢的事留下位置。安稳与热爱，可以在同一天里慢慢相遇。 | [1440 结局](assets/TASK-003/03-cherish-make-space-1440-ending.png) |
| cherish-present / reach-out | 说出来不一定马上有答案，但你不必一个人想完所有事。 | `cherish-reach-out` / 和身边的人分享 | 你珍惜当下，也愿意把自己的想法说出来。平凡的日子因为彼此理解，多了一点新的可能。 | [320 结局](assets/TASK-003/04-cherish-reach-out-320-ending.png) |

第二次选择实际显示角色“另一个你”和固定问题；旁白显示为“旁白”，没有冒充任一角色台词。完整 JSON 同时记录七句原文、两个选项、反馈和结局，证明两次选择均影响结果。

### 重置、确认和快速操作

| 场景 | 实际结果 |
| --- | --- |
| 结束后重听 | 回到来电页，需再次主动接听，从 opening-01 开始；随后选择 regret / reach-out，得到不同结局 `regret-reach-out` |
| 返回首页 | 清空结局并回到首页，焦点位于“开始体验” |
| 第二次反馈中刷新 | 回到首页，不保留对话或结局 |
| 第二次选择前取消 / Escape | 仍停留在同一第二选择问题，焦点回到“结束通话” |
| 第二次选择后取消 / Escape | 仍停留在原第二轮反馈；继续后仍按原两次选择到达 `regret-make-space`，没有清除或改选 |
| 第二次选择前确认退出 | 对话框关闭并回首页，焦点在“开始体验”；直接 Enter 可进入前言 |
| 第二次选择后确认退出 | 同样清空并聚焦“开始体验”；直接 Enter 可进入前言 |
| 两轮快速双击 | 第一次只进入 regret 对应反馈，第二次只进入 make-space 对应反馈；没有跳过反馈、同时选中或重复结算，最终仅得到 `regret-make-space` |
| 纯键盘确认退出 | Escape 后焦点回“结束通话”；再次打开并确认后，首页“开始体验”为 `:focus-visible=true`，Enter 可立即进入前言 |

### 视口、键盘与播报

| 视口 | 第二次选择 | 结局与操作 |
| --- | --- | --- |
| 390×844 | 文档宽 390，无横向溢出；两个选项均 350×84 | 文档宽 390；重听/返回均 350×52；[第二选择](assets/TASK-003/01-regret-make-space-390-second-choice.png) |
| 1440×900 | 固定问题、两个选项和结束通话可见，无横向溢出；[第二选择](assets/TASK-003/03-cherish-make-space-1440-second-choice.png) | 完整键盘路径到最长摘要之一；重听/返回高 52；[键盘结局](assets/TASK-003/05-keyboard-regret-make-space-1440-ending.png) |
| 320×568 | 内容宽 305、文档高 672，经典滚动条占宽 15；无横向溢出，页面自然滚动；[第二选择](assets/TASK-003/06-longest-320-second-choice.png) | 最长结局文档高 712，按钮可滚动到达，无遮挡；[最长结局](assets/TASK-003/06-longest-320-ending.png) |

所有实测按钮宽高均不小于 44px。纯键盘使用 Tab、Enter、Space 从首页完成 regret / make-space 全路径；第一次和第二次选择标题自动获焦，结局 `#end-title` 获焦且轮廓可见。当前对话与第二轮反馈的 live region 实测为 `aria-live="polite"`，旁白文本为“旁白：……”，第二轮反馈为“另一个你：……”。未将 DOM 观测称为真实读屏测试。

减少动态效果偏好下实测 `matchMedia` 为 true，`.screen-enter` 的 `animation-name: none`、`animation-duration: 0s`，按钮 `transition-duration: 0s`。

### 控制台与网络

最终完整运行记录 34 条请求，唯一 URL 为本地 HTML、构建 JS/CSS 和 favicon；应用外部请求 `[]`，浏览器扩展请求 `[]`。HTTP 4xx/5xx、loadingFailed、页面 exception、console error/warning 均为 `[]`。没有外部接口、字体或素材请求。

## 4. 过程证据

- [qoder-opening-log.json](assets/TASK-003/qoder-opening-log.json)：本任务直接用户指令的原始 JSONL 行号、消息 UUID、时间、基线与环境。
- [qoder-process-log.json](assets/TASK-003/qoder-process-log.json)：从同一会话摘取的本任务关键文件修改和验证工具记录，只含必要路径/命令，不含助手思考、其他会话或凭证。
- Computer Use 曾保存一张 500×500 全黑 IDE 截图，读取确认无效后由本轮执行方移除，未作为证据。上述原始记录是有界替代证据；完整 JSONL 未修改，也未上传。

## 5. 验收逐项结论

| 任务要求 | 本轮执行结论 |
| --- | --- |
| 1. 安装、类型、剧情、构建和 lint | 已通过实际执行的四项命令；lint 未配置，明确不声称运行 |
| 2. 生产浏览器四组合 | 已分别完成，记录两次选择、反馈、结局 ID/标题/摘要与截图 |
| 3. 重听、返回、刷新、确认、取消、Escape、快速选择 | 已按第二选择前后分别验证，结果见上表和 JSON |
| 4. 三视口、键盘、焦点、减少动态 | 已实测 390×844、1440×900、320×568；完成一条纯键盘全路径及键盘退出 |
| 5. 控制台、网络与环境限制 | 已记录真实浏览器、端口、步骤、34 条请求和零异常；不以构建成功冒充体验 |
| 6. 过程证据与报告 | 已保存原始指令、关键修改/验证日志、脚本、JSON 和真实截图；无效黑图未采用 |

## 6. 未验证项与交还

- 未使用实体手机或平板，未运行 VoiceOver 或其他真实读屏软件；本轮仅验证语义、焦点和 polite DOM 状态。
- 未执行原生浏览器 200% 缩放，不沿用 TASK-002 的 DOM 文本放大结果冒充本轮原生缩放。
- 未进行团队主观体验验收，未声称 Codex 审核通过。
- 时间线、结尾来信、分享、存档、后端及发布仍不在本任务实现范围。
- 本轮测试后生产预览保留在 `http://127.0.0.1:4173/`；无扩展的临时浏览器已关闭。

请 Codex 对照 `tasks/current.md` 审核。FIX 沿用 TASK-003；交还后停止修改，不自行进入下一任务。

## 7. 第 1 次修复（R1）

日期：2026-11-17（Asia/Shanghai）。处理 `tasks/reviews/TASK-003.md` 对 `64c6c5e` 的 R1：删除单个结局后 `validateOpeningStory` 漏报。状态：**R1 修复与本轮复验完成，等待 Codex 复审；不代表 PASS。**

### 修复内容

- `src/story/opening.ts`：按四个实际选择组合分别检查 `getEndingId` 的目标是否存在、是否为 `end`，以及 `choiceId` / `nextStepId` 是否与组合一致。每个组合从 `opening-01` 开始遍历，只沿该组合的首次与第二次选项前进，`call-farewell` 只连接到该组合的确定结局；目标缺失、类型或映射错误、单分支无法到达正确结束均返回带组合与结局 ID 的具体错误。通用反向可达性检查也改用同一实际结局映射，不再引用模块级 `endings` 列表代替传入图。
- `tests/opening.test.mjs`：保留原九项测试，新增四个反例，分别删除 `regret-make-space`、破坏该结局的首次选择映射、把映射目标改为非结局节点、令 `regret-feedback-02` 回到 `regret-feedback-01` 形成单分支循环。测试同时确认未受影响的组合不被误报。
- 原有“异常节点与不一致选择安全恢复”测试继续通过，包括未知节点回到开场、缺失第二次选择返回 `next-step`、不一致结局按两次有效选择确定，不随机选择。未修改 `src/App.tsx`、剧情文案、视觉、依赖或配置。

### 修复前后对照与工程复验

先只添加反例，在原校验实现上实际运行 `npm run test:story`：退出码 1，原九项通过、新四项全部失败，复现 R1 及相邻校验缺口；原始输出见 [r1-test-story-before.txt](assets/TASK-003/r1-test-story-before.txt)。随后修改校验并复跑，最终输出如下。

实际环境：macOS arm64，Node.js `v24.16.0`，npm `11.13.0`，见 [r1-environment.txt](assets/TASK-003/r1-environment.txt)。命令均在 `/Users/zeh/Documents/elsewhere` 执行。

| 检查 | 最终结果 | 原始输出 |
| --- | --- | --- |
| `npm run typecheck` | 退出码 0，`tsc --noEmit` 通过 | [r1-typecheck.txt](assets/TASK-003/r1-typecheck.txt) |
| `npm run test:story` | 退出码 0，13/13 通过，0 failed | [r1-test-story-after.txt](assets/TASK-003/r1-test-story-after.txt) |
| `npm run build` | 退出码 0；18 modules；CSS 20.94 kB / gzip 5.68 kB；JS 237.34 kB / gzip 74.22 kB | [r1-build.txt](assets/TASK-003/r1-build.txt) |
| lint | `package.json` 仍未配置 lint script，未声称执行 | [package.json](../../package.json) |

R1 只修改开发期剧情图校验和测试，不改变界面、状态机或浏览器运行路径，因此本轮未把静态检查写成新的浏览器体验验收，也未覆盖原四组合截图、JSON 和过程证据。首次报告中的真实生产浏览器结果继续保留；本轮构建后仅核对现有 `http://127.0.0.1:4173/` 返回 HTTP 200，未将其表述为重新完成浏览器验收。

实体设备、真实读屏、原生浏览器 200% 缩放及团队主观体验仍未验证。未新增 npm 依赖，未合并 main、未部署、未进入 TASK-004。执行分支为 `task-003`；本轮提交号与远程核对结果在最终交接中提供。
