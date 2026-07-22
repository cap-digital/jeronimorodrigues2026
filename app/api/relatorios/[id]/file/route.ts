import { NextResponse } from "next/server";
import {
  getAdminClient,
  isSupabaseConfigured,
  RELATORIOS_BUCKET,
  RELATORIOS_TABLE,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET /api/relatorios/:id/file?download=1
   Gera um link assinado temporário e redireciona.
   - sem download: abre no navegador (Ler)
   - download=1: força o download com o nome original (Baixar) */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Integração com o Supabase ainda não configurada. Veja RELATORIOS_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const url = new URL(req.url);
    const forcarDownload = url.searchParams.get("download") === "1";

    const supabase = getAdminClient();
    const { data: row, error: findErr } = await supabase
      .from(RELATORIOS_TABLE)
      .select("arquivo_path, arquivo_nome")
      .eq("id", params.id)
      .single();
    if (findErr) throw findErr;
    if (!row?.arquivo_path) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    const { data, error } = await supabase.storage
      .from(RELATORIOS_BUCKET)
      .createSignedUrl(row.arquivo_path, 60 * 10, {
        download: forcarDownload ? row.arquivo_nome || true : undefined,
      });
    if (error) throw error;

    return NextResponse.redirect(data.signedUrl, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao abrir o arquivo." },
      { status: 500 }
    );
  }
}
