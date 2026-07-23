"use client";
import { useState } from "react";
import {
  CreativeDetail,
  GRUPOS,
  METRICS,
  Modo,
  cell,
  winnerFor,
} from "@/lib/comparativo";

function Trophy() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="inline-block -mt-0.5">
      <path d="M6 9a6 6 0 0 0 12 0V4H6z" />
      <path d="M6 5H4a2 2 0 0 0 0 4h1.5M18 5h2a2 2 0 0 1 0 4h-1.5" />
      <path d="M9 21h6M12 15v6" />
    </svg>
  );
}
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "" : "-rotate-90"}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MetricDuel({
  details,
  colors,
  modo,
}: {
  details: CreativeDetail[];
  colors: string[];
  modo: Modo;
}) {
  // por padrão só "Entrega & alcance" (primeiro grupo) fica aberto
  const [fechados, setFechados] = useState<Set<string>>(() => new Set(GRUPOS.slice(1)));
  const toggle = (g: string) =>
    setFechados((s) => {
      const n = new Set(s);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });

  return (
    <div className="space-y-3">
      {GRUPOS.map((grupo) => {
        const metrics = METRICS.filter((m) => m.group === grupo);
        const aberto = !fechados.has(grupo);
        return (
          <section key={grupo} className="panel overflow-hidden">
            <button
              onClick={() => toggle(grupo)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-3/60"
            >
              <span className="text-ink-muted">
                <Chevron open={aberto} />
              </span>
              <span className="text-[13px] font-semibold uppercase tracking-wider text-ink">
                {grupo}
              </span>
              <span className="text-[11px] text-ink-muted">({metrics.length})</span>
            </button>

            {aberto && (
              <div className="space-y-4 border-t px-4 py-4 sm:px-5">
                {metrics.map((m) => {
                  const cells = details.map((d) => cell(m, d, modo));
                  const max = Math.max(0, ...cells.map((c) => c.n));
                  const vencedor = winnerFor(m, details, modo);
                  const sufixo = m.perDay && modo === "media" ? " /dia" : "";
                  return (
                    <div key={m.key}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          {m.label}
                          {sufixo && <span className="text-ink-muted">{sufixo}</span>}
                        </span>
                        {m.better === "lower" && (
                          <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                            menor é melhor
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {details.map((d, i) => {
                          const c = cells[i];
                          const pct = max > 0 && c.n > 0 ? Math.max(5, (c.n / max) * 100) : 0;
                          const ganhou = vencedor === d.ad_name;
                          return (
                            <div key={d.ad_name} className="flex items-center gap-2.5">
                              <span className="flex w-14 shrink-0 items-center gap-1.5 text-[11px] text-ink-secondary">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[i] }} />
                                {d.short.replace(/[[\]]/g, "")}
                              </span>
                              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-surface-3">
                                <div
                                  className="absolute inset-y-0 left-0 rounded-md transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background: colors[i],
                                    opacity: ganhou ? 1 : 0.55,
                                  }}
                                />
                              </div>
                              <span
                                className={`w-[96px] shrink-0 text-right text-sm tabular ${
                                  ganhou ? "font-bold text-[var(--good)]" : "text-ink"
                                }`}
                              >
                                {ganhou && (
                                  <span className="mr-1 align-middle">
                                    <Trophy />
                                  </span>
                                )}
                                {c.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
