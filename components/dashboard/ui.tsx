"use client";
import { ReactNode } from "react";

/* ---------- Cartão de gráfico ---------- */
export function ChartCard({
  id,
  title,
  subtitle,
  tag,
  right,
  className = "",
  bodyClassName = "",
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  tag?: string;
  right?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`panel flex flex-col p-4 sm:p-5 fade-up ${className}`}
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
            {tag && (
              <span className="shrink-0 rounded-full border border-strong px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
          )}
        </div>
        {right && (
          <div className="-mx-1 shrink-0 overflow-x-auto px-1 sm:mx-0 sm:px-0">
            {right}
          </div>
        )}
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

/* ---------- Controle segmentado ---------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "xs";
}) {
  return (
    <div className="inline-flex rounded-lg border bg-surface-3 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md font-medium transition-colors ${
              size === "xs" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs"
            } ${
              active
                ? "bg-[var(--pt-red)] text-white shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Select nativo estilizado ---------- */
export function Select({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border bg-surface-1 py-2 pl-3 pr-8 text-sm text-ink outline-none transition-colors focus:border-[var(--pt-red)]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  );
}

/* ---------- Estado vazio ---------- */
export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="grid h-full min-h-[160px] place-items-center text-center">
      <div>
        <p className="text-sm text-ink-secondary">
          {message ?? "Sem dados para este filtro."}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Ajuste os filtros para ver resultados.
        </p>
      </div>
    </div>
  );
}
