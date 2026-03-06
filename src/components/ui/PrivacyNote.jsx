import { Shield } from "lucide-react";
import { C } from "../../constants/theme";

export function PrivacyNote({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(85,179,96,0.06)", border: "1px solid rgba(85,179,96,0.1)", marginTop: 10 }}>
      <Shield size={12} color={C.g} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 10, color: C.g, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}
