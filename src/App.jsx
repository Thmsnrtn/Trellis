import { useState, useEffect, useCallback } from "react";
import { Grid3x3, Sparkles, Settings } from "lucide-react";
import { C, FN } from "./constants/theme";
import { ALL_MODULES } from "./constants/modules";
import { SEED_DATA } from "./constants/seed";
import { usePersistedState } from "./hooks/usePersistedState";
import { Onboarding } from "./modules/Onboarding";
import { ModCommand } from "./modules/ModCommand";
import { ModCompose } from "./modules/ModCompose";
import { ModPipeline } from "./modules/ModPipeline";
import { ModIntel } from "./modules/ModIntel";
import { ModSettings } from "./modules/ModSettings";
import { ModAsk } from "./modules/ModAsk";
import { ModPlaceholder } from "./modules/ModPlaceholder";

const MODULE_RENDERERS = {
  command: ModCommand,
  compose: ModCompose,
  pipeline: ModPipeline,
  intel: ModIntel,
};

export default function TrellisApp() {
  const [activeTab, setActiveTab] = useState("command");
  const [ready, setReady] = useState(false);

  const [profile, setProfile, profileReady] = usePersistedState("tr-profile", null);
  const [data, setData, dataReady] = usePersistedState("tr-data", SEED_DATA);

  useEffect(() => { setTimeout(() => setReady(true), 100); }, []);

  const addActivity = useCallback((text) => {
    const entry = { text, time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) };
    setData((prev) => ({ ...(prev || SEED_DATA), activity: [entry, ...((prev || SEED_DATA).activity || []).slice(0, 49)] }));
  }, [setData]);

  if (!profileReady || !dataReady) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FN }}>
        <Grid3x3 size={28} color={C.a} />
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  const safeData = data || SEED_DATA;
  const userModules = (profile.modules || ["command", "compose", "pipeline", "intel"]).filter((id) => ALL_MODULES[id]);
  const extraMods = userModules.filter((id) => id !== "command").slice(0, 2);
  const visibleTabs = ["command", ...extraMods, "ask", "settings"];

  if (!visibleTabs.includes(activeTab)) {
    setActiveTab("command");
  }

  const askMode = activeTab === "ask";

  function renderTab(tabId) {
    if (tabId === "settings") return <ModSettings profile={profile} setProfile={setProfile} />;
    if (tabId === "ask") return <ModAsk profile={profile} data={safeData} setData={setData} addActivity={addActivity} setProfile={setProfile} />;
    const Renderer = MODULE_RENDERERS[tabId];
    if (Renderer) return <Renderer profile={profile} data={safeData} setData={setData} addActivity={addActivity} />;
    return <ModPlaceholder moduleId={tabId} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FN, color: C.t1, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } } @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } } * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; } input::placeholder, textarea::placeholder { color: ${C.t3}; }`}</style>

      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle, ${C.aG} 0%, transparent 60%)`, pointerEvents: "none" }} />

      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.b1}`, position: "sticky", top: 0, zIndex: 50, background: "rgba(11,11,13,0.92)", backdropFilter: "blur(24px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.a}, #3D6B47)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Grid3x3 size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1 }}>Trellis</div>
            <div style={{ fontSize: 8, color: C.t3, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 1 }}>{profile.org || profile.role || "Personal AI"}</div>
          </div>
        </div>
        <button onClick={() => setActiveTab("settings")} style={{ width: 28, height: 28, borderRadius: "50%", background: C.aS, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.a, fontWeight: 700 }}>
          {profile.name?.charAt(0).toUpperCase() || "U"}
        </button>
      </div>

      <div style={{
        flex: 1,
        padding: askMode ? 0 : "18px 14px 110px",
        maxWidth: askMode ? "100%" : 660,
        width: "100%",
        margin: "0 auto",
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {renderTab(activeTab)}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "4px 6px 20px", background: "rgba(11,11,13,0.94)", backdropFilter: "blur(24px)", borderTop: `1px solid ${C.b1}`, display: "flex", justifyContent: "center", gap: 1, zIndex: 50 }}>
        {visibleTabs.map((tabId) => {
          const isAsk = tabId === "ask";
          const mod = tabId === "settings"
            ? { label: "Settings", Icon: Settings }
            : isAsk
            ? { label: "Ask AI", Icon: Sparkles }
            : ALL_MODULES[tabId];
          if (!mod) return null;
          const isActive = activeTab === tabId;
          return (
            <button key={tabId} onClick={() => setActiveTab(tabId)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: isAsk ? "5px 18px" : "5px 10px",
                borderRadius: 10,
                background: isActive ? C.aS : isAsk ? `${C.a}18` : "transparent",
                border: isAsk ? `1px solid ${C.a}35` : "none",
                cursor: "pointer", minWidth: isAsk ? 62 : 46, fontFamily: FN,
                transition: "all 0.2s",
              }}>
              <mod.Icon size={isAsk ? 17 : 16} color={isActive || isAsk ? C.a : C.t3} strokeWidth={isActive ? 2.2 : isAsk ? 2 : 1.5} />
              <span style={{ fontSize: 8, fontWeight: isActive ? 700 : isAsk ? 600 : 500, color: isActive || isAsk ? C.a : C.t3 }}>{mod.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
