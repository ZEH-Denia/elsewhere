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

## 8. 第 2 次修复（R1 复审）与定稿文案同步

日期：2026-11-18（Asia/Shanghai）。处理 Codex 对 `2fab931` 的 R1 复审，并同步用户提供的《Elsewhere-润色与检查.xlsx》定稿。状态：**修复、逐字同步与本轮复验完成，等待 Codex 复审；不代表 PASS。**

### 真实状态路径与异常图

- `src/story/opening.ts`：四个组合分别从初始 `OpeningProgress` 开始，以 `nodeId / choiceId / nextStepId` 为遍历状态，不再只按节点 ID 判断可达。第一次选择写入对应 `choiceId`，第二次选择必须先具有匹配的首次选择；反馈按传入图的选项归属和选择状态推进；`call-farewell` 必须具有两次有效选择，结局必须同时匹配 ID 与两次选择。
- 对话节点按真实状态规范化清空两次选择，共同衔接保留首次选择并清空第二次选择。校验使用传入图反查反馈归属，不依赖正常源码的 TypeScript 类型替代异常图检查。
- `tests/opening.test.mjs`：保留原十三项测试，新增“opening-07 跳过第一次选择”和“opening-closing 跳过第二次选择”两个坏图反例；二者均要求四个组合分别报告无法到达匹配结局。正常四组合、快速重复选择、异常进度恢复及此前四类坏图继续通过。

### Excel 定稿逐字同步

- 只读来源：`/Users/zeh/Downloads/Elsewhere-润色与检查.xlsx`，读取 `逻辑问题清单`、`润色对照`、`结局路径` 三张表；最终复查仍为 revision `0`、version `cdf529c34501393c746b1e69271d47e6ccb55a6d4ed0974fc1a0eb72030b616e`，未写入原 Excel。
- `润色对照` 共 30 项，其中 28 项更新，`opening-02` 与第二次选择问题 2 项原文不变。前言、声明、来电说明、七句主线、首次选择、两轮反馈、共同衔接、尾声和四个结局摘要均按“润色后”定稿同步；未采纳清单中未进入定稿的标题、铺垫或动画建议。
- 两条内心独白以结构化 `speaker: '你（内心）'` 保存，正文只保留角色后的定稿台词，界面与 polite 文本均完整显示“你（内心）：……”，没有重复角色前缀。
- 本地 [Elsewhere-未接来电-剧本.docx](../../Elsewhere-未接来电-剧本.docx) 已同步相同定稿并保存为 revision `5`、version `099c0c6b40b8e0ebef120cc8c61e87b9a37dcab1068c28fc6ac261afff01974f`；结构检查无问题，保存后完整回读 77 个块一致。该 DOCX 是用户要求的本地交付物，保持未跟踪，不纳入本任务源码提交。
- 未新增依赖、配置、服务或界面功能，未修改 Codex 所有的任务、审查和文档。

### 工程复验

实际环境：macOS arm64，Node.js `v26.13.0`，npm `11.20.0`，见 [r2-environment.txt](assets/TASK-003/r2-environment.txt)。命令均在 `/Users/zeh/Documents/elsewhere` 执行，退出码均为 0。

| 检查 | 最终结果 | 原始输出 |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` 通过 | [r2-typecheck.txt](assets/TASK-003/r2-typecheck.txt) |
| `npm run test:story` | 15/15 通过，0 failed | [r2-test-story.txt](assets/TASK-003/r2-test-story.txt) |
| `npm run build` | 18 modules；CSS 20.94 kB / gzip 5.68 kB；JS 237.38 kB / gzip 74.27 kB | [r2-build.txt](assets/TASK-003/r2-build.txt) |
| lint | `package.json` 未配置 lint script，未声称执行 | [package.json](../../package.json) |

### 定稿生产浏览器回归

Microsoft Edge `157.0.4341.60` / HeadlessChrome 157，独立临时配置及 `--disable-extensions`，预览为上述最终构建的 `http://127.0.0.1:4173/`。新脚本 [r2-browser-checks.mjs](assets/TASK-003/r2-browser-checks.mjs) 全部断言通过，退出码 0；摘要见 [r2-browser-run.txt](assets/TASK-003/r2-browser-run.txt)，完整原文、状态、焦点、布局、控制台与网络记录见 [r2-browser-checks.json](assets/TASK-003/r2-browser-checks.json)。

| 组合 | 浏览器逐字核对 | 结局截图 |
| --- | --- | --- |
| regret / make-space | 前言、声明、来电说明、七句主线、regret 两句反馈与内心独白、共同衔接、第二次反馈、共同尾声；`regret-make-space` 新摘要一致 | [390×844](assets/TASK-003/r2-01-regret-make-space-390-ending.png) |
| regret / reach-out | 重听后重新接听并改选；`regret-reach-out` 新摘要一致 | [390×844](assets/TASK-003/r2-02-regret-reach-out-390-ending.png) |
| cherish-present / make-space | cherish 两句反馈与内心独白、共同衔接、第二次反馈、共同尾声；`cherish-make-space` 新摘要一致 | [1440×900](assets/TASK-003/r2-03-cherish-make-space-1440-ending.png) |
| cherish-present / reach-out | cherish 路径与 reach-out 反馈；`cherish-reach-out` 新摘要一致 | [320×568](assets/TASK-003/r2-04-cherish-reach-out-320-ending.png) |

