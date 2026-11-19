/*!
 * site-holidays · holidays/aprilfools.js 1.0.0
 * День смеха, 1 апреля / April Fools' Day — FolloTeam · https://folloteam.ru
 *
 * RU  По экрану проплывают резиновые уточки, клик — хлопушка с конфетти и уточкой. Внизу гномики
 *     разыгрывают друг друга: банановая кожура, торт в лицо, подушка-пердушка, бумажная рыбка на
 *     спине, жонглёр на моноцикле, подарок-обманка с боксёрской перчаткой. Коробка с сюрпризом
 *     на земле выстреливает клоуном по клику. Логотип — колпак шута или знак вверх ногами.
 *
 * EN  Rubber ducks float across the screen, a click pops confetti and a duck. Gnomes prank each other
 *     at the bottom: a banana peel, a pie in the face, a whoopee cushion, a paper fish on the back, a
 *     juggler on a unicycle, a fake gift with a boxing glove. A jack-in-the-box on the ground pops a
 *     clown when clicked. The logo gets a jester cap or turns upside down.
 *
 * Консоль / Console: ftAprilfools.on() · off() · event('banana') · events() · logo('flip') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftAprilfools) return;
  var K = window.siteHolidayKit;
  var CONF = ['#ff4f12', '#ffd23f', '#3f9d5a', '#3f6fd8', '#ff5fa2', '#9b5bd6', '#2ad1c9'];
  var AP = { Y: '#ffd23f', y: '#c9a014', O: '#ff8a2a', K: '#1a1a1a', W: '#ffffff', w: '#eef2f7', R: '#e8402a', r: '#a8261a', P: '#ff9ab0', p: '#d96a85',
    B: '#3f6fd8', b: '#26489a', G: '#3f9d5a', g: '#2a6f40', D: '#6a4430', d: '#3a2416', C: '#f6e7c8', c: '#d9b45b', N: '#8a5a36', s: '#bfc5cc', S: '#8f969e' };
  var DUCK = ['..YYY...', '.YYKYO..', '.YYYYOO.', 'YYYYYY..', 'YYYYYYYY', '.YYYYYY.', '..yyyy..'];

  /* ---------- слой эффектов: уточки и конфетти · effects: ducks and confetti ---------- */
  var S = {}, ducks = [];
  function sp(f, name, rows, p) { return S[name] || (S[name] = f.sprite(rows, AP, p || 3)); }
  var confImgs = null;
  function confetti(f) {
    if (confImgs) return confImgs;
    confImgs = CONF.map(function (c) { var e = document.createElement('canvas'); e.width = 6; e.height = 3; var x = e.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 6, 3); return e; });
    return confImgs;
  }
  function pop(f, x, y, n) { f.burst(x, y, { n: n || 24, imgs: confetti(f), min: 2, max: 6, lift: 2, g: 0.1, life: 50, spin: true }); }
  var fx = {
    on: function () { ducks = []; },
    frame: function (f, dt, T) {
      f.shift(ducks, 0.7, true);
      var want = f.reduced ? 1 : Math.max(2, Math.round(4 * f.W / 1440));
      while (ducks.length < want) ducks.push({ x: Math.random() < 0.5 ? -30 : f.W + 30, y: f.rr(40, f.H - 60), vx: 0, ph: f.rr(0, 6), a: f.rr(0.5, 0.85) });
      for (var i = ducks.length - 1; i >= 0; i--) {
        var d = ducks[i];
        if (!d.vx) d.vx = (d.x < 0 ? 1 : -1) * f.rr(0.4, 0.9);
        d.ph += 0.05 * dt; d.x += d.vx * dt;
        if (d.x < -50 || d.x > f.W + 50) { ducks.splice(i, 1); continue; }
        var im = sp(f, 'duck', DUCK, 3);
        f.ctx.save(); f.ctx.globalAlpha = d.a; f.ctx.translate(Math.round(d.x), Math.round(d.y + Math.sin(d.ph) * 6)); f.ctx.rotate(Math.sin(d.ph) * 0.15);
        if (d.vx < 0) f.ctx.scale(-1, 1);
        f.ctx.drawImage(im, -im.width / 2, -im.height / 2); f.ctx.restore();
      }
    },
    click: function (f, x, y) { pop(f, x, y, f.reduced ? 10 : 24); if (!f.reduced && Math.random() < 0.3) f.burst(x, y, { n: 1, img: sp(f, 'duck', DUCK, 3), min: 1, max: 2, lift: 3, g: 0.12, life: 60 }); },
    state: function () { return { ducks: ducks.length }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, AP)); }
  var I = {
    banana: function (a) { return spr(a, 'banana', ['Y.....Y', '.Y...Y.', '..YYY..']); },
    pie: function (a) { return spr(a, 'pie', ['.wWWWw.', 'cCCCCCc', '.ccccc.']); },
    pieFace: function (a) { return spr(a, 'pieFace', ['..wWw...', '.wWWWWw.', 'wWWWWWWw', '.WWWWWW.', '..W..W..']); },
    cushion: function (a) { return spr(a, 'cushion', ['..PPPPPP..', '.PPPPPPPP.', 'PPpPPPPpPP', '.PPPPPPPPp']); },
    fish: function (a) { return spr(a, 'fish', ['.BBBB..B', 'BWBBBBBB', 'BBBBBB.B', '.BBBB...']); },
    gift: function (a) { return spr(a, 'gift', ['..Y.Y..', '...Y...', 'GGGYGGG', 'GGGYGGG', 'GGGYGGG']); },
    glove: function (a) { return spr(a, 'glove', ['.RRRR.', 'RRRRRR', 'RRRRRr', 'RRRRR.', '.rrr..']); },
    ball: function (a, c) { return spr(a, 'ball' + c, ['.X.', 'XXX', '.X.'].map(function (r) { return r.replace(/X/g, c); })); },
    box: function (a) { return spr(a, 'box', ['RRRRRRRRR', 'RYYRRRYYR', 'RRRYYYRRR', 'RYYRRRYYR', 'RRRRRRRRR', 'RYYRRRYYR', 'RRRRRRRRR']); },
    clown: function (a) { return spr(a, 'clown', ['.O.O.O.', 'OOOOOOO', '.WWWWW.', '.WKWKW.', '.WWRWW.', '.WRRRW.', '..WWW..']); }
  };
  function laugh(g, n) { return [{ k: 'say', icon: 'ha', n: n || 80 }, { k: 'dance', n: n || 80 }]; }

  var EVENTS = {
    banana: { title: 'Банановая кожура', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), m = W * a.rr(0.4, 0.6), peel = null;
      var joker = a.folk(dir > 0 ? -20 : W + 20, { hat: 'jester', h: ['#9b5bd6', '#6a3a9a'], a: '#ffd23f' }, 1.3);
      var victim = a.folk(dir > 0 ? W + 20 : -20, null, 1.4);
      joker.q = [{ k: 'run', x: m }, { k: 'do', f: function () { peel = a.prop({ x: m, img: I.banana(a), vx: 0, vy: 0, step: function (p, dt) { if (p.vy) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.3 * dt; if (p.y > 0) p.gone = true; } } }); } },
        { k: 'run', x: m + dir * 120 }, { k: 'face', x: m }, { k: 'until', f: function () { return victim.slipped; } }].concat(laugh(joker, 100),
        [{ k: 'until', f: function () { return victim.q[0] && victim.q[0].k === 'run' && victim.angry; } }, { k: 'say', icon: 'bang', n: 40 }, { k: 'leave', dir: dir, sp: 2.4, pose: 'up' }]);
      victim.q = [{ k: 'until', f: function () { return peel; } }, { k: 'run', x: m },
        { k: 'do', f: function () { victim.slipped = true; victim.knock = 80; victim.kdir = -dir; peel.vx = dir * 2; peel.vy = -5; a.burst(m, -6, { n: 8, colors: ['#ffd23f', '#ffffff'] }); } },
        { k: 'wait', n: 10 }, { k: 'say', icon: 'bang', n: 60 }, { k: 'do', f: function () { victim.angry = true; } },
        { k: 'run', x: function () { return joker.x - dir * 18; }, sp: 2.3 }, { k: 'leave', dir: dir, sp: 2.3 }];
    } },
    pie: { title: 'Торт в лицо', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.65), thrown = false;
      var thrower = a.folk(-20, { hat: 'party' }), target = a.folk(W + 20);
      thrower.item = I.pie(a);
      thrower.q = [{ k: 'run', x: m - 60 }, { k: 'until', f: function () { return Math.abs(target.x - (m + 30)) < 1; } }, { k: 'face', x: W }, { k: 'pose', p: 'up', n: 20 },
        { k: 'do', f: function () {
          thrower.item = null;
          var n = 36, x0 = thrower.x + 8, y0 = -30;
          a.prop({ x: x0, y: y0, vx: (m + 30 - x0) / n, vy: (-22 - y0 - 0.1 * n * n / 2) / n, front: true,
            step: function (p, dt) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.1 * dt; if (p.x >= m + 26) { p.gone = true; thrown = true; target.over = { img: I.pieFace(a), n: 260 }; a.burst(m + 28, -24, { n: 14, colors: ['#ffffff', '#f6e7c8'] }); } },
            draw: function (ctx, p, fy) { var im = I.pie(a)[0]; ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y - im.height / 2)); } });
        } }, { k: 'until', f: function () { return thrown; } }].concat(laugh(thrower, 90), [{ k: 'leave', dir: -1, sp: 1.6 }]);
      target.q = [{ k: 'run', x: m + 30 }, { k: 'face', x: 0 }, { k: 'until', f: function () { return thrown; } }, { k: 'say', icon: 'q', n: 60 }, { k: 'wait', n: 60 }].concat(laugh(target, 80), [{ k: 'leave', dir: 1 }]);
    } },
    cushion: { title: 'Подушка-пердушка', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.65), placed = false, popped = false;
      var joker = a.folk(-20, { hat: 'jester', h: ['#3f9d5a', '#2a6f40'], a: '#ff4f12' }, 1.3), victim = a.folk(W + 20, null, 1);
      joker.q = [{ k: 'run', x: m }, { k: 'pose', p: 'kneel', n: 30 },
        { k: 'do', f: function () { placed = true; a.prop({ x: m, step: function (p) { if (victim.gone) p.gone = true; }, draw: function (ctx, p, fy) { if (popped && victim.pose === 'sit') return; var im = I.cushion(a)[0]; ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy - im.height + (popped ? 2 : 0))); } }); } },
        { k: 'run', x: m - 90 }, { k: 'face', x: m }, { k: 'until', f: function () { return popped; } }].concat(laugh(joker, 120), [{ k: 'until', f: function () { return victim.chasing; } }, { k: 'leave', dir: -1, sp: 2.4, pose: 'up' }]);
      victim.q = [{ k: 'until', f: function () { return placed && joker.q[0] && joker.q[0].k === 'run'; } }, { k: 'run', x: m }, { k: 'face', x: 0 },
        { k: 'pose', p: 'sit', n: 20 }, { k: 'do', f: function () { popped = true; a.burst(m - 6, -6, { n: 18, colors: ['#c8d8b0', '#e6eed8', '#b8c8a0'], angle: Math.PI, min: 0.5, max: 2, g: -0.01, life: 50 }); } },
        { k: 'say', icon: 'bang', n: 60 }, { k: 'pose', p: 'sit', n: 40 }, { k: 'up', n: 30, jump: true }, { k: 'do', f: function () { victim.chasing = true; } },
        { k: 'run', x: function () { return joker.x + 18; }, sp: 2.3 }, { k: 'leave', dir: -1, sp: 2.3 }];
    } },
    fish: { title: 'Рыбка на спине', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.6), stuck = false;
      var victim = a.folk(W + 20, null, 1), sneak = a.folk(-20, { hat: 'jester', h: ['#3f6fd8', '#26489a'], a: '#ffd23f' }, 0.6);
      var fans = [a.folk(-50), a.folk(W + 50)];
      sneak.item = I.fish(a);
      victim.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'say', icon: 'note', n: 120 }, { k: 'until', f: function () { return stuck; } }, { k: 'wait', n: 80 }, { k: 'say', icon: 'q', n: 60 }, { k: 'wait', n: 40 }, { k: 'leave', dir: 1, sp: 1 }];
      sneak.q = [{ k: 'run', x: m - 14, sp: 0.6 }, { k: 'do', f: function () { sneak.item = null; victim.back = I.fish(a); stuck = true; } },
        { k: 'run', x: m - 80, sp: 1.6 }, { k: 'face', x: m }].concat(laugh(sneak, 100), [{ k: 'leave', dir: -1 }]);
      fans.forEach(function (g, i) {
        g.q = [{ k: 'until', f: function () { return stuck; } }, { k: 'run', x: m + (i ? 120 : -130) }, { k: 'face', x: function () { return victim.x; } }].concat(laugh(g, 90), [{ k: 'leave', dir: i ? 1 : -1 }]);
      });
    } },
    unicycle: { title: 'Жонглёр', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), fall = W * a.rr(0.4, 0.6), fallen = false;
      var g = a.folk(dir > 0 ? -20 : W + 20, { hat: 'jester', h: ['#e8402a', '#a8261a'], a: '#ffd23f' }, 1.2);
      g.q = [{ k: 'run', x: fall, pose: 'up' }, { k: 'do', f: function () { fallen = true; g.hop = 0; g.knock = 70; g.kdir = dir; a.burst(g.x, -40, { n: 3, img: I.ball(a, 'R')[0], up: true, g: 0.1 }); } },
        { k: 'wait', n: 10 }, { k: 'pose', p: 'kneel', n: 40 }, { k: 'say', icon: 'star', n: 60 }, { k: 'leave', dir: dir, sp: 1 }];
      a.prop({ front: false,
        step: function (p) { if (g.gone) p.gone = true; },
        draw: function (ctx, p, fy, t) {
          if (fallen) { ctx.fillStyle = '#2a2a30'; ctx.fillRect(Math.round(fall + dir * 20 - 8), fy - 4, 16, 4); return; }
          // моноцикл под гномиком, гномик приподнят · unicycle under the gnome, gnome lifted
          g.hop = 14;
          var x = g.x, r = 7, wy = fy - r;
          ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, wy, r, 0, 6.29); ctx.stroke();
          ctx.lineWidth = 1; ctx.beginPath(); var an = g.x / r; ctx.moveTo(x + Math.cos(an) * r, wy + Math.sin(an) * r); ctx.lineTo(x - Math.cos(an) * r, wy - Math.sin(an) * r); ctx.stroke();
          ctx.fillStyle = '#8f969e'; ctx.fillRect(x - 1, fy - 18, 2, 12);
          ['R', 'Y', 'B'].forEach(function (c, i) { var ph = t * 5 + i * 2.1, bx = x + Math.cos(ph) * 10, by = fy - 56 - Math.abs(Math.sin(ph)) * 18; var im = I.ball(a, c)[0]; ctx.drawImage(im, Math.round(bx - im.width / 2), Math.round(by)); });
        } });
      a.prop({ step: function (p) { if (!fallen && g.q[0] && g.q[0].k === 'run') g.hop = 14; if (g.gone) p.gone = true; } });
    } },
    fakegift: { title: 'Подарок-обманка', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.65), opened = false;
      var giv = a.folk(-20, { hat: 'jester', h: ['#ff8a2a', '#c25a12'], a: '#3f6fd8' }), rcv = a.folk(W + 20, { hat: 'party' });
      giv.item = I.gift(a);
      var glove = null;
      giv.q = [{ k: 'run', x: m - 14 }, { k: 'until', f: function () { return Math.abs(rcv.x - (m + 14)) < 1; } }, { k: 'do', f: function () { rcv.item = giv.item; giv.item = null; } },
        { k: 'run', x: m - 70 }, { k: 'face', x: m }, { k: 'until', f: function () { return opened; } }].concat(laugh(giv, 100), [{ k: 'leave', dir: -1, sp: 1.4 }]);
      rcv.q = [{ k: 'run', x: m + 14 }, { k: 'until', f: function () { return rcv.item; } }, { k: 'say', icon: 'heart', n: 50 }, { k: 'wait', n: 60 },
        { k: 'do', f: function () {
          opened = true; rcv.item = null;
          glove = a.prop({ x: m + 4, t: 0, front: true, step: function (p, dt) { p.t += dt; if (p.t > 70) p.gone = true; },
            draw: function (ctx, p, fy) {
              var ext = Math.min(1, p.t / 6) * 16, by = fy - 20, gl = I.glove(a)[1], bx = I.gift(a)[0];
              ctx.drawImage(bx, Math.round(p.x - bx.width / 2 + 6), Math.round(fy - bx.height));
              ctx.strokeStyle = '#8f969e'; ctx.lineWidth = 2; ctx.beginPath();
              for (var i = 0; i <= 8; i++) ctx.lineTo(p.x + 6 - i * ext / 8, by + (i % 2 ? -3 : 3)); ctx.stroke();
              ctx.drawImage(gl, Math.round(p.x + 6 - ext - gl.width), Math.round(by - gl.height / 2));
            } });
          a.burst(m + 10, -24, { n: 10, colors: CONF });
        } }, { k: 'do', f: function () { rcv.knock = 60; rcv.kdir = 1; } }, { k: 'wait', n: 10 }, { k: 'say', icon: 'bang', n: 50 }, { k: 'wait', n: 40 }].concat(laugh(rcv, 80), [{ k: 'leave', dir: 1 }]);
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#14223a 55%,#1a2a48 100%)',
    floor: ['#1f3a2a', '#ffd23f'],
    pokeColors: CONF,
    look: {
      hat: ['jester', 'party', 'pointy', 'cap', 'beanie'],
      hatColor: [['#e8402a', '#a8261a'], ['#3f6fd8', '#26489a'], ['#3f9d5a', '#2a6f40'], ['#9b5bd6', '#6a3a9a'], ['#ff8a2a', '#c25a12'], ['#ffd23f', '#c9a014']],
      accent: ['#ffd23f', '#ff5fa2', '#2ad1c9', '#ffffff']
    },
    // полосатая земля и коробка с сюрпризом · striped ground and a jack-in-the-box
    drawGround: function (ctx, fy, W) { ctx.globalAlpha = 0.25; for (var x = 0; x < W; x += 24) { ctx.fillStyle = (x / 24) % 2 ? '#ff4f12' : '#3f6fd8'; ctx.fillRect(x, fy + 4, 12, 18); } ctx.globalAlpha = 1; },
    decor: function (a) {
      var W = a.W();
      a.prop({ x: Math.max(100, W * 0.14), t: 0,
        step: function (p, dt) { if (p.t) { p.t += dt; if (p.t > 160) p.t = 0; } },
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 12 && ly > -20 && ly < 0; },
        click: function (p) { if (!p.t) { p.t = 1; a.burst(p.x, -30, { n: 16, colors: CONF, up: true }); } },
        draw: function (ctx, p, fy, t) {
          var bx = I.box(a)[0], cl = I.clown(a)[0], ext = p.t ? Math.min(1, p.t / 6) * 28 + Math.sin(p.t * 0.5) * 4 * Math.max(0, 1 - p.t / 60) : 0;
          if (p.t) {
            ctx.strokeStyle = '#8f969e'; ctx.lineWidth = 2; ctx.beginPath();
            for (var i = 0; i <= 8; i++) ctx.lineTo(p.x + (i % 2 ? -3 : 3), fy - bx.height - i * ext / 8); ctx.stroke();
            ctx.drawImage(cl, Math.round(p.x - cl.width / 2), Math.round(fy - bx.height - ext - cl.height));
          }
          ctx.drawImage(bx, Math.round(p.x - bx.width / 2), Math.round(fy - bx.height));
          ctx.fillStyle = '#c9a014'; ctx.fillRect(Math.round(p.x + bx.width / 2), Math.round(fy - 10 + Math.sin(t * 3) * 1), 4, 2);
        } });
    },
    events: EVENTS
  };

  K.define({
    id: 'aprilfools', global: 'ftAprilfools', version: '1.0.0',
    button: { text: '☺', color: '#ffd23f', bg: 'rgba(20,34,58,.88)', border: 'rgba(255,210,63,.35)', font: '20px/1 system-ui,sans-serif', title: 'День смеха: вкл / выкл · April Fools’ Day on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" shape-rendering="crispEdges"><path fill="#ffd23f" d="M2 0h3v1h1v1h1v1H6v1h2v1H7v1H1V5H0V2h1V1h1z"/><path fill="#1a1a1a" d="M4 1h1v1H4z"/><path fill="#ff8a2a" d="M6 2h2v1H6z"/></svg>',
    logos: ['jester', 'flip'],
    fx: fx,
    scene: THEME
  });
})();
