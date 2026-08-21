/* Sensory World Lab — particle field (PixiJS 8, ParticleContainer)
 * ============================================================================
 * The hero title is NOT text that turns into particles on hover. It is particles,
 * always. That removes the handover entirely: there is no crossfade to get right,
 * no two states to reconcile, nothing to look un-silky. The <h1> stays in the DOM
 * (screen readers still read it, CSS clamp still decides the type size, and the
 * per-character rasteriser still measures it) but is never painted once we take
 * over — see `.swl-fx-on` in the page. If WebGL is unavailable the class is never
 * added and the printed title simply stays visible.
 *
 * Everything lives in ParticleContainers with only `position` dynamic, so tint,
 * alpha and scale are uploaded once and the per-frame cost is the position buffer
 * alone. Physics runs in flat Float32Arrays; the Particle objects are touched once
 * per frame to receive x/y.
 *
 * §5.5: both fields park their ticker the moment their section leaves the screen,
 * and prefers-reduced-motion renders one static frame and stops.
 * §5.9: the drift is a LOOPING phase, so time enters Math.sin linearly (via a LUT).
 * Only the pointer response — a real A→B displacement — is eased, as a spring.
 */
import { Application, ParticleContainer, Particle, Texture } from './vendor/pixi/pixi-particles.min.mjs';

const REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
const FX = (window.__swlFx = { hero: null, layers: null });
const TAU = Math.PI * 2;

/* sin() is called a few hundred thousand times a frame; a power-of-two LUT turns
   it into a mask and an array read. 2048 steps is ~0.003 rad of error, invisible
   at these amplitudes. */
const LUT_N = 2048, LUT_MASK = LUT_N - 1, LUT_SCALE = LUT_N / TAU;
const SIN = new Float32Array(LUT_N);
for (let i = 0; i < LUT_N; i++) SIN[i] = Math.sin(i / LUT_N * TAU);
const lsin = a => SIN[((a * LUT_SCALE) | 0) & LUT_MASK];

/* device budget — the user asked for 30–60k alive; hand phones a smaller swarm */
const CORES = navigator.hardwareConcurrency || 4;
const MOBILE = matchMedia('(max-width:760px)').matches || !matchMedia('(hover:hover)').matches;
const BUDGET = MOBILE ? 12000 : (CORES <= 4 ? 26000 : 46000);
const FIELD_BUDGET = MOBILE ? 18000 : (CORES <= 4 ? 34000 : 62000);

/* Black at rest; the crimson only arrives where the pointer is. Quantising the ramp to
   24 steps means a mote's tint is rewritten only when it crosses a step — a few hundred
   writes a frame instead of one per particle (§5.5: don't write a value that hasn't
   changed). The curve is squared so the swarm holds its ink until the cursor is close,
   then blooms quickly. */
const TINT_STEPS = 24;
const TINT_LUT = new Uint32Array(TINT_STEPS);
{
  const A = [0x0b, 0x0a, 0x09], B = [0xe8, 0x2f, 0x63];
  for (let i = 0; i < TINT_STEPS; i++) {
    const t = i / (TINT_STEPS - 1), e = t * t;
    TINT_LUT[i] = (Math.round(A[0] + (B[0] - A[0]) * e) << 16)
                | (Math.round(A[1] + (B[1] - A[1]) * e) << 8)
                |  Math.round(A[2] + (B[2] - A[2]) * e);
  }
}

