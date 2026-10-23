// Serviço de domínio para operações sobre medições de glicemia.
// Todas as funções exigem o identificador do usuário autenticado e limitam
// as consultas a esse usuário, garantindo isolamento entre contas.

import { prisma } from "@/lib/prisma/client";
import type { GlucoseContext } from "@/generated/prisma/client";
import type { DadosLeitura } from "@/lib/validations/glucose";

/**
 * Filtros opcionais para listagem de medições.
 */
export type FiltrosLeituras = {
  /** Instante inicial (inclusive) para filtrar measuredAt. */
  inicio?: Date;
  /** Instante final (inclusive) para filtrar measuredAt. */
  fim?: Date;
  /** Contexto específico a filtrar. */
  context?: GlucoseContext;
  /** Quantidade máxima de registros a retornar. */
  limite?: number;
  /** Quantidade de registros a pular (paginação). */
  deslocamento?: number;
};

/**
 * Cria uma nova medição para o usuário informado.
 *
 * @param userId Identificador do usuário autenticado.
 * @param dados Dados validados da medição.
 * @returns A medição persistida.
 */
export async function criarLeitura(userId: string, dados: DadosLeitura) {
  return prisma.glucoseReading.create({
    data: {
      userId,
      glucoseMgDl: dados.glucoseMgDl,
      measuredAt: dados.measuredAt,
      context: dados.context,
      notes: dados.notes ?? null,
    },
  });
}

/**
 * Lista medições do usuário, ordenadas da mais recente para a mais antiga.
 *
 * @param userId Identificador do usuário autenticado.
 * @param filtros Filtros de período, contexto e paginação.
 * @returns Lista de medições.
 */
export async function listarLeituras(userId: string, filtros: FiltrosLeituras = {}) {
  const where: {
    userId: string;
    measuredAt?: { gte?: Date; lte?: Date };
    context?: GlucoseContext;
  } = { userId };

  if (filtros.inicio || filtros.fim) {
    where.measuredAt = {};
    if (filtros.inicio) where.measuredAt.gte = filtros.inicio;
    if (filtros.fim) where.measuredAt.lte = filtros.fim;
  }
  if (filtros.context) {
    where.context = filtros.context;
  }

  return prisma.glucoseReading.findMany({
    where,
    orderBy: { measuredAt: "desc" },
    take: filtros.limite,
    skip: filtros.deslocamento,
  });
}

/**
 * Conta medições do usuário com os filtros informados.
 *
 * @param userId Identificador do usuário autenticado.
 * @param filtros Filtros de período e contexto.
 * @returns Quantidade de registros.
 */
export async function contarLeituras(userId: string, filtros: FiltrosLeituras = {}) {
  const where: {
    userId: string;
    measuredAt?: { gte?: Date; lte?: Date };
    context?: GlucoseContext;
  } = { userId };

  if (filtros.inicio || filtros.fim) {
    where.measuredAt = {};
    if (filtros.inicio) where.measuredAt.gte = filtros.inicio;
    if (filtros.fim) where.measuredAt.lte = filtros.fim;
  }
  if (filtros.context) {
    where.context = filtros.context;
  }

  return prisma.glucoseReading.count({ where });
}

/**
 * Obtém uma medição específica do usuário.
 * Retorna null quando não existir ou não pertencer ao usuário.
 *
 * @param userId Identificador do usuário autenticado.
 * @param id Identificador da medição.
 * @returns A medição encontrada ou null.
 */
export async function obterLeitura(userId: string, id: string) {
  return prisma.glucoseReading.findFirst({
    where: { id, userId },
  });
}

/**
 * Atualiza uma medição pertencente ao usuário.
 * Retorna null quando o registro não existir ou não pertencer ao usuário.
 *
 * @param userId Identificador do usuário autenticado.
 * @param id Identificador da medição.
 * @param dados Dados validados para atualização.
 * @returns A medição atualizada ou null.
 */
export async function atualizarLeitura(userId: string, id: string, dados: DadosLeitura) {
  const existente = await prisma.glucoseReading.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existente) {
    return null;
  }

  return prisma.glucoseReading.update({
    where: { id },
    data: {
      glucoseMgDl: dados.glucoseMgDl,
      measuredAt: dados.measuredAt,
      context: dados.context,
      notes: dados.notes ?? null,
    },
  });
}

/**
 * Exclui uma medição pertencente ao usuário.
 *
 * @param userId Identificador do usuário autenticado.
 * @param id Identificador da medição.
 * @returns true quando excluída, false quando não encontrada ou não pertencente ao usuário.
 */
export async function excluirLeitura(userId: string, id: string): Promise<boolean> {
  const existente = await prisma.glucoseReading.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existente) {
    return false;
  }
  await prisma.glucoseReading.delete({ where: { id } });
  return true;
}
