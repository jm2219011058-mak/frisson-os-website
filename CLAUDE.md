# FRISSON Website — 项目交接 / Claude 工作约定

> 本文件是全部工作流与后端系统的交接文档。Claude Code 每次启动会自动读取。
> 最后更新：2026-07-25

---

## 1. 项目概览

- 静态多语言站点，部署在 **Netlify**，线上域名 **https://frisson-os.com**
- 仓库：`github.com/jm2219011058-mak/frisson-os-website`（分支 `main`）
- 页面（`src/` 下 9 个）：`index`（首页/招聘向）、`cities`（Soulful Living Network，最核心）、`sona`（Sona AI 产品页）、`advocater`（Frisson Fellow）、`about`、`howitworks`、`stories`、`privacy`、`terms`

## 2. 构建流程（最重要）

```
改 src/*.html 或 i18n/*.json  →  node build.mjs  →  产物写入 dist/（英文根目录 + 中文 /zh/）
```

- **永远不要手改 `dist/`**——它是生成物且被 gitignore。预览 = 打开 `dist/xxx.html`，浏览器需硬刷新（Cmd+Shift+R）。
- build.mjs 同时做：i18n token 替换（`{{key}}`）、语言切换器注入（当前已隐藏，见 §6）、type.css 内联、额外字体转异步、图片生成响应式 WebP。
- 图片放 `assets/`，build 会为大图生成 `-820.webp` 等变体。

## 3. 文案 / i18n 系统（三处同步，易踩坑）

```
content-inventory.md（母版表格） → node gen-i18n.mjs → i18n/en.json + i18n/zh.json → build.mjs 注入页面
```

- `i18n/*.json` 是**生成物**（gitignore），但 build 直接读它们。
- **改文案的正确姿势**：同时改 `content-inventory.md` 和 `i18n/en.json`/`zh.json`（否则将来重跑 gen-i18n 会回退），或只改 md 后重跑 `node gen-i18n.mjs`。
- 部分新内容是直接硬编码在 html 里的英文（如 cities 的 WHAT WE DO、Soulful Living Nodes 组件、News 卡片），中文版会原样显示英文——待补翻译。

## 4. 字体系统（Editorial Renaissance）

- **唯一来源：`assets/type.css`**。改全站字体只改这一个文件。
  - `--serif`: **Fraunces**（标题/display）+ Noto Serif SC（中文兜底）
  - `--sans`: 目前也指向 **Fraunces**（全站统一，Space Grotesk 已全站移除）
- **例外（勿动）**：
  - **Logo「FRISSON」**：所有页面 `.nav .brand` 显式钉死 `"Playfair Display"` —— 死命令，任何字体改动不得影响 logo。
  - **首页 index**：不引 type.css，保持自己的 Playfair + 系统 sans。
- 历史备注：曾短暂全站 Space Grotesk，后被 Editorial Renaissance（Fraunces）取代。

## 5. 设计语言约定（务必遵守）

- **间距三级刻度**：大 `clamp(72px,11vh,140px)`（节与节）/ 中 `clamp(36px,6vh,64px)`（块与块）/ 小 `clamp(14px,2vh,24px)`。每个衔接点只用一处间距，不叠加 padding+margin。
- **亲密性原则（proximity）：关联度高的元素更近，关联度低的元素更远。** 间距本身就是信息——说明文字必须贴着它说明的图/卡，节与节之间才留大空。**警惕「锚在容器边缘」的排版**：元素锚在画布/视口的底边或用 `svh` 定高的画布，会让间距随视口漂移，在高窗口里把强关联的元素拉开一片死白（2026-08-08 cities 拼贴节的教训：句子锚画布底边、图片簇高度却跟宽度走，平板上隔开 200px+）。正确做法：让间距锚定在**关联元素本身**上（跟随内容流、或用与内容同一坐标系的单位定位）。
- **页边距与正文网格（2026-08-08 定版）**：水平页边距统一 `clamp(24px,6vw,72px)`——24px 下限与 6vw 斜率是全站基座不许动，上限允许各节在 40–90px 间微调（正文默认 72px）；正文容器 `max-width:1180px` 居中。**全出血/超宽画布（拼贴、SLN 地图这类 1280+ 的）里的文字仍必须落回 1180 网格线**，公式 `left:max(页边距, calc(50% - 590px + 页边距))`，不许贴画布自己的边。
- **对齐**：同屏元素左边线必须落在同一网格上（如 NEWS 与 WHAT WE DO 两个 eyebrow 顶部同线、移动端文块与卡片内 label 同 x）。
- **Eyebrow 标签**：sans 700、letter-spacing .18em、白底上用灰 `#8c837a`、深色底上用白。
- **CTA 两种形态**：小橙胶囊（`padding:9px 22px`、字重 500、hover `#c96a2f`、无大阴影）或 安静文字链接 + `›` 箭头（hover 变橙、箭头右滑）。**不用大胶囊、不用重阴影。**
- 层级靠「字号 + 明暗」表达，不靠满段加粗；英文句式用正常 sentence case，避免 AI 腔（converge/weave/三连排比）。
- 品牌色：橙 `--accent:#e07b3c`；墨色 `--ink:#2b1d12`。

