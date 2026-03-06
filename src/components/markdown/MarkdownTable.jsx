import { C } from "../../constants/theme";
import { processInline } from "./processInline";

export function MarkdownTable({ rows }) {
  if (!rows || rows.length < 2) return null;
  const headers = rows[0].split("|").map((c) => c.trim()).filter(Boolean);
  const dataRows = rows.slice(2).filter((r) => r.includes("|")); // skip separator row
  return (
    <div style={{ overflowX: "auto", margin: "8px 0", borderRadius: 8, border: `1px solid ${C.b1}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i} style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600, color: C.t1, borderBottom: `1px solid ${C.b1}`, background: "rgba(255,255,255,0.02)" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => {
            const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
            return <tr key={ri}>{cells.map((c, ci) => <td key={ci} style={{ padding: "5px 10px", color: C.t2, borderBottom: `1px solid ${C.b1}` }}>{processInline(c)}</td>)}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
