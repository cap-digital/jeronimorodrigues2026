"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MetaRow } from "@/lib/types";
import {
  CreativeDetail,
  Modo,
  buildCreativeDetails,
  gerarAnalise,
  objetivosDistintos,
} from "@/lib/comparativo";
import { CREATIVE_COLORS } from "@/lib/theme";
import { PTStar } from "@/components/brand/PTStar";
import { MetricDuel } from "./MetricDuel";
import { EvolutionChart } from "./EvolutionChart";
import { AnalysisModal } from "./AnalysisModal";

const MAX_CARDS = 3;

export function ComparativoView({ meta }: { meta: MetaRow[] }) {
  const creatives = useMemo(() => buildCreativeDetails(meta), [meta]);
  const byName = useMemo(() => new Map(creatives.map((c) => [c.ad_name, c])), [creatives]);

  // seleção inicial: 2 primeiros anúncios (a ordem define a cor de cada card)
  const [chosen, setChosen] = useState<string[]>(() =>
    [creatives[0]?.ad_name, creatives[1]?.ad_name].filter((x): x is string => Boolean(x))
  );
  const [modo, setModo] = useState<Modo>("media");
  const [analise, setAnalise] = useState<string | null>(null);

  const selected: CreativeDetail[] = chosen
    .map((s) => byName.get(s))
    .filter((d): d is CreativeDetail => Boolean(d));
  const colors = selected.map((_, i) => CREATIVE_COLORS[i % CREATIVE_COLORS.length]);
  const objetivos = objetivosDistintos(selected);
  const podeComparar = selected.length >= 2;

  function toggle(ad: string) {
    setChosen((c) => {
      if (c.includes(ad)) return c.filter((x) => x !== ad);
      if (c.length >= MAX_CARDS) return c;
      return [...c, ad];
    });
  }

  function abrirAnalise() {
    const agora = new Date();
    const dh = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bahia",
    }).format(agora);
    setAnalise(gerarAnalise(selected, dh));
  }

  return (
    <main className="min-h-screen bg-plane">
      {/* cabeçalho da marca */}
      <header className="text-white" style={{ background: "var(--pt-gradient)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white">
              <PTStar variant="red" className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base tracking-wide">JERÔNIMO 2026</p>
              <p className="text-[11px] text-white/75">Comparativo de criativos</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/criativos"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-medium ring-1 ring-white/25 transition-colors hover:bg-white/25"
            >
              <span className="hidden sm:inline">Ver criativos</span>
              <span className="sm:hidden">Criativos</span>
              <span aria-hidden>→</span>
            </Link>
            <a
              href="/api/logout"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-white/80 ring-1 ring-white/25 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Sair"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
            Comparativo de criativos
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Escolha os anúncios para comparar. Métricas normalizadas por dia de veiculação.
          </p>
        </div>

        {creatives.length < 2 ? (
          <div className="panel grid place-items-center py-16 text-center">
            <p className="max-w-sm text-sm text-ink-secondary">
              É preciso ter pelo menos 2 anúncios na campanha para comparar.
            </p>
          </div>
        ) : (
          <>
            {/* seletor por chips */}
            <ChipSelector
              creatives={creatives}
              chosen={chosen}
              colors={colors}
              max={MAX_CARDS}
              onToggle={toggle}
            />

            {/* aviso: objetivos diferentes (condicional) */}
            {podeComparar && objetivos.length > 1 && (
              <ObjetivosDiferentesAviso objetivos={objetivos} />
            )}

            {!podeComparar ? (
              <p className="mt-10 text-center text-sm text-ink-secondary">
                Selecione ao menos <strong>2 anúncios</strong> para comparar.
              </p>
            ) : (
              <>
                {/* prévias */}
                <div
                  className={`mt-6 grid gap-4 sm:grid-cols-2 ${
                    selected.length === 3 ? "lg:grid-cols-3" : ""
                  }`}
                >
                  {selected.map((d, i) => (
                    <PreviewCard key={d.ad_name} d={d} color={colors[i]} />
                  ))}
                </div>

                {/* controles */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={abrirAnalise}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--pt-red)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6M8 13h8M8 17h5" />
                    </svg>
                    Gerar análise qualitativa
                  </button>
                  <ModoToggle modo={modo} onChange={setModo} />
                </div>

                {/* duelo de métricas */}
                <div className="mt-4">
                  <MetricDuel details={selected} colors={colors} modo={modo} />
                </div>

                {/* evolução */}
                <div className="mt-4">
                  <EvolutionChart details={selected} colors={colors} />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {analise && <AnalysisModal texto={analise} onClose={() => setAnalise(null)} />}
    </main>
  );
}

/* ---------- toggle Média/dia · Total ---------- */
function ModoToggle({ modo, onChange }: { modo: Modo; onChange: (m: Modo) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-ink-muted">Exibir valores como:</span>
      <div className="inline-flex rounded-lg border bg-surface-3 p-0.5">
        {(["media", "total"] as Modo[]).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              modo === m ? "bg-[var(--pt-red)] text-white shadow-sm" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {m === "media" ? "Média/dia" : "Total"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- aviso de objetivos diferentes ---------- */
function ObjetivosDiferentesAviso({ objetivos }: { objetivos: string[] }) {
  return (
    <div className="mt-5 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/8 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[var(--warning)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </span>
        <div className="text-sm leading-relaxed text-ink-secondary">
          <p className="font-semibold text-ink">Você está comparando anúncios de objetivos diferentes</p>
          <p className="mt-1">
            Os anúncios pertencem a campanhas com objetivos distintos ({objetivos.join(" × ")}). Cada
            campanha é otimizada pelo algoritmo da Meta para uma meta específica, então indicadores como{" "}
            <strong>CTR, CPM e custo por resultado não são diretamente comparáveis</strong> entre elas.
          </p>
          <p className="mt-1">
            Use esta comparação para <strong>entender o contexto</strong> de cada anúncio e a métrica-chave
            do seu objetivo, não para eleger um &quot;vencedor&quot; absoluto.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- prévia do criativo ---------- */
function PreviewCard({ d, color }: { d: CreativeDetail; color: string }) {
  return (
    <article className="panel overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: color }} />
      <Thumb url={d.thumbnail_url} alt={d.ad_name} />
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
          {d.objetivo}
        </p>
        <p className="font-display text-lg tracking-wide text-ink">{d.short}</p>
        <div className="mt-3 rounded-lg bg-surface-3 px-3 py-2">
          <span className="font-display text-xl text-ink">{d.activeDays}</span>{" "}
          <span className="text-xs text-ink-muted">dias veiculados</span>
        </div>
        {d.instagram_permalink_url && (
          <a
            href={d.instagram_permalink_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#f58529,#dd2a7b,#8134af)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <path d="M17.5 6.5h.01" />
            </svg>
            Ver post no Instagram
          </a>
        )}
      </div>
    </article>
  );
}

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

/* ---------- seletor por chips (mini-foto) ---------- */
function ChipSelector({
  creatives,
  chosen,
  colors,
  max,
  onToggle,
}: {
  creatives: CreativeDetail[];
  chosen: string[];
  colors: string[];
  max: number;
  onToggle: (ad: string) => void;
}) {
  const [busca, setBusca] = useState("");
  const comBusca = creatives.length > 6;
  const filtrados = comBusca
    ? creatives.filter((c) => `${c.ad_name} ${c.objetivo}`.toLowerCase().includes(busca.trim().toLowerCase()))
    : creatives;
  const cheio = chosen.length >= max;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-secondary">
          Toque para escolher de <strong className="text-ink">2 a {max}</strong> anúncios
        </p>
        <span className="rounded-full bg-surface-3 px-2.5 py-1 text-xs font-medium text-ink-secondary">
          {chosen.length}/{max} selecionados
        </span>
      </div>

      {comBusca && (
        <div className="relative mb-3 max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar anúncio pelo nome..."
            className="w-full rounded-full border bg-surface-1 py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-[var(--pt-red)]"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {filtrados.map((c) => {
          const idx = chosen.indexOf(c.ad_name);
          const sel = idx >= 0;
          const cor = sel ? colors[idx] : undefined;
          const bloqueado = !sel && cheio;
          return (
            <button
              key={c.ad_name}
              onClick={() => onToggle(c.ad_name)}
              disabled={bloqueado}
              aria-pressed={sel}
              title={c.ad_name}
              className={`inline-flex items-center gap-2.5 rounded-full border bg-surface-1 py-1.5 pl-1.5 pr-4 text-left transition-all ${
                sel
                  ? "shadow-sm"
                  : bloqueado
                  ? "cursor-not-allowed opacity-40"
                  : "hover:border-[var(--pt-red)] hover:-translate-y-0.5"
              }`}
              style={sel ? { borderColor: cor, boxShadow: `0 0 0 1.5px ${cor}` } : undefined}
            >
              <span className="relative shrink-0">
                <ChipThumb url={c.thumbnail_url} />
                {sel && (
                  <span
                    className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-[var(--surface-1)]"
                    style={{ background: cor }}
                  >
                    {idx + 1}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight text-ink">{c.short}</span>
                <span className="text-[11px] text-ink-muted">{c.objetivo}</span>
              </span>
            </button>
          );
        })}
      </div>

      {comBusca && filtrados.length === 0 && (
        <p className="mt-3 text-sm text-ink-muted">Nenhum anúncio encontrado.</p>
      )}
    </section>
  );
}

function ChipThumb({ url }: { url: string }) {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-3">
        <PTStar variant="red" className="h-4 w-4 opacity-30" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setErr(true)} className="h-9 w-9 rounded-full object-cover" />
  );
}