第二次选择前、后分别复测取消、Escape 和确认退出；重听、返回首页、刷新、两轮快速双击均保持既有行为。纯键盘完成一条四阶段路径及确认退出，选择标题和结局焦点正确。390×844、1440×900、320×568 的选项、最长新结局和按钮均无横向溢出或遮挡，矮屏自然滚动；另保存 [320×568 最长结局](assets/TASK-003/r2-06-longest-320-ending.png)。减少动态效果实测为 `animation-name: none`、`transition-duration: 0s`，当前句与反馈保持 polite。

本轮完整运行共 35 次请求，仅本地 HTML、构建 JS/CSS 与 favicon；应用外部请求、浏览器扩展请求、HTTP/加载失败、页面异常、console error/warning 均为 `[]`。上述截图均为本轮新文案，未覆盖或复用此前截图充当新证据。

实体设备、真实读屏、原生浏览器 200% 缩放及团队主观体验仍未验证；DOCX 已回读结构与实际文本，未声称完成页面排版目视检查。测试结束后临时浏览器和生产预览均停止，不保留需用户手动清理的服务。未合并 main、未部署、未进入 TASK-004。

## 9. 团队直接授权的场景背景先行

日期：2026-11-18（Asia/Shanghai）。用户在确认“雨夜双城”示例后明确要求“以后的图片都要这种风格”，随后直接授权“不用等 Codex 审核，先把背景图改了”。本轮仅实施背景资源与背景接入，不代表 Codex 已对 TASK-003 给出 PASS。

### 改动范围

- `scripts/generate-backgrounds.mjs`：用 Node 和 SVG 图元生成 16 张本地背景，无图片服务、远程素材或新增依赖。资源合计约 407.1 KiB，输出到 `public/backgrounds/`。
- 场景包括首页、来电、开场、工程、音乐、首次选择、regret、cherish、第二次选择、make-space、reach-out、尾声和四种结局。延续深蓝雨夜、两扇亮窗、暖色工程书桌、紫色排练室与青色来电信号；尾声和结局加入微亮天色。
- `src/components/SceneBackground.tsx` 与 `src/App.tsx`：按 `view + node.id` 映射场景，主线 03/05 聚焦音乐、04/06 聚焦工程；反馈、第二次选择、尾声和四个结局均有独立背景。
- `src/index.css`：背景全屏 cover，增加定向暗色遮罩保障文字对比，场景变化采用 560ms 淡入；减少动态效果时动画为 none。未修改既有布局、定稿文案、剧情状态机、选项、焦点或确认对话框。
- `README.md`：补充本地场景背景及重新生成命令。

### 最终验证

Node.js `v26.13.0`、npm `11.20.0` 下，`npm run typecheck`、`npm run test:story` 和 `npm run build` 均在最终源码上退出 0；15/15 剧情测试通过。构建为 19 modules，CSS 24.94 kB / gzip 6.34 kB，JS 238.47 kB / gzip 74.55 kB。原始输出见 [visual-typecheck.txt](assets/TASK-003/visual-typecheck.txt)、[visual-test-story.txt](assets/TASK-003/visual-test-story.txt)、[visual-build.txt](assets/TASK-003/visual-build.txt)。

Microsoft Edge 157 独立无扩展配置访问最终生产预览 `http://127.0.0.1:4173/`。扩展后的 [visual-browser-checks.mjs](assets/TASK-003/visual-browser-checks.mjs) 除保留上一轮全部文案与交互断言外，还逐节点检查背景 URL、`complete` 和 `naturalWidth > 0`；16 张背景均被实际加载，四组合全部通过，[运行摘要](assets/TASK-003/visual-browser-run.txt)与[完整 JSON](assets/TASK-003/visual-browser-checks.json)已保存。

已目视检查 [1440 首页](assets/TASK-003/visual-00-home-1440.png)、[390 第二次选择](assets/TASK-003/visual-01-regret-make-space-390-second-choice.png)、[1440 结局](assets/TASK-003/visual-03-cherish-make-space-1440-ending.png)和 [320 最长结局](assets/TASK-003/visual-06-longest-320-ending.png)：背景可见，中文对白与操作保持清晰，无横向溢出或按钮遮挡。三视口、完整键盘路径、重听、刷新、取消/Escape、确认退出和快速双击继续通过；减少动态效果下场景动画为 `none`。

完整回归记录 142 次请求，唯一资源为本地 HTML、JS、CSS、favicon 和 16 张 SVG；外部请求、加载失败、页面异常及 console error/warning 均为 `[]`。请求总数包含反复导航与重载，16 张 SVG 是唯一背景资源清单，不将其误写为 142 个不同资源。

实体设备、真实读屏和原生 200% 缩放仍未验证。临时无头浏览器已停止；生产预览保留供用户查看。未合并 main、未部署。

## 10. 温馨暖光风格调整

日期：2026-11-18（Asia/Shanghai）。用户查看冷色场景版本后提出“我要更温馨的风格”。本轮保留双窗构图、16 个场景映射和全部剧情交互，仅调整视觉色彩、光线与遮罩。

