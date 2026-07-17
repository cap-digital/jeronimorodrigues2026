"use client";
import { useMemo } from "react";
import { useDashboard } from "@/lib/dashboardContext";
import { sumRows, toKpis, byPlacement, PlacementStat } from "@/lib/transform";
import { fmtBRL, fmtInt, fmtPct, fmtDec, PLATFORM_LABEL, POSITION_LABEL } from "@/lib/format";
import { PlacementBars } from "@/components/dashboard/charts/PlacementBars";
import { PlatformDonut } from "@/components/dashboard/charts/PlatformDonut";
import { EfficiencyScatter } from "@/components/dashboard/charts/EfficiencyScatter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ui";
import { SortableTable, Column } from "@/components/dashboard/SortableTable";

export default function MidiaPage() {
  const { placement } = useDashboard();
  const k = useMemo(() => toKpis(sumRows(placement)), [placement]);
  const rows = useMemo(() => byPlacement(placement), [placement]);

  const costKpis = [
    { label: "CPM", value: fmtBRL(k.cpm), caption: "custo / mil impressões" },
    { label: "CPC", value: fmtBRL(k.cpc), caption: "custo / clique" },
    { label: "Frequência", value: fmtDec(k.frequency), caption: "impressões por pessoa" },
    { label: "Custo / engajamento", value: fmtBRL(k.cpe), caption: "por interação" },
  ];

  const columns: Column<PlacementStat>[] = [
    { key: "platform", label: "Plataforma", sortValue: (p) => p.publisher_platform, render: (p) => PLATFORM_LABEL[p.publisher_platform] ?? p.publisher_platform },
    { key: "position", label: "Posição", sortValue: (p) => p.platform_position, render: (p) => POSITION_LABEL[p.platform_position] ?? p.platform_position },
    { key: "spend", label: "Investido", align: "right", sortValue: (p) => p.spend, render: (p) => fmtBRL(p.spend) },
    { key: "impressions", label: "Impressões", align: "right", sortValue: (p) => p.impressions, render: (p) => fmtInt(p.impressions) },
    { key: "clicks", label: "Cliques", align: "right", sortValue: (p) => p.clicks, render: (p) => fmtInt(p.clicks) },
    { key: "ctr", label: "CTR", align: "right", sortValue: (p) => p.ctr, render: (p) => fmtPct(p.ctr) },
    { key: "cpc", label: "CPC", align: "right", sortValue: (p) => p.cpc, render: (p) => fmtBRL(p.cpc) },
    { key: "cpm", label: "CPM", align: "right", sortValue: (p) => p.cpm, render: (p) => fmtBRL(p.cpm) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {costKpis.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      {/* movimento: 66/33 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <PlacementBars rows={placement} className="lg:col-span-8" />
        <PlatformDonut rows={placement} initialMetric="spend" className="lg:col-span-4" />
      </div>

      <EfficiencyScatter rows={placement} />

      <ChartCard title="Tabela de posicionamentos" subtitle="Clique no cabeçalho para ordenar">
        <SortableTable columns={columns} rows={rows} initialSort="spend" />
      </ChartCard>
    </div>
  );
}
