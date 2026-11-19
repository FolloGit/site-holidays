/*!
 * site-holidays · holidays/programmer.js 1.0.0
 * День программиста (256-й день года) / Programmer's Day (day 256) — FolloTeam · https://folloteam.ru
 *
 * RU  По странице бегут бледные колонки нулей и единиц, по экрану ползают баги — клик по багу
 *     его исправляет, клик мимо рассыпает биты. Внизу гномики в наушниках и худи: охота на баг,
 *     кофе для засыпающих программистов, релиз в пятницу (сервер дымится, тушат огнетушителем),
 *     отладка с резиновой уточкой, робот-гномик. Серверная стойка мигает и пищит по клику.
 *
 * EN  Faint columns of zeros and ones run down the page, bugs crawl over the screen — clicking a
 *     bug fixes it, clicking elsewhere scatters bits. Gnomes in headphones and hoodies at the bottom:
 *     a bug hunt, coffee for sleepy coders, a Friday deploy (the server smokes, an extinguisher puts it
 *     out), rubber-duck debugging, a robot gnome. A server rack blinks and beeps when clicked.
 *
 * Консоль / Console: ftProgrammer.on() · off() · event('deploy') · events() · logo('code') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftProgrammer) return;
  var K = window.siteHolidayKit;
  var GRN = '#3ddc84', DGRN = '#1f8a50';
  var PP = { G: GRN, g: DGRN, K: '#1a1a1a', k: '#2a2f3a', s: '#8f969e', S: '#5a6070', W: '#ffffff', w: '#c3cedc', R: '#e8402a', r: '#a8261a', Y: '#ffd23f', y: '#c9a014',
    B: '#3f6fd8', b: '#26489a', D: '#6a4430', d: '#3a2416', O: '#ff8a2a', C: '#bfe6ff', c: '#6a4430' };
  var BUG = [['.K...K.', '..KRK..', 'K.RRR.K', '.KRKRK.', 'K.RRR.K', '..RRR..'], ['K.....K', '.KKRKK.', '..RRR..', 'KKRKRKK', '..RRR..', '.KRRRK.']];
  var BITS = [['.X.', 'XX.', '.X.', '.X.', 'XXX'], ['XXX', 'X.X', 'X.X', 'X.X', 'XXX']];

  /* ---------- слой эффектов: биты и баги · effects: bits and bugs ---------- */
  var S = {}, cols = [], bugs = [], nextBug = 0;
  function sp(f, name, rows, pal, p) { return S[name] || (S[name] = f.sprite(rows, pal || PP, p || 3)); }
  function bit(f, k) { return sp(f, 'bit' + k, BITS[k], { X: GRN }, 2); }
  var fx = {
    on: function () { cols = []; bugs = []; nextBug = 0; },
    resize: function () { cols = []; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i;
      var nCol = f.reduced ? 0 : Math.round(f.W / 70);
      while (cols.length < nCol) cols.push({ x: (cols.length + 0.5) * f.W / nCol, y: f.rr(-f.H, f.H), v: f.rr(0.6, 1.6), seed: Math.random() * 1000 | 0 });
      f.shift(cols, 0.5);
      for (i = 0; i < cols.length; i++) {
        var c = cols[i]; c.y += c.v * dt;
        if (c.y > f.H + 200) { c.y = f.rr(-300, -60); c.seed = Math.random() * 1000 | 0; }
        for (var j = 0; j < 12; j++) {
          var y = c.y - j * 14;
          if (y < -14 || y > f.H) continue;
          ctx.globalAlpha = (j === 0 ? 0.35 : 0.16) * (1 - j / 12);
          ctx.drawImage(bit(f, (c.seed + j * 7 + Math.floor(T * 2 + j)) % 2), Math.round(c.x), Math.round(y));
        }
      }
      ctx.globalAlpha = 1;
      if (!f.reduced && T > nextBug && bugs.length < 3) {
        nextBug = T + f.rr(4, 10);
        var fromL = Math.random() < 0.5;
        bugs.push({ x: fromL ? -20 : f.W + 20, y: f.rr(f.H * 0.2, f.H * 0.8), a: fromL ? 0 : Math.PI, ph: 0 });
      }
      f.shift(bugs);
      for (i = bugs.length - 1; i >= 0; i--) {
        var b = bugs[i];
        b.ph += dt; b.a += Math.sin(b.ph * 0.05) * 0.03 * dt; b.x += Math.cos(b.a) * 1.2 * dt; b.y += Math.sin(b.a) * 1.2 * dt;
        if (b.x < -40 || b.x > f.W + 40 || b.y < -40 || b.y > f.H + 40) { bugs.splice(i, 1); continue; }
        var im = sp(f, 'bug' + (Math.floor(b.ph / 6) % 2), BUG[Math.floor(b.ph / 6) % 2]);
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a + Math.PI / 2); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
      }
    },
    click: function (f, x, y) {
      for (var i = bugs.length - 1; i >= 0; i--) {
        if (Math.abs(bugs[i].x - x) < 18 && Math.abs(bugs[i].y - y) < 18) {
          var b = bugs.splice(i, 1)[0];
          f.burst(b.x, b.y, { n: 12, colors: [GRN, '#ffffff'], min: 1, max: 3 });
          f.burst(b.x, b.y, { n: 1, img: sp(f, 'ok', ['......X', '.....XX', 'X...XX.', 'XX.XX..', '.XXX...', '..X....'], { X: GRN }), min: 0.5, max: 1, lift: 1, g: -0.02, life: 50 });
          return;
        }
      }
      f.burst(x, y, { n: f.reduced ? 6 : 14, imgs: [bit(f, 0), bit(f, 1)], min: 1.5, max: 4, g: 0.1, life: 40 });
    },
    state: function () { return { cols: cols.length, bugs: bugs.length }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, PP)); }
  var I = {
    laptop: function (a) { return spr(a, 'laptop', ['.kkkkkkk', '.kGgGgGk', '.kgGgGgk', '.kkkkkkk', 'sssssssss']); },
    coffee: function (a) { return spr(a, 'coffee', ['.w.w.', 'WWWWW', 'WccWW', 'WWWW.']); },
    net: function (a) { return spr(a, 'net', ['.www.', 'w...w', 'w...w', '.www.', '..D..', '..D..', '..D..']); },
    bug: function (a, k) { return spr(a, 'bug' + k, BUG[k]); },
    duck: function (a) { return spr(a, 'duck', ['.YY..', 'YYKO.', 'YYYY.', 'YYYYY', '.yyy.']); },
    ext: function (a) { return spr(a, 'ext', ['.ss.', 'RRR.', 'RRR.', 'RRR.', 'RRR.']); },
    button: function (a) { return spr(a, 'btn', ['..RRRR..', '.RRRRRR.', 'SSSSSSSS', 'SKKKKKKS']); }
  };

  var EVENTS = {
    bughunt: { title: 'Охота на баг', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), caught = false;
      var bug = a.prop({ x: dir > 0 ? W * 0.3 : W * 0.7, y: 0, front: true, ph: 0,
        step: function (p, dt) {
          if (caught) { p.gone = true; return; }
          p.ph += dt; p.x += dir * (1.4 + Math.sin(p.ph * 0.07) * 1.2) * dt;
          if (p.x < -20 || p.x > W + 20) p.gone = true;
        },
        draw: function (ctx, p, fy) { var im = I.bug(a, Math.floor(p.ph / 5) % 2)[0]; ctx.save(); ctx.translate(p.x, fy - 6); ctx.rotate(dir * Math.PI / 2); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore(); } });
      var g = a.folk(dir > 0 ? -20 : W + 20, { hat: 'headphones' }, 1.5);
      g.item = I.net(a);
      g.q = [{ k: 'say', icon: 'bang', n: 50 }, { k: 'run', x: function () { return bug.x - dir * 10; }, sp: 2.2 },
        { k: 'do', f: function () { if (!bug.gone) { caught = true; a.burst(g.x + dir * 8, -12, { n: 12, colors: [GRN, '#fff'] }); } } },
        { k: 'pose', p: 'up', n: 30 }, { k: 'say', icon: 'ok', n: 80 }, { k: 'dance', n: 60 }, { k: 'leave', dir: -dir }];
    } },
    coffee: { title: 'Кофе', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.55), coders = [], served = 0;
      for (var i = 0; i < 2; i++) (function (i) {
        var x = m + i * 60, c = a.folk(i ? W + 20 : -20, { hat: i ? 'headphones' : 'hood', h: ['#2a2f3a', '#1a1a1a'] });
        coders.push(c);
        var lap = null;
        c.q = [{ k: 'run', x: x }, { k: 'face', x: x + 20 }, { k: 'do', f: function () { lap = a.prop({ x: x + 14, img: I.laptop(a), step: function (p) { if (c.gone) p.gone = true; if (c.typing && Math.random() < 0.15) a.burst(p.x, -12, { n: 1, colors: [GRN], up: true, min: 0.3, max: 0.8, g: -0.01, life: 25 }); } }); c.typing = true; } },
          { k: 'until', f: function (g) { g.pose = 'sit'; if (!c.sleepy && Math.random() < 0.004) { c.sleepy = true; c.typing = false; a.say(c, 'zzz', 400); } return c.served; } },
          { k: 'do', f: function () { c.typing = true; c.sleepy = false; a.say(c, 'heart', 60); } }, { k: 'up', n: 30, jump: true },
          { k: 'until', f: function (g) { g.pose = 'sit'; return served >= 2; } }, { k: 'pose', p: 'sit', n: 120 }, { k: 'say', icon: 'ok', n: 60 }, { k: 'leave', dir: i ? 1 : -1 }];
      })(i);
      var barista = a.folk(-40, { hat: 'cap', h: ['#6a4430', '#3a2416'] }, 1.5);
      barista.item = I.coffee(a);
      barista.q = [{ k: 'wait', n: 200 }];
      coders.forEach(function (c, i) {
        barista.q.push({ k: 'run', x: m + i * 60 - 14 }, { k: 'face', x: m + i * 60 }, { k: 'wait', n: 20 },
          { k: 'do', f: function () { c.served = true; served++; c.item = I.coffee(a); a.burst(c.x, -26, { n: 4, colors: ['#ffffff', '#c3cedc'], up: true, g: -0.01 }); } }, { k: 'wait', n: 20 });
      });
      barista.q.push({ k: 'do', f: function () { barista.item = null; } }, { k: 'say', icon: 'star', n: 50 }, { k: 'leave', dir: -1 });
    } },
    deploy: { title: 'Релиз в пятницу', run: function (a) {
      var W = a.W(), rack = a.rack, rx = rack ? rack.x : W * 0.8, fire = 0, out = false;
      var btn = a.prop({ x: rx - 120, img: I.button(a), step: function (p) { if (out && hero.gone && dev.gone) p.gone = true; } });
      var dev = a.folk(-20, { hat: 'hood', h: ['#3f6fd8', '#26489a'] }, 1.3);
      var hero = a.folk(W + 20, { hat: 'cap', h: ['#e8402a', '#a8261a'] }, 2.2);
      dev.q = [{ k: 'run', x: rx - 134 }, { k: 'face', x: W }, { k: 'say', icon: 'q', n: 40 }, { k: 'wait', n: 40 }, { k: 'pose', p: 'up', n: 12 },
        { k: 'do', f: function () { fire = 1; if (rack) rack.alarm = true; } }, { k: 'say', icon: 'bang', n: 80 }, { k: 'run', x: rx - 220, sp: 2.4, pose: 'up' },
        { k: 'face', x: rx }, { k: 'until', f: function () { return out; } }, { k: 'say', icon: 'ok', n: 60 }, { k: 'dance', n: 60 }, { k: 'leave', dir: -1 }];
      hero.item = I.ext(a);
      hero.q = [{ k: 'until', f: function () { return fire > 40; } }, { k: 'run', x: rx + 30 }, { k: 'face', x: rx },
        { k: 'until', f: function () { a.burst(rx + 16, -26, { n: 3, colors: ['#ffffff', '#e6edf5'], angle: Math.PI, min: 1.5, max: 3, g: -0.005, life: 30 }); fire = Math.max(0, fire - 1.2); if (fire < 2) { out = true; if (rack) rack.alarm = false; } return out; } },
        { k: 'say', icon: 'ok', n: 60 }, { k: 'wait', n: 40 }, { k: 'leave', dir: 1 }];
      a.prop({ step: function (p, dt) {
        if (fire && !out) { fire = Math.min(fire + dt * 0.6, 200); a.burst(rx + a.rr(-6, 6), -50, { n: 2, colors: ['#ff8a2a', '#ffd23f', '#e8402a'], up: true, min: 0.5, max: 1.5, g: -0.02, life: 25 }); a.burst(rx, -60, { n: 1, colors: ['#5a6070', '#8f969e'], up: true, min: 0.3, max: 0.8, g: -0.01, life: 60 }); }
        if (btn.gone) p.gone = true;
      } });
    } },
    duck: { title: 'Резиновая уточка', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.6);
      var g = a.folk(-20, { hat: 'headphones' });
      var duck = null;
      g.q = [{ k: 'run', x: m }, { k: 'do', f: function () { duck = a.prop({ x: m + 18, img: I.duck(a) }); } }, { k: 'face', x: m + 18 },
        { k: 'pose', p: 'sit', n: 40 }, { k: 'say', icon: 'q', n: 60 }, { k: 'pose', p: 'sit', n: 70 }, { k: 'say', icon: 'note', n: 50 }, { k: 'pose', p: 'sit', n: 60 },
        { k: 'say', icon: 'bang', n: 50 }, { k: 'up', n: 40, jump: true }, { k: 'say', icon: 'ok', n: 60 },
        { k: 'do', f: function () { duck.gone = true; g.item = I.duck(a); } }, { k: 'dance', n: 60 }, { k: 'leave', dir: 1, bounce: 2 }];
    } },
    robot: { title: 'Робот', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), m = W * a.rr(0.35, 0.65);
      var bot = a.folk(dir > 0 ? -20 : W + 20, { costume: 'robot', t: ['#bfc5cc', '#8f969e'], a: GRN, y: '#e8402a' }, 0.9);
      var g = a.folk(dir > 0 ? W + 20 : -20, { hat: 'hood' });
      bot.q = [{ k: 'run', x: m }, { k: 'say', icon: 'note', n: 40 }, { k: 'until', f: function () { return Math.abs(g.x - (m + dir * 24)) < 1; } },
        { k: 'face', x: function () { return g.x; } }, { k: 'say', icon: 'heart', n: 60 }, { k: 'dance', n: 120 }, { k: 'leave', dir: dir, sp: 0.9 }];
      g.q = [{ k: 'run', x: m + dir * 24 }, { k: 'face', x: m }, { k: 'until', f: function () { return Math.abs(bot.x - m) < 1; } }, { k: 'say', icon: 'q', n: 50 }, { k: 'wait', n: 60 }, { k: 'dance', n: 120 }, { k: 'say', icon: 'ha', n: 60 }, { k: 'leave', dir: -dir }];
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#0b1a12 55%,#0e2016 100%)',
    floor: ['#0e1a14', GRN],
    pokeColors: [GRN, '#ffffff', '#3f6fd8', '#ffd23f'],
    look: { hat: ['headphones', 'hood', 'cap', 'beanie', 'pointy'], hatColor: [['#2a2f3a', '#1a1a1a'], [GRN, DGRN], ['#3f6fd8', '#26489a'], ['#6c6f7a', '#46484f']],
      tunic: [['#2a2f3a', '#1a1a1a'], ['#3f6fd8', '#26489a'], ['#6c6f7a', '#46484f'], [DGRN, '#14502e']], costume: { robot: 0.08 } },
    // дорожки платы на земле и серверная стойка · circuit traces on the ground and a server rack
    drawGround: function (ctx, fy, W) {
      ctx.globalAlpha = 0.35; ctx.fillStyle = GRN;
      for (var x = 20; x < W; x += 90) { ctx.fillRect(x, fy + 8, 40, 1); ctx.fillRect(x + 40, fy + 8, 1, 8); ctx.fillRect(x + 40, fy + 16, 30, 1); ctx.fillRect(x + 68, fy + 14, 4, 4); }
      ctx.globalAlpha = 1;
    },
    decor: function (a) {
      var W = a.W();
      a.rack = a.prop({ x: Math.round(W * 0.82), beep: 0, alarm: false,
        step: function (p, dt) { p.beep = Math.max(0, p.beep - dt); },
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 14 && ly > -56 && ly < 0; },
        click: function (p) { p.beep = 60; a.burst(p.x, -60, { n: 3, img: 'note', up: true, g: -0.01, min: 0.5, max: 1.2 }); },
        draw: function (ctx, p, fy, t) {
          ctx.fillStyle = '#1a1d24'; ctx.fillRect(p.x - 12, fy - 56, 24, 56);
          ctx.fillStyle = '#2a2f3a'; for (var y = 0; y < 6; y++) ctx.fillRect(p.x - 10, fy - 54 + y * 9, 20, 7);
          for (y = 0; y < 6; y++) for (var i = 0; i < 3; i++) {
            var on = (Math.sin(t * (3 + i) + y * 1.7 + i) > 0) || p.beep;
            ctx.fillStyle = p.alarm ? (Math.floor(t * 6) % 2 ? '#e8402a' : '#5a1010') : on ? (i === 2 ? '#ffd23f' : GRN) : '#1f3a2a';
            ctx.fillRect(p.x - 8 + i * 4, fy - 51 + y * 9, 2, 2);
          }
        } });
    },
    events: EVENTS
  };

  K.define({
    id: 'programmer', global: 'ftProgrammer', version: '1.0.0',
    button: { text: '</>', color: GRN, bg: 'rgba(11,26,18,.88)', border: 'rgba(61,220,132,.35)', font: '700 12px/1 ui-monospace,monospace', title: 'День программиста: вкл / выкл · Programmer’s Day on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 7" shape-rendering="crispEdges"><path fill="' + GRN + '" d="M2 1h1v1H2zM1 2h1v1H1zM0 3h1v1H0zM1 4h1v1H1zM2 5h1v1H2zM8 1h1v1H8zM9 2h1v1H9zM10 3h1v1h-1zM9 4h1v1H9zM8 5h1v1H8zM6 0h1v2H6zM5 2h1v3H5zM4 5h1v2H4z"/></svg>',
    logos: ['code', 'bug'],
    fx: fx,
    scene: THEME
  });
})();
