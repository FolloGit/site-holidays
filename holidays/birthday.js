/*!
 * site-holidays · holidays/birthday.js 1.0.0
 * День рождения FolloTeam / FolloTeam's birthday — FolloTeam · https://folloteam.ru
 *
 * RU  Падает конфетти, поднимаются воздушные шары, клик — хлопушка. Внизу стол с тортом (свечи
 *     гаснут и снова зажигаются по клику) и гномики в праздничных колпаках: задувают свечи под
 *     песню, дарят гору подарков, улетают на шариках, танцуют паровозиком, бьют пиньяту, хлопают
 *     хлопушкой. Дата — в загрузчике (SITE_HOLIDAYS.birthday.date = 'ММ-ДД'); без даты праздник
 *     включается только пасхалкой и ?holiday=birthday.
 *
 * EN  Confetti falls, balloons rise, a click is a party popper. At the bottom: a table with a cake
 *     (the candles go out and light again when clicked) and gnomes in party hats: they blow out the
 *     candles to a song, bring a pile of gifts, float off on balloons, dance in a conga line, hit a
 *     piñata, pop a party popper. The date lives in the loader (SITE_HOLIDAYS.birthday.date = 'MM-DD');
 *     without a date the holiday only runs via the easter egg and ?holiday=birthday.
 *
 * Консоль / Console: ftBirthday.on() · off() · event('cake') · events() · logo('cake') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftBirthday) return;
  var K = window.siteHolidayKit;
  var ORANGE = '#ff4f12';
  var CONF = ['#ff4f12', '#ffd23f', '#3f9d5a', '#3f6fd8', '#ff5fa2', '#9b5bd6', '#2ad1c9', '#ffffff'];
  var BP = { O: ORANGE, o: '#c43a0a', Y: '#ffd23f', y: '#c9a014', W: '#ffffff', w: '#f6e7c8', P: '#ff9ab0', p: '#d96a85', B: '#3f6fd8', b: '#26489a', G: '#3f9d5a', g: '#2a6f40',
    R: '#e8402a', r: '#a8261a', D: '#8a5a36', d: '#5e3a20', K: '#1a1a1a', V: '#9b5bd6', C: '#7a4a26', c: '#f2d9b0' };

  /* ---------- слой эффектов: конфетти и шары · effects: confetti and balloons ---------- */
  var conf = [], balloons = [], confImgs = null, S = {};
  function confetti() {
    if (confImgs) return confImgs;
    confImgs = CONF.map(function (c) { var e = document.createElement('canvas'); e.width = 6; e.height = 3; var x = e.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 6, 3); return e; });
    return confImgs;
  }
  function balloonImg(f, c) { return S['b' + c] || (S['b' + c] = f.sprite(['.XXX.', 'XWXXX', 'XXXXX', 'XXXXX', '.XXX.', '..X..'], { X: c, W: '#ffffff' }, 3)); }
  function popper(f, x, y, n) { f.burst(x, y, { n: n || 30, imgs: confetti(), min: 2, max: 6.5, lift: 2.5, g: 0.1, life: 55, spin: true }); }
  var fx = {
    on: function () { conf = []; balloons = []; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i, im = confetti();
      f.shift(conf, 1, true); f.shift(balloons);
      var want = f.reduced ? 10 : Math.round(40 * Math.min(1.4, (f.W * f.H) / (1440 * 900))), fill = !conf.length;
      while (conf.length < want) conf.push({ x: f.rr(0, f.W), y: fill ? f.rr(0, f.H) : -10, vy: f.rr(0.6, 1.4), ph: f.rr(0, 6), k: Math.random() * CONF.length | 0 });
      for (i = 0; i < conf.length; i++) {
        var c = conf[i]; c.ph += 0.08 * dt; c.y += c.vy * dt; c.x += Math.sin(c.ph * 0.5) * 0.6 * dt;
        if (c.y > f.H + 10) { c.y = -10; c.x = f.rr(0, f.W); }
        ctx.save(); ctx.globalAlpha = 0.75; ctx.translate(c.x, c.y); ctx.rotate(c.ph); ctx.scale(1, Math.cos(c.ph * 1.3)); ctx.drawImage(im[c.k], -3, -1.5); ctx.restore();
      }
      if (!f.reduced && Math.random() < 0.006 && balloons.length < 6) balloons.push({ x: f.rr(20, f.W - 20), y: f.H + 30, ph: f.rr(0, 6), c: f.pick(['#ff4f12', '#ffd23f', '#3f6fd8', '#ff5fa2', '#3f9d5a', '#9b5bd6']) });
      for (i = balloons.length - 1; i >= 0; i--) {
        var b = balloons[i]; b.ph += 0.02 * dt; b.y -= 0.9 * dt; b.x += Math.sin(b.ph) * 0.4 * dt;
        if (b.y < -60) { balloons.splice(i, 1); continue; }
        var bi = balloonImg(f, b.c);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x, b.y + bi.height); ctx.quadraticCurveTo(b.x + Math.sin(b.ph * 2) * 6, b.y + bi.height + 14, b.x, b.y + bi.height + 26); ctx.stroke();
        ctx.drawImage(bi, Math.round(b.x - bi.width / 2), Math.round(b.y));
      }
    },
    click: function (f, x, y) {
      for (var i = balloons.length - 1; i >= 0; i--) { var b = balloons[i]; if (Math.abs(b.x - x) < 12 && y > b.y - 4 && y < b.y + 22) { balloons.splice(i, 1); popper(f, b.x, b.y + 8, 16); return; } }
      popper(f, x, y, f.reduced ? 12 : 30);
    },
    state: function () { return { confetti: conf.length, balloons: balloons.length }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, BP)); }
  var I = {
    gift: function (a, c) { return spr(a, 'gift' + c, ['..Y.Y..', '...Y...', 'XXXYXXX', 'XXXYXXX', 'XXXYXXX'].map(function (r) { return r.replace(/X/g, c); })); },
    balloons: function (a) { return spr(a, 'bals', ['.OO.YY.', 'OOOYYYY', '.OOBBY.', '..BBBB.', '...BB..', '...K...', '..K.K..', '...K...']); },
    popper: function (a) { return spr(a, 'popper', ['...YY', '..OO.', '.OO..', 'OO...']); },
    stick: function (a) { return spr(a, 'stick', ['...D', '..D.', '.D..', 'D...']); },
    pinata: function (a) { return spr(a, 'pinata', ['....Y....', '...YOY...', '..YOOOY..', 'YYOPOPOYY', '.YOOOOOY.', '..YOPOY..', '.YOY.YOY.', 'YY.....YY']); },
    slice: function (a) { return spr(a, 'slice', ['..PP', '.www', 'CCCC', 'wwww', 'CCCC']); }
  };
  function drawCake(ctx, x, fy, lit, t) {
    // стол · table
    ctx.fillStyle = '#5e3a20'; ctx.fillRect(Math.round(x - 26), fy - 24, 52, 4); ctx.fillRect(Math.round(x - 22), fy - 20, 3, 20); ctx.fillRect(Math.round(x + 19), fy - 20, 3, 20);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - 28), fy - 26, 56, 3);
    // торт · cake
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(Math.round(x - 16), fy - 40, 32, 14);
    ctx.fillStyle = '#ff9ab0'; ctx.fillRect(Math.round(x - 16), fy - 42, 32, 4);
    for (var i = 0; i < 8; i++) { ctx.fillRect(Math.round(x - 16 + i * 4), fy - 38, 2, 2 + (i % 2) * 2); }
    ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - 16), fy - 32, 32, 2);
    for (i = 0; i < 5; i++) {
      var cx = Math.round(x - 12 + i * 6);
      ctx.fillStyle = ['#3f6fd8', '#ffd23f', '#ff4f12', '#3f9d5a', '#9b5bd6'][i]; ctx.fillRect(cx, fy - 50, 2, 8);
      if (lit) { ctx.fillStyle = Math.floor(t * 12 + i) % 2 ? '#ffd23f' : '#ff8a2a'; ctx.fillRect(cx, fy - 54, 2, 3); ctx.globalAlpha = 0.35; ctx.drawImage(K.glow('#ffb03a'), cx - 8, fy - 61, 18, 18); ctx.globalAlpha = 1; }
    }
  }
  function party(a, over) { var o = { hat: 'party' }; for (var k in over || {}) o[k] = over[k]; return o; }
  var KING = { hat: 'crown', a: '#e8402a', t: ['#ff4f12', '#c43a0a'] };

  var EVENTS = {
    cake: { title: 'Задуть свечи', run: function (a) {
      var W = a.W(), cake = a.cake, x = cake ? cake.x : W * 0.5, sung = false, blown = false, guests = [];
      if (cake) cake.lit = true;
      var king = a.folk(-20, KING, 1.1);
      king.q = [{ k: 'run', x: x - 30 }, { k: 'face', x: x }, { k: 'until', f: function () { return sung; } }, { k: 'pose', p: 'up', n: 20 },
        { k: 'do', f: function () { blown = true; if (cake) cake.lit = false; a.burst(x, -56, { n: 10, colors: ['#bfc5cc', '#e6edf5'], up: true, min: 0.3, max: 1, g: -0.01, life: 50 }); a.burst(x, -60, { n: 40, colors: CONF, up: true, min: 2, max: 5, g: 0.06 }); } },
        { k: 'say', icon: 'heart', n: 80 }, { k: 'dance', n: 140 }, { k: 'leave', dir: -1, bounce: 2 }];
      for (var i = 0; i < 3; i++) (function (i) {
        var g = a.folk(W + 20 + i * 24, party());
        guests.push(g);
        g.q = [{ k: 'run', x: x + 30 + i * 22 }, { k: 'face', x: x }, { k: 'until', f: function () { return guests.every(function (q) { return q.q[0] && q.q[0].k === 'until'; }) && king.q[0] && king.q[0].k === 'until'; } },
          { k: 'say', icon: 'note', n: 70 }, { k: 'hop', n: 70, amp: 2 }, { k: 'say', icon: 'note', n: 70 }, { k: 'hop', n: 70, amp: 2 },
          { k: 'do', f: function () { if (i === 2) sung = true; } }, { k: 'until', f: function () { return blown; } }, { k: 'up', n: 40, jump: true }, { k: 'dance', n: 100 }, { k: 'leave', dir: 1, bounce: 2 }];
      })(i);
    } },
    gifts: { title: 'Подарки', run: function (a) {
      var W = a.W(), m = W * a.rr(0.25, 0.4), pile = [], cols = ['B', 'G', 'V', 'R'];
      var king = a.folk(-20, KING, 1);
      king.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'until', f: function () { return pile.length >= cols.length; } }, { k: 'up', n: 60, jump: true }, { k: 'say', icon: 'heart', n: 90 },
        { k: 'dance', n: 100 }, { k: 'do', f: function () { pileProp.gone = true; a.burst(m + 26, -16, { n: 30, colors: CONF, up: true }); } }, { k: 'leave', dir: -1, bounce: 2 }];
      var pileProp = a.prop({ x: m + 26, draw: function (ctx, p, fy) {
        pile.forEach(function (c, j) { var im = I.gift(a, c)[0]; ctx.drawImage(im, Math.round(p.x - im.width / 2 + (j % 2 ? 6 : -6) * (j > 1 ? 0 : 1)), Math.round(fy - im.height * (1 + (j >> 1)) + (j >> 1) * 2 - (j > 1 ? 0 : 0))); });
      } });
      cols.forEach(function (c, i) {
        var g = a.folk(W + 20 + i * 30, party(), 1.3);
        g.item = I.gift(a, c);
        g.q = [{ k: 'wait', n: i * 30 }, { k: 'run', x: m + 40 }, { k: 'pose', p: 'kneel', n: 15 }, { k: 'do', f: function () { g.item = null; pile.push(c); } }, { k: 'say', icon: 'heart', n: 40 }, { k: 'leave', dir: 1 }];
      });
    } },
    balloons: { title: 'Шарики', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), m = W * a.rr(0.35, 0.65);
      var g = a.folk(dir > 0 ? -20 : W + 20, party(), 1.1), friend = a.folk(dir > 0 ? W + 20 : -20, party());
      g.item = I.balloons(a);
      g.q = [{ k: 'run', x: m }, { k: 'until', f: function (gg) { gg.pose = 'up'; gg.lift = Math.min(70, (gg.lift || 0) + 0.35); gg.hop = gg.lift; return gg.lift >= 70; } },
        { k: 'say', icon: 'bang', n: 50 }, { k: 'until', f: function (gg) { gg.pose = 'up'; gg.hop = gg.lift; return friend.grab; } },
        { k: 'until', f: function (gg) { gg.pose = 'up'; gg.lift = Math.max(0, gg.lift - 1.2); gg.hop = gg.lift; return gg.lift <= 0; } },
        { k: 'do', f: function () { g.item = null; a.prop({ x: m, y: -30, sky: true, front: true, step: function (p, dt) { p.y -= 1.2 * dt; if (a.floor() + p.y < -60) p.gone = true; }, draw: function (ctx, p, fy) { var im = I.balloons(a)[0]; ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y)); } }); } },
        { k: 'say', icon: 'ha', n: 70 }, { k: 'dance', n: 60 }, { k: 'leave', dir: dir }];
      friend.q = [{ k: 'until', f: function () { return g.lift >= 70; } }, { k: 'run', x: m + dir * 12, sp: 2.2 }, { k: 'say', icon: 'bang', n: 40 }, { k: 'pose', p: 'up', n: 20 }, { k: 'do', f: function () { friend.grab = true; } },
        { k: 'until', f: function () { return !g.item; } }, { k: 'say', icon: 'ha', n: 60 }, { k: 'leave', dir: -dir }];
    } },
    conga: { title: 'Паровозик', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), line = [];
      for (var i = 0; i < 5; i++) {
        var g = a.folk(dir > 0 ? -20 - i * 18 : W + 20 + i * 18, i ? party() : KING, 1);
        line.push(g);
        g.q = i ? [{ k: 'follow', who: line[i - 1], gap: 18, bounce: 2 }] : [{ k: 'run', x: W / 2, bounce: 2 }, { k: 'say', icon: 'note', n: 60 }, { k: 'dance', n: 80 }, { k: 'leave', dir: dir, bounce: 2 }];
      }
      a.prop({ step: function (p) { if (Math.random() < 0.04) a.burst(line[0].x, -40, { n: 1, img: 'note', up: true, g: -0.01, min: 0.3, max: 0.8 }); if (line.every(function (g) { return g.gone; })) p.gone = true; } });
    } },
    pinata: { title: 'Пиньята', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.6), hits = 0, broken = false;
      var pin = a.prop({ x: m, swing: 0, front: true,
        step: function (p, dt, t) { p.swing *= Math.pow(0.97, dt); p.ang = Math.sin(t * 2) * 0.1 + Math.sin(t * 8) * p.swing; },
        draw: function (ctx, p, fy) {
          if (broken) return;
          var top = fy - 110, len = 50, x = p.x + Math.sin(p.ang) * len, y = top + Math.cos(p.ang) * len;
          ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(x, y); ctx.stroke();
          var im = I.pinata(a)[0]; ctx.drawImage(im, Math.round(x - im.width / 2), Math.round(y));
        } });
      var g = a.folk(-20, party({ hat: 'bow', a: '#1a1a1a' }), 1);
      g.item = I.stick(a);
      var swing = function (miss) {
        return [{ k: 'pose', p: 'up', n: 20 }, { k: 'do', f: function () { if (miss) { a.say(g, 'q', 50); } else { hits++; pin.swing = 0.4; a.burst(m, -70, { n: 6, colors: CONF }); } } }, { k: 'wait', n: 50 }];
      };
      g.q = [{ k: 'run', x: m - 14 }, { k: 'face', x: m }].concat(swing(true), swing(false), swing(true), swing(false),
        [{ k: 'pose', p: 'up', n: 20 }, { k: 'do', f: function () { broken = true; a.burst(m, -70, { n: 16, img: 'candy', up: true, g: 0.12, min: 1.5, max: 3.5, life: 70 }); a.burst(m, -70, { n: 30, colors: CONF, min: 2, max: 5 }); } },
          { k: 'up', n: 40, jump: true }, { k: 'say', icon: 'star', n: 70 }, { k: 'leave', dir: -1 }]);
      for (var i = 0; i < 2; i++) (function (i) {
        var k = a.folk(W + 20 + i * 30, party());
        k.q = [{ k: 'run', x: m + 40 + i * 24 }, { k: 'face', x: m }, { k: 'until', f: function () { return broken; } }, { k: 'run', x: m + 6 + i * 12, sp: 2 }, { k: 'pose', p: 'kneel', n: 50 }, { k: 'say', icon: 'candy', n: 60 }, { k: 'up', n: 30, jump: true }, { k: 'leave', dir: 1 }];
      })(i);
      a.prop({ step: function (p) { if (g.gone) { pin.gone = true; p.gone = true; } } });
    } },
    popper: { title: 'Хлопушка', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.7), popped = false;
      var g = a.folk(-20, party(), 1.2);
      g.item = I.popper(a);
      var crowd = [a.folk(W + 20, party()), a.folk(W + 50, party())];
      g.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'until', f: function () { return crowd.every(function (c) { return c.q[0] && c.q[0].k === 'until'; }); } }, { k: 'pose', p: 'up', n: 15 },
        { k: 'do', f: function () { popped = true; g.item = null; a.burst(m + 10, -40, { n: 50, colors: CONF, angle: -Math.PI / 3, min: 2, max: 6, g: 0.06 }); } }, { k: 'say', icon: 'ha', n: 60 }, { k: 'dance', n: 100 }, { k: 'leave', dir: -1 }];
      crowd.forEach(function (c, i) {
        c.q = [{ k: 'run', x: m + 50 + i * 24 }, { k: 'face', x: m }, { k: 'until', f: function () { return popped; } }, { k: 'say', icon: 'bang', n: 40 }, { k: 'up', n: 30, jump: true }, { k: 'say', icon: 'star', n: 50 }, { k: 'dance', n: 80 }, { k: 'leave', dir: 1 }];
      });
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#24102a 55%,#2e1436 100%)',
    floor: ['#3a1a40', ORANGE],
    pokeColors: CONF,
    look: { hat: ['party', 'party', 'party', 'crown', 'pointy'], hatColor: [['#ff4f12', '#c43a0a'], ['#3f6fd8', '#26489a'], ['#3f9d5a', '#2a6f40'], ['#9b5bd6', '#6a3a9a'], ['#ff5fa2', '#d96a85']],
      accent: ['#ffd23f', '#ffffff', '#2ad1c9'] },
    // флажки и торт на столе · bunting and a cake on a table
    decor: function (a) {
      var W = a.W();
      a.cake = a.prop({ x: Math.round(W * 0.72), lit: true,
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 20 && ly > -56 && ly < -20; },
        click: function (p) { p.lit = !p.lit; if (!p.lit) a.burst(p.x, -56, { n: 10, colors: ['#bfc5cc', '#e6edf5'], up: true, min: 0.3, max: 1, g: -0.01, life: 50 }); else a.burst(p.x, -56, { n: 8, colors: ['#ffd23f', '#ff8a2a'], up: true }); },
        draw: function (ctx, p, fy, t) { drawCake(ctx, p.x, fy, p.lit, t); } });
      a.prop({ x: 0, draw: function (ctx, p, fy) {
        var x1 = Math.max(80, W * 0.06), x2 = W - Math.max(50, W * 0.04), top = fy - 100, n = Math.round((x2 - x1) / 22);
        ctx.fillStyle = '#5e3a20'; ctx.fillRect(x1 - 2, top, 3, 100); ctx.fillRect(x2 - 1, top, 3, 100);
        for (var i = 0; i < n; i++) {
          var u = (i + 0.5) / n, x = x1 + (x2 - x1) * u, y = top + Math.sin(u * Math.PI) * 18;
          ctx.fillStyle = CONF[i % 6];
          ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 10); ctx.fill();
        }
      } });
    },
    events: EVENTS
  };

  K.define({
    id: 'birthday', global: 'ftBirthday', version: '1.0.0',
    button: { text: '✱', color: ORANGE, bg: 'rgba(36,16,42,.88)', border: 'rgba(255,79,18,.35)', title: 'День рождения FolloTeam: вкл / выкл · FolloTeam’s birthday on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" shape-rendering="crispEdges"><path fill="#ffd23f" d="M2 0h1v1H2zM4 0h1v1H4zM6 0h1v1H6z"/><path fill="#3f6fd8" d="M2 1h1v2H2zM4 1h1v2H4zM6 1h1v2H6z"/><path fill="#ff9ab0" d="M1 3h7v2H1z"/><path fill="#7a4a26" d="M1 5h7v3H1z"/><path fill="#fff" d="M1 6h7v1H1zM0 8h9v1H0z"/></svg>',
    logos: ['cake', 'balloons'],
    fx: fx,
    scene: THEME
  });
})();
