import { useState, useEffect, useRef, useCallback } from "react";
import {
Grid3x3, ArrowRight, Mail, Calendar, Search, Sparkles, CheckCircle,
User, Briefcase, Building2, ChevronRight, X, Loader, Shield,
Sun, Target, PenLine, BarChart3, Radar, Send, Heart,
Flag, Wine, UserPlus, Phone, ChevronDown, Zap, TrendingUp,
DollarSign, Clock, MapPin, Users, Award, Flame, Globe,
Inbox, CalendarPlus, Trash2, Save, FileText, Coffee, CreditCard,
Receipt, LayoutGrid, Utensils, Music, Star, Mic, Settings,
Plus, Copy, RefreshCw, ArrowUpRight, Eye, Activity, Plug,
Camera, MessageCircle, BookOpen, Layers,
Link2, Circle, Lock, Home, Scale,
Stethoscope, GraduationCap, Palette, Megaphone, ShoppingBag,
Hammer, Cpu, Landmark, Database, Map, Timer, FileSpreadsheet,
Kanban
} from "lucide-react";
import {
AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
PieChart, Pie, Cell
} from "recharts";

/*
- ═══════════════════════════════════════════════════════
- TRELLIS — Adaptive AI Professional Operating System
- ═══════════════════════════════════════════════════════
*/

// ── Design Tokens ──────────────────────────────────────
const C = {
bg: "#0B0B0D",
s1: "#131416",
s2: "#1A1A1D",
s3: "#222225",
b1: "rgba(255,255,255,0.055)",
b2: "rgba(255,255,255,0.1)",
t1: "#EDEAE7",
t2: "#939398",
t3: "#535358",
a: "#6B9E78",
aS: "rgba(107,158,120,0.13)",
aG: "rgba(107,158,120,0.06)",
g: "#55B360",
gS: "rgba(85,179,96,0.13)",
r: "#D45252",
rS: "rgba(212,82,82,0.13)",
bl: "#6283B2",
blS: "rgba(98,131,178,0.13)",
p: "#8E72B5",
pS: "rgba(142,114,181,0.13)",
ro: "#B87890",
roS: "rgba(184,120,144,0.13)",
te: "#5A9C8E",
teS: "rgba(90,156,142,0.13)",
y: "#C2AD50",
yS: "rgba(194,173,80,0.13)",
w: "#B5895E",
wS: "rgba(181,137,94,0.13)",
};

const FN = "'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif";

// ── Industry Map ───────────────────────────────────────
const IND = {
hospitality: { l: "Hospitality", I: Coffee },
realestate: { l: "Real Estate", I: Home },
healthcare: { l: "Healthcare", I: Stethoscope },
legal: { l: "Legal", I: Scale },
education: { l: "Education", I: GraduationCap },
creative: { l: "Creative", I: Palette },
marketing: { l: "Marketing", I: Megaphone },
retail: { l: "Retail", I: ShoppingBag },
construction: { l: "Construction", I: Hammer },
technology: { l: "Technology", I: Cpu },
finance: { l: "Finance", I: Landmark },
consulting: { l: "Consulting", I: Briefcase },
other: { l: "Other", I: Layers },
};

// ── Module Catalog ─────────────────────────────────────
const ALL_MODULES = {
command: { id: "command", label: "Command", Icon: Sun, desc: "Daily briefing, KPIs, calendar and email sync" },
compose: { id: "compose", label: "Compose", Icon: PenLine, desc: "AI-powered outreach in your voice" },
pipeline: { id: "pipeline", label: "Pipeline", Icon: BarChart3, desc: "Deal tracking, stages, revenue forecasting" },
leads: { id: "leads", label: "Leads", Icon: Target, desc: "Lead scoring, CRM, prospect management" },
events: { id: "events", label: "Events", Icon: Calendar, desc: "Event management, BEOs, proposals, contracts" },
intel: { id: "intel", label: "Intel", Icon: Radar, desc: "Web-powered research and competitive analysis" },
maps: { id: "maps", label: "Maps", Icon: Map, desc: "Interactive mapping, property pins, route planning" },
invoicing: { id: "invoicing", label: "Invoicing", Icon: Receipt, desc: "Create, send, and track invoices" },
projects: { id: "projects", label: "Projects", Icon: Kanban, desc: "Task boards, timelines, deliverable tracking" },
timetrack: { id: "timetrack", label: "Time", Icon: Timer, desc: "Time tracking, billable hours, utilization" },
listings: { id: "listings", label: "Listings", Icon: Home, desc: "Property listings, comparables, market data" },
cases: { id: "cases", label: "Cases", Icon: FileText, desc: "Case management, filings, deadlines" },
patients: { id: "patients", label: "Patients", Icon: Stethoscope, desc: "Patient scheduling, notes, follow-ups" },
content: { id: "content", label: "Content", Icon: Palette, desc: "Content calendar, briefs, asset management" },
campaigns: { id: "campaigns", label: "Campaigns", Icon: Megaphone, desc: "Campaign tracking, analytics, A/B testing" },
};

const PROFESSION_MODULES = {
hospitality: ["command", "compose", "pipeline", "events", "intel"],
realestate: ["command", "compose", "pipeline", "maps", "listings", "intel"],
healthcare: ["command", "compose", "patients", "intel", "invoicing"],
legal: ["command", "compose", "cases", "timetrack", "intel", "invoicing"],
consulting: ["command", "compose", "projects", "timetrack", "pipeline", "intel"],
creative: ["command", "compose", "content", "projects", "invoicing", "intel"],
marketing: ["command", "compose", "campaigns", "pipeline", "intel", "content"],
finance: ["command", "compose", "pipeline", "invoicing", "intel"],
technology: ["command", "compose", "projects", "pipeline", "intel"],
construction: ["command", "compose", "projects", "timetrack", "invoicing", "intel"],
retail: ["command", "compose", "pipeline", "invoicing", "intel"],
education: ["command", "compose", "projects", "intel"],
other: ["command", "compose", "pipeline", "intel"],
};

// ── Persistent Storage ─────────────────────────────────
async function sLoad(key, fallback) {
try {
const r = await window.storage.get(key);
return r ? JSON.parse(r.value) : fallback;
} catch {
return fallback;
}
}

async function sSave(key, data) {
try {
await window.storage.set(key, JSON.stringify(data));
} catch (e) {
console.error("Storage error:", e);
}
}

function usePersistedState(key, fallback) {
const [val, setVal] = useState(undefined);
const [ready, setReady] = useState(false);

useEffect(() => {
sLoad(key, fallback).then((d) => {
setVal(d);
setReady(true);
});
}, []);

const update = useCallback(
(fn) => {
setVal((prev) => {
const next = typeof fn === "function" ? fn(prev) : fn;
sSave(key, next);
return next;
});
},
[key]
);

return [val, update, ready];
}

// ── AI Engine ──────────────────────────────────────────
const MCP_GMAIL = { type: "url", url: "https://gmail.mcp.claude.com/mcp", name: "gmail" };
const MCP_GCAL = { type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "gcal" };
const TOOL_WEB = { type: "web_search_20250305", name: "web_search" };

