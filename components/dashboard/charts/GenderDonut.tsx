"use client";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard, Select, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { BaseKey } from "@/lib/transform";
import { MetaRow } from "@/lib/types";
import { CHART, GENDER_COLORS } from "@/lib/theme";
import { num, fmtCompact, fmtInt, fmtPct, GENDER_LABEL, DEMO_METRIC_OPTIONS } from "@/lib/format";

export function GenderDonut({
  rows,
  className = "",
}: {
  rows: MetaRow[];
  className?: string;
}) {
  const [metric, setMetric] = useState<BaseKey>("reach");
  const data = useMemo(() => {
    const acc: Record<string, number> = { female: 0, male: 0, unknown: 0 };
    for (const r of rows) acc[r.gender] = (acc[r.gender] ?? 0) + num((r as never)[metric]);
    return (["female", "male", "unknown"] as const)
      .map((g) => ({ gender: g, label: GENDER_LABEL[g], value: acc[g] || 0 }))
      .filter((d) => d.value > 0);
  }, [rows, metric]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Divisão por gênero"
      subtitle="Participação de cada gênero"
      className={className}
      right={
        <Select
          className="w-44"
          value={metric as string}
          onChange={(v) => setMetric(v as BaseKey)}
          options={DEMO_METRIC_OPTIONS}
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
                    <Cell key={d.gender} fill={GENDER_COLORS[d.gender]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox
                        title={payload[0].payload.label}
                        rows={[
                          { label: "Total", value: fmtInt(payload[0].payload.value), color: GENDER_COLORS[payload[0].payload.gender] },
                          { label: "Participação", value: fmtPct((Number(payload[0].value) / (total || 1)) * 100, 1) },
                        ]}
                      />
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] uppercase tracking-wider text-ink-muted">Total</p>
              <p className="font-display text-2xl tabular text-ink sm:text-3xl">{fmtCompact(total)}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs">
            {data.map((d) => (
              <span key={d.gender} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: GENDER_COLORS[d.gender] }} />
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
