"use client";
import { ReactNode, useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  sortValue: (row: T) => number | string;
  render: (row: T) => ReactNode;
}

export function SortableTable<T>({
  columns,
  rows,
  initialSort,
  initialDir = "desc",
}: {
  columns: Column<T>[];
  rows: T[];
  initialSort?: string;
  initialDir?: "asc" | "desc";
}) {
  const [sortKey, setSortKey] = useState(initialSort ?? columns[0].key);
  const [dir, setDir] = useState<"asc" | "desc">(initialDir);

  const col = columns.find((c) => c.key === sortKey) ?? columns[0];
  const sorted = [...rows].sort((a, b) => {
    const va = col.sortValue(a);
    const vb = col.sortValue(b);
    let cmp: number;
    if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
    else cmp = String(va).localeCompare(String(vb), "pt-BR");
    return dir === "asc" ? cmp : -cmp;
  });

  const onSort = (key: string) => {
    if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("desc");
    }
  };

  return (
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
          {sorted.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-surface-3">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-2.5 tabular ${
                    c.align === "right" ? "text-right" : "text-left"
                  } ${c.key === columns[0].key ? "font-medium text-ink" : "text-ink-secondary"}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