// ── Local Agent Tools ─────────────────────────────────
const LOCAL_TOOLS = [
{
name: "search_workspace",
description: "Search the user's workspace data. Use this FIRST to find lead IDs, deal IDs, or specific data before modifying anything.",
input_schema: {
  type: "object",
  properties: {
    query: { type: "string", description: "Search term — matches names, sources, stages, details, status" },
    type: { type: "string", enum: ["leads", "pipeline", "activity", "all"], description: "What to search. Default: all" },
  },
  required: ["query"],
},
},
{
name: "update_lead",
description: "Update a lead's status, score, or details. Use after researching or interacting with a lead.",
input_schema: {
  type: "object",
  properties: {
    lead_id: { type: "string", description: "Lead ID (e.g. 'l1')" },
    status: { type: "string", enum: ["hot", "warm", "cold"], description: "New status" },
    score: { type: "number", description: "New score 0-100" },
    detail: { type: "string", description: "Updated notes/details" },
  },
  required: ["lead_id"],
},
},
{
name: "update_deal",
description: "Update a pipeline deal — advance stage, change probability, or modify value.",
input_schema: {
  type: "object",
  properties: {
    deal_id: { type: "string", description: "Deal ID (e.g. 'p1')" },
    stage: { type: "string", enum: ["lead", "outreach", "meeting", "tour", "proposal", "negotiation", "contract", "closed"], description: "New stage" },
    prob: { type: "number", description: "New probability 0-100" },
    value: { type: "number", description: "New value in dollars" },
  },
  required: ["deal_id"],
},
},
{
name: "add_lead",
description: "Create a new lead in the workspace from research or discovery.",
input_schema: {
  type: "object",
  properties: {
    name: { type: "string" }, source: { type: "string" }, detail: { type: "string" },
    score: { type: "number", description: "Initial score 0-100" },
    status: { type: "string", enum: ["hot", "warm", "cold"] },
    revenue: { type: "number" }, email: { type: "string" },
  },
  required: ["name", "source", "detail"],
},
},
{
name: "add_deal",
description: "Add a new deal to the pipeline when a lead becomes a concrete opportunity.",
input_schema: {
  type: "object",
  properties: {
    name: { type: "string" }, value: { type: "number" },
    stage: { type: "string", enum: ["lead", "outreach", "meeting", "tour", "proposal", "negotiation", "contract", "closed"] },
    prob: { type: "number" }, date: { type: "string" },
  },
  required: ["name", "value", "stage"],
},
},
{
name: "log_activity",
description: "Record an action in the activity feed. Use after completing any significant action.",
input_schema: {
  type: "object",
  properties: { text: { type: "string", description: "What happened" } },
  required: ["text"],
},
},
{
name: "modify_workspace",
description: "Enable or disable a module in the user's workspace.",
input_schema: {
  type: "object",
  properties: {
    action: { type: "string", enum: ["add", "remove"] },
    module_id: { type: "string", description: "Module ID", enum: Object.keys(ALL_MODULES) },
  },
  required: ["action", "module_id"],
},
},
];

function executeLocalTool(name, input, data, setData, addActivity, profile, setProfile) {
switch (name) {
case "search_workspace": {
  const q = (input.query || "").toLowerCase();
  const t = input.type || "all";
  const res = {};
  if (t === "all" || t === "leads") {
    res.leads = (data.leads || []).filter((l) =>
      l.name.toLowerCase().includes(q) || l.source.toLowerCase().includes(q) ||
      (l.detail || "").toLowerCase().includes(q) || l.status.includes(q) || l.id.includes(q)
    );
  }
  if (t === "all" || t === "pipeline") {
    res.pipeline = (data.pipeline || []).filter((d) =>
      d.name.toLowerCase().includes(q) || d.stage.includes(q) || d.id.includes(q)
    );
  }
  if (t === "all" || t === "activity") {
    res.activity = (data.activity || []).filter((a) => a.text.toLowerCase().includes(q)).slice(0, 10);
  }
  return JSON.stringify(res, null, 2);
}
case "update_lead": {
  const { lead_id, ...updates } = input;
  let found = null;
  setData((prev) => ({
    ...prev,
    leads: (prev.leads || []).map((l) => {
      if (l.id === lead_id) { found = { ...l, ...updates }; return found; }
      return l;
    }),
  }));
  return found ? `Updated lead "${found.name}": ${JSON.stringify(updates)}` : `Lead ${lead_id} not found.`;
}
case "update_deal": {
  const { deal_id, ...updates } = input;
  let found = null;
  setData((prev) => ({
    ...prev,
    pipeline: (prev.pipeline || []).map((d) => {
      if (d.id === deal_id) { found = { ...d, ...updates }; return found; }
      return d;
    }),
  }));
  if (found) addActivity(`Deal updated: ${found.name}`);
  return found ? `Updated deal "${found.name}": ${JSON.stringify(updates)}` : `Deal ${deal_id} not found.`;
}
case "add_lead": {
  const id = `l${Date.now()}`;
  const lead = { id, name: input.name, source: input.source, detail: input.detail, score: input.score || 50, status: input.status || "warm", revenue: input.revenue || 0, email: input.email || "" };
  setData((prev) => ({ ...prev, leads: [...(prev.leads || []), lead] }));
  addActivity(`New lead: ${lead.name}`);
  return `Created lead "${lead.name}" (ID: ${id}, source: ${lead.source})`;
}
case "add_deal": {
  const id = `p${Date.now()}`;
  const deal = { id, name: input.name, value: input.value, stage: input.stage, prob: input.prob || 30, date: input.date || "TBD" };
  setData((prev) => ({ ...prev, pipeline: [...(prev.pipeline || []), deal] }));
  addActivity(`New deal: ${deal.name} ($${deal.value})`);
  return `Created deal "${deal.name}" ($${deal.value}, ${deal.stage}, ID: ${id})`;
}
case "log_activity": {
  addActivity(input.text);
  return `Logged activity: "${input.text}"`;
}
case "modify_workspace": {
  const { action, module_id } = input;
  const mod = ALL_MODULES[module_id];
  if (!mod) return `Unknown module: ${module_id}`;
  if (action === "add") {
    setProfile((p) => ({ ...p, modules: [...new Set([...(p.modules || []), module_id])] }));
    return `Added "${mod.label}" to workspace.`;
  } else {
    if (module_id === "command") return "Cannot remove the Command module.";
    setProfile((p) => ({ ...p, modules: (p.modules || []).filter((m) => m !== module_id) }));
    return `Removed "${mod.label}" from workspace.`;
  }
}
default:
  return `Unknown tool: ${name}`;
}
}

async function callAI(messages, opts = {}) {
try {
const body = { model: "claude-sonnet-4-20250514", max_tokens: 1024, messages };
if (opts.system) body.system = opts.system;
if (opts.tools) body.tools = opts.tools;
if (opts.mcp) body.mcp_servers = opts.mcp;

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const data = await res.json();
return (data.content || [])
  .filter((b) => b.type === "text")
  .map((b) => b.text)
  .join("\n") || "";
} catch (e) {
console.error("AI error:", e);
return "";
}
}

// ── Streaming Agentic Engine ──────────────────────────
// Streams one API turn, returns { content: [...blocks], stopReason, text }
async function streamOneTurn(messages, opts = {}, onText, onToolSignal) {
const body = { model: "claude-sonnet-4-20250514", max_tokens: 4096, messages, stream: true };
if (opts.system) body.system = opts.system;
if (opts.tools) body.tools = opts.tools;
if (opts.mcp) body.mcp_servers = opts.mcp;
if (opts.thinking) body.thinking = opts.thinking;

const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
});

if (!res.ok || !res.body) {
const err = await res.json().catch(() => ({}));
throw new Error(err.error?.message || `HTTP ${res.status}`);
}

const reader = res.body.getReader();
const decoder = new TextDecoder();
const contentBlocks = [];
let idx = -1, curType = null, jsonBuf = "", textAccum = "", stopReason = "end_turn";

while (true) {
const { done, value } = await reader.read();
if (done) break;
for (const line of decoder.decode(value, { stream: true }).split("\n")) {
  if (!line.startsWith("data: ")) continue;
  const raw = line.slice(6).trim();
  if (!raw || raw === "[DONE]") continue;
  try {
    const e = JSON.parse(raw);
    if (e.type === "content_block_start") {
      idx++;
      const b = e.content_block;
      curType = b.type;
      if (b.type === "text") contentBlocks.push({ type: "text", text: "" });
      else if (b.type === "tool_use") {
        contentBlocks.push({ type: "tool_use", id: b.id, name: b.name, input: {} });
        jsonBuf = "";
        if (onToolSignal) onToolSignal(b.name, "start");
      }
      else if (b.type === "thinking") contentBlocks.push({ type: "thinking", thinking: "" });
    }
    if (e.type === "content_block_delta") {
      if (e.delta.type === "text_delta") {
        textAccum += e.delta.text;
        contentBlocks[idx].text += e.delta.text;
        if (onText) onText(textAccum);
      } else if (e.delta.type === "input_json_delta") {
        jsonBuf += e.delta.partial_json;
      } else if (e.delta.type === "thinking_delta") {
        contentBlocks[idx].thinking += e.delta.thinking;
      }
    }
    if (e.type === "content_block_stop") {
      if (curType === "tool_use" && jsonBuf) {
        try { contentBlocks[idx].input = JSON.parse(jsonBuf); } catch {}
      }
      if (curType === "tool_use" && onToolSignal) onToolSignal(contentBlocks[idx].name, "done");
      curType = null;
    }
    if (e.type === "message_delta") {
      stopReason = e.delta?.stop_reason || stopReason;
    }
  } catch {}
}
}
return { content: contentBlocks, stopReason, text: textAccum };
}

