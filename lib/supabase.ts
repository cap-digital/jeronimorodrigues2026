import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ============================================================
   Integração Supabase — Relatórios
   - URL + chave pública (anon/publishable): expostas ao navegador
     (NEXT_PUBLIC_*), usadas só para o upload direto do arquivo.
   - Chave de serviço (service_role/secret): SÓ no servidor, nunca
     enviada ao navegador. Usada nas rotas de API para gravar
     metadados e gerar links assinados.
   Configuração: ver RELATORIOS_SETUP.md
   ============================================================ */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/* Nome do bucket de Storage e da tabela de metadados. */
export const RELATORIOS_BUCKET = "RelatorioJeronimo";
export const RELATORIOS_TABLE = "relatorios";

/* O navegador consegue subir arquivos? (precisa de URL + chave pública) */
export const isPublicSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/* O servidor consegue gravar/ler metadados? (precisa da chave de serviço) */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

/* Cliente administrativo — SÓ no servidor (rotas de API). */
export function getAdminClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não configurado (defina SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
