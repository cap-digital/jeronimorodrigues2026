"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboardContext";
import { byCreative, themeCreative, CreativeStat } from "@/lib/transform";
import { fmtBRL, fmtInt, fmtPct } from "@/lib/format";
import { CreativeComparison } from "@/components/dashboard/charts/CreativeComparison";
import { CreativeGallery } from "@/components/dashboard/CreativeGallery";
import { ChartCard } from "@/components/dashboard/ui";
import { SortableTable, Column } from "@/components/dashboard/SortableTable";
import { PTStar } from "@/components/brand/PTStar";

export default function CriativosPage() {
  const { meta } = useDashboard();
  const creatives = useMemo(() => byCreative(meta), [meta]);
  const bestCtr = useMemo(() => [...creatives].sort((a, b) => b.kpis.ctr - a.kpis.ctr)[0], [creatives]);

  const columns: Column<CreativeStat>[] = [
    { key: "name", label: "Criativo", sortValue: (c) => themeCreative(c.ad_name), render: (c) => `${c.short} · ${themeCreative(c.ad_name)}` },
    { key: "spend", label: "Investido", align: "right", sortValue: (c) => c.kpis.spend, render: (c) => fmtBRL(c.kpis.spend) },
    { key: "impressions", label: "Impressões", align: "right", sortValue: (c) => c.kpis.impressions, render: (c) => fmtInt(c.kpis.impressions) },
    { key: "reach", label: "Alcance", align: "right", sortValue: (c) => c.kpis.reach, render: (c) => fmtInt(c.kpis.reach) },
    { key: "clicks", label: "Cliques", align: "right", sortValue: (c) => c.kpis.clicks, render: (c) => fmtInt(c.kpis.clicks) },
    { key: "ctr", label: "CTR", align: "right", sortValue: (c) => c.kpis.ctr, render: (c) => fmtPct(c.kpis.ctr) },
    { key: "engagement", label: "Engaj.", align: "right", sortValue: (c) => c.kpis.actions_post_engagement, render: (c) => fmtInt(c.kpis.actions_post_engagement) },
  ];

  return (
    <div className="space-y-4">
      {/* banner */}
      <div className="relative overflow-hidden rounded-2xl px-5 py-6 text-white sm:px-7 sm:py-7" style={{ background: "var(--pt-gradient)" }}>
        <PTStar variant="white" className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 opacity-15" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Criativos em veiculação</p>
        <h2 className="mt-1 font-display text-3xl tracking-wide sm:text-4xl">
          {creatives.length} anúncio{creatives.length === 1 ? "" : "s"} no ar
        </h2>
        {bestCtr && (
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Melhor desempenho de cliques: <strong>{themeCreative(bestCtr.ad_name)}</strong> com CTR de {fmtPct(bestCtr.kpis.ctr)}.
          </p>
        )}
        <Link
          href="/comparativo"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[var(--pt-red-dark)] shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <rect x="7" y="11" width="3" height="6" rx="0.5" />
            <rect x="13" y="7" width="3" height="10" rx="0.5" />
          </svg>
          Abrir comparativo de criativos
        </Link>
      </div>

      {/* movimento: 42/58 — gráfico + tabela ordenável */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <CreativeComparison creatives={creatives} className="lg:col-span-5" />
        <ChartCard
          title="Tabela de criativos"
          subtitle="Clique no cabeçalho para ordenar"
          className="lg:col-span-7"
        >
          <SortableTable columns={columns} rows={creatives} initialSort="spend" />
        </ChartCard>
      </div>

      <CreativeGallery creatives={creatives} />
    </div>
  );
}