// Full agentic loop — streams text, executes local tools, loops until done
async function runAgent(initialMessages, opts, callbacks) {
// callbacks: { onText(accum), onToolStart(name, input), onToolDone(name, result), onServerTool(name), onError(err) }
let messages = [...initialMessages];
let fullText = "";
let iterations = 0;

while (iterations < 8) {
const turn = await streamOneTurn(
  messages, opts,
  (text) => { fullText = text; if (callbacks.onText) callbacks.onText(text); },
  (toolName, phase) => {
    if (phase === "start") {
      // Check if it's a server-side tool (MCP/web) vs local
      const isServer = toolName === "web_search" || toolName.includes("gmail") || toolName.includes("gcal") || toolName.includes("calendar");
      if (isServer && callbacks.onServerTool) callbacks.onServerTool(toolName);
    }
  }
);

messages.push({ role: "assistant", content: turn.content });

if (turn.stopReason !== "tool_use") break;

// Execute local tools
const toolUseBlocks = turn.content.filter((b) => b.type === "tool_use");
const toolResults = [];

for (const block of toolUseBlocks) {
  if (callbacks.onToolStart) callbacks.onToolStart(block.name, block.input);
  const result = callbacks.executeTool(block.name, block.input);
  if (callbacks.onToolDone) callbacks.onToolDone(block.name, result);
  toolResults.push({ type: "tool_result", tool_use_id: block.id, content: typeof result === "string" ? result : JSON.stringify(result) });
}

messages.push({ role: "user", content: toolResults });
iterations++;
}
return fullText;
}

function buildSystemPrompt(profile) {
if (!profile) return "You are a helpful AI assistant.";
const voiceBlock =
(profile.voiceSamples || []).length > 0
? `\nVOICE SAMPLES (mirror this exactly):\n${profile.voiceSamples.map((s, i) => `[${i + 1}] "${s.slice(0, 400)}"`).join("\n")}`
: "";
return `You are the personal AI for ${profile.name}.
ROLE: ${profile.role || "Professional"} | INDUSTRY: ${profile.industry || "General"} | ORG: ${profile.org || ""}
ABOUT: ${profile.about || ""}
WORK CONTEXT: ${profile.workContext || ""}
VOICE: ${profile.voiceDesc || "Professional, warm, direct"}${voiceBlock}
GOALS: ${profile.goals || ""}

RULES:
1. Write AS ${profile.name} when drafting. First person. Their voice. Their style.
2. Reference specific professional context naturally.
3. Be concise, actionable, high-quality.
4. Adapt tone to situation. Formal for proposals, casual for teammates.
5. Never generic. Every output should feel personally crafted.`;
}

// ── UI Primitives ──────────────────────────────────────
function Card({ children, style, onClick, hoverable, glow, selected }) {
const [hovered, setHovered] = useState(false);
return (
<div
onClick={onClick}
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}
style={{
background: selected
? "rgba(107,158,120,0.07)"
: hovered && hoverable
? C.s2
: C.s1,
borderRadius: 14,
border: `1px solid ${ selected ? "rgba(107,158,120,0.2)" : hovered && hoverable ? C.b2 : C.b1 }`,
padding: 16,
transition: "all 0.2s ease",
cursor: onClick ? "pointer" : "default",
transform: hovered && hoverable ? "translateY(-1px)" : "none",
boxShadow: glow ? `0 0 30px ${C.aG}` : "none",
...style,
}}
>
{children}
</div>
);
}

function Badge({ children, color, bg, Icon, small }) {
return (
<span
style={{
display: "inline-flex",
alignItems: "center",
gap: 3,
padding: small ? "2px 7px" : "3px 10px",
borderRadius: 20,
fontSize: small ? 9 : 10,
fontWeight: 600,
color,
background: bg,
}}
>
{Icon && <Icon size={small ? 8 : 9} />}
{children}
</span>
);
}

