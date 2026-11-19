/*!
 * site-holidays · holidays/cosmonautics.js 1.0.0
 * День космонавтики (Международный день полёта человека в космос) / International Day of Human Space Flight
 * FolloTeam · https://folloteam.ru
 *
 * RU  По странице мерцают звёзды, проносятся метеоры, иногда пролетает спутник; клик запускает
 *     маленькую ракету. Внизу гномики: собирают ракету и запускают её с обратным отсчётом,
 *     выход в открытый космос, телескоп и комета, НЛО забирает гномика и возвращает в шлеме,
 *     реактивный ранец. Антенна-радар на земле пищит по клику.
 *
 * EN  Stars twinkle across the page, meteors streak by, a satellite passes now and then; a click
 *     launches a tiny rocket. Gnomes at the bottom: build a rocket and launch it with a countdown,
 *     a spacewalk, a telescope and a comet, a UFO takes a gnome and returns him in a helmet, a
 *     jetpack. A radar dish on the ground beeps when clicked.
 *
 * Консоль / Console: ftCosmonautics.on() · off() · event('launch') · events() · logo('rocket') · state()
 */
(function () {
  'use strict';
  if (!window.siteHolidayKit || window.ftCosmonautics) return;
  var K = window.siteHolidayKit;
  var SKY = '#7ab8ff';
  var CP = { W: '#f4f7fb', w: '#c3cedc', R: '#e8402a', r: '#a8261a', B: '#3f6fd8', b: '#26489a', Y: '#ffd23f', y: '#c9a014', O: '#ff8a2a', K: '#1a1a1a',
    s: '#bfc5cc', S: '#8f969e', c: '#7ab8ff', C: '#bfe6ff', G: '#5cc96b', g: '#2a6f40', P: '#b78cff' };
  var ASTRO = { hat: 'helmet', t: ['#f4f7fb', '#c3cedc'], y: '#3f6fd8' };
  var ENGINEER = { hat: 'cap', h: ['#ff8a2a', '#c25a12'], t: ['#3f6fd8', '#26489a'], y: '#ffd23f' };

  /* ---------- слой эффектов: звёзды, метеоры, спутник · effects: stars, meteors, a satellite ---------- */
  var S = {}, stars = [], meteors = [], sat = null, nextSat = 0, nextMet = 0, rockets = [];
  function sp(f, name, rows, p) { return S[name] || (S[name] = f.sprite(rows, CP, p || 3)); }
  var SAT = ['bb.....bb', 'bbb.s.bbb', 'bbbsSsbbb', 'bbb.s.bbb', 'bb.....bb'];
  var ROCKET = ['.R.', 'RWR', 'WcW', 'WWW', 'RWR'];
  var fx = {
    on: function (f) { stars = []; meteors = []; sat = null; rockets = []; },
    frame: function (f, dt, T) {
      var ctx = f.ctx, i;
      f.shift(stars, function (s) { return s.z; }, true); f.shift(meteors); f.shift(rockets);
      var want = f.reduced ? 30 : Math.round(90 * Math.min(1.4, (f.W * f.H) / (1440 * 900)));
      while (stars.length < want) stars.push({ x: f.rr(0, f.W), y: f.rr(0, f.H), z: f.rr(0.2, 0.7), ph: f.rr(0, 6), s: Math.random() < 0.2 ? 2 : 1 });
      for (i = 0; i < stars.length; i++) {
        var s = stars[i]; s.ph += 0.04 * dt;
        ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(s.ph)) * s.z * 1.5;
        ctx.fillStyle = s.s > 1 ? '#fff6c4' : '#ffffff'; ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
      }
      ctx.globalAlpha = 1;
      if (!f.reduced && T > nextMet) { nextMet = T + f.rr(2, 6); meteors.push({ x: f.rr(f.W * 0.2, f.W), y: f.rr(-20, f.H * 0.4), vx: -f.rr(6, 9), vy: f.rr(2.5, 4), life: 40 }); }
      for (i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i]; m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt;
        if (m.life <= 0) { meteors.splice(i, 1); continue; }
        var g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 6, m.y - m.vy * 6);
        g.addColorStop(0, 'rgba(255,255,255,' + Math.min(1, m.life / 20) + ')'); g.addColorStop(1, 'rgba(122,184,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 6, m.y - m.vy * 6); ctx.stroke();
      }
      if (!sat && T > nextSat) { sat = { x: -40, y: f.rr(f.H * 0.08, f.H * 0.3), vx: f.rr(0.7, 1.1) }; }
      if (sat) {
        sat.x += sat.vx * dt; sat.y -= f.dsy * 0.2;
        var si = sp(f, 'sat', SAT, 3);
        ctx.drawImage(si, Math.round(sat.x - si.width / 2), Math.round(sat.y));
        if (Math.floor(T * 2) % 2) { ctx.fillStyle = '#ff5f5f'; ctx.fillRect(Math.round(sat.x), Math.round(sat.y - 3), 2, 2); }
        if (sat.x > f.W + 40) { sat = null; nextSat = T + f.rr(20, 40); }
      }
      for (i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i]; r.vy -= 0.12 * dt; r.y += r.vy * dt; r.x += Math.sin(r.y * 0.05) * 0.3;
        f.parts.push({ x: r.x + f.rr(-2, 2), y: r.y + 12, vx: f.rr(-0.4, 0.4), vy: f.rr(1, 2), g: 0, life: f.rr(10, 20), c: f.pick(['#ffd23f', '#ff8a2a', '#ffffff']), s: 2, rot: 0, vr: 0 });
        if (r.y < -40) { rockets.splice(i, 1); continue; }
        var ri = sp(f, 'rocket', ROCKET, 3); ctx.drawImage(ri, Math.round(r.x - ri.width / 2), Math.round(r.y - ri.height / 2));
      }
    },
    click: function (f, x, y) {
      rockets.push({ x: x, y: y, vy: -1 });
      f.burst(x, y + 6, { n: 10, colors: ['#ffffff', '#c3cedc'], min: 0.5, max: 2, g: 0.02, lift: 0 });
    },
    state: function () { return { stars: stars.length, sat: !!sat }; }
  };

  /* ---------- сцена · scene ---------- */
  var SPR = {};
  function spr(a, name, rows) { return SPR[name] || (SPR[name] = a.pair(rows, CP)); }
  var I = {
    part: function (a) { return spr(a, 'part', ['WWWW', 'WRRW', 'WWWW']); },
    nose: function (a) { return spr(a, 'nose', ['..R..', '.RRR.', 'RRRRR']); },
    telescope: function (a) { return spr(a, 'tele', ['......BB', '....BBBb', '..BBBb..', 'BBBb....', '..S.S...', '.S...S..', 'S.....S.']); },
    ufo: function (a) { return spr(a, 'ufo', ['.....CCCC.....', '....CCCCCC....', '..ssssssssss..', 'sSYsSYsSYsSYsS', '..ssssssssss..']); },
    pack: function (a) { return spr(a, 'pack', ['SS', 'ss', 'SS', 'RR']); },
    dish: function (a) { return spr(a, 'dish', ['s.......s', 'ss.....ss', '.sss.sss.', '...sSs...', '....S....', '....S....', '...SSS...']); },
    capsule: function (a) { return spr(a, 'capsule', ['...ss...', '..ssss..', '.sCssss.', 'ssssssss', 'SSSSSSSS']); }
  };
  // ракета на площадке: ступени, взлёт · a rocket on the pad: stages, lift-off
  function drawRocket(ctx, x, base, stages, flame, t) {
    var w = 14, h = 12;
    ctx.fillStyle = '#5a6070'; ctx.fillRect(Math.round(x - 18), Math.round(base - 4), 36, 4);
    for (var i = 0; i < stages; i++) {
      var y = base - 4 - (i + 1) * h;
      ctx.fillStyle = '#f4f7fb'; ctx.fillRect(Math.round(x - w / 2), Math.round(y), w, h);
      ctx.fillStyle = '#c3cedc'; ctx.fillRect(Math.round(x + w / 2 - 3), Math.round(y), 3, h);
      ctx.fillStyle = i === 0 ? '#e8402a' : '#3f6fd8'; ctx.fillRect(Math.round(x - w / 2), Math.round(y + 4), w, 3);
      if (i === 1) { ctx.fillStyle = '#7ab8ff'; ctx.fillRect(Math.round(x - 2), Math.round(y + 2), 4, 4); }
    }
    if (stages > 0) { ctx.fillStyle = '#e8402a'; ctx.fillRect(Math.round(x - w / 2 - 4), Math.round(base - 14), 4, 10); ctx.fillRect(Math.round(x + w / 2), Math.round(base - 14), 4, 10); }
    if (stages >= 3) {
      var ty = base - 4 - 3 * h;
      ctx.fillStyle = '#e8402a';
      for (var j = 0; j < 6; j++) ctx.fillRect(Math.round(x - (6 - j) * w / 12), Math.round(ty - (j + 1) * 2), Math.round((6 - j) * w / 6), 2);
    }
    if (flame) { for (var k = 0; k < 3; k++) { ctx.fillStyle = ['#ffffff', '#ffd23f', '#ff8a2a'][k]; var fl = (6 + k * 6) * (0.8 + 0.4 * Math.sin(t * 30 + k)); ctx.fillRect(Math.round(x - 4 + k), Math.round(base - 4), 8 - 2 * k, Math.round(fl)); } }
  }

  var EVENTS = {
    launch: { title: 'Запуск ракеты', run: function (a) {
      var W = a.W(), m = a.pad ? a.pad.x : W * 0.6, crew = [], st = { stages: 0, fly: 0, y: 0, vy: 0, count: 0 };
      var rocket = a.prop({ x: m, front: false, sky: true,
        step: function (p, dt) {
          if (st.fly) {
            st.fly += dt; st.vy -= 0.05 * dt; st.y += st.vy * dt;
            a.burst(m + a.rr(-6, 6), st.y - 2, { n: 2, colors: ['#ffffff', '#c3cedc', '#8f969e'], angle: Math.PI / 2, min: 0.5, max: 1.5, g: -0.01, life: 50 });
            if (a.floor() + st.y < -200) p.gone = true;
          }
        },
        draw: function (ctx, p, fy, t) { drawRocket(ctx, m, fy + st.y, st.stages, st.fly > 0, t); } });
      for (var i = 0; i < 3; i++) (function (i) {
        var g = a.folk(i % 2 ? W + 20 + i * 20 : -20 - i * 20, ENGINEER, 1.3);
        g.item = I.part(a);
        crew.push(g);
        g.q = [{ k: 'wait', n: i * 50 }, { k: 'run', x: m + (i % 2 ? 22 : -22) }, { k: 'until', f: function () { return st.stages === i; } }, { k: 'pose', p: 'up', n: 25 },
          { k: 'do', f: function () { g.item = null; st.stages++; a.burst(m, -10 - st.stages * 12, { n: 8, colors: ['#ffd23f', '#ffffff'] }); } },
          { k: 'run', x: m + (i - 1) * 60 + (i === 1 ? 120 : -120) }, { k: 'face', x: m }, { k: 'until', f: function () { return st.fly; } },
          { k: 'until', f: function (gg) { gg.pose = 'up'; return st.fly > 120; } }, { k: 'dance', n: 100 }, { k: 'leave', dir: i % 2 ? 1 : -1 }];
      })(i);
      var astro = a.folk(-30, ASTRO, 1);
      astro.q = [{ k: 'until', f: function () { return st.stages === 3; } }, { k: 'run', x: m - 26 }, { k: 'face', x: W }, { k: 'up', n: 40 }, { k: 'say', icon: 'star', n: 50 },
        { k: 'run', x: m }, { k: 'do', f: function () { astro.hidden = true; } }, { k: 'wait', n: 30 },
        { k: 'do', f: function () { a.say(crew[0], 'n3', 40); } }, { k: 'wait', n: 45 }, { k: 'do', f: function () { a.say(crew[0], 'n2', 40); } }, { k: 'wait', n: 45 },
        { k: 'do', f: function () { a.say(crew[0], 'n1', 40); } }, { k: 'wait', n: 45 }, { k: 'do', f: function () { st.fly = 1; } }, { k: 'gone' }];
    } },
    spacewalk: { title: 'Открытый космос', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), look = a.look(ASTRO);
      a.prop({ x: dir > 0 ? -60 : W + 60, y: -150, front: true, sky: true,
        step: function (p, dt, t) { p.x += dir * 0.7 * dt; p.y = -150 + Math.sin(t * 0.8) * 10; if ((dir > 0 && p.x > W + 80) || (dir < 0 && p.x < -80)) p.gone = true; },
        draw: function (ctx, p, fy, t) {
          var cap = I.capsule(a)[dir > 0 ? 0 : 1], cx = p.x + dir * 50, cy = fy + p.y - 10;
          ctx.drawImage(cap, Math.round(cx - cap.width / 2), Math.round(cy - cap.height / 2));
          var gx = p.x, gy = fy + p.y + 20;
          ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - dir * 8, cy); ctx.quadraticCurveTo((cx + gx) / 2, cy + 30 + Math.sin(t) * 8, gx, gy - 20); ctx.stroke();
          a.drawGnome(ctx, look, 'up', gx, gy, dir < 0, Math.sin(t * 0.6) * 0.6);
        } });
    } },
    telescope: { title: 'Комета', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.6), comet = false;
      var g = a.folk(-20, { hat: 'beanie', h: ['#3f6fd8', '#26489a'] }), friend = a.folk(W + 20);
      var tel = null;
      g.q = [{ k: 'run', x: m }, { k: 'do', f: function () { tel = a.prop({ x: m + 14, img: I.telescope(a) }); } }, { k: 'pose', p: 'kneel', n: 80 },
        { k: 'do', f: function () { comet = true; } }, { k: 'say', icon: 'bang', n: 50 }, { k: 'up', n: 60, jump: true }, { k: 'say', icon: 'star', n: 80 },
        { k: 'until', f: function () { return friend.seen; } }, { k: 'wait', n: 40 }, { k: 'do', f: function () { tel.gone = true; } }, { k: 'leave', dir: -1 }];
      friend.q = [{ k: 'until', f: function () { return comet; } }, { k: 'run', x: m + 44, sp: 2 }, { k: 'face', x: 0 }, { k: 'say', icon: 'q', n: 40 }, { k: 'wait', n: 40 },
        { k: 'face', x: W }, { k: 'up', n: 60 }, { k: 'say', icon: 'star', n: 60 }, { k: 'do', f: function () { friend.seen = true; } }, { k: 'wait', n: 40 }, { k: 'leave', dir: 1 }];
      a.prop({ x: W + 40, y: -190, front: true, sky: true,
        step: function (p, dt) {
          if (!comet) return;
          p.x -= 3.2 * dt; p.y += 0.35 * dt;
          a.burst(p.x + 4, p.y, { n: 2, colors: ['#ffffff', SKY, '#bfe6ff'], angle: -0.1, min: 0.3, max: 1, g: 0, life: 40 });
          if (p.x < -40) p.gone = true;
        },
        draw: function (ctx, p, fy) { if (!comet) return; ctx.drawImage(a.glow('#bfe6ff'), p.x - 12, fy + p.y - 12, 24, 24); ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(p.x - 2), Math.round(fy + p.y - 2), 4, 4); } });
    } },
    ufo: { title: 'НЛО', run: function (a) {
      var W = a.W(), m = W * a.rr(0.3, 0.7), beam = 0, lifted = false, back = false;
      var g = a.folk(-20, { hat: 'pointy' }, 1.1);
      var ufo = a.prop({ x: W + 60, y: -170, front: true, sky: true, ph: 'in',
        step: function (p, dt, t) {
          if (p.ph === 'in') { p.x += (m - p.x) * 0.03 * dt; if (Math.abs(p.x - m) < 2 && Math.abs(g.x - m) < 2) p.ph = 'beam'; }
          else if (p.ph === 'beam') { beam += dt; if (beam > 40 && !lifted) { g.liftY = (g.liftY || 0) + 1.2 * dt; if (g.liftY > 120) { lifted = true; g.hidden = true; } } if (lifted) { beam += dt; if (beam > 160) { p.ph = 'drop'; g.look = a.look({ hat: 'helmet', t: g.look.t, b: g.look.b, s: g.look.s }); g.hidden = false; } } }
          else if (p.ph === 'drop') { g.liftY -= 1.6 * dt; if (g.liftY <= 0) { g.liftY = 0; back = true; p.ph = 'out'; } }
          else if (p.ph === 'out') { p.x -= 4 * dt; p.y -= 1.5 * dt; if (p.x < -80) p.gone = true; }
          p.wob = Math.sin(t * 3) * 3;
        },
        draw: function (ctx, p, fy, t) {
          var im = I.ufo(a)[0], y = fy + p.y + p.wob;
          if ((p.ph === 'beam' && beam > 20) || p.ph === 'drop') {
            ctx.globalAlpha = 0.22 + 0.08 * Math.sin(t * 10); ctx.fillStyle = '#bfffcf';
            ctx.beginPath(); ctx.moveTo(p.x - 10, y + 8); ctx.lineTo(p.x + 10, y + 8); ctx.lineTo(p.x + 26, fy); ctx.lineTo(p.x - 26, fy); ctx.fill(); ctx.globalAlpha = 1;
          }
          ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(y));
          if (Math.floor(t * 6) % 2) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(Math.round(p.x - 12), Math.round(y + 6), 2, 2); }
        } });
      g.q = [{ k: 'run', x: m }, { k: 'say', icon: 'q', n: 60 }, { k: 'until', f: function (gg) { gg.pose = 'up'; gg.hop = gg.liftY || 0; return back; } },
        { k: 'say', icon: 'bang', n: 50 }, { k: 'up', n: 40, jump: true }, { k: 'say', icon: 'star', n: 70 }, { k: 'leave', dir: 1, bounce: 2 }];
    } },
    jetpack: { title: 'Реактивный ранец', run: function (a) {
      var W = a.W(), dir = a.pick([-1, 1]), look = a.look(ASTRO), t0 = a.T();
      a.prop({ x: dir > 0 ? -20 : W + 20, y: 0, front: true, sky: true, vy: 0,
        step: function (p, dt, t) {
          p.x += dir * 2 * dt;
          var tt = t - t0, target = -50 - Math.sin(tt * 1.6) * 40 - (tt < 1 ? 0 : 20);
          p.y += (target - p.y) * 0.05 * dt;
          a.burst(p.x - dir * 6, p.y - 10, { n: 2, colors: ['#ffd23f', '#ff8a2a', '#ffffff'], angle: Math.PI / 2, min: 1, max: 2.5, g: 0.02, life: 18 });
          if ((dir > 0 && p.x > W + 40) || (dir < 0 && p.x < -40)) p.gone = true;
        },
        draw: function (ctx, p, fy, t) {
          var pk = I.pack(a)[0];
          ctx.drawImage(pk, Math.round(p.x - dir * 8 - pk.width / 2), Math.round(fy + p.y - 26));
          a.drawGnome(ctx, look, 'up', p.x, fy + p.y, dir < 0, dir * 0.15);
        } });
      var fan = a.folk(dir > 0 ? W + 20 : -20);
      fan.q = [{ k: 'run', x: W * (dir > 0 ? 0.7 : 0.3) }, { k: 'face', x: dir > 0 ? 0 : W }, { k: 'say', icon: 'bang', n: 60 }, { k: 'up', n: 100 }, { k: 'say', icon: 'star', n: 60 }, { k: 'leave', dir: dir }];
    } }
  };

  var THEME = {
    ground: 'linear-gradient(180deg,rgba(8,9,11,0) 0%,#0c1430 55%,#111c3e 100%)',
    floor: ['#2a2f3a', '#5a6070'],
    pokeColors: ['#ffffff', SKY, '#ffd23f', '#ff8a2a'],
    look: { hat: ['helmet', 'cap', 'beanie', 'pointy'], hatColor: [['#ff8a2a', '#c25a12'], ['#3f6fd8', '#26489a'], ['#f4f7fb', '#c3cedc']], tunic: [['#f4f7fb', '#c3cedc'], ['#3f6fd8', '#26489a'], ['#ff8a2a', '#c25a12'], ['#6c6f7a', '#46484f']] },
    // стартовая площадка и антенна · a launch pad and a radar dish
    decor: function (a) {
      var W = a.W();
      a.pad = a.prop({ x: Math.round(W * 0.66), draw: function (ctx, p, fy) {
        ctx.fillStyle = '#3a4050'; ctx.fillRect(p.x - 22, fy - 3, 44, 3);
        ctx.fillStyle = '#5a6070'; for (var y = 0; y < 60; y += 8) { ctx.fillRect(p.x + 26, fy - y - 8, 2, 8); ctx.fillRect(p.x + 34, fy - y - 8, 2, 8); ctx.fillRect(p.x + 26, fy - y - 8, 10, 1); }
        ctx.fillStyle = '#e8402a'; ctx.fillRect(p.x + 29, fy - 64, 4, 2);
      } });
      a.prop({ x: Math.max(100, W * 0.14), beep: 0,
        step: function (p, dt) { p.beep = Math.max(0, p.beep - dt); },
        hit: function (p, x, ly) { return Math.abs(x - p.x) < 12 && ly > -22 && ly < 0; },
        click: function (p) { p.beep = 60; a.burst(p.x, -26, { n: 6, img: 'note', up: true, g: -0.01, min: 0.5, max: 1.2 }); },
        draw: function (ctx, p, fy, t) {
          var im = I.dish(a)[Math.floor(t / 3) % 2];
          ctx.drawImage(im, Math.round(p.x - im.width / 2), Math.round(fy - im.height));
          if (p.beep && Math.floor(t * 8) % 2) { ctx.fillStyle = '#5cc96b'; ctx.fillRect(Math.round(p.x - 1), Math.round(fy - im.height - 4), 3, 3); }
        } });
    },
    events: EVENTS
  };

  K.define({
    id: 'cosmonautics', global: 'ftCosmonautics', version: '1.0.0',
    button: { text: '✦', color: SKY, bg: 'rgba(12,20,48,.88)', border: 'rgba(122,184,255,.35)', title: 'День космонавтики: вкл / выкл · Human Space Flight Day on / off' },
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 10" shape-rendering="crispEdges"><path fill="#e8402a" d="M3 0h1v1h1v1H2V1h1zM0 6h2v3H0zM5 6h2v3H5z"/><path fill="#f4f7fb" d="M2 2h3v6H2z"/><path fill="#7ab8ff" d="M3 3h1v1H3z"/><path fill="#ffd23f" d="M2 8h3v1H2z"/><path fill="#ff8a2a" d="M3 9h1v1H3z"/></svg>',
    logos: ['rocket', 'orbit'],
    fx: fx,
    scene: THEME
  });
})();
