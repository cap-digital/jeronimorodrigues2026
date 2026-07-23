"use client";
import { useState } from "react";
import { PTStar } from "@/components/brand/PTStar";

export function LoginForm({ next }: { next: string }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!senha || carregando) return;
    setCarregando(true);
    setErro(false);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (!res.ok) {
        setErro(true);
        setSenha("");
        setCarregando(false);
        return;
      }
      // Recarrega no destino já autenticado (garante o cookie no SSR).
      window.location.assign(next || "/");
    } catch {
      setErro(true);
      setCarregando(false);
    }
  }

  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden px-6 text-white"
      style={{ background: "var(--pt-gradient)" }}
    >
      {/* estrela gigante de fundo, bem suave */}
      <PTStar
        variant="white"
        className="pointer-events-none absolute -right-24 -top-24 h-[460px] w-[460px] opacity-[0.06]"
      />

      <form onSubmit={enviar} className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <p className="font-display text-2xl tracking-wide">JERÔNIMO 2026</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
          Área restrita
        </p>

        {/* estrela (emblema) */}
        <PTStar
          variant="white"
          className="mt-8 h-56 w-56 drop-shadow-[0_22px_50px_rgba(0,0,0,0.28)] sm:h-64 sm:w-64"
        />

        {/* campo de senha, abaixo da estrela */}
        <div className={`mt-7 w-[280px] max-w-full ${erro ? "shake" : ""}`}>
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-[0_14px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
            <input
              type="password"
              inputMode="text"
              autoFocus
              autoComplete="current-password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (erro) setErro(false);
              }}
              placeholder="Senha"
              aria-label="Senha de acesso"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={carregando || !senha}
              aria-label="Entrar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--pt-red)] text-white transition-transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
            >
              {carregando ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="spin">
                  <path d="M21 12a9 9 0 1 1-6.2-8.5" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* mensagem / erro */}
        <div className="mt-6 h-5">
          {erro ? (
            <p className="text-sm font-medium text-white">Senha incorreta. Tente novamente.</p>
          ) : (
            <p className="text-xs text-white/70">Digite a senha para acessar o painel.</p>
          )}
        </div>
      </form>
    </main>
  );
}
