import { beforeEach, describe, expect, it, vi } from "vitest";
import { storage, sessionStore, STORAGE_PREFIX } from "./storage.js";

describe("storage facade (STORAGE-NAMESPACE-v10)", () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = {};
    const fake = {
      getItem: vi.fn((key) => mockStorage[key] ?? null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      get length() {
        return Object.keys(mockStorage).length;
      },
      key: vi.fn((i) => Object.keys(mockStorage)[i] ?? null),
    };

    vi.stubGlobal("window", {
      localStorage: fake,
      sessionStorage: fake,
    });
  });

  it("prefixes every key with STORAGE_PREFIX", () => {
    storage.set("theme", "dark");
    expect(storage.get("theme")).toBe("dark");
    expect(mockStorage[`${STORAGE_PREFIX}theme`]).toBe("dark");
    expect(mockStorage["theme"]).toBeUndefined();
  });

  it("clear() deletes only own prefixed keys, never neighbour keys", () => {
    mockStorage["otherapp_theme"] = "blue";
    mockStorage["theme"] = "legacy";
    mockStorage[`${STORAGE_PREFIX}theme`] = "dark";
    mockStorage[`${STORAGE_PREFIX}lang`] = "uk";

    const count = storage.clear();
    expect(count).toBe(2);
    expect(mockStorage[`${STORAGE_PREFIX}theme`]).toBeUndefined();
    expect(mockStorage[`${STORAGE_PREFIX}lang`]).toBeUndefined();
    expect(mockStorage["otherapp_theme"]).toBe("blue");
    expect(mockStorage["theme"]).toBe("legacy");
  });

  it("getJSON and setJSON handle structured data safely", () => {
    const isState = (val) =>
      typeof val === "object" && val !== null && typeof val.v === "number";

    storage.setJSON("state", { v: 42 });
    expect(storage.getJSON("state", isState)).toEqual({ v: 42 });

    // Invalid shape returns null
    storage.set("state", JSON.stringify({ v: "not a number" }));
    expect(storage.getJSON("state", isState)).toBeNull();

    // Malformed JSON returns null without throwing
    storage.set("state", "{ corrupted json");
    expect(storage.getJSON("state", isState)).toBeNull();
  });

  it("handles quota exceeded without throwing", () => {
    window.localStorage.setItem = vi.fn(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => storage.set("large", "data")).not.toThrow();
    expect(storage.set("large", "data")).toBe(false);
  });
});
