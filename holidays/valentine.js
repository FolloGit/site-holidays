/*!
 * site-holidays · holidays/valentine.js 1.0.0
 * День святого Валентина / Valentine's Day — FolloTeam · https://folloteam.ru
 *
 * RU  Сердечки поднимаются по странице (и уезжают вместе с ней при прокрутке), за курсором тянется
 *     шлейф из маленьких сердец, клик рассыпает салют сердечек, иконка вкладки — сердце.
 *     Модуль пакета site-holidays: загрузчик подгружает его 10–15 февраля (поверх зимы).
 *
 * EN  Hearts drift up the page (and scroll with it), the cursor leaves a trail of small hearts,
 *     a click bursts into hearts, the tab icon becomes a heart.
 *     A module of the site-holidays package: the loader pulls it in on February 10–15 (over winter).
 *
 * Адрес / URL:   ?holiday=valentine · ?holiday=off
 * Разметка / Markup:   data-holiday-egg="valentine" — невидимая кнопка-пасхалка · hidden easter-egg toggle
 *
 * Настройки / Options (SITE_HOLIDAYS.valentine):
 *   { logo: false,      // не подменять логотип >>FT_ · keep the >>FT_ logo
 *     favicon: false,   // не менять иконку вкладки · keep the tab icon
 *     scene: false,     // без сцены с человечками внизу · no people scene at the bottom
 *     trail: false,     // без шлейфа за курсором · no cursor trail
 *     maxHearts: 40 }   // сердечек на экране на 1440×900 · hearts on screen at 1440×900
 *
 * Сцена / Scene (holidays/scene.js): свидание, букет, Купидон, валентинка, серенада;
 *   шарики-сердечки на земле улетают по клику · date, bouquet, Cupid, valentine card, serenade;
 *   heart balloons on the ground fly away when clicked
 *
 * Консоль / Console:   ftValentine.on() · off() · burst(x, y) · event('cupid') · events() · state() · version
 */
