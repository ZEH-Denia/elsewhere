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

## 23. 夜色插画与局部纸衬底（PASS 后视觉精修）

日期：2026-11-19（Asia/Shanghai）。团队转达 Grok 的界面批评，随后明确修正合成方式：插画不透明度升到 1，房间直接画在窗框里；去掉全幅横竖米色渐变、径向雾和大面积文字投影；只在文字所在的中缝保留局部纸色衬底，并向左右淡出；同时完成手机单列、来电物体化、行动层级和颜色角色的调整。

- `src/index.css`：删除整窗米色渐变、柔和泛光、对话/结局径向雾与全幅 scrim；`.scene-background` 只保留 `#e4dace` 作为 SVG 视口底色，当前场景 `opacity: 1`。新增 `.screen-enter::before`，按视图读取 `--veil-alpha`、`--veil-width`、`--veil-fade`，仅做水平方向的纸色渐变，不再加纵向遮罩。
- 衬底参数：首页 `0.56 / 760px / 11%`，前言 `0.66 / 860px / 8%`，来电 `0.78 / 820px / 11%`，通话、选择与结局 `0.86 / 900px / 6.5%`；1440 下受内容列上限影响实测 880px。手机 <640px 时衬底上下各外扩 16px、宽度 `calc(100% + 12px)`、圆角 18px，横向 6%–94% 淡出。
- 标题、正文、选项和按钮恢复实色；全局 `.text-shadow` 与标题投影为 `none`。`index.html` 的 `theme-color` 从 `#070b1c` 改为 `#e4dace`，与页面底色一致。
- 换场恢复 220ms 交叉淡化：旧场景保留 `is-outgoing` 层而不是先消失，活动层始终 `opacity: 1`，避免中缝出现白场。悬停/键盘预览改为独立 `.scene-preview` 覆盖层，基础场景保持不动，预览层淡入到 1，边框切换为平行世界的灰紫色。
- 手机改为单列，主按钮直接落在正文下方，不再浮在标题旁；≤639px 隐藏页眉元信息，≤389px 隐藏页脚；桌面 `.app-main` 使用 `justify-content: safe center`，内容不再被强制顶到上方。
- 来电卡成为独立纸面物体，状态为待接通、通话中、已结束，铃响与通话各 5 格信号，结束显示平线；`scripts/generate-backgrounds.mjs` 把首页听筒调淡到 `0.18`、来电场景移除重复听筒并调整右侧乐器，16 张 SVG 已重新生成。
- 颜色角色分开：赤陶 `--accent` 仍是唯一实心行动色，平行/音乐使用灰紫 `--parallel`，通话状态使用青灰 `--signal`，结束通话使用暗红 `--danger`。结局主按钮“重听这通来电”保持赤陶实心，“返回首页”降为透明次级链接；对白“继续”改为整行翻页动作，带细线与右侧动作图标。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 30.61 kB / gzip 7.31 kB，JS 239.93 kB / gzip 75.18 kB。日志见 [refine-typecheck.txt](assets/TASK-003/refine-typecheck.txt)、[refine-test-story.txt](assets/TASK-003/refine-test-story.txt)、[refine-build.txt](assets/TASK-003/refine-build.txt)。

[visual-refinement-checks.mjs](assets/TASK-003/visual-refinement-checks.mjs) 通过独立无头 Edge（CDP 9225，启用避免后台冻结的渲染参数）访问生产预览 `http://127.0.0.1:4173/`，逐屏断言并保存 [完整 JSON](assets/TASK-003/visual-refinement-checks.json) 与截图。结果 `all calibration checks passed`，`failures` 和 `consoleEvents` 均为 `[]`：

| 检查 | 实测 |
| --- | --- |
| 场景层不透明度 | 1440 首页、对白、结局均为 `1` |
| 衬底宽度 | 首页 760px、前言 860px、对白/结局 880px，均为水平渐变、无纵向 mask |
| 文字投影 | 各屏标题 `text-shadow: none` |
| 主按钮与标题 | 1440/1366/390/320 均无重叠，无横向溢出 |
| 换场采样 | 旧场景层 1 个、活动层 `1`、旧层 `0.37`，中缝底色 `rgb(228, 218, 206)` 无白场 |
| 悬停预览 | 基础场景仍为 `first-choice.svg`，预览层 `regret.svg` 不透明度 `1`，边框切换为 `rgba(114, 90, 124, 0.55)` |
| 来电状态 | 接听前 `ringing`、5 格信号；接通后 `connected`；结局 `ended` 平线 |
| 结局行动 | 主按钮赤陶实心，返回首页透明次级，二者背景不同 |
| 对白继续 | 1440 下 780×52，整行翻页 |
| 减少动态效果 | 模拟 `prefers-reduced-motion: reduce`：换场时旧层 `visibility: hidden`，当前层 `visible` / `1` |
| 手机 | 390 单列、主按钮在正文下方、页眉元信息隐藏；320 页脚隐藏 |

已目视检查 [1440 首页](assets/TASK-003/visual-home-1440.png)、[1366 首页](assets/TASK-003/visual-home-1366.png)、[1440 前言](assets/TASK-003/visual-intro-1440.png)、[1440 来电](assets/TASK-003/visual-incoming-1440.png)、[1440 对白](assets/TASK-003/visual-dialogue-1440.png)、[1440 选项预览](assets/TASK-003/visual-choice-preview-1440.png)、[1440 结局](assets/TASK-003/visual-ending-1440.png)、[390 首页](assets/TASK-003/visual-home-390.png)、[390 对白](assets/TASK-003/visual-dialogue-390.png)、[390 选择](assets/TASK-003/visual-choice-390.png)、[320 首页](assets/TASK-003/visual-home-320.png)与[320 前言](assets/TASK-003/visual-intro-320.png)。首轮截图中对白左侧的来电者、通话状态与进度小字落在衬底淡出带内，已把通话衬底由 800px 提高到 880px（有效宽度）并把淡出从 11% 收紧到 6.5%，前言同步调整到 860px / 8%，重新截图后文字回到纸面上，左右书桌与乐器仍可见。

本轮未使用实体手机或平板，未运行 VoiceOver 等真实读屏，未执行原生浏览器 200% 缩放，未做自动化 WCAG 对比度评分；减少动态效果仅通过 CDP 媒体模拟验证，未在真实系统设置下人工体验；仅验证 320×568、390×844、1366×768、1440×900。该精修发生在 Codex 上次 PASS 之后，尚未经过复审，不据此自称 PASS。未合并 main、未部署、未进入下一任务，等待 Codex 对照真实代码与截图复核。

## 24. Galgame 式底部对话框与选项按钮参考图（仅设计参考，未改应用）

日期：2026-11-19（Asia/Shanghai）。团队提出借鉴 galgame 界面：剧情推进使用底部对话框，分支选择使用按钮，重点是让画面不再被中央白雾覆盖。本轮只出参考图，不修改应用源码。

- 参考页为仓库外的独立静态 HTML，使用真实生产预览中的 `music.svg` 与 `first-choice.svg`。画面内不再出现中缝纸衬底、径向雾或全幅遮罩，左右书桌与乐器完整可见。
- 对白状态：底部纸张对话框承载说话人、正文、进度和“继续”；“继续”是整行翻页动作，右侧为赤陶实心圆形箭头。说话人标签跨在对话框上沿，含 4 格信号与“来自平行世界的自己”。
- 选择状态：两个纸张选项按钮堆叠在对话框上方，保留序号与赤陶箭头；悬停/聚焦时选项边框切换为平行世界的灰紫色并带 3px 外晕，提示可预览另一条路。对话框只保留“第一次选择 / 你想怎么回答？”，页脚提示“移入选项可预览另一条路 · 选择会改变走向”。
- 手机 ≤640px：选项与对话框全宽堆叠，隐藏序号与页脚提示；选项与对话框之间留出 26px，避免说话人标签与第二个选项相碰。390×844 下对话与选择均保持画面在上、操作在下。
- 参考图由独立无头 Edge 以 1440×900 与 390×844 截取：[对白 1440](assets/TASK-003/reference-galgame-dialogue-1440.png)、[选择 1440](assets/TASK-003/reference-galgame-choice-1440.png)、[对白 390](assets/TASK-003/reference-galgame-dialogue-390.png)、[选择 390](assets/TASK-003/reference-galgame-choice-390.png)。
- 首轮参考图有两处已修正：选项纸面从 0.95 提高到 0.97，减少背后乐器透出；手机选项与对话框间距从 12px 增加到 26px。

本轮未修改 `src/`、工程配置或依赖，未运行类型检查、剧情测试或构建，也未提交实现。若团队认可该方向，实施时会复用现有剧情图、预览、换场、键盘焦点与减少动态效果逻辑，仅替换对白与选择页的中央衬底布局；在此之前等待团队决定。

