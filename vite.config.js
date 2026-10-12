import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import pkg from "./package.json" with { type: "json" };

export const asBrowserSees = (text) => text.replace(/\r\n?/g, "\n");

/**
 * @returns {`sha256-${string}`}
 */
export function inlineScriptHash() {
  const html = readFileSync("src/app.html", "utf8");
  const open = "<script>";
  const close = "</" + "script>";
  const start = html.indexOf(open);
  const end = start < 0 ? -1 : html.indexOf(close, start);
  if (start < 0 || end < 0) {
    throw new Error(
      "app.html: інлайн-скрипт першого кадру не знайдено. Без хеша CSP заблокує тему мовчки."
    );
  }
  const body = asBrowserSees(html.slice(start + open.length, end));
  return /** @type {`sha256-${string}`} */ (
    `sha256-${createHash("sha256").update(body).digest("base64")}`
  );
}

export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      adapter: adapter({
        pages: "build",
        assets: "build",
        fallback: "404.html",
        precompress: false,
        strict: true,
      }),
      paths: {
        base: /** @type {'' | `/${string}`} */ (
          process.env.BASE_PATH ??
            (mode === "production" ? "/DeviantBlaze" : "")
        ),
        relative: false,
        origin: "https://alik532ua.github.io",
      },
      csp: {
        mode: "hash",
        directives: {
          "default-src": ["self"],
          "script-src": ["self", inlineScriptHash()],
          "style-src": [
            "self",
            "unsafe-inline",
            "https://fonts.googleapis.com",
          ],
          "font-src": ["self", "https://fonts.gstatic.com"],
          "img-src": ["self", "data:"],
          "media-src": ["self", "blob:"],
          "connect-src": ["self"],
          "object-src": ["none"],
          "base-uri": ["self"],
        },
      },
      prerender: {
        handleHttpError: ({ path, message }) => {
          if (path.startsWith("/DigitalWorkshop")) return;
          throw new Error(message);
        },
      },
      version: {
        pollInterval: 60000,
      },
    }),
  ],
}));

