# TREASURE HUNTING — 网页端设计文档

Frisson · Sensory Treasure Hunt 获客页面 · v1.0 · 2026-08-15
依据：Frisson_BP_v7.3（02_Treasure_Hunting / 07_Sensory_Lab / 08_Creative_Forces / 03_Audience_List）

---

## 一、需求挖掘

### 1.1 这一页在商业机制中的位置

BP 02 表定义了五步机制：① 进入 → ② 探索 → ③ 选择 → ④ 承诺 → ⑤ 成立。本页面承接的是 **② 探索 与 ③ 选择** 两个环节，并为 ④ 承诺（订金）做情绪与身份上的铺垫。订金支付不发生在本页面——本页面的转化终点是「进入 founding circle 的 Discord」，对应漏斗中「完成世界探索 585 人 → Founding Member 263 人 → 对某处 Node 表达意向 105 人」这一段。

页面必须同时完成 BP 中写明的三件事，这三件事就是本页的三条硬需求：

**聚集需求**——把定向邀请来的访客转化为对某一处 Node 表达意向的人，并让「50 个创始名额」的稀缺性可见、可信、可倒数。

**决定地点**——地点不是我们指定的，是被参与者「选出来」的。页面要让选择显得像发现（treasure hunting），而不是像填问卷。被吸引的人通常也是合适的人：世界观本身承担筛选功能。

**建立感官档案**——BP 原文：「每一次选择被记录为其感官档案的第一笔数据」。这意味着页面上的每一次点击、排序、取舍都不是 UI 事件，而是 Sensory Lab 的数据资产入口。前端交互设计必须让「值得记录的选择」尽可能多且自然。

### 1.2 用户是谁，页面要用什么语气对他们说话

03 表画像：AI 数字贵族与创意新贵，30–45 岁，净资产 $10M+，审美自主、对既有奢侈品牌无历史忠诚、**本身是技术从业者所以排斥被技术标榜的产品**、对广告免疫。据此推出四条体验原则：

1. **不推销**。全页无营销语言、无弹窗、无倒计时压迫。稀缺性用事实陈述（19 places remaining），不用促销话术。
2. **技术隐形**。背后是七维向量匹配，前端只呈现「一个懂你的画廊」。永远不解释算法。
3. **邀请制的骄傲**。页面默认访客是被点名邀请来的，语气是同侪的、克制的，像一封手写请柬而非落地页。
4. **不索取**。不要邮箱、不要姓名、不要表单——这是对这个人群最大的尊重信号，也是用户明确要求的流程（直接发 Discord 邀请）。

### 1.3 从素材上必须用什么

07 表的 **7 个感官维度**（节奏、光、张力、距离、温度、静默、气味）是 Frisson 唯一的方法论资产，感官测试的计分轴必须直接用这七维——这样前端收集的数据可以直接入库 Sensory Lab，「获客素材即设计依据」（07 表 R68 原文逻辑）。08 表的 8 位创意力量给出了各个「世界」的感官原型（马蹄的节奏、天空的光、声音与身心状态、光与水的反射……），Node 候选地的世界观从这里取材。

### 1.4 成功标准（原型阶段）

访客在无引导的情况下能走完 探索 → 显影 → 认领 全链路；每位访客产生 ≥8 条可入档的选择数据；认领动作 ≤2 次点击到达 Discord 邀请；全程无一处要求输入个人信息。

---

## 二、框架设计

体验设计为**五幕连续剧**，单页承载，不刷新、无跳转。命名沿用「寻宝」的隐喻：场域 → 拾取 → 显影 → 地点 → 圆环。