团队反馈选项与对话框方向可行，但底部纸面略显遮挡画面，要求适当降低对话框透明度。参考页把对话框从 `0.96 / 0.93` 调到 `0.90 / 0.86`，背景模糊由 12px 提到 14px，正文仍保持实色；选项纸面继续维持 0.97，避免背后乐器透出干扰文字。四张参考图已按此重新截取，替换本轮同名文件。

## 25. 底部界面带与背景重绘（视觉参考第二轮）

日期：2026-11-20（Asia/Shanghai）。团队反馈：对话框和选项仍遮住背景中的部分信息，必要时可以重绘背景。本轮重排 16 张场景的构图，让底部让出界面带，并更新四张参考图；仍未修改对白/选择的应用布局。

- `scripts/generate-backgrounds.mjs` 把墙板、窗框、室内陈设、玻璃与窗棂整体上移 60 个单位；雨线、色偏、暖光、底部暗部渐变、暗角与颗粒仍覆盖整张画布。音乐谱线和现实世界浏览器两块顶部装饰反向偏移，保持原来位置，避免被页眉裁切。
- 桌面 1440×900：室内下缘回到约 620px，对话框位于 694–865px 的暗带内，不再压住室内；两次选项位于 549–681px，只盖住地板与窗框下沿，书桌台面、显示器、吉他、键盘均保持可见。手机 390×844：室内下缘约 590px，对话框从 645px 开始，叠放选项只压到底框与地板。
- 参考页的纸面对话框同步收紧：上内边距 38→28px，页脚上边距 24→16px、内边距 14→12px，让选项整体下移；对话纸面仍为 0.90/0.86，选项仍为 0.97。
- 新背景已进入应用资源。现有居中布局重新执行 `npm run typecheck`、15/15 剧情测试与 `npm run build` 均退出 0；CSS 30.69 kB / gzip 7.33 kB，JS 239.93 kB / gzip 75.18 kB。
- 独立 Edge（CDP 9225，`CDP_PORT=9225`）用现有视觉检查脚本访问生产预览，结果 `all calibration checks passed`，`failures` 与 console error/warning 均为 `[]`，见 [检查 JSON](assets/TASK-003/bg-lift-checks.json)、[首页](assets/TASK-003/bg-lift-home-1440.png)、[对白](assets/TASK-003/bg-lift-dialogue-1440.png)、[选项预览](assets/TASK-003/bg-lift-choice-1440.png)。这些截图是“旧布局 + 新背景”的兼容性证据，不是最终 galgame 布局。
- 四张参考图已更新：[对白 1440](assets/TASK-003/reference-galgame-dialogue-1440.png)、[选择 1440](assets/TASK-003/reference-galgame-choice-1440.png)、[对白 390](assets/TASK-003/reference-galgame-dialogue-390.png)、[选择 390](assets/TASK-003/reference-galgame-choice-390.png)。
- 尚未把底部对话框/选项布局写进 `src/`；仍等待方向确认。实体设备、真实读屏、原生 200% 缩放未验证；参考页为静态模拟，不代表应用已实现。未合并 main、未部署。

## 26. Galgame 式底部对话框与选项按钮落地

日期：2026-11-20（Asia/Shanghai）。团队以“开始落地”批准参考方向。本轮把对白、选择两屏改为底部纸面交互，去掉通话与选择视图的中央纸雾；首页、前言、来电和结局保留原有局部衬底与居中结构。

- `src/App.tsx`：通话中页眉由产品元信息切换为“第一通来电 + 结束通话”，结束通话仍打开原确认对话框；通话中隐藏全局页脚，`<main>` 增加 `is-call` 以便操作区贴底。对白与选择共用 `.call-dock`：选择时选项在上、提示面板在下，对白时只有面板。说话人标签显示通话信号、说话人和“来自平行世界的自己 / 通话之外 / 此刻的你”；页脚显示“主线 01 / 07”“选择 01 / 02”等进度。对白“继续”缩为文字加 34px 赤陶实心圆，不再整行铺满。原剧情推进、键盘焦点、选择预览和结束流程未改。
- `src/index.css`：新增 `.call-dock`、`.dialogue-panel`、`.dialogue-speaker-tab`、`.choice-prompt`、`.choice-options` 与 `.choice-option`。桌面面板宽 1120px、最小高 166px（短视口 150px），纸面渐变 `0.90 / 0.86`、14px 背景模糊、16px 圆角；选项宽 760px、高 60px（短视口 56px）、纸面 `0.97`。桌面面板位于视口底部 50px（短视口 30px、手机 32px），选项与面板间距 18px（短视口 14px、手机 24px）。手机面板全宽、内边距 24/20/12、正文 20px，隐藏选项序号、页脚提示与说话人来源，选项改为两列网格（序号列收起）。
- `.call-session::before` 设为 `display: none`，通话与选择视图不再绘制中央纸衬底；`.app-main.is-call` 取消居中与内边距，让操作区落在背景重绘预留的底部带内。首页、前言、来电、结局的 `.screen-enter::before` 保持不变。
- 首轮截图中页眉“结束通话”使用暗色 `--dim`，在夜色页眉上几乎不可见；改为纸色 `hsl(var(--night) / 0.56)`、悬停 `0.92` 加 `0.08` 纸色底，保留 44px 触控高度后重新构建并复测。
- `README.md` 的界面描述同步为底部纸面对话框/选项、通话视图无中央白雾、其余视图保留局部衬底，运行命令与测试说明未改。

最终 `npm run typecheck`、15/15 剧情测试和 `npm run build` 均退出 0；CSS 33.25 kB / gzip 7.83 kB，JS 240.16 kB / gzip 75.40 kB。日志见 [galgame-typecheck.txt](assets/TASK-003/galgame-typecheck.txt)、[galgame-test-story.txt](assets/TASK-003/galgame-test-story.txt)、[galgame-build.txt](assets/TASK-003/galgame-build.txt)。

[galgame-layout-checks.mjs](assets/TASK-003/galgame-layout-checks.mjs) 通过独立无头 Edge（`CDP_PORT=9225`）访问生产预览 `http://127.0.0.1:4173/`，结果 `all galgame layout checks passed`，`failures` 与 `consoleEvents` 均为 `[]`，完整数据见 [galgame-layout-checks.json](assets/TASK-003/galgame-layout-checks.json)：

| 检查 | 实测 |
| --- | --- |
| 中央纸雾 | 对白/选择 `.call-session::before` 为 `none`；首页仍为 `block` 且绘有渐变 |
| 场景层 | 各视口当前场景 `opacity: 1` |
| 页眉 | “第一通来电”与“结束通话”存在，产品元信息隐藏；结束通话 1440 下 54×44，390/320 下 45×44 |
| 页脚 | 通话/选择期间 `.app-footer` 不渲染 |
| 桌面面板 | 1440：1120×155，y 715–870；1366：1120×154，y 584–738 |
| 选择堆叠 | 1440 选项 y 584–706、面板 y 720；1366 选项 y 452–574、面板 y 588，二者不重叠 |
| 手机面板 | 390：350 宽，y 635–812（对白）/662–812（选择）；320：280 宽，y 359–536 /386–536 |
| 手机选项 | 390 选项 y 520–638；320 选项 y 223–362，均在面板上方且不越过页眉 |
| 一屏 | 四种视口 `scrollHeight` 均不超过视口高度，无横向溢出 |
| 继续按钮 | 1440 下宽小于 180px，高 44px |
| 选择信息 | 桌面显示序号、两行文案与预览提示；390/320 隐藏序号、提示和说话人来源 |
| 预览 | 悬停与键盘聚焦均把 `regret.svg` 预览层升到 `1`，基础场景不变，边框转灰紫 |
| 结束通话 | 确认对话框可打开并由“取消”关闭 |
| 结局 | 保留页眉、页脚、已结束状态与两个 CTA；主按钮赤陶实心，返回首页透明 |
| 减少动态效果 | 模拟 `prefers-reduced-motion: reduce`：旧场景 `visibility: hidden`，当前场景 `visible` / `1`，面板仍可读 |

已目视检查下列最终截图：[1440 首页](assets/TASK-003/galgame-home-1440.png)、[1440 对白](assets/TASK-003/galgame-dialogue-1440.png)、[1366 对白](assets/TASK-003/galgame-dialogue-1366.png)、[1440 选择](assets/TASK-003/galgame-choice-1440.png)、[1366 选择](assets/TASK-003/galgame-choice-1366.png)、[1440 预览](assets/TASK-003/galgame-choice-preview-1440.png)、[1440 结局](assets/TASK-003/galgame-ending-1440.png)、[390 首页](assets/TASK-003/galgame-home-390.png)、[390 对白](assets/TASK-003/galgame-dialogue-390.png)、[390 选择](assets/TASK-003/galgame-choice-390.png)、[320 首页](assets/TASK-003/galgame-home-320.png)、[320 对白](assets/TASK-003/galgame-dialogue-320.png)与[320 选择](assets/TASK-003/galgame-choice-320.png)。书桌、显示器、吉他、键盘和两间房在桌面仍可见；面板只落在底部暗带，对白文字、选项和页眉控件无裁切、无遮挡。

