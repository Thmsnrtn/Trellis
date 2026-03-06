import { ALL_MODULES } from "../constants/modules";

// ── Local Agent Tools ─────────────────────────────────
export const LOCAL_TOOLS = [
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

export function executeLocalTool(name, input, data, setData, addActivity, profile, setProfile) {
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
