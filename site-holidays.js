/*!
 * site-holidays.js 1.0.0
 * Праздничные режимы для сайтов / Holiday modes for websites — FolloTeam · https://folloteam.ru
 *
 * RU  Сайт подключает только этот файл, один раз и навсегда. Загрузчик смотрит на дату,
 *     адрес страницы и пасхалку и подгружает нужный праздник из holidays/.
 *     Новый праздник — строчка в HOLIDAYS ниже и файл holidays/<id>.js; сайты при этом не трогаем.
 *
 * EN  A site includes only this file, once and for good. The loader checks the date,
 *     the page URL and the easter egg, then loads the right holiday from holidays/.
 *     A new holiday is one entry in HOLIDAYS below plus a holidays/<id>.js file; sites stay untouched.
 *
 *   <script src="assets/holidays/site-holidays.js?v=1.0.0" defer></script>
 *
 * Праздники / Holidays:
 *   winter — зима и Новый год · winter and New Year, Dec 1 – end of Feb (holidays/winter.js)
 *
 * Адрес / URL:
 *   ?holiday=winter   — включить праздник · force a holiday on
 *   ?holiday=off      — выключить всё · turn everything off
 *   ?winter=1 | 0     — то же для зимы, старый вариант · legacy switch for winter
 *
 * Пасхалка / Easter egg:
 *   элемент с data-holiday-egg="winter" (или старым data-winter-egg) включает праздник вне сезона,
 *   повторное нажатие выключает · an element with data-holiday-egg="winter" (or legacy
 *   data-winter-egg) turns the holiday on out of season; pressing again turns it off.
 *
 * Настройки / Options (до подключения · before the script tag):
 *   window.SITE_HOLIDAYS = {
 *     off: ['winter'],      // праздники, не нужные этому сайту · holidays this site does not want
 *     winter: { ... }       // настройки модуля зимы · winter module options (= window.FT_WINTER)
 *   };
 *
 * Консоль / Console: siteHolidays.list() · active() · load('winter') · version
 */
(function () {
  'use strict';
  if (window.siteHolidays) return;

  var VERSION = '1.0.0';
  var SCRIPT = document.currentScript;
  // папка загрузчика: модули и картинки лежат рядом · loader folder: modules and images live next to it
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/[^\/?#]*([?#].*)?$/, '') : 'assets/holidays/';
  var CFG = window.SITE_HOLIDAYS || {};

  // Список праздников · Holiday list
  //   id      — имя праздника · holiday name
  //   file    — модуль относительно загрузчика · module path relative to the loader
  //   months  — месяцы 1–12 (или when: function (date) {…} для точных дат) · months 1–12, or when(date) for exact dates
  //   eggKey  — ключ localStorage «включено пасхалкой» · localStorage key for "enabled via easter egg"
  //   offKey  — ключ localStorage «выключено посетителем в сезон» · localStorage key for "turned off in season"
  var HOLIDAYS = [
    { id: 'winter', file: 'holidays/winter.js', months: [12, 1, 2], eggKey: 'ftWinterEgg', offKey: 'ftWinter' }
  ];

  // localStorage без исключений (приватный режим и т. п.) · exception-safe localStorage
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { return null; }
  }
  function byId(id) { for (var i = 0; i < HOLIDAYS.length; i++) if (HOLIDAYS[i].id === id) return HOLIDAYS[i]; return null; }
  function disabled(h) { return CFG.off && CFG.off.indexOf(h.id) >= 0; }
  function inSeason(h, d) {
    d = d || new Date();
    if (typeof h.when === 'function') return !!h.when(d);
    return h.months ? h.months.indexOf(d.getMonth() + 1) >= 0 : false;
  }

  // Какой праздник показать: адрес → сезон → пасхалка · Which holiday to show: URL → season → easter egg
  function pickActive() {
    var q = location.search;
    if (/[?&]holiday=off\b/.test(q)) return null;
    var m = /[?&]holiday=([a-z0-9_-]+)/.exec(q);
    if (m && byId(m[1])) return byId(m[1]);
    var w = /[?&]winter=(0|1)/.exec(q);
    if (w) return w[1] === '1' ? byId('winter') : null;
    for (var i = 0; i < HOLIDAYS.length; i++) {
      var h = HOLIDAYS[i];
      if (disabled(h)) continue;
      // в сезон модуль грузится всегда (у него своя кнопка выкл/вкл) · in season always load (the module has its own on/off button)
      if (inSeason(h)) return h;
      // вне сезона — только если включили пасхалкой · off season only if enabled via the easter egg
      if (h.eggKey && ls(h.eggKey) === '1') return h;
    }
    return null;
  }

  // Подгрузить модуль праздника (один раз) · Load a holiday module (once)
  var loaded = {};
  function load(h, cb) {
    if (!h) return false;
    if (loaded[h.id]) { if (cb) cb(); return true; }
    loaded[h.id] = true;
    if (h.id === 'winter' && CFG.winter && !window.FT_WINTER) window.FT_WINTER = CFG.winter;
    var s = document.createElement('script');
    s.src = BASE + h.file + '?v=' + VERSION;
    s.async = false;
    if (cb) s.onload = cb;
    (document.head || document.documentElement).appendChild(s);
    return true;
  }

  // Пасхалка до загрузки модуля: первое нажатие включает праздник и подгружает его, дальше
  // нажатия обрабатывает сам модуль.
  // Easter egg before the module is loaded: the first press enables the holiday and loads it,
  // later presses are handled by the module itself.
  var EGG = '[data-holiday-egg],[data-winter-egg]';
  function onEgg(e) {
    var t = e.target && e.target.closest && e.target.closest(EGG);
    if (!t) return;
    var h = byId(t.getAttribute('data-holiday-egg') || 'winter');
    if (!h || loaded[h.id] || disabled(h)) return;
    e.preventDefault(); e.stopPropagation();
    if (!inSeason(h) && h.eggKey) ls(h.eggKey, '1');
    if (inSeason(h) && h.offKey) ls(h.offKey, 'on');
    document.removeEventListener('click', onEgg, true);
    load(h);
  }

  // Невидимая кнопка-пасхалка: не занимает место и не показывает курсор, пока модуль не загружен.
  // Hidden easter-egg button: takes no space and shows no cursor until a module is loaded.
  var st = document.createElement('style');
  st.textContent = '[data-holiday-egg],[data-winter-egg]{position:relative;align-self:center;display:inline-block;flex:none;width:28px;height:28px;margin:-6px 0 -6px -30px;padding:0;border:0;background:transparent;cursor:default;vertical-align:middle;-webkit-tap-highlight-color:transparent}' +
    '[data-holiday-egg]:focus,[data-winter-egg]:focus{outline:none}';
  (document.head || document.documentElement).appendChild(st);

  // Старт · Start
  function boot() {
    var h = pickActive();
    if (h) load(h); else document.addEventListener('click', onEgg, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // Консоль · Console API
  window.siteHolidays = {
    version: VERSION,
    base: BASE,
    list: function () { return HOLIDAYS.map(function (h) { return h.id + (inSeason(h) ? ' (сезон · in season)' : ''); }); },
    active: function () { var h = pickActive(); return h ? h.id : null; },
    load: function (id) { return load(byId(id)); }
  };
})();
