/* ============================================================
   ambience.js — the forest.
   Draws a layered wood behind the page: far mist, mid trees,
   two framing trunks, an understory of ferns and mushrooms, a
   hanging canopy, drifting light shafts, and fireflies.

   Decorative only. Never reads or writes your data, never calls
   Supabase, never calls a function in script.js. Safe to delete.
   ============================================================ */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var W = 1440, H = 900;

  /* ---------- helpers ---------- */

  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* A leafy mass: overlapping circles read as foliage once they
     share a colour and get a little blur.                        */
  function foliage(cx, cy, r, fill, blobs) {
    var g = el("g", { fill: fill });
    for (var i = 0; i < blobs; i++) {
      var a = (i / blobs) * Math.PI * 2 + rnd(-0.4, 0.4);
      var d = rnd(0, r * 0.62);
      g.appendChild(el("circle", {
        cx: (cx + Math.cos(a) * d).toFixed(1),
        cy: (cy + Math.sin(a) * d * 0.78).toFixed(1),
        r: rnd(r * 0.42, r * 0.78).toFixed(1)
      }));
    }
    g.appendChild(el("circle", { cx: cx, cy: cy, r: (r * 0.7).toFixed(1) }));
    return g;
  }

  /* A tapering trunk with a couple of limbs. */
  function trunk(x, baseY, topY, width, fill) {
    var g = el("g", { fill: fill });
    var lean = rnd(-26, 26);
    g.appendChild(el("path", {
      d: "M" + (x - width / 2) + " " + baseY +
         " C" + (x - width / 2.4) + " " + (baseY - (baseY - topY) * 0.5) +
         " " + (x + lean - width / 3.4) + " " + (topY + 60) +
         " " + (x + lean - width / 5) + " " + topY +
         " L" + (x + lean + width / 5) + " " + topY +
         " C" + (x + lean + width / 3.4) + " " + (topY + 60) +
         " " + (x + width / 2.4) + " " + (baseY - (baseY - topY) * 0.5) +
         " " + (x + width / 2) + " " + baseY + " Z"
    }));
    // a limb
    var ly = topY + (baseY - topY) * rnd(0.22, 0.4);
    var dir = Math.random() < 0.5 ? -1 : 1;
    g.appendChild(el("path", {
      d: "M" + x + " " + ly +
         " q" + (dir * 70) + " " + (-34) + " " + (dir * 116) + " " + (-72) +
         " l" + (dir * 12) + " " + 20 +
         " q" + (-dir * 60) + " " + 30 + " " + (-dir * 112) + " " + 66 + " Z",
      opacity: .95
    }));
    return g;
  }

  function fern(x, y, size, fill, flip) {
    var g = el("g", {
      fill: fill,
      transform: "translate(" + x + "," + y + ") scale(" + (flip ? -size : size) + "," + size + ")"
    });
    g.appendChild(el("path", { d: "M0 0 C -2 -22 -6 -40 -14 -56 C -6 -50 -2 -40 0 -30 Z" }));
    for (var i = 0; i < 7; i++) {
      var t = i / 7;
      var px = -14 * t * t - 2 * t;
      var py = -56 * t;
      var len = 20 * (1 - t) + 5;
      g.appendChild(el("path", {
        d: "M" + px.toFixed(1) + " " + py.toFixed(1) +
           " q" + (-len * 0.6).toFixed(1) + " " + (-len * 0.2).toFixed(1) +
           " " + (-len).toFixed(1) + " " + (-len * 0.75).toFixed(1) +
           " q" + (len * 0.5).toFixed(1) + " " + (len * 0.1).toFixed(1) +
           " " + len.toFixed(1) + " " + (len * 0.62).toFixed(1) + " Z"
      }));
      g.appendChild(el("path", {
        d: "M" + px.toFixed(1) + " " + py.toFixed(1) +
           " q" + (len * 0.6).toFixed(1) + " " + (-len * 0.2).toFixed(1) +
           " " + len.toFixed(1) + " " + (-len * 0.75).toFixed(1) +
           " q" + (-len * 0.5).toFixed(1) + " " + (len * 0.1).toFixed(1) +
           " " + (-len).toFixed(1) + " " + (len * 0.62).toFixed(1) + " Z"
      }));
    }
    return g;
  }

  function mushroom(x, y, size, cap) {
    var g = el("g", { transform: "translate(" + x + "," + y + ") scale(" + size + ")" });
    g.appendChild(el("path", { d: "M-3 0 q0 -12 1 -16 h4 q1 4 1 16 Z", fill: "#e8dcc0" }));
    g.appendChild(el("path", { d: "M-13 -15 q0 -15 13 -15 q13 0 13 15 q-13 5 -26 0 Z", fill: cap }));
    g.appendChild(el("circle", { cx: -5, cy: -21, r: 2.4, fill: "#fbf5e4", opacity: .85 }));
    g.appendChild(el("circle", { cx: 4,  cy: -24, r: 1.8, fill: "#fbf5e4", opacity: .85 }));
    g.appendChild(el("circle", { cx: 7,  cy: -17, r: 1.4, fill: "#fbf5e4", opacity: .7 }));
    return g;
  }

  /* ---------- build the scene ---------- */

  var svg = el("svg", {
    class: "scene",
    viewBox: "0 0 " + W + " " + H,
    preserveAspectRatio: "xMidYMid slice",
    "aria-hidden": "true"
  });

  /* gradients and blurs */
  var defs = el("defs");
  defs.innerHTML =
    '<linearGradient id="depthG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#12291b"/>' +
      '<stop offset="38%" stop-color="#26512f"/>' +
      '<stop offset="62%" stop-color="#7c9f68"/>' +
      '<stop offset="100%" stop-color="#d5e2c0"/>' +
    '</linearGradient>' +
    '<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#5c8250"/>' +
      '<stop offset="100%" stop-color="#24331f"/>' +
    '</linearGradient>' +
    '<linearGradient id="mistG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#d5e2c0" stop-opacity="0"/>' +
      '<stop offset="100%" stop-color="#d5e2c0" stop-opacity=".55"/>' +
    '</linearGradient>' +
    '<linearGradient id="shaftG" x1="0" y1="0" x2="0.4" y2="1">' +
      '<stop offset="0%" stop-color="#f6e2a8" stop-opacity=".26"/>' +
      '<stop offset="100%" stop-color="#f6e2a8" stop-opacity="0"/>' +
    '</linearGradient>' +
    '<filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>' +
    '<filter id="hazy"><feGaussianBlur stdDeviation="17"/></filter>';
  svg.appendChild(defs);

  /* the depth of the wood */
  svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#depthG)" }));

  /* --- far trees, lost in haze --- */
  var far = el("g", { class: "layer-far", filter: "url(#hazy)", opacity: ".55" });
  for (var f = 0; f < 16; f++) {
    var fx = rnd(-60, W + 60);
    var fy = rnd(300, 560);
    far.appendChild(el("rect", {
      x: fx - 9, y: fy, width: 18, height: rnd(150, 300), fill: "#4d7350", opacity: .8
    }));
    far.appendChild(foliage(fx, fy, rnd(48, 96), "#5b8158", 6));
  }
  svg.appendChild(far);

  /* --- light shafts --- */
  var rays = el("g", { class: "rays" });
  for (var r = 0; r < 5; r++) {
    var rx = rnd(120, W - 120);
    var ray = el("path", {
      class: "ray",
      d: "M" + rx + " -40 L" + (rx + rnd(70, 150)) + " -40 L" + (rx + rnd(300, 460)) + " " + H + " L" + (rx + rnd(140, 260)) + " " + H + " Z",
      fill: "url(#shaftG)"
    });
    ray.style.setProperty("--dur", rnd(16, 26).toFixed(1) + "s");
    ray.style.setProperty("--delay", (-rnd(0, 20)).toFixed(1) + "s");
    rays.appendChild(ray);
  }
  svg.appendChild(rays);

  /* --- mid trees, swaying --- */
  var mid = el("g", { class: "layer-mid" });
  var midX = [110, 330, 560, 880, 1120, 1330];
  midX.forEach(function (mx, i) {
    var g = el("g", { class: "tree" });
    var base = rnd(660, 720);
    var top = rnd(150, 250);
    g.appendChild(trunk(mx + rnd(-30, 30), base, top, rnd(26, 46), i % 2 ? "#40342a" : "#4b3a2b"));
    var crown = foliage(mx + rnd(-40, 40), top + rnd(-30, 30), rnd(110, 165), pick(["#255630", "#2f6339", "#356b3d"]), 8);
    crown.setAttribute("class", "crown");
    crown.setAttribute("filter", "url(#soft)");
    crown.style.setProperty("--dur", rnd(7, 12).toFixed(1) + "s");
    crown.style.setProperty("--delay", (-rnd(0, 8)).toFixed(1) + "s");
    crown.style.setProperty("--tilt", rnd(1.2, 2.6).toFixed(2) + "deg");
    g.appendChild(crown);
    mid.appendChild(g);
  });
  svg.appendChild(mid);

  /* --- mist pooling between the trunks --- */
  svg.appendChild(el("rect", { x: 0, y: 470, width: W, height: 230, fill: "url(#mistG)" }));

  /* --- the forest floor --- */
  svg.appendChild(el("path", {
    d: "M0 690 C 260 650 470 706 760 676 C 1010 650 1220 690 1440 662 L1440 900 L0 900 Z",
    fill: "url(#floorG)"
  }));

  /* --- two big trunks framing the view --- */
  var near = el("g", { class: "layer-near" });

  [[-30, 250], [W + 30, 260]].forEach(function (p, i) {
    var g = el("g", { class: "tree-near" });
    g.appendChild(trunk(p[0], H + 40, -80, p[1], i ? "#3a2d22" : "#443428"));
    var crown = foliage(p[0] + (i ? -90 : 90), rnd(60, 150), rnd(190, 250), "#1b3f25", 9);
    crown.setAttribute("class", "crown");
    crown.setAttribute("filter", "url(#soft)");
    crown.style.setProperty("--dur", rnd(9, 14).toFixed(1) + "s");
    crown.style.setProperty("--delay", (-rnd(0, 9)).toFixed(1) + "s");
    crown.style.setProperty("--tilt", rnd(0.8, 1.6).toFixed(2) + "deg");
    g.appendChild(crown);
    near.appendChild(g);
  });
  svg.appendChild(near);

  /* --- understory: ferns, then mushrooms --- */
  var under = el("g", { class: "layer-under" });
  for (var i = 0; i < 26; i++) {
    var fx2 = rnd(-40, W + 40);
    var fy2 = rnd(720, 900);
    var scale = rnd(0.9, 2.3) * (fy2 / 800);
    var frond = fern(fx2, fy2, scale, pick(["#2c5c33", "#37703c", "#264f2c"]), Math.random() < 0.5);
    frond.classList.add("frond");
    frond.style.setProperty("--dur", rnd(4, 8).toFixed(1) + "s");
    frond.style.setProperty("--delay", (-rnd(0, 6)).toFixed(1) + "s");
    frond.style.setProperty("--tilt", rnd(2, 5).toFixed(1) + "deg");
    under.appendChild(frond);
  }
  for (var m = 0; m < 7; m++) {
    under.appendChild(mushroom(rnd(60, W - 60), rnd(770, 880), rnd(0.8, 1.6), pick(["#c0687f", "#b9566f", "#cf7f92"])));
  }
  svg.appendChild(under);

  /* --- hanging canopy across the top --- */
  var canopy = el("g", { class: "layer-canopy" });
  for (var c = 0; c < 14; c++) {
    var cx = (c / 13) * (W + 160) - 80 + rnd(-40, 40);
    var cluster = foliage(cx, rnd(-70, 40), rnd(80, 155), pick(["#12291b", "#1a3a23", "#1e4429"]), 7);
    cluster.setAttribute("class", "cluster");
    cluster.style.setProperty("--dur", rnd(6, 11).toFixed(1) + "s");
    cluster.style.setProperty("--delay", (-rnd(0, 8)).toFixed(1) + "s");
    cluster.style.setProperty("--tilt", rnd(1.5, 3.4).toFixed(2) + "deg");
    canopy.appendChild(cluster);
  }
  svg.appendChild(canopy);

  /* --- a soft vignette so the paper always reads --- */
  svg.appendChild(el("rect", {
    x: 0, y: 0, width: W, height: H,
    fill: "#0d1f13", opacity: ".2", class: "vignette"
  }));

  var stage = document.createElement("div");
  stage.className = "forest";
  stage.setAttribute("aria-hidden", "true");
  stage.appendChild(svg);

  /* ---------- fireflies ---------- */

  /* Older webviews don't implement matchMedia. Fall back to a stub
     so a missing API can never cost us the whole scene.            */
  var still = (typeof window.matchMedia === "function")
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  if (!still.matches) {
    var flies = document.createElement("div");
    flies.className = "fireflies";
    var n = window.innerWidth < 600 ? 16 : 30;
    for (var k = 0; k < n; k++) {
      var s = document.createElement("span");
      s.className = "firefly";
      s.style.setProperty("--x", rnd(0, 100).toFixed(2) + "vw");
      s.style.setProperty("--y", rnd(20, 95).toFixed(2) + "vh");
      s.style.setProperty("--dx", rnd(-90, 90).toFixed(0) + "px");
      s.style.setProperty("--dy", rnd(-120, -30).toFixed(0) + "px");
      s.style.setProperty("--size", rnd(2.5, 5).toFixed(1) + "px");
      s.style.setProperty("--dur", rnd(11, 22).toFixed(1) + "s");
      s.style.setProperty("--blink", rnd(1.8, 4.2).toFixed(2) + "s");
      s.style.setProperty("--delay", (-rnd(0, 20)).toFixed(1) + "s");
      flies.appendChild(s);
    }
    stage.appendChild(flies);
  }

  document.body.insertBefore(stage, document.body.firstChild);

  /* ---------- drifting seeds, occasionally ---------- */

  if (still.matches) return;

  function seed() {
    if (document.hidden) return setTimeout(seed, 4000);
    var s = document.createElement("span");
    s.className = "seed";
    s.style.setProperty("--x", rnd(0, 100).toFixed(1) + "vw");
    s.style.setProperty("--drift", rnd(-160, 160).toFixed(0) + "px");
    s.style.setProperty("--dur", rnd(14, 24).toFixed(1) + "s");
    s.style.setProperty("--spin", rnd(-320, 320).toFixed(0) + "deg");
    stage.appendChild(s);
    s.addEventListener("animationend", function () { s.remove(); });
    setTimeout(seed, rnd(2600, 7000));
  }
  setTimeout(seed, 2000);

  var onChange = function (e) { if (e.matches) stage.remove(); };
  if (still.addEventListener) still.addEventListener("change", onChange);
  else if (still.addListener) still.addListener(onChange);
})();