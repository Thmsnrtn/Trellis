import { useState } from "react";
import { C } from "../../constants/theme";

export function Card({ children, style, onClick, hoverable, glow, selected }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected
          ? "rgba(107,158,120,0.07)"
          : hovered && hoverable
          ? C.s2
          : C.s1,
        borderRadius: 14,
        border: `1px solid ${ selected ? "rgba(107,158,120,0.2)" : hovered && hoverable ? C.b2 : C.b1 }`,
        padding: 16,
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        transform: hovered && hoverable ? "translateY(-1px)" : "none",
        boxShadow: glow ? `0 0 30px ${C.aG}` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
