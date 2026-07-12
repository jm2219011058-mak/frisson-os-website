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
  'prop.eyebrow': [`More than Residence`, `More than Residence`],
  'prop.v2035': [`Vision 2035`, `Vision 2035`],
  'coll.lead': [`We build your climate-sealed castle in more-than-human beauty — at the world's most epic edge locations on Earth.`, `为你筑一座气候封闭的城堡,置于超越人类的美之中——在地球最壮阔的边缘之地。`],
  // --- Zahir editorial (Commercial Residence section) ---
  'zahir.quote': [`"Zahir is the rose's shadow and the crack in the veil."`, `“扎希尔是玫瑰的影子,也是面纱上的裂痕。”`],
  'zahir.cite': [`— Borges`, `——博尔赫斯`],
  'zahir.p1': [`Some things, once seen, can never be forgotten.`, `有些事物一旦映入眼帘,就再也无法被忘却。`],
  'zahir.p2': [`Borges wrote of it as an ancient coin: whoever gazes upon it desires nothing else. The king, fearing that for its sake the world would forget the entire universe, had it sunk to the bottom of the sea.`, `博尔赫斯曾将其描述为一枚古老的硬币:任何凝视它的人都不会再有其他渴望。国王唯恐因这枚硬币的缘故,世界会忘却整个宇宙的存在,于是将其沉入了海底。`],
  'zahir.p3': [`The coin is a mirror of free will and human nature.`, `这枚硬币是自由意志和人类本性的反映。`],
  'zahir.p4': [`This is why Frisson exists.`, `正因如此,Frisson 才得以存在。`],
  'zahir.p5': [`We reject one-dimensional living. From our very first building, we are forging a new global living network for the Digital Aristocracy — with Space, Art, and Soul as our mediums.`, `我们拒绝单一维度的生活方式。从我们最初的项目开始,我们便致力于为数字贵族打造一个全新的全球生活网络——以空间、艺术和灵魂作为我们的媒介。`],
  'zahir.p6': [`Every residence becomes a Zahir that belongs to you — once it enters your life, it remains unforgettable.`, `每一处居所都将成为属于你的扎希尔——一旦它融入你的生活,便注定难以忘怀。`],
  'zahir.climax': [`And all of this is for one purpose: to rebuild the Respect for Human.`, `这一切都是为了一个目的:重新树立对人性的尊重。`],
  'zahir.features': [`120 residences in Phase One · Spatial design that engages human emotion · The world's fastest elevator · Sona Bio OS · Soulful Living`, `一期项目共 120 套住宅 · 触动人心的空间设计 · 全球最快电梯 · Sona Bio OS · 充满情感的生活`],
  'zahir.story': [`Story`, `故事`],
  'zahir.spec.title': [`Key Features`, `主要特色`],
  'zahir.spec.intro': [`The first Zahir — a residence engineered to engage the whole human, in body and in soul.`, `首座扎希尔——一座为触动完整的人、身与心皆被唤起而生的居所。`],
  'zahir.f1.k': [`Phase One`, `一期`], 'zahir.f1.v': [`120 residences`, `120 套住宅`],
  'zahir.f2.k': [`Residence`, `居所`], 'zahir.f2.v': [`150–500 m² each · 40 floors`, `每户 150–500 平 · 40 层`],
  'zahir.f3.k': [`Mobility`, `垂直交通`], 'zahir.f3.v': [`The world's fastest elevator`, `全球最快电梯`],
  'zahir.f4.k': [`Intelligence`, `智能`], 'zahir.f4.v': [`Sona Bio OS`, `Sona Bio OS`],
  'zahir.f5.k': [`Design`, `设计`], 'zahir.f5.v': [`Spatial design that engages human emotion`, `触动人心的空间设计`],
  'zahir.f6.k': [`Experience`, `体验`], 'zahir.f6.v': [`Soulful Living`, `充满情感的生活`],
  // --- How It Works (city entry section + dedicated page) ---
  'hiw.title': [`More than ownership`, `不止于拥有`],
  'hiw.p1': [`Global Residence Networks`, `全球寓所网络`],
  'hiw.p2': [`Fractional Property Ownership`, `分权共有产权`],
  'hiw.p3': [`Full Living-Health Asset Hospitality`, `全周期人居健康资产`],
  'hiw.discover': [`Discover`, `了解运作`],
  'hiw.eyebrow': [`How It Works`, `如何运作`],
  'hiw.lead': [`More than ownership. A residence you hold, a network you inhabit, and an intelligence that travels with your body.`, `不止于拥有。你持有的是一处寓所,栖居的是一整张网络,而随身而行的,是一套懂得你身体的智能。`],
  'hiw.c1.title': [`One Key, Every Horizon`, `一把钥匙,通往每一处地平线`],
  'hiw.c1.body': [`Owning a single share unlocks an entire network of exceptional residences around the world — each one an equal to your own home. Through the Frisson app, reserve nights at your residence up to twelve months ahead, or trade them to stay at any other home in the collection, bookable up to four months out, with a modest adjustment where grades differ.`, `持有一份份额,即解锁一整张遍布世界的非凡寓所网络——其中每一处,皆与你的自有居所比肩。透过 Frisson App,可提前至多十二个月预订自有居所的入住之夜;亦可将其兑换,入住网络中任一处居所——最早提前四个月预订,不同等级之间或有小幅差价。`],
  'hiw.c2.title': [`Own a Fraction, Gain the Whole`, `拥有一份,尽享其全`],
  'hiw.c2.body': [`Each Frisson residence is offered in fractional ownership — the home divided into twelve shares, each granting thirty nights of stay a year. Hold as many shares as your life calls for. When you are away, Frisson can place your unused nights into its hospitality programme and return the corresponding fees to you. Because the architecture and craft hold their worth, a share is a lasting and appreciating asset — and after an initial period it may be released on a secondary market in ten-day increments.`, `每一处 Frisson 寓所皆以分权形式持有——一处居所划分为十二份份额,每份对应每年三十夜的入住权。你可按生活所需,持有任意份数。当你离开,Frisson 可将你未使用的夜晚纳入其托管计划,并将相应费用返还于你。因建筑与工艺历久保值,一份份额是可传承、可增值的长期资产——初始期后即可在二级市场以十天为单位释出。`],
  'hiw.c3.title': [`A Home That Remembers Your Body`, `一处记得你身体的居所`],
  'hiw.c3.body': [`Through Sona, our Bio-AI OS, every residence keeps a long-term, private record of how you rest, breathe, and recover — an asset that is yours alone, whose key you alone hold. Arrive at any Frisson home in the world, and that key rebuilds your personal environment — light, sound, temperature, scent, and air — tuned to your body from the very first moment. Your health data never belongs to a place; it travels with you, and every place remembers you.`, `透过 Sona——我们的 Bio-AI OS,每一处寓所都长久保存一份关乎你如何休憩、呼吸、恢复的私有档案——它只属于你,私钥亦只由你持有。抵达世界任一处 Frisson 居所,这把私钥便会重建你的专属环境——光、声、温度、香氛与空气,自第一刻起便依你的身体而调谐。你的健康数据从不属于某个地方;它随你而行,而每一处,都记得你。`],
  'hiw.svc': [`No Maintenance · No Housekeeping · Private Concierge · Pay-Per-Use`, `免维护 · 免家政 · 私人管家 · 按需付费`],
  'hiw.close': [`Home is no longer a coordinate. It is a state that travels with you.`, `家,不再是一处坐标,而是一种随你而行的状态。`],
  'hiw.cta': [`Enter Sona`, `进入 Sona`],
  'prop.learn': [`Learn more`, `了解更多`],
  'grotto.loc': [`OMAN / QATAR / DUBAI`, `OMAN / QATAR / DUBAI`],
  'grotto.name': [`Zahir Sky Atelier`, `Zahir Sky Atelier`],
  'gallery.title': [`Human Experience of Space – Inevitably Multisensory`, `疗愈你身体的空间`],
  'grotto.tagline': [`Create what people truly want; listen to what technology makes possible.`, `创造人们真正想要的,倾听科技所能成就的。`],
  'grotto.s1': [`m² per residence`, `平米 · 每户`],
  'grotto.s2': [`residences`, `户`],
  'grotto.s3': [`floors`, `层`],
  'grotto.vision': [
    `<p>Beauty once lingered in Florence for a full century; our ambition is to let it dwell again, the world over. This is how the Renaissance took the measure of the world: Brunelleschi's golden proportion, the blue-grey pietra serena, the five-centuries-unfaded colour Raphael sealed in buon fresco, and the axis in the Vasari Corridor that stitched power to beauty. And the deeper you go, the more beauty hides.</p><p>Through the layered green arcades of the Boboli Gardens you reach Buontalenti's man-made grotto — rustication dripping from the vault, walls inlaid with shell and tufa, water trembling across stone, statues half-revealed in an almost sfumato dusk.</p>`,
    `<p>美，曾在佛罗伦萨停留了整整一个世纪；而我们的野心，是让它在世界各地，重新栖居。这里是文艺复兴丈量世界的方式：Brunelleschi 的黄金比例，pietra serena 的青灰砂岩，Raphael 以真湿壁画（buon fresco）封存的、五百年不褪的丹青，与 Vasari 走廊里那条缝合了权力与美的轴线。而愈往深处，美愈是隐匿。</p><p>穿过 Boboli 花园层叠的绿廊，直抵 Buontalenti 的人工岩窟（grotto）——钟乳饰（rustication）自拱顶垂落，贝壳与凝灰岩（tufa）镶嵌成壁，水痕浮动，雕像在 sfumato 般的幽昧里，半隐半现。</p>`,
  ],
  'deer.loc': [`Bora Bora · French Polynesia`, `波拉波拉 · 法属波利尼西亚`],
  'deer.name': [`The Deer Garden`, `The Deer Garden`],
  'deer.vision': [
    `<p>In French Polynesia, emerald volcanic peaks rise straight from a turquoise lagoon. The serrated ridge of Mount Otemanu pierces the clouds; at its foot, layer upon layer of rainforest gives way to the most richly coloured lagoon on Earth — a dozen blues from pale green to deep sapphire, ringed like a natural rampart.</p><p>In the pastures of England the Cavendish family, across seventeen generations of patience, let their architecture grow out of the grass slopes — knowing the finest building does not conquer the terrain but follows its breath. In Polynesia we carry that growing onto the water: no longer pressing on the land, but floating, cantilevering, rising and falling with the lagoon's tide, like another coral grown from the sea.</p>`,
    `<p>法属波利尼西亚，翠绿的火山峰从环礁湖中拔地而起。奥特马努峰的锯齿状轮廓刺破云层，山脚是层层叠叠的热带雨林，向外是世界上色彩最丰盛的潟湖——从浅绿到深蓝的十几种蓝，环绕成一圈天然的屏障。</p><p>卡文迪什家族曾在英格兰的牧区，用十七代人的耐心，让建筑从草坡上生长出来。他们懂得，最好的建筑不是征服地形，而是顺应它的呼吸。在波利尼西亚，我们让这种生长延续到水上——建筑不再压迫土地，而是漂浮、悬挑、与潟湖的潮汐一同起伏，如同从水中自然生长出的另一种珊瑚。</p>`,
  ],
  'hill.loc': [`Atacama Desert · Chile`, `阿塔卡马沙漠 · 智利`],
  'hill.name': [`The Seventh Hill`, `The Seventh Hill`],
  'hill.vision': [
    `<p>The Atacama — the driest place on Earth. Some reaches have gone centuries without rain; the ground so resembles Mars that NASA tests its rovers here, and ALMA, the world's largest telescope array, gazes into the cosmos above. This night sky is held to be the purest on the planet: air so thin it turns near-transparent, zero light pollution, the arch of the Milky Way close enough to touch.</p><p>The Palmela family once hid an interior of splendour behind a plain façade on Lisbon's seventh hill. True abundance never announces itself; it waits to be perceived. In the Atacama we carry that hidden abundance on — the shell sinking into the desert's ochre and silence, the interior a sanctuary thrown open to the universe.</p>`,
    `<p>阿塔卡马，地球上最干旱的地方。某些区域数百年无雨，地表酷似火星——NASA 在此测试火星探测器，全球最大的天文阵列 ALMA 在此仰望宇宙。这里的夜空，是被人类公认的、地球上最纯净的星空。空气稀薄到近乎透明，光害为零，银河的拱桥清晰得仿佛触手可及。</p><p>帕尔梅拉家族曾在里斯本的第七座山丘上，以素朴的立面掩藏内部的绚烂。真正的丰盛从不主动宣告，它等待被感知。在阿塔卡马，我们延续这种「隐藏的丰盛」——建筑的外壳沉入荒漠的赭色与静默，内部却是一座向宇宙敞开的圣殿。</p>`,
  ],
  'fortress.loc': [`Jökulsárlón · Iceland`, `冰河湖 · 冰岛`],
  'fortress.name': [`The Breathing Fortress`, `The Breathing Fortress`],
  'fortress.vision': [
    `<p>Southeast Iceland, where the tongue of the Vatnajökull glacier melts into the sea, thousand-year ice drifts in bodies of blue and white across an ink-dark lagoon. Beside it lies Diamond Beach — shards of glacier polished by the surf into clear jewels, scattered over black volcanic sand. A land where ice meets fire, apocalyptic in its purity and solitude.</p><p>In the Île-de-France the Montmorency family dressed stone walls with the painted enamel of Limoges and cut loggias into thick ramparts to let light and wind pass through. The most fortified of things also knows the most tender way to open. In Iceland that paradox becomes the soul of the home — sealed against the Arctic cold, yet made to breathe, keeping its dweller in dialogue with the ice, the light, the polar night and endless day beyond.</p>`,
    `<p>冰岛东南，瓦特纳冰川的舌尖融入海洋之处，千年的冰以蓝白之躯漂浮在墨色的湖面上。旁边是钻石冰滩——冰川的碎片被海浪打磨成透明的宝石，散落在黑色的火山沙上。这是冰与火交界的地景，天启般的纯净与孤绝。</p><p>蒙莫朗西家族曾在法兰西岛以利摩日画珐琅装饰石墙，在厚墙上凿开敞廊，让光与风穿行。最坚固之物，亦最懂得最温柔的敞开。在冰岛，这种矛盾成为居所的灵魂——建筑必须密封以抵御北极的严寒，却又必须「呼吸」，让居住者与外部的冰、光、极夜与极昼保持对话。</p>`,
  ],
  'gg.loc': [`Jebel Shams · Oman`, `沙姆斯山 · 阿曼`],
  'gg.name': [`The Grotto Garden`, `The Grotto Garden`],
  'gg.vision': [
    `<p>Jebel Shams, Oman's highest peak — the Mountain of the Sun. Below it plunges the kilometre-deep An Nakhur canyon, the Grand Canyon of Arabia: ochre-red walls falling away in tiers, ancient terraced villages clinging to the clefts, witness to a thousand years of patience and wisdom. This is the Gulf's most underrated epic ground — not the emptiness of desert, but the grandeur of living rock.</p><p>In the hills of Tuscany the Medici family quarried stone, raising walls and carving grottoes with the very warmth of the rock, letting architecture breathe with the mountain. That collaboration learned in stone — reading the character of the material, following the breath of the terrain — we learn anew on these Arabian cliffs. The architecture anchors into the canyon's strata, carved inward into a grotto, gazing out over a kilometre-deep abyss, the line between made and natural blurring here.</p>`,
    `<p>阿曼最高峰 Jebel Shams，「太阳之山」。脚下是深达千米的 An Nakhur 峡谷——阿拉伯半岛的大峡谷，赭红的岩壁层层跌落，古老的梯田村落挂在悬崖的缝隙间，见证了这片土地上千年的耐心与智慧。这是海湾地区最被低估的史诗之地：不是沙漠的荒芜，而是山岩的雄浑。</p><p>美第奇家族曾在托斯卡纳的丘陵间开采石材，以石头的体温筑墙、凿窟，让建筑与山体一同呼吸。他们在石头上学会的协作——阅读材料的性格、顺应地形的呼吸——我们在这片阿拉伯的岩壁上重新习得。建筑锚固于峡谷的岩层，向内凿刻成窟，向外眺望千米的深渊，人工与自然的边界在此模糊。</p>`,
  ],
};
for (const [k, [e, z]] of Object.entries(O)) { en[k] = e; zh[k] = z; }

fs.writeFileSync('i18n/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('i18n/zh.json', JSON.stringify(zh, null, 2));
console.log('en keys:', Object.keys(en).length, ' zh keys:', Object.keys(zh).length);