本轮未使用实体手机或平板，未运行 VoiceOver 等真实读屏，未执行原生浏览器 200% 缩放，未在 Safari/Firefox 实测；减少动态效果仅通过 CDP 媒体模拟验证；仅覆盖 320×568、390×844、1366×768、1440×900。结局页按批准范围保持原有居中纸衬底，未改为底部对话框。该实现发生在 Codex 上次 PASS 之后，尚未复审，不据此自称 PASS。未合并 main、未部署、未进入下一任务，等待 Codex 对照真实代码与截图复核。

## 27. 首页、前言与来电统一到底部纸面面板

日期：2026-11-20（Asia/Shanghai）。团队反馈“123 的白雾也改掉，和后面的保持统一”：首页、前言、来电三屏仍在中央铺纸雾，与对白/选择视图的底部纸面不一致。本轮只调整这三屏的布局与样式，结局页按 123 的范围保持原有居中纸衬底。

- `src/App.tsx`：三屏改为 `.prelude` 结构，上方 `.prelude-stage` 保留可自由观看的插画与纸面来电卡，下方 `.prelude-dock > .prelude-panel` 承载标题、正文与操作；`<main>` 增加 `is-prelude`，取消居中内边距。首页与来电的桌面/平板保留居中来电卡，手机 ≤639px 隐藏该卡，只保留插画与底部面板；前言没有来电卡。三屏的返回首页与主行动都进入纸面面板，主按钮钉在面板右下角。
- `src/index.css`：新增 `.prelude`、`.prelude-stage`、`.prelude-dock`、`.prelude-panel`、`.prelude-copy`、`.prelude-actions`、`.panel-return-action` 及四档视口规则；`.prelude::before` 设为 `display: none`，三屏不再绘制中央纸雾，插画不透明度保持 1。面板使用与对白一致的纸面渐变、14px 背景模糊、16px 圆角，桌面最小高 240px（短视口 220px、手机 300px），手机内边距 24/20、返回首页右对齐。
- 中途发现来电页文案与按钮左右错位：旧规则 `.incoming-copy { grid-area: copy; }` 作用于新面板网格，生成了不存在的命名区域。已把区块语义移到 `.prelude-incoming`，并按 `.prelude-incoming h1`、`.prelude-incoming .incoming-note` 重写选择器；随后删除不再使用的 `home-layout`、`home-copy`、`home-actions`、`intro-layout`、`incoming-layout`、`incoming-copy`、`incoming-actions`、`journey-actions`、`journey-return-action` 及其媒体查询，CSS 由 37.62 kB 降至 34.98 kB。
- 320px 前言标题使用 `text-wrap: balance`，避免末行只剩“里？”；390/320 三屏主按钮位置一致，桌面主按钮固定在面板底部，鼠标从“开始体验”“进入来电”到“接听”无需移动。
- 全局页脚仅在结局页渲染；首页、前言、来电不再显示页脚，页眉与场景切换逻辑未改。

最终 `npm run typecheck`、15/15 剧情测试与 `npm run build` 均退出 0；CSS 34.98 kB / gzip 8.07 kB，JS 241.25 kB / gzip 75.44 kB。日志见 [galgame-typecheck.txt](assets/TASK-003/galgame-typecheck.txt)、[galgame-test-story.txt](assets/TASK-003/galgame-test-story.txt)、[galgame-build.txt](assets/TASK-003/galgame-build.txt)。

[galgame-layout-checks.mjs](assets/TASK-003/galgame-layout-checks.mjs) 已扩展三屏检查，仍通过独立无头 Edge（`CDP_PORT=9225`）以真实鼠标事件点击生产预览 `http://127.0.0.1:4173/`，结果 `all galgame layout checks passed`，`failures` 与 `consoleEvents` 均为 `[]`，完整数据见 [galgame-layout-checks.json](assets/TASK-003/galgame-layout-checks.json)：

| 检查 | 实测 |
| --- | --- |
| 中央纸雾 | 三屏 `.screen-enter::before` 均为 `none`，插画 `opacity: 1` |
| 页脚 | 三屏均不渲染 `.app-footer`；结局仍为 `flex` |
| 桌面面板 | 1440：首页/前言 y 634–870，来电 y 639–870；1366：y 502–738 / 507–738 |
| 手机面板 | 390：y 512–812 / 445–812 / 463–812；320：y 236–536 / 122–536 / 198–536 |
| 主行动对齐 | 1440 三屏均为 x 1055、y 793、184×52；1366 均为 x 1018、y 661；390 均为 x 41、y 735、308×52；320 均为 x 39、y 461、242×52 |
| 来电卡 | 桌面与 1366 保留 380px 来电卡；390/320 卡片宽度为 0，只保留插画和面板 |
| 标题字号 | 1440/1366 首页 44px、前言 36px、来电 38px；390 为 40/28/30px；320 为 36/26/28px |
| 一屏 | 四种视口 `scrollHeight` 均不超过视口高度，无横向溢出 |
| 结局 | 仍保留页眉、页脚、纸衬底与两个 CTA；`veil: block`、`footer: flex` |

已目视检查三屏最终截图：[1440 首页](assets/TASK-003/galgame-home-1440.png)、[1440 前言](assets/TASK-003/galgame-intro-1440.png)、[1440 来电](assets/TASK-003/galgame-incoming-1440.png)、[1366 首页](assets/TASK-003/galgame-home-1366.png)、[1366 前言](assets/TASK-003/galgame-intro-1366.png)、[1366 来电](assets/TASK-003/galgame-incoming-1366.png)、[390 首页](assets/TASK-003/galgame-home-390.png)、[390 前言](assets/TASK-003/galgame-intro-390.png)、[390 来电](assets/TASK-003/galgame-incoming-390.png)、[320 首页](assets/TASK-003/galgame-home-320.png)、[320 前言](assets/TASK-003/galgame-intro-320.png)与[320 来电](assets/TASK-003/galgame-incoming-320.png)。书桌、显示器、吉他、键盘和两间房均完整可见，面板只覆盖底部暗带，文字与按钮无裁切；对白、选择与结局截图同文件重跑后保持一致。

本轮未使用实体手机或平板，未运行 VoiceOver 等真实读屏，未执行原生浏览器 200% 缩放，未在 Safari/Firefox 实测；减少动态效果仍为 CDP 媒体模拟；仅覆盖 320×568、390×844、1366×768、1440×900。结局页未按“123”范围调整，若团队希望结局也统一到底部面板，需另行确认。该实现尚未复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务，等待 Codex 对照真实代码与截图复核。

## 28. 修复回应反馈阶段的场景图消失

日期：2026-11-20（Asia/Shanghai）。团队反馈“回应反馈阶段怎么没有图片了”。复现确认：进入第一次选择的反馈后，场景层 `src` 为 `/backgrounds/regret.svg`、`visibility: visible`，但 `opacity: 0`，所以画面只剩底部面板与深色底。

- 根因在 `SceneBackground` 的预览状态：选择时鼠标聚焦触发 `regret` 预览，节点切换后 App 清空预览，但组件内的 `previewScene` 未清除。反馈场景同样是 `regret`，该 `<img>` 同时带有 `scene-current is-active` 与 `scene-preview`，后者的 `opacity: 0` 覆盖了当前场景，导致图片不可见。相同问题会影响 `cherish`、`make-space`、`reach-out` 等“预览场景与反馈场景同名”的路径。
- 修复 `src/components/SceneBackground.tsx`：预览关闭后延迟 220ms 清除 `previewScene`，保留原有淡出；同时当前场景不再附加 `scene-preview` / `is-preview-visible`，保证 `is-active` 始终可见。未修改 CSS、剧情或交互流程。
- 复现脚本先点击“我有点遗憾，当年没有继续学音乐。”，进入反馈后实测 `/backgrounds/regret.svg` 的 `opacity` 从 `0` 恢复为 `1`；截图为 [反馈 1440](assets/TASK-003/galgame-feedback-1440.png)。第二次选择后的 [行动反馈 1440](assets/TASK-003/galgame-feedback-action-1440.png) 同样显示 `/backgrounds/make-space.svg`，`opacity: 1`。
- [galgame-layout-checks.mjs](assets/TASK-003/galgame-layout-checks.mjs) 增加两段回归断言：第一次反馈必须使用 `regret.svg` 且 `opacity: 1`；第二次行动反馈必须使用 `make-space.svg` 且 `opacity: 1`。完整重跑结果为 `all galgame layout checks passed`，`failures` 与 `consoleEvents` 均为 `[]`，见 [galgame-layout-checks.json](assets/TASK-003/galgame-layout-checks.json)。
- 最终 `npm run typecheck`、15/15 剧情测试与 `npm run build` 均退出 0；CSS 34.98 kB / gzip 8.07 kB，JS 241.33 kB / gzip 75.45 kB。悬停/键盘预览、场景换场、对白与选择布局仍通过同一次检查。

