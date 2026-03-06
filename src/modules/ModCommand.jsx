import { useState } from "react";
import {
  Calendar, Mail, BarChart3, TrendingUp, Flame, RefreshCw,
} from "lucide-react";
import { C, FN } from "../constants/theme";
import { IND } from "../constants/modules";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Btn";
import { Section } from "../components/ui/Section";
import { KPICard } from "../components/ui/KPICard";
import { ScoreRing } from "../components/ui/ScoreRing";
import { callAI } from "../ai/engine";
import { MCP_GMAIL, MCP_GCAL } from "../ai/config";

export function ModCommand({ profile, data, addActivity }) {
  const [calData, setCalData] = useState(null);
  const [calLoading, setCalLoading] = useState(false);
  const [mailData, setMailData] = useState(null);
  const [mailLoading, setMailLoading] = useState(false);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const IndustryIcon = (IND[profile.industry] || IND.other).I;
  const leads = data.leads || [];
  const pipeline = data.pipeline || [];
  const hot = leads.filter((l) => l.status === "hot");
  const pipeTotal = pipeline.reduce((s, d) => s + d.value, 0);
  const pipeForecast = pipeline.reduce((s, d) => s + (d.value * d.prob) / 100, 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <Badge color={C.a} bg={C.aS} Icon={IndustryIcon} small>{profile.org || profile.role || "Professional"}</Badge>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.t1, margin: 0, letterSpacing: -0.5, lineHeight: 1.3 }}>
          {greeting}, {profile.name}.{" "}
          {hot.length > 0 && <><span style={{ color: C.a }}>{hot.length} priorities</span> today.</>}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        <Card style={{ padding: 11 }}><KPICard label="Pipeline" value={`$${(pipeTotal / 1000).toFixed(0)}K`} accent={C.a} Icon={BarChart3} /></Card>
        <Card style={{ padding: 11 }}><KPICard label="Forecast" value={`$${(pipeForecast / 1000).toFixed(0)}K`} accent={C.te} Icon={TrendingUp} /></Card>
        <Card style={{ padding: 11 }}><KPICard label="Hot" value={hot.length} accent={C.r} Icon={Flame} /></Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <Card style={{ padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={12} color={C.bl} /><span style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>Calendar</span></div>
            <Btn small onClick={async () => { setCalLoading(true); setCalData(await callAI([{ role: "user", content: "Today and tomorrow. TIME | TITLE. Concise." }], { system: "Calendar assistant.", mcp: [MCP_GCAL] })); setCalLoading(false); }} loading={calLoading}><RefreshCw size={9} /></Btn>
          </div>
          {calData ? <pre style={{ fontSize: 10, color: C.t2, lineHeight: 1.5, fontFamily: FN, whiteSpace: "pre-wrap", margin: 0, maxHeight: 70, overflow: "auto" }}>{calData}</pre> : <div style={{ fontSize: 10, color: C.t3, textAlign: "center", padding: "6px 0" }}>Tap to sync</div>}
        </Card>
        <Card style={{ padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Mail size={12} color={C.r} /><span style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>Gmail</span></div>
            <Btn small onClick={async () => { setMailLoading(true); setMailData(await callAI([{ role: "user", content: "5 recent unread. FROM | SUBJECT." }], { system: "Email assistant.", mcp: [MCP_GMAIL] })); setMailLoading(false); }} loading={mailLoading}><RefreshCw size={9} /></Btn>
          </div>
          {mailData ? <pre style={{ fontSize: 10, color: C.t2, lineHeight: 1.5, fontFamily: FN, whiteSpace: "pre-wrap", margin: 0, maxHeight: 70, overflow: "auto" }}>{mailData}</pre> : <div style={{ fontSize: 10, color: C.t3, textAlign: "center", padding: "6px 0" }}>Tap to sync</div>}
        </Card>
      </div>

      <Section title="Priority Actions" right={hot.length > 0 && <Badge color={C.r} bg={C.rS} Icon={Flame} small>{hot.length}</Badge>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {hot.sort((a, b) => b.score - a.score).slice(0, 5).map((lead, i) => (
            <Card key={lead.id} hoverable style={{ padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: C.aS, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.a, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{lead.name}</span>
                  <Badge color={C.r} bg={C.rS} Icon={Flame} small>hot</Badge>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.t3 }}>{lead.source}</span>
                  {lead.revenue > 0 && <span style={{ fontSize: 9, color: C.a, fontWeight: 600 }}>${(lead.revenue / 1000).toFixed(0)}K</span>}
                </div>
              </div>
              <ScoreRing score={lead.score} size={34} />
            </Card>
          ))}
        </div>
      </Section>

      {(data.activity || []).length > 0 && (
        <Section title="Activity">
          {(data.activity || []).slice(0, 5).map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "3px 0" }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.a, marginTop: 5, flexShrink: 0 }} />
              <div><div style={{ fontSize: 11, color: C.t2 }}>{a.text}</div><div style={{ fontSize: 9, color: C.t3 }}>{a.time}</div></div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
