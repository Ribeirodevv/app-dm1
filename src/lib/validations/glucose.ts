// Esquemas de validação Zod para medições de glicemia.
// A validação existe no cliente e no servidor para garantir integridade e segurança.

import { z } from "zod";

/**
 * Contextos permitidos para uma medição de glicemia.
 * Mantidos em sincronia com o enum GlucoseContext do Prisma.
 */
export const CONTEXTOS_GLICEMIA = [
  "jejum",
  "antes_refeicao",
  "depois_refeicao",
  "ao_deitar",
  "outro",
] as const;

export const contextoGlicemiaSchema = z.enum(CONTEXTOS_GLICEMIA);

/**
 * Limites técnicos para o valor de glicemia em mg/dL.
 * Esses limites são uma proteção de entrada e não representam critérios clínicos universais.
 */
export const GLICOSE_MIN_MGDL = 20;
export const GLICOSE_MAX_MGDL = 600;

/**
 * Esquema utilizado pelo formulário no navegador, com data e hora separadas.
 * A combinação em um instante ocorre no servidor para manter a semântica de fuso horário.
 */
export const formularioLeituraSchema = z.object({
  glucoseMgDl: z
    .number({ message: "Informe um número válido." })
    .int("O valor deve ser um número inteiro.")
    .min(GLICOSE_MIN_MGDL, `O valor deve ser pelo menos ${GLICOSE_MIN_MGDL} mg/dL.`)
    .max(GLICOSE_MAX_MGDL, `O valor não pode ultrapassar ${GLICOSE_MAX_MGDL} mg/dL.`),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD."),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Informe a hora no formato HH:mm."),
  context: contextoGlicemiaSchema,
  notes: z.string().max(1000, "As observações podem ter no máximo 1.000 caracteres.").optional().or(z.literal("")),
});

export type FormularioLeitura = z.infer<typeof formularioLeituraSchema>;

/**
 * Esquema utilizado pelo servidor, com o instante da medição já combinado.
 */
export const dadosLeituraSchema = z.object({
  glucoseMgDl: z
    .number()
    .int()
    .min(GLICOSE_MIN_MGDL)
    .max(GLICOSE_MAX_MGDL),
  measuredAt: z.coerce.date(),
  context: contextoGlicemiaSchema,
  notes: z.string().max(1000).optional().nullable(),
});

export type DadosLeitura = z.infer<typeof dadosLeituraSchema>;

/**
 * Combina data e hora locais do usuário em um instante UTC.
 *
 * A data e a hora informadas são interpretadas no fuso horário local do navegador/servidor
 * que executa a combinação. O resultado é um Date (instante UTC) adequado à persistência
 * em coluna timestamptz.
 *
 * @param date Data no formato AAAA-MM-DD.
 * @param time Hora no formato HH:mm.
 * @returns Instancia de Date representando o instante UTC.
 */
/**
 * Combina data e hora informadas pelo usuário (horário local) em um instante UTC.
 *
 * A data e a hora são interpretadas no fuso horário do usuário, informado por
 * `fusoOffsetMinutos` (resultado de Date.prototype.getTimezoneOffset()).
 * Quando o offset não é informado, assume-se UTC (comportamento anterior).
 *
 * @param date Data no formato AAAA-MM-DD.
 * @param time Hora no formato HH:mm.
 * @param fusoOffsetMinutos Offset do fuso do usuário em minutos (getTimezoneOffset).
 * @returns Instancia de Date representando o instante UTC.
 */
export function combinarDataHoraLocal(
  date: string,
  time: string,
  fusoOffsetMinutos: number = 0
): Date {
  // Interpreta a parede de relógio como UTC e subtrai o offset do usuário.
  const paredeUtc = Date.parse(`${date}T${time}:00.000Z`);
  return new Date(paredeUtc - fusoOffsetMinutos * 60 * 1000);
}