#!/usr/bin/env python3
"""
Праздничные логотипы >>FT_ · Holiday >>FT_ logos

RU  Рисует праздничные варианты знака для сайта (img/<праздник>-logo-<вариант>.svg) и, если указать
    папку брендинга, раскладывает их туда в трёх цветах (тёмный, светлый, сигнальный), с фоном и без,
    плюс горизонтальную версию с FOLLOTEAM и PNG 1200/2400 px (через qlmanage на macOS).
    Буквы знака берутся из img/winter-logo-santa.svg — тот же шрифт, текст в кривых.

EN  Draws festive variants of the mark for the site (img/<holiday>-logo-<variant>.svg) and, given a
    brand folder, lays them out there in three colour schemes (dark, light, signal), with and without
    a background, plus a horizontal version with FOLLOTEAM and 1200/2400 px PNGs (via qlmanage on macOS).
    The mark's letters come from img/winter-logo-santa.svg — same font, text in curves.

  python3 tools/make-logos.py                                   # только img/ · img/ only
  python3 tools/make-logos.py --brand "…/FolloTeam-logos"       # + папка брендинга · + the brand folder
"""
import math, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, 'img', 'winter-logo-santa.svg')).read()
ARROWS, FT, UNDER = re.findall(r'<g fill="[^"]+">.*?</g>', SRC)[:3]
VB = (-30, -270, 660, 340)  # как в kit.js · same as kit.js
ACCENT, INK = '#ff4f12', '#ecebe6'


def star(x, y, r, c):
    k = r * 0.28
    return f'<path class="st" d="M{x} {y-r} L{x+k} {y-k} L{x+r} {y} L{x+k} {y+k} L{x} {y+r} L{x-k} {y+k} L{x-r} {y} L{x-k} {y-k} Z" fill="{c}"/>'


def svg(body):
    x, y, w, h = VB
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" width="{w}" height="{h}">{body}</svg>\n'


def mark():
    return ARROWS + FT + UNDER


# ---------- рисунки · drawings ----------
def jester():
    return (mark() +
            '<path d="M356 -152 C352 -200 330 -232 296 -244 C326 -214 372 -196 404 -160 Z" fill="#9b5bd6"/>'
            '<path d="M460 -152 C466 -200 488 -234 524 -246 C494 -214 448 -196 410 -160 Z" fill="#ffd23f"/>'
            '<path d="M404 -160 C392 -200 404 -236 410 -250 C418 -236 428 -200 410 -160 Z" fill="#3f9d5a"/>'
            '<rect x="350" y="-164" width="116" height="18" rx="8" fill="#e8402a"/>'
            '<circle cx="296" cy="-244" r="11" fill="#ffd23f"/><circle cx="524" cy="-246" r="11" fill="#9b5bd6"/><circle cx="410" cy="-252" r="9" fill="#ffd23f"/>'
            '<circle cx="293" cy="-247" r="3" fill="#ffffff" opacity=".8"/><circle cx="521" cy="-249" r="3" fill="#ffffff" opacity=".8"/>')


def flip():
    return f'<g transform="rotate(180 286 -59)">{mark()}</g>' + star(600, -230, 14, '#ffd23f') + star(-4, 20, 10, '#ffd23f')


def rocket():
    smoke = ''.join(f'<circle cx="{520 + i * 12}" cy="{-10 - i * 20}" r="{6 + i * 2.2}" fill="#c3cedc" opacity="{0.25 + i * 0.1:.2f}"/>' for i in range(5))
    r = ('<g transform="translate(596 -168) rotate(35) scale(1.25)">'
         '<path d="M-8 18 Q0 58 8 18 Z" fill="#ffd23f"/><path d="M-4 18 Q0 40 4 18 Z" fill="#ff8a2a"/>'
         '<path d="M-12 4 L-26 28 L-12 18 Z M12 4 L26 28 L12 18 Z" fill="#e8402a"/>'
         '<path d="M0 -60 C14 -44 16 -10 12 18 L-12 18 C-16 -10 -14 -44 0 -60 Z" fill="#f4f7fb"/>'
         '<path d="M0 -60 C8 -52 10 -46 11 -42 L-11 -42 C-10 -46 -8 -52 0 -60 Z" fill="#e8402a"/>'
         '<circle cx="0" cy="-20" r="7" fill="#7ab8ff" stroke="#3f6fd8" stroke-width="3"/></g>')
    return mark() + smoke + r + star(470, -230, 12, '#ffd23f') + star(80, -190, 9, '#ffd23f') + star(250, -240, 7, '#ffffff')


