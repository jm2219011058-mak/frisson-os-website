# 交接文档：frisson-os-website 多语言(i18n)结构 & 当前 git 待办

> 给另一台电脑上的 Claude / 协作者看。读完请先处理「一、现在要做的事」,再了解「二、结构」和「三、以后的规矩」。

---

## 一、现在马上要做的事(git 推送被拒)

在 A 电脑上刚做了一次提交并 push,但被远端拒绝,报:

```
! [rejected]  main -> main (fetch first)
error: failed to push some refs ...
hint: Updates were rejected because the remote contains work that you do not have locally.
```

原因:远端(GitHub)有这台电脑还没有的提交,需要**先拉再推**。

### 处理步骤

```bash
cd "<本机项目路径>/frisson-os-website"
git pull --no-rebase
git push
```

### 可能出现的冲突(只可能在这两个文件上)

本次改动把 `i18n/en.json`、`i18n/zh.json` **移出了 git 跟踪**(它们现在是生成产物)。如果远端那份还在跟踪这两个文件,`git pull` 时它们可能报冲突。

**处理原则:这两个 json 一律不保留(删除),它们会在构建时自动重新生成,删掉不会丢任何翻译。**

命令行解决:

```bash
git rm i18n/en.json i18n/zh.json
git commit -m "merge: 保持 i18n JSON 为生成产物"
git push
```

VS Code 图形界面解决:在 Merge Changes 里对这两个文件选「保留删除 / Delete」,再提交、再 Sync。

### 推送成功后自检

```bash
node gen-i18n.mjs && node build.mjs
```

应输出类似 `en keys: 181  zh keys: 155` 和 `Built 7 page(s) × 2 language(s)`,且 `dist/**/*.html` 里不应出现 `⟪...⟫` 这种占位符。

---

## 二、多语言结构(务必理解,否则会反复出 bug)

这是一套「一个模板 + 每语言 JSON + 构建期生成」的静态多语言站。

- **模板**:`src/*.html`,里面用 `{{key}}` 占位。CSS、字体、排版也在这里。
- **翻译源头(真正要改的地方)**:
  1. `content-inventory.md` —— 一张 `| key | EN | ZH |` 的表格,放**纯文本**翻译。
  2. `gen-i18n.mjs` 里的 `O = { ... }` 覆盖对象 —— 放**带 HTML / `<br>` / 含 `|` 字符 / 需要独立 key** 的翻译(因为这些在 markdown 表格里会破坏 `|` 分隔或需要标签)。
- **生成产物(不要手改、不进 git)**:`i18n/en.json`、`i18n/zh.json`。由 `node gen-i18n.mjs` 从上面两个源头重新生成,**每次构建都会被覆盖**。
- **构建命令**(Netlify 和本地都用这个):`node gen-i18n.mjs && node build.mjs`,输出到 `dist/`。Netlify 发布 `dist/`。
- **取词回退逻辑**(`build.mjs`):先找当前语言的 key → 找不到回退英文 → 两种语言都没有,就在页面上打出可见标记 `⟪key⟫`(带 eyebrow 样式时会显示成大写、橙色,例如 《LAUNCH.PREP》)。看到这种就是「模板引用了 key,但源头 JSON 里没有」。

### 为什么之前一直出 bug(根因)

之前有人**直接手改 `i18n/*.json`**,本地只跑 `node build.mjs` 预览看着是对的,提交推送。但 Netlify 跑的是完整命令,第一步 `gen-i18n.mjs` 会**从旧源头重新覆盖 JSON**,于是线上要么变回旧文案,要么因为新 key 不在源头里而打出 `⟪key⟫` 占位符。两台电脑就算和 GitHub 完全同步也没用,因为矛盾在「手改的 JSON」和「构建时重新生成的 JSON」之间。

### 本次已做的结构性修复(A 电脑,commit 约 `0f4f6c7`)

- `.gitignore` 增加 `i18n/en.json`、`i18n/zh.json`,不再进 git。
- `gen-i18n.mjs` 增加 `fs.mkdirSync('i18n', { recursive: true })`,保证全新克隆也能生成。
- 新增 `i18n/.gitkeep` 保留文件夹。
- 把之前手改在 JSON 里的中文全部搬回源头(`gen-i18n.mjs` 的 `O` 和 `content-inventory.md`),并补齐新 key:`2.13.eyebrow`、`launch.prep`、`zahir.f7.v`。

---

## 三、以后改翻译的规矩(重要)

1. **绝不手改 `i18n/en.json` / `i18n/zh.json`。** 它们是生成产物。
2. 改翻译:
   - 纯文本 → 改 `content-inventory.md` 表格对应行的 ZH/EN 单元格。
   - 带 HTML / `<br>` / 含 `|` / 独立 key → 改 `gen-i18n.mjs` 的 `O` 对象(`'key': ['英文', '中文']`)。新增 key 也加在这里或表格里。
3. 改排版 / 字体 / 颜色 / 透明度 → 改 `src/*.html`(模板)。注意按语言区分可用 `html[lang="zh"] ...` 选择器。
4. 改完**一定跑完整构建**:`node gen-i18n.mjs && node build.mjs`,确认 `dist` 里没有 `⟪⟫`。
5. 两台电脑:**先 `git pull` 再动手**,提交时把 `content-inventory.md`、`gen-i18n.mjs`、`src/` 一起提交;JSON 不用管(已 gitignore)。
6. 线上生效仍需 commit + push(Netlify 自动构建发布)。

---

## 四、给另一台电脑 Claude 的一句话任务

> 「帮我把当前分支 `git pull --no-rebase` 后 `git push`;如果 `i18n/en.json`、`zh.json` 冲突就删除它们(它们是生成产物)再提交推送;最后跑 `node gen-i18n.mjs && node build.mjs` 确认 dist 里没有 `⟪⟫` 占位符。以后改翻译只改 `content-inventory.md` 或 `gen-i18n.mjs`,不要碰 i18n 的 json。」
