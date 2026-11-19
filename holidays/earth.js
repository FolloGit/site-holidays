/*!
 * site-holidays · holidays/earth.js 1.0.0
 * День Земли, 22 апреля / Earth Day — FolloTeam · https://folloteam.ru
 *
 * RU  По странице кружат листья, за курсором летят бабочки, клик рассыпает лепестки. Внизу —
 *     трава и гномики-садовники: сажают дерево (оно остаётся расти), собирают мусор, угощают
 *     кроликов морковкой, ловят бабочку, поливают цветы, едут на велосипеде. Цветы на земле
 *     распускаются по клику.
 *
 * EN  Leaves swirl over the page, butterflies follow the cursor, a click scatters petals. At the
 *     bottom: grass and gardener gnomes — they plant a tree (it stays and grows), pick up litter,
 *     feed bunnies a carrot, chase a butterfly, water the flowers, ride a bicycle. Flowers on the
 *     ground bloom when clicked.
 *
 * Консоль / Console: ftEarth.on() · off() · event('plant') · events() · logo('leaf') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftEarth) return;
  var K = window.siteHolidayKit;
  var LEAF = '#5cc96b', DLEAF = '#2a8a3e';
  var EP = { G: LEAF, g: DLEAF, D: '#6a4430', d: '#3a2416', Y: '#ffd23f', y: '#c9a014', R: '#e8402a', r: '#a8261a', P: '#ff9ab0', p: '#d96a85', W: '#ffffff', w: '#e6edf5',
    O: '#ff8a2a', o: '#c25a12', B: '#3f6fd8', b: '#26489a', K: '#1a1a1a', s: '#bfc5cc', S: '#8f969e', C: '#7ab8ff', V: '#9b5bd6', N: '#ffb3c1' };
  var PETALS = ['#ff9ab0', '#ffd23f', '#ffffff', '#9b5bd6', '#ff8a2a'];
  var LEAVES = [['.G.', 'GGg', '.g.'], ['G..', '.Gg', '..g']];
  var FLY = [['V.V', '.K.', 'V.V'], ['...', 'VKV', '...']];

  /* ---------- слой эффектов: листья и бабочки · effects: leaves and butterflies ---------- */
  var S = {}, leaves = [], flies = [], mouse = null;
  function sp(f, name, rows, pal, p) { return S[name] || (S[name] = f.sprite(rows, pal || EP, p || 3)); }
  var fx = {
    on: function (f) { leaves = []; flies = []; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i;
      f.shift(leaves, 0.8, true);
      var want = f.reduced ? 6 : Math.round(18 * Math.min(1.4, (f.W * f.H) / (1440 * 900))), fill = !leaves.length;
      while (leaves.length < want) leaves.push({ x: f.rr(0, f.W), y: fill ? f.rr(0, f.H) : -20, vy: f.rr(0.4, 0.9), ph: f.rr(0, 6), k: Math.random() < 0.5 ? 0 : 1, c: Math.random() < 0.3 ? 'o' : 'g' });
      for (i = leaves.length - 1; i >= 0; i--) {
        var l = leaves[i];
        l.ph += 0.03 * dt; l.y += l.vy * dt; l.x += Math.sin(l.ph) * 0.8 * dt;
        if (l.y > f.H + 20) { leaves.splice(i, 1); continue; }
        var im = sp(f, 'leaf' + l.k + l.c, LEAVES[l.k], l.c === 'o' ? { G: '#ffb03a', g: '#c25a12' } : EP);
        ctx.save(); ctx.globalAlpha = 0.7; ctx.translate(l.x, l.y); ctx.rotate(Math.sin(l.ph) * 0.8); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
      }
      var nf = f.reduced ? 0 : 3;
      while (flies.length < nf) flies.push({ x: f.rr(0, f.W), y: f.rr(0, f.H), ph: f.rr(0, 6), c: f.pick(['V', 'Y', 'C']) });
      for (i = 0; i < flies.length; i++) {
        var b = flies[i], tx = mouse ? mouse.x + Math.cos(T * 1.3 + i * 2) * 40 : b.x + Math.cos(b.ph) * 30, ty = mouse ? mouse.y + Math.sin(T * 1.7 + i * 2) * 30 : b.y + Math.sin(b.ph * 1.3) * 20;
        b.ph += 0.03 * dt; b.x += (tx - b.x) * 0.02 * dt; b.y += (ty - b.y) * 0.02 * dt;
        var fi = sp(f, 'fly' + b.c + (Math.floor(T * 10 + i) % 2), FLY[Math.floor(T * 10 + i) % 2], { V: EP[b.c], K: '#1a1a1a' });
        ctx.drawImage(fi, Math.round(b.x - fi.width / 2), Math.round(b.y - fi.height / 2));
      }
    },
    move: function (f, x, y) { mouse = { x: x, y: y }; },
    click: function (f, x, y) { f.burst(x, y, { n: f.reduced ? 8 : 18, colors: PETALS, s: 3, min: 1, max: 3.5, lift: 1.5, g: 0.04, life: 60 }); },
    state: function () { return { leaves: leaves.length, flies: flies.length }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, EP)); }
  var I = {
    shovel: function (a) { return spr(a, 'shovel', ['D...', '.D..', '..D.', '...ss', '...ss']); },
    sapling: function (a) { return spr(a, 'sapling', ['.G.', 'GgG', '.D.', '.D.']); },
    can: function (a) { return spr(a, 'can', ['.C....', 'CCCC..', 'CCCCCC', 'CCCC..']); },
    bag: function (a) { return spr(a, 'bag', ['.ss.', 'SSSS', 'SSSS', 'SSSS']); },
    bottle: function (a) { return spr(a, 'bottle', ['.C.', 'CCC', 'CwC', 'CCC']); },
    tin: function (a) { return spr(a, 'tin', ['sss', 'RRR', 'sss']); },
    paper: function (a) { return spr(a, 'paper', ['ww.', 'www', '.ww']); },
    carrot: function (a) { return spr(a, 'carrot', ['..G', 'OOO', 'OO.']); },
    bunny: function (a, k) { return spr(a, 'bunny' + k, k ? ['W.W...', 'W.W...', 'WWW...', 'WKWWW.', 'WWWWWW', '.W..W.'] : ['.W.W..', '.W.W..', 'WWW...', 'WKWWW.', 'WWWWWW', 'W....W']); },
    net: function (a) { return spr(a, 'net', ['.www.', 'w...w', 'w...w', '.www.', '..D..', '..D..', '..D..']); },
    fly: function (a, k) { return spr(a, 'fly' + k, FLY[k]); },
    flower: function (a, c) { return spr(a, 'fl' + c, ['.' + c + '.', c + 'Y' + c, '.' + c + '.', '.G.', 'gG.', '.G.']); }
  };
  // дерево растёт от 0 до 1 · a tree grows from 0 to 1
  function drawTree(ctx, x, fy, k, t) {
    var h = 10 + 40 * k, w = 4 + 26 * k;
    ctx.fillStyle = '#6a4430'; ctx.fillRect(Math.round(x - 2), Math.round(fy - h * 0.55), 4, Math.round(h * 0.55));
    var cols = [DLEAF, LEAF, '#7ee08a'];
    for (var i = 0; i < 3; i++) {
      var r = w * (1 - i * 0.22), cy = fy - h * 0.55 - r * 0.5 - i * r * 0.35 + Math.sin(t + i) * 0.5;
      ctx.fillStyle = cols[i];
      ctx.fillRect(Math.round(x - r / 2), Math.round(cy - r * 0.35), Math.round(r), Math.round(r * 0.7));
      ctx.fillRect(Math.round(x - r * 0.35), Math.round(cy - r * 0.5), Math.round(r * 0.7), Math.round(r));
    }
  }

  var EVENTS = {
    plant: { title: 'Посадить дерево', run: function (a) {
      var W = a.W(), m = W * a.rr(0.25, 0.75), planted = false, watered = 0;
      var tree = a.prop({ x: m, k: 0, grow: 0, step: function (p, dt) { if (watered && p.k < 1) p.k = Math.min(1, p.k + 0.006 * dt); },
        draw: function (ctx, p, fy, t) { if (!planted) { ctx.fillStyle = '#6a4430'; ctx.fillRect(Math.round(m - 6), fy - 2, 12, 2); return; } drawTree(ctx, m, fy, p.k, t); } });
      var digger = a.folk(-20, { hat: 'wreath' }), water = a.folk(W + 20, { hat: 'cap', h: [LEAF, DLEAF] });
      digger.item = I.shovel(a); water.item = I.can(a);
      digger.q = [{ k: 'run', x: m - 14 }, { k: 'face', x: m }, { k: 'until', f: function (g) { g.pose = 'kneel'; if (Math.random() < 0.2) a.burst(m, -4, { n: 2, colors: ['#6a4430', '#3a2416'], up: true, min: 0.5, max: 2 }); return (g.dig = (g.dig || 0) + 1) > 120; } },
        { k: 'do', f: function () { planted = true; digger.item = null; } }, { k: 'say', icon: 'ok', n: 50 }, { k: 'until', f: function () { return tree.k >= 1; } },
        { k: 'say', icon: 'heart', n: 80 }, { k: 'dance', n: 60 }, { k: 'leave', dir: -1 }];
      water.q = [{ k: 'until', f: function () { return planted; } }, { k: 'run', x: m + 16 }, { k: 'face', x: m },
        { k: 'until', f: function () { watered = 1; if (Math.random() < 0.4) a.burst(m + 6, -18, { n: 1, colors: ['#7ab8ff', '#bfe6ff'], angle: Math.PI * 0.75, min: 1, max: 2, g: 0.1, life: 20 }); return tree.k >= 1; } },
        { k: 'do', f: function () { a.keep(tree, 4); a.burst(m, -50, { n: 14, colors: PETALS, up: true }); } }, { k: 'up', n: 40, jump: true }, { k: 'leave', dir: 1 }];
    } },
    litter: { title: 'Уборка', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), trash = [], kinds = ['bottle', 'tin', 'paper', 'bottle', 'paper'];
      kinds.forEach(function (k, i) { trash.push(a.prop({ x: W * (0.2 + i * 0.15), img: I[k](a) })); });
      if (dir < 0) trash.reverse();
      var g = a.folk(dir > 0 ? -20 : W + 20, { hat: 'cap', h: [LEAF, DLEAF] }, 1.3);
      g.item = I.bag(a);
      trash.forEach(function (tr) {
        g.q.push({ k: 'run', x: tr.x - dir * 8 }, { k: 'pose', p: 'kneel', n: 20 }, { k: 'do', f: function () { tr.gone = true; a.burst(tr.x, -8, { n: 6, colors: [LEAF, '#ffffff'], up: true, min: 0.5, max: 1.5 }); } });
      });
      g.q.push({ k: 'say', icon: 'star', n: 70 }, { k: 'up', n: 40, jump: true }, { k: 'leave', dir: dir });
    } },
    bunnies: { title: 'Кролики', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), m = W * a.rr(0.35, 0.65), fed = false, buns = [];
      for (var i = 0; i < 3; i++) buns.push({ x: (dir > 0 ? -20 : W + 20) - dir * i * 22, ph: i * 1.3 });
      var g = a.folk(dir > 0 ? W + 20 : -20, { hat: 'ears', r: '#c98a3a' });
      g.item = I.carrot(a);
      g.q = [{ k: 'run', x: m + dir * 30 }, { k: 'face', x: m }, { k: 'pose', p: 'kneel', n: 30 }, { k: 'until', f: function (gg) { gg.pose = 'kneel'; return Math.abs(buns[0].x - (m + dir * 12)) < 3; } },
        { k: 'do', f: function () { g.item = null; fed = true; } }, { k: 'say', icon: 'heart', n: 80 }, { k: 'pose', p: 'kneel', n: 80 }, { k: 'up', n: 30, jump: true }, { k: 'leave', dir: dir }];
      a.prop({ front: true, eat: 0,
        step: function (p, dt) {
          buns.forEach(function (b, i) {
            var stop = !fed || p.eat < 120 ? m + dir * 12 - dir * i * 20 : null;
            b.ph += dt * 0.12;
            if (stop != null && Math.abs(b.x - stop) < 2) { b.still = true; return; }
            b.still = false; b.x += dir * 1.1 * dt;
          });
          if (fed) { p.eat += dt; if (p.eat < 120 && Math.random() < 0.05) a.burst(m + dir * 12, -12, { n: 1, img: 'heart', up: true, g: -0.01, min: 0.3, max: 0.8 }); }
          if (buns.every(function (b) { return dir > 0 ? b.x > W + 20 : b.x < -20; })) p.gone = true;
        },
        draw: function (ctx, p, fy) {
          buns.forEach(function (b) {
            var k = b.still ? 0 : Math.floor(b.ph) % 2, im = I.bunny(a, k)[dir > 0 ? 0 : 1], hop = b.still ? 0 : Math.abs(Math.sin(b.ph * Math.PI)) * 8;
            ctx.drawImage(im, Math.round(b.x - im.width / 2), Math.round(fy - im.height - hop));
          });
        } });
    } },
    butterfly: { title: 'Бабочка', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]);
      var fly = a.prop({ x: dir > 0 ? W * 0.3 : W * 0.7, y: -30, front: true, ph: 0, esc: 0,
        step: function (p, dt) {
          p.ph += dt;
          if (p.esc) { p.y -= 1.5 * dt; p.x += dir * dt; if (a.floor() + p.y < -20) p.gone = true; return; }
          p.x += dir * (1.4 + Math.sin(p.ph * 0.05)) * dt; p.y = -30 - Math.abs(Math.sin(p.ph * 0.04)) * 30;
        },
        draw: function (ctx, p, fy) { var im = I.fly(a, Math.floor(p.ph / 4) % 2)[0]; ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y)); } });
      var g = a.folk(dir > 0 ? -20 : W + 20, { hat: 'wreath' }, 1.6);
      g.item = I.net(a);
      g.q = [{ k: 'run', x: function () { return fly.x - dir * 30; }, sp: 1.8 },
        { k: 'run', x: function () { return fly.x - dir * 14; }, sp: 2.2 }, { k: 'pose', p: 'up', n: 10 },
        { k: 'do', f: function () { fly.esc = 1; g.knock = 60; g.kdir = dir; } }, { k: 'wait', n: 10 }, { k: 'say', icon: 'ha', n: 70 }, { k: 'dance', n: 60 }, { k: 'leave', dir: -dir }];
    } },
    water: { title: 'Полить цветы', run: function (a) {
      var W = a.W(), flowers = a.flowers || [], dir = a.pick([-1, 1]);
      var g = a.folk(dir > 0 ? -20 : W + 20, { hat: 'pointy', h: [LEAF, DLEAF] }, 1.2);
      g.item = I.can(a);
      var list = flowers.slice().sort(function (p, q) { return dir * (p.x - q.x); });
      list.forEach(function (fl) {
        g.q.push({ k: 'run', x: fl.x - dir * 16 }, { k: 'face', x: fl.x },
          { k: 'until', f: function (gg) { gg.w = (gg.w || 0) + 1; if (Math.random() < 0.4) a.burst(fl.x - dir * 6, -18, { n: 1, colors: ['#7ab8ff', '#bfe6ff'], angle: dir > 0 ? Math.PI * 0.25 : Math.PI * 0.75, min: 1, max: 2, g: 0.1, life: 20 }); if (gg.w > 50) { gg.w = 0; fl.bloom = 120; return true; } } });
      });
      g.q.push({ k: 'say', icon: 'heart', n: 70 }, { k: 'leave', dir: dir });
    } },
    bike: { title: 'Велосипед', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), look = a.look({ hat: 'cap' });
      a.prop({ x: dir > 0 ? -30 : W + 30, front: true, ring: 0,
        step: function (p, dt) { p.x += dir * 2 * dt; p.ring = Math.max(0, p.ring - dt); if (Math.random() < 0.006) { p.ring = 30; a.burst(p.x, -40, { n: 2, img: 'note', up: true, g: -0.01, min: 0.5, max: 1.2 }); } if ((dir > 0 && p.x > W + 40) || (dir < 0 && p.x < -40)) p.gone = true; },
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 18 && ly > -40 && ly < 0; },
        click: function (p) { p.ring = 30; a.burst(p.x, -40, { n: 3, img: 'note', up: true, g: -0.01, min: 0.5, max: 1.2 }); },
        draw: function (ctx, p, fy, t) {
          var r = 7, x1 = p.x - 11, x2 = p.x + 11, wy = fy - r;
          ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 2;
          [x1, x2].forEach(function (x) { ctx.beginPath(); ctx.arc(x, wy, r, 0, 6.29); ctx.stroke(); });
          ctx.strokeStyle = '#3f6fd8'; ctx.beginPath(); ctx.moveTo(x1, wy); ctx.lineTo(p.x, wy - 8); ctx.lineTo(x2, wy); ctx.moveTo(p.x, wy - 8); ctx.lineTo(p.x + dir * 8, wy - 12); ctx.stroke();
          a.drawGnome(ctx, look, 'sit', p.x - dir * 2, wy - 4, dir < 0);
        } });
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#0f2414 55%,#143018 100%)',
    floor: ['#2a5a2a', LEAF],
    pokeColors: PETALS,
    look: { hat: ['wreath', 'pointy', 'cap', 'beanie', 'ears'], hatColor: [[LEAF, DLEAF], ['#ffd23f', '#c9a014'], ['#8a5a36', '#5e3a20'], ['#3f6fd8', '#26489a']],
      accent: ['#ff9ab0', '#ffffff', '#9b5bd6'], tunic: [[LEAF, DLEAF], ['#8a5a36', '#5e3a20'], ['#3f6fd8', '#26489a'], ['#ffd23f', '#c9a014']] },
    // травинки и цветы · grass blades and flowers
    drawGround: function (ctx, fy, W) { ctx.fillStyle = '#7ee08a'; for (var x = 4; x < W; x += 11) { var h = 3 + (x * 7 % 5); ctx.fillRect(x, fy - h, 1, h); ctx.fillRect(x + 2, fy - h + 2, 1, h - 2); } },
    decor: function (a) {
      var W = a.W(), xs = [0.1, 0.22, 0.48, 0.7, 0.9].map(function (k) { return Math.max(90, W * k); });
      a.flowers = xs.map(function (x, i) {
        return a.prop({ x: x, c: ['P', 'Y', 'V', 'O', 'W'][i], bloom: 0,
          step: function (p, dt) { p.bloom = Math.max(0, p.bloom - dt); },
          hit: function (p, x2, ly) { return Math.abs(x2 - p.x) < 8 && ly > -16 && ly < 0; },
          click: function (p) { p.bloom = 120; a.burst(p.x, -12, { n: 10, colors: PETALS, up: true, s: 2 }); },
          draw: function (ctx, p, fy, t) {
            var im = I.flower(a, p.c)[0], s = 1 + (p.bloom ? Math.min(1, p.bloom / 20) * 0.6 : 0), w = im.width * s, h = im.height * s;
            ctx.drawImage(im, Math.round(p.x - w / 2), Math.round(fy - h + Math.sin(t * 2 + i) * 0.5), Math.round(w), Math.round(h));
          } });
      });
    },
    events: EVENTS
  };

  K.define({
    id: 'earth', global: 'ftEarth', version: '1.0.0',
    button: { text: '❀', color: LEAF, bg: 'rgba(15,36,20,.88)', border: 'rgba(92,201,107,.35)', font: '20px/1 system-ui,sans-serif', title: 'День Земли: вкл / выкл · Earth Day on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><path fill="#3f6fd8" d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1z"/><path fill="' + LEAF + '" d="M2 1h2v1h1v2H3v1H1V3h1zM5 4h2v2H6v1H5z"/></svg>',
    logos: ['leaf', 'globe'],
    fx: fx,
    scene: THEME
  });
})();
