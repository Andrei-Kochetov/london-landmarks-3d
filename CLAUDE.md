# London Landmarks 3D — правила проекта

Школьный проект «London and Its Sights» (7 «В», Саратов, 2026; авторы — О. В. Кочетова, А. А. Ильюшина, В. Н. Гордеева).
Состав: английский перевод (docx), презентация (pptx, 14 слайдов), одностраничный сайт с 3D-моделями 8 достопримечательностей.

- Сайт: https://london-landmarks-7v.netlify.app/
- Репозиторий: https://github.com/Andrei-Kochetov/london-landmarks-3d (публичный, ветка `main`), локально `~/Coding/london-landmarks-3d`
- Отвечать пользователю по-русски. Тексты на сайте/в презентации — английский уровня 7 класса.

## Пожелания пользователя (соблюдать)

- **Деплоить только когда пользователь скажет.** «пока не кати», «не деплой», «локально гляну» — значит показать локально (встроенный браузер) и ждать ОК.
- Авторы — только инициалы (О. В. Кочетова и т. д.). Полные имена не придумывать.
- Класс писать понятно: «Class 7V», а не «form 7 V».
- На сайте **не показывать** авторов моделей / Sketchfab / ссылки на источники моделей. В презентации авторы фото — в конце заметок докладчика, не на слайдах.
- Перевод (docx) — **точно** по русскому тексту, без добавлений и исправлений. Презентацию не трогать без просьбы.
- Варианты моделей — сначала показать пользователю (картинки/ссылки), заменять после выбора.
- Никаких следов ИИ в коммитах, README, на сайте (см. глобальный CLAUDE.md).

## Структура

```
site/                  то, что деплоится (корень сайта)
  index.html           весь сайт: CSS + разметка + JS в одном файле
  _headers             кэш Netlify (модели и картинки — надолго, html — без кэша)
  models/<id>.glb      модели (Draco + WebP-текстуры)
  models/posters/<id>.webp  картинки-превью, показываются до загрузки модели
QR_codes/              qr_site.png + qr_<id>.png (для презентации)
tools/                 скрипты обработки (см. ниже); зависимости: cd tools && npm i
build/                 (в .gitignore) временные результаты
```

`<id>` по порядку на странице: `palace, tower, bigben, eye, opera, square, abbey, gallery`. Якоря `#<id>` прокручивают к разделу (на них ведут QR-коды).

## Как устроен index.html

- Хедер: 8 табов (номер над названием), на десктопе в ряд, ≤1080px и на телефоне — 4+4 с короткими подписями.
- Hero: eyebrow «School project · Class 7V · Saratov, 2026», строка «Made by Class 7V:» с чипами авторов. Футер — те же авторы.
- Массив `SIGHTS` (тексты карточек) и объект `MODELS` (настройки моделей): `file`, `orbit` (camera-orbit), опционально `target`, `fov`, `exposure`.
- `const MODEL_VERSION = "13"` — **увеличить при любой замене .glb или постера**, иначе браузеры покажут старый файл из кэша (добавляется как `?v=`).
- model-viewer 3.5.0 с jsDelivr; Draco-декодер он сам грузит с gstatic.
- Подпись «Loading…» скрыта, показывается только при ошибке. После `load` окна модели фоном докачиваются по очереди (кроме режима экономии трафика).
- Кнопка Reset возвращает camera-orbit/target/fov из атрибутов.
- Режим `?shot=<id>` — одна модель на сцене 1200×800 без постера и автоповорота, `document.title` = `ready` после загрузки. Нужен для картинок-превью.

## Модели: источники и лицензии

| id | модель | источник | лицензия |
|---|---|---|---|
| palace | Palace of Westminster, PeeJaa | Sketchfab `01688ca7321647fd9041b7db5c0e73d9` | Free Standard |
| tower | Tower of London, PeeJaa | Sketchfab `6ff05a730cfe429ea25da2d2b6e9905c` | Free Standard |
| bigben | Big Ben, ManySince910 | Sketchfab `9a1c691fac774bcca4e2ba565c4c9d9b` | CC BY |
| eye | London Eye (скан), mohamedhussien | Sketchfab `74eaf18882314264b474861d564fca36` | CC BY |
| opera | Royal Opera House, 3D Warehouse Staff | 3D Warehouse `d6829f52da74309df6dcf3ea0dd7462c` | 3D Warehouse General |
| square | Nelson's Column, hardingdave | Sketchfab `6f42acbc26c3451aba570db6621fa19c` | CC BY |
| abbey | Westminster Abbey, samixalam | Sketchfab `a974d17853db4747831d9c8c5b1db01f` | CC BY |
| gallery | The National Gallery, Si | 3D Warehouse `340e46987ff58127a1136d3b8e3e0cf` | 3D Warehouse General |

Обработка, уже сделанная: eye — вырезан по x[-5, 3.3] z[-4.15, 2.6] (колесо + County Hall, башни сзади убраны); opera — убрана подложка-земля и мусор; abbey, gallery — убраны отлетевшие куски; palace, square, abbey — текстуры 2048.

### Скачать модель

- **Sketchfab** (нужен вход пользователя — он входит сам во встроенном браузере): в залогиненной вкладке
  `fetch('/i/models/<uid>/download')` → в ответе `gltf`/`glb` с подписанной ссылкой на S3 (варианты по `textureMaxResolution`) → скачать `curl`'ом. Ссылки живут минуты. При 429 — запросы реже.
