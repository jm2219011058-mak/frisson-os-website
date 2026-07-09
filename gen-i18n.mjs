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
  '2.4': [`Space healing your body,`, `疗愈你身体的空间，`],
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
  // --- Sky Mansion series (cities page) ---
  // --- Recovery spaces marquee ---
  'rec.cold.name': [`Cryotherapy Chamber`, `液氮恢复空间`],
  'rec.cold.cap': [`Deep cellular renewal through liquid-nitrogen cold immersion — a surge of vitality that resets body and mind in moments.`, `以液氮低温瞬间唤醒细胞活力，让身心在数秒间重启、焕然一新。`],
  'rec.red.name': [`Infrared Sanctuary`, `红外线照射空间`],
  'rec.red.cap': [`Restorative warmth from full-spectrum infrared light, easing muscle and circulation as it reaches gently to the core.`, `全光谱红外线的温热层层渗入，舒缓肌肉、促进循环，直抵身体深处。`],
  'rec.herb.name': [`Herbal Steam Ritual`, `中药蒸熏空间`],
  'rec.herb.cap': [`A Chinese medicinal steam ritual, where herb-laden vapour draws out fatigue and returns the body to balance.`, `中式药草蒸熏之礼，草木蒸气拂去疲惫，令身体重归平衡。`],
  'rec.sky.name': [`Sky Pool`, `天空游泳池`],
  'rec.sky.cap': [`Weightless calm in a pool suspended against the sky — where water and horizon dissolve into one.`, `悬于天际的一池静水，水面与地平线在此融为一体，让人失重般安宁。`],
  'rec.light.name': [`Sound & Light Therapy`, `声光氛围恢复空间`],
  'rec.light.cap': [`Profound serenity through immersive Sound & Light Therapy — chromotherapy and healing frequencies woven into a tranquil setting, inspired by the visionary art of Alex Grey.`, `在沉浸式声与光中抵达深层宁静——色彩疗法与疗愈频率交织于静谧之境，灵感源自 Alex Grey 的幻视艺术。`],
  'prop.eyebrow': [`Commercial Residence`, `Commercial Residence`],
  'prop.v2035': [`Vision 2035`, `Vision 2035`],
  'prop.learn': [`Learn more`, `了解更多`],
  'grotto.loc': [`OMAN / QATAR / DUBAI`, `OMAN / QATAR / DUBAI`],
  'grotto.name': [`Sky Atelier`, `Sky Atelier`],
  'grotto.s1': [`m² per residence`, `平米 · 每户`],
  'grotto.s2': [`residences`, `户`],
  'grotto.s3': [`floors`, `层`],
  'grotto.vision': [
    `<p>Beauty once lingered in Florence for a full century; our ambition is to let it dwell again, the world over. This is how the Renaissance took the measure of the world: Brunelleschi's golden proportion, the blue-grey pietra serena, the five-centuries-unfaded colour Raphael sealed in buon fresco, and the axis in the Vasari Corridor that stitched power to beauty. And the deeper you go, the more beauty hides.</p><p>Through the layered green arcades of the Boboli Gardens you reach Buontalenti's man-made grotto — rustication dripping from the vault, walls inlaid with shell and tufa, water trembling across stone, statues half-revealed in an almost sfumato dusk.</p>`,
    `<p>美，曾在佛罗伦萨停留了整整一个世纪；而我们的野心，是让它在世界各地，重新栖居。这里是文艺复兴丈量世界的方式：Brunelleschi 的黄金比例，pietra serena 的青灰砂岩，Raphael 以真湿壁画（buon fresco）封存的、五百年不褪的丹青，与 Vasari 走廊里那条缝合了权力与美的轴线。而愈往深处，美愈是隐匿。</p><p>穿过 Boboli 花园层叠的绿廊，直抵 Buontalenti 的人工岩窟（grotto）——钟乳饰（rustication）自拱顶垂落，贝壳与凝灰岩（tufa）镶嵌成壁，水痕浮动，雕像在 sfumato 般的幽昧里，半隐半现。</p>`,
  ],
  'deer.loc': [`United Kingdom · Cavendish`, `英国 · Cavendish`],
  'deer.name': [`The Deer Garden`, `The Deer Garden`],
  'deer.vision': [
    `<p>There is a book four hundred years in the writing, still without a final chapter; it was written in Devonshire, and our ambition is to write its next pages for the world. Seventeen generations, under one roof, have laid down the masterpieces of their age in stratigraphy: William Kent's Palladian furniture, Grinling Gibbons's limewood carving, Paxton's wrought-iron glasshouse that foretold the Crystal Palace, and at last Lucian Freud's unflinching portraits — this is the Devonshire Collection.</p><p>Beyond the window lies a horizon written by Capability Brown's own hand in the art of landscape gardening: three centuries of deer park, unfurling slowly in the morning mist.</p>`,
    `<p>有一部书，写了四百年，至今没有终章；它成书于德文郡，而我们的野心，是替它，续写向世界。十七代人，在同一屋檐下层层叠加（stratigraphy）各自时代的杰作：William Kent 的帕拉第奥式家具，Grinling Gibbons 的椴木高浮雕（limewood carving），Paxton 那座预告了水晶宫的锻铁玻璃温室（conservatory），直至 Lucian Freud 逼视人心的肖像——这，便是 Devonshire Collection。</p><p>窗外，是 Capability Brown 以自然式造园（landscape gardening）一手写就的地平线：三百年的鹿苑，在晨雾中缓缓舒展。</p>`,
  ],
  'hill.loc': [`Portugal · Palmela`, `葡萄牙 · Palmela`],
  'hill.name': [`The Seventh Hill`, `The Seventh Hill`],
  'hill.vision': [
    `<p>Lisbon stands upon seven hills; and its deepest splendour hides within the seventh — behind a plain Neoclassical façade. This art of concealment is what our ambition would carry to the world. Within the bare walls lies another world entire: Anatole Calmels's herms bearing the lintels, stucco relief tracing the ceilings, trompe-l'œil splitting flat walls into depth, chinoiserie winding its Eastern motifs, and one whole wall of hand-painted azulejos, buffed to a tender glow by the Atlantic's salt wind.</p><p>Open the window — and all the light of the city, with the shimmer of the Tejo, spills into the room together. True abundance is never worn on the surface; it is kept only for those willing to come close, willing to stay.</p>`,
    `<p>里斯本立于七座山丘之上；而最幽深的绚烂，藏在第七座——一道素朴的新古典（Neoclassical）立面之后。这份深藏不露，我们的野心，是把它带向世界。素墙之内，别有洞天：Anatole Calmels 的赫姆柱（herm）撑起门楣，灰泥浮雕（stucco）勾勒天顶，trompe-l'œil 的错视令平墙裂出纵深，chinoiserie 的东方纹样蜿蜒游走，而一整面手绘锡釉的 azulejos，被大西洋的盐风，擦拭得温润发亮。</p><p>推窗——整座城的光，连同特茹河（Tejo）的粼粼波影，一同倾落入室。真正的丰盛，从不外露；它只留给，愿意走近、愿意驻足的人。</p>`,
  ],
  'fortress.loc': [`France · Montmorency`, `法国 · Montmorency`],
  'fortress.name': [`The Breathing Fortress`, `The Breathing Fortress`],
  'fortress.vision': [
    `<p>It was born a fortress, yet it learned to breathe; it stands in the Île-de-France, and our vision is to wake it again, the world over. With the loggia and colossal order he learned in the Italian Wars, Jean Bullant cut channels of light and air through walls built for defence; and Jean Goujon's bas-relief, Léonard Limosin's painted enamel of Limoges, the faience of Bernard Palissy and Masséot Abaquesne — the finest hands of an age, all gathered here.</p><p>Golden light passes down the gallery, brushing in turn across stone, wood, glaze and enamel. The most fortified of things also knows the most tender way to open.</p>`,
    `<p>它生来是一座要塞，却学会了呼吸；它矗立于法兰西岛，而我们的愿景，是让它在世界各地，重新苏醒。Jean Bullant 以意大利战争中习得的敞廊（loggia）与巨柱式（colossal order），在防御的厚墙上，凿开光与风的通道；而 Jean Goujon 的浅浮雕（bas-relief），Léonard Limosin 的利摩日画珐琅（painted enamel of Limoges），Bernard Palissy 与 Masséot Abaquesne 的锡釉陶（faience）——一个时代最出色的手，尽数汇于此地。</p><p>金光穿廊而过，依次拂过石、木、釉与珐琅。最坚固之物，亦最懂得，最温柔的敞开。</p>`,
  ],
};
for (const [k, [e, z]] of Object.entries(O)) { en[k] = e; zh[k] = z; }

fs.writeFileSync('i18n/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('i18n/zh.json', JSON.stringify(zh, null, 2));
console.log('en keys:', Object.keys(en).length, ' zh keys:', Object.keys(zh).length);