本轮未使用实体设备或真实读屏，未在 Safari/Firefox 实测；修复尚未复审，不据此自称 PASS。未合并 main、未部署、未进入下一任务。

## 29. 扩充场景并加入动效

日期：2026-11-20（Asia/Shanghai）。团队反馈“场景图太单调了，多画几幅，并且加入动效”。盘点确认：21 个剧情节点只映射到 16 张图，七条主线里 `opening-01/02/07` 共用 `opening`、`03/05` 共用 `music`、`04/06` 共用 `reality`，两组四句反馈也各自共用一张，确实重复。

- 画面扩充到 24 张，新增 8 张单句画面：`connection`（接起电话）、`doubt`（质疑）、`rehearsal`（排练完）、`desk`（准备实习）、`question`（提出追问）、`regret-quiet`（承认不安）、`cherish-morning`（认真过好今天）、`closing`（杂音渐弱）。`src/App.tsx` 按节点逐一映射；`opening.svg` 保留为未知节点的安全回退。
- 其中 `doubt`、`rehearsal`、`regret-quiet`、`cherish-morning` 改用近景构图（对窗外框整体缩放并平移），`connection` 轻微推近；新增两张拍立得、挂钟、乐谱、声波与扩散信号波纹作为中景母题，同一交互与面板结构不变。
- `scripts/generate-backgrounds.mjs` 为全部 24 张 SVG 内嵌 CSS 动效：雨丝缓慢漂移、22 粒尘埃上升、灯光与舞台光晕漂移、来电信号虚线流动、挂钟秒针旋转、声波柱起伏、杂音波纹扩散、杯口热气上升、乐谱/拍立得轻摆、聊天窗口光标闪烁；当前场景另有 38 秒一轮的 1.004→1.02 缓慢呼吸。所有动画只改局部位移、旋转或描边，不对整个场景做明暗闪烁，避免回到此前“整屏闪白”的问题。
- 每张 SVG 内置 `@media (prefers-reduced-motion: reduce) { .anim { animation: none !important; } }`，全局 `prefers-reduced-motion` 规则同时关闭当前场景呼吸。
- `src/components/SceneBackground.tsx` 只挂载当前、淡出中与预览这三类场景（最多 3 张），启动时用 `new Image()` 预载全部 24 张，避免 24 份 SVG 动画常驻运行。

验证环境：独立无头 Edge 157（`CDP_PORT=9224`）访问生产预览 `http://127.0.0.1:4173/`，以真实鼠标事件走完 regret→make-space 与 cherish 两条路径；`npm run typecheck`、15/15 剧情测试与 `npm run build` 均退出 0，CSS 35.71 kB / gzip 8.20 kB，JS 241.77 kB / gzip 75.60 kB。日志见 [galgame-typecheck.txt](assets/TASK-003/galgame-typecheck.txt)、[galgame-test-story.txt](assets/TASK-003/galgame-test-story.txt)、[galgame-build.txt](assets/TASK-003/galgame-build.txt)。

新增 [scene-motion-checks.mjs](assets/TASK-003/scene-motion-checks.mjs)，结果 `all scene and motion checks passed`，`failures` 与 `consoleEvents` 均为 `[]`，完整数据见 [scene-motion-checks.json](assets/TASK-003/scene-motion-checks.json)：

| 检查 | 实测 |
| --- | --- |
| 逐句场景 | `connection → doubt → music → reality → rehearsal → desk → question → first-choice → regret → regret-quiet → closing → second-choice → make-space → farewell → ending-regret-space` 全部符合 |
| 另一分支 | `cherish → cherish-morning → closing` 符合，珍惜分支可正常到达共同衔接 |
| 新增画面 | 8 张均生成；桌面与手机截图的场景 `src` 与剧情节点一致 |
| 文件动效 | 24 张 SVG 均含减少动态效果守卫、雨丝与尘埃，且至少 5 个动画元素 |
| 默认动效 | 内联 SVG 中雨丝 `animation-name: rain-drift`、尘埃 `mote-rise`，`playState` 为 `running`；当前场景 `scene-drift` 同为 `running` |
| 减少动态效果 | 模拟 `prefers-reduced-motion: reduce` 后，雨丝/尘埃/当前场景的 `animation-name` 均为 `none`，`getAnimations()` 数量均为 0；SVG 子框架同样收到媒体模拟 |
| 资源与控制台 | 24 张背景均加载成功，无失败请求、无应用异常 |

已目视检查新增截图：[接起电话 1440](assets/TASK-003/galgame-scene-connection-1440.png)、[质疑 1440](assets/TASK-003/galgame-scene-doubt-1440.png)、[排练 1440](assets/TASK-003/galgame-scene-rehearsal-1440.png)、[实习 1440](assets/TASK-003/galgame-scene-desk-1440.png)、[追问 1440](assets/TASK-003/galgame-scene-question-1440.png)、[不安 1440](assets/TASK-003/galgame-scene-regret-quiet-1440.png)、[杂音渐弱 1440](assets/TASK-003/galgame-scene-closing-1440.png)、[390 近景质疑](assets/TASK-003/galgame-scene-doubt-390.png)、[390 排练](assets/TASK-003/galgame-scene-rehearsal-390.png)、[390 追问](assets/TASK-003/galgame-scene-question-390.png)、[390 珍惜反馈](assets/TASK-003/galgame-scene-cherish-morning-390.png)。桌面双室构图与手机中央裁切下主体均可见，底部面板未遮挡关键母题。原有 [galgame-layout-checks.mjs](assets/TASK-003/galgame-layout-checks.mjs) 同一次重跑仍为 `all galgame layout checks passed`，三屏、对白、选择、预览、反馈与结局布局无回退。

本轮未使用实体手机或平板，未运行 VoiceOver 等真实读屏，未在 Safari/Firefox 实测；动效在无头 Edge 中按实际 `Animation.playState` 验证，减少动态效果仍为 CDP 媒体模拟；新增画面尚未复审，不据此自称 PASS。未合并 main、未部署、未进入下一任务。

## 30. 修复切换页面时的画面闪烁

日期：2026-11-20（Asia/Shanghai）。团队反馈“切换页面时画面有闪烁”。复现后确认有两个来源：

1. 换场时新场景 `<img>` 立即挂载并开始显示，旧场景在其上做 220ms 淡出；新图尚未完成 SVG 解码时会短暂空白，旧图淡出过程把 `.scene-background` 的浅米色底（`#e4dace`）露出来，形成一次亮闪。
2. 选择页悬停两个选项时，预览图被直接替换挂载；新预览未解码时整层为空，底层画面会瞬间透出。

修复只改渲染层，不动剧情、文案与交互：

- `src/components/SceneBackground.tsx` 改为“旧图保持不动、新图解码后覆盖淡入”的分层结构。新场景先以 `opacity: 0` 挂载并调用 `Image.decode()`；解码完成后才加上 `is-visible` 淡入，旧层在新层完全可见前始终保持 `opacity: 1`，确认 300ms 后移除。快速连续推进时保留最多几层过渡，最终只保留最新一层。
- 预览使用同一套分层逻辑：悬停选项 A 切到 B 时，B 解码完成后才覆盖淡入，A 不被瞬间丢弃；离开选项时先 240ms 淡出再卸载。
- 全局图片缓存在模块级 `Map`，启动时预载 24 张，解码结果供换场与预览共用；`.scene-current` 只标在最新一层，保留旧检查脚本的约定。
- `.scene-background` 的兜底底色由浅米色 `#e4dace` 改为与插画夜空一致的 `#05090f`，即使出现极端帧也不会亮闪。
- 舞台衬底会随视图切换从 0.56 渐变到 0.86（宽度 760→900px），此前是瞬间跳变。本轮用 `@property` 注册 `--veil-alpha` 与 `--veil-width`，并给 `.app-background` 加 320ms 过渡，使首页→前言→来电→通话的明暗过渡连续；减少动态效果时由全局规则关闭。

新增 [scene-transition-checks.mjs](assets/TASK-003/scene-transition-checks.mjs)，在独立无头 Edge 157（`CDP_PORT=9224`）访问生产预览 `http://127.0.0.1:4173/`，用真实鼠标事件执行换场，并在每次换场期间逐帧记录所有场景层的 `opacity` 与图片 `complete/naturalWidth`，计算叠加覆盖率（1 表示画面完全被图片覆盖，0 表示露出底）。结果见 [scene-transition-checks.json](assets/TASK-003/scene-transition-checks.json)：

| 检查 | 实测 |
| --- | --- |
| 首页→前言、前言→来电、来电→通话 | 最短覆盖率 1.000，0 个空白帧 |
| 首次“继续”、70ms 内连续两次“继续” | 最短覆盖率 1.000，0 个空白帧 |
| 第一次选择悬停 A→B→移开 | 最短覆盖率 1.000，0 个空白帧 |
| 390 手机：首页→前言→来电→通话 | 最短覆盖率 1.000，0 个空白帧 |
| 未解码图层 | 所有采样帧中均没有“透明度 > 0.01 但图片未就绪”的图层 |
| 资源与控制台 | 无失败请求、无异常、无警告 |

