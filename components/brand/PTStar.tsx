/* Estrela do PT (cinco pontas) com CANTOS ARREDONDADOS — como o logo oficial.
   O arredondamento vem do stroke da mesma cor com junções redondas. */
const STAR_PATH =
  "M16 3.5 L19.59 11.07 L27.89 12.14 L21.8 17.88 L23.35 26.11 L16 22.1 L8.65 26.11 L10.2 17.88 L4.11 12.14 L12.41 11.07 Z";

export function PTStar({
  className = "",
  variant = "white",
}: {
  className?: string;
  variant?: "white" | "red" | "current";
}) {
  const color =
    variant === "white" ? "#ffffff" : variant === "red" ? "#e4142c" : "currentColor";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d={STAR_PATH}
        fill={color}
        stroke={color}
        strokeWidth={2.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Selo circular vermelho com PT — marca compacta alternativa. */
export function PTBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid place-items-center rounded-full ${className}`}
      style={{ background: "var(--pt-gradient)" }}
    >
      <span className="font-display leading-none text-white select-none" style={{ fontSize: "0.5em" }}>
        PT
      </span>
    </span>
  );
}
