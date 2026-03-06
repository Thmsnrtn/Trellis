function hasNativeStorage() {
  return typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
}

export async function sLoad(key, fallback) {
  try {
    if (hasNativeStorage()) {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : fallback;
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function sSave(key, data) {
  try {
    if (hasNativeStorage()) {
      await window.storage.set(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
}
