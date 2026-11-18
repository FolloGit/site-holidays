/*!
 * site-holidays · holidays/logo.js 1.0.0
 * Праздничный логотип поверх текстового знака / Holiday logo over the text mark — FolloTeam · https://folloteam.ru
 *
 * RU  Общий помощник для праздников: кладёт SVG-знак поверх текстового «>>FT_» с атрибутом
 *     data-winter-logo (или data-holiday-logo) и прячет текст под ним. SVG нарисован тем же
 *     шрифтом (1em = 200 единиц, базовая линия y = 0), поэтому ложится точно при любом размере.
 *     Цвет #ff4f12 в SVG перекрашивается в цвет из атрибута: data-winter-logo="#ff4f12".
 *
 * EN  Shared helper for holidays: lays an SVG mark over the ">>FT_" text mark that carries
 *     data-winter-logo (or data-holiday-logo) and hides the text underneath. The SVG uses the same
 *     font (1em = 200 units, baseline at y = 0), so it lines up at any size.
 *     #ff4f12 in the SVG is recoloured to the attribute value: data-winter-logo="#ff4f12".
 *
 *   siteHolidayLogo.show(url, [x, y, w, h])  · hide()
 */
(function () {
  'use strict';
  if (window.siteHolidayLogo) return;
  var SEL = '[data-winter-logo],[data-holiday-logo]';
  var style = null, current = null, cache = {};

  function baseline(el) {
    var m = document.createElement('span');
    m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(m);
    var fs = parseFloat(getComputedStyle(el).fontSize) || 24;
    var b = (m.offsetTop - el.offsetTop) / fs;
    el.removeChild(m);
    return b > 0.3 && b < 2 ? b : 1.02;
  }
  function accent(el) { return el.getAttribute('data-holiday-logo') || el.getAttribute('data-winter-logo') || ''; }

  function apply(url, vb, svg) {
    if (current !== url) return;
    var els = document.querySelectorAll(SEL);
    if (!els.length) return;
    var k = 0.005, base = baseline(els[0]), accents = {};
    els.forEach(function (el) { accents[accent(el)] = 1; });
    var css = '[data-winter-logo],[data-holiday-logo]{position:relative}' +
      'html.ft-holiday-logo :is(' + SEL + '),html.ft-holiday-logo :is(' + SEL + ') *{color:transparent!important;animation:none!important}' +
      ':is(' + SEL + ')::after{content:"";position:absolute;pointer-events:none;opacity:0;transition:opacity .45s;' +
      'left:' + (vb[0] * k) + 'em;top:' + (base + vb[1] * k) + 'em;width:' + (vb[2] * k) + 'em;height:' + (vb[3] * k) + 'em;' +
      'background:no-repeat 0 0/100% 100%}' +
      'html.ft-holiday-logo :is(' + SEL + ')::after{opacity:1}';
    Object.keys(accents).forEach(function (acc) {
      var col = /^#[0-9a-f]{3,8}$/i.test(acc) ? acc : '#ff4f12';
      var uri = 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/#ff4f12/gi, col));
      css += '[data-winter-logo="' + acc + '"]::after,[data-holiday-logo="' + acc + '"]::after{background-image:url("' + uri + '")}';
    });
    if (!style) { style = document.createElement('style'); document.head.appendChild(style); }
    style.textContent = css;
    document.documentElement.classList.add('ft-holiday-logo');
  }

  window.siteHolidayLogo = {
    show: function (url, vb) {
      if (!document.querySelector(SEL)) return false;
      current = url;
      if (cache[url]) { apply(url, vb, cache[url]); return true; }
      fetch(url).then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function (t) { cache[url] = t; apply(url, vb, t); }, function () {});
      return true;
    },
    hide: function () { current = null; document.documentElement.classList.remove('ft-holiday-logo'); }
  };
})();