| 幕 | 名称 | 用户做什么 | 系统做什么 | 对应 BP 环节 |
|---|---|---|---|---|
| 0 | The Threshold 门槛 | 读一句话，按下 Begin | 建立仪式感与邀请语境 | ① 进入 |
| I | The Field 场域 | 在漂浮的图片星云中，凭直觉拾取 5 张图 | 每次拾取记录七维向量；星云实时重组，相似的图向你的选择聚拢 | ② 探索 |
| II | The Order 排序 | 把 5 张图按「哪个最像家」排序 | 排序赋权（5:4:3:2:1），锐化档案 | ② 探索 |
| III | The Reading 显影 | 看见自己的 Sensory Identity | 七维档案 + 匹配的 SI 世界显影；生成 Sensory Archive 第一页 | ②→③ 过渡 |
| IV | The Place 地点 | 阅读匹配的 Node（SI #07 — SEVILLE），决定是否认领 | 呈现 Discovered by 31 / 19 Remaining / Status: Forming | ③ 选择 |
| V | The Circle 圆环 | 选择所在地区 → 领取 Discord 邀请 | 分地区发邀请；解锁全网络其他 Node 的 founding residents 状态 | ③→④ 铺垫 |

关键结构决策：

**先测身份，再见地点。** 用户不是从地图上挑地方（那是买房网站的逻辑），而是先被读出感官身份，再被告知「有一个与你共振的地方，它还不存在」。地点作为测试结果出现，天然携带「这是我的」的归属感——这正是「discover a place that feels like you before it exists」的交互化。

**其他 Node 先隐藏、认领后解锁。** 认领前访客只看到自己的匹配地；认领后整个网络显影（其他 SI 的人数与状态）。这既是用户提出的「解锁其他地方的 founding residents」，也让「加入」这个动作获得即时奖励：你进入的不是一个楼盘群，而是一张正在形成的世界网络。

---

## 三、交互体验

### 幕 0 · The Threshold

浅色纸面（#FAF8F3），页面中央一行衬线字：*Somewhere, a place that feels like you does not exist yet.* 两秒后第二行浮现：*The first fifty people to find it will found it.* 底部一枚小字按钮 **Begin the hunt**。右上角一行小字 `By invitation · Frisson`。无导航、无 logo 墙、无解释。

### 幕 I · The Field（核心场景，对标参考图的 network 感）

25 张感官图卡以星云状漂浮在浅色画布上，有极轻微的呼吸式漂移；图卡之间以极淡的细线连接（连接 = 感官向量相似度 > 阈值），形成参考图那种「精致 network」。画布四周以幽灵灰小字标注七个感官维度的极点（RHYTHM / LIGHT / TENSION / DISTANCE / TEMPERATURE / SILENCE / SCENT），像美术馆展签一样克制。

指令只有一句：**Follow what pulls you. Take five.**

悬停一张卡：卡轻微放大浮起，与它相似的卡与连线亮起，其余整体退为半透明；卡下方浮现一行低语式短句（如 *the sound of hooves, far off* / *sea at noon, no wind*）。

点击拾取：卡飞入底部的收集槽（五个空位的细框），星云发生一次**重力重组**——与你选择相似的图卡向画布中心聚拢、变得清晰，气质相反的图卡向边缘退去、变淡。你每拾取一次，场域就更像你一分。第五张拾取完成时，未选中的图卡全部退成幽灵态，只剩你的五张与它们之间的连线——此刻画面本身就是你的感官档案的第一张可视化。

**为什么这样设计**：重组动画把「后端在学习你」翻译成了一个可感的画面而不是一句话；幽灵化处理直接复刻参考图（一簇清晰、其余极淡）的美学；而「拾取」而非「打分」的动词，维持了寻宝的世界观。

### 幕 II · The Order

五张卡横排，指令：**Order them. The one that feels most like home, first.** 拖拽排序（移动端为点选交换）。排序完成按 **Reveal** 。此处不再加任何附加题——五选 + 排序已产生 8 维度 × 5 权重的足够信号，多一步就多一分问卷感。

### 幕 III · The Reading

纸面短暂全白，随后你的 Sensory Identity 像显影液中的照片一样浮现：

