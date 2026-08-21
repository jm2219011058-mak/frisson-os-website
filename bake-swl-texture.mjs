/* bake-swl-texture.mjs — Sensory World Lab plate texture bake.
 *
 * The hero plate (assets/city/swl-bg2.webp) is a 1040x1512 scan shown full-bleed, i.e.
 * ~2.5x upscaled on a retina desktop. Rather than ship that softness, we bake the
 * shortfall into deliberate material: spray particles that follow the cloud's own
 * density, plus multi-octave grain. Per CLAUDE.md §5.8 the grain is multi-SCALE on
 * purpose — a single-frequency field (what feTurbulence gives you) reads as digital
 * noise; real paper and ink have structure at several sizes at once.
 *
 * The particle pass is band-passed on the cloud mask, not simply proportional to it:
 * real aerosol lays down a SOLID core and speckles only at the fringe, so density
 * peaks where the mask is mid-valued and falls off both into the core and out onto
 * the paper. A separately blurred mask throws sparse dust beyond the cloud edge,
 * which is what keeps a landscape CROP of this portrait plate still reading as spray.
 *
 * Outputs (all committed, all pre-baked — nothing here runs in the browser, §5.5):
 *   assets/city/swl-plate.webp  (+ -960/-1440/-1920)  textured plate
 *   assets/city/swl-grain.webp                        256x256 seamless CSS grain tile
 *
 * Run: node bake-swl-texture.mjs
 */
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = 'assets/city/swl-bg2.webp';
const OUT_PLATE = 'assets/city/swl-plate.webp';
const OUT_GRAIN = 'assets/city/swl-grain.webp';
const SCALE = 2;                       // 1040 -> 2080: grain is baked at delivery resolution
const PLATE_VARIANTS = [960, 1440, 1920];

/* deterministic PRNG so a re-bake reproduces the same plate byte-for-byte */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* value noise on a wrapping lattice -> seamless at any tile size that is a multiple
   of `period`. Bilinear + smoothstep so coarse octaves read as soft blotches, not a grid. */
function valueNoise(w, h, period, seed) {
  const r = rng(seed);
  const gw = Math.max(1, Math.round(w / period)), gh = Math.max(1, Math.round(h / period));
  const lat = new Float32Array(gw * gh);
  for (let i = 0; i < lat.length; i++) lat[i] = r();
  const out = new Float32Array(w * h);
  const sx = gw / w, sy = gh / h;
  for (let y = 0; y < h; y++) {
    const fy = y * sy, y0 = Math.floor(fy), ty = fy - y0;
    const ey = ty * ty * (3 - 2 * ty);
    const y0w = ((y0 % gh) + gh) % gh, y1w = (y0w + 1) % gh;
    for (let x = 0; x < w; x++) {
      const fx = x * sx, x0 = Math.floor(fx), tx = fx - x0;
      const ex = tx * tx * (3 - 2 * tx);
      const x0w = ((x0 % gw) + gw) % gw, x1w = (x0w + 1) % gw;
      const a = lat[y0w * gw + x0w], b = lat[y0w * gw + x1w];
      const c = lat[y1w * gw + x0w], d = lat[y1w * gw + x1w];
      const top = a + (b - a) * ex, bot = c + (d - c) * ex;
      out[y * w + x] = top + (bot - top) * ey;
    }
  }
  return out;
}

/* grey RGB grain around mid-128, summed over octaves of [period, amplitude].
   Mid-grey is the identity for `overlay`, so a flat field leaves the plate untouched
   and only the deviation shows as tooth (§5.8). */
