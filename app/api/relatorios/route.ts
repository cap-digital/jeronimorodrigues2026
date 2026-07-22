import { NextResponse } from "next/server";
import {
  getAdminClient,
  isSupabaseConfigured,
  RELATORIOS_TABLE,
} from "@/lib/supabase";
import { extAceita, isTipo, type RelatorioRow } from "@/lib/relatorios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const naoConfigurado = () =>
  NextResponse.json(
    { error: "Integração com o Supabase ainda não configurada. Veja RELATORIOS_SETUP.md." },
    { status: 503 }
  );

/* GET /api/relatorios — lista os relatórios (mais recentes primeiro). */
export async function GET() {
  if (!isSupabaseConfigured()) return naoConfigurado();
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from(RELATORIOS_TABLE)
      .select("*")
      .order("periodo_inicio", { ascending: false, nullsFirst: false })
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ relatorios: (data ?? []) as RelatorioRow[] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao listar relatórios." },
      { status: 500 }
    );
  }
}

/* POST /api/relatorios — grava os metadados após o upload do arquivo. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return naoConfigurado();
  try {
    const body = await req.json();
    const {
      titulo,
      tipo,
      periodo_inicio,
      periodo_fim,
      arquivo_path,
      arquivo_nome,
      mime,
      tamanho,
    } = body ?? {};

    if (!isTipo(tipo)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }
    if (typeof arquivo_path !== "string" || !arquivo_path) {
      return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
    }
    if (typeof arquivo_nome !== "string" || !extAceita(arquivo_nome)) {
      return NextResponse.json(
        { error: "Formato não aceito. Envie PDF, DOC ou DOCX." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from(RELATORIOS_TABLE)
      .insert({
        titulo: typeof titulo === "string" ? titulo.trim() : "",
        tipo,
        periodo_inicio: periodo_inicio || null,
        periodo_fim: periodo_fim || null,
        arquivo_path,
        arquivo_nome,
        mime: mime || null,
        tamanho: typeof tamanho === "number" ? tamanho : null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ relatorio: data as RelatorioRow }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao salvar o relatório." },
      { status: 500 }
    );
  }
}