- `scripts/generate-backgrounds.mjs` 与 `public/backgrounds/`：冷蓝夜空改为暖棕与低饱和杏色，工程房间采用木色和暖黄台灯，排练室采用杏粉与柔桃色灯光；尾声增加暖色天光，regret 的冷蓝叠加改为低饱和灰粉。重新生成全部 16 张本地 SVG，未增加依赖或远程资源。
- `src/index.css`：主题 token 改为暖夜色、米白正文、暖黄强调色和柔和桃色辅助色；主按钮、焦点、来电卡片和选择状态同步偏暖。背景显示透明度由 0.82 调至 0.9，遮罩改为暖棕并适度降低中间区域暗度，保持对白可读。
- 未修改布局、中文定稿、剧情状态机、节点映射、键盘、焦点或确认交互。`README.md` 更新为“雨夜双城·暖光版”。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；构建为 19 modules，CSS 24.93 kB / gzip 6.33 kB，JS 238.47 kB / gzip 74.55 kB。原始输出见 [warm-typecheck.txt](assets/TASK-003/warm-typecheck.txt)、[warm-test-story.txt](assets/TASK-003/warm-test-story.txt)、[warm-build.txt](assets/TASK-003/warm-build.txt)。

使用独立无扩展 Microsoft Edge 157 对最终生产构建再次运行全剧情场景回归：[warm-browser-checks.mjs](assets/TASK-003/warm-browser-checks.mjs)、[运行摘要](assets/TASK-003/warm-browser-run.txt)、[完整 JSON](assets/TASK-003/warm-browser-checks.json)。16 张背景加载及逐节点映射断言、四组合、三视口、键盘、重听、刷新、退出和减少动态效果均通过；142 次请求仍只有本地应用资源，外部请求、加载失败和控制台异常均为 `[]`。

已目视检查 [1440 暖光首页](assets/TASK-003/warm-00-home-1440.png)、[390 第二次选择](assets/TASK-003/warm-01-regret-make-space-390-second-choice.png)与 [1440 暖光结局](assets/TASK-003/warm-03-cherish-make-space-1440-ending.png)：暖木色和杏粉灯光明确，文字和按钮对比清晰，无横向溢出或遮挡。实体设备、真实读屏和原生 200% 缩放仍未验证；生产预览保留供用户查看，未合并 main、未部署。

## 11. 内容优先的交互界面

日期：2026-11-18（Asia/Shanghai）。用户要求“优化交互界面，让使用者的注意力放在内容而不是交互按钮上”。本轮只调整内容层级和辅助控件视觉，不改变操作步骤。

- `src/App.tsx`：仅为主线与反馈的两处“继续”增加 `dialogue-continue` 样式类，事件处理和推进逻辑不变。
- `src/index.css`：继续按钮改为右对齐的低强调文本控件，透明背景、细线箭头；结束通话取消实心底色和粗边框；结局的重听/返回改为一致的轻量描边按钮。开始、接听和剧情选项仍保留必要引导。
- 对白最大字号由 30px 提升至 32px，增加行长约束与 `text-wrap: balance`；对白卡片背景、左边线和底部间距更克制，结局摘要继续占据主要视觉区域。
- 辅助按钮保留可见键盘焦点和至少 44px 触控目标。初次严格浏览器断言发现 44px 在亚像素计算下出现 `43.99999px`，最终将继续和结束通话设为 46px 后复验通过；[初次失败摘要](assets/TASK-003/content-browser-run-initial.txt)保留，未将失败轮次写成成功。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；构建为 19 modules，CSS 26.16 kB / gzip 6.53 kB，JS 238.50 kB / gzip 74.55 kB。日志见 [content-typecheck.txt](assets/TASK-003/content-typecheck.txt)、[content-test-story.txt](assets/TASK-003/content-test-story.txt)、[content-build.txt](assets/TASK-003/content-build.txt)。

独立无扩展 Microsoft Edge 157 再次完成最终生产构建的四组合、16 场景、三视口、完整键盘、重听、刷新、退出、快速双击和减少动态效果回归，全部断言通过：[运行摘要](assets/TASK-003/content-browser-run.txt)、[完整 JSON](assets/TASK-003/content-browser-checks.json)、[可复跑脚本](assets/TASK-003/content-browser-checks.mjs)。153 次请求仅包含本地应用资源，外部请求、加载失败、页面异常及 console error/warning 均为 `[]`。

已目视检查 [390 对白](assets/TASK-003/content-01-regret-make-space-390-dialogue.png)、[1440 对白](assets/TASK-003/content-03-cherish-make-space-1440-dialogue.png)与 [1440 结局](assets/TASK-003/content-03-cherish-make-space-1440-ending.png)：对白和摘要最先进入视线，辅助按钮位于边缘且不再以大面积实色抢注意；文字无遮挡，按钮仍可辨认和操作。实体设备、真实读屏和原生 200% 缩放仍未验证；生产预览保留供用户查看，未合并 main、未部署。

## 12. Apple 风格实例应用

日期：2026-11-18（Asia/Shanghai）。用户先查看独立的 Apple 设计风格示例，再要求“按照这个做”。本轮将示例的设计语言应用到现有产品，而不是复制 Apple 品牌素材或增加营销页面。