/** soft round dot, white so per-particle tint does the colouring */
function dotTexture(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d'), r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.55, 'rgba(255,255,255,1)');
  grad.addColorStop(0.78, 'rgba(255,255,255,.72)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.beginPath(); g.arc(r, r, r, 0, TAU); g.fill();
  return Texture.from(c);
}

/**
 * Rasterise an element's text by asking the DOM where each glyph sits, then return
 * the ink as points. Positions, line breaks and tracking all come from the layout
 * on screen — re-typesetting into a scaled canvas cannot match it, because the
 * scaled size lands on a different instance of Fraunces' 9..144 opsz axis and
 * letter-spacing is a px value that does not survive the scale.
 */
function inkPoints(el, target) {
  const tr = el.getBoundingClientRect();
  if (!tr.width || !tr.height) return null;
  const cs = getComputedStyle(el);
  const w = Math.ceil(tr.width), h = Math.ceil(tr.height);
  const oc = document.createElement('canvas');
  oc.width = w; oc.height = h;
  const o = oc.getContext('2d', { willReadFrequently: true });
  o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  o.fillStyle = '#000'; o.textAlign = 'left'; o.textBaseline = 'alphabetic';
  try { o.letterSpacing = '0px'; } catch (e) { /* every x comes from the DOM anyway */ }

  const fm = o.measureText('Hxg');
  let asc = fm.fontBoundingBoxAscent, desc = fm.fontBoundingBoxDescent;
  if (!(asc > 0)) { const fs = parseFloat(cs.fontSize); asc = fs * 0.8; desc = fs * 0.2; }

  const rng = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node, drew = 0;
  while ((node = walk.nextNode())) {
    const s = node.nodeValue;
    for (let i = 0; i < s.length; i++) {
      const ch = s.charAt(i);
      if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') continue;
      try { rng.setStart(node, i); rng.setEnd(node, i + 1); } catch (e) { continue; }
      const r = rng.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      /* CSS parks half the leading above the content box; this recovers the baseline
         whether the rect came back as the content area or the whole line box */
      o.fillText(ch, r.left - tr.left, (r.top - tr.top) + (r.height - (asc + desc)) / 2 + asc);
      drew++;
    }
  }
  if (!drew) return null;

  let data;
  try { data = o.getImageData(0, 0, w, h).data; } catch (e) { return null; }

  /* count first, then choose a stride that lands near the budget */
  let ink = 0;
  for (let p = 3; p < data.length; p += 4) if (data[p] > 96) ink++;
  if (!ink) return null;
  const stepF = Math.max(1, Math.sqrt(ink / target));
  const step = Math.max(1, Math.floor(stepF));
  const keep = (step * step) / (stepF * stepF);      // <= 1, trims the rounding surplus

  const xs = [], ys = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] <= 96) continue;
      if (keep < 1 && Math.random() > keep) continue;
      /* jitter inside the cell so the swarm never shows the sampling grid */
      xs.push(x + (Math.random() - 0.5) * stepF);
      ys.push(y + (Math.random() - 0.5) * stepF);
    }
  }
  return { xs, ys, box: tr, step: stepF };
}

/** shared per-field physics state in flat arrays */
function makeField(n) {
  return {
    n,
    hx: new Float32Array(n), hy: new Float32Array(n),
    x: new Float32Array(n), y: new Float32Array(n),
    vx: new Float32Array(n), vy: new Float32Array(n),
    ph: new Float32Array(n), am: new Float32Array(n), sp: new Float32Array(n),
    tj: new Float32Array(n), ti: new Uint8Array(n),
    parts: new Array(n),
  };
}

