"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "@/lib/dashboardContext";
import { Period } from "@/lib/types";
import { addDays } from "@/lib/transform";
import { fmtDayMonth } from "@/lib/format";

function eq(a: Period, b: Period) {
  return a.from === b.from && a.to === b.to;
}

export function PeriodPicker() {
  const { period, setPeriod, dates } = useDashboard();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const latest = dates[dates.length - 1] ?? "";
  const earliest = dates[0] ?? "";
  const firstOfMonth = latest ? latest.slice(0, 8) + "01" : "";

  const presets = useMemo(() => {
    if (!latest) return [] as { label: string; period: Period }[];
    const back = (n: number): Period => ({ from: addDays(latest, -(n - 1)), to: latest });
    return [
      { label: "Todo o período", period: { from: null, to: null } as Period },
      { label: "Último dia", period: { from: latest, to: latest } },
      { label: "Últimos 7 dias", period: back(7) },
      { label: "Últimos 14 dias", period: back(14) },
      { label: "Últimos 30 dias", period: back(30) },
      { label: "Este mês", period: { from: firstOfMonth, to: latest } },
    ];
  }, [latest, firstOfMonth]);

  const [from, setFrom] = useState(period.from ?? earliest);
  const [to, setTo] = useState(period.to ?? latest);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const activePreset = presets.find((p) => eq(p.period, period));
  const label = activePreset
    ? activePreset.label
    : period.from && period.to
    ? `${fmtDayMonth(period.from)} – ${fmtDayMonth(period.to)}`
    : "Selecionar período";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border bg-surface-1 px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-surface-3"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        {label}
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-ink-muted">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[280px] rounded-2xl border bg-surface-1 p-2 shadow-xl">
          <div className="space-y-0.5">
            {presets.map((p) => {
              const active = eq(p.period, period);
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setPeriod(p.period);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-[var(--pt-red-soft)] font-semibold text-[var(--pt-red-dark)]" : "text-ink-secondary hover:bg-surface-3"
                  }`}
                >
                  {p.label}
                  {active && (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-2 border-t" />
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Intervalo personalizado
          </p>
          <div className="flex items-end gap-2 px-2">
            <label className="flex-1">
              <span className="mb-1 block text-[11px] text-ink-muted">De</span>
              <input
                type="date"
                value={from}
                min={earliest}
                max={latest}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border bg-surface-1 px-2 py-1.5 text-xs text-ink outline-none focus:border-[var(--pt-red)]"
              />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-[11px] text-ink-muted">Até</span>
              <input
                type="date"
                value={to}
                min={from || earliest}
                max={latest}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border bg-surface-1 px-2 py-1.5 text-xs text-ink outline-none focus:border-[var(--pt-red)]"
              />
            </label>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                if (from && to) {
                  const a = from <= to ? from : to;
                  const b = from <= to ? to : from;
                  setPeriod({ from: a, to: b });
                }
                setOpen(false);
              }}
              className="w-full rounded-lg bg-[var(--pt-red)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--pt-red-dark)]"
            >
              Aplicar intervalo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
