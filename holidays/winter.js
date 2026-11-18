/*!
 * site-holidays · holidays/winter.js 2.0.0
 * Зимний режим сайта / Winter mode for websites — FolloTeam · https://folloteam.ru
 *
 * RU  Снег, сугробы на блоках, гирлянда, новогодний логотип, сцена с ёлкой внизу,
 *     гномики со случайными событиями и мини-игра. Модуль пакета site-holidays:
 *     его подгружает загрузчик site-holidays.js, когда нужна зима (1 декабря – конец февраля).
 *     Скрипт ничего не знает о вёрстке сайта: сам находит, на что ложится снег (кнопки, карточки,
 *     панели, картинки), учитывает скругления углов. Новые страницы подхватываются автоматически.
 *
 * EN  Snow, snow piles on page blocks, a garland, a New Year logo, a scene with a tree at the bottom,
 *     gnomes with random events and a mini-game. A module of the site-holidays package: the
 *     site-holidays.js loader pulls it in when winter is due (December 1 – end of February).
 *     The script knows nothing about the site's markup: it finds where snow can settle (buttons,
 *     cards, panels, images) on its own and respects rounded corners. New pages just work.
 *
 * Подключение / Include:   <script src="assets/holidays/site-holidays.js" defer></script>
 *
 * Адрес / URL:
 *   ?holiday=winter | ?holiday=off  — включить / выключить (from the loader) · force on / off
 *   ?winter=1 | ?winter=0           — то же, старый вариант · same, legacy
 *   ?gnomes=1                       — сразу слепить снеговика · build a snowman right away
 *
 * Разметка / Markup:
 *   data-winter-ignore              — снег здесь не копится · no snow piles on this element
 *   data-winter-logo="#accent"      — текстовый «>>FT_» становится новогодним · text mark becomes festive
 *   data-holiday-egg="winter"       — невидимая кнопка-пасхалка · hidden easter-egg toggle
 *
 * Настройки / Options (window.FT_WINTER или / or SITE_HOLIDAYS.winter):
 *   {
 *     months: [12, 1, 2],              // месяцы работы · active months
 *     img: 'assets/holidays/img/',     // картинки · image folder (default: next to holidays/)
 *     favicon: false,                  // не менять иконку вкладки · keep the tab icon
 *     logo: false,                     // не подменять логотип · keep the logo
 *     garland: 'header',               // где висит гирлянда · element the garland hangs under
 *     ignore: '[data-winter-ignore]',  // где снег не копится · where snow never settles
 *     maxFlakes: 260                   // снежинок в метель на 1440×900 · flakes in a blizzard at 1440×900
 *   }
 *
 * Консоль / Console:
 *   ftWinter.on() · off() · event('tea') · events() · openGift() · logo('santa') ·
 *   weather('calm'|'snow'|'blizzard') · sim(frames) · state() · version
 *
 * События сами запускаются случайно / Events start on their own at random:
 *   build, repair, snowballs, sled, prank, gifts, tea, loot, calendar (полночь · midnight),
 *   party (новогодняя ночь · New Year's night), santa, fireworks.
 */