- `src/index.css`：主题改为浅暖白背景、深色正文与低饱和陶土色行动按钮；首页和来电改为居中大标题、短文案和纵向产品卡片，前言与结局使用更大的标题层级和留白。
- 剧情页改为 32px 圆角浅色阅读面板，对白和结局卡片使用轻边框与柔和阴影；继续、结束通话、重听和返回保持上一轮的低强调样式。主按钮、键盘焦点、对话框及选择态同步适配浅色主题。
- 16 张代码生成场景及节点映射全部保留，背景退为圆角浅色场景底色，不再以深色全屏画面争夺内容注意力。没有新增图片、依赖、外部字体或 Apple 品牌资源。
- 未修改中文定稿、剧情状态机、选项、焦点恢复或操作步骤；本轮业务改动仅限 `src/index.css`，`README.md` 同步设计状态。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；构建为 19 modules，CSS 26.33 kB / gzip 6.51 kB，JS 238.50 kB / gzip 74.55 kB。日志见 [apple-typecheck.txt](assets/TASK-003/apple-typecheck.txt)、[apple-test-story.txt](assets/TASK-003/apple-test-story.txt)、[apple-build.txt](assets/TASK-003/apple-build.txt)。

独立无扩展 Microsoft Edge 157 对最终生产构建完成四组合、16 场景、首页/前言/来电布局、三视口、键盘、重听、刷新、退出、快速双击与减少动态效果回归，全部断言通过：[运行摘要](assets/TASK-003/apple-browser-run.txt)、[完整 JSON](assets/TASK-003/apple-browser-checks.json)、[可复跑脚本](assets/TASK-003/apple-browser-checks.mjs)。最终 152 次请求仅包含本地应用资源，外部请求、加载失败、页面异常及 console error/warning 均为 `[]`。

已目视检查 [1440 首页](assets/TASK-003/apple-00-home-1440.png)、[1440 对白](assets/TASK-003/apple-03-cherish-make-space-1440-dialogue.png)、[390 选择与首页](assets/TASK-003/apple-01-regret-make-space-390-home.png)、[320 首页](assets/TASK-003/apple-04-cherish-reach-out-320-home.png)及 [1440 结局](assets/TASK-003/apple-03-cherish-make-space-1440-ending.png)：浅色留白、大标题和圆角卡片一致，文字清晰，窄屏自然滚动，无横向溢出或操作遮挡。未执行自动化 WCAG 对比度评分，不将目视结果写成完整无障碍认证；实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 13. 暖米亮度与背景清晰度平衡

日期：2026-11-18（Asia/Shanghai）。用户反馈“背景图看不清，白色界面太亮”。本轮保留 Apple 风格排版和内容优先交互，只调整表面亮度与背景呈现。

- 页面与卡片由纯白/近白改为低亮度暖米色，正文进一步保持深棕黑，边框和次要文字同步加深，减少刺眼感。
- 场景容器由 20px 改为 12px 内边距并保留圆角，图片不透明度最终由 0.24 提升至 0.72；阅读区遮罩由强白色覆盖调整为较轻暖米遮罩，使窗户、书桌、吉他和排练室可辨认。
- 对白与结局仍使用独立浅色阅读表面，未把提高背景清晰度变成文字压图。16 张场景、节点切换、按钮层级和交互逻辑均未改变。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 26.38 kB / gzip 6.54 kB，JS 238.50 kB / gzip 74.55 kB。日志见 [balanced-typecheck.txt](assets/TASK-003/balanced-typecheck.txt)、[balanced-test-story.txt](assets/TASK-003/balanced-test-story.txt)、[balanced-build.txt](assets/TASK-003/balanced-build.txt)。

独立 Edge 生产浏览器再次完成全部场景、四组合、三视口、键盘、重置与减少动态效果回归，最终 152 次请求仅含本地资源，外部请求、加载失败和控制台异常均为 `[]`；详见 [运行摘要](assets/TASK-003/balanced-browser-run.txt)与[完整 JSON](assets/TASK-003/balanced-browser-checks.json)。

已目视检查 [1440 暖米首页](assets/TASK-003/balanced-00-home-1440.png)、[1440 对白](assets/TASK-003/balanced-03-cherish-make-space-1440-dialogue.png)与 [390 首页](assets/TASK-003/balanced-01-regret-make-space-390-home.png)：背景场景清晰，界面亮度柔和，文字和操作无遮挡。未执行自动化 WCAG 对比度评分；实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 14. 无框对白与全局选项预览

日期：2026-11-18（Asia/Shanghai）。用户认为对白白色框突兀，希望文字融入背景，并让选项与整个界面产生交互。本轮同时调整视觉层级与预览行为，不改变正式选择和剧情推进规则。