同一次验证中，[scene-motion-checks.mjs](assets/TASK-003/scene-motion-checks.mjs) 重跑仍为 `all scene and motion checks passed`（24 张画面、逐句映射、默认动效 `running`、减少动态效果全部停止）；[galgame-layout-checks.mjs](assets/TASK-003/galgame-layout-checks.mjs) 重跑仍为 `all galgame layout checks passed`。`npm run typecheck`、15/15 剧情测试与 `npm run build` 均退出 0；CSS 35.31 kB / gzip 8.12 kB，JS 242.61 kB / gzip 75.82 kB。日志见 [galgame-typecheck.txt](assets/TASK-003/galgame-typecheck.txt)、[galgame-test-story.txt](assets/TASK-003/galgame-test-story.txt)、[galgame-build.txt](assets/TASK-003/galgame-build.txt)。

换场过程中的实际截图：[首页→前言](assets/TASK-003/transition-home-to-intro-mid.png)、[前言→来电](assets/TASK-003/transition-intro-to-incoming-mid.png)、[来电→通话](assets/TASK-003/transition-incoming-to-call-mid.png)、[通话首次继续](assets/TASK-003/transition-call-first-advance-mid.png)、[390 来电→通话](assets/TASK-003/transition-mobile-incoming-to-call-mid.png)、[390 通话稳定后](assets/TASK-003/transition-mobile-call-settled.png)。截图取在点击后约 70ms，仍为完整画面，未见米色空白。

本轮未使用实体手机或平板，未运行 VoiceOver 等真实读屏，未在 Safari/Firefox 实测（`@property` 在旧浏览器会退化为原来的瞬时切换）；叠层覆盖率与解码就绪来自页面内 `requestAnimationFrame` 采样，不是录屏分析。该修复尚未复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务。

## 31. 画面低语热点（桌面鼠标与键盘交互）

日期：2026-11-20（Asia/Shanghai）。团队提出“有没有与图片有关的新型交互方式，比如加入鼠标的交互，先出方案”，在候选方案中选定 C“低语热点”；随后要求“注意备份原文件随时回退”。本轮只增加画面交互层，不改剧情节点、文案流程、选择逻辑、布局与既有动效，也未新增依赖。

### 交互模型

- 八张剧情画面各放一枚 9px 的暗紫色小点，落在该场景的母题上；其余画面不显示热点。
- 鼠标或触控笔悬停 450ms 后才展开纸条，离开立即收起；仅掠过不会弹字。键盘 Tab 聚焦时立即展开，不等 450ms。
- 点击小点可“钉住”纸条，移开鼠标后仍保留；再次点击取消。任何场景下按 Escape 收起。
- 选择项悬停/聚焦触发场景预览时，整个低语层卸载，避免与预览图争抢注意力；预览结束后恢复。
- 纸条无待机动画、无循环闪烁、无声音；减少动态效果时展开/收起不再过渡。
- 纸条使用与底部面板一致的米色纸面、细边与柔和阴影；小点与纸条都被场景圆角裁剪。命中区为 44×44px，小点居中。焦点态为米色描边加赤陶色外环，在深色插画与吉他木色上均可辨认。
- 覆盖层只让八个小点接收指针，其余区域 `pointer-events: none`；已验证热点不与 `.prelude-panel`、`.dialogue-panel` 交叠。
- 桌面窄至 760px 以下、以及 `pointer: coarse` / `hover: none` 的设备不渲染可交互热点，手机布局保持原样。

### 场景与文案

| 场景 | 母题 | 纸条文案 | 1440×900 实测小点中心 |
| --- | --- | --- | --- |
| home | 吉他 | 琴弦上还留着当年的指印。 | (973.7, 477.9) |
| connection | 话筒 | 信号只够传过来声音。 | (720.0, 250.7) |
| doubt | 拍立得 | 两张照片，背面写着同一天。 | (895.0, 241.9) |
| rehearsal | 乐谱 | 第三小节，改了很多次。 | (342.4, 209.4) |
| desk | 挂钟 | 秒针走得很慢，像在等回答。 | (720.0, 239.9) |
| question | 声波 | 有句话，被杂音轻轻吞掉了。 | (720.0, 354.0) |
| regret-quiet | 旧吉他 | 最旧的那根弦，一直没换。 | (768.2, 479.9) |
| closing | 信号波纹 | 波纹散开，又回到原处。 | (720.0, 302.9) |

热点按 SVG 设计坐标记录，运行时按 `object-fit: cover; object-position: center 46%` 的同一几何换算：`scale = max(W/1440, H/900)`，水平居中，垂直以 46% 对齐。使用 `ResizeObserver` 跟随窗口与面板尺寸，不依赖图片实际解码完成事件。已知热点在桌面 1024×768 与 1440×900 均不压住阅读面板；挂钟热点落在表盘下沿，纸条朝下，表针与刻度完整可见。

### 代码与可访问性

- 新增 [src/components/SceneWhispers.tsx](../../src/components/SceneWhispers.tsx)：场景到热点的静态表、覆盖坐标换算、悬停计时、钉住与 Escape 状态、尺寸监听。没有第三方库。
- [src/App.tsx](../../src/App.tsx) 在场景背景之后挂载 `<SceneWhispers scene={sceneName} />`，仅当 `previewScene === null`；热点位于 `aria-hidden` 的场景图片之外。
- [src/index.css](../../src/index.css) 增加桌面热点、纸条、尾巴、焦点环与响应式隐藏规则；不使用新的全局变量。
- 每个热点是原生 `<button>`，可访问名称为“画面细节”，说明通过 `aria-describedby` 指向纸条。CDP 可访问性树实测：`role = button`、`name = 画面细节`、`description = 琴弦上还留着当年的指印。`；读屏不会把纸条当作重复的可见文本再次朗读。
- 焦点顺序中热点位于主行动“开始体验”之前；Tab 实测可直接到达并显示焦点环，Enter 实测可切换钉住。
- 390 手机端组件因媒体查询为 `display: none`，同时不渲染按钮（尺寸测得为 0），不会留下不可见但仍可聚焦或点击的元素。减少动态效果下纸条 `transition-duration` 为 `0s`。

### 本轮验证

环境：独立无头 Edge `157.0.4341.60`，真实鼠标事件与键盘 Tab，生产预览 `http://127.0.0.1:4173/`（本轮构建产物）。命令均退出 0：