(function () {
  'use strict';
  if (window.__ftWinter) return;
  window.__ftWinter = true;

  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/holidays\/winter\.js.*$/, '') : 'assets/holidays/';
  var CFG = {
    months: [12, 1, 2],
    img: BASE + 'img/',                 // где лежат картинки плагина · where plugin images live
    favicon: null,                      // по умолчанию — img + 'winter-favicon.svg' · default: img + 'winter-favicon.svg'
    garland: 'header',
    ignore: '[data-winter-ignore]',
    maxFlakes: 260
  };
  var user = window.FT_WINTER || {};
  for (var k in user) if (Object.prototype.hasOwnProperty.call(user, k)) CFG[k] = user[k];
  if (CFG.favicon == null) CFG.favicon = CFG.img + 'winter-favicon.svg';
  var VERSION = '2.0.0';

  /* ---------- когда включаться · when to turn on ---------- */
  var q = /[?&]winter=(0|1)/.exec(location.search);
  var qh = /[?&]holiday=([a-z0-9_-]+)/.exec(location.search);      // ?holiday=winter / ?holiday=off от загрузчика · ?holiday=winter / ?holiday=off from the loader
  if (!q && qh) q = [qh[0], qh[1] === 'winter' ? '1' : '0'];
  var inSeason = CFG.months.indexOf(new Date().getMonth() + 1) >= 0;
  var forceGnomes = /[?&]gnomes=1/.test(location.search);
  function ls(key) {
    return {
      get: function () { try { return localStorage.getItem(key); } catch (e) { return null; } },
      set: function (v) { try { if (v) localStorage.setItem(key, v); else localStorage.removeItem(key); } catch (e) {} }
    };
  }
  var store = ls('ftWinter');        // в сезон: 'off' — посетитель выключил · in season: 'off' means the visitor turned it off
  var egg = ls('ftWinterEgg');       // вне сезона: '1' — включено пасхалкой · off season: '1' means enabled via the easter egg
  function wantOn() {
    if (q) return q[1] === '1';
    return inSeason ? store.get() !== 'off' : egg.get() === '1';
  }
  function setOn(on) {
    if (inSeason) store.set(on ? 'on' : 'off'); else egg.set(on ? '1' : '');
    if (on) { setup(); start(); } else if (running) stop();
  }

  /* ---------- пасхалка: [data-winter-egg] · easter egg: [data-winter-egg] ---------- */
  (function installEgg() {
    var st = document.createElement('style');
    st.textContent = '[data-winter-egg],[data-holiday-egg="winter"]{position:relative;align-self:center;display:inline-block;flex:none;width:28px;height:28px;margin:-6px 0 -6px -30px;padding:0;border:0;background:transparent;cursor:default;vertical-align:middle;-webkit-tap-highlight-color:transparent}' +
      '[data-winter-egg]:focus,[data-holiday-egg]:focus{outline:none}' +
      '[data-winter-egg]::after,[data-holiday-egg="winter"]::after{content:"\\2744\\FE0E";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#5b96f5;font:16px/1 system-ui,sans-serif;opacity:0;transform:scale(.3) rotate(-120deg);transition:opacity .35s,transform .5s cubic-bezier(.2,1.6,.4,1);text-shadow:0 0 10px rgba(91,150,245,.85);pointer-events:none}' +
      'html.ft-winter-on [data-winter-egg]::after,html.ft-winter-on [data-holiday-egg="winter"]::after{opacity:1;transform:none}';
    (document.head || document.documentElement).appendChild(st);
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('[data-winter-egg],[data-holiday-egg="winter"]');
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      setOn(!running);
    }, true);
  })();
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var rnd = Math.random;
  function rr(a, b) { return a + rnd() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function pick(a) { return a[(rnd() * a.length) | 0]; }
  function hash(x, y) { var s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); }

  var C = {
    snow: '#f4f7fb', snowDark: '#a9bbd2',
    bulbs: ['#ff4f12', '#ffd23f', '#5b96f5', '#7bdb8a', '#ff5fa2', '#9b7bff'],
    wire: '#2b3a2e'
  };

  /* =========================================================
   * DOM: холст, кнопка, полоса-сцена внизу страницы
   * DOM: canvas, toggle button, scene strip at the page bottom
   * ========================================================= */
  var cv, ctx, btn, ground, W = 0, H = 0, DPR = 1, running = false, raf = 0;
  var P = 2;          // размер «пикселя» спрайтов сцены · size of one sprite "pixel"
  var S = 1;          // масштаб сцены (на телефоне меньше) · scene scale (smaller on phones)
  var favOld = null;

  var isSetup = false;
  function setup() {
    if (isSetup) return;
    isSetup = true;
    cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.setAttribute('data-winter-ignore', '');
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000';
    ctx = cv.getContext('2d');

    ground = document.createElement('div');
    ground.setAttribute('aria-hidden', 'true');
    ground.setAttribute('data-winter-ignore', '');
    ground.style.cssText = 'position:relative;width:100%;pointer-events:none;background:linear-gradient(180deg,rgba(8,9,11,0) 0%,#0b1220 55%,#0e1830 100%)';

    btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-winter-ignore', '');
    btn.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:2147483001;width:40px;height:40px;border-radius:14px;border:1px solid rgba(236,235,230,.16);background:rgba(17,19,22,.82);color:#ecebe6;font:18px/1 system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .2s,opacity .2s';
    btn.addEventListener('mouseenter', function () { btn.style.background = 'rgba(40,46,56,.92)'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = 'rgba(17,19,22,.82)'; });
    btn.addEventListener('click', function () { setOn(!running); });

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: false });
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerUp, true);
    window.addEventListener('click', onClickCapture, true);
    window.addEventListener('dblclick', function (e) {
      if (!running) return;
      var o = sceneHit(e.clientX, e.clientY);
      if (o && o.kind === 'gift') { e.preventDefault(); e.stopPropagation(); breakGift(o, (performance.now() - T0) / 1000); }
    }, true);
    window.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (!running) return;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    });
    onResize();
  }

  function paintBtn() {
    btn.textContent = '❄';
    btn.title = running ? 'Выключить зимний режим' : 'Включить зимний режим';
    btn.setAttribute('aria-label', btn.title);
    btn.style.opacity = running ? '1' : '.55';
  }

  function start() {
    if (running) return;
    running = true;
    document.documentElement.classList.add('ft-winter-on');
    document.body.appendChild(cv);
    document.body.appendChild(ground);
    document.body.appendChild(btn);
    if (CFG.favicon) {
      var l = document.querySelector('link[rel~="icon"]');
      if (l) { favOld = l.getAttribute('href'); l.setAttribute('href', CFG.favicon); }
    }
    onResize();
    scan();
    setupLogo();
    last = 0; lastScroll = null;
    raf = requestAnimationFrame(frame);
    paintBtn();
  }

  /* =========================================================
   * Новогодний логотип поверх текстового знака [data-winter-logo]
   * New Year logo over the text mark [data-winter-logo]
   * SVG-знаки нарисованы тем же шрифтом: 1em = 200 единиц, базовая линия — y = 0,
   * The SVG marks use the same font: 1em = 200 units, baseline at y = 0,
   * поэтому картинка ложится точно на текст при любом размере шрифта.
   * so the image lines up with the text at any font size.
   * ========================================================= */
  var LOGO_VB = { santa: [-29, -318, 645, 385.6], reindeer: [-36, -318, 648, 385.6], garland: [-60, -255, 700, 322.6] };
  var logoSvg = {}, logoStyle = null, logoName = null;
  function logoBaseline() {
    var el = document.querySelector('[data-winter-logo]');
    if (!el) return 1.02;
    var m = document.createElement('span');
    m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(m);
    var fs = parseFloat(getComputedStyle(el).fontSize) || 24;
    var b = (m.offsetTop - el.offsetTop) / fs;
    el.removeChild(m);
    return b > 0.3 && b < 2 ? b : 1.02;
  }
  function setupLogo(name) {
    if (CFG.logo === false || !document.querySelector('[data-winter-logo]')) return;
    if (!name && logoName) return;
    name = name || pick(Object.keys(LOGO_VB));
    logoName = name;
    var apply = function (svg) {
      if (logoName !== name) return;
      var vb = LOGO_VB[name], k = 0.005, base = logoBaseline();
      var accents = {};
      document.querySelectorAll('[data-winter-logo]').forEach(function (el) { accents[el.getAttribute('data-winter-logo') || ''] = 1; });
      var css = '[data-winter-logo]{position:relative}' +
        'html.ft-winter-on [data-winter-logo],html.ft-winter-on [data-winter-logo] *{color:transparent!important;animation:none!important}' +
        '[data-winter-logo]::before{content:"";position:absolute;pointer-events:none;opacity:0;transition:opacity .45s;' +
        'left:' + (vb[0] * k) + 'em;top:' + (base + vb[1] * k) + 'em;width:' + (vb[2] * k) + 'em;height:' + (vb[3] * k) + 'em;' +
        'background:no-repeat 0 0/100% 100%}' +
        'html.ft-winter-on [data-winter-logo]::before{opacity:1}';
      Object.keys(accents).forEach(function (acc) {
        var col = /^#[0-9a-f]{3,8}$/i.test(acc) ? acc : '#ff4f12';
        var uri = 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/#ff4f12/gi, col));
        css += '[data-winter-logo="' + acc + '"]::before{background-image:url("' + uri + '")}';
      });
      if (!logoStyle) { logoStyle = document.createElement('style'); document.head.appendChild(logoStyle); }
      logoStyle.textContent = css;
      document.documentElement.setAttribute('data-winter-logo-variant', name);
    };
    if (logoSvg[name]) { apply(logoSvg[name]); return; }
    fetch(CFG.img + 'winter-logo-' + name + '.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (t) { logoSvg[name] = t; apply(t); }, function () {});
  }
  function stop() {
    running = false;
    document.documentElement.classList.remove('ft-winter-on');
    if (!inSeason && btn.parentNode) btn.parentNode.removeChild(btn);
    cancelAnimationFrame(raf); raf = 0;
    if (cv.parentNode) cv.parentNode.removeChild(cv);
    if (ground.parentNode) ground.parentNode.removeChild(ground);
    if (favOld !== null) { var l = document.querySelector('link[rel~="icon"]'); if (l) l.setAttribute('href', favOld); }
    flakes.length = 0; bits.length = 0;
    setCursor('');
    paintBtn();
  }

  var GH = 170, lastW = 0;
  function onResize() {
    W = document.documentElement.clientWidth || window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    S = W < 760 ? 0.8 : 1;
    GH = W < 760 ? 140 : 170;
    if (cv) { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
    if (ground) ground.style.height = GH + 'px';
    if (lastW && lastW !== W) {           // пересчёт позиций сцены под новую ширину · rescale scene positions to the new width
      var kx = W / lastW;
      for (var i = 0; i < objs.length; i++) objs[i].x *= kx;
    }
    lastW = W;
    scanSoon(120);
  }

  /* =========================================================
   * Погода: то слабый снег под наклоном, то метель вбок
   * Weather: light slanted snow, then a sideways blizzard
   * ========================================================= */
  var weather = { i: 0.45, wind: 1.1, ti: 0.45, tw: 1.1, dir: 1, next: 0, mode: 'snow', gust: 0 };
  function pickWeather(t) {
    var r = rnd(), m;
    if (reduced) m = 'calm';
    else m = r < 0.38 ? 'calm' : (r < 0.8 ? 'snow' : 'blizzard');
    if (rnd() < 0.15) weather.dir *= -1;
    weather.mode = m;
    if (m === 'calm') { weather.ti = rr(0.14, 0.32); weather.tw = rr(0.25, 0.8); weather.next = t + rr(18, 34); }
    else if (m === 'snow') { weather.ti = rr(0.42, 0.66); weather.tw = rr(0.9, 1.9); weather.next = t + rr(20, 40); }
    else { weather.ti = rr(0.86, 1); weather.tw = rr(4.2, 6.8); weather.next = t + rr(12, 22); }
  }
  function updWeather(t, dt) {
    if (!weather.next) weather.next = t + rr(14, 26);
    if (t > weather.next) pickWeather(t);
    weather.i += (weather.ti - weather.i) * 0.006 * dt;
    weather.wind += (weather.tw - weather.wind) * 0.005 * dt;
    var g = weather.mode === 'blizzard' ? 0.45 : 0.18;
    weather.gust = (Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.9 + 1.3) * 0.3 + Math.sin(t * 0.23) * 0.2) * g;
  }
  function windNow() { return weather.dir * weather.wind * (1 + weather.gust); }

  /* =========================================================
   * Снежинки и комочки
   * Snowflakes and snow bits
   * ========================================================= */
  var flakes = [], bits = [];
  function newFlake(fromSide) {
    var z = rnd();
    var f = { x: rr(-40, W + 40), y: rr(-30, -4), z: z, r: 0.9 + z * z * 2.6, ph: rr(0, 6.28), sp: rr(0.8, 1.25) };
    var w = windNow();
    if (fromSide && Math.abs(w) > 1.2) {
      f.x = w > 0 ? rr(-30, -5) : rr(W + 5, W + 30);
      f.y = rr(-20, H * 0.85);
    } else if (w > 1.5) f.x = rr(-W * 0.4, W);
    else if (w < -1.5) f.x = rr(0, W * 1.4);
    return f;
  }
  function targetCount() {
    var area = (W * H) / (1440 * 900);
    var n = CFG.maxFlakes * Math.max(0.35, Math.min(1.4, area)) * weather.i;
    if (W < 760) n *= 0.7;
    if (reduced) n *= 0.4;
    return n | 0;
  }
  function addBit(x, y, vx, vy, mass) {
    if (bits.length > 700) return;
    bits.push({ x: x, y: y, vx: vx, vy: vy, m: Math.min(mass || 1, 3), r: rr(0.9, 2.1), life: 0 });
  }

  /* =========================================================
   * Поверхности: на что ложится снег (ищутся автоматически)
   * Surfaces where snow settles (found automatically)
   * Для каждой поверхности хранится «сугроб» — высота снега по столбикам шириной CW.
   * Each surface keeps a pile: snow height per column of width CW.
   * У скруглённых углов основание идёт по дуге, а на крутой части снег не держится.
   * On rounded corners the base follows the arc, and snow slides off the steep part.
   * ========================================================= */
  var surfaces = [];
  var piles = new WeakMap();
  var CW = 3;
  var scanT = 0;
  function scanSoon(ms) { clearTimeout(scanT); scanT = setTimeout(scan, ms || 150); }

  function alphaOf(c) {
    if (!c || c === 'transparent') return 0;
    var m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return 1;
    var p = m[1].split(/[ ,\/]+/).filter(Boolean);
    return p.length > 3 ? parseFloat(p[3]) : 1;
  }
  function owns(el, hit) { return hit && (hit === el || el.contains(hit)); }

  // профиль поверхности: смещение основания по дуге угла и предел высоты снега · surface profile: base offset along the corner arc and max snow height
  function shapePile(p, w, h, radL, radR) {
    var n = p.n, off = new Float32Array(n), cap = new Float32Array(n);
    var base = clamp(w * 0.045, 3.5, W < 760 ? 9 : 13);
    for (var i = 0; i < n; i++) {
      var x = (i + 0.5) * (w / n);
      var r = x < w / 2 ? radL : radR;
      var e = x < w / 2 ? x : w - x;
      var o = 0, k = 1;
      if (r > 1 && e < r) {
        var dx = r - e;
        o = r - Math.sqrt(Math.max(0, r * r - dx * dx));
        var slope = dx / Math.max(0.01, Math.sqrt(Math.max(0, r * r - dx * dx)));
        k = clamp(1 - slope / 1.1, 0, 1);
        k = k * k;
      }
      k *= Math.min(1, (e + 0.5) / 4.5);          // у прямого края снег тоже сходит на нет · snow also tapers off at square edges
      off[i] = o; cap[i] = base * k;
    }
    p.off = off; p.cap = cap;
  }

  function scan() {
    if (!running) return;
    var all = document.body.getElementsByTagName('*');
    var found = [], seen = {};
    var vh = H, ignoreSel = CFG.ignore;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE' || tag === 'CANVAS' || tag === 'BR') continue;
      if (el instanceof SVGElement && tag.toLowerCase() !== 'svg') continue;
      var r = el.getBoundingClientRect();
      if (r.width < 34 || r.height < 16) continue;
      if (r.bottom < -150 || r.top > vh + 400) continue;
      if (r.top < 6 && r.width > W * 0.9) continue;
      found.push([el, r]);
    }
    var list = [];
    for (var j = 0; j < found.length; j++) {
      el = found[j][0]; r = found[j][1];
      if (ignoreSel && el.closest && el.closest(ignoreSel)) continue;
      var cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.2 || cs.display === 'contents') continue;
      tag = el.tagName;
      var solid = alphaOf(cs.backgroundColor) >= 0.45 || (cs.backgroundImage && cs.backgroundImage !== 'none');
      var framed = parseFloat(cs.borderTopWidth) >= 1 && alphaOf(cs.borderTopColor) >= 0.25;
      var media = tag === 'IMG' || tag === 'VIDEO' || tag === 'PICTURE';
      var ctl = tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT';
      if (!(solid || media || (framed && (ctl || r.height < 260)))) continue;
      if (r.width > W * 1.02) continue;
      var key = Math.round(r.left / 3) + ':' + Math.round(r.top / 3) + ':' + Math.round(r.width / 3);
      if (seen[key]) continue;
      var yT = r.top + 2;
      if (yT > 0 && yT < vh) {
        var hit1 = document.elementFromPoint(r.left + r.width * 0.3, yT + 4);
        var hit2 = document.elementFromPoint(r.left + r.width * 0.7, yT + 4);
        if (!owns(el, hit1) && !owns(el, hit2)) continue;
      }
      seen[key] = 1;
      // радиусы углов в пикселях экрана (у страниц с CSS zoom масштаб уже учтён в rect) · corner radii in screen px (CSS zoom is already included in the rect)
      var zx = el.offsetWidth ? r.width / el.offsetWidth : 1;
      var radL = Math.min((parseFloat(cs.borderTopLeftRadius) || 0) * zx, r.width / 2, r.height);
      var radR = Math.min((parseFloat(cs.borderTopRightRadius) || 0) * zx, r.width / 2, r.height);
      var pile = piles.get(el);
      var n = Math.max(2, Math.round(r.width / CW));
      if (!pile) {
        pile = { h: new Float32Array(n), n: n, ox: r.left, oy: 0, fresh: true };
        piles.set(el, pile);
      } else if (pile.n !== n) {
        var nh = new Float32Array(n);
        for (var c = 0; c < n; c++) nh[c] = pile.h[Math.min(pile.n - 1, Math.round(c * pile.n / n))];
        pile.h = nh; pile.n = n;
      }
      pile.fixed = cs.position === 'fixed' || cs.position === 'sticky';
      if (pile.fresh) { pile.fresh = false; pile.oy = pile.fixed ? r.top : r.top + scrollY; pile.ox = r.left; }
      var sig = n + ':' + Math.round(radL) + ':' + Math.round(radR);
      if (pile.sig !== sig) { pile.sig = sig; shapePile(pile, r.width, r.height, radL, radR); }
      list.push({ el: el, p: pile, L: r.left, T: r.top, R: r.right, B: r.bottom });
    }
    surfaces = list;
    clearTimeout(scanT);
    scanT = setTimeout(scan, 1600);
  }
  window.addEventListener('scroll', function () { scanSoon(140); }, { passive: true });

  function refreshSurfaces() {
    var sy = scrollY;
    for (var i = surfaces.length - 1; i >= 0; i--) {
      var s = surfaces[i];
      if (!s.el.isConnected) { surfaces.splice(i, 1); continue; }
      var r = s.el.getBoundingClientRect();
      var p = s.p;
      var oy = p.fixed ? r.top : r.top + sy;
      if (Math.abs(r.left - p.ox) > 3 || Math.abs(oy - p.oy) > 3) {   // элемент сдвинулся — снег осыпается · element moved: its snow falls off
        s.L = r.left; s.T = r.top; s.R = r.right;
        spill(s, 0.9);
        p.ox = r.left; p.oy = oy;
      }
      s.L = r.left; s.T = r.top; s.R = r.right; s.B = r.bottom;
    }
  }
  function spill(s, frac) {
    var p = s.p, cw = (s.R - s.L) / p.n;
    for (var i = 0; i < p.n; i++) {
      var take = p.h[i] * frac;
      if (take > 0.2 && rnd() < 0.5) addBit(s.L + i * cw, s.T + p.off[i] - p.h[i], rr(-0.6, 0.6), rr(-1, 0.2), take);
      p.h[i] -= take;
    }
  }
  // попадание падающей точки в сугроб: возвращает столбик или -1 · falling point hits a pile: returns the column or -1
  function hitSurface(su, x0, y0, x1, y1) {
    if (x1 < su.L || x1 > su.R) return -1;
    var p = su.p, c = ((x1 - su.L) / (su.R - su.L) * p.n) | 0;
    if (c < 0 || c >= p.n || p.cap[c] <= 0.05) return -1;
    var top = su.T + p.off[c] - p.h[c];
    return (y0 <= top && y1 >= top) ? c : -1;
  }
  function addSnow(su, c, amt) {
    var p = su.p;
    for (var cc = c - 1; cc <= c + 1; cc++) {
      if (cc < 0 || cc >= p.n) continue;
      p.h[cc] = Math.min(p.cap[cc], p.h[cc] + (cc === c ? amt : amt * 0.5));
    }
  }

  /* =========================================================
   * Пиксельные спрайты (рисуются один раз в маленькие холсты)
   * Pixel sprites (rendered once into small canvases)
   * ========================================================= */
  function mk(wc, hc, fn) {
    var c = document.createElement('canvas');
    c.width = wc * P; c.height = hc * P;
    var x = c.getContext('2d');
    fn(function (cx, cy, col) { if (col) { x.fillStyle = col; x.fillRect(cx * P, cy * P, P, P); } }, x);
    return c;
  }
  function fromRows(rows, pal, flip) {
    var w = rows[0].length;
    return mk(w, rows.length, function (set) {
      for (var j = 0; j < rows.length; j++) for (var i = 0; i < w; i++) {
        var ch = rows[j][flip ? w - 1 - i : i];
        if (ch !== '.') set(i, j, pal[ch]);
      }
    });
  }

  // гномик 12×17 · gnome sprite, 12×17 cells
  var GPAL = { H: '#e8402a', h: '#a8261a', W: '#f4f7fb', S: '#f2c29b', s: '#d89a74', K: '#1a1a1a', N: '#ff8f7a', B: '#eef2f7', b: '#c3cedc', G: '#3f9d5a', g: '#2a6f40', Y: '#ffd23f', D: '#6a4430', d: '#3a2416' };
  var G_STAND = [
    '........WW..',
    '.......hW...',
    '......hHH...',
    '.....hHHH...',
    '....hHHHH...',
    '...hHHHHHH..',
    '..WWWWWWWWW.',
    '...sSSSSSS..',
    '...sSSSKSSN.',
    '...bBBBBBBN.',
    '...bBBBBBB..',
    '..gbBBBBBBG.',
    '..gGbBBBBGG.',
    '..gGYYYYYGG.',
    '...gGGGGGG..',
    '...dD..dD...',
    '...dD..dD...'
  ];
  var G_RUN1 = G_STAND.slice(0, 15).concat(['..dD....dD..', '..d......dD.']);
  var G_RUN2 = G_STAND.slice(0, 15).concat(['....dDdD....', '....dDdD....']);
  var G_UP = G_STAND.map(function (row, j) {
    var a = row.split('');
    if (j >= 4 && j <= 6) { a[1] = 'S'; a[10] = 'S'; }
    if (j >= 7 && j <= 12) { a[1] = 'G'; a[10] = 'G'; }
    return a.join('');
  });
  // внешность гномиков: цвет колпака, одежды, бороды, кожи и форма шапки · gnome looks: hat, clothes, beard and skin colours, hat shape
  var LOOKS = {
    hat: [['#e8402a', '#a8261a'], ['#3f6fd8', '#26489a'], ['#3f9d5a', '#2a6f40'], ['#9b5bd6', '#6a3a9a'], ['#ff8a2a', '#c25a12'], ['#ffd23f', '#c9a014'], ['#e8402a', '#a8261a']],
    tunic: [['#3f9d5a', '#2a6f40'], ['#c0392b', '#8a2418'], ['#3f6fd8', '#26489a'], ['#8a5a36', '#5e3a20'], ['#6c6f7a', '#46484f'], ['#2a9d8f', '#1d6f65']],
    beard: [['#eef2f7', '#c3cedc'], ['#eef2f7', '#c3cedc'], ['#bfc5cc', '#8f969e'], ['#d9823b', '#a65a1e'], ['#f2e6c9', '#cdbf9c'], ['#6a4430', '#4a2c1c']],
    skin: [['#f2c29b', '#d89a74'], ['#e8b48c', '#c98f64'], ['#d9a27a', '#b07a52'], ['#a8714a', '#7e5132']],
    shape: ['pointy', 'pointy', 'beanie', 'long']
  };
  var HAT_ROWS = {
    pointy: G_STAND.slice(0, 6),
    beanie: ['............', '............', '.....WW.....', '....HHHH....', '...HhHhHH...', '...HHHHHH...'],
    long: ['.WW.........', '.hH.........', '..hHH.......', '...hHHH.....', '....hHHH....', '...hHHHHHH..']
  };
  function randLook() { return { h: pick(LOOKS.hat), t: pick(LOOKS.tunic), b: pick(LOOKS.beard), s: pick(LOOKS.skin), shape: pick(LOOKS.shape) }; }
  var gnomeSprCache = {};
  function gnomeSprites(lk) {
    lk = lk || { h: LOOKS.hat[0], t: LOOKS.tunic[0], b: LOOKS.beard[0], s: LOOKS.skin[0], shape: 'pointy' };
    var key = [lk.h[0], lk.t[0], lk.b[0], lk.s[0], lk.shape].join('|');
    if (gnomeSprCache[key]) return gnomeSprCache[key];
    var pal = {}; for (var k in GPAL) pal[k] = GPAL[k];
    pal.H = lk.h[0]; pal.h = lk.h[1]; pal.G = lk.t[0]; pal.g = lk.t[1]; pal.B = lk.b[0]; pal.b = lk.b[1]; pal.S = lk.s[0]; pal.s = lk.s[1];
    var top = HAT_ROWS[lk.shape] || HAT_ROWS.pointy;
    var withHat = function (rows) { return top.map(function (r, j) { if (rows === G_UP && j >= 4) { var a = r.split(''); a[1] = 'S'; a[10] = 'S'; return a.join(''); } return r; }).concat(rows.slice(6)); };
    var out = {};
    [['stand', G_STAND], ['run1', G_RUN1], ['run2', G_RUN2], ['up', G_UP]].forEach(function (d) {
      var rows = withHat(d[1]);
      out[d[0]] = [fromRows(rows, pal, false), fromRows(rows, pal, true)];
    });
    return (gnomeSprCache[key] = out);
  }

  // ёлка: высокая и стройная, с ярусами, снегом на лапах, шарами и звездой · tree: tall and slim, tiered, snowy branch tips, baubles and a star
  var treeSpr = null, treeLightsC = [];
  function treeSprite() {
    if (treeSpr) return treeSpr;
    var F = W < 760 ? 40 : 50, HW = W < 760 ? 11 : 13, star = 8, trunk = 6;
    var wc = HW * 2 + 3, hc = star + F + trunk;
    var cx = HW + 1;
    var dark = '#11492a', mid = '#1c6e3b', lite = '#2c9150', vlite = '#47b86a', snow = '#eef3fa', snowS = '#c3d0e2';
    var rows = [];
    treeLightsC = [];
    treeSpr = mk(wc, hc, function (set) {
      // звезда · star
      var st = ['...Y...', '..YYY..', 'YYYwYYY', '.YYYYY.', '..YYY..', '.YY.YY.', '.Y...Y.'];
      for (var j = 0; j < st.length; j++) for (var i = 0; i < 7; i++) {
        var ch = st[j][i];
        if (ch !== '.') set(cx - 3 + i, j, ch === 'w' ? '#fff6c4' : '#ffd23f');
      }
      for (var r = 0; r < F; r++) {
        var u = r / F, tiers = 5, tier = Math.min(tiers - 1, Math.floor(u * tiers)), tt = u * tiers - tier;
        var baseW = 1.5 + (HW - 1.5) * Math.pow((tier + 1) / tiers, 0.9);
        var hw = Math.max(1, Math.round(baseW * (0.38 + 0.62 * tt)));
        rows.push(hw);
        var y = star + r - 1;
        for (var x = -hw; x <= hw; x++) {
          var fr = Math.abs(x) / Math.max(1, hw), n = hash(x + 50, y);
          var col = mid;
          if (tt > 0.84) col = dark;
          else if (x < 0 && fr > 0.2 && n > 0.45) col = lite;
          else if (x > hw * 0.45 && n < 0.55) col = dark;
          if (n > 0.94 && tt < 0.8) col = vlite;
          if (tt > 0.7 && tt <= 0.86 && fr > 0.5) col = n > 0.3 ? snow : snowS;     // снег на концах лап · snow on branch tips
          if (r === 0) col = snow;
          set(cx + x, y, col);
        }
      }
      // ствол · trunk
      for (var t = 0; t < trunk; t++) for (var x2 = -2; x2 <= 1; x2++) set(cx + x2, star + F - 1 + t, x2 >= 0 ? '#4a2c18' : '#7a4a2a');
      // шары · baubles
      var cols = ['#ff4f12', '#ffd23f', '#5b96f5', '#ff5fa2', '#e8e8f0'];
      for (var b = 0; b < 13; b++) {
        var rr0 = 6 + Math.floor(hash(b, 3) * (F - 9));
        var hwb = rows[rr0] || 3;
        if (hwb < 3) continue;
        var bx = cx + Math.round((hash(b, 7) * 2 - 1) * (hwb - 2)), by = star + rr0;
        var bc = cols[b % cols.length];
        set(bx, by, bc); set(bx + 1, by, bc); set(bx, by + 1, bc); set(bx + 1, by + 1, bc);
        set(bx, by, '#ffffff');
      }
      // огоньки — по диагональным «гирляндам» · lights along diagonal strings
      for (var g = 0; g < 4; g++) {
        var r0 = 8 + g * Math.floor((F - 10) / 4);
        for (var s = 0; s < 7; s++) {
          var rr1 = r0 + s;
          var hwl = rows[rr1] || 2;
          var lx = Math.round(-hwl + 1 + (s / 6) * (hwl * 2 - 2));
          treeLightsC.push({ x: cx + lx, y: star + rr1 - 1, c: C.bulbs[(g * 7 + s) % C.bulbs.length], ph: hash(g, s) * 6.28 });
        }
      }
    });
    treeSpr.cx = cx; treeSpr.wc = wc; treeSpr.hc = hc;
    return treeSpr;
  }

  // подарок w×h клеток + бант · gift of w×h cells plus a bow
  var GIFT_COLS = [['#ff4f12', '#ffd23f'], ['#5b96f5', '#f4f7fb'], ['#3f9d5a', '#ff4f12'], ['#9b7bff', '#ffd23f'], ['#ecebe6', '#ff4f12'], ['#ff5fa2', '#f4f7fb'], ['#ffd23f', '#5b96f5']];
  function shadeHex(hex, d) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgb(' + clamp(r + d, 0, 255) + ',' + clamp(g + d, 0, 255) + ',' + clamp(b + d, 0, 255) + ')';
  }
  function giftSprite(w, h, body, rib) {
    var bowH = 3;
    return mk(w, h + bowH, function (set) {
      var mx = Math.floor(w / 2);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var col = body;
        if (y === 0) col = shadeHex(body, 40);
        else if (x === w - 1 || y === h - 1) col = shadeHex(body, -45);
        if (x === mx || x === mx - 1) col = y === 0 ? shadeHex(rib, 30) : rib;
        if (y === Math.floor(h * 0.4)) col = rib;
        set(x, y + bowH, col);
      }
      var bow = ['.R...R.', 'RRR.RRR', '.RRRRR.'];
      for (var j = 0; j < 3; j++) for (var i = 0; i < 7; i++) if (bow[j][i] === 'R') set(mx - 4 + i, j, j === 0 ? shadeHex(rib, 25) : rib);
      set(0, bowH, '#ffffff'); set(1, bowH, '#ffffff'); set(w - 2, bowH, '#e6eef8');
    });
  }
  var hatSprs = {};
  var SNOWMAN_STYLES = ['top', 'top', 'bucket', 'beanie', 'santa', 'earmuffs', 'broom', 'tiny'];
  function hatSprite(style) {
    style = style || 'top';
    if (hatSprs[style] !== undefined) return hatSprs[style];
    var spr = null;
    if (style === 'top' || style === 'broom') spr = mk(10, 7, function (set) {
      for (var y = 0; y < 5; y++) for (var x = 2; x < 8; x++) set(x, y, x === 7 ? '#14171b' : '#22262c');
      for (x = 2; x < 8; x++) set(x, 3, '#ff4f12');
      for (x = 0; x < 10; x++) set(x, 5, x === 9 ? '#14171b' : '#2c3138');
      set(2, 0, '#3a4048'); set(3, 0, '#3a4048');
    });
    else if (style === 'bucket') spr = mk(10, 7, function (set) {
      for (var y = 0; y < 6; y++) { var a = y < 2 ? 2 : 1; for (var x = a; x < 10 - a; x++) set(x, y, x === a ? '#d4dbe3' : (x >= 8 - a ? '#6f7a86' : '#9aa6b2')); }
      for (x = 0; x < 10; x++) set(x, 6, '#5f6973');
      set(1, 3, '#3a4048'); set(8, 3, '#3a4048');
    });
    else if (style === 'beanie') spr = mk(10, 7, function (set) {
      set(4, 0, '#f4f7fb'); set(5, 0, '#f4f7fb');
      for (var y = 1; y < 5; y++) for (var x = 1; x < 9; x++) set(x, y, (x + y) % 2 ? '#3f6fd8' : '#26489a');
      for (x = 0; x < 10; x++) { set(x, 5, '#f4f7fb'); set(x, 6, '#c3cedc'); }
    });
    else if (style === 'santa') spr = mk(12, 8, function (set) {
      set(10, 4, '#f4f7fb'); set(11, 4, '#f4f7fb'); set(10, 5, '#f4f7fb');
      var rows = ['....RR......', '...RRRR.....', '..RRRRRRR...', '..RRRRRRRRR.', '.RRRRRRR....', '.RRRRRRR....'];
      for (var y = 0; y < rows.length; y++) for (var x = 0; x < 12; x++) if (rows[y][x] === 'R') set(x, y + 0, x > 6 ? '#a8261a' : '#e8402a');
      for (x = 0; x < 9; x++) { set(x, 6, '#f4f7fb'); set(x, 7, '#c3cedc'); }
    });
    return (hatSprs[style] = spr);
  }

  /* ---------- рисование пиксельных кругов (комья снега) · drawing pixel circles (snowballs) ---------- */
  function snapv(v) { return Math.round(v / P) * P; }
  function pixCircle(cx, cy, r, col) {
    ctx.fillStyle = col;
    var n = Math.ceil(r / P);
    for (var j = -n; j <= n; j++) {
      var yy = j * P;
      if (Math.abs(yy) > r) continue;
      var hw = Math.sqrt(r * r - yy * yy);
      var x0 = snapv(cx - hw), x1 = snapv(cx + hw);
      if (x1 <= x0) x1 = x0 + P;
      ctx.fillRect(x0, snapv(cy + yy), x1 - x0, P);
    }
  }
  function cell(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(snapv(x), snapv(y), (w || 1) * P, (h || 1) * P); }
  function drawBall(cx, cy, r, rot) {
    pixCircle(cx, cy, r, '#b3c3d8');
    pixCircle(cx - r * 0.08, cy - r * 0.1, r * 0.9, '#dfe7f1');
    pixCircle(cx - r * 0.3, cy - r * 0.32, r * 0.42, '#f6f9fd');
    if (rot != null) {
      for (var i = 0; i < 3; i++) {
        var a = rot + i * 2.1;
        cell(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, 1, 1, '#b8c7da');
      }
    }
  }

  /* =========================================================
   * Сцена внизу: земля, ёлка, подарки, снеговики, комья, гномики
   * Bottom scene: ground, tree, gifts, snowmen, balls, gnomes
   * Координаты объектов: x — экранный, y — от низа полосы (0) вверх отрицательный.
   * Object coordinates: x is screen x, y is measured from the strip bottom (0), negative upwards.
   * ========================================================= */
  var gcw = 4, gh = null, gn = 0;
  var objs = [];                 // подарки, снеговики, комья, шляпы · gifts, snowmen, snowballs, hats
  var wrecks = [];               // сломанные снеговики, ждущие ремонта · broken snowmen waiting for repair
  var ev = null, evCool = 0, accum = 0, giftT = 0, seeded = false;
  var treeX = 0.86;
  function groundInit() {
    var n = Math.ceil(W / gcw) + 2;
    if (gh && gn === n) return;
    var old = gh, on = gn;
    gh = new Float32Array(n); gn = n;
    for (var i = 0; i < n; i++) {
      var base = 24 + Math.sin(i * 0.05) * 4 + Math.sin(i * 0.013 + 1) * 5;
      gh[i] = old ? old[Math.min(on - 1, Math.round(i * on / n))] : base;
    }
  }
  function gAt(x) { return gh ? gh[clamp(Math.round(x / gcw), 0, gn - 1)] : 24; }
  function floorY(x) { return -gAt(x) + 2; }
  function eatSnow(x, amt) { var c = clamp(Math.round(x / gcw), 0, gn - 1); gh[c] = Math.max(14, gh[c] - amt); }
  function landGround(x, amt) {
    if (!gh) return;
    var c = clamp(Math.round(x / gcw), 0, gn - 1);
    gh[c] = Math.min(48, gh[c] + amt);
    if (c > 0 && gh[c] - gh[c - 1] > 1.2) { gh[c] -= 0.3; gh[c - 1] += 0.3; }
    if (c < gn - 1 && gh[c] - gh[c + 1] > 1.2) { gh[c] -= 0.3; gh[c + 1] += 0.3; }
    accum += amt * 3;
  }

  function newGift(x, y) {
    var w = 9 + (rnd() * 5 | 0), h = 7 + (rnd() * 4 | 0), c = pick(GIFT_COLS);
    var g = { kind: 'gift', x: x, y: y, vx: 0, vy: 0, rot: 0, vr: 0, w: w, h: h, spr: giftSprite(w, h, c[0], c[1]) };
    objs.push(g);
    return g;
  }
  function newSnowman(x, o) {
    o = o || {};
    var sm = { kind: 'snowman', x: x, y: floorY(x), vx: 0, vy: 0, tilt: 0, vt: 0,
      r1: (o.r1 || 15) * S, r2: (o.r2 || 11) * S, r3: (o.r3 || 8) * S,
      hat: o.hat !== false, scarf: o.scarf || pick(['#ff4f12', '#5b96f5', '#7bdb8a', '#ffd23f', '#ff5fa2']), face: o.face || 0,
      style: o.style || pick(SNOWMAN_STYLES) };
    if (!hatSprite(sm.style)) sm.hat = false;
    objs.push(sm);
    return sm;
  }
  function newBall(x, y, r) { var b = { kind: 'ball', x: x, y: y, vx: 0, vy: 0, r: r, rot: 0 }; objs.push(b); return b; }
  function kill(o) { var i = objs.indexOf(o); if (i >= 0) objs.splice(i, 1); }
  function smHeight(sm) { return sm.r1 * 2 + sm.r2 * 2 + sm.r3 * 2 - 5 * P; }

  function seedScene() {
    if (seeded) return;
    seeded = true;
    treeX = W < 760 ? 0.82 : 0.86;
    newSnowman(W * (W < 760 ? 0.22 : 0.64), { scarf: '#ff4f12', face: -1, style: 'top' });
    for (var i = 0; i < 3; i++) dropGift(true);
  }
  function freeX(lo, hi, gap) {
    for (var tries = 0; tries < 30; tries++) {
      var x = rr(lo, hi), ok = Math.abs(x - treeX * W) > 34 * S && Math.abs(x - cal.xf * W) > 34 * S;
      for (var i = 0; i < objs.length; i++) if (Math.abs(objs[i].x - x) < gap) ok = false;
      if (ok) return x;
    }
    return null;
  }
  function dropGift(initial) {
    var n = 0;
    for (var i = 0; i < objs.length; i++) if (objs[i].kind === 'gift') n++;
    if (n >= (W < 760 ? 5 : 8)) return;
    var tx = treeX * W, x = rnd() < 0.7 ? freeX(tx - 120 * S, tx + 110 * S, 26) : freeX(W * 0.08, W * 0.6, 26);
    if (x == null) return;
    var g = newGift(clamp(x, 14, W - 14), initial ? floorY(x) : -GH - 20);
    g.vr = initial ? 0 : rr(-0.08, 0.08);
  }

  /* ---------- физика объектов · object physics ---------- */
  function stepObjects(dt, t) {
    for (var i = objs.length - 1; i >= 0; i--) {
      var o = objs[i];
      if (o.held || o.lock) continue;
      o.vy += 0.38 * dt;
      if (o.vy > 14) o.vy = 14;
      o.x += o.vx * dt; o.y += o.vy * dt;
      var fl = floorY(o.x);
      var wallBounce = o.kind === 'ball' || o.kind === 'hat' || o.kind === 'item';
      if (wallBounce) {
        if (o.x < 10) { o.x = 10; o.vx = Math.abs(o.vx) * 0.5; }
        if (o.x > W - 10) { o.x = W - 10; o.vx = -Math.abs(o.vx) * 0.5; }
      } else if (o.x < -80 || o.x > W + 80) { kill(o); continue; }     // выкинули за край — пропал · thrown off-screen: gone
      if (o.kind === 'gift' || o.kind === 'item') o.rot += o.vr * dt;
      if (o.kind === 'item' && t - o.born > 160) { kill(o); continue; }
      if (o.kind === 'ball') o.rot += o.vx / Math.max(3, o.r) * dt;
      if (o.kind === 'snowman' && o.fly) { o.tilt += o.vt * dt; }
      if (o.y >= fl) {
        var impact = o.vy;
        o.y = fl;
        if (o.kind === 'snowman' && o.fly) {
          o.fly = false;
          if (impact > 8.5 || Math.abs(o.tilt) > 0.55) { breakSnowman(o, o.vx, -impact * 0.3, t); continue; }
          o.vy = 0;
        } else if (o.kind === 'gift' && impact > 11) { breakGift(o, t); continue;
        } else if (impact > 2.5) {
          o.vy = -impact * (o.kind === 'ball' ? 0.25 : 0.32);
          o.vr *= 0.5;
          if (impact > 5) puff(o.x, gBaseNow + fl, impact);
        } else o.vy = 0;
        o.vx *= Math.pow(o.kind === 'ball' ? 0.97 : 0.82, dt);
        if (Math.abs(o.vx) < 0.04) o.vx = 0;
        if ((o.kind === 'gift' || o.kind === 'item') && o.vy === 0) {
          var tgt = Math.round(o.rot / (Math.PI / 2)) * (Math.PI / 2);
          o.rot += (tgt - o.rot) * 0.25; o.vr = 0;
        }
      }
      if (o.kind === 'snowman' && !o.fly) { o.vt += (-o.tilt * 0.08 - o.vt * 0.15) * dt; o.tilt += o.vt * dt; }
      // удары подарком · gift hits
      var sp = Math.abs(o.vx) + Math.abs(o.vy);
      if (o.kind === 'gift' && sp > 5) giftHits(o, t);
    }
  }
  function puff(x, y, k) { for (var i = 0; i < Math.min(10, k * 1.5); i++) addBit(x + rr(-8, 8), y - 2, rr(-1.5, 1.5), -rr(0.5, 2.5), 0.3); }

  function giftHits(g, t) {
    var gw = g.w * P / 2, gy0 = g.y - (g.h + 3) * P;
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i];
      if (o === g || o.held || o.lock) continue;
      if (o.kind === 'snowman') {
        if (Math.abs(o.x - g.x) < o.r1 + gw && g.y > o.y - smHeight(o) && gy0 < o.y) {
          breakSnowman(o, g.vx * 0.8, g.vy * 0.3 - 2, t);
          g.vx *= -0.35; g.vy = -3; g.vr = rr(-0.2, 0.2);
          return;
        }
      } else if (o.kind === 'ball' || o.kind === 'gift') {
        var r = o.kind === 'ball' ? o.r : o.w * P / 2;
        if (Math.abs(o.x - g.x) < r + gw && Math.abs((o.y - r) - (g.y - gw)) < r + gw) {
          o.vx += g.vx * 0.6; o.vy = Math.min(o.vy, -2 - Math.abs(g.vy) * 0.3);
          g.vx *= 0.4;
        }
      }
    }
    if (ev) ev.gn.forEach(function (gn) {
      if (gn.knock > 0 || gn.gone) return;
      var gy = floorY(gn.x);
      if (Math.abs(gn.x - g.x) < 8 * P + gw && g.y > gy - 17 * P && gy0 < gy) { gn.knock = 90; gn.kdir = g.vx > 0 ? 1 : -1; g.vx *= -0.3; g.vy = -2; }
    });
  }

  function breakSnowman(sm, ivx, ivy, t) {
    if (sm.held) endDrag();
    kill(sm);
    var y = sm.y;
    var b1 = newBall(sm.x, y, sm.r1); b1.vx = ivx * 0.25 + rr(-0.5, 0.5); b1.vy = -1.5;
    var b2 = newBall(sm.x, y - sm.r1 * 2 + 3 * P, sm.r2); b2.vx = ivx * 0.55 + rr(-1.5, 1.5); b2.vy = -3 + ivy * 0.3;
    var b3 = newBall(sm.x, y - sm.r1 * 2 - sm.r2 * 2 + 5 * P, sm.r3); b3.vx = ivx * 0.85 + rr(-2, 2); b3.vy = -5 + ivy * 0.3;
    var hat = null;
    if (sm.hat) { hat = { kind: 'hat', style: sm.style, x: sm.x, y: y - smHeight(sm), vx: ivx + rr(-2, 2), vy: -6, rot: 0 }; objs.push(hat); }
    puff(sm.x, gBaseNow + y - sm.r1, 8);
    wrecks.push({ b: [b1, b2, b3], hat: hat, scarf: sm.scarf, style: sm.style, t: t });
  }

  /* =========================================================
   * Гномики: очередь действий у каждого, общий сценарий у события
   * Gnomes: each has an action queue, the event holds the shared script
   * ========================================================= */
  var RUN = 2.4;
  function mkGnome(side) { return { side: side, x: side < 0 ? -30 : W + 30, flip: side > 0, f: 0, q: [], pose: 'stand', moving: false, knock: 0, kdir: 1, hop: 0, look: randLook() }; }
  function walk(g, x, sp, dt) {
    var d = x - g.x;
    if (Math.abs(d) <= sp * dt) { g.x = x; g.moving = false; return true; }
    g.x += (d > 0 ? 1 : -1) * sp * dt; g.flip = d < 0; g.moving = true; g.f += dt;
    return false;
  }
  function stepGnome(g, dt, t) {
    if (g.gone) return;
    if (g.knock > 0) { g.knock -= dt; g.moving = false; return; }
    var a = g.q[0];
    g.pose = 'stand'; g.hop = 0;
    if (!a) return;
    var done = false, b = a.b;
    switch (a.k) {
      case 'run': done = walk(g, typeof a.x === 'function' ? a.x() : a.x, a.sp || RUN, dt); break;
      case 'push': {
        var tx = typeof a.x === 'function' ? a.x() : a.x;
        var dir = tx >= b.x ? 1 : -1, br = b.r != null ? b.r : b.r1;
        if (!a.go) {
          if (!walk(g, b.x - dir * (br + 7 * P), RUN, dt)) break;
          a.go = true; b.lock = true; b.vx = b.vy = 0;
          var dist = Math.abs(tx - b.x), frames = Math.max(dist / 0.75, a.grow ? (a.grow - b.r) / 0.05 : 0, 30);
          a.sp = dist / frames; a.gr = a.grow ? (a.grow - b.r) / frames : 0;
        }
        var stp = a.sp * dt, rem = tx - b.x;
        if (Math.abs(rem) <= stp) b.x = tx; else b.x += dir * stp;
        if (a.grow) { b.r = Math.min(a.grow, b.r + a.gr * dt); eatSnow(b.x, 0.03 * dt); }
        b.rot += dir * stp / Math.max(3, br);
        b.y = floorY(b.x);
        if (b.kind === 'snowman') b.tilt = Math.sin(t * 14) * 0.05;
        g.x = b.x - dir * (br + 6 * P); g.flip = dir < 0; g.moving = Math.abs(rem) > stp; g.f += dt;
        done = Math.abs(tx - b.x) < 0.5 && (!a.grow || b.r >= a.grow - 0.01);
        if (done && a.unlock) { b.lock = false; if (b.kind === 'snowman') b.tilt = 0; }
        break;
      }
      case 'carry': {
        if (!a.go) {
          if (!walk(g, b.x, RUN, dt)) break;
          a.go = true; b.lock = true; b.vx = b.vy = 0;
        }
        g.pose = 'up';
        done = walk(g, typeof a.x === 'function' ? a.x() : a.x, RUN * 0.8, dt);
        b.x = g.x; b.y = floorY(g.x) - 17 * P + P;
        break;
      }
      case 'lift': {
        if (!a.t0) { a.t0 = t; a.x0 = b.x; a.y0 = b.y; b.lock = true; }
        var to = a.to(), u = Math.min(1, (t - a.t0) / (a.dur || 0.9));
        b.x = a.x0 + (to[0] - a.x0) * u;
        b.y = a.y0 + (to[1] - a.y0) * u - Math.sin(u * Math.PI) * 22;
        g.pose = 'up';
        done = u >= 1;
        break;
      }
      case 'wait': done = a.fn(); break;
      case 'do': a.fn(t); done = true; break;
      case 'cheer':
        if (!a.t0) a.t0 = t;
        g.hop = Math.abs(Math.sin((t - a.t0) * 9 + (g.side > 0 ? 1 : 0))) * 3 * P;
        g.pose = 'up';
        done = t - a.t0 > (a.dur || 1.4);
        break;
      case 'leave': done = walk(g, g.side < 0 ? -40 : W + 40, RUN * 1.25, dt); if (done) g.gone = true; break;
      case 'pause':                                    // постоять (повернувшись куда надо) · stand still (facing a direction)
        if (!a.t0) a.t0 = t;
        if (a.face) g.flip = (typeof a.face === 'function' ? a.face() : a.face) < 0;
        if (a.pose) g.pose = a.pose;
        done = t - a.t0 > (a.dur || 1);
        break;
      case 'throw': {                                  // бросить снежок в цель · throw a snowball at a target
        if (!a.t0) {
          a.t0 = t;
          var tg = a.at, dirT = tg.x >= g.x ? 1 : -1;
          g.flip = dirT < 0;
          var sx0 = g.x + dirT * 4 * P, sy0 = floorY(g.x) - 15 * P;
          var tx2 = tg.x + rr(-30, 30) * S, ty2 = floorY(tx2) - 9 * P, n = rr(40, 52), gg = 0.25;
          snowballs.push({ x: sx0, y: sy0, vx: (tx2 - sx0) / n, vy: (ty2 - sy0 - 0.5 * gg * n * n) / n, owner: g });
        }
        g.pose = t - a.t0 < 0.25 ? 'up' : 'stand';
        done = t - a.t0 > 0.35;
        break;
      }
      case 'dig': {                                    // насыпать горку · build a snow hill
        if (!a.t0) a.t0 = t;
        var sig = 34 * S, hh = 30 * S, dur = a.dur || 2.6;
        for (var cc = Math.max(0, Math.floor((a.x - sig * 2.5) / gcw)); cc <= Math.min(gn - 1, Math.ceil((a.x + sig * 2.5) / gcw)); cc++) {
          var dd = (cc * gcw - a.x) / sig;
          gh[cc] = Math.min(76, gh[cc] + hh * Math.exp(-dd * dd) * dt / (dur * 60));
        }
        g.moving = true; g.f += dt; g.flip = Math.sin(t * 5) > 0;
        if (rnd() < 0.15 * dt) puff(a.x + rr(-sig, sig), gBaseNow + floorY(a.x), 2);
        done = t - a.t0 > dur;
        if (done) g.moving = false;
        break;
      }
      case 'sled': {                                   // скатиться на санках · slide down on a sled
        if (!a.v) { a.v = 0.9; a.t0 = t; }
        var dirS = a.dir, slope = (floorY(g.x + dirS * 4) - floorY(g.x - dirS * 4)) / 8;
        a.v = clamp(a.v + (slope * 0.6 - 0.03) * dt, 0, 7);
        g.x += dirS * a.v * dt; g.flip = dirS < 0; g.sled = true;
        if (a.v > 2.5 && rnd() < 0.3 * dt) addBit(g.x - dirS * 6, gBaseNow + floorY(g.x), -dirS * rr(0.5, 2), -rr(0.5, 1.5), 0.2);
        done = (a.v <= 0.02 && t - a.t0 > 0.6) || g.x < 16 || g.x > W - 16;
        if (done) g.sled = false;
        break;
      }
    }
    if (done) { g.q.shift(); g.moving = false; }
  }
  function stackY(base, r, ov) { return base.y - base.r * 2 + (ov || 3) * P; }

  function assemble(e, t) {
    var x = e.b1.x;
    [e.b1, e.b2, e.b3, e.hat].forEach(function (o) { if (o) kill(o); });
    var sm = newSnowman(x, { r1: e.b1.r / S, r2: e.b2.r / S, r3: e.b3.r / S, hat: !!e.hatOn, scarf: e.scarf, face: t + 0.35, style: e.style });
    sm.y = floorY(x);
    e.sm = sm;
  }

  // гномики лепят нового снеговика · gnomes build a new snowman
  function startBuild(t) {
    var spot = freeX(W * 0.1, W * (W < 760 ? 0.62 : 0.72), 90 * S);
    if (spot == null) {
      var old = objs.filter(function (o) { return o.kind === 'snowman'; })[0];
      if (old) { kill(old); spot = freeX(W * 0.1, W * 0.72, 90 * S); }
      if (spot == null) { evCool = t + 30; return; }
    }
    accum = 0; forceGnomes = false;
    var R1 = 15 * S, R2 = 11 * S, R3 = 8 * S;
    var A = mkGnome(-1), B = mkGnome(1);
    var e = { gn: [A, B], flags: {}, scarf: pick(['#ff4f12', '#5b96f5', '#7bdb8a', '#ffd23f', '#ff5fa2']), hatOn: rnd() < 0.85, style: pick(SNOWMAN_STYLES) };
    var f = e.flags;
    A.q = [
      { k: 'run', x: spot - 120 * S },
      { k: 'do', fn: function () { e.b1 = newBall(A.x + 2 * S + 7 * P, floorY(A.x), 2 * S); e.b1.lock = true; } },
      { k: 'push', b: null, x: spot, grow: R1 },
      { k: 'do', fn: function () { f.base = true; } },
      { k: 'wait', fn: function () { return f.mid; } },
      { k: 'do', fn: function () { e.b3 = newBall(A.x, floorY(A.x) - 16 * P, R3); e.b3.lock = true; } },
      { k: 'lift', b: null, to: function () { return [e.b1.x, stackY(e.b2, 0, 2)]; }, dur: 1 },
      { k: 'do', fn: function (tt) { assemble(e, tt); f.done = true; } },
      { k: 'cheer' }, { k: 'leave' }
    ];
    B.q = [
      { k: 'run', x: spot + 150 * S },
      { k: 'do', fn: function () { e.b2 = newBall(B.x - 2 * S - 7 * P, floorY(B.x), 1.6 * S); e.b2.lock = true; } },
      { k: 'push', b: null, x: function () { return spot + R1 + R2 + 2 * P; }, grow: R2 },
      { k: 'wait', fn: function () { return f.base; } },
      { k: 'lift', b: null, to: function () { return [e.b1.x, stackY(e.b1)]; }, dur: 1 },
      { k: 'do', fn: function () { f.mid = true; } },
      { k: 'wait', fn: function () { return f.done; } },
      { k: 'cheer' }, { k: 'leave' }
    ];
    // подставляем комья, когда они появятся · bind snowballs once they exist
    A.q[2].bind = 'b1'; A.q[6].bind = 'b3'; B.q[2].bind = 'b2'; B.q[4].bind = 'b2';
    e.bindAll = true;
    e.name = 'build';
    ev = e;
  }

  // гномики чинят сломанного снеговика · gnomes repair a broken snowman
  function startRepair(w, t) {
    var bs = w.b.filter(function (b) { return objs.indexOf(b) >= 0; }).sort(function (a, b) { return b.r - a.r; });
    if (bs.length < 3) { wrecks.splice(wrecks.indexOf(w), 1); bs.forEach(kill); if (w.hat) kill(w.hat); return; }
    wrecks.splice(wrecks.indexOf(w), 1);
    var b1 = bs[0], b2 = bs[1], b3 = bs[2];
    var spot = clamp(b1.x, 40, W - 40), tX = treeX * W, near = 34 * S + b1.r;
    if (Math.abs(spot - tX) < near) spot = clamp(tX + (spot < tX ? -1 : 1) * near, 40, W - 40);
    if (Math.abs(spot - tX) < near) spot = tX - near;
    b1.lock = true; b1.vx = b1.vy = 0; b1.y = floorY(b1.x);
    var s2 = b2.x < spot ? -1 : 1;
    var A = mkGnome(s2), B = mkGnome(-s2);
    var e = { gn: [A, B], flags: {}, b1: b1, b2: b2, b3: b3, hat: w.hat && objs.indexOf(w.hat) >= 0 ? w.hat : null, scarf: w.scarf, hatOn: false, style: w.style };
    var f = e.flags;
    A.q = [
      { k: 'push', b: b1, x: spot },
      { k: 'push', b: b2, x: function () { return spot + s2 * (b1.r + b2.r + 2 * P); } },
      { k: 'lift', b: b2, to: function () { return [spot, stackY(b1)]; }, dur: 1 },
      { k: 'do', fn: function () { f.mid = true; } },
      { k: 'wait', fn: function () { return f.done; } },
      { k: 'cheer' }, { k: 'leave' }
    ];
    B.q = [
      { k: 'carry', b: b3, x: function () { return spot - s2 * (b1.r + 8 * P); } },
      { k: 'wait', fn: function () { return Math.abs(b1.x - spot) < 1; } },
      { k: 'wait', fn: function () { return f.mid; } },
      { k: 'lift', b: b3, to: function () { return [spot, stackY(b2, 0, 2)]; }, dur: 0.9 }
    ];
    if (e.hat) {
      B.q.push({ k: 'carry', b: e.hat, x: function () { return spot - s2 * (b1.r + 8 * P); } });
      B.q.push({ k: 'lift', b: e.hat, to: function () { return [spot, b3.y - b3.r * 2 + 2 * P]; }, dur: 0.7 });
      B.q.push({ k: 'do', fn: function () { e.hatOn = true; } });
    }
    B.q.push({ k: 'do', fn: function (tt) { assemble(e, tt); f.done = true; } }, { k: 'cheer' }, { k: 'leave' });
    e.name = 'repair';
    ev = e;
  }

  function stepEvent(dt, t) {
    var e = ev;
    if (e.bindAll) e.gn.forEach(function (g) { var a = g.q[0]; if (a && a.bind) a.b = e[a.bind]; });
    if (e.bindFns) e.gn.forEach(function (g) { var a = g.q[0]; if (a && a.bindFn) a.b = a.bindFn(); });
    e.gn.forEach(function (g) { stepGnome(g, dt, t); });
    if (e.gn.every(function (g) { return g.gone; })) { ev = null; evCool = t + rr(8, 18); }
  }

  /* =========================================================
   * События сцены. Каждое событие — набор очередей действий для гномиков.
   * Scene events. Each event is a set of action queues for gnomes.
   * Обычные события запускаются случайно, когда сцена внизу видна и никто не занят;
   * Ground events start at random when the scene is visible and nobody is busy;
   * «небесные» (Санта, салют) идут поверх всей страницы.
   * sky events (Santa, fireworks) play over the whole page.
   * Добавить событие: EVENTS.имя = { w: вес или функция, can: функция-условие, start: функция(t) }.
   * Add an event: EVENTS.name = { w: weight or function, can: condition, start: function(t) }.
   * ========================================================= */
  var snowballs = [];
  var sky = { santa: null, sparks: [], rockets: [], fwUntil: 0, fwNext: 0, santaNext: 0 };
  var partyDone = false, evNext = 0;
  var MONTHS = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
  var cal = { xf: 0.3, key: '', shown: null, tear: null, pending: false, chk: 0 };
  function dateKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function calInit() {
    if (cal.shown) return;
    var d = new Date();
    cal.shown = { d: d.getDate(), m: d.getMonth() }; cal.key = dateKey(d);
    cal.xf = W < 760 ? 0.52 : 0.3;
  }
  function calCheck(t) {                                // наступила полночь — календарь надо перевернуть · midnight passed: the calendar needs a new page
    if (t < cal.chk) return;
    cal.chk = t + 1;
    if (dateKey(new Date()) !== cal.key) cal.pending = true;
  }
  function calTear(t) {
    var d = new Date();
    cal.tear = { t0: t, old: cal.shown };
    cal.shown = { d: d.getDate(), m: d.getMonth() }; cal.key = dateKey(d); cal.pending = false;
  }
  function holiday() { var d = new Date(), m = d.getMonth(), day = d.getDate(); return (m === 11 && day >= 24) || (m === 0 && day <= 8); }
  function nyNight() {
    var d = new Date(), m = d.getMonth(), day = d.getDate(), h = d.getHours(), mi = d.getMinutes();
    return (m === 11 && day === 31 && h === 23 && mi >= 50) || (m === 0 && day === 1 && h < 5);
  }
  function standingSnowmen() { return objs.filter(function (o) { return o.kind === 'snowman' && !o.held && !o.lock && !o.fly; }); }
  function gnomeAt(side, x) { var g = mkGnome(side); if (x != null) g.x = x; return g; }
  function sideOf(x) { return x < W / 2 ? -1 : 1; }

  // Полночь: гномик прибегает к календарю и отрывает листок · Midnight: a gnome runs to the calendar and tears off a page
  function startCalendar(t, flip) {
    var cx = cal.xf * W, A = mkGnome(sideOf(cx)), stand = cx - A.side * 16 * S;
    A.q = [{ k: 'run', x: stand }, { k: 'pause', dur: flip ? 0.6 : 1.6, face: -A.side, pose: flip ? 'up' : 'stand' }];
    if (flip) A.q.push({ k: 'do', fn: function (tt) { calTear(tt); } }, { k: 'pause', dur: 0.5, face: -A.side });
    A.q.push({ k: 'cheer', dur: flip ? 1.6 : 0.8 }, { k: 'leave' });
    ev = { gn: [A], flags: {}, name: flip ? 'calendar-flip' : 'calendar' };
  }

  // Игра в снежки · Snowball fight
  function startSnowballs(t) {
    var cx = rr(W * 0.25, W * 0.6), L = rr(100, 160) * S;
    var A = mkGnome(-1), B = mkGnome(1);
    A.q = [{ k: 'run', x: Math.max(24, cx - L) }]; B.q = [{ k: 'run', x: Math.min(W - 24, cx + L) }];
    [[A, B], [B, A]].forEach(function (pr) {
      var me = pr[0], other = pr[1], n = 3 + (rnd() * 4 | 0);
      me.q.push({ k: 'pause', dur: rr(0.2, 0.8), face: function () { return other.x - me.x; } });
      for (var i = 0; i < n; i++) me.q.push({ k: 'throw', at: other }, { k: 'pause', dur: rr(0.5, 1.5), face: function () { return other.x - me.x; } });
      me.q.push({ k: 'cheer', dur: 1 }, { k: 'leave' });
    });
    ev = { gn: [A, B], flags: {}, name: 'snowballs' };
  }
  function stepSnowballs(dt) {
    for (var i = snowballs.length - 1; i >= 0; i--) {
      var b = snowballs[i], hit = false;
      b.vy += 0.25 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (ev) ev.gn.forEach(function (g) {
        if (hit || g === b.owner || g.gone || g.knock > 0) return;
        var fy = floorY(g.x);
        if (Math.abs(b.x - g.x) < 5 * P && b.y > fy - 17 * P && b.y < fy) { g.knock = 55; g.kdir = b.vx > 0 ? 1 : -1; hit = true; }
      });
      if (!hit) objs.forEach(function (o) {
        if (hit || o.kind !== 'snowman' || o.held || o.lock) return;
        if (Math.abs(b.x - o.x) < o.r1 && b.y > o.y - smHeight(o) && b.y < o.y) {
          hit = true;
          if (rnd() < 0.25) breakSnowman(o, b.vx * 0.8, -2, (performance.now() - T0) / 1000);
        }
      });
      if (!hit && b.y >= floorY(b.x)) { hit = true; landGround(b.x, 0.4); }
      if (hit || b.x < -40 || b.x > W + 40) { puff(b.x, gBaseNow + b.y, 4); snowballs.splice(i, 1); }
    }
  }

  // Горка: один насыпает, оба катаются · Sled hill: one builds it, both ride
  function hillSpot() { return freeX(W * 0.14, W * (W < 760 ? 0.6 : 0.66), 120 * S); }
  function startSled(t) {
    var hx = hillSpot(); if (hx == null) return false;
    var dir = hx < W / 2 ? 1 : -1, A = mkGnome(-dir), B = mkGnome(-dir), f = {};
    var top = function () { return hx - dir * 3; };
    A.q = [{ k: 'run', x: hx }, { k: 'dig', x: hx, dur: 2.8 }, { k: 'do', fn: function () { f.hill = true; } }];
    B.q = [{ k: 'wait', fn: function () { return f.hill; } }, { k: 'pause', dur: 0.8 }, { k: 'run', x: hx - dir * 40 * S }];
    for (var i = 0; i < 3; i++) {
      A.q.push({ k: 'run', x: top }, { k: 'sled', dir: dir }, { k: 'pause', dur: 0.3 });
      B.q.push({ k: 'run', x: top }, { k: 'sled', dir: dir }, { k: 'pause', dur: 0.4 });
    }
    A.q.push({ k: 'cheer', dur: 1 }, { k: 'leave' }); B.q.push({ k: 'cheer', dur: 1 }, { k: 'leave' });
    ev = { gn: [A, B], flags: f, name: 'sled' };
  }

  // Шалость: гномик двигает снеговика или пинает его (потом его чинят) · Prank: a gnome moves or kicks a snowman (others repair it later)
  function startPrank(t) {
    var list = standingSnowmen(); if (!list.length) return false;
    var sm = pick(list), side = sideOf(sm.x), A = mkGnome(side);
    if (rnd() < 0.5) {
      var to = clamp(sm.x - side * rr(70, 140) * S, 40, W - 40);
      if (Math.abs(to - treeX * W) < 50 * S) to = treeX * W - 60 * S;
      A.q = [{ k: 'push', b: sm, x: to, unlock: true }, { k: 'cheer', dur: 1 }, { k: 'leave' }];
    } else {
      A.q = [{ k: 'run', x: sm.x + side * (sm.r1 + 7 * P) }, { k: 'pause', dur: 0.5, face: -side },
        { k: 'do', fn: function (tt) { if (objs.indexOf(sm) >= 0 && !sm.held) breakSnowman(sm, -side * 5, -3, tt); } },
        { k: 'cheer', dur: 1.2 }, { k: 'leave' }];
    }
    ev = { gn: [A], flags: {}, name: 'prank' };
  }

  // Обмен подарками · Gift exchange
  function headGift(g) { var gi = newGift(g.x, floorY(g.x) - 16 * P); gi.lock = true; return gi; }
  function startGiftSwap(t) {
    var mid = rr(W * 0.3, W * 0.62), A = mkGnome(-1), B = mkGnome(1), f = {}, gA = null, gB = null;
    var meetA = mid - 22 * S, meetB = mid + 22 * S;
    var carryTo = function (g, gift, x) { return { k: 'carry', b: gift, x: x }; };
    A.q = [{ k: 'do', fn: function () { gA = headGift(A); A.q[1].b = gA; } }, { k: 'carry', b: null, x: meetA },
      { k: 'do', fn: function () { f.a = true; } }, { k: 'wait', fn: function () { return f.b; } },
      { k: 'lift', b: null, to: function () { return [B.x, floorY(B.x) - 16 * P]; }, dur: 0.8 },
      { k: 'do', fn: function () { f.ga = true; } }, { k: 'wait', fn: function () { return f.gb; } },
      { k: 'cheer', dur: 1.2 }, { k: 'carry', b: null, x: treeX * W - 50 * S },
      { k: 'do', fn: function () { if (gB) { gB.lock = false; gB.vy = -2; } } }, { k: 'leave' }];
    B.q = [{ k: 'do', fn: function () { gB = headGift(B); B.q[1].b = gB; } }, { k: 'carry', b: null, x: meetB },
      { k: 'do', fn: function () { f.b = true; } }, { k: 'wait', fn: function () { return f.a; } },
      { k: 'lift', b: null, to: function () { return [A.x, floorY(A.x) - 16 * P]; }, dur: 0.8 },
      { k: 'do', fn: function () { f.gb = true; } }, { k: 'wait', fn: function () { return f.ga; } },
      { k: 'cheer', dur: 1.2 }, { k: 'carry', b: null, x: treeX * W + 40 * S },
      { k: 'do', fn: function () { if (gA) { gA.lock = false; gA.vy = -2; } } }, { k: 'leave' }];
    // подарок, который несёт гномик, подставляется по ходу · the gift a gnome carries is bound on the fly
    A.q[4].bindFn = function () { return gA; }; A.q[8].bindFn = function () { return gB; };
    B.q[4].bindFn = function () { return gB; }; B.q[8].bindFn = function () { return gA; };
    ev = { gn: [A, B], flags: f, name: 'gifts', bindFns: true };
  }

  // Новогодние гуляния: салют и танцы с подарками под ёлкой · New Year party: fireworks, dancing and gifts under the tree
  function startParty(t) {
    partyDone = true;
    sky.fwUntil = t + 32;
    var spots = [0.38, 0.52, 0.66], gn = [];
    spots.forEach(function (xf, i) {
      var g = mkGnome(i % 2 ? 1 : -1);
      g.q = [{ k: 'pause', dur: i * 0.6 }, { k: 'run', x: W * xf }, { k: 'cheer', dur: 3 + i * 0.4 },
        { k: 'do', fn: function () { var gi = newGift(g.x, floorY(g.x) - 18 * P); gi.vy = -4; gi.vx = rr(-1, 1); gi.vr = rr(-0.1, 0.1); } },
        { k: 'cheer', dur: 2.5 }, { k: 'pause', dur: 0.5, pose: 'up' }, { k: 'cheer', dur: 2 }, { k: 'leave' }];
      gn.push(g);
    });
    ev = { gn: gn, flags: {}, name: 'party' };
  }

  // Санта пролетает над страницей и роняет подарок · Santa flies over the page and drops a gift
  function startSanta(t) {
    var dir = rnd() < 0.5 ? 1 : -1;
    sky.santa = { dir: dir, x: dir > 0 ? -240 : W + 240, y0: rr(H * 0.1, H * 0.3), drop: rr(W * 0.2, W * 0.8), dropped: false };
  }


  /* =========================================================
   * Предметы из подарков (как добыча в играх): разной редкости, гномики их подбирают
   * Loot from gifts (game-style drops) of different rarity; gnomes pick it up
   * ========================================================= */
  var ITEM_PAL = { R: '#e8402a', r: '#a8261a', W: '#f4f7fb', Y: '#ffd23f', y: '#c9a014', w: '#ffffff', C: '#5b96f5', c: '#2f5fb8', M: '#ff5fa2', m: '#b8336f',
    b: '#a8662e', B: '#7a4620', K: '#1a1a1a', O: '#ff4f12', o: '#b8380c', g: '#9aa3ad', G: '#3f9d5a', D: '#ffd23f', d: '#e09a12', P: '#9b7bff', p: '#6a4fc4' };
  var ITEMS = {
    candy: { r: 20, rows: ['..RWRW..', '.W....R.', '.R....W.', '......R.', '......W.', '......R.', '......W.', '........'] },
    coin: { r: 18, rows: ['..YYYY..', '.YyyyyY.', 'YyYYwYyY', 'YyYYYYyY', 'YyYYYYyY', 'YyYYYYyY', '.YyyyyY.', '..YYYY..'] },
    cookie: { r: 18, rows: ['..bbb...', '..bwb...', 'bbbbbbb.', '..bWb...', '..bbb...', '.bb.bb..', '.b...b..', '........'] },
    mitten: { r: 10, rows: ['..RRR...', '.RRRR...', '.RRRR.R.', '.RRRRRR.', '.RRRRR..', '.RRRR...', '.WWWW...', '.WWWW...'] },
    sock: { r: 10, rows: ['..WWWW..', '..RRRR..', '..RRRR..', '..WWWW..', '..RRRR..', '.RRRRR..', 'RRRRRR..', '.RRRR...'] },
    ornament: { r: 10, rows: ['...gg...', '..gYYg..', '..MMMM..', '.MwMMMM.', '.MMMMmM.', '.MMMMmM.', '..MmmM..', '...MM...'] },
    duck: { r: 6, rows: ['...YYY..', '..YYKY..', '..YYYYdd', 'Y.YYYY..', 'YYYYYYY.', 'YYYYYYY.', '.YYYYY..', '........'] },
    gem: { r: 4, glow: '#5b96f5', rows: ['..cccc..', '.cCCwCc.', 'cCwCCCCc', '.cCCCCc.', '..cCCc..', '...cc...', '........', '........'] },
    ruby: { r: 3, glow: '#ff5fa2', rows: ['..mmmm..', '.mMMwMm.', 'mMwMMMMm', '.mMMMMm.', '..mMMm..', '...mm...', '........', '........'] },
    star: { r: 3, glow: '#ffd23f', rows: ['...YY...', '...YY...', 'YYYwYYYY', '.YYYYYY.', '..YYYY..', '.YY..YY.', 'YY....YY', '........'] },
    robot: { r: 1, glow: '#ff4f12', rows: ['...Y....', '..OOOO..', '..OwOw..', '..OOOO..', '.KOOOOK.', '..OooO..', '..K..K..', '........'] }
  };
  var itemSprCache = {};
  function itemSprite(type) {
    if (!itemSprCache[type]) itemSprCache[type] = fromRows(ITEMS[type].rows, ITEM_PAL, false);
    return itemSprCache[type];
  }
  function rollItem() {
    var sum = 0, k; for (k in ITEMS) sum += ITEMS[k].r;
    var r = rnd() * sum; for (k in ITEMS) { r -= ITEMS[k].r; if (r <= 0) return k; }
    return 'candy';
  }
  function newItem(type, x, y) { var it = { kind: 'item', type: type, x: x, y: y, vx: 0, vy: 0, rot: 0, vr: 0, born: (performance.now() - T0) / 1000 }; objs.push(it); return it; }
  function breakGift(g, t) {
    if (g.held) endDrag();
    kill(g);
    var sx = g.x, sy = gBaseNow + g.y - g.h * P;
    for (var i = 0; i < 26; i++) { var a = rr(0, 6.283), v = rr(1, 3.2); sky.sparks.push({ x: sx, y: sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rr(30, 55), c: rnd() < 0.5 ? g.body : g.rib, fw: true }); }
    puff(g.x, gBaseNow + g.y, 6);
    var n = 1 + (rnd() < 0.55 ? 1 : 0) + (rnd() < 0.2 ? 1 : 0);
    for (i = 0; i < n; i++) { var it = newItem(rollItem(), g.x, g.y - g.h * P / 2); it.vx = rr(-3, 3); it.vy = -rr(5, 9); it.vr = rr(-0.3, 0.3); }
  }

  // гномики подбирают выпавшее · gnomes pick up the loot
  function lootReady(t) {
    return objs.filter(function (o) { return o.kind === 'item' && !o.held && !o.lock && o.vy === 0 && t - o.born > 1.5; });
  }
  function startLoot(t) {
    var list = lootReady(t); if (!list.length) return false;
    var take = list.slice(0, Math.min(list.length, 1 + (rnd() < 0.7 ? 1 : 0) + (rnd() < 0.35 ? 1 : 0))), gn = [];
    take.forEach(function (it, i) {
      var side = sideOf(it.x), g = mkGnome(side), rare = !!ITEMS[it.type].glow;
      it.claimed = true;
      g.q = [{ k: 'pause', dur: i * 0.5 }, { k: 'run', x: it.x - side * 3 * P, sp: RUN * 1.2 }, { k: 'do', fn: function () { it.lock = true; it.vx = it.vy = 0; } },
        { k: 'lift', b: it, to: function () { return [g.x, floorY(g.x) - 16 * P]; }, dur: 0.35 },
        { k: 'cheer', dur: rare ? 2.6 : 1.3 },
        { k: 'do', fn: function () { if (rare) for (var s2 = 0; s2 < 20; s2++) sky.sparks.push({ x: g.x, y: gBaseNow + floorY(g.x) - 20 * P, vx: rr(-2, 2), vy: -rr(0.5, 2.5), life: rr(30, 60), c: ITEMS[it.type].glow, fw: true }); } },
        { k: 'carry', b: it, x: side < 0 ? -40 : W + 40 }, { k: 'do', fn: function () { kill(it); } }, { k: 'leave' }];
      gn.push(g);
    });
    ev = { gn: gn, flags: {}, name: 'loot' };
  }

  /* =========================================================
   * Чаепитие: выносят стол, самовар и баранки, пируют, играют, уносят всё обратно
   * Tea party: gnomes bring a table, samovar and bagels, feast, play, carry it all away
   * ========================================================= */
  var propSpr = {};
  function propSprite(kind) {
    if (propSpr[kind]) return propSpr[kind];
    var c;
    if (kind === 'table') c = mk(30, 12, function (set) {
      for (var x = 0; x < 30; x++) { set(x, 0, (x >> 1) % 2 ? '#f4f7fb' : '#e8402a'); set(x, 1, (x >> 1) % 2 ? '#e8402a' : '#f4f7fb'); }
      for (x = 1; x < 29; x++) set(x, 2, (x >> 1) % 2 ? '#c9d3e0' : '#a8261a');
      for (var y = 3; y < 12; y++) { set(2, y, '#7a4620'); set(3, y, '#a8662e'); set(26, y, '#a8662e'); set(27, y, '#7a4620'); }
      for (x = 4; x < 26; x++) set(x, 7, '#7a4620');
    });
    else if (kind === 'samovar') c = mk(14, 18, function (set) {
      var Y = '#e3b04b', y = '#a8742a', w = '#fff3c4';
      set(6, 0, '#3a3f46'); set(7, 0, '#3a3f46');
      for (var x = 5; x < 9; x++) set(x, 1, y);
      for (x = 4; x < 10; x++) { set(x, 2, Y); set(x, 3, y); }
      for (var r = 4; r < 13; r++) { var hw = r < 6 ? 4 : (r < 11 ? 5 : 4); for (x = 7 - hw; x < 7 + hw; x++) set(x, r, x === 7 - hw + 1 ? w : (x >= 7 + hw - 2 ? y : Y)); }
      set(1, 6, y); set(1, 7, y); set(2, 6, y); set(12, 6, y); set(12, 7, y); set(11, 6, y);       // ручки · handles
      set(12, 10, '#3a3f46'); set(13, 10, '#3a3f46'); set(13, 11, '#3a3f46');                   // краник · tap
      for (x = 5; x < 9; x++) set(x, 13, y);
      for (x = 3; x < 11; x++) { set(x, 14, Y); set(x, 15, y); }
      for (x = 2; x < 12; x++) set(x, 16, y);
    });
    else if (kind === 'bagels') c = mk(18, 9, function (set) {
      var B = '#d9a05b', b = '#9c6a2e';
      for (var i = 0; i < 4; i++) {
        var cx = 3 + i * 4, cy = 2 + (i % 2);
        [[0, -1], [1, -1], [-1, 0], [2, 0], [-1, 1], [2, 1], [0, 2], [1, 2]].forEach(function (d) { set(cx + d[0], cy + d[1], (d[1] > 0 ? b : B)); });
      }
      for (var x = 0; x < 18; x++) set(x, 7, '#f4f7fb');
      for (x = 1; x < 17; x++) set(x, 8, '#c3cedc');
      set(0, 6, '#c3cedc'); set(17, 6, '#c3cedc');
    });
    propSpr[kind] = c;
    return c;
  }
  function newProp(kind, x, y) { var o = { kind: kind, prop: true, x: x, y: y, vx: 0, vy: 0, lock: true }; objs.push(o); return o; }
  function tableTop(tb) { return tb.y - 11 * P; }
  function feast(g, n) {
    var q = [];
    for (var i = 0; i < n; i++) q.push({ k: 'cheer', dur: rr(0.5, 1.1) }, { k: 'pause', dur: rr(0.5, 1), pose: 'up' }, { k: 'pause', dur: rr(0.4, 1.2) });
    return q;
  }
  function startTea(t) {
    var x0 = freeX(W * 0.16, W * (W < 760 ? 0.58 : 0.6), 150 * S); if (x0 == null) return false;
    var f = {}, A = mkGnome(-1), B = mkGnome(1), Cg = mkGnome(-1), tb = null, sam = null, bg = null;
    A.q = [{ k: 'do', fn: function () { tb = newProp('table', A.x, floorY(A.x)); A.q[1].b = tb; } }, { k: 'carry', b: null, x: x0 },
      { k: 'do', fn: function () { tb.y = floorY(x0); f.table = true; } }, { k: 'run', x: x0 - 34 * S }]
      .concat(feast(A, 5)).concat([{ k: 'do', fn: function () { f.end = true; } }, { k: 'wait', fn: function () { return f.samGone && f.bgGone; } },
        { k: 'carry', b: null, x: -50 }, { k: 'do', fn: function () { kill(tb); } }, { k: 'leave' }]);
    A.q[A.q.length - 3].bindFn = function () { return tb; };
    B.q = [{ k: 'do', fn: function () { sam = newProp('samovar', B.x, floorY(B.x)); B.q[1].b = sam; } }, { k: 'carry', b: null, x: x0 + 40 * S },
      { k: 'wait', fn: function () { return f.table; } },
      { k: 'lift', b: null, to: function () { return [x0 + 10 * S, tableTop(tb)]; }, dur: 0.8 }, { k: 'do', fn: function () { sam.steam = true; } },
      { k: 'run', x: x0 + 36 * S }].concat(feast(B, 4)).concat([{ k: 'wait', fn: function () { return f.end; } },
      { k: 'do', fn: function () { sam.steam = false; } }, { k: 'carry', b: null, x: W + 50 }, { k: 'do', fn: function () { kill(sam); f.samGone = true; } }, { k: 'leave' }]);
    B.q[3].bindFn = function () { return sam; }; B.q[B.q.length - 3].bindFn = function () { return sam; };
    Cg.q = [{ k: 'pause', dur: 1.2 }, { k: 'do', fn: function () { bg = newProp('bagels', Cg.x, floorY(Cg.x)); Cg.q[1].b = bg; } }, { k: 'carry', b: null, x: x0 - 44 * S },
      { k: 'wait', fn: function () { return f.table; } },
      { k: 'lift', b: null, to: function () { return [x0 - 9 * S, tableTop(tb)]; }, dur: 0.8 },
      { k: 'run', x: x0 - 50 * S }].concat(feast(Cg, 4)).concat([{ k: 'wait', fn: function () { return f.end; } },
      { k: 'carry', b: null, x: -50 }, { k: 'do', fn: function () { kill(bg); f.bgGone = true; } }, { k: 'leave' }]);
    Cg.q[4].bindFn = function () { return bg; }; Cg.q[Cg.q.length - 3].bindFn = function () { return bg; };
    var gn = [A, B, Cg];
    // гости: едят, а потом играют в снежки друг с другом · guests eat, then play snowballs with each other
    if (rnd() < 0.8) {
      var D = mkGnome(1), E = mkGnome(-1);
      D.q = [{ k: 'pause', dur: 2 }, { k: 'run', x: x0 + 62 * S }].concat(feast(D, 2)).concat([{ k: 'run', x: Math.min(W - 30, x0 + 130 * S) }, { k: 'throw', at: E }, { k: 'pause', dur: 0.8, face: -1 }, { k: 'throw', at: E }, { k: 'wait', fn: function () { return f.end; } }, { k: 'cheer', dur: 0.8 }, { k: 'leave' }]);
      E.q = [{ k: 'pause', dur: 2.6 }, { k: 'run', x: x0 - 70 * S }].concat(feast(E, 2)).concat([{ k: 'run', x: Math.max(30, x0 - 140 * S) }, { k: 'pause', dur: 0.5, face: 1 }, { k: 'throw', at: D }, { k: 'pause', dur: 0.9, face: 1 }, { k: 'throw', at: D }, { k: 'wait', fn: function () { return f.end; } }, { k: 'cheer', dur: 0.8 }, { k: 'leave' }]);
      gn.push(D, E);
    }
    ev = { gn: gn, flags: f, name: 'tea', bindFns: true };
  }

  var EVENTS = {
    build: { w: 2, can: function () { return freeX(W * 0.1, W * 0.72, 90 * S) != null; }, start: function (t) { startBuild(t); } },
    snowballs: { w: 3, start: startSnowballs },
    sled: { w: 2, can: function () { return hillSpot() != null; }, start: startSled },
    prank: { w: 2, can: function () { return standingSnowmen().length > 0; }, start: startPrank },
    gifts: { w: function () { return holiday() ? 4 : 1.2; }, start: startGiftSwap },
    calendar: { w: 0.8, start: function (t) { startCalendar(t, false); } },
    tea: { w: function () { return holiday() ? 3 : 2; }, can: function () { return freeX(W * 0.16, W * 0.6, 150 * S) != null; }, start: startTea },
    loot: { manual: true, start: function (t) { return startLoot(t); } },
    party: { w: function () { return holiday() ? 1.2 : 0; }, start: startParty },
    santa: { sky: true, start: startSanta },
    fireworks: { sky: true, start: function (t) { sky.fwUntil = t + 20; } },
    midnight: { manual: true, start: function () {    // для проверки: «вчера» на календаре — гномик перевернёт · for testing: show yesterday so a gnome flips the page
      var d = new Date(Date.now() - 864e5); cal.shown = { d: d.getDate(), m: d.getMonth() }; cal.key = dateKey(d); cal.pending = true;
    } }
  };
  function pickEvent() {
    var list = [], sum = 0, k, e, w;
    for (k in EVENTS) {
      e = EVENTS[k];
      if (e.sky || e.manual) continue;
      w = typeof e.w === 'function' ? e.w() : e.w;
      if (w > 0 && (!e.can || e.can())) { list.push([k, w]); sum += w; }
    }
    var r = rnd() * sum;
    for (var i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; }
    return null;
  }
  function runEvent(name, t) {
    var e = EVENTS[name];
    if (!e) return false;
    if (!e.sky && !e.manual && ev) return false;
    return e.start(t) !== false;
  }

  // планировщик: вызывается каждый кадр · scheduler: runs every frame
  function schedule(dt, t, gVis) {
    calInit(); calCheck(t);
    if (!evNext) evNext = t + rr(10, 22);
    if (!sky.santaNext) sky.santaNext = t + (holiday() ? rr(40, 100) : rr(150, 320));
    stepSnowballs(dt);
    if (ev) stepEvent(dt, t);
    else if (gVis && !reduced) {
      var wr = null;
      for (var i = 0; i < wrecks.length; i++) {
        var allRest = wrecks[i].b.every(function (bb) { return objs.indexOf(bb) < 0 || (bb.vy === 0 && Math.abs(bb.vx) < 0.3 && !bb.held); });
        if (allRest && t > wrecks[i].t + 1.4) { wr = wrecks[i]; break; }
      }
      if (wr) startRepair(wr, t);
      else if (cal.pending) startCalendar(t, true);
      else if (lootReady(t).length && t > evCool) startLoot(t);
      else if (nyNight() && !partyDone) startParty(t);
      else if (t > evCool && (forceGnomes || accum > 5000)) startBuild(t);
      else if (t > evNext && t > evCool) { var k = pickEvent(); if (k) runEvent(k, t); evNext = t + rr(22, 50); }
    }
    if (!reduced && !sky.santa && t > sky.santaNext) { startSanta(t); sky.santaNext = t + (holiday() ? rr(90, 200) : rr(240, 520)); }
    if (nyNight() && sky.fwUntil < t + 5) sky.fwUntil = t + 30;     // в новогоднюю ночь салют не кончается · on New Year's night the fireworks never stop
    stepSky(dt, t);
  }

  /* ---------- небо: Санта, искры, салют · sky: Santa, sparks, fireworks ---------- */
  function stepSky(dt, t) {
    var s = sky.santa;
    if (s) {
      s.x += s.dir * (W > 1200 ? 3.4 : 2.6) * dt;
      s.y = s.y0 + Math.sin(t * 2.2) * 8;
      if (rnd() < 0.8 * dt) sky.sparks.push({ x: s.x - s.dir * 18, y: s.y + rr(0, 14), vx: -s.dir * rr(0.2, 0.8), vy: rr(-0.2, 0.4), life: rr(30, 60), c: rnd() < 0.5 ? '#ffd23f' : '#ffffff' });
      if (!s.dropped && Math.abs(s.x - s.drop) < 5) {
        s.dropped = true;
        var n = objs.filter(function (o) { return o.kind === 'gift'; }).length;
        if (n < 10) { var gi = newGift(s.x, s.y + 16 - gBaseNow); gi.vx = s.dir * 1.2; gi.vy = 0; gi.vr = s.dir * 0.05; }
      }
      if (s.x < -260 || s.x > W + 260) sky.santa = null;
    }
    if (t < sky.fwUntil && t > sky.fwNext) {
      sky.fwNext = t + rr(0.35, 0.9);
      sky.rockets.push({ x: rr(W * 0.1, W * 0.9), y: H + 10, vy: -rr(8, 11.5), c: pick(C.bulbs) });
    }
    for (var i = sky.rockets.length - 1; i >= 0; i--) {
      var r = sky.rockets[i];
      r.vy += 0.15 * dt; r.y += r.vy * dt;
      if (rnd() < 0.6) sky.sparks.push({ x: r.x, y: r.y + 4, vx: rr(-0.2, 0.2), vy: 0.5, life: 18, c: '#ffd9a0' });
      if (r.vy >= -0.8) {
        var n2 = 34 + (rnd() * 16 | 0), c2 = rnd() < 0.3 ? pick(C.bulbs) : r.c;
        for (var k = 0; k < n2; k++) { var a = k / n2 * 6.283, v = rr(1.4, 3.4); sky.sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rr(50, 80), c: rnd() < 0.15 ? '#ffffff' : c2, fw: true }); }
        sky.rockets.splice(i, 1);
      }
    }
    for (i = sky.sparks.length - 1; i >= 0; i--) {
      var p = sky.sparks[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.fw ? 0.045 : 0.01) * dt; p.vx *= Math.pow(0.985, dt);
      p.life -= dt;
      if (p.life <= 0) sky.sparks.splice(i, 1);
    }
    if (sky.sparks.length > 900) sky.sparks.splice(0, sky.sparks.length - 900);
  }
  function drawSky(t) {
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < sky.sparks.length; i++) {
      var p = sky.sparks[i];
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.fw ? 2.2 : 1.6, p.fw ? 2.2 : 1.6);
    }
    for (i = 0; i < sky.rockets.length; i++) { var r = sky.rockets[i]; ctx.globalAlpha = 0.8; ctx.drawImage(glow(r.c), r.x - 6, r.y - 6, 12, 12); }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    var s = sky.santa;
    if (s) {
      var spr = santaSprites(), fl = s.dir < 0 ? 1 : 0, leg = Math.floor(t * 8) % 2;
      var sl = spr.sleigh[fl], d1 = spr.deer[leg][fl];
      var sx = s.x - sl.width / 2, sy = s.y;
      var r1x = s.x + s.dir * 70, r2x = s.x + s.dir * 112;
      ctx.strokeStyle = 'rgba(255,210,63,.75)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.x + s.dir * sl.width / 2.4, sy + 14); ctx.lineTo(r1x, sy + 8 + Math.sin(t * 8) * 2); ctx.lineTo(r2x, sy + 6 + Math.sin(t * 8 + 1) * 2); ctx.stroke();
      ctx.drawImage(d1, snapv(r1x - d1.width / 2), snapv(sy - 4 + Math.sin(t * 8) * 2));
      var d2 = spr.deer[1 - leg][fl];
      ctx.drawImage(d2, snapv(r2x - d2.width / 2), snapv(sy - 6 + Math.sin(t * 8 + 1) * 2));
      var nx = r2x + s.dir * d2.width / 2 - s.dir * 3;
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6); ctx.drawImage(glow('#ff3b3b'), nx - 9, sy - 2 + Math.sin(t * 8 + 1) * 2 - 6, 18, 18); ctx.globalAlpha = 1;
      ctx.drawImage(sl, snapv(sx), snapv(sy));
    }
  }

  /* ---------- спрайты для событий · event sprites ---------- */
  var sledSpr = null;
  function sledSprite() {
    if (sledSpr) return sledSpr;
    var rows = ['.............dd', 'RRRRRRRRRRRRR.d', 'rrrrrrrrrrrrr.d', '.d..d....d..dd.', 'ddddddddddddd..'];
    var pal = { R: '#e8402a', r: '#a8261a', d: '#6a4430' };
    sledSpr = [fromRows(rows, pal, false), fromRows(rows, pal, true)];
    return sledSpr;
  }
  var santaSpr = null;
  function santaSprites() {
    if (santaSpr) return santaSpr;
    var pal = { R: '#e8402a', r: '#a8261a', W: '#f4f7fb', S: '#f2c29b', K: '#1a1a1a', Y: '#ffd23f', B: '#8a5a36', b: '#5e3a20', d: '#c9a06a', N: '#ff3b3b', G: '#3f9d5a', g: '#2a6f40' };
    var sleigh = [
      '...........WW...........',
      '..........RRRW..........',
      '.........RRRR...........',
      '..gg.....WWWW...........',
      '.gGGg....SSKS...........',
      'gGGGGg..WWWWWS..........',
      'gGGGGg.RRRWWRR..........',
      'YRRRRRRRRRRRRRRRRRRRRY..',
      '.RRRRRRRRRRRRRRRRRRRRR..',
      '..RRRRRRRRRRRRRRRRRRR...',
      '...YYYYYYYYYYYYYYYYY....',
      '..Y....Y.......Y....Y...',
      '.YYYYYYYYYYYYYYYYYYYYYY.',
      '........................'
    ];
    var deerA = [
      '...........d.d..',
      '............dd..',
      '...........BBBB.',
      '...........BBKBN',
      '...BBBBBBBBBBB..',
      '..BBBBBBBBBBB...',
      '.bBBBBBBBBBB....',
      '..B..B...B..B...',
      '.B....B.B....B..'
    ];
    var deerB = deerA.slice(0, 7).concat(['...B.B....B.B...', '...B.B....B.B...']);
    santaSpr = {
      sleigh: [fromRows(sleigh, pal, false), fromRows(sleigh, pal, true)],
      deer: [[fromRows(deerA, pal, false), fromRows(deerA, pal, true)], [fromRows(deerB, pal, false), fromRows(deerB, pal, true)]]
    };
    return santaSpr;
  }

  /* ---------- календарь на столбике · calendar on a post ---------- */
  function drawCalendar(t, gBase) {
    if (!cal.shown) return;
    var x = cal.xf * W, base = gBase + floorY(x) + P;
    var bw = 22, bh = 19, postH = 13;
    var left = snapv(x - bw * P / 2), top = snapv(base - (postH + bh) * P);
    cell(x - P, base - postH * P, 2, postH, '#6a4430'); cell(x, base - postH * P, 1, postH, '#4f3222');
    ctx.fillStyle = '#3a2416'; ctx.fillRect(left, top, bw * P, bh * P);
    ctx.fillStyle = '#f4f7fb'; ctx.fillRect(left + P, top + 6 * P, (bw - 2) * P, (bh - 7) * P);
    ctx.fillStyle = '#e8402a'; ctx.fillRect(left + P, top + P, (bw - 2) * P, 5 * P);
    cell(left + 5 * P, top - P, 1, 2, '#c3cedc'); cell(left + (bw - 6) * P, top - P, 1, 2, '#c3cedc');
    ctx.fillStyle = '#f4f7fb'; ctx.fillRect(left - P, top - 2 * P, (bw + 2) * P, 2 * P);       // снег на табличке · snow on the sign
    var cx = left + bw * P / 2;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + (8 * S + 1) + 'px "JetBrains Mono", ui-monospace, monospace'; ctx.fillStyle = '#ffffff';
    ctx.fillText(MONTHS[cal.shown.m], cx, top + 3.6 * P);
    ctx.font = 'bold ' + Math.round(19 * S) + 'px "Fira Sans Condensed", "Arial Narrow", sans-serif'; ctx.fillStyle = '#1a1a1a';
    ctx.fillText(String(cal.shown.d), cx, top + 12.6 * P);
    if (cal.tear) {                                       // оторванный листок улетает · the torn page flies away
      var u = (t - cal.tear.t0) / 1.1;
      if (u >= 1) cal.tear = null;
      else {
        ctx.save();
        ctx.globalAlpha = 1 - u;
        ctx.translate(cx + u * 26, top + 12 * P - u * 40 + u * u * 30);
        ctx.rotate(u * 1.4);
        ctx.fillStyle = '#f4f7fb'; ctx.fillRect(-(bw - 2) * P / 2, -6 * P, (bw - 2) * P, (bh - 7) * P);
        ctx.fillStyle = '#1a1a1a'; ctx.fillText(String(cal.tear.old.d), 0, 0.6 * P);
        ctx.restore();
      }
    }
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }

  /* =========================================================
   * Мини-игра: взять объект мышкой, тащить, кинуть
   * Mini-game: grab, drag and throw objects with the mouse
   * ========================================================= */
  var drag = null, hoverSet = false, suppressClick = false, gBaseNow = 0;
  var trail = [];
  function sceneHit(x, y) {
    var ly = y - gBaseNow;
    for (var i = objs.length - 1; i >= 0; i--) {
      var o = objs[i];
      if (o.lock) continue;
      if (o.kind === 'gift') {
        var gw = o.w * P / 2 + 3;
        if (Math.abs(x - o.x) < gw && ly < o.y + 3 && ly > o.y - (o.h + 3) * P - 3) return o;
      } else if (o.kind === 'snowman') {
        if (Math.abs(x - o.x) < o.r1 + 3 && ly < o.y + 3 && ly > o.y - smHeight(o) - 8 * P) return o;
      } else if (o.kind === 'ball') {
        if (Math.hypot(x - o.x, ly - (o.y - o.r)) < o.r + 4) return o;
      } else if (o.kind === 'hat' || o.kind === 'item') {
        if (Math.abs(x - o.x) < 6 * P && ly < o.y + 3 && ly > o.y - 9 * P) return o;
      }
    }
    return null;
  }
  function setCursor(c) {
    var el = document.documentElement;
    if (c) { el.style.cursor = c; hoverSet = true; }
    else if (hoverSet) { el.style.cursor = ''; hoverSet = false; }
  }
  function onPointerDown(e) {
    if (!running || e.button > 0) return;
    var o = sceneHit(e.clientX, e.clientY);
    if (!o) return;
    if (e.pointerType === 'touch') {                 // на телефоне — тап: пнуть · on phones a tap kicks the object
      kickObj(o, e.clientX);
      return;
    }
    e.preventDefault(); e.stopPropagation();
    drag = { o: o, dx: e.clientX - o.x, dy: (e.clientY - gBaseNow) - o.y, moved: 0, id: e.pointerId };
    o.held = true; o.vx = o.vy = 0;
    if (o.kind === 'snowman') o.fly = false;
    trail = [[performance.now(), e.clientX, e.clientY]];
    setCursor('grabbing');
  }
  function kickObj(o, px) {
    var t = (performance.now() - T0) / 1000;
    if (o.kind === 'snowman') { breakSnowman(o, (o.x - px) > 0 ? 3 : -3, -4, t); return; }
    o.vx = (o.x - px) * 0.15 + rr(-3, 3); o.vy = -rr(8, 12);
    if (o.kind === 'gift') o.vr = rr(-0.25, 0.25);
  }
  function onPointerMove(e) {
    if (!running) return;
    if (e.pointerType !== 'touch') sweepAt(e.clientX, e.clientY);
    if (drag) {
      e.preventDefault();
      var o = drag.o, now = performance.now();
      trail.push([now, e.clientX, e.clientY]);
      while (trail.length > 2 && now - trail[0][0] > 90) trail.shift();
      var nx = e.clientX - drag.dx, ny = (e.clientY - gBaseNow) - drag.dy;
      drag.moved += Math.abs(nx - o.x) + Math.abs(ny - o.y);
      var vx = nx - o.x;
      o.x = nx; o.y = Math.min(ny, floorY(nx));
      if (o.kind === 'snowman') {
        o.tilt = clamp(o.tilt * 0.7 + vx * 0.03, -0.8, 0.8);
        var sp = trailSpeed();
        if (Math.hypot(sp[0], sp[1]) > 34) {         // трясут слишком сильно — развалился · shaken too hard: it falls apart
          var t = (now - T0) / 1000;
          breakSnowman(o, sp[0] * 0.4, sp[1] * 0.3, t);
        }
      }
      if (o.kind === 'gift') { o.rot = clamp(vx * 0.04, -0.6, 0.6); var s2 = trailSpeed(); o.vx = s2[0]; o.vy = s2[1]; if (Math.hypot(s2[0], s2[1]) > 8) giftHits(o, (now - T0) / 1000); }
      return;
    }
    if (e.pointerType === 'mouse') setCursor(sceneHit(e.clientX, e.clientY) ? 'grab' : '');
  }
  function trailSpeed() {
    if (trail.length < 2) return [0, 0];
    var a = trail[0], b = trail[trail.length - 1], dtm = Math.max(8, b[0] - a[0]);
    return [(b[1] - a[1]) / dtm * 16.667, (b[2] - a[2]) / dtm * 16.667];
  }
  function onPointerUp() {
    if (!drag) return;
    var o = drag.o, sp = trailSpeed();
    o.vx = clamp(sp[0], -45, 45); o.vy = clamp(sp[1], -45, 45);
    if (o.kind === 'gift') o.vr = clamp(sp[0] * 0.012, -0.4, 0.4);
    if (o.kind === 'snowman') { o.fly = true; o.vt = clamp(sp[0] * 0.004, -0.15, 0.15); }
    if (drag.moved > 4) suppressClick = true;
    endDrag();
  }
  function endDrag() {
    if (!drag) return;
    drag.o.held = false;
    drag = null;
    setCursor('');
  }
  function onClickCapture(e) {
    if (suppressClick) { suppressClick = false; e.preventDefault(); e.stopPropagation(); }
  }

  /* =========================================================
   * Мышь / палец: смахнуть снег с блоков
   * Mouse / finger: sweep snow off blocks
   * ========================================================= */
  var mouse = { x: -999, y: -999, vx: 0, vy: 0, t: 0 };
  function onTouch(e) { var t = e.touches && e.touches[0]; if (t) sweepAt(t.clientX, t.clientY); }
  function sweepAt(x, y) {
    var now = performance.now();
    if (mouse.t && now - mouse.t < 100) { mouse.vx = (x - mouse.x); mouse.vy = (y - mouse.y); } else { mouse.vx = 0; mouse.vy = 0; }
    mouse.x = x; mouse.y = y; mouse.t = now;
    if (!running) return;
    var R = 16;
    for (var i = 0; i < surfaces.length; i++) {
      var s = surfaces[i], p = s.p, cw = (s.R - s.L) / p.n;
      if (x < s.L - R || x > s.R + R) continue;
      if (y < s.T - 28 || y > s.T + 40) continue;
      var c0 = Math.max(0, Math.floor((x - R - s.L) / cw)), c1 = Math.min(p.n - 1, Math.ceil((x + R - s.L) / cw));
      for (var c = c0; c <= c1; c++) {
        if (p.h[c] < 0.15) continue;
        var top = s.T + p.off[c];
        if (y < top - p.h[c] - 14 || y > top + 10) continue;
        var d = Math.abs(s.L + c * cw + cw / 2 - x) / R;
        if (d > 1) continue;
        var take = p.h[c] * (0.95 - d * 0.5);
        p.h[c] -= take;
        var nb = Math.min(3, Math.ceil(take / 1.4));
        for (var b = 0; b < nb; b++) addBit(s.L + c * cw + rr(0, cw), top - p.h[c] - rr(0, 2), mouse.vx * rr(0.12, 0.3) + rr(-0.5, 0.5), Math.min(0, mouse.vy * 0.15) - rr(0.6, 2.2), take / nb);
      }
    }
    if (garland.y > -40 && Math.abs(y - garland.y - 10) < 26) {
      var seg = Math.floor(x / garland.span);
      if (garland.sw[seg] !== undefined) garland.sw[seg].v += clamp(mouse.vx, -30, 30) * 0.012;
    }
  }

  /* =========================================================
   * Гирлянда под шапкой
   * Garland under the header
   * ========================================================= */
  var garland = { y: -999, span: 150, sw: [] };
  function findGarlandY() {
    var hs = CFG.garland ? document.querySelectorAll(CFG.garland) : [];
    for (var i = 0; i < hs.length; i++) {
      var r = hs[i].getBoundingClientRect();
      if (r.height > 0 && r.width > W * 0.5) return r.bottom;
    }
    return -scrollY;
  }
  function bezPt(x0, y0, cx, cy, x1, y1, u) {
    var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    return [a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1];
  }
  var glowCache = {};
  function glow(col) {
    if (glowCache[col]) return glowCache[col];
    var g = document.createElement('canvas'); g.width = g.height = 48;
    var x = g.getContext('2d'), gr = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    gr.addColorStop(0, col); gr.addColorStop(0.35, col + '88'); gr.addColorStop(1, col + '00');
    x.fillStyle = gr; x.fillRect(0, 0, 48, 48);
    return (glowCache[col] = g);
  }
  function drawGarland(t, dt) {
    var y0 = findGarlandY();
    garland.y = y0;
    if (y0 < -40 || y0 > H + 10) return;
    var span = W < 760 ? 96 : 150;
    garland.span = span;
    var segs = Math.ceil(W / span) + 1;
    while (garland.sw.length < segs) garland.sw.push({ a: 0, v: 0 });
    var sag = W < 760 ? 10 : 15, per = W < 760 ? 3 : 4;
    var mode = Math.floor(t / 9) % 3, bi = 0;
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.wire;
    var pts = [];
    for (var s = 0; s < segs; s++) {
      var sw = garland.sw[s];
      sw.v += -sw.a * 0.06 * dt; sw.v *= Math.pow(0.95, dt); sw.a += sw.v * dt;
      var x0 = s * span, x1 = x0 + span, cx = x0 + span / 2 + sw.a * 14, cy = y0 + 2 + sag * 2;
      ctx.beginPath(); ctx.moveTo(x0, y0 + 1); ctx.quadraticCurveTo(cx, cy, x1, y0 + 1); ctx.stroke();
      for (var k = 0; k < per; k++) {
        var u = (k + 0.5) / per, pt = bezPt(x0, y0 + 1, cx, cy, x1, y0 + 1, u);
        pts.push([pt[0], pt[1], C.bulbs[bi % C.bulbs.length], bi, sw.a]);
        bi++;
      }
    }
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], on;
      if (reduced) on = 1;
      else if (mode === 0) on = ((p[3] + Math.floor(t * 1.6)) % 2) ? 1 : 0.25;
      else if (mode === 1) on = (((p[3] - t * 7) % 6 + 6) % 6) < 2.2 ? 1 : 0.22;
      else on = 0.55 + 0.45 * Math.sin(t * 2.6 + p[3] * 1.7);
      var bx = p[0] + p[4] * 3, by = p[1] + 2;
      if (on > 0.5) { ctx.globalAlpha = (on - 0.4) * 0.9; ctx.drawImage(glow(p[2]), bx - 18, by - 12, 36, 36); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#3a3f46'; ctx.fillRect(bx - 2, by - 1, 4, 3);
      ctx.globalAlpha = 0.35 + on * 0.65;
      ctx.fillStyle = p[2];
      ctx.beginPath(); ctx.ellipse(bx, by + 6, 3.2, 5, 0, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = on * 0.8; ctx.fillStyle = '#ffffff'; ctx.fillRect(bx - 1.6, by + 3, 1.2, 2.2);
      ctx.globalAlpha = 1;
    }
  }

  /* =========================================================
   * Главный цикл
   * Main loop
   * ========================================================= */
  var last = 0, T0 = performance.now(), frameN = 0, lastScroll = null;
  var simOffset = 0;                                   // сдвиг времени для ftWinter.sim() · time offset for ftWinter.sim()
  function frame(now) {
    raf = requestAnimationFrame(frame);
    tick(now + simOffset);
  }
  function tick(now) {
    var dt = last ? clamp((now - last) / 16.667, 0, 3) : 1;
    last = now;
    var t = (now - T0) / 1000;
    frameN++;
    updWeather(t, dt);
    refreshSurfaces();
    groundInit();
    seedScene();

    var gr = ground.getBoundingClientRect();
    var gVis = gr.top < H + 60 && gr.bottom > -GH;
    var gBase = gr.top + GH;
    gBaseNow = gBase;
    var w = windNow();

    /* --- снежинки · snowflakes --- */
    var want = targetCount();
    var spawn = Math.min(6, Math.max(0, want - flakes.length));
    for (var s = 0; s < spawn; s++) if (rnd() < 0.5) flakes.push(newFlake(rnd() < 0.5));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;

    var surf = surfaces, i, j, c;
    // снег живёт в пространстве страницы: при прокрутке хлопья уезжают вместе с ней (ближние — сильнее) · snow lives in page space: flakes scroll with the page (near ones more)
    var sy = window.scrollY || 0, dsy = lastScroll == null ? 0 : sy - lastScroll;
    lastScroll = sy;
    if (dsy) {
      var span = H + 80;
      for (i = 0; i < flakes.length; i++) {
        var ff = flakes[i];
        ff.y -= dsy * (0.6 + 0.4 * ff.z);
        if (ff.y < -40 || ff.y > H + 40) ff.y = (((ff.y + 40) % span) + span) % span - 40;
      }
      for (i = 0; i < bits.length; i++) bits[i].y -= dsy;
    }
    for (i = flakes.length - 1; i >= 0; i--) {
      var f = flakes[i];
      f.ph += 0.018 * dt * f.sp;
      var vy = (0.45 + f.z * 1.25) * f.sp * (1 + weather.i * 0.5);
      var vx = w * (0.35 + f.z * 0.85) + Math.sin(f.ph) * 0.45 * (1 - Math.min(1, Math.abs(w) / 4));
      var ny = f.y + vy * dt, nx = f.x + vx * dt;
      var landed = false;
      if (f.z > 0.42) {
        for (j = 0; j < surf.length; j++) {
          c = hitSurface(surf[j], f.x, f.y, nx, ny);
          if (c >= 0) {
            if (rnd() < 0.7) { addSnow(surf[j], c, f.r * 0.45); accum += f.r; landed = true; }
            break;
          }
        }
        if (!landed && gVis) {
          var gy = gBase - gAt(nx);
          if (ny >= gy && f.y < gy + 2) { landGround(nx, f.r * 0.12); landed = true; }
        }
      }
      if (landed || ny > H + 10 || nx < -60 || nx > W + 60) {
        if (flakes.length > want) { flakes.splice(i, 1); continue; }
        flakes[i] = newFlake(!landed && (nx < -60 || nx > W + 60)); continue;
      }
      f.x = nx; f.y = ny;
    }

    /* --- сугробы: оседание и сдувание метелью · piles: settling and blizzard blow-off --- */
    if (frameN % 2 === 0) {
      var blow = weather.mode === 'blizzard' ? weather.i : 0;
      for (j = 0; j < surf.length; j++) {
        var sp = surf[j], h = sp.p.h, n = sp.p.n, cap = sp.p.cap;
        if (sp.B < -20 || sp.T > H + 20) continue;
        for (var pass = 0; pass < 2; pass++) {
          for (c = 0; c < n - 1; c++) {
            var d = h[c] - h[c + 1];
            if (d > 0.45) { var m = (d - 0.45) * 0.25; h[c] -= m; h[c + 1] += m; }
            else if (d < -0.45) { m = (-d - 0.45) * 0.25; h[c + 1] -= m; h[c] += m; }
          }
        }
        for (c = 0; c < n; c++) {
          if (h[c] > cap[c]) {
            var cw0 = (sp.R - sp.L) / n;
            if (rnd() < 0.05) addBit(sp.L + c * cw0, sp.T + sp.p.off[c] - h[c], rr(-0.4, 0.4), 0, h[c] - cap[c]);
            h[c] = cap[c];
          }
        }
        if (blow > 0.5 && rnd() < 0.25 * blow) {
          c = (rnd() * n) | 0;
          if (h[c] > 1) { h[c] -= 0.4; addBit(sp.L + c * (sp.R - sp.L) / n, sp.T + sp.p.off[c] - h[c], w * 0.6, rr(-1.2, -0.2), 0.4); }
        }
      }
    }

    /* --- комочки (смахнутый снег) · snow bits (swept snow) --- */
    for (i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.16 * dt; b.vx += (w * 0.5 - b.vx) * 0.02 * dt;
      var bx = b.x + b.vx * dt, by = b.y + b.vy * dt, done = false;
      if (b.vy > 0) {
        for (j = 0; j < surf.length; j++) {
          c = hitSurface(surf[j], b.x, b.y, bx, by);
          if (c >= 0) { addSnow(surf[j], c, b.m * 0.5); done = true; break; }
        }
        if (!done && gVis) { gy = gBase - gAt(bx); if (by >= gy) { landGround(bx, b.m * 0.25); done = true; } }
      }
      b.life += dt;
      if (done || by > H + 20 || b.life > 900) { bits.splice(i, 1); continue; }
      b.x = bx; b.y = by;
    }

    /* --- сцена: физика, гномики, события · scene: physics, gnomes, events --- */
    stepObjects(dt, t);
    if (!giftT) giftT = t + rr(35, 70);
    if (t > giftT) { dropGift(false); giftT = t + rr(35, 70); }
    schedule(dt, t, gVis);
    if (frameN % 30 === 0 && gh) {                       // горка понемногу оседает и сглаживается · the hill slowly settles and smooths out
      for (c = 1; c < gn - 1; c++) if (gh[c] > 40) gh[c] = (gh[c - 1] + gh[c] * 2 + gh[c + 1]) / 4 - (gh[c] > 50 ? 0.03 : 0);
    }

    /* --- рисование: дальние снежинки → сугробы → сцена → комочки → ближние · drawing: far flakes → piles → scene → bits → near flakes --- */
    drawFlakes(0, 0.42);
    drawPiles();
    drawGarland(t, dt);
    if (gVis) drawScene(t, gBase); else drawObjs(t, gBase);
    drawSky(t);
    drawBits();
    drawFlakes(0.42, 1.01);
  }

  /* ---------- рисование · drawing ---------- */
  function drawFlakes(z0, z1) {
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      if (f.z < z0 || f.z >= z1) continue;
      ctx.globalAlpha = 0.35 + f.z * 0.6;
      if (f.r < 1.3) ctx.fillRect(f.x, f.y, f.r * 1.4, f.r * 1.4);
      else { ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  function drawBits() {
    ctx.fillStyle = C.snow;
    for (var i = 0; i < bits.length; i++) { var b = bits[i]; ctx.fillRect(b.x - b.r / 2, b.y - b.r / 2, b.r, b.r); }
  }
  // сугроб рисуется только там, где снег есть: отдельными «кусками», основание повторяет скругление · a pile is drawn only where snow exists, in runs; the base follows the rounding
  function drawPiles() {
    for (var j = 0; j < surfaces.length; j++) {
      var s = surfaces[j], p = s.p, h = p.h, off = p.off, n = p.n;
      if (s.T < -20 || s.T > H + 20) continue;
      var cw = (s.R - s.L) / n, c = 0;
      while (c < n) {
        while (c < n && h[c] < 0.3) c++;
        if (c >= n) break;
        var a = c;
        while (c < n && h[c] >= 0.3) c++;
        var e = c - 1;
        drawRun(s, h, off, cw, a, e, 1.3, C.snowDark);
        drawRun(s, h, off, cw, a, e, 0, C.snow);
      }
    }
  }
  function drawRun(s, h, off, cw, a, e, dy, col) {
    var xa = s.L + a * cw, xe = s.L + (e + 1) * cw;
    ctx.beginPath();
    ctx.moveTo(xa, s.T + off[a] + dy * 0.4);
    var px = xa, py = s.T + off[a];
    for (var c = a; c <= e; c++) {
      var x = s.L + (c + 0.5) * cw, y = s.T + off[c] - h[c] + dy;
      ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x; py = y;
    }
    ctx.quadraticCurveTo(px, py, xe, s.T + off[e] + dy * 0.4);
    for (c = e; c >= a; c--) ctx.lineTo(s.L + (c + 0.5) * cw, s.T + off[c] + 0.6 + dy * 0.4);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  }

  function drawScene(t, gBase) {
    // снежный покров · ground snow
    ctx.beginPath();
    ctx.moveTo(0, gBase + 2);
    for (var c = 0; c < gn; c++) ctx.lineTo(c * gcw, gBase - gh[c]);
    ctx.lineTo(W, gBase + 2); ctx.closePath();
    ctx.fillStyle = '#dfe7f1'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, gBase + 2);
    for (c = 0; c < gn; c++) ctx.lineTo(c * gcw, gBase - gh[c] + 4);
    ctx.lineTo(W, gBase + 2); ctx.closePath();
    ctx.fillStyle = '#c3d0e2'; ctx.fill();

    // ёлка · tree
    var tr = treeSprite(), tx = treeX * W, tby = gBase + floorY(tx) + 2 * P;
    var x0 = snapv(tx - tr.cx * P), y0 = snapv(tby - tr.height);
    var sg = 0.5 + 0.5 * Math.sin(t * 2);
    ctx.globalAlpha = 0.35 + sg * 0.35; ctx.drawImage(glow('#ffd23f'), x0 + tr.cx * P - 22, y0 - 16, 44, 44); ctx.globalAlpha = 1;
    ctx.drawImage(tr, x0, y0);
    for (var i = 0; i < treeLightsC.length; i++) {
      var L = treeLightsC[i], on = reduced ? 1 : 0.5 + 0.5 * Math.sin(t * 3 + L.ph);
      var lx = x0 + L.x * P, ly = y0 + L.y * P;
      if (on > 0.55) { ctx.globalAlpha = (on - 0.45) * 0.9; ctx.drawImage(glow(L.c), lx - 8, ly - 8, 18, 18); ctx.globalAlpha = 1; }
      ctx.fillStyle = on > 0.35 ? L.c : '#163a24';
      ctx.fillRect(lx, ly, P, P);
    }

    drawCalendar(t, gBase);
    drawObjs(t, gBase);
  }
  // объекты: сначала снеговики и комья, потом подарки и шляпы; рисуются, только если видны · objects: snowmen and balls first, then gifts and hats; drawn only when on screen
  function drawObjs(t, gBase) {
    var order = objs.slice().sort(function (a, b) { return rank(a) - rank(b); });
    for (var i = 0; i < order.length; i++) {
      var o = order[i], oy = gBase + o.y;
      if (oy < -60 || oy > H + 120) continue;
      if (o.kind === 'snowman') drawSnowman(o, o.x, oy, t);
      else if (o.kind === 'ball') drawBall(o.x, oy - o.r + P, o.r, o.rot);
      else if (o.kind === 'gift') drawRot(o.spr, o.x, oy, o.rot);
      else if (o.kind === 'hat') { var hsp = hatSprite(o.style); if (hsp) drawRot(hsp, o.x, oy, o.rot || 0); }
      else if (o.kind === 'item') {
        var itd = ITEMS[o.type], isp = itemSprite(o.type);
        if (itd.glow) { ctx.globalAlpha = 0.45 + 0.35 * Math.sin(t * 4 + o.x); ctx.drawImage(glow(itd.glow), o.x - 16, oy - isp.height / 2 - 16, 32, 32); ctx.globalAlpha = 1; }
        drawRot(isp, o.x, oy, o.rot || 0);
      } else if (o.prop) {
        var psp = propSprite(o.kind);
        drawRot(psp, o.x, oy, 0);
        if (o.steam && rnd() < 0.25) sky.sparks.push({ x: o.x + rr(-2, 2), y: oy - psp.height, vx: rr(-0.15, 0.15), vy: -rr(0.4, 0.8), life: rr(40, 70), c: '#7d8a99' });
      }
    }
    for (i = 0; i < snowballs.length; i++) pixCircle(snowballs[i].x, gBase + snowballs[i].y, 3, '#f6f9fd');
    if (ev && gBase - GH < H) ev.gn.forEach(function (g) { drawGnome(g, gBase, t); });
  }
  function rank(o) { return o.held ? 9 : (o.kind === 'table' ? 0 : (o.prop ? 0.5 : (o.kind === 'snowman' ? 1 : (o.kind === 'ball' ? 2 : (o.kind === 'gift' ? 3 : 4))))); }
  function drawRot(spr, x, bottom, rot) {
    var w = spr.width, h = spr.height;
    if (!rot) { ctx.drawImage(spr, snapv(x - w / 2), snapv(bottom - h)); return; }
    ctx.save(); ctx.translate(x, bottom - h / 2); ctx.rotate(rot); ctx.drawImage(spr, -w / 2, -h / 2); ctx.restore();
  }
  function drawGnome(g, gBase, t) {
    if (g.gone) return;
    var spr = gnomeSprites(g.look), key = g.pose === 'up' ? 'up' : (g.moving ? (Math.floor(g.f / 5) % 2 ? 'run1' : 'run2') : 'stand');
    var img = spr[key][g.flip ? 1 : 0];
    var by = gBase + floorY(g.x) + P - g.hop;
    if (g.sled) { var sl = sledSprite()[g.flip ? 1 : 0]; ctx.drawImage(sl, snapv(g.x - sl.width / 2), snapv(by - sl.height)); by -= 3 * P; }
    if (g.knock > 0) {                               // сбит подарком — лежит · knocked down by a gift: lying
      ctx.save(); ctx.translate(g.x, by - 3 * P); ctx.rotate(g.kdir * Math.PI / 2); ctx.drawImage(img, -img.width / 2, -img.height + 3 * P); ctx.restore();
      if (Math.floor(t * 6) % 2) cell(g.x - 2 * P, by - 12 * P, 1, 1, '#ffd23f'), cell(g.x + 3 * P, by - 13 * P, 1, 1, '#ffd23f');
      return;
    }
    ctx.drawImage(img, snapv(g.x - img.width / 2), snapv(by - img.height));
  }

  function drawSnowman(sm, x, base, t) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(base + P));
    if (sm.tilt) ctx.rotate(sm.tilt);
    var r1 = sm.r1, r2 = sm.r2, r3 = sm.r3, st = sm.style || 'top', tiny = st === 'tiny';
    if (tiny) { r3 = r3 * 1.15; }
    var c1 = -r1, c2 = c1 - r1 - r2 + 3 * P, c3 = tiny ? c1 - r1 - r3 + 2 * P : c2 - r2 - r3 + 2 * P;
    if (tiny) { r2 = r1; c2 = c1; }
    var face = sm.face === -1 || (sm.face && t > sm.face);
    if (face && st === 'broom') {                        // метла в руке · broom in hand
      for (var bi = 0; bi < 14; bi++) cell(r2 + 9 * P, c2 + r2 * 0.6 - bi * P, 1, 1, '#6a4430');
      for (bi = -2; bi <= 2; bi++) cell(r2 + 9 * P + bi * P, c2 + r2 * 0.6 + P, 1, 3, '#d9b45b');
    }
    // руки-ветки за телом · twig arms behind the body
    if (face) {
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        for (var i = 0; i < 8; i++) cell(sgn * (r2 * 0.75 + i * P), c2 - r2 * 0.15 - i * P * 0.6, 1, 1, i % 3 ? '#6a4430' : '#4f3222');
        cell(sgn * (r2 * 0.75 + 5 * P), c2 - r2 * 0.15 - 5 * P * 0.6 - 2 * P, 1, 2, '#6a4430');
      }
    }
    drawBall(0, c1, r1);
    if (!tiny) drawBall(0, c2, r2);
    drawBall(0, c3, r3);
    // шарф · scarf
    if (sm.scarf) {
      var sw = Math.round(r3 * 2.1 / P);
      for (var k = 0; k < sw; k++) cell(-r3 * 1.05 + k * P, c3 + r3 - 2 * P, 1, 2, k % 3 ? sm.scarf : shadeHex(sm.scarf, -40));
      cell(r3 * 0.35, c3 + r3, 2, 4, sm.scarf); cell(r3 * 0.35, c3 + r3 + 4 * P, 2, 1, shadeHex(sm.scarf, -40));
    }
    if (face) {
      cell(-r3 * 0.4, c3 - r3 * 0.25, 1, 1, '#1a1a1a');
      cell(r3 * 0.2, c3 - r3 * 0.25, 1, 1, '#1a1a1a');
      cell(0, c3 + P * 0.2, 3, 1, '#ff8a2a'); cell(0, c3 + P * 1.2, 2, 1, '#e0661a');
      cell(-r3 * 0.3, c3 + r3 * 0.45, 1, 1, '#3a3a3a'); cell(0, c3 + r3 * 0.55, 1, 1, '#3a3a3a'); cell(r3 * 0.3, c3 + r3 * 0.45, 1, 1, '#3a3a3a');
      if (!tiny) for (var bb = -1; bb <= 1; bb++) cell(-P / 2, c2 + bb * r2 * 0.42, 1, 1, '#1a1a1a');
      if (st === 'earmuffs') {                            // наушники · earmuffs
        for (var ex = -1; ex <= 1; ex += 2) pixCircle(ex * r3 * 0.95, c3, 3 * P, sm.scarf || '#ff5fa2');
        for (var ea = 0; ea < 9; ea++) { var an = Math.PI + ea / 8 * Math.PI; cell(Math.cos(an) * r3 * 1.05, c3 + Math.sin(an) * r3 * 1.05, 1, 1, '#3a3f46'); }
      }
    }
    var hs = sm.hat ? hatSprite(st) : null;
    if (hs) ctx.drawImage(hs, snapv(-hs.width / 2 + (st === 'santa' ? P : 0)), snapv(c3 - r3 - hs.height + 3 * P));
    ctx.restore();
  }

  /* ---------- управление из консоли · console API ---------- */
  window.ftWinter = {
    version: VERSION,
    on: function () { setOn(true); },
    off: function () { setOn(false); },
    gnomes: function () { forceGnomes = true; evCool = 0; },
    // запустить событие: build, snowballs, sled, prank, gifts, calendar, tea, party, santa, fireworks, midnight, loot · run an event: build, snowballs, sled, prank, gifts, calendar, tea, party, santa, fireworks, midnight, loot
    openGift: function () { var g = objs.filter(function (o) { return o.kind === 'gift'; })[0]; if (g) breakGift(g, (performance.now() - T0) / 1000); return !!g; },
    event: function (name) { return runEvent(name, (performance.now() - T0) / 1000); },
    events: function () { return Object.keys(EVENTS); },
    state: function () {
      return { name: ev ? ev.name : null, santa: sky.santa ? { x: sky.santa.x | 0, y: sky.santa.y | 0, dir: sky.santa.dir } : null, sparks: sky.sparks.length, snowballs: snowballs.length, event: ev ? ev.gn.map(function (g) { return { x: g.x | 0, q: g.q.map(function (a) { return a.k; }).join(','), knock: g.knock > 0 }; }) : null,
        objs: objs.map(function (o) { return o.kind + '@' + (o.x | 0) + ',' + (o.y | 0); }), wrecks: wrecks.length, surfaces: surfaces.length, flakes: flakes.length, weather: weather.mode, accum: accum | 0 };
    },
    sim: function (n) { for (var i = 0; i < (n || 600); i++) { simOffset += 16.667; tick(performance.now() + simOffset); } },
    weather: function (m) { weather.next = 1e9; weather.mode = m; weather.ti = m === 'blizzard' ? 1 : (m === 'calm' ? 0.2 : 0.55); weather.tw = m === 'blizzard' ? 6 : (m === 'calm' ? 0.5 : 1.4); },
    _objs: function () { return objs; },
    _snowman: function (style, xf) { var sm = newSnowman(W * xf, { style: style, face: -1 }); return sm.style; },
    _item: function (type, xf) { newItem(type, W * xf, -60); },
    logo: function (n) { setupLogo(n && LOGO_VB[n] ? n : pick(Object.keys(LOGO_VB))); return logoName; },
    _break: function () { var sm = objs.filter(function (o) { return o.kind === 'snowman'; })[0]; if (sm) breakSnowman(sm, 4, -3, (performance.now() - T0) / 1000); }
  };

  /* ---------- старт · start ---------- */
  function boot() {
    if (wantOn()) { setup(); start(); }
    else if (inSeason) { setup(); document.body.appendChild(btn); paintBtn(); }   // в сезон кнопка видна, чтобы включить обратно · in season the button stays visible to turn it back on
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
  else setTimeout(boot, 300);
})();
