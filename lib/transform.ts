import { MetaRow, PlacementRow, Period } from "./types";
import { num } from "./format";

/* ---------- somatório de métricas-base ---------- */

const BASE_KEYS = [
  "spend",
  "clicks",
  "impressions",
  "reach",
  "video_play_actions_video_view",
  "video_thruplay_watched_actions_video_view",
  "video_p25_watched_actions_video_view",
  "video_p50_watched_actions_video_view",
  "video_p75_watched_actions_video_view",
  "video_p95_watched_actions_video_view",
  "video_p100_watched_actions_video_view",
  "actions_post_engagement",
  "actions_comment",
  "actions_onsite_conversion_post_save",
  "actions_post_reaction",
  "actions_post",
  "instagram_profile_visits",
] as const;

export type BaseKey = (typeof BASE_KEYS)[number];
export type Totals = Record<BaseKey, number>;

export const emptyTotals = (): Totals =>
  BASE_KEYS.reduce((acc, k) => ((acc[k] = 0), acc), {} as Totals);

export function sumRows(rows: Array<MetaRow | PlacementRow>): Totals {
  const t = emptyTotals();
  for (const r of rows) {
    for (const k of BASE_KEYS) t[k] += num((r as never)[k]);
  }
  return t;
}

/* ---------- KPIs derivados ---------- */

export interface Kpis extends Totals {
  ctr: number; // %
  cpm: number; // R$
  cpc: number; // R$
  frequency: number;
  cpe: number; // custo por engajamento
  costPerThruplay: number;
  engagementRate: number; // % sobre alcance
  hookRate: number; // p25 / plays  %
  holdRate: number; // p100 / plays %
  thruplayRate: number; // thruplay / plays %
}

export function toKpis(t: Totals): Kpis {
  const safe = (n: number, d: number) => (d > 0 ? n / d : 0);
  return {
    ...t,
    ctr: safe(t.clicks, t.impressions) * 100,
    cpm: safe(t.spend, t.impressions) * 1000,
    cpc: safe(t.spend, t.clicks),
    frequency: safe(t.impressions, t.reach),
    cpe: safe(t.spend, t.actions_post_engagement),
    costPerThruplay: safe(
      t.spend,
      t.video_thruplay_watched_actions_video_view
    ),
    engagementRate: safe(t.actions_post_engagement, t.reach) * 100,
    hookRate:
      safe(
        t.video_p25_watched_actions_video_view,
        t.video_play_actions_video_view
      ) * 100,
    holdRate:
      safe(
        t.video_p100_watched_actions_video_view,
        t.video_play_actions_video_view
      ) * 100,
    thruplayRate:
      safe(
        t.video_thruplay_watched_actions_video_view,
        t.video_play_actions_video_view
      ) * 100,
  };
}

/* ---------- filtro de período (único filtro global) ---------- */

export function inPeriod(iso: string, p: Period): boolean {
  const d = iso.slice(0, 10);
  if (p.from && d < p.from) return false;
  if (p.to && d > p.to) return false;
  return true;
}

export function filterMeta(rows: MetaRow[], p: Period): MetaRow[] {
  return rows.filter((r) => inPeriod(r.date, p));
}

export function filterPlacement(rows: PlacementRow[], p: Period): PlacementRow[] {
  return rows.filter((r) => inPeriod(r.date, p));
}

/* ---------- dimensões (para selects) ---------- */

export function uniqueDates(rows: MetaRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.date.slice(0, 10)))).sort();
}
export function uniqueCreatives(rows: MetaRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.ad_name))).sort();
}
export function uniqueAges(rows: MetaRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.age))).sort();
}

/* ---------- séries temporais (por dia) ---------- */

export interface DayPoint {
  date: string; // yyyy-mm-dd
  kpis: Kpis;
}
export function byDay(rows: MetaRow[]): DayPoint[] {
  const map = new Map<string, MetaRow[]>();
  for (const r of rows) {
    const d = r.date.slice(0, 10);
    (map.get(d) ?? map.set(d, []).get(d)!).push(r);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rs]) => ({ date, kpis: toKpis(sumRows(rs)) }));
}

/* ---------- projeção (tendência linear) ---------- */

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/* dia da semana 0=domingo..6=sábado, a partir de yyyy-mm-dd (UTC) */
export function weekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export interface ProjPoint {
  date: string;
  actual: number | null;
  projected: number | null;
}

/* Ajusta uma reta (mínimos quadrados) aos dias observados e projeta `ahead`
   dias à frente. O último ponto real também recebe valor projetado para
   conectar as duas linhas. */
