// Middleware do Next.js para proteger rotas privadas com base na presença do cookie de sessão.
// A validação completa da sessão ocorre no servidor em cada operação sensível.

import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE_SESSAO } from "@/lib/auth/constants";

const ROTAS_PROTEGIDAS = ["/dashboard", "/readings"];

/**
 * Aplica a proteção de rotas com base no cookie de sessão.
 *
 * @param request Requisição HTTP recebida.
 * @returns Resposta com redirecionamento quando necessário.
 */
export async function middleware(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  const protegida = ROTAS_PROTEGIDAS.some((rota) => caminho.startsWith(rota));
  const possuiCookie = Boolean(request.cookies.get(NOME_COOKIE_SESSAO)?.value);

  if (protegida && !possuiCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", caminho);
    return NextResponse.redirect(url);
  }

  if (!protegida && caminho === "/login" && possuiCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};