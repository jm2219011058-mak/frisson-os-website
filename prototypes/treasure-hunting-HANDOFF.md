# HANDOFF — Treasure Hunting 原型
`prototypes/treasure-hunting.html` · v3.1 · 2026-08-15
交接对象：frisson-os-website 的 code agent。读完本文件你应该能在不破坏任何既有决策的前提下修改这个原型。

---

## 一、这是什么

Frisson 获客机制「Sensory Treasure Hunt」的网页端可玩原型，对应 BP（Frisson_BP_v7.3）02 表的 ②探索→③选择 环节。它要同时完成三件事：聚集需求（认领创始名额）、决定地点（用户在地图上自选，**不是系统指派**）、建立感官档案（每次交互写入七维数据）。目标用户是被定向邀请的 AI 新贵（03 表画像），体验预算约 10 分钟，全程**不收集邮箱和姓名**——转化终点是进入分地区的 Discord founding circle。

单文件、零依赖、零构建。双击就能在浏览器里跑通全流程。它目前住在 `prototypes/`，**尚未接入 src/ 的 build 与 i18n 管线**（见 §八）。

配套文件：`TREASURE_HUNTING_设计文档.md`（需求挖掘→框架→交互→逻辑四层，末尾有版本变更记录）。

## 二、五幕流程与状态机

```
act0 封面    星云簇轮流苏醒（8 世界，3.4s 一换）→ 木牌 begin the hunt
act1 场域    25 张圆形感官图卡双环轨道（2026-08-18 重排：投影角保序等角距落位，
             内环=均衡卡、外环=个性卡；七维轴标签撤除；卡径统一 84px），
             凭直觉拾取 5 张；每次拾取场域向用户重组
act2 排序    5 张卡拖拽排序（最像家的排第一）
act3 显影    感官身份原型（只显示别名如 The Sun Interior，不出现城市名）+ 七维光谱
act4 地图    超椭圆像素世界地图；8 个可认领点=同尺寸砖红像素；紫色光晕=共振度；用户自选
act5 圆环    选地区 → Discord 邀请卡（蓝紫散光+logo）→ 解锁全部 8 世界实时状态
```

节点状态机：`claimed <15 Gathering · 15–39 Forming · 40–49 Igniting · 50 Founded`（`worldStatus()`）。
认领计数目前是**内存模拟**，刷新即重置；SEVILLE 初始 31/50 与用户提供的示例数字一致，不要随手改。

## 三、代码架构地图

文件内以注释分区，按顺序：

| 分区 | 内容 | 关键符号 |
|---|---|---|
| `<style>`（唯一一个） | 全部 CSS，内部再按 act 分段注释 | 设计 token 在 `:root` |
| `==== DATA ====` | 七维定义、25 张卡、8 个世界、Discord 链接、档案事件流 | `DIMS` `CARDS` `WORLDS` `REGION_LINKS` `CAPACITY` `ARCHIVE` `logEvent` `sim()` |
| `==== CARD ART ====` | 程序化图卡引擎（种子随机，渲染永远一致） | `mulberry32` `MOTIFS` `renderCard` `CARD_SRC` |
| `const LAND=...` | 烘焙的世界地图点阵（150×54 网格，2,565 枚陆地像素） | `LAND.cols/rows/latTop/latBot/pts` |
| `==== FIELD ====` | act1 星云：投影布局、相似度连线、悬停亲缘、拾取重组、pin 浮标 | `buildField` `layoutField` `pickTile` `hoverTile` `pinPath` `showPin` `fieldFrame` |
| `==== FLOW ====` | 幕切换、封面、排序拖拽、计分显影、像素地图、认领、Discord、网络解锁 | `showAct` `buildCover` `computeReading` `buildMap` `drawMap` `updateMapDetail` `selectRegion` |

## 四、数据契约（改逻辑前必读）

**七维顺序永远是** `[rhythm, light, tension, distance, temperature, silence, scent]`，各维 0–1，语义见设计文档 §4.1。卡片向量 `CARDS[i].dims` 与世界原型 `WORLDS[i].proto` 都用这个顺序——**这是 Sensory Lab（BP 07 表）的方法论资产，维度不许增删改名**。

计分：排序权重 5:4:3:2:1 加权平均得用户向量 `u`；匹配分 `sim(u, proto) = 1 − 欧氏距离/√7`。**必须保持确定性**（同样的选择永远同样的结果，机制靠口口相传验证），任何改动不得引入随机项。

档案事件流 = 未来后端的埋点契约，控制台 `window.FRISSON_ARCHIVE` 可查：

