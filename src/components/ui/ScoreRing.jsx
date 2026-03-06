import { C } from "../../constants/theme";

export function ScoreRing({ score, size = 36 }) {
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
