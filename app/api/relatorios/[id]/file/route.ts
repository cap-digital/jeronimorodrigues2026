import { NextResponse } from "next/server";
import {
  getAdminClient,
  isSupabaseConfigured,
  RELATORIOS_BUCKET,
  RELATORIOS_TABLE,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/* GET /api/relatorios/:id/file?download=1
   Baixa o arquivo do Storage no servidor e transmite os bytes de volta.
   - sem download: abre no navegador (Ler)
   - download=1: força o download com o nome original (Baixar)
   A URL exposta ao navegador não carrega nenhum token/chave. */
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
      .select("arquivo_path, arquivo_nome, mime")
      .eq("id", params.id)
      .single();
    if (findErr) throw findErr;
    if (!row?.arquivo_path) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    const { data: blob, error } = await supabase.storage
      .from(RELATORIOS_BUCKET)
      .download(row.arquivo_path);
    if (error) throw error;
    if (!blob) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    const buf = await blob.arrayBuffer();

    // Content-Disposition: nome ASCII (fallback) + nome real em UTF-8 (RFC 5987)
    const nome = row.arquivo_nome || "relatorio";
    const asciiNome = nome
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/["\\]/g, "") // remove aspas/barras que quebram o header
      .replace(/[^\x20-\x7E]/g, "_"); // demais não-ASCII viram "_"
    const disp = forcarDownload ? "attachment" : "inline";

    return new NextResponse(buf, {
      headers: {
        "Content-Type": row.mime || blob.type || "application/octet-stream",
        "Content-Disposition": `${disp}; filename="${asciiNome}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
        "Content-Length": String(buf.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao abrir o arquivo." },
      { status: 500 }
    );
  }
}
