import { NextResponse } from "next/server";
import { fetchInsights } from "@/lib/fetchInsights";

export const revalidate = 60; // cache curto de 1 min

export async function GET() {
  const data = await fetchInsights();
  if (!data) {
    return NextResponse.json(
      { success: false, error: "Falha ao consultar a base de dados." },
      { status: 502 }
    );
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
