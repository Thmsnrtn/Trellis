export async function sLoad(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
}

export async function sSave(key, data) {
  try {
    await window.storage.set(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
