"use client";
import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, Segmented, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { DayPoint, projectDaily } from "@/lib/transform";
import { CHART, RED } from "@/lib/theme";
import { fmtBRL, fmtCompact, fmtInt, fmtDayMonth } from "@/lib/format";

type MetricKey = "spend" | "reach" | "impressions";
const METRICS: Record<MetricKey, { label: string; get: (d: DayPoint) => number; fmt: (n: number) => string }> = {
  spend: { label: "Investimento", get: (d) => d.kpis.spend, fmt: fmtBRL },
  reach: { label: "Alcance", get: (d) => d.kpis.reach, fmt: fmtInt },
  impressions: { label: "Impressões", get: (d) => d.kpis.impressions, fmt: fmtInt },
};

export function ProjectionChart({
  days,
  className = "",
}: {
  days: DayPoint[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("spend");
  const m = METRICS[metric];
  const { rows, hasProjection } = projectDaily(days, m.get, 3);
  const lastReal = days.length ? days[days.length - 1].date : null;

  return (
    <ChartCard
      title="Tendência e projeção"
      subtitle={
        hasProjection
          ? "Linha tracejada = projeção pela tendência dos dias observados"
          : "Projeção disponível a partir de 2 dias de dados"
      }
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
      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDayMonth}
                tick={{ fill: CHART.inkMuted, fontSize: 12 }}
                axisLine={{ stroke: CHART.axis }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: CHART.inkMuted, fontSize: 12 }}
                tickFormatter={(v) => (metric === "spend" ? fmtCompact(Number(v)) : fmtCompact(Number(v)))}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as { actual: number | null; projected: number | null };
                  const isProj = p.actual == null;
                  return (
                    <TooltipBox
                      title={fmtDayMonth(String(label))}
                      rows={[
                        {
                          label: isProj ? `${m.label} (projeção)` : m.label,
                          value: m.fmt(Number(isProj ? p.projected : p.actual)),
                          color: RED,
                        },
                      ]}
                    />
                  );
                }}
              />
              {lastReal && hasProjection && (
                <ReferenceLine
                  x={lastReal}
                  stroke={CHART.axis}
                  strokeDasharray="3 3"
                  label={{ value: "hoje", fill: CHART.inkMuted, fontSize: 10, position: "insideTopRight" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="none"
                fill="url(#projFill)"
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke={RED}
                strokeWidth={2.5}
                dot={{ r: 4, fill: RED, stroke: CHART.surface, strokeWidth: 2 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke={RED}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: CHART.surface, stroke: RED, strokeWidth: 2 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
