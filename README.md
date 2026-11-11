# Deviant Blaze 🎸🔥

> **Офіційний інтерактивний веб-портал рок-гурту Deviant Blaze.**

[![Svelte 5](https://img.shields.io/badge/Svelte-5_Runes-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-VJ_Visualizer-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Canon v10](https://img.shields.io/badge/sveltekit--canon-v10-success)](../sveltekit-canon/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Огляд проєкту

**Deviant Blaze** — це багатофункціональний веб-портал рок-гурту нового покоління, створений на базі **SvelteKit** та **Svelte 5 Runes**. Проєкт поєднує якісне аудіо-відтворення, VJ-візуалізацію реального часу та інтерактивні музичні інструменти.

### Основні функціональні модулі:

- 🎵 **Web Audio Медіаплеєр**: Відтворення треків студійної якості, керування плейлистом, налаштування еквалайзера та пресетів звуку.
- 🎛️ **Концертний VJ Аудіовізуалізатор (Canvas 2D)**:
  - Частотний аналіз сигналу в реальному часі через `AnalyserNode` (FFT);
  - Пул графічних частинок (Particle Pooling) для стабільних 60 FPS без навантаження на Garbage Collector;
  - Регулювання чутливості, висоти спектра та вибір візуальних шейдерів/палітр.
- 🎹 **Студійне Фортепіано (Interactive Synth)**:
  - Інтерактивна клавіатура з підтримкою введення з фізичної клавіатури або тачскріна;
  - Поліфонічний процедурний синтез звуку без сторонніх важких семплів.
- 📸 **Галерея виступів**: Фото та відео з живих концертів, турів та бекстейджу.
- 🛡️ **Контроль якості та безпеки**:
  - Сувора політика Content Security Policy (CSP) з хешуванням інлайн-скриптів (sha256);
  - Ізольоване сховище з обов'язковим префіксом `deviantblaze_`.

---

## 🛠️ Технологічний стек

- **Фреймворк**: SvelteKit 2 + Svelte 5 (Runes)
- **Графіка та Аудіо**: HTML5 Canvas 2D, Web Audio API (`AudioContext`, `AnalyserNode`, `BiquadFilterNode`)
- **Адаптер**: `@sveltejs/adapter-static` (GitHub Pages)
- **Тестування**: Vitest (Unit) + Playwright (E2E) + axe-core (a11y)
- **CI/CD**: GitHub Actions (`deploy.yml` з аудитом безпеки та тестами)

---

## 🚀 Встановлення та запуск

```bash
# Встановлення залежностей
npm install

# Запуск локального сервера розробки
npm run dev

# Перевірка коду та лінтинг
npm run lint

# Запуск тестів Vitest
npm test

# Запуск наскрізних E2E тестів
npm run test:e2e

# Збірка сайту
npm run build
```

---

## 📂 Архітектура та Канон

Проєкт відповідає вимогам **`sveltekit-canon` v10**.

- [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) — Повний архітектурний контекст та налаштування адресації.
- [AGENTS.md](AGENTS.md) — Інструкції та обмеження для AI-асистентів.
- [docs/adr/](docs/adr/) — Архітектурні рішення (ADR 0001: VJ Visualizer, ADR 0002: Web Audio Lifecycle).
