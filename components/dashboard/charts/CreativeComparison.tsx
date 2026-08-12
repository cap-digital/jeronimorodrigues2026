"use client";
import { useState } from "react";
import { ChartCard, Segmented, EmptyState } from "../ui";
import { CreativeStat } from "@/lib/transform";
import { CREATIVE_COLORS } from "@/lib/theme";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";

type MetricKey = "spend" | "reach" | "impressions" | "clicks" | "ctr" | "engagement";
const METRICS: Record<MetricKey, { label: string; get: (c: CreativeStat) => number; fmt: (n: number) => string }> = {
  spend: { label: "Investimento", get: (c) => c.kpis.spend, fmt: fmtBRL },
  reach: { label: "Alcance", get: (c) => c.kpis.reach, fmt: fmtInt },
  impressions: { label: "Impressões", get: (c) => c.kpis.impressions, fmt: fmtInt },
  clicks: { label: "Cliques", get: (c) => c.kpis.clicks, fmt: fmtInt },
  ctr: { label: "CTR", get: (c) => c.kpis.ctr, fmt: (n) => fmtPct(n) },
  engagement: { label: "Engajamento", get: (c) => c.kpis.actions_post_engagement, fmt: fmtInt },
};

export function CreativeComparison({
  creatives,
  className = "",
}: {
  creatives: CreativeStat[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("spend");
  const m = METRICS[metric];
  // cor segue o criativo (entidade), não o valor
  const colorOf = new Map(creatives.map((c, i) => [c.ad_name, CREATIVE_COLORS[i % CREATIVE_COLORS.length]]));
  // apenas os 7 melhores na métrica escolhida
  const data = creatives
    .map((c) => ({
      name: c.ad_name,
      value: m.get(c),
      color: colorOf.get(c.ad_name)!,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
  const max = Math.max(0, ...data.map((d) => d.value));

  return (
    <ChartCard
      title="Comparativo de criativos"
      subtitle={`7 melhores por ${m.label.toLowerCase()}`}
      className={className}
      right={
        <Segmented
          value={metric}
          onChange={(v) => setMetric(v as MetricKey)}
          options={[
            { value: "spend", label: "Invest." },
            { value: "reach", label: "Alcance" },
            { value: "clicks", label: "Cliques" },
            { value: "ctr", label: "CTR" },
            { value: "engagement", label: "Engaj." },
          ]}
        />
      }
    >
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {data.map((d) => {
            const pct = max > 0 && d.value > 0 ? Math.max(3, (d.value / max) * 100) : 0;
            return (
              <div key={d.name}>
                {/* nome do anúncio, completo (com AD XX e colchetes), em cima */}
                <p className="mb-1.5 text-[13px] leading-snug text-ink">{d.name}</p>
                {/* barra embaixo + valor na ponta */}
                <div className="flex items-center gap-3">
                  <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-surface-3">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{ width: `${pct}%`, background: d.color }}
                    />
                  </div>
                  <span className="w-[96px] shrink-0 text-right text-sm font-medium tabular text-ink">
                    {m.fmt(d.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}
