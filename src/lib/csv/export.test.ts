// Testes da exportação CSV.

import { describe, it, expect } from "vitest";
import {
  escaparCampoCsv,
  neutralizarFormulaCsv,
  gerarCsvLeituras,
  formatarDataCsv,
} from "./export";

describe("neutralizarFormulaCsv", () => {
  it("prefixa campos que iniciam com =", () => {
    expect(neutralizarFormulaCsv("=1+1")).toBe("'=1+1");
  });
  it("não altera texto comum", () => {
    expect(neutralizarFormulaCsv("normal")).toBe("normal");
  });
});

describe("escaparCampoCsv", () => {
  it("envolve em aspas quando contém vírgula", () => {
    expect(escaparCampoCsv("a,b")).toBe('"a,b"');
  });
  it("dobra aspas internas", () => {
    expect(escaparCampoCsv('a"b')).toBe('"a""b"');
  });
});

describe("gerarCsvLeituras", () => {
  it("gera cabeçalhos em português", () => {
    const csv = gerarCsvLeituras([]);
    expect(csv.split("\r\n")[0]).toContain("Glicemia (mg/dL)");
    expect(csv.split("\r\n")[0]).toContain("Observações");
  });

  it("inclui os valores reais da medição", () => {
    const leitura = {
      id: "abc-123",
      userId: "user-1",
      measuredAt: new Date("2026-01-10T10:00:00.000Z"),
      glucoseMgDl: 110,
      context: "jejum",
      notes: "nota",
      createdAt: new Date("2026-01-10T10:01:00.000Z"),
      updatedAt: new Date("2026-01-10T10:01:00.000Z"),
    } as never;
    const csv = gerarCsvLeituras([leitura]);
    expect(csv).toContain("abc-123");
    expect(csv).toContain("110");
    expect(csv).toContain("nota");
  });
});

describe("formatarDataCsv", () => {
  it("formata data em DD/MM/AAAA", () => {
    const data = new Date("2026-01-10T12:00:00.000Z");
    const formatada = formatarDataCsv(data, "UTC");
    expect(formatada).toBe("10/01/2026");
  });
});