// ── Markdown Renderer ─────────────────────────────────
function processInline(text) {
const parts = [];
let rem = text;
let k = 0;
const rx = /(\*\*(.+?)\*\*|`([^`]+)`)/;
while (rem) {
const m = rem.match(rx);
if (!m) { parts.push(rem); break; }
if (m.index > 0) parts.push(rem.slice(0, m.index));
if (m[2]) parts.push(<strong key={k++} style={{ color: C.t1, fontWeight: 600 }}>{m[2]}</strong>);
else if (m[3]) parts.push(<code key={k++} style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, fontSize: "0.9em" }}>{m[3]}</code>);
rem = rem.slice(m.index + m[0].length);
}
return parts;
}

function MarkdownText({ text }) {
if (!text) return null;
const codeBlockRx = /(```[\s\S]*?```)/g;
const segments = text.split(codeBlockRx);

return (
<div style={{ fontSize: 13, lineHeight: 1.72, color: C.t2 }}>
  {segments.map((seg, si) => {
    if (seg.startsWith("```")) {
      const lines = seg.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, lines[lines.length - 1] === "```" ? -1 : lines.length).join("\n").replace(/```$/, "");
      return (
        <pre key={si} style={{ background: "rgba(0,0,0,0.35)", padding: "10px 14px", borderRadius: 10, fontSize: 11, lineHeight: 1.55, overflowX: "auto", margin: "8px 0", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", border: `1px solid ${C.b1}` }}>
          {lang && <div style={{ fontSize: 9, color: C.t3, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{lang}</div>}
          <code style={{ color: C.t2 }}>{code}</code>
        </pre>
      );
    }
    return seg.split("\n").map((line, li) => {
      const key = `${si}-${li}`;
      if (line.startsWith("### ")) return <div key={key} style={{ fontSize: 13, fontWeight: 700, color: C.t1, margin: "10px 0 3px" }}>{processInline(line.slice(4))}</div>;
      if (line.startsWith("## ")) return <div key={key} style={{ fontSize: 14, fontWeight: 700, color: C.t1, margin: "12px 0 3px" }}>{processInline(line.slice(3))}</div>;
      if (line.startsWith("# ")) return <div key={key} style={{ fontSize: 15, fontWeight: 700, color: C.t1, margin: "14px 0 4px" }}>{processInline(line.slice(2))}</div>;
      if (/^[-*] /.test(line)) return <div key={key} style={{ paddingLeft: 10, display: "flex", gap: 6 }}><span style={{ color: C.t3, flexShrink: 0 }}>•</span><span>{processInline(line.slice(2))}</span></div>;
      if (/^\d+\.\s/.test(line)) { const m = line.match(/^(\d+)\.\s(.+)/); return <div key={key} style={{ paddingLeft: 10, display: "flex", gap: 6 }}><span style={{ color: C.t3, flexShrink: 0 }}>{m[1]}.</span><span>{processInline(m[2])}</span></div>; }
      if (!line.trim()) return <div key={key} style={{ height: 6 }} />;
      return <div key={key}>{processInline(line)}</div>;
    });
  })}
</div>
);
}

function ScoreRing({ score, size = 36 }) {
const color = score >= 85 ? C.g : score >= 70 ? C.a : C.t3;
const circumference = 2 * Math.PI * 14;
const offset = circumference - (score / 100) * circumference;
return (
<div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
<svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
<circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
<circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="2.5"
strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
style={{ transition: "all 0.6s" }} />
</svg>
<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color }}>
{score}
</div>
</div>
);
}

function KPICard({ label, value, sub, accent, Icon }) {
return (
<div>
<div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
{Icon && <Icon size={10} color={C.t3} />}
<span style={{ fontSize: 9, color: C.t3, fontWeight: 600, letterSpacing: 0.7, textTransform: "uppercase" }}>{label}</span>
</div>
<div style={{ fontSize: 22, fontWeight: 700, color: accent || C.t1, letterSpacing: -0.7, lineHeight: 1 }}>{value}</div>
{sub && <div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{sub}</div>}
</div>
);
}

function Section({ title, sub, right, children }) {
return (
<div style={{ marginBottom: 24 }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
<div>
<h2 style={{ fontSize: 15, fontWeight: 700, color: C.t1, margin: 0, letterSpacing: -0.2 }}>{title}</h2>
{sub && <p style={{ fontSize: 10, color: C.t3, margin: "2px 0 0" }}>{sub}</p>}
</div>
{right}
</div>
{children}
</div>
);
}

function Btn({ children, primary, small, loading, disabled, onClick, danger, ghost, style: extraStyle }) {
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

function Input(props) {
return (
<input
{...props}
style={{
padding: "10px 14px", borderRadius: 10, background: C.s2,
border: `1px solid ${C.b1}`, color: C.t1, fontSize: 13,
outline: "none", fontFamily: FN, width: "100%",
...(props.style || {}),
}}
/>
);
}

function TextArea(props) {
return (
<textarea
{...props}
style={{
padding: "10px 14px", borderRadius: 10, background: C.s2,
border: `1px solid ${C.b1}`, color: C.t1, fontSize: 13,
outline: "none", fontFamily: FN, width: "100%",
resize: "vertical", lineHeight: 1.6,
...(props.style || {}),
}}
/>
);
}

function PrivacyNote({ text }) {
return (
<div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(85,179,96,0.06)", border: "1px solid rgba(85,179,96,0.1)", marginTop: 10 }}>
<Shield size={12} color={C.g} style={{ flexShrink: 0, marginTop: 1 }} />
<span style={{ fontSize: 10, color: C.g, lineHeight: 1.4 }}>{text}</span>
</div>
);
}

// ── ONBOARDING ─────────────────────────────────────────
function Onboarding({ onComplete }) {
const [step, setStep] = useState(0);
const [name, setName] = useState("");
const [path, setPath] = useState(null);

const [manual, setManual] = useState({
role: "", industry: "other", org: "", about: "",
voiceDesc: "Professional, warm, and direct. I use specific details and personal touches.",
goals: "", workStyle: "office", trackMethod: "pipeline", timeSink: "email",
});

const [gmailScanning, setGmailScanning] = useState(false);
const [gmailDone, setGmailDone] = useState(false);
const [gmailPhase, setGmailPhase] = useState(0);

const [calScanning, setCalScanning] = useState(false);
const [calDone, setCalDone] = useState(false);

const [discovered, setDiscovered] = useState({});

const [building, setBuilding] = useState(false);
const [buildPhase, setBuildPhase] = useState(0);

async function scanGmail() {
setGmailScanning(true);
setGmailPhase(0);
const timer = setInterval(() => setGmailPhase((p) => Math.min(p + 1, 5)), 2200);
try {
const result = await callAI(
[{
role: "user",
content: `Analyze my sent emails to build a professional profile. Search sent mail for recent professional emails. Return ONLY valid JSON (no markdown, no backticks): {"role":"job title","industry":"one of: hospitality,realestate,healthcare,legal,education,creative,marketing,retail,construction,technology,finance,consulting,other","org":"company name","about":"2-3 sentence summary","voiceDesc":"writing style description","voiceSamples":["excerpt1 max 300 chars","excerpt2","excerpt3"],"workContext":"communication patterns","goals":"inferred goals"}`,
}],
{ system: "Analyze emails. Return ONLY valid JSON.", mcp: [MCP_GMAIL] }
);
clearInterval(timer);
setGmailPhase(5);
try {
const parsed = JSON.parse(result.replace(/`json|`/g, "").trim());
setDiscovered((prev) => ({ ...prev, ...parsed }));
} catch {
setDiscovered((prev) => ({ ...prev, about: result.slice(0, 300) }));
}
setGmailDone(true);
} catch {
clearInterval(timer);
setGmailDone(true);
}
setGmailScanning(false);
}

async function scanCalendar() {
setCalScanning(true);
try {
const result = await callAI(
[{
role: "user",
content: `Analyze my calendar events from the past 2 weeks. Return ONLY valid JSON: {"calInsights":"meeting types, frequency, patterns","workStyle":"office or remote or hybrid"}`,
}],
{ system: "Analyze calendar. Return ONLY valid JSON.", mcp: [MCP_GCAL] }
);
try {
const parsed = JSON.parse(result.replace(/`json|`/g, "").trim());
setDiscovered((prev) => ({ ...prev, ...parsed }));
} catch {
setDiscovered((prev) => ({ ...prev, calInsights: result.slice(0, 200) }));
}
setCalDone(true);
} catch {
setCalDone(true);
}
setCalScanning(false);
}

function finishOnboarding() {
setBuilding(true);
setBuildPhase(0);
const timer = setInterval(() => setBuildPhase((p) => Math.min(p + 1, 4)), 1500);

const profileData =
  path === "tell"
    ? {
        name, role: manual.role, industry: manual.industry, org: manual.org,
        about: manual.about, voiceDesc: manual.voiceDesc, goals: manual.goals,
        voiceSamples: [],
        workContext: `Works ${manual.workStyle}. Tracks via ${manual.trackMethod}. Time sink: ${manual.timeSink}.`,
      }
    : {
        name, ...discovered,
        voiceSamples: discovered.voiceSamples || [],
        workContext: discovered.workContext || "",
      };

const industry = profileData.industry || "other";
const modules = PROFESSION_MODULES[industry] || PROFESSION_MODULES.other;

setTimeout(() => {
  clearInterval(timer);
  onComplete({ ...profileData, modules });
}, 7500);
}

const scanPhases = [
{ label: "Connecting securely", Icon: Lock },
{ label: "Scanning sent emails", Icon: Mail },
{ label: "Detecting your role", Icon: Briefcase },
{ label: "Analyzing writing style", Icon: PenLine },
{ label: "Mapping your network", Icon: Users },
{ label: "Profile complete", Icon: CheckCircle },
];

const buildSteps = [
"Analyzing your profession",
"Selecting your tools",
"Configuring your workspace",
"Tuning your AI assistant",
"Almost ready",
];

if (building) {
return (
<div style={{ minHeight: "100vh", background: C.bg, fontFamily: FN, color: C.t1 }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'); @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.45s ease forwards}`}</style>
<div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle,${C.aG} 0%,transparent 60%)`, pointerEvents: "none" }} />
<div className="fu" style={{ textAlign: "center", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 520, margin: "0 auto" }}>
<div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${C.a},#3D6B47)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, boxShadow: `0 8px 32px ${C.aG}` }}>
<Grid3x3 size={32} color="#fff" />
</div>
<h2 style={{ fontSize: 24, fontWeight: 700, color: C.t1, margin: "0 0 8px" }}>Building your Trellis</h2>
<p style={{ fontSize: 13, color: C.t3, marginBottom: 32 }}>Customizing your workspace based on how you work</p>
<div style={{ width: "100%", maxWidth: 280 }}>
{buildSteps.map((s, i) => (
<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", opacity: i <= buildPhase ? 1 : 0.2, transition: "opacity 0.4s" }}>
<div style={{ width: 22, height: 22, borderRadius: 7, background: i < buildPhase ? C.gS : i === buildPhase ? C.aS : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
{i < buildPhase ? <CheckCircle size={11} color={C.g} /> : i === buildPhase ? <Loader size={11} color={C.a} style={{ animation: "spin 1s linear infinite" }} /> : <Circle size={11} color={C.t3} />}
</div>
<span style={{ fontSize: 12, color: i <= buildPhase ? C.t1 : C.t3, fontWeight: i === buildPhase ? 600 : 400 }}>{s}</span>
</div>
))}
</div>
</div>
</div>
);
}

return (
<div style={{ minHeight: "100vh", background: C.bg, fontFamily: FN, color: C.t1 }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'); @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.45s ease forwards} *{box-sizing:border-box;margin:0;padding:0}`}</style>
<div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle,${C.aG} 0%,transparent 60%)`, pointerEvents: "none" }} />

  <div style={{ maxWidth: 520, width: "100%", margin: "0 auto" }}>
    {step === 0 && (
      <div className="fu" style={{ textAlign: "center", padding: "56px 24px 40px" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${C.a},#3D6B47)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: `0 8px 32px ${C.aG}` }}>
          <Grid3x3 size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: C.t1, margin: "0 0 8px", letterSpacing: -0.5 }}>Trellis</h1>
        <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.65, maxWidth: 400, margin: "0 auto 4px" }}>
          Your personal AI that learns how you work, writes in your voice, and builds a workspace around your profession.
        </p>
        <p style={{ fontSize: 12, color: C.t3, marginBottom: 32 }}>For any profession. Set up in 90 seconds.</p>
        <div style={{ maxWidth: 300, margin: "0 auto 24px" }}>
          <label style={{ fontSize: 12, color: C.t2, fontWeight: 600, display: "block", marginBottom: 6, textAlign: "left" }}>What should I call you?</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" style={{ textAlign: "center", fontSize: 16, padding: "14px 20px" }} />
        </div>
        <Btn primary onClick={() => name.trim() && setStep(1)} disabled={!name.trim()} style={{ padding: "13px 32px", fontSize: 14, borderRadius: 12 }}>
          <ArrowRight size={16} /> Get Started
        </Btn>
      </div>
    )}

    {step === 1 && (
      <div className="fu" style={{ padding: "32px 20px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.t1, margin: "0 0 4px" }}>How should I learn about you?</h2>
        <p style={{ fontSize: 13, color: C.t3, margin: "0 0 24px" }}>Pick whichever feels right. You can change everything later.</p>

        <Card hoverable onClick={() => { setPath("tell"); setStep(2); }} style={{ marginBottom: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.pS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageCircle size={22} color={C.p} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 2 }}>Tell me about yourself</div>
              <div style={{ fontSize: 12, color: C.t3, lineHeight: 1.5 }}>Quick questions about your role, industry, and work style. About 60 seconds.</div>
            </div>
            <ChevronRight size={18} color={C.t3} />
          </div>
        </Card>

        <Card hoverable onClick={() => { setPath("connect"); setStep(3); }} style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.aS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={22} color={C.a} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 2 }}>Let me figure it out</div>
              <div style={{ fontSize: 12, color: C.t3, lineHeight: 1.5 }}>Connect your email and calendar. I will detect your profession, voice, and patterns automatically.</div>
            </div>
            <ChevronRight size={18} color={C.t3} />
          </div>
          <PrivacyNote text="Trellis reads your data once to learn, then discards it. Nothing is stored or shared." />
        </Card>
      </div>
    )}

    {step === 2 && (
      <div className="fu" style={{ padding: "24px 20px" }}>
        <Btn ghost small onClick={() => setStep(1)} style={{ marginBottom: 14, padding: 0, color: C.a }}>
          <ChevronDown size={11} style={{ transform: "rotate(90deg)" }} /> Back
        </Btn>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: "0 0 20px" }}>Tell me about yourself</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Job title</label>
            <Input value={manual.role} onChange={(e) => setManual((p) => ({ ...p, role: e.target.value }))} placeholder="e.g., Catering Sales Manager, Real Estate Agent" />
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Industry</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
              {Object.entries(IND).map(([k, v]) => (
                <Card key={k} hoverable onClick={() => setManual((p) => ({ ...p, industry: k }))} selected={manual.industry === k} style={{ padding: "8px 4px", textAlign: "center" }}>
                  <v.I size={14} color={manual.industry === k ? C.a : C.t3} style={{ marginBottom: 2 }} />
                  <div style={{ fontSize: 8, fontWeight: 600, color: manual.industry === k ? C.t1 : C.t3 }}>{v.l}</div>
                </Card>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Company / Org</label>
              <Input value={manual.org} onChange={(e) => setManual((p) => ({ ...p, org: e.target.value }))} placeholder="Where you work" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Work setup</label>
              <div style={{ display: "flex", gap: 4 }}>
                {["office", "remote", "hybrid"].map((w) => (
                  <Card key={w} hoverable onClick={() => setManual((p) => ({ ...p, workStyle: w }))} selected={manual.workStyle === w} style={{ flex: 1, padding: "8px 4px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: manual.workStyle === w ? C.t1 : C.t3 }}>{w}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>How do you track your work?</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
              {[
                { id: "pipeline", l: "Deals / Pipeline", I: BarChart3 },
                { id: "projects", l: "Projects / Tasks", I: Kanban },
                { id: "cases", l: "Cases / Matters", I: FileText },
                { id: "clients", l: "Clients / Accounts", I: Users },
              ].map((t) => (
                <Card key={t.id} hoverable onClick={() => setManual((p) => ({ ...p, trackMethod: t.id }))} selected={manual.trackMethod === t.id} style={{ padding: "8px 4px", textAlign: "center" }}>
                  <t.I size={14} color={manual.trackMethod === t.id ? C.a : C.t3} style={{ marginBottom: 2 }} />
                  <div style={{ fontSize: 8, fontWeight: 600, color: manual.trackMethod === t.id ? C.t1 : C.t3 }}>{t.l}</div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Biggest time sink?</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
              {[
                { id: "email", l: "Email", I: Mail },
                { id: "scheduling", l: "Scheduling", I: Calendar },
                { id: "research", l: "Research", I: Search },
                { id: "admin", l: "Admin / Docs", I: FileSpreadsheet },
              ].map((t) => (
                <Card key={t.id} hoverable onClick={() => setManual((p) => ({ ...p, timeSink: t.id }))} selected={manual.timeSink === t.id} style={{ padding: "8px 4px", textAlign: "center" }}>
                  <t.I size={14} color={manual.timeSink === t.id ? C.a : C.t3} style={{ marginBottom: 2 }} />
                  <div style={{ fontSize: 8, fontWeight: 600, color: manual.timeSink === t.id ? C.t1 : C.t3 }}>{t.l}</div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Your writing style</label>
            <TextArea rows={2} value={manual.voiceDesc} onChange={(e) => setManual((p) => ({ ...p, voiceDesc: e.target.value }))} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Current goals</label>
            <TextArea rows={2} value={manual.goals} onChange={(e) => setManual((p) => ({ ...p, goals: e.target.value }))} placeholder="What are you focused on right now?" />
          </div>
        </div>

        <Btn primary onClick={finishOnboarding} style={{ marginTop: 20, padding: "12px 28px", fontSize: 13, borderRadius: 12 }}>
          <Sparkles size={14} /> Build My Trellis
        </Btn>
      </div>
    )}

    {step === 3 && (
      <div className="fu" style={{ padding: "24px 20px" }}>
        <Btn ghost small onClick={() => setStep(1)} style={{ marginBottom: 14, padding: 0, color: C.a }}>
          <ChevronDown size={11} style={{ transform: "rotate(90deg)" }} /> Back
        </Btn>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: "0 0 4px" }}>Connect your accounts</h2>
        <p style={{ fontSize: 12, color: C.t3, margin: "0 0 20px", lineHeight: 1.5 }}>
          Trellis scans once to learn about you. Your data is never stored, shared, or sent anywhere.
        </p>

        <Card glow={!gmailDone} style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "18px 18px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: gmailDone ? C.gS : C.rS, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {gmailDone ? <CheckCircle size={20} color={C.g} /> : <Mail size={20} color={C.r} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>Gmail</div>
                <div style={{ fontSize: 11, color: C.t3 }}>{gmailDone ? "Voice profile built" : "Detects profession, writing style, contacts"}</div>
              </div>
              {!gmailDone && !gmailScanning && (
                <Btn primary small onClick={scanGmail}><Shield size={9} /> Connect</Btn>
              )}
            </div>

            {gmailScanning && (
              <div>
                {scanPhases.map((phase, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", opacity: i <= gmailPhase ? 1 : 0.2, transition: "opacity 0.3s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: i < gmailPhase ? C.gS : i === gmailPhase ? C.aS : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i < gmailPhase ? <CheckCircle size={10} color={C.g} /> : i === gmailPhase ? <Loader size={10} color={C.a} style={{ animation: "spin 1s linear infinite" }} /> : <Circle size={10} color={C.t3} />}
                    </div>
                    <span style={{ fontSize: 11, color: i <= gmailPhase ? C.t1 : C.t3, fontWeight: i === gmailPhase ? 600 : 400 }}>{phase.label}</span>
                  </div>
                ))}
              </div>
            )}

            {gmailDone && discovered.role && (
              <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: C.g, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={10} /> Detected</div>
                {discovered.role && <div style={{ fontSize: 11, color: C.t2 }}><strong style={{ color: C.t1 }}>Role:</strong> {discovered.role}</div>}
                {discovered.org && <div style={{ fontSize: 11, color: C.t2 }}><strong style={{ color: C.t1 }}>Org:</strong> {discovered.org}</div>}
                {discovered.voiceDesc && <div style={{ fontSize: 11, color: C.t2, marginTop: 3 }}><strong style={{ color: C.t1 }}>Voice:</strong> {discovered.voiceDesc}</div>}
              </div>
            )}

            {!gmailDone && !gmailScanning && (
              <PrivacyNote text="Read-only. Scans sent emails once, learns your style, then raw data is discarded." />
            )}
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: calDone ? C.gS : C.blS, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {calDone ? <CheckCircle size={20} color={C.g} /> : <Calendar size={20} color={C.bl} />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>Calendar</div>
                <div style={{ fontSize: 11, color: C.t3 }}>{calDone ? "Patterns analyzed" : "Schedule, meetings, work style"}</div>
              </div>
            </div>
            {!calDone && !calScanning && <Btn small onClick={scanCalendar}><Shield size={9} /> Connect</Btn>}
            {calScanning && <Loader size={14} color={C.a} style={{ animation: "spin 1s linear infinite" }} />}
          </div>
          <PrivacyNote text="Read-only. Calendar data analyzed locally, never stored." />
        </Card>

        <Card style={{ padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, marginBottom: 8 }}>More integrations after setup</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[
              { n: "LinkedIn", I: Globe }, { n: "Slack", I: MessageCircle },
              { n: "HubSpot", I: Database }, { n: "Notion", I: BookOpen },
              { n: "Salesforce", I: Layers }, { n: "Stripe", I: CreditCard },
              { n: "Asana", I: Target }, { n: "Zoom", I: Camera },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "6px 4px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                <s.I size={12} color={C.t3} style={{ marginBottom: 2, opacity: 0.5 }} />
                <div style={{ fontSize: 8, color: C.t3 }}>{s.n}</div>
              </div>
            ))}
          </div>
        </Card>

        <Btn primary onClick={finishOnboarding} disabled={!gmailDone && !calDone} style={{ padding: "12px 24px", fontSize: 13, borderRadius: 12 }}>
          <Sparkles size={14} /> Build My Trellis
        </Btn>
        <button onClick={() => { setDiscovered({ role: "Professional", industry: "other", voiceDesc: "Professional and direct" }); finishOnboarding(); }}
          style={{ display: "block", background: "none", border: "none", color: C.t3, fontSize: 11, cursor: "pointer", fontFamily: FN, marginTop: 12, padding: 0 }}>
          Skip and set up manually
        </button>
      </div>
    )}
  </div>
</div>
);
}

// ── MODULE: Command ────────────────────────────────────
function ModCommand({ profile, data, addActivity }) {
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

// ── MODULE: Compose ────────────────────────────────────
function ModCompose({ profile, data, addActivity }) {
const systemPrompt = buildSystemPrompt(profile);
const [selectedIdx, setSelectedIdx] = useState(0);
const [channel, setChannel] = useState("email");
const [generating, setGenerating] = useState(false);
const [messages, setMessages] = useState({});
const [copied, setCopied] = useState(false);
const [editing, setEditing] = useState(false);
const [actionResult, setActionResult] = useState(null);

const activeLeads = (data.leads || []).filter((l) => l.status === "hot" || l.status === "warm").slice(0, 8);
const lead = activeLeads[selectedIdx];
if (!lead) return <Card style={{ padding: 24, textAlign: "center" }}><Target size={24} color={C.t3} /><div style={{ color: C.t3, marginTop: 8 }}>No active leads.</div></Card>;

const current = messages[lead.id] || { subject: `Reaching out to ${lead.name}`, body: "Tap Generate to write in your voice." };

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
        const match = r.match(/^Subject:\s*(.+)/m);
        setMessages((p) => ({ ...p, [lead.id]: { subject: match ? match[1].trim() : "Follow up", body: match ? r.replace(/^Subject:\s*.+\n*/m, "").trim() : r.trim() } }));
        addActivity(`Drafted ${channel}: ${lead.name}`); setGenerating(false);
      }}><Sparkles size={10} /> Generate</Btn>
      <Btn small onClick={async () => {
        setActionResult(null);
        const r = await callAI([{ role: "user", content: `Create Gmail draft${lead.email ? ` to ${lead.email}` : ""} subject "${current.subject}" body:\n${current.body}` }], { system: "Create draft.", mcp: [MCP_GMAIL] });
        setActionResult(r || "Draft created."); addActivity(`Gmail: ${lead.name}`);
      }}><Mail size={10} /> Gmail</Btn>
      <Btn small onClick={async () => {
        const r = await callAI([{ role: "user", content: `Calendar event: "Meeting - ${lead.name}" next weekday 2 PM, 1hr.` }], { system: "Schedule.", mcp: [MCP_GCAL] });
        setActionResult(r || "Scheduled."); addActivity(`Meeting: ${lead.name}`);
      }}><CalendarPlus size={10} /> Schedule</Btn>
      <Btn small onClick={() => setEditing(!editing)}><PenLine size={10} /> {editing ? "Preview" : "Edit"}</Btn>
      <Btn small onClick={() => { navigator.clipboard.writeText(current.body); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
        {copied ? <CheckCircle size={10} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
      </Btn>
    </div>
  </Card>
  {actionResult && <Card style={{ marginTop: 10, padding: 10, borderLeft: `3px solid ${C.g}` }}><div style={{ fontSize: 11, color: C.t2, display: "flex", alignItems: "flex-start", gap: 6 }}><CheckCircle size={12} color={C.g} style={{ marginTop: 1, flexShrink: 0 }} />{actionResult}</div></Card>}
</div>
);
}

// ── MODULE: Pipeline ───────────────────────────────────
function ModPipeline({ data, setData, addActivity }) {
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
addActivity(`${d.name} advanced`);
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

// ── MODULE: Intel ──────────────────────────────────────
function ModIntel({ profile, addActivity }) {
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
setResult(r);
addActivity(`Research: "${searchQuery}"`);
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

// ── MODULE: Feature Library + Profile ──────────────────
function ModSettings({ profile, setProfile }) {
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

// ── Placeholder Module ─────────────────────────────────
function ModPlaceholder({ moduleId }) {
const mod = ALL_MODULES[moduleId];
if (!mod) return null;
return (
<div style={{ padding: 20, textAlign: "center" }}>
<mod.Icon size={32} color={C.t3} style={{ marginBottom: 12 }} />
<h2 style={{ fontSize: 18, fontWeight: 700, color: C.t1, margin: "0 0 6px" }}>{mod.label}</h2>
<p style={{ fontSize: 12, color: C.t3, lineHeight: 1.5, maxWidth: 300, margin: "0 auto" }}>{mod.desc}</p>
<div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${C.b1}` }}>
<div style={{ fontSize: 11, color: C.t2 }}>This module is coming soon. Use the AI assistant to access these capabilities now.</div>
</div>
</div>
);
}