| 检查 | 实际结果 | 原始输出 |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` 通过 | [whisper-typecheck.txt](assets/TASK-003/whisper-typecheck.txt) |
| `npm run test:story` | 15/15 通过，0 failed | [whisper-test-story.txt](assets/TASK-003/whisper-test-story.txt) |
| `npm run build` | 20 modules；CSS 37.92 kB / gzip 8.61 kB；JS 245.08 kB / gzip 76.79 kB | [whisper-build.txt](assets/TASK-003/whisper-build.txt) |
| 既有布局检查 | `all galgame layout checks passed`，三屏与对白/选择/预览无回退 | 重跑未覆盖旧截图与 JSON |
| 既有动效检查 | `all scene and motion checks passed`，24 张画面与减少动态效果无回退 | — |
| 换场检查 | 所有换场最短覆盖率 1.000，0 空白帧 | 重跑未覆盖旧截图与 JSON |

新增 [whisper-checks.mjs](assets/TASK-003/whisper-checks.mjs)，17 项检查全部通过，完整数据见 [whisper-checks.json](assets/TASK-003/whisper-checks.json)；`failures` 与 `consoleEvents` 均为 `[]`：

| 检查 | 实测 |
| --- | --- |
| 八张剧情画面 | 均只有一枚热点，文案与表格一致；首次到达时纸条关闭 |
| 悬停意图 | 悬停 240ms 时透明度仍为 0；450ms 后展开，最终透明度 1.000 |
| 键盘焦点 | Tab 直接聚焦热点，`:focus-visible` 为 true，纸条立即展开 |
| 钉住与 Escape | 点击后移开鼠标仍保留；Escape 后透明度回到 0 |
| 键盘钉住 | 焦点下按 Enter，再 Tab 移开焦点，纸条仍保留；Escape 后关闭 |
| 尺寸与命中 | 命中区 44×44；小点中心的可命中元素为热点本身 |
| 面板避让 | 1440×900 与 1024×768 下，首页与通话场景热点均不与纸面面板相交 |
| 预览暂停 | 悬停选项时低语层数量为 0；移开后恢复为 1 |
| 可访问性树 | `button` / `画面细节` / 纸条文案作为 description |
| 减少动态效果 | 纸条过渡为 `0s`，展开后仍可读 |
| 手机 390 | 覆盖层 `display: none`，不渲染可点击按钮 |

实际截图：[首页悬停 1440](assets/TASK-003/whisper-home-hover-1440.png)、[首页键盘焦点 1440](assets/TASK-003/whisper-home-keyboard-1440.png)、[接起电话 1440](assets/TASK-003/whisper-connection-hover-1440.png)、[质疑照片 1440](assets/TASK-003/whisper-doubt-hover-1440.png)、[排练乐谱 1440](assets/TASK-003/whisper-scene-rehearsal-1440.png)、[实习挂钟 1440](assets/TASK-003/whisper-scene-desk-1440.png)、[追问声波 1440](assets/TASK-003/whisper-scene-question-1440.png)、[不安旧吉他 1440](assets/TASK-003/whisper-scene-regret-quiet-1440.png)、[共同衔接波纹 1440](assets/TASK-003/whisper-scene-closing-1440.png)、[首页悬停 1024](assets/TASK-003/whisper-home-1024.png)、[手机 390](assets/TASK-003/whisper-mobile-home-390.png)。已逐张目视：纸条在场景圆角内，尾巴指向小点，未遮住右上标题、底部对白或主行动按钮。

### 备份与回退

开始前已把原文件复制到 `/Users/zeh/Documents/elsewhere-backups/2026-11-20-pre-whisper/`（`SceneBackground.tsx`、`App.tsx`、`index.css`），并记录基线提交 `ae59b15` 于 `BASELINE_COMMIT.txt`。回退本轮只需：

```bash
rm src/components/SceneWhispers.tsx
git restore --source=ae59b15 -- src/App.tsx src/index.css
```

`SceneBackground.tsx` 本轮未改动；备份目录保留完整副本，可在不回滚 Git 的情况下逐文件对照。

### 限制

低语热点按设计只在桌面鼠标与键盘环境出现，没有手机触摸替代交互；未使用实体手机或平板，未在 Safari/Firefox 实测，未运行 VoiceOver/NVDA 等真实读屏（可访问性结论来自 Chromium 可访问性树）。小点需要用户主动发现，本轮没有加入首次提示动画或教学层。纸条会遮住母题周围一小块插画，已通过调整挂钟热点到表盘下沿、限制纸条宽度减少遮挡。该交互尚未经 Codex 复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务。

## 32. 物件辉光与边缘光（替代小点，桌面悬停）

日期：2026-11-20（Asia/Shanghai）。团队先要求“可交互物件不要用点来引导，用物体周围的淡淡的暖色辉光来吸引视线”，随后要求“加一个呼吸，并且扩大交互面积，只要鼠标接触这团辉光就可以触发。像吉他这类物件你重新设计一个边缘光方案”，并选定八物件混合方案：“就这样”。本轮只替换桌面低语热点的视觉引导与命中方式，不改剧情、文案、选择、面板布局、场景插画和手机端布局，也未新增依赖。

### 视觉与交互模型

- 移除全部 9px 暗紫小点。八张剧情画面改为物件自身发光，暖色取自现有插画的灯与木色，不再出现独立的 UI 标记。
- 按团队选定清单分两种光：
  - 边缘光：首页吉他、排练乐谱、不安结局旧吉他。沿物件轮廓生成方向性边缘光，亮部朝向场景光源，暗部收在背光侧。
  - 呼吸辉光：接听话筒、质疑照片、实习挂钟、追问声波、共同衔接波纹。物件周围一团柔和椭圆光晕。
- 两种光都以 6.8s 周期呼吸：静止时低亮度，峰值约 1.5 倍；悬停或键盘聚焦时整体平滑提亮，并保留呼吸，不会突然定格。
- 命中区从 44×44px 扩大到覆盖物件与辉光：1440×900 实测宽 275–354px、高 216–334px。鼠标或触控笔进入辉光范围即计时展开纸条，移出立即收起；点击钉住、Escape 收起、Tab 聚焦立即展开的规则保持不变。
- 辉光层位于场景插画之上、正文内容之下，使用 `screen` 混合；纸条与按钮位于内容之上，不改变既有阅读层级。手机、粗指针设备和 `max-width: 759px` 继续隐藏该层。

### 实现要点

- 八物件坐标与台词沿用第 31 节，按新命中区重新校准；纸条锚点仍在物件母题上，尾巴指向发光物件。
- 边缘光由 SVG 轮廓 + `feMorphology` 外扩 + `feComposite` 取环 + 模糊 + 暖色填充构成，再用线性渐变遮罩控制受光方向。吉他使用独立琴身、琴颈、琴头轮廓；乐谱使用圆角矩形轮廓。乐谱内部有轻微摆动，故采用更宽的外扩与模糊，避免细边在摆动时脱节。
- 吉他与乐谱的边缘光变换直接复用场景相机参数（首页/不安结局的吉他、排练的乐谱），与插画使用同一套 `translate/scale/rotate`，因此换场与窄屏裁切后仍贴合物件，不依赖位图轮廓识别。
- 呼吸亮度通过 `@property` 注册的四个数值变量驱动，CSS 变量参与 `opacity` 关键帧；悬停时提高上下限，过渡由变量自身插值完成。减少动态效果下停止动画，只保留静态亮度。
- 为保证边缘光不被缩放带偏，移除 `.scene-background-image` 上 38s 的 `scene-drift` 整体缓慢缩放；雨丝、尘埃、灯光、信号等 SVG 内部动效全部保留。场景插画现在 `transform: none`。
- 首页命中区上沿覆盖琴头（场景坐标 y=330），下沿在 1024×768 下仍高于阅读面板；不安结局的命中区按同一规则收短。其余物件不与任何 `.prelude-panel` / `.dialogue-panel` 相交。

### 本轮验证

环境：macOS arm64、Node v24.22.1、独立无头 Edge `157.0.4341.60`、生产预览 `http://127.0.0.1:4173/`（本轮构建产物）。以下命令均退出 0：

