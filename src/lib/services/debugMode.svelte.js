const browser = typeof window !== "undefined";
const dev =
  typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
import { storage } from "./storage.js";

const STORAGE_KEY = "debug_mode";
const PROD_PRESSES_TO_ENABLE = 55;
const PRESSES_TO_DISABLE = 5;

class DebugMode {
  // Три стани (DEBUGGING-v10 § 4): true = увімкнено явно, false = вимкнено явно, null = за замовчуванням
  stored = $state(null);

  constructor() {
    if (browser) {
      const saved = storage.get(STORAGE_KEY);
      if (saved === "true") this.stored = true;
      else if (saved === "false") this.stored = false;
    }
  }

  get enabled() {
    if (this.stored !== null) return this.stored;
    return dev;
  }

  get pressesToToggle() {
    return this.enabled ? PRESSES_TO_DISABLE : PROD_PRESSES_TO_ENABLE;
  }

  enable() {
    this.stored = true;
    if (browser) storage.set(STORAGE_KEY, "true");
  }

  disable() {
    this.stored = false;
    if (browser) storage.set(STORAGE_KEY, "false");
  }

  toggle() {
    if (this.enabled) this.disable();
    else this.enable();
  }

  reset() {
    this.stored = null;
    if (browser) storage.remove(STORAGE_KEY);
  }
}

export const debugMode = new DebugMode();
