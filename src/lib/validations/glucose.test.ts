// Testes de validação de medições de glicemia.

import { describe, it, expect } from "vitest";
import {
  formularioLeituraSchema,
  dadosLeituraSchema,
  combinarDataHoraLocal,
  GLICOSE_MIN_MGDL,
  GLICOSE_MAX_MGDL,
} from "./glucose";

describe("formularioLeituraSchema", () => {
  it("aceita dados válidos", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: 120,
      date: "2026-01-10",
      time: "08:30",
      context: "jejum",
      notes: "ok",
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita glicemia abaixo do limite técnico", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: GLICOSE_MIN_MGDL - 1,
      date: "2026-01-10",
      time: "08:30",
      context: "jejum",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita glicemia acima do limite técnico", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: GLICOSE_MAX_MGDL + 1,
      date: "2026-01-10",
      time: "08:30",
      context: "jejum",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita glicemia não inteira", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: 120.5,
      date: "2026-01-10",
      time: "08:30",
      context: "jejum",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita data em formato inválido", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: 120,
      date: "10/01/2026",
      time: "08:30",
      context: "jejum",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita hora em formato inválido", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: 120,
      date: "2026-01-10",
      time: "8:30",
      context: "jejum",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita contexto não permitido", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: 120,
      date: "2026-01-10",
      time: "08:30",
      context: "pos_treino",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita observações com mais de 1000 caracteres", () => {
    const resultado = formularioLeituraSchema.safeParse({
      glucoseMgDl: 120,
      date: "2026-01-10",
      time: "08:30",
      context: "jejum",
      notes: "a".repeat(1001),
    });
    expect(resultado.success).toBe(false);
  });
});

describe("dadosLeituraSchema", () => {
  it("aceita measuredAt como data", () => {
    const resultado = dadosLeituraSchema.safeParse({
      glucoseMgDl: 90,
      measuredAt: "2026-01-10T08:30:00.000Z",
      context: "antes_refeicao",
      notes: null,
    });
    expect(resultado.success).toBe(true);
  });
});

describe("combinarDataHoraLocal", () => {
  it("combina data e hora em um Date válido", () => {
    const data = combinarDataHoraLocal("2026-01-10", "08:30");
    expect(data instanceof Date).toBe(true);
    expect(Number.isNaN(data.getTime())).toBe(false);
  });
});