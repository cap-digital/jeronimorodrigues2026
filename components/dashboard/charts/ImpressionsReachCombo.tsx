"use client";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { DayPoint } from "@/lib/transform";
import { CHART, SERIES } from "@/lib/theme";
import { fmtCompact, fmtInt, fmtDec, fmtDayMonth } from "@/lib/format";

/* Impressões (barras) e Alcance (linha) — mesma unidade (pessoas/exibições),
   portanto um único eixo Y (sem eixo duplo). A distância entre eles é a
   frequência. */
export function ImpressionsReachCombo({
  days,
  className = "",
}: {
  days: DayPoint[];
  className?: string;
}) {
  const data = days.map((d) => ({
    date: d.date,
    impressions: d.kpis.impressions,
    reach: d.kpis.reach,
    freq: d.kpis.frequency,
  }));

  return (
    <ChartCard
      title="Impressões e alcance por dia"
      subtitle="Barras = impressões · linha = pessoas alcançadas"
      className={className}
      right={
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERIES.red }} />
            <span className="text-ink-secondary">Impressões</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-full" style={{ background: SERIES.purple }} />
            <span className="text-ink-secondary">Alcance</span>
          </span>
        </div>
      }
    >
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
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
                tickFormatter={(v) => fmtCompact(Number(v))}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={fmtDayMonth(String(label))}
                      rows={[
                        { label: "Impressões", value: fmtInt(payload[0].payload.impressions), color: SERIES.red },
                        { label: "Alcance", value: fmtInt(payload[0].payload.reach), color: SERIES.purple },
                        { label: "Frequência", value: fmtDec(payload[0].payload.freq) },
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="impressions" fill={SERIES.red} radius={[5, 5, 0, 0]} maxBarSize={64} />
              <Line
                type="monotone"
                dataKey="reach"
                stroke={SERIES.purple}
                strokeWidth={2.5}
                dot={{ r: 4, fill: SERIES.purple, stroke: CHART.surface, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
