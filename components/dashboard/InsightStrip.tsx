"use client";
import { Insight } from "@/lib/transform";

const TONE: Record<Insight["tone"], { dot: string; label: string }> = {
  good: { dot: "var(--good)", label: "Destaque" },
  neutral: { dot: "var(--series-purple)", label: "Leitura" },
  warning: { dot: "var(--warning)", label: "Atenção" },
};

export function InsightStrip({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {insights.map((ins, i) => {
        const t = TONE[ins.tone];
        return (
          <div key={i} className="panel-2 fade-up flex gap-3 p-4">
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: t.dot }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-semibold text-ink">{ins.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                {ins.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