```json
{"session":"sa_...","events":[
  {"t":0,"type":"enter"},
  {"t":8200,"type":"pick","card":"hooves","order":1},
  {"t":31000,"type":"rank","final":["hooves","..."]},
  {"t":40000,"type":"reveal","si":7,"scores":{"1":0.62,"7":0.91}},
  {"t":45000,"type":"map_select","si":7,"resonance":0.917},
  {"t":52000,"type":"claim","si":7},
  {"t":56000,"type":"region","region":"europe"}],
 "profile":{"rhythm":0.23,"...":0}}
```

真实版本把这份 JSON POST 到档案服务即可，事件名和字段是和产品方对齐过的，别改。

## 五、Design tokens 与组件

| Token | 值 | 用途 |
|---|---|---|
| `--ink` | #2b1d12 | 正文、描边（与主站一致） |
| `--gold / --gold-deep` | #E9BC55 / #C08F35 | 木牌按钮面/侧沿 |
| `--brick` | #B9503F | 强调字、地图可认领像素、状态色 |
| `--violet` | #6E74C4 | 光谱点、共振光晕 |
| `--pink` | #D9A3A6 | 角落色场 |
| `--blurple` | #5865F2 | Discord 专用（卡、按钮、选中地区） |
| `--silk` | cubic-bezier(0.25,0.1,0.25,1) | 全站唯一缓动（主站 §5.9） |
| `--pagepad / --sp-lg/md/sm` | clamp 三段 | 页边距与间距节奏（主站 §5） |

**禁止色**：橙色胶囊（`#e07b3c` 的 pill CTA）在本页被产品方明令移除，不要因为主站有就加回来。

核心组件与状态：

| 组件 | 状态 | 行为 |
|---|---|---|
| `.plank` 木牌按钮 | hover | 下沉 2px + 微旋 −0.5°，侧沿变薄 |
| | active | 下沉 6px（按实感） |
| | 变体 | `.md` 小号 · `.lite` 白面 · `.blurple` Discord |
| `.tile` 圆形图卡 | hover | scale 1.42 + pin 浮标低语短句 |
| | kin | 与悬停卡相似度 >0.82 → scale 1.12 |
| | faded / ghosted | 与当前档案相斥 → 0.15 / 拾取结束 → 0.08 |
| 地图可认领像素 | 默认 | 砖红，**与陆地像素完全同尺寸**（产品红线） |
| | hover / selected | 发丝细环 + 指针高斯凸起场（2026-08-18 产品方拍板：**所有像素**在指针场下同场同尺度微放大，陆地与可认领一视同仁——尺寸平等原则以新形态保留，颜色仍是唯一身份区分）；环随场缩放 |
| `#invite-card` | 出现 | 蓝紫 bloom（`#invite-glow`）+ squircle 圆角 + Discord logo |
| `#pin` 浮标 | 全局唯一 | §5.6 一条 path 的 pinPath（k=0.68R），尺寸变了才重算 clip-path |

动效速查：幕切换 1.1s silk；显影瀑布 0.2→4.2s 逐级延迟；封面苏醒 1.3s、每 3.4s 轮换；场域漂移 rAF（lerp 0.055 + 正弦微摆）；`pulse` 呼吸 2.4s ease-in-out（端点零速度，合规循环）。

## 六、注意事项（红线）

**产品决策红线**（用户逐条拍板过，改动要先问人）：
1. 地点由用户在地图上**自选**，系统只给共振光晕作信息——不要恢复任何"推荐/指派"逻辑。
2. 全程无表单、无邮箱——出口只有 Discord。
3. 地图像素全等，可点击的只用颜色区分；状态用细环表达。（2026-08-18 补充：悬停高斯凸起场对全体像素一视同仁，平等原则不破；选中详情与 pin 显示国家；桌面整幅满宽铺开、画缘羽化融纸，窄屏保底 12px 平移。）
4. 封面是 v2 星云布局（v3 海报版被否，"用力过猛"）；只允许微调。
5. 文案句式：sentence case、无营销腔、无三连排比；`Which sensory identity feels like you?` 是钦定标题。
6. SEVILLE 示例数字 31/19/Forming 来自产品方原始需求。