## 5.5 渲染性能红线（新增 section/动画时务必遵守；可复制模式见 components/perf-patterns.html）

> 背景：2026-07-27 全站性能审计发现 SLN 区段仅 6fps，根因全部是下述反模式；修复后 GPU 路径 60fps。新代码不得重新引入。

1. **持续动画的元素必须独立成层**：只用 CSS `transform`/`opacity` 动画（合成器免费加速），**永远不放进含滤镜的 SVG 内部**——SVG 是"一张位图"，内部任何东西动一下整张连滤镜重新光栅化。氛围渐变/漂移 → 独立 div 层（参照 cities 的 `.sln-bg > .sln-wash` 结构）。
2. **噪点/颗粒一律预烘焙**：data-URI SVG 贴图平铺（参照 `.sln-grainbg` / `.props .grain`），**禁止运行时 feTurbulence 滤镜**。纯黑噪点不需要 `mix-blend-mode:multiply`（数学上与普通 alpha 叠加等价，省掉混合路径）。
3. **每个 autoplay `<video>` 必须挂离屏暂停**（IntersectionObserver，模式在 cities.html Sona 暗带后的内联脚本）；同一素材不开第二路解码——模糊背景层用 poster 图 + CSS blur 替代第二个 `<video>`。
4. **rAF 循环两条纪律**：值没变就不写（写 DOM 前做 delta 判断）；离屏就不跑（IO 挂暂停，参照 `.sln-off` / conch blob 的做法）。
5. **新增大 section 后跑一次 `/benchmark`** 与 `.gstack/benchmark-reports/baselines/baseline.json` 对比，帧率/体积退化要么修复要么在提交信息里说明原因。

## 5.6 浮标 / 尖角气泡的标准形状（可复制实现见 components/pin-label.html）

> 背景：2026-07-27。SLN 浮标原本是「胶囊 + 旋转 45° 方块」两个形状硬拼，接缝处切线突变，看着就是不丝滑。

- **凡是"指向某个点的标签"**（地图节点、图表标注、tooltip 尖角、气泡），**整个轮廓必须是一条 path**（`clip-path:path()`），body 与 tail 共用同一条曲线，不许用伪元素拼三角。
- **一律三次贝塞尔（C），不用二次（Q）**：二次只有一个控制点，两端切线被绑死，做不到接缝切线连续；三次的两个控制点可独立指定两端切线方向与长度，才能同时满足「切线连续」和「曲率峰值远离接缝」。单段、不与其他段相接的装饰弧线用二次即可。
- **圆角控制臂取 `k = 0.68R`，不是教科书的 `0.5523R`**：后者精确拟合圆弧，但曲率在直边/圆角交界处从 0 跳到 1/R，那一跳看得见。拉长到 0.68R 把曲率峰值推到圆角正中（squircle 取舍），实测接缝曲率台阶 0.0746 → 0.0337。
- **尾巴的第一个控制点必须落在 body 底边上** → 出发切线水平，与底边 G1 相接，不出折痕。
- `clip-path` 画不出盒子外 → 用 `padding` 给尾巴留空间，定位时再把尖端补偿回去（cities 里是 `TIP_ADJ=3.5`）。
- **路径只在字体加载 / resize 时重算**，尺寸没变不写 DOM（§5.5 第 4 条）；hover 缓动用 house silk `cubic-bezier(0.25,0.1,0.25,1)`，不用弹性过冲。
- 纯圆角矩形（无尖角、无拼接）不适用本条，`border-radius` 本身没有接缝问题，别过度工程。

