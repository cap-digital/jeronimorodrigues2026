"use client";

/* Minigráfico de linha (SVG puro, sem dependência de Recharts). */
function MiniSpark({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const w = 96;
  const h = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`;
  const id = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  caption,
  spark,
  color = "var(--pt-red-bright)",
  hero = false,
}: {
  label: string;
  value: string;
  caption?: string;
  spark?: number[];
  color?: string;
  hero?: boolean;
}) {
  return (
    <div
      className={`panel-2 fade-up flex flex-col justify-between p-4 ${
        hero ? "sm:p-5" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </p>
        {hero && spark && <MiniSpark data={spark} color={color} />}
      </div>
      <div className="mt-2">
        <p
          className={`font-display tabular leading-none ${
            hero ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {value}
        </p>
        {caption && (
          <p className="mt-2.5 border-t pt-2 text-xs font-medium text-ink-secondary">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
