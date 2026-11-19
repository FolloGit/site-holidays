/*!
 * site-holidays · holidays/kit.js 1.0.0
 * Общий набор для праздников / Shared kit for holidays — FolloTeam · https://folloteam.ru
 *
 * RU  Всё общее для праздников, кроме зимы: каркас модуля (кнопка вкл/выкл, иконка вкладки, пасхалка,
 *     запоминание выбора, слой эффектов), сцена внизу страницы с гномиками и сценками, праздничный
 *     логотип поверх «>>FT_». Гномики — наш народ: один и тот же во всех праздниках, меняется только
 *     одежда. Загрузчик подгружает kit.js перед модулем праздника.
 *
 * EN  Everything holidays share, except winter: the module frame (on/off button, tab icon, easter egg,
 *     remembered choice, effects layer), the bottom scene with gnomes and little plays, and the festive
 *     logo over ">>FT_". Gnomes are our folk: the same in every holiday, only their clothes change.
 *     The loader loads kit.js before a holiday module.
 *
 * Модуль праздника / A holiday module:
 *   siteHolidayKit.define({
 *     id: 'valentine', global: 'ftValentine', version: '2.0.0',
 *     button: { text: '♥', color, bg, border, title },  favicon: '<svg…>',  logos: ['hearts', 'arrow'],
 *     defaults: { … },                                   // свои настройки · own options (+ SITE_HOLIDAYS[id])
 *     fx: { init(f), frame(f, dt, t), click(f, x, y), move(f, x, y) },   // слой эффектов · effects layer
 *     scene: { ground, floor, look, icons, decor(a), events: { id: { title, run(a) } } }
 *   });
 *
 * Общие настройки / Common options (SITE_HOLIDAYS[id]):  logo: false · favicon: false · scene: false
 *
 * Действия гномика / Gnome actions (g.q):
 *   run{x,sp,bounce} · wait{n} · until{f} · do{f} · say{icon,n} · face{x} · up{n,jump} · dance{n} ·
 *   pose{p,n} (stand|up|kneel|sit) · hop{n,amp} · follow{who,gap} · leave{dir,sp} · gone
 */