// ── MODULE: Ask AI (Agentic) ──────────────────────────
function ToolStep({ name, input, result, done }) {
const TOOL_DISPLAY = {
  search_workspace: { label: "Searching workspace", Icon: Search, color: C.te },
  update_lead: { label: "Updating lead", Icon: Target, color: C.a },
  update_deal: { label: "Updating deal", Icon: BarChart3, color: C.a },
  add_lead: { label: "Adding lead", Icon: UserPlus, color: C.g },
  add_deal: { label: "Adding deal", Icon: Plus, color: C.g },
  log_activity: { label: "Logging", Icon: Activity, color: C.t3 },
  modify_workspace: { label: "Modifying workspace", Icon: Settings, color: C.p },
  web_search: { label: "Searching web", Icon: Globe, color: C.bl },
};
const meta = TOOL_DISPLAY[name] || { label: name, Icon: Plug, color: C.te };
const [expanded, setExpanded] = useState(false);

return (
<div
  onClick={() => done && setExpanded(!expanded)}
  style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 10px", borderRadius: 10, background: `${meta.color}08`, border: `1px solid ${meta.color}20`, cursor: done ? "pointer" : "default", transition: "all 0.15s" }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    {done
      ? <CheckCircle size={11} color={meta.color} />
      : <Loader size={11} color={meta.color} style={{ animation: "spin 1s linear infinite" }} />
    }
    <meta.Icon size={10} color={meta.color} />
    <span style={{ fontSize: 10, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
    {input && !expanded && <span style={{ fontSize: 9, color: C.t3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeof input === "string" ? input : JSON.stringify(input).slice(0, 60)}</span>}
    {done && <ChevronDown size={9} color={C.t3} style={{ marginLeft: "auto", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
  </div>
  {expanded && (
    <div style={{ fontSize: 10, lineHeight: 1.5, padding: "4px 0 2px" }}>
      {input && <div style={{ color: C.t3, marginBottom: 3 }}><strong style={{ color: C.t2 }}>Input:</strong> {typeof input === "string" ? input : JSON.stringify(input, null, 2)}</div>}
      {result && <div style={{ color: C.t2 }}><strong style={{ color: C.t1 }}>Result:</strong> {typeof result === "string" ? (result.length > 200 ? result.slice(0, 200) + "…" : result) : JSON.stringify(result).slice(0, 200)}</div>}
    </div>
  )}
</div>
);
}

function ServerToolPill({ name }) {
const meta = {
  web_search: { label: "Searching web", Icon: Globe, color: C.bl },
  gmail: { label: "Reading Gmail", Icon: Mail, color: C.r },
  gcal: { label: "Checking Calendar", Icon: Calendar, color: C.bl },
  calendar: { label: "Checking Calendar", Icon: Calendar, color: C.bl },
};
const m = meta[name] || meta[Object.keys(meta).find((k) => name.includes(k))] || { label: name, Icon: Plug, color: C.te };
return (
<div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: `${m.color}10`, border: `1px solid ${m.color}22` }}>
  <Loader size={9} color={m.color} style={{ animation: "spin 1s linear infinite" }} />
  <m.Icon size={9} color={m.color} />
  <span style={{ fontSize: 9, color: m.color, fontWeight: 600 }}>{m.label}…</span>
</div>
);
}

function ModAsk({ profile, data, setData, addActivity, setProfile }) {
const systemPrompt = buildSystemPrompt(profile);
const pipeline = data.pipeline || [];
const leads = data.leads || [];
const hotLeads = leads.filter((l) => l.status === "hot");
const pipeTotal = pipeline.reduce((s, d) => s + d.value, 0);

// Persisted conversation
const [msgs, setMsgs, msgsReady] = usePersistedState("tr-chat", []);
const [input, setInput] = useState("");
const [streaming, setStreaming] = useState(false);
const [serverTool, setServerTool] = useState(null);
const scrollRef = useRef(null);
const inputRef = useRef(null);
const msgId = useRef(Date.now());
// Keep a ref to latest data for tool execution inside async closures
const dataRef = useRef(data);
dataRef.current = data;

useEffect(() => {
if (msgsReady && msgs.length === 0 && profile) {
  const ctx = pipeline.length > 0
    ? `$${(pipeTotal / 1000).toFixed(0)}K in pipeline, ${leads.length} leads${hotLeads.length > 0 ? ` (${hotLeads.length} hot)` : ""}`
    : "your workspace";
  setMsgs([{ role: "assistant", id: 0, blocks: [{ type: "text", text: `Hey ${profile.name} — I'm connected to ${ctx}, Gmail, Calendar, and the web. I can research, draft, update your pipeline, and take actions on your behalf. What do you need?` }] }]);
}
}, [msgsReady, profile?.name]);

useEffect(() => {
if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
}, [msgs, serverTool]);

const suggestions = [
hotLeads.length > 0 && `Research ${hotLeads[0].name} and update their lead`,
pipeline.length > 0 && "Analyze my pipeline and suggest next steps",
"What's on my calendar today?",
`Research ${profile.industry || "my industry"} trends`,
"Catch me up on unread emails",
hotLeads.length > 1 && `Draft outreach to ${hotLeads[1].name} in my voice`,
].filter(Boolean).slice(0, 5);

async function send(override) {
const text = (override || input).trim();
if (!text || streaming) return;
setInput("");
if (inputRef.current) { inputRef.current.style.height = "auto"; }
setStreaming(true);

const uid = ++msgId.current;
const aid = ++msgId.current;
const asstMsg = { role: "assistant", id: aid, blocks: [], live: true };

setMsgs((prev) => [...prev, { role: "user", id: uid, text }, asstMsg]);

// Build context for the AI
const pipeCtx = pipeline.slice(0, 8).map((d) => `${d.name} (ID:${d.id}): $${(d.value / 1000).toFixed(0)}K, stage=${d.stage}, prob=${d.prob}%`).join("\n");
const leadCtx = leads.slice(0, 8).map((l) => `${l.name} (ID:${l.id}): source=${l.source}, status=${l.status}, score=${l.score}, revenue=$${l.revenue}${l.email ? `, email=${l.email}` : ""}`).join("\n");
const ctx = [pipeCtx && `PIPELINE:\n${pipeCtx}`, leadCtx && `LEADS:\n${leadCtx}`].filter(Boolean).join("\n\n");

// Build conversation history from persisted messages (for multi-turn)
const history = msgs.filter((m) => !m.live).slice(-12).map((m) => {
  if (m.role === "user") return { role: "user", content: m.text || "" };
  const text = (m.blocks || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return { role: "assistant", content: text || "(action taken)" };
});

const allTools = [...LOCAL_TOOLS, TOOL_WEB];

try {
  await runAgent(
    [...history, { role: "user", content: ctx ? `MY WORKSPACE DATA:\n${ctx}\n\nREQUEST: ${text}` : text }],
    { system: systemPrompt, tools: allTools, mcp: [MCP_GCAL, MCP_GMAIL], thinking: { type: "enabled", budget_tokens: 5000 } },
    {
      onText: (accum) => {
        setServerTool(null);
        setMsgs((prev) => prev.map((m) => {
          if (m.id !== aid) return m;
          // Find or create the last text block
          const blocks = [...(m.blocks || [])];
          const lastText = blocks.length > 0 && blocks[blocks.length - 1].type === "text" ? blocks.length - 1 : -1;
          if (lastText >= 0) {
            blocks[lastText] = { ...blocks[lastText], text: accum };
          } else {
            blocks.push({ type: "text", text: accum });
          }
          return { ...m, blocks };
        }));
      },
      onServerTool: (name) => {
        setServerTool(name);
      },
      onToolStart: (name, toolInput) => {
        setServerTool(null);
        setMsgs((prev) => prev.map((m) => {
          if (m.id !== aid) return m;
          const blocks = [...(m.blocks || [])];
          blocks.push({ type: "tool", name, input: toolInput, result: null, done: false });
          return { ...m, blocks };
        }));
      },
      onToolDone: (name, result) => {
        setMsgs((prev) => prev.map((m) => {
          if (m.id !== aid) return m;
          const blocks = [...(m.blocks || [])];
          // Find the last tool block matching this name that isn't done
          for (let i = blocks.length - 1; i >= 0; i--) {
            if (blocks[i].type === "tool" && blocks[i].name === name && !blocks[i].done) {
              blocks[i] = { ...blocks[i], result, done: true };
              break;
            }
          }
          return { ...m, blocks };
        }));
      },
      executeTool: (name, toolInput) => {
        return executeLocalTool(name, toolInput, dataRef.current, setData, addActivity, profile, setProfile);
      },
    }
  );
} catch (e) {
  console.error("Agent error:", e);
  setMsgs((prev) => prev.map((m) => m.id === aid ? { ...m, blocks: [...(m.blocks || []), { type: "text", text: "\n\nSomething went wrong — please try again." }] } : m));
}
setMsgs((prev) => prev.map((m) => (m.id === aid ? { ...m, live: false } : m)));
setServerTool(null);
setStreaming(false);
}

// Render a single assistant message with interleaved blocks
function renderBlocks(blocks, live) {
if (!blocks || blocks.length === 0) {
  if (live) return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.t3, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
    </div>
  );
  return null;
}
return blocks.map((block, i) => {
  if (block.type === "text" && block.text) {
    return <MarkdownText key={i} text={block.text} />;
  }
  if (block.type === "tool") {
    return <ToolStep key={i} name={block.name} input={block.input} result={block.result} done={block.done} />;
  }
  if (block.type === "thinking" && block.thinking) {
    return (
      <details key={i} style={{ marginBottom: 4 }}>
        <summary style={{ fontSize: 10, color: C.t3, cursor: "pointer", fontFamily: FN, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <Sparkles size={9} color={C.t3} /> Reasoning
        </summary>
        <div style={{ fontSize: 10, color: C.t3, lineHeight: 1.5, padding: "6px 0 2px", whiteSpace: "pre-wrap", maxHeight: 150, overflowY: "auto" }}>{block.thinking}</div>
      </details>
    );
  }
  return null;
});
}

return (
<div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>

  {/* Connection + context bar */}
  <div style={{ padding: "7px 14px 6px", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", borderBottom: `1px solid ${C.b1}`, flexShrink: 0 }}>
    {[
      { label: "Gmail",    color: C.r,  Icon: Mail     },
      { label: "Calendar", color: C.bl, Icon: Calendar },
      { label: "Web",      color: C.te, Icon: Globe    },
      { label: "Tools",    color: C.p,  Icon: Zap      },
    ].map(({ label, color, Icon }) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 20, background: `${color}12`, border: `1px solid ${color}25` }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
        <span style={{ fontSize: 9, color, fontWeight: 600 }}>{label}</span>
      </div>
    ))}
    {pipeline.length > 0 && (
      <div style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 20, background: C.aS, border: `1px solid ${C.a}30` }}>
        <span style={{ fontSize: 9, color: C.a, fontWeight: 600 }}>
          {pipeline.length} deals · {leads.length} leads{hotLeads.length > 0 ? ` · ${hotLeads.length} hot` : ""}
        </span>
      </div>
    )}
  </div>

  {/* Messages */}
  <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: 16 }}>
    {msgs.map((m) => {
      // User messages
      if (m.role === "user") {
        return (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 4px 16px", background: C.a, color: "#fff", fontSize: 13, lineHeight: 1.72, whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
          </div>
        );
      }
      // Assistant messages — block-based
      return (
        <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: C.aS, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={10} color={C.a} />
            </div>
            <span style={{ fontSize: 10, color: C.t3, fontWeight: 600 }}>Trellis AI</span>
            {m.live && <Loader size={9} color={C.a} style={{ animation: "spin 1s linear infinite" }} />}
          </div>
          <div style={{ maxWidth: "100%", padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: C.s1, border: `1px solid ${C.b1}`, display: "flex", flexDirection: "column", gap: 8 }}>
            {renderBlocks(m.blocks, m.live)}
          </div>
        </div>
      );
    })}

    {/* Server-side tool indicator */}
    {serverTool && <ServerToolPill name={serverTool} />}
  </div>

  {/* Suggestions — only before conversation */}
  {msgs.length <= 1 && (
    <div style={{ padding: "6px 14px 4px", display: "flex", gap: 5, overflowX: "auto", flexShrink: 0 }}>
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => send(s)} style={{
          padding: "6px 12px", borderRadius: 20,
          background: C.s1, border: `1px solid ${C.b1}`,
          color: C.t2, fontSize: 10, cursor: "pointer",
          fontFamily: FN, whiteSpace: "nowrap", flexShrink: 0,
        }}>{s}</button>
      ))}
    </div>
  )}

  {/* Input + clear chat */}
  <div style={{ padding: "8px 14px 18px", borderTop: `1px solid ${C.b1}`, flexShrink: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
        }}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder="Ask anything… (Shift+Enter for new line)"
        disabled={streaming}
        rows={1}
        style={{
          flex: 1, padding: "11px 15px", borderRadius: 14,
          background: C.s1, border: `1px solid ${C.b2}`,
          color: C.t1, fontSize: 13, outline: "none",
          fontFamily: FN, resize: "none", lineHeight: 1.5,
          overflow: "hidden", opacity: streaming ? 0.6 : 1,
        }}
      />
      <button
        onClick={() => send()}
        disabled={streaming || !input.trim()}
        style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: streaming || !input.trim() ? C.s2 : C.a,
          border: "none", cursor: streaming || !input.trim() ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: streaming || !input.trim() ? 0.4 : 1, transition: "all 0.2s",
        }}
      >
        {streaming
          ? <Loader size={15} color={C.t3} style={{ animation: "spin 1s linear infinite" }} />
          : <ArrowUpRight size={16} color={!input.trim() ? C.t3 : "#fff"} />
        }
      </button>
    </div>
    {msgs.length > 1 && !streaming && (
      <button onClick={() => setMsgs([])} style={{ background: "none", border: "none", color: C.t3, fontSize: 10, cursor: "pointer", fontFamily: FN, marginTop: 6, padding: 0 }}>
        Clear conversation
      </button>
    )}
  </div>
