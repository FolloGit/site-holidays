/*!
 * site-holidays.js 1.0.0 — праздничные режимы для сайтов FolloTeam.
 *
 * Сайт подключает только этот файл (один раз и навсегда):
 *   <script src="assets/holidays/site-holidays.js?v=1.0.0" defer></script>
 * Загрузчик смотрит на дату, адрес и пасхалку и подгружает нужный праздник из holidays/.
 * Новые праздники добавляются в список HOLIDAYS ниже и файлом holidays/<id>.js — сайты не трогаем.
 *
 * Сейчас:
 *   winter — зима и Новый год, 1 декабря – конец февраля (holidays/winter.js).
 *
 * Адрес страницы:
 *   ?holiday=winter — включить праздник принудительно, ?holiday=off — выключить всё;
 *   ?winter=1 / ?winter=0 — то же для зимы (старый вариант, работает).
 * Пасхалка: элемент с атрибутом data-holiday-egg (или старым data-winter-egg) включает праздник
 * вне сезона (сейчас — зиму); повторное нажатие выключает.
 *
 * Настройки (необязательно, до подключения):
 *   window.SITE_HOLIDAYS = {
 *     off: ['winter'],          // какие праздники на этом сайте не нужны
 *     winter: { ... }           // настройки модуля зимы (см. README) — то же, что window.FT_WINTER
 *   };
 * Консоль: siteHolidays.list() / active() / load('winter') / version.
 */
(function () {
  'use strict';
  if (window.siteHolidays) return;

  var VERSION = '1.0.0';
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/[^\/?#]*([?#].*)?$/, '') : 'assets/holidays/';
  var CFG = window.SITE_HOLIDAYS || {};

  // Праздники: id, файл модуля, когда активен (месяцы 1–12 или функция от даты), ключ пасхалки
  var HOLIDAYS = [
    { id: 'winter', file: 'holidays/winter.js', months: [12, 1, 2], eggKey: 'ftWinterEgg', offKey: 'ftWinter' }
  ];

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

  // какой праздник показать: адрес → сезон → пасхалка
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
      if (inSeason(h)) return h;                     // в сезон модуль грузится всегда (у него своя кнопка выкл/вкл)
      if (h.eggKey && ls(h.eggKey) === '1') return h; // вне сезона — если включили пасхалкой
    }
    return null;
  }

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

  // Пасхалка до загрузки модуля: первое нажатие включает праздник вне сезона и подгружает его.
  // Дальше нажатия обрабатывает сам модуль.
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
  // невидимая кнопка-пасхалка не должна занимать место и показывать курсор, пока модуль не загружен
  var st = document.createElement('style');
  st.textContent = '[data-holiday-egg],[data-winter-egg]{position:relative;align-self:center;display:inline-block;flex:none;width:28px;height:28px;margin:-6px 0 -6px -30px;padding:0;border:0;background:transparent;cursor:default;vertical-align:middle;-webkit-tap-highlight-color:transparent}' +
    '[data-holiday-egg]:focus,[data-winter-egg]:focus{outline:none}';
  (document.head || document.documentElement).appendChild(st);

  function boot() {
    var h = pickActive();
    if (h) load(h); else document.addEventListener('click', onEgg, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.siteHolidays = {
    version: VERSION,
    base: BASE,
    list: function () { return HOLIDAYS.map(function (h) { return h.id + (inSeason(h) ? ' (сезон)' : ''); }); },
    active: function () { var h = pickActive(); return h ? h.id : null; },
    load: function (id) { return load(byId(id)); }
  };
})();
