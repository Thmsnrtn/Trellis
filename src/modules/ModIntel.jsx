import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { C, FN } from "../constants/theme";
import { useWorkspace } from "../context/WorkspaceContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Input } from "../components/ui/Input";
import { Section } from "../components/ui/Section";
import { callAI, isAIError } from "../ai/engine";
import { buildSystemPrompt } from "../ai/systemPrompt";
import { TOOL_WEB } from "../ai/config";

export function ModIntel() {
  const { profile, addActivity } = useWorkspace();
  const toast = useToast();
  const systemPrompt = buildSystemPrompt(profile);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function search(q) {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    const r = await callAI(
      [{ role: "user", content: `Research for ${profile.name} (${profile.role}):\n"${searchQuery}"\nActionable intelligence.` }],
      { system: systemPrompt, tools: [TOOL_WEB] }
    );
    if (isAIError(r)) {
      toast("Research failed — try again", "error");
    } else {
      setResult(r);
      addActivity(`Research: "${searchQuery}"`);
      toast("Research complete", "success");
    }
    setLoading(false);
  }

  return (
    <div>
      <Section title="Live Intelligence" sub="Web-powered research">
        <Card style={{ padding: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={13} color={C.t3} style={{ position: "absolute", left: 11, top: 11 }} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Research anything..." style={{ paddingLeft: 32 }} />
            </div>
            <Btn primary onClick={() => search()} loading={loading}><Search size={11} /></Btn>
          </div>
        </Card>
        {result && (
          <Card style={{ marginTop: 12, padding: 14, borderLeft: `3px solid ${C.a}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <Sparkles size={10} color={C.a} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.a }}>Results</span>
            </div>
            <pre style={{ fontSize: 11, color: C.t2, lineHeight: 1.65, fontFamily: FN, whiteSpace: "pre-wrap", margin: 0 }}>{result}</pre>
          </Card>
        )}
      </Section>
    </div>
  );
}
