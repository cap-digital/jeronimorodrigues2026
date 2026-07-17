"use client";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, Segmented, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { DayPoint } from "@/lib/transform";
import { CHART, RED } from "@/lib/theme";
import { fmtBRL, fmtCompact, fmtInt, fmtPct, fmtDayMonth } from "@/lib/format";

type MetricKey = "spend" | "reach" | "impressions" | "clicks" | "ctr" | "engagement";

const METRICS: Record<
  MetricKey,
  { label: string; get: (d: DayPoint) => number; fmt: (n: number) => string }
> = {
  spend: { label: "Investimento", get: (d) => d.kpis.spend, fmt: fmtBRL },
  reach: { label: "Alcance", get: (d) => d.kpis.reach, fmt: fmtInt },
  impressions: { label: "Impressões", get: (d) => d.kpis.impressions, fmt: fmtInt },
  clicks: { label: "Cliques", get: (d) => d.kpis.clicks, fmt: fmtInt },
  ctr: { label: "CTR", get: (d) => d.kpis.ctr, fmt: (n) => fmtPct(n) },
  engagement: {
    label: "Engajamento",
    get: (d) => d.kpis.actions_post_engagement,
    fmt: fmtInt,
  },
};

export function TrendChart({
  days,
  className = "",
}: {
  days: DayPoint[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("spend");
  const m = METRICS[metric];
  const data = days.map((d) => ({ date: d.date, value: m.get(d) }));

  return (
    <ChartCard
      id="visao-geral"
      title="Evolução diária"
      subtitle="Desempenho da campanha por dia"
      className={className}
      right={
        <Segmented
          value={metric}
          onChange={(v) => setMetric(v as MetricKey)}
          options={[
            { value: "spend", label: "Invest." },
            { value: "reach", label: "Alcance" },
            { value: "impressions", label: "Impr." },
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
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
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
                tickFormatter={(v) =>
                  metric === "ctr"
                    ? fmtPct(v, 1)
                    : metric === "spend"
                    ? fmtCompact(v)
                    : fmtCompact(v)
                }
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={fmtDayMonth(String(label))}
                      rows={[
                        {
                          label: m.label,
                          value: m.fmt(Number(payload[0].value)),
                          color: RED,
                        },
                      ]}
                    />
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={RED}
                strokeWidth={2.5}
                fill="url(#trendFill)"
                dot={{ r: 4, fill: RED, stroke: CHART.surface, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: RED, stroke: CHART.surface, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
