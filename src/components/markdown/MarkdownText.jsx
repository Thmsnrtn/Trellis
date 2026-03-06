import { C } from "../../constants/theme";
import { processInline } from "./processInline";
import { CodeBlock } from "./CodeBlock";
import { MarkdownTable } from "./MarkdownTable";

export function MarkdownText({ text }) {
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
          return <CodeBlock key={si} lang={lang} code={code} />;
        }
        // Detect tables (lines with |)
        const allLines = seg.split("\n");
        const rendered = [];
        let tableBuffer = [];

        const flushTable = () => {
          if (tableBuffer.length >= 2) {
            rendered.push(<MarkdownTable key={`t-${rendered.length}`} rows={tableBuffer} />);
          } else {
            tableBuffer.forEach((line) => rendered.push(renderLine(line, `${si}-fb-${rendered.length}`)));
          }
          tableBuffer = [];
        };

        const renderLine = (line, key) => {
          if (line.startsWith("### ")) return <div key={key} style={{ fontSize: 13, fontWeight: 700, color: C.t1, margin: "10px 0 3px" }}>{processInline(line.slice(4))}</div>;
          if (line.startsWith("## ")) return <div key={key} style={{ fontSize: 14, fontWeight: 700, color: C.t1, margin: "12px 0 3px" }}>{processInline(line.slice(3))}</div>;
          if (line.startsWith("# ")) return <div key={key} style={{ fontSize: 15, fontWeight: 700, color: C.t1, margin: "14px 0 4px" }}>{processInline(line.slice(2))}</div>;
          if (/^> /.test(line)) return <div key={key} style={{ paddingLeft: 12, borderLeft: `2px solid ${C.a}40`, color: C.t2, margin: "4px 0" }}>{processInline(line.slice(2))}</div>;
          if (/^[-*] /.test(line)) return <div key={key} style={{ paddingLeft: 10, display: "flex", gap: 6 }}><span style={{ color: C.t3, flexShrink: 0 }}>•</span><span>{processInline(line.slice(2))}</span></div>;
          if (/^\d+\.\s/.test(line)) { const m = line.match(/^(\d+)\.\s(.+)/); return m ? <div key={key} style={{ paddingLeft: 10, display: "flex", gap: 6 }}><span style={{ color: C.t3, flexShrink: 0 }}>{m[1]}.</span><span>{processInline(m[2])}</span></div> : <div key={key}>{line}</div>; }
          if (/^---+$|^\*\*\*+$|^___+$/.test(line.trim())) return <hr key={key} style={{ border: "none", borderTop: `1px solid ${C.b1}`, margin: "10px 0" }} />;
          if (!line.trim()) return <div key={key} style={{ height: 6 }} />;
          return <div key={key}>{processInline(line)}</div>;
        };

        allLines.forEach((line, li) => {
          const isTableRow = line.includes("|") && (line.trim().startsWith("|") || /\|.*\|/.test(line));
          if (isTableRow) {
            tableBuffer.push(line);
          } else {
            if (tableBuffer.length > 0) flushTable();
            rendered.push(renderLine(line, `${si}-${li}`));
          }
        });
        if (tableBuffer.length > 0) flushTable();

        return <span key={si}>{rendered}</span>;
      })}
    </div>
  );
}