| 检查 | 实际结果 | 原始输出 |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` 通过 | [glow-typecheck.txt](assets/TASK-003/glow-typecheck.txt) |
| `npm run test:story` | 15/15 通过，0 failed | [glow-test-story.txt](assets/TASK-003/glow-test-story.txt) |
| `npm run build` | 20 modules；CSS 38.69 kB / gzip 8.77 kB；JS 249.22 kB / gzip 78.07 kB | [glow-build.txt](assets/TASK-003/glow-build.txt) |
| Galgame 布局检查 | `all galgame layout checks passed`，`failures` / `consoleEvents` 均为 `[]` | [galgame-layout-checks.json](assets/TASK-003/galgame-layout-checks.json) |
| 场景与动效检查 | `all scene and motion checks passed`，雨丝与尘埃仍运行；场景图 `animation: none`、`transform: none`；减少动态效果下两者都停止 | [scene-motion-checks.json](assets/TASK-003/scene-motion-checks.json) |

新增 [glow-checks.mjs](assets/TASK-003/glow-checks.mjs)，19 项检查全部通过，完整数据见 [glow-checks.json](assets/TASK-003/glow-checks.json)；`failures` 与 `consoleEvents` 均为 `[]`：

| 检查 | 实测 |
| --- | --- |
| 八张画面 | 每张只有一团辉光；吉他/乐谱场景各有 1 处边缘光，其余 0；无残留小点 |
| 层级 | 辉光层 `z-index: 5`、`mix-blend-mode: screen`；按钮 `z-index: 21`，展开时 22；辉光不拦截指针 |
| 呼吸 | 默认 `whisper-halo-breathe` / `whisper-edge-breathe` 运行；首页静置时光晕透明度 0.511、边缘光 0.472 |
| 悬停提亮 | 进入辉光 450ms 后纸条展开，光晕 0.810、边缘光 0.804；离开关闭 |
| 命中区 | 1440×900 下 275–354px 宽、216–334px 高，远大于 44px；命中区内的最上层元素就是按钮 |
| 偏移命中 | 在命中区边缘（宽 22%、高 18%）进入也能展开，验证“接触辉光即触发”，而非只有物件中心 |
| 面板避让 | 1440×900、1024×768、768×900 下，首页、通话、质疑照片、不安旧吉他的命中区与纸条均不与纸面面板相交 |
| 键盘 | Tab 聚焦即展开，焦点环透明度 1；Enter 钉住后 Tab 移开仍保留；Escape 关闭 |
| 点击 | 点击钉住，Escape 关闭 |
| 可访问性树 | `button` / `画面细节` / 台词作为 description |
| 预览暂停 | 选项预览时低语层卸载，移开后恢复 |
| 减少动态效果 | 呼吸动画为 `none`；光晕静态 0.86、边缘光 0.82；纸条过渡 0s，展开后仍可读 |
| 手机 390 | 覆盖层 `display: none`，辉光 SVG 宽度为 0，不会留下可聚焦的隐形按钮 |

实际截图（均已逐张目视纸条在圆角内、不压标题与主行动；辉光贴合物件）：

[首页静置 1440](assets/TASK-003/glow-home-idle-1440.png) · [首页悬停 1440](assets/TASK-003/glow-home-hover-1440.png) · [首页键盘焦点 1440](assets/TASK-003/glow-home-keyboard-1440.png) · [接听话筒 1440](assets/TASK-003/glow-connection-hover-1440.png) · [质疑照片 1440](assets/TASK-003/glow-doubt-hover-1440.png) · [排练乐谱 1440](assets/TASK-003/glow-rehearsal-hover-1440.png) · [实习挂钟 1440](assets/TASK-003/glow-desk-hover-1440.png) · [追问声波 1440](assets/TASK-003/glow-question-hover-1440.png) · [不安旧吉他 1440](assets/TASK-003/glow-regret-quiet-hover-1440.png) · [共同衔接波纹 1440](assets/TASK-003/glow-closing-hover-1440.png) · [首页 1024](assets/TASK-003/glow-home-1024.png) · [不安旧吉他 1024](assets/TASK-003/glow-regret-quiet-hover-1024.png) · [首页 768](assets/TASK-003/glow-home-768.png) · [手机 390](assets/TASK-003/glow-mobile-home-390.png)

设计过程参考图：[旧小点对照](assets/TASK-003/reference-guitar-before-dot.png)、[边缘光静置](assets/TASK-003/reference-guitar-edge-hover.png)、[呼吸低点](assets/TASK-003/reference-guitar-edge-low-crop.png)、[呼吸高点](assets/TASK-003/reference-guitar-edge-high-crop.png)、[呼吸示意](assets/TASK-003/reference-guitar-edge-breath.gif)。

### 备份与回退

开始前已把原文件复制到 `/Users/zeh/Documents/elsewhere-backups/2026-11-20-pre-glow/`（`SceneWhispers.tsx`、`App.tsx`、`index.css`、`scripts/generate-backgrounds.mjs`），基线提交 `9a867c8` 记录于 `BASELINE_COMMIT.txt`。本轮实际只改 `src/components/SceneWhispers.tsx` 与 `src/index.css`；回退命令：

```bash
git restore --source=9a867c8 -- src/components/SceneWhispers.tsx src/index.css
```

`App.tsx`、场景生成脚本与全部 SVG 背景本轮未改动；备份目录保留完整副本，可在不回滚 Git 的情况下逐文件对照。

### 限制

- 悬停仍保留 450ms 意图延迟：只有进入辉光并停留约半秒才展开，避免大命中区被鼠标横扫时连续弹字；它略长于“接触即触发”的字面预期，若团队希望更即时可单独调短。
- 辉光与边缘光是静态几何叠加，不逐帧读取插画像素；乐谱内部摆动幅度小，已用更宽边缘容忍，但极端缩小窗口时仍可能出现 1–2px 的贴合误差。
- 首页命中区为避开 1024×768 的阅读面板，下沿停在吉他下侧，未覆盖面板下方的空白画面。
- 该交互只在桌面鼠标/触控笔与键盘出现，没有手机触摸替代；未使用实体手机或平板，未在 Safari/Firefox 实测，未运行真实读屏（可访问性结论来自 Chromium 可访问性树）。
- 本轮重跑 Galgame 布局与场景动效检查时，重新生成了对应截图和 JSON（不再包含小点）；本改动尚未经 Codex 复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务。

## 33. 重复道具清理（场景母题只保留一份）

日期：2026-11-20（Asia/Shanghai）。团队在查看画面后指出“为什么有几个画面有两个相同的东西”，确认后要求“重复道具清理”。本轮只调整场景插画的共享房间道具，不改辉光交互、剧情、文案、布局和手机端规则；舞台母题（乐谱、吉他、台灯）在每张画面里只保留一份。

### 处理原则

左右两间房是“现实 / 平行世界”的双联构图，窗、桌、书架、显示器等房间家具会成对出现，这是刻意保留的对照关系。清理的是**同一类叙事母题的重复**：当画面中央已经有乐谱、吉他或台灯时，不再让共享房间里出现第二件同类物件。

| 画面 | 重复来源 | 处理 |
| --- | --- | --- |
| rehearsal / music | 右房墙上固定挂一张装饰乐谱，画面中央又有一张乐谱或浮动五线谱 | 隐藏墙上装饰乐谱，只留中央母题 |
| regret / make-space | 右房固定放一把吉他，中央母题又有一把 | 隐藏右房吉他，只留中央吉他 |
| ending-regret-space / ending-cherish-space | 同上的“留出空间”母题叠加右房吉他 | 隐藏右房吉他 |
| cherish / cherish-morning | 左房书桌有一盏台灯，中央又有一盏落地灯 | 隐藏书桌台灯，只留中央落地灯 |

### 实现

- [scripts/generate-backgrounds.mjs](../../scripts/generate-backgrounds.mjs) 把书桌台灯、墙上乐谱、右房吉他拆成独立片段，房间函数接收开关：`leftRoom({ showLamp })`、`rightRoom({ showSheet, showGuitar })`。
- `renderScene` 按母题推导开关：`sheet` / `music` 隐藏墙上乐谱；`guitar` / `space` 隐藏右房吉他；`lamp` 隐藏书桌台灯。其余画面保持原样。
- 重新生成全部 24 张 SVG，只有 8 张受影响：`rehearsal`、`music`、`regret`、`make-space`、`ending-regret-space`、`ending-cherish-space`、`cherish`、`cherish-morning`；其余 16 张逐字节未变。
- 清理后逐张检查：排练/音乐各 1 份乐谱，后悔/留出空间/两种结局各 1 把吉他，珍惜/珍惜清晨各 1 盏灯。
- 质疑画面的两张拍立得**保留**：台词即“两张照片，背面写着同一天”，属于剧情线索，不是重复道具。
- 共享房间的窗、桌、灯位等对照关系不变；只移除与母题撞车的物件。

### 本轮验证

环境同第 32 节，生产预览 `http://127.0.0.1:4173/`（本轮构建产物）。命令均退出 0：

