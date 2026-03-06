import { C, FN } from "../../constants/theme";

export function Input(props) {
  return (
    <input
      {...props}
      style={{
        padding: "10px 14px", borderRadius: 10, background: C.s2,
        border: `1px solid ${C.b1}`, color: C.t1, fontSize: 13,
        outline: "none", fontFamily: FN, width: "100%",
        ...(props.style || {}),
      }}
    />
  );
}
