/*!
 * site-holidays.js 1.2.0
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
 *   <script src="assets/holidays/site-holidays.js?v=1.2.0" defer></script>
 *
 * Праздники / Holidays:
 *   winter       — зима и Новый год · winter and New Year, Dec 1 – end of Feb (holidays/winter.js)
 *   lunar        — китайский Новый год · Lunar New Year, −2…+7 days around it
 *   valentine    — День святого Валентина · Valentine's Day, Feb 10–15
 *   aprilfools   — День смеха · April Fools' Day, Apr 1
 *   cosmonautics — День космонавтики · Human Space Flight Day, Apr 10–13
 *   earth        — День Земли · Earth Day, Apr 20–23
 *   moon         — День Луны · International Moon Day, Jul 18–21
 *   programmer   — День программиста · Programmer's Day, day 256 ±1 (Sep 12–14)
 *   halloween    — Хэллоуин · Halloween, Oct 25–31
 *   birthday     — День рождения FolloTeam · FolloTeam's birthday, date ±1 day (SITE_HOLIDAYS.birthday.date = 'MM-DD')
 *   Все, кроме зимы, работают на общем holidays/kit.js · All but winter run on the shared holidays/kit.js
 *
 * Адрес / URL:
 *   ?holiday=winter   — включить праздник · force a holiday on
 *   ?holiday=off      — выключить всё · turn everything off
 *   ?winter=1 | 0     — то же для зимы, старый вариант · legacy switch for winter
 *
 * Пасхалка / Easter egg:
 *   элемент с data-holiday-egg (или старым data-winter-egg) перебирает праздники по кругу:
 *   зима → китайский Новый год → День влюблённых → … → выкл → зима. Выбор запоминается до
 *   смены сезона, потом снова решает календарь; siteHolidays.auto() сбрасывает выбор сразу.
 *   An element with data-holiday-egg (or legacy data-winter-egg) cycles through the holidays:
 *   winter → Lunar New Year → Valentine's → … → off → winter. The choice is remembered until
 *   the season changes, then the calendar takes over again; siteHolidays.auto() resets it now.
 *
 * Настройки / Options (до подключения · before the script tag):
 *   window.SITE_HOLIDAYS = {
 *     off: ['winter'],      // праздники, не нужные этому сайту · holidays this site does not want
 *     winter: { ... }       // настройки модуля зимы · winter module options (= window.FT_WINTER)
 *   };
 *
 * Консоль / Console: siteHolidays.list() · active() · set('lunar' | 'off') · next() · auto() · version
 */