def orbit():
    cx, cy, rx, ry = 286, -70, 320, 64
    back = f'<path d="M{cx-rx} {cy} A{rx} {ry} 0 0 1 {cx+rx} {cy}" fill="none" stroke="#7ab8ff" stroke-width="6" opacity=".55"/>'
    front = f'<path d="M{cx-rx} {cy} A{rx} {ry} 0 0 0 {cx+rx} {cy}" fill="none" stroke="#7ab8ff" stroke-width="6"/>'
    a = math.radians(55)
    px, py = cx + rx * math.cos(a), cy + ry * math.sin(a)
    planet = f'<circle cx="{px:.1f}" cy="{py:.1f}" r="15" fill="#ffd23f"/><circle cx="{px-5:.1f}" cy="{py-5:.1f}" r="4" fill="#ffffff" opacity=".7"/>'
    return (f'<g transform="rotate(-10 {cx} {cy})">{back}</g>' + mark() + f'<g transform="rotate(-10 {cx} {cy})">{front}{planet}</g>' +
            star(560, -210, 12, '#ffffff') + star(40, -210, 9, '#ffd23f'))


def leaf():
    return (mark() +
            '<path d="M556 6 C562 -40 552 -76 568 -116" fill="none" stroke="#2a8a3e" stroke-width="7" stroke-linecap="round"/>'
            '<path d="M562 -62 C526 -80 514 -112 524 -132 C556 -120 570 -94 562 -62 Z" fill="#5cc96b"/>'
            '<path d="M566 -98 C598 -112 622 -144 616 -166 C586 -160 568 -132 566 -98 Z" fill="#3f9d5a"/>'
            '<path d="M540 -106 C548 -96 556 -84 562 -70" fill="none" stroke="#2a8a3e" stroke-width="2"/>')


def globe():
    g = ('<circle cx="590" cy="-74" r="36" fill="#3f6fd8"/>'
         '<path d="M566 -96 C578 -104 590 -98 588 -86 C584 -76 572 -82 566 -72 C560 -80 560 -90 566 -96 Z" fill="#5cc96b"/>'
         '<path d="M596 -64 C608 -70 620 -62 618 -50 C610 -42 600 -50 594 -44 C590 -52 590 -60 596 -64 Z" fill="#5cc96b"/>'
         '<path d="M604 -102 C612 -100 618 -94 620 -86 C612 -88 606 -94 604 -102 Z" fill="#5cc96b"/>'
         '<circle cx="578" cy="-88" r="6" fill="#ffffff" opacity=".35"/>'
         '<path d="M590 -110 C584 -128 592 -140 606 -146 C608 -130 602 -116 590 -110 Z" fill="#3f9d5a"/>')
    return mark() + g


def crescent():
    # полумесяц: внешний круг минус смещённый · crescent: outer circle minus an offset one
    cx, cy, R, ox, oy, r = 296, -206, 46, 318, -222, 40
    d = math.hypot(ox - cx, oy - cy)
    a = (R * R - r * r + d * d) / (2 * d); h = math.sqrt(max(0, R * R - a * a))
    mx, my = cx + a * (ox - cx) / d, cy + a * (oy - cy) / d
    p1 = (mx + h * (oy - cy) / d, my - h * (ox - cx) / d); p2 = (mx - h * (oy - cy) / d, my + h * (ox - cx) / d)
    path = f'M{p1[0]:.1f} {p1[1]:.1f} A{R} {R} 0 1 0 {p2[0]:.1f} {p2[1]:.1f} A{r} {r} 0 0 1 {p1[0]:.1f} {p1[1]:.1f} Z'
    return (mark() + f'<path d="{path}" fill="#f6e7a8"/>' + star(180, -214, 12, '#fff6c4') + star(430, -236, 9, '#fff6c4') +
            star(530, -186, 13, '#fff6c4') + star(60, -176, 8, '#fff6c4') + star(600, -240, 7, '#fff6c4'))


