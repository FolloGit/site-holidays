/*!
 * site-holidays · holidays/lunar.js 2.0.0
 * Китайский Новый год / Chinese (Lunar) New Year — FolloTeam · https://folloteam.ru
 *
 * RU  Красные фонарики качаются под шапкой сайта, падают золотые монетки и красные конверты,
 *     клик — хлопушка с золотыми искрами. Внизу гномики: танец дракона, воздушный змей-дракон,
 *     дракон гонится за толпой гномиков, хлопушки, красные конверты, танец льва, небесные фонарики.
 *     Гирлянда фонариков на столбах. Даты (лунный календарь) — в загрузчике.
 *
 * EN  Red lanterns sway under the site header, gold coins and red envelopes fall, a click pops a
 *     firecracker of gold sparks. Gnomes at the bottom: dragon dance, a dragon kite, a dragon chasing
 *     a crowd of gnomes, firecrackers, red envelopes, lion dance, sky lanterns. A string of lanterns
 *     on posts. Dates (lunar calendar) live in the loader.
 *
 * Настройки / Options (SITE_HOLIDAYS.lunar):
 *   { lanterns: false, garland: 'header', logo: false, favicon: false, scene: false }
 *
 * Консоль / Console: ftLunar.on() · off() · event('chase') · events() · logo('coins') · pop(x, y) · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftLunar) return;
  var K = window.siteHolidayKit;
  var RED = '#e8292b', DRED = '#9e1416', GOLD = '#ffcc3f', DGOLD = '#c98f12';
  var ANIMALS = [['Крыса', 'Rat'], ['Бык', 'Ox'], ['Тигр', 'Tiger'], ['Кролик', 'Rabbit'], ['Дракон', 'Dragon'], ['Змея', 'Snake'],
    ['Лошадь', 'Horse'], ['Коза', 'Goat'], ['Обезьяна', 'Monkey'], ['Петух', 'Rooster'], ['Собака', 'Dog'], ['Свинья', 'Pig']];
  function animal() {
    var d = new Date(), y = d.getFullYear();
    // до праздника — ещё прошлый год · before the holiday it is still last year
    if (d.getMonth() === 0 || (d.getMonth() === 1 && d.getDate() < 15 && !(window.siteHolidays && siteHolidays.inSeason('lunar')))) y--;
    return ANIMALS[(((y - 4) % 12) + 12) % 12];
  }
  var LP = { R: RED, r: DRED, Y: GOLD, y: DGOLD, w: '#fff3c4', W: '#ffffff', K: '#1a1a1a', O: '#ff8a2a', o: '#c45e12', b: '#6a4430', G: '#3f9d5a' };

  /* ---------- слой эффектов · effects layer ---------- */
  var drops = [], lanterns = [], topY = 0;
  var S = {};
  function s3(f, name, rows) { return S[name] || (S[name] = f.sprite(rows, LP, 3)); }
  function lanternSpr(f) { return s3(f, 'lantern', ['....y....', '...yyy...', '..YYYYY..', '.RRrRrRR.', 'RRrRRRrRR', 'RrRRwRRrR', 'RrRwYwRrR', 'RrRRwRRrR', 'RRrRRRrRR', '.RRrRrRR.', '..YYYYY..', '...y.y...', '...Y.Y...', '...Y.Y...']); }
  function coinSpr(f) { return s3(f, 'coin', ['.YYYY.', 'YyyyyY', 'Yy..yY', 'Yy..yY', 'YyyyyY', '.YYYY.']); }
  function envSpr(f) { return s3(f, 'env', ['RRRRRR', 'RrYYrR', 'RRYYRR', 'RRRRRR', 'RRRRRR', 'RRRRRR', 'RRRRRR']); }
  function newDrop(f, anyY) { return { x: f.rr(0, f.W), y: anyY ? f.rr(-f.H, f.H) : f.rr(-80, -20), vy: f.rr(0.6, 1.4), ph: f.rr(0, 6.3), rot: f.rr(-0.3, 0.3), env: Math.random() < 0.35, a: f.rr(0.55, 0.9) }; }
  function pop(f, x, y, n) { f.burst(x, y, { n: n || 26, colors: [GOLD, GOLD, GOLD, RED, '#fff'], min: 1.5, max: 5.5, lift: 1, g: 0.09, add: true, life: 35 }); }
  function lanternAt(f, x, y) {
    if (!f.cfg.lanterns || topY <= -999) return null;
    var L = lanternSpr(f);
    for (var i = 0; i < lanterns.length; i++) { var l = lanterns[i]; if (Math.abs(x - l.x) < L.width / 2 + 4 && y > topY && y < topY + l.len + L.height + 4) return l; }
    return null;
  }
  var fx = {
    resize: function (f) {
      var n = Math.max(2, Math.min(7, Math.round(f.W / 260)));
      lanterns = [];
      for (var i = 0; i < n; i++) lanterns.push({ x: f.W * (i + 0.5) / n, len: f.rr(14, 40), ph: f.rr(0, 6.3), sw: 0 });
    },
    on: function () { drops = []; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i;
      f.shift(drops);
      var want = f.reduced ? 6 : Math.round(22 * Math.min(1.4, (f.W * f.H) / (1440 * 900))), fill = !drops.length;
      while (drops.length < want) drops.push(newDrop(f, fill));
      for (i = drops.length - 1; i >= 0; i--) {
        var d = drops[i];
        d.ph += 0.03 * dt; d.y += d.vy * dt; d.x += Math.sin(d.ph) * 0.5 * dt;
        if (d.y > f.H + 40 || d.y < -f.H - 100) { drops[i] = newDrop(f, false); continue; }
        var img = d.env ? envSpr(f) : coinSpr(f);
        ctx.save(); ctx.globalAlpha = d.a; ctx.translate(Math.round(d.x), Math.round(d.y));
        if (d.env) ctx.rotate(d.rot + Math.sin(d.ph) * 0.25); else ctx.scale(Math.max(0.15, Math.abs(Math.cos(d.ph * 1.6))), 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
      }
      if (f.cfg.lanterns) {
        topY = f.cfg.garland ? f.header(f.cfg.garland) : 0;
        if (topY > -999) {
          var L = lanternSpr(f);
          for (i = 0; i < lanterns.length; i++) {
            var l = lanterns[i];
            l.sw *= Math.pow(0.97, dt);
            ctx.save(); ctx.translate(l.x, topY); ctx.rotate(Math.sin(T * 1.3 + l.ph) * 0.08 + Math.sin(T * 5) * l.sw);
            ctx.fillStyle = DGOLD; ctx.fillRect(-0.5, 0, 1, l.len);
            ctx.globalAlpha = 0.25 + 0.1 * Math.sin(T * 3 + l.ph); ctx.drawImage(f.glow('#ff9a3c'), -40, l.len + L.height / 2 - 40, 80, 80); ctx.globalAlpha = 1;
            ctx.drawImage(L, -L.width / 2, l.len); ctx.restore();
          }
        }
      }
    },
    move: function (f, x, y) { var l = lanternAt(f, x, y); if (l && l.sw < 0.05) l.sw = 0.25; },
    click: function (f, x, y) {
      var l = lanternAt(f, x, y);
      if (l) { l.sw = 0.45; pop(f, l.x, topY + l.len + 20, 18); return; }
      pop(f, x, y, f.reduced ? 8 : 26);
    },
    state: function () { return { drops: drops.length, lanterns: lanterns.length, animal: animal()[0] }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, LP)); }
  var I = {
    head: function (a) { return spr(a, 'dhead', ['.......YY.......', '......YRRY......', '....RRRRRRR.....', '...RRRRRRwKR....', '..RRRRRRRRRRRR..', '.YRRRRRRRRRRRRRW', 'YYRRRRRRRRRWWWWW', '.YRRRRRRRRRRRRR.', '..RRRRRRRRYY....', '...YYYYYYY......']); },
    seg: function (a) { return spr(a, 'dseg', ['..YYYY..', '.RRRRRR.', 'RRYRRYRR', 'RRRRRRRR', 'RRYRRYRR', '.RRRRRR.', '..YYYY..']); },
    tail: function (a) { return spr(a, 'dtail', ['YY....', 'RRRY..', 'RRRRRY', 'RRRY..', 'YY....']); },
    // большой дракон для погони (зелёный) · the big chase dragon (green)
    bigHead: function (a) { return spr(a, 'bhead', ['..........YY..........', '.........YGGY.........', '......GGGGGGGGG.......', '....GGGGGGGGGWKGG.....', '...GGGGGGGGGGGGGGGG...', '..YGGGGGGGGGGGGGGGGGGW', '.YYGGGGGGGGGGGGGWWWWWW', 'YYYGGGGGGGGGGGGGGGGGG.', '.YYGGGGGGGGGGGGRRRR...', '..YYGGGGGGGGGGGG......', '...YYYYYYYYYYY........']); },
    bigSeg: function (a) { return spr(a, 'bseg', ['...YYYY...', '..GGGGGG..', '.GGYGGYGG.', 'GGGGGGGGGG', 'GGYGGGGYGG', 'GGGGGGGGGG', '.GGYGGYGG.', '..GGGGGG..', '...YYYY...']); },
    env: function (a) { return spr(a, 'env', ['RRRRR', 'RYYYR', 'RRYRR', 'RRRRR', 'RRRRR']); },
    drum: function (a) { return spr(a, 'drum', ['.YYYYY.', 'RRRRRRR', 'RYRRRYR', 'RRRRRRR', '.YYYYY.']); },
    sky: function (a) { return spr(a, 'sky', ['.OOO.', 'OOOOO', 'OoOoO', 'OOOOO', 'OOOOO', '.YYY.']); },
    lion: function (a) { return spr(a, 'lion', ['..........YYYY......', '.........YRRRRY.....', '........YRRwKRRY....', '.YY.....RRRRRRRRWW..', 'RRRRRRRRRRRRRRRRWWW.', 'RYRYRYRYRRRRRRRRRR..', 'RRRRRRRRRRRRRRRRY...', '.RRRRRRRRRRRRRRY....', '..YYYYYYYYYYYY......']); },
    kite: function (a) { return spr(a, 'kite', ['....YY....', '...YRRY...', '..RRRRRR..', '.RRwKRRRR.', 'YRRRRRRRRW', '.RRRRRRWWW', '..RRRYY...', '...YY.....']); },
    lantern: function (a) { return spr(a, 'lantern', ['..y..', '.YYY.', 'RRrRR', 'RrRrR', 'RRrRR', '.YYY.', '..Y..']); }
  };
  var crewLook = { hat: 'beanie', h: [RED, DRED], t: [GOLD, DGOLD], y: RED };

  var EVENTS = {
    dragon: { title: 'Танец дракона', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), N = 6, gap = 22, sp = 1.5, crew = [];
      for (var i = 0; i < N; i++) {
        var x0 = dir > 0 ? -30 - i * gap : W + 30 + i * gap;
        var g = a.folk(x0, crewLook, sp);
        g.q = [{ k: 'run', x: x0 + dir * (W + 60 + N * gap) }, { k: 'gone' }];
        crew.push(g);
      }
      a.prop({ front: true, roar: 0,
        step: function (p, dt) {
          p.roar = Math.max(0, p.roar - dt);
          if (Math.random() < 0.02) a.burst(crew[0].x + dir * 16, -50, { n: 6, colors: [GOLD, '#fff'] });
          if (crew.every(function (g) { return g.gone; })) p.gone = true;
        },
        segY: function (i, t) { return -48 + Math.sin(t * 6 - i * 0.9) * 7; },
        hit: function (p, x, ly) { var h = crew[0]; return !h.gone && Math.abs(x - h.x) < 22 && ly < -30 && ly > -80; },
        click: function (p) { p.roar = 40; a.burst(crew[0].x + dir * 20, p.segY(0, a.T()) + 4, { n: 30, colors: ['#ff8a2a', GOLD, RED], min: 2, max: 5 }); },
        draw: function (ctx, p, fy, t) {
          var fl = dir > 0 ? 0 : 1, i, g;
          ctx.fillStyle = '#6a4430';
          for (i = 0; i < N; i++) { g = crew[i]; if (!g.gone) ctx.fillRect(Math.round(g.x + dir * 6), fy + p.segY(i, t) + 6, 2, -p.segY(i, t) - 22); }
          for (i = N - 1; i >= 0; i--) {
            g = crew[i];
            var y = fy + p.segY(i, t), im = i === 0 ? I.head(a)[fl] : i === N - 1 ? I.tail(a)[fl] : I.seg(a)[fl];
            if (i > 0) {
              var gp = crew[i - 1], mx = (g.x + gp.x) / 2 + dir * 6, my = fy + (p.segY(i, t) + p.segY(i - 1, t)) / 2, sg = I.seg(a)[fl];
              ctx.drawImage(sg, Math.round(mx - sg.width / 2), Math.round(my - sg.height / 2));
            }
            var dy = i === 0 && p.roar ? -Math.abs(Math.sin(p.roar * 0.4)) * 6 : 0;
            ctx.drawImage(im, Math.round(g.x + dir * 6 - im.width / 2), Math.round(y - im.height / 2 + dy));
          }
        } });
    } },
    kite: { title: 'Змей-дракон', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]);
      var g = a.folk(dir > 0 ? -20 : W + 20, null, 1.1);
      var pal = a.folk(dir > 0 ? -60 : W + 60, null, 1.1);
      g.q = [{ k: 'run', x: W * (dir > 0 ? 0.4 : 0.6) }, { k: 'face', x: dir > 0 ? 0 : W }, { k: 'pose', p: 'up', n: 120 }, { k: 'say', icon: 'star', n: 60 },
        { k: 'leave', dir: dir, sp: 1.1, pose: 'up' }];
      pal.q = [{ k: 'follow', who: g, gap: 26, bounce: 1 }];
      var hist = [];
      a.prop({ front: true, sky: true, kx: g.x - dir * 90, ky: -150,
        step: function (p, dt, t) {
          var tx = g.x - dir * (90 + Math.sin(t * 0.7) * 30), ty = -150 + Math.sin(t * 1.3) * 22 + (g.pose === 'up' ? -30 : 0);
          p.kx += (tx - p.kx) * 0.04 * dt; p.ky += (ty - p.ky) * 0.04 * dt;
          hist.unshift([p.kx, p.ky]); if (hist.length > 90) hist.length = 90;
          if (g.gone) p.gone = true;
        },
        draw: function (ctx, p, fy, t) {
          var hx = g.x + (g.flip ? -1 : 1) * 8, hy = fy - 18 * 2 + (g.pose === 'up' ? -6 : 0);
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + p.kx) / 2, fy + (hy - fy + p.ky) / 2 + 30, p.kx, fy + p.ky + 6); ctx.stroke();
          // хвост-лента · ribbon tail
          for (var i = 6; i < hist.length; i += 6) {
            var h = hist[i], k = i / 6;
            ctx.fillStyle = k % 2 ? GOLD : RED;
            ctx.fillRect(Math.round(h[0] - dir * 6 - 3), Math.round(fy + h[1] + 6 + Math.sin(t * 6 + k) * 3), 6, 6);
          }
          var im = I.kite(a)[dir > 0 ? 0 : 1];
          ctx.drawImage(im, Math.round(p.kx - im.width / 2), Math.round(fy + p.ky - im.height / 2));
        } });
    } },
    chase: { title: 'Дракон гонится', run: function (a) {
      var W = a.W(), N = 6, crowd = [], i, tripper = null;
      for (i = 0; i < N; i++) {
        var g = a.folk(W + 20 + i * 18 + a.rr(0, 8), null, a.rr(2.2, 2.6));
        g.q = [{ k: 'wait', n: i * 4 }, { k: 'say', icon: 'bang', n: 300 }, { k: 'leave', dir: -1, pose: 'up' }];
        crowd.push(g);
      }
      tripper = crowd[N - 1];
      tripper.sp = 2.2;
      tripper.q = [{ k: 'say', icon: 'bang', n: 300 }, { k: 'run', x: W * 0.45, pose: 'up' },
        { k: 'do', f: function () { if (dragon.x > tripper.x - 60) { tripper.knock = 9999; tripper.kdir = -1; } } }, { k: 'until', f: function () { return dragon.x < W * 0.45 - 220; } },
        { k: 'say', icon: 'bang', n: 60 }, { k: 'face', x: 0 }, { k: 'wait', n: 20 }, { k: 'leave', dir: -1, sp: 2.8 }];
      var hist = [], jumpT = 0;
      var dragon = a.prop({ x: W + 180, y: -30, front: true,
        step: function (p, dt, t) {
          p.x -= 2.3 * dt;
          if (!jumpT && tripper.knock > 0 && Math.abs(p.x - tripper.x) < 70) jumpT = 1;
          // перепрыгнул — споткнувшийся встаёт · jumped over: the one who tripped gets up
          if (tripper.knock > 0 && p.x < tripper.x - 220) tripper.knock = 0;
          if (jumpT) { jumpT += dt; if (jumpT > 70) jumpT = 0; }
          var jump = jumpT ? Math.sin(jumpT / 70 * Math.PI) * 60 : 0;
          p.y = -34 + Math.sin(t * 7) * 6 - jump;
          hist.unshift([p.x, p.y]); if (hist.length > 140) hist.length = 140;
          if (Math.random() < 0.05) a.burst(p.x - 20, p.y + 4, { n: 8, colors: ['#ff8a2a', GOLD, RED], angle: Math.PI, min: 2, max: 4, g: 0 });
          if (p.x < -320) p.gone = true;
        },
        draw: function (ctx, p, fy) {
          var sg = I.bigSeg(a)[1], hd = I.bigHead(a)[1];
          for (var i = 9; i >= 1; i--) {
            var h = hist[Math.min(hist.length - 1, i * 12)] || [p.x + i * 24, p.y];
            ctx.fillStyle = '#6a4430';
            ctx.drawImage(sg, Math.round(h[0] + 10 - sg.width / 2), Math.round(fy + h[1] - sg.height / 2));
          }
          ctx.drawImage(hd, Math.round(p.x - hd.width / 2), Math.round(fy + p.y - hd.height / 2));
          // ноги гномиков под драконом · gnome legs under the dragon
          ctx.fillStyle = GOLD;
          for (i = 1; i <= 8; i += 2) {
            var hh = hist[Math.min(hist.length - 1, i * 12)] || [p.x + i * 24, p.y];
            var k = Math.sin(a.T() * 14 + i) * 3;
            var lg = Math.max(0, Math.min(20, -hh[1] - 8));
            ctx.fillRect(Math.round(hh[0] + 6 + k), Math.round(fy + hh[1] + 8), 3, lg); ctx.fillRect(Math.round(hh[0] + 12 - k), Math.round(fy + hh[1] + 8), 3, lg);
          }
        } });
    } },
    firecrackers: { title: 'Хлопушки', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.7), side = a.pick([-1, 1]);
      var pole = a.prop({ x: m, lit: false, count: 9, tm: 0, fade: 90,
        step: function (p, dt) {
          if (p.lit && p.count > 0) {
            p.tm -= dt;
            if (p.tm <= 0) { p.count--; p.tm = a.rr(5, 11); a.burst(m + 10, -78 + p.count * 6 + 6, { n: 12, colors: [RED, GOLD, '#fff', '#ff8a2a'], min: 1.5, max: 4.5 }); }
          }
          if (p.count === 0) { p.fade -= dt; if (p.fade <= 0) p.gone = true; }
        },
        hit: function (p, x, ly) { return !p.lit && Math.abs(x - (m + 6)) < 12 && ly > -84 && ly < 0; },
        click: function (p) { p.lit = true; },
        draw: function (ctx, p, fy, t) {
          ctx.globalAlpha = p.count ? 1 : Math.max(0, p.fade / 90);
          ctx.fillStyle = '#6a4430'; ctx.fillRect(m - 1, fy - 84, 3, 84); ctx.fillRect(m - 1, fy - 84, 12, 2);
          ctx.fillStyle = DGOLD; ctx.fillRect(m + 10, fy - 82, 1, 4);
          for (var i = 0; i < p.count; i++) { var y = fy - 78 + i * 6; ctx.fillStyle = RED; ctx.fillRect(m + 8, y, 5, 5); ctx.fillStyle = GOLD; ctx.fillRect(m + 8, y + 2, 5, 1); }
          if (p.lit && p.count) { ctx.fillStyle = Math.floor(t * 20) % 2 ? '#fff' : GOLD; ctx.fillRect(m + 9, fy - 78 + p.count * 6, 3, 3); }
          ctx.globalAlpha = 1;
        } });
      var lighter = a.folk(side < 0 ? -20 : W + 20, null, 1.4);
      lighter.q = [{ k: 'run', x: m + 2 + side * 4 }, { k: 'face', x: m + 10 }, { k: 'wait', n: 30 },
        { k: 'do', f: function () { pole.lit = true; } }, { k: 'say', icon: 'bang', n: 40 }, { k: 'run', x: m + side * 95, sp: 2.6, pose: 'up' },
        { k: 'face', x: m }, { k: 'until', f: function (g) { if (pole.count) g.pose = 'up'; return pole.count === 0; } }, { k: 'say', icon: 'star', n: 60 }, { k: 'dance', n: 90 }, { k: 'leave', dir: side }];
      var fans = [a.folk(side < 0 ? W + 20 : -20), a.folk(side < 0 ? W + 44 : -44)];
      fans.forEach(function (fan, i) {
        fan.q = [{ k: 'run', x: m - side * (110 + i * 22) }, { k: 'face', x: m }, { k: 'until', f: function () { return pole.lit; } },
          { k: 'until', f: function (g) { if (pole.count) g.pose = 'up'; return pole.count === 0; } }, { k: 'up', n: 60, jump: true }, { k: 'leave', dir: -side }];
      });
    } },
    envelopes: { title: 'Красные конверты', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.6), kids = [];
      var elder = a.folk(-20, { hat: 'bare', r: '#d8d8d8', b: ['#f4f7fb', '#c3cedc'], t: [RED, DRED] }, 0.9);
      elder.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'until', f: function () { return kids.every(function (k) { return k.got; }); } },
        { k: 'wait', n: 40 }, { k: 'say', icon: 'heart', n: 70 }, { k: 'wait', n: 50 }, { k: 'leave', dir: -1, sp: 0.9 }];
      for (var i = 0; i < 3; i++) (function (i) {
        var kid = a.folk(W + 20 + i * 26, { hat: 'beanie' }, 1.6);
        kids.push(kid);
        kid.q = [{ k: 'run', x: m + 18 + i * 20 }, { k: 'until', f: function () { return Math.abs(elder.x - m) < 1 && (i === 0 || kids[i - 1].got); } },
          { k: 'run', x: m + 18 }, { k: 'pose', p: 'kneel', n: 20 },
          { k: 'do', f: function () { kid.item = I.env(a); kid.got = true; a.burst(m + 10, -30, { n: 8, img: 'coin', up: true, g: 0.05, min: 1, max: 2.5 }); } },
          { k: 'up', n: 40, jump: true }, { k: 'say', icon: 'coin', n: 60 }, { k: 'leave', dir: 1, sp: 1.9, bounce: 2 }];
      })(i);
    } },
    lion: { title: 'Танец льва', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), sp = 1.1, fl = dir > 0 ? 0 : 1;
      var drummer = a.folk(dir > 0 ? -20 : W + 20, { t: [RED, DRED], hat: 'beanie', h: [GOLD, DGOLD] }, sp);
      drummer.item = I.drum(a);
      drummer.q = [{ k: 'leave', dir: dir, sp: sp }];
      a.prop({ x: dir > 0 ? -90 : W + 90, jump: 0, vy: 0, h: 0, front: true,
        step: function (p, dt) {
          p.x += dir * sp * dt;
          if (p.jump > 0 || p.h < 0) { p.vy += 0.35 * dt; p.h += p.vy * dt; if (p.h >= 0) { p.h = 0; p.vy = 0; p.jump = 0; } }
          else if (Math.random() < 0.006) { p.vy = -4; p.jump = 1; p.h = -0.1; }
          if (Math.random() < 0.03 && !drummer.gone) a.say(drummer, 'bang', 18);
          if ((dir > 0 && p.x > W + 100) || (dir < 0 && p.x < -100)) p.gone = true;
        },
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 22 && ly > -30 + p.h && ly < 0; },
        click: function (p) { p.vy = -6; p.jump = 1; p.h = -0.1; a.burst(p.x, -26, { n: 10, img: 'coin', up: true, g: 0.05, min: 1.5, max: 3 }); },
        draw: function (ctx, p, fy, t) {
          var im = I.lion(a)[fl], bob = Math.sin(t * 10) * 1.5, y = fy + p.h + bob - 10;
          ctx.fillStyle = GOLD;
          for (var i = 0; i < 2; i++) {
            var lx = p.x + (i ? 8 : -12) * dir, k = Math.sin(t * 10 + i * 2) * 3;
            ctx.fillRect(Math.round(lx + k), Math.round(y + 6), 3, fy - y - 6 + p.h * 0.2); ctx.fillRect(Math.round(lx + 5 - k), Math.round(y + 6), 3, fy - y - 6 + p.h * 0.2);
          }
          ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(y - im.height + 8));
        } });
    } },
    lanterns: { title: 'Небесные фонарики', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.6);
      for (var i = 0; i < 3; i++) (function (i) {
        var fromL = i % 2 === 0, g = a.folk(fromL ? -20 - i * 20 : W + 20 + i * 20, null, a.rr(1, 1.3));
        g.item = I.sky(a);
        g.q = [{ k: 'run', x: m + (i - 1) * 34 }, { k: 'face', x: m + (i - 1) * 34 + (fromL ? 1 : -1) }, { k: 'wait', n: 40 + i * 30 },
          { k: 'do', f: function () {
            g.item = null;
            a.prop({ x: g.x, y: -40, ph: Math.random() * 6, front: true, sky: true,
              step: function (p, dt, t) { p.y -= 0.85 * dt; p.x += Math.sin(t * 1.3 + p.ph) * 0.25 * dt; if (a.floor() + p.y < -60 || p.y < -2400) p.gone = true; },
              draw: function (ctx, p, fy, t) {
                var im = I.sky(a)[0];
                ctx.globalAlpha = 0.45 + 0.15 * Math.sin(t * 5 + p.ph); ctx.drawImage(a.glow('#ff9a3c'), p.x - 18, fy + p.y - 22, 36, 36); ctx.globalAlpha = 1;
                ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y - im.height));
              } });
          } },
          { k: 'up', n: 70 }, { k: 'say', icon: i === 1 ? 'heart' : 'star', n: 70 }, { k: 'wait', n: 90 }, { k: 'leave', dir: fromL ? -1 : 1 }];
      })(i);
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#2a0d0a 55%,#3a120c 100%)',
    floor: ['#3b1a10', '#9a4a1e'],
    pokeColors: [GOLD, RED, '#ffffff', '#ff8a2a'],
    look: {
      hat: ['pointy', 'beanie', 'beanie', 'long', 'cap'],
      hatColor: [[RED, DRED], [GOLD, DGOLD], [RED, DRED], ['#2a2a30', '#1a1a1a']],
      accent: [GOLD, RED],
      tunic: [[RED, DRED], [GOLD, DGOLD], ['#3f9d5a', '#2a6f40'], ['#2f5fb8', '#1f3f80'], [RED, DRED]]
    },
    // гирлянда фонариков между двумя столбами · a string of lanterns between two posts
    decor: function (a) {
      var W = a.W(), x1 = Math.max(90, W * 0.08), x2 = W - Math.max(60, W * 0.06), top = -96, n = Math.max(3, Math.round((x2 - x1) / 140));
      a.prop({ x: x1, swing: 0,
        step: function (p, dt) { p.swing *= Math.pow(0.97, dt); },
        hit: function (p, x, ly) { return x > x1 && x < x2 && ly > top - 4 && ly < top + 40; },
        click: function (p, x, ly) { p.swing = 1; a.burst(x, ly, { n: 16, colors: [GOLD, RED, '#fff'] }); },
        draw: function (ctx, p, fy, t) {
          ctx.fillStyle = '#5a2a14'; ctx.fillRect(x1 - 2, fy + top, 4, -top); ctx.fillRect(x2 - 2, fy + top, 4, -top);
          ctx.fillStyle = GOLD; ctx.fillRect(x1 - 3, fy + top - 3, 6, 3); ctx.fillRect(x2 - 3, fy + top - 3, 6, 3);
          ctx.strokeStyle = 'rgba(255,204,63,.7)'; ctx.lineWidth = 1; ctx.beginPath();
          for (var i = 0; i <= 40; i++) { var u = i / 40, x = x1 + (x2 - x1) * u, y = fy + top + Math.sin(u * Math.PI) * 22; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
          ctx.stroke();
          var L = I.lantern(a)[0];
          for (i = 1; i < n; i++) {
            var u2 = i / n, lx = x1 + (x2 - x1) * u2, ly = fy + top + Math.sin(u2 * Math.PI) * 22, ang = Math.sin(t * 1.5 + i) * 0.1 + p.swing * Math.sin(t * 9) * 0.3;
            ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang);
            ctx.globalAlpha = 0.3; ctx.drawImage(a.glow('#ff7a2a'), -16, 0, 32, 32); ctx.globalAlpha = 1;
            ctx.drawImage(L, -L.width / 2, 0); ctx.restore();
          }
        } });
    },
    events: EVENTS
  };

  var an = animal();
  K.define({
    id: 'lunar', global: 'ftLunar', version: '2.0.0',
    defaults: { lanterns: true, garland: 'header' },
    button: { text: '福', color: GOLD, bg: 'rgba(158,20,22,.88)', border: 'rgba(255,204,63,.35)', font: '700 18px/1 system-ui,sans-serif',
      title: 'Китайский Новый год — год: ' + an[0] + '. Вкл / выкл · Lunar New Year — Year of the ' + an[1] + '. On / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 12" shape-rendering="crispEdges"><path fill="' + GOLD + '" d="M3 0h3v1H3zM2 1h5v1H2zM2 10h5v1H2zM3 11h1v1H3zM5 11h1v1H5z"/><path fill="' + RED + '" d="M1 2h7v1h1v6H8v1H1V9H0V3h1z"/><path fill="' + DRED + '" d="M2 3h1v6H2zM6 3h1v6H6z"/><path fill="' + GOLD + '" d="M4 5h1v2H4z"/></svg>',
    logos: ['lanterns', 'coins'],
    fx: fx,
    scene: THEME,
    api: function (f) { return { pop: function (x, y) { pop(f, x == null ? f.W / 2 : x, y == null ? f.H / 2 : y, 50); } }; }
  });
})();
