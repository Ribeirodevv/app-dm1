// Cliente Supabase para uso em componentes do navegador.
// Utiliza apenas a chave anônima pública; nunca expõe segredos do servidor.

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cria o cliente Supabase no navegador a partir das variáveis públicas.
 *
 * @returns Cliente Supabase para autenticação no lado do cliente.
 */
export function criarClienteSupabaseNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}