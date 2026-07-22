import { NextResponse } from "next/server";
import {
  getAdminClient,
  isSupabaseConfigured,
  RELATORIOS_BUCKET,
  RELATORIOS_TABLE,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* DELETE /api/relatorios/:id — remove o arquivo do Storage e o registro. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Integração com o Supabase ainda não configurada. Veja RELATORIOS_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const supabase = getAdminClient();
    const { data: row, error: findErr } = await supabase
      .from(RELATORIOS_TABLE)
      .select("arquivo_path")
      .eq("id", params.id)
      .single();
    if (findErr) throw findErr;

    if (row?.arquivo_path) {
      await supabase.storage.from(RELATORIOS_BUCKET).remove([row.arquivo_path]);
    }
    const { error: delErr } = await supabase
      .from(RELATORIOS_TABLE)
      .delete()
      .eq("id", params.id);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao excluir o relatório." },
      { status: 500 }
    );
  }
}
