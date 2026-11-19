/*!
 * site-holidays · holidays/moon.js 1.0.0
 * Международный день Луны, 20 июля / International Moon Day — FolloTeam · https://folloteam.ru
 *
 * RU  Над страницей висит Земля, мерцают звёзды; клик поднимает облачко лунной пыли, которое
 *     медленно оседает. Внизу — лунный грунт с кратерами и гномики в скафандрах: посадка модуля
 *     и флаг >>FT_ (флаг остаётся), прыжки при низкой гравитации, луноход, гольф на Луне, фото
 *     Земли. Кратеры пылят по клику.
 *
 * EN  Earth hangs over the page and stars twinkle; a click raises a puff of moon dust that settles
 *     slowly. At the bottom: lunar soil with craters and gnomes in spacesuits — a module landing and
 *     a >>FT_ flag (the flag stays), low-gravity hops, a moon rover, golf on the Moon, an Earth photo.
 *     Craters puff dust when clicked.
 *
 * Консоль / Console: ftMoon.on() · off() · event('landing') · events() · logo('crescent') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftMoon) return;
  var K = window.siteHolidayKit;
  var MP = { W: '#f4f7fb', w: '#c3cedc', s: '#bfc5cc', S: '#8f969e', d: '#5a5f68', K: '#1a1a1a', Y: '#ffd23f', y: '#c9a014', O: '#ff4f12', o: '#c43a0a',
    B: '#3f6fd8', b: '#26489a', G: '#5cc96b', g: '#2a6f40', C: '#bfe6ff', R: '#e8402a', E: '#4a8fe8', e: '#2f6fc8' };
  var ASTRO = { hat: 'helmet', t: ['#f4f7fb', '#c3cedc'] };
  var EARTH = ['....EEEE....', '..EEGGEEEE..', '.EEGGGGEEEE.', '.EGGGGEEGGE.', 'EEEGGEEEGGGE', 'EEEEEEEGGGGE', 'EEGGEEEEGGEE', 'EGGGGEEEEEEE', '.EGGGEEEGGE.', '.EEEEEEGGEE.', '..EEEEEEEE..', '....EEEE....'];

  /* ---------- слой эффектов · effects layer ---------- */
  var S = {}, stars = [], earth = null;
  function sp(f, name, rows, p) { return S[name] || (S[name] = f.sprite(rows, MP, p || 3)); }
  var fx = {
    on: function (f) { stars = []; earth = { x: f.W * 0.82, y: f.H * 0.16 }; },
    resize: function (f) { if (earth) earth.x = f.W * 0.82; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i;
      f.shift(stars, function (s) { return s.z; }, true);
      if (earth) earth.y -= f.dsy * 0.1;
      var want = f.reduced ? 30 : Math.round(70 * Math.min(1.4, (f.W * f.H) / (1440 * 900)));
      while (stars.length < want) stars.push({ x: f.rr(0, f.W), y: f.rr(0, f.H), z: f.rr(0.1, 0.5), ph: f.rr(0, 6) });
      for (i = 0; i < stars.length; i++) { var s = stars[i]; s.ph += 0.03 * dt; ctx.globalAlpha = 0.2 + 0.3 * (0.5 + 0.5 * Math.sin(s.ph)); ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1); }
      ctx.globalAlpha = 1;
      if (earth && earth.y > -60) {
        var im = sp(f, 'earth', EARTH, 4);
        ctx.globalAlpha = 0.5; ctx.drawImage(f.glow('#4a8fe8'), earth.x - 50, earth.y - 50 + im.height / 2, 100 + im.width, 100); ctx.globalAlpha = 0.9;
        ctx.drawImage(im, Math.round(earth.x), Math.round(earth.y));
        // ночная сторона · night side
        ctx.globalAlpha = 0.45; ctx.fillStyle = '#0a1020'; ctx.fillRect(Math.round(earth.x + im.width * 0.62), Math.round(earth.y), Math.round(im.width * 0.38), im.height); ctx.globalAlpha = 1;
      }
    },
    click: function (f, x, y) { f.burst(x, y, { n: f.reduced ? 8 : 20, colors: ['#c3cedc', '#bfc5cc', '#8f969e'], min: 0.5, max: 2, lift: 0.6, g: 0.012, life: 70 }); },
    state: function () { return { stars: stars.length }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, MP)); }
  var I = {
    module: function (a) { return spr(a, 'lm', ['....wwwww....', '...wsssssw...', '...wsCCssw...', '..wwssssssww.', '..YYYYYYYYYY.', '.YyYYyyYYyYY.', '..YYYYYYYYY..', '.d.d.....d.d.', 'd...d...d...d', 'd...........d']); },
    rover: function (a) { return spr(a, 'rover', ['.......S.......', '......sSs......', 'wwwwwwwwwwwwww.', 'YYYYYYYYYYYYYY.', '.SSS......SSS..', 'SdSdS....SdSdS.', '.SSS......SSS..']); },
    club: function (a) { return spr(a, 'club', ['s...', '.s..', '..s.', '...SS']); },
    camera: function (a) { return spr(a, 'cam', ['.KK..', 'KKKKK', 'KCKKK', 'KKKKK']); },
    flag: function (a) { return spr(a, 'flag', ['sOOOOOOO', 'sOWOWOOO', 'sOOWOOOO', 'sOWOWOWW', 'sOOOOOOO', 's.......', 's.......', 's.......', 's.......', 's.......', 's.......', 's.......']); }
  };
  function dust(a, x, n) { a.burst(x, -2, { n: n || 6, colors: ['#bfc5cc', '#8f969e'], up: true, min: 0.3, max: 1.2, g: 0.012, life: 60 }); }

  var EVENTS = {
    landing: { title: 'Посадка', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.6), st = { y: -260, landed: false, up: 0 }, crew = [];
      var lm = a.prop({ x: m, front: false, sky: true,
        step: function (p, dt) {
          if (!st.landed) { st.y += Math.max(0.5, -st.y * 0.02) * dt; a.burst(m, st.y + 2, { n: 1, colors: ['#ffd23f', '#ffffff'], angle: Math.PI / 2, min: 1, max: 2, g: 0, life: 12 }); if (st.y >= 0) { st.y = 0; st.landed = true; dust(a, m, 24); } }
          if (st.up) { st.up += dt; st.y -= st.up * 0.02 * dt; if (a.floor() + st.y < -100) p.gone = true; }
        },
        draw: function (ctx, p, fy) { var im = I.module(a)[0]; ctx.drawImage(im, Math.round(m - im.width / 2), Math.round(fy + st.y - im.height)); } });
      var flagUp = false;
      for (var i = 0; i < 2; i++) (function (i) {
        var g = a.folk(m, ASTRO, 0.6);
        g.hidden = true;
        crew.push(g);
        g.q = [{ k: 'until', f: function () { return st.landed; } }, { k: 'wait', n: 40 + i * 50 }, { k: 'do', f: function () { g.hidden = false; } },
          { k: 'run', x: m + (i ? 46 : -46), bounce: 8 }];
        if (i === 0) g.q.push({ k: 'pose', p: 'kneel', n: 40 }, { k: 'do', f: function () { flagUp = true; a.keep(a.prop({ x: m - 60, img: I.flag(a) }), 1); dust(a, m - 60, 8); } });
        else g.q.push({ k: 'until', f: function () { return flagUp; } });
        g.q.push({ k: 'face', x: m - 60 }, { k: 'up', n: 60 }, { k: 'say', icon: 'star', n: 60 }, { k: 'hop', n: 80, amp: 10, freq: 0.06 },
          { k: 'run', x: m, bounce: 8 }, { k: 'do', f: function () { g.hidden = true; g.inside = true; } },
          { k: 'until', f: function () { return crew.every(function (c) { return c.inside; }); } }, { k: 'do', f: function () { if (i === 1) st.up = 1; } }, { k: 'gone' });
      })(i);
    } },
    hops: { title: 'Прыжки', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]);
      for (var i = 0; i < 3; i++) {
        var g = a.folk(dir > 0 ? -20 - i * 40 : W + 20 + i * 40, ASTRO, a.rr(0.8, 1.1));
        g.q = [{ k: 'run', x: W * (0.3 + i * 0.15), bounce: 12 }, { k: 'say', icon: i === 1 ? 'ha' : 'star', n: 60 }, { k: 'hop', n: 90, amp: 14, freq: 0.05 }, { k: 'leave', dir: dir, bounce: 12 }];
      }
      a.prop({ step: function (p) { var l = a.folkList(); l.forEach(function (g) { if (g.hop > 0 && g.hop < 1.5 && Math.random() < 0.3) dust(a, g.x, 2); }); if (l.every(function (g) { return g.gone; })) p.gone = true; } });
    } },
    rover: { title: 'Луноход', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), look = a.look(ASTRO);
      a.prop({ x: dir > 0 ? -50 : W + 50, front: true, honk: 0,
        step: function (p, dt, t) {
          p.x += dir * 1.3 * dt; p.bump = Math.abs(Math.sin(p.x * 0.05)) * 3 + (p.honk ? Math.sin(p.honk * 0.4) * 4 : 0);
          p.honk = Math.max(0, p.honk - dt);
          if (Math.random() < 0.3) a.burst(p.x - dir * 18, -3, { n: 1, colors: ['#bfc5cc', '#8f969e'], up: true, min: 0.3, max: 0.8, g: 0.01, life: 40 });
          if ((dir > 0 && p.x > W + 60) || (dir < 0 && p.x < -60)) p.gone = true;
        },
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 18 && ly > -40 && ly < 0; },
        click: function (p) { p.honk = 30; dust(a, p.x, 10); },
        draw: function (ctx, p, fy) {
          var im = I.rover(a)[dir > 0 ? 0 : 1], y = fy - im.height - p.bump;
          a.drawGnome(ctx, look, 'sit', p.x - dir * 2, y + 6, dir < 0);
          ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(y));
        } });
    } },
    golf: { title: 'Гольф на Луне', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), m = W * (dir > 0 ? 0.25 : 0.75), hit = false;
      var g = a.folk(dir > 0 ? -20 : W + 20, ASTRO, 0.8);
      g.item = I.club(a);
      g.q = [{ k: 'run', x: m, bounce: 6 }, { k: 'face', x: dir > 0 ? W : 0 }, { k: 'wait', n: 40 }, { k: 'pose', p: 'up', n: 20 },
        { k: 'do', f: function () {
          hit = true;
          a.prop({ x: m + dir * 10, y: -2, vx: dir * 2.2, vy: -2.4, front: true, sky: true,
            step: function (p, dt) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.008 * dt; if (p.x < -20 || p.x > W + 20 || p.y > 0) p.gone = true; },
            draw: function (ctx, p, fy) { ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(p.x - 1), Math.round(fy + p.y - 1), 3, 3); } });
          dust(a, m + dir * 10, 6);
        } }, { k: 'face', x: dir > 0 ? W : 0 }, { k: 'pose', p: 'up', n: 160 }, { k: 'say', icon: 'star', n: 80 }, { k: 'leave', dir: dir, bounce: 8 }];
    } },
    photo: { title: 'Фото Земли', run: function (a) {
      var W = a.W(), m = W * a.rr(0.4, 0.7), g = a.folk(-20, ASTRO, 0.8);
      g.item = I.camera(a);
      g.q = [{ k: 'run', x: m, bounce: 8 }, { k: 'face', x: W }, { k: 'pose', p: 'kneel', n: 50 },
        { k: 'do', f: function () { a.burst(m + 12, -16, { n: 14, colors: ['#ffffff', '#fff6c4'], min: 1, max: 3, g: 0, life: 12 }); } },
        { k: 'pose', p: 'kneel', n: 40 }, { k: 'say', icon: 'heart', n: 80 }, { k: 'up', n: 40 }, { k: 'leave', dir: 1, bounce: 8 }];
    } }
  };

  var CRATERS = [];
  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#14161c 55%,#1c1f26 100%)',
    floor: ['#6a6e78', '#a8adb8'],
    floorH: 28,
    pokeColors: ['#ffffff', '#bfc5cc', '#ffd23f', '#4a8fe8'],
    look: { hat: ['helmet'], tunic: [['#f4f7fb', '#c3cedc']], belt: ['#ff4f12', '#3f6fd8', '#ffd23f'] },
    // кратеры на грунте · craters in the soil
    drawGround: function (ctx, fy, W) {
      if (!CRATERS.length || CRATERS.w !== W) { CRATERS.length = 0; CRATERS.w = W; for (var x = 30; x < W; x += 70 + (x * 13 % 60)) CRATERS.push([x, 6 + (x * 7 % 10)]); }
      CRATERS.forEach(function (c) {
        ctx.fillStyle = '#4a4e58'; ctx.fillRect(Math.round(c[0] - c[1]), Math.round(fy + 8), c[1] * 2, 4);
        ctx.fillStyle = '#c3c8d2'; ctx.fillRect(Math.round(c[0] - c[1]), Math.round(fy + 7), c[1] * 2, 1);
      });
    },
    decor: function (a) {
      var W = a.W();
      [W * 0.12, W * 0.88].forEach(function (x) {
        a.prop({ x: Math.max(90, x), hit: function (p, x2, ly) { return Math.abs(x2 - p.x) < 14 && ly > -12 && ly < 8; },
          click: function (p) { dust(a, p.x, 16); },
          draw: function (ctx, p, fy) { ctx.fillStyle = '#8f969e'; ctx.fillRect(Math.round(p.x - 8), fy - 6, 16, 6); ctx.fillStyle = '#bfc5cc'; ctx.fillRect(Math.round(p.x - 6), fy - 8, 10, 2); } });
      });
    },
    events: EVENTS
  };

  K.define({
    id: 'moon', global: 'ftMoon', version: '1.0.0',
    button: { text: '☾', color: '#d8dce6', bg: 'rgba(20,22,28,.88)', border: 'rgba(216,220,230,.3)', font: '20px/1 system-ui,sans-serif', title: 'День Луны: вкл / выкл · International Moon Day on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><path fill="#d8dce6" d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1z"/><path fill="#8f969e" d="M2 2h2v2H2zM5 4h1v1H5zM3 5h1v1H3z"/></svg>',
    logos: ['crescent', 'flag'],
    fx: fx,
    scene: THEME
  });
})();