### 5.6b 大卡片 / 弹窗的超椭圆：用 `corner-shape`，不要 `clip-path`（2026-07-29）

> 背景：SLN 弹窗、`.vision`、`.prop-card`、各配图统一改超椭圆时踩的坑。

- **带阴影的面板一律 `corner-shape: squircle` + `border-radius`，禁止用 `clip-path`。** 渲染顺序是 filter → clip-path，`clip-path` 在阴影**之后**执行，会把 `box-shadow` 整个裁掉。`corner-shape` 是原生属性，阴影/`overflow` 裁剪都自动跟随超椭圆轮廓，零 JS、零 resize 处理，不支持的浏览器退回普通圆角（无回归）。
- **分界线**：无阴影的小尖角标签 → §5.6 的 `clip-path:path()`；有阴影的大面积卡片/弹窗 → `corner-shape`。
- **半径必须用等长 `clamp()`，绝不能用百分比。** `border-radius:40%` 是**按各自的轴**解析的（水平半径取宽度的 40%、垂直取高度的 40%），结果是椭圆角不是超椭圆——676×191 的卡上算出来是 270×76，看着是梭形；而且**卡片越高角越圆**，同一个组件在长短文案下长得完全不一样。
- **半径变大必须同步加内边距**，否则首行/末行文字会撞进曲线；**关闭键坐在圆角的圆心上**（2026-08-08 用户定版，取代旧的「对齐正文栏右缘」）：`top/right` 各 = 半径 − 按钮半径。做法：把半径抽成 `--vr` 变量（`border-radius:var(--vr)`），关闭键 `top:calc(var(--vr) - 19px); right:calc(var(--vr) - 19px)`——覆盖半径的弹窗只改 `--vr` 一处，叉叉自动跟随（见 cities `.vision-x`）。
- 当前站内量级（cities）：`.sln-card` `clamp(72px,12vw,180px)`（约卡宽 23%）、`.vision` `clamp(60px,10vw,150px)`、`.prop-card` `clamp(40px,6vw,88px)`、配图 `clamp(40px,6vw,96px)`、Magic Conch 横幅 `clamp(30px,5vw,60px)`。**stories 的 Field Notes 卡是刻意保持直角的，别给它加圆角。**

### 5.6c 容器内的宽度不要用 `vw`（同日，同一个弹窗上踩的第二个坑）

- `.sln-cardfull` 曾写 `width:min(980px,96vw)`，而它的容器 `.sln-overlay` 有 `padding:4vw` → 内容区只有 `92vw`，**96 > 92 必然向右溢出**。改成 `min(980px,100%)`（`100%` 相对容器内容区，天然把 padding 算进去）。
- **判据：元素在一个有 padding 的容器里时，宽度用 `%` 不用 `vw`。** 这个 bug 在宽屏被 `980px` 上限夹住而看不出来，视口窄于约 1021px 才暴露——所以**改完必须在平板宽度（~834px）复验一次**。

## 5.6d 预览面板会冻结渲染器——别被 `getComputedStyle` 骗了（2026-07-29）

> 这一条不写下来会反复浪费时间：本会话至少三次据此误判。

- Browser 预览面板经常进入**渲染器冻结**状态：DOM 操作正常（`classList` 改得动、`matches()` 正确、`querySelector` 找得到），但**样式不重算**——动态加类之后 `getComputedStyle` 读到的仍是旧值，rAF 不跑，IntersectionObserver 不派发，截图也是黑屏或旧帧。
- **后果**：会把「CSS 没生效」「`:has()` 不工作」「动画卡顿」这类假象当成真 bug 去改，越改越错。
- **对照实验**（怀疑时先跑，10 秒定性）：注入一条 `!important` 规则 → 加类 → 读 `getComputedStyle`。**读不到新值 = 渲染器冻结，不是你的 CSS 有问题。**
  ```js
  var s=document.createElement('style'); s.textContent='.foo.zztest{color:rgb(1,2,3)!important}';
  document.head.appendChild(s); el.classList.add('zztest');
  getComputedStyle(el).color === 'rgb(1, 2, 3)' ? '正常' : '冻结';
  ```
