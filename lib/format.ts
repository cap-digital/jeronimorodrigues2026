/* Formatação pt-BR */

export const num = (v: unknown): number => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});
const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const fmtBRL = (v: number) => brl.format(v);
export const fmtBRLCompact = (v: number) => brlCompact.format(v);
export const fmtInt = (v: number) => int.format(Math.round(v));
export const fmtCompact = (v: number) => compact.format(v);

export const fmtPct = (v: number, digits = 2) =>
  `${v.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;

export const fmtDec = (v: number, digits = 2) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/* "2026-07-16T03:00:00.000Z" -> "16/07" */
export const fmtDayShort = (iso: string) => {
  const d = iso.slice(0, 10).split("-");
  return `${d[2]}/${d[1]}`;
};

/* "2026-07-16..." -> "16 jul" */
const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
export const fmtDayMonth = (iso: string) => {
  const [, m, dd] = iso.slice(0, 10).split("-");
  return `${dd} ${MESES[parseInt(m, 10) - 1]}`;
};

/* timeZone fixo (Bahia, UTC-3) para o resultado ser idêntico no servidor
   e no cliente — evita erro de hidratação do React. */
export const fmtDateTime = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bahia",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const GENDER_LABEL: Record<string, string> = {
  female: "Feminino",
  male: "Masculino",
  unknown: "Não identif.",
};

export const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
};

/* Métricas demográficas disponíveis (por idade × gênero) — para o dropdown
   da pirâmide e da divisão por gênero. Todas existem por linha em `meta`. */
export const DEMO_METRIC_OPTIONS: { value: string; label: string }[] = [
  { value: "reach", label: "Alcance" },
  { value: "impressions", label: "Impressões" },
  { value: "clicks", label: "Cliques" },
  { value: "actions_post_engagement", label: "Engajamento" },
  { value: "actions_post_reaction", label: "Reações" },
  { value: "instagram_profile_visits", label: "Visitas ao perfil" },
  { value: "video_play_actions_video_view", label: "Reproduções de vídeo" },
  { value: "actions_comment", label: "Comentários" },
];

export const POSITION_LABEL: Record<string, string> = {
  feed: "Feed",
  instagram_stories: "Stories",
  facebook_stories: "Stories",
  instagram_reels: "Reels",
  instream_video: "In-stream",
};
