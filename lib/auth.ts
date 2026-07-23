/* ============================================================
   Acesso ao painel — senha única compartilhada.
   - A senha fica só no servidor (env SITE_PASSWORD, obrigatória).
   - O navegador guarda apenas um cookie httpOnly com um token
     derivado (hash) da senha — a senha nunca chega ao cliente.
   - Sem SITE_PASSWORD configurada, o acesso é negado (fail-closed).
   Compatível com edge (middleware) e node (rotas de API).
   ============================================================ */

export const AUTH_COOKIE = "jr_acesso";

/* Duração do acesso: 30 dias. */
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30;

/* Sal fixo só para o token não ser o hash "cru" da senha. */
const SALT = "jeronimo-2026::";

export function getSitePassword(): string {
  return process.env.SITE_PASSWORD ?? "";
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* Token esperado no cookie para um acesso válido. */
export function getExpectedToken(): Promise<string> {
  return sha256Hex(SALT + getSitePassword());
}

/* Confere se o valor do cookie corresponde à senha atual.
   Sem senha configurada, nega tudo (não dá para forjar um token válido). */
export async function isTokenValido(token: string | undefined | null): Promise<boolean> {
  if (!getSitePassword()) return false;
  if (!token) return false;
  return token === (await getExpectedToken());
}

/* Só permite caminhos internos (evita open redirect). */
export function destinoSeguro(v: unknown): string {
  if (typeof v === "string" && v.startsWith("/") && !v.startsWith("//")) return v;
  return "/";
}