- **可信 / 不可信**：页面**加载时**就生效的静态样式、几何尺寸 → 可信；**加载后**由 JS 触发的状态（弹窗打开、菜单展开、hover、滚动动画）→ 不可信，必须让用户在真机上确认。
- 冻结时不要反复 reload 硬碰——直接改用静态量测 + 结构性论证（如「组件内已无任何媒体查询断点，所以不可能跳变」），并**如实告诉用户哪一项没能实测**。
- **第二种形态：帧循环停摆**（2026-08-21 在 sensory lab 上反复踩）。样式重算正常、`getBoundingClientRect` 正常，但 **rAF 不跑 / IntersectionObserver 不派发 / 截图一片空白**——此时懒加载图片也永远不 load（近视口判定依赖渲染）。**诱因**：`resize_window` 设自定义尺寸、或用 `scrollTo` 做大跨度跳转。**自查**：跑一下 rAF 计数；`requestAnimationFrame` 连 3 帧都跑不到就是停摆。**恢复**：`preview_stop` + `preview_start` 开一个全新 tab（reload 没用），之后用**真实输入滚动**（`computer scroll`）代替 `scrollTo`。
- **判 fps 之前先测 baseline**：把所有 ticker 停掉再量一次，如果 baseline 也只有 1fps，那是面板停摆，不是你的代码——本会话就有一次差点据此误判 62k 粒子「跑不动」。

## 5.7 改 CSS 的安全规矩（2026-07-28 一天内出了三次事故才立的）

> 背景：`src/*.html` 的内联 `<style>` 很长，而且**跨 section 有措辞重复的注释**（`#s2` 和 `#s4` 都有 `/* baked grain tile */`）。用「从某段注释匹配到某个选择器」这种范围替换，正则会从更早的那一处开始命中，把中间几十行一起吞掉。

- **改 / 删 CSS 只能用唯一锚点字符串替换，禁止正则范围匹配、禁止按行号切片。** 锚点要长到全文件唯一（连注释一起当锚点）。
- **删完任何一块样式，跑 `node check-css.mjs`。** 它扫每个页面里「markup 用了但没有任何规则」的 class，干净则 exit 0。JS 驱动、本来就没样式的 class 加进脚本里的 `IGNORE`（加之前先用 `git show <旧commit>:文件` 确认它历史上确实没有规则）。
- 事故记录，都是同一个根因：
  1. 吞掉 `.s4b-stage` 等 → 舞台失去高度上限被撑到 7197px，手图放大糊满屏
  2. 吞掉 `#s2` 整段 63 行 → 时钟环、珠子、边缘融接、caption 样式全没，只剩渐变和裸文字
  3. 吞掉 `.sheet` 11 行 → **漏到了生产**：移动端弹层退化成文档顶部的普通 div，它没样式的关闭按钮变成每个 sona 页左上角一个光秃秃的 `×`，桌面端也显示（隐藏它的媒体查询一并没了）

## 5.8 磨砂 / 纸纹质感：用烘焙材质图，不要 feTurbulence

> 背景：2026-07-28 复刻珠串设计时，磨砂怎么调都是「细腻的数字噪点」，参考稿那种粗粝手感出不来。

- `feTurbulence` 生成的是**单一尺度的均匀随机**，不管 `baseFrequency` 怎么调都只有一种颗粒大小；手绘 / 扫描材质在大中小几个尺度上都有结构，那才是「大磨砂」的来源。**这是材质类型的差别，不是参数问题。**
- 正确做法：一张烘焙好的平铺材质图（`assets/sona/s4b-frost.webp`，400×400 中灰，61KB），`mix-blend-mode: overlay` 叠加。
- **overlay 不能省。** §5.5 第 2 条说的是「**纯黑**噪点不需要 blend mode」——白噪点或中灰噪点用普通 alpha 只会把画面整体提亮、颗粒感全无。曾因此误判成「画面发白」，去降不透明度，结果把质感一起降没了。
- 性能折中：满幅 overlay 每帧要重算一次混合。做法是**分开**——背景那层贴在静止的 div 上（只合成一次），珠子那层做成每颗珠子一个 bead 大小的 overlay 圆（5 个小混合，不是 1 个 1200×1200 的）。

## 5.9 缓动只给「有始有终的位移」，不给循环相位

> 背景：2026-07-29 审计 sona `#s4` 时发现的。风每 6 秒卡顿一次，一直以为是别的原因。

