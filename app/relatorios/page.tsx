import { isSupabaseConfigured } from "@/lib/supabase";
import { RelatoriosClient } from "@/components/relatorios/RelatoriosClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Relatórios · Jerônimo Rodrigues 2026",
};

export default function RelatoriosPage() {
  return <RelatoriosClient configured={isSupabaseConfigured()} />;
}
