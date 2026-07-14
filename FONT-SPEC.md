# FRISSON 全站字体规范（现状盘点 + 建议）

> 目的：解释“为什么有这么多字体”，盘点各页现状与不一致，给出一套统一规范供确认。

---

## 一、为什么看起来字体那么多

其实只有 **3 类角色**，多出来的都是「同一角色在不同语言/系统下的替补字」：

1. **拉丁文品牌字**：Playfair Display（衬线，网络字体）
2. **中文字**：中文没有 Playfair 字形，所以要额外指定中文衬线 / 中文黑体
3. **阿拉伯文**：首页有一行阿拉伯文，需要 Amiri
4. **系统替补字**：Georgia、Helvetica、苹方、宋体等，是「网络字体没加载出来时」的兜底

真正的问题不是“字体多”，而是 **各页面的定义不一致**（下面第三节），是过程中逐页微调攒下来的。

---

## 二、现状：全站在用的字体

| 字体 | 类型 | 来源 | 用在哪些页 | 角色 |
|---|---|---|---|---|
| **Playfair Display** | 拉丁·衬线 | 网络字体 | 全部 7 页 | 品牌标题 / 叙事（衬线主力） |
| **Noto Serif SC** | 中文·衬线 | 网络字体 | 仅 cities、howitworks | 中文衬线 |
| **Amiri** | 阿拉伯·衬线 | 网络字体 | 仅 index | 阿拉伯文一行 |
| Georgia | 拉丁·衬线 | 系统 | 全部（--serif 兜底） | 替补 |
| Songti SC / Noto Serif CJK SC | 中文·衬线 | 系统 | sona、cities、howitworks | 中文衬线替补 |
| -apple-system / Helvetica Neue / Segoe UI / Arial | 拉丁·无衬线 | 系统 | 全部（--sans） | UI / 标签 / 正文 |
| PingFang SC / 微软雅黑 | 中文·无衬线 | 系统 | 仅 sona | 中文无衬线 |

---

## 三、当前的不一致（需要统一的地方）

1. **`--serif` 各页不一样**
   - 多数页：`"Playfair Display", Georgia, serif` —— **不含中文字形**，中文会掉到系统默认字（不可控）
   - cities / howitworks：另设了 `--cjk` 变量补中文
   - sona：`"Playfair Display", Georgia, "Songti SC", "Noto Serif CJK SC", serif`（又一套）

2. **`--sans` 各页不一样**
   - 多数页：`-apple-system, "Helvetica Neue", "Segoe UI", Arial, sans-serif`（不含中文）
   - sona：顺序不同，且加了 `"PingFang SC", "Microsoft YaHei"`（含中文）

3. **中文衬线网络字体只在 2 页加载**（cities、howitworks 的 Noto Serif SC）；sona 的 `--serif` 却引用了**没加载**的 Noto Serif CJK SC，实际靠系统宋体顶上。

4. **`--cjk` 变量只有 2 页定义**，其余页没有。

5. **Sona 已改为「非衬线为主」**，与其余页「衬线为主」的品牌调性不同 —— 这是刻意的分区（Sona=技术页），但需要写进规范、明确下来。

---

## 四、建议的统一规范

### 4.1 三个角色（全站同一份 `:root`）

```css
:root{
  /* 衬线 · 品牌与灵魂 —— 标题、叙事、情感文字 */
  --serif: "Playfair Display", "Noto Serif SC", Georgia, "Songti SC", serif;

  /* 无衬线 · 技术与 UI —— 导航、标签、数据、按钮、正文(Sona) */
  --sans:  "Helvetica Neue", "Segoe UI", -apple-system, Arial,
           "PingFang SC", "Microsoft YaHei", sans-serif;

  /* 阿拉伯文特例 —— 仅首页那一行 */
  --arabic: "Amiri", serif;
}
```

要点：`--serif` 和 `--sans` 都**内建中文替补**，中英文表现一致、可控；三个变量**每页都一样**。

### 4.2 角色分工（我们之前定的原则）

- **衬线 = 灵魂 / 待客**：cities、index、howitworks、advocater 以衬线为主
- **无衬线 = 智能 / 技术 / UI**：
  - Sona 页整页以无衬线为主（技术产品页）
  - 全站的导航、kicker/eyebrow、标签、数据、按钮一律无衬线

### 4.3 网络字体加载（每页只加自己用到的）

- **Playfair Display**：全站都加载
- **Noto Serif SC**：给「有中文衬线」的页加载（cities、howitworks、advocater、index、terms、privacy）
- **Amiri**：只有 index 加载

---

## 五、落地清单（确认后我来做）

- [ ] 把 `--serif` / `--sans` / `--arabic` 统一成上面这一份，替换到全部 7 页
- [ ] `--cjk` 合并进 `--serif`（不再单独存在）
- [ ] 各页按需加载 Noto Serif SC（补齐中文衬线）
- [ ] 明确 Sona 保留「非衬线为主」的特例（当前如此）
- [ ] 全站构建 + 中英文各页抽查