编号与名字（如 **SI #07 — SEVILLE · The Sun Interior**），一段三行的读心式描述（写感受，不写参数），你的五张图嵌在描述四周，下方是一条**七维光谱条**——每个维度一根细线，你的位置是一枚小点（不用雷达图，雷达图太仪表盘、太「技术」）。末尾一行小字：*Entry 001 of your Sensory Archive has been written.*

### 幕 IV · The Place

从身份卡向下滚动（或自动过渡），进入地点页：

```
SI #07 — SEVILLE
Discovered by 31 Explorers
19 Founding Places Remaining
Status: Forming
```

配一段两行的地点低语（*A city that keeps its warmth in walls…*），以及一个由 31 枚小点组成的微型圆环图——已认领的位置实心、剩余的空心，稀缺性用图形陈述而非话术。主按钮：**Claim your place in the founding circle →**。按钮下方一行小字：*No forms. No email. A door, not a funnel.*

### 幕 V · The Circle

认领即成。出现 Discord 邀请卡：四个地区（Americas / Europe / Middle East & Africa / Asia-Pacific），点选后生成对应的邀请链接卡片（原型中为占位链接）。文案：*Founding circles gather by region. Yours is forming now.*

随后页面向后拉远——整张星云地图重新显影，这次显示的是**全部 8 个 SI 世界**与它们的实时状态（SI #01 — REYKJAVIK · 12 claimed / SI #05 — ALULA · Status: Igniting …），你的 SEVILLE 高亮为金色。一行结语：*Eight worlds are forming. You are early to one of them.* 允许继续浏览其他世界（为跨 Node 兴趣留数据）。

---

## 四、逻辑定义

### 4.1 数据模型

**图卡（25 张）**：每张卡一个七维向量 `v ∈ [0,1]⁷`，维度语义沿用 07 表：

| 维度 | 0 端 | 1 端 |
|---|---|---|
| rhythm 节奏 | 静止、缓慢 | 脉动、重复 |
| light 光 | 暮色、阴影 | 满日、通明 |
| tension 张力 | 松弛、柔软 | 蓄力、专注 |
| distance 距离 | 亲密、围合 | 辽阔、地平线 |
| temperature 温度 | 冷 | 暖 |
| silence 静默 | 声响、共鸣 | 寂静、屏息 |
| scent 气味 | 矿物、盐、石 | 草木、泥土、花 |

**世界（8 个 SI）**：每个世界一个原型向量 + 编号、地名、别名、低语文案、创始名额状态。世界的感官原型取材自 08 表创意力量：

| SI | 地点 | 别名 | 感官主导（取材） |
|---|---|---|---|
| #01 | REYKJAVIK | The Listening North | 声音与身心状态（Friðrik Karlsson） |
| #02 | UMBRIA | The Cadence | 马蹄的节奏、人马自然共生（Gianluca Laliscia） |
| #03 | KYOTO | The Held Breath | 张力与围合、苔与静默 |
| #04 | AZORES | The Weather Chapel | 天空作为画布、忧郁的光（Samantha Cavet） |
| #05 | ALULA | Deep Time | 沙漠、石、星空（中东通道，Laliscia/AlUla 渊源） |
| #06 | VENICE | The Mirror | 光与水的反射、漂浮（Vincenzo Castaldo） |
| #07 | SEVILLE | The Sun Interior | 热、庭院围合、橙花气味（用户指定示例） |
| #08 | WELIGAMA | The Green Tide | 亲生物、雨与海的声景（Olav Bruin） |

### 4.2 计分与匹配

用户档案向量 `u = Σ (wᵢ · vᵢ) / Σwᵢ`，其中 `wᵢ` 为排序权重（第 1 位 = 5 … 第 5 位 = 1）。匹配分 = 用户向量与各世界原型的**余弦相似度与欧氏近似的混合**（原型用 1 − 归一化欧氏距离，更直觉），取最高者为主匹配 SI，第 2、3 名作为「adjacent worlds」在幕 V 供浏览。匹配必须稳定：同样的五张卡与排序永远得到同一个 SI（无随机项），这保证了机制可被口口相传验证（「我们俩选的一样，结果也一样」）。

