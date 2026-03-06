import { C } from "../constants/theme";
import { ALL_MODULES } from "../constants/modules";

export function ModPlaceholder({ moduleId }) {
  const mod = ALL_MODULES[moduleId];
  if (!mod) return null;
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <mod.Icon size={32} color={C.t3} style={{ marginBottom: 12 }} />
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.t1, margin: "0 0 6px" }}>{mod.label}</h2>
      <p style={{ fontSize: 12, color: C.t3, lineHeight: 1.5, maxWidth: 300, margin: "0 auto" }}>{mod.desc}</p>
      <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.b1}` }}>
        <div style={{ fontSize: 11, color: C.t2 }}>This module is coming soon. Use the AI assistant to access these capabilities now.</div>
      </div>
    </div>
  );
}