- **判断标准：这个值是「从 A 走到 B」还是「一直绕圈」？**
  - **手势 / 位移**（弹窗展开、珠子抬起、淡入淡出、`yoyo` 折返）→ **必须**用 CustomEase。`yoyo` 的两端速度为零是**对的**，钟摆到端点本来就该停一下再折返。
  - **循环相位**（`repeat` 不带 `yoyo`，值从 0 跑到 2π 再从头开始）→ **必须线性**（`ease:'none'`）。
- **为什么**：站内七条曲线两端速度全是 0（`tide` / `breath` / `silk` 实测都是 `起始0.00 / 结束0.00`）。给循环相位套这种曲线，相位每绕完一圈会**减速到完全停住再重新加速**——周期多长就多久卡一次。
- **非线性应该来自波形本身**：相位是喂给 `Math.sin()` 的，正弦已经提供了全部的加减速；在它上游再加缓动，只是在接缝处制造速度断裂。
- **`repeat` 不带 `yoyo` 有两种，别一刀切**：
  - **循环相位**（值连续绕圈、始终可见，如 `ph: 0→2π`）→ 线性。
  - **脉冲 / 涟漪**（每轮扩散后淡到 `opacity:0` 再重来，如 `#s4` 珠子的 `b.ha` 光晕）→ **保留缓动**。重启那一刻已经看不见，接缝不存在；每一轮本身就是一次完整的 A→B 手势。
- 自查：搜 `repeat:-1`，逐个问「重启的瞬间这个值可见吗」——可见就必须线性。
- 用 GSAP 缺席时的 mini 补间兜底的话，记得 `EASE.none` 也要有（恒等函数）。

## 6. 各页关键结构备忘

### cities.html（最复杂）
自上而下：hero（Feel forward.）→ 阿莱夫引言 `.editorial`（58svh 垂直居中）→ **NEWS 卡 + WHAT WE DO 分栏 `.mf-wwd`** → 迁徙图 → **Soulful Living Nodes 交互地图** → Sky Mansion 系列 → Sona 暗带（**页面到此为止**）。
- Sona 暗带以下（LIFE FRONTIER props / Moon / High Frontier 2035）已用 `.below-sona-hidden{display:none!important}` 整体隐藏（2026-07-25）——内容仍在 SLN 星星/横条弹窗里活着；恢复 = 删掉该 class。ownership teaser 更早已注释掉（备份在 components/ownership-teaser.html）。`<dialog class="vision">` 们必须保留（SLN 弹窗依赖）。

- **NEWS 卡（Magic Conch）**：左栏卡片，元素居中、NEWS 标签左上；标题单行 nowrap + 右侧圆形箭头（36px）触发内联 Netlify 表单 `trial-sleep`；移动端(≤820px)变全幅背景图 banner（trial-bg.jpg + 遮罩）。相关脚本在页面前部，已用 `slnTrialInit` 延迟到 DOMContentLoaded 绑定——**勿改回立即执行**。
- **Soulful Living Nodes 组件**（`sln-` 前缀，源备份在 `components/sln-fragment.html`）：
  - SVG 日历地图，viewBox 随视口比例在竖版 800×1067 ↔ 横版 1400×800 间无级形变；满宽、高度随自身比例。
  - **GPU 分层结构（2026-07-27 性能重构，勿回退）**：氛围渐变（`.sln-wash` div×4，drift 动画走合成器）与噪点（`.sln-grainbg` 烘焙 data-URI）已移出 SVG；SVG 只剩线稿+日历链。视差用 CSS transform + 写入去重（`pDx/pDy`）；区段离屏加 `.sln-off` 暂停全部氛围动画。渐变位置随 t 由 `paintWashes()` 重绘（仅 resize 时）。**不得把渐变/滤镜加回 SVG 内部**（曾导致 6fps，见 §5.5）。
  - 节点 **1 = Zahir Sky Atelier**（primary 橙色强脉冲），弹窗文字已缩减版；Story 按钮 → 打开站内 `#vm-grotto` 故事弹窗。
  - **星星节点** → 弹窗为全出血深色卡（`.sln-cardfull`），完整复刻 Soulful Existence Beyond Earth + High Frontier 2035 两节。
  - 其余特殊节点 = Coming soon 占位；**无自动弹窗**（靠 primary 光晕引导）。
  - 左下角 caption：标题 Soulful Living Networks + 文字链接 CTA「Build with Frisson ›」（现指向 advocater.html）。
  - 弹窗/tooltip 挂在 `document.body`；所有 id 带 `sln-` 前缀；不改 PATH_P/PATH_L 构图数据。