- `src/index.css`：移除剧情页白色面板、对白卡片背景与边框，改为局部径向柔光和同色文字阴影；桌面与手机均使用无框排版。选项改为半透明、轻模糊的背景层，hover 与 `:focus-visible` 具有一致反馈。
- `src/App.tsx`：新增 `previewScene`，将 regret、cherish-present、make-space、reach-out 映射到已有场景。鼠标移入选项或键盘聚焦时仅预览对应背景，移出/失焦恢复；节点变化时清空预览，只有点击、Enter 或 Space 才真正调用原 `chooseOpening`。
- `src/components/SceneBackground.tsx`：增加预览状态，整个场景在预览时轻微放大并提高饱和度；减少动态效果仍禁用动画与过渡。没有新增依赖、远程资源或额外按钮。
- 结局映射、两次选择、确认退出、重听与焦点恢复保持原逻辑；README 同步无框对白和场景预览能力。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 26.69 kB / gzip 6.63 kB，JS 238.94 kB / gzip 74.69 kB。日志见 [immersive-typecheck.txt](assets/TASK-003/immersive-typecheck.txt)、[immersive-test-story.txt](assets/TASK-003/immersive-test-story.txt)、[immersive-build.txt](assets/TASK-003/immersive-build.txt)。

独立 Edge 生产浏览器除完整四组合和原有回归外，新增验证：首次与第二次选项在鼠标移入时进入对应场景、移出后恢复选择页；纯键盘 Tab 聚焦 regret 与 make-space 时也出现相同预览，Enter/Space 后才推进。全部断言通过，见 [运行摘要](assets/TASK-003/immersive-browser-run.txt)、[完整 JSON](assets/TASK-003/immersive-browser-checks.json)和[可复跑脚本](assets/TASK-003/immersive-browser-checks.mjs)。166 次请求仅包含本地资源，外部请求、加载失败、页面异常及 console error/warning 均为 `[]`。

已目视检查 [1440 无框对白](assets/TASK-003/immersive-03-cherish-make-space-1440-dialogue.png)、[390 无框对白](assets/TASK-003/immersive-01-regret-make-space-390-dialogue.png)、[regret 全局预览](assets/TASK-003/immersive-01-regret-first-preview.png)和 [make-space 全局预览](assets/TASK-003/immersive-01-make-space-preview.png)：文字融入场景且清晰，选项不再局限于孤立按钮，整体画面会回应选择。未执行自动化 WCAG 对比度评分；实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 15. 平稳切换与全界面统一

日期：2026-11-18（Asia/Shanghai）。用户反馈“太闪了，而且所有界面都尽量维持这个风格”。本轮降低动态刺激，并把暖米无框风格扩展到首页、来电与结局。

- `src/components/SceneBackground.tsx`：改为保留 previous/current 两层本地 SVG 的 220ms 交叉淡化，旧画面不会在新画面出现前消失；不再从空白淡入。减少动态效果仍直接呈现最终画面。
- `src/index.css`：移除预览缩放、饱和度跳变、页面进入动画、按钮和选项的位移动效，仅保留必要颜色变化与短交叉淡化。预览功能本身保留，但实测 `transform: none`。
- 首页与来电的 CallCard 改为暖米半透明、轻模糊的无框表面，移除白色卡片、强阴影和扫光；前言补充同色文字柔光。
- 结局摘要移除独立白框、边框和阴影，采用与主线一致的局部柔光和无框排版；重听/返回继续低强调。确认退出对话框作为功能性模态保留独立阅读表面。
- 两次选择、鼠标/键盘场景预览、结局映射和所有操作步骤未改变。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 26.57 kB / gzip 6.49 kB，JS 239.31 kB / gzip 74.80 kB。日志见 [calm-typecheck.txt](assets/TASK-003/calm-typecheck.txt)、[calm-test-story.txt](assets/TASK-003/calm-test-story.txt)、[calm-build.txt](assets/TASK-003/calm-build.txt)。

独立 Edge 生产浏览器等待 previous 层退出后再核对场景，避免把过渡旧帧写成最终画面；四组合、两轮鼠标预览与恢复、键盘预览、三视口、完整键盘、重置和减少动态效果全部通过。最终 162 次请求仅包含本地资源，外部请求、加载失败和控制台异常均为 `[]`，见 [运行摘要](assets/TASK-003/calm-browser-run.txt)、[完整 JSON](assets/TASK-003/calm-browser-checks.json)与[可复跑脚本](assets/TASK-003/calm-browser-checks.mjs)。

已目视检查 [1440 首页](assets/TASK-003/calm-00-home-1440.png)、[1440 对白](assets/TASK-003/calm-03-cherish-make-space-1440-dialogue.png)、[1440 结局](assets/TASK-003/calm-03-cherish-make-space-1440-ending.png)和 [选项预览](assets/TASK-003/calm-01-regret-first-preview.png)：所有界面风格一致，没有突兀白框或放大跳亮，文字保持清晰。未执行自动化 WCAG 对比度评分；实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 16. 桌面一屏阅读布局

日期：2026-11-18（Asia/Shanghai）。用户希望在浏览器中无需上下滑动即可阅读整个界面。本轮针对桌面短视口压缩尺寸，手机端仍保留自然滚动。

- `src/index.css` 新增 `min-width: 900px` 且 `max-height: 900px` 的桌面布局：页眉/页脚分别收紧至 64/44px，主区域上下留白改为 20px。
- 首页标题、介绍、行动区间距和来电卡片按比例压缩；电话符号由 104px 调整为 72px，卡片内边距、角色信息和世界标签同步收紧，保留全部文字与操作。
- 前言、来电、对白、第二次选择和结局分别调整标题字号、卡片最小高度、选项高度与上下间距，不改变字体可读性、44px 触控目标或暖米无框风格。
- 手机和平板既有媒体规则不变，不通过隐藏内容、裁剪文字或禁用滚动来制造“一屏”。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 28.03 kB / gzip 6.74 kB，JS 239.31 kB / gzip 74.80 kB。日志见 [fit-typecheck.txt](assets/TASK-003/fit-typecheck.txt)、[fit-test-story.txt](assets/TASK-003/fit-test-story.txt)、[fit-build.txt](assets/TASK-003/fit-build.txt)。