</div>
);
}

// ── SEED DATA ──────────────────────────────────────────
const SEED_DATA = {
leads: [
{ id: "l1", name: "Sarah Torres", source: "The Knot", score: 94, status: "hot", detail: "Sept 2026, 180 guests, $45K+.", revenue: 48000, email: "storres@email.com" },
{ id: "l2", name: "Raytheon Tech", source: "LinkedIn", score: 88, status: "hot", detail: "400+ employees. Q2 team build.", revenue: 15000, email: "" },
{ id: "l3", name: "Jessica Kim", source: "WeddingWire", score: 91, status: "hot", detail: "150 guests, fall. $50K+.", revenue: 52000, email: "jkim@email.com" },
{ id: "l4", name: "MetroWest Chamber", source: "Event Board", score: 82, status: "warm", detail: "Annual gala, 250 pax.", revenue: 32000, email: "" },
{ id: "l5", name: "TJX Companies", source: "LinkedIn", score: 86, status: "hot", detail: "Exec retreat, 60 leaders.", revenue: 25000, email: "" },
{ id: "l6", name: "Donnelly Family", source: "Referral", score: 92, status: "hot", detail: "Peterson referral.", revenue: 18000, email: "donnelly@email.com" },
],
pipeline: [
{ id: "p1", name: "Torres Wedding", value: 48000, stage: "tour", prob: 70, date: "Sep 2026" },
{ id: "p2", name: "Kim Wedding", value: 52000, stage: "proposal", prob: 65, date: "Oct 2026" },
{ id: "p3", name: "Raytheon Build", value: 15000, stage: "meeting", prob: 50, date: "Jun 2026" },
{ id: "p4", name: "Chamber Gala", value: 32000, stage: "proposal", prob: 60, date: "Nov 2026" },
{ id: "p5", name: "TJX Retreat", value: 25000, stage: "meeting", prob: 55, date: "May 2026" },
],
activity: [],
};

// ── Module Component Map ───────────────────────────────
const MODULE_RENDERERS = {
command: ModCommand,
compose: ModCompose,
pipeline: ModPipeline,
intel: ModIntel,
};

// ── MAIN APP ───────────────────────────────────────────
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
<style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');`}</style>
<Grid3x3 size={28} color={C.a} />
</div>
);
}

if (!profile) {
return <Onboarding onComplete={(p) => setProfile(p)} />;
}

const safeData = data || SEED_DATA;
const userModules = (profile.modules || ["command", "compose", "pipeline", "intel"]).filter((id) => ALL_MODULES[id]);
// "ask" is always pinned; modules get up to 2 slots between command and ask
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
<style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'); @keyframes pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } } @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } } * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; } input::placeholder, textarea::placeholder { color: ${C.t3}; }`}</style>

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