- 语言切换器已隐藏：`build.mjs` 里 `.langsel{display:none!important}`，恢复即删此声明。
- 移动端横向锁定：html/body `overflow-x:clip + overscroll-behavior-x:none`。

### sona.html
- `#s-city` 节：kicker（3.2）→ `.city-lead`（3.3 定位句，白、大）→ `.city-body`（3.3b 诗句，柔）。3.4 finale 已删除。
- 滚动逐词点亮（GSAP ScrollTrigger scrubWords）：现仅剩 `#s-city`；`#s7` 的逐词动画已移除（2026-07-26，老出 bug），改用普通 `.reveal` 淡入。`#s-city` 与 `#s7` 仍**不能加 `content-visibility:auto`**（几何稳定性）。
- **`#s4`「the most exquisite」= 珠串（`s4b-` 前缀，2026-07-28 从横向轮播重做）**：五种感官串成五颗玻璃珠，鼠标掠过弦起波（72 质点波动方程 + 三组驻波漂移），hover 出浮标，点击出**圆形**弹窗（感官照片 + 标签）。轮播、`initGallery()`、`.hgal/.card/.capsule` 已全部删除。
  - **分层死规矩（§5.5 第 1 条）**：藏蓝底图、磨砂颗粒、两张手图都在 SVG **外面**的 div/img 层；SVG 里只有弦 + 珠子 + 闪光。**SVG 内不得有任何 `filter`**——参考稿的柔边全部改成径向渐变烘焙（原稿 20 个 feGaussianBlur 挂在每帧移动的珠子上，25fps 的根因）。磨砂层不用 `mix-blend-mode`。
  - 浮标轮廓走 §5.6 的 `clip-path:path()` 三次贝塞尔（`pinPath()`，`k=0.68R`），**不许**退回胶囊 + 旋转方块。
  - 浮标与弹窗挂 `document.body`；离屏 `.s4b-off` 停 rAF；`.s4b-stage` 带 `contain:paint`；移动端闪光减到 4 个。
  - 五种感官的 canvas 特效引擎保留但降到 **20%**（`.s4fx{opacity:.2}`），`centred()` 改读当前 hover 的珠子（`s4Active`）。
  - 素材：`assets/sona/s4b-hand-a|b.webp`（从参考稿 base64 抽出）；光场底图与噪点仍是内联 data-URI（小、且要平铺）。

### advocater.html
- Frisson Fellow 墙 + 表单；原 Magic Conch 大区块已移到 cities（留注释标记）。
- **Book a Call（`.fc-book#book`，在 hero 内、报名表单 `#joinForm` 之后）**：初始 `hidden`，与表单一起随「Seek Wonder, Bring Vision ›」按钮展开；cal.com inline embed **懒加载**——首次展开时才调 `window.__frissonMountCal()` 挂载（隐藏容器内挂载会量错尺寸，勿改回页面加载即挂载）。calLink **`frisson-os/15min`**，命名空间 `frisson`，品牌色已注入（cssVarsPerTheme）。换链接只改 `calLink` 一处；embed 脚本在页面底部 footer 前。
- **预约页的对外链接 = `https://frisson-os.com/talk-to-founders`（2026-08-21）**：netlify.toml 200 改写到 advocater.html，页面 JS 认出这个路径后自动打开 `#fcFull` 弹层。**发邮件/对外投放就用这条**——纯路径无 fragment，邮件客户端和链接追踪器不会把它吃掉；`/book-a-call` 301 到它。另有两个 hash 入口：`#contact`（cities 的 SLN 弹窗在用）与 `#book`（只能加片段时的备用）。
  - 路径/`#book` 进来会给弹层加 `.fc-full--solo`：**换成实心米色底 + 顶部对齐**。原因：直接进来时页面停在 scroll 0，背后是创始人肖像拼贴，42% 半透明罩在人脸上会让日历没法看；从 CTA 点开时背后是平坦的珊瑚色版面，值得透，所以那条路径保持原样不要动。

### about.html
- 节顺序：Collecting Dreams（含 The Renaissance Archive 四卡）→ Beyond the Canvas → **The Future of AI Begins in the Physical World — with How We Live** → Not a Fantasy。

