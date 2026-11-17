# TASK-002 执行报告

| 字段 | 内容 |
| --- | --- |
| 任务 | TASK-002：视觉打磨与首通来电闭环 |
| 执行日期 | 2026-11-17（Asia/Shanghai） |
| 报告轮次 | 初次 |
| 执行方 | Qoder IDE |
| 分支 | `task-002` |
| 状态 | **完成，待 Codex 审核**；不代表验收 PASS |
| 基线提交 | `322130c` |
| 本轮提交 | 本报告随本轮改动提交；最终提交号由交接消息提供，避免报告自引用 |

## 1. 实现范围

在既有 React 工程内完成“深夜的一通私人来电”视觉与首通闭环：

**首页 → 前言 → 来电 → 接听 → 七条主线对话 → 第一次选择 → 对应两条反馈 → 共同收束 → 本段结束 → 重听/返回。**

- 首页以中文“未接来电”为主标题，保留 Elsewhere 品牌、深蓝底、冷青/浅紫光场和本地 SVG 来电主体；两个世界有“现实 · 工程”“平行 · 音乐”文字标识。
- 前言保留指定问题与虚构声明；来电页明确“另一个你 / 来自平行世界的自己”，用户主动接听，无权限申请或假连接。
- 剧情采用有稳定标识的本地结构化数据，七条主线、两个选项、各自两条反馈、共同收束和不同结束摘要均按指定用稿实现。
- 组件本地状态推进剧情；功能式更新避免快速连点重复选择。重听、返回、刷新和中途确认按任务要求清空或保留状态。
- 原生按钮、标题焦点、当前句 `aria-live`、原生 `<dialog>`、可见焦点及 `prefers-reduced-motion` 均已接入。
- 未实现第二次选择、四结局、时间线、来信、真实通话、AI、后端、账号、存档、追踪或部署。

### 文件清单

| 文件 | 说明 |
| --- | --- |
| `src/App.tsx` | 页面/通话状态、焦点、当前句播报、选择、结束与中途确认 |
| `src/components/CallCard.tsx` | 首页与来电页共用的本地 SVG/CSS 来电主体 |
| `src/story/opening.ts` | 类型化剧情节点、固定文案、纯转移、异常恢复和剧情图检查 |
| `src/index.css` | 视觉变量、响应式布局、对话/选择/结束/确认样式、焦点与减少动态效果 |
| `tests/opening.test.mjs` | 七项 Node 原生剧情测试 |
| `package.json` | 新增 `npm run test:story`；未新增依赖 |
| `README.md` | 本轮真实功能、命令与“只完成首段通话”的边界 |
| `tasks/reports/TASK-002.md` | 本报告 |
| `tasks/reports/assets/TASK-002/**` | 原始过程摘录、命令输出、复现脚本、JSON 结果和浏览器截图 |

未修改 `AGENTS.md`、`CODEX_HANDOFF.md`、`docs/**`、`tasks/current.md`、`tasks/archive/**`、`tasks/reviews/**` 或 TASK-001 报告/证据。`package-lock.json` 无变化；`dist/` 未提交。

## 2. 基线、环境与依赖

- 工作目录：项目根目录；从 `task-002` 的 `322130c` 开始，未重建工程。
- 实测 Node.js：v24.16.0；npm：11.13.0；macOS arm64。
- 浏览器：Microsoft Edge / HeadlessChrome 157.0.4341.60，通过 DevTools Protocol 发送真实鼠标与键盘事件、读取 DOM/计算样式、截图并捕获控制台和网络。
- React / React DOM 19.3.1；TypeScript 7.0.2；Vite 8.3.8；Tailwind CSS / `@tailwindcss/vite` 4.3.5。
- 未新增任何依赖、测试框架、路由、状态库、UI/动效套件、远程字体或素材。

### 过程证据来源

`assets/TASK-002/qoder-opening-log.json` 是开工时通过 `read_chat_session` 获取的当前 TASK-002 有界原始摘录，包含原始指令、日期、会话/轮次标识、读取任务与视觉/剧情用稿、Git 检查和分支切换输出。仅保留本任务必要内容，`turnLimit=2`、单项最多 3000 字符，源快照注明 `hasMoreBefore=true`，未加入其他会话、凭证或个人内容。

