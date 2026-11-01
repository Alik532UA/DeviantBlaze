# Deviant Blaze — Project Context

## 1. Загальні відомості

- **Назва**: Deviant Blaze
- **Опис**: Офіційний інтерактивний веб-портал рок-гурту Deviant Blaze (медіаплеєр, VJ аудіовізуалізатор концертного рівня, студійне фортепіано, галерея виступів, модальні вікна контактів та посилання на релізи).
- **Стек**: SvelteKit 3 (`@sveltejs/kit`), Svelte 5 (Runes), `@sveltejs/adapter-static`, Vanilla CSS, Web Audio API, Canvas 2D.
- **Хостинг**: GitHub Pages (`https://alik532ua.github.io/DeviantBlaze/`).
- **Гілка деплою**: `main`.

## 2. Конфігурація адресації та базового шляху (SEO-v10 § 1.2)

- **SITE_ORIGIN**: `https://alik532ua.github.io`
- **SITE_BASE**: `/DeviantBlaze` (у production-збірці; порожній рядок у локальній розробці)
- **paths.relative**: `false` (гарантує коректні абсолютні шляхи при SSR/prerender)
- **paths.origin**: `https://alik532ua.github.io`

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)

Сайт розміщено на спільному домені `alik532ua.github.io`, тому всі ключі веб-сховища мають суворий унікальний префікс.

| Поле                      | Значення            |
| ------------------------- | ------------------- |
| **PROJECT_PREFIX**        | `deviantblaze_`     |
| **STORAGE_PREFIX (prod)** | `deviantblaze_`     |
| **STORAGE_PREFIX (dev)**  | `deviantblaze-dev_` |

### Реєстр ключів сховища

| Ключ (без префікса) | Повний ключ у сховищі     | Призначення                | Дозволені значення      |
| ------------------- | ------------------------- | -------------------------- | ----------------------- |
| `theme`             | `deviantblaze_theme`      | Тема оформлення інтерфейсу | `'dark'`, `'light'`     |
| `lang`              | `deviantblaze_lang`       | Мова інтерфейсу            | `'uk'`, `'en'`          |
| `icon_style`        | `deviantblaze_icon_style` | Стиль іконок               | `'gothic'`, `'classic'` |

- Прямий доступ до `localStorage` поза фасадом `#lib/services/storage.js` заборонено (STORAGE-NAMESPACE § 4).
- Метод `storage.clear()` очищує виключно власні ключі за префіксом (STORAGE-NAMESPACE § 3).
- Разова міграція старих ключів (`deviantblaze-theme`, `deviantblaze-lang`, `deviantblaze-icon-style`) виконується функцією `migrateLegacyKeys()` (STORAGE-NAMESPACE § 5).

## 4. Архітектура компонентів та модулів

1. **Компоненти UI (`src/lib/components/`)**:
   - `BackgroundVisualizer.svelte`: Рендерер фонової спектральної хвилі та частинок.
   - `DeviantBlazeLogo.svelte`: 14 інтерактивних літер і крил SVG з пружною фізикою та реакцією на гіроскоп/курсор.
   - `VisualizerBar.svelte`: Панель керування аудіовізуалізатором (вибір палітри, чутливості, масштабу).
   - `VisualizerModal.svelte`: Модальне вікно концертного візуалізатора на повний екран.
   - `PianoModal.svelte`: Інтерактивний синтезатор фортепіано на Web Audio API з акордовою сіткою.
   - `GalleryModal.svelte`: Модальна галерея фото- та відеоматеріалів виступів.
   - `ContactsModal.svelte`: Канали зв'язку з менеджментом гурту та соціальні мережі.
   - `MusicLinks.svelte`: Швидкі посилання на Spotify, Apple Music, YouTube Music тощо.
   - `TopNav.svelte`: Верхня панель із перемикачами мови (UA/EN), теми (Dark/Light) та стилю іконок (Gothic/Classic).
   - `JsonLd.svelte`: Безпечна вставка валідованої структурованої розмітки Schema.org `MusicGroup`.
2. **Сервіси (`src/lib/services/`)**:
   - `storage.js`: Ізольований префіксований фасад над сховищем з квотою та обробкою помилок.
   - `logService.svelte.js`: Кільцевий буфер логів, санітизація чутливих параметрів, фільтрація помилок.
   - `fullscreen.js`: Адаптивна підтримка повноекранного режиму з детекцією iOS/Safari обмежень.
   - `keySequence.js`: Перехоплення секретних гарячих клавіш для швидкого виклику інструментів.
3. **Архітектурні рішення (ADR)**:
   - [ADR 0001: Web Audio API, інтерактивний VJ-візуалізатор та векторна 3D-фізика логотипу](docs/adr/0001-vj-visualizer-and-web-audio.md).

