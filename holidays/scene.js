/*!
 * site-holidays · holidays/scene.js 1.0.0
 * Сцена внизу страницы для праздников / Bottom-of-page scene for holidays — FolloTeam · https://folloteam.ru
 *
 * RU  Общий движок для праздничных модулей: полоска земли в конце страницы, пиксельные человечки
 *     и сценки (события), которые описывает сам праздник. Человечки поворачиваются к курсору,
 *     от клика подпрыгивают, от трёх быстрых кликов падают. Всё живёт в пространстве страницы
 *     и прокручивается вместе с ней. Модуль праздника подгружает этот файл сам.
 *
 * EN  Shared engine for holiday modules: a strip of ground at the end of the page, pixel people and
 *     little plays (events) that the holiday itself describes. People turn to the cursor, hop when
 *     clicked and fall over after three quick clicks. Everything lives in page space and scrolls
 *     with the page. A holiday module loads this file itself.
 *
 * Использование / Usage:
 *   var scene = siteHolidayScene({
 *     ground: 'css background', floor: ['#fill', '#edge'], pokeColors: [...],
 *     look: { top: [[c, dark], ...], ... },          // палитры человечков · people palettes
 *     icons: { name: [rows, palette] },               // значки для облачков · speech-bubble icons
 *     decor: function (api) { api.prop({...}) },      // постоянные предметы · permanent props
 *     events: { id: { title: 'Название', run: function (api) {...} } }
 *   });
 *   scene.start() · stop() · event(id) · events() · state() · sim(frames)
 *
 * Действия человечка / Person actions (g.q):
 *   run{x,sp} · wait{n} · until{f} · do{f} · say{icon,n} · face{x} · up{n,jump} · dance{n} ·
 *   follow{who,gap} · leave{dir,sp} · gone
 */
