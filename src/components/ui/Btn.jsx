import { Loader } from "lucide-react";
import { C, FN } from "../../constants/theme";

export function Btn({ children, primary, small, loading, disabled, onClick, danger, ghost, style: extraStyle }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: small ? "5px 11px" : "9px 15px", borderRadius: 10,
        background: primary ? C.a : "transparent",
        color: primary ? "#fff" : danger ? C.r : C.t2,
        border: primary ? "none" : ghost ? "none" : `1px solid ${danger ? C.rS : C.b1}`,
        fontSize: small ? 10 : 11, fontWeight: 600,
        cursor: disabled || loading ? "default" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        transition: "all 0.2s", fontFamily: FN,
        ...extraStyle,
      }}
    >
      {loading && <Loader size={10} style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
}
