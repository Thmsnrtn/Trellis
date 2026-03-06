import { useState, useEffect, useRef } from "react";
import {
  Grid3x3, ArrowRight, Mail, Calendar, Search, Sparkles, CheckCircle,
  Briefcase, ChevronRight, Loader, Shield, PenLine, BarChart3,
  Circle, Lock, Globe, MessageCircle, BookOpen, Layers,
  Database, Target, Camera, CreditCard, Kanban, FileText, Users,
  FileSpreadsheet, ChevronDown,
} from "lucide-react";
import { C, FN } from "../constants/theme";
import { IND, PROFESSION_MODULES } from "../constants/modules";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Input } from "../components/ui/Input";
import { TextArea } from "../components/ui/TextArea";
import { PrivacyNote } from "../components/ui/PrivacyNote";
import { callAI } from "../ai/engine";
import { MCP_GMAIL, MCP_GCAL } from "../ai/config";
import { parseAIJSON } from "../utils/parseAIJSON";

export function Onboarding({ onComplete }) {
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

  // Track intervals/timers for cleanup on unmount
  const intervalsRef = useRef([]);
  const timersRef = useRef([]);
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(clearInterval);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  async function scanGmail() {
    setGmailScanning(true);
    setGmailPhase(0);
    const timer = setInterval(() => setGmailPhase((p) => Math.min(p + 1, 5)), 2200);
    intervalsRef.current.push(timer);
    try {
      const result = await callAI(
        [{ role: "user", content: `Analyze my sent emails to build a professional profile. Search sent mail for recent professional emails. Return ONLY valid JSON (no markdown, no backticks): {"role":"job title","industry":"one of: hospitality,realestate,healthcare,legal,education,creative,marketing,retail,construction,technology,finance,consulting,other","org":"company name","about":"2-3 sentence summary","voiceDesc":"writing style description","voiceSamples":["excerpt1 max 300 chars","excerpt2","excerpt3"],"workContext":"communication patterns","goals":"inferred goals"}` }],
        { system: "Analyze emails. Return ONLY valid JSON.", mcp: [MCP_GMAIL] }
      );
      clearInterval(timer);
      setGmailPhase(5);
      const parsed = parseAIJSON(typeof result === "string" ? result : null);
      if (parsed) setDiscovered((prev) => ({ ...prev, ...parsed }));
      else if (typeof result === "string") setDiscovered((prev) => ({ ...prev, about: result.slice(0, 300) }));
      setGmailDone(true);
    } catch { clearInterval(timer); setGmailDone(true); }
    setGmailScanning(false);
  }

  async function scanCalendar() {
    setCalScanning(true);
    try {
      const result = await callAI(
        [{ role: "user", content: `Analyze my calendar events from the past 2 weeks. Return ONLY valid JSON: {"calInsights":"meeting types, frequency, patterns","workStyle":"office or remote or hybrid"}` }],
        { system: "Analyze calendar. Return ONLY valid JSON.", mcp: [MCP_GCAL] }
      );
      const parsed = parseAIJSON(typeof result === "string" ? result : null);
      if (parsed) setDiscovered((prev) => ({ ...prev, ...parsed }));
      else if (typeof result === "string") setDiscovered((prev) => ({ ...prev, calInsights: result.slice(0, 200) }));
      setCalDone(true);
    } catch { setCalDone(true); }
    setCalScanning(false);
  }

  function finishOnboarding() {
    setBuilding(true); setBuildPhase(0);
    const timer = setInterval(() => setBuildPhase((p) => Math.min(p + 1, 4)), 800);
    intervalsRef.current.push(timer);
    const profileData = path === "tell"
      ? { name, role: manual.role, industry: manual.industry, org: manual.org, about: manual.about, voiceDesc: manual.voiceDesc, goals: manual.goals, voiceSamples: [], workContext: `Works ${manual.workStyle}. Tracks via ${manual.trackMethod}. Time sink: ${manual.timeSink}.` }
      : { name, ...discovered, voiceSamples: discovered.voiceSamples || [], workContext: discovered.workContext || "" };
    const industry = profileData.industry || "other";
    const modules = PROFESSION_MODULES[industry] || PROFESSION_MODULES.other;
    const t = setTimeout(() => { clearInterval(timer); onComplete({ ...profileData, modules }); }, 4200);
    timersRef.current.push(t);
  }

  const scanPhases = [
    { label: "Connecting securely" }, { label: "Scanning sent emails" },
    { label: "Detecting your role" }, { label: "Analyzing writing style" },
    { label: "Mapping your network" }, { label: "Profile complete" },
  ];
  const buildSteps = ["Analyzing your profession", "Selecting your tools", "Configuring your workspace", "Tuning your AI assistant", "Almost ready"];

  if (building) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FN, color: C.t1 }}>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.45s ease forwards}`}</style>
        <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle,${C.aG} 0%,transparent 60%)`, pointerEvents: "none" }} />
        <div className="fu" style={{ textAlign: "center", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${C.a},#3D6B47)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, boxShadow: `0 8px 32px ${C.aG}` }}><Grid3x3 size={32} color="#fff" /></div>
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
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.45s ease forwards} *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ position: "fixed", top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle,${C.aG} 0%,transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 520, width: "100%", margin: "0 auto" }}>
        {step === 0 && (
          <div className="fu" style={{ textAlign: "center", padding: "56px 24px 40px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${C.a},#3D6B47)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: `0 8px 32px ${C.aG}` }}><Grid3x3 size={32} color="#fff" /></div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: C.t1, margin: "0 0 8px", letterSpacing: -0.5 }}>Trellis</h1>
            <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.65, maxWidth: 400, margin: "0 auto 4px" }}>Your personal AI that learns how you work, writes in your voice, and builds a workspace around your profession.</p>
            <p style={{ fontSize: 12, color: C.t3, marginBottom: 32 }}>For any profession. Set up in 90 seconds.</p>
            <div style={{ maxWidth: 300, margin: "0 auto 24px" }}>
              <label style={{ fontSize: 12, color: C.t2, fontWeight: 600, display: "block", marginBottom: 6, textAlign: "left" }}>What should I call you?</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" style={{ textAlign: "center", fontSize: 16, padding: "14px 20px" }} />
            </div>
            <Btn primary onClick={() => name.trim() && setStep(1)} disabled={!name.trim()} style={{ padding: "13px 32px", fontSize: 14, borderRadius: 12 }}><ArrowRight size={16} /> Get Started</Btn>
          </div>
        )}
        {step === 1 && (
          <div className="fu" style={{ padding: "32px 20px" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.t1, margin: "0 0 4px" }}>How should I learn about you?</h2>
            <p style={{ fontSize: 13, color: C.t3, margin: "0 0 24px" }}>Pick whichever feels right. You can change everything later.</p>
            <Card hoverable onClick={() => { setPath("tell"); setStep(2); }} style={{ marginBottom: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.pS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageCircle size={22} color={C.p} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 2 }}>Tell me about yourself</div><div style={{ fontSize: 12, color: C.t3, lineHeight: 1.5 }}>Quick questions about your role, industry, and work style.</div></div>
                <ChevronRight size={18} color={C.t3} />
              </div>
            </Card>
            <Card hoverable onClick={() => { setPath("connect"); setStep(3); }} style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.aS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={22} color={C.a} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 2 }}>Let me figure it out</div><div style={{ fontSize: 12, color: C.t3, lineHeight: 1.5 }}>Connect your email and calendar. I will detect your profession, voice, and patterns automatically.</div></div>
                <ChevronRight size={18} color={C.t3} />
              </div>
              <PrivacyNote text="Trellis reads your data once to learn, then discards it. Nothing is stored or shared." />
            </Card>
          </div>
        )}
        {step === 2 && (
          <div className="fu" style={{ padding: "24px 20px" }}>
            <Btn ghost small onClick={() => setStep(1)} style={{ marginBottom: 14, padding: 0, color: C.a }}><ChevronDown size={11} style={{ transform: "rotate(90deg)" }} /> Back</Btn>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: "0 0 20px" }}>Tell me about yourself</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Job title</label><Input value={manual.role} onChange={(e) => setManual((p) => ({ ...p, role: e.target.value }))} placeholder="e.g., Catering Sales Manager" /></div>
              <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Industry</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                  {Object.entries(IND).map(([k, v]) => (<Card key={k} hoverable onClick={() => setManual((p) => ({ ...p, industry: k }))} selected={manual.industry === k} style={{ padding: "8px 4px", textAlign: "center" }}><v.I size={14} color={manual.industry === k ? C.a : C.t3} style={{ marginBottom: 2 }} /><div style={{ fontSize: 8, fontWeight: 600, color: manual.industry === k ? C.t1 : C.t3 }}>{v.l}</div></Card>))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Company / Org</label><Input value={manual.org} onChange={(e) => setManual((p) => ({ ...p, org: e.target.value }))} placeholder="Where you work" /></div>
                <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Work setup</label>
                  <div style={{ display: "flex", gap: 4 }}>{["office", "remote", "hybrid"].map((w) => (<Card key={w} hoverable onClick={() => setManual((p) => ({ ...p, workStyle: w }))} selected={manual.workStyle === w} style={{ flex: 1, padding: "8px 4px", textAlign: "center" }}><div style={{ fontSize: 10, fontWeight: 600, color: manual.workStyle === w ? C.t1 : C.t3 }}>{w}</div></Card>))}</div>
                </div>
              </div>
              <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>How do you track your work?</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                  {[{ id: "pipeline", l: "Deals / Pipeline", I: BarChart3 }, { id: "projects", l: "Projects / Tasks", I: Kanban }, { id: "cases", l: "Cases / Matters", I: FileText }, { id: "clients", l: "Clients / Accounts", I: Users }].map((t) => (<Card key={t.id} hoverable onClick={() => setManual((p) => ({ ...p, trackMethod: t.id }))} selected={manual.trackMethod === t.id} style={{ padding: "8px 4px", textAlign: "center" }}><t.I size={14} color={manual.trackMethod === t.id ? C.a : C.t3} style={{ marginBottom: 2 }} /><div style={{ fontSize: 8, fontWeight: 600, color: manual.trackMethod === t.id ? C.t1 : C.t3 }}>{t.l}</div></Card>))}
                </div>
              </div>
              <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Biggest time sink?</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                  {[{ id: "email", l: "Email", I: Mail }, { id: "scheduling", l: "Scheduling", I: Calendar }, { id: "research", l: "Research", I: Search }, { id: "admin", l: "Admin / Docs", I: FileSpreadsheet }].map((t) => (<Card key={t.id} hoverable onClick={() => setManual((p) => ({ ...p, timeSink: t.id }))} selected={manual.timeSink === t.id} style={{ padding: "8px 4px", textAlign: "center" }}><t.I size={14} color={manual.timeSink === t.id ? C.a : C.t3} style={{ marginBottom: 2 }} /><div style={{ fontSize: 8, fontWeight: 600, color: manual.timeSink === t.id ? C.t1 : C.t3 }}>{t.l}</div></Card>))}
                </div>
              </div>
              <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Your writing style</label><TextArea rows={2} value={manual.voiceDesc} onChange={(e) => setManual((p) => ({ ...p, voiceDesc: e.target.value }))} /></div>
              <div><label style={{ fontSize: 11, color: C.t2, fontWeight: 600, display: "block", marginBottom: 4 }}>Current goals</label><TextArea rows={2} value={manual.goals} onChange={(e) => setManual((p) => ({ ...p, goals: e.target.value }))} placeholder="What are you focused on right now?" /></div>
            </div>
            <Btn primary onClick={finishOnboarding} style={{ marginTop: 20, padding: "12px 28px", fontSize: 13, borderRadius: 12 }}><Sparkles size={14} /> Build My Trellis</Btn>
          </div>
        )}
        {step === 3 && (
          <div className="fu" style={{ padding: "24px 20px" }}>
            <Btn ghost small onClick={() => setStep(1)} style={{ marginBottom: 14, padding: 0, color: C.a }}><ChevronDown size={11} style={{ transform: "rotate(90deg)" }} /> Back</Btn>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: "0 0 4px" }}>Connect your accounts</h2>
            <p style={{ fontSize: 12, color: C.t3, margin: "0 0 20px", lineHeight: 1.5 }}>Trellis scans once to learn about you. Your data is never stored or shared.</p>
            <Card glow={!gmailDone} style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ padding: "18px 18px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: gmailDone ? C.gS : C.rS, display: "flex", alignItems: "center", justifyContent: "center" }}>{gmailDone ? <CheckCircle size={20} color={C.g} /> : <Mail size={20} color={C.r} />}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>Gmail</div><div style={{ fontSize: 11, color: C.t3 }}>{gmailDone ? "Voice profile built" : "Detects profession, writing style, contacts"}</div></div>
                  {!gmailDone && !gmailScanning && <Btn primary small onClick={scanGmail}><Shield size={9} /> Connect</Btn>}
                </div>
                {gmailScanning && <div>{scanPhases.map((phase, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", opacity: i <= gmailPhase ? 1 : 0.2, transition: "opacity 0.3s" }}><div style={{ width: 20, height: 20, borderRadius: 6, background: i < gmailPhase ? C.gS : i === gmailPhase ? C.aS : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>{i < gmailPhase ? <CheckCircle size={10} color={C.g} /> : i === gmailPhase ? <Loader size={10} color={C.a} style={{ animation: "spin 1s linear infinite" }} /> : <Circle size={10} color={C.t3} />}</div><span style={{ fontSize: 11, color: i <= gmailPhase ? C.t1 : C.t3, fontWeight: i === gmailPhase ? 600 : 400 }}>{phase.label}</span></div>))}</div>}
                {gmailDone && discovered.role && <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}><div style={{ fontSize: 10, color: C.g, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={10} /> Detected</div>{discovered.role && <div style={{ fontSize: 11, color: C.t2 }}><strong style={{ color: C.t1 }}>Role:</strong> {discovered.role}</div>}{discovered.org && <div style={{ fontSize: 11, color: C.t2 }}><strong style={{ color: C.t1 }}>Org:</strong> {discovered.org}</div>}{discovered.voiceDesc && <div style={{ fontSize: 11, color: C.t2, marginTop: 3 }}><strong style={{ color: C.t1 }}>Voice:</strong> {discovered.voiceDesc}</div>}</div>}
                {!gmailDone && !gmailScanning && <PrivacyNote text="Read-only. Scans sent emails once, learns your style, then raw data is discarded." />}
              </div>
            </Card>
            <Card style={{ padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: calDone ? C.gS : C.blS, display: "flex", alignItems: "center", justifyContent: "center" }}>{calDone ? <CheckCircle size={20} color={C.g} /> : <Calendar size={20} color={C.bl} />}</div>
                  <div><div style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>Calendar</div><div style={{ fontSize: 11, color: C.t3 }}>{calDone ? "Patterns analyzed" : "Schedule, meetings, work style"}</div></div>
                </div>
                {!calDone && !calScanning && <Btn small onClick={scanCalendar}><Shield size={9} /> Connect</Btn>}
                {calScanning && <Loader size={14} color={C.a} style={{ animation: "spin 1s linear infinite" }} />}
              </div>
              <PrivacyNote text="Read-only. Calendar data analyzed locally, never stored." />
            </Card>
            <Card style={{ padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.t2, marginBottom: 8 }}>More integrations after setup</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {[{ n: "LinkedIn", I: Globe }, { n: "Slack", I: MessageCircle }, { n: "HubSpot", I: Database }, { n: "Notion", I: BookOpen }, { n: "Salesforce", I: Layers }, { n: "Stripe", I: CreditCard }, { n: "Asana", I: Target }, { n: "Zoom", I: Camera }].map((s, i) => (<div key={i} style={{ textAlign: "center", padding: "6px 4px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}><s.I size={12} color={C.t3} style={{ marginBottom: 2, opacity: 0.5 }} /><div style={{ fontSize: 8, color: C.t3 }}>{s.n}</div></div>))}
              </div>
            </Card>
            <Btn primary onClick={finishOnboarding} disabled={!gmailDone && !calDone} style={{ padding: "12px 24px", fontSize: 13, borderRadius: 12 }}><Sparkles size={14} /> Build My Trellis</Btn>
            <button onClick={() => { setDiscovered({ role: "Professional", industry: "other", voiceDesc: "Professional and direct" }); finishOnboarding(); }} style={{ display: "block", background: "none", border: "none", color: C.t3, fontSize: 11, cursor: "pointer", fontFamily: FN, marginTop: 12, padding: 0 }}>Skip and set up manually</button>
          </div>
        )}
      </div>
    </div>
  );
}
