import { fetchInsights } from "@/lib/fetchInsights";
import { ComparativoView } from "@/components/comparativo/ComparativoView";

export const revalidate = 60;

export const metadata = {
  title: "Comparativo de Criativos · Jerônimo Rodrigues 2026",
};

export default async function ComparativoPage() {
  const data = await fetchInsights();
  return <ComparativoView meta={data?.meta ?? []} />;
}
