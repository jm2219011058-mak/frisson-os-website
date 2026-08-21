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
  'nav.cities': ['Soulful Living Network', 'Soulful Living Network'],
  'nav.sona': ['Sona AI', 'Sona AI'],
  'nav.advocater': ['Stealth Founders', 'Stealth Founders'],
  'nav.ownership': ['Beyond Ownership', 'Beyond Ownership'],
  'nav.stories': ['Field Notes', 'Field Notes'],
  'nav.lab': ['Sensory World Lab', 'Sensory World Lab'],
  'nav.lwm': ['Living World Model', 'Living World Model'],
  'nav.sensory': ['Sensory World Hunting', 'Sensory World Hunting'],
  'cities.hero1': [`Rebuild Respect<br>for the Human`, `重建对人的尊重`],
  'cities.hero2': [`Feel Forward.`, `<b>回应人类情感的居所</b>`],
  'cat.arch': [`The Renaissance Archive`, `文艺复兴档案`],
  'cat.a.name': [`Florence`, `佛罗伦萨`],
  'cat.a.sub': [`The Birthplace of Human Potential`, `人类潜能的发源地`],
  'cat.b.name': [`Chatsworth`, `查茨沃斯`],
  'cat.b.sub': [`Nature, Art, and Curiosity in Dialogue`, `自然、艺术与好奇心的对话`],
  'cat.c.name': [`Palmela Palace`, `帕尔梅拉宫`],
  'cat.c.sub': [`A Conversation Between Civilizations`, `文明之间的对话`],
  'cat.d.name': [`Écouen`, `埃库昂`],
  'cat.d.sub': [`Craftsmanship as Collective Intelligence`, `作为集体智慧的工艺`],
  'stories.title': ['Field Notes — FRISSON', 'Field Notes — FRISSON'],
  'stories.diary2': [
`<h2 class="st-h st-h-title">The Power of Limits</h2>
<p class="st-sub">— What matters most is invisible</p>
<p class="st-date">Published · July 23, 2026</p>
<p class="st-p">At Pixar, there is a phenomenon that producers call the <b>“invisible perfect coin.”</b> It speaks to the obsessive attention to detail that animators bring to their work—details you will never notice, and that is precisely why they matter.</p>
<p class="st-p">Consider a shot in Monsters, Inc.: Sulley walks through the office, and on a desk behind him sits a coffee cup. It appears for no more than two frames—<b>roughly 0.08 seconds.</b> The vast majority of viewers will never register it. Yet Pixar’s animators spent two full weeks refining the reflection of water droplets on that cup, the thickness of its walls, and the almost imperceptible shadow where its base meets the desktop.</p>
<p class="st-p"><b>Why invest such effort in something no one will see?</b></p>
<p class="st-p">Because Pixar believes that when you leave no detail unattended, the audience may not be able to articulate why, but they will feel it—<b>this world is real, alive, and worth inhabiting.</b></p>
<p class="st-p">That conviction is embedded in our <b>founding DNA.</b></p>
<p class="st-p">When we began to define the constraints of Sona, <b>we had to confront what it truly means to restore respect for human beings</b>—starting with the most elemental things: <b>air, light, scent.</b> The question consumed us like a fever dream; we lay awake for nights on end, unable to let it go.</p>
<p class="st-p">We want our residents to never see where Sona’s sensors are hidden, never notice the precise angle where a wall meets the floor, never realize that the path of natural light has been calculated down to the minute, never detect the subtle modulations of sound, temperature, and airflow that quietly settle the mind—<b>all of it orchestrated, all of it invisible.</b></p>
<p class="st-p"><b>The most rudimentary approach: a billion attempts.</b></p>`,
`<h2 class="st-h st-h-title">The Power of Limits</h2>
<p class="st-sub">— What matters most is invisible</p>
<p class="st-date">Published · July 23, 2026</p>
<p class="st-p">At Pixar, there is a phenomenon that producers call the <b>“invisible perfect coin.”</b> It speaks to the obsessive attention to detail that animators bring to their work—details you will never notice, and that is precisely why they matter.</p>
<p class="st-p">Consider a shot in Monsters, Inc.: Sulley walks through the office, and on a desk behind him sits a coffee cup. It appears for no more than two frames—<b>roughly 0.08 seconds.</b> The vast majority of viewers will never register it. Yet Pixar’s animators spent two full weeks refining the reflection of water droplets on that cup, the thickness of its walls, and the almost imperceptible shadow where its base meets the desktop.</p>
<p class="st-p"><b>Why invest such effort in something no one will see?</b></p>
<p class="st-p">Because Pixar believes that when you leave no detail unattended, the audience may not be able to articulate why, but they will feel it—<b>this world is real, alive, and worth inhabiting.</b></p>
<p class="st-p">That conviction is embedded in our <b>founding DNA.</b></p>
<p class="st-p">When we began to define the constraints of Sona, <b>we had to confront what it truly means to restore respect for human beings</b>—starting with the most elemental things: <b>air, light, scent.</b> The question consumed us like a fever dream; we lay awake for nights on end, unable to let it go.</p>
<p class="st-p">We want our residents to never see where Sona’s sensors are hidden, never notice the precise angle where a wall meets the floor, never realize that the path of natural light has been calculated down to the minute, never detect the subtle modulations of sound, temperature, and airflow that quietly settle the mind—<b>all of it orchestrated, all of it invisible.</b></p>
<p class="st-p"><b>The most rudimentary approach: a billion attempts.</b></p>`],
  'stories.body': [
`<h2 class="st-h st-h-title">The Future of AI Begins with How We Live</h2>
<p class="st-date">Published · July 18, 2026</p>
<p class="st-p">For the past decade, intelligence has existed primarily behind screens.</p>
<p class="st-p">We asked questions.</p>
<p class="st-p">AI provided answers.</p>
<p class="st-p">At Frisson, we believe the next evolution of intelligence will unfold in the physical world.</p>
<p class="st-p">It will begin to understand environments, human vitality, and the continuously evolving relationship between people and the spaces they inhabit.</p>
<p class="st-p">It will redefine how we live, create, recover, and connect.</p>
<h2 class="st-h">Living Data: A New Dimension of Life Intelligence</h2>
<p class="st-p">The most valuable insights of the future will come from life itself.</p>
<p class="st-p">They exist within the subtle relationship between the human body and its environment:</p>
<p class="st-p">Our ability to recover.<br>Our quality of sleep.<br>Our energy states.<br>Our biological rhythms.<br>Our long-term health potential.</p>
<p class="st-p">We call this <b>Living Data</b>.</p>
<p class="st-p">It represents the evolving intelligence created through the interaction of human vitality, environmental influence, and lived experience.</p>
<p class="st-p">When spaces begin to better understand the rhythms of life, and environments begin to support human recovery and long-term wellbeing, we will enter a new era of living.</p>
<h2 class="st-h">Reimagining the Physical World</h2>
<p class="st-p">Architecture will no longer be defined solely as static structures.</p>
<p class="st-p">It will evolve into dynamic systems that support human flourishing.</p>
<p class="st-p">Frisson is creating the next generation of physical environments — transforming spaces from passive containers into living ecosystems that grow alongside humanity.</p>
<p class="st-p">Here, health, behavior, creativity, and environmental experience converge into a new relationship.</p>
<p class="st-p">Every space becomes a foundation for understanding human potential and enhancing the quality of life.</p>
<h2 class="st-h">Trust Is the Foundation</h2>
<p class="st-p">Frisson believes technology’s highest purpose is to enrich human experience, respect individual autonomy, and create a deeper connection between people and their environments.</p>
<p class="st-p">The most advanced spaces will not be defined by how much they know.</p>
<p class="st-p">They will be defined by how deeply they understand.</p>
<h2 class="st-h">Why We Create Soulful Living Nodes</h2>
<p class="st-p">Frisson is reimagining the physical world.</p>
<p class="st-p">We begin by creating singular spaces with their own identity and soul — pioneering a new paradigm where humans and environments continuously evolve together.</p>
<p class="st-p">Through our own creations and collaborations with visionary architects, designers, and global innovators, we are building the foundation for the next generation of human living.</p>
<p class="st-p">Each Node will become a place to explore the future of living — a foundation for human health, creativity, and the expansion of human potential.</p>`,
`<h2 class="st-h st-h-title">The Future of AI Begins with How We Live</h2>
<p class="st-date">Published · July 18, 2026</p>
<p class="st-p">For the past decade, intelligence has existed primarily behind screens.</p>
<p class="st-p">We asked questions.</p>
<p class="st-p">AI provided answers.</p>
<p class="st-p">At Frisson, we believe the next evolution of intelligence will unfold in the physical world.</p>
<p class="st-p">It will begin to understand environments, human vitality, and the continuously evolving relationship between people and the spaces they inhabit.</p>
<p class="st-p">It will redefine how we live, create, recover, and connect.</p>
<h2 class="st-h">Living Data: A New Dimension of Life Intelligence</h2>
<p class="st-p">The most valuable insights of the future will come from life itself.</p>
<p class="st-p">They exist within the subtle relationship between the human body and its environment:</p>
<p class="st-p">Our ability to recover.<br>Our quality of sleep.<br>Our energy states.<br>Our biological rhythms.<br>Our long-term health potential.</p>
<p class="st-p">We call this <b>Living Data</b>.</p>
<p class="st-p">It represents the evolving intelligence created through the interaction of human vitality, environmental influence, and lived experience.</p>
<p class="st-p">When spaces begin to better understand the rhythms of life, and environments begin to support human recovery and long-term wellbeing, we will enter a new era of living.</p>
<h2 class="st-h">Reimagining the Physical World</h2>
<p class="st-p">Architecture will no longer be defined solely as static structures.</p>
<p class="st-p">It will evolve into dynamic systems that support human flourishing.</p>
<p class="st-p">Frisson is creating the next generation of physical environments — transforming spaces from passive containers into living ecosystems that grow alongside humanity.</p>
<p class="st-p">Here, health, behavior, creativity, and environmental experience converge into a new relationship.</p>
<p class="st-p">Every space becomes a foundation for understanding human potential and enhancing the quality of life.</p>
<h2 class="st-h">Trust Is the Foundation</h2>
<p class="st-p">Frisson believes technology’s highest purpose is to enrich human experience, respect individual autonomy, and create a deeper connection between people and their environments.</p>
<p class="st-p">The most advanced spaces will not be defined by how much they know.</p>
<p class="st-p">They will be defined by how deeply they understand.</p>
<h2 class="st-h">Why We Create Soulful Living Nodes</h2>
<p class="st-p">Frisson is reimagining the physical world.</p>
<p class="st-p">We begin by creating singular spaces with their own identity and soul — pioneering a new paradigm where humans and environments continuously evolve together.</p>
<p class="st-p">Through our own creations and collaborations with visionary architects, designers, and global innovators, we are building the foundation for the next generation of human living.</p>
<p class="st-p">Each Node will become a place to explore the future of living — a foundation for human health, creativity, and the expansion of human potential.</p>`],
  'stories.diary': [
`<h2 class="st-h st-h-title">Competing Against Luck</h2>
<p class="st-sub">A Soulful Conversation with Dav (Son of HOPO’s Founder)</p>
<p class="st-date">Published · July 19, 2026</p>
<p class="st-p">In the early days of building something, the things that matter most rarely begin with a grand plan. They begin with a real meeting, an honest conversation, a shared recognition of where the future might lead.</p>
<p class="st-p">Yesterday, Jacques and I had a meaningful conversation with Dav, exploring how HOPO (The Leading Window & Door Hardware Control System) could help bring to life <b>FRISSON’s first intelligent-space MVP</b> — so that we can move quickly through the lens of “Jobs to Be Done,” turning an innovative and forward-looking business model into real, tested practice.</p>
<p class="st-p">A special thanks to Dav for sharing HOPO’s latest technical innovations, along with the customized solutions they’ve developed for the high-end architectural spaces of the future. HOPO has spent years deeply immersed in intelligent window and door control, and in their work I see a role being quietly redefined. A window or a door was once simply the boundary of a building. In the future, it may become a point of dialogue between people and space — connecting the natural world with the interior, the environment with life, and the building with its intelligent systems.</p>
<p class="st-p">This is a journey with no ready-made template. I deeply value the partners who choose to pay attention to FRISSON this early on. To meet someone like Dav at such a starting point — someone willing to share, willing to understand a vision that is still very young — is a rare and precious thing.</p>
<p class="st-p">Richard Branson (Founder, Virgin Group) once said something I love:</p>
<figure class="st-fig"><img src="assets/city/diary-showing-up.webp" alt="Never underestimate the power of showing up" loading="lazy"></figure>
<p class="st-branson">“Never underestimate the power of showing up.”</p>
<p class="st-p">Thank you, Dav. Thank you, HOPO. And thank you to everyone who, at the very beginning of FRISSON, is willing to show up, to talk, and to walk alongside us.</p>`,
`<h2 class="st-h st-h-title">与运气竞争</h2>
<p class="st-sub">与 Dav（HOPO 创始人之子）的一次对话</p>
<p class="st-date">发布于 · 2026年7月19日</p>
<p class="st-p">在事业的初期，真正重要的事往往并非始于宏伟的计划，而是始于一次真诚的会面、一次坦诚的对话，以及对未来发展方向的共同认知。</p>
<p class="st-p">昨天，我和 Jacques 与 Dav 进行了一次有意义的谈话，探讨了 HOPO（领先的门窗五金控制系统）如何能够帮助 FRISSON 实现其首个智能空间 MVP——在他们的能力范围内——以便我们能够快速地从“待完成的任务”的角度出发，将创新且具有前瞻性的商业模式转化为真实、经过检验的实践。</p>
<p class="st-p">特别感谢 Dav 分享 HOPO 的最新技术创新，以及他们为未来高端建筑空间开发的定制解决方案。HOPO 多年来一直致力于智能门窗控制领域，他们的工作让我看到了门窗角色正在悄然被重新定义。门窗曾经仅仅是建筑物的边界。未来，它们或许会成为人与空间对话的桥梁——连接自然世界与室内空间、环境与生活、建筑与智能系统。</p>
<p class="st-p">这是一段没有现成模式的旅程。我非常珍惜那些早期愿意关注 FRISSON 发展的伙伴。在这样一个起步阶段就能遇到像 Dav 这样的人——愿意分享，愿意理解一个尚处于萌芽阶段的愿景——弥足珍贵。</p>
<p class="st-p">理查德·布兰森（维珍集团创始人）曾经说过一句我很喜欢的话：</p>
<figure class="st-fig"><img src="assets/city/diary-showing-up.webp" alt="Never underestimate the power of showing up" loading="lazy"></figure>
<p class="st-branson">“永远不要低估‘出现 Showing Up’的力量。”</p>
<p class="st-p">谢谢你，Dav。谢谢你，HOPO。还要感谢所有在 FRISSON 早期就愿意分享、交流、与我们并肩前行的人们。</p>`
  ],
  '2.1': [`What world would you dream into being?<br>And what self would you find within it?`, `如果你能创造一个新世界，它会是什么样子？<br>如果你能在那个世界开启一段新生活，你会成为怎样的人？`],
  '2.4': [`Space healing your body,`, `疗愈你身体的空间，`],
  '2.5': [`"Out of avidity to see the Immortals, to touch that <b>more-than-human City</b>, I could hardly sleep."`, `“出于渴望一睹永生者、触碰那座<b>超越人类之城</b>，我几乎难以成眠。”`],
  '2.9': [`No city was ever made great by the number of buildings it contained.<br>Cities become alive when they become vessels for human dreams — <i><b>places where beauty, knowledge, and creativity converge, and where new possibilities for humanity begin again.</b></i>`, `伟大的城市,从不因它拥有的建筑数量而伟大。<br>当城市成为承载人类梦想的容器,它才真正拥有生命——<i><b>在这里,美、知识与创造力彼此交汇,人类新的可能也由此重新开始。</b></i>`],
  '2.11': [`It passes through geographies, through wars, through the turning of civilizations, and alights only in the rarest of moments. <i><b>To the places where it once paused, we pay homage.</b></i>`, `它穿越地理、战争与文明的更替,只在极少数的时刻停留。<i><b>向它曾经停留过的地方,我们致以敬意。</b></i>`],
  '2.13.eyebrow': [`FRISSON — Four Aesthetic Bloodlines`, `FRISSON — 四重美学基因`],
  '2.13': [`FRISSON draws inspiration from four remarkable cultural lineages — <b>Medici</b>, <b>Cavendish</b>, <b>Palmela</b>, and <b>Montmorency</b> — each representing a different expression of beauty, knowledge, craftsmanship, and human imagination.</p><p class="mf-p">We reinterpret these legacies through a contemporary language of living, creating spaces where <b>art</b>, <b>nature</b>, <b>science</b>, and <b>human experience</b> converge.`, `FRISSON 从四段卓越的文化血脉中汲取灵感——<b>美第奇（Medici）</b>、<b>卡文迪什（Cavendish）</b>、<b>帕尔梅拉（Palmela）</b>与<b>蒙莫朗西（Montmorency）</b>——它们各自代表着美、知识、工艺与人类想象的一种独特表达。</p><p class="mf-p">我们以当代的生活语言重新诠释这些遗产,创造出让<b>艺术</b>、<b>自然</b>、<b>科学</b>与<b>人类体验</b>交汇的空间。`],
  '2.14a': [`<b class="pl">Florence</b> is Brunelleschi's proportion, the blue-grey pietra serena, Raphael's frescoes, and Buontalenti's man-made grotto in the Boboli Gardens.`, `<b class="pl">佛罗伦萨</b>,是布鲁内莱斯基（Brunelleschi）的比例、塞雷纳石（pietra serena）的青灰石、拉斐尔（Raphael）的湿壁画,和波波利（Boboli）花园里布翁塔伦蒂（Buontalenti）的人工岩窟（grotto）。`],
  '2.14b': [`<b class="pl">Chatsworth</b> is a book never finished — from William Kent's seats and Paxton's glasshouse to Lucian Freud's portraits.`, `<b class="pl">查茨沃斯（Chatsworth）</b>是一部从未写完的书,从威廉·肯特（William Kent）的座椅、帕克斯顿（Paxton）的温室,到卢西安·弗洛伊德（Lucian Freud）的肖像。`],
  '2.14c': [`<b class="pl">The Palmela Palace</b> holds Anatole Calmels's herms, the illusions of trompe-l'œil, the Eastern motifs of chinoiserie, and the tender glaze of blue-and-white azulejos.`, `<b class="pl">帕尔梅拉宫（Palácio Palmela）</b>藏着阿纳托尔·卡尔梅尔（Anatole Calmels）的赫姆柱（herm）、错视画（trompe-l'œil）的幻象、中国风（chinoiserie）的东方纹样,和阿苏莱霍斯（azulejos）蓝白釉瓷的温润光泽。`],
  '2.14d': [`<b class="pl">Montmorency's Écouen</b> is a fortress that breathes, gathering the finest hands of an entire age — Jean Bullant's loggia, Jean Goujon's sculpture, Léonard Limosin's Limoges enamel, and the ceramics of Bernard Palissy and Masséot Abaquesne.`, `<b class="pl">蒙莫朗西的埃库昂（Montmorency's Écouen）</b>是一座会呼吸的要塞,集结了整个时代最好的手艺——让·比朗（Jean Bullant）的敞廊（loggia）、让·古戎（Jean Goujon）的雕刻、莱昂纳尔·利莫赞（Léonard Limosin）的利摩日（Limoges）珐琅、贝尔纳·帕利西（Bernard Palissy）与马塞奥·阿巴克斯纳（Masséot Abaquesne）的陶艺。`],
  '2.23.tag': [`The Art of Tuning Your Body to Its Natural Rhythm.`, `让身体回归自然节律的艺术。`],
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
  'prop.eyebrow': [`More than Residence`, `不止于栖居`],
  'launch.prep': [`The First Chapter`, `第一章`],
  'pf.starlink': [`Starlink Covered`, `星链覆盖`],
  'pf.airline': [`Concierge Airline`, `物资航线`],
  'pf.sona': [`Sona Bio-AI OS`, `Sona Bio-AI`],
  'prop.v2035': [`Vision 2035`, `Vision 2035`],
  'v2035.p1': [`New technologies in construction, transportation, communication and life science are what soulful living in extraterrestrial space will require.`, `在地外行星过上充满灵魂的生活，需要建筑、交通、通信和生命科学领域的新技术。`],
  'v2035.p2': [`More-than-human city design. Payload-efficient hospitality.`, `超越人类之城将为星际建筑设计高效载荷。`],
  'v2035.p3': [`Sona is prepared from day one, enabling spatial intelligence to support human physiological and psychological welfare in the most challenging environments.`, `Sona 从诞生之日起就具备了空间智能，能够在最具挑战性的环境中支持人类的生理和心理健康。`],
  'coll.lead': [`We build your climate-sealed castle in more-than-human beauty — at the world's most epic edge locations on Earth.`, `为你筑一座气候封闭的城堡,置于超越人类的美之中——在地球最壮阔的边缘之地。`],
  // --- Zahir editorial (Commercial Residence section) ---
  'zahir.quote': [`"Zahir is the rose's shadow and the crack in the veil."`, `“扎希尔是玫瑰的影子,也是面纱上的裂痕。”`],
  'zahir.cite': [`— Borges`, `——博尔赫斯`],
  'zahir.p1': [`Some things, once seen, can never be forgotten.`, `有些事物一旦映入眼帘,就再也无法被忘却。`],
  'zahir.p2': [`Borges wrote of it as an ancient coin: whoever gazes upon it desires nothing else. The king, fearing that for its sake the world would forget the entire universe, had it sunk to the bottom of the sea.`, `博尔赫斯曾将其描述为一枚古老的硬币:任何凝视它的人都不会再有其他渴望。国王唯恐因这枚硬币的缘故,世界会忘却整个宇宙的存在,于是将其沉入了海底。`],
  'zahir.p3': [`The coin is a mirror of free will and human nature.`, `这枚硬币是自由意志和人类本性的反映。`],
  'zahir.p4': [`This is why Frisson exists.`, `正因如此,Frisson 才得以存在。`],
  'zahir.p5': [`Where Space and Human Life Evolve Together</p><p class="zahir-body">From its first residence, FRISSON begins <b>building a new global living network — where Space, Art, Intelligence, and Soul converge.</b></p><p class="zahir-body">Zahir Sky Atelier is the first node of this vision: a living environment designed to inspire, connect, and evolve with those who inhabit it.</p><p class="zahir-body">Inspired by the cultural significance of places such as the Pitti Palace in Florence — where art, ideas, and human ambition converged — <b>FRISSON creates new nodes of human connection and creativity for a new era of living.</b></p><p class="zahir-body">Through Eastern philosophy, timeless aesthetics, and <b>Sona — a new form of spatial intelligence that enables environments to become more attuned to human life — we create spaces that cultivate beauty, restore vitality, and deepen the human experience.</b>`, `让空间与人类生活共同进化</p><p class="zahir-body">从它的第一座寓所开始,FRISSON 着手<b>构建一张全新的全球居住网络——让空间、艺术、智能与灵魂在此交汇。</b></p><p class="zahir-body">扎希尔观星塔是这一愿景的首个节点:一处旨在启发、连接并与栖居其中的人共同生长的生活环境。</p><p class="zahir-body">灵感源自如佛罗伦萨皮蒂宫这般具有文化意义的场所——艺术、思想与人类雄心曾在那里交汇——<b>FRISSON 为一个全新的生活时代创造出人与人连接、创造力汇聚的全新节点。</b></p><p class="zahir-body">透过东方哲学、恒久美学,以及 <b>Sona——一种全新的空间智能,让环境更能与人类生活相契合——我们创造滋养美、恢复活力、深化人类体验的空间。</b>`],
  'zahir.p6': [`Every residence becomes a Zahir that belongs to you — once it enters your life, it remains unforgettable.`, `每一处居所都将成为属于你的扎希尔——一旦它融入你的生活,便注定难以忘怀。`],
  'zahir.climax': [`And all of this is for one purpose: to rebuild the Respect for Human.`, `这一切都是为了一个目的:重新树立对人性的尊重。`],
  'zahir.features': [`120 residences in Phase One · Spatial design that engages human emotion · The world's fastest elevator · Sona Bio OS · Soulful Living`, `一期项目共 120 套住宅 · 触动人心的空间设计 · 全球最快电梯 · Sona Bio OS · 充满情感的生活`],
  'zahir.story': [`Story`, `故事`],
  'zahir.spec.title': [`Key Features`, `主要特色`],
  'zahir.spec.intro': [`The first Zahir — a residence engineered to engage the whole human, in body and in soul.`, `首座扎希尔——一座为触动完整的人、身与心皆被唤起而生的居所。`],
  'zahir.f1.k': [`Phase One`, `一期`], 'zahir.f1.v': [`120 residences`, `120 套住宅`],
  'zahir.f2.k': [`Residence`, `居所`], 'zahir.f2.v': [`150–500 m² each · 40 floors`, `每户 150–500 平 · 40 层`],
  'zahir.f3.k': [`Mobility`, `垂直交通`], 'zahir.f3.v': [`Shared Ownership | Global Living Network`, `共享产权 | 全球居住网络`],
  'zahir.f4.k': [`Intelligence`, `智能`], 'zahir.f4.v': [`Sona Bio OS`, `Sona Bio OS`],
  'zahir.f5.k': [`Design`, `设计`], 'zahir.f5.v': [`Spatial design that engages human emotion`, `触动人心的空间设计`],
  'zahir.f6.k': [`Experience`, `体验`], 'zahir.f6.v': [`Soulful Living`, `充满情感的生活`],
  'zahir.f7.v': [`Biological Living Assets`, `生物栖居资产`],
  'zahir.mission.p1': [`We aim to create aesthetic landmarks (living network) that hold the same significance for their world as the Pitti Palace once did for Florence. Within the Frisson framework, we integrate Eastern philosophy, aesthetics, and the Sona Bio-AI OS.`, `我们旨在创建美学地标（居住网络），使其对其所在的世界具有如同昔日皮蒂宫之于佛罗伦萨般的意义。在 Frisson 框架下，我们融合东方哲学、文艺复兴美学与 Sona Bio-AI OS（共情智能）。`],
  'zahir.mission.p2': [`Spaces that create aesthetic delight, emotional restoration, and lasting spiritual depth — going beyond luxury to reach a state of meaningful living.`, `空间赋予审美愉悦、情绪修复与恒久的精神深度——超越奢华，抵达有意义的居住之境。`],
  // --- How It Works (city entry section + dedicated page) ---
  'hiw.title': [`More than ownership`, `超越所有权`],
  'hiw.p1': [`Global Residence Networks`, `全球居住网络`],
  'hiw.p2': [`Fractional Property Ownership`, `份额产权`],
  'hiw.p3': [`Full Living-Health Asset`, `全方位生活健康资产`],
  'hiw.discover': [`Discover`, `了解运作`],
  'hiw.eyebrow': [`How It Works`, `工作原理`],
  'hiw.lead': [`More than ownership. A residence you hold, a network you inhabit, and an intelligence that travels with your body.`, `不止于拥有。你持有的是一处寓所,栖居的是一整张网络,而随身而行的,是一套懂得你身体的智能。`],
  'hiw.c1.title': [`One Key, Every Horizon`, `一把钥匙,通往每一处地平线`],
  'hiw.c1.body': [`Owning a single share unlocks an entire network of exceptional residences around the world — each one an equal to your own home. Through the Frisson app, reserve nights at your residence up to twelve months ahead, or trade them to stay at any other home in the collection, bookable up to four months out, with a modest adjustment where grades differ.`, `拥有一份产权，即可畅享遍布全球的顶级住宅网络——每一处都如同您自己的家一般舒适惬意。通过 Frisson 应用程序，您可以提前十二个月预订您心仪住宅的住宿，或将其兑换为入住系列中的任何其他住宅，最多可提前四个月预订，不同等级的住宅价格略有差异。`],
  'hiw.c2.title': [`Own a Fraction, Gain the Whole`, `拥有一份,尽享其全`],
  'hiw.c2.body': [`Each Frisson residence is offered in fractional ownership — the home divided into twelve shares, each granting thirty nights of stay a year. Hold as many shares as your life calls for. When you are away, Frisson can place your unused nights into its hospitality programme and return the corresponding fees to you. Because the architecture and craft hold their worth, a share is a lasting and appreciating asset — and after an initial period it may be released on a secondary market in ten-day increments.`, `每栋 Frisson 住宅均提供部分产权所有权——房屋被分割成十二份，每份每年可享受三十晚住宿。您可以根据自身需求持有任意数量的份额。当您外出时，Frisson 可以将您未使用的晚数纳入其酒店服务计划，并将相应的费用返还给您。由于建筑和工艺本身具有价值，因此每份份额都是一项持久且不断增值的资产——在初始期限过后，这些份额可以以十天为单位在二级市场上出售。`],
  'hiw.c3.title': [`A Home That Remembers Your Body`, `一处记得你身体的居所`],
  'hiw.c3.body': [`Through Sona, our Bio-AI OS, every residence keeps a long-term, private record of how you rest, breathe, and recover — an asset that is yours alone, whose key you alone hold. Arrive at any Frisson home in the world, and that key rebuilds your personal environment — light, sound, temperature, scent, and air — tuned to your body from the very first moment. Your health data never belongs to a place; it travels with you, and every place remembers you.`, `借助我们的生物人工智能操作系统 Sona，每套住宅都会长期保存一份专属您的休息、呼吸和恢复记录——这份记录完全属于您，只有您才能开启。抵达全球任何一套 Frisson 住宅，这把钥匙便会从您踏入的那一刻起，为您重新打造专属的室内环境——光线、声音、温度、气味和空气——一切都将根据您的身体状况进行调整。您的健康数据不属于任何特定场所；它与您形影不离，每个场所都会记住您。`],
  'hiw.svc': [`No Maintenance · No Housekeeping · Private Concierge · Pay-Per-Use`, `免维护 · 免家政 · 私人管家 · 按需付费`],
  'hiw.close': [`Home is no longer a coordinate. It is a state that travels with you.`, `家,不再是一处坐标,而是一种随你而行的状态。`],
  'hiw.cta': [`Enter Sona`, `进入 Sona`],
  // --- Longevity Score (sona page) ---
  'lv.title': [`Vitality`, `生命力`],
  'lv.lead': [`The way you eat, move and rest leaves a trace in every room. Sona's vitality agentic model reads it as your biological age and emotional signals &mdash; and the space works quietly and without pause to turn it younger.`, `你的饮食、行动与睡眠，都会在每个空间留下痕迹。Sona生命力智能体将它读作你的生物年龄和情绪信号——空间安静且不间断地运作，让它逐渐变得更年轻。`],
  'lv.read.k': [`Read`, `共情`],
  'lv.read.v': [`Ambient millimeter-wave radar and chemical sensing read how you live.`, `环境毫米波雷达与化学感知，读懂你如何生活。`],
  'lv.reason.k': [`Reason`, `溯因`],
  'lv.reason.v': [`It traces the cause behind every shift.`, `它追溯每一次变化背后的成因。`],
  'lv.retune.k': [`Retune`, `调谐`],
  'lv.retune.v': [`The space adapts to what your body answers.`, `空间依你身体的回应而重新调整。`],
  'prop.learn': [`Learn more`, `了解更多`],
  'grotto.loc': [`OMAN / QATAR / DUBAI`, `阿曼 · 卡塔尔 · 迪拜`],
  'grotto.name': [`Zahir Sky Atelier`, `扎希尔观星塔`],
  'gallery.title': [`Space Healing your Body . Multisensory`, `疗愈你身体的空间`],
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

fs.mkdirSync('i18n', { recursive: true }); // i18n/*.json are build artifacts (gitignored); ensure the dir exists on a fresh checkout
fs.writeFileSync('i18n/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('i18n/zh.json', JSON.stringify(zh, null, 2));
console.log('en keys:', Object.keys(en).length, ' zh keys:', Object.keys(zh).length);
