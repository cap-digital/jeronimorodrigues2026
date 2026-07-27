/* ============================================================
   Comparativo de Criativos — modelo de dados e regras
   Adaptado às métricas realmente disponíveis (sem Leads/CPL).
   A lógica de "objetivos diferentes" fica pronta: só se ativa
   quando os anúncios comparados pertencem a objetivos distintos.
   ============================================================ */
import { MetaRow } from "./types";
import { Kpis, Totals, sumRows, toKpis, shortCreative } from "./transform";
import { num, fmtBRL, fmtInt, fmtPct, fmtDec, fmtCompact } from "./format";

/* ---------- objetivo (derivado do nome da campanha) ---------- */
export function objetivoDaCampanha(campaign: string): string {
  const c = (campaign || "").toUpperCase();
  if (/LEAD/.test(c)) return "Leads";
  if (/VISUALIZ|VÍDEO|VIDEO|VIEW|THRU/.test(c)) return "Visualização";
  if (/PERFIL|VISITA|OBRAS/.test(c)) return "Visitas ao Perfil";
  if (/ENGAJ/.test(c)) return "Engajamento";
  if (/CONVERS|VENDA/.test(c)) return "Conversões";
  if (/TR[ÁA]FEGO|CLIQUE|LINK/.test(c)) return "Tráfego";
  return "Alcance";
}

/* ---------- detalhe por criativo ---------- */
export interface CreativeDetail {
  ad_name: string;
  short: string; // "[AD 01]"
  thumbnail_url: string;
  instagram_permalink_url: string;
  campaign: string;
  objetivo: string;
  activeDays: number; // dias veiculados
  firstDate: string;
  lastDate: string;
  totals: Totals;
  kpis: Kpis;
  rows: MetaRow[];
}

export function buildCreativeDetails(meta: MetaRow[]): CreativeDetail[] {
  const map = new Map<string, MetaRow[]>();
  for (const r of meta) {
    (map.get(r.ad_name) ?? map.set(r.ad_name, []).get(r.ad_name)!).push(r);
  }
  return Array.from(map.entries())
    .map(([ad_name, rows]) => {
      const totals = sumRows(rows);
      const activeDates = Array.from(
        new Set(rows.filter((r) => num(r.impressions) > 0).map((r) => r.date.slice(0, 10)))
      ).sort();
      const campaign = rows[0]?.campaign ?? "";
      return {
        ad_name,
        short: `[${shortCreative(ad_name)}]`,
        thumbnail_url: rows[0]?.thumbnail_url ?? "",
        instagram_permalink_url: rows[0]?.instagram_permalink_url ?? "",
        campaign,
        objetivo: objetivoDaCampanha(campaign),
        activeDays: activeDates.length || 1,
        firstDate: activeDates[0] ?? "",
        lastDate: activeDates[activeDates.length - 1] ?? "",
        totals,
        kpis: toKpis(totals),
        rows,
      };
    })
    .sort((a, b) => a.ad_name.localeCompare(b.ad_name));
}

/* nome "temático" curto para leitura (ex.: "Escolas") */
export function temaDe(ad_name: string): string {
  if (/escola/i.test(ad_name)) return "Escolas";
  if (/hospital/i.test(ad_name)) return "Hospitais";
  if (/mulher/i.test(ad_name)) return "Mulheres";
  return "";
}

/* ---------- métricas comparadas ---------- */
export type Better = "higher" | "lower" | "none";
export type Kind = "int" | "brl" | "pct" | "dec";

export interface MetricDef {
  key: string;
  label: string;
  group: string;
  perDay: boolean; // contagem que vira média/dia (taxas = false)
  better: Better;
  kind: Kind;
  value: (d: CreativeDetail) => number; // total (perDay) ou taxa
}

const safe = (n: number, d: number) => (d > 0 ? n / d : 0);

export const GRUPOS = [
  "Entrega & alcance",
  "Cliques & conversão",
  "Vídeo & perfil",
  "Engajamento",
] as const;

