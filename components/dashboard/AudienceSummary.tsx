"use client";
import { agePyramid } from "@/lib/transform";
import { MetaRow } from "@/lib/types";
import { fmtPct } from "@/lib/format";

/* Resumo demográfico — leitura rápida em números (somente público). */
export function AudienceSummary({
  meta,
  className = "",
}: {
  meta: MetaRow[];
  className?: string;
}) {
  const pyr = agePyramid(meta, "reach");
  const total = pyr.reduce((s, r) => s + r.total, 0) || 1;
  const female = pyr.reduce((s, r) => s + r.female, 0);
  const male = pyr.reduce((s, r) => s + r.male, 0);
  const young = pyr.filter((r) => r.age === "18-24" || r.age === "25-34").reduce((s, r) => s + r.total, 0);
  const dominant = [...pyr].sort((a, b) => b.total - a.total)[0];

  const items = [
    { label: "Público feminino", value: fmtPct((female / total) * 100, 0), hint: "do alcance total" },
    { label: "Público masculino", value: fmtPct((male / total) * 100, 0), hint: "do alcance total" },
    { label: "Entre 18 e 34 anos", value: fmtPct((young / total) * 100, 0), hint: "faixa mais jovem" },
    { label: "Faixa dominante", value: dominant?.age ?? "—", hint: "maior alcance" },
  ];

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm sm:p-5 fade-up ${className}`}
      style={{ background: "var(--pt-gradient)" }}
    >
      <h3 className="mb-4 text-[15px] font-semibold text-white">Resumo do público</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{it.label}</p>
            <p className="mt-1 font-display text-2xl text-ink">{it.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{it.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