def flag():
    return (mark() +
            '<rect x="556" y="-178" width="6" height="184" fill="#bfc5cc"/><circle cx="559" cy="-182" r="6" fill="#ffd23f"/>'
            '<path d="M562 -172 L626 -172 L626 -126 L562 -126 Z" fill="#ff4f12"/>'
            '<path d="M572 -162 L586 -149 L572 -136 M590 -162 L604 -149 L590 -136" fill="none" stroke="#ffffff" stroke-width="5"/>'
            '<ellipse cx="480" cy="30" rx="22" ry="5" fill="#8f969e" opacity=".5"/>' + star(130, -210, 10, '#ffffff') + star(420, -232, 8, '#ffffff'))


def code():
    g = '#3ddc84'
    left = 'M2 -150 Q-14 -150 -14 -130 L-14 -84 Q-14 -66 -24 -62 Q-14 -58 -14 -40 L-14 8 Q-14 30 2 30'
    right = 'M586 -150 Q602 -150 602 -130 L602 -84 Q602 -66 612 -62 Q602 -58 602 -40 L602 8 Q602 30 586 30'
    return mark() + f'<path d="{left}" fill="none" stroke="{g}" stroke-width="9" stroke-linejoin="round"/><path d="{right}" fill="none" stroke="{g}" stroke-width="9" stroke-linejoin="round"/>'


def bug():
    b = ('<g transform="translate(300 -164) rotate(-8)">'
         '<path d="M-14 -10 L-28 -20 M-14 0 L-30 0 M-14 10 L-28 20 M14 -10 L28 -20 M14 0 L30 0 M14 10 L28 20" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>'
         '<ellipse cx="0" cy="0" rx="18" ry="22" fill="#e8402a"/><path d="M0 -20 L0 22" stroke="#1a1a1a" stroke-width="3"/>'
         '<circle cx="-7" cy="-4" r="4" fill="#1a1a1a"/><circle cx="8" cy="8" r="4" fill="#1a1a1a"/>'
         '<circle cx="0" cy="-28" r="9" fill="#1a1a1a"/><path d="M-4 -34 Q-10 -46 -16 -48 M4 -34 Q10 -46 16 -48" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/></g>')
    bits = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="12" rx="2" fill="#3ddc84" opacity=".8"/>' for x, y, w in ((470, -210, 6), (486, -210, 14), (510, -230, 14), (440, -236, 6)))
    return mark() + b + bits


def pumpkin():
    hat = ('<ellipse cx="292" cy="-150" rx="64" ry="11" fill="#2a1a30"/>'
           '<path d="M254 -152 L298 -258 Q306 -272 314 -256 L334 -152 Z" fill="#2a1a30"/>'
           '<path d="M262 -170 L328 -170 L332 -156 L258 -156 Z" fill="#7a3ad1"/><rect x="286" y="-170" width="12" height="14" fill="#ffd23f"/>')
    pk = ('<ellipse cx="538" cy="-18" rx="18" ry="22" fill="#e07514"/><ellipse cx="576" cy="-18" rx="18" ry="22" fill="#e07514"/>'
          '<ellipse cx="557" cy="-18" rx="22" ry="24" fill="#ff8a1e"/><rect x="553" y="-48" width="7" height="10" rx="2" fill="#3f9d5a"/>'
          '<path d="M542 -26 L550 -26 L546 -34 Z M564 -26 L572 -26 L568 -34 Z" fill="#ffe14a"/>'
          '<path d="M540 -14 L574 -14 L568 -4 L562 -8 L557 -2 L552 -8 L546 -4 Z" fill="#ffe14a"/>')
    return mark() + hat + pk


def bats():
    def bat(x, y, s):
        return (f'<path transform="translate({x} {y}) scale({s})" d="M0 0 Q-10 -12 -26 -8 Q-18 -2 -22 6 Q-12 2 -6 8 Q-2 2 0 6 Q2 2 6 8 Q12 2 22 6 Q18 -2 26 -8 Q10 -12 0 0 Z M-3 -2 L-4 -8 L-1 -4 Z M3 -2 L4 -8 L1 -4 Z" fill="#7a3ad1"/>')
    spider = ('<path d="M448 -122 L448 -64" stroke="#bfc5cc" stroke-width="2"/>'
              '<path d="M440 -60 L428 -70 M440 -56 L426 -56 M440 -52 L428 -42 M456 -60 L468 -70 M456 -56 L470 -56 M456 -52 L468 -42" stroke="#7a3ad1" stroke-width="3" stroke-linecap="round"/>'
              '<circle cx="448" cy="-56" r="9" fill="#7a3ad1"/><circle cx="445" cy="-58" r="2" fill="#ff8a1e"/><circle cx="451" cy="-58" r="2" fill="#ff8a1e"/>')
    return mark() + bat(110, -200, 1.6) + bat(300, -232, 1.1) + bat(530, -196, 1.9) + spider