- **3D Warehouse** (без входа): `curl "https://3dwarehouse.sketchup.com/warehouse/v1.0/entities/<id>?recordEvent=false"` → `binaries.glb.contentUrl`. Поиск: `.../entities?q=<запрос>&contentType=3dw&count=20&recordEvent=false`, glb есть, если в `binaryNames` есть `glb`.
- Каждый скачанный файл — в отдельную пустую папку в scratchpad.

### Обработать

```bash
cd tools && npm i            # если ~/.npm с ошибкой EACCES: npm i --cache ./.npm-cache
npx gltf-transform inspect in.glb
# стандартно: Draco + WebP, текстуры до 2048 (или 1024 для лёгкой версии)
npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp --texture-size 2048 --simplify false
```
**Только Draco, не meshopt** — с meshopt model-viewer падает (`setMeshoptDecoder`).

Обрезка (скрипты пишут несжатый glb, сжимать после):
```bash
node crop_box.mjs in.glb cut.glb <xMin> <xMax> <zMin> <zMax>   # оставить область
node trim_strays.mjs in.glb cut.glb [3] [97] [0.15]           # убрать отлетевшие куски
node drop_ground.mjs in.glb cut.glb [5000]                    # убрать плоскую землю
npx gltf-transform webp cut.glb t.glb && npx gltf-transform draco t.glb out.glb
```
После обрезки **не** использовать `optimize` — он склеивает меши и рамка модели снова раздувается; делать `webp` и `draco` отдельно.
Координаты для обрезки: открыть модель во встроенном браузере и в консоли `document.querySelector('model-viewer').positionAndNormalFromPoint(x, y)`.

Затем: положить в `site/models/<id>.glb`, подобрать `orbit`/`target`/`fov` в `MODELS`, перерисовать постер, увеличить `MODEL_VERSION`.

### Картинки-превью (постеры)

Headless Chrome модели не рендерит — делать во встроенном браузере:
```bash
python3 tools/serve_upload.py site build/posters_raw     # http://localhost:8772
```
Открыть `http://localhost:8772/?shot=<id>`, дождаться `document.title === "ready"`, в консоли:
```js
const b = await document.querySelector('model-viewer').toBlob({ mimeType: 'image/webp', qualityArgument: 0.85 });
await fetch('/upload?name=<id>', { method: 'POST', body: b });
```
Результат — `build/posters_raw/<id>.webp` → скопировать в `site/models/posters/`.

## Проверка

- Локально: `python3 -m http.server 8770 -d site` и открыть во встроенном браузере (телефон — `resize_window` preset mobile).
- Автопроверка (загрузились ли модели, ошибки JS): `node tools/check_page.mjs https://london-landmarks-7v.netlify.app/`

## Деплой (Netlify)

Сайт `london-landmarks-7v`, site id `ea515981-a51c-4678-ac65-a7dc56e72d6a`, команда `andrei-kochetov` (бесплатный план; деплои не протухают по времени).
Токен CLI уже лежит в `~/Library/Preferences/netlify/config.json`.
```bash
cd ~/Coding/london-landmarks-3d
NETLIFY_TELEMETRY_DISABLED=1 npx -y netlify-cli@17.38.1 deploy --prod --dir site --site ea515981-a51c-4678-ac65-a7dc56e72d6a --message "<что изменилось>" < /dev/null
```
- Если npx ругается на права `~/.npm`: добавить `npm_config_cache=<scratchpad>/npm-cache` перед командой.
- Если токен протух: `npx netlify-cli login` — пользователь сам жмёт Authorize в браузере.
- Без CLI: app.netlify.com/projects/london-landmarks-7v → Deploys → перетащить папку `site`.
- После деплоя проверить живой сайт (check_page.mjs или браузер) и закоммитить/запушить те же изменения.

## Git / GitHub

- `gh` залогинен как `Andrei-Kochetov`. Работать в `main` (проект личный, без MR).
- Коммиты — короткие, по-английски, **без** `Co-Authored-By` и прочих упоминаний ИИ.
- Модели лежат прямо в git (каждая < 5 МБ), LFS не нужен.

## Прочее

- **QR-коды**: `cd tools && node make_qr.js ../QR_codes` (сайт + `#<id>`, тёмно-синие, 720 px). Адрес сайта менять нельзя — QR в презентации уже напечатаны на него.
- **Сайт одним файлом** (открывается с диска двойным щелчком, интернет нужен только для model-viewer/шрифтов):
  `python3 tools/build_offline.py site build/London_Landmarks_3D.html` (~20 МБ). Скрипт ищет в index.html строки `  const SHOT = new URLSearchParams`, строку `'<model-viewer src="models/' …` и строку с `saveData` — при правке этих мест обновить и скрипт.
- **Презентация и перевод**: `London_Sights_Presentation.pptx` (14 слайдов: титул, QR на сайт, Why London?, маршрут, 8 слайдов-достопримечательностей с маленьким QR «Open in 3D», Conclusion, Thank you; Georgia/Arial, тёмно-синий) и `London_Sights_English.docx`. Исходники сборки презентации не сохранились — правки вносить прямо в pptx (python-pptx / скилл pptx). Фото — с Wikimedia Commons.