### sensorylab.html（Sensory World Lab，/sensory-lab）
- 结构：hero `.swl`（100svh 一屏，**不要**改回 `aspect-ratio`——曾按 1040/1512 撑到 1861px，标题掉到首屏外）→ `.swl-layers` 三层账本。
- **标题本身就是粒子**（`assets/swl-fx.mjs`，PixiJS 8 `ParticleContainer`，vendored in `assets/vendor/pixi/` 已 tree-shake 到 510KB/121KB br）。**不要再做「文字↔粒子」的交叉淡入**——那是两个状态互相迁就，怎么调都不丝滑；现在只有一个状态。`<h1>` 仍在 DOM（读屏器、CSS clamp 定字号、逐字符测量），只是 `.swl-fx-on` 之后不再绘制；**WebGL 不可用时该 class 不会加上，印刷标题原样保留**。
- **粒子取点仍然逐字符用 `Range.getBoundingClientRect()`**，字号用 DOM 的原始 px。**不许改回"缩放离屏 canvas 重新排版"**——缩放后的字号落在 Fraunces `opsz 9..144` 的另一个实例上、`letter-spacing` 是 px 值不跟着缩放、换行还会被写死。基线 `(r.height-(asc+desc))/2+asc`，两种 rect 语义都对。
- **默认黑，指针靠近才泛红**：同一条 falloff 同时驱动「分开」与「变色」；tint 是 dynamic property，所以色阶量化成 24 级、**只在跨级时才写**（§5.5 第 4 条）。
- **三条性能红线（都是实测踩出来的）**：
  1. **绝不要每帧调 `container.update()`**。它只置 `_childrenDirty`，而 pipe 把它读作「静态 buffer 也重传一遍」；dynamic 属性本来每帧就会传。删掉它：**6fps → 60fps**。
  2. 取点步长用**分数 stride + keep 概率**。`Math.round()` 在 `ink/target < 2.25` 时塌成 1，桌面宽度下 46000 的预算实际生成了 80398 颗。
  3. **IntersectionObserver 的回调只能当「触发器」，判可见性必须另有持续信号**。本页 `.swl-layers` 的顶边静止时正好贴着视口底边，observer 一开始就认为 intersecting，往下滚不再跨阈值 → 只会回调**一次**；早期代码用更严格的 rect 判断否掉了那唯一一次，粒子场永远建不起来。现在 observer 只管 build，显隐交给 passive `scroll` 复算。
- 实测（1280×820、DPR 2）：hero 45,905 颗 60fps（指针搅动中）；三张图 61,998 颗 60fps；hero 场在图区可见时已 parked。
- **背景质感**：`node bake-swl-texture.mjs` 烘焙。原图只有 1040×1512、满屏要 2.5× 放大，所以把分辨率不足**烤成材质**——喷雾粒子按云雾自身的 mask 做**带通**（密度峰值在边缘而非实心core，实心core本来就该实心）、外圈用模糊 mask 抛洒尘点、全幅叠纸纹与多尺度颗粒。CSS 那层 `.swl-grain` 贴图**放在视差 sheet 内部**：混合只光栅化一次然后整层平移，不会每帧重算满屏 overlay。
- **视差锚点**：Locomotive 的 `--progress` 在文档顶部是 **0**（不是 .5），所以公式写成 `var(--progress,0) * n%`，落地即为设计稿构图。sheet 最多只能位移自身高度的 10/120=8.33%，现取 7%。
- 三层配图**一律不裁，而且三张走同一套设计语言**（同一条左右轨、同样的 squircle 圆角、同样的滚动位移）。前两张（HUD 框、热成像手）靠统一 `max-height`（`--fh`）取得等高节奏；第三张是竖构图的 contact sheet，走 `.swl-layer--tall`——**唯一的区别是不受 `--fh` 限高**，改成填满自己那一栏（`width:100%;height:auto`），于是 720/1280 的竖向比例就是它的存在感。
  - **别再把它做成满宽出血**（2026-08-22 试过一版，被否）：那会打破账本的语言，图三只是「竖着摆」，不是「破格」。
  - **任何时候都不要给它 `object-fit`**：cover 会切掉整排格子，contain 会留白、还会让粒子场围着**盒子**而不是画面（场是按元素 rect 取点的）。
- 三张图周围有**有机粒子场**：密度沿边缘向外按 `pow(1-d/range, 2.1)` 衰减，再乘一条角向 ripple 免得变成均匀描边；每颗的 tint 取自**离它最近的那块画面**的像素，所以是各自的颜料在往纸上散。**节与节之间没有分割线**（靠交替左右轨 + 这层雾就够了，别再加回 hairline）。