function grainBuffer(w, h, octaves, seed, whiteAmp) {
  const acc = new Float32Array(w * h);
  octaves.forEach(([period, amp], i) => {
    const n = valueNoise(w, h, period, seed + i * 7919);
    for (let p = 0; p < acc.length; p++) acc[p] += (n[p] - 0.5) * 2 * amp;
  });
  if (whiteAmp) {
    const r = rng(seed + 104729);
    for (let p = 0; p < acc.length; p++) acc[p] += (r() - 0.5) * 2 * whiteAmp;
  }
  const buf = Buffer.allocUnsafe(w * h * 3);
  for (let p = 0; p < acc.length; p++) {
    let v = 128 + acc[p];
    v = v < 0 ? 0 : v > 255 ? 255 : v;
    const o = p * 3;
    buf[o] = buf[o + 1] = buf[o + 2] = v;
  }
  return buf;
}

/* ---------------------------------------------------------------- grain tile */
async function bakeGrainTile() {
  const N = 256;
  const buf = grainBuffer(N, N, [[64, 7], [16, 9], [4, 11]], 20260821, 13);
  await sharp(buf, { raw: { width: N, height: N, channels: 3 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(OUT_GRAIN);
  return N;
}

/* ------------------------------------------------------------- textured plate */
async function bakePlate() {
  const meta = await sharp(SRC).metadata();
  const W = meta.width * SCALE, H = meta.height * SCALE;

  /* mask at SOURCE resolution — a coarse mask throws dots across the white
     highlights punched out of the cloud, which reads as dirt, not spray */
  const MW = meta.width, MH = meta.height;
  const { data: md } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  const red = new Float32Array(MW * MH);
  for (let p = 0; p < MW * MH; p++) {
    const R = md[p * 3], G = md[p * 3 + 1], B = md[p * 3 + 2];
    red[p] = Math.max(0, Math.min(1, (R - (G + B) / 2) / 92));
  }
  /* separable box blur (two passes) -> the dust halo just outside the cloud */
  const halo = (() => {
    const R = 26, tmp = new Float32Array(MW * MH), out = new Float32Array(MW * MH);
    for (let y = 0; y < MH; y++) {
      let s = 0; const row = y * MW;
      for (let x = 0; x < Math.min(R, MW); x++) s += red[row + x];
      for (let x = 0; x < MW; x++) {
        const add = x + R, sub = x - R - 1;
        if (add < MW) s += red[row + add];
        if (sub >= 0) s -= red[row + sub];
        tmp[row + x] = s / Math.min(MW, Math.min(x + R, MW - 1) - Math.max(0, x - R) + 1);
      }
    }
    for (let x = 0; x < MW; x++) {
      let s = 0;
      for (let y = 0; y < Math.min(R, MH); y++) s += tmp[y * MW + x];
      for (let y = 0; y < MH; y++) {
        const add = y + R, sub = y - R - 1;
        if (add < MH) s += tmp[add * MW + x];
        if (sub >= 0) s -= tmp[sub * MW + x];
        out[y * MW + x] = s / (Math.min(y + R, MH - 1) - Math.max(0, y - R) + 1);
      }
    }
    return out;
  })();

  const layer = Buffer.alloc(W * H * 4, 0);
  const r = rng(1312);

  function dot(cx, cy, rad, cr, cg, cb, alpha) {
    const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(W - 1, Math.ceil(cx + rad));
    const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(H - 1, Math.ceil(cy + rad));
    const r2 = rad * rad;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const a = alpha * Math.min(1, (1 - Math.sqrt(d2) / rad) * 2.4);
      if (a <= 0.003) continue;
      const o = (y * W + x) * 4, ea = layer[o + 3] / 255;
      const na = a + ea * (1 - a);
      layer[o]     = Math.round((cr * a + layer[o]     * ea * (1 - a)) / na);
      layer[o + 1] = Math.round((cg * a + layer[o + 1] * ea * (1 - a)) / na);
      layer[o + 2] = Math.round((cb * a + layer[o + 2] * ea * (1 - a)) / na);
      layer[o + 3] = Math.round(na * 255);
    }
  }

  /* --- ink spray ------------------------------------------------------------
     fringe = core*(1-core)*4 peaks at mid-mask, i.e. exactly on the cloud's edge.
     dust   = (halo - core) is positive only OUTSIDE the cloud, so the thrown
              speckle lands on paper rather than doubling up on solid ink. */
  const CANDIDATES = 2600000;
  let placed = 0;
  for (let i = 0; i < CANDIDATES; i++) {
    const x = r() * W, y = r() * H;
    const mx = Math.min(MW - 1, (x / SCALE) | 0), my = Math.min(MH - 1, (y / SCALE) | 0);
    const core = red[my * MW + mx];
    const fringe = Math.max(0, core * (1 - core) * 4);
    const dust = Math.max(0, halo[my * MW + mx] - core);
    const p = Math.pow(fringe, 1.15) * 0.26 + Math.pow(dust, 1.25) * 0.30;
    if (r() > p) continue;

    /* heavy tail: the overwhelming majority are sub-pixel motes, a few are real specks */
    const rad = 0.42 + Math.pow(r(), 3) * 2.7;
    /* colour comes from the plate itself, pushed a little denser, so a dot reads as
       more of the same ink rather than a foreign mark */
    const o = (my * MW + mx) * 3;
    const lift = core > 0.12 ? 0.82 : 0.62;
    const cr = Math.round(md[o] * (core > 0.12 ? 0.97 : 1));
    const cg = Math.round(md[o + 1] * lift);
    const cb = Math.round(md[o + 2] * (lift + 0.06));
    dot(x, y, rad, cr, cg, cb, 0.16 + r() * 0.42);
    placed++;
  }

  /* paper tooth — sparse neutral speckle over the WHOLE sheet, blank margins included,
     so the paper carries grain of its own and never reads as a flat upscale */
  const TOOTH = 520000;
  for (let i = 0; i < TOOTH; i++) {
    const x = r() * W, y = r() * H;
    const dark = r() < 0.55;
    const v = dark ? 104 + r() * 62 : 210 + r() * 40;
    dot(x, y, 0.4 + Math.pow(r(), 2) * 1.25, v, v - 4, v - 9, 0.05 + r() * 0.12);
  }

  const grain = grainBuffer(W, H,
    [[Math.round(180 * SCALE), 6], [Math.round(34 * SCALE), 8], [Math.round(7 * SCALE), 9]], 77003, 11);

  const base = await sharp(SRC)
    .resize(W, H, { kernel: 'lanczos3' })
    /* lanczos returns some acutance; the unsharp stays mild so the cloud's soft
       gradient doesn't halo */
    .sharpen({ sigma: 1.0, m1: 0.35, m2: 1.8 })
    .removeAlpha()
    .toBuffer();

  await sharp(base)
    .composite([
      { input: layer, raw: { width: W, height: H, channels: 4 }, blend: 'over' },
      { input: grain, raw: { width: W, height: H, channels: 3 }, blend: 'overlay' },
    ])
    .webp({ quality: 76, effort: 6, smartSubsample: true })
    .toFile(OUT_PLATE);

  for (const w of PLATE_VARIANTS) {
    await sharp(OUT_PLATE).resize({ width: w, kernel: 'lanczos3' })
      .webp({ quality: 78, effort: 6 })
      .toFile(OUT_PLATE.replace('.webp', `-${w}.webp`));
  }
  return { W, H, placed };
}

const kb = f => (fs.statSync(f).size / 1024).toFixed(0) + 'KB';
const n = await bakeGrainTile();
console.log(`grain tile  ${n}x${n}  ${kb(OUT_GRAIN)}  -> ${OUT_GRAIN}`);
const { W, H, placed } = await bakePlate();
console.log(`plate       ${W}x${H}  ${kb(OUT_PLATE)}  (${placed.toLocaleString()} ink particles)`);
for (const w of PLATE_VARIANTS) console.log(`  variant   ${w}w     ${kb(OUT_PLATE.replace('.webp', `-${w}.webp`))}`);