[fit-browser-checks.mjs](assets/TASK-003/fit-browser-checks.mjs) 在每次读取页面状态时增加桌面 `scrollHeight <= innerHeight` 断言，覆盖首页、前言、来电、每一句主线、两轮反馈、两次选择、尾声和四种结局，而非只检查首页。两种独立完整回归均通过：

| 桌面视口 | 结果 | 原始摘要 / JSON |
| --- | --- | --- |
| 1366×768 | 四组合及全部桌面节点均无需纵向滚动；手机自然滚动保留 | [摘要](assets/TASK-003/fit-browser-run-1366.txt) / [JSON](assets/TASK-003/fit-browser-checks-1366.json) |
| 1440×900 | 同样全部通过 | [摘要](assets/TASK-003/fit-browser-run-1440.txt) / [JSON](assets/TASK-003/fit-browser-checks-1440.json) |

两轮分别记录 156/158 次本地请求，外部请求、加载失败、页面异常及 console error/warning 均为 `[]`。已目视检查 [1366 首页](assets/TASK-003/fit-00-home-1366.png)、[1366 对白](assets/TASK-003/fit-03-cherish-make-space-1366-dialogue.png)和 [1366 结局](assets/TASK-003/fit-03-cherish-make-space-1366-ending.png)：完整内容在一屏内可见，文字无裁切或遮挡。未验证所有可能桌面高度、实体设备、真实读屏和原生 200% 缩放；生产预览保留供用户查看，未合并 main、未部署。

## 17. 开始页与剧情页完全统一

日期：2026-11-19（Asia/Shanghai）。用户指出开始页残留的白色卡片不好看，且与后续界面不统一。本轮移除最后一处面板式视觉，不改交互。

- `src/index.css` 的 `.call-card` 取消边框、圆角、背景、模糊和阴影，改为透明无框的电话身份区域，并使用与对白相同的局部文字柔光。
- “PARALLEL CALL / 001”改为居中轻量标记；“现实 · 工程 / 平行 · 音乐”取消独立标签框、边框与底色，直接融入场景。
- 同步收紧桌面和手机卡片内边距，保留电话符号、身份、世界标签及所有文字。开始页、来电、主线、选择和结局现在使用同一套暖米无框视觉语言。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 27.82 kB / gzip 6.70 kB，JS 239.31 kB / gzip 74.80 kB。日志见 [unified-typecheck.txt](assets/TASK-003/unified-typecheck.txt)、[unified-test-story.txt](assets/TASK-003/unified-test-story.txt)、[unified-build.txt](assets/TASK-003/unified-build.txt)。

独立 Edge 在 1366×768 下再次完成全剧情、一屏高度、两轮场景预览、完整键盘及手机布局回归，全部通过；159 次请求仅包含本地资源，外部请求、加载失败和控制台异常均为 `[]`，见 [运行摘要](assets/TASK-003/unified-browser-run-1366.txt)与[完整 JSON](assets/TASK-003/unified-browser-checks-1366.json)。

已目视对照 [开始页](assets/TASK-003/unified-00-home-1366.png)、[后续对白](assets/TASK-003/unified-03-cherish-make-space-1366-dialogue.png)和 [结局](assets/TASK-003/unified-03-cherish-make-space-1366-ending.png)：前后均无突兀白色面板，电话身份、对白和结局自然融入同一背景风格。未执行自动化 WCAG 对比度评分；实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 18. 降低白色光晕与文字泛光

日期：2026-11-19（Asia/Shanghai）。用户反馈“白色光太亮”。本轮只降低发光与遮罩强度，不改变统一无框布局和交互。

- 对白与结局的径向柔光中心不透明度由 0.94/0.90 降至 0.76，中段降至 0.56，缩小明显发白区域。
- 文字阴影由 22px / 0.86 和 18px / 0.82 统一降为 12px / 0.58，减少文字周围泛白和模糊感。
- 背景遮罩与环境光同步减弱，保留场景层次和文字可读性；未改变暖米色、字体、按钮、场景映射或一屏布局。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 27.83 kB / gzip 6.68 kB，JS 239.31 kB / gzip 74.80 kB。日志见 [soft-typecheck.txt](assets/TASK-003/soft-typecheck.txt)、[soft-test-story.txt](assets/TASK-003/soft-test-story.txt)、[soft-build.txt](assets/TASK-003/soft-build.txt)。

独立 Edge 在 1366×768 下再次完成全剧情、一屏高度、鼠标/键盘预览与手机布局回归，全部通过；160 次请求仅包含本地资源，外部请求、加载失败和控制台异常均为 `[]`，见 [运行摘要](assets/TASK-003/soft-browser-run-1366.txt)与[完整 JSON](assets/TASK-003/soft-browser-checks-1366.json)。

