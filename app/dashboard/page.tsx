"use client";
import { useMemo } from "react";
import { useDashboard } from "@/lib/dashboardContext";
import { sumRows, byDay, buildInsights } from "@/lib/transform";
import { KpiOverview } from "@/components/dashboard/KpiOverview";
import { InsightStrip } from "@/components/dashboard/InsightStrip";
import { TrendChart } from "@/components/dashboard/charts/TrendChart";
import { WeekdayHeatmap } from "@/components/dashboard/charts/WeekdayHeatmap";
import { ImpressionsReachCombo } from "@/components/dashboard/charts/ImpressionsReachCombo";
import { ProjectionChart } from "@/components/dashboard/charts/ProjectionChart";
import { EngagementBar } from "@/components/dashboard/charts/EngagementBar";
import { VideoRetention } from "@/components/dashboard/charts/VideoRetention";

export default function VisaoGeralPage() {
  const { meta, placement, hasData, loading } = useDashboard();
  const days = useMemo(() => byDay(meta), [meta]);
  const totals = useMemo(() => sumRows(meta), [meta]);
  // exatamente 1 destaque (good) + 1 leitura (neutral) + 1 atenção (warning)
  const insights = useMemo(() => {
    const all = buildInsights(meta, placement);
    return (["good", "neutral", "warning"] as const)
      .map((tone) => all.find((i) => i.tone === tone))
      .filter((i): i is NonNullable<typeof i> => Boolean(i));
  }, [meta, placement]);

  if (!hasData && !loading) return <EmptyStart />;

  return (
    <div className="space-y-4">
      <KpiOverview meta={meta} />
      <InsightStrip insights={insights} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* movimento: 66/33, 58/42, 42/58 */}
        <TrendChart days={days} className="lg:col-span-8" />
        <VideoRetention totals={totals} className="lg:col-span-4" />
        <ImpressionsReachCombo days={days} className="lg:col-span-7" />
        <ProjectionChart days={days} className="lg:col-span-5" />
        <WeekdayHeatmap days={days} className="lg:col-span-5" />
        <EngagementBar totals={totals} className="lg:col-span-7" />
      </div>
    </div>
  );
}

function EmptyStart() {
  return (
    <div className="panel grid place-items-center py-20 text-center">
      <div>
        <p className="font-display text-2xl text-ink">Sem dados ainda</p>
        <p className="mt-2 max-w-sm text-sm text-ink-secondary">
          A campanha começou há pouco. Assim que o Meta processar as primeiras
          entregas, os números aparecerão aqui automaticamente.
        </p>
      </div>
    </div>
  );
}
