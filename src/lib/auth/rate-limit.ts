// Limitação de tentativas de login persistida no banco (adequada a ambiente serverless).

import { prisma } from "@/lib/prisma/client";

const JANELA_MINUTOS = 15;
const MAX_TENTATIVAS = 5;

/**
 * Verifica se o identificador (e-mail ou IP) está bloqueado por excesso de tentativas.
 *
 * @param identificador Identificador da tentativa.
 * @returns true quando bloqueado.
 */
export async function estaBloqueado(identificador: string): Promise<boolean> {
  const desde = new Date(Date.now() - JANELA_MINUTOS * 60 * 1000);
  const falhas = await prisma.authAttempt.count({
    where: {
      identifier: identificador,
      success: false,
      createdAt: { gte: desde },
    },
  });
  return falhas >= MAX_TENTATIVAS;
}

/**
 * Registra uma tentativa de login.
 *
 * @param identificador Identificador da tentativa.
 * @param sucesso Se a tentativa foi bem-sucedida.
 */
export async function registrarTentativaLogin(identificador: string, sucesso: boolean): Promise<void> {
  await prisma.authAttempt.create({
    data: { identifier: identificador, success: sucesso },
  });
}