/* Tipos e helpers dos Relatórios (compartilhados servidor + cliente) */

export type TipoRelatorio = "dia" | "semana" | "mes";

/* Registro como vem da tabela `relatorios` do Supabase. */
export interface RelatorioRow {
  id: string;
  titulo: string;
  tipo: TipoRelatorio;
  periodo_inicio: string | null; // "YYYY-MM-DD"
  periodo_fim: string | null; // "YYYY-MM-DD"
  arquivo_path: string;
  arquivo_nome: string;
  mime: string | null;
  tamanho: number | null; // bytes
  criado_em: string; // ISO
}

export const TIPO_LABEL: Record<TipoRelatorio, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
};

export const TIPOS: TipoRelatorio[] = ["dia", "semana", "mes"];

export function isTipo(v: unknown): v is TipoRelatorio {
  return v === "dia" || v === "semana" || v === "mes";
}

/* "2026-07-01" -> "01/07/2026" */
export function fmtDateBR(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/* Rótulo do período: "01/07/2026 até 07/07/2026" ou "01/07/2026" (dia). */
export function fmtPeriodo(r: Pick<RelatorioRow, "periodo_inicio" | "periodo_fim">): string {
  const ini = fmtDateBR(r.periodo_inicio);
  const fim = fmtDateBR(r.periodo_fim);
  if (ini && fim && ini !== fim) return `${ini} até ${fim}`;
  return ini || fim || "";
}

/* Título exibido: usa o título salvo, senão monta a partir do tipo/período. */
export function tituloExibido(r: RelatorioRow): string {
  if (r.titulo && r.titulo.trim()) return r.titulo.trim();
  const periodo = fmtPeriodo(r);
  return `Relatório ${TIPO_LABEL[r.tipo]}${periodo ? " " + periodo : ""}`;
}

/* Sugestão de título ao adicionar (mesma regra do título exibido). */
export function sugerirTitulo(
  tipo: TipoRelatorio,
  inicio: string,
  fim: string
): string {
  const periodo = fmtPeriodo({ periodo_inicio: inicio, periodo_fim: fim });
  return `Relatório ${TIPO_LABEL[tipo]}${periodo ? " " + periodo : ""}`;
}

const UNIDADES = ["B", "KB", "MB", "GB"];
export function fmtTamanho(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < UNIDADES.length - 1) {
    v /= 1024;
    i++;
  }
  const casas = i === 0 ? 0 : 1;
  return `${v.toLocaleString("pt-BR", { maximumFractionDigits: casas })} ${UNIDADES[i]}`;
}

/* Extensão do arquivo (minúscula, sem ponto). */
export function extDe(nome: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(nome.trim());
  return m ? m[1].toLowerCase() : "";
}

export const EXTENSOES_ACEITAS = ["pdf", "doc", "docx"];
export const ACCEPT_ATTR = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function extAceita(nome: string): boolean {
  return EXTENSOES_ACEITAS.includes(extDe(nome));
}
