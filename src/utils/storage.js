// In-memory fallback when neither native storage nor localStorage is available
const memStore = {};

function hasNativeStorage() {
  return typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
}

function hasLocalStorage() {
  try {
    const t = "__test__";
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

export async function sLoad(key, fallback) {
  try {
    if (hasNativeStorage()) {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : fallback;
    }
    if (hasLocalStorage()) {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }
    // In-memory fallback
    return key in memStore ? JSON.parse(memStore[key]) : fallback;
  } catch {
    return fallback;
  }
}

export async function sSave(key, data) {
  try {
    const json = JSON.stringify(data);
    if (hasNativeStorage()) {
      await window.storage.set(key, json);
    } else if (hasLocalStorage()) {
      localStorage.setItem(key, json);
    } else {
      memStore[key] = json;
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
}
