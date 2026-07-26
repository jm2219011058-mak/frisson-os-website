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
- **对齐**：同屏元素左边线必须落在同一网格上（如 NEWS 与 WHAT WE DO 两个 eyebrow 顶部同线、移动端文块与卡片内 label 同 x）。
- **Eyebrow 标签**：sans 700、letter-spacing .18em、白底上用灰 `#8c837a`、深色底上用白。
- **CTA 两种形态**：小橙胶囊（`padding:9px 22px`、字重 500、hover `#c96a2f`、无大阴影）或 安静文字链接 + `›` 箭头（hover 变橙、箭头右滑）。**不用大胶囊、不用重阴影。**
- 层级靠「字号 + 明暗」表达，不靠满段加粗；英文句式用正常 sentence case，避免 AI 腔（converge/weave/三连排比）。
- 品牌色：橙 `--accent:#e07b3c`；墨色 `--ink:#2b1d12`。

## 6. 各页关键结构备忘

### cities.html（最复杂）
自上而下：hero（Feel forward.）→ 阿莱夫引言 `.editorial`（58svh 垂直居中）→ **NEWS 卡 + WHAT WE DO 分栏 `.mf-wwd`** → 迁徙图 → **Soulful Living Nodes 交互地图** → Sky Mansion 系列 → Sona 暗带（**页面到此为止**）。
- Sona 暗带以下（LIFE FRONTIER props / Moon / High Frontier 2035）已用 `.below-sona-hidden{display:none!important}` 整体隐藏（2026-07-25）——内容仍在 SLN 星星/横条弹窗里活着；恢复 = 删掉该 class。ownership teaser 更早已注释掉（备份在 components/ownership-teaser.html）。`<dialog class="vision">` 们必须保留（SLN 弹窗依赖）。

- **NEWS 卡（Magic Conch）**：左栏卡片，元素居中、NEWS 标签左上；标题单行 nowrap + 右侧圆形箭头（36px）触发内联 Netlify 表单 `trial-sleep`；移动端(≤820px)变全幅背景图 banner（trial-bg.jpg + 遮罩）。相关脚本在页面前部，已用 `slnTrialInit` 延迟到 DOMContentLoaded 绑定——**勿改回立即执行**。
- **Soulful Living Nodes 组件**（`sln-` 前缀，源备份在 `components/sln-fragment.html`）：
  - SVG 日历地图，viewBox 随视口比例在竖版 800×1067 ↔ 横版 1400×800 间无级形变；满宽、高度随自身比例。
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

### advocater.html
- Frisson Fellow 墙 + 表单；原 Magic Conch 大区块已移到 cities（留注释标记）。
- **Book a Call（`.fc-book#book`，在 hero 内、报名表单 `#joinForm` 之后）**：初始 `hidden`，与表单一起随「Seek Wonder, Bring Vision ›」按钮展开；cal.com inline embed **懒加载**——首次展开时才调 `window.__frissonMountCal()` 挂载（隐藏容器内挂载会量错尺寸，勿改回页面加载即挂载）。calLink **`frisson-os/15min`**，命名空间 `frisson`，品牌色已注入（cssVarsPerTheme）。换链接只改 `calLink` 一处；embed 脚本在页面底部 footer 前。

### about.html
- 节顺序：Collecting Dreams（含 The Renaissance Archive 四卡）→ Beyond the Canvas → **The Future of AI Begins in the Physical World — with How We Live** → Not a Fantasy。

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
npx serve dist        # 本地起服务预览（可选）
```