(function () {
  'use strict';
  if (window.siteHolidayKit) return;

  var KIT_VERSION = '1.0.0';
  var P = 2, POKE = 26;
  function rr(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.random() * a.length | 0]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function val(x) { return typeof x === 'function' ? x() : x; }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { return null; }
  }
  var reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // пиксельный спрайт из строк · pixel sprite from rows
  function fromRows(rows, pal, flip, p) {
    p = p || P;
    var w = 0;
    rows.forEach(function (r) { if (r.length > w) w = r.length; });
    var c = document.createElement('canvas');
    c.width = w * p; c.height = rows.length * p;
    var x = c.getContext('2d');
    rows.forEach(function (r, j) {
      for (var i = 0; i < r.length; i++) {
        var col = pal[r[i]];
        if (!col) continue;
        x.fillStyle = col; x.fillRect((flip ? w - 1 - i : i) * p, j * p, p, p);
      }
    });
    return c;
  }
  function pair(rows, pal, p) { return [fromRows(rows, pal, false, p), fromRows(rows, pal, true, p)]; }
  var glowCache = {};
  function glow(c) {
    if (glowCache[c]) return glowCache[c];
    var e = document.createElement('canvas'); e.width = e.height = 48;
    var x = e.getContext('2d'), g = x.createRadialGradient(24, 24, 1, 24, 24, 24);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 48, 48);
    return (glowCache[c] = e);
  }

  /* =========================================================
   * Гномики — наш народ · Gnomes — our folk
   * Тело как у зимних гномиков, шапки и костюмы — под праздник.
   * The body is the winter gnome; hats and costumes suit the holiday.
   * ========================================================= */
  // 12×17, смотрит вправо · faces right
  var BODY = [
    '...sSSSSSS..',
    '...sSSSKSSN.',
    '...bBBBBBBN.',
    '...bBBBBBB..',
    '..gbBBBBBBG.',
    '..gGbBBBBGG.',
    '..gGYYYYYGG.',
    '...gGGGGGG..',
    '...dD..dD...',
    '...dD..dD...'
  ];
  // шапка: 6 строк + поля (7-я строка) · hat: 6 rows + brim (row 7)
  var HATS = {
    pointy: [['........WW..', '.......hW...', '......hHH...', '.....hHHH...', '....hHHHH...', '...hHHHHHH..'], '..WWWWWWWWW.'],
    beanie: [['............', '............', '.....WW.....', '....HHHH....', '...HhHhHH...', '...HHHHHH...'], '..WWWWWWWWW.'],
    long: [['.WW.........', '.hH.........', '..hHH.......', '...hHHH.....', '....hHHH....', '...hHHHHHH..'], '..WWWWWWWWW.'],
    witch: [['......H.....', '.....hH.....', '.....hHH....', '....hHHH....', '....hHHHH...', '....AAAAA...'], 'HHHHHHHHHHHH'],
    party: [['.....Y......', '.....H......', '....HAH.....', '....AHA.....', '...HAHAH....', '...AHAHAH...'], '...rrrrrr...'],
    tophat: [['............', '...HHHHH....', '...HHHHH....', '...HHHHH....', '...AAAAA....', '..HHHHHHHH..'], '...rrrrrr...'],
    cap: [['............', '............', '............', '....HHHH....', '...HHHHHH...', '...HHHHHHHH.'], '...rrrrrr...'],
    horns: [['............', '............', '...A....A...', '...AA..AA...', '...rrrrrr...', '..rrrrrrrr..'], '..rrrrrrrr..'],
    jester: [['.Y........Y.', '.HA......AH.', '..HA....AH..', '...HAAAAH...', '...HAHAHA...', '...HHHHHH...'], '..YYYYYYYY..'],
    headphones: [['............', '....KKKK....', '...K....K...', '...KrrrrK...', '..KKrrrrKK..', '..KKrrrrKK..'], '...rrrrrr...'],
    wreath: [['............', '............', '............', '....rrrr....', '...rrrrrr...', '..AYAYAYAY..'], '...rrrrrr...'],
    helmet: [['....cccc....', '..cc....cc..', '.c..rrrr..c.', '.c.rrrrrr.c.', '.c.rrrrrr.c.', '.c.rrrrrr.c.'], '.c.rrrrrr.c.'],
    bow: [['............', '............', '....A.A.....', '...AAAAA....', '...rrArrr...', '..rrrrrrrr..'], '..rrrrrrrr..'],
    crown: [['............', '............', '...Y.Y.Y....', '...YYYYY....', '...YAYAY....', '...rrrrrr...'], '...rrrrrr...'],
    hood: [['............', '....HHHH....', '...HHHHHH...', '..HHrrrrHH..', '..HHrrrrHH..', '..HHrrrrHH..'], '..HrrrrrrH..'],
    ears: [['...W..W.....', '...WN.WN....', '...WN.WN....', '...WW.WW....', '...rrrrrr...', '..rrrrrrrr..'], '..rrrrrrrr..'],
    bare: [['............', '............', '............', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..'], '..rrrrrrrr..']
  };
  // костюмы целиком · whole-body costumes
  var GHOST = ['............', '............', '............', '....WWWW....', '...WWWWWW...', '..WWWWWWWW..', '..WWKWWKWW..', '..WWKWWKWW..', '..WWWWWWWW..',
    '..WWWKKWWW..', '..WWWKKWWW..', '.WWWWWWWWWW.', '.WWWWWWWWWW.', '.WWWWWWWWWW.', '.WWWWWWWWWW.', '.WW.WW.WW.W.', '..W..W..W...'];
  var ROBOT = ['.....A......', '.....K......', '...KKKKKK...', '...KGGGGK...', '...KGYGYK...', '...KGGGGK...', '...KGAAGK...', '....KKKK....', '..KKKKKKKK..',
    '..KGGGGGGK..', '.GKGAGAGGKG.', '.GKGGGGGGKG.', '..KGGGGGGK..', '..KKKKKKKK..', '...KK..KK...', '...GG..GG...', '...KK..KK...'];

  function gnomeRows(lk, pose) {
    var rows, j;
    if (lk.costume === 'ghost') {
      rows = GHOST.slice();
      if (pose === 'run1') rows[15] = '.W.WW.WW.WW', rows[16] = '...W..W..W..';
      if (pose === 'up') { rows[9] = 'W' + rows[9].slice(1, 11) + 'W'; rows[10] = 'W' + rows[10].slice(1, 11) + 'W'; }
      return rows;
    }
    if (lk.costume === 'robot') {
      rows = ROBOT.slice();
      if (pose === 'run1') rows[14] = '..KK...KK...', rows[16] = '..KK....KK..';
      if (pose === 'up') { rows[8] = 'G.KKKKKKKK.G'; rows[9] = 'G.KGGGGGGK.G'; rows[10] = '..KGAGAGGK..'; rows[11] = '..KGGGGGGK..'; }
      return rows;
    }
    var hat = HATS[lk.hat] || HATS.pointy;
    rows = hat[0].concat([hat[1]], BODY);
    if (pose === 'run1') rows = rows.slice(0, 15).concat(['..dD....dD..', '..d......dD.']);
    if (pose === 'run2') rows = rows.slice(0, 15).concat(['....dDdD....', '....dDdD....']);
    rows = rows.map(function (r) { return r.split(''); });
    if (lk.hat === 'helmet') { for (j = 7; j <= 8; j++) { rows[j][1] = 'c'; rows[j][11] = 'c'; } rows[9][1] = 'c'; rows[9][2] = 'c'; rows[9][10] = 'c'; rows[9][11] = 'c'; }
    if (pose === 'up') {
      for (j = 4; j <= 6; j++) { rows[j][1] = 'S'; rows[j][10] = 'S'; }
      for (j = 7; j <= 12; j++) { rows[j][1] = 'G'; rows[j][10] = 'G'; }
    }
    rows = rows.map(function (r) { return r.join(''); });
    if (pose === 'kneel') rows = ['............', '............'].concat(rows.slice(0, 13), ['...gGGGGGGdD', '..dDD....dD.']);
    if (pose === 'sit') rows = ['............', '............'].concat(rows.slice(0, 14), ['..dDdD.dDdD.']);
    return rows;
  }
  var POOLS = {
    hat: ['pointy', 'pointy', 'beanie', 'long'],
    hatColor: [['#e8402a', '#a8261a'], ['#3f6fd8', '#26489a'], ['#3f9d5a', '#2a6f40'], ['#9b5bd6', '#6a3a9a'], ['#ff8a2a', '#c25a12'], ['#ffd23f', '#c9a014']],
    accent: ['#ffd23f', '#ffffff', '#ff5fa2', '#5b96f5'],
    tunic: [['#3f9d5a', '#2a6f40'], ['#c0392b', '#8a2418'], ['#3f6fd8', '#26489a'], ['#8a5a36', '#5e3a20'], ['#6c6f7a', '#46484f'], ['#2a9d8f', '#1d6f65']],
    beard: [['#eef2f7', '#c3cedc'], ['#eef2f7', '#c3cedc'], ['#bfc5cc', '#8f969e'], ['#d9823b', '#a65a1e'], ['#f2e6c9', '#cdbf9c'], ['#6a4430', '#4a2c1c']],
    skin: [['#f2c29b', '#d89a74'], ['#e8b48c', '#c98f64'], ['#d9a27a', '#b07a52'], ['#a8714a', '#7e5132']],
    hair: ['#6a4430', '#3a2416', '#c98a3a', '#1a1a1a', '#bfc5cc'],
    belt: ['#ffd23f']
  };
  function makeLook(pools, over) {
    pools = pools || {};
    var p = function (k) { return pick(pools[k] || POOLS[k]); };
    var lk = { hat: p('hat'), h: p('hatColor'), a: p('accent'), t: p('tunic'), b: p('beard'), s: p('skin'), r: p('hair'), y: p('belt'), costume: null };
    if (pools.costume) for (var c in pools.costume) if (Math.random() < pools.costume[c]) { lk.costume = c; break; }
    if (over) for (var k in over) lk[k] = over[k];
    return lk;
  }
  var gCache = {};
  function gnomeSprites(lk) {
    var key = [lk.hat, lk.h[0], lk.a, lk.t[0], lk.b[0], lk.s[0], lk.r, lk.y, lk.costume].join('|');
    if (gCache[key]) return gCache[key];
    var pal = { H: lk.h[0], h: lk.h[1], A: lk.a, W: '#f4f7fb', S: lk.s[0], s: lk.s[1], K: '#1a1a1a', N: '#ff8f7a', B: lk.b[0], b: lk.b[1],
      G: lk.t[0], g: lk.t[1], Y: lk.y, D: '#6a4430', d: '#3a2416', r: lk.r, c: '#bfe6ff' };
    if (lk.costume === 'ghost') pal.W = '#eef0f6';
    var out = {};
    ['stand', 'run1', 'run2', 'up', 'kneel', 'sit'].forEach(function (pose) { out[pose] = pair(gnomeRows(lk, pose), pal); });
    return (gCache[key] = out);
  }

  // значки для облачков · speech-bubble icons
  var ICONS = {
    heart: [['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], { X: '#ff2e55' }],
    note: [['...XX', '...XX', '...X.', '...X.', '.XXX.', 'XXXX.', '.XX..'], { X: '#3a2a4a' }],
    star: [['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '.XX.XX.', 'X.....X'], { X: '#f0b400' }],
    bang: [['XX', 'XX', 'XX', 'XX', '..', 'XX'], { X: '#e8292b' }],
    q: [['.XXX.', 'X...X', '...X.', '..X..', '.....', '..X..'], { X: '#3f6fd8' }],
    coin: [['.XXX.', 'XxxxX', 'Xx.xX', 'XxxxX', '.XXX.'], { X: '#f0b400', x: '#c98f12' }],
    candy: [['Y.XXX.Y', '.YXwXY.', 'Y.XXX.Y'], { X: '#ff5fa2', w: '#ffffff', Y: '#ffd23f' }],
    ok: [['......X', '.....XX', 'X...XX.', 'XX.XX..', '.XXX...', '..X....'], { X: '#3f9d5a' }],
    ha: [['X.X.XXX', 'X.X.X.X', 'XXX.XXX', 'X.X.X.X', 'X.X.X.X'], { X: '#e8292b' }],
    n3: [['XXX', '..X', 'XXX', '..X', 'XXX'], { X: '#e8292b' }],
    n2: [['XXX', '..X', 'XXX', 'X..', 'XXX'], { X: '#e8292b' }],
    n1: [['.X.', 'XX.', '.X.', '.X.', 'XXX'], { X: '#e8292b' }],
    zzz: [['XXX.....', '..X.....', '.X..XXX.', 'XXX...X.', '.....X..', '....XXX.'], { X: '#5b96f5' }]
  };

  /* =========================================================
   * Сцена внизу страницы · Bottom-of-page scene
   * ========================================================= */
  function makeScene(theme) {
    theme = theme || {};
    var cv, ctx, ground, W = 0, H = 0, DPR = 1, GH = 150, FLOOR = theme.floorH || 24, isSetup = false;
    var running = false, raf = 0, last = 0, T = 0, floorY = 0, lastW = 0;
    var ev = null, evNext = 3, lastName = null, decor = [], parts = [];
    var mouse = null, hoverSet = false, suppress = false, icons = {};
    var pokeColors = theme.pokeColors || ['#ffd23f', '#ff5fa2', '#ffffff', '#5b96f5'];

    function icon(name) {
      if (icons[name]) return icons[name];
      var d = (theme.icons && theme.icons[name]) || ICONS[name];
      return d ? (icons[name] = fromRows(d[0], d[1], false)) : null;
    }
    // частицы; y — от уровня земли (минус — вверх) · particles; y is relative to the ground line (negative is up)
    function burst(x, y, o) {
      o = o || {};
      var n = o.n || 12, cols = o.colors || pokeColors;
      for (var i = 0; i < n; i++) {
        var a = o.up ? rr(-2.6, -0.5) : o.angle != null ? o.angle + rr(-0.35, 0.35) : rr(0, 6.283), v = rr(o.min || 1, o.max || 3.5);
        parts.push({ x: x + rr(-3, 3), y: y + rr(-3, 3), vx: Math.cos(a) * v * (o.up ? 0.6 : 1), vy: Math.sin(a) * v,
          g: o.g != null ? o.g : (o.img ? 0.02 : 0.08), life: rr(o.life || 40, (o.life || 40) * 1.6),
          c: pick(cols), img: o.img ? (typeof o.img === 'string' ? icon(o.img) : o.img) : null, glow: o.glow, s: o.s || 2 });
      }
    }

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
      if (g.over && g.over.n > 0) { g.over.n -= dt; if (g.over.n <= 0) g.over = null; }
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
        case 'run':
          done = walk(g, val(a.x), a.sp || g.sp, dt);
          if (a.bounce && g.moving) g.hop = Math.abs(Math.sin(g.f * 0.09)) * a.bounce * P;
          if (a.pose) g.pose = a.pose;
          break;
        case 'wait': a.n -= dt; done = a.n <= 0; break;
        case 'until': done = !!a.f(g); break;
        case 'do': a.f(g); done = true; break;
        case 'say': say(g, a.icon, a.n); done = true; break;
        case 'face': g.flip = val(a.x) < g.x; done = true; break;
        case 'pose': a.t = (a.t || 0) + dt; g.pose = a.p; done = a.t >= a.n; break;
        case 'hop': a.t = (a.t || 0) + dt; g.hop = Math.abs(Math.sin(a.t * (a.freq || 0.16))) * (a.amp || 6) * P; done = a.t >= a.n; break;
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
          if (a.bounce && g.moving) g.hop = Math.abs(Math.sin(g.f * 0.09)) * a.bounce * P;
          break;
        }
        case 'leave': {
          var dir = a.dir || (g.x < W / 2 ? -1 : 1);
          if (walk(g, dir < 0 ? -30 : W + 30, a.sp || g.sp, dt)) g.gone = true;
          if (a.bounce && g.moving) g.hop = Math.abs(Math.sin(g.f * 0.09)) * a.bounce * P;
          if (a.pose) g.pose = a.pose;
          break;
        }
        case 'gone': g.gone = true; break;
      }
      if (done) g.q.shift();
    }

    var api = {
      P: P, rr: rr, pick: pick, clamp: clamp, pair: pair, sprite: fromRows, glow: glow, icon: icon, reduced: reduced,
      W: function () { return W; }, H: function () { return H; }, T: function () { return T; },
      floor: function () { return floorY; },
      look: function (over) { return makeLook(theme.look, over); },
      // новый гномик (у края, за экраном) · a new gnome (at the edge, off screen)
      folk: function (x, over, sp) {
        var g = { x: x, flip: x > W / 2, q: [], f: 0, hop: 0, pose: 'stand', look: makeLook(theme.look, over), sp: sp || rr(1.1, 1.5), item: null };
        if (ev) ev.folk.push(g);
        return g;
      },
      prop: function (p) { p.x = p.x || 0; p.y = p.y || 0; (ev ? ev.props : decor).push(p); return p; },
      // оставить предмет на сцене после события · keep a prop on the scene after the event
      keep: function (p, max) {
        if (ev) { var i = ev.props.indexOf(p); if (i >= 0) ev.props.splice(i, 1); }
        p.kept = true; decor.push(p);
        var kept = decor.filter(function (d) { return d.kept; });
        if (max && kept.length > max) decor.splice(decor.indexOf(kept[0]), 1);
      },
      burst: burst, say: say,
      gnome: function (look, pose) { return gnomeSprites(look)[pose || 'stand']; },
      drawGnome: function (c, look, pose, x, footY, flip, rot) {
        var im = gnomeSprites(look)[pose || 'stand'][flip ? 1 : 0];
        c.save(); c.translate(Math.round(x), Math.round(footY)); if (rot) c.rotate(rot);
        c.drawImage(im, -im.width / 2, -im.height); c.restore();
      },
      folkList: function () { return ev ? ev.folk : []; },
      event: function () { return ev; }
    };
    function startEvent(name) {
      var list = theme.events || {}, names = Object.keys(list);
      if (!names.length) return;
      if (!name || !list[name]) {
        var pool = names.filter(function (n) { return n !== lastName; });
        name = pick(pool.length ? pool : names);
      }
      ev = { name: name, folk: [], props: [], t: 0 };
      lastName = name;
      list[name].run(api);
      if (!ev.folk.length && !ev.props.length) ev = null;
    }

    function folkAt(x, y) {
      if (!ev) return null;
      for (var i = ev.folk.length - 1; i >= 0; i--) {
        var g = ev.folk[i];
        if (g.gone || g.knock > 0 || g.hidden) continue;
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
    function drawItem(g, it, by, back) {
      var im = it[g.flip ? 1 : 0] || it, d = (g.flip ? -1 : 1) * (back ? -1 : 1);
      var hx = g.x + d * (g.pose === 'up' ? 4 : 5) * P, hy = by - (back ? 10 : g.pose === 'up' ? 13 : 7) * P + (g.pose === 'kneel' || g.pose === 'sit' ? 2 * P : 0);
      ctx.drawImage(im, Math.round(hx - im.width / 2), Math.round(hy - im.height / 2));
    }
    function drawFolk(g) {
      if (g.gone || g.hidden) return;
      var spr = gnomeSprites(g.look);
      var key = g.pose !== 'stand' ? g.pose : g.moving ? (Math.floor(g.f / 6) % 2 ? 'run1' : 'run2') : 'stand';
      var img = (spr[key] || spr.stand)[g.flip ? 1 : 0], by = floorY + 2 - g.hop;
      if (g.knock > 0) {                                // упал — лежит со звёздочками · fell over: lying with stars
        ctx.save(); ctx.translate(g.x, by - 3 * P); ctx.rotate(g.kdir * Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height + 3 * P); ctx.restore();
        if (Math.floor(T * 6) % 2) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(g.x - 2 * P, by - 12 * P, P, P); ctx.fillRect(g.x + 3 * P, by - 13 * P, P, P); }
        return;
      }
      if (g.back) drawItem(g, g.back, by, true);
      if (g.alpha != null) ctx.globalAlpha = g.alpha;
      ctx.drawImage(img, Math.round(g.x - img.width / 2), Math.round(by - img.height));
      ctx.globalAlpha = 1;
      if (g.over) { var o = g.over.img[g.flip ? 1 : 0] || g.over.img; ctx.drawImage(o, Math.round(g.x - o.width / 2 + (g.flip ? -1 : 1) * P), Math.round(by - 10 * P - o.height / 2 + (g.pose === 'kneel' ? 2 * P : 0))); }
      if (g.item) drawItem(g, g.item, by, false);
    }
    function drawBubble(g) {
      if (g.gone || g.hidden || !(g.sayN > 0) || g.knock > 0) return;
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
        ev.t += dt;
        ev.folk.forEach(function (g) { stepFolk(g, dt); });
        ev.props.forEach(function (p) { if (!p.gone && p.step) p.step(p, dt, T); });
        if (ev.t > 5400) { ev.folk.forEach(function (g) { g.gone = true; }); ev.props.forEach(function (p) { p.gone = true; }); }   // страховка: 90 с · safety: 90 s
        if (ev.folk.every(function (g) { return g.gone; }) && ev.props.every(function (p) { return p.gone; })) { ev = null; evNext = T + rr(4, 9); }
      }
      decor.forEach(function (p) { if (p.step) p.step(p, dt, T); });
      for (var i = parts.length - 1; i >= 0; i--) {
        var q = parts[i];
        q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; q.vx *= Math.pow(0.98, dt); q.life -= dt;
        if (q.life <= 0) parts.splice(i, 1);
      }
      if (parts.length > 600) parts.splice(0, parts.length - 600);

      ctx.clearRect(0, 0, W, H);
      if (gr.top > H + 10 && !parts.length && !(ev && ev.props.some(function (p) { return p.sky; }))) return;
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

    return {
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
      event: function (name) { if (!running) return false; ev = null; startEvent(name); return !!ev; },
      events: function () { var l = theme.events || {}; return Object.keys(l).map(function (k) { return { id: k, title: l[k].title || k }; }); },
      state: function () {
        return { running: running, event: ev ? { name: ev.name, t: ev.t | 0, folk: ev.folk.map(function (g) { return { x: g.x | 0, q: g.q.map(function (a) { return a.k; }).join(','), knock: g.knock > 0, gone: !!g.gone }; }), props: ev.props.length } : null, parts: parts.length, floor: floorY | 0, decor: decor.length };
      },
      sim: function (n) { for (var i = 0; i < (n || 600); i++) tick((last || performance.now()) + 16.667); },
      api: api
    };
  }

  /* =========================================================
   * Праздничный логотип поверх «>>FT_» · Holiday logo over ">>FT_"
   * SVG нарисован тем же шрифтом (1em = 200 единиц, базовая линия y = 0); #ff4f12 перекрашивается
   * в цвет из атрибута data-winter-logo="#…". The SVG uses the same font (1em = 200 units,
   * baseline at y = 0); #ff4f12 is recoloured to the data-winter-logo="#…" colour.
   * ========================================================= */
  var LOGO_SEL = '[data-winter-logo],[data-holiday-logo]';
  var logoStyle = null, logoCur = null, logoCache = {};
  function logoBaseline(el) {
    var m = document.createElement('span');
    m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(m);
    var fs = parseFloat(getComputedStyle(el).fontSize) || 24;
    var b = (m.offsetTop - el.offsetTop) / fs;
    el.removeChild(m);
    return b > 0.3 && b < 2 ? b : 1.02;
  }
  function logoApply(url, vb, svg) {
    if (logoCur !== url) return;
    var els = document.querySelectorAll(LOGO_SEL);
    if (!els.length) return;
    var k = 0.005, base = logoBaseline(els[0]), accents = {};
    els.forEach(function (el) { accents[el.getAttribute('data-holiday-logo') || el.getAttribute('data-winter-logo') || ''] = 1; });
    var css = '[data-winter-logo],[data-holiday-logo]{position:relative}' +
      'html.ft-holiday-logo :is(' + LOGO_SEL + '),html.ft-holiday-logo :is(' + LOGO_SEL + ') *{color:transparent!important;animation:none!important}' +
      ':is(' + LOGO_SEL + ')::after{content:"";position:absolute;pointer-events:none;opacity:0;transition:opacity .45s;' +
      'left:' + (vb[0] * k) + 'em;top:' + (base + vb[1] * k) + 'em;width:' + (vb[2] * k) + 'em;height:' + (vb[3] * k) + 'em;' +
      'background:no-repeat 0 0/100% 100%}' +
      'html.ft-holiday-logo :is(' + LOGO_SEL + ')::after{opacity:1}';
    Object.keys(accents).forEach(function (acc) {
      var col = /^#[0-9a-f]{3,8}$/i.test(acc) ? acc : '#ff4f12';
      var uri = 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/#ff4f12/gi, col));
      css += '[data-winter-logo="' + acc + '"]::after,[data-holiday-logo="' + acc + '"]::after{background-image:url("' + uri + '")}';
    });
    if (!logoStyle) { logoStyle = document.createElement('style'); document.head.appendChild(logoStyle); }
    logoStyle.textContent = css;
    document.documentElement.classList.add('ft-holiday-logo');
  }
  var logo = {
    show: function (url, vb) {
      if (!document.querySelector(LOGO_SEL)) return false;
      logoCur = url;
      if (logoCache[url]) { logoApply(url, vb, logoCache[url]); return true; }
      fetch(url).then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function (t) { logoCache[url] = t; logoApply(url, vb, t); }, function () {});
      return true;
    },
    hide: function () { logoCur = null; document.documentElement.classList.remove('ft-holiday-logo'); }
  };

  /* =========================================================
   * Каркас праздника · Holiday module frame
   * ========================================================= */
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/holidays\/kit\.js.*$/, '') : 'assets/holidays/';
  var LOGO_VB = [-30, -270, 660, 340];
  var modules = {};

  function define(def) {
    var id = def.id;
    if (modules[id]) return modules[id];
    var Key = 'ft' + id.charAt(0).toUpperCase() + id.slice(1), OFF_KEY = Key, EGG_KEY = Key + 'Egg';
    var cfg = { favicon: true, logo: true, scene: true };
    var k;
    for (k in def.defaults || {}) cfg[k] = def.defaults[k];
    var user = (window.SITE_HOLIDAYS && window.SITE_HOLIDAYS[id]) || {};
    for (k in user) if (Object.prototype.hasOwnProperty.call(user, k)) cfg[k] = user[k];
    var loader = window.siteHolidays;
    var PKG = (loader && loader.version) || KIT_VERSION;
    function inSeason() { return !!(loader && loader.inSeason && loader.inSeason(id)); }
    var forced = new RegExp('[?&]holiday=' + id + '(?![a-z0-9_-])').test(location.search);
    var startOn = forced || (inSeason() ? ls(OFF_KEY) !== 'off' : ls(EGG_KEY) === '1');

    var cv, ctx, btn, running = false, raf = 0, last = 0, T = 0, lastScroll = null, scene = null, logoName = null;
    // f — всё, что нужно слою эффектов · f is what the effects layer gets
    var f = {
      cfg: cfg, W: 0, H: 0, t: 0, dsy: 0, ctx: null, reduced: reduced, rr: rr, pick: pick, clamp: clamp, glow: glow, parts: [],
      pair: function (rows, pal, p) { return pair(rows, pal, p || 3); },
      sprite: function (rows, pal, p) { return fromRows(rows, pal, false, p || 3); },
      // частицы в пространстве страницы · particles in page space
      burst: function (x, y, o) {
        o = o || {};
        var n = o.n || 14;
        for (var i = 0; i < n; i++) {
          var a = o.up ? rr(-2.6, -0.5) : rr(0, 6.283), v = rr(o.min || 1.5, o.max || 4.5);
          f.parts.push({ x: x + rr(-2, 2), y: y + rr(-2, 2), vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.lift != null ? o.lift : 1.2),
            g: o.g != null ? o.g : 0.08, life: rr(o.life || 40, (o.life || 40) * 1.6), c: pick(o.colors || ['#fff']),
            img: o.imgs ? pick(o.imgs) : o.img || null, s: o.s || 2, add: !!o.add, rot: o.spin ? rr(0, 6) : 0, vr: o.spin ? rr(-0.2, 0.2) : 0 });
        }
      },
      // сдвиг списка при прокрутке (k — «глубина») · shift a list on scroll (k is the depth)
      shift: function (list, k, wrap) {
        if (!f.dsy) return;
        for (var i = 0; i < list.length; i++) {
          var o = list[i]; o.y -= f.dsy * (k == null ? 1 : typeof k === 'function' ? k(o) : k);
          if (wrap) { var span = f.H + 80; if (o.y < -40 || o.y > f.H + 40) o.y = (((o.y + 40) % span) + span) % span - 40; }
        }
      },
      // низ шапки сайта (или 0) · bottom of the site header (or 0)
      header: function (sel) {
        var el = sel && document.querySelector(sel);
        if (!el) return 0;
        var r = el.getBoundingClientRect();
        return r.bottom > 0 ? r.bottom : -999;
      }
    };

    function resize() {
      var DPR = Math.min(2, window.devicePixelRatio || 1);
      f.W = innerWidth; f.H = innerHeight;
      cv.width = f.W * DPR; cv.height = f.H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.imageSmoothingEnabled = false;
      if (def.fx && def.fx.resize) def.fx.resize(f);
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      step(now);
    }
    function step(now) {
      var dt = last ? Math.min(3, (now - last) / 16.667) : 1; last = now; T += dt / 60; f.t = T;
      var sy = window.scrollY || 0; f.dsy = lastScroll == null ? 0 : sy - lastScroll; lastScroll = sy;
      f.shift(f.parts);
      ctx.clearRect(0, 0, f.W, f.H);
      if (def.fx && def.fx.frame) def.fx.frame(f, dt, T);
      for (var i = f.parts.length - 1; i >= 0; i--) {
        var q = f.parts[i];
        q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; q.vx *= Math.pow(0.97, dt); q.life -= dt; q.rot += q.vr * dt;
        if (q.life <= 0) { f.parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, q.life / 25);
        ctx.globalCompositeOperation = q.add ? 'lighter' : 'source-over';
        if (q.img) {
          if (q.rot) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.drawImage(q.img, -q.img.width / 2, -q.img.height / 2); ctx.restore(); }
          else ctx.drawImage(q.img, Math.round(q.x - q.img.width / 2), Math.round(q.y - q.img.height / 2));
        } else { ctx.fillStyle = q.c; ctx.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s); }
      }
      if (f.parts.length > 700) f.parts.splice(0, f.parts.length - 700);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    var favOld = null, favEl = null;
    function favicon(on) {
      if (!cfg.favicon || !def.favicon) return;
      favEl = favEl || document.querySelector('link[rel~="icon"]');
      if (!favEl) return;
      if (on) { if (favOld == null) favOld = favEl.getAttribute('href'); favEl.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(def.favicon)); }
      else if (favOld != null) favEl.setAttribute('href', favOld);
    }
    function showLogo(on) {
      if (cfg.logo === false || !def.logos || !def.logos.length) return;
      if (!on) { logo.hide(); return; }
      logoName = logoName || pick(def.logos);
      logo.show(BASE + 'img/' + id + '-logo-' + logoName + '.svg?v=' + PKG, LOGO_VB);
    }

    function setOn(on, save) {
      if (on === running) return;
      running = on;
      cv.style.display = on ? '' : 'none';
      btn.style.opacity = on ? '1' : '.55';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      favicon(on);
      document.documentElement.classList.toggle('ft-holiday-on', on);
      document.documentElement.classList.toggle('ft-' + id + '-on', on);
      if (scene) { if (on) scene.start(); else scene.stop(); }
      showLogo(on);
      if (on) {
        if (!f.inited && def.fx && def.fx.init) { def.fx.init(f); f.inited = true; }
        last = 0; lastScroll = null;
        if (def.fx && def.fx.on) def.fx.on(f);
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf); raf = 0; f.parts = []; ctx.clearRect(0, 0, f.W, f.H);
        if (def.fx && def.fx.off) def.fx.off(f);
      }
      if (save) {
        if (inSeason()) ls(OFF_KEY, on ? null : 'off');
        else ls(EGG_KEY, on ? '1' : null);
      }
    }

    function boot() {
      cv = document.createElement('canvas');
      cv.setAttribute('aria-hidden', 'true');
      cv.setAttribute('data-winter-ignore', '');
      cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000';
      ctx = cv.getContext('2d'); f.ctx = ctx;
      document.body.appendChild(cv);
      resize();
      addEventListener('resize', resize);

      var b = def.button || {};
      btn = document.createElement('button');
      btn.type = 'button';
      // как у кнопки зимы: сайты уже умеют её переставлять · same as the winter button: sites already know how to place it
      btn.setAttribute('data-winter-ignore', ''); btn.setAttribute('data-holiday-btn', id);
      btn.title = b.title || id;
      btn.setAttribute('aria-label', btn.title);
      btn.textContent = b.text || '★';
      btn.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:2147483001;width:40px;height:40px;border-radius:14px;border:1px solid ' + (b.border || 'rgba(236,235,230,.16)') +
        ';background:' + (b.bg || 'rgba(17,19,22,.82)') + ';color:' + (b.color || '#ecebe6') + ';font:' + (b.font || '18px/1 system-ui,sans-serif') +
        ';cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:opacity .2s';
      btn.addEventListener('click', function () { setOn(!running, true); });
      document.body.appendChild(btn);

      addEventListener('pointermove', function (e) {
        if (running && e.pointerType !== 'touch' && def.fx && def.fx.move) def.fx.move(f, e.clientX, e.clientY);
      }, { passive: true });
      addEventListener('pointerdown', function (e) {
        if (!running || e.button > 0 || !def.fx || !def.fx.click) return;
        if (e.target && e.target.closest && e.target.closest('[data-holiday-egg],[data-holiday-btn]')) return;
        def.fx.click(f, e.clientX, e.clientY);
      }, true);
      document.addEventListener('visibilitychange', function () {
        if (!running) return;
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
      });
      // пасхалка: повторные нажатия включают и выключают · easter egg: later presses toggle
      document.addEventListener('click', function (e) {
        var t = e.target && e.target.closest && e.target.closest('[data-holiday-egg="' + id + '"]');
        if (!t) return;
        e.preventDefault();
        setOn(!running, true);
        if (running && def.fx && def.fx.click) { var r = t.getBoundingClientRect(); def.fx.click(f, r.left + r.width / 2, r.top + r.height / 2); }
      }, true);

      if (cfg.scene !== false && def.scene) scene = makeScene(typeof def.scene === 'function' ? def.scene(cfg) : def.scene);
      setOn(startOn, false);
      if (startOn && !inSeason() && !forced) ls(EGG_KEY, '1');
    }

    var mod = {
      id: id,
      version: def.version || KIT_VERSION,
      on: function () { setOn(true, true); },
      off: function () { setOn(false, true); },
      event: function (name) { return scene ? scene.event(name) : false; },
      events: function () { return scene ? scene.events() : []; },
      logos: function () { return (def.logos || []).slice(); },
      logo: function (name) { if (name) { logoName = name; if (running) showLogo(true); } return logoName; },
      state: function () { return { running: running, inSeason: inSeason(), parts: f.parts.length, fx: def.fx && def.fx.state ? def.fx.state(f) : null, scene: scene ? scene.state() : null }; },
      sim: function (n) { for (var i = 0; i < (n || 1); i++) { step((last || performance.now()) + 16.667); if (scene) scene.sim(1); } },
      scene: function () { return scene; }
    };
    if (def.api) { var extra = def.api(f, mod); for (k in extra) mod[k] = extra[k]; }
    modules[id] = mod;
    if (def.global) window[def.global] = mod;
    if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
    return mod;
  }

  window.siteHolidayKit = {
    version: KIT_VERSION,
    define: define,
    modules: modules,
    // включённый праздник (для демо) · the running holiday (for the demo)
    active: function () { for (var id in modules) if (modules[id].state().running) return modules[id]; return null; },
    gnome: { rows: gnomeRows, look: makeLook, sprites: gnomeSprites, hats: Object.keys(HATS) },
    fromRows: fromRows, pair: pair, glow: glow
  };
})();
