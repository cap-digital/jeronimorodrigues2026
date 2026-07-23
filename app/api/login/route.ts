import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_MAX_AGE,
  getExpectedToken,
  getSitePassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let senha = "";
  try {
    const body = await req.json();
    senha = typeof body?.senha === "string" ? body.senha : "";
  } catch {
    /* corpo inválido */
  }

  const esperada = getSitePassword();
  if (!esperada) {
    return NextResponse.json(
      { error: "Acesso não configurado (defina SITE_PASSWORD)." },
      { status: 503 }
    );
  }
  if (!senha || senha !== esperada) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await getExpectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
  return res;
}
