import {
  Mail, Calendar, Globe, MessageCircle, BookOpen, Layers,
  Database, Briefcase, CreditCard, CheckCircle, Trash2,
} from "lucide-react";
import { C } from "../constants/theme";
import { ALL_MODULES } from "../constants/modules";
import { sSave } from "../utils/storage";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Input } from "../components/ui/Input";
import { TextArea } from "../components/ui/TextArea";
import { Section } from "../components/ui/Section";

export function ModSettings({ profile, setProfile }) {
  const activeModules = profile.modules || [];

  function toggleModule(id) {
    if (id === "command") return;
    setProfile((prev) => {
      const mods = prev.modules || [];
      return { ...prev, modules: mods.includes(id) ? mods.filter((m) => m !== id) : [...mods, id] };
    });
  }

  return (
    <div>
      <Section title="Feature Library" sub="Add or remove tools from your workspace">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.values(ALL_MODULES).map((mod) => {
            const isActive = activeModules.includes(mod.id);
            const isCore = mod.id === "command";
            return (
              <Card key={mod.id} hoverable={!isCore} onClick={isCore ? undefined : () => toggleModule(mod.id)} selected={isActive} style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: isActive ? C.aS : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <mod.Icon size={18} color={isActive ? C.a : C.t3} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{mod.label}</div>
                    <div style={{ fontSize: 11, color: C.t3 }}>{mod.desc}</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: isActive ? "rgba(107,158,120,0.3)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: 2, cursor: isCore ? "default" : "pointer", transition: "all 0.2s" }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: isActive ? C.a : "rgba(255,255,255,0.15)", transform: isActive ? "translateX(16px)" : "translateX(0)", transition: "all 0.2s" }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="Profile">
        <Card style={{ padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 10, color: C.t3, fontWeight: 600, display: "block", marginBottom: 3 }}>Name</label><Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><label style={{ fontSize: 10, color: C.t3, fontWeight: 600, display: "block", marginBottom: 3 }}>Role</label><Input value={profile.role || ""} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))} /></div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 10, color: C.t3, fontWeight: 600, display: "block", marginBottom: 3 }}>Voice</label>
            <TextArea rows={2} value={profile.voiceDesc || ""} onChange={(e) => setProfile((p) => ({ ...p, voiceDesc: e.target.value }))} />
          </div>
          {(profile.voiceSamples || []).length > 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <CheckCircle size={11} color={C.g} />
              <span style={{ fontSize: 11, color: C.g, fontWeight: 600 }}>{profile.voiceSamples.length} voice samples active</span>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Integrations">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { n: "Gmail", I: Mail, s: "Connected", c: C.g },
            { n: "Calendar", I: Calendar, s: "Connected", c: C.g },
            { n: "Web", I: Globe, s: "Active", c: C.g },
            { n: "LinkedIn", I: Briefcase, s: "Soon", c: C.t3 },
            { n: "Slack", I: MessageCircle, s: "Soon", c: C.t3 },
            { n: "HubSpot", I: Database, s: "Soon", c: C.t3 },
            { n: "Salesforce", I: Layers, s: "Soon", c: C.t3 },
            { n: "Notion", I: BookOpen, s: "Soon", c: C.t3 },
            { n: "Stripe", I: CreditCard, s: "Soon", c: C.t3 },
          ].map((svc, i) => (
            <Card key={i} style={{ padding: 9, textAlign: "center" }}>
              <svc.I size={13} color={svc.c} style={{ marginBottom: 3 }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: C.t1 }}>{svc.n}</div>
              <div style={{ fontSize: 8, color: svc.c, fontWeight: 600, marginTop: 2 }}>{svc.s}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Btn small danger onClick={async () => { await sSave("tr-profile", null); await sSave("tr-data", null); await sSave("tr-chat", null); window.location.reload(); }}>
        <Trash2 size={10} /> Reset Everything
      </Btn>
    </div>
  );
}
