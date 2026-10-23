// Server Actions para operações de medições de glicemia.
// A identidade do usuário é obtida da sessão validada no servidor.

"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuarioAutenticado } from "@/lib/auth/get-user";
import { dadosLeituraSchema, combinarDataHoraLocal, formularioLeituraSchema } from "@/lib/validations/glucose";
import {
  criarLeitura,
  atualizarLeitura,
  excluirLeitura,
} from "@/services/glucose-readings";

export type ResultadoAcao<T = unknown> = {
  sucesso: boolean;
  mensagem?: string;
  dados?: T;
};

/**
 * Cria uma medição a partir dos dados do formulário.
 *
 * @param entrada Dados brutos do formulário.
 * @returns Resultado da operação.
 */
export async function criarLeituraAction(entrada: unknown): Promise<ResultadoAcao> {
  try {
    const usuario = await exigirUsuarioAutenticado();
    const entradaComOffset = (entrada ?? {}) as { timeZoneOffset?: number };
    const fusoOffset = Number.isFinite(entradaComOffset.timeZoneOffset)
      ? (entradaComOffset.timeZoneOffset as number)
      : 0;

    const validado = formularioLeituraSchema.safeParse(entrada);
    if (!validado.success) {
      return { sucesso: false, mensagem: validado.error.issues[0]?.message ?? "Dados inválidos." };
    }
    const dados = validado.data;
    const measuredAt = combinarDataHoraLocal(dados.date, dados.time, fusoOffset);
    const dadosServidor = dadosLeituraSchema.parse({
      glucoseMgDl: dados.glucoseMgDl,
      measuredAt,
      context: dados.context,
      notes: dados.notes || null,
    });

    const leitura = await criarLeitura(usuario.id, dadosServidor);
    revalidatePath("/dashboard");
    revalidatePath("/readings");
    return { sucesso: true, dados: leitura };
  } catch (erro) {
    console.error("Erro ao criar leitura:", erro instanceof Error ? erro.message : "desconhecido");
    return { sucesso: false, mensagem: "Não foi possível registrar a medição." };
  }
}

/**
 * Atualiza uma medição existente.
 *
 * @param id Identificador da medição.
 * @param entrada Dados brutos do formulário.
 * @returns Resultado da operação.
 */
export async function atualizarLeituraAction(id: string, entrada: unknown): Promise<ResultadoAcao> {
  try {
    const usuario = await exigirUsuarioAutenticado();
    const entradaComOffset = (entrada ?? {}) as { timeZoneOffset?: number };
    const fusoOffset = Number.isFinite(entradaComOffset.timeZoneOffset)
      ? (entradaComOffset.timeZoneOffset as number)
      : 0;

    const validado = formularioLeituraSchema.safeParse(entrada);
    if (!validado.success) {
      return { sucesso: false, mensagem: validado.error.issues[0]?.message ?? "Dados inválidos." };
    }
    const dados = validado.data;
    const measuredAt = combinarDataHoraLocal(dados.date, dados.time, fusoOffset);
    const dadosServidor = dadosLeituraSchema.parse({
      glucoseMgDl: dados.glucoseMgDl,
      measuredAt,
      context: dados.context,
      notes: dados.notes || null,
    });

    const leitura = await atualizarLeitura(usuario.id, id, dadosServidor);
    if (!leitura) {
      return { sucesso: false, mensagem: "Medição não encontrada." };
    }
    revalidatePath("/dashboard");
    revalidatePath("/readings");
    return { sucesso: true, dados: leitura };
  } catch (erro) {
    console.error("Erro ao atualizar leitura:", erro instanceof Error ? erro.message : "desconhecido");
    return { sucesso: false, mensagem: "Não foi possível atualizar a medição." };
  }
}

/**
 * Exclui uma medição.
 *
 * @param id Identificador da medição.
 * @returns Resultado da operação.
 */
export async function excluirLeituraAction(id: string): Promise<ResultadoAcao> {
  try {
    const usuario = await exigirUsuarioAutenticado();
    const ok = await excluirLeitura(usuario.id, id);
    if (!ok) {
      return { sucesso: false, mensagem: "Medição não encontrada." };
    }
    revalidatePath("/dashboard");
    revalidatePath("/readings");
    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao excluir leitura:", erro instanceof Error ? erro.message : "desconhecido");
    return { sucesso: false, mensagem: "Não foi possível excluir a medição." };
  }
}