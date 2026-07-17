"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useDashboard } from "@/lib/dashboardContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { error, refresh } = useDashboard();

  return (
    <div className="min-h-screen bg-plane">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-[268px]">
        <div className="mx-auto max-w-[1480px]">
          <TopBar onMenu={() => setOpen(true)} />
          <main className="space-y-4 px-5 py-6 sm:px-8">
            {error && (
              <div className="panel-2 flex items-center justify-between gap-3 border-l-4 border-l-[var(--critical)] p-4">
                <p className="text-sm text-ink-secondary">
                  Não foi possível atualizar os dados: {error}
                </p>
                <button
                  onClick={refresh}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:text-ink"
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
