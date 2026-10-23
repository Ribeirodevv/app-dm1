// Gerenciamento de sessões persistidas no Neon via Prisma.
// O token bruto é enviado ao navegador em cookie HttpOnly; apenas seu hash é persistido.

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma/client";


const DIAS_EXPIRACAO = 30;

/**
 * Gera um token de sessão criptograficamente seguro.
 *
 * @returns Token bruto em hexadecimal.
 */
export function gerarTokenSessao(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Gera o hash SHA-256 de um token para armazenamento seguro.
 *
 * @param token Token bruto.
 * @returns Hash hexadecimal.
 */
export function hashTokenSessao(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Cria uma sessão para o usuário informado.
 *
 * @param userId Identificador do usuário.
 * @returns Token bruto a ser enviado ao navegador.
 */
export async function criarSessao(userId: string): Promise<string> {
  const token = gerarTokenSessao();
  const tokenHash = hashTokenSessao(token);
  const expiresAt = new Date(Date.now() + DIAS_EXPIRACAO * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

/**
 * Valida um token de sessão e retorna o usuário associado.
 *
 * @param token Token bruto do cookie.
 * @returns Usuário autenticado ou null.
 */
export async function validarSessao(token: string | undefined): Promise<{ id: string; name: string; email: string } | null> {
  if (!token) return null;

  const tokenHash = hashTokenSessao(token);
  const sessao = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!sessao) return null;
  if (sessao.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: sessao.id } }).catch(() => undefined);
    return null;
  }

  return {
    id: sessao.user.id,
    name: sessao.user.name,
    email: sessao.user.email,
  };
}

/**
 * Encerra uma sessão pelo token.
 *
 * @param token Token bruto do cookie.
 */
export async function encerrarSessao(token: string | undefined): Promise<void> {
  if (!token) return;
  const tokenHash = hashTokenSessao(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

