import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, destinoSeguro, isTokenValido } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Acesso · Jerônimo Rodrigues 2026",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const destino = destinoSeguro(searchParams?.next);

  // Já autenticado? Vai direto ao destino.
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (await isTokenValido(token)) redirect(destino);

  return <LoginForm next={destino} />;
}