/* ---------------------------------------------------------------- hero swarm */
async function bootHero() {
  const host = document.querySelector('.swl');
  const stage = document.getElementById('swlStage');
  const title = document.getElementById('swlTitle');
  const canvas = document.getElementById('swlHeroFx');
  if (!host || !stage || !title || !canvas) return;

  const app = new Application();
  await app.init({
    canvas, backgroundAlpha: 0, antialias: false, preference: 'webgl',
    resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true,
    width: host.clientWidth, height: host.clientHeight,
  });
  app.ticker.autoStart = false;
  app.ticker.stop();
  FX.hero = app;

  const tex = dotTexture(MOBILE ? 12 : 16);
  let container = null, F = null, built = false;

  function build() {
    const pts = inkPoints(title, BUDGET);
    if (!pts) return false;
    if (container) { app.stage.removeChild(container); container.destroy(); container = null; }

    const n = pts.xs.length;
    F = makeField(n);
    /* colour joins position as dynamic: the swarm is black until the pointer nears it */
    container = new ParticleContainer({ dynamicProperties: { position: true, color: true } });

    /* the title box in hero-local space — the canvas covers the whole hero */
    const hr = host.getBoundingClientRect();
    const ox = pts.box.left - hr.left, oy = pts.box.top - hr.top;
    /* stride x ~1.6 => adjacent motes just touch, and the mass reads as ink while the
       edges still break into grain */
    const dia = pts.step * 1.35, diaVar = pts.step * 0.8;

    for (let i = 0; i < n; i++) {
      const px = pts.xs[i] + ox, py = pts.ys[i] + oy;
      F.hx[i] = px; F.hy[i] = py;
      F.x[i] = px; F.y[i] = py;
      F.ph[i] = Math.random() * TAU;
      F.am[i] = 0.9 + Math.random() * 2.6;          // idle wander, px
      F.sp[i] = 0.55 + Math.random() * 0.85;        // per-particle drift rate
      F.tj[i] = 0.78 + Math.random() * 0.46;        // bloom threshold jitter
      F.ti[i] = 0;                                  // current tint step
      const s = (dia + Math.random() * diaVar) / tex.width;
      const p = new Particle({
        texture: tex, x: px, y: py, anchorX: 0.5, anchorY: 0.5,
        scaleX: s, scaleY: s,
        tint: TINT_LUT[0],
        alpha: 0.84 + Math.random() * 0.16,
      });
      F.parts[i] = p;
      container.addParticle(p);
    }
    app.stage.addChild(container);
    built = true;
    stage.classList.add('swl-fx-on');
    return true;
  }

  if (!build()) return;

  /* pointer, in hero-local space; -1e5 parks it far away so nothing is pushed */
  let px = -1e5, py = -1e5, pxT = -1e5, pyT = -1e5;
  const R = MOBILE ? 150 : 260, R2 = R * R, FORCE = MOBILE ? 46 : 78;

  host.addEventListener('pointermove', e => {
    const r = host.getBoundingClientRect();
    pxT = e.clientX - r.left; pyT = e.clientY - r.top;
  }, { passive: true });
  host.addEventListener('pointerleave', () => { pxT = -1e5; pyT = -1e5; }, { passive: true });

  const K = 0.055, DAMP = 0.86;
  let t = 0;

  function frame(ticker) {
    /* the phase is a LOOP, so time advances linearly into the LUT (§5.9) */
    t += ticker.deltaMS * 0.001;
    /* the pointer itself is eased so a fast flick doesn't snap the whole swarm */
    px += (pxT - px) * 0.22; py += (pyT - py) * 0.22;

    const { n, hx, hy, x, y, vx, vy, ph, am, sp, tj, ti, parts } = F;
    for (let i = 0; i < n; i++) {
      const a = ph[i], r = sp[i], m = am[i];
      let tx = hx[i] + lsin(a + t * r) * m;
      let ty = hy[i] + lsin(a * 1.7 + t * r * 0.82 + 1.7) * m;

      const dx = tx - px, dy = ty - py;
      const d2 = dx * dx + dy * dy;
      let step = 0;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 0.0001;
        const f = 1 - d / R;
        const push = f * f * FORCE;          // quadratic falloff: a soft-edged parting
        tx += (dx / d) * push; ty += (dy / d) * push;
        /* one falloff, two effects: where the swarm parts, it also warms to crimson */
        step = (f * tj[i] * (TINT_STEPS - 1)) | 0;
        if (step < 0) step = 0; else if (step > TINT_STEPS - 1) step = TINT_STEPS - 1;
      }
      if (step !== ti[i]) { ti[i] = step; parts[i].tint = TINT_LUT[step]; }

      const nvx = (vx[i] + (tx - x[i]) * K) * DAMP;
      const nvy = (vy[i] + (ty - y[i]) * K) * DAMP;
      vx[i] = nvx; vy[i] = nvy;
      const nx = x[i] + nvx, ny = y[i] + nvy;
      x[i] = nx; y[i] = ny;
      const p = parts[i]; p.x = nx; p.y = ny;
    }
  }

  if (REDUCE) { app.render(); }
  else {
    app.ticker.add(frame);
    /* §5.5: nothing runs while the hero is off screen */
    new IntersectionObserver(es => {
      if (es[0].isIntersecting) app.ticker.start(); else app.ticker.stop();
    }, { rootMargin: '10% 0px' }).observe(host);
  }

  let rt = 0;
  function relayout() {
    app.renderer.resize(host.clientWidth, host.clientHeight);
    stage.classList.remove('swl-fx-on');
    if (!build() && !REDUCE) app.ticker.stop();
    if (REDUCE) app.render();
  }
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayout, 180); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (built) relayout(); });
}