(function () {
  'use strict';
  if (window.siteHolidays) return;

  var VERSION = '1.2.0';
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
  // Китайский Новый год: первый день лунного года, праздник — с −2 по +7 день · Lunar New Year: day one of the lunar year, shown −2…+7 days
  var LUNAR = { 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23], 2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8], 2036: [1, 28] };
  function lunarSeason(d) {
    var y = d.getFullYear(), n = LUNAR[y];
    if (!n) return false;
    var days = Math.floor((new Date(y, d.getMonth(), d.getDate()) - new Date(y, n[0] - 1, n[1])) / 864e5);
    return days >= -2 && days <= 7;
  }

  // Список праздников · Holiday list
  //   id    — имя праздника · holiday name
  //   file  — модуль относительно загрузчика · module path relative to the loader
  //   api   — объект модуля в window (нужны on() и off()) · module object in window (needs on() and off())
  //   title, icon, color — подпись, значок и цвет для пасхалки · label, icon and colour for the easter egg
  //   order — место в круге пасхалки · position in the easter-egg cycle
  //   months | when(date) — сезон · season
  //   eggKey, offKey — ключи localStorage самого модуля · the module's own localStorage keys
  // Новый праздник попадает в круг пасхалки сам — достаточно строчки здесь.
  // A new holiday joins the easter-egg cycle on its own — one entry here is enough.
  // даты: месяц 1–12, день; окно включительно · dates: month 1–12, day; inclusive window
  function days(m1, d1, m2, d2) {
    return function (d) { var v = (d.getMonth() + 1) * 100 + d.getDate(); return v >= m1 * 100 + d1 && v <= m2 * 100 + d2; };
  }
  // День программиста — 256-й день года (13 сентября, в високосный — 12-го), ±1 день
  // Programmer's Day is day 256 of the year (Sep 13, Sep 12 in leap years), ±1 day
  function programmerSeason(d) {
    var doy = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 0)) / 864e5);
    return doy >= 255 && doy <= 257;
  }
  // День рождения FolloTeam: дата 'ММ-ДД' в SITE_HOLIDAYS.birthday.date или здесь; без даты — только пасхалкой и ?holiday=birthday
  // FolloTeam's birthday: 'MM-DD' in SITE_HOLIDAYS.birthday.date or here; without a date only via the egg and ?holiday=birthday
  var BIRTHDAY = (CFG.birthday && CFG.birthday.date) || null;
  function birthdaySeason(d) {
    var m = /^(\d\d)-(\d\d)$/.exec(BIRTHDAY || '');
    if (!m) return false;
    var b = new Date(d.getFullYear(), +m[1] - 1, +m[2]), t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.abs(t - b) <= 864e5;
  }

  var HOLIDAYS = [
    // короткие праздники — раньше сезонных: первый подходящий побеждает · short holidays go before seasons: first match wins
    // kit: true — модулю нужен общий holidays/kit.js · the module needs the shared holidays/kit.js
    { id: 'valentine', file: 'holidays/valentine.js', kit: true, api: 'ftValentine', title: 'День влюблённых', icon: '♥', color: '#ff4f6d', order: 30,
      when: days(2, 10, 2, 15), eggKey: 'ftValentineEgg', offKey: 'ftValentine' },
    { id: 'lunar', file: 'holidays/lunar.js', kit: true, api: 'ftLunar', title: 'Китайский Новый год', icon: '福', color: '#ffcc3f', order: 20,
      when: lunarSeason, eggKey: 'ftLunarEgg', offKey: 'ftLunar' },
    { id: 'aprilfools', file: 'holidays/aprilfools.js', kit: true, api: 'ftAprilfools', title: 'День смеха', icon: '☺', color: '#ffd23f', order: 40,
      when: days(4, 1, 4, 1), eggKey: 'ftAprilfoolsEgg', offKey: 'ftAprilfools' },
    { id: 'cosmonautics', file: 'holidays/cosmonautics.js', kit: true, api: 'ftCosmonautics', title: 'День космонавтики', icon: '✦', color: '#7ab8ff', order: 50,
      when: days(4, 10, 4, 13), eggKey: 'ftCosmonauticsEgg', offKey: 'ftCosmonautics' },
    { id: 'earth', file: 'holidays/earth.js', kit: true, api: 'ftEarth', title: 'День Земли', icon: '❀', color: '#5cc96b', order: 60,
      when: days(4, 20, 4, 23), eggKey: 'ftEarthEgg', offKey: 'ftEarth' },
    { id: 'moon', file: 'holidays/moon.js', kit: true, api: 'ftMoon', title: 'День Луны', icon: '☾', color: '#d8dce6', order: 70,
      when: days(7, 18, 7, 21), eggKey: 'ftMoonEgg', offKey: 'ftMoon' },
    { id: 'programmer', file: 'holidays/programmer.js', kit: true, api: 'ftProgrammer', title: 'День программиста', icon: '</>', color: '#3ddc84', order: 80,
      when: programmerSeason, eggKey: 'ftProgrammerEgg', offKey: 'ftProgrammer' },
    { id: 'halloween', file: 'holidays/halloween.js', kit: true, api: 'ftHalloween', title: 'Хэллоуин', icon: '☠︎', color: '#ff8a1e', order: 90,
      when: days(10, 25, 10, 31), eggKey: 'ftHalloweenEgg', offKey: 'ftHalloween' },
    { id: 'birthday', file: 'holidays/birthday.js', kit: true, api: 'ftBirthday', title: 'День рождения FolloTeam', icon: '✱', color: '#ff4f12', order: 95,
      when: birthdaySeason, eggKey: 'ftBirthdayEgg', offKey: 'ftBirthday' },
    { id: 'winter', file: 'holidays/winter.js', api: 'ftWinter', title: 'Зима', icon: '❄︎', color: '#5b96f5', order: 10,
      months: [12, 1, 2], eggKey: 'ftWinterEgg', offKey: 'ftWinter' }
  ];

  // выбор посетителя пасхалкой: id праздника или 'off' · visitor's easter-egg choice: holiday id or 'off'
  var CHOICE_KEY = 'siteHoliday';

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
  // круг пасхалки: все праздники сайта по order · easter-egg cycle: all of the site's holidays by order
  function cycle() {
    return HOLIDAYS.filter(function (h) { return !disabled(h); }).sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
  }

  // Праздник, который сейчас по календарю (или 'none') · The holiday the calendar wants now (or 'none')
  function seasonId() {
    for (var i = 0; i < HOLIDAYS.length; i++) if (!disabled(HOLIDAYS[i]) && inSeason(HOLIDAYS[i])) return HOLIDAYS[i].id;
    return 'none';
  }

  // Какой праздник показать: адрес → выбор пасхалкой → сезон → старые ключи пасхалки
  // Which holiday to show: URL → easter-egg choice → season → legacy easter-egg keys
  function pickActive() {
    var q = location.search;
    if (/[?&]holiday=off\b/.test(q)) return null;
    var m = /[?&]holiday=([a-z0-9_-]+)/.exec(q);
    if (m && byId(m[1])) return byId(m[1]);
    var w = /[?&]winter=(0|1)/.exec(q);
    if (w) return w[1] === '1' ? byId('winter') : null;
    // выбор пасхалкой держится, пока не сменился сезон · the egg choice holds until the season changes
    var c = (ls(CHOICE_KEY) || '').split('|');
    if (c[0] && c[1] !== seasonId()) {
      // сезон сменился: выбор и ключи модулей забываем — дальше решает календарь
      // the season changed: forget the choice and the modules' keys — the calendar decides from now on
      ls(CHOICE_KEY, null); c = [''];
      for (var j = 0; j < HOLIDAYS.length; j++) { if (HOLIDAYS[j].offKey) ls(HOLIDAYS[j].offKey, null); if (HOLIDAYS[j].eggKey) ls(HOLIDAYS[j].eggKey, null); }
    }
    if (c[0] === 'off') return null;
    if (c[0] && byId(c[0]) && !disabled(byId(c[0]))) return byId(c[0]);
    for (var i = 0; i < HOLIDAYS.length; i++) {
      var h = HOLIDAYS[i];
      if (disabled(h)) continue;
      // в сезон модуль грузится всегда (у него своя кнопка выкл/вкл) · in season always load (the module has its own on/off button)
      if (inSeason(h)) return h;
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
    // общий набор — раньше модуля (скрипты с async=false выполняются по порядку) · the shared kit goes first (async=false scripts run in order)
    if (h.kit && !loaded.__kit) {
      loaded.__kit = true;
      var k = document.createElement('script');
      k.src = BASE + 'holidays/kit.js?v=' + VERSION;
      k.async = false;
      (document.head || document.documentElement).appendChild(k);
    }
    var s = document.createElement('script');
    s.src = BASE + h.file + '?v=' + VERSION;
    s.async = false;
    if (cb) s.onload = cb;
    (document.head || document.documentElement).appendChild(s);
    return true;
  }
  function api(h) { return h && h.api ? window[h.api] : null; }

  // Сказать модулю «включайся»: его собственные ключи → «вкл» · Tell a module to start: its own keys → "on"
  function prime(h) {
    if (inSeason(h)) { if (h.offKey) ls(h.offKey, 'on'); }
    else if (h.eggKey) ls(h.eggKey, '1');
  }

  // Текущий праздник страницы · The page's current holiday
  var current = null;

  // Переключить праздник без перезагрузки: старый выключаем, новый грузим или включаем
  // Switch holidays without a reload: turn the old one off, load or turn on the new one
  function choose(id, save) {
    var next = id === 'off' ? null : byId(id);
    if (next && disabled(next)) return;
    if (current && current !== next) {
      var a = api(current); if (a && a.off) a.off();
      // это переключение, а не «выключил посетитель»: ключи модуля не оставляем · a switch, not the visitor's "off": drop the module's keys
      if (current.offKey) ls(current.offKey, null);
      if (current.eggKey) ls(current.eggKey, null);
    }
    current = next;
    if (save !== false) ls(CHOICE_KEY, id + '|' + seasonId());
    if (next) {
      prime(next);
      if (loaded[next.id]) { var b = api(next); if (b && b.on) b.on(); }
      else load(next, function () {
        // пока модуль грузился, могли нажать ещё раз · the egg may have been pressed again while loading
        if (current !== next) { var c = api(next); if (c && c.off) c.off(); }
      });
    }
    mark();
  }

  // Пометить страницу текущим праздником: значок на пасхалке и только его кнопка вкл/выкл
  // Mark the page with the current holiday: icon on the egg and only its own on/off button
  var markSt = document.createElement('style');
  function mark() {
    var id = current ? current.id : 'off';
    document.documentElement.setAttribute('data-site-holiday', id);
    markSt.textContent = current
      ? '[data-holiday-btn]:not([data-holiday-btn="' + id + '"]){display:none!important}' +
        'html[data-site-holiday="' + id + '"] [data-holiday-egg]::after,html[data-site-holiday="' + id + '"] [data-winter-egg]::after{content:"' + current.icon + '";color:' + current.color + ';text-shadow:0 0 10px ' + current.color + ';opacity:1;transform:none}'
      : '[data-holiday-btn]{display:none!important}';
  }

  // Подпись у пасхалки после нажатия: «❄ ЗИМА · 1 / 3» или «ВЫКЛ»
  // Label next to the egg after a press: "❄ WINTER · 1 / 3" or "OFF"
  var tip = null, tipT = 0;
  function toast(el) {
    if (!document.body) return;
    if (!tip) {
      tip = document.createElement('div');
      tip.setAttribute('data-winter-ignore', ''); tip.setAttribute('aria-live', 'polite');
      tip.style.cssText = 'position:fixed;z-index:2147483002;pointer-events:none;padding:6px 10px;border-radius:10px;background:rgba(12,13,14,.92);border:1px solid rgba(236,235,230,.2);color:#ecebe6;font:700 12px/1.2 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;white-space:nowrap;transition:opacity .3s;opacity:0';
      document.body.appendChild(tip);
    }
    var list = cycle(), i = current ? list.indexOf(current) : -1;
    tip.textContent = current ? current.icon + ' ' + current.title.toUpperCase() + ' · ' + (i + 1) + ' / ' + list.length : 'ПРАЗДНИКИ ВЫКЛ';
    tip.style.color = current ? current.color : '#bdbcb5';
    var r = el.getBoundingClientRect();
    tip.style.top = Math.round(r.bottom + 10) + 'px';
    tip.style.left = Math.round(Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, r.left + r.width / 2 - tip.offsetWidth / 2))) + 'px';
    tip.style.opacity = '1';
    clearTimeout(tipT);
    tipT = setTimeout(function () { tip.style.opacity = '0'; }, 1800);
  }

  // Пасхалка: каждое нажатие — следующий праздник по кругу, после последнего — выкл.
  // Слушатель стоит раньше модулей, поэтому их собственные пасхалки не срабатывают.
  // Easter egg: each press moves to the next holiday in the cycle, after the last one — off.
  // This listener is registered before the modules, so their own egg handlers never fire.
  var EGG = '[data-holiday-egg],[data-winter-egg]';
  function onEgg(e) {
    var t = e.target && e.target.closest && e.target.closest(EGG);
    if (!t) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var list = cycle();
    if (!list.length) return;
    var i = current ? list.indexOf(current) : -1;
    choose(i + 1 < list.length ? list[i + 1].id : 'off');
    toast(t);
  }
  document.addEventListener('click', onEgg, true);

  // Невидимая кнопка-пасхалка: не занимает место и не показывает курсор, пока модуль не загружен.
  // Hidden easter-egg button: takes no space and shows no cursor until a module is loaded.
  var st = document.createElement('style');
  st.textContent = '[data-holiday-egg],[data-winter-egg]{position:relative;align-self:center;display:inline-block;flex:none;width:28px;height:28px;margin:-6px 0 -6px -30px;padding:0;border:0;background:transparent;cursor:default;vertical-align:middle;-webkit-tap-highlight-color:transparent}' +
    '[data-holiday-egg]:focus,[data-winter-egg]:focus{outline:none}';
  (document.head || document.documentElement).appendChild(st);
  (document.head || document.documentElement).appendChild(markSt);

  // Старт · Start
  function boot() {
    // версия 1.0–1.1: пасхалка включала праздник ключом модуля — переносим в новый выбор
    // versions 1.0–1.1: the egg enabled a holiday through the module key — move it to the new choice
    if (!ls(CHOICE_KEY)) for (var i = 0; i < HOLIDAYS.length; i++) {
      var o = HOLIDAYS[i];
      if (o.eggKey && ls(o.eggKey) === '1' && !inSeason(o) && !disabled(o)) { ls(CHOICE_KEY, o.id + '|' + seasonId()); break; }
    }
    var h = pickActive();
    if (h) choose(h.id, false); else mark();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // Консоль · Console API
  window.siteHolidays = {
    version: VERSION,
    base: BASE,
    list: function () { return cycle().map(function (h) { return h.id + (inSeason(h) ? ' (сезон · in season)' : ''); }); },
    // сейчас сезон праздника? (нужно модулям) · is it the holiday's season now? (used by modules)
    inSeason: function (id, d) { var h = byId(id); return !!(h && inSeason(h, d)); },
    // все праздники с подписями (для демо) · all holidays with labels (for the demo)
    info: function () { return cycle().map(function (h) { return { id: h.id, title: h.title, icon: h.icon, color: h.color, api: h.api, inSeason: inSeason(h) }; }); },
    active: function () { return current ? current.id : null; },
    load: function (id) { return load(byId(id)); },
    // выбрать праздник или 'off' и запомнить, как пасхалкой · choose a holiday or 'off' and remember it, like the egg does
    set: function (id) { choose(id); return current ? current.id : null; },
    // следующий по кругу · next in the cycle
    next: function () { var l = cycle(), i = current ? l.indexOf(current) : -1; choose(i + 1 < l.length ? l[i + 1].id : 'off'); return current ? current.id : null; },
    // забыть выбор пасхалкой: снова по календарю · forget the egg choice: back to the calendar
    auto: function () { ls(CHOICE_KEY, null); }
  };
})();