| 检查 | 实际结果 | 原始输出 |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` 通过 | [dedup-typecheck.txt](assets/TASK-003/dedup-typecheck.txt) |
| `npm run test:story` | 15/15 通过，0 failed | [dedup-test-story.txt](assets/TASK-003/dedup-test-story.txt) |
| `npm run build` | 20 modules；CSS 38.69 kB / gzip 8.77 kB；JS 249.22 kB / gzip 78.07 kB | [dedup-build.txt](assets/TASK-003/dedup-build.txt) |
| 低语交互检查 | 19 项全部通过，`failures` / `consoleEvents` 均为 `[]`；排练边缘光仍贴住唯一一张乐谱 | [glow-checks.json](assets/TASK-003/glow-checks.json) |
| Galgame 布局检查 | `all galgame layout checks passed` | [galgame-layout-checks.json](assets/TASK-003/galgame-layout-checks.json) |
| 场景与动效检查 | `all scene and motion checks passed` | [scene-motion-checks.json](assets/TASK-003/scene-motion-checks.json) |

场景画面已逐张目视：

[排练：只剩中央乐谱](assets/TASK-003/dedup-rehearsal-1440.png) · [后悔：只剩中央吉他](assets/TASK-003/dedup-regret-1440.png) · [留出空间：只剩中央吉他](assets/TASK-003/dedup-make-space-1440.png) · [珍惜清晨：只剩中央落地灯](assets/TASK-003/dedup-cherish-morning-1440.png)

应用内截图：[排练悬停（新背景）](assets/TASK-003/glow-rehearsal-hover-1440.png)、[后悔反馈 1440](assets/TASK-003/galgame-feedback-1440.png)、[行动反馈 1440](assets/TASK-003/galgame-feedback-action-1440.png)、[结局 1440](assets/TASK-003/galgame-ending-1440.png)、[珍惜清晨 390](assets/TASK-003/galgame-scene-cherish-morning-390.png)。

### 备份与回退

开始前已备份到 `/Users/zeh/Documents/elsewhere-backups/2026-11-20-pre-dedup/`：生成脚本、全部 `backgrounds/` SVG，以及基线提交 `af05de1`。回退：

```bash
git restore --source=af05de1 -- scripts/generate-backgrounds.mjs public/backgrounds
```

### 限制

- 左右两间房的窗、桌、书架、显示器仍按双联构图成对出现；本轮没有把两间房彻底改成不同布局。
- 质疑画面的两张拍立得、接听/追问/衔接的“电话图标 + 声波/波纹”属于剧情语义，未按重复道具清理。
- 未使用实体手机或平板，未在 Safari/Firefox 实测。本轮改动尚未经 Codex 复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务。

## 34. 点击画面任意处继续下一句

日期：2026-11-20（Asia/Shanghai）。团队要求“在继续的时候我要求点击屏幕上任何地方都能跳到下一句”。本轮只增加对话推进的指针捷径，不改变“继续”按钮、键盘焦点、剧情节点、选项和结局逻辑。

### 行为

- 当画面底部显示“继续”时（对话、回应反馈、行动反馈、通话衔接），点击画面任意非交互区域都推进到下一句，包括背景插画、场景留白、对白纸面、说话人标签与进度文字。
- 以下情况不推进：
  - 顶部“结束通话”按钮、右下“继续”按钮、返回/重听/结局按钮等所有原生按钮；
  - 第一次/第二次选择画面，点击空白不会替玩家做选择；
  - 结局画面，点击空白不会重开或返回；
  - 首页、来电前言、来电提示画面；
  - 确认结束通话的弹窗内及其遮罩；
  - 正在选中文字时（避免拖选台词后误跳）。
- “继续”按钮仍然保留为可聚焦、可键盘操作的标准按钮；点击它只推进一句，不会因事件冒泡再推进一句。
- 低语热点仍是按钮：点击它只展开/钉住纸条，不推进剧情；再点画面空白才继续。

### 实现

- [src/App.tsx](../../src/App.tsx) 在根容器 `.app-background` 上增加 `advanceOnSurfaceClick`。
- 仅在 `view === 'call'` 且当前节点为 `dialogue` / `feedback` / `closing`、确认弹窗未打开时生效。
- 通过 `target.closest('button, a, input, select, textarea, dialog, [role="dialog"]')` 排除交互控件，避免与“继续”“结束通话”、低语热点、选项和弹窗冲突。
- 非空文本选区直接返回，不推进。
- 没有新增路由、状态库或依赖；没有把根容器改成可聚焦控件，键盘与读屏仍使用原有的“继续”按钮。

### 本轮验证

环境同第 32 节。`npm run typecheck`、15/15 剧情测试、构建均通过，原始输出见 [click-typecheck.txt](assets/TASK-003/click-typecheck.txt)、[click-test-story.txt](assets/TASK-003/click-test-story.txt)、[click-build.txt](assets/TASK-003/click-build.txt)。

新增 [click-advance-checks.mjs](assets/TASK-003/click-advance-checks.mjs)，真实鼠标事件 15 项检查全部通过，数据见 [click-advance-checks.json](assets/TASK-003/click-advance-checks.json)，`failures` 与 `consoleEvents` 均为 `[]`：

| 检查 | 实测 |
| --- | --- |
| 首页 / 前言 / 来电提示 | 点击空白后视图不变，不会误入剧情 |
| 空白处推进 | 点击背景从“主线 01 / 07”推进到“主线 02 / 07”，台词同步改变 |
| 对白纸面 | 点击台词文本从 02 推进到 03 |
| “继续”按钮 | 从 03 只推进到 04，没有因冒泡跳两句 |
| “结束通话” | 点击只打开确认弹窗，台词与进度不变；取消后仍停在同一句 |
| 低语热点 | 点击排练乐谱热点只展开纸条，进度仍为 05；再点空白推进到 06 |
| 第一次选择 | 点击空白不会选中选项，选项仍为 2 个、进度仍为“选择 01 / 02” |
| 回应反馈 / 衔接 | 空白点击可连续推进两句反馈，并进入“共同衔接” |
| 第二次选择 | 点击空白不会选中选项，选项仍为 2 个、进度仍为“选择 02 / 02” |
| 行动反馈 / 尾声 | 空白点击从“行动反馈”推进到“通话尾声”，再进入结局 |
| 结局 | 点击空白不会重开，结局标题保持“把旋律找回来” |
| 手机 390 | 点击背景从 01 推进到 02，视图与进度正确 |
| 控制台 | 0 个失败请求、0 条 console error/warning |

回归重跑：低语交互 19 项、Galgame 布局检查、场景与动效检查全部通过，对应 JSON 已更新。

### 备份与回退

开始前已把原 `App.tsx` 备份到 `/Users/zeh/Documents/elsewhere-backups/2026-11-20-pre-click-advance/`，基线提交 `ac91aaa`。回退：

```bash
git restore --source=ac91aaa -- src/App.tsx
```

### 限制

- 只增加指针点击捷径；没有新增“按空格/方向键任意位置继续”的全局键盘快捷键，键盘仍走“继续”按钮。
- 手机与桌面均用 Chromium 无头浏览器验证；未在实体手机、Safari 或 Firefox 实测。
- 点击画面会推进，意味着想单纯观察背景时也可能跳句；这是本轮要求的行为，若之后需要“锁定画面”或“回看上一句”，需另立任务。
- 本轮尚未经 Codex 复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务。

## 35. 页面切换过渡动画

日期：2026-11-20（Asia/Shanghai）。团队要求“给页面切换加上过渡动画”。本轮增加页面级淡入上移与台词淡入，复用现有背景交叉淡化，不改变剧情、按钮、点击任意处推进和防闪烁逻辑。

### 动画设计

- 页面级：首页、前言、来电提示、对话、第一次选择、第二次选择、结局各自作为一个页面状态。切换时新页面用 380ms 从下方 10px 处淡入，透明度 0 → 1；顶部品牌、通话标题与背景不参与位移。
- 台词级：同一对话页内推进到下一句时，台词用 240ms 从下方 5px 处淡入。说话人、进度、继续按钮不移动，避免每句话都像换整页。
- 背景：继续使用既有 240ms 场景层交叉淡化，不新增白色遮罩、不缩放场景图，避免此前修过的闪烁和辉光错位。
- 选择、结局等页面状态有独立页面动画；选项悬停预览只切换背景，不重播页面动画。
- 减少动态效果：沿用全局 `prefers-reduced-motion` 规则，页面与台词动画都不执行，内容直接以最终位置显示。
- 动画只改变透明度和位移，不拦截点击；动画进行中点击空白仍可正常推进。

### 实现

- [src/App.tsx](../../src/App.tsx)：按 `view` 与节点类型生成 `screenKey`（`home`、`intro`、`incoming`、`call-dialogue`、`call-first-response`、`call-next-step`、`call-end`），用带 `key` 的 `.screen-transition` 包裹当前页面；台词 `<p>` 以节点 id 为 key。
- [src/index.css](../../src/index.css)：新增 `.screen-transition` 的 `screen-page-in` 与 `.dialogue-line` 的 `dialogue-line-in`；`.screen-transition` 作为 `flex: 1` 的列容器，保持首页、来电与结局原有的一屏布局。
- 旧页面在新页面淡入时卸载，不做双向交叉淡入；背景层的交叉淡化继续承担“场景不闪白”的过渡。

### 本轮验证

环境同第 32 节。`npm run typecheck`、15/15 剧情测试、构建通过，原始输出见 [transition-typecheck.txt](assets/TASK-003/transition-typecheck.txt)、[transition-test-story.txt](assets/TASK-003/transition-test-story.txt)、[transition-build.txt](assets/TASK-003/transition-build.txt)。

新增 [page-transition-checks.mjs](assets/TASK-003/page-transition-checks.mjs)，8 项真实浏览器检查全部通过，数据见 [page-transition-checks.json](assets/TASK-003/page-transition-checks.json)，`failures` 与 `consoleEvents` 均为 `[]`：

| 检查 | 实测 |
| --- | --- |
| 首页入场 | `screen-page-in` 运行，结束后透明度 1、位移归零 |
| 首页 → 前言 | 新页面 380ms 淡入上移；中途透明度小于 1，结束后为 1 |
| 前言 → 来电 → 对话 | 每次页面状态变化都触发页面动画，对话页正常落位 |
| 台词推进 | `.dialogue-line` 运行 `dialogue-line-in`，结束后透明度 1、位移归零 |
| 第一次选择 | 选择页使用独立页面动画，选项与面板落位正常 |
| 选择反馈 | 返回对话页时再次触发页面动画，不残留上一页位移 |
| 减少动态效果 | 页面与台词 `animation-name` 均为 `none`，内容透明度 1 |
| 手机 390 | 页面动画正常，首页与前言无横向溢出 |

过渡中途截图：[前言淡入中 1440](assets/TASK-003/transition-intro-early-1440.png)、[台词淡入中 1440](assets/TASK-003/transition-dialogue-line-early-1440.png)。两张均为深色背景上的半透明内容，没有白色闪屏。

回归检查：点击任意处推进 15 项、低语交互 19 项、场景与动效检查全部通过。Galgame 布局检查初次在动画中途测量首页/前言按钮，出现 3px 的假差异；已在 [galgame-layout-checks.mjs](assets/TASK-003/galgame-layout-checks.mjs) 的 `snapshot()` 中等待 `.screen-transition` 动画结束后再测量，复跑结果为 `all galgame layout checks passed`，不是放宽位置阈值。

### 备份与回退

开始前已备份 `App.tsx`、`index.css` 到 `/Users/zeh/Documents/elsewhere-backups/2026-11-20-pre-page-transition/`，基线提交 `965c1b2`。回退：

```bash
git restore --source=965c1b2 -- src/App.tsx src/index.css
```

### 限制

- 只有新页面淡入，没有旧页面淡出或双向交叉淡化；切换瞬间旧内容会被卸载，背景层保持连续。
- 页面动画统一向上淡入，不区分前进和后退方向。
- 台词动画按节点 id 触发；选项页、结局页走页面动画，不单独给选项文字加入场动画。
- 未在实体手机、Safari 或 Firefox 实测；本轮尚未经 Codex 复审，不据此自称 PASS；未合并 main、未部署、未进入下一任务。
