// Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
// A identidade do usuário é obtida exclusivamente a partir da sessão validada no servidor.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria o cliente Supabase no servidor, lendo e gravando cookies de sessão.
 *
 * @returns Cliente Supabase vinculado aos cookies da requisição atual.
 */
export async function criarClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Em Server Components a escrita de cookies pode falhar; o middleware cuida da atualização.
          }
        },
      },
    }
  );
}