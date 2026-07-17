/* Paleta de gráficos — validada com o validador da skill dataviz
   (modo claro, superfície #ffffff). Cada subconjunto usado JUNTO em um
   mesmo gráfico passa nas seis verificações. NÃO alterar sem revalidar. */

export const CHART = {
  surface: "#ffffff",
  plane: "#f5f5f4",
  grid: "#ededeb",
  axis: "#d7d7d3",
  ink: "#17171b",
  inkSecondary: "#55555d",
  inkMuted: "#86868e",
  border: "rgba(0,0,0,0.09)",
} as const;

/* Marca PT */
export const RED = "#e4142c"; // vermelho PT — contraste ≥3:1 em branco (marcas)
export const RED_BASE = "#e4142c";
export const RED_DARK = "#b9142c";

/* Séries categóricas (modo claro) */
export const SERIES = {
  red: "#e4142c",
  purple: "#7c3aed",
  teal: "#199e70",
  amber: "#c98500",
  magenta: "#cf3a7f",
  neutral: "#9a9aa2",
} as const;

/* Criativos (radar/comparativo) — {red, teal, amber} valida em all-pairs */
export const CREATIVE_COLORS = [SERIES.red, SERIES.teal, SERIES.amber] as const;

/* Plataformas — foco vermelho + roxo. {red, purple} valida em all-pairs (ΔE 108). */
export const PLATFORM_COLORS: Record<string, string> = {
  facebook: SERIES.purple,
  instagram: SERIES.red,
};

/* Gênero — {red, purple} + neutro */
export const GENDER_COLORS: Record<string, string> = {
  female: SERIES.red,
  male: SERIES.purple,
  unknown: SERIES.neutral,
};

/* Rampa ordinal (funil de vídeo) — vermelho, 6 passos, validado --ordinal (claro) */
export const FUNNEL_RAMP = [
  "#f2939c",
  "#e86b77",
  "#df4453",
  "#cc2637",
  "#ad1c2b",
  "#8a1522",
] as const;

/* Status (fixo) */
export const STATUS = {
  good: "#0f9d0f",
  warning: "#c98500",
  critical: "#d3122a",
} as const;

/* Escala sequencial vermelha (heatmap) — célula vazia + 5 níveis claro→escuro */
export const HEAT_EMPTY = "#eceef0";
export const HEAT_SCALE = [
  "#fcd5da",
  "#f6a3ac",
  "#ee6b78",
  "#dd2f42",
  "#b3111f",
] as const;

/* value 0..1 -> cor do heatmap */
export function heatColor(t: number): string {
  if (t <= 0) return HEAT_EMPTY;
  const i = Math.min(HEAT_SCALE.length - 1, Math.floor(t * HEAT_SCALE.length));
  return HEAT_SCALE[i];
}