## 5. Безпека та CSP (SECURITY-v10 & CSP-v10)

- **Режим CSP**: `mode: 'hash'` у `vite.config.js`.
- **Інлайн-скрипти**: Скрипт першого кадру в `src/app.html` автоматично хешується функцією `inlineScriptHash()` із нормальною CRLF->LF конвертацією для гарантованої крос-платформної ідентичності.
- **Відсутність unsafe-inline у script-src**: Усі скрипти або збираються з власних модулів (`'self'`), або входять до дозволеного списку sha256-хешів.
- **Екранування {@html}**: Дозволено виключно для перевірених SVG-іконок з `icons.js` та захищеного JSON-LD, що контролюється тестом [src/security.test.js](src/security.test.js).

## 6. Модель версіонування (VERSIONING-v10 § 1 & § 2)

- **Модель бампа**: `npm version <patch|minor|major> --no-git-tag-version` (синхронізує `package.json` та `package-lock.json`).
- **Впровадження версії**: константа `__APP_VERSION__` інжектується через Vite `define` під час збірки.
- **Оновлення клієнта**: `version.pollInterval: 60000` у Vite config запобігає збоям застарілих чанків після деплою нових версій.

## 7. Політика перевірок, тестування та гейтів якості

- `npm run check`: перевірка типів та синтаксису Svelte 5 Runes через `svelte-check`.
- `npm run lint`: повний лінтинг форматування (Prettier) та коду (ESLint 9 Flat Config).
- `npm run test:unit`: 7 тестових наборів Vitest (безпека, CSP-хеші, сховище, клавіатурні бінді, обробка помилок, бета-чеклист).
- `npm run test:e2e`: E2E тести Playwright та аудит доступності через `@axe-core/playwright` (WCAG 2.1 AA).
- `npm run check:build`: автоматичний гейт якості зібраного сайту:
  - `SEO § 6.1`: перевірка canonical, єдиного власника мета-тегів, відсутності дублікатів, валідності JSON-LD, наявності sitemap.
  - `SEO § 7.5`: перевірка llms.txt та відсутності недіючого robots.txt у підтеці.
- `npm run audit:ci`: строгий автоматичний аудит безпеки npm-пакетів.
- Всі перевірки вбудовані у крок CI/CD [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## 8. Доступність (Accessibility & UX)

- **WCAG 2.1 AA**: Контрастність тексту та іконок відповідає рівню AA у темній та світлій темах.
- **Зменшення руху (`prefers-reduced-motion`)**: При активації системного режиму анімації логотипу, спектру візуалізатора та фонового паралаксу плавно заморожуються.
- **Семантична навігація**: Усі кнопки та модальні діалоги мають чіткі атрибути `aria-label`, `aria-modal`, `role="dialog"` та фокус-пастки.

## 9. Реєстр префіксів на спільному origin

Реєстр префіксів браузерного сховища (`localStorage` / `sessionStorage`) на спільному origin (`alik532ua.github.io`). Жоден префікс не є початком іншого (STORAGE-NAMESPACE-v10).

| Проєкт               | Префікс (prod)      | Префікс (dev)           | Призначення                      |
| -------------------- | ------------------- | ----------------------- | -------------------------------- |
| adoptananimal        | `adoptananimal_`    | `adoptananimal-dev_`    | Притулок для тварин              |
| VetCrewEmergency     | `vetcrewemergency_` | `vetcrewemergency-dev_` | Невідкладна ветеринарна допомога |
| VetCrewGames         | `vetcrewgames_`     | `vetcrewgames-dev_`     | Навчальні ветеринарні ігри       |
| DigitalWorkshop      | `digitalworkshop_`  | `digitalworkshop-dev_`  | Цифрова майстерня                |
| MindStep             | `mindstep_`         | `mindstep-dev_`         | Психологічний супровід           |
| Slovko               | `slovko_`           | `slovko-dev_`           | Гра в слова                      |
| CV                   | `cv-svelte_`        | `cv-svelte-dev_`        | Резюме та портфоліо              |
| as5.odesa.ua         | `as5.odesa.ua_`     | `as5.odesa.ua-dev_`     | Автостанція Одеса 5              |
| teatralo4ka.odesa.ua | `teatralo4ka_`      | `teatralo4ka-dev_`      | Театралочка Одеса                |
| HotPaste             | `hotpaste_`         | `hotpaste-dev_`         | Швидка вставка та нотатки        |
| AudioRemote          | `audioremote_`      | `audioremote-dev_`      | Аудіодошка та пульт керування    |
| DeviantBlaze         | `deviantblaze_`     | `deviantblaze-dev_`     | Медіа та графіка                 |
