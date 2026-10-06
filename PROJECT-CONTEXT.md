# Deviant Blaze — Project Context

## 1. Загальні відомості
- **Назва**: Deviant Blaze
- **Опис**: Офіційний інтерактивний веб-портал рок-гурту Deviant Blaze (медіаплеєр, VJ аудіовізуалізатор концертного рівня, студійне фортепіано, галерея виступів та посилання на релізи).
- **Стек**: SvelteKit 2 + Svelte 5 (Runes), adapter-static, Vanilla CSS, Web Audio API, Canvas.
- **Хостинг**: GitHub Pages (`https://alik532ua.github.io/DeviantBlaze/`).
- **Гілка деплою**: `main`.

## 2. Конфігурація адресації та базового шляху (SEO-v10 § 1.2)
- **SITE_ORIGIN**: `https://alik532ua.github.io`
- **SITE_BASE**: `/DeviantBlaze` (у production-збірці; порожній рядок у локальній розробці)
- **paths.relative**: `false` (гарантує коректні абсолютні шляхи при SSR/prerender)
- **paths.origin**: `https://alik532ua.github.io`

## 3. Реєстр префіксів сховища (STORAGE-NAMESPACE-v10 § 1)
Сайт розміщено на спільному домені `alik532ua.github.io`, тому всі ключі веб-сховища мають суворий унікальний префікс.

| Поле | Значення |
|---|---|
| **PROJECT_PREFIX** | `deviantblaze_` |
| **STORAGE_PREFIX (prod)** | `deviantblaze_` |
| **STORAGE_PREFIX (dev)** | `deviantblaze-dev_` |

### Реєстр ключів сховища
| Ключ (без префікса) | Повний ключ у сховищі | Призначення | Дозволені значення |
|---|---|---|---|
| `theme` | `deviantblaze_theme` | Тема оформлення інтерфейсу | `'dark'`, `'light'` |
| `lang` | `deviantblaze_lang` | Мова інтерфейсу | `'uk'`, `'en'` |
| `icon_style` | `deviantblaze_icon_style` | Стиль іконок | `'gothic'`, `'classic'` |

- Прямий доступ до `localStorage` поза фасадом `#lib/services/storage.js` заборонено (STORAGE-NAMESPACE § 4).
- Метод `storage.clear()` очищує виключно власні ключі за префіксом (STORAGE-NAMESPACE § 3).
- Разова міграція старих ключів (`deviantblaze-theme`, `deviantblaze-lang`, `deviantblaze-icon-style`) виконується функцією `migrateLegacyKeys()` (STORAGE-NAMESPACE § 5).

## 4. Модель версіонування (VERSIONING-v10 § 1 & § 2)
- **Модель бампа**: `npm version <patch|minor|major> --no-git-tag-version` (синхронізує `package.json` та `package-lock.json`).
- **Впровадження версії**: константа `__APP_VERSION__` інжектується через Vite `define` під час збірки.
- **Оновлення клієнта**: `version.pollInterval: 60000` у Vite config запобігає збоям застарілих чанків після деплою нових версій.

## 5. Політика перевірок та гейтів (SEO-v10 § 6, CI-CD-AND-TOOLS § 1.19)
- `npm run check`: перевірка типів та синтаксису Svelte 5 Runes через `svelte-check`.
- `npm run check:build`: автоматичний гейт якості зібраного сайту:
  - `SEO § 6.1`: перевірка canonical, єдиного власника мета-тегів, відсутності дублікатів, валідності JSON-LD, наявності sitemap.
  - `SEO § 7.5`: перевірка llms.txt та відсутності недіючого robots.txt у підтеці.
  - Обидві перевірки вбудовані у крок CI/CD [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
