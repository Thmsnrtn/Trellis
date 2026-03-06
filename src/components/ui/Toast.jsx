import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle, AlertTriangle, X, Info } from "lucide-react";
import { C, FN } from "../../constants/theme";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: { Icon: CheckCircle, color: C.g },
  error: { Icon: AlertTriangle, color: C.r },
  info: { Icon: Info, color: C.bl },
};

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const { Icon, color } = ICONS[toast.type] || ICONS.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
      borderRadius: 12, background: C.s1, border: `1px solid ${color}30`,
      boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${C.b1}`,
      maxWidth: 340, fontFamily: FN,
      opacity: exiting ? 0 : 1, transform: exiting ? "translateY(-8px)" : "translateY(0)",
      transition: "all 0.3s ease",
    }}>
      <Icon size={14} color={color} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: C.t1, fontWeight: 500, flex: 1 }}>{toast.message}</span>
      <button onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", flexShrink: 0 }}>
        <X size={10} color={C.t3} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div style={{ position: "fixed", top: 56, right: 14, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
          {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
        </div>
      )}
    </ToastContext.Provider>
  );
}
