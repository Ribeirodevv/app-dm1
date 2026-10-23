// Utilitários de hash de senha com Argon2id.

import { hash, verify } from "@node-rs/argon2";

/**
 * Gera o hash Argon2id de uma senha em texto puro.
 *
 * @param senha Senha em texto puro.
 * @returns Hash seguro para persistência.
 */
export async function gerarHashSenha(senha: string): Promise<string> {
  return hash(senha);
}

/**
 * Verifica se uma senha corresponde ao hash armazenado.
 *
 * @param senha Senha em texto puro.
 * @param hashArmazenado Hash persistido no banco.
 * @returns true quando a senha é válida.
 */
export async function verificarSenha(senha: string, hashArmazenado: string): Promise<boolean> {
  try {
    return await verify(hashArmazenado, senha);
  } catch {
    return false;
  }
}