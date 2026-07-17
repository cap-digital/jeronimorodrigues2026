"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, Segmented, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { CreativeStat, themeCreative } from "@/lib/transform";
import { CHART, CREATIVE_COLORS } from "@/lib/theme";
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
  const data = creatives
    .map((c) => ({
      name: themeCreative(c.ad_name),
      short: c.short,
      value: m.get(c),
      color: colorOf.get(c.ad_name)!,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard
      title="Comparativo de criativos"
      subtitle={`Criativos ordenados por ${m.label.toLowerCase()}`}
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
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 64, left: 4, bottom: 0 }}
              barCategoryGap={16}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: CHART.inkSecondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={78}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.name}
                      rows={[{ label: m.label, value: m.fmt(payload[0].payload.value), color: payload[0].payload.color }]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => m.fmt(v)}
                  fill={CHART.inkSecondary}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
