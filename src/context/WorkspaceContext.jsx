import { createContext, useContext, useCallback, useRef } from "react";
import { usePersistedState } from "../hooks/usePersistedState";
import { SEED_DATA } from "../constants/seed";

const WorkspaceContext = createContext(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children }) {
  const [profile, setProfile, profileReady] = usePersistedState("tr-profile", null);
  const [data, setData, dataReady] = usePersistedState("tr-data", SEED_DATA);

  // Audit trail — tracks last 100 mutations
  const [auditLog, setAuditLog] = usePersistedState("tr-audit", []);

  const logMutation = useCallback((action, detail, source = "user") => {
    const entry = {
      action,
      detail,
      source,
      time: new Date().toISOString(),
      display: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    };
    setAuditLog((prev) => {
      const log = prev || [];
      return [entry, ...log].slice(0, 100);
    });
  }, [setAuditLog]);

  const addActivity = useCallback((text, source = "user") => {
    const entry = { text, time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) };
    setData((prev) => ({
      ...(prev || SEED_DATA),
      activity: [entry, ...((prev || SEED_DATA).activity || []).slice(0, 49)],
    }));
    logMutation("activity", text, source);
  }, [setData, logMutation]);

  // Ref for latest data (used in async tool execution closures)
  const dataRef = useRef(data);
  dataRef.current = data;

  const ready = profileReady && dataReady;
  const safeData = data || SEED_DATA;

  return (
    <WorkspaceContext.Provider value={{
      profile, setProfile,
      data: safeData, setData,
      dataRef,
      addActivity, logMutation,
      auditLog: auditLog || [],
      ready,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
