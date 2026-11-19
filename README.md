# site-holidays

**Праздничные режимы для сайтов · Holiday modes for websites**

Сделано командой [FolloTeam](https://folloteam.ru) · Made by [FolloTeam](https://folloteam.ru)

[Русский](#русский) · [English](#english)

![Гномики пьют чай у самовара · Gnomes having tea by the samovar](docs/preview.jpg)

---

## Русский

Праздники, эффекты и пасхалки для сайтов: снег, гирлянды, новогодний логотип, сцена с ёлкой,
гномики, мини-игра. Здесь их разрабатывают, а сайты забирают готовые версии одной командой.

### Как это устроено

- Сайт подключает **один загрузчик** — `site-holidays.js`. Подключил один раз — и всё.
- Загрузчик смотрит на дату, адрес страницы и пасхалку и сам подгружает нужный праздник из `holidays/`.
  Вне праздников он почти ничего не весит и ничего не грузит.
- Праздники не знают вёрстку сайта: сами находят кнопки, карточки и картинки и подстраиваются под любую страницу.
  Новые страницы и переделанный дизайн не требуют доработок.
- Без зависимостей и сборки: обычные JS-файлы и картинки.

### Праздники

| id | Когда | Модуль |
|---|---|---|
| `lunar` | за 2 дня до китайского Нового года и 7 дней после (даты 2026–2036) | [`lunar.js`](holidays/lunar.js) — фонарики под шапкой, монетки и конверты; гномики: танец дракона, змей-дракон, дракон гонится за толпой, хлопушки, красные конверты, танец льва, небесные фонарики |
| `valentine` | 10–15 февраля | [`valentine.js`](holidays/valentine.js) — сердечки и шлейф за курсором; гномики: свидание на скамейке, букет, валентинка, кольцо, подарок с мишкой, Купидон, серенада |
| `aprilfools` | 1 апреля | [`aprilfools.js`](holidays/aprilfools.js) — уточки и конфетти; гномики разыгрывают друг друга: банановая кожура, торт в лицо, подушка-пердушка, рыбка на спине, жонглёр, подарок-обманка |
| `cosmonautics` | 10–13 апреля | [`cosmonautics.js`](holidays/cosmonautics.js) — звёзды, метеоры, спутник, ракета по клику; гномики: сборка и запуск ракеты, открытый космос, комета, НЛО, реактивный ранец |
| `earth` | 20–23 апреля | [`earth.js`](holidays/earth.js) — листья, бабочки за курсором; гномики: сажают дерево (растёт и остаётся), уборка, кролики, бабочка, полив цветов, велосипед |
| `moon` | 18–21 июля | [`moon.js`](holidays/moon.js) — Земля в небе, лунная пыль; лунный грунт и гномики в скафандрах: посадка и флаг, прыжки, луноход, гольф, фото Земли |
| `programmer` | 256-й день года ±1 (12–14 сентября) | [`programmer.js`](holidays/programmer.js) — колонки битов, баги на экране (клик исправляет); гномики: охота на баг, кофе, релиз в пятницу, резиновая уточка, робот |
| `halloween` | 25–31 октября | [`halloween.js`](holidays/halloween.js) — летучие мыши и привидения; гномики в костюмах: сладость или гадость, засада, ведьма на метле, резьба по тыкве, парад привидений, стая мышей |
| `birthday` | день рождения FolloTeam ±1 день — дата пока не задана (`SITE_HOLIDAYS.birthday.date = 'ММ-ДД'` или `BIRTHDAY` в загрузчике) | [`birthday.js`](holidays/birthday.js) — конфетти и шары; торт со свечами, гномики: задувают свечи, подарки, шарики, паровозик, пиньята, хлопушка |
| `winter` | 1 декабря – конец февраля | [`holidays/winter.js`](holidays/winter.js) — зима и Новый год |

Когда даты совпадают, побеждает праздник выше в таблице: в День влюблённых и в китайский Новый год вместо зимы показывается он.

Все праздники, кроме зимы, работают на общем [`holidays/kit.js`](holidays/kit.js): кнопка вкл/выкл, иконка вкладки, праздничный логотип поверх «>>FT_», слой эффектов и сцена внизу страницы. На сцене — **гномики, наш народ**: те же, что зимой, только одеты под праздник (колпак ведьмы, шлем космонавта, наушники, праздничный колпак, костюм привидения, робота…). Они смотрят на курсор, от клика подпрыгивают, от трёх быстрых кликов падают. Загрузчик подгружает `kit.js` сам.

У каждого праздника два варианта логотипа (`img/<id>-logo-*.svg`, случайный при включении). Их рисует [`tools/make-logos.py`](tools/make-logos.py); с `--brand <папка>` он же раскладывает их в папку брендинга FolloTeam в трёх цветах, с фоном и без, горизонтальной версией и PNG.

### Быстрый старт

```sh
git clone https://github.com/FolloGit/site-holidays.git
./site-holidays/install.sh путь/к/сайту/assets      # → assets/holidays/…
```

На каждой странице перед `</body>`:

```html
<script src="assets/holidays/site-holidays.js?v=1.3.0" defer></script>
```

Готово: с 1 декабря на сайте пойдёт снег. Проверить сейчас — открыть страницу с `?holiday=winter`.

### Обновление сайта

Положите в сайт скрипт [`tools/update-holidays.sh`](https://github.com/FolloTeam/site/blob/Prod/tools/update-holidays.sh)
(из репозитория сайта FolloTeam) и запускайте:

```sh
sh tools/update-holidays.sh            # последняя версия
sh tools/update-holidays.sh v1.3.0     # конкретная версия
```

Скрипт держит копию этого репозитория рядом с сайтом (`../site-holidays`), ставит файлы в `assets/holidays/`
и меняет `?v=` в подключении на всех страницах. Останется проверить и закоммитить сайт.

### Включение и выключение

| Как | Что делает |
|---|---|
| по дате | праздник включается сам в свой сезон (по часам посетителя) |
| `?holiday=winter` | включить для проверки |
| `?holiday=off` | выключить всё |
| `?winter=1` / `?winter=0` | то же для зимы (старый вариант) |
| `data-holiday-egg` | невидимая кнопка-пасхалка: каждое нажатие — следующий праздник по кругу (зима → китайский Новый год → День влюблённых → … → выкл). Рядом на секунду появляется подпись. Выбор действует на всех страницах до смены сезона, потом снова решает календарь |
| кнопка-снежинка внизу слева | посетитель может выключить зиму; выбор запоминается |

### Настройки сайта

Необязательно, перед подключением загрузчика:

```html
<script>
  window.SITE_HOLIDAYS = {
    off: ['winter'],              // праздники, которые этому сайту не нужны
    winter: { favicon: false }    // настройки модуля зимы
  };
</script>
```

### Зима и Новый год

- **Снег** — погода меняется сама: тихий снег, снегопад, метель вбок. Хлопья двигаются вместе со страницей при прокрутке.
- **Сугробы** на кнопках, карточках и картинках с учётом скруглённых углов. Курсором снег можно смахнуть.
- **Гирлянда** под шапкой сайта, качается от курсора.
- **Новогодний логотип** — текстовый «>>FT_» в шапке становится знаком с шапкой Санты, оленями или гирляндой.
- **Сцена внизу страницы** — ёлка, календарь, подарки, снеговики семи видов и гномики, все разные.
- **Мини-игра** — подарки и снеговиков можно таскать и кидать. Подарок ломает снеговика, гномики приходят чинить.
  Двойной клик по подарку разбивает его, и выпадают предметы разной редкости — гномики их подбирают.
- **События** запускаются сами:

| Событие | Что происходит |
|---|---|
| `build` | двое гномиков катают комья и лепят снеговика |
| `repair` | чинят сломанного снеговика и возвращают шапку |
| `snowballs` | игра в снежки |
| `sled` | насыпают горку и катаются на санках |
| `prank` | шалость: передвинуть или пнуть снеговика |
| `gifts` | обмен подарками |
| `tea` | чаепитие с самоваром и баранками — выносят стол, пируют, играют и всё уносят |
| `loot` | подбирают добычу из разбитых подарков |
| `calendar` | в полночь гномик отрывает листок календаря |
| `party` | новогодние гуляния и салют в ночь на 1 января |
| `santa` | Санта на санях пролетает над страницей и роняет подарок |
| `fireworks` | салют |

Разметка, которую понимает модуль:

| Атрибут | Зачем |
|---|---|
| `data-winter-ignore` | на этом элементе снег не копится |
| `data-winter-logo="#ff4f12"` | текстовый знак «>>FT_», который зимой становится новогодним; оранжевый в знаке перекрашивается в указанный цвет |

Консоль (удобно на презентациях):

```js
ftWinter.event('tea')        // запустить событие (список — ftWinter.events())
ftWinter.event('midnight')   // гномик прибежит и перевернёт календарь
ftWinter.openGift()          // разбить подарок
ftWinter.logo('reindeer')    // santa | reindeer | garland
ftWinter.weather('blizzard') // calm | snow | blizzard
```

### Демо

[`demo/index.html`](demo/index.html) — страница с кнопками всех событий. Любой статический сервер из корня репозитория:

```sh
python3 -m http.server 8092      # → http://localhost:8092/demo/?holiday=winter
```

### Как добавить праздник

1. Модуль `holidays/<id>.js` на общем наборе: `siteHolidayKit.define({ id, global, button, favicon, logos, fx, scene })` — за образец любой из `valentine.js`, `halloween.js`, `earth.js`. Эффекты — в `fx`, гномики и сценки — в `scene.events`.
2. Строчка в `HOLIDAYS` в `site-holidays.js`: `{ id, file, kit: true, api, title, icon, color, order, when }`.
3. Логотипы — функция в `tools/make-logos.py` (+ папка в `FOLDERS`), затем `python3 tools/make-logos.py`. Демо подхватит праздник само.

### Выпуск версии

1. Поднять `VERSION` в `site-holidays.js` (и версию модуля в его шапке).
2. Проверить на демо.
3. Записать изменения в «Версии», закоммитить, поставить тег и запушить:
   `git tag -a vX.Y.Z -m "site-holidays X.Y.Z" && git push --follow-tags`
4. На сайтах — `sh tools/update-holidays.sh`.

---

## English

Holidays, effects and easter eggs for websites: snow, garlands, a New Year logo, a scene with a tree, gnomes
and a mini-game. They are developed here, and sites pull ready-made versions with one command.

### How it works

- A site includes **one loader**, `site-holidays.js`, and never has to touch it again.
- The loader checks the date, the page URL and the easter egg, then loads the right holiday from `holidays/`.
  Outside holidays it weighs almost nothing and loads nothing.
- Holidays don't know the site's markup. They find buttons, cards and images on their own and adapt to any page,
  so new pages and redesigns need no extra work.
- No dependencies and no build step: plain JS files and images.

### Holidays

| id | When | Module |
|---|---|---|
| `lunar` | 2 days before Lunar New Year to 7 days after (dates for 2026–2036) | [`lunar.js`](holidays/lunar.js) — lanterns under the header, coins and envelopes; gnomes: dragon dance, a dragon kite, a dragon chasing a crowd, firecrackers, red envelopes, lion dance, sky lanterns |
| `valentine` | February 10–15 | [`valentine.js`](holidays/valentine.js) — hearts and a cursor trail; gnomes: a date on a bench, flowers, a card, a ring, a gift with a teddy, Cupid, a serenade |
| `aprilfools` | April 1 | [`aprilfools.js`](holidays/aprilfools.js) — ducks and confetti; gnomes prank each other: a banana peel, a pie, a whoopee cushion, a paper fish, a juggler, a fake gift |
| `cosmonautics` | April 10–13 | [`cosmonautics.js`](holidays/cosmonautics.js) — stars, meteors, a satellite, a rocket on click; gnomes: build and launch a rocket, a spacewalk, a comet, a UFO, a jetpack |
| `earth` | April 20–23 | [`earth.js`](holidays/earth.js) — leaves, butterflies following the cursor; gnomes: plant a tree (it stays), litter pickup, bunnies, a butterfly, watering, a bicycle |
| `moon` | July 18–21 | [`moon.js`](holidays/moon.js) — Earth in the sky, moon dust; lunar soil and gnomes in spacesuits: a landing and a flag, hops, a rover, golf, an Earth photo |
| `programmer` | day 256 ±1 (Sep 12–14) | [`programmer.js`](holidays/programmer.js) — columns of bits, bugs on screen (click fixes them); gnomes: a bug hunt, coffee, a Friday deploy, a rubber duck, a robot |
| `halloween` | October 25–31 | [`halloween.js`](holidays/halloween.js) — bats and ghosts; gnomes in costumes: trick-or-treat, an ambush, a witch on a broom, pumpkin carving, a ghost parade, a bat swarm |
| `birthday` | FolloTeam's birthday ±1 day — no date yet (`SITE_HOLIDAYS.birthday.date = 'MM-DD'` or `BIRTHDAY` in the loader) | [`birthday.js`](holidays/birthday.js) — confetti and balloons; a cake with candles, gnomes: blow out candles, gifts, balloons, a conga line, a piñata, a party popper |
| `winter` | December 1 – end of February | [`holidays/winter.js`](holidays/winter.js) — winter and New Year |

When dates overlap, the holiday higher in the table wins: on Valentine's Day and Lunar New Year it replaces winter.

Every holiday except winter runs on the shared [`holidays/kit.js`](holidays/kit.js): the on/off button, the tab icon, the festive logo over ">>FT_", an effects layer and the bottom scene. The scene has **gnomes, our folk**: the same as in winter, only dressed for the occasion (a witch hat, a space helmet, headphones, a party hat, a ghost or robot costume…). They turn to the cursor, hop on click and fall over after three quick clicks. The loader loads `kit.js` on its own.

Each holiday has two logo variants (`img/<id>-logo-*.svg`, a random one on start). [`tools/make-logos.py`](tools/make-logos.py) draws them; with `--brand <folder>` it also lays them out in the FolloTeam brand folder in three colour schemes, with and without a background, a horizontal version and PNGs.

### Quick start

```sh
git clone https://github.com/FolloGit/site-holidays.git
./site-holidays/install.sh path/to/site/assets      # → assets/holidays/…
```

On every page, before `</body>`:

```html
<script src="assets/holidays/site-holidays.js?v=1.3.0" defer></script>
```

That's it: from December 1 it snows on the site. To check it now, open a page with `?holiday=winter`.

### Updating a site

Add [`tools/update-holidays.sh`](https://github.com/FolloTeam/site/blob/Prod/tools/update-holidays.sh)
(from the FolloTeam site repository) to the site and run:

```sh
sh tools/update-holidays.sh            # latest version
sh tools/update-holidays.sh v1.3.0     # a specific version
```

The script keeps a copy of this repository next to the site (`../site-holidays`), installs the files into
`assets/holidays/` and bumps `?v=` in the include on every page. Then check and commit the site.

### Turning holidays on and off

| How | What it does |
|---|---|
| by date | a holiday turns on by itself in its season (visitor's local time) |
| `?holiday=winter` | force it on for testing |
| `?holiday=off` | turn everything off |
| `?winter=1` / `?winter=0` | same for winter (legacy) |
| `data-holiday-egg` | hidden easter-egg button: each press switches to the next holiday in the cycle (winter → Lunar New Year → Valentine's → … → off), with a short label next to it. The choice applies on every page until the season changes, then the calendar decides again |
| snowflake button, bottom left | lets visitors turn winter off; the choice is remembered |

### Site options

Optional, before the loader script:

```html
<script>
  window.SITE_HOLIDAYS = {
    off: ['winter'],              // holidays this site does not want
    winter: { favicon: false }    // winter module options
  };
</script>
```

### Winter and New Year

- **Snow.** The weather changes by itself: light snow, snowfall, a sideways blizzard. Flakes move with the page when you scroll.
- **Snow piles** on buttons, cards and images, following rounded corners. You can sweep snow off with the cursor.
- **Garland** under the site header that sways when the cursor passes.
- **New Year logo.** The text mark ">>FT_" in the header turns into a version with a Santa hat, reindeer or a garland.
- **Scene at the bottom of the page:** a tree, a calendar, gifts, seven kinds of snowmen and gnomes that all look different.
- **Mini-game.** Drag and throw gifts and snowmen. A gift breaks a snowman, and gnomes come to fix it.
  Double-click a gift to break it open: items of different rarity fall out, and gnomes pick them up.
- **Events** start on their own:

| Event | What happens |
|---|---|
| `build` | two gnomes roll snowballs and build a snowman |
| `repair` | they fix a broken snowman and put its hat back |
| `snowballs` | a snowball fight |
| `sled` | they build a hill and sled down it |
| `prank` | a prank: move or kick a snowman |
| `gifts` | a gift exchange |
| `tea` | tea with a samovar and bagels: they bring a table, feast, play and carry everything away |
| `loot` | they pick up loot from broken gifts |
| `calendar` | at midnight a gnome tears a page off the calendar |
| `party` | New Year's Eve party with fireworks |
| `santa` | Santa's sleigh flies over the page and drops a gift |
| `fireworks` | fireworks |

Markup the module understands:

| Attribute | Purpose |
|---|---|
| `data-winter-ignore` | snow never piles up on this element |
| `data-winter-logo="#ff4f12"` | the ">>FT_" text mark that becomes festive in winter; orange in the mark is recoloured to the given colour |

Console (handy for demos):

```js
ftWinter.event('tea')        // run an event (list: ftWinter.events())
ftWinter.event('midnight')   // a gnome runs over and flips the calendar
ftWinter.openGift()          // break a gift open
ftWinter.logo('reindeer')    // santa | reindeer | garland
ftWinter.weather('blizzard') // calm | snow | blizzard
```

### Demo

[`demo/index.html`](demo/index.html) has buttons for every event. Serve the repository root with any static server:

```sh
python3 -m http.server 8092      # → http://localhost:8092/demo/?holiday=winter
```

### Adding a holiday

1. Write `holidays/<id>.js` on the shared kit: `siteHolidayKit.define({ id, global, button, favicon, logos, fx, scene })` — use `valentine.js`, `halloween.js` or `earth.js` as a template. Effects go in `fx`, gnomes and plays in `scene.events`.
2. Add an entry to `HOLIDAYS` in `site-holidays.js`: `{ id, file, kit: true, api, title, icon, color, order, when }`.
3. Logos: a function in `tools/make-logos.py` (+ a folder in `FOLDERS`), then `python3 tools/make-logos.py`. The demo picks the holiday up by itself.

### Releasing a version

1. Bump `VERSION` in `site-holidays.js` (and the module version in its header).
2. Check it on the demo page.
3. Note the changes under "Versions", commit, tag and push:
   `git tag -a vX.Y.Z -m "site-holidays X.Y.Z" && git push --follow-tags`
4. On each site, run `sh tools/update-holidays.sh`.

---

## Структура · Layout

```
site-holidays.js    загрузчик — единственное, что подключают сайты · the loader, the only file sites include
holidays/           модули праздников и общий kit.js · holiday modules and the shared kit.js
img/                картинки праздников · holiday images
demo/index.html     демо-страница · demo page
docs/               картинки для README · README images
install.sh          установка на сайт · install into a site
tools/make-logos.py праздничные логотипы для сайта и папки брендинга · holiday logos for the site and the brand folder
```

## Версии · Versions

- **1.3.0**
  - Шесть новых праздников: День смеха, День космонавтики, День Земли, День Луны, День программиста, Хэллоуин и день рождения FolloTeam (ждёт дату). У каждого — эффекты, сценки с гномиками и два логотипа.
  - Общий `holidays/kit.js` вместо `scene.js` и `logo.js`; на сцене всех праздников — гномики, как зимой, в праздничной одежде.
  - День влюблённых 2.0: скамейка, кольцо, подарок с мишкой, валентинка, Купидон влюбляет гномика. Китайский Новый год 2.0: змей-дракон и дракон, который гонится за толпой гномиков.
  - `tools/make-logos.py`: логотипы для сайта и папки брендинга (три цвета, с фоном и без, горизонтальная версия, PNG).
  - Six new holidays: April Fools', Human Space Flight Day, Earth Day, Moon Day, Programmer's Day, Halloween and FolloTeam's birthday (waiting for a date). Each has effects, gnome plays and two logos.
  - A shared `holidays/kit.js` replaces `scene.js` and `logo.js`; every holiday's scene has gnomes like in winter, dressed for the occasion.
  - Valentine's 2.0: a bench, a ring, a gift with a teddy, a card, Cupid makes a gnome fall in love. Lunar New Year 2.0: a dragon kite and a dragon chasing a crowd of gnomes.
  - `tools/make-logos.py`: logos for the site and the brand folder (three schemes, with and without a background, horizontal, PNG).
- **1.2.0**
  - Пасхалка перебирает все праздники по кругу и выключает их; новый праздник из списка `HOLIDAYS` попадает в круг сам (поля `api`, `title`, `icon`, `color`, `order`). Переключение без перезагрузки, на пасхалке — значок текущего праздника, видна только его кнопка вкл/выкл. Выбор (`localStorage.siteHoliday`) держится до смены сезона. Консоль: `siteHolidays.set('lunar' | 'off')`, `next()`, `auto()`.
  - The easter egg cycles through all holidays and turns them off; a new holiday in `HOLIDAYS` joins the cycle on its own (`api`, `title`, `icon`, `color`, `order` fields). Switching needs no reload, the egg shows the current holiday's icon and only its on/off button is visible. The choice (`localStorage.siteHoliday`) holds until the season changes. Console: `siteHolidays.set('lunar' | 'off')`, `next()`, `auto()`.
- **1.1.1**
  - Кнопки ♥ и 福 помечены так же, как кнопка-снежинка (`data-winter-ignore`, плюс `data-holiday-btn`), — сайты, которые уже переставляют снежинку, переставят и их. Пока праздник включён, на `<html>` стоят классы `ft-holiday-on` и `ft-valentine-on` / `ft-lunar-on`.
  - The ♥ and 福 buttons carry the same marker as the snowflake button (`data-winter-ignore`, plus `data-holiday-btn`), so sites that already reposition the snowflake reposition them too. While a holiday is on, `<html>` gets `ft-holiday-on` and `ft-valentine-on` / `ft-lunar-on`.
- **1.1.0**
  - Новые праздники: День влюблённых (`valentine.js`) и китайский Новый год (`lunar.js`) — эффекты, праздничный логотип `>>FT_`, сцена с человечками и сценками внизу страницы.
  - Общие файлы: `scene.js` (сцена внизу страницы) и `logo.js` (праздничный логотип).
  - Зима `winter.js` 2.1.0: Санта, искры и салют прокручиваются вместе со страницей; гномики реагируют на курсор — поворачиваются, подпрыгивают от клика, падают от трёх быстрых кликов.
  - New holidays: Valentine's Day (`valentine.js`) and Lunar New Year (`lunar.js`) — effects, a festive `>>FT_` logo, a bottom scene with people and little plays.
  - Shared files: `scene.js` (bottom scene) and `logo.js` (holiday logo).
  - Winter `winter.js` 2.1.0: Santa, sparks and fireworks scroll with the page; gnomes react to the cursor — they turn, hop on click and fall over after three quick clicks.
- **1.0.0**
  - Пакет site-holidays: загрузчик и модуль зимы `winter.js` 2.0.0. Снег двигается вместе со страницей; события гномиков; Санта, салют, добыча из подарков; виды снеговиков и гномиков.
  - The site-holidays package: a loader and the `winter.js` 2.0.0 module. Snow moves with the page; gnome events; Santa, fireworks, loot from gifts; snowman and gnome variety.
- **ft-winter 1.x–2.0.0**
  - Зимний режим до пакета: снег, сугробы, гирлянда, сцена с ёлкой, гномики, мини-игра, новогодний логотип, пасхалка.
  - Winter mode before the package: snow, piles, garland, tree scene, gnomes, mini-game, New Year logo, easter egg.

---

© FolloTeam · [folloteam.ru](https://folloteam.ru)
