// Serviço de usuários para autenticação própria.

import { prisma } from "@/lib/prisma/client";
import { gerarHashSenha } from "@/lib/auth/password";

/**
 * Busca um usuário pelo e-mail (normalizado em minúsculas).
 *
 * @param email E-mail informado.
 * @returns Usuário ou null.
 */
export async function buscarUsuarioPorEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

/**
 * Cria o primeiro usuário (bootstrap) quando não houver usuários.
 *
 * @param nome Nome de exibição.
 * @param email E-mail.
 * @param senha Senha em texto puro.
 * @returns Usuário criado.
 */
export async function criarPrimeiroUsuario(nome: string, email: string, senha: string) {
  return prisma.$transaction(
    async (tx) => {
      const total = await tx.user.count();
      if (total > 0) {
        throw new Error("A aplicação já foi inicializada.");
      }
      const passwordHash = await gerarHashSenha(senha);
      return tx.user.create({
        data: {
          name: nome,
          email: email.trim().toLowerCase(),
          passwordHash,
        },
      });
    },
    { isolationLevel: "Serializable" }
  );
}