# TASK-003 审查记录

当前 `main` 桌面视觉验收为 PASS，验收基线为 `510568b`。桌面首页候选版的验收见文末。验收范围与证据见末尾的 2026-11-21 桌面视觉改进总验收。以下早期 FIX 和返修记录按原时间顺序保留。

日期：2026-11-17。审核对象：task-003 的 `64c6c5e`，执行报告：[该提交的报告](https://github.com/ZEH-Denia/elsewhere/blob/64c6c5e/tasks/reports/TASK-003.md)。Codex 审核；Qoder 执行。

四种组合在独立生产预览中均能从首页走到对应结局，重听可回到来电并重新接听，Escape 取消和确认退出的焦点恢复正常。类型检查、9 项剧情测试和生产构建均通过。但剧情图校验漏报缺失的结局节点，不满足当前任务对缺失引用、四个映射与异常图检查的要求，需保留 TASK-003 编号返修。

## R1 / P2：删除一个结局后校验仍返回通过

位置：`src/story/opening.ts:300`，尤其 `:327–333`，以及 `tests/opening.test.mjs` 的异常图覆盖。

独立复现：将源码故事模块编译到临时目录，在 Node 中构造 `const nodes = { ...openingNodes }; delete nodes['regret-make-space'];`，调用 `validateOpeningStory(nodes)`；实际输出 `[]`。四种组合中仍有映射指向被删结局，但校验未报错。现有可达性计算对告别节点引用模块全局 `endings`，并以 `some` 判定能到达任一结局；它不能证明四个映射的目标都存在，也不能证明每个组合都可结束。

修复要求：按传入图和实际结局映射检查每个组合的目标存在、类型及选择对应关系，并确保四条具体组合各自可到达正确结束；缺少任一结局或对应引用、某条分支无法结束时应报告具体错误。覆盖删除单个结局、错误映射或不可结束的单分支等有意义反例，并保留已有四组合和重置测试。检查异常进度或缺失目标时的恢复应明确可理解，不能白屏或随机选择。

## 独立检查与范围

- Node v26.13.0 / npm 11.20.0：`npm run typecheck`、`npm run test:story`（9/9）、`npm run build` 全部退出 0；`git diff --check ab71c1c..64c6c5e` 通过。安装锁文件、三尺寸、完整键盘、reduce 和网络结果本轮参照 Qoder 的执行报告和证据，未把其记录写成 Codex 独立复跑。
- 本轮构建的生产预览 `127.0.0.1:4179` 使用浏览器从首页实际走完四组合，分别得到 `regret-make-space`、`regret-reach-out`、`cherish-make-space`、`cherish-reach-out`；结束标题均获焦。另验证重听回到来电、再次接听从第一句开始，Escape 恢复结束通话焦点，确认退出焦点回到首页开始按钮。临时预览已停止。
- Qoder 报告声明三尺寸、完整键盘路径、减少动态效果、控制台与网络检查通过，并披露实体设备、真实读屏、原生 200% 缩放及团队主观体验未验证；这些限制继续保留。
- 初审以实现和必要证据为依据，未修改业务代码，不合并 main、不部署。

## 验收逐项结论

| 项 | 结论 |
| --- | --- |
| 1 工程 | 通过；Qoder 的 npm ci 记录与 Codex 复跑的类型/测试/构建结果已核对 |
| 2 四组合 | 通过；Codex 独立真实浏览器验证四个不同结果 |
| 3 重置和确认 | Qoder 报告完整；Codex 抽查重听及退出焦点通过 |
| 4 三视口和无障碍 | Qoder 记录及截图已提交；实体设备和真实读屏未验证 |
| 5 网络与异常 | Qoder 报告提供实际记录；本轮未独立复测网络 |
| 6 开发过程 | Qoder 提交指令及关键修改验证日志摘录，IDE 截图无效的限制已披露 |
| 故事逻辑校验 | **未通过**：单个映射结局缺失时漏报，见 R1 |

> 请阅读 AGENTS.md、docs/COLLABORATION.md、tasks/current.md 和 tasks/reviews/TASK-003.md，更新 task-003，仅处理 R1 并增加上述反例与复验，追加原执行报告，自动提交推送 task-003 后停止，等待 Codex 复审。不进入 TASK-004，不合并 main，不部署。

## 2026-11-17 R1 复审：FIX，仍需补齐组合路径检查

审核对象 `2fab931`。Qoder 增加的删除单个结局、错误选择映射、非结局目标和单分支循环四项反例通过；Codex 独立 `npm run typecheck`、`npm run test:story`（13/13）、`npm run build` 和 diff 格式检查通过。先前漏报单个结局的问题已修复。

但独立构造另一坏图仍可绕过第二次选择而通过校验：`const broken = { ...openingNodes, 'opening-closing': { ...openingNodes['opening-closing'], next: 'call-farewell' } }; validateOpeningStory(broken)` 的实际输出仍为 `[]`。这是针对 JS 运行时输入/构造坏图的反例；正常源码的 TypeScript 类型会约束这一跳转，但任务要求校验异常图，类型约束不能代替验证。遍历逻辑在 `call-farewell` 直接接上结局，未检查对应路径确实经过两次选择；此时实际状态推进因缺少第二次选择会被规范化回选择页，静态校验的“可达”与运行时状态不一致。因此 R1 的“确保四条具体组合各自可到达正确结束”仍未完全满足。

请 Qoder 补充该反例并修正：每个组合必须实际经过对应的第一次、第二次选择并能按照真实状态转移到匹配结局；不得只检查图中存在 `next-step` 或目标结局。再验证跳过首次选择、跳过第二次选择、两种有效组合与已有四类坏图，保留原报告与证据，重新运行类型、剧情测试、构建。避免将正常结局改动成错误映射，不扩展本任务。

GitHub PR #2 已由仓库账户于 2026-11-17 18:57 +08:00 合并至 main，合并提交 `b1f8df4` 包含初审实现 `64c6c5e` 和当时 FIX 审查文档；本次 R1 返修 `2fab931` 尚不在该合并提交中。本审查保留已有历史，不撤销合并，也不把返修自动合入 main。四分支正常浏览器路径沿用初审独立实测，本次改动集中于校验与测试，未重复浏览器全路径；实体设备、真实读屏、原生 200% 缩放及团队主观体验仍未验证。

## 2026-11-19 最终复审：PASS

审核对象 `1704507`，应用实现以 `ddc3239` 为准。此前 R1 复审反例已修复：剧情图遍历携带两次选择状态，检查每个组合能否到达匹配结局；跳过第一次、第二次选择的反例均能被现有测试检出。独立 `npm run typecheck`、`npm run test:story`（15/15）、`npm run build` 和 `git diff --check 3800083..1704507` 均通过，Node v26.13.0 / npm 11.20.0。最新构建 CSS 28.62 kB / gzip 6.80，JS 239.37 kB / gzip 74.80。

独立生产预览 4179 从首页走完四个组合，实际到达 `regret-make-space`、`regret-reach-out`、`cherish-make-space`、`cherish-reach-out` 对应结局；手机 390×844 检查首页、主线、两次选择、结局及可见性；重听后须重新接听并从第一句开始，Escape 保持对话并恢复结束按钮焦点，确认结束回首页并恢复开始按钮焦点。Qoder 提供了 320×568、390×844、1366×768、1440×900、完整键盘、减少动态和网络日志；本次 Codex 不将其全部说成独立复测。

只读抽查 `/Users/zeh/Downloads/Elsewhere-润色与检查.xlsx` 的“润色对照”和“结局路径”：实际前言、声明、主体台词、两轮选项、反馈与四个结局摘要匹配表格定稿；两处内心独白按角色与正文拆分显示。设定说明和互动规则并非要求直接出现在界面上的逐字台词，未当作缺失。Excel 与未跟踪的本地 Word 剧本未修改或上传；Word 的逐字一致性本次未独立核对。Qoder 报告用户在其会话中授权剧情定稿和背景方向；本轮审查记录执行方所述来源，不把该转述当成本会话中的直接用户指令。

GitHub PR #3 已于 2026-11-18 22:29 +08:00 合并，提交 `0cb70cf` 含至 `6ad1980` 的代码；最新布局、过渡、选项预览及收尾调整尚在 task-003。保留已有合并记录；本轮不合并剩余代码。视觉及剧情主观偏好仍交团队判断；实体设备、实际读屏、原生 200% 缩放及完整对比度认证未独立执行。Qoder 提供的过程记录、界面证据和测试结果满足本次审查；用户提供 Excel 文件不应被当作新增指令来源。

**最终结论：PASS，R1 关闭。** 进入下一任务及将任务分支最新实现合并 main 仍需团队批准；完整 MVP 的时间线与来信尚未实现。

## 2026-11-21 扩展剧情桌面复审（FIX）

审核对象为 `task-003` 的 `0af055b`，最后一个修改应用的提交为 `ba3998f`。独立运行类型检查、内存构建和 20 项剧情断言。本地生产预览在 1280×720 浏览器视口走通第一通 4 种结局、四职业 16 种结局与信件、最终回电和返回总机。

- **P1 公网访问已恢复。** 复审开始时匿名请求返回 401，浏览器提示仅受邀用户可访问。经团队授权恢复原站点公开访问后，匿名 HTTP 请求首页和静态资源返回 200，桌面浏览器走通首页到第一通接听。站点沿用现有已发布构建。
- **P2 职业线焦点与语义待修。** `task-003:src/App.tsx` 的焦点逻辑约在第 223–244 行，职业线区域约在第 745–841 行。医生线用 Enter 进入两次选择与结局，或从来信重听，活动元素落回 `BODY`。选择后反馈也出现该问题，普通对白区域引用的 `career-title` 当时不存在。返修后记录关键步骤的实际活动元素与可访问名称，确认 Tab 可自然进入当前内容。
- **验收范围。** 团队暂停手机版开发和窄屏验收。真实读屏、实体手机及 Safari/Firefox 本次未做独立复验。

团队确认已获阿里云许可公开源码，GitHub 保持公开。执行范围和交还条件见[当前任务](../current.md)。

## 2026-11-21 扩展剧情桌面复验（PASS）

团队指定 Codex 接手剩余返修。已停止 Qoder 执行并确认工作区业务文件未被该次运行修改。代码与 README 已推送 `task-003` 的 `d7cb883`。

- **焦点与语义通过。** 1280×720 的 Codex 内置浏览器访问本地生产预览 4173，使用 Tab、Enter、Space 实走医生线。两次选择及结局聚焦标题，Tab 进入当前选项或读信按钮。两次反馈聚焦“继续”，进信聚焦信件标题，重听回到对白 01 并聚焦通话标题。对白、反馈、选择、结局及信件的区域名称均可解析。
- **桌面回归通过。** 第一通的两次选择与结局正确聚焦。第一通、职业通话的 Escape 取消恢复到“结束通话”，确认分别回首页“开始体验”和总机标题。复跑 16 个职业结局与信件，走通最终回电和返回总机。
- **运行检查通过。** `npm run typecheck`、`npm run test:story`（20/20）、`npm run build` 与 `git diff --check` 均通过。减动效设置下页面和台词动画均为 `none`。网络抽查 44 个响应，失败与外部资源均为 0。浏览器回归未出现警告或错误。

手机版开发和窄屏验收暂缓。本轮未实测真实读屏或实体手机。公网地址已恢复匿名访问，仍承载此前发布的构建。当前返修完成本地桌面验收，部署新构建及合并 main 由团队决定。

## 2026-11-21 桌面鼠标走查（PASS）

Codex 在内置浏览器的 1280×720 桌面视口实际点击本地生产预览 `task-003@d7cb883`（端口 4173，`index-CRAOg8Sc.js`）。同时抽查匿名公网版（`index-C9MjN7Pv.js`）。

- **本地完整走查。** 实际点击首通 4 个选择组合与结局、全部 3 个身份入口，再走完四条职业线的 16 个结局及 16 封不同正文的来信。四张线路卡均标为已接听。确认读完第一封信解锁最终回电，读到「下次换你打给我」后返回总机仍保留 4 条已读记录，刷新回到首页。
- **鼠标操作。** 首页细节可打开。对白可点画面或用「继续」推进，画面双击只进一句。实拖选对白后第一下清选区并保留当前句。两次必选画面点击空白均无法绕过，选项双击停在首句反馈。第一通重听须重新接听，职业线重听从对白 01 开始。首通、职业线、最终回电的确认与取消按预期返回并保留相应进度。
- **公网路径。** 匿名点通首页、第一通的「给今天留一首歌」、四职业各一组结局与来信、最终来信和返回首页。本地和公网网络抽查各收到 44 个响应，期间未见失败请求或浏览器警告、错误。
- **P3 · 双击接听后可能误选中文字。** 本地和公网均复现。双击来电页的「接听」后仍在主线 01，但浏览器选中了下一页按钮上的「继续」。第一次点击画面仅清除选区，下一次才推进。相关实现位于 `task-003:src/App.tsx:312` 和 `task-003:src/App.tsx:394`。后续可限制对白操作按钮标签的原生文字选区，复测双击接听和手动选择台词。

本轮为桌面鼠标交互验收，触屏、其他浏览器和三种身份与全部职业组合的交叉矩阵未逐项实测。

## 2026-11-21 桌面视觉改进第一组（PASS）

团队指定 Codex 直接执行本轮。按钮与交互实现已推送 `task-003@24bd264`。类型检查、20 项剧情测试、构建与 diff 检查通过。

在浏览器生产预览的 1280×720 视口，双击「接听」停在首句且未选中文字，接下来第一次点击画面直接前进。拖选台词仍可操作，清除选区的点击未跳句。首句操作提示在推进后消失，按钮中心维持在同一位置。选项悬停同时触发边框变化和背景预览。Enter、Space、Escape 可用，职业路线与最终回电走通，两枚返回按钮均朝左，最终回电的退出说明显示正确。开启减少动态效果后页面和对白的动画名称均为 `none`。

此结论限第 1–9 项。第 10–28 项继续按[当前任务](../current.md)分组实施。

## 2026-11-21 桌面视觉改进第二组（PASS）

页面布局与文字实现已推送 `task-003@5ed03c7`。类型检查、20 项剧情测试、构建与 diff 检查通过。在 1280×720 生产预览中检查首页、来电、两段对白、身份、总机、医生来信及最终来信。首页电话卡为 310×76，标题与主按钮分工清楚，来电卡有独立铃环。按 Tab 从首页到开始按钮，继续按钮在首两句位置一致。

空总机没有最终回电。读完医生来信后，最终回电按钮底部位于页面约 250 px 高处，先于总机序幕，四张职业卡的状态同一基线。职业与最终来信的正文纸面均为 98% 不透明，最终来信与返回操作之间有留白。已核对代表画面，浏览器无警告或错误。此结论限第 10–20 项。

## 2026-11-21 桌面视觉改进第三组与总验收（PASS）

背景、配色和动效实现已推送 `task-003@510568b`。三组共 28 项实现在[当前任务](../current.md)逐项登记。

| 第三组项目 | 验收证据 |
| --- | --- |
| 21–24 色温、道具、明暗、配色 | 对照首页、来电与接通画面，核实暖琥珀工程侧、雾蓝音乐侧和暖纸面。四条职业线的 16 张场景均在实际对白中解码并显示。检查四条线的入口画面，急诊、黑板、设计屏和白板均在对白框之上。生成器为 16 张职业场景保留独立局部光、抬高道具区域并移开挡住道具的右窗分隔。 |
| 25 选项预览 | 第一通用真实鼠标移入两项，背景分别加载对应画面和冷暖光。入场结束后，两种预览下的对白框均为 `[80, 540, 1120, 150]`，移出即清除。四条职业线用 Tab 和 Shift+Tab 看到冷暖切换，退出总机时清除。 |
| 26–27 过渡、雨丝、辉光 | 接通和最终回电的入场 430 ms，逐句淡入 150 ms。40 张本地 SVG 通过 XML 解析，雨丝、尘埃、铃环降低亮度，全部保留减少动态效果规则。浏览器模拟减少动态效果时，页面与逐句动画均为 `none`，预览过渡为 `0s`。 |
| 28 画面热点 | 实测首页吉他热点的鼠标悬停轮廓、贴近琴弦的注释、点击固定、再次点击与 Escape 关闭。注释下缘约 240 px，阅读栏起于 470 px。 |

最终回归在 1280×720 本地生产预览进行。走通第一通 4 个结局、16 个职业结局与来信、最终回电及返回总机。核对修复后的双击接听、一次性提示、焦点和返回箭头。末次构建 `index-9amboUym.js` 的首通四组合与读信返回通过，浏览器抽查收到 44 个网络响应，失败、控制台错误和警告均为 0。类型检查、20 项剧情测试、生产构建和 Git diff 检查通过。

备份的 Git bundle 和原构建包均通过 SHA-256 校验，在隔离目录验证恢复到 `d7cb883`，并比较 `src/App.tsx` 字节一致。三组提交提供独立回退点。新版完成桌面本地验收。手机、窄屏与真实读屏未做本轮验收，线上仍是此前发布的版本。

## 2026-11-21 桌面首页参考图落地（PASS）

验收对象为 `codex/task-003-home-visual@ee6c2f0`。桌面首页改为满幅雨夜双室，中央显示轻量信号，片名、引子和「开始体验」由网页组件渲染。原首页 SVG 继续供前言、来信及原有窄屏布局使用。

- 本地生产构建在 Microsoft Edge 的 1280×720、1440×900 视口实测。插画占满视口，台灯和吉他均完整可见，底栏分别从 y=538 和 y=672 开始，页面无横向或纵向溢出。
- 实测 Tab 焦点、Space 进入前言、返回首页的焦点恢复、吉他热点的悬停与点击固定、Escape 关闭，以及首页至接听首句、确认结束后回首页。减少动态效果时，页面动画关闭，背景转场时长为 0 秒。浏览器错误、警告和加载失败均为 0。
- 类型检查、20 项剧情测试、生产构建及 diff 检查通过。窄屏及手机版验收暂缓。
- 素材由内置 ImageGen 编辑已确认的参考图，项目文件为 `public/backgrounds/home-hero.webp`，1672×941，129872 字节。

素材生成提示词如下。

> 精确编辑输入的首页设计参考图，输出网页要使用的纯背景插画。输入图是编辑目标，团队已确认上方雨夜画面。尽可能逐像素保留输入图最上方约 74% 的照明、氛围、物件、相对位置和两侧取景。擦掉画面左上角的 ELSEWHERE 字标、标志，以及中上方电话图标、“另一个你”字样和信号格图标，恢复它们后面的深色画面。保留跨左右房间的非常细微、很淡的琥珀到冷蓝信号曲线，它属于原画。清除下方全部网页界面，包括暖米色底栏、片名、副标题和按钮，让原有桌子、椅背、地毯和地板纹理从原来的上缘连续自然延伸到画面底边。整个成品是宽幅 16:9、满版的单张电影场景插画。
>
> 固定原稿中暖色左侧台灯和工作桌、台灯下的手稿、中央暗部、冷色右侧完整的原木吉他和谱架、两侧细密的玻璃雨痕、景深和色温。保留吉他的完整琴颈和琴身，在原图右侧同样的位置。无需重新设计物件或增加显眼的东西。成品只有插画，任何位置均无 UI、外框、边栏、界面面板、按钮、文字、作品名和商标。

## 2026-11-21 桌面首页底栏返修（PASS）

验收对象为 `codex/task-003-home-visual@5106b84`。根据团队反馈，首页底栏改为跨过原面板上沿的深暖色渐层，保留雨夜插画在文字背后的细节，片名与引子使用浅暖色，砖红按钮增加暖色描边及浅色键盘焦点。

在本地生产预览的 1280×720 和 1440×900 视口查看实际画面，渐层分别从原底栏上缘上方 108 px 和 135 px 开始，页面无滚动溢出。复验 Tab 焦点、Space 进入前言与返回首页焦点恢复。类型检查、20 项剧情测试、生产构建及 diff 检查通过。

用户当前的内置浏览器使用紧凑布局，复核时发现仍显示白底，故在 `f83e577` 将渐层与文字配色移到首页共享样式。已刷新当前预览并确认底部呈深暖色。最终构建再次通过 1280×720、1440×900 的桌面画面与焦点验证、类型检查和 20 项剧情测试。

## 2026-11-21 后续场景插画重绘（PASS）

验收对象为 `codex/task-003-home-visual@9cfba64`。以获认可的首页双室插画为风格参考，重绘 39 张后续场景及回退素材，另为前言、总机、来信和最终回电各补一张，共 43 张互异的 1672×941 WebP。新文件位于 `public/backgrounds/`，合计 5,462,618 字节。现有首页 WebP 和历史 SVG 文件保留。

- 来电使用两部不同色温的座机，首通包括旧照片、乐谱、时钟、选择和四个结局。四条职业线各有四张对应插画。医生开场按台词绘制自动贩卖机、白大褂和未吃完的能量棒。
- 按当前剧情加载，并预取紧邻的前言、来电、选择和职业入口。1440×900 本地生产预览中观察到首页仅请求首页和前言两张 WebP。背景仍在解码后交叉淡化，七处剧情热点重新对准画面物件。
- Microsoft Edge 从首页通过浏览器操作走完首通四种结局、四职业各四种结局、16 封不同来信、最终回电和返回总机。验证四项选择预览和接通场景的热点。常规流程共显示 43 张 WebP，含原首页图，备用开场画面另行解码验证。未见网络错误或控制台告警。类型检查、20 项剧情测试、生产构建与 diff 检查通过。桌面为验收范围。

<details>
<summary>43 张插画的 ImageGen 提示词</summary>

素材使用内置 ImageGen，每张单独生成。通用参考图是获批准的首页无界面插画，其运行资源为 `public/backgrounds/home-hero.webp`。通用提示如下。

> Create one production-ready wide 16:9 background illustration for the Chinese interactive story Elsewhere: 未接来电. Image 1 is an approved runtime illustration, use it as the exact art direction: realistic cinematic production design, textured and lived-in, restrained low-key illumination, damp rainy glass, amber practical light against desaturated slate-blue, plausible lens depth, specific handmade props, human warmth, no figures or hands. Match its level of finish. Fill the whole canvas with one coherent shot, no divided panels, frames, mockups, graphics, readable lettering, UI, logos or captions. Keep the main objects above the bottom 27 percent (dialogue will cover that area), and do not place a bright object at the geometric center unless requested. Keep lower frame naturally dark and center third low-contrast when requested for an overlay.

每张另附以下场景描述。

| 文件名 | 场景提示 |
| --- | --- |
| `incoming.webp` | The amber engineering room from the reference, viewed lower and closer to window height. A black corded wooden-desk landline rests on the left at x24% y49% with one tiny amber indicator; on the right at x77% y51%, a second dark teal rotary landline in the cool music room across a rain-dappled city window, with its handset fully visible. Shared roofline / same rainy city links the two planes. Quiet empty dark space in center for the ringing card. No people. |
| `connection.webp` | Same warm engineering study and cool music rehearsal room from the reference, living together in one continuous wide composition, slightly closer. A small phone speaker with perforated grille and tiny blue LED sits at center x50% y29% on the shared edge between two rooms, where a thin muted signal thread runs toward the guitar. Left amber lamp, right acoustic guitar and folded score. Main objects framed safely above the bottom band. |
| `doubt.webp` | Close tactile composition at the warm engineering desk from the reference, oblique view toward cool, wet glass in the background. At x64% y33%, two worn instant photographs of the same rainlit window and the same guitar at different times, one partly slid from behind the other, unmarked white margins. Amber lamp pool on photographs, blue rain reflections, soft shadows. Show enough separate photo edges to recognize two prints. |
| `music.webp` | The cool music room depicted in the reference, medium close view. An acoustic guitar dominates the right third, lit by a restrained warm edge, with piano keys and out-of-focus score stand beside it. A slim amber doorway on the left implies the other life. See moisture on blue dusk glass. Show the entire sound box and strings around x73% y37% above the bottom quarter. |
| `reality.webp` | Three-quarter angle inside the warm engineering room of the reference. Foreground left amber desk lamp illuminates page of credible pencil engineering geometry and an open notebook computer with understated blue code-like lines, symbols not legible. Stacked books, rain outside, cool background. Lamp and desk tools x28-43% y35-58%, no visible people. |
| `rehearsal.webp` | Inside the familiar cool rehearsal room after everyone has left, closer view of piano music stand with one dog-eared handwritten music score at x29% y33%, pencil and eraser tucked alongside, narrow warm pooled light. Dark blue damp window at the rear and guitar neck softly out of focus on the right. Specific paper material, faint notes without readable words. Music score must be visible well above the bottom UI band. |
| `desk.webp` | A close scene on the warm engineering desk of image 1 just after midnight. At x49% y31% a small real round analog desk clock with thin second hand, dim old brass and a creamy dial; one internship folder, pencil and darkened laptop sit nearby above the bottom quarter. Blue rain beads behind it, subdued amber light on the clock. No readable text. |
| `question.webp` | The rain-night space BETWEEN the two interiors in image 1. At x50% y37%, a small mid-century telephone receiver or tabletop speaker with a tiny dim amber grain of light, well above bottom UI band. A near-invisible filament reaches either way; amber desk blurred on left and cool guitar and rain on right. Quiet tension and a sense of someone's voice just gone quiet, no symbols or text. |
| `first-choice.webp` | An intimate after-hours two-room wide shot with the same studio layout and props as the approved reference. A partially folded music score below a worn metal lamp far left and a well-used acoustic guitar far right, separated by a dim gathering of blue-gray rain. The lamp and soundboard remain high in both sides; low contrast in lower middle where choice cards appear. Both lives feel equally inviting. |
| `regret.webp` | Oblique closeup from inside the cool rehearsal room, a worn acoustic guitar x72% y42% and a dark empty stage stool surrounded by cobalt rain reflections. Across a little opening on far left, a gentle amber light from the engineering side. A small unpaid-concert envelope blank and unobtrusive. Quiet ache, believable lens depth, no theatrical spotlight. |
| `regret-quiet.webp` | Dark closeup of the same guitar in the rehearsal room; one clearly weathered guitar string and lightly worn lacquer, the guitar body lying or leaning centered across x55% y51%, blue reflections off wet glass and thin warm light catching just the near edge. Main body in the upper-middle of the frame. No strong stage lights or people. |
| `cherish.webp` | Small warm pool of lamplight on the home engineering desk at x32% y42% over a half-closed laptop, well-worn everyday mug, a folded list and familiar woodgrain. Cool rain and vague rehearsal room reflections stay visible in the right distance. Quiet pleasure in having kept a day to oneself. No words or big bright center. |
| `cherish-morning.webp` | Same engineering room gradually entering early morning, amber desk lamp still lit on left and a quiet pencil and plain notebook above the bottom quarter. Blue rain thinning beyond the window, soft cool first daylight reaching the warmth. A subtle change in time from the prior night, no yellow sunshine, same materials and realistic stillness. |
| `second-choice.webp` | Medium-wide still-life that suggests two small actions without pictograms. On an engineering/rehearsal shared desk, at x30% y43% an open blank practice notebook with a solitary guitar pick, at x72% y42% a telephone handset near an empty chair and second cup. Amber lamp from left and desaturated cool rainy window to right. Center and bottom quiet for text. |
| `make-space.webp` | The acoustic guitar laid ready at the edge of the familiar rehearsal stool on the right, a guitar pick and small opened music book at x70% y48% illuminated by a modest warm reading lamp, cool rain withdrawing at the blue window. Domestic scale, a small gap in the day reserved for practice. No UI or readable text. |
| `reach-out.webp` | At the engineering desk in the two familiar rooms, two cups close together and a telephone with a resting handset at x32% and x69% above the lower dialogue area, a spare chair in cool shadow. Amber wood, rainy blue glass, subtle reflected light. Quiet possibility of talking to someone. No people or visible words. |
| `closing.webp` | Soft close shot of nearly motionless coaxial sound-wave metaphor as physical water: small concentric rain ripples in the shallow wet sill at x50% y35%, seen from inside through damp glass, diffuse amber desk lamp reflected on the left and reversed cool rehearsal-light reflection on right. Dark but visible, real reflective surfaces, no graphic or magical line. |
| `farewell.webp` | Medium-wide blue hour in the two same interiors as image 1, door slightly open between them. The lights in both rooms have grown softer; desk lamp on left and complete guitar by rain glass on right, a soft seam of daylight beyond. Center quiet and the back wall gently falls into shadow. Rain ending, no dramatic sunrise. |
| `ending-regret-space.webp` | Distinct ending in the cool rehearsal room at almost-dawn. Right edge prominently shows the warm wood body and strings of the acoustic guitar set beside an open beginner's practice score, the rest of the room is quiet. A dim blue window, one trace of amber at the instrument. Keep the central area deliberately dark and subdued for an overlaid ending text panel. No lettering or figures. |
| `ending-regret-reach.webp` | Distinct ending in the cool rehearsal room just after rain. Two empty chairs facing each other, one cup on a worn warm wooden side table visible toward the right edge with a quiet phone; distant damp blue glass and faint early daylight. Sparse dark center reserved for an ending panel. Moody but caring, no characters. |
| `ending-cherish-space.webp` | Distinct ending in the amber engineering room at blue-gray dawn. Far left shows a well-used desk lamp over a new blank page next to an old guitar pick, and cool light catches part of the guitar past the open door. Gentle optimism barely warmer than the approved night scene. Dark calm center and lower band for UI, no text. |
| `ending-cherish-reach.webp` | Distinct ending in the familiar amber engineering room after rain, a warm two-cup breakfast table at the left edge, faint blue window here and an empty chair beside it. A tiny lamp is still burning and first reflected daylight warms the wood. Dark unobtrusive center for the ending overlay. No people or visible text. |
| `intro.webp` | A wider angle looking into the two rooms of image 1 from just outside their shared threshold, before the call, wet blue glass, warm lamp off to far left, complete guitar and score to far right. Shadows in between, fine reflections and a sense of waiting, soft middle and bottom kept dark for a story prologue panel. |
| `doctor.webp` | Hospital emergency corridor at 02:17, empty. On the right at x69% y43%, a softly luminous physical vending machine with unlabeled buttons casts cool cyan light on a white coat draped over a chair and a partly eaten energy bar on the seat. Distant ceiling fixtures, cold steel doors, wet coats imply the night shift. Restrained far amber pool, no signs or readable text. |
| `teacher.webp` | Late afternoon in an empty Chinese high-school classroom, seen from the back at seated eye level. Worn wooden desks, one slightly crooked notebook on the last desk in the right third, weak honey light from the last-row rain-dappled window, muted blue-green blackboard and cool corridor shadows. Keep the meaningful desk and window above the bottom band. |
| `designer.webp` | Late-night independent graphic designer's studio lit by an angled warm lamp and one desaturated blue monitor, an unfinished graphic layout made of unlabeled geometric blocks, taped color swatches, tracing paper and a pencil on the right third, worn edges and layered materials. Reflections on rainy studio glass, no visible figures or text. |
| `founder.webp` | Unpolished startup room in a converted small city apartment early Monday with three physically distinct ordinary desks, secondhand chairs, two off monitors and one modest blue-lit laptop. Right third has an empty chair and warm light on a partly open notebook, rain recedes outside. Understated, lived in, no luxury, no readable screen. |
| `doctor-triage.webp` | Same night-shift hospital as the vending scene. The FRONT desk of a nurse/triage station at x62% y44%, unobtrusive amber lamps, empty office chair behind the counter and a nurse-call light, patient corridor receding left under cold overhead practical lights. A half-clipped set of blank triage papers and a stethoscope catch the lamp. No patient beds, wheelchairs, readable signage or screens. |
| `doctor-break.webp` | Same night-shift hospital, ordinary staff break room. Warm desk lamp illuminates an open lunch box, cheap paper cup and an empty chair on the right third at x68% y45%. A rain-damp pale blue window and coat hooks behind it, nurse corridor light in the distance. Still, human, physical materials, no readable words. |
| `doctor-night.webp` | Same night-shift hospital. Long emergency corridor during rain, partly open side room, unoccupied gurney with linen by the right-hand wall at x70% y52%; dim cyan spot lights and damp glass far away. One tiny tungsten light in the far doorway, reflective terrazzo, intimate sense of duty. No signage or people. |
| `teacher-window.webp` | Same middle school, from directly beside the last-row desk. Rain-streaked glass at x70% y36% frames wet courtyard and low dawn colors. A pencil and two subtle unfinished student drawings in the warm window light, empty desk. Distant chalkboard on the far left. Quiet, modest realism. |
| `teacher-office.webp` | Same school teacher's shared office after class. Modest overlapping exercise books, pencil worn short, red marking pen and empty enamel mug beneath a tungsten lamp at x65% y48%, cool shelving and trolley blurred in left half. Wet window background and realistic hand-made paper, no readable text. |
| `teacher-corridor.webp` | School corridor after the bell, rain through tall blue glazing and one warm classroom doorway at x67% y34%. Through the open door a dark green blackboard, one empty desk and low desk lamp hint at a student's last-row place. Real institutional terrazzo and wood, no spectators. |
| `designer-wall.webp` | Same small independent studio. Close diagonal shot toward pin-up wall with three differently arranged printed poster mockups, restrained color chips and real thumbtacks at x69% y39%, handwritten strokes unreadable. Quiet blue ambient light with warm desk lamp off-center, no brands or letters. |
| `designer-night.webp` | Same studio at 1 AM. Reflection of a monitor and desk lamp in a big rain-streaked dark blue window on the right, keyboard, discarded print proofs and a small warm lamp at x68% y52%. Empty chair, a little urban bokeh, mature palette without neon. |
| `designer-sketch.webp` | Same studio, intimate three-quarter view of the sketch desk, several traced alternatives layered on warm paper, pencil, bent ruler and red correction mark at x68% y46%. Warm lamp with cool blue window behind. Carefully rendered paper abuse and wood, no typography. |
| `founder-meeting.webp` | Same startup, compact meeting corner for three at x68% y47%, secondhand folding table, three mismatched chairs, folded notes and rough planning board with deliberately unreadable marks. Blue rain outside and a single amber pendant low over the table, modest and precise. |
| `founder-window.webp` | Same three-desk startup room photographed obliquely along right-hand rain window at x70% y32%. City rooftops and blurry early-morning blue-gray rain beyond. Warm amber lamps and reflected chairs revealed as a layer in the glass, marked-up notebook and modest laptop near the window on the right. No signage. |
| `founder-server.webp` | Same small startup's improvised server corner at dawn. One compact old black server cabinet at x68% y40%, a few tiny green and amber status LEDs and neatly tied network leads, warm office lamp fading behind a partially open door. Moody rain-blue tones; no enormous industrial data center, no readable words. |
| `letter.webp` | Quiet medium-wide still life for an interactive story's letter-reading screen, in the very same two rooms from image 1. At the far left above the bottom quarter a warm lamp and partly open unmarked cream correspondence envelope on a worn desk, cool rain glass on the far right. Center and lower center should be beautifully dark and sparse to support an overlaid reading panel. No writing, no watermarks, no characters. |
| `hub.webp` | A semi-oblique view down a quiet rainlit city alley in the same world as image 1. Weathered brick, four separate warm windows among desaturated blue-gray buildings suggest four possible lives, auburn utility light at the edges, dark simple center left and lower two-thirds for an overlaid interface. No people, no signs or text. |
| `finale.webp` | Intimate last callback inside the same rehearsal room just as rain clears. An acoustic guitar and a small telephone on the right at x70% y42%, a very faint amber line of daylight appearing low in the wet blue window, quiet empty left side and bottom band. Familiar materials and restrained emotional warmth, no text. |
| `opening.webp` | Wide poetic exterior of two adjacent windows in the same rain-dark building, one warm engineering desk and one blue rehearsal room recognizable through the glass, seen from low across the street. Thin shifting reflections and rain, human warmth, clear scene different from the reference's inside point of view, no overlaid symbols. |

</details>


## 2026-11-21 桌面自主走查与返修（PASS）

以 `9cfba64` 的本地生产构建为基线，在 Microsoft Edge 的 1280×720 视口复现来电、选择和图片异常交互。返修提交为 `codex/task-003-home-visual@99fb563`，生产入口脚本为 `index-DNQGcKJ8.js`。

| 实测问题 | 返修及复验 |
| --- | --- |
| 响铃卡与「接听」的中心相距约 570 px | 桌面版将唯一的接听按钮放入响铃卡，读屏标题仍标明来电。进入页面后从标题按 Tab 即到接听。底部保留通话说明与返回 |
| 首次选择的答案先于提问出现 | 首通及职业线均在同一面板依次显示问题、答案和进度。1280×720 下首个提问结束于 y=490，答案始于 y=508 |
| 用键盘选完首通选项后焦点落到 BODY | 两次选择后，焦点落到反馈页的「继续」，再次按 Space 可推进 |
| 鼠标移出时丢失键盘预览，或 Tab 换选项时被旧悬停覆盖 | 鼠标移出恢复仍有焦点的选项，Tab 切换时采用新焦点。验证先悬停再 Tab、先 Tab 再悬停及移出 |
| WebP 请求被拦截时，故障画面清除了上一帧 | 新插画成功解码后才替换。仅拦截 `doubt.webp` 时自动显示原 SVG，两种格式均被拦截时保留 `connection.webp` 且隐藏此时错位的热点，随后正常载入 `music.webp` |

最终构建在 Edge 1440×900 实际点通首通 4 个结局、四条职业线 16 个结局、16 封不同来信、最终回电和返回总机，共观察到 43 张场景图正常解码显示。复跑桌面走查，背景推进、双击防跳句、拖选保护、退出取消与确认均通过。正常回归中的网络错误和控制台警告为 0。类型检查、20 项剧情测试、生产构建及 diff 检查通过。


## 2026-11-21 快速点击对白返修（PASS）

在 Edge 的 1280×720 生产预览复现 `99fb563`。向首句正文连续发送三次原生鼠标点击，第一次推进，后续点击选中「这是什么恶作剧？」，下一次独立点击只清除选区，进度停在原处。

`7991016` 在可推进对白的非控件区域，阻止重复鼠标按下触发原生词句选择。首通、医生对白及最终回电均以相同序列复验，三连点只推进一句，无残留选区，下一次独立单击继续推进。实测拖选对白与职业来信均可选中文字，拖选对白后首次点击清除选区、再次单击推进。复核选择按钮、读信返回总机和进入最终回电。20 项剧情测试、类型检查、生产构建与 diff 检查通过。

## 2026-11-22 Qoder Sites 参赛版本公开发布（PASS）

团队授权更新现有参赛站点。发布源为 `codex/task-003-home-visual@799101673456ed8ad78ddeed50830746df9ee0d6`。类型检查、20 项剧情测试和生产构建通过。通过 Qoder Sites 预览并发布同一份 88 文件构建，复核站点 ID、项目 ID 与原域名一致。 [公网体验](https://elsewhere-missed-call-gfiycnjh8f0.qoder.zone/)

- 匿名请求首页返回 200，入口引用 `assets/index-DioWGkBC.js` 与 `assets/index-D2myX0jJ.css`。其余 87 个文件逐一比对 SHA-256，与本地构建一致，其中 44 个为 WebP。Qoder 在公网入口 HTML 中添加了站点水印脚本。
- 用全新 Edge 浏览器配置在 1440×900 上从公开地址点击体验。走通首页、前言、接听、首通两次选择与结局、身份和总机、四条职业线各一组选择及来信、最终回电和返回总机。画面点击、双击防跳句、选区保护及结束通话确认通过。失败请求与控制台警告、错误均为 0。
- 此次发布覆盖 Qoder Sites 公开站点。天池论坛作品帖是赛事平台单独接收的提交项。 [天池赛题说明](https://tianchi.aliyun.com/competition/entrance/532536/information)


## 2026-11-22 场景推镜与视差（PASS）

验收对象为 `codex/task-003-home-visual@aff1eb2`，生产入口 `index-CE9pBTtp.js`。在接通、医生、教师、设计师、创业者入口和最终回电为各自的近景道具和远景设置深度。新图解码后在背景层播放约 680 ms 的 WebGL 推镜，深度决定各区域位移，最后回到原图构图。沿用原交叉淡化和图片回退。普通背景切换及选项预览继续使用既有方式。

- Edge 1440×900 本地生产预览走通六个对应画面，验证实时渲染、画面上的「继续」可点击、动效结束后原图可见。按场景推进和退出后可中断当前镜头，快速双击仅推进一句。
- 播放最终回电期间开启减少动态效果，镜头立即结束。以 1280×720 和已启用的减少动态效果重新进入，直接使用正常静态图。另用关闭 WebGL 的独立浏览器验证静态图和对白推进。
- 类型检查、20 项剧情测试、生产构建及 diff 检查通过。常规浏览器回归无网络错误或控制台警告。

## 2026-11-22 场景推镜公网发布（PASS）

按团队授权，将 `codex/task-003-home-visual@aff1eb2ab0d64656279363f389030300a096b13e` 构建并发布到既有 Qoder Sites 站点。类型检查、20 项剧情测试和生产构建通过。Qoder 确认站点已上线且任何人都可访问，站点、项目与域名均对应原发布目标。 [公网体验](https://elsewhere-missed-call-gfiycnjh8f0.qoder.zone/)

- 发布包内 88 个站点文件与本地构建逐一比对一致。匿名请求首页返回 200，加载新版脚本 `assets/index-CE9pBTtp.js` 和样式 `assets/index-C3QtYozJ.css`。其余 87 个公网资源的 SHA-256 均与构建一致，其中 44 个为 WebP。
- 全新 Edge 浏览器配置在 1440×900 从公开地址点击走通接听、第一通两次选择和结局、身份、四条职业线入口、医生线来信与最终回电。六处推镜均实际播放。动效期间点击「继续」正常推进，快速双击没有跳过下一句。浏览器请求和控制台检查通过。
- 播放期间开启减少动态效果后，镜头结束。在 1280×720 带着该偏好重新接听，静态图与对白推进正常。关闭 WebGL 的独立浏览器也通过静态回退和对白推进。

## 2026-11-22 公网玩家体验走查（PASS）

在 1280×720 桌面浏览器的新标签页从公网首页开始，走通第一通两次选择、身份、医生的「白大褂外」、设计师的「把作品带回家」、两封回信、最后一通及返回总机。走查中复验了画面热点、选项的键盘焦点预览和挂断取消。 [公网体验](https://elsewhere-missed-call-gfiycnjh8f0.qoder.zone/)

| 体验观察 | 修改建议 |
| --- | --- |
| 读完两封职业来信并完成尾声后，在总机刷新会回首页。再次接听从第一通第 1 句开始。 | 在本机保存进度及来信，首页提供继续与重新开始入口。总机保留直接重读来信的入口。 |
| 第一通结局显示「通话已结束」，主按钮只写「继续」。第一次到总机时看不到最后一通的解锁条件。 | 将主按钮改为「接听更多来电」，总机注明读完任意一封来信即可解锁尾声。 |
| 医生和设计师分别要点 19、18 次继续才第一次选择。「什么眼神？」和「……十二版。」等短接话各占一页。 | 将同一节奏的问答并成一屏，先给出职业线各自的冲突，再让玩家回应。重听保留跳到分岔的入口。 |
| 信号设备有可点击的小说明，点普通对白区域则会推进。推进后按左方向键未回到上一句，界面也没有回看入口。 | 提供对白记录。保留点画面推进的同时，给可探索的道具更明确的提示。 |
| 首页为深色全幅图，下一屏切入亮白前言。回到总机后，同一段六行开场对白仍占着面板上半部，最后一通出现后在此尺寸上还需滚动查看底部。 | 前言采用与首页衔接的暖灰遮罩。首次读完总机开场后将其折叠，让线路和当前进度靠前。 |
| 尾声回应了第一通的「把旋律找回来」，只笼统提及接了几个世界的电话。 | 从已读的职业来信选一个具体细节写入尾声，让玩家听出这次选择留下的影响。 |
| 接通、职业线和尾声都有适合配合音效的镜头，最终回电还写了「琴弦被轻轻拨响」。站点界面无音量或静音控制，源码和随站资源中未发现音频播放实现。 | 可选加入接通声和尾声的一下琴弦，配静音控制。 |

## 2026-11-22 七项桌面体验改进复验（PASS）

实现提交 `codex/task-003-home-visual@5053d6a`，本地生产入口 `assets/index-lCKJcA7e.js`。类型检查、23 项剧情与存档测试、生产构建和 diff 检查通过。

1. Edge 实际刷新首通对白、线路总机和职业选择页。首页可续玩到原位置，保留对白记录、同一职业的两封不同回信和其他职业回信。取消重新开始保留五封信，确认后从头开始。
2. 第一通结局的「接听更多来电」进入身份与线路总机。首次总机说明解锁条件，读完一封即出现尾声。
3. 医生和教师各点 8 次到第一次选择，设计师和创业者各点 9 次。四条线分别实走两次选择、结局和来信。医生线重听可跳到第一次选择。测试覆盖原有 16 种职业结局。
4. 画面热点显示小圆标，点选时展示道具文字。点其余画面继续，双击没有选中文字或跳句。对白记录可用 Escape 关闭，焦点回到打开按钮。
5. 前言采用暖灰深色面板。总机开场第一次展开，回到总机后折叠，仍可手动展开。初访及读信后的总机在 1280×720 桌面视口能看到底部操作。
6. 尾声保留首通选择的回扣，并回应实际读过的来信。桌面流程验出设计师的小册子，剧情测试核对 16 种来信均有各自的回扣。
7. 浏览器 Web Audio 输出断言覆盖 0.25 秒接通声和 0.82 秒琴弦声，两段输出皆非静音且未削波。关音效后接职业来电没有触发播放，刷新保留静音偏好。

在 1280×720 与 1440×900 桌面视口复核页面，常规流程网络失败及控制台错误为 0。六处关键场景均观察到推镜播放，开启减少动态效果后接听显示静态图且对白可推进。验收使用本地生产构建。

## 2026-11-22 道具热点呼吸提示（PASS）

在 `codex/task-003-home-visual@63abc21` 中，所有道具热点共用 3.2 秒暖色呼吸光环，固定圆心保持可点。鼠标移入、键盘聚焦及点击固定提示时，光环停止呼吸。减少动态效果保留静态圆环。

Edge 本地生产构建在 1280×720 和 1440×900 逐一核对桌面流程的八处热点。实测光环渐亮及放大、点位命中、鼠标悬停和固定说明、Tab 聚焦和 Escape 关闭、点空白推进对白，以及切换减少动态效果后仍可查看说明。网络失败及控制台错误为 0。类型检查、23 项测试、生产构建及 diff 检查通过。

## 2026-11-23 Qoder Sites 公开版本更新（PASS）

发布源为 `codex/task-003-home-visual@63abc21d12562d01e44792450a1657b6ea880d6d`。类型检查通过，剧情测试 23/23 通过，Vite 生产构建成功。构建输出共 88 个文件。

- 为适配 Qoder 当前绑定的本地项目根目录，将构建输出原样放入 `dist/qoder-release-63abc21/`；88 个文件逐项与工作树构建输出一致。构建入口为 `assets/index-ZOWDUqCu.js` 和 `assets/index-D6mxqBAq.css`。
- Qoder Sites 复用原站点与项目，报告 `published=true`；发布 action 为 `FC2445AB-EA8C-4A00-9DD8-445C469F06F9`，发布操作 ID 为 `01a20901-1051-741b-b9b5-15d660075c45`。原域名与公开访问保持不变。
- 发布后匿名 GET 首页为 HTTP 200，标题正确，入口引用新 JS/CSS。对该构建的 87 个非 HTML 文件逐项匿名请求并比对 SHA-256，87/87 与本地发布包一致。Qoder 会向线上 `index.html` 注入水印脚本，因此按资源哈希比对而非要求入口 HTML 字节相同。
- 本节只核验线上发布状态及静态资源；交互流程的逐点验收见 `63abc21` 对应的本地 Edge 记录。未在本轮重新声称公网完整点击验收。

天池论坛作品帖与账号认证是独立提交事项，尚未代替团队报名、实名认证、大学生认证或发布论坛帖子。准备中的材料见 [2026 Qoder LifeHack 提交包](../submission/2026-qoder-lifehack/README.md)。官方规则要求开发与部署均由 Qoder 完成；当前发布包含团队决定由 Codex 后续实现的改动，作品帖草稿已如实披露，建议发帖前向赛事运营核实是否接受。
