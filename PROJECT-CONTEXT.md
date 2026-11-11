---
Назва: Контекст проєкту DeviantBlaze
Канон: selection_criteria/v10 та product_criteria/v10
Дата оновлення: 2026-11-11
---

# Deviant Blaze — Project Context

## 1. Загальні відомості

- **Назва**: Deviant Blaze
- **Опис**: Офіційний інтерактивний веб-портал рок-гурту Deviant Blaze (медіаплеєр, VJ аудіовізуалізатор концертного рівня, студійне фортепіано, галерея виступів, модальні вікна контактів та посилання на релізи).
- **Стек**: SvelteKit 3 (`@sveltejs/kit`), Svelte 5 (Runes), `@sveltejs/adapter-static`, Web Audio API, Canvas 2D, Vanilla CSS Variables.
- **Хостинг**: GitHub Pages (`https://alik532ua.github.io/DeviantBlaze/`).
- **Гілка деплою**: `main`.

---

## 2. Конфігурація адресації та базового шляху (SEO-v10 § 1.2)

- **SITE_ORIGIN**: `https://alik532ua.github.io`
- **SITE_BASE**: `/DeviantBlaze` (у production-збірці; порожній рядок у локальній розробці)
- **paths.relative**: `false` (гарантує коректні абсолютні шляхи при SSR/prerender)
- **paths.origin**: `https://alik532ua.github.io`

---

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)

Сайт розміщено на спільному домені `alik532ua.github.io`, тому всі ключі веб-сховища мають суворий унікальний префікс.

| Поле                      | Значення            |
| ------------------------- | ------------------- |
| **PROJECT_PREFIX**        | `deviantblaze_`     |
| **STORAGE_PREFIX (prod)** | `deviantblaze_`     |
| **STORAGE_PREFIX (dev)**  | `deviantblaze-dev_` |

### Реєстр ключів сховища

| Ключ (без префікса) | Повний ключ у сховищі       | Призначення                            | Дозволені значення      |
| ------------------- | --------------------------- | -------------------------------------- | ----------------------- |
| `theme`             | `deviantblaze_theme`        | Тема оформлення інтерфейсу             | `'dark'`, `'light'`     |
| `lang`              | `deviantblaze_lang`         | Мова інтерфейсу                        | `'uk'`, `'en'`          |
| `icon_style`        | `deviantblaze_icon_style`   | Стиль іконок                           | `'gothic'`, `'classic'` |
| `stale_reload`      | `deviantblaze_stale_reload` | Захист від циклічного перезавантаження | URL сторінки            |

- Прямий доступ до `localStorage` поза фасадом `#lib/services/storage.js` заборонено (STORAGE-NAMESPACE § 4).
- Метод `storage.clear()` очищує виключно власні ключі за префіксом (STORAGE-NAMESPACE § 3).
- Разова міграція старих ключів виконується функцією `migrateLegacyKeys()` (STORAGE-NAMESPACE § 5).

---

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
   - `ErrorFallback.svelte`: Захисний екран обробки системних помилок та збоїв рендерингу.

2. **Сервіси та рушії (`src/lib/services/`, `src/lib/visualizer/`, `src/lib/audio/`)**:
   - `audio/audioGraphManager.js`: Централізоване керування життєвим циклом AudioContext, AnalyserNode, GainNode та безпечне відключення вузлів без витоків пам'яті.
   - `audio/trackSchema.js`: Схема валідації динамічних медіа-треків та альбомів для безпечного масштабування аудіотеки.
   - `types/audio.d.ts` та `types/visualizer.d.ts`: Декларації типів для строгих перевірок та підтримки AI.
   - `visualizer/registry.js`: Модульний реєстр візуальних VJ-режимів (`bars`, `wave`, `radial`, `particles`) з уніфікованим інтерфейсом рендерингу для легкого масштабування.
   - `audio/presets.js`: Банк звукових пресетів синтезатора (`grand_piano`, `analog_lead`, `ambient_pad`, `sub_bass`) із кривими ADSR.
   - `services/a11yAudio.js`: Доступність Web Audio та клавіатури, ARIA-оголошення нот та змін режимів для скрінрідерів.
   - `services/storage.js`: Ізольований префіксований фасад над сховищем з квотою та обробкою помилок.
   - `services/logService.svelte.js`: Кільцевий буфер логів, санітизація чутливих параметрів, фільтрація помилок.
   - `services/fullscreen.js`: Адаптивна підтримка повноекранного режиму з детекцією iOS/Safari обмежень.
   - `services/keySequence.js`: Перехоплення секретних гарячих клавіш для швидкого виклику інструментів.
   - `utils/staleBuild.js`: Автоматичне перезавантаження застарілих чанків нової збірки.

3. **Архітектурні рішення (ADR)**:
   - [ADR 0001: Web Audio API, інтерактивний VJ-візуалізатор та векторна 3D-фізика логотипу](docs/adr/0001-vj-visualizer-and-web-audio.md).
   - [ADR 0002: Web Audio Node Lifecycle and Particle Pool Memory Architecture](docs/adr/0002-web-audio-node-lifecycle-and-particle-pooling.md).

---

## 5. Безпека та CSP (SECURITY-v10 & CSP-v10)

