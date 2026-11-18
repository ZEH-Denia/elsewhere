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
