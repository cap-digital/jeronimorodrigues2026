"use client";
import { useMemo } from "react";
import { MetaRow } from "@/lib/types";
import { sumRows, toKpis, byDay } from "@/lib/transform";
import { fmtBRL, fmtInt, fmtPct, fmtDec } from "@/lib/format";
import { RED } from "@/lib/theme";
import { KpiCard } from "./KpiCard";

/* 5 big numbers (volume) com a taxa/custo correspondente embutida em cada card. */
export function KpiOverview({ meta }: { meta: MetaRow[] }) {
  const { kpis, days } = useMemo(() => {
    const totals = sumRows(meta);
    return { kpis: toKpis(totals), days: byDay(meta) };
  }, [meta]);

  const spark = (get: (d: (typeof days)[number]) => number) => days.map(get);

  const cards = [
    { label: "Investimento", value: fmtBRL(kpis.spend) },
    { label: "Alcance", value: fmtInt(kpis.reach), caption: `Freq. ${fmtDec(kpis.frequency)}`, spark: spark((d) => d.kpis.reach) },
    { label: "Impressões", value: fmtInt(kpis.impressions), caption: `CTR ${fmtPct(kpis.ctr)} · CPM ${fmtBRL(kpis.cpm)}`, spark: spark((d) => d.kpis.impressions) },
    { label: "Cliques", value: fmtInt(kpis.clicks), caption: `CTR ${fmtPct(kpis.ctr)} · CPC ${fmtBRL(kpis.cpc)}`, spark: spark((d) => d.kpis.clicks) },
    { label: "Engajamento", value: fmtInt(kpis.actions_post_engagement), caption: `Taxa ${fmtPct(kpis.engagementRate, 1)} · ${fmtBRL(kpis.cpe)}/eng`, spark: spark((d) => d.kpis.actions_post_engagement) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((k) => (
        <KpiCard key={k.label} hero color={RED} {...k} />
      ))}
    </div>
  );
}