export function projectDaily(
  days: DayPoint[],
  get: (d: DayPoint) => number,
  ahead = 3
): { rows: ProjPoint[]; hasProjection: boolean } {
  const n = days.length;
  if (n === 0) return { rows: [], hasProjection: false };
  const ys = days.map(get);
  if (n < 2) {
    return {
      rows: days.map((d) => ({ date: d.date, actual: get(d), projected: null })),
      hasProjection: false,
    };
  }
  // regressão linear y = m*x + b
  const xs = ys.map((_, i) => i);
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const m = den === 0 ? 0 : num / den;
  const b = my - m * mx;

  const rows: ProjPoint[] = days.map((d, i) => ({
    date: d.date,
    actual: ys[i],
    projected: i === n - 1 ? ys[i] : null, // conecta no último real
  }));
  const lastDate = days[n - 1].date;
  for (let k = 1; k <= ahead; k++) {
    rows.push({
      date: addDays(lastDate, k),
      actual: null,
      projected: Math.max(0, m * (n - 1 + k) + b),
    });
  }
  return { rows, hasProjection: true };
}

/* ---------- pirâmide idade × gênero ---------- */

export interface PyramidRow {
  age: string;
  female: number;
  male: number;
  unknown: number;
  total: number;
}
const AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
export function agePyramid(
  rows: MetaRow[],
  metric: BaseKey = "reach"
): PyramidRow[] {
  const map = new Map<string, PyramidRow>();
  for (const a of AGE_ORDER)
    map.set(a, { age: a, female: 0, male: 0, unknown: 0, total: 0 });
  for (const r of rows) {
    const row = map.get(r.age);
    if (!row) continue;
    const v = num((r as never)[metric]);
    if (r.gender === "female") row.female += v;
    else if (r.gender === "male") row.male += v;
    else row.unknown += v;
    row.total += v;
  }
  return AGE_ORDER.map((a) => map.get(a)!);
}

/* ---------- por criativo ---------- */

export interface CreativeStat {
  ad_name: string;
  short: string;
  thumbnail_url: string;
  instagram_permalink_url: string;
  kpis: Kpis;
}
export function byCreative(rows: MetaRow[]): CreativeStat[] {
  const map = new Map<string, MetaRow[]>();
  for (const r of rows) {
    (map.get(r.ad_name) ?? map.set(r.ad_name, []).get(r.ad_name)!).push(r);
  }
  return Array.from(map.entries())
    .map(([ad_name, rs]) => ({
      ad_name,
      short: shortCreative(ad_name),
      thumbnail_url: rs[0]?.thumbnail_url ?? "",
      instagram_permalink_url: rs[0]?.instagram_permalink_url ?? "",
      kpis: toKpis(sumRows(rs)),
    }))
    .sort((a, b) => a.ad_name.localeCompare(b.ad_name));
}

export function shortCreative(ad_name: string): string {
  // "[AD 01] É escola que não acaba mais!" -> "AD 01"
  const m = ad_name.match(/\[(AD\s*\d+)\]/i);
  return m ? m[1].replace(/\s+/g, " ").toUpperCase() : ad_name.slice(0, 12);
}
export function themeCreative(ad_name: string): string {
  if (/escola/i.test(ad_name)) return "Escolas";
  if (/hospital/i.test(ad_name)) return "Hospitais";
  if (/mulher/i.test(ad_name)) return "Mulheres";
  return "Criativo";
}

/* ---------- funil de vídeo ---------- */

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
  pct: number; // sobre plays
}
export function videoFunnel(t: Totals): FunnelStage[] {
  const plays = t.video_play_actions_video_view || 1;
  const stages: Array<[string, string, number]> = [
    ["plays", "Reproduções", t.video_play_actions_video_view],
    ["p25", "25%", t.video_p25_watched_actions_video_view],
    ["p50", "50%", t.video_p50_watched_actions_video_view],
    ["p75", "75%", t.video_p75_watched_actions_video_view],
    ["p95", "95%", t.video_p95_watched_actions_video_view],
    ["p100", "100%", t.video_p100_watched_actions_video_view],
  ];
  return stages.map(([key, label, value]) => ({
    key,
    label,
    value,
    pct: (value / plays) * 100,
  }));
}

/* ---------- engajamento (barras) ---------- */

export interface EngagementItem {
  key: string;
  label: string;
  value: number;
}
export function engagementBreakdown(t: Totals): EngagementItem[] {
  return [
    { key: "reaction", label: "Reações", value: t.actions_post_reaction },
    { key: "visit", label: "Visitas ao perfil", value: t.instagram_profile_visits },
    { key: "comment", label: "Comentários", value: t.actions_comment },
    { key: "share", label: "Compartilh.", value: t.actions_post },
    { key: "save", label: "Salvamentos", value: t.actions_onsite_conversion_post_save },
  ]
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value);
}