已目视检查 [首页](assets/TASK-003/soft-00-home-1366.png)、[对白](assets/TASK-003/soft-03-cherish-make-space-1366-dialogue.png)和 [结局](assets/TASK-003/soft-03-cherish-make-space-1366-ending.png)：白色光晕明显收敛，文字与背景对比自然，无内容遮挡。未执行自动化 WCAG 对比度评分；实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 19. 弱化返回首页，突出主行动

日期：2026-11-19（Asia/Shanghai）。用户希望弱化“返回首页”的视觉效果，让注意力集中在进入来电和后续推进上。本轮只调整按钮层级与位置，不改变导航逻辑。

- `src/App.tsx` 为三处“返回首页”增加 `home-return-action`，不修改 `returnHome`、按钮顺序或键盘行为。
- `src/index.css` 将其改为透明背景、无实心边框、12px 文字和 16px 返回箭头，保留 46px 触控高度与可见焦点。
- 桌面 ≥640px：前言与来电页的“返回首页”位于操作区最右侧，不再与“进入来电／接听”并列争夺中心位置。
- 手机 <640px：返回入口放在主按钮下方，避免覆盖全宽主行动；结局页同样突出“重听这通来电”，返回首页保持轻量文字链接。
- 未修改继续按钮、两次选择、确认退出或场景预览，桌面一屏布局保持。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 28.62 kB / gzip 6.80 kB，JS 239.37 kB / gzip 74.80 kB。日志见 [action-typecheck.txt](assets/TASK-003/action-typecheck.txt)、[action-test-story.txt](assets/TASK-003/action-test-story.txt)、[action-build.txt](assets/TASK-003/action-build.txt)。

独立 Edge 在 1366×768 和 390px 手机视口下完成前言、来电、四组合、键盘、重置和布局回归，全部通过；156 次请求仅包含本地资源，外部请求、加载失败和控制台异常均为 `[]`，见 [运行摘要](assets/TASK-003/action-browser-run-1366.txt)与[完整 JSON](assets/TASK-003/action-browser-checks-1366.json)。

已目视检查 [桌面前言](assets/TASK-003/action-intro-action-1366.png)、[桌面来电](assets/TASK-003/action-incoming-action-1366.png)、[手机来电](assets/TASK-003/action-incoming-action-390.png)与 [结局](assets/TASK-003/action-03-cherish-make-space-1366-ending.png)：进入来电、接听和重听成为明确主行动，返回首页退居次要位置且不遮挡内容。实体设备、真实读屏和原生 200% 缩放仍未验证。生产预览保留供用户查看，未合并 main、未部署。

## 20. 交接给 Codex 复审

日期：2026-11-19（Asia/Shanghai）。状态：**实现与本轮验证完成，交还 Codex 独立复审；不代表 PASS。**

### 最终交接范围

- R1 剧情校验已改为携带两次选择状态的真实路径遍历，覆盖缺失结局、错误映射、非结局目标、单分支循环、跳过第一次选择和跳过第二次选择等反例。
- Excel 定稿已逐字同步到项目剧情与本地 Word 剧本，原 Excel 未修改。
- 全流程已加入 16 张代码生成的本地场景、鼠标/键盘选项预览、220ms 保留旧画面的交叉淡化，以及统一暖米无框、低泛光、主次行动和桌面一屏布局。
- 已定稿文案、两次选择、四结局、确认退出、重听、刷新重置、键盘焦点和减少动态效果均保留；未进入 TASK-004，未合并 main、未部署。

### 复审入口与关键证据

| 项目 | 交接内容 |
| --- | --- |
| 执行分支 | `task-003` |
| 最终实现提交 | `ddc3239f80588ddd28a075f44ae97fbc3bf6ba69`；本次交接文档提交另行推送并核对远程 |
| 工程检查 | `npm run typecheck`、15/15 `npm run test:story`、`npm run build` 均退出 0；[最终日志](assets/TASK-003/action-build.txt) |
| 最新完整浏览器回归 | [action 摘要](assets/TASK-003/action-browser-run-1366.txt)与[完整 JSON](assets/TASK-003/action-browser-checks-1366.json) |
| 桌面一屏专项 | [1366×768](assets/TASK-003/fit-browser-checks-1366.json)与[1440×900](assets/TASK-003/fit-browser-checks-1440.json)均逐节点断言无需纵向滚动 |
| 视觉证据 | [前言](assets/TASK-003/action-intro-action-1366.png)、[来电](assets/TASK-003/action-incoming-action-1366.png)、[对白](assets/TASK-003/soft-03-cherish-make-space-1366-dialogue.png)、[结局](assets/TASK-003/action-03-cherish-make-space-1366-ending.png) |
| 本地预览 | `http://127.0.0.1:4173/` 保持运行，便于 Codex 直接检查；也可用 `npm run preview` 重新启动 |
| 工作区说明 | 根目录 `Elsewhere-未接来电-剧本.docx` 为用户要求的本地交付物，保持未跟踪，未混入源码提交 |

### 仍需 Codex 或团队验证

