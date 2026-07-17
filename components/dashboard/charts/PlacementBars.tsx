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
import { byPlacement } from "@/lib/transform";
import { PlacementRow } from "@/lib/types";
import { CHART, PLATFORM_COLORS } from "@/lib/theme";
import { fmtBRL, fmtInt, fmtPct, PLATFORM_LABEL, POSITION_LABEL } from "@/lib/format";

type MetricKey = "spend" | "impressions" | "clicks";
const METRICS: Record<MetricKey, { label: string; fmt: (n: number) => string; get: (p: ReturnType<typeof byPlacement>[number]) => number }> = {
  spend: { label: "Investimento", fmt: fmtBRL, get: (p) => p.spend },
  impressions: { label: "Impressões", fmt: fmtInt, get: (p) => p.impressions },
  clicks: { label: "Cliques", fmt: fmtInt, get: (p) => p.clicks },
};

export function PlacementBars({
  rows,
  className = "",
}: {
  rows: PlacementRow[];
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricKey>("spend");
  const m = METRICS[metric];
  const places = byPlacement(rows);
  const total = places.reduce((s, p) => s + m.get(p), 0) || 1;
  const data = places
    .map((p) => ({
      name: `${PLATFORM_LABEL[p.publisher_platform] ?? p.publisher_platform} · ${POSITION_LABEL[p.platform_position] ?? p.platform_position}`,
      value: m.get(p),
      color: PLATFORM_COLORS[p.publisher_platform] ?? CHART.inkMuted,
      ctr: p.ctr,
      cpc: p.cpc,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard
      title="Desempenho por posicionamento"
      subtitle="Onde a verba e a entrega estão concentradas"
      className={className}
      right={
        <Segmented
          value={metric}
          onChange={(v) => setMetric(v as MetricKey)}
          options={[
            { value: "spend", label: "Invest." },
            { value: "impressions", label: "Impr." },
            { value: "clicks", label: "Cliques" },
          ]}
        />
      }
    >
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 60, left: 4, bottom: 0 }}
              barCategoryGap={8}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: CHART.inkSecondary, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={128}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.name}
                      rows={[
                        { label: m.label, value: m.fmt(payload[0].payload.value), color: payload[0].payload.color },
                        { label: "Participação", value: fmtPct((payload[0].payload.value / total) * 100, 1) },
                        { label: "CTR", value: fmtPct(payload[0].payload.ctr) },
                        { label: "CPC", value: fmtBRL(payload[0].payload.cpc) },
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => m.fmt(v)}
                  fill={CHART.inkSecondary}
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
