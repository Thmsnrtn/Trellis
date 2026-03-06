import { C } from "../../constants/theme";

export function processInline(text) {
  const parts = [];
  let rem = text;
  let k = 0;
  // Match: **bold**, `code`, [text](url), ~~strike~~
  const rx = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|~~(.+?)~~)/;
  while (rem) {
    const m = rem.match(rx);
    if (!m) { parts.push(rem); break; }
    if (m.index > 0) parts.push(rem.slice(0, m.index));
    if (m[2]) parts.push(<strong key={k++} style={{ color: C.t1, fontWeight: 600 }}>{m[2]}</strong>);
    else if (m[3]) parts.push(<code key={k++} style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4, fontSize: "0.9em" }}>{m[3]}</code>);
    else if (m[4] && m[5]) parts.push(<a key={k++} href={m[5]} target="_blank" rel="noopener noreferrer" style={{ color: C.a, textDecoration: "underline", textUnderlineOffset: 2 }}>{m[4]}</a>);
    else if (m[6]) parts.push(<span key={k++} style={{ textDecoration: "line-through", color: C.t3 }}>{m[6]}</span>);
    rem = rem.slice(m.index + m[0].length);
  }
  return parts;
}
