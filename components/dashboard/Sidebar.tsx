"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PTStar } from "@/components/brand/PTStar";

export const NAV = [
  { href: "/dashboard", label: "Visão geral", icon: IconGrid },
  { href: "/dashboard/publico", label: "Público", icon: IconUsers },
  { href: "/dashboard/criativos", label: "Criativos", icon: IconLayers },
  { href: "/dashboard/midia", label: "Mídia & Plataformas", icon: IconTarget },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[268px] p-3 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
       <div
        className="flex h-full flex-col overflow-hidden rounded-3xl text-white shadow-2xl"
        style={{ background: "var(--pt-gradient)" }}
       >
        {/* marca */}
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white">
            <PTStar variant="red" className="h-7 w-7" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg tracking-wide">JERÔNIMO 2026</p>
            <p className="text-[11px] text-white/70">Painel de campanha</p>
          </div>
        </div>

        <div className="mx-5 h-px bg-white/15" />

        {/* navegação por páginas */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/55">
            Navegação
          </p>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active =
              n.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-[var(--pt-red-dark)] shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon />
                <span className="truncate">{n.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--pt-red)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* rodapé */}
        <div className="p-4">
          <div className="mx-1 mb-3 h-px bg-white/15" />
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <IconArrowLeft />
            Voltar ao início
          </Link>
          <a
            href="/api/logout"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <IconLogout />
            Sair
          </a>
          <p className="px-3 pt-3 text-[10px] text-white/55">
            Meta Ads · PT
          </p>
        </div>
       </div>
      </aside>
    </>
  );
}

/* ---- ícones ---- */
function base(children: React.ReactNode) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      {children}
    </svg>
  );
}
function IconGrid() {
  return base(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>);
}
function IconUsers() {
  return base(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>);
}
function IconLayers() {
  return base(<><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></>);
}
function IconTarget() {
  return base(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>);
}
function IconArrowLeft() {
  return base(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>);
}
function IconLogout() {
  return base(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>);
}
