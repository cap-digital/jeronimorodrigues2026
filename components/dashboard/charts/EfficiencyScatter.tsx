"use client";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartCard, EmptyState } from "../ui";
import { TooltipBox } from "../ChartTooltip";
import { byPlacement } from "@/lib/transform";
import { PlacementRow } from "@/lib/types";
import { CHART, PLATFORM_COLORS } from "@/lib/theme";
import {
  fmtBRL,
  fmtInt,
  fmtPct,
  PLATFORM_LABEL,
  POSITION_LABEL,
} from "@/lib/format";

export function EfficiencyScatter({
  rows,
  className = "",
}: {
  rows: PlacementRow[];
  className?: string;
}) {
  const places = byPlacement(rows).filter((p) => p.clicks > 0);
  const byPlat = new Map<string, typeof places>();
  for (const p of places) {
    const arr = byPlat.get(p.publisher_platform) ?? [];
    arr.push(p);
    byPlat.set(p.publisher_platform, arr);
  }
  const toPoint = (p: (typeof places)[number]) => ({
    x: p.cpc,
    y: p.ctr,
    z: p.spend,
    label: `${PLATFORM_LABEL[p.publisher_platform]} · ${
      POSITION_LABEL[p.platform_position] ?? p.platform_position
    }`,
    platform: p.publisher_platform,
    impressions: p.impressions,
    clicks: p.clicks,
  });

  return (
    <ChartCard
      id="eficiencia"
      title="Mapa de eficiência"
      subtitle="CPC × CTR por posicionamento — bolha = investimento"
      className={className}
      right={
        <div className="flex items-center gap-3 text-xs">
          {Object.entries(PLATFORM_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              <span className="text-ink-secondary">{PLATFORM_LABEL[k]}</span>
            </span>
          ))}
        </div>
      }
    >
      {places.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 16, left: 4, bottom: 16 }}>
              <CartesianGrid stroke={CHART.grid} />
              <XAxis
                type="number"
                dataKey="x"
                name="CPC"
                tickFormatter={(v) => fmtBRL(Number(v))}
                tick={{ fill: CHART.inkMuted, fontSize: 11 }}
                axisLine={{ stroke: CHART.axis }}
                tickLine={false}
                label={{
                  value: "CPC (R$)",
                  position: "insideBottom",
                  offset: -8,
                  fill: CHART.inkMuted,
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="CTR"
                tickFormatter={(v) => fmtPct(Number(v), 1)}
                tick={{ fill: CHART.inkMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                label={{
                  value: "CTR",
                  angle: -90,
                  position: "insideLeft",
                  fill: CHART.inkMuted,
                  fontSize: 11,
                }}
              />
              <ZAxis type="number" dataKey="z" range={[80, 900]} name="Investimento" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: CHART.axis }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.label}
                      rows={[
                        { label: "CTR", value: fmtPct(payload[0].payload.y, 2) },
                        { label: "CPC", value: fmtBRL(payload[0].payload.x) },
                        { label: "Investido", value: fmtBRL(payload[0].payload.z) },
                        { label: "Cliques", value: fmtInt(payload[0].payload.clicks) },
                      ]}
                    />
                  ) : null
                }
              />
              {Array.from(byPlat.entries()).map(([plat, pts]) => (
                <Scatter
                  key={plat}
                  name={PLATFORM_LABEL[plat] ?? plat}
                  data={pts.map(toPoint)}
                  fill={PLATFORM_COLORS[plat] ?? CHART.inkMuted}
                  fillOpacity={0.75}
                  stroke={CHART.surface}
                  strokeWidth={1.5}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
