---
Назва: AGENTS.md — контекст проєкту DeviantBlaze
Опис: Канонічні інструкції для будь-якого AI-асистента в цьому репозиторії
---

# AGENTS.md — DeviantBlaze

> **Спершу прочитай [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md).** Там зафіксовано архітектурні інваріанти за каноном v10: параметри адресації, префікси сховища, політика безпеки (CSP), Web Audio API архітектура, бета-чеклист та стандарти доступності. Цей файл — практична витримка для щоденної роботи AI-агентів.

---

## 1. Що це за проєкт

Офіційний інтерактивний медіа- та візуальний портал рок-гурту **Deviant Blaze** (`https://alik532ua.github.io/DeviantBlaze/`).

- **Основні модулі**:
  - Інтерактивне векторне 3D-лого (14 незалежних рухомих компонентів із пружною фізикою, реакцією на курсор і мобільний гіроскоп).
  - Концертний Canvas VJ візуалізатор (спектральні смуги `bars`, радіальний `radial`, хвиля `wave`, частинки `particles`) із підтримкою мікрофона та динамічних колірних тем (`blaze`, `neon`, `acid`, `mono`).
  - Віртуальне студійне фортепіано (Web Audio API polyphonic synth, акордова сітка, клавіатурні бінді).
  - Галерея фото/відео виступів та модальні вікна контактів.
  - Автономний бета-тест чеклист (`/beta-test-checklists`) для відстеження регресій.
- **Стек**: SvelteKit 3 (`@sveltejs/kit`), Svelte 5 (Runes), `@sveltejs/adapter-static`, Web Audio API, Canvas 2D.
- **Хостинг**: GitHub Pages на `alik532ua.github.io/DeviantBlaze/`.

---

## 2. Ключові архітектурні інваріанти

1. **Svelte 5 Runes:**
   - Використовувати тільки `$state`, `$derived`, `$props`, `$effect`, snippets.
2. **Конфігурація SvelteKit 3:**
   - У `@sveltejs/kit` v3 конфігурація проєкту задається безпосередньо у плагіні `sveltekit(...)` у файлі [vite.config.js](vite.config.js). Файл `svelte.config.js` не використовується.
3. **Безпека (CSP-v10 & XSS):**
   - Усі інлайн-скрипти з `src/app.html` хешуються SHA-256 функцією `inlineScriptHash()` у `vite.config.js` з нормалізацією закінчень рядків через `asBrowserSees()`.
   - Інваріант перевіряється тестом [src/csp-hash.test.js](src/csp-hash.test.js) та [src/security.test.js](src/security.test.js).
   - Вставка SVG-іконок через `{@html}` суворо валідується за білим списком у `security.test.js`.
4. **Ізоляція сховища (STORAGE-NAMESPACE-v10):**
   - Префікси сховища: `deviantblaze_` (production), `deviantblaze-dev_` (development).
   - Пряме звернення до `localStorage` повз фасад `#lib/services/storage.js` заборонено.
5. **Логування та обробка помилок:**
   - Усі системні події та помилки фіксуються через `logService` (`#lib/services/logService.svelte.js`) у кільцевий буфер пам'яті.

---

## 3. Корисні команди розробки

```bash
npm run dev         # Локальний сервер розробки
npm run check       # Перевірка синтаксису й типів Svelte 5
npm run lint        # Повний лінтинг (Prettier + ESLint)
npm run format      # Автоформатування коду Prettier
npm run test:unit   # Запуск модульних тестів Vitest
npm run test:e2e    # Запуск E2E тестів Playwright
npm run build       # Продакшн збірка зі статичним генератором
npm run check:build # Перевірка SEO та артефактів збірки
npm run audit:ci    # Аудит залежностей на вразливості
```
