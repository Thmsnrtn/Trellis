import { C } from "../../constants/theme";

export function Section({ title, sub, right, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.t1, margin: 0, letterSpacing: -0.2 }}>{title}</h2>
          {sub && <p style={{ fontSize: 10, color: C.t3, margin: "2px 0 0" }}>{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
