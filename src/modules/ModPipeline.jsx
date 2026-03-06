import { ArrowRight, BarChart3, TrendingUp, Target } from "lucide-react";
import { C } from "../constants/theme";
import { useWorkspace } from "../context/WorkspaceContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Btn } from "../components/ui/Btn";
import { Section } from "../components/ui/Section";
import { KPICard } from "../components/ui/KPICard";

export function ModPipeline() {
  const { data, setData, addActivity } = useWorkspace();
  const toast = useToast();
  const pipeline = data.pipeline || [];
  const total = pipeline.reduce((s, d) => s + d.value, 0);
  const weighted = pipeline.reduce((s, d) => s + (d.value * d.prob) / 100, 0);
  const stages = ["lead", "outreach", "meeting", "tour", "proposal", "negotiation", "contract", "closed"];
  const stageLabels = { lead: "Lead", outreach: "Outreach", meeting: "Meeting", tour: "Tour", proposal: "Proposal", negotiation: "Negotiation", contract: "Contract", closed: "Closed" };
  const stageColors = { lead: C.t3, outreach: C.t3, meeting: C.bl, tour: C.a, proposal: C.te, negotiation: C.p, contract: C.y, closed: C.g };

  function advanceDeal(id) {
    setData((prev) => ({
      ...prev,
      pipeline: (prev.pipeline || []).map((d) => {
        if (d.id !== id) return d;
        const idx = stages.indexOf(d.stage);
        if (idx < stages.length - 1) {
          addActivity(`${d.name} advanced to ${stageLabels[stages[idx + 1]]}`);
          toast(`${d.name} advanced to ${stageLabels[stages[idx + 1]]}`, "success");
          return { ...d, stage: stages[idx + 1], prob: Math.min(d.prob + 12, 95) };
        }
        return d;
      }),
    }));
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        <Card style={{ padding: 11 }}><KPICard label="Pipeline" value={`$${(total / 1000).toFixed(0)}K`} accent={C.a} Icon={BarChart3} /></Card>
        <Card style={{ padding: 11 }}><KPICard label="Weighted" value={`$${(weighted / 1000).toFixed(0)}K`} accent={C.te} Icon={TrendingUp} /></Card>
        <Card style={{ padding: 11 }}><KPICard label="Deals" value={pipeline.length} accent={C.bl} Icon={Target} /></Card>
      </div>
      <Section title="Deals">
        {pipeline.sort((a, b) => b.value - a.value).map((deal) => (
          <Card key={deal.id} hoverable style={{ padding: 13, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{deal.name}</span>
                  <Badge color={stageColors[deal.stage] || C.t3} bg={`${stageColors[deal.stage] || C.t3}18`} small>{stageLabels[deal.stage] || deal.stage}</Badge>
                </div>
                <span style={{ fontSize: 9, color: C.t3 }}>{deal.date}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.a }}>${(deal.value / 1000).toFixed(0)}K</div>
                <div style={{ fontSize: 9, color: C.t3 }}>{deal.prob}%</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {stages.map((s, i) => {
                const idx = stages.indexOf(deal.stage);
                return <div key={s} style={{ flex: 1, height: 2.5, borderRadius: 2, background: i <= idx ? (stageColors[deal.stage] || C.a) : "rgba(255,255,255,0.03)" }} />;
              })}
            </div>
            {deal.stage !== "closed" && (
              <div style={{ marginTop: 8 }}><Btn small primary onClick={() => advanceDeal(deal.id)}><ArrowRight size={9} /> Advance</Btn></div>
            )}
          </Card>
        ))}
      </Section>
    </div>
  );
}
