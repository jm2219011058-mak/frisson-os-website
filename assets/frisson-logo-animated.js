/*!
 * <frisson-logo-animated> — Frisson animated "liquid drop" mark (motion master engine).
 * Self-contained custom element. No dependencies. ~6KB.
 *
 *   <script src="frisson-logo-animated.js"></script>
 *   <frisson-logo-animated size="320"></frisson-logo-animated>                 // mark only
 *   <frisson-logo-animated size="320" lockup="embed"></frisson-logo-animated>  // FRISSON inside drop
 *   <frisson-logo-animated size="320" lockup="right"></frisson-logo-animated>  // mark + wordmark, horizontal
 *   <frisson-logo-animated size="320" lockup="below"></frisson-logo-animated>  // mark over wordmark, stacked
 *   <frisson-logo-animated variant="solid"></frisson-logo-animated>            // for LIGHT bg
 *   <frisson-logo-animated variant="outline"></frisson-logo-animated>          // for WHITE bg
 *
 * Three official background versions (match the static set):
 *   glow    — gradient drop + halo. Use on DARK surfaces. (default)
 *   solid   — flat warm gradient fill + soft shadow. Use on LIGHT surfaces.
 *   outline — orange stroke only. Use on WHITE / minimal surfaces.
 *
 * Locked proportions: every wordmark size / gap is a fixed fraction of the mark
 * size S, so the mark↔wordmark relationship never drifts between deliverables.
 *
 * Attributes:
 *   size      px — height of the square mark. Default 320.
 *   variant   glow | solid | outline. Default glow.
 *   lockup    none | embed | right | below. Default none.
 *   shape     organic | round | droplet | star | softtri. Default organic.
 *   speed     animation speed multiplier. Default 1.
 *   wobble    edge amplitude multiplier. Default 1.
 *   stretch   vertical stretch. Default 1.15.
 *   halo      presence => soft glow ring (use on dark surfaces).
 *   wordcolor external wordmark color (right/below). Default #F4ECDC (for dark bg).
 *
 * Behavior: pauses off-screen (IntersectionObserver); single still frame under
 * prefers-reduced-motion. Wordmark = Playfair Display — load it on the host page.
 */
