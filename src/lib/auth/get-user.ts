// Utilitário de autenticação para Server Components e Server Actions.
// A identidade sempre é obtida da sessão validada pelo Supabase, nunca de parâmetros do cliente.

import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

/**
 * Obtém o usuário autenticado da sessão atual.
 *
 * @returns Objeto do usuário do Supabase ou null quando não houver sessão válida.
 */
export async function obterUsuarioAutenticado() {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Exige um usuário autenticado, lançando erro quando ausente.
 * Deve ser usado em operações privadas do servidor.
 *
 * @returns Usuário autenticado.
 * @throws Error quando não houver sessão válida.
 */
export async function exigirUsuarioAutenticado() {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) {
    throw new Error("Não autenticado.");
  }
  return usuario;
}