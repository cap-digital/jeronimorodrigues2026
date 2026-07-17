"use client";
import { useState } from "react";
import { ChartCard, Segmented, EmptyState } from "../ui";
import { DayPoint, weekday } from "@/lib/transform";
import { heatColor } from "@/lib/theme";
import { fmtBRLCompact, fmtCompact, fmtBRL, fmtInt } from "@/lib/format";

type MetricKey = "spend" | "reach" | "impressions";
const METRICS: Record<MetricKey, { label: string; get: (d: DayPoint) => number; cell: (n: number) => string; full: (n: number) => string }> = {
  spend: { label: "Investimento", get: (d) => d.kpis.spend, cell: fmtBRLCompact, full: fmtBRL },
  reach: { label: "Alcance", get: (d) => d.kpis.reach, cell: fmtCompact, full: fmtInt },
  impressions: { label: "Impressões", get: (d) => d.kpis.impressions, cell: fmtCompact, full: fmtInt },
};

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Seg..Dom
const LABEL: Record<number, string> = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
const FULL: Record<number, string> = { 0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado" };

export function WeekdayHeatmap({
  days,
  className = "",
}: {
  days: DayPoint[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("spend");
  const m = METRICS[metric];

  const sums: Record<number, number> = {};
  const counts: Record<number, number> = {};
  for (const d of days) {
    const wd = weekday(d.date);
    sums[wd] = (sums[wd] ?? 0) + m.get(d);
    counts[wd] = (counts[wd] ?? 0) + 1;
  }
  const cells = ORDER.map((wd) => {
    const c = counts[wd] ?? 0;
    return { wd, label: LABEL[wd], avg: c ? (sums[wd] ?? 0) / c : 0, count: c };
  });
  const max = Math.max(1, ...cells.map((c) => c.avg));
  const hasData = cells.some((c) => c.count > 0);

  // análises escritas a partir dos próprios dados
  const withData = cells.filter((c) => c.count > 0).sort((a, b) => b.avg - a.avg);
  const best = withData[0];
  const worst = withData[withData.length - 1];
  const missing = cells.filter((c) => c.count === 0).map((c) => c.label);
  const analyses: string[] = [];
  if (best) {
    analyses.push(`${FULL[best.wd]} é o melhor dia em ${m.label.toLowerCase()}, com média de ${m.full(best.avg)}.`);
  }
  if (withData.length >= 2 && best.avg > 0) {
    const diff = ((best.avg - worst.avg) / best.avg) * 100;
    analyses.push(
      diff < 1
        ? `${FULL[worst.wd]} tem desempenho praticamente igual (${m.full(worst.avg)}).`
        : `${FULL[worst.wd]} é o mais fraco (${m.full(worst.avg)}), ${Math.round(diff)}% abaixo de ${FULL[best.wd].toLowerCase()}.`
    );
  }
  if (missing.length) {
    analyses.push(
      missing.length >= 5
        ? `Ainda sem entregas em ${missing.length} dias da semana — o mapa se completa conforme a campanha avança.`
        : `Ainda sem dados em ${missing.join(", ")}.`
    );
  }

  return (
    <ChartCard
      title="Desempenho por dia da semana"
      subtitle="Média por dia da semana — preenche ao longo da campanha"
      className={className}
      right={
        <Segmented
          value={metric}
          onChange={(v) => setMetric(v as MetricKey)}
          options={[
            { value: "spend", label: "Invest." },
            { value: "reach", label: "Alcance" },
            { value: "impressions", label: "Impr." },
          ]}
        />
      }
    >
      {!hasData ? (
        <EmptyState />
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-2 pt-2">
            {cells.map((c) => {
              const t = c.avg / max;
              const bright = t > 0.55;
              return (
                <div key={c.wd} className="text-center" title={c.count ? `${c.label}: ${m.full(c.avg)} (média de ${c.count} dia${c.count > 1 ? "s" : ""})` : `${c.label}: sem dados`}>
                  <p className="mb-1.5 text-[11px] font-medium text-ink-muted">{c.label}</p>
                  <div
                    className="grid h-20 place-items-center rounded-xl ring-1 ring-inset ring-black/5"
                    style={{ background: heatColor(t) }}
                  >
                    <span className={`tabular text-xs font-semibold ${bright ? "text-white" : "text-ink-secondary"}`}>
                      {c.count ? m.cell(c.avg) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {analyses.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Análise
              </p>
              <ul className="space-y-2">
                {analyses.map((a, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--pt-red)]" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}
