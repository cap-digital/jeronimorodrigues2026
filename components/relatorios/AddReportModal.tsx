"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  RELATORIOS_BUCKET,
} from "@/lib/supabase";
import {
  ACCEPT_ATTR,
  extAceita,
  fmtTamanho,
  sugerirTitulo,
  TIPOS,
  TIPO_LABEL,
  type RelatorioRow,
  type TipoRelatorio,
} from "@/lib/relatorios";
import { Segmented } from "@/components/dashboard/ui";

type Etapa = "idle" | "enviando" | "salvando";

export function AddReportModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: RelatorioRow) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoRelatorio>("semana");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [titulo, setTitulo] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ocupado = etapa !== "idle";

  // Para "dia", período = uma única data.
  const fimEfetivo = tipo === "dia" ? inicio : fim;

  const sugestao = useMemo(
    () => sugerirTitulo(tipo, inicio, fimEfetivo),
    [tipo, inicio, fimEfetivo]
  );

  // fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ocupado) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, ocupado]);

  function escolher(f: File | null) {
    setErro(null);
    if (f && !extAceita(f.name)) {
      setErro("Formato não aceito. Envie um arquivo PDF, DOC ou DOCX.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function enviar() {
    setErro(null);
    if (!file) return setErro("Selecione um arquivo (PDF ou DOCX).");
    if (!inicio) return setErro("Informe a data do relatório.");
    if (tipo !== "dia" && !fim) return setErro("Informe a data final do período.");
    if (fimEfetivo && inicio && fimEfetivo < inicio)
      return setErro("A data final não pode ser anterior à inicial.");

    try {
      // 1) endereço assinado para subir o arquivo direto ao Storage
      setEtapa("enviando");
      const res = await fetch("/api/relatorios/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: file.name }),
      });
      const prep = await res.json();
      if (!res.ok) throw new Error(prep.error || "Falha ao preparar o upload.");

      // 2) upload direto (contorna o limite de tamanho das funções)
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const up = await supabase.storage
        .from(RELATORIOS_BUCKET)
        .uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: file.type || undefined,
        });
      if (up.error) throw new Error(up.error.message);

      // 3) grava os metadados
      setEtapa("salvando");
      const meta = await fetch("/api/relatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim() || sugestao,
          tipo,
          periodo_inicio: inicio || null,
          periodo_fim: fimEfetivo || null,
          arquivo_path: prep.path,
          arquivo_nome: file.name,
          mime: file.type || null,
          tamanho: file.size,
        }),
      });
      const salvo = await meta.json();
      if (!meta.ok) throw new Error(salvo.error || "Falha ao salvar o relatório.");

      onCreated(salvo.relatorio as RelatorioRow);
      onClose();
    } catch (e) {
      setEtapa("idle");
      setErro(e instanceof Error ? e.message : "Não foi possível enviar o relatório.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={() => !ocupado && onClose()}
    >
      <div
        className="panel w-full max-w-lg p-5 sm:p-6 fade-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar relatório"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-ink">
              Adicionar relatório
            </h2>
            <p className="mt-0.5 text-sm text-ink-secondary">
              Envie um arquivo PDF ou DOCX e defina o período.
            </p>
          </div>
          <button
            onClick={() => !ocupado && onClose()}
            disabled={ocupado}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* arquivo */}
        <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Arquivo
        </label>
        <div className="mt-1.5">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => escolher(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={ocupado}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-strong bg-surface-3 px-4 py-4 text-left transition-colors hover:border-[var(--pt-red)] disabled:opacity-60"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--pt-red-soft)] text-[var(--pt-red-dark)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </span>
            <span className="min-w-0">
              {file ? (
                <>
                  <span className="block truncate text-sm font-medium text-ink">{file.name}</span>
                  <span className="text-xs text-ink-muted">{fmtTamanho(file.size)} · toque para trocar</span>
                </>
              ) : (
                <>
                  <span className="block text-sm font-medium text-ink">Selecionar arquivo</span>
                  <span className="text-xs text-ink-muted">PDF, DOC ou DOCX</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* tipo */}
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Tipo
          </p>
          <Segmented
            value={tipo}
            onChange={(v) => setTipo(v)}
            options={TIPOS.map((t) => ({ value: t, label: TIPO_LABEL[t] }))}
          />
        </div>

        {/* período */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {tipo === "dia" ? "Data" : "De"}
            </span>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              disabled={ocupado}
              className="rounded-lg border bg-surface-1 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-[var(--pt-red)]"
            />
          </label>
          {tipo !== "dia" && (
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Até
              </span>
              <input
                type="date"
                value={fim}
                min={inicio || undefined}
                onChange={(e) => setFim(e.target.value)}
                disabled={ocupado}
                className="rounded-lg border bg-surface-1 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-[var(--pt-red)]"
              />
            </label>
          )}
        </div>

        {/* título opcional */}
        <label className="mt-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Título <span className="normal-case text-ink-muted/80">(opcional)</span>
          </span>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={sugestao}
            disabled={ocupado}
            className="rounded-lg border bg-surface-1 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-[var(--pt-red)]"
          />
        </label>

        {erro && (
          <p className="mt-4 rounded-lg border-l-4 border-l-[var(--critical)] bg-[var(--pt-red-soft)] px-3 py-2 text-sm text-[var(--pt-red-dark)]">
            {erro}
          </p>
        )}

        {/* ações */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={() => !ocupado && onClose()}
            disabled={ocupado}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={ocupado || !file}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--pt-red)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
          >
            {ocupado && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="spin">
                <path d="M21 12a9 9 0 1 1-6.2-8.5" />
              </svg>
            )}
            {etapa === "enviando" ? "Enviando…" : etapa === "salvando" ? "Salvando…" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