def cake():
    hat = ('<path d="M262 -150 L300 -252 L338 -150 Z" fill="#3f6fd8"/>'
           '<path d="M270 -172 L330 -172 L322 -192 L278 -192 Z M286 -214 L314 -214 L308 -230 L292 -230 Z" fill="#ffd23f"/>'
           '<circle cx="300" cy="-254" r="10" fill="#ff5fa2"/>')
    candle = ('<rect x="400" y="-198" width="14" height="52" fill="#f4f7fb"/>'
              '<path d="M400 -190 L414 -198 M400 -176 L414 -184 M400 -162 L414 -170 M400 -148 L414 -156" stroke="#e8402a" stroke-width="4"/>'
              '<path d="M407 -238 C416 -224 418 -212 407 -204 C396 -212 398 -224 407 -238 Z" fill="#ffd23f"/><path d="M407 -224 C411 -218 411 -212 407 -208 C403 -212 403 -218 407 -224 Z" fill="#ff8a2a"/>')
    conf = ''.join(f'<rect x="{x}" y="{y}" width="12" height="6" rx="2" transform="rotate({r} {x} {y})" fill="{c}"/>' for x, y, r, c in
                   ((120, -200, 20, '#ffd23f'), (190, -236, -30, '#3f9d5a'), (480, -230, 40, '#ff5fa2'), (560, -190, -15, '#3f6fd8'), (40, -170, 60, '#9b5bd6'), (600, -240, 10, '#2ad1c9')))
    return mark() + hat + candle + conf


def balloons():
    out = ''
    for (bx, by, c) in ((546, -168, '#e8402a'), (588, -206, '#ffd23f'), (604, -138, '#3f6fd8')):
        out += f'<path d="M566 6 Q{(566 + bx) / 2 - 10} {(by + 6) / 2} {bx} {by + 26}" fill="none" stroke="#bfc5cc" stroke-width="2"/>'
    for (bx, by, c) in ((546, -168, '#e8402a'), (588, -206, '#ffd23f'), (604, -138, '#3f6fd8')):
        out += (f'<ellipse cx="{bx}" cy="{by}" rx="20" ry="25" fill="{c}"/><path d="M{bx-4} {by+28} L{bx+4} {by+28} L{bx} {by+22} Z" fill="{c}"/>'
                f'<ellipse cx="{bx-7}" cy="{by-9}" rx="5" ry="7" fill="#ffffff" opacity=".45"/>')
    return mark() + out


LOGOS = {
    'aprilfools': {'jester': jester, 'flip': flip},
    'cosmonautics': {'rocket': rocket, 'orbit': orbit},
    'earth': {'leaf': leaf, 'globe': globe},
    'moon': {'crescent': crescent, 'flag': flag},
    'programmer': {'code': code, 'bug': bug},
    'halloween': {'pumpkin': pumpkin, 'bats': bats},
    'birthday': {'cake': cake, 'balloons': balloons},
}

