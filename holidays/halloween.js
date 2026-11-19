/*!
 * site-holidays · holidays/halloween.js 1.0.0
 * Хэллоуин / Halloween — FolloTeam · https://folloteam.ru
 *
 * RU  По экрану пролетают летучие мыши и проплывают привидения, клик выпускает стайку мышей.
 *     Внизу гномики в костюмах: сладость или гадость, засада за тыквами, ведьма на метле, резьба
 *     по тыкве (тыква остаётся светиться), парад привидений (у последнего слетает простыня),
 *     стая летучих мышей. Тыквы на земле вспыхивают по клику. Работает на holidays/kit.js.
 *
 * EN  Bats fly across the screen and ghosts drift by, a click releases a flock of bats. Gnomes in
 *     costumes at the bottom: trick-or-treat, an ambush behind pumpkins, a witch on a broom, pumpkin
 *     carving (the pumpkin stays lit), a ghost parade (the last one loses his sheet), a bat swarm.
 *     Pumpkins on the ground flare up when clicked. Runs on holidays/kit.js.
 *
 * Консоль / Console: ftHalloween.on() · off() · event('scare') · events() · logo('bats') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftHalloween) return;
  var K = window.siteHolidayKit;
  var OR = '#ff8a1e', DOR = '#c45e12', PUR = '#7a3ad1', DPUR = '#4a2a80', LIME = '#7cff5a';
  var HP = { O: OR, o: DOR, Y: '#ffe14a', K: '#1a1a1a', k: '#2a1a30', g: '#3f9d5a', P: PUR, p: DPUR, W: '#eef0f6', w: '#ffffff', b: '#6a4430', G: LIME, R: '#e8292b', r: '#ff5fa2', B: '#5b96f5' };
  var BAT = [['K.......K', 'KK.KKK.KK', '.KKKKKKK.', '...K.K...'], ['.........', '.KKKKKKK.', 'KKKKKKKKK', 'K..K.K..K']];
  var GHOST = ['..WWWW..', '.WWWWWW.', 'WWKWWKWW', 'WWKWWKWW', 'WWWWWWWW', 'WWWKKWWW', 'WWWWWWWW', 'WWWWWWWW', 'WW.WW.WW'];

  /* ---------- слой эффектов: мыши и привидения · effects: bats and ghosts ---------- */
  var S = {}, bats = [], ghosts = [], nextBat = 0;
  function sp(f, name, rows, p) { return S[name] || (S[name] = f.sprite(rows, HP, p || 3)); }
  function bat(f, x, y, vx, vy) { bats.push({ x: x, y: y, vx: vx, vy: vy, ph: f.rr(0, 6), life: 900 }); }
  var fx = {
    on: function (f) { bats = []; ghosts = []; nextBat = 0; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i;
      f.shift(bats); f.shift(ghosts, 0.5, true);
      var want = f.reduced ? 2 : Math.max(3, Math.round(6 * f.W / 1440));
      while (ghosts.length < want) ghosts.push({ x: f.rr(0, f.W), y: f.rr(0, f.H), ph: f.rr(0, 6), vx: f.rr(-0.3, 0.3), a: f.rr(0.12, 0.3) });
      for (i = 0; i < ghosts.length; i++) {
        var g = ghosts[i];
        g.ph += 0.02 * dt; g.x += g.vx * dt; g.y += Math.sin(g.ph) * 0.3 * dt;
        if (g.x < -40) g.x = f.W + 30; if (g.x > f.W + 40) g.x = -30;
        ctx.globalAlpha = g.a * (0.7 + 0.3 * Math.sin(g.ph * 1.7));
        var gi = sp(f, 'ghost', GHOST, 3);
        ctx.drawImage(gi, Math.round(g.x), Math.round(g.y));
      }
      ctx.globalAlpha = 1;
      if (!f.reduced && T > nextBat) {
        nextBat = T + f.rr(3, 8);
        var dir = Math.random() < 0.5 ? 1 : -1, y = f.rr(f.H * 0.1, f.H * 0.6), n = 1 + (Math.random() * 4 | 0);
        for (i = 0; i < n; i++) bat(f, dir > 0 ? -20 - i * 30 : f.W + 20 + i * 30, y + f.rr(-30, 30), dir * f.rr(2.5, 4), f.rr(-0.4, 0.4));
      }
      for (i = bats.length - 1; i >= 0; i--) {
        var b = bats[i];
        b.ph += 0.3 * dt; b.x += b.vx * dt; b.y += (b.vy + Math.sin(b.ph * 0.4) * 0.8) * dt; b.life -= dt;
        if (b.life <= 0 || b.x < -60 || b.x > f.W + 60) { bats.splice(i, 1); continue; }
        var im = sp(f, 'bat' + (Math.floor(b.ph) % 2), BAT[Math.floor(b.ph) % 2], 3);
        ctx.drawImage(im, Math.round(b.x - im.width / 2), Math.round(b.y));
      }
    },
    click: function (f, x, y) {
      var n = f.reduced ? 2 : 6;
      for (var i = 0; i < n; i++) { var a = f.rr(0, 6.28), v = f.rr(2, 4); bat(f, x, y, Math.cos(a) * v, Math.sin(a) * v - 1); }
      f.burst(x, y, { n: 10, colors: [OR, PUR, LIME], min: 1, max: 3, g: 0.05 });
    },
    state: function () { return { bats: bats.length, ghosts: ghosts.length }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, HP)); }
  var I = {
    pumpkin: function (a) { return spr(a, 'pumpkin', ['.....g.....', '...OOgOO...', '.OOOOOOOOO.', 'OOoOOoOOoOO', 'OOoOOoOOoOO', 'OOoOOoOOoOO', '.OOoOOOoOO.', '...OOOOO...']); },
    pumpkinLit: function (a) { return spr(a, 'pumpkinLit', ['.....g.....', '...OOgOO...', '.OOOOOOOOO.', 'OOYYOOOYYOO', 'OOOOOYOOOOO', 'OOYOYYYOYOO', '.OOYYYYYOO.', '...OOOOO...']); },
    bowl: function (a) { return spr(a, 'bowl', ['YrGYrGY', 'PPPPPPP', '.PPPPP.']); },
    bucket: function (a) { return spr(a, 'bucket', ['.k...k.', '..kkk..', 'OOOOOOO', 'OYOOOYO', 'OOYYYOO', '.OOOOO.']); },
    sheet: function (a) { return spr(a, 'sheet', ['...WWWWWW...', '.WWWWWWWWWW.', 'WWWWWWWWWWWW']); },
    bat: function (a, k) { return spr(a, 'bat' + k, BAT[k]); },
    knife: function (a) { return spr(a, 'knife', ['WWW.', '..bb']); },
    cat: function (a) { return spr(a, 'cat', ['K...K', 'KK.KK', 'KGKGK', 'KKKKK']); }
  };
  function costumeLook(kind) {
    if (kind === 'ghost') return { costume: 'ghost' };
    if (kind === 'witch') return { hat: 'witch', h: ['#2a1a30', '#1a1a1a'], a: PUR, t: [DPUR, '#2a1a40'] };
    if (kind === 'devil') return { hat: 'horns', a: '#e8292b', t: ['#e8292b', '#9e1416'] };
    return { hat: 'hood', h: [OR, DOR], t: [OR, DOR] };
  }

  var EVENTS = {
    treat: { title: 'Сладость или гадость', run: function (a) {
      var W = a.W(), m = W * a.rr(0.25, 0.45), kids = [], kinds = ['ghost', 'witch', 'devil'];
      var host = a.folk(-20, { hat: 'pointy', h: [OR, DOR] }, 1);
      host.item = I.bowl(a);
      host.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'until', f: function () { return kids.every(function (k) { return k.got; }); } },
        { k: 'say', icon: 'ha', n: 60 }, { k: 'wait', n: 60 }, { k: 'leave', dir: -1 }];
      kinds.forEach(function (kind, i) {
        var kid = a.folk(W + 20 + i * 26, costumeLook(kind), 1.5);
        kid.item = I.bucket(a);
        kids.push(kid);
        kid.q = [{ k: 'run', x: m + 20 + i * 22 }, { k: 'until', f: function () { return Math.abs(host.x - m) < 1 && (i === 0 || kids[i - 1].got); } },
          { k: 'run', x: m + 18 }, { k: 'say', icon: 'q', n: 40 }, { k: 'wait', n: 40 },
          { k: 'do', f: function () { kid.got = true; a.burst(m + 10, -30, { n: 6, img: 'candy', up: true, g: 0.05, min: 1, max: 2 }); } },
          { k: 'say', icon: 'candy', n: 60 }, { k: 'up', n: 30, jump: true }, { k: 'leave', dir: 1, sp: 1.8, bounce: 2 }];
      });
    } },
    scare: { title: 'Засада', run: function (a) {
      var W = a.W(), m = W * a.rr(0.4, 0.6), dir = a.pick([-1, 1]);
      var pile = a.prop({ x: m, draw: function (ctx, p, fy) {
        var pk = I.pumpkin(a)[0];
        ctx.drawImage(pk, Math.round(p.x - pk.width + 2), Math.round(fy - pk.height)); ctx.drawImage(pk, Math.round(p.x - 2), Math.round(fy - pk.height));
        ctx.drawImage(pk, Math.round(p.x - pk.width / 2), Math.round(fy - pk.height * 2 + 4));
      }, front: true });
      var hider = a.folk(m, costumeLook('devil'));
      hider.hidden = true;
      var walker = a.folk(dir > 0 ? -20 : W + 20, null, 1);
      hider.q = [{ k: 'until', f: function () { return Math.abs(walker.x - m) < 46; } },
        { k: 'do', f: function () { hider.hidden = false; hider.x = m + dir * 18; hider.flip = dir > 0; a.burst(hider.x, -30, { n: 10, colors: [OR, PUR] }); } },
        { k: 'up', n: 40, jump: true }, { k: 'say', icon: 'ha', n: 80 }, { k: 'dance', n: 120 }, { k: 'leave', dir: dir, bounce: 2 }];
      walker.q = [{ k: 'run', x: m - dir * 30, sp: 1 }, { k: 'until', f: function () { return !hider.hidden; } }, { k: 'say', icon: 'bang', n: 60 },
        { k: 'up', n: 24, jump: true }, { k: 'leave', dir: -dir, sp: 3, pose: 'up' }];
      a.prop({ step: function (p) { if (hider.gone) { pile.gone = true; p.gone = true; } } });
    } },
    witch: { title: 'Ведьма на метле', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), look = a.look(costumeLook('witch'));
      var watcher = a.folk(dir > 0 ? W + 20 : -20);
      watcher.q = [{ k: 'run', x: W * (dir > 0 ? 0.7 : 0.3) }, { k: 'until', f: function () { return witch.x * dir > W * (dir > 0 ? 0.35 : -0.65); } },
        { k: 'face', x: function () { return witch.x; } }, { k: 'say', icon: 'bang', n: 60 }, { k: 'up', n: 80 }, { k: 'say', icon: 'star', n: 60 }, { k: 'leave', dir: dir }];
      var witch = a.prop({ x: dir > 0 ? -40 : W + 40, y: -120, front: true, sky: true,
        step: function (p, dt, t) {
          p.x += dir * 2.2 * dt; p.y = -120 + Math.sin(t * 2) * 18;
          if (Math.random() < 0.3) a.burst(p.x - dir * 22, p.y + 4, { n: 1, colors: [LIME, PUR, '#ffe14a'], g: 0.02, min: 0.2, max: 0.6, life: 30 });
          if ((dir > 0 && p.x > W + 60) || (dir < 0 && p.x < -60)) p.gone = true;
        },
        draw: function (ctx, p, fy, t) {
          var y = fy + p.y;
          ctx.fillStyle = '#6a4430'; ctx.fillRect(Math.round(p.x - 22), Math.round(y - 1), 44, 3);
          ctx.fillStyle = '#d9b45b'; for (var i = 0; i < 4; i++) ctx.fillRect(Math.round(p.x - dir * 22 - (dir > 0 ? 8 : 0)), Math.round(y - 4 + i * 3), 8, 2);
          a.drawGnome(ctx, look, 'sit', p.x, y + 4, dir < 0, Math.sin(t * 2) * 0.08);
          var cat = I.cat(a)[dir > 0 ? 0 : 1]; ctx.drawImage(cat, Math.round(p.x + dir * 14 - cat.width / 2), Math.round(y - cat.height));
        } });
    } },
    carve: { title: 'Резьба по тыкве', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.7), lit = false, carving = false;
      var pk = a.prop({ x: m + 14, glow: 0,
        step: function (p, dt, t) { if (carving && Math.random() < 0.3) a.burst(p.x - 4, -10, { n: 1, colors: [OR, '#ffe14a'], up: true, min: 0.5, max: 1.5 }); },
        hit: function (p, x, ly) { return lit && Math.abs(x - p.x) < 12 && ly > -18 && ly < 0; },
        click: function (p) { p.flare = 40; a.burst(p.x, -12, { n: 10, colors: [OR, '#ffe14a'], up: true }); },
        draw: function (ctx, p, fy, t) {
          var im = (lit ? I.pumpkinLit(a) : I.pumpkin(a))[0];
          if (lit) { if (p.flare) p.flare = Math.max(0, p.flare - 1); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 9) + (p.flare ? 0.4 : 0); ctx.drawImage(a.glow('#ffb03a'), p.x - 26, fy - 34, 52, 52); ctx.globalAlpha = 1; }
          ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy - im.height));
        } });
      var g = a.folk(-20, { hat: 'witch', h: ['#2a1a30', '#1a1a1a'], a: OR });
      g.item = I.knife(a);
      g.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'do', f: function () { carving = true; } }, { k: 'pose', p: 'kneel', n: 150 },
        { k: 'do', f: function () { carving = false; lit = true; g.item = null; a.burst(m + 14, -16, { n: 16, colors: ['#ffe14a', OR], up: true }); a.keep(pk, 3); } },
        { k: 'up', n: 50, jump: true }, { k: 'say', icon: 'star', n: 70 }, { k: 'wait', n: 40 }, { k: 'leave', dir: -1 }];
    } },
    parade: { title: 'Парад привидений', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), N = 4, line = [];
      for (var i = 0; i < N; i++) {
        var g = a.folk(dir > 0 ? -20 - i * 24 : W + 20 + i * 24, { costume: 'ghost' }, 0.9);
        g.alpha = 0.88;
        line.push(g);
        g.q = i === N - 1 ? [{ k: 'run', x: W * (dir > 0 ? 0.5 : 0.5), bounce: 3 }] : [{ k: 'leave', dir: dir, sp: 0.9, bounce: 3 }];
      }
      var last = line[N - 1];
      last.q.push({ k: 'do', f: function () {
        last.look = a.look({ hat: 'pointy' }); last.alpha = null;
        a.prop({ x: last.x - dir * 4, t: 0, img: I.sheet(a), step: function (p, dt) { p.t += dt; if (p.t > 300) p.gone = true; } });
      } }, { k: 'say', icon: 'bang', n: 60 }, { k: 'up', n: 30, jump: true }, { k: 'face', x: dir > 0 ? 0 : W }, { k: 'leave', dir: -dir, sp: 2.6 });
      a.prop({ step: function (p) { if (line.every(function (g) { return g.gone; })) p.gone = true; } });
    } },
    swarm: { title: 'Летучие мыши', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), m = W * a.rr(0.35, 0.65), flying = false, folk = [];
      for (var i = 0; i < 2; i++) {
        var g = a.folk(i ? W + 20 : -20);
        folk.push(g);
        g.q = [{ k: 'run', x: m + (i ? 24 : -24) }, { k: 'face', x: m }, { k: 'say', icon: 'q', n: 50 }, { k: 'do', f: function (gg) { gg.ready = true; } }, { k: 'until', f: function () { return flying; } },
          { k: 'until', f: function (gg) { gg.pose = 'kneel'; return !flying; } }, { k: 'say', icon: 'bang', n: 50 }, { k: 'up', n: 30, jump: true }, { k: 'leave', dir: i ? 1 : -1 }];
      }
      var bats = [];
      for (i = 0; i < 14; i++) bats.push({ x: (dir > 0 ? -40 : W + 40) - dir * i * 18, y: -28 - Math.random() * 40, ph: Math.random() * 6, v: a.rr(2.6, 3.4) });
      a.prop({ front: true,
        step: function (p, dt) {
          // стая вылетает, когда оба гномика на месте · the swarm starts once both gnomes are in place
          if (!folk.every(function (g) { return g.ready; })) return;
          var any = false;
          bats.forEach(function (b) { b.x += dir * b.v * dt; b.ph += 0.3 * dt; if (b.x > -40 && b.x < W + 40) any = true; });
          flying = bats.some(function (b) { return Math.abs(b.x - m) < 80; });
          if (!any && bats[bats.length - 1].x * dir > W * dir) p.gone = true;
        },
        draw: function (ctx, p, fy) { bats.forEach(function (b) { var im = I.bat(a, Math.floor(b.ph) % 2)[0]; ctx.drawImage(im, Math.round(b.x - im.width / 2), Math.round(fy + b.y + Math.sin(b.ph * 0.5) * 4)); }); } });
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#1d0f26 55%,#2a1430 100%)',
    floor: ['#2a1430', '#5a2a6a'],
    pokeColors: [OR, PUR, LIME, '#ffe14a'],
    look: {
      hat: ['witch', 'horns', 'pointy', 'hood', 'pointy'],
      hatColor: [['#2a1a30', '#1a1a1a'], [OR, DOR], [PUR, DPUR], ['#3f9d5a', '#2a6f40']],
      accent: [OR, PUR, LIME, '#e8292b'],
      tunic: [[OR, DOR], [PUR, DPUR], ['#2a2a30', '#1a1a1a'], ['#3f9d5a', '#2a6f40']],
      costume: { ghost: 0.15 }
    },
    // тыквы и заборчик · pumpkins and a little fence
    decor: function (a) {
      var W = a.W();
      [Math.max(90, W * 0.12), W * 0.82].forEach(function (x, i) {
        a.prop({ x: x, flare: 0,
          step: function (p, dt) { p.flare = Math.max(0, p.flare - dt); },
          hit: function (p, x2, ly) { return Math.abs(x2 - p.x) < 12 && ly > -18 && ly < 0; },
          click: function (p) {
            p.flare = 50; a.burst(p.x, -16, { n: 12, colors: [OR, '#ffe14a', PUR], up: true });
            for (var k = 0; k < 3; k++) a.burst(p.x, -20, { n: 1, img: I.bat(a, k % 2)[0], up: true, g: -0.01, min: 1.5, max: 3, life: 60 });
          },
          draw: function (ctx, p, fy, t) {
            var im = I.pumpkinLit(a)[0];
            ctx.globalAlpha = 0.3 + 0.12 * Math.sin(t * 7 + i) + (p.flare ? 0.5 : 0); ctx.drawImage(a.glow('#ffb03a'), p.x - 26, fy - 34, 52, 52); ctx.globalAlpha = 1;
            ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy - im.height));
          } });
      });
      a.prop({ x: W * 0.5, draw: function (ctx, p, fy) {
        var x0 = W * 0.42, x1 = W * 0.58;
        ctx.fillStyle = '#3a2a3a';
        for (var x = x0; x < x1; x += 14) { ctx.fillRect(Math.round(x), fy - 26 + ((x / 14 | 0) % 2) * 3, 4, 26); }
        ctx.fillRect(Math.round(x0), fy - 18, Math.round(x1 - x0), 3); ctx.fillRect(Math.round(x0), fy - 9, Math.round(x1 - x0), 3);
      } });
    },
    events: EVENTS
  };

  K.define({
    id: 'halloween', global: 'ftHalloween', version: '1.0.0',
    button: { text: '☠︎', color: OR, bg: 'rgba(30,14,38,.88)', border: 'rgba(255,138,30,.35)', title: 'Хэллоуин: вкл / выкл · Halloween on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" shape-rendering="crispEdges"><path fill="#3f9d5a" d="M5 0h1v2H5z"/><path fill="' + OR + '" d="M3 1h5v1h2v1h1v4h-1v1H8v1H3V8H1V7H0V3h1V2h2z"/><path fill="#ffe14a" d="M2 3h2v1H2zM7 3h2v1H7zM5 4h1v1H5zM2 5h1v1H2zM4 5h3v1H4zM8 5h1v1H8zM3 6h5v1H3z"/></svg>',
    logos: ['pumpkin', 'bats'],
    fx: fx,
    scene: THEME
  });
})();
