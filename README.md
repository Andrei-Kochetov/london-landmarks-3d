# London Landmarks 3D

Школьный проект «London and Its Sights», Class 7V, Саратов, 2026.
Авторы: O. V. Kochetova, A. A. Ilyushina, V. N. Gordeeva.

Сайт: https://london-landmarks-7v.netlify.app

Одна страница с восемью достопримечательностями Лондона: у каждой реальная 3D-модель
(можно крутить, приближать, на телефоне — смотреть в комнате через камеру), короткий текст,
главные цифры и «Did you know?».

## Что где лежит

| Путь | Что это |
|---|---|
| `site/index.html` | вся страница: тексты, оформление и скрипт |
| `site/models/*.glb` | 3D-модели, по одной на достопримечательность |
| `site/models/posters/*.webp` | картинки-превью, пока модель загружается |
| `site/_headers` | настройки кеша для Netlify |
| `QR_codes/` | QR-коды на сайт и на каждую достопримечательность |

## Как посмотреть локально

```bash
cd site
python3 -m http.server 8000
```

Потом открыть http://localhost:8000 (двойным щелчком по `index.html` модели не загрузятся).

## Как поправить

- Тексты — список `SIGHTS` в `site/index.html` (`name`, `lede`, `facts`, `dyk`).
- Заменили модель в `site/models/` — увеличьте `MODEL_VERSION` в `site/index.html`,
  чтобы браузеры не показывали старую из кеша.

## Как опубликовать

Netlify → проект `london-landmarks-7v` → Deploys → перетащить папку `site`.

## 3D-модели

Модели принадлежат их авторам и используются по их лицензиям (Sketchfab CC BY / Free Standard,
3D Warehouse): Buckingham Palace, Tower of London — PeeJaa; Big Ben — ManySince910;
London Eye — mohamedhussien; Royal Opera House — 3D Warehouse Staff; Nelson's Column — hardingdave;
Westminster Abbey — samixalam; National Gallery — Si.