**技术红线**（继承主站 CLAUDE.md，本文件已合规，别改破）：
1. logo「FRISSON」钉死 Playfair Display，O 用金色；其余全部 Fraunces。
2. 连续动画只碰 transform/opacity；rAF 有写入去重与 `field.running` 开关；噪点是烘焙贴图，**禁止**运行时 feTurbulence 滤镜压在活动画上（历史事故 6fps）。
3. 带阴影的大圆角卡用 `corner-shape: squircle`（@supports 包裹），不用 clip-path（会裁掉阴影）。
4. 指向性小标签一律复用 pinPath（源头 `components/pin-label.html`），不要用「胶囊+旋转方块」硬拼。
5. 运行时不使用 `Math.random()`——所有随机来自 `mulberry32(seed)`，保证每次渲染逐像素一致（截图回归测试依赖这一点）。
6. 字体从 Google Fonts 引入，断网退回 Georgia——沙盒/离线截图字体不对是预期行为，不是 bug。

**已知局限**：认领计数无持久化；Discord 链接是占位（`REGION_LINKS`）；触屏交互能用但未打磨（拖拽排序在移动端是点选交换的粗糙实现）；无键盘可达性与 ARIA（见 §九欠账）。

## 七、编辑窍门（常见改动配方）

**可调参数速查**：

| 想调什么 | 在哪 |
|---|---|
| 拾取张数（现 5） | `pickTile` 内 `>=5` 与 `===5`、slots 数量、权重数组 `[5,4,3,2,1]` |
| 亲缘/连线阈值 | `hoverTile` 0.82/0.72 · `buildField` pairSims 0.795 |
| 场域半径与重组力度 | `fieldMetrics` R=0.36 · `pickTile` 内 0.22+(1−n)*0.95 |
| 封面苏醒节奏 | `startCoverCycle` 3400ms · 首个苏醒 `awakeIdx=2` |
| 状态机门槛 | `worldStatus` 15/40/50 · `CAPACITY` |
| 地图密度 | 重烘 LAND（见下）· 像素形状 `drawMap` 里 `s=cell*0.66, r=s*0.38` |
| 命中半径 | `mapHit` `max(18, cell*2.6)` |

**换真实图片**（最常见的下一步）：图必须是**正方形**；把 `CARD_SRC[id]` 从 `renderCard` 产物换成图片 URL 或 dataURL 即可，其余渲染不用动。关键是每张图的 `dims` 七维向量要人工重标——它驱动布局、连线、计分的一切。`MOTIFS`/`renderCard` 整段留着当兜底。

**加第 9 个世界**：`WORLDS` 加一条（si/name/alias/region/proto/claimed/whisper/desc）+ `GEO` 加经纬度即可，地图、网格、封面全部自动跟上；只需注意 act5 `#world-grid` 是 4 列，9 个会孤行。

**重烘世界地图**（改密度/纬度范围时）：
```bash
npm i world-atlas topojson-client
node bake-land.js   # 见文档同目录脚本；COLS 改密度，latTop/latBot 改范围
# 然后把输出 JSON 替换 HTML 里 const LAND={...}; 一行
```

**CSS 修改规范**：整页只有一个 `<style>`；按主站 §5.7 用**唯一锚点字符串替换**，别用行号或正则区间。每个 act 有分段注释可作锚。

**回归测试**（tiles 一直在漂移，物理 hover 永远 not stable——用 evaluate 驱动）：
```js
// playwright：await page.evaluate(idx => pickTile(idx), idx) 逐张拾取；
// 地图点位从 mapState.markers 取坐标后 mouse.click；
// 断言 window.FRISSON_ARCHIVE.events 序列 = enter,pick×5,rank,reveal,map_select,claim,region
```
固定校验组合：`courtyard/blossom/window/embers/greenhouse` → 最高共振必须是 SEVILLE(≈0.92)。

## 八、接入正式站点时（roadmap）

搬进 `src/` 时要做：文案抽 token 过 `gen-i18n.mjs`（EN 主 CN 副）；跑 `check-css.mjs`；nav 换成站点公共 nav；`REGION_LINKS` 换真实 Discord 邀请 + 入群自动挂 SI 身份组；档案事件流接后端（POST + 名额原子计数 + 防重）；订金/金额等敏感口径**继续不出现在页面上**（BP 02 表红字合规要求）。

待产品拍板的悬案：① 可认领像素是否加极慢呼吸（透明度 0.7↔1.0）帮助发现——首测后定；② SI 编号是否与地点解耦（现在选了 Seville 就是 SI #07）；③ 移动端深度适配的优先级。

## 九、无障碍欠账（接正式站前必须补）

焦点顺序未管理（幕切换后焦点不迁移）；图卡与地图像素无键盘路径（需要方向键遍历 + Enter 拾取/选择的等效操作）；pin 浮标内容未进 aria-live；图卡 img 均为空 alt（换真实图片时补描述性 alt）；色彩对比大体达标但砖红像素 vs 灰像素对色弱用户偏弱（呼吸动效或形状差异可一并解决）。
