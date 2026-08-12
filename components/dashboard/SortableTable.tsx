"use client";
import { ReactNode, useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  wrap?: boolean; // permite quebrar linha (senão, nowrap)
  className?: string; // classes extras na célula
  sortValue: (row: T) => number | string;
  render: (row: T) => ReactNode;
}

export function SortableTable<T>({
  columns,
  rows,
  initialSort,
  initialDir = "desc",
  pageSize,
}: {
  columns: Column<T>[];
  rows: T[];
  initialSort?: string;
  initialDir?: "asc" | "desc";
  pageSize?: number;
}) {
  const [sortKey, setSortKey] = useState(initialSort ?? columns[0].key);
  const [dir, setDir] = useState<"asc" | "desc">(initialDir);
  const [page, setPage] = useState(0);

  const col = columns.find((c) => c.key === sortKey) ?? columns[0];
  const sorted = [...rows].sort((a, b) => {
    const va = col.sortValue(a);
    const vb = col.sortValue(b);
    let cmp: number;
    if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
    else cmp = String(va).localeCompare(String(vb), "pt-BR");
    return dir === "asc" ? cmp : -cmp;
  });

  const totalPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const pageClamped = Math.min(page, totalPages - 1);
  const visible = pageSize
    ? sorted.slice(pageClamped * pageSize, pageClamped * pageSize + pageSize)
    : sorted;

  const onSort = (key: string) => {
    if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("desc");
    }
    setPage(0);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((c) => {
                const activeCol = c.key === sortKey;
                return (
                  <th
                    key={c.key}
                    onClick={() => onSort(c.key)}
                    className={`cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted transition-colors hover:text-ink ${
                      c.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                      {c.label}
                      <span className={activeCol ? "text-[var(--pt-red)]" : "text-transparent"}>
                        {activeCol && dir === "asc" ? "▲" : "▼"}
                      </span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-surface-3">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2.5 align-top tabular ${c.wrap ? "" : "whitespace-nowrap"} ${
                      c.align === "right" ? "text-right" : "text-left"
                    } ${c.key === columns[0].key ? "font-medium text-ink" : "text-ink-secondary"} ${c.className ?? ""}`}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize && totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3 px-1">
          <span className="text-xs text-ink-muted">
            {pageClamped * pageSize + 1}–{Math.min((pageClamped + 1) * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={pageClamped === 0}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-1 text-xs text-ink-muted">
              {pageClamped + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={pageClamped >= totalPages - 1}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
