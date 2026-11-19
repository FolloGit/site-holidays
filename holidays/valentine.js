/*!
 * site-holidays · holidays/valentine.js 2.0.0
 * День святого Валентина / Valentine's Day — FolloTeam · https://folloteam.ru
 *
 * RU  Сердечки поднимаются по странице, за курсором тянется шлейф из сердец, клик рассыпает
 *     сердечки. Внизу гномики: свидание на скамейке, букет, валентинка, предложение с кольцом,
 *     подарок с мишкой, Купидон (подстреленный гномик влюбляется и бегает за другим), серенада.
 *     Шарики-сердечки улетают по клику. Работает на общем holidays/kit.js; даты — в загрузчике.
 *
 * EN  Hearts drift up the page, the cursor leaves a trail of hearts, a click bursts into hearts.
 *     Gnomes at the bottom: a date on a bench, flowers, a valentine card, a ring proposal, a gift with
 *     a teddy, Cupid (the gnome he hits falls in love and chases another), a serenade. Heart balloons
 *     fly away when clicked. Runs on the shared holidays/kit.js; dates live in the loader.
 *
 * Настройки / Options (SITE_HOLIDAYS.valentine):
 *   { trail: false, maxHearts: 40, logo: false, favicon: false, scene: false }
 *
 * Консоль / Console: ftValentine.on() · off() · event('ring') · events() · logo('arrow') · burst(x, y) · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftValentine) return;
  var K = window.siteHolidayKit;
  var COLORS = ['#ff4f6d', '#ff7a93', '#ff2e55', '#ffb3c1', '#ff4f12', '#e0245e'];
  var HEART = ['.XX.XX.', 'XwXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

  /* ---------- слой эффектов: сердечки · effects layer: hearts ---------- */
  var hs = {};
  function heart(f, c, s) { var k = c + s; return hs[k] || (hs[k] = f.sprite(HEART, { X: c, w: '#ffd6df' }, s)); }
  var hearts = [], trailT = 0;
  function target(f) { return f.reduced ? 8 : Math.round(f.cfg.maxHearts * Math.min(1.4, (f.W * f.H) / (1440 * 900))); }
  function newHeart(f, anyY) {
    var z = f.rr(0.4, 1);
    return { x: f.rr(0, f.W), y: anyY ? f.rr(0, f.H) : f.H + 20, z: z, s: z > 0.8 ? 3 : 2, vy: f.rr(0.35, 0.8) * z, ph: f.rr(0, 6.3), c: f.pick(COLORS), a: f.rr(0.35, 0.8) };
  }
  function burst(f, x, y, n) {
    f.burst(x, y, { n: n || 14, imgs: COLORS.map(function (c) { return heart(f, c, 2); }), min: 1.5, max: 4.5, lift: 1.5, g: 0.08, life: 45 });
  }
  var fx = {
    on: function () { hearts = []; },
    frame: function (f, dt) {
      f.shift(hearts, function (h) { return 0.6 + 0.4 * h.z; }, true);
      var fill = !hearts.length;
      while (hearts.length < target(f)) hearts.push(newHeart(f, fill));
      for (var i = hearts.length - 1; i >= 0; i--) {
        var h = hearts[i];
        h.ph += 0.02 * dt; h.y -= h.vy * dt; h.x += Math.sin(h.ph) * 0.35 * dt;
        if (h.y < -30) { hearts[i] = newHeart(f, false); continue; }
        f.ctx.globalAlpha = h.a * Math.min(1, (h.y + 30) / 120);
        f.ctx.drawImage(heart(f, h.c, h.s), Math.round(h.x), Math.round(h.y));
      }
      f.ctx.globalAlpha = 1;
    },
    move: function (f, x, y) {
      if (!f.cfg.trail || f.reduced) return;
      var now = performance.now();
      if (now - trailT < 45) return;
      trailT = now;
      f.parts.push({ x: x + f.rr(-4, 4), y: y + f.rr(-4, 4), vx: f.rr(-0.4, 0.4), vy: f.rr(-0.8, -0.2), g: -0.01, life: f.rr(25, 40), img: heart(f, f.pick(COLORS), 2), rot: 0, vr: 0 });
    },
    click: function (f, x, y) { burst(f, x, y, f.reduced ? 5 : 14); },
    state: function () { return { hearts: hearts.length }; }
  };

  /* ---------- сцена: гномики и сценки · scene: gnomes and little plays ---------- */
  var VP = { R: '#ff2e55', r: '#c41e44', P: '#ff9ab0', p: '#d96a85', Y: '#ffd23f', y: '#c9a014', G: '#3f9d5a', g: '#2a6f40', w: '#ffffff', W: '#fff4f6', e: '#e0c6cc',
    S: '#f2c29b', K: '#1a1a1a', b: '#a8662e', B: '#7a4620', O: '#d9823b', o: '#5a3a1a', n: '#c8b89a', k: '#3a2a1a', c: '#bfe6ff', T: '#b07a4a', t: '#7e5132' };
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, VP)); }
  var I = {
    bouquet: function (a) { return spr(a, 'bouquet', ['.R.P.R.', 'RRPPPRR', '.RPYPR.', '..GGG..', '...G...', '..gGg..', '...G...']); },
    card: function (a) { return spr(a, 'card', ['WWWWWWW', 'WeWWWeW', 'WWeReWW', 'WWWWWWW']); },
    cardOpen: function (a) { return spr(a, 'cardOpen', ['PPPPPPPPPPP', 'PWWWWPWWWWP', 'PWRRWPWeeWP', 'PRRRRPWWWWP', 'PWRRWPWeeWP', 'PWWRWPWWWWP', 'PPPPPPPPPPP']); },
    ringBox: function (a) { return spr(a, 'ringBox', ['.RRRR.', 'RRrrRR', 'RRRRRR']); },
    ringOpen: function (a) { return spr(a, 'ringOpen', ['.rrrr.', '.r..r.', '..cc..', '.c..c.', 'RRYYRR', 'RRRRRR']); },
    gift: function (a) { return spr(a, 'gift', ['..Y.Y..', '...Y...', 'RRRYRRR', 'RRRYRRR', 'RRRYRRR', 'RRRYRRR']); },
    giftBig: function (a) { return spr(a, 'giftBig', ['RRRRRYRRRRR', 'RRRRRYRRRRR', 'RRRRRYRRRRR', 'rrrrrYrrrrr', 'RRRRRYRRRRR', 'RRRRRYRRRRR']); },
    lid: function (a) { return spr(a, 'lid', ['....Y.Y....', '.....Y.....', 'RRRRRYRRRRR', 'rrrrrYrrrrr']); },
    teddy: function (a) { return spr(a, 'teddy', ['.TT...TT.', '.TtTTTtT.', '..TTTTT..', '..TKTKT..', '..TTnTT..', '.TTTRTTT.', 'TTTTTTTTT', '.TTTTTTT.', '.TT...TT.']); },
    teddySmall: function (a) { return spr(a, 'teddySmall', ['T...T', 'TTTTT', 'TKTKT', 'TTRTT', '.TTT.']); },
    guitar: function (a) { return spr(a, 'guitar', ['.OOO......', 'OOoOOnnnnk', 'OOoOO.....', '.OOO......']); },
    balloon: function (a) { return spr(a, 'balloon', ['.RR...RR.', 'RRRR.RRRR', 'RwRRRRRRR', 'RRRRRRRRR', '.RRRRRRR.', '..RRRRR..', '...RRR...', '....r....']); },
    arrow: function (a) { return spr(a, 'arrow', ['.......R.', 'PPbbbbbRR', '.......R.']); },
    cupid: function (a, f) {
      return f ? spr(a, 'cupid2', ['......YYY...', '.....SSSSS..', '.ww..SSKSS.b', 'wwww.SSSSS.b', '.www.SSSSSSb', '..ww.PPPPP.b', '......SSS...', '......S.S...'])
        : spr(a, 'cupid1', ['.ww...YYY...', 'wwww.SSSSS..', '.www.SSKSS.b', '..ww.SSSSS.b', '.....SSSSSSb', '.....PPPPP.b', '......SSS...', '......S.S...']);
    },
    bench: function (a) { return spr(a, 'bench', ['BBBBBBBBBBBBBBBBBB', 'bbbbbbbbbbbbbbbbbb', '..................', 'BBBBBBBBBBBBBBBBBB', 'bbbbbbbbbbbbbbbbbb', '.k..............k.', '.k..............k.', '.k..............k.']); }
  };
  function hearts3(a, x, y, n) { a.burst(x, y, { n: n || 18, img: 'heart', up: true, g: -0.005, min: 0.6, max: 2.2 }); }
  function arrived(g, x) { return function () { return Math.abs(g.x - x) < 1; }; }
  function tux(a) { return { hat: 'tophat', h: ['#2a2a30', '#1a1a1a'], a: '#ff2e55' }; }

  var EVENTS = {
    date: { title: 'Свидание', run: function (a) {
      var W = a.W(), bx = a.bench ? a.bench.x : W * 0.5;
      var g1 = a.folk(-20), g2 = a.folk(W + 20, { hat: 'bow' });
      var s1 = bx - 10, s2 = bx + 10;
      g1.q = [{ k: 'run', x: s1 }, { k: 'until', f: arrived(g2, s2) }, { k: 'face', x: s2 },
        { k: 'do', f: function () { g1.sitting = true; } }, { k: 'until', f: function (g) { g.pose = 'sit'; return g2.done; } },
        { k: 'say', icon: 'heart', n: 70 }, { k: 'do', f: function () { hearts3(a, bx, -40, 24); } }, { k: 'up', n: 30, jump: true }, { k: 'leave', dir: 1, sp: 1 }];
      g2.q = [{ k: 'run', x: s2 }, { k: 'until', f: function () { return g1.sitting; } }, { k: 'face', x: s1 },
        { k: 'pose', p: 'sit', n: 60 }, { k: 'say', icon: 'heart', n: 70 }, { k: 'pose', p: 'sit', n: 50 },
        { k: 'do', f: function () { a.burst(bx, -36, { n: 6, img: 'note', up: true, g: -0.004, min: 0.4, max: 1 }); } }, { k: 'pose', p: 'sit', n: 80 },
        { k: 'do', f: function () { g2.done = true; } }, { k: 'until', f: function () { return g1.q[0] && g1.q[0].k === 'leave'; } }, { k: 'follow', who: g1, gap: 14 }];
    } },
    flowers: { title: 'Букет', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.65), fromL = Math.random() < 0.5;
      var rcv = a.folk(fromL ? W + 20 : -20, { hat: 'bow' }), giv = a.folk(fromL ? -20 : W + 20, tux(a));
      giv.item = I.bouquet(a);
      rcv.q = [{ k: 'run', x: m }, { k: 'until', f: function () { return !giv.item; } }, { k: 'up', n: 50, jump: true }, { k: 'say', icon: 'heart', n: 90 },
        { k: 'until', f: function () { return giv.q[0] && giv.q[0].k === 'leave'; } }, { k: 'follow', who: giv, bounce: 2 }];
      giv.q = [{ k: 'run', x: m + (fromL ? -16 : 16) }, { k: 'until', f: arrived(rcv, m) }, { k: 'wait', n: 20 },
        { k: 'do', f: function () { rcv.item = giv.item; giv.item = null; hearts3(a, m, -30, 14); } },
        { k: 'wait', n: 50 }, { k: 'say', icon: 'heart', n: 60 }, { k: 'wait', n: 60 }, { k: 'leave', dir: fromL ? -1 : 1, sp: 1.1 }];
    } },
    card: { title: 'Валентинка', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.7);
      var rcv = a.folk(W + 20), giv = a.folk(-20);
      giv.item = I.card(a);
      var big = null;
      rcv.q = [{ k: 'run', x: m + 12 }, { k: 'until', f: function () { return !giv.item; } }, { k: 'wait', n: 20 },
        { k: 'do', f: function () {
          rcv.item = null;
          big = a.prop({ x: m + 12, y: -44, t: 0, front: true,
            step: function (p, dt) { p.t += dt; if (p.t > 150) p.gone = true; },
            draw: function (ctx, p, fy) {
              var im = I.cardOpen(a)[0], s = Math.min(1, p.t / 12), w = Math.max(1, im.width * s);
              ctx.globalAlpha = p.t > 130 ? (150 - p.t) / 20 : 1;
              ctx.drawImage(im, Math.round(p.x - w / 2), Math.round(fy + p.y - im.height), Math.round(w), im.height);
              ctx.globalAlpha = 1;
            } });
          hearts3(a, m + 12, -60, 10);
        } },
        { k: 'up', n: 150 }, { k: 'say', icon: 'heart', n: 80 }, { k: 'run', x: function () { return giv.x + 14; } }, { k: 'do', f: function () { hearts3(a, rcv.x - 7, -36, 16); } },
        { k: 'wait', n: 40 }, { k: 'follow', who: giv, bounce: 2 }];
      giv.q = [{ k: 'run', x: m - 12 }, { k: 'until', f: arrived(rcv, m + 12) }, { k: 'wait', n: 15 },
        { k: 'do', f: function () { rcv.item = giv.item; giv.item = null; } }, { k: 'until', f: function () { return big && big.gone; } },
        { k: 'until', f: function () { return Math.abs(rcv.x - (giv.x + 14)) < 2; } }, { k: 'wait', n: 40 }, { k: 'leave', dir: -1, sp: 1.1 }];
    } },
    ring: { title: 'Кольцо', run: function (a) {
      var W = a.W(), m = W * a.rr(0.35, 0.65);
      var rcv = a.folk(W + 20, { hat: 'bow', a: '#ff2e55' }), giv = a.folk(-20, tux(a), 1.2);
      giv.item = I.ringBox(a);
      var yes = false;
      rcv.q = [{ k: 'run', x: m + 14 }, { k: 'until', f: function () { return giv.kneel; } }, { k: 'say', icon: 'bang', n: 40 }, { k: 'wait', n: 60 },
        { k: 'up', n: 70, jump: true }, { k: 'do', f: function () { yes = true; hearts3(a, m, -40, 40); } }, { k: 'say', icon: 'heart', n: 120 },
        { k: 'dance', n: 100 }, { k: 'until', f: function () { return giv.q[0] && giv.q[0].k === 'leave'; } }, { k: 'follow', who: giv, bounce: 3 }];
      giv.q = [{ k: 'run', x: m - 10 }, { k: 'until', f: arrived(rcv, m + 14) }, { k: 'face', x: W }, { k: 'wait', n: 30 },
        { k: 'do', f: function () { giv.kneel = true; giv.item = I.ringOpen(a); a.burst(m - 2, -16, { n: 10, colors: ['#ffffff', '#bfe6ff', '#ffd23f'], min: 0.5, max: 1.5, g: 0.01 }); } },
        { k: 'until', f: function (g) { g.pose = 'kneel'; return yes; } }, { k: 'do', f: function () { giv.item = null; } },
        { k: 'up', n: 60, jump: true }, { k: 'say', icon: 'heart', n: 90 }, { k: 'wait', n: 60 }, { k: 'leave', dir: 1, sp: 1.2, bounce: 3 }];
    } },
    gift: { title: 'Подарок', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.7), fromL = Math.random() < 0.5, d = fromL ? 1 : -1;
      var rcv = a.folk(fromL ? W + 20 : -20), giv = a.folk(fromL ? -20 : W + 20);
      giv.item = I.gift(a);
      var box = null;
      rcv.q = [{ k: 'run', x: m + 14 * d }, { k: 'until', f: function () { return box; } }, { k: 'face', x: m }, { k: 'wait', n: 30 }, { k: 'pose', p: 'kneel', n: 30 },
        { k: 'do', f: function () { box.open = 1; } }, { k: 'until', f: function () { return box.teddy > 60; } }, { k: 'say', icon: 'heart', n: 90 },
        { k: 'do', f: function () { box.gone = true; rcv.item = I.teddySmall(a); hearts3(a, rcv.x, -30, 16); } }, { k: 'up', n: 60, jump: true },
        { k: 'run', x: function () { return giv.x + 14 * d; } }, { k: 'do', f: function () { hearts3(a, rcv.x - 7 * d, -36, 12); } }, { k: 'wait', n: 40 },
        { k: 'leave', dir: d, bounce: 2 }];
      giv.q = [{ k: 'run', x: m - 14 * d }, { k: 'until', f: arrived(rcv, m + 14 * d) }, { k: 'wait', n: 20 },
        { k: 'do', f: function () {
          giv.item = null;
          box = a.prop({ x: m, open: 0, teddy: 0,
            step: function (p, dt) { if (!p.open) return; p.open += dt; if (p.open > 10) p.teddy += dt; },
            draw: function (ctx, p, fy) {
              var bx = I.giftBig(a)[0], ld = I.lid(a)[0], td = I.teddy(a)[0], top = fy - bx.height;
              if (p.teddy) { var ty = Math.min(1, p.teddy / 15); ctx.drawImage(td, Math.round(p.x - td.width / 2), Math.round(top + 8 - td.height * ty + Math.sin(p.teddy * 0.3) * 2)); }
              ctx.drawImage(bx, Math.round(p.x - bx.width / 2), Math.round(top));
              if (p.open < 45) {
                var o = p.open, lx = p.x - ld.width / 2 + o * 1.4 * d, ly = top - ld.height + 2 - (o ? o * 3 - o * o * 0.09 : 0);
                ctx.save(); ctx.globalAlpha = o > 30 ? (45 - o) / 15 : 1; ctx.drawImage(ld, Math.round(lx), Math.round(Math.min(ly, fy - ld.height))); ctx.restore();
              }
            } });
        } }, { k: 'until', f: function () { return box.gone; } }, { k: 'wait', n: 30 }, { k: 'say', icon: 'heart', n: 60 },
        { k: 'until', f: function () { return rcv.q[0] && rcv.q[0].k === 'leave'; } }, { k: 'follow', who: rcv, bounce: 2 }];
    } },
    cupid: { title: 'Купидон', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]);
      var lover = a.folk(dir > 0 ? -20 : W + 20, null, 0.8), crush = a.folk(dir > 0 ? W + 20 : -20, { hat: 'bow' }, 1.2);
      var hit = false;
      lover.q = [{ k: 'run', x: dir > 0 ? W * 0.45 : W * 0.55, sp: 0.8 }, { k: 'until', f: function () { return hit; } },
        { k: 'pose', p: 'up', n: 20 }, { k: 'say', icon: 'heart', n: 200 }, { k: 'hop', n: 50, amp: 4 },
        { k: 'until', f: function () { return crush.q[0] && crush.q[0].k === 'leave'; } },
        { k: 'run', x: function () { return crush.x - dir * 18; }, sp: 2.4, bounce: 3 }, { k: 'leave', dir: -dir, sp: 2.4, bounce: 3 }];
      crush.q = [{ k: 'until', f: function () { return hit; } }, { k: 'wait', n: 60 }, { k: 'run', x: W * (dir > 0 ? 0.75 : 0.25), sp: 1.2 },
        { k: 'face', x: function () { return lover.x; } }, { k: 'say', icon: 'bang', n: 40 }, { k: 'up', n: 14 },
        { k: 'leave', dir: -dir, sp: 2.2, pose: 'up' }];
      a.prop({ x: dir > 0 ? W + 30 : -30, y: -110, front: true, sky: true,
        step: function (p, dt, t) {
          p.x -= dir * 1.7 * dt; p.y = -110 + Math.sin(t * 3) * 6;
          if (!p.shot && Math.abs(p.x - lover.x) < 120 && lover.x > 30 && lover.x < W - 30) {
            p.shot = true;
            var n = 40, y0 = p.y - 8, tx = lover.x;
            a.prop({ x: p.x, y: y0, vx: (tx - p.x) / n, vy: (-24 - y0 - 0.025 * n * n) / n, front: true,
              step: function (q, dt2) { q.x += q.vx * dt2; q.y += q.vy * dt2; q.vy += 0.05 * dt2; if (q.y > -24) { q.gone = true; hit = true; hearts3(a, q.x, -30, 22); } },
              draw: function (ctx, q, fy) { var im = I.arrow(a)[0]; ctx.save(); ctx.translate(q.x, fy + q.y); ctx.rotate(Math.atan2(q.vy, q.vx)); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore(); } });
          }
          if (p.x < -40 || p.x > W + 40) { p.gone = true; if (!p.shot) hit = true; }
        },
        draw: function (ctx, p, fy, t) { var im = I.cupid(a, Math.floor(t * 6) % 2)[dir > 0 ? 1 : 0]; ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y)); } });
      // влюблённый оставляет за собой сердечки · the lover leaves hearts behind
      a.prop({ step: function (p) { if (hit && !lover.gone && Math.random() < 0.08) a.burst(lover.x, -36, { n: 1, img: 'heart', up: true, g: -0.01, min: 0.3, max: 0.8 }); if (lover.gone) p.gone = true; } });
    } },
    serenade: { title: 'Серенада', run: function (a) {
      var W = a.W(), m = W * a.rr(0.25, 0.5), playing = false;
      var mus = a.folk(-20, tux(a)), lis = a.folk(W + 20, { hat: 'bow' });
      mus.item = I.guitar(a);
      mus.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'do', f: function () { playing = true; } },
        { k: 'until', f: function () { return lis.q[0] && lis.q[0].k === 'leave'; } }, { k: 'do', f: function () { playing = false; } }, { k: 'follow', who: lis, bounce: 2 }];
      lis.q = [{ k: 'run', x: m + 56 }, { k: 'dance', n: 240 }, { k: 'say', icon: 'heart', n: 80 }, { k: 'run', x: function () { return mus.x + 14; } }, { k: 'wait', n: 30 }, { k: 'leave', dir: 1 }];
      a.prop({ step: function (p) {
        if (playing && Math.random() < 0.05) a.burst(mus.x + 8, -34, { n: 1, img: 'note', up: true, g: -0.004, min: 0.3, max: 0.8, life: 60 });
        if (mus.gone) p.gone = true;
      } });
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#2a0f1c 55%,#3a1226 100%)',
    floor: ['#4a1a2e', '#8a3456'],
    pokeColors: COLORS,
    look: {
      hat: ['pointy', 'pointy', 'beanie', 'long', 'bow', 'tophat'],
      hatColor: [['#ff2e55', '#c41e44'], ['#ff9ab0', '#d96a85'], ['#f4f7fb', '#c3cedc'], ['#e0245e', '#a01540'], ['#9b5bd6', '#6a3a9a']],
      accent: ['#ff2e55', '#ffd23f', '#ffffff', '#ff9ab0'],
      tunic: [['#ff4f6d', '#c41e44'], ['#ff9ab0', '#d96a85'], ['#f4f7fb', '#c3cedc'], ['#9b5bd6', '#6a3a9a'], ['#e0245e', '#a01540'], ['#3f6fd8', '#26489a']]
    },
    // скамейка и шарики-сердечки (по клику улетают) · a bench and heart balloons (fly away when clicked)
    decor: function (a) {
      var W = a.W();
      a.bench = a.prop({ x: Math.round(W * 0.62), img: I.bench(a) });
      [Math.max(90, W * 0.1), W - Math.max(60, W * 0.08)].forEach(function (x, i) {
        a.prop({ x: x, bx: x, y: -64, ph: i * 2, fly: 0,
          step: function (p, dt, t) {
            if (p.fly) { p.y -= 1.3 * dt; p.x += Math.sin(t * 2 + p.ph) * 0.4 * dt; p.fly -= dt; if (p.fly <= 0) { p.fly = 0; p.y = -64; p.x = p.bx; } }
            else p.x = p.bx + Math.sin(t * 1.4 + p.ph) * 3;
          },
          hit: function (p, x, ly) { return !p.fly && Math.abs(x - p.x) < 11 && ly > p.y - 18 && ly < p.y + 2; },
          click: function (p) { p.fly = 600; hearts3(a, p.x, p.y - 8, 12); },
          draw: function (ctx, p, fy) {
            var img = I.balloon(a)[0];
            ctx.strokeStyle = 'rgba(255,220,230,.6)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.fly ? p.x : p.bx, p.fly ? fy + p.y + 16 : fy); ctx.lineTo(p.x, fy + p.y); ctx.stroke();
            if (!p.fly) { ctx.fillStyle = '#6a4430'; ctx.fillRect(p.bx - 1, fy - 6, 2, 6); }
            ctx.drawImage(img, Math.round(p.x - img.width / 2), Math.round(fy + p.y - img.height));
          } });
      });
    },
    events: EVENTS
  };

  K.define({
    id: 'valentine', global: 'ftValentine', version: '2.0.0',
    defaults: { trail: true, maxHearts: 40 },
    button: { text: '♥', color: '#ff4f6d', title: 'День влюблённых: вкл / выкл · Valentine’s Day on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#ff2e55" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#fff" fill-opacity=".6" d="M1 1h1v1H1z"/></svg>',
    logos: ['hearts', 'arrow'],
    fx: fx,
    scene: THEME,
    api: function (f) { return { burst: function (x, y) { burst(f, x == null ? f.W / 2 : x, y == null ? f.H / 2 : y, 30); } }; }
  });
})();
