import Link from "next/link";
import { fetchInsights } from "@/lib/fetchInsights";
import { sumRows, toKpis } from "@/lib/transform";
import { fmtBRLCompact, fmtCompact, fmtDateTime } from "@/lib/format";
import { PTStar } from "@/components/brand/PTStar";

export const revalidate = 300;

export default async function Home() {
  const data = await fetchInsights();
  const meta = data?.meta ?? [];
  const k = toKpis(sumRows(meta));
  const updated = data?.timestamp ? fmtDateTime(data.timestamp) : null;

  const heroStats = [
    { label: "Investido", value: fmtBRLCompact(k.spend) },
    { label: "Pessoas alcançadas", value: fmtCompact(k.reach) },
    { label: "Impressões", value: fmtCompact(k.impressions) },
    { label: "Engajamentos", value: fmtCompact(k.actions_post_engagement) },
  ];

  const features = [
    { t: "Visão geral", d: "KPIs, evolução diária e projeção de tendência da campanha." },
    { t: "Público", d: "Pirâmide etária por gênero e concentração do alcance." },
    { t: "Criativos", d: "Comparativo, ranking e galeria com prévias dos anúncios." },
    { t: "Mídia", d: "Investimento por plataforma, posicionamento e eficiência." },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* HERÓI vermelho PT */}
      <section className="relative overflow-hidden text-white" style={{ background: "var(--pt-gradient)" }}>
        <PTStar variant="white" className="pointer-events-none absolute -right-20 -top-20 h-[420px] w-[420px] opacity-10" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <header className="flex items-center justify-between gap-3 py-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white">
                <PTStar variant="red" className="h-7 w-7" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-lg tracking-wide">JERÔNIMO 2026</p>
                <p className="text-xs text-white/75">Governo da Bahia · PT</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium ring-1 ring-white/25">
              <span className="live-dot h-2 w-2 rounded-full bg-white" />
              <span className="hidden sm:inline">Campanha ao vivo</span>
              <span className="sm:hidden">Ao vivo</span>
            </span>
          </header>

          <div className="max-w-3xl py-12 sm:py-16">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 sm:text-xs">
              Painel de campanha · Meta Ads
            </p>
            <h1 className="font-display text-balance text-4xl/[1.35] sm:text-6xl/[1.35] lg:text-7xl/[1.35]">
              Central de inteligência de mídia
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              Acompanhamento do tráfego pago da pré-candidatura de{" "}
              <strong className="text-white">Jerônimo Rodrigues</strong>. Investimento, alcance,
              público e criativos — tudo em um só lugar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-semibold text-[var(--pt-red-dark)] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Acessar o painel
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              {updated && <span className="text-xs text-white/75 sm:ml-2">Dados atualizados em {updated}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* faixa de números (seção branca, sem sobreposição) */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {heroStats.map((s) => (
            <div key={s.label} className="panel p-5">
              <p className="font-display text-3xl tabular text-ink sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* recursos */}
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="panel p-5">
              <div className="mb-3 h-1 w-8 rounded-full bg-[var(--pt-red)]" />
              <h3 className="font-display text-lg tracking-wide text-ink">{f.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 border-t px-5 py-6 text-xs text-ink-muted sm:flex-row sm:px-8">
        <p>Painel desenvolvido por CAP.CO · uso interno da campanha</p>
        <p>Fonte: Meta Ads · atualização diária</p>
      </footer>
    </main>
  );
}
