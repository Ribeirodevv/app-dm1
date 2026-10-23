// Utilitários para filtros de período do dashboard e do histórico.
// Os períodos são calculados a partir do instante atual no servidor.

export type Periodo = "24h" | "7d" | "30d";

/**
 * Calcula o instante inicial de um período em relação a agora.
 *
 * @param periodo Período selecionado.
 * @param agora Instante de referência (padrão: agora).
 * @returns Data inicial (inclusive) do período.
 */
export function calcularInicioPeriodo(periodo: Periodo, agora: Date = new Date()): Date {
  const inicio = new Date(agora);
  switch (periodo) {
    case "24h":
      inicio.setHours(inicio.getHours() - 24);
      break;
    case "7d":
      inicio.setDate(inicio.getDate() - 7);
      break;
    case "30d":
      inicio.setDate(inicio.getDate() - 30);
      break;
  }
  return inicio;
}

/**
 * Valida se uma string corresponde a um período suportado.
 *
 * @param valor Valor a validar.
 * @returns true quando for um período válido.
 */
export function ehPeriodoValido(valor: unknown): valor is Periodo {
  return valor === "24h" || valor === "7d" || valor === "30d";
}