- Codex 尚未对 `2fab931` 之后的真实状态路径修复、定稿文案及后续视觉与交互改动给出独立 PASS；本报告不能替代复审。
- 未使用实体手机或平板，未运行 VoiceOver 等真实读屏，未执行原生浏览器 200% 缩放；未进行自动化 WCAG 对比度评分。
- 已验证 320×568、390×844、1366×768、1440×900，不声称覆盖所有设备、浏览器和桌面高度；团队主观体验与下一任务批准仍需另行确认。

交接后 Qoder 停止修改，等待 Codex 对照真实代码、测试和生产预览复审。未经团队批准不合并 main、不部署、不进入下一任务。

## 21. 恒亮无闪场景切换

日期：2026-11-19（Asia/Shanghai）。用户反馈选择下一步时整个浅色界面会闪烁，要求白色保持常亮。本轮取消场景透明度过渡，不改变既定暖米无框风格。

- `src/components/SceneBackground.tsx` 移除 previous/current 状态、定时器和 220ms 交叉淡化，改为一次渲染全部 16 张本地 SVG；仅当前场景使用 `scene-current is-active`。
- `src/index.css` 对非当前场景设置 `visibility: hidden; opacity: 0`，当前场景直接显示，没有任何透明度动画或过渡。暖米底色、白色柔光和阅读区域不随选择明暗变化。
- 全部场景在首个页面加载，后续选择只切换显示内容，避免新图片加载前的空白闪烁。鼠标/键盘预览仍按原规则恢复，正式选择仍只由点击、Enter 或 Space 推进。
- README 同步为“16 张场景一次加载，切换时无透明度动画，界面亮度保持恒定”。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 28.55 kB / gzip 6.76 kB，JS 239.27 kB / gzip 74.77 kB。日志见 [steady-typecheck.txt](assets/TASK-003/steady-typecheck.txt)、[steady-test-story.txt](assets/TASK-003/steady-test-story.txt)、[steady-build.txt](assets/TASK-003/steady-build.txt)。

独立 Edge 在 1366×768 下逐节点断言：16 个场景层全部加载完成、只有 1 个 `is-active` 层、当前层 `animation-name: none`，并再次通过四组合、鼠标/键盘预览、重置和桌面一屏回归。最终 229 次请求仅包含本地应用与同一组 16 张场景，外部请求、加载失败、页面异常及 console error/warning 均为 `[]`，见 [运行摘要](assets/TASK-003/steady-browser-run-1366.txt)和[完整 JSON](assets/TASK-003/steady-browser-checks-1366.json)。

已检查 [选项预览](assets/TASK-003/steady-01-regret-first-preview.png)与[对白](assets/TASK-003/steady-03-cherish-make-space-1366-dialogue.png)，暖米底色与白色柔光保持恒定。此前 `1704507` 的 Codex PASS 不包含本轮恒亮修正；本轮仍不据此自称 PASS。实体设备、真实读屏和原生 200% 缩放仍未验证，未合并 main、未部署。

## 22. 连续主行动位置稳定

日期：2026-11-19（Asia/Shanghai）。用户要求“开始体验、进入来电、接听”尽量处于相同位置，减少鼠标移动，并将连续操作的位置稳定性纳入以后设计。本轮将三个主按钮统一到共享行动区。

- `src/App.tsx` 移除三处分散的主按钮，在 `main` 内增加统一 `journey-actions`：按当前视图显示开始体验、进入来电或接听；首页焦点 ref 与三种原有点击行为保持不变。返回首页继续作为次级链接。
- `src/index.css` 在桌面 ≥900px 将共享行动区固定于 `app-main` 的相同底部锚点，并为内容预留空间；手机 <640px 使用自然文档流，主按钮全宽、返回首页位于下方，不遮挡内容。
- 桌面主按钮始终居中，返回首页位于行动区右侧；没有修改后续对白继续按钮、两次选择、结局操作或恒亮场景切换。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 29.18 kB / gzip 6.86 kB，JS 238.71 kB / gzip 74.79 kB。日志见 [position-typecheck.txt](assets/TASK-003/position-typecheck.txt)、[position-test-story.txt](assets/TASK-003/position-test-story.txt)、[position-build.txt](assets/TASK-003/position-build.txt)。

[position-browser-checks.mjs](assets/TASK-003/position-browser-checks.mjs) 在每次进入下一步前直接读取主按钮 `getBoundingClientRect()` 的中心坐标，并断言三步 X/Y 完全一致：

| 视口 | 开始体验 | 进入来电 | 接听 | 结果 |
| --- | --- | --- | --- | --- |
| 1366×768 | `(683, 690)` | `(683, 690)` | `(683, 690)` | [通过](assets/TASK-003/position-browser-run-1366.txt) |
| 1440×900 | `(720, 822)` | `(720, 822)` | `(720, 822)` | [通过](assets/TASK-003/position-browser-run-1440.txt) |

完整 JSON 分别见 [1366 证据](assets/TASK-003/position-browser-checks-1366.json)和 [1440 证据](assets/TASK-003/position-browser-checks-1440.json)。已目视对照 [开始体验](assets/TASK-003/position-00-home-1366.png)、[进入来电](assets/TASK-003/position-intro-action-1366.png)和[接听](assets/TASK-003/position-incoming-action-1366.png)，主按钮位置一致，内容无遮挡，桌面无需纵向滚动。后续界面设计也应优先保持连续行动的位置稳定，避免无意义的鼠标往返。未合并 main、未部署。
