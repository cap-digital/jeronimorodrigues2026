"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, Select, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { agePyramid, BaseKey } from "@/lib/transform";
import { MetaRow } from "@/lib/types";
import { CHART, SERIES } from "@/lib/theme";
import { fmtCompact, fmtInt, DEMO_METRIC_OPTIONS } from "@/lib/format";

export function AgeGenderPyramid({
  rows,
  className = "",
}: {
  rows: MetaRow[];
  className?: string;
}) {
  const [metric, setMetric] = useState<BaseKey>("reach");
  const pyr = agePyramid(rows, metric);
  const hasData = pyr.some((r) => r.total > 0);
  const data = pyr.map((r) => ({
    age: r.age,
    female: -r.female,
    male: r.male,
    f: r.female,
    m: r.male,
  }));
  const maxAbs = Math.max(1, ...data.map((d) => Math.max(d.f, d.m)));

  return (
    <ChartCard
      id="publico"
      title="Público por idade e gênero"
      subtitle="Distribuição do alcance na base"
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
      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-2 flex items-center justify-center gap-5 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERIES.red }} />
              <span className="text-ink-secondary">Feminino</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERIES.purple }} />
              <span className="text-ink-secondary">Masculino</span>
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                stackOffset="sign"
                margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                barCategoryGap={6}
              >
                <CartesianGrid stroke={CHART.grid} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-maxAbs, maxAbs]}
                  tickFormatter={(v) => fmtCompact(Math.abs(Number(v)))}
                  tick={{ fill: CHART.inkMuted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="age"
                  tick={{ fill: CHART.inkSecondary, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <ReferenceLine x={0} stroke={CHART.axis} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox
                        title={`${payload[0].payload.age} anos`}
                        rows={[
                          {
                            label: "Feminino",
                            value: fmtInt(payload[0].payload.f),
                            color: SERIES.red,
                          },
                          {
                            label: "Masculino",
                            value: fmtInt(payload[0].payload.m),
                            color: SERIES.purple,
                          },
                        ]}
                      />
                    ) : null
                  }
                />
                <Bar dataKey="female" stackId="pop" fill={SERIES.red} radius={[4, 0, 0, 4]} />
                <Bar dataKey="male" stackId="pop" fill={SERIES.purple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
}