# ---------- папка брендинга · brand folder ----------
SCHEMES = {'dark': ('#ff4f12', '#ecebe6', '#000000'), 'light': ('#d93c00', '#0c0d0e', '#e9e6df'), 'signal': ('#ffffff', '#0c0d0e', '#ff4f12')}
FOLDERS = {
    'valentine': ('04-день-влюблённых', 'День святого Валентина', {'hearts': 'сердечки поднимаются от «_», «_» — красный', 'arrow': 'стрела Купидона с сердцем пронзает знак'}),
    'lunar': ('05-китайский-новый-год', 'Китайский Новый год', {'lanterns': 'гирлянда красных фонариков над знаком', 'coins': '«>>» золотые, «_» — связка монет с кисточкой'}),
    'aprilfools': ('06-день-смеха', 'День смеха, 1 апреля', {'jester': 'колпак шута с бубенцами на «T»', 'flip': 'знак вверх ногами'}),
    'cosmonautics': ('07-день-космонавтики', 'День космонавтики, 12 апреля', {'rocket': 'ракета стартует с «_»', 'orbit': 'орбита вокруг знака с планетой'}),
    'earth': ('08-день-земли', 'День Земли, 22 апреля', {'leaf': 'росток с листьями вырастает из «_»', 'globe': 'глобус с ростком рядом с «_»'}),
    'moon': ('09-день-луны', 'День Луны, 20 июля', {'crescent': 'полумесяц и звёзды над знаком', 'flag': 'флаг с «>>» воткнут в «_»'}),
    'programmer': ('10-день-программиста', 'День программиста, 256-й день года', {'code': 'знак в фигурных скобках', 'bug': 'жучок-баг ползёт по «F», рядом биты'}),
    'halloween': ('11-хэллоуин', 'Хэллоуин, 31 октября', {'pumpkin': 'шляпа ведьмы на «F», тыква на «_»', 'bats': 'летучие мыши над знаком, паучок свисает с «T»'}),
    'birthday': ('12-день-рождения', 'День рождения FolloTeam', {'cake': 'праздничный колпак на «F», свеча на «T», конфетти', 'balloons': 'связка шариков привязана к «_»'}),
}


def recolor(s, scheme):
    acc, ink, _ = SCHEMES[scheme]
    s = re.sub(r'(<g fill=")#ff4f12(">)', r'\1' + acc + r'\2', s)
    s = s.replace('fill="#ecebe6"', f'fill="{ink}"')
    # отдельные детали цвета акцента (флаг): на оранжевом — тёмные · standalone accent details (the flag): dark on orange
    s = re.sub(r'(<path[^>]*?) fill="#ff4f12"', r'\1 fill="' + (ink if scheme == 'signal' else acc) + '"', s)
    if scheme == 'light':
        # светлые звёзды и луна на бумаге не видны — золотим · pale stars and moon vanish on paper — make them gold
        s = re.sub(r'(class="st"[^>]*?) fill="#(?:ffffff|fff6c4|ffd23f)"', r'\1 fill="#c99a12"', s)
        s = s.replace('fill="#f6e7a8"', 'fill="#e0b53a"')
    return s


def framed(body, vb, bg=None, pad=24):
    x, y, w, h = vb
    if bg:
        x, y, w, h = x - pad, y - pad, w + 2 * pad, h + 2 * pad
    rect = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" width="{round(w)}" height="{round(h)}">{rect}{body}</svg>\n', (x, y, w, h)


def horizontal(inner, scheme):
    # знак ×0.84 | черта | FOLLOTEAM (буквы из новогодней горизонтальной версии) · mark ×0.84 | rule | FOLLOTEAM
    acc, ink, _ = SCHEMES[scheme]
    h = WORDMARK.replace('#ecebe6', ink)
    return f'<g transform="scale(0.840)">{inner}</g><rect x="551.20" y="-161.32" width="2.00" height="200.00" fill="{ink}"/>{h}'


def square(svg_text, vb):
    # квадратный холст с рисунком по центру: qlmanage рисует в квадрат · square canvas, art centred: qlmanage renders into a square
    x, y, w, h = vb
    side = max(w, h)
    nx, ny = x - (side - w) / 2, y - (side - h) / 2
    s = re.sub(r'viewBox="[^"]+"', f'viewBox="{nx:.2f} {ny:.2f} {side:.2f} {side:.2f}"', svg_text, count=1)
    return re.sub(r'width="[^"]+" height="[^"]+"', f'width="{round(side)}" height="{round(side)}"', s, count=1)


def render(svg_text, vb, out_png, size):
    w, h = vb[2], vb[3]
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, 'a.svg')
        open(p, 'w').write(square(svg_text, vb))
        subprocess.run(['qlmanage', '-t', '-s', str(size), '-o', d, p], check=True, capture_output=True)
        cw, ch = (size, round(size * h / w)) if w >= h else (round(size * w / h), size)
        subprocess.run(['sips', '-c', str(ch), str(cw), os.path.join(d, 'a.svg.png'), '--out', out_png], check=True, capture_output=True)


def png(svg_path, out_base, vb):
    text = open(svg_path).read()
    for size in (1200, 2400):
        render(text, vb, f'{out_base}_{size}px.png', size)