Qoder IDE 的 Computer Use `getApp(com.qodercn.app)` 在 30 秒内未返回，故没有 IDE 过程截图；以上原始日志是开工时保存的替代证据，不是事后重演。开发后命令输出和浏览器脚本/结果也在实际执行时保存。

## 3. 命令验证

以下命令均在项目根目录实际执行；最终代码再次运行类型检查、剧情测试和构建：

| 命令 | 退出码 | 关键结果 | 证据 |
| --- | --- | --- | --- |
| `npm ci --registry=https://registry.npmjs.org` | 0 | 干净安装 43 个包，审计 50 个包，0 vulnerabilities | `assets/TASK-002/npm-ci.txt` |
| `npm run typecheck` | 0 | `tsc --noEmit` 无错误 | `assets/TASK-002/typecheck.txt` |
| `npm run test:story` | 0 | tests 7 / pass 7 / fail 0 | `assets/TASK-002/story-tests.txt` |
| `npm run build` | 0 | 18 modules transformed，61ms | `assets/TASK-002/build.txt` |
| `node tasks/reports/assets/TASK-002/browser-interactions.mjs` | 0 | 两条完整路径、重置/确认、30 个键盘步骤、控制台/网络断言通过 | `assets/TASK-002/browser-interactions.txt` |
| `node tasks/reports/assets/TASK-002/browser-accessibility.mjs` | 0 | 200% 文本放大和四组对比度断言通过 | `assets/TASK-002/browser-accessibility.txt` |

最终生产输出：`dist/index.html` 0.68kB，CSS 20.94kB（gzip 5.68kB），JS 234.05kB（gzip 73.15kB）。无 lint 配置，因此无 lint 命令；未虚构 lint 结果。

剧情测试覆盖：固定七条用稿与选项、主线顺序与不可跳过选择、两条反馈与不同摘要、重置/异常恢复、全部节点引用与可结束性，以及缺失引用和不可结束循环的反向检查。测试使用已安装的 TypeScript CLI 将单一剧情模块编译到临时目录后导入，结束即删除临时目录，不引入运行时转译依赖。

## 4. 真实浏览器验证

### 服务与复现

- 本轮开发服务：`http://127.0.0.1:5174/`。此前 TASK-001 的旧进程仍占用 5173，本轮结果不指向旧服务。
- 本轮生产预览：`http://127.0.0.1:4173/`，完整流程、键盘、控制台与网络最终检查均在此执行。
- 复现时先运行 `npm run build` 与 `npm run preview -- --host 127.0.0.1 --port 4173`，再执行第 3 节两个浏览器脚本。脚本中的 CDP 端口 9223 是本轮验证环境，不是应用运行依赖。

### 首页改前/改后与视觉

改前图是同一应用基线的 TASK-001 原始截图副本，未冒充本轮新拍“改前”：

| 视口 | 改前 | 改后 |
| --- | --- | --- |
| 390×844 | `assets/TASK-002/before-home-390x844.png` | `assets/TASK-002/home-390x844.png` |
| 1440×900 | `assets/TASK-002/before-home-1440x900.png` | `assets/TASK-002/home-1440x900.png` |

`assets/TASK-002/baseline-checksums.txt` 记录两组改前图与 TASK-001 原图完全一致的 SHA-256。390×844 改后首页顶部实测标题 y=154.09、“另一个你”底部 y=473.38、主按钮 y=653.17～705.17，三者完整位于首屏；标题 40px、正文 16px。桌面标题 72px、正文 18px。

### 完整剧情与状态

`assets/TASK-002/interaction-results.json` 和 `browser-interactions.txt` 保存逐步结果：

1. 首页进入前言，声明逐字为“这是一段虚构的平行人生，不代表对真实未来的预测。”，前言标题获得焦点。
2. 进入来电后显示“另一个你”；主动接听，按序读取七条主线，每句角色、进度和当前句 live 文本一致。
3. 第七条后“继续”进入选择，不存在可绕过选择的“继续”按钮，`#choice-title` 获得焦点。
4. `regret` 路径经过两条对应反馈与共同收束，摘要为“你说出了遗憾，也给一次小小的尝试留了位置。”
5. 重听回到来电页，必须再次接听且从 `opening-01` 开始；选择 `cherish-present` 后摘要为“你珍惜当下，也没有关上另一种可能。”
6. 对第二项快速发送两次鼠标点击，仍停留在该项第一条反馈，不会同时接受两项或重复结算。
7. 对话中刷新回首页，无对话残留；返回后再次开始可重走剧情。
8. 中途“结束通话”打开确认层，初始焦点为“取消”。Escape 与取消均保留原句并恢复焦点到“结束通话”；确认后回首页，再次接听从第一句开始。

