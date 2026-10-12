import { sessionStore } from "./storage.js";

const browser = typeof window !== "undefined";
const dev =
  typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

const MAX_LOGS = 1000;
const SESSION_STORAGE_KEY = "logs_history";
const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
const SENSITIVE_PARAM =
  /^(token|access_token|code|state|key|api_?key|password|email)$/i;

export function maskText(str) {
  return str.replace(EMAIL_REGEX, "***@***.***");
}

export function scrubUrl(raw) {
  try {
    const url = new URL(raw);
    for (const name of [...url.searchParams.keys()]) {
      if (SENSITIVE_PARAM.test(name)) url.searchParams.set(name, "REDACTED");
    }
    return url.toString();
  } catch {
    return maskText(raw);
  }
}

class LogService {
  logs = $state([]);
  errorCount = $derived(this.logs.filter((l) => l.level === "error").length);
  appVersion =
    typeof globalThis.__APP_VERSION__ !== "undefined"
      ? globalThis.__APP_VERSION__
      : "0.0.2";
  mirrorEnabled = true;

  constructor() {
    if (browser) {
      const saved = sessionStore.getJSON(SESSION_STORAGE_KEY, Array.isArray);
      if (saved) {
        this.logs = saved;
      }
    }
  }

  mirror() {
    if (!browser || !this.mirrorEnabled) return;
    const ok = sessionStore.setJSON(
      SESSION_STORAGE_KEY,
      $state.snapshot(this.logs),
    );
    if (!ok) {
      this.mirrorEnabled = false;
    }
  }

  add(level, category, rawMessage, data) {
    const message = maskText(rawMessage);
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      category: category.toUpperCase(),
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs.shift();
    }
    this.mirror();

    if (browser) {
      if (dev || level === "error") {
        const prefix = `[${level.toUpperCase()}] [${entry.category}]`;
        if (level === "error") console.error(prefix, message, data ?? "");
        else if (level === "warn") console.warn(prefix, message, data ?? "");
        else console.log(prefix, message, data ?? "");
      }
    }
  }

  info(category, message, data) {
    this.add("info", category, message, data);
  }

  warn(category, message, data) {
    this.add("warn", category, message, data);
  }

  error(category, message, data) {
    this.add("error", category, message, data);
  }

  clear() {
    this.logs = [];
    this.mirror();
  }

  getReport() {
    const inBrowser = typeof window !== "undefined";
    const header = [
      "--- LOG REPORT ---",
      `DATE: ${new Date().toISOString()}`,
      `VERSION: ${this.appVersion}`,
      `URL: ${inBrowser ? scrubUrl(window.location.href) : "SSR"}`,
      `DEVICE: ${inBrowser ? navigator.userAgent : "SSR"}`,
      `ONLINE: ${inBrowser ? navigator.onLine : "n/a"}`,
      `ERRORS: ${this.errorCount}`,
      "---",
    ].join("\n");

    const body = this.logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}`,
      )
      .join("\n");

    return `${header}\n--- RECENT LOGS ---\n${body}`;
  }
}

export const logService = new LogService();
