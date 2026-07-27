"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PTStar } from "@/components/brand/PTStar";
import { Segmented } from "@/components/dashboard/ui";
import { AddReportModal } from "./AddReportModal";
import {
  extDe,
  fmtPeriodo,
  fmtTamanho,
  TIPO_LABEL,
  tituloExibido,
  type RelatorioRow,
  type TipoRelatorio,
} from "@/lib/relatorios";

type FiltroTipo = "todos" | TipoRelatorio;

export function RelatoriosClient({ configured }: { configured: boolean }) {
  const [relatorios, setRelatorios] = useState<RelatorioRow[]>([]);
  const [loading, setLoading] = useState(configured);
  const [erro, setErro] = useState<string | null>(null);

  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [busca, setBusca] = useState("");
  const [dataAberta, setDataAberta] = useState(false);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/relatorios");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha ao carregar.");
        if (vivo) setRelatorios(data.relatorios ?? []);
      } catch (e) {
        if (vivo) setErro(e instanceof Error ? e.message : "Falha ao carregar.");
      } finally {
        if (vivo) setLoading(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [configured]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return relatorios.filter((r) => {
      if (tipo !== "todos" && r.tipo !== tipo) return false;
      if (termo) {
        const alvo = `${tituloExibido(r)} ${r.arquivo_nome}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      // filtro por data: considera o período do relatório
      const ini = r.periodo_inicio?.slice(0, 10);
      const fim = r.periodo_fim?.slice(0, 10) || ini;
      if (de && fim && fim < de) return false;
      if (ate && ini && ini > ate) return false;
      return true;
    });
  }, [relatorios, tipo, busca, de, ate]);

  const temFiltroData = Boolean(de || ate);

  async function excluir(r: RelatorioRow) {
    if (!window.confirm(`Excluir "${tituloExibido(r)}"? Esta ação não pode ser desfeita.`))
      return;
    setExcluindo(r.id);
    try {
      const res = await fetch(`/api/relatorios/${r.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao excluir.");
      setRelatorios((atual) => atual.filter((x) => x.id !== r.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha ao excluir.");
    } finally {
      setExcluindo(null);
    }
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
              <p className="text-[11px] text-white/75">Relatórios da campanha</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-medium ring-1 ring-white/25 transition-colors hover:bg-white/25"
            >
              <span className="hidden sm:inline">Painel Mídia</span>
              <span className="sm:hidden">Mídia</span>
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
        {/* título + filtro de tipo */}
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
              Relatórios
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">
              Documentos de acompanhamento da campanha — leia ou baixe.
            </p>
          </div>
          <Segmented
            value={tipo}
            onChange={(v) => setTipo(v)}
            options={[
              { value: "todos", label: "Todos" },
              { value: "dia", label: "Dia" },
              { value: "semana", label: "Semana" },
              { value: "mes", label: "Mês" },
            ]}
          />
        </div>

        {/* barra de ações */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setModalAberto(true)}
            disabled={!configured}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--pt-red)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Adicionar relatório
          </button>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Busca por palavra"
                className="w-full rounded-xl border bg-surface-1 py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-[var(--pt-red)] sm:w-56"
              />
            </div>
            <button
              onClick={() => setDataAberta((v) => !v)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                temFiltroData
                  ? "border-[var(--pt-red)] bg-[var(--pt-red-soft)] text-[var(--pt-red-dark)]"
                  : "bg-surface-1 text-ink-secondary hover:text-ink"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="hidden xs:inline">Filtro data</span>
              {temFiltroData && <span className="h-1.5 w-1.5 rounded-full bg-[var(--pt-red)]" />}
            </button>
          </div>
        </div>

        {/* painel do filtro de data */}
        {dataAberta && (
          <div className="mb-4 flex flex-col items-start gap-3 rounded-xl border bg-surface-1 p-4 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">De</span>
              <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="rounded-lg border bg-surface-1 px-3 py-2 text-sm text-ink outline-none focus:border-[var(--pt-red)]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Até</span>
              <input type="date" value={ate} min={de || undefined} onChange={(e) => setAte(e.target.value)} className="rounded-lg border bg-surface-1 px-3 py-2 text-sm text-ink outline-none focus:border-[var(--pt-red)]" />
            </label>
            {temFiltroData && (
              <button
                onClick={() => { setDe(""); setAte(""); }}
                className="rounded-lg border px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                Limpar
              </button>
            )}
          </div>
        )}

        {/* conteúdo */}
        {!configured ? (
          <SetupBanner />
        ) : loading ? (
          <ListSkeleton />
        ) : erro ? (
          <Aviso>{erro}</Aviso>
        ) : filtrados.length === 0 ? (
          <VazioState temFiltro={Boolean(busca || temFiltroData || tipo !== "todos")} total={relatorios.length} onAdicionar={() => setModalAberto(true)} />
        ) : (
          <ul className="space-y-2.5">
            {filtrados.map((r) => (
              <ReportRow
                key={r.id}
                r={r}
                excluindo={excluindo === r.id}
                onExcluir={() => excluir(r)}
              />
            ))}
          </ul>
        )}

        {configured && !loading && filtrados.length > 0 && (
          <p className="mt-4 text-center text-xs text-ink-muted">
            {filtrados.length} de {relatorios.length} {relatorios.length === 1 ? "relatório" : "relatórios"}
          </p>
        )}
      </div>

      {modalAberto && (
        <AddReportModal
          onClose={() => setModalAberto(false)}
          onCreated={(novo) =>
            setRelatorios((atual) =>
              [novo, ...atual].sort((a, b) =>
                (b.periodo_inicio ?? b.criado_em).localeCompare(a.periodo_inicio ?? a.criado_em)
              )
            )
          }
        />
      )}
    </main>
  );
}

/* ---------- linha de relatório ---------- */
function ReportRow({
  r,
  excluindo,
  onExcluir,
}: {
  r: RelatorioRow;
  excluindo: boolean;
  onExcluir: () => void;
}) {
  const periodo = fmtPeriodo(r);
  const tamanho = fmtTamanho(r.tamanho);
  const ext = extDe(r.arquivo_nome);

  return (
    <li className="panel flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4">
      <FileBadge ext={ext} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{tituloExibido(r)}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          <span className="rounded-full bg-[var(--pt-red-soft)] px-2 py-0.5 font-medium text-[var(--pt-red-dark)]">
            {TIPO_LABEL[r.tipo]}
          </span>
          {periodo && <span>{periodo}</span>}
          {tamanho && <span>· {tamanho}</span>}
          <span className="uppercase">· {ext || "arquivo"}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href={`/api/relatorios/${r.id}/file`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-[var(--pt-red)] hover:text-[var(--pt-red-dark)]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ler
        </a>
        <a
          href={`/api/relatorios/${r.id}/file?download=1`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5M12 15V3" />
          </svg>
          Baixar
        </a>
        <button
          onClick={onExcluir}
          disabled={excluindo}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-ink-muted transition-colors hover:border-[var(--critical)] hover:text-[var(--critical)] disabled:opacity-40"
          aria-label="Excluir relatório"
          title="Excluir"
        >
          {excluindo ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="spin">
              <path d="M21 12a9 9 0 1 1-6.2-8.5" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
}

function FileBadge({ ext }: { ext: string }) {
  const pdf = ext === "pdf";
  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
      style={{
        background: pdf ? "var(--pt-red-soft)" : "#efe9fb",
        color: pdf ? "var(--pt-red-dark)" : "var(--series-purple)",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    </span>
  );
}

/* ---------- estados auxiliares ---------- */
function SetupBanner() {
  return (
    <div className="panel p-6 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[var(--pt-red-soft)] text-[var(--pt-red-dark)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>
      <p className="font-display text-xl text-ink">Armazenamento ainda não configurado</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
        Para o cliente adicionar, ler e baixar relatórios, é preciso conectar o
        Supabase (bucket de Storage, tabela e chaves). O passo a passo está no
        arquivo <span className="font-medium text-ink">RELATORIOS_SETUP.md</span> do projeto.
      </p>
    </div>
  );
}

function VazioState({
  temFiltro,
  total,
  onAdicionar,
}: {
  temFiltro: boolean;
  total: number;
  onAdicionar: () => void;
}) {
  return (
    <div className="panel grid place-items-center py-16 text-center">
      <div className="max-w-sm">
        <p className="font-display text-xl text-ink">
          {temFiltro ? "Nenhum resultado" : "Ainda não há relatórios"}
        </p>
        <p className="mt-2 text-sm text-ink-secondary">
          {temFiltro
            ? "Ajuste a busca, o tipo ou o filtro de data."
            : "Adicione o primeiro relatório em PDF ou DOCX para começar."}
        </p>
        {!temFiltro && total === 0 && (
          <button
            onClick={onAdicionar}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--pt-red)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Adicionar relatório
          </button>
        )}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <li key={i} className="panel flex items-center gap-4 p-4">
          <span className="skeleton h-11 w-11 rounded-xl" />
          <span className="flex-1">
            <span className="skeleton block h-4 w-2/3" />
            <span className="skeleton mt-2 block h-3 w-1/3" />
          </span>
          <span className="skeleton h-9 w-16 rounded-lg" />
          <span className="skeleton h-9 w-20 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel-2 border-l-4 border-l-[var(--critical)] p-4">
      <p className="text-sm text-ink-secondary">{children}</p>
    </div>
  );
}