关键截图：`intro-390x844.png`、`incoming-390x844.png`、`call-01-390x844.png`、`call-05-390x844.png`、`choice-390x844.png`、`end-regret-390x844.png`、`end-cherish-390x844.png`、`confirm-end-390x844.png`，均位于 `assets/TASK-002/`。

### 视口、矮屏与放大文本

`assets/TASK-002/layout-results.json` 保存实测布局：

| 视口 | 实测结果 | 截图 |
| --- | --- | --- |
| 390×844 | 文档 390×844，无横向溢出，首屏层级完整 | `home-390x844.png` |
| 1440×900 | 文档 1440×900，无横向溢出 | `home-1440x900.png` |
| 320×844 | 文档 320×844，无横向溢出，首屏层级完整 | `home-320x844.png` |
| 768×1024 | 文档 768×1024，无横向溢出 | `home-768x1024.png` |
| 320×568 | 经典滚动条下布局/文档宽 305px，高 817px，无横向溢出；实际滚动 249/249，页脚进入视口 | `home-320x568.png`、`home-320x568-scrolled.png` |

另在 390×844 的测试 DOM 中将标题、正文、按钮、角色与对话等计算字号放大到 200%，未修改应用源码：

- 首页文档宽 375px（扣除滚动条），无横向溢出，文档高 1140px；实际滚动 296/296 后页脚可见。
- 第五条最长对话无横向溢出，文档高 1107px；“继续”按钮滚动后完整位于视口内，尺寸 335×56px。
- 证据：`assets/TASK-002/accessibility-results.json`、`home-200-text-390x844.png`、`home-200-text-scrolled-390x844.png`、`call-05-200-text-390x844.png`、`call-05-200-text-scrolled-390x844.png`。

无头 Edge 未响应 Meta+Plus 原生浏览器缩放快捷键，因此这里是明确的 **200% DOM 文本放大检查**，不声称完成系统级或原生浏览器页面缩放验证。

### 键盘、焦点、动态效果与对比度

- 1440×900 下只用 Tab、Enter、Space 完成首页 → 前言 → 来电 → 七条主线 → `regret` 选择 → 两条反馈 → 收束 → 结束 → 返回首页，共记录 30 个步骤。
- 首屏“开始体验”与选择项 `:focus-visible=true`，焦点轮廓为实线；新页面标题、选择标题与结束标题均按状态获得焦点。
- 证据：`assets/TASK-002/keyboard-results.json`、`keyboard-focus-start.png`、`keyboard-choice-focus.png`。
- 原生确认层的 Tab 序列未聚焦任何背景按钮；其中一次浏览器 chrome 获焦时 DOM `activeElement` 为 `body`，如实保留在结果中。模态打开时向背景“继续”发送鼠标事件，原句未推进。未把该 chrome 中间状态写成“每次都位于 dialog 内”。
- `prefers-reduced-motion: reduce` 下媒体查询匹配，`.screen-enter` 动画为 `none`，按钮过渡时间为 `0s`；证据：`layout-results.json`、`home-390x844-reduced-motion.png`。

WCAG 相对亮度公式实测取样：

| 样本 | 对比度 |
| --- | --- |
| 首页正文 soft / 深蓝底 | 9.73:1 |
| 辅助说明 dim / 深蓝底 | 6.83:1 |
| 主标题 mist / 深蓝底 | 17.72:1 |
| 主按钮文字 / 主按钮底 | 12.73:1 |

均高于 4.5:1；原始 RGB 与计算结果见 `assets/TASK-002/accessibility-results.json`。

### 控制台与网络

最终完整流程的 `assets/TASK-002/browser-results.json`：

- 仅请求本地预览 HTML、同一构建的 JS/CSS 和 `favicon.svg`。
- `externalRequests: []`：无外部接口、字体或素材请求。
- `failedResponses: []`、`loadingFailures: []`：无失败资源。
- `exceptions: []`：无未捕获页面异常。
- `logEntries: []`：无 error 或 warning。

