"use client";
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
import { ChartCard, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { videoFunnel, Totals } from "@/lib/transform";
import { CHART, FUNNEL_RAMP } from "@/lib/theme";
import { fmtInt, fmtPct, fmtCompact } from "@/lib/format";

/* Curva de retenção de vídeo — barras de largura igual; comprimento = % que
   chega a cada etapa. Rótulo à direita = valor cheio; a % fica no tooltip.
   Taxa de retenção = quem assiste até o fim (100%) sobre as reproduções. */
export function VideoRetention({
  totals,
  className = "",
}: {
  totals: Totals;
  className?: string;
}) {
  const stages = videoFunnel(totals);
  const hasData = stages[0]?.value > 0;
  const data = stages.map((s, i) => ({ ...s, color: FUNNEL_RAMP[i] }));
  const retention = stages.find((s) => s.key === "p100")?.pct ?? 0;

  return (
    <ChartCard
      title="Retenção de vídeo"
      subtitle="Pessoas que chegam a cada etapa do vídeo"
      className={className}
      right={
        <div className="text-right leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Taxa de retenção
          </p>
          <p className="font-display text-xl text-[var(--pt-red)]">{fmtPct(retention, 1)}</p>
        </div>
      }
    >
      {!hasData ? (
        <EmptyState message="Sem dados de vídeo para este período." />
      ) : (
        <div className="h-[268px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 60, left: 4, bottom: 0 }}
              barCategoryGap={10}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: CHART.inkSecondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={88}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.label}
                      rows={[
                        { label: "Visualizações", value: fmtInt(payload[0].payload.value) },
                        { label: "% das reproduções", value: fmtPct(payload[0].payload.pct, 1) },
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="pct" radius={[0, 5, 5, 0]} barSize={20}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => fmtCompact(v)}
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
