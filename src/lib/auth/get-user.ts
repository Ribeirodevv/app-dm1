// Utilitário de autenticação para Server Components e Server Actions.
// A identidade é obtida da sessão persistida no banco, validada no servidor.

import { cookies } from "next/headers";
import { NOME_COOKIE_SESSAO } from "@/lib/auth/constants";
import { validarSessao } from "@/lib/auth/session";

export type UsuarioAutenticado = {
  id: string;
  name: string;
  email: string;
};

/**
 * Obtém o usuário autenticado da sessão atual.
 *
 * @returns Usuário autenticado ou null.
 */
export async function obterUsuarioAutenticado(): Promise<UsuarioAutenticado | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE_SESSAO)?.value;
  return validarSessao(token);
}

/**
 * Exige um usuário autenticado, lançando erro quando ausente.
 *
 * @returns Usuário autenticado.
 * @throws Error quando não houver sessão válida.
 */
export async function exigirUsuarioAutenticado(): Promise<UsuarioAutenticado> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) {
    throw new Error("Não autenticado.");
  }
  return usuario;
}