## 5. AC-01～AC-10 执行结果

| 编号 | 执行结果 | 主要证据 |
| --- | --- | --- |
| AC-01 | 已验证。锁文件干净安装、类型检查、生产构建均退出 0；无 lint 配置 | 第 3 节及命令输出 |
| AC-02 | 已验证。中文层级、来电身份和主操作清楚；390 首屏包含三者 | 同尺寸改前/改后图、校验和、`layout-results.json` |
| AC-03 | 已验证。前言、来电、主动接听和七条固定对话顺序/角色/声明正确 | `interaction-results.json`、前言/来电/对话截图 |
| AC-04 | 已验证。两条路径均从首页走到本段结束，反馈与摘要不同，选择不可绕过 | 两条完整路径记录、两种结束截图、剧情测试 |
| AC-05 | 已验证。A 完成后重听选 B；刷新/返回清空；取消保留、确认清空；快速连点不重复选择 | `interaction-results.json` 的 replay/refresh/confirmation/rapidChoiceResult |
| AC-06 | 已验证。类型化本地剧情与七项可重复测试通过，异常图能被检出 | `src/story/opening.ts`、`tests/opening.test.mjs`、`story-tests.txt` |
| AC-07 | 已验证。指定五种视口、长文本、矮屏滚动及 200% DOM 文本放大无横向溢出，控件可达 | `layout-results.json`、`accessibility-results.json` 和对应截图 |
| AC-08 | 已验证。完整键盘链路、焦点可见/恢复、当前句播报、确认层背景隔离、减少动态效果和对比度取样 | `keyboard-results.json`、`interaction-results.json`、`layout-results.json`、`accessibility-results.json` |
| AC-09 | 已验证。生产预览完整跑完两条路径；无应用异常、失败资源或外部请求 | `browser-results.json`、`browser-interactions.txt` |
| AC-10 | 已执行。README、报告、开工原始日志、过程命令/脚本/截图、文件清单齐备；最终远程提交号见交接消息 | 本报告、README、`qoder-opening-log.json`、证据目录 |

以上为 Qoder 的实际执行记录，不代替 Codex 审核结论。

## 6. 未验证项、已知行为与服务

- 未在实体手机/平板、VoiceOver 或其他真实屏幕阅读器上验证；本轮为 Edge 模拟视口、DOM/可访问性属性与真实输入事件检查。
- 未完成原生浏览器页面缩放或操作系统文字大小验证；已完成并如实标注 200% DOM 文本放大。
- 原生 `<dialog>` 的浏览器 chrome 中间焦点行为已记录；未进入背景控件，背景点击被阻止。除此之外无已知功能阻塞。
- Qoder IDE 过程截图因工具超时未获取，原始开工日志已保存；不以页面截图冒充 IDE 过程图。
- 开发服务仍运行于 `http://127.0.0.1:5174/`，生产预览仍运行于 `http://127.0.0.1:4173/`；这些是本机临时验证地址，不是部署。
- 提交前分支为 `task-002`，基线 `322130c`；最终提交与远程核对结果见交接消息。

---

## 7. 第 1 次修复：R1 确认退出后的首页焦点

| 字段 | 内容 |
| --- | --- |
| 修复日期 | 2026-11-17（Asia/Shanghai） |
| 审查依据 | `tasks/reviews/TASK-002.md` 的 R1 / P2，审核对象 `167b62a` |
| 本轮范围 | 仅修复确认结束通话后的焦点恢复并复验；保留以上初次报告和旧证据 |
| 状态 | **R1 修复与复验完成，待 Codex 复审**；不自行判定 PASS |

### 7.1 最小改动

仅修改 `src/App.tsx`：将原生对话框开合与页面焦点恢复协调到同一个提交后 effect。现在先按 `confirmOpen` 执行 `showModal()` / `close()`，再在视图变化时聚焦对应标题或“开始体验”。

确认结束同时提交 `confirmOpen=false` 和 `view='home'` 时，首页按钮已经挂载，`dialog.close()` 先解除模态隔离，随后 `startButton.current?.focus()` 生效。取消或 Escape 不改变视图，effect 只关闭对话框，仍由原生对话框把焦点还给“结束通话”。未使用延时、未移除原生模态、未改动剧情数据或视觉样式。

