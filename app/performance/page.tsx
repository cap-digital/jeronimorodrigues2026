import Link from "next/link";
import { PTStar } from "@/components/brand/PTStar";

export const metadata = {
  title: "Painel Performance · Jerônimo Rodrigues 2026",
};

const REPORTEI_URL =
  "https://app.reportei.com/dashboard/d7yB8hJzXBOqH0do8GHeQXRfd7rmPvFZ";

export default function PerformancePage() {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-plane">
      {/* cabeçalho fino da marca */}
      <header className="shrink-0 text-white" style={{ background: "var(--pt-gradient)" }}>
        <div className="flex w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white">
              <PTStar variant="red" className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm tracking-wide">JERÔNIMO 2026</p>
              <p className="text-[10px] text-white/75">Painel Performance</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={REPORTEI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--pt-red-dark)] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              <span className="hidden sm:inline">Abrir no Reportei</span>
              <span className="sm:hidden">Abrir</span>
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium ring-1 ring-white/25 transition-colors hover:bg-white/25"
            >
              <span className="hidden sm:inline">Painel Mídia</span>
              <span className="sm:hidden">Mídia</span>
              <span aria-hidden>→</span>
            </Link>
            <a
              href="/api/logout"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/25 transition-colors hover:bg-white/10 hover:text-white"
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

      {/* dashboard embedado, com uma margem pequena no topo e nas laterais */}
      <div className="min-h-0 flex-1 px-2 pt-2 sm:px-3 sm:pt-3">
        <iframe
          src={REPORTEI_URL}
          title="Painel Performance — Reportei"
          className="h-full w-full rounded-t-xl border-0"
          allow="fullscreen; clipboard-read; clipboard-write"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </main>
  );
}
