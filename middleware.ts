import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, isTokenValido } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (await isTokenValido(token)) return NextResponse.next();

  // Rotas de API: responde 401 em vez de redirecionar.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  // Demais páginas: manda para o login, guardando o destino.
  const url = req.nextUrl.clone();
  const destino = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/login";
  url.search = destino && destino !== "/" ? `?next=${encodeURIComponent(destino)}` : "";
  return NextResponse.redirect(url);
}

/* Protege tudo, menos os assets e as próprias rotas de login/logout. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|login|api/login|api/logout).*)",
  ],
};