本轮新增文件仅为 `tasks/reports/assets/TASK-002/r1-*` 复验脚本、日志、JSON 和截图；本追加节写入原报告。未修改审查文件、初次证据、README、依赖或锁文件。

### 7.2 工程复验

工作目录为项目根目录，实际环境仍为 Node v24.16.0 / npm 11.13.0：

| 命令 | 退出码 | 结果 | 新证据 |
| --- | --- | --- | --- |
| `npm run typecheck` | 0 | TypeScript 无错误 | `assets/TASK-002/r1-typecheck.txt` |
| `npm run test:story` | 0 | tests 7 / pass 7 / fail 0 | `assets/TASK-002/r1-story-tests.txt` |
| `npm run build` | 0 | 18 modules transformed，85ms | `assets/TASK-002/r1-build.txt` |
| `node tasks/reports/assets/TASK-002/r1-focus-regression.mjs` | 0 | R1 焦点断言及完整回归通过 | `assets/TASK-002/r1-focus-regression.txt` |

R1 构建输出：`dist/index.html` 0.68kB、CSS 20.94kB（gzip 5.68kB）、JS 234.03kB（gzip 73.15kB）。无 lint 配置，未声称运行 lint。

### 7.3 生产浏览器复验

使用重新构建后的 `http://127.0.0.1:4173/` 和 Microsoft Edge 157.0.4341.60。复验脚本沿用真实 CDP 鼠标/键盘事件，并增加 R1 焦点断言；所有输出使用 `r1-` 前缀，不覆盖初次证据。

| 场景 | 实际观测 |
| --- | --- |
| 390×844 鼠标确认退出 | 在已选择 `regret` 的第一条反馈中打开确认层并点击“确认结束”；首页出现、`dialog.open=false`、`document.activeElement.innerText === '开始体验'` |
| 390×844 立即再次开始 | 确认退出后直接发送 Enter，进入前言且 `document.activeElement.id === 'intro-title'`；再次进入来电并接听，从 `opening-01` 第一句开始，证明进度和选择已清空 |
| 1440×900 纯键盘确认退出 | 用 Tab 导航、Enter 打开确认层、Space 确认；首页出现、模态关闭、焦点为“开始体验”，`:focus-visible=true` |
| 1440×900 立即再次开始 | 再按 Enter 进入前言，焦点为 `intro-title` |
| 取消与 Escape | 在已选择后的 `regret` 第一条反馈中分别取消和 Escape；反馈原文与所选分支保持不变，焦点均回“结束通话” |
| 普通返回、重听和两条分支 | `regret` 完成后重听并再次主动接听，完成 `cherish-present`；两种摘要不同，普通返回可用并能再次开始 |
| 其他回归 | 快速重复选择仍只接受一项；刷新回首页；完整桌面键盘主流程通过，本轮共记录 36 个键盘步骤 |

鼠标路径的焦点断言与截图：

- `assets/TASK-002/r1-interaction-results.json` → `confirmation.confirmedHome`、`confirmedRestart`、`afterConfirmedReset`。
- `assets/TASK-002/r1-confirmed-home-390x844.png`。鼠标操作后 `:focus-visible=false` 符合指针交互模态；焦点元素本身确为“开始体验”，且 Enter 已实际验证可用。

键盘路径的焦点断言与截图：

- `assets/TASK-002/r1-keyboard-confirmation.json` → `keyboardConfirmedHome.focus='开始体验'`、`focusVisible=true`，`keyboardConfirmedRestart.focus='intro-title'`。
- `assets/TASK-002/r1-keyboard-results.json`。
- `assets/TASK-002/r1-confirmed-home-keyboard-1440x900.png`，可见“开始体验”的键盘焦点轮廓。

`assets/TASK-002/r1-browser-results.json` 中 `externalRequests`、`failedResponses`、`loadingFailures`、`exceptions`、`logEntries` 均为空数组。应用 HTTP 请求仅来自本地预览；测试浏览器另加载了 `chrome-extension://` 翻译扩展资源，已原样保留，不归为应用外部接口请求。

R1 未发现新增已知问题。实体设备、真实读屏和原生浏览器/系统缩放仍未验证，限制沿用第 6 节。生产预览仍为本机 `http://127.0.0.1:4173/`；最终修复提交号与远程核对结果见交接消息。
