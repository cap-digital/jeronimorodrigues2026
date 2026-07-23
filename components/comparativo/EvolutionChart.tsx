"use client";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CreativeDetail, EVO_METRICS, buildEvolution } from "@/lib/comparativo";
import { CHART } from "@/lib/theme";
import { TooltipBox } from "@/components/dashboard/ChartTooltip";
import { fmtInt } from "@/lib/format";
import { Select } from "@/components/dashboard/ui";

export function EvolutionChart({
  details,
  colors,
}: {
  details: CreativeDetail[];
  colors: string[];
}) {
  const [metrica, setMetrica] = useState("reach");
  const evo = useMemo(() => buildEvolution(details, metrica), [details, metrica]);
  const label = EVO_METRICS.find((e) => e.key === metrica)?.label ?? "";

  return (
    <section className="panel p-4 sm:p-5">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink">Evolução por dia de veiculação</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            Eixo X alinhado pelo dia de veiculação (não pela data), para comparar períodos diferentes.
          </p>
        </div>
        <Select
          value={metrica}
          onChange={setMetrica}
          options={EVO_METRICS.map((e) => ({ value: e.key, label: e.label }))}
          className="w-full shrink-0 sm:w-48"
        />
      </header>

      {/* legenda */}
      <div className="mb-2 flex flex-wrap items-center gap-4">
        {details.map((d, i) => (
          <span key={d.ad_name} className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
            <span className="h-2.5 w-4 rounded-full" style={{ background: colors[i] }} />
            {d.short}
          </span>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={evo.data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: CHART.inkMuted, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
              tickFormatter={(v) => `Dia ${v}`}
            />
            <YAxis
              tick={{ fill: CHART.inkMuted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => fmtInt(v)}
            />
            <Tooltip
              cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
              content={({ active, payload, label: x }) =>
                active && payload?.length ? (
                  <TooltipBox
                    title={`Dia ${x} de veiculação`}
                    rows={payload.map((p) => ({
                      label: String(p.dataKey),
                      value: fmtInt(Number(p.value)),
                      color: p.color,
                    }))}
                    footer={label}
                  />
                ) : null
              }
            />
            {details.map((d, i) => (
              <Line
                key={d.ad_name}
                type="monotone"
                dataKey={d.short}
                stroke={colors[i]}
                strokeWidth={2.4}
                dot={{ r: 3, fill: colors[i], strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {evo.blockSize > 1 && (
        <p className="mt-2 text-right text-[11px] text-ink-muted">
          Valores agrupados em blocos de {evo.blockSize} dias de veiculação para facilitar a leitura.
        </p>
      )}
    </section>
  );
}