(function () {
  'use strict';
  if (window.ftValentine) return;
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/holidays\/valentine\.js.*$/, '') : 'assets/holidays/';

  var VERSION = '1.0.0';
  // версия пакета для общих файлов (сбрасывает кэш при обновлении) · package version for shared files (busts the cache on update)
  var PKG = (window.siteHolidays && window.siteHolidays.version) || VERSION;
  var CFG = { favicon: true, trail: true, maxHearts: 40 };
  var user = (window.SITE_HOLIDAYS && window.SITE_HOLIDAYS.valentine) || {};
  for (var k in user) if (Object.prototype.hasOwnProperty.call(user, k)) CFG[k] = user[k];

  var OFF_KEY = 'ftValentine', EGG_KEY = 'ftValentineEgg';
  var COLORS = ['#ff4f6d', '#ff7a93', '#ff2e55', '#ffb3c1', '#ff4f12', '#e0245e'];
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { return null; }
  }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.random() * a.length | 0]; }
  function inSeason(d) { d = d || new Date(); return d.getMonth() === 1 && d.getDate() >= 10 && d.getDate() <= 15; }

  // выключено посетителем в сезон — не стартуем, но кнопка остаётся · turned off in season: stay idle, keep the button
  var forced = /[?&]holiday=valentine\b/.test(location.search);
  var startOn = forced || (inSeason() ? ls(OFF_KEY) !== 'off' : ls(EGG_KEY) === '1');

  /* ---------- холст и кнопка · canvas and button ---------- */
  var cv, ctx, btn, W = 0, H = 0, DPR = 1, raf = 0, last = 0, running = false;
  var hearts = [], bits = [], lastScroll = null, sprites = {};

  function heartSprite(c, s) {                       // пиксельное сердце 7×6 · 7×6 pixel heart
    var key = c + s;
    if (sprites[key]) return sprites[key];
    var rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
    var e = document.createElement('canvas'); e.width = 7 * s; e.height = 6 * s;
    var x = e.getContext('2d'); x.fillStyle = c;
    rows.forEach(function (r, j) { for (var i = 0; i < 7; i++) if (r[i] === 'X') x.fillRect(i * s, j * s, s, s); });
    x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(1 * s, 1 * s, s, s);
    return (sprites[key] = e);
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  function target() { return reduced ? 8 : Math.round(CFG.maxHearts * Math.min(1.4, (W * H) / (1440 * 900))); }
  function newHeart(anyY) {
    var z = rr(0.4, 1);
    return { x: rr(0, W), y: anyY ? rr(0, H) : H + 20, z: z, s: z > 0.8 ? 3 : 2, vy: rr(0.35, 0.8) * z, ph: rr(0, 6.3), c: pick(COLORS), a: rr(0.35, 0.8) };
  }

  function burst(x, y, n) {
    for (var i = 0; i < (n || 14); i++) {
      var a = rr(0, 6.283), v = rr(1.5, 4.5);
      bits.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, life: rr(40, 70), c: pick(COLORS), s: Math.random() < 0.3 ? 3 : 2, g: 0.08 });
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(3, (now - last) / 16.667) : 1; last = now;
    // сердечки живут в пространстве страницы · hearts live in page space
    var sy = window.scrollY || 0, dsy = lastScroll == null ? 0 : sy - lastScroll; lastScroll = sy;
    var i, h;
    if (dsy) {
      for (i = 0; i < hearts.length; i++) {
        h = hearts[i]; h.y -= dsy * (0.6 + 0.4 * h.z);
        if (h.y < -40 || h.y > H + 40) h.y = (((h.y + 40) % (H + 80)) + H + 80) % (H + 80) - 40;
      }
      for (i = 0; i < bits.length; i++) bits[i].y -= dsy;
    }
    // первый кадр — сердечки сразу по всему экрану, дальше — снизу · first frame fills the screen, later ones rise from the bottom
    var fill = !hearts.length;
    while (hearts.length < target()) hearts.push(newHeart(fill));
    ctx.clearRect(0, 0, W, H);
    for (i = hearts.length - 1; i >= 0; i--) {
      h = hearts[i];
      h.ph += 0.02 * dt; h.y -= h.vy * dt; h.x += Math.sin(h.ph) * 0.35 * dt;
      if (h.y < -30) { hearts[i] = newHeart(false); continue; }
      ctx.globalAlpha = h.a * Math.min(1, (h.y + 30) / 120);
      ctx.drawImage(heartSprite(h.c, h.s), Math.round(h.x), Math.round(h.y));
    }
    for (i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy += b.g * dt; b.vx *= Math.pow(0.97, dt); b.life -= dt;
      if (b.life <= 0) { bits.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, b.life / 30);
      ctx.drawImage(heartSprite(b.c, b.s), Math.round(b.x - 3.5 * b.s), Math.round(b.y - 3 * b.s));
    }
    if (bits.length > 400) bits.splice(0, bits.length - 400);
    ctx.globalAlpha = 1;
  }

  /* ---------- курсор · cursor ---------- */
  var trailT = 0;
  function onMove(e) {
    if (!running || !CFG.trail || reduced || e.pointerType === 'touch') return;
    var now = performance.now();
    if (now - trailT < 45) return;
    trailT = now;
    bits.push({ x: e.clientX + rr(-4, 4), y: e.clientY + rr(-4, 4), vx: rr(-0.4, 0.4), vy: rr(-0.8, -0.2), life: rr(25, 40), c: pick(COLORS), s: 2, g: -0.01 });
  }
  function onDown(e) {
    if (!running || e.button > 0) return;
    if (e.target && e.target.closest && e.target.closest('[data-holiday-egg]')) return;
    burst(e.clientX, e.clientY, reduced ? 5 : 14);
  }

  /* ---------- иконка вкладки · tab icon ---------- */
  var favOld = null, favEl = null;
  var FAV = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#ff2e55" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#fff" fill-opacity=".6" d="M1 1h1v1H1z"/></svg>');
  function favicon(on) {
    if (!CFG.favicon) return;
    favEl = favEl || document.querySelector('link[rel~="icon"]');
    if (!favEl) return;
    if (on) { if (favOld == null) favOld = favEl.getAttribute('href'); favEl.setAttribute('href', FAV); }
    else if (favOld != null) favEl.setAttribute('href', favOld);
  }

  /* ---------- вкл / выкл · on / off ---------- */
  function setOn(on, save) {
    if (on === running) return;
    running = on;
    cv.style.display = on ? '' : 'none';
    btn.style.opacity = on ? '1' : '.55';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    favicon(on);
    if (scene) { if (on) scene.start(); else scene.stop(); }
    logo(on);
    if (on) { last = 0; lastScroll = null; hearts = []; if (!raf) raf = requestAnimationFrame(frame); }
    else { cancelAnimationFrame(raf); raf = 0; hearts = []; bits = []; ctx.clearRect(0, 0, W, H); }
    if (save) {
      if (inSeason()) ls(OFF_KEY, on ? null : 'off');
      else ls(EGG_KEY, on ? '1' : null);
    }
  }

  function boot() {
    cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000';
    ctx = cv.getContext('2d');
    document.body.appendChild(cv);
    resize();
    addEventListener('resize', resize);

    btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'День влюблённых: вкл / выкл · Valentine’s Day on / off';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = '♥';
    btn.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:2147483001;width:40px;height:40px;border-radius:14px;border:1px solid rgba(236,235,230,.16);background:rgba(17,19,22,.82);color:#ff4f6d;font:18px/1 system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:opacity .2s';
    btn.addEventListener('click', function () { setOn(!running, true); });
    document.body.appendChild(btn);

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, true);
    document.addEventListener('visibilitychange', function () {
      if (!running) return;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    });
    // пасхалка: повторные нажатия включают и выключают · easter egg: later presses toggle
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-holiday-egg="valentine"]');
      if (!t) return;
      e.preventDefault();
      setOn(!running, true);
      if (running) { var r = t.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 24); }
    }, true);

    setOn(startOn, false);
    if (CFG.scene !== false) loadScene();
    if (startOn && !inSeason() && !forced) ls(EGG_KEY, '1');
  }

  /* =========================================================
   * Сцена внизу страницы: человечки и сценки · Bottom scene: people and little plays
   * ========================================================= */
  var scene = null;
  var VPAL = { R: '#ff2e55', r: '#c41e44', P: '#ff9ab0', Y: '#ffd23f', G: '#3f9d5a', g: '#2a6f40', w: '#ffffff', W: '#fff4f6', e: '#e0c6cc',
    S: '#f2c29b', K: '#1a1a1a', b: '#a8662e', O: '#d9823b', o: '#5a3a1a', n: '#c8b89a', k: '#3a2a1a' };
  var SPR = {};
  function spr(name, rows) { return SPR[name] || (SPR[name] = scene.api.pair(rows, VPAL)); }
  function bouquet() { return spr('bouquet', ['.R.P.R.', 'RRPPPRR', '.RPYPR.', '..GGG..', '...G...', '..gGg..', '...G...']); }
  function letter() { return spr('letter', ['WWWWWWW', 'WeWWWeW', 'WWeReWW', 'WWWWWWW']); }
  function guitar() { return spr('guitar', ['.OOO......', 'OOoOOnnnnk', 'OOoOO.....', '.OOO......']); }
  function balloonImg() { return spr('balloon', ['.RR...RR.', 'RRRR.RRRR', 'RwRRRRRRR', 'RRRRRRRRR', '.RRRRRRR.', '..RRRRR..', '...RRR...', '....r....']); }
  function cupidImg(f) {
    return f ? spr('cupid2', ['......YYY...', '.....SSSSS..', '.ww..SSKSS.b', 'wwww.SSSSS.b', '.www.SSSSSSb', '..ww.PPPPP.b', '......SSS...', '......S.S...'])
      : spr('cupid1', ['.ww...YYY...', 'wwww.SSSSS..', '.www.SSKSS.b', '..ww.SSSSS.b', '.....SSSSSSb', '.....PPPPP.b', '......SSS...', '......S.S...']);
  }
  function arrowImg() { return spr('arrow', ['.......R.', 'PPbbbbbRR', '.......R.']); }

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#2a0f1c 55%,#3a1226 100%)',
    floor: ['#4a1a2e', '#8a3456'],
    pokeColors: COLORS,
    look: { top: [['#ff4f6d', '#c41e44'], ['#ff9ab0', '#d96a85'], ['#f4f7fb', '#c3cedc'], ['#9b5bd6', '#6a3a9a'], ['#e0245e', '#a01540'], ['#3f6fd8', '#26489a']], dressChance: 0.4 },
    // шарики-сердечки на колышках: по клику улетают · heart balloons on stakes: fly away when clicked
    decor: function (a) {
      var W = a.W();
      [Math.max(90, W * 0.1), W - Math.max(60, W * 0.08)].forEach(function (x, i) {
        a.prop({ x: x, bx: x, y: -64, ph: i * 2, fly: 0,
          step: function (p, dt, t) {
            if (p.fly) { p.y -= 1.3 * dt; p.x += Math.sin(t * 2 + p.ph) * 0.4 * dt; p.fly -= dt; if (p.fly <= 0) { p.fly = 0; p.y = -64; p.x = p.bx; } }
            else p.x = p.bx + Math.sin(t * 1.4 + p.ph) * 3;
          },
          hit: function (p, x, ly) { return !p.fly && Math.abs(x - p.x) < 11 && ly > p.y - 18 && ly < p.y + 2; },
          click: function (p) { p.fly = 600; a.burst(p.x, p.y - 8, { n: 12, img: 'heart', g: -0.01, min: 0.5, max: 2 }); },
          draw: function (ctx, p, fy) {
            var img = balloonImg()[0];
            ctx.strokeStyle = 'rgba(255,220,230,.6)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.fly ? p.x : p.bx, p.fly ? fy + p.y + 16 : fy); ctx.lineTo(p.x, fy + p.y); ctx.stroke();
            if (!p.fly) { ctx.fillStyle = '#6a4430'; ctx.fillRect(p.bx - 1, fy - 6, 2, 6); }
            ctx.drawImage(img, Math.round(p.x - img.width / 2), Math.round(fy + p.y - img.height));
          } });
      });
    },
    events: {
      date: { title: 'Свидание', run: function (a) {
        var W = a.W(), m = W * a.rr(0.3, 0.7), dir = a.pick([-1, 1]);
        var g1 = a.folk(-20), g2 = a.folk(W + 20);
        g1.q = [{ k: 'run', x: m - 13 }, { k: 'until', f: function () { return Math.abs(g2.x - (m + 13)) < 1; } }, { k: 'say', icon: 'heart', n: 80 }, { k: 'wait', n: 30 },
          { k: 'do', f: function () { a.burst(m, -40, { n: 18, img: 'heart', up: true, g: -0.005 }); } }, { k: 'wait', n: 70 }, { k: 'leave', dir: dir, sp: 1 }];
        g2.q = [{ k: 'run', x: m + 13 }, { k: 'wait', n: 40 }, { k: 'say', icon: 'heart', n: 70 },
          { k: 'until', f: function () { return g1.q[0] && g1.q[0].k === 'leave'; } }, { k: 'follow', who: g1 }];
      } },
      flowers: { title: 'Букет', run: function (a) {
        var W = a.W(), m = W * a.rr(0.35, 0.65), fromL = Math.random() < 0.5;
        var rcv = a.folk(fromL ? W + 20 : -20), giv = a.folk(fromL ? -20 : W + 20);
        giv.item = bouquet();
        rcv.q = [{ k: 'run', x: m }, { k: 'until', f: function () { return !giv.item; } }, { k: 'up', n: 50, jump: true }, { k: 'say', icon: 'heart', n: 90 },
          { k: 'until', f: function () { return giv.q[0] && giv.q[0].k === 'leave'; } }, { k: 'follow', who: giv }];
        giv.q = [{ k: 'run', x: m + (fromL ? -16 : 16) }, { k: 'until', f: function () { return Math.abs(rcv.x - m) < 1; } }, { k: 'wait', n: 20 },
          { k: 'do', f: function () { rcv.item = giv.item; giv.item = null; a.burst(m, -30, { n: 14, img: 'heart', up: true, g: -0.005 }); } },
          { k: 'wait', n: 50 }, { k: 'say', icon: 'heart', n: 60 }, { k: 'wait', n: 60 }, { k: 'leave', dir: fromL ? -1 : 1, sp: 1.1 }];
      } },
      cupid: { title: 'Купидон', run: function (a) {
        var W = a.W(), dir = a.pick([-1, 1]), sp = 0.9;
        var g1 = a.folk(dir > 0 ? -20 : W + 20, null, sp), g2 = a.folk(dir > 0 ? -46 : W + 46, null, sp);
        g1.q = [{ k: 'leave', dir: dir, sp: sp }];
        g2.q = [{ k: 'follow', who: g1, gap: 22 }];
        var hit = function (x) {
          a.burst(x, -30, { n: 22, img: 'heart', up: true, g: -0.005 });
          [g1, g2].forEach(function (g) { g.q.unshift({ k: 'up', n: 40, jump: true }, { k: 'say', icon: 'heart', n: 90 }); });
        };
        a.prop({ x: dir > 0 ? W + 30 : -30, y: -110, front: true,
          step: function (p, dt, t) {
            p.x -= dir * 1.7 * dt; p.y = -110 + Math.sin(t * 3) * 6;
            if (!p.shot && Math.abs(p.x - g1.x) < 110 && g1.x > 30 && g1.x < W - 30) {
              p.shot = true;
              var tx = (g1.x + g2.x) / 2 + dir * sp * 40, n = 40, y0 = p.y - 8;
              a.prop({ x: p.x, y: y0, vx: (tx - p.x) / n, vy: (-24 - y0 - 0.025 * n * n) / n, front: true,
                step: function (q, dt2) { q.x += q.vx * dt2; q.y += q.vy * dt2; q.vy += 0.05 * dt2; if (q.y > -24) { q.gone = true; hit(q.x); } },
                draw: function (ctx, q, fy) { var im = arrowImg()[0]; ctx.save(); ctx.translate(q.x, fy + q.y); ctx.rotate(Math.atan2(q.vy, q.vx)); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore(); } });
            }
            if (p.x < -40 || p.x > W + 40) p.gone = true;
          },
          draw: function (ctx, p, fy, t) { var im = cupidImg(Math.floor(t * 6) % 2)[dir > 0 ? 1 : 0]; ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y)); } });
      } },
      letter: { title: 'Валентинка', run: function (a) {
        var W = a.W(), m = W * a.rr(0.3, 0.7);
        var rcv = a.folk(W + 20), post = a.folk(-20, { top: ['#3f6fd8', '#26489a'], bottom: '#26324a', style: 'cap', cap: '#26489a', dress: false }, 1.9);
        post.item = letter();
        rcv.q = [{ k: 'run', x: m + 12 }, { k: 'until', f: function () { return !post.item; } }, { k: 'wait', n: 20 }, { k: 'say', icon: 'heart', n: 90 },
          { k: 'do', f: function () { a.burst(rcv.x, -36, { n: 24, img: 'heart', up: true, g: -0.005 }); } }, { k: 'up', n: 60, jump: true }, { k: 'leave', dir: 1, sp: 1.6 }];
        post.q = [{ k: 'run', x: m - 12 }, { k: 'until', f: function () { return Math.abs(rcv.x - (m + 12)) < 1; } }, { k: 'wait', n: 15 },
          { k: 'do', f: function () { rcv.item = post.item; post.item = null; } }, { k: 'say', icon: 'star', n: 50 }, { k: 'wait', n: 30 }, { k: 'leave', dir: -1, sp: 2 }];
      } },
      serenade: { title: 'Серенада', run: function (a) {
        var W = a.W(), m = W * a.rr(0.25, 0.5), playing = false;
        var mus = a.folk(-20, { dress: false }), lis = a.folk(W + 20);
        mus.item = guitar();
        mus.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'do', f: function () { playing = true; } },
          { k: 'until', f: function () { return lis.q[0] && lis.q[0].k === 'leave'; } }, { k: 'do', f: function () { playing = false; } }, { k: 'follow', who: lis }];
        lis.q = [{ k: 'run', x: m + 56 }, { k: 'dance', n: 240 }, { k: 'say', icon: 'heart', n: 80 }, { k: 'run', x: function () { return mus.x + 14; } }, { k: 'wait', n: 30 }, { k: 'leave', dir: 1 }];
        a.prop({ step: function (p) {
          if (playing && Math.random() < 0.05) a.burst(mus.x + 8, -34, { n: 1, img: 'note', up: true, g: -0.004, min: 0.3, max: 0.8, life: 60 });
          if (mus.gone) p.gone = true;
        } });
      } }
    }
  };
  // праздничный логотип поверх [data-winter-logo] · holiday logo over [data-winter-logo]
  var LOGOS = ['hearts', 'arrow'], logoName = null;
  function logo(on) {
    if (CFG.logo === false) return;
    if (!on) { if (window.siteHolidayLogo) siteHolidayLogo.hide(); return; }
    if (!document.querySelector('[data-winter-logo],[data-holiday-logo]')) return;
    need('logo', function () {
      if (!running) return;
      logoName = logoName || LOGOS[Math.random() * LOGOS.length | 0];
      siteHolidayLogo.show(BASE + 'img/valentine-logo-' + logoName + '.svg?v=' + PKG, [-30, -270, 660, 340]);
    });
  }
  // подгрузить общий файл пакета (scene / logo) · load a shared package file (scene / logo)
  var needs = {};
  function need(name, cb) {
    var g = name === 'scene' ? 'siteHolidayScene' : 'siteHolidayLogo';
    if (window[g]) { cb(); return; }
    if (needs[name]) { needs[name].push(cb); return; }
    needs[name] = [cb];
    var s = document.createElement('script');
    s.src = BASE + 'holidays/' + name + '.js?v=' + PKG;
    s.onload = function () { needs[name].forEach(function (f) { f(); }); };
    (document.head || document.documentElement).appendChild(s);
  }
  function loadScene() {
    need('scene', function () {
      if (scene) return;
      scene = window.siteHolidayScene(THEME);
      if (running) scene.start();
    });
  }

  window.ftValentine = {
    event: function (id) { return scene ? scene.event(id) : false; },
    events: function () { return scene ? scene.events() : []; },
    sim: function (n) { if (scene) scene.sim(n); },
    scene: function () { return scene; },
    logo: function (name) { if (name) { logoName = name; if (running) logo(true); } return logoName; },
    version: VERSION,
    on: function () { setOn(true, true); },
    off: function () { setOn(false, true); },
    burst: function (x, y) { burst(x == null ? W / 2 : x, y == null ? H / 2 : y, 30); },
    state: function () { return { running: running, hearts: hearts.length, bits: bits.length, inSeason: inSeason(), scene: scene ? scene.state() : null }; }
  };

  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
