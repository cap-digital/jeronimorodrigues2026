"use client";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/lib/dashboardContext";
import { fmtDateTime } from "@/lib/format";
import { PeriodPicker } from "./PeriodPicker";
import { NAV } from "./Sidebar";

const SUBTITLE: Record<string, string> = {
  "/dashboard": "Resumo executivo da campanha",
  "/dashboard/publico": "Quem a campanha está alcançando",
  "/dashboard/criativos": "Desempenho de cada anúncio",
  "/dashboard/midia": "Investimento por plataforma e posicionamento",
};

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { timestamp, refresh, loading } = useDashboard();
  const active =
    NAV.slice()
      .reverse()
      .find((n) =>
        n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
      ) ?? NAV[0];

  return (
    <div className="px-5 pt-7 sm:px-8 sm:pt-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onMenu}
            className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-ink-secondary hover:text-ink lg:hidden"
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl leading-none tracking-wide text-ink sm:text-4xl">
                {active.label}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pt-red-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--pt-red-dark)]">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--pt-red)]" />
                Ao vivo
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-secondary sm:text-base">{SUBTITLE[active.href]}</p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {timestamp && (
            <span className="text-xs text-ink-muted">Atualizado {fmtDateTime(timestamp)}</span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border bg-surface-1 px-3 py-2 text-xs font-medium text-ink-secondary shadow-sm transition-colors hover:text-ink disabled:opacity-60"
            aria-label="Atualizar dados"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "spin" : ""}>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      <div className="mt-5 border-b pb-5">
        <PeriodPicker />
      </div>
    </div>
  );
}
