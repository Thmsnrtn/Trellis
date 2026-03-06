import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Sparkles, CheckCircle, Calendar, Mail, Globe,
  Zap, Target, BarChart3, UserPlus, Plus, Activity, Settings,
  Plug, Loader, ChevronDown, Copy, RefreshCw, ArrowUpRight,
} from "lucide-react";
import { C, FN } from "../constants/theme";
import { useWorkspace } from "../context/WorkspaceContext";
import { useToast } from "../components/ui/Toast";
import { usePersistedState } from "../hooks/usePersistedState";
import { buildSystemPrompt } from "../ai/systemPrompt";
import { runAgent } from "../ai/engine";
import { LOCAL_TOOLS, executeLocalTool } from "../ai/tools";
import { MCP_GMAIL, MCP_GCAL, TOOL_WEB } from "../ai/config";
import { MarkdownText } from "../components/markdown/MarkdownText";

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

export function ModAsk() {
  const { profile, data, setData, dataRef, addActivity, setProfile, logMutation } = useWorkspace();
  const toast = useToast();
  const systemPrompt = buildSystemPrompt(profile);
  const pipeline = data.pipeline || [];
  const leads = data.leads || [];
  const hotLeads = leads.filter((l) => l.status === "hot");
  const pipeTotal = pipeline.reduce((s, d) => s + d.value, 0);

  // Persisted conversation (pruned to last 50 messages)
  const [rawMsgs, setRawMsgs, msgsReady] = usePersistedState("tr-chat", []);
  const msgs = rawMsgs || [];
  const setMsgs = useCallback((fn) => {
    setRawMsgs((prev) => {
      const next = typeof fn === "function" ? fn(prev || []) : fn;
      // Prune to 50 messages to prevent unbounded growth
      return next.length > 50 ? next.slice(next.length - 50) : next;
    });
  }, [setRawMsgs]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [serverTool, setServerTool] = useState(null);
  const [copied, setCopied] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const msgId = useRef(Date.now());
  const abortRef = useRef(null);

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

    // Build conversation history preserving tool context
    const history = msgs.filter((m) => !m.live).slice(-12).flatMap((m) => {
      if (m.role === "user") return [{ role: "user", content: m.text || "" }];
      const content = [];
      for (const b of (m.blocks || [])) {
        if (b.type === "text" && b.text) content.push({ type: "text", text: b.text });
        if (b.type === "tool" && b.done) {
          content.push({ type: "tool_use", id: `hist_${b.name}`, name: b.name, input: b.input || {} });
        }
      }
      if (content.length === 0) content.push({ type: "text", text: "(action taken)" });
      const result = [{ role: "assistant", content }];
      const toolBlocks = (m.blocks || []).filter((b) => b.type === "tool" && b.done);
      if (toolBlocks.length > 0) {
        result.push({ role: "user", content: toolBlocks.map((b) => ({ type: "tool_result", tool_use_id: `hist_${b.name}`, content: typeof b.result === "string" ? b.result : JSON.stringify(b.result || "") })) });
      }
      return result;
    });

    const allTools = [...LOCAL_TOOLS, TOOL_WEB];

    let currentTextIdx = -1;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await runAgent(
        [...history, { role: "user", content: ctx ? `MY WORKSPACE DATA:\n${ctx}\n\nREQUEST: ${text}` : text }],
        { system: systemPrompt, tools: allTools, mcp: [MCP_GCAL, MCP_GMAIL], thinking: { type: "enabled", budget_tokens: 5000 } },
        {
          onNewTurn: () => {
            currentTextIdx = -1;
          },
          onText: (turnText) => {
            setServerTool(null);
            setMsgs((prev) => prev.map((m) => {
              if (m.id !== aid) return m;
              const blocks = [...(m.blocks || [])];
              const lastIdx = blocks.length - 1;
              if (lastIdx >= 0 && blocks[lastIdx].type === "text" && currentTextIdx === lastIdx) {
                blocks[lastIdx] = { ...blocks[lastIdx], text: turnText };
              } else {
                blocks.push({ type: "text", text: turnText });
                currentTextIdx = blocks.length - 1;
              }
              return { ...m, blocks };
            }));
          },
          onServerTool: (name) => {
            setServerTool(name);
          },
          onToolStart: (name, toolInput) => {
            setServerTool(null);
            currentTextIdx = -1;
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
            logMutation("agent_tool", `${name}: ${JSON.stringify(toolInput).slice(0, 100)}`, "agent");
            return executeLocalTool(name, toolInput, dataRef.current, setData, addActivity, profile, setProfile);
          },
          onLimitReached: (iterations) => {
            toast(`Agent stopped after ${iterations} iterations`, "info");
          },
        },
        controller.signal
      );
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("Agent error:", e);
        toast("Something went wrong — please try again", "error");
        setMsgs((prev) => prev.map((m) => m.id === aid ? { ...m, blocks: [...(m.blocks || []), { type: "text", text: "\n\nSomething went wrong — please try again." }] } : m));
      }
    }
    abortRef.current = null;
    setMsgs((prev) => prev.map((m) => (m.id === aid ? { ...m, live: false } : m)));
    setServerTool(null);
    setStreaming(false);
  }

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
          if (m.role === "user") {
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 4px 16px", background: C.a, color: "#fff", fontSize: 13, lineHeight: 1.72, whiteSpace: "pre-wrap" }}>
                  {m.text}
                </div>
              </div>
            );
          }
          const fullText = (m.blocks || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
          const isLast = m.id === msgs[msgs.length - 1]?.id;
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
              {!m.live && fullText && (
                <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                  <button onClick={() => { navigator.clipboard.writeText(fullText); setCopied(m.id); setTimeout(() => setCopied(null), 2000); }}
                    style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: FN, fontSize: 10, color: copied === m.id ? C.g : C.t3, transition: "color 0.15s" }}>
                    {copied === m.id ? <CheckCircle size={10} /> : <Copy size={10} />} {copied === m.id ? "Copied" : "Copy"}
                  </button>
                  {isLast && !streaming && (
                    <button onClick={() => { setMsgs((prev) => prev.slice(0, -1)); const lastUserMsg = msgs.findLast((x) => x.role === "user"); if (lastUserMsg) send(lastUserMsg.text); }}
                      style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: FN, fontSize: 10, color: C.t3 }}>
                      <RefreshCw size={10} /> Regenerate
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {serverTool && <ServerToolPill name={serverTool} />}
      </div>

      {/* Suggestions */}
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
          {streaming ? (
            <button
              onClick={() => { if (abortRef.current) abortRef.current.abort(); }}
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: C.rS, border: `1px solid ${C.r}40`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 2, background: C.r }} />
            </button>
          ) : (
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: !input.trim() ? C.s2 : C.a,
                border: "none", cursor: !input.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: !input.trim() ? 0.4 : 1, transition: "all 0.2s",
              }}
            >
              <ArrowUpRight size={16} color={!input.trim() ? C.t3 : "#fff"} />
            </button>
          )}
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