(function () {
  'use strict';
  if (window.siteHolidayScene) return;

  var P = 2, POKE = 26;
  function rr(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.random() * a.length | 0]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function val(x) { return typeof x === 'function' ? x() : x; }

  function fromRows(rows, pal, flip) {
    var w = 0;
    rows.forEach(function (r) { if (r.length > w) w = r.length; });
    var c = document.createElement('canvas');
    c.width = w * P; c.height = rows.length * P;
    var x = c.getContext('2d');
    rows.forEach(function (r, j) {
      for (var i = 0; i < r.length; i++) {
        var col = pal[r[i]];
        if (!col) continue;
        x.fillStyle = col; x.fillRect((flip ? w - 1 - i : i) * P, j * P, P, P);
      }
    });
    return c;
  }
  function pair(rows, pal) { return [fromRows(rows, pal, false), fromRows(rows, pal, true)]; }

  /* ---------- человечки · people ---------- */
  // смотрит вправо, 12×17 · faces right, 12×17
  var BODY = [
    '....HHHH....',
    '...HHHHHH...',
    '...HHSSSS...',
    '...HSSSKS...',
    '...HSSSSS...',
    '....SSSrS...',
    '.....SSS....',
    '...TTTTTT...',
    '..TTTTTTTT..',
    '..TtTTTTtT..',
    '..StTTTTtS..',
    '...TTTTTT...',
    '...LLLLLL...',
    '...LLLLLL...',
    '...LL..LL...',
    '...LL..LL...',
    '...FF..FF...'
  ];
  var LEGS = {
    run1: ['..LL...LL...', '..L.....LL..', '.FF......FF.'],
    run2: ['....LLLL....', '....LLLL....', '....FFFF....']
  };
  function bodyRows(lk, pose) {
    var rows = BODY.map(function (r) { return r.split(''); });
    var set = function (j, i, c) { rows[j][i] = c; };
    if (LEGS[pose]) LEGS[pose].forEach(function (r, k) { rows[14 + k] = r.split(''); });
    if (lk.style === 'long') { for (var j = 2; j <= 9; j++) set(j, 2, 'H'); set(10, 3, 'H'); }
    if (lk.style === 'bun') { rows[0] = '..HH.HHH....'.split(''); }
    if (lk.style === 'cap') { rows[0] = '....CCCC....'.split(''); rows[1] = '...CCCCCCCc.'.split(''); }
    if (lk.style === 'pony') { set(2, 1, 'H'); set(3, 1, 'H'); set(4, 2, 'H'); set(3, 2, 'H'); }
    if (lk.dress) {
      rows[12] = '..TTTTTTTT..'.split(''); rows[13] = '..tTTTTTTt..'.split('');
      for (j = 14; j <= 15; j++) rows[j] = rows[j].join('').replace(/L/g, 'S').split('');
    }
    if (pose === 'up') {
      for (j = 4; j <= 5; j++) { set(j, 1, 'S'); set(j, 10, 'S'); }
      for (j = 6; j <= 7; j++) { set(j, 2, 'T'); set(j, 9, 'T'); }
      rows[10] = '...tTTTTt...'.split('');
    }
    return rows.map(function (r) { return r.join(''); });
  }
  var POOLS = {
    hair: ['#2a1d16', '#4a2e1c', '#7a4a26', '#c98a3a', '#e8c37a', '#1a1a1a', '#8a3a1a'],
    skin: ['#f2c29b', '#e8b48c', '#d9a27a', '#a8714a', '#7e5132'],
    top: [['#3f6fd8', '#26489a'], ['#3f9d5a', '#2a6f40'], ['#9b5bd6', '#6a3a9a'], ['#e8402a', '#a8261a'], ['#f4f7fb', '#c3cedc'], ['#ff8a2a', '#c45e12']],
    bottom: ['#26324a', '#3a2a22', '#4a4f57', '#1f2a3a'],
    style: ['short', 'short', 'long', 'bun', 'cap', 'pony'],
    cap: ['#e8402a', '#3f6fd8', '#ffd23f', '#3f9d5a']
  };
  function randLook(pools, over) {
    pools = pools || {};
    var p = function (k) { return pick(pools[k] || POOLS[k]); };
    var lk = { hair: p('hair'), skin: p('skin'), top: p('top'), bottom: p('bottom'), style: p('style'), cap: p('cap'), dress: Math.random() < (pools.dressChance != null ? pools.dressChance : 0.3) };
    if (over) for (var k in over) lk[k] = over[k];
    return lk;
  }
  var folkCache = {};
  function folkSprites(lk) {
    var key = [lk.hair, lk.skin, lk.top[0], lk.bottom, lk.style, lk.cap, lk.dress].join('|');
    if (folkCache[key]) return folkCache[key];
    var pal = { H: lk.hair, S: lk.skin, K: '#1a1a1a', r: '#b8434a', T: lk.top[0], t: lk.top[1], L: lk.bottom, F: '#2a2326', C: lk.cap, c: lk.cap };
    var out = {};
    ['stand', 'run1', 'run2', 'up'].forEach(function (pose) { out[pose] = pair(bodyRows(lk, pose), pal); });
    return (folkCache[key] = out);
  }

  // значки для облачков · speech-bubble icons
  var ICONS = {
    heart: [['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], { X: '#ff2e55' }],
    note: [['...XX', '...XX', '...X.', '...X.', '.XXX.', 'XXXX.', '.XX..'], { X: '#3a2a4a' }],
    star: [['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '.XX.XX.', 'X.....X'], { X: '#f0b400' }],
    bang: [['XX', 'XX', 'XX', 'XX', '..', 'XX'], { X: '#e8292b' }],
    coin: [['.XXX.', 'XxxxX', 'Xx.xX', 'XxxxX', '.XXX.'], { X: '#f0b400', x: '#c98f12' }]
  };

  var glowCache = {};
  function glow(c) {
    if (glowCache[c]) return glowCache[c];
    var e = document.createElement('canvas'); e.width = e.height = 48;
    var x = e.getContext('2d'), g = x.createRadialGradient(24, 24, 1, 24, 24, 24);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 48, 48);
    return (glowCache[c] = e);
  }

  window.siteHolidayScene = function (theme) {
    theme = theme || {};
    var cv, ctx, ground, W = 0, H = 0, DPR = 1, GH = 150, FLOOR = 24, isSetup = false;
    var running = false, raf = 0, last = 0, T = 0, floorY = 0, lastW = 0;
    var ev = null, evNext = 3, lastName = null, decor = [], parts = [];
    var mouse = null, hoverSet = false, suppress = false, icons = {};
    var pokeColors = theme.pokeColors || ['#ffd23f', '#ff5fa2', '#ffffff', '#5b96f5'];

    function icon(name) {
      if (icons[name]) return icons[name];
      var d = (theme.icons && theme.icons[name]) || ICONS[name];
      return d ? (icons[name] = fromRows(d[0], d[1], false)) : null;
    }

    /* ---------- частицы · particles ---------- */
    // y — от уровня земли вверх (минус) · y is relative to the ground line (negative is up)
    function burst(x, y, o) {
      o = o || {};
      var n = o.n || 12, cols = o.colors || pokeColors;
      for (var i = 0; i < n; i++) {
        var a = o.up ? rr(-2.6, -0.5) : rr(0, 6.283), v = rr(o.min || 1, o.max || 3.5);
        parts.push({ x: x + rr(-3, 3), y: y + rr(-3, 3), vx: Math.cos(a) * v * (o.up ? 0.6 : 1), vy: Math.sin(a) * v,
          g: o.g != null ? o.g : (o.img ? 0.02 : 0.08), life: rr(o.life || 40, (o.life || 40) * 1.6),
          c: pick(cols), img: o.img ? icon(o.img) : null, glow: o.glow, s: o.s || 2 });
      }
    }

    /* ---------- человечек · person ---------- */
    function say(g, name, n) { g.sayIcon = name; g.sayN = n || 60; }
    function walk(g, x, sp, dt) {
      var d = x - g.x;
      g.spNow = sp;
      if (Math.abs(d) <= sp * dt) { g.x = x; g.moving = false; return true; }
      g.x += (d > 0 ? 1 : -1) * sp * dt; g.flip = d < 0; g.moving = true; g.f += dt * sp;
      return false;
    }
    function stepFolk(g, dt) {
      if (g.gone) return;
      if (g.sayN > 0) g.sayN -= dt;
      if (g.knock > 0) { g.knock -= dt; g.moving = false; return; }
      if (g.poke > 0) {
        g.poke -= dt; g.moving = false; g.pose = 'up';
        g.hop = Math.max(0, Math.sin((1 - g.poke / POKE) * Math.PI)) * 7 * P;
        return;
      }
      g.pose = 'stand'; g.hop = 0; g.moving = false;
      var a = g.q[0];
      // стоит без дела — смотрит на курсор рядом · idle: looks at a nearby cursor
      if ((!a || a.k === 'wait' || a.k === 'until') && mouse && Math.abs(mouse.x - g.x) < 140 && Math.abs(mouse.y - floorY) < 160) g.flip = mouse.x < g.x;
      if (!a) return;
      var done = false;
      switch (a.k) {
        case 'run': done = walk(g, val(a.x), a.sp || g.sp, dt); break;
        case 'wait': a.n -= dt; done = a.n <= 0; break;
        case 'until': done = !!a.f(g); break;
        case 'do': a.f(g); done = true; break;
        case 'say': say(g, a.icon, a.n); done = true; break;
        case 'face': g.flip = val(a.x) < g.x; done = true; break;
        case 'up':
          a.t = (a.t || 0) + dt; g.pose = 'up';
          if (a.jump) g.hop = Math.abs(Math.sin(a.t * 0.16)) * 6 * P;
          done = a.t >= a.n; break;
        case 'dance':
          a.t = (a.t || 0) + dt;
          g.pose = Math.floor(a.t / 10) % 2 ? 'up' : 'stand';
          g.hop = Math.abs(Math.sin(a.t * 0.16)) * 3 * P;
          g.flip = Math.floor(a.t / 40) % 2 === 1;
          done = a.t >= a.n; break;
        case 'follow': {
          var w = a.who;
          if (w.gone) { g.gone = true; break; }
          var gap = a.gap || 16, tx = w.x - (w.flip ? -1 : 1) * gap;
          if (Math.abs(tx - g.x) > 1) walk(g, tx, Math.max(g.sp, (w.spNow || g.sp) * 1.15), dt);
          else if (!w.moving) g.flip = w.flip;
          break;
        }
        case 'leave': {
          var dir = a.dir || (g.x < W / 2 ? -1 : 1);
          if (walk(g, dir < 0 ? -30 : W + 30, a.sp || g.sp, dt)) g.gone = true;
          break;
        }
        case 'gone': g.gone = true; break;
      }
      if (done) g.q.shift();
    }

    /* ---------- события · events ---------- */
    var api = {
      P: P, rr: rr, pick: pick, clamp: clamp, pair: pair, sprite: fromRows, glow: glow, icon: icon,
      W: function () { return W; }, H: function () { return H; }, T: function () { return T; },
      floor: function () { return floorY; },
      look: function (over) { return randLook(theme.look, over); },
      folk: function (x, over, sp) {
        var g = { x: x, flip: x > W / 2, q: [], f: 0, hop: 0, pose: 'stand', look: randLook(theme.look, over), sp: sp || rr(1.1, 1.5), item: null };
        if (ev) ev.folk.push(g);
        return g;
      },
      prop: function (p) {
        p.x = p.x || 0; p.y = p.y || 0;
        (ev ? ev.props : decor).push(p);
        return p;
      },
      burst: burst, say: say,
      folkList: function () { return ev ? ev.folk : []; }
    };
    function startEvent(name) {
      var list = theme.events || {}, names = Object.keys(list);
      if (!names.length) return;
      if (!name || !list[name]) {
        var pool = names.filter(function (n) { return n !== lastName; });
        name = pick(pool.length ? pool : names);
      }
      ev = { name: name, folk: [], props: [] };
      lastName = name;
      list[name].run(api);
      if (!ev.folk.length && !ev.props.length) ev = null;
    }

    /* ---------- курсор · cursor ---------- */
    function folkAt(x, y) {
      if (!ev) return null;
      for (var i = ev.folk.length - 1; i >= 0; i--) {
        var g = ev.folk[i];
        if (g.gone || g.knock > 0) continue;
        var by = floorY + 2 - (g.hop || 0);
        if (Math.abs(x - g.x) < 6 * P && y < by + 2 && y > by - 18 * P) return g;
      }
      return null;
    }
    function propAt(x, y) {
      var all = decor.concat(ev ? ev.props : []);
      for (var i = all.length - 1; i >= 0; i--) {
        var p = all[i];
        if (!p.gone && p.click && p.hit && p.hit(p, x, y - floorY)) return p;
      }
      return null;
    }
    function poke(g, x) {
      var now = performance.now();
      g.pokes = (g.pokeT && now - g.pokeT < 700 ? g.pokes || 0 : 0) + 1; g.pokeT = now;
      if (g.pokes >= 3) { g.pokes = 0; g.poke = 0; g.knock = 70; g.kdir = x < g.x ? 1 : -1; return; }
      g.poke = POKE; g.flip = x < g.x;
      burst(g.x, -14 * P, { n: 10, colors: pokeColors });
    }
    function setCursor(c) {
      var el = document.documentElement;
      if (c) { el.style.cursor = c; hoverSet = true; }
      else if (hoverSet) { el.style.cursor = ''; hoverSet = false; }
    }
    function onMove(e) {
      if (!running || e.pointerType === 'touch') return;
      mouse = { x: e.clientX, y: e.clientY };
      setCursor(folkAt(e.clientX, e.clientY) || propAt(e.clientX, e.clientY) ? 'pointer' : '');
    }
    function onDown(e) {
      if (!running || e.button > 0) return;
      var g = folkAt(e.clientX, e.clientY);
      if (g) { e.preventDefault(); e.stopPropagation(); suppress = true; poke(g, e.clientX); return; }
      var p = propAt(e.clientX, e.clientY);
      if (p) { e.preventDefault(); e.stopPropagation(); suppress = true; p.click(p, e.clientX, e.clientY - floorY); }
    }
    function onClick(e) { if (suppress) { suppress = false; e.preventDefault(); e.stopPropagation(); } }

    /* ---------- кадр · frame ---------- */
    function resize() {
      W = document.documentElement.clientWidth || innerWidth; H = innerHeight;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      GH = W < 760 ? 120 : 150;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.imageSmoothingEnabled = false;
      ground.style.height = GH + 'px';
      if (lastW && lastW !== W) {
        var kx = W / lastW;
        if (ev) { ev.folk.forEach(function (g) { g.x *= kx; }); ev.props.forEach(function (p) { p.x *= kx; }); }
        makeDecor();
      }
      lastW = W;
    }
    function makeDecor() {
      decor = [];
      var keep = ev; ev = null;
      if (theme.decor) theme.decor(api);
      ev = keep;
    }
    function drawProp(p) {
      if (p.gone) return;
      if (p.draw) { p.draw(ctx, p, floorY, T); return; }
      var img = p.img && p.img.length ? p.img[p.flip ? 1 : 0] : p.img;
      if (!img) return;
      ctx.drawImage(img, Math.round(p.x - img.width / 2), Math.round(floorY + p.y - img.height));
    }
    function drawFolk(g) {
      if (g.gone) return;
      var spr = folkSprites(g.look);
      var key = g.pose === 'up' ? 'up' : g.moving ? (Math.floor(g.f / 6) % 2 ? 'run1' : 'run2') : 'stand';
      var img = spr[key][g.flip ? 1 : 0], by = floorY + 2 - g.hop;
      if (g.knock > 0) {                                // упал — лежит со звёздочками · fell over: lying with stars
        ctx.save(); ctx.translate(g.x, by - 3 * P); ctx.rotate(g.kdir * Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height + 3 * P); ctx.restore();
        if (Math.floor(T * 6) % 2) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(g.x - 2 * P, by - 12 * P, P, P); ctx.fillRect(g.x + 3 * P, by - 13 * P, P, P); }
        return;
      }
      ctx.drawImage(img, Math.round(g.x - img.width / 2), Math.round(by - img.height));
      if (g.item) {
        var it = g.item[g.flip ? 1 : 0] || g.item, d = g.flip ? -1 : 1;
        var hx = g.x + d * (g.pose === 'up' ? 4 : 5) * P, hy = by - (g.pose === 'up' ? 13 : 7) * P;
        ctx.drawImage(it, Math.round(hx - it.width / 2), Math.round(hy - it.height / 2));
      }
    }
    function drawBubble(g) {
      if (g.gone || !(g.sayN > 0) || g.knock > 0) return;
      var ic = icon(g.sayIcon);
      if (!ic) return;
      var w = ic.width + 8, h = ic.height + 8, x = Math.round(g.x - w / 2), y = Math.round(floorY - 17 * P - g.hop - h - 8);
      ctx.globalAlpha = Math.min(1, g.sayN / 12);
      ctx.fillStyle = 'rgba(255,255,255,.94)';
      ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4);
      ctx.fillRect(Math.round(g.x) - 2, y + h, 4, 2); ctx.fillRect(Math.round(g.x) - 1, y + h + 2, 2, 2);
      ctx.drawImage(ic, x + 4, y + 4);
      ctx.globalAlpha = 1;
    }
    function tick(now) {
      var dt = last ? clamp((now - last) / 16.667, 0, 3) : 1;
      last = now; T += dt / 60;
      var gr = ground.getBoundingClientRect();
      floorY = gr.top + GH - FLOOR;
      if (!ev && T > evNext && gr.top < H + 300) startEvent();
      if (ev) {
        ev.folk.forEach(function (g) { stepFolk(g, dt); });
        ev.props.forEach(function (p) { if (!p.gone && p.step) p.step(p, dt, T); });
        if (ev.folk.every(function (g) { return g.gone; }) && ev.props.every(function (p) { return p.gone; })) { ev = null; evNext = T + rr(4, 10); }
      }
      decor.forEach(function (p) { if (p.step) p.step(p, dt, T); });
      for (var i = parts.length - 1; i >= 0; i--) {
        var q = parts[i];
        q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; q.vx *= Math.pow(0.98, dt); q.life -= dt;
        if (q.life <= 0) parts.splice(i, 1);
      }
      if (parts.length > 500) parts.splice(0, parts.length - 500);

      ctx.clearRect(0, 0, W, H);
      if (gr.top > H + 10 && !parts.length) return;
      // земля · ground
      var fl = theme.floor || ['#2a2a30', '#4a4a55'];
      ctx.fillStyle = fl[0]; ctx.fillRect(0, floorY, W, FLOOR + 2);
      ctx.fillStyle = fl[1]; ctx.fillRect(0, floorY, W, 2);
      ctx.globalAlpha = 0.45;
      for (var x = 7; x < W; x += 17) ctx.fillRect(x, floorY + 6 + (x * 7 % 13), 2, 2);
      ctx.globalAlpha = 1;
      if (theme.drawGround) theme.drawGround(ctx, floorY, W, T);
      decor.forEach(function (p) { if (!p.front) drawProp(p); });
      if (ev) {
        ev.props.forEach(function (p) { if (!p.front) drawProp(p); });
        ev.folk.forEach(drawFolk);
        ev.props.forEach(function (p) { if (p.front) drawProp(p); });
      }
      decor.forEach(function (p) { if (p.front) drawProp(p); });
      for (i = 0; i < parts.length; i++) {
        q = parts[i];
        ctx.globalAlpha = Math.min(1, q.life / 25);
        var py = floorY + q.y;
        if (q.glow) ctx.drawImage(glow(q.c), q.x - 6, py - 6, 12, 12);
        if (q.img) ctx.drawImage(q.img, Math.round(q.x - q.img.width / 2), Math.round(py - q.img.height / 2));
        else { ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(py), q.s, q.s); }
      }
      ctx.globalAlpha = 1;
      if (ev) ev.folk.forEach(drawBubble);
    }
    function frame(now) { raf = requestAnimationFrame(frame); tick(now); }

    function setup() {
      if (isSetup) return;
      isSetup = true;
      cv = document.createElement('canvas');
      cv.setAttribute('aria-hidden', 'true');
      cv.setAttribute('data-winter-ignore', '');
      cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147482990';
      ctx = cv.getContext('2d');
      ground = document.createElement('div');
      ground.setAttribute('aria-hidden', 'true');
      ground.setAttribute('data-winter-ignore', '');
      ground.style.cssText = 'position:relative;width:100%;pointer-events:none;background:' + (theme.ground || 'transparent');
      addEventListener('resize', function () { if (running) resize(); });
      addEventListener('pointermove', onMove, { passive: true });
      addEventListener('pointerdown', onDown, { capture: true, passive: false });
      addEventListener('click', onClick, true);
      document.addEventListener('visibilitychange', function () {
        if (!running) return;
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
      });
    }

    var scene = {
      start: function () {
        if (running) return;
        setup();
        running = true;
        document.body.appendChild(cv);
        document.body.appendChild(ground);
        resize(); makeDecor();
        last = 0; evNext = T + 2;
        raf = requestAnimationFrame(frame);
      },
      stop: function () {
        if (!running) return;
        running = false;
        cancelAnimationFrame(raf); raf = 0;
        if (cv.parentNode) cv.parentNode.removeChild(cv);
        if (ground.parentNode) ground.parentNode.removeChild(ground);
        ev = null; parts = []; setCursor('');
      },
      // запустить сценку по id (или случайную) · start a play by id (or a random one)
      event: function (name) { if (!running) return false; ev = null; startEvent(name); return !!ev; },
      events: function () { var l = theme.events || {}; return Object.keys(l).map(function (k) { return { id: k, title: l[k].title || k }; }); },
      state: function () {
        return { running: running, event: ev ? { name: ev.name, folk: ev.folk.map(function (g) { return { x: g.x | 0, q: g.q.map(function (a) { return a.k; }).join(','), knock: g.knock > 0, gone: !!g.gone }; }), props: ev.props.length } : null, parts: parts.length, floor: floorY | 0 };
      },
      sim: function (n) { for (var i = 0; i < (n || 600); i++) tick((last || performance.now()) + 16.667); },
      api: api
    };
    return scene;
  };
})();