/* ------------------------------------------------- organic field on the plates */
async function bootLayers() {
  const section = document.querySelector('.swl-layers');
  const canvas = document.getElementById('swlLayersFx');
  if (!section || !canvas) return;
  const figs = [...section.querySelectorAll('.swl-fig img')];
  if (!figs.length) return;

  const app = new Application();
  await app.init({
    canvas, backgroundAlpha: 0, antialias: false, preference: 'webgl',
    resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true,
    width: innerWidth, height: innerHeight,
  });
  app.ticker.autoStart = false;
  app.ticker.stop();
  FX.layers = app;

  const tex = dotTexture(MOBILE ? 12 : 16);
  let container = null, F = null;

  /** average colour of a small patch of the artwork, so the dust is that plate's own pigment */
  function paletteOf(img) {
    const S = 48;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d', { willReadFrequently: true });
    try { g.drawImage(img, 0, 0, S, S); } catch (e) { return null; }
    let d;
    try { d = g.getImageData(0, 0, S, S).data; } catch (e) { return null; }
    return { d, S };
  }

  function build() {
    if (container) { app.stage.removeChild(container); container.destroy(); container = null; }
    const sr = section.getBoundingClientRect();
    const sectionTop = sr.top + scrollY;

    /* collect each plate's rect in SECTION space plus its palette */
    const plates = [];
    for (const img of figs) {
      const r = img.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      plates.push({
        x0: r.left, y0: r.top + scrollY - sectionTop,
        w: r.width, h: r.height,
        pal: paletteOf(img),
      });
    }
    if (!plates.length) return false;

    const per = Math.floor(FIELD_BUDGET / plates.length);
    const pts = [];
    for (const pl of plates) {
      /* the band reaches out from the plate edge; scale it with the plate so a big
         full-bleed sheet frays further than a small one */
      const range = Math.max(60, Math.min(pl.w, pl.h) * 0.42);
      let guard = 0;
      let placed = 0;
      while (placed < per && guard < per * 40) {
        guard++;
        const sx = pl.x0 - range + Math.random() * (pl.w + range * 2);
        const sy = pl.y0 - range + Math.random() * (pl.h + range * 2);
        /* distance OUTSIDE the plate rect (0 while inside) */
        const cx = Math.min(Math.max(sx, pl.x0), pl.x0 + pl.w);
        const cy = Math.min(Math.max(sy, pl.y0), pl.y0 + pl.h);
        const dx = sx - cx, dy = sy - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) continue;                       // inside the artwork: leave it alone
        if (d > range) continue;
        /* organic: density decays off the edge, and a low-frequency angular ripple
           keeps the halo from reading as a perfectly even outline */
        const ang = Math.atan2(dy, dx);
        const wob = 0.72 + 0.28 * lsin(ang * 3 + pl.x0 * 0.01);
        const fall = Math.pow(1 - d / range, 2.1) * wob;
        if (Math.random() > fall) continue;

        let tint = 0x1b2340, alpha = 0.5;
        if (pl.pal) {
          /* sample the plate where this particle's nearest edge point sits, so the
             dust carries the local colour rather than one flat average */
          const u = Math.min(0.999, Math.max(0, (cx - pl.x0) / pl.w));
          const v = Math.min(0.999, Math.max(0, (cy - pl.y0) / pl.h));
          const S = pl.pal.S;
          const o = (((v * S) | 0) * S + ((u * S) | 0)) * 4;
          tint = (pl.pal.d[o] << 16) | (pl.pal.d[o + 1] << 8) | pl.pal.d[o + 2];
          alpha = 0.30 + 0.55 * (1 - d / range);
        }
        pts.push({ x: sx, y: sy, tint, alpha, d, range });
        placed++;
      }
    }
    if (!pts.length) return false;

    const n = pts.length;
    F = makeField(n);
    F.top = sectionTop;
    container = new ParticleContainer({ dynamicProperties: { position: true } });
    for (let i = 0; i < n; i++) {
      const q = pts[i];
      F.hx[i] = q.x; F.hy[i] = q.y; F.x[i] = q.x; F.y[i] = q.y;
      F.ph[i] = Math.random() * TAU;
      F.am[i] = 1.6 + Math.random() * 5.2 * (q.d / q.range);   // outer motes roam further
      F.sp[i] = 0.3 + Math.random() * 0.5;
      const s = (1.5 + Math.random() * 2.6) / tex.width;
      const p = new Particle({
        texture: tex, x: q.x, y: q.y, anchorX: 0.5, anchorY: 0.5,
        scaleX: s, scaleY: s, tint: q.tint, alpha: q.alpha,
      });
      F.parts[i] = p;
      container.addParticle(p);
    }
    app.stage.addChild(container);
    return true;
  }

  const decoded = img => (img.complete && img.naturalWidth)
    ? Promise.resolve()
    : new Promise(res => {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
      });

  let pxT = -1e5, pyT = -1e5, px = -1e5, py = -1e5;
  const R = MOBILE ? 120 : 200, R2 = R * R, FORCE = MOBILE ? 34 : 58;
  addEventListener('pointermove', e => { pxT = e.clientX; pyT = e.clientY; }, { passive: true });

  const K = 0.04, DAMP = 0.9;
  let t = 0;

  function frame(ticker) {
    t += ticker.deltaMS * 0.001;
    px += (pxT - px) * 0.2; py += (pyT - py) * 0.2;
    /* the canvas is viewport-fixed while the particles live in section space, so one
       rect read a frame converts between them (no per-particle scroll maths) */
    const off = section.getBoundingClientRect().top;
    const H = app.screen.height;
    const { n, hx, hy, x, y, vx, vy, ph, am, sp, parts } = F;

    for (let i = 0; i < n; i++) {
      const a = ph[i], r = sp[i], m = am[i];
      let tx = hx[i] + lsin(a + t * r) * m;
      let ty = hy[i] + lsin(a * 1.4 + t * r * 0.7 + 2.1) * m;

      const sy = ty + off;
      /* cull: skip the pointer maths and the write for anything off screen */
      if (sy < -40 || sy > H + 40) {
        x[i] = tx; y[i] = ty;
        const p0 = parts[i]; p0.x = tx; p0.y = sy;
        continue;
      }
      const dx = tx - px, dy = sy - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 0.0001;
        const f = 1 - d / R;
        const push = f * f * FORCE;
        tx += (dx / d) * push; ty += (dy / d) * push;
      }
      const nvx = (vx[i] + (tx - x[i]) * K) * DAMP;
      const nvy = (vy[i] + (ty - y[i]) * K) * DAMP;
      vx[i] = nvx; vy[i] = nvy;
      const nx = x[i] + nvx, ny = y[i] + nvy;
      x[i] = nx; y[i] = ny;
      const p = parts[i]; p.x = nx; p.y = ny + off;
    }
  }

  let ready = false, building = false;
  if (!REDUCE) app.ticker.add(frame);

  /* Visibility is applied from the CURRENT rect, never from the entry that opened this
     callback. The first build awaits image decode, and a scroll during that await delivers
     an "exited" entry that would otherwise be the last word — leaving the field built,
     parked and invisible with no further threshold crossing to correct it. */
  function apply() {
    const r = section.getBoundingClientRect();
    const onScreen = r.bottom > 0 && r.top < innerHeight;
    if (!onScreen) { app.ticker.stop(); canvas.style.opacity = '0'; return; }
    canvas.style.opacity = '1';
    if (REDUCE) app.render(); else app.ticker.start();
  }

  /* The entry is only a TRIGGER — never the source of truth. Entries can arrive stale
     (the first build awaits image decode) or out of order during a fast scroll, and
     acting on one leaves the field parked and invisible with no further threshold
     crossing to correct it. apply() always re-reads the rect instead. */
  new IntersectionObserver(async es => {
    if (es[es.length - 1].isIntersecting && !ready && !building) {
      building = true;
      try {
        await Promise.all(figs.map(decoded));
        ready = build();
      } catch (e) { /* leave the plates bare rather than half-built */ }
      building = false;
    }
    apply();
  }, { rootMargin: '200px 0px' }).observe(section);

  /* apply() is strict about what counts as on screen, so it needs a signal that keeps
     arriving — the observer only speaks on threshold crossings */
  addEventListener('scroll', () => { if (ready) apply(); }, { passive: true });

  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      app.renderer.resize(innerWidth, innerHeight);
      if (ready) { ready = build(); if (REDUCE) app.render(); }
    }, 200);
  }, { passive: true });
}

/* plates are lazy-loaded; the field samples their pixels, so wait for the page */
function whenReady(fn) {
  if (document.readyState === 'complete') fn();
  else addEventListener('load', fn, { once: true });
}

/* no WebGL / no context: .swl-fx-on is never set and the printed title simply stays visible */
bootHero().catch(() => {});
whenReady(() => { bootLayers().catch(() => {}); });