(function () {
  var SHAPES = {
    organic: [{ k: 2, a: .07, w: .85, p: .5 }, { k: 3, a: .05, w: -.6, p: 2.0 }, { k: 5, a: .03, w: 1.0, p: .3 }],
    round:   [{ k: 2, a: .012, w: .5, p: .3 }, { k: 3, a: .008, w: -.4, p: 1.2 }],
    droplet: [{ k: 1, a: .04, w: .45, p: 0 }, { k: 2, a: .045, w: .7, p: .5 }, { k: 3, a: .025, w: -.6, p: 2.0 }],
    star:    [{ k: 5, a: .10, w: .45, p: 0 }, { k: 10, a: .02, w: -.7, p: 1.0 }],
    softtri: [{ k: 3, a: .075, w: .45, p: 0 }, { k: 6, a: .02, w: -.7, p: 1.2 }]
  };
  // Locked proportions (fractions of mark size S)
  var R = {
    embedFont: 0.128, embedTop: 0.485,
    rightFont: 0.33, rightGap: 0.05, rightNudge: -0.02,
    belowFont: 0.295, belowGap: 0.0, belowTrack: 0.16
  };
  var VB = "48 57 300 300"; // tight crop around the drop (safe for wobble peaks)
  var uid = 0;

  function buildPath(cx, cy, R0, t, harm, ampScale, sx, sy) {
    sx = sx == null ? 1 : sx; sy = sy == null ? 1 : sy;
    var N = 64, pts = [];
    for (var i = 0; i < N; i++) {
      var th = (i / N) * Math.PI * 2, rr = 1;
      for (var j = 0; j < harm.length; j++) { var h = harm[j]; rr += h.a * ampScale * Math.sin(h.k * th + h.w * t + h.p); }
      var r = R0 * rr;
      pts.push([cx + r * Math.cos(th) * sx, cy + r * Math.sin(th) * sy]);
    }
    var d = 'M ' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
    for (var k = 0; k < N; k++) {
      var p0 = pts[(k - 1 + N) % N], p1 = pts[k], p2 = pts[(k + 1) % N], p3 = pts[(k + 2) % N];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C ' + c1x.toFixed(2) + ' ' + c1y.toFixed(2) + ' ' + c2x.toFixed(2) + ' ' + c2y.toFixed(2) + ' ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2);
    }
    return d + ' Z';
  }

  class FrissonLogoAnimated extends HTMLElement {
    static get observedAttributes() { return ["size", "variant", "lockup", "shape", "speed", "wobble", "stretch", "halo", "wordcolor", "strokecolor", "strokewidth"]; }
    constructor() { super(); this._id = ++uid; this.attachShadow({ mode: "open" }); }

    connectedCallback() {
      this.render();
      this._io = new IntersectionObserver((es) => { this._vis = es[0].isIntersecting; this._vis ? this.start() : this.stop(); }, { threshold: 0 });
      this._io.observe(this);
      this._mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      this._reduce = this._mq.matches;
      this._mqHandler = (e) => { this._reduce = e.matches; this._reduce ? (this.stop(), this.draw(2.4)) : this.start(); };
      this._mq.addEventListener("change", this._mqHandler);
      if (this._reduce) this.draw(2.4);
    }
    disconnectedCallback() {
      this.stop();
      if (this._io) this._io.disconnect();
      if (this._mq) this._mq.removeEventListener("change", this._mqHandler);
    }
    attributeChangedCallback() { if (this.shadowRoot && this._main) this.render(); }

    get harm() { return SHAPES[this.getAttribute("shape") || "organic"] || SHAPES.organic; }
    get speed() { return parseFloat(this.getAttribute("speed") || "1"); }
    get wobble() { return parseFloat(this.getAttribute("wobble") || "1"); }
    get stretch() { return parseFloat(this.getAttribute("stretch") || "1.15"); }

    start() {
      if (this._reduce || this._raf) return;
      this._t0 = performance.now();
      var self = this;
      var loop = function (now) { self.draw((now - self._t0) / 1000); self._raf = requestAnimationFrame(loop); };
      this._raf = requestAnimationFrame(loop);
    }
    stop() { if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }

    draw(t) {
      if (!this._main) return;
      var ts = t * this.speed * 0.85;
      var st = this.stretch;
      var d = buildPath(200, 200, 118, ts, this.harm, this.wobble, st, 1 / st);
      this._main.setAttribute("d", d);
      if (this._glow) this._glow.setAttribute("d", d);
    }

    markHTML(S, id, halo, variant, sc, sw) {
      var defs =
        '<radialGradient id="g' + id + '" gradientUnits="userSpaceOnUse" cx="200" cy="144" r="272">' +
          '<stop offset="0%" stop-color="#FFF4DD"/><stop offset="58%" stop-color="#FFC878"/><stop offset="100%" stop-color="#EE7E37"/>' +
        '</radialGradient>' +
        '<radialGradient id="s' + id + '" gradientUnits="userSpaceOnUse" cx="200" cy="136" r="288">' +
          '<stop offset="0%" stop-color="#FFD89A"/><stop offset="55%" stop-color="#FCA64E"/><stop offset="100%" stop-color="#E86F2C"/>' +
        '</radialGradient>' +
        '<filter id="b' + id + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="13"/></filter>';

      var paths, svgStyle = "overflow:visible;display:block;position:relative;", haloEl = "";
      if (variant === "solid") {
        svgStyle += "filter:drop-shadow(0 " + (S * 0.045).toFixed(1) + "px " + (S * 0.09).toFixed(1) + "px rgba(232,111,44,.30));";
        paths = '<path class="main" d="" fill="url(#s' + id + ')"/>';
      } else if (variant === "outline") {
        paths = '<path class="main" d="" fill="none" stroke="' + (sc || "#EE7E37") + '" stroke-width="' + (sw || "7") + '" stroke-linejoin="round"/>';
      } else { // glow
        if (halo) haloEl = '<div style="position:absolute;left:50%;top:50%;width:86%;height:86%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 50% 52%,rgba(255,176,92,.5),rgba(255,140,70,0) 62%);filter:blur(' + (S * 0.05).toFixed(1) + 'px);animation:flp 5s ease-in-out infinite;"></div>';
        paths = '<path class="glow" d="" fill="url(#g' + id + ')" filter="url(#b' + id + ')" opacity="0.7"/>' +
                '<path class="main" d="" fill="url(#g' + id + ')"/>';
      }
      return '<div class="mk" style="position:relative;width:' + S + 'px;height:' + S + 'px;flex:0 0 auto;">' +
          haloEl +
          '<svg width="' + S + '" height="' + S + '" viewBox="' + VB + '" style="' + svgStyle + '">' +
            '<defs>' + defs + '</defs>' + paths +
          '</svg>' +
        '</div>';
    }

    render() {
      this.stop();
      var S = parseFloat(this.getAttribute("size") || "320");
      var variant = this.getAttribute("variant") || "glow";
      var lockup = this.getAttribute("lockup") || "none";
      var halo = this.hasAttribute("halo");
      // embedded wordmark style depends on variant (soft-light needs a mid-tone fill behind it)
      var embedDark = (variant === "outline");
      var embedColor = embedDark ? "#3a1c05" : "#000";
      var embedBlend = embedDark ? "normal" : "soft-light";
      // external wordmark default color by variant (glow=on dark, solid/outline=on light)
      var defWord = variant === "glow" ? "#F4ECDC" : "#241608";
      var wc = this.getAttribute("wordcolor") || defWord;
      var id = this._id;
      var sc = this.getAttribute("strokecolor") || "#EE7E37";
      var sw = this.getAttribute("strokewidth") || "7";
      var mark = this.markHTML(S, id, halo, variant, sc, sw);
      var serif = "'Playfair Display',Georgia,serif";
      var content, wrap = "display:inline-flex;align-items:center;";

      if (lockup === "embed") {
        var ef = (S * R.embedFont).toFixed(1);
        var layer = '<span style="display:block;font-family:' + serif + ';font-size:' + ef + 'px;font-weight:700;letter-spacing:.1em;color:' + embedColor + ';mix-blend-mode:' + embedBlend + ';">FRISSON</span>';
        var second = embedDark ? "" : '<span style="display:block;position:absolute;left:0;top:0;font-family:' + serif + ';font-size:' + ef + 'px;font-weight:700;letter-spacing:.1em;color:' + embedColor + ';mix-blend-mode:' + embedBlend + ';">FRISSON</span>';
        var w = '<div style="position:absolute;left:50%;top:' + (R.embedTop * 100) + '%;transform:translate(-50%,-50%);white-space:nowrap;line-height:1;">' + layer + second + '</div>';
        content = '<div style="position:relative;display:inline-block;">' + mark + w + '</div>';
      } else if (lockup === "right") {
        var rf = (S * R.rightFont).toFixed(1);
        var rg = (S * R.rightGap).toFixed(1);
        var word = '<span style="font-family:' + serif + ';font-weight:700;font-size:' + rf + 'px;letter-spacing:.05em;line-height:1;color:' + wc + ';transform:translateY(' + (S * R.rightNudge).toFixed(1) + 'px);">FRISSON</span>';
        content = '<span style="' + wrap + 'gap:' + rg + 'px;">' + mark + word + '</span>';
      } else if (lockup === "below") {
        var bf = (S * R.belowFont).toFixed(1);
        var bg = (S * R.belowGap).toFixed(1);
        var wordB = '<span style="font-family:' + serif + ';font-weight:700;font-size:' + bf + 'px;letter-spacing:' + R.belowTrack + 'em;line-height:1;color:' + wc + ';">FRISSON</span>';
        content = '<span style="display:inline-flex;flex-direction:column;align-items:center;gap:' + bg + 'px;">' + mark + wordB + '</span>';
      } else {
        content = mark;
      }

      this.shadowRoot.innerHTML =
        '<style>:host{display:inline-block;line-height:0}@keyframes flp{0%,100%{opacity:.4}50%{opacity:.78}}@media (prefers-reduced-motion:reduce){[style*="flp"]{animation:none!important}}</style>' +
        content;
      this._main = this.shadowRoot.querySelector(".main");
      this._glow = this.shadowRoot.querySelector(".glow");
      this.draw(2.4);
      if (this._reduce) return;
      if (this._vis !== false) this.start();
    }
  }
  if (!customElements.get("frisson-logo-animated")) customElements.define("frisson-logo-animated", FrissonLogoAnimated);
})();
