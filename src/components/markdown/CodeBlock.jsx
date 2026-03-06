import { useState } from "react";
import { CheckCircle, Copy } from "lucide-react";
import { C, FN } from "../../constants/theme";

export function CodeBlock({ lang, code }) {
  const [cp, setCp] = useState(false);
  return (
    <div style={{ position: "relative", margin: "8px 0" }}>
      <pre style={{ background: "rgba(0,0,0,0.35)", padding: "10px 14px", paddingRight: 40, borderRadius: 10, fontSize: 11, lineHeight: 1.55, overflowX: "auto", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", border: `1px solid ${C.b1}`, margin: 0 }}>
        {lang && <div style={{ fontSize: 9, color: C.t3, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{lang}</div>}
        <code style={{ color: C.t2 }}>{code}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCp(true); setTimeout(() => setCp(false), 1500); }}
        style={{ position: "absolute", top: 6, right: 6, padding: "3px 6px", borderRadius: 6, background: cp ? C.gS : "rgba(255,255,255,0.06)", border: `1px solid ${cp ? C.g + "40" : C.b1}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: cp ? C.g : C.t3, fontFamily: FN, transition: "all 0.15s" }}
      >
        {cp ? <CheckCircle size={8} /> : <Copy size={8} />} {cp ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
