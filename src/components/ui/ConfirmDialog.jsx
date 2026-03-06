import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { C, FN } from "../../constants/theme";

export function ConfirmDialog({ title, message, confirmText, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  const requiresTyping = confirmText != null;
  const canConfirm = requiresTyping ? typed === confirmText : true;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", fontFamily: FN }}>
      <div style={{ background: C.s1, border: `1px solid ${C.b1}`, borderRadius: 16, padding: 24, maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.rS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={18} color={C.r} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.t1, margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.6, margin: "0 0 16px" }}>{message}</p>
        {requiresTyping && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: C.t3, fontWeight: 600, display: "block", marginBottom: 4 }}>
              Type <strong style={{ color: C.r }}>{confirmText}</strong> to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8, background: C.s2,
                border: `1px solid ${C.b1}`, color: C.t1, fontSize: 13, outline: "none", fontFamily: FN,
              }}
            />
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${C.b1}`, color: C.t2, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: FN }}>
            Cancel
          </button>
          <button
            onClick={canConfirm ? onConfirm : undefined}
            disabled={!canConfirm}
            style={{
              padding: "8px 16px", borderRadius: 8, background: canConfirm ? C.r : C.s2,
              border: "none", color: canConfirm ? "#fff" : C.t3, fontSize: 11, fontWeight: 600,
              cursor: canConfirm ? "pointer" : "default", opacity: canConfirm ? 1 : 0.5,
              fontFamily: FN, transition: "all 0.2s",
            }}
          >
            Delete Everything
          </button>
        </div>
      </div>
    </div>
  );
}
