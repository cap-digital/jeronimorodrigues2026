import { fetchInsights } from "@/lib/fetchInsights";
import { DashboardProvider } from "@/lib/dashboardContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const revalidate = 60;

export const metadata = {
  title: "Painel · Jerônimo Rodrigues 2026",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await fetchInsights();
  return (
    <DashboardProvider initialData={data}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
