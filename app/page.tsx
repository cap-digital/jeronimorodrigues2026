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
            <div className="flex shrink-0 items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium ring-1 ring-white/25">
                <span className="live-dot h-2 w-2 rounded-full bg-white" />
                <span className="hidden sm:inline">Campanha ao vivo</span>
                <span className="sm:hidden">Ao vivo</span>
              </span>
              <a
                href="/api/logout"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/25 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sair
              </a>
            </div>
          </header>

          <div className="max-w-3xl py-12 sm:py-16">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 sm:text-xs">
              Painel de campanha · Meta Ads
            </p>
            <h1 className="font-display text-balance text-4xl/[1.35] sm:text-6xl/[1.35] lg:text-7xl/[1.35]">
              Central de inteligência de mídia
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              Acompanhamento dos dados de performance, mídia e relatórios da pré-candidatura de{" "}
              <strong className="text-white">Jerônimo Rodrigues</strong>. Investimento, alcance,
              público e criativos — tudo em um só lugar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-semibold text-[var(--pt-red-dark)] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Acessar Dashboard
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="https://app.reportei.com/dashboard/d7yB8hJzXBOqH0do8GHeQXRfd7rmPvFZ"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/12 px-7 py-4 text-base font-semibold text-white ring-1 ring-white/35 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M3 3v18h18" />
                  <path d="m7 14 3-3 3 3 4-5" />
                </svg>
                Painel Performance (Reportei)
                <span aria-hidden className="text-white/70">↗</span>
              </a>
              <Link
                href="/relatorios"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/12 px-7 py-4 text-base font-semibold text-white ring-1 ring-white/35 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 13h6M9 17h6" />
                </svg>
                Acessar Relatórios
              </Link>
              <Link
                href="/comparativo"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white/12 px-7 py-4 text-base font-semibold text-white ring-1 ring-white/35 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M3 3v18h18" />
                  <rect x="7" y="11" width="3" height="6" rx="0.5" />
                  <rect x="13" y="7" width="3" height="10" rx="0.5" />
                </svg>
                Comparar criativos
              </Link>
            </div>
            {updated && <span className="mt-3 block text-xs text-white/75">Dados atualizados em {updated}</span>}
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
        <p>Uso interno da campanha</p>
        <p>Fonte: Meta Ads · atualização diária</p>
      </footer>
    </main>
  );
}
