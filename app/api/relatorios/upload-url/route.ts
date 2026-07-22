import { NextResponse } from "next/server";
import {
  getAdminClient,
  isSupabaseConfigured,
  RELATORIOS_BUCKET,
} from "@/lib/supabase";
import { extAceita, extDe } from "@/lib/relatorios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* POST /api/relatorios/upload-url
   Gera um endereço assinado para o navegador subir o arquivo direto ao
   Storage (contornando o limite de tamanho de corpo das funções). */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Integração com o Supabase ainda não configurada. Veja RELATORIOS_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const { nome } = await req.json();
    if (typeof nome !== "string" || !extAceita(nome)) {
      return NextResponse.json(
        { error: "Formato não aceito. Envie PDF, DOC ou DOCX." },
        { status: 400 }
      );
    }

    const ext = extDe(nome);
    const id = crypto.randomUUID();
    const ano = new Date().getUTCFullYear();
    const path = `${ano}/${id}.${ext}`;

    const supabase = getAdminClient();
    const { data, error } = await supabase.storage
      .from(RELATORIOS_BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw error;

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao preparar o upload." },
      { status: 500 }
    );
  }
}
