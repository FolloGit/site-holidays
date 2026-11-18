/*!
 * site-holidays · holidays/lunar.js 1.0.0
 * Китайский Новый год / Chinese (Lunar) New Year — FolloTeam · https://folloteam.ru
 *
 * RU  Красные фонарики качаются под шапкой сайта, сверху падают золотые монетки и красные конверты
 *     (уезжают вместе со страницей при прокрутке), клик — хлопушка с золотыми искрами,
 *     иконка вкладки — фонарик. Дата праздника каждый год своя (лунный календарь), см. DATES.
 *     Модуль пакета site-holidays: загрузчик подгружает его с 2 дней до праздника по 7 день после.
 *
 * EN  Red lanterns sway under the site header, gold coins and red envelopes fall from the top
 *     (scrolling with the page), a click pops a firecracker with gold sparks, the tab icon becomes
 *     a lantern. The date changes every year (lunar calendar), see DATES.
 *     A module of the site-holidays package: the loader pulls it in from 2 days before to 7 days after.
 *
 * Адрес / URL:   ?holiday=lunar · ?holiday=off
 * Разметка / Markup:   data-holiday-egg="lunar" — невидимая кнопка-пасхалка · hidden easter-egg toggle
 *
 * Настройки / Options (SITE_HOLIDAYS.lunar):
 *   { logo: false,      // не подменять логотип >>FT_ · keep the >>FT_ logo
 *     favicon: false,       // не менять иконку вкладки · keep the tab icon
 *     lanterns: false,      // без фонариков · no lanterns
 *     garland: 'header',    // под каким элементом висят фонарики · element the lanterns hang under
 *     scene: false }        // без сцены с человечками внизу · no people scene at the bottom
 *
 * Сцена / Scene (holidays/scene.js): танец дракона, хлопушки, красные конверты, танец льва,
 *   небесные фонарики; гирлянда фонариков на столбах · dragon dance, firecrackers, red envelopes,
 *   lion dance, sky lanterns; a string of lanterns on posts
 *
 * Консоль / Console:   ftLunar.on() · off() · pop(x, y) · event('dragon') · events() · state() · version
 */