export const METRICS: MetricDef[] = [
  // Entrega & alcance
  { key: "spend", label: "Investimento", group: GRUPOS[0], perDay: true, better: "none", kind: "brl", value: (d) => d.totals.spend },
  { key: "impressions", label: "Impressões", group: GRUPOS[0], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.impressions },
  { key: "reach", label: "Alcance", group: GRUPOS[0], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.reach },
  { key: "frequency", label: "Frequência", group: GRUPOS[0], perDay: false, better: "none", kind: "dec", value: (d) => d.kpis.frequency },
  { key: "cpm", label: "CPM", group: GRUPOS[0], perDay: false, better: "lower", kind: "brl", value: (d) => d.kpis.cpm },
  // Cliques & conversão
  { key: "clicks", label: "Cliques", group: GRUPOS[1], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.clicks },
  { key: "ctr", label: "CTR", group: GRUPOS[1], perDay: false, better: "higher", kind: "pct", value: (d) => d.kpis.ctr },
  { key: "cpc", label: "CPC", group: GRUPOS[1], perDay: false, better: "lower", kind: "brl", value: (d) => d.kpis.cpc },
  // Vídeo & perfil
  { key: "video", label: "Reproduções de vídeo", group: GRUPOS[2], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.video_play_actions_video_view },
  { key: "thruplay", label: "ThruPlay", group: GRUPOS[2], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.video_thruplay_watched_actions_video_view },
  { key: "hold", label: "Retenção 100%", group: GRUPOS[2], perDay: false, better: "higher", kind: "pct", value: (d) => d.kpis.holdRate },
  { key: "cpv", label: "Custo por reprodução", group: GRUPOS[2], perDay: false, better: "lower", kind: "brl", value: (d) => safe(d.totals.spend, d.totals.video_play_actions_video_view) },
  { key: "visits", label: "Visitas ao perfil", group: GRUPOS[2], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.instagram_profile_visits },
  { key: "cvisit", label: "Custo/visita perfil", group: GRUPOS[2], perDay: false, better: "lower", kind: "brl", value: (d) => safe(d.totals.spend, d.totals.instagram_profile_visits) },
  // Engajamento
  { key: "engagement", label: "Engajamento", group: GRUPOS[3], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.actions_post_engagement },
  { key: "reactions", label: "Reações", group: GRUPOS[3], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.actions_post_reaction },
  { key: "comments", label: "Comentários", group: GRUPOS[3], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.actions_comment },
  { key: "shares", label: "Compartilhamentos", group: GRUPOS[3], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.actions_post },
  { key: "saves", label: "Salvamentos", group: GRUPOS[3], perDay: true, better: "higher", kind: "int", value: (d) => d.totals.actions_onsite_conversion_post_save },
];

export type Modo = "media" | "total";

function fmtMediaCount(v: number): string {
  return v >= 10 ? fmtInt(v) : fmtDec(v, 1);
}

/* valor exibido (número + texto) para uma métrica/criativo/modo */
export function cell(m: MetricDef, d: CreativeDetail, modo: Modo): { n: number; text: string } {
  const raw = m.value(d);
  const media = m.perDay && modo === "media";
  const n = media ? (d.activeDays > 0 ? raw / d.activeDays : 0) : raw;
  if (n === 0) return { n: 0, text: "—" };
  let text: string;
  switch (m.kind) {
    case "brl": text = fmtBRL(n); break;
    case "pct": text = fmtPct(n); break;
    case "dec": text = fmtDec(n, 2); break;
    default: text = media ? fmtMediaCount(n) : fmtInt(n);
  }
  return { n, text };
}

/* vencedor por métrica (respeita o modo, pois activeDays difere por anúncio) */
export function winnerFor(m: MetricDef, details: CreativeDetail[], modo: Modo): string | null {
  if (m.better === "none") return null;
  const vals = details.map((d) => ({ ad: d.ad_name, n: cell(m, d, modo).n })).filter((v) => v.n > 0);
  if (vals.length < 2) return null;
  const best = vals.reduce((a, b) => {
    if (m.better === "higher") return b.n > a.n ? b : a;
    return b.n < a.n ? b : a;
  });
  // empate → sem troféu
  const tied = vals.filter((v) => v.n === best.n).length > 1;
  return tied ? null : best.ad;
}

/* ---------- objetivos diferentes (aviso condicional) ---------- */
export function objetivosDistintos(details: CreativeDetail[]): string[] {
  return Array.from(new Set(details.map((d) => d.objetivo)));
}

/* ---------- evolução por dia de veiculação ---------- */
export interface EvoMetric {
  key: string;
  label: string;
  get: (r: MetaRow) => number;
}
export const EVO_METRICS: EvoMetric[] = [
  { key: "reach", label: "Alcance", get: (r) => num(r.reach) },
  { key: "impressions", label: "Impressões", get: (r) => num(r.impressions) },
  { key: "clicks", label: "Cliques", get: (r) => num(r.clicks) },
  { key: "spend", label: "Investimento", get: (r) => num(r.spend) },
  { key: "engagement", label: "Engajamento", get: (r) => num(r.actions_post_engagement) },
  { key: "video", label: "Reproduções", get: (r) => num(r.video_play_actions_video_view) },
  { key: "visits", label: "Visitas ao perfil", get: (r) => num(r.instagram_profile_visits) },
];

export interface EvoResult {
  data: Array<Record<string, number>>; // { day, [short]: value }
  blockSize: number;
  keys: string[]; // shorts na ordem dos cards
}

export function buildEvolution(details: CreativeDetail[], metricKey: string): EvoResult {
  const evo = EVO_METRICS.find((e) => e.key === metricKey) ?? EVO_METRICS[0];
  // valores por dia de veiculação (1..activeDays) para cada criativo
  const perAd = details.map((d) => {
    const dias = Array.from(new Set(d.rows.map((r) => r.date.slice(0, 10)))).sort();
    const valores = dias.map((dia) =>
      d.rows.filter((r) => r.date.slice(0, 10) === dia).reduce((s, r) => s + evo.get(r), 0)
    );
    return { key: d.ad_name, valores };
  });
  const maxDays = Math.max(1, ...perAd.map((p) => p.valores.length));
  const blockSize = Math.max(1, Math.ceil(maxDays / 20));
  const nBlocks = Math.ceil(maxDays / blockSize);

  const data: Array<Record<string, number>> = [];
  for (let bi = 0; bi < nBlocks; bi++) {
    const row: Record<string, number> = { day: bi * blockSize + 1 };
    for (const p of perAd) {
      const start = bi * blockSize;
      if (start >= p.valores.length) continue; // criativo já terminou
      row[p.key] = p.valores.slice(start, start + blockSize).reduce((s, v) => s + v, 0);
    }
    data.push(row);
  }
  return { data, blockSize, keys: perAd.map((p) => p.key) };
}

/* ---------- análise qualitativa (texto pronto) ---------- */
export function gerarAnalise(details: CreativeDetail[], dataHora: string): string {
  const L: string[] = [];
  L.push("ANÁLISE QUALITATIVA DE CRIATIVOS");
  L.push(`${details.length} anúncios · ${dataHora}`);
  L.push("");
  L.push(
    "Abaixo, uma leitura em linguagem simples do desempenho dos anúncios selecionados — traduzindo o que cada número significa na prática."
  );
  L.push("");

  for (const d of details) {
    const k = d.kpis;
    const freq = k.frequency > 0 ? `, vistas em média ${fmtDec(k.frequency, 1)}× por pessoa` : "";
    const ctrTxt =
      k.ctr > 0
        ? ` O CTR foi de ${fmtPct(k.ctr)}: de cada 100 pessoas que viram, cerca de ${Math.round(k.ctr)} clicaram.`
        : "";
    L.push(
      `▸ ${d.ad_name} — objetivo ${d.objetivo}. Ficou no ar por ${d.activeDays} ` +
        `dia${d.activeDays === 1 ? "" : "s"}. Com investimento de ${fmtBRL(d.totals.spend)}, foi exibido ` +
        `${fmtCompact(d.totals.impressions)} vezes e alcançou ${fmtCompact(d.totals.reach)} pessoas${freq}.` +
        ctrTxt +
        ` O custo por mil pessoas impactadas (CPM) foi de ${fmtBRL(k.cpm)}. ` +
        `Gerou ${fmtCompact(d.totals.actions_post_engagement)} interações no total (curtidas, comentários e compartilhamentos).`
    );
    L.push("");
  }

  // comparação (usa os totais/taxas)
  const bestCtr = [...details].sort((a, b) => b.kpis.ctr - a.kpis.ctr)[0];
  const bestCpm = [...details].filter((d) => d.kpis.cpm > 0).sort((a, b) => a.kpis.cpm - b.kpis.cpm)[0];
  const bestReach = [...details].sort((a, b) => b.totals.reach - a.totals.reach)[0];
  const bestEngRate = [...details]
    .map((d) => ({ d, r: safe(d.totals.actions_post_engagement, d.totals.impressions) }))
    .sort((a, b) => b.r - a.r)[0];

  L.push("COMPARAÇÃO");
  const comp: string[] = [];
  if (bestReach) comp.push(`em alcance, o "${bestReach.ad_name}" chegou a mais pessoas (${fmtCompact(bestReach.totals.reach)})`);
  if (bestCtr && bestCtr.kpis.ctr > 0) comp.push(`em taxa de cliques, o "${bestCtr.ad_name}" se destacou com ${fmtPct(bestCtr.kpis.ctr)}`);
  if (bestCpm) comp.push(`para entregar mais barato (CPM), o "${bestCpm.ad_name}" foi o mais econômico, a ${fmtBRL(bestCpm.kpis.cpm)} por mil impressões`);
  if (bestEngRate) comp.push(`na proporção de interações por exibição, o público reagiu mais ao "${bestEngRate.d.ad_name}"`);
  L.push(capitalize(comp.join("; ")) + ".");
  L.push("");

  L.push("EM RESUMO");
  const objetivos = objetivosDistintos(details);
  if (objetivos.length > 1) {
    L.push(
      `Os anúncios têm objetivos diferentes (${objetivos.join(" × ")}), então compare cada um pela métrica-chave do seu objetivo — e não por um "vencedor" absoluto.`
    );
  } else if (bestReach) {
    L.push(
      `Para o objetivo desta campanha (${objetivos[0]}), o "${bestReach.ad_name}" entregou o maior alcance; o "${bestCpm?.ad_name ?? bestReach.ad_name}" teve o menor custo por mil impressões.`
    );
  }
  return L.join("\n");
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
