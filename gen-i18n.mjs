// Regenerate i18n/en.json + i18n/zh.json from content-inventory.md, then apply
// overrides for blocks that carry inline HTML / <br> or need dedicated keys.
// Re-run this whenever the translation table changes.
import fs from 'node:fs';

const md = fs.readFileSync('content-inventory.md', 'utf8');
const en = {}, zh = {};
for (const line of md.split('\n')) {
  const l = line.trim();
  if (!l.startsWith('|')) continue;
  const cells = l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(s => s.trim());
  if (cells.length < 3) continue;
  const [c0, cen, czh] = cells;
  if (/^母版$/.test(c0) || /^-+:?$/.test(c0)) continue;
  const m = c0.match(/^([0-9]+(?:\.[0-9]+[a-z]?)?|[A-Z][a-z]+)/);
  if (!m) continue;
  const key = m[1];
  const clean = s => (s === '' || /^\*?[(（]?待/.test(s)) ? null : s.replace(/^\*|\*$/g, '').trim();
  const e = clean(cen), z = clean(czh);
  if (e != null) en[key] = e;
  if (z != null) zh[key] = z;
}

// ---- overrides (HTML-bearing / dedicated keys) ----
const O = {
  'nav.cities': ['More-Than-Human Cities', 'More-Than-Human Cities'],
  'nav.sona': ['Sona AI', 'Sona AI'],
  'nav.advocater': ['Advocater Program', 'Advocater Program'],
  '2.1': [`A world of your own to forge.<br>What will it become?`, `A world of your own to forge.<br>What will it become?`],
  '2.4': [`Space sensing your body,<br>Space healing your body,<br>Soulful living,`, `感知你身体的空间，<br>疗愈你身体的空间，<br>有灵魂的栖居，`],
  '2.5': [`"Out of avidity to see the Immortals, to touch that <b>more-than-human City</b>, I could hardly sleep. And as though the Troglodytes could divine my goal, they did not sleep either."`, `“出于渴望一睹不朽者、触碰那座<b>超越人类之城</b>，我几乎难以成眠。仿佛穴居人窥破了我的心意，他们也彻夜未眠。”`],
  '2.14a': [`<b class="pl">Florence</b> is Brunelleschi's proportion, the blue-grey pietra serena, Raphael's frescoes, and Buontalenti's man-made grotto in the Boboli Gardens.`, `<b class="pl">佛罗伦萨</b>,是 Brunelleschi 的比例、pietra serena 的青灰石、Raphael 的湿壁画,和 Boboli 花园里 Buontalenti 的人工岩窟(grotto)`],
  '2.14b': [`<b class="pl">Chatsworth</b> is a book never finished — from William Kent's seats and Paxton's glasshouse to Lucian Freud's portraits.`, `<b class="pl">查茨沃斯</b>是一部从未写完的书,从 William Kent 的座椅、Paxton 的温室,到 Lucian Freud 的肖像`],
  '2.14c': [`<b class="pl">The Palmela Palace</b> holds Anatole Calmels's herms, the illusions of trompe-l'œil, the Eastern motifs of chinoiserie, and the tender glaze of blue-and-white azulejos.`, `<b class="pl">帕尔梅拉宫</b>藏着 Anatole Calmels 的赫姆柱(herm)、trompe-l'œil 的错视、chinoiserie 的东方纹样,和 azulejos 蓝白釉瓷的温润光泽`],
  '2.14d': [`<b class="pl">Montmorency's Écouen</b> is a fortress that breathes, gathering the finest hands of an entire age — Jean Bullant's loggia, Jean Goujon's sculpture, Léonard Limosin's Limoges enamel, and the ceramics of Bernard Palissy and Masséot Abaquesne.`, `<b class="pl">Montmorency Écouen</b> 是一座会呼吸的要塞,集结了整个时代最好的手-Jean Bullant 的敞廊(loggia)、Jean Goujon 的雕刻、Léonard Limosin 的利摩日珐琅、Bernard Palissy 与 Masséot Abaquesne 的陶。`],
  '2.23.tag': [`The Heart-Pounding Magic of Tuning Your Body.`, `调谐身体的悸动魔法。`],
  '2.24': [`Enter Sona &rsaquo;`, `进入 Sona &rsaquo;`],
  '3.14.num': [`130&nbsp;/&nbsp;168 hours <span class="wk">(One week)</span>`, `130&nbsp;/&nbsp;168 小时 <span class="wk">（一周）</span>`],
  '3.14.cap': [`Average time we spend at home in life`, `我们一生待在家中的平均时长`],
  '3.15.cap': [`local private AI compute power`, `本地私有 AI 算力`],
  '3.17.eyebrow': [`Data Sovereign`, `数据主权`],
  '3.17.title': [`What happens in Frisson<br>Stays in Frisson`, `发生在 Frisson 的一切，<br>留在 Frisson`],
  'sense.sound': [`cinematic sound design`, `影院级声音设计`],
  'sense.light': [`dynamic lighting`, `动态光照环境`],
  'sense.temp': [`temperature haptic`, `温度触感`],
  'sense.scent': [`environment scent`, `环境香薰气息`],
  'sense.air': [`air composition`, `空气成分`],
};
for (const [k, [e, z]] of Object.entries(O)) { en[k] = e; zh[k] = z; }

fs.writeFileSync('i18n/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('i18n/zh.json', JSON.stringify(zh, null, 2));
console.log('en keys:', Object.keys(en).length, ' zh keys:', Object.keys(zh).length);
