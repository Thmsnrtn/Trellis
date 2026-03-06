// ── Non-streaming AI call ──────────────────────────────
export async function callAI(messages, opts = {}) {
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

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${res.status}`;
      console.error("AI API error:", msg);
      return { error: true, message: msg };
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n") || "";
    return text;
  } catch (e) {
    console.error("AI error:", e);
    return { error: true, message: e.message || "Network error" };
  }
}

/** Check if a callAI result is an error */
export function isAIError(result) {
  return result && typeof result === "object" && result.error === true;
}

// ── Streaming Agentic Engine ──────────────────────────
// Streams one API turn, returns { content: [...blocks], stopReason, text }
export async function streamOneTurn(messages, opts = {}, onText, onToolSignal, signal) {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 4096, messages, stream: true };
  if (opts.system) body.system = opts.system;
  if (opts.tools) body.tools = opts.tools;
  if (opts.mcp) body.mcp_servers = opts.mcp;
  if (opts.thinking) body.thinking = opts.thinking;

  const fetchOpts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  if (signal) fetchOpts.signal = signal;

  const res = await fetch("https://api.anthropic.com/v1/messages", fetchOpts);

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const contentBlocks = [];
  let idx = -1, curType = null, jsonBuf = "", textAccum = "", stopReason = "end_turn";

  try {
    while (true) {
      if (signal?.aborted) { break; }
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
  } catch (e) {
    if (e.name === "AbortError") { stopReason = "abort"; }
    else throw e;
  } finally {
    // Always release the reader to prevent memory leaks
    try { reader.cancel(); } catch {}
  }
  return { content: contentBlocks, stopReason, text: textAccum };
}

// Agent configuration defaults
const AGENT_DEFAULTS = {
  maxIterations: 8,
  thinkingBudget: 5000,
};

// Full agentic loop — streams text, executes local tools, loops until done
// callbacks: { onText, onNewTurn, onToolStart, onToolDone, onServerTool, executeTool, onLimitReached }
export async function runAgent(initialMessages, opts, callbacks, signal) {
  const maxIterations = opts.maxIterations || AGENT_DEFAULTS.maxIterations;
  let messages = [...initialMessages];
  let iterations = 0;

  while (iterations < maxIterations) {
    if (signal?.aborted) break;

    // Signal new turn so UI creates a fresh text block
    if (iterations > 0 && callbacks.onNewTurn) callbacks.onNewTurn();

    const turn = await streamOneTurn(
      messages, opts,
      (turnText) => { if (callbacks.onText) callbacks.onText(turnText); },
      (toolName, phase) => {
        if (phase === "start") {
          const isServer = toolName === "web_search" || toolName.includes("gmail") || toolName.includes("gcal") || toolName.includes("calendar");
          if (isServer && callbacks.onServerTool) callbacks.onServerTool(toolName);
        }
      },
      signal
    );

    if (turn.stopReason === "abort") break;

    messages.push({ role: "assistant", content: turn.content });

    if (turn.stopReason !== "tool_use") break;

    // Execute local tools sequentially, updating data between each
    const toolUseBlocks = turn.content.filter((b) => b.type === "tool_use");
    const toolResults = [];

    for (const block of toolUseBlocks) {
      if (signal?.aborted) break;
      if (callbacks.onToolStart) callbacks.onToolStart(block.name, block.input);
      // Small delay lets React state settle between tool executions
      await new Promise((r) => setTimeout(r, 16));
      let result;
      try {
        result = callbacks.executeTool(block.name, block.input);
      } catch (e) {
        result = JSON.stringify({ error: true, tool: block.name, message: e.message });
      }
      if (callbacks.onToolDone) callbacks.onToolDone(block.name, result);
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: typeof result === "string" ? result : JSON.stringify(result) });
    }

    messages.push({ role: "user", content: toolResults });
    iterations++;
  }

  // Warn if we hit the iteration limit
  if (iterations >= maxIterations && callbacks.onLimitReached) {
    callbacks.onLimitReached(iterations);
  }
}