(function () {
  'use strict';
  if (window.ftLunar) return;
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/holidays\/lunar\.js.*$/, '') : 'assets/holidays/';

  var VERSION = '1.0.0';
  // версия пакета для общих файлов (сбрасывает кэш при обновлении) · package version for shared files (busts the cache on update)
  var PKG = (window.siteHolidays && window.siteHolidays.version) || VERSION;
  // Первый день лунного года (месяц 1–12, день) · First day of the lunar year (month 1–12, day)
  var DATES = { 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23], 2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8], 2036: [1, 28] };
  var ANIMALS = [['Крыса', 'Rat'], ['Бык', 'Ox'], ['Тигр', 'Tiger'], ['Кролик', 'Rabbit'], ['Дракон', 'Dragon'], ['Змея', 'Snake'],
    ['Лошадь', 'Horse'], ['Коза', 'Goat'], ['Обезьяна', 'Monkey'], ['Петух', 'Rooster'], ['Собака', 'Dog'], ['Свинья', 'Pig']];

  var CFG = { favicon: true, lanterns: true, garland: 'header' };
  var user = (window.SITE_HOLIDAYS && window.SITE_HOLIDAYS.lunar) || {};
  for (var k in user) if (Object.prototype.hasOwnProperty.call(user, k)) CFG[k] = user[k];

  var OFF_KEY = 'ftLunar', EGG_KEY = 'ftLunarEgg';
  var RED = '#e8292b', DRED = '#9e1416', GOLD = '#ffcc3f', DGOLD = '#c98f12';
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { return null; }
  }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.random() * a.length | 0]; }
  function newYear(y) { var d = DATES[y]; return d ? new Date(y, d[0] - 1, d[1]) : null; }
  function inSeason(d) {
    d = d || new Date();
    var ny = newYear(d.getFullYear());
    if (!ny) return false;
    var days = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - ny) / 864e5);
    return days >= -2 && days <= 7;
  }
  function animal(d) {
    d = d || new Date();
    var y = d.getFullYear(), ny = newYear(y);
    if (ny && d < ny) y--;
    return ANIMALS[(((y - 4) % 12) + 12) % 12];
  }

  var forced = /[?&]holiday=lunar\b/.test(location.search);
  var startOn = forced || (inSeason() ? ls(OFF_KEY) !== 'off' : ls(EGG_KEY) === '1');

  /* ---------- спрайты · sprites ---------- */
  var P = 3, sprites = {};
  function sprite(name, rows, pal) {
    if (sprites[name]) return sprites[name];
    var e = document.createElement('canvas'); e.width = rows[0].length * P; e.height = rows.length * P;
    var x = e.getContext('2d');
    rows.forEach(function (r, j) { for (var i = 0; i < r.length; i++) if (pal[r[i]]) { x.fillStyle = pal[r[i]]; x.fillRect(i * P, j * P, P, P); } });
    return (sprites[name] = e);
  }
  var PAL = { R: RED, r: DRED, Y: GOLD, y: DGOLD, w: '#fff3c4' };
  function lanternSpr() {
    return sprite('lantern', [
      '....y....', '...yyy...', '..YYYYY..', '.RRrRrRR.', 'RRrRRRrRR', 'RrRRwRRrR', 'RrRwYwRrR', 'RrRRwRRrR', 'RRrRRRrRR', '.RRrRrRR.', '..YYYYY..', '...y.y...', '...Y.Y...', '...Y.Y...'], PAL);
  }
  function coinSpr() { return sprite('coin', ['.YYYY.', 'YyyyyY', 'Yy..yY', 'Yy..yY', 'YyyyyY', '.YYYY.'], PAL); }
  function envSpr() { return sprite('env', ['RRRRRR', 'RrYYrR', 'RRYYRR', 'RRRRRR', 'RRRRRR', 'RRRRRR', 'RRRRRR'], PAL); }

  /* ---------- холст и кнопка · canvas and button ---------- */
  var cv, ctx, btn, W = 0, H = 0, DPR = 1, raf = 0, last = 0, T = 0, running = false;
  var drops = [], sparks = [], lanterns = [], lastScroll = null, topY = 0;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;
    var n = Math.max(2, Math.min(7, Math.round(W / 260)));
    lanterns = [];
    for (var i = 0; i < n; i++) lanterns.push({ x: W * (i + 0.5) / n, len: rr(14, 40), ph: rr(0, 6.3), sw: 0 });
  }
  // фонарики висят под шапкой сайта (если она есть и видна) · lanterns hang under the header (when present and visible)
  function hangY() {
    var el = CFG.garland && document.querySelector(CFG.garland);
    if (!el) return 0;
    var r = el.getBoundingClientRect();
    return r.bottom > 0 ? r.bottom : -999;
  }
  function newDrop(anyY) {
    var env = Math.random() < 0.35;
    return { x: rr(0, W), y: anyY ? rr(-H, H) : rr(-80, -20), vy: rr(0.6, 1.4), ph: rr(0, 6.3), rot: rr(-0.3, 0.3), env: env, a: rr(0.55, 0.9) };
  }

  function pop(x, y, n) {
    n = n || 26;
    for (var i = 0; i < n; i++) {
      var a = rr(0, 6.283), v = rr(1.5, 5.5);
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rr(30, 60), c: Math.random() < 0.7 ? GOLD : RED });
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(3, (now - last) / 16.667) : 1; last = now; T += dt / 60;
    var sy = window.scrollY || 0, dsy = lastScroll == null ? 0 : sy - lastScroll; lastScroll = sy;
    var i;
    if (dsy) { for (i = 0; i < drops.length; i++) drops[i].y -= dsy; for (i = 0; i < sparks.length; i++) sparks[i].y -= dsy; }
    var want = reduced ? 6 : Math.round(22 * Math.min(1.4, (W * H) / (1440 * 900)));
    var fill = !drops.length;
    while (drops.length < want) drops.push(newDrop(fill));
    ctx.clearRect(0, 0, W, H);

    // монетки и конверты · coins and envelopes
    for (i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.ph += 0.03 * dt; d.y += d.vy * dt; d.x += Math.sin(d.ph) * 0.5 * dt;
      if (d.y > H + 40 || d.y < -H - 100) { drops[i] = newDrop(false); continue; }
      var img = d.env ? envSpr() : coinSpr();
      ctx.save(); ctx.globalAlpha = d.a; ctx.translate(Math.round(d.x), Math.round(d.y));
      if (d.env) ctx.rotate(d.rot + Math.sin(d.ph) * 0.25); else ctx.scale(Math.max(0.15, Math.abs(Math.cos(d.ph * 1.6))), 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
    }

    // фонарики · lanterns
    if (CFG.lanterns) {
      topY = hangY();
      if (topY > -999) {
        var L = lanternSpr();
        for (i = 0; i < lanterns.length; i++) {
          var l = lanterns[i];
          l.sw *= Math.pow(0.97, dt);
          var ang = Math.sin(T * 1.3 + l.ph) * 0.08 + Math.sin(T * 5) * l.sw;
          ctx.save(); ctx.translate(l.x, topY);
          ctx.rotate(ang);
          ctx.fillStyle = DGOLD; ctx.fillRect(-0.5, 0, 1, l.len);
          ctx.globalAlpha = 0.25 + 0.1 * Math.sin(T * 3 + l.ph);
          var g = ctx.createRadialGradient(0, l.len + L.height / 2, 2, 0, l.len + L.height / 2, 40);
          g.addColorStop(0, '#ff9a3c'); g.addColorStop(1, 'rgba(255,90,40,0)');
          ctx.fillStyle = g; ctx.fillRect(-40, l.len + L.height / 2 - 40, 80, 80);
          ctx.globalAlpha = 1;
          ctx.drawImage(L, -L.width / 2, l.len);
          ctx.restore();
        }
      }
    }

    // искры · sparks
    ctx.globalCompositeOperation = 'lighter';
    for (i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 0.09 * dt; s.vx *= Math.pow(0.97, dt); s.life -= dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, s.life / 25);
      ctx.fillStyle = s.c; ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
    }
    if (sparks.length > 600) sparks.splice(0, sparks.length - 600);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- курсор · cursor ---------- */
  function lanternAt(x, y) {
    if (!CFG.lanterns || topY <= -999) return null;
    var L = lanternSpr();
    for (var i = 0; i < lanterns.length; i++) {
      var l = lanterns[i];
      if (Math.abs(x - l.x) < L.width / 2 + 4 && y > topY && y < topY + l.len + L.height + 4) return l;
    }
    return null;
  }
  function onMove(e) {
    if (!running || e.pointerType === 'touch') return;
    var l = lanternAt(e.clientX, e.clientY);
    if (l && l.sw < 0.05) l.sw = 0.25;                 // задел фонарик — качнулся · brushed a lantern: it swings
  }
  function onDown(e) {
    if (!running || e.button > 0) return;
    if (e.target && e.target.closest && e.target.closest('[data-holiday-egg]')) return;
    var l = lanternAt(e.clientX, e.clientY);
    if (l) { l.sw = 0.45; pop(l.x, topY + l.len + 20, 18); return; }
    pop(e.clientX, e.clientY, reduced ? 8 : 26);
  }

  /* ---------- иконка вкладки · tab icon ---------- */
  var favOld = null, favEl = null;
  var FAV = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 12" shape-rendering="crispEdges"><path fill="' + GOLD + '" d="M3 0h3v1H3zM2 1h5v1H2zM2 10h5v1H2zM3 11h1v1H3zM5 11h1v1H5z"/><path fill="' + RED + '" d="M1 2h7v1h1v6H8v1H1V9H0V3h1z"/><path fill="' + DRED + '" d="M2 3h1v6H2zM6 3h1v6H6z"/><path fill="' + GOLD + '" d="M4 5h1v2H4z"/></svg>');
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
    // класс на <html>, пока праздник включён · class on <html> while the holiday is on
    document.documentElement.classList.toggle('ft-holiday-on', on);
    document.documentElement.classList.toggle('ft-lunar-on', on);
    if (scene) { if (on) scene.start(); else scene.stop(); }
    logo(on);
    if (on) { last = 0; lastScroll = null; drops = []; if (!raf) raf = requestAnimationFrame(frame); }
    else { cancelAnimationFrame(raf); raf = 0; drops = []; sparks = []; ctx.clearRect(0, 0, W, H); }
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
    ctx = cv.getContext('2d');
    document.body.appendChild(cv);
    resize();
    addEventListener('resize', resize);

    var an = animal();
    btn = document.createElement('button');
    btn.type = 'button';
    // как у кнопки зимы: сайты уже умеют её переставлять · same as the winter button: sites already know how to place it
    btn.setAttribute('data-winter-ignore', ''); btn.setAttribute('data-holiday-btn', 'lunar');
    btn.title = 'Китайский Новый год — год: ' + an[0] + '. Вкл / выкл · Lunar New Year — Year of the ' + an[1] + '. On / off';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = '福';                      // 福 — «счастье» · "good fortune"
    btn.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:2147483001;width:40px;height:40px;border-radius:14px;border:1px solid rgba(255,204,63,.35);background:rgba(158,20,22,.88);color:' + GOLD + ';font:700 18px/1 system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:opacity .2s';
    btn.addEventListener('click', function () { setOn(!running, true); });
    document.body.appendChild(btn);

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, true);
    document.addEventListener('visibilitychange', function () {
      if (!running) return;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    });
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-holiday-egg="lunar"]');
      if (!t) return;
      e.preventDefault();
      setOn(!running, true);
      if (running) { var r = t.getBoundingClientRect(); pop(r.left + r.width / 2, r.top + r.height / 2, 40); }
    }, true);

    setOn(startOn, false);
    if (CFG.scene !== false) loadScene();
    if (startOn && !inSeason() && !forced) ls(EGG_KEY, '1');
  }

  /* =========================================================
   * Сцена внизу страницы: человечки и сценки · Bottom scene: people and little plays
   * ========================================================= */
  var scene = null;
  var LPAL = { R: RED, r: DRED, Y: GOLD, y: DGOLD, w: '#ffffff', W: '#ffffff', K: '#1a1a1a', O: '#ff8a2a', o: '#c45e12', b: '#6a4430', G: '#3f9d5a' };
  var SPR = {};
  function spr(name, rows) { return SPR[name] || (SPR[name] = scene.api.pair(rows, LPAL)); }
  function dHead() { return spr('dhead', ['.......YY.......', '......YRRY......', '....RRRRRRR.....', '...RRRRRRwKR....', '..RRRRRRRRRRRR..', '.YRRRRRRRRRRRRRw', 'YYRRRRRRRRRWWWWW', '.YRRRRRRRRRRRRR.', '..RRRRRRRRYY....', '...YYYYYYY......']); }
  function dSeg() { return spr('dseg', ['..YYYY..', '.RRRRRR.', 'RRYRRYRR', 'RRRRRRRR', 'RRYRRYRR', '.RRRRRR.', '..YYYY..']); }
  function dTail() { return spr('dtail', ['YY....', 'RRRY..', 'RRRRRY', 'RRRY..', 'YY....']); }
  function envImg() { return spr('env', ['RRRRR', 'RYYYR', 'RRYRR', 'RRRRR', 'RRRRR']); }
  function drumImg() { return spr('drum', ['.YYYYY.', 'RRRRRRR', 'RYRRRYR', 'RRRRRRR', '.YYYYY.']); }
  function skyLantern() { return spr('sky', ['.OOO.', 'OOOOO', 'OoOoO', 'OOOOO', 'OOOOO', '.YYY.']); }
  function lionImg() { return spr('lion', ['..........YYYY......', '.........YRRRRY.....', '........YRRwKRRY....', '.YY.....RRRRRRRRWW..', 'RRRRRRRRRRRRRRRRWWW.', 'RYRYRYRYRRRRRRRRRR..', 'RRRRRRRRRRRRRRRRY...', '.RRRRRRRRRRRRRRY....', '..YYYYYYYYYYYY......']); }
  function hangLantern(ctx, x, y, t, ph) {
    var L = lanternSpr(), k = 0.5, w = L.width * k, h = L.height * k, a = Math.sin(t * 1.5 + ph) * 0.1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.globalAlpha = 0.3; ctx.drawImage(scene.api.glow('#ff7a2a'), -18, h / 2 - 18, 36, 36); ctx.globalAlpha = 1;
    ctx.drawImage(L, -w / 2, 0, w, h); ctx.restore();
  }

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#2a0d0a 55%,#3a120c 100%)',
    floor: ['#3b1a10', '#9a4a1e'],
    pokeColors: [GOLD, RED, '#ffffff', '#ff8a2a'],
    look: { top: [[RED, DRED], [GOLD, DGOLD], ['#3f9d5a', '#2a6f40'], ['#2f5fb8', '#1f3f80'], ['#e8292b', '#9e1416']], hair: ['#1a1a1a', '#2a1d16', '#3a2a22'], dressChance: 0.3 },
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
          for (i = 1; i < n; i++) { var u2 = i / n; hangLantern(ctx, x1 + (x2 - x1) * u2, fy + top + Math.sin(u2 * Math.PI) * 22, t + p.swing * Math.sin(t * 9) * 3, i); }
        } });
    },
    events: {
      dragon: { title: 'Танец дракона', run: function (a) {
        var W = a.W(), dir = a.pick([-1, 1]), N = 6, gap = 22, sp = 1.5, crew = [];
        for (var i = 0; i < N; i++) {
          var x0 = dir > 0 ? -30 - i * gap : W + 30 + i * gap;
          var g = a.folk(x0, { top: [GOLD, DGOLD], bottom: RED, dress: false, style: 'short' }, sp);
          g.q = [{ k: 'run', x: x0 + dir * (W + 60 + N * gap) }, { k: 'gone' }];
          crew.push(g);
        }
        a.prop({ front: true, roar: 0,
          step: function (p, dt, t) {
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
              var y = fy + p.segY(i, t), im = i === 0 ? dHead()[fl] : i === N - 1 ? dTail()[fl] : dSeg()[fl];
              if (i > 0) {                          // промежуточные кольца · in-between rings
                var gp = crew[i - 1], mx = (g.x + gp.x) / 2 + dir * 6, my = fy + (p.segY(i, t) + p.segY(i - 1, t)) / 2, sg = dSeg()[fl];
                ctx.drawImage(sg, Math.round(mx - sg.width / 2), Math.round(my - sg.height / 2));
              }
              var dy = i === 0 && p.roar ? -Math.abs(Math.sin(p.roar * 0.4)) * 6 : 0;
              ctx.drawImage(im, Math.round(g.x + dir * 6 - im.width / 2), Math.round(y - im.height / 2 + dy));
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
        var away = m + side * 95;
        lighter.q = [{ k: 'run', x: m + 2 + side * 4 }, { k: 'face', x: m + 10 }, { k: 'wait', n: 30 },
          { k: 'do', f: function () { pole.lit = true; } }, { k: 'say', icon: 'bang', n: 40 }, { k: 'run', x: away, sp: 2.6 },
          { k: 'until', f: function () { return pole.count === 0; } }, { k: 'say', icon: 'star', n: 60 }, { k: 'dance', n: 90 }, { k: 'leave', dir: side }];
        var fan = a.folk(side < 0 ? W + 20 : -20);
        fan.q = [{ k: 'run', x: m - side * 110 }, { k: 'face', x: m }, { k: 'until', f: function () { return pole.lit; } },
          { k: 'up', n: 1 }, { k: 'until', f: function () { if (pole.count) fan.pose = 'up'; return pole.count === 0; } }, { k: 'up', n: 60, jump: true }, { k: 'leave', dir: -side }];
      } },
      envelopes: { title: 'Красные конверты', run: function (a) {
        var W = a.W(), m = W * a.rr(0.3, 0.6), kids = [];
        var elder = a.folk(-20, { hair: '#d8d8d8', top: [RED, DRED], bottom: '#2a1a14', style: 'short', dress: false }, 0.9);
        elder.q = [{ k: 'run', x: m }, { k: 'face', x: W }, { k: 'until', f: function () { return kids.every(function (k) { return k.got; }); } },
          { k: 'wait', n: 40 }, { k: 'say', icon: 'heart', n: 70 }, { k: 'wait', n: 50 }, { k: 'leave', dir: -1, sp: 0.9 }];
        for (var i = 0; i < 3; i++) (function (i) {
          var kid = a.folk(W + 20 + i * 26, null, 1.6);
          kids.push(kid);
          kid.q = [{ k: 'run', x: m + 18 + i * 20 }, { k: 'until', f: function () { return Math.abs(elder.x - m) < 1 && (i === 0 || kids[i - 1].got); } },
            { k: 'run', x: m + 18 }, { k: 'wait', n: 20 },
            { k: 'do', f: function () { kid.item = envImg(); kid.got = true; elder.pose = 'up'; a.burst(m + 10, -30, { n: 8, img: 'coin', up: true, g: 0.05, min: 1, max: 2.5 }); } },
            { k: 'up', n: 40, jump: true }, { k: 'say', icon: 'coin', n: 60 }, { k: 'leave', dir: 1, sp: 1.9 }];
        })(i);
      } },
      lion: { title: 'Танец льва', run: function (a) {
        var W = a.W(), dir = a.pick([-1, 1]), sp = 1.1, fl = dir > 0 ? 0 : 1;
        var drummer = a.folk(dir > 0 ? -20 : W + 20, { top: [RED, DRED], dress: false }, sp);
        drummer.item = drumImg();
        drummer.q = [{ k: 'leave', dir: dir, sp: sp }];
        a.prop({ x: dir > 0 ? -90 : W + 90, jump: 0, vy: 0, h: 0, front: true,
          step: function (p, dt, t) {
            p.x += dir * sp * dt;
            if (p.jump > 0 || p.h < 0) { p.vy += 0.35 * dt; p.h += p.vy * dt; if (p.h >= 0) { p.h = 0; p.vy = 0; p.jump = 0; } }
            else if (Math.random() < 0.006) { p.vy = -4; p.jump = 1; p.h = -0.1; }
            if (Math.random() < 0.03 && !drummer.gone) a.say(drummer, 'bang', 18);
            if ((dir > 0 && p.x > W + 100) || (dir < 0 && p.x < -100)) p.gone = true;
          },
          hit: function (p, x, ly) { return Math.abs(x - p.x) < 22 && ly > -30 + p.h && ly < 0; },
          click: function (p) { p.vy = -6; p.jump = 1; p.h = -0.1; a.burst(p.x, -26, { n: 10, img: 'coin', up: true, g: 0.05, min: 1.5, max: 3 }); },
          draw: function (ctx, p, fy, t) {
            var im = lionImg()[fl], bob = Math.sin(t * 10) * 1.5, y = fy + p.h + bob - 10;
            ctx.fillStyle = GOLD;                        // ноги двух танцоров · legs of the two dancers
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
          g.item = skyLantern();
          g.q = [{ k: 'run', x: m + (i - 1) * 34 }, { k: 'face', x: m + (i - 1) * 34 + (fromL ? 1 : -1) }, { k: 'wait', n: 40 + i * 30 },
            { k: 'do', f: function () {
              g.item = null;
              a.prop({ x: g.x, y: -40, ph: Math.random() * 6, front: true,
                step: function (p, dt, t) { p.y -= 0.85 * dt; p.x += Math.sin(t * 1.3 + p.ph) * 0.25 * dt; if (a.floor() + p.y < -60 || p.y < -2400) p.gone = true; },
                draw: function (ctx, p, fy, t) {
                  var im = skyLantern()[0];
                  ctx.globalAlpha = 0.45 + 0.15 * Math.sin(t * 5 + p.ph); ctx.drawImage(a.glow('#ff9a3c'), p.x - 18, fy + p.y - 22, 36, 36); ctx.globalAlpha = 1;
                  ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy + p.y - im.height));
                } });
            } },
            { k: 'up', n: 70 }, { k: 'say', icon: i === 1 ? 'heart' : 'star', n: 70 }, { k: 'wait', n: 90 }, { k: 'leave', dir: fromL ? -1 : 1 }];
        })(i);
      } }
    }
  };
  // праздничный логотип поверх [data-winter-logo] · holiday logo over [data-winter-logo]
  var LOGOS = ['lanterns', 'coins'], logoName = null;
  function logo(on) {
    if (CFG.logo === false) return;
    if (!on) { if (window.siteHolidayLogo) siteHolidayLogo.hide(); return; }
    if (!document.querySelector('[data-winter-logo],[data-holiday-logo]')) return;
    need('logo', function () {
      if (!running) return;
      logoName = logoName || LOGOS[Math.random() * LOGOS.length | 0];
      siteHolidayLogo.show(BASE + 'img/lunar-logo-' + logoName + '.svg?v=' + PKG, [-30, -270, 660, 340]);
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

  window.ftLunar = {
    event: function (id) { return scene ? scene.event(id) : false; },
    events: function () { return scene ? scene.events() : []; },
    sim: function (n) { if (scene) scene.sim(n); },
    scene: function () { return scene; },
    logo: function (name) { if (name) { logoName = name; if (running) logo(true); } return logoName; },
    version: VERSION,
    on: function () { setOn(true, true); },
    off: function () { setOn(false, true); },
    pop: function (x, y) { pop(x == null ? W / 2 : x, y == null ? H / 2 : y, 50); },
    state: function () { return { running: running, drops: drops.length, sparks: sparks.length, lanterns: lanterns.length, inSeason: inSeason(), animal: animal()[0], scene: scene ? scene.state() : null }; }
  };

  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
