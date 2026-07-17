"use client";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard, Segmented, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { byPlatform } from "@/lib/transform";
import { PlacementRow } from "@/lib/types";
import { CHART, PLATFORM_COLORS } from "@/lib/theme";
import { fmtCompact, fmtInt, fmtPct, PLATFORM_LABEL } from "@/lib/format";

type Metric = "reach" | "impressions" | "spend";

export function PlatformDonut({
  rows,
  className = "",
  initialMetric = "reach",
}: {
  rows: PlacementRow[];
  className?: string;
  initialMetric?: Metric;
}) {
  const [metric, setMetric] = useState<Metric>(initialMetric);
  const split = byPlatform(rows);
  const total = split.reduce((s, p) => s + p[metric], 0);
  const data = split
    .map((p) => ({
      platform: p.platform,
      label: PLATFORM_LABEL[p.platform] ?? p.platform,
      value: p[metric],
    }))
    .filter((d) => d.value > 0);

  const unit = metric === "spend" ? "R$" : "";
  return (
    <ChartCard
      id="plataformas"
      title="Instagram × Facebook"
      subtitle="Participação por plataforma"
      className={className}
      right={
        <Segmented
          value={metric}
          onChange={(v) => setMetric(v as Metric)}
          options={[
            { value: "reach", label: "Alcance" },
            { value: "impressions", label: "Impr." },
            { value: "spend", label: "Invest." },
          ]}
        />
      }
    >
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <div className="relative h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="86%"
                paddingAngle={2}
                stroke={CHART.surface}
                strokeWidth={3}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((d) => (
                  <Cell key={d.platform} fill={PLATFORM_COLORS[d.platform] ?? CHART.inkMuted} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.label}
                      rows={[
                        {
                          label: metric === "spend" ? "Investido" : metric === "reach" ? "Alcance" : "Impressões",
                          value:
                            (unit ? "R$ " : "") +
                            (metric === "spend"
                              ? Number(payload[0].payload.value).toFixed(2)
                              : fmtInt(payload[0].payload.value)),
                          color: PLATFORM_COLORS[payload[0].payload.platform],
                        },
                        {
                          label: "Participação",
                          value: fmtPct((Number(payload[0].value) / (total || 1)) * 100, 1),
                        },
                      ]}
                    />
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
          {/* rótulo central */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Total</p>
            <p className="font-display text-2xl tabular sm:text-3xl">
              {metric === "spend" ? `R$ ${fmtCompact(total)}` : fmtCompact(total)}
            </p>
          </div>
          </div>
          {/* legenda */}
          <div className="mt-2 flex items-center justify-center gap-4 text-xs">
            {data.map((d) => (
              <span key={d.platform} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PLATFORM_COLORS[d.platform] }}
                />
                <span className="text-ink-secondary">
                  {d.label} · {fmtPct((d.value / (total || 1)) * 100, 0)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