def main():
    img = os.path.join(ROOT, 'img')
    for hid, variants in LOGOS.items():
        for name, fn in variants.items():
            open(os.path.join(img, f'{hid}-logo-{name}.svg'), 'w').write(svg(fn()))
    print('img/: ' + ', '.join(f'{h}-logo-{n}' for h in LOGOS for n in LOGOS[h]))
    if '--brand' not in sys.argv:
        return
    brand = sys.argv[sys.argv.index('--brand') + 1]
    global WORDMARK
    hz = open(os.path.join(brand, '02-новогодний', 'svg', '1-santa-horizontal_dark.svg')).read()
    i = hz.index('<rect x="551.20"')
    WORDMARK = re.search(r'<g fill="#ecebe6">.*?</g>', hz[i:]).group(0)  # только FOLLOTEAM, без подписи · FOLLOTEAM only, no caption
    HVB = (-45, -247, 1150, 326)  # знак ×0.84 (x −25…529) + FOLLOTEAM (до ~1085) · mark ×0.84 + FOLLOTEAM
    for hid, (folder, title, desc) in FOLDERS.items():
        base = os.path.join(brand, folder)
        os.makedirs(os.path.join(base, 'svg'), exist_ok=True); os.makedirs(os.path.join(base, 'png'), exist_ok=True)
        names = []
        for k, name in enumerate(desc):
            src = open(os.path.join(img, f'{hid}-logo-{name}.svg')).read()
            inner = re.search(r'<svg[^>]*>(.*)</svg>', src, re.S).group(1)
            for scheme in SCHEMES:
                body = recolor(inner, scheme)
                for bg in (None, SCHEMES[scheme][2]):
                    fname = f'{k + 1}-{name}_{scheme}{"_bg" if bg else ""}'
                    text, vb = framed(body, VB, bg)
                    p = os.path.join(base, 'svg', fname + '.svg'); open(p, 'w').write(text)
                    png(p, os.path.join(base, 'png', fname), vb)
                    hbody = horizontal(body, scheme)
                    hname = f'{k + 1}-{name}-horizontal_{scheme}{"_bg" if bg else ""}'
                    htext, hvb = framed(hbody, HVB, bg)
                    hp = os.path.join(base, 'svg', hname + '.svg'); open(hp, 'w').write(htext)
                    png(hp, os.path.join(base, 'png', hname), hvb)
            names.append(name)
        lines = [f'FolloTeam · знак >>FT_ — {title}', '', '00-preview.png — все варианты на одном листе.', '', 'Варианты:']
        lines += [f'  {k + 1}-{n:<10} — {desc[n]}' for k, n in enumerate(names)]
        lines += [f'  *-horizontal — то же с FOLLOTEAM', '', 'Цвета: _dark (на тёмном), _light (на светлом), _signal (на оранжевом).',
                  'svg/ — векторные файлы (текст в кривых), *_bg — с фоном, без _bg — прозрачные.', 'png/ — 1200 и 2400 px, прозрачные и с фоном.',
                  '', f'На сайте этот праздник рисует site-holidays (holidays/{hid}.js); те же рисунки — в img/{hid}-logo-*.svg.']
        open(os.path.join(base, 'README.txt'), 'w').write('\n'.join(lines) + '\n')
        # лист-превью · preview sheet
        cells, cw, chh = [], 700, 380
        for r, name in enumerate(names):
            for c, scheme in enumerate(SCHEMES):
                src = open(os.path.join(base, 'svg', f'{r + 1}-{name}_{scheme}_bg.svg')).read()
                vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', src).group(1).split()]
                inner = re.search(r'<svg[^>]*>(.*)</svg>', src, re.S).group(1)
                s = min((cw - 40) / vb[2], (chh - 40) / vb[3])
                cells.append(f'<g transform="translate({c * cw + 20 + (cw - 40 - vb[2] * s) / 2:.1f} {r * chh + 70 + (chh - 40 - vb[3] * s) / 2:.1f}) scale({s:.4f}) translate({-vb[0]} {-vb[1]})">{inner}</g>')
        W, H = cw * 3, chh * len(names) + 60
        sheet = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="#1a1b1e"/>{"".join(cells)}</svg>\n'
        render(sheet, (0, 0, W, H), os.path.join(base, '00-preview.png'), 2400)
        print(f'{folder}: {len(names)} варианта × 3 цвета × (с фоном, без) × (знак, горизонтальный) + PNG')


WORDMARK = ''
if __name__ == '__main__':
    main()