### 4.3 感官档案事件流（未来接真实后端的埋点契约）

每个会话产出一份 `SensoryArchive`：

```json
{
  "session": "sa_20260815_xxxx",
  "events": [
    {"t": 0,    "type": "enter"},
    {"t": 8200, "type": "pick",  "card": "hooves", "order": 1},
    {"t": 31000,"type": "rank",  "final": ["hooves","noon-sea","embers","fog","courtyard"]},
    {"t": 40000,"type": "reveal","si": 7, "scores": {"1": 0.62, "7": 0.91}},
    {"t": 52000,"type": "claim", "si": 7, "region": "europe"}
  ],
  "profile": {"rhythm": 0.7, "light": 0.8, "...": "..."}
}
```

原型阶段事件流写入内存并可在控制台查看（`window.FRISSON_ARCHIVE`）；真实版本 POST 到档案服务。**这份 JSON 就是 BP 所说「感官档案的第一笔数据」的技术形态**，也是 Sensory Lab 数据资产的入口格式。

### 4.4 名额与状态机

每个 Node：`capacity: 50`，`claimed: n`，`remaining = 50 − claimed`。状态：`Gathering`（claimed < 15）→ `Forming`（15–39）→ `Igniting`(40–49) → `Founded`（50，进入土地谈判，页面转为等待名单）。SEVILLE 初始 `claimed: 31`（与用户给的 31/19 一致）。原型中认领会实时使 31→32、19→18，让「我影响了这个数字」被亲眼看见。真实版本需要后端原子计数 + 防重复（Discord OAuth 加入即身份，无需注册体系——与「不收邮箱」自洽）。

### 4.5 Discord 路由

四个地区各一个（占位）邀请链接；真实运营时按 BP「分国家和地域」建 channel 结构：`#si-07-seville-founding` 等，用户入群即自动获得对应 SI 的身份组。合规注意（BP 02 表红字口径）：本页全程不承诺任何投资回报、不出现订金金额，承诺环节的法律安排在 Discord 内的后续流程中由律师主导——页面文案已按此口径避写。

### 4.6 原型与真实版本的边界

原型（本次交付）：单文件 HTML，图卡为程序化生成的风格化图版（可整体替换为签约创意力量的真实作品或 AI 精修图），计数为内存模拟，Discord 链接为占位。真实版本需要：档案服务（事件流入库）、名额原子计数、Discord OAuth、图片 CDN、多语言（EN 主、CN 副）与移动端适配深化。

---

*本文档与原型对应；改任何一层（需求/框架/交互/逻辑）请同步更新此文件。*

---

## 变更记录

**v2（同日）**：全面对齐 frisson-os-website 设计语言（Fraunces/Playfair、eyebrow、silk 缓动、squircle、烘焙噪点、pinPath 浮标）；gallery 图卡改圆形；封面改为 Getty 式星云（8 世界簇轮流苏醒 + 左侧 editorial 文字块）。

**v3（同日）**：配色改为海报四色（金/砖红/蓝紫/粉，无碎粒）；橙色胶囊全部移除，推进按钮改为手绘木牌体系并加大；场域标题改为 *Which sensory identity feels like you?*；**幕 IV 重构**——取消系统指派地点，改为超椭圆像素世界地图自选（共振光晕仅作信息），幕 III 只显影身份原型不出现城市名；Discord 环节放大（蓝紫散光 + 官方 logo + 蓝紫木牌）。封面曾改为文字镶嵌式海报构图。

**v3.1（同日，现行）**：封面回退到 v2 星云布局（仅按钮换木牌、沿用新配色）；地图网格加密至 150 列，**全部像素等大**，8 个可认领点为同尺寸砖红像素，悬停/选中以发丝细环表态、不改尺寸。

工程交接细节（架构、契约、红线、编辑配方）见 `treasure-hunting-HANDOFF.md`。
