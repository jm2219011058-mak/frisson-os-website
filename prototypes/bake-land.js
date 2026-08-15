/* bake-land.js — 重烘 treasure-hunting.html 里的 const LAND 点阵
   用法：npm i world-atlas topojson-client && node bake-land.js
   输出：land.json（把内容替换 HTML 中 `const LAND={...};` 一行）
   参数：COLS 改密度（现行 48——2026-08-16 用户两轮加码「像素点还是太小」后的定版）；latTop/latBot 改纬度范围（现行 74/−56，裁掉两极） */
const topo = require('topojson-client');
const land = require('world-atlas/land-110m.json');
const geo = topo.feature(land, land.objects.land);

function pip(pt, ring) { // point in polygon (ray casting)
  let [x, y] = pt, inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inLand(lon, lat) {
  for (const f of geo.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) {
      if (pip([lon, lat], poly[0])) {
        let hole = false;
        for (let h = 1; h < poly.length; h++) if (pip([lon, lat], poly[h])) { hole = true; break; }
        if (!hole) return true;
      }
    }
  }
  return false;
}

const COLS = 48, latTop = 74, latBot = -56;
const ROWS = Math.round(COLS * (latTop - latBot) / 360);
const pts = [];
for (let r = 0; r < ROWS; r++) {
  const lat = latTop - (r + 0.5) * (latTop - latBot) / ROWS;
  for (let c = 0; c < COLS; c++) {
    const lon = -180 + (c + 0.5) * 360 / COLS;
    if (inLand(lon, lat)) pts.push(c, r);
  }
}
console.log('COLS', COLS, 'ROWS', ROWS, 'dots', pts.length / 2);
require('fs').writeFileSync('land.json', JSON.stringify({ cols: COLS, rows: ROWS, latTop, latBot, pts }));
