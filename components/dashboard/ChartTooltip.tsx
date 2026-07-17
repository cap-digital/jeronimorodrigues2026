"use client";
import { ReactNode } from "react";

export interface TipRow {
  label: string;
  value: string;
  color?: string;
}

/* Tooltip escuro e consistente para todos os gráficos Recharts. */
export function TooltipBox({
  title,
  rows,
  footer,
}: {
  title?: string;
  rows: TipRow[];
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-surface-1 px-3 py-2 shadow-xl">
      {title && (
        <p className="mb-1.5 text-xs font-semibold text-ink">{title}</p>
      )}
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {r.color && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: r.color }}
              />
            )}
            <span className="text-ink-secondary">{r.label}</span>
            <span className="ml-auto pl-4 font-semibold tabular text-ink">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-1.5 text-[11px] text-ink-muted">{footer}</div>}
    </div>
  );
}
