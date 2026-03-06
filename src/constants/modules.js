import {
  Sun, PenLine, BarChart3, Target, Calendar, Radar, Map, Receipt,
  Kanban, Timer, Home, FileText, Stethoscope, Palette, Megaphone,
  Coffee, Scale, GraduationCap, ShoppingBag, Hammer, Cpu, Landmark,
  Briefcase, Layers,
} from "lucide-react";

// ── Industry Map ───────────────────────────────────────
export const IND = {
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
export const ALL_MODULES = {
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

export const PROFESSION_MODULES = {
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
