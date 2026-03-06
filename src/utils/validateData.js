import { SEED_DATA } from "../constants/seed";

/**
 * Validate and migrate persisted workspace data.
 * Returns cleaned data or SEED_DATA if corrupted.
 */
export function validateWorkspaceData(data) {
  if (!data || typeof data !== "object") return SEED_DATA;

  const cleaned = { ...data };

  // Ensure required arrays exist
  if (!Array.isArray(cleaned.leads)) cleaned.leads = SEED_DATA.leads;
  if (!Array.isArray(cleaned.pipeline)) cleaned.pipeline = SEED_DATA.pipeline;
  if (!Array.isArray(cleaned.activity)) cleaned.activity = [];

  // Validate leads have required fields
  cleaned.leads = cleaned.leads.filter((l) =>
    l && typeof l === "object" && l.id && l.name && l.source
  ).map((l) => ({
    id: l.id,
    name: l.name,
    source: l.source,
    detail: l.detail || "",
    score: typeof l.score === "number" ? Math.max(0, Math.min(100, l.score)) : 50,
    status: ["hot", "warm", "cold"].includes(l.status) ? l.status : "warm",
    revenue: typeof l.revenue === "number" ? l.revenue : 0,
    email: l.email || "",
  }));

  // Validate pipeline deals
  const validStages = ["lead", "outreach", "meeting", "tour", "proposal", "negotiation", "contract", "closed"];
  cleaned.pipeline = cleaned.pipeline.filter((d) =>
    d && typeof d === "object" && d.id && d.name && typeof d.value === "number"
  ).map((d) => ({
    id: d.id,
    name: d.name,
    value: d.value,
    stage: validStages.includes(d.stage) ? d.stage : "lead",
    prob: typeof d.prob === "number" ? Math.max(0, Math.min(100, d.prob)) : 30,
    date: d.date || "TBD",
  }));

  // Validate activity entries
  cleaned.activity = cleaned.activity.filter((a) =>
    a && typeof a === "object" && typeof a.text === "string"
  ).slice(0, 50);

  return cleaned;
}

/**
 * Validate profile data structure.
 */
export function validateProfile(profile) {
  if (!profile || typeof profile !== "object" || !profile.name) return null;

  return {
    name: profile.name,
    role: profile.role || "",
    industry: profile.industry || "other",
    org: profile.org || "",
    about: profile.about || "",
    voiceDesc: profile.voiceDesc || "Professional, warm, direct",
    voiceSamples: Array.isArray(profile.voiceSamples) ? profile.voiceSamples : [],
    workContext: profile.workContext || "",
    goals: profile.goals || "",
    modules: Array.isArray(profile.modules) ? profile.modules : ["command", "compose", "pipeline", "intel"],
  };
}
