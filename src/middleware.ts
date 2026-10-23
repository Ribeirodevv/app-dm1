// Middleware do Next.js para atualizar a sessão do Supabase e proteger rotas privadas.
// Rotas sem sessão válida são redirecionadas para a tela de login.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que exigem autenticação.
const ROTAS_PROTEGIDAS = ["/dashboard", "/readings", "/export"];

/**
 * Atualiza a sessão do usuário e aplica a proteção de rotas.
 *
 * @param request Requisição HTTP recebida.
 * @returns Resposta com cookies atualizados ou redirecionamento.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const protegida = ROTAS_PROTEGIDAS.some((rota) => caminho.startsWith(rota));

  if (!user && protegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", caminho);
    return NextResponse.redirect(url);
  }

  if (user && caminho === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Executa em todas as rotas, exceto arquivos estáticos e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};