- **Режим CSP**: `mode: 'hash'` у `vite.config.js`.
- **Інлайн-скрипти**: Скрипт першого кадру в `src/app.html` автоматично хешується функцією `inlineScriptHash()` із нормальною CRLF->LF конвертацією для гарантованої крос-платформної ідентичності.
- **Відсутність unsafe-inline у script-src**: Усі скрипти або збираються з власних модулів (`'self'`), або входять до дозволеного списку sha256-хешів.
- **Екранування {@html}**: Дозволено виключно для перевірених SVG-іконок з `icons.js` та захищеного JSON-LD, що контролюється тестом [src/security.test.js](src/security.test.js).

---

## 6. Надійність та Error Boundaries (ERROR-HANDLING-v10 § 2.2)

- **Клієнтський обробник помилок (`src/hooks.client.js`)**:
  - Перехоплює неперехоплені клієнтські помилки роутингу, завантаження модулів і рендеру.
  - Логує контекст помилки в `logService`.
  - Відновлює актуальну сторінку при виявленні застарілих чанків (`chunkMissing` + `reloadOnce`).
- **Межа рендеру помилок Svelte 5 (`<svelte:boundary>`)**:
  - Маршрути в `src/routes/+layout.svelte` захищені граничним компонентом `ErrorFallback.svelte`.

---

## 7. Модель версіонування (VERSIONING-v10 § 1 & § 2)

- **Модель бампа**: `npm version <patch|minor|major> --no-git-tag-version` (синхронізує `package.json` та `package-lock.json`).
- **Впровадження версії**: константа `__APP_VERSION__` інжектується через Vite `define` під час збірки.
- **Оновлення клієнта**: `version.pollInterval: 60000` у Vite config запобігає збоям застарілих чанків після деплою нових версій.

---

## 8. Політика перевірок, тестування та гейтів якості

- `npm run check`: перевірка типів через `tsconfig.json` (`checkJs: true`, `alwaysStrict: true`, `strictBindCallApply: true`, `strictFunctionTypes: true`).
- `npm run lint`: повний лінтинг форматування (Prettier) та коду (ESLint 9 Flat Config).
- `npm run test:unit`: тестові набори Vitest (безпека, CSP-хеші, сховище, аудіопресети, реєстр візуалізаторів, обробка помилок).
- `npm run test:e2e`: E2E тести Playwright та аудит доступності через `@axe-core/playwright` (WCAG 2.1 AA) у CI.
- `npm run check:build`: автоматичний гейт якості зібраного сайту.
- `npm run audit:ci`: строгий автоматичний аудит безпеки npm-пакетів.
- Всі перевірки вбудовані у обов'язковий пайплайн CI/CD [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## 9. Доступність (Accessibility & UX)

- **WCAG 2.1 AA**: Контрастність тексту та іконок відповідає рівню AA у темній та світлій темах.
- **Зменшення руху (`prefers-reduced-motion`)**: При активації системного режиму анімації логотипу, спектру візуалізатора та фонового паралаксу плавно заморожуються.
- **Скрінрідери та аудіо-доступність (`src/lib/services/a11yAudio.js`)**: ARIA live regions озвучують зіграні ноти клавіатури фортепіано та активний режим візуалізатора українською та англійською мовами.
- **Семантична навігація**: Усі кнопки та модальні діалоги мають чіткі атрибути `aria-label`, `aria-modal`, `role="dialog"` та фокус-пастки.

---

## 10. Свідомі відхилення від канону

1. **JSDoc типізація замість монолітного TS**:
   - _Причина_: Використання Web Audio API та динамічних Canvas 2D обчислень у рантаймі працює швидше з чистими `.js` файлами з детальними `.d.ts` деклараціями та JSDoc (`checkJs: true`), що усуває зайвий транспіляційний оверхед на складних циклах візуалізатора (60 FPS).
2. **Інлайн-аудіо синтез замість зовнішніх MP3 семплів фортепіано**:
   - _Причина_: Зменшення розміру початкового бандла до нуля — замість завантаження 15 МБ звукових банків звук генерується на льоту через генератори коливань (`OscillatorNode`) та огинаючі ADSR.

---

## 11. Опціональні критерії інженерного пакета

| Критерій              | Застосовано | Причина / Локація                                                |
| :-------------------- | :---------: | :--------------------------------------------------------------- |
| **CSP-HASH**          |     Так     | `vite.config.js`, `src/csp-hash.test.js`                         |
| **STORAGE-NAMESPACE** |     Так     | Префікс `deviantblaze_`, `src/lib/services/storage.js`           |
| **ERROR-HANDLING**    |     Так     | `<svelte:boundary>`, `src/error-handling.test.js`                |
| **VERSIONING**        |     Так     | `__APP_VERSION__`, `scripts/bump-version.mjs`                    |
| **ACCESSIBILITY**     |     Так     | `src/lib/services/a11yAudio.js`, `@axe-core/playwright`          |
| **DEPENDENCIES**      |     Так     | `scripts/check-audit.mjs`, Dependabot                            |
| **BETA-CHECKLIST**    |     Так     | `src/routes/beta-test-checklists/`, `src/beta-checklist.test.js` |
