import { C } from "../../constants/theme";

export function KPICard({ label, value, sub, accent, Icon }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        {Icon && <Icon size={10} color={C.t3} />}
        <span style={{ fontSize: 9, color: C.t3, fontWeight: 600, letterSpacing: 0.7, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || C.t1, letterSpacing: -0.7, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
