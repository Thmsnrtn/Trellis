import { useState } from "react";
import {
  Mail, Globe, MessageCircle, Sparkles, CheckCircle, Copy,
  CalendarPlus, PenLine, Flame, Sun, Target, Search,
} from "lucide-react";
import { C, FN } from "../constants/theme";
import { useWorkspace } from "../context/WorkspaceContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Input } from "../components/ui/Input";
import { TextArea } from "../components/ui/TextArea";
import { Section } from "../components/ui/Section";
import { callAI, isAIError } from "../ai/engine";
import { buildSystemPrompt } from "../ai/systemPrompt";
import { MCP_GMAIL, MCP_GCAL } from "../ai/config";

export function ModCompose() {
  const { profile, data, addActivity } = useWorkspace();
  const toast = useToast();
  const systemPrompt = buildSystemPrompt(profile);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [channel, setChannel] = useState("email");
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState({});
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [leadSearch, setLeadSearch] = useState("");

  const allLeads = (data.leads || []).filter((l) => l.status === "hot" || l.status === "warm");
  const activeLeads = leadSearch
    ? allLeads.filter((l) => l.name.toLowerCase().includes(leadSearch.toLowerCase()))
    : allLeads.slice(0, 20);
  const lead = activeLeads[selectedIdx];

  if (!lead && allLeads.length === 0) return <Card style={{ padding: 24, textAlign: "center" }}><Target size={24} color={C.t3} /><div style={{ color: C.t3, marginTop: 8 }}>No active leads.</div></Card>;

  const current = lead ? (messages[lead.id] || { subject: `Reaching out to ${lead.name}`, body: "Tap Generate to write in your voice." }) : { subject: "", body: "" };

  return (
    <div>
      <Section title="Compose" sub={`Writing as ${profile.name}`}>
        <div style={{ display: "flex", gap: 3, marginBottom: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 3, width: "fit-content" }}>
          {[{ id: "email", l: "Email", I: Mail }, { id: "linkedin", l: "LinkedIn", I: Globe }, { id: "text", l: "Text", I: MessageCircle }].map((c) => (
            <button key={c.id} onClick={() => setChannel(c.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: channel === c.id ? C.s1 : "transparent", color: channel === c.id ? C.t1 : C.t3, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: FN, boxShadow: channel === c.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none" }}>
              <c.I size={10} />{c.l}
            </button>
          ))}
        </div>
        {/* Lead search */}
        {allLeads.length > 5 && (
          <div style={{ position: "relative", marginBottom: 8 }}>
            <Search size={11} color={C.t3} style={{ position: "absolute", left: 10, top: 9 }} />
            <input
              value={leadSearch}
              onChange={(e) => { setLeadSearch(e.target.value); setSelectedIdx(0); }}
              placeholder="Search leads..."
              style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: 8, background: C.s2, border: `1px solid ${C.b1}`, color: C.t1, fontSize: 10, outline: "none", fontFamily: FN }}
            />
          </div>
        )}
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 3 }}>
          {activeLeads.map((ld, i) => (
            <button key={ld.id} onClick={() => { setSelectedIdx(i); setEditing(false); setActionResult(null); }} style={{ padding: "7px 10px", borderRadius: 10, border: `1px solid ${selectedIdx === i ? C.a + "40" : C.b1}`, background: selectedIdx === i ? C.aS : C.s1, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", textAlign: "left", minWidth: 100, flexShrink: 0, fontFamily: FN, color: selectedIdx === i ? C.a : C.t3 }}>
              <div style={{ fontSize: 8, color: ld.status === "hot" ? C.r : C.w, display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
                {ld.status === "hot" ? <Flame size={7} /> : <Sun size={7} />}{ld.status}
              </div>
              <div style={{ color: selectedIdx === i ? C.t1 : C.t2 }}>{ld.name.length > 15 ? ld.name.slice(0, 15) + "\u2026" : ld.name}</div>
            </button>
          ))}
        </div>
      </Section>

      {lead && (
        <>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.b1}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, color: C.t3, fontWeight: 600, marginBottom: 2 }}>TO: {lead.name}{lead.email ? ` <${lead.email}>` : ""}</div>
                {channel === "email" && <div style={{ fontSize: 13, color: C.t1, fontWeight: 600 }}>{current.subject}</div>}
              </div>
            </div>
            <div style={{ padding: "14px 16px", minHeight: 170 }}>
              {generating ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 150, gap: 8 }}>
                  <Sparkles size={20} color={C.a} style={{ animation: "pulse 1.5s ease infinite" }} />
                  <div style={{ fontSize: 12, color: C.t2 }}>Writing as {profile.name}...</div>
                </div>
              ) : editing ? (
                <div>
                  {channel === "email" && <Input value={current.subject} onChange={(e) => setMessages((p) => ({ ...p, [lead.id]: { ...current, subject: e.target.value } }))} style={{ marginBottom: 8 }} />}
                  <TextArea value={current.body} onChange={(e) => setMessages((p) => ({ ...p, [lead.id]: { ...current, body: e.target.value } }))} rows={7} />
                </div>
              ) : (
                <pre style={{ fontSize: 12, color: C.t2, lineHeight: 1.7, fontFamily: FN, whiteSpace: "pre-wrap", margin: 0 }}>{current.body}</pre>
              )}
            </div>
            <div style={{ padding: "9px 16px", borderTop: `1px solid ${C.b1}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Btn primary small loading={generating} onClick={async () => {
                setGenerating(true); setActionResult(null);
                const r = await callAI([{ role: "user", content: `Write a ${channel} AS ${profile.name} to ${lead.name}.\nDetails: ${lead.detail}\n${channel === "email" ? "Start with Subject: [line]" : "Keep short."}\nMy voice.` }], { system: systemPrompt });
                if (isAIError(r)) { toast("Failed to generate — try again", "error"); setGenerating(false); return; }
                const match = r.match(/^Subject:\s*(.+)/m);
                setMessages((p) => ({ ...p, [lead.id]: { subject: match ? match[1].trim() : "Follow up", body: match ? r.replace(/^Subject:\s*.+\n*/m, "").trim() : r.trim() } }));
                addActivity(`Drafted ${channel}: ${lead.name}`);
                toast(`${channel} drafted for ${lead.name}`, "success");
                setGenerating(false);
              }}><Sparkles size={10} /> Generate</Btn>
              <Btn small onClick={async () => {
                setActionResult(null);
                const r = await callAI([{ role: "user", content: `Create Gmail draft${lead.email ? ` to ${lead.email}` : ""} subject "${current.subject}" body:\n${current.body}` }], { system: "Create draft.", mcp: [MCP_GMAIL] });
                if (isAIError(r)) { toast("Failed to create draft", "error"); return; }
                setActionResult(r || "Draft created."); addActivity(`Gmail: ${lead.name}`);
                toast("Gmail draft created", "success");
              }}><Mail size={10} /> Gmail</Btn>
              <Btn small onClick={async () => {
                const r = await callAI([{ role: "user", content: `Calendar event: "Meeting - ${lead.name}" next weekday 2 PM, 1hr.` }], { system: "Schedule.", mcp: [MCP_GCAL] });
                if (isAIError(r)) { toast("Failed to schedule", "error"); return; }
                setActionResult(r || "Scheduled."); addActivity(`Meeting: ${lead.name}`);
                toast("Meeting scheduled", "success");
              }}><CalendarPlus size={10} /> Schedule</Btn>
              <Btn small onClick={() => setEditing(!editing)}><PenLine size={10} /> {editing ? "Preview" : "Edit"}</Btn>
              <Btn small onClick={() => { navigator.clipboard.writeText(current.body); setCopied(true); setTimeout(() => setCopied(false), 2000); toast("Copied to clipboard", "success"); }}>
                {copied ? <CheckCircle size={10} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
              </Btn>
            </div>
          </Card>
          {actionResult && <Card style={{ marginTop: 10, padding: 10, borderLeft: `3px solid ${C.g}` }}><div style={{ fontSize: 11, color: C.t2, display: "flex", alignItems: "flex-start", gap: 6 }}><CheckCircle size={12} color={C.g} style={{ marginTop: 1, flexShrink: 0 }} />{actionResult}</div></Card>}
        </>
      )}
    </div>
  );
}
