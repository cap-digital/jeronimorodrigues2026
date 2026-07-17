"use client";
import { useState } from "react";
import { CreativeStat, themeCreative } from "@/lib/transform";
import { CREATIVE_COLORS } from "@/lib/theme";
import { fmtBRL, fmtCompact, fmtInt, fmtPct } from "@/lib/format";
import { PTStar } from "@/components/brand/PTStar";
import { Segmented } from "./ui";

type SortKey = "spend" | "reach" | "ctr" | "engagement";
const SORTS: Record<SortKey, { label: string; get: (c: CreativeStat) => number }> = {
  spend: { label: "Investimento", get: (c) => c.kpis.spend },
  reach: { label: "Alcance", get: (c) => c.kpis.reach },
  ctr: { label: "CTR", get: (c) => c.kpis.ctr },
  engagement: { label: "Engajamento", get: (c) => c.kpis.actions_post_engagement },
};

function Thumb({ url, alt }: { url: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="grid aspect-[4/5] w-full place-items-center bg-surface-3">
        <PTStar variant="red" className="h-10 w-10 opacity-30" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErr(true)}
      className="aspect-[4/5] w-full object-cover"
    />
  );
}

export function CreativeGallery({
  creatives,
  className = "",
}: {
  creatives: CreativeStat[];
  className?: string;
}) {
  const [sort, setSort] = useState<SortKey>("spend");
  const order = new Map(creatives.map((c, i) => [c.ad_name, CREATIVE_COLORS[i % CREATIVE_COLORS.length]]));
  const sorted = [...creatives].sort((a, b) => SORTS[sort].get(b) - SORTS[sort].get(a));

  return (
    <section className={`panel p-4 sm:p-5 fade-up ${className}`}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">Galeria de criativos</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Prévia dos anúncios e principais números</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">Ordenar por</span>
          <Segmented
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: "spend", label: "Invest." },
              { value: "reach", label: "Alcance" },
              { value: "ctr", label: "CTR" },
              { value: "engagement", label: "Engaj." },
            ]}
          />
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-secondary">Sem criativos para este período.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c, rank) => {
            const color = order.get(c.ad_name)!;
            const stats = [
              { l: "Investido", v: fmtBRL(c.kpis.spend) },
              { l: "Alcance", v: fmtCompact(c.kpis.reach) },
              { l: "CTR", v: fmtPct(c.kpis.ctr) },
              { l: "Engaj.", v: fmtInt(c.kpis.actions_post_engagement) },
            ];
            return (
              <article key={c.ad_name} className="overflow-hidden rounded-xl border bg-surface-1">
                <div className="relative">
                  <Thumb url={c.thumbnail_url} alt={c.ad_name} />
                  <span
                    className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: color }}
                  >
                    {c.short}
                  </span>
                  <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                    #{rank + 1}
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="font-display text-base leading-tight text-ink">{themeCreative(c.ad_name)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {stats.map((s) => (
                      <div key={s.l} className="rounded-lg bg-surface-3 px-2.5 py-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-ink-muted">{s.l}</p>
                        <p className="tabular text-sm font-semibold text-ink">{s.v}</p>
                      </div>
                    ))}
                  </div>
                  {c.instagram_permalink_url && (
                    <a
                      href={c.instagram_permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--pt-red)] transition-colors hover:text-[var(--pt-red-dark)]"
                    >
                      Ver no Instagram <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