### stories.html（Field Notes）
- **排序死规则：顶部 masthead（`.fn-feature`）永远是日期最新的文章；其余按日期倒序放进 `.fn-list` 网格（左上最新）。** 每加一篇新文章：新文章占 feature，原 feature 降为网格第一张卡（记得给它补 `data-cat`）。
- 一篇文章 = 三处同一个 `data-view` 编号：列表卡/feature、`.fn-hero`（文章头图）、`.story`（正文）。图片一图两用（卡片背景 + 文章 hero），放 `assets/city/fn-*.webp`。
- 分类标签：`data-cat="diary"`（meta 显示 Field Note）或 `essay`；tabs 只筛网格卡，feature 恒显。
- 新文章正文直接硬编码在 html 里（不走 i18n）；结构：`st-h st-h-title`（自动全大写）→ `st-sub`（斜体灰）→ `st-date` → 若干 `st-p`。
- 标题右侧橙色 `›` hint 箭头（`.fn-hint`，em 尺寸随标题缩放，常显含移动端）；卡片标题过长时可只取主句，完整标题放文章内。

## 7. 后端系统（全部无独立服务器）

| 系统 | 实现 | 管理方式 |
|---|---|---|
| **Fellow 名单墙** | Netlify Function `netlify/functions/fellows.mjs` + **Netlify Blobs** 存储，API `/api/fellows` | GET 拉名单；POST `{name,title,link}` 加人（自动编号）；删除 `?del=编号&key=FF_ADMIN_KEY`；清空 `?reset=all&key=...`。密钥在 Netlify 环境变量 `FF_ADMIN_KEY`。**改代码不影响名单数据。** |
| **表单**（trial-sleep / fellow 报名等） | Netlify Forms（`data-netlify` + AJAX POST 到 `/`） | Netlify 后台 Forms 面板看提交。同名表单跨页面共用。 |
| **预约通话** | cal.com inline embed（advocater hero 内、表单下方） | cal.com 后台管理 Event Type / 可用时段。 |
| **部署** | git push 到 main → Netlify 自动构建部署 | 本地 dist 仅供预览。 |

## 8. Git 约定（历史教训）

- **开工先 `git pull`，收工 `git commit + push`**——两台电脑交替开发，多次因未同步产生 cities.html 冲突循环。
- 冲突时注意：新版是「Soulful Living Nodes 组件 + News 卡」，旧版是「Zahir Sky Atelier 白色区块」——**保留新版**。
- 提交信息写人话（历史上大量 "445533" 式无意义信息，翻历史极难）。
- 大改动前打 tag 作还原点（如 `git tag before-font-system`）。
- 仓库内 `* 2`、`assets 2` 之类文件是早期 iCloud 同步残留，可删。
- push 慢：`.git` 约 160MB，历史里有十几张 2–3MB PNG；如需瘦身用 git-lfs / 历史重写（谨慎）。

## 9. 待办 / 已知问题

- [ ] cities/about 新增英文硬编码内容缺中文翻译（WHAT WE DO、News 卡、SLN 组件弹窗、Renaissance Archive）。
- [x] cal.com 用户名已从 `jacques-mak-vyyoc6` 改为 `frisson-os`（2026-07-25 验证嵌入正常拉到可约时段）；代码 calLink 已同步为 `frisson-os/15min`。注意：旧的 `jacques-mak-vyyoc6/...` 链接已全部失效。
- [ ] 完整 type-scale token 表（Display/Headline/Title/Body/Label/Caption 连字号行高）尚未建立，目前只统一了字体角色层。
- [ ] 语言切换器隐藏中，中文版页面仍在构建，待翻译补齐后可恢复。
- [ ] 仓库瘦身（大 PNG 历史）。

## 10. 常用命令

```bash
node build.mjs        # 构建全站 → dist/
node gen-i18n.mjs     # 从 content-inventory.md 重新生成 i18n json（会覆盖手改！先同步 md）
node check-css.mjs    # 删过 CSS 后必跑：找「markup 用了但没有规则」的 class（见 §5.7）
node bake-swl-texture.mjs  # 重烘 Sensory World Lab 的质感底图 + 颗粒贴图（确定性，可重复）
npx serve dist        # 本地起服务预览（可选）
```
