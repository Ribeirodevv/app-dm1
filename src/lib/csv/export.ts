// Utilitário de exportação de medições para CSV.
// Gera conteúdo CSV com cabeçalhos em português, codificação UTF-8 (com BOM no handler)
// e proteção contra injeção de fórmulas.

import type { GlucoseReading } from "@/generated/prisma/client";

const CABECALHOS = [
  "ID",
  "Data da medição",
  "Hora da medição",
  "Glicemia (mg/dL)",
  "Contexto",
  "Observações",
  "Data de criação",
];

const CONTEXTOS_PT: Record<string, string> = {
  jejum: "Jejum",
  antes_refeicao: "Antes da refeição",
  depois_refeicao: "Depois da refeição",
  ao_deitar: "Ao deitar",
  outro: "Outro",
};

/**
 * Neutraliza campos textuais que possam ser interpretados como fórmulas por planilhas.
 * Valores que iniciam com =, +, -, @, tab ou quebra de linha recebem um apóstrofo inicial.
 *
 * @param valor Texto a ser sanitizado.
 * @returns Texto seguro para CSV.
 */
export function neutralizarFormulaCsv(valor: string): string {
  if (valor === "") return valor;
  const primeiro = valor.charAt(0);
  if (["=", "+", "-", "@", "\t", "\r", "\n"].includes(primeiro)) {
    return `'${valor}`;
  }
  return valor;
}

/**
 * Escapa um valor para CSV conforme RFC 4180.
 *
 * @param valor Valor a ser escapado.
 * @returns Campo CSV pronto.
 */
export function escaparCampoCsv(valor: string): string {
  const seguro = neutralizarFormulaCsv(valor);
  if (/[",\n\r]/.test(seguro)) {
    return `"${seguro.replace(/"/g, '""')}"`;
  }
  return seguro;
}

/**
 * Formata um instante em data DD/MM/AAAA no fuso informado.
 *
 * @param data Instancia de Date.
 * @param timeZone Fuso horário IANA (opcional).
 * @returns Data formatada.
 */
export function formatarDataCsv(data: Date, timeZone?: string): string {
  const opcoes: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  };
  return new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
}

/**
 * Formata um instante em hora HH:mm no fuso informado.
 *
 * @param data Instancia de Date.
 * @param timeZone Fuso horário IANA (opcional).
 * @returns Hora formatada.
 */
export function formatarHoraCsv(data: Date, timeZone?: string): string {
  const opcoes: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  };
  return new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
}

/**
 * Gera o conteúdo CSV (sem BOM) das medições informadas.
 *
 * @param leituras Lista de medições.
 * @param timeZone Fuso horário IANA para formatação (opcional).
 * @returns Conteúdo CSV.
 */
export function gerarCsvLeituras(leituras: GlucoseReading[], timeZone?: string): string {
  const linhas: string[] = [];
  linhas.push(CABECALHOS.map(escaparCampoCsv).join(";"));

  for (const leitura of leituras) {
    const campos = [
      leitura.id,
      formatarDataCsv(leitura.measuredAt, timeZone),
      formatarHoraCsv(leitura.measuredAt, timeZone),
      String(leitura.glucoseMgDl),
      CONTEXTOS_PT[leitura.context] ?? leitura.context,
      leitura.notes ?? "",
      formatarDataCsv(leitura.createdAt, timeZone) + " " + formatarHoraCsv(leitura.createdAt, timeZone),
    ];
    linhas.push(campos.map((c) => escaparCampoCsv(String(c))).join(";"));
  }

  return linhas.join("\r\n");
}
