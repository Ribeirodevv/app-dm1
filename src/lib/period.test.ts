// Testes de filtros de período.

import { describe, it, expect } from "vitest";
import { calcularInicioPeriodo, ehPeriodoValido } from "./period";

describe("ehPeriodoValido", () => {
  it("aceita períodos suportados", () => {
    expect(ehPeriodoValido("24h")).toBe(true);
    expect(ehPeriodoValido("7d")).toBe(true);
    expect(ehPeriodoValido("30d")).toBe(true);
  });
  it("rejeita valores inválidos", () => {
    expect(ehPeriodoValido("1d")).toBe(false);
    expect(ehPeriodoValido(null)).toBe(false);
  });
});

describe("calcularInicioPeriodo", () => {
  it("retorna data anterior para 24h", () => {
    const agora = new Date("2026-01-10T12:00:00.000Z");
    const inicio = calcularInicioPeriodo("24h", agora);
    expect(inicio.getTime()).toBe(agora.getTime() - 24 * 60 * 60 * 1000);
  });
});