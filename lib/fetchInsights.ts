import { InsightsResponse } from "./types";

export const INSIGHTS_ENDPOINT =
  "https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/JeronimoRod2026";
export const INSIGHTS_KEY = "sb_publishable_YN9YKLw6sludrgf9T2i_1g_Dcm8dIiK";

/* Busca no servidor (usado pela landing e pela rota /api/insights). */
export async function fetchInsights(): Promise<InsightsResponse | null> {
  try {
    const res = await fetch(INSIGHTS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${INSIGHTS_KEY}`,
        apikey: INSIGHTS_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Functions" }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as InsightsResponse;
  } catch {
    return null;
  }
}