/* ---------- placements ---------- */

export interface PlacementStat {
  publisher_platform: string;
  platform_position: string;
  key: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  cpc: number;
  cpm: number;
}
export function byPlacement(rows: PlacementRow[]): PlacementStat[] {
  const map = new Map<string, PlacementRow[]>();
  for (const r of rows) {
    const k = `${r.publisher_platform}__${r.platform_position}`;
    (map.get(k) ?? map.set(k, []).get(k)!).push(r);
  }
  return Array.from(map.entries())
    .map(([, rs]) => {
      const t = sumRows(rs);
      return {
        publisher_platform: rs[0].publisher_platform,
        platform_position: rs[0].platform_position,
        key: `${rs[0].publisher_platform}/${rs[0].platform_position}`,
        spend: t.spend,
        impressions: t.impressions,
        clicks: t.clicks,
        reach: t.reach,
        ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0,
        cpc: t.clicks > 0 ? t.spend / t.clicks : 0,
        cpm: t.impressions > 0 ? (t.spend / t.impressions) * 1000 : 0,
      };
    })
    .filter((p) => p.spend > 0 || p.impressions > 0)
    .sort((a, b) => b.spend - a.spend);
}

export interface PlatformSplit {
  platform: string;
  reach: number;
  impressions: number;
  spend: number;
}
export function byPlatform(rows: PlacementRow[]): PlatformSplit[] {
  const map = new Map<string, Totals>();
  for (const r of rows) {
    const p = r.publisher_platform;
    if (!map.has(p)) map.set(p, emptyTotals());
    const t = map.get(p)!;
    t.reach += num(r.reach);
    t.impressions += num(r.impressions);
    t.spend += num(r.spend);
  }
  return Array.from(map.entries())
    .map(([platform, t]) => ({
      platform,
      reach: t.reach,
      impressions: t.impressions,
      spend: t.spend,
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

/* ---------- insights automáticos ---------- */

export interface Insight {
  tone: "good" | "neutral" | "warning";
  title: string;
  body: string;
}

export function buildInsights(
  meta: MetaRow[],
  placement: PlacementRow[]
): Insight[] {
  const out: Insight[] = [];
  const creatives = byCreative(meta);
  if (creatives.length) {
    const bestCtr = [...creatives].sort((a, b) => b.kpis.ctr - a.kpis.ctr)[0];
    out.push({
      tone: "good",
      title: `Melhor CTR: ${bestCtr.short}`,
      body: `"${themeCreative(bestCtr.ad_name)}" lidera em cliques com CTR de ${bestCtr.kpis.ctr.toFixed(
        2
      )}% — o criativo mais eficiente para gerar tráfego.`,
    });
    const bestReach = [...creatives].sort(
      (a, b) => b.kpis.reach - a.kpis.reach
    )[0];
    out.push({
      tone: "neutral",
      title: `Maior alcance: ${bestReach.short}`,
      body: `"${themeCreative(
        bestReach.ad_name
      )}" alcançou ${Math.round(
        bestReach.kpis.reach
      ).toLocaleString("pt-BR")} pessoas, o maior da campanha.`,
    });
  }

  const places = byPlacement(placement);
  if (places.length) {
    const topClicks = [...places].sort((a, b) => b.ctr - a.ctr)[0];
    out.push({
      tone: "good",
      title: `Posicionamento campeão de CTR`,
      body: `${topClicks.key} converte melhor: CTR de ${topClicks.ctr.toFixed(
        2
      )}% e CPC de R$ ${topClicks.cpc.toFixed(2)}.`,
    });
  }

  const pyr = agePyramid(meta, "reach");
  const totalReach = pyr.reduce((s, r) => s + r.total, 0);
  const young =
    pyr
      .filter((r) => r.age === "18-24" || r.age === "25-34")
      .reduce((s, r) => s + r.total, 0) / (totalReach || 1);
  const fem =
    pyr.reduce((s, r) => s + r.female, 0) / (totalReach || 1);
  out.push({
    tone: "neutral",
    title: "Perfil do público",
    body: `${Math.round(young * 100)}% do alcance está entre 18 e 34 anos e ${Math.round(
      fem * 100
    )}% é do público feminino.`,
  });

  const t = toKpis(sumRows(meta));
  if (t.holdRate > 0) {
    out.push({
      tone: t.holdRate < 2 ? "warning" : "neutral",
      title: "Retenção de vídeo",
      body: `Apenas ${t.holdRate.toFixed(
        1
      )}% de quem começa o vídeo assiste até o fim. Vídeos mais curtos ou ganchos mais fortes nos 3s iniciais podem elevar esse número.`,
    });
  }
  return out;
}
