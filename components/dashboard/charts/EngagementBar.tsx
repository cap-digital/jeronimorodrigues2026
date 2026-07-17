"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { engagementBreakdown, Totals } from "@/lib/transform";
import { CHART, RED } from "@/lib/theme";
import { fmtInt } from "@/lib/format";

export function EngagementBar({
  totals,
  className = "",
}: {
  totals: Totals;
  className?: string;
}) {
  const data = engagementBreakdown(totals);
  return (
    <ChartCard
      id="engajamento"
      title="Interações com o conteúdo"
      subtitle="Tipos de engajamento gerados pela campanha"
      className={className}
    >
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 44, left: 4, bottom: 0 }}
              barCategoryGap={12}
            >
              <CartesianGrid stroke={CHART.grid} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART.inkMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtInt(Number(v))}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: CHART.inkSecondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={104}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      rows={[
                        {
                          label: payload[0].payload.label,
                          value: fmtInt(payload[0].payload.value),
                          color: RED,
                        },
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="value" fill={RED} radius={[0, 5, 5, 0]} barSize={20}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => fmtInt(v)}
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
