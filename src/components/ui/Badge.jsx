export function Badge({ children, color, bg, Icon, small }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: small ? "2px 7px" : "3px 10px",
        borderRadius: 20,
        fontSize: small ? 9 : 10,
        fontWeight: 600,
        color,
        background: bg,
      }}
    >
      {Icon && <Icon size={small ? 8 : 9} />}
      {children}
    </span>
  );
}
