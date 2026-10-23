// Route Handler para exportação de medições em CSV.
// A exportação é limitada ao usuário autenticado e respeita filtros de período/contexto.

import { NextRequest, NextResponse } from "next/server";
import { exigirUsuarioAutenticado } from "@/lib/auth/get-user";
import { listarLeituras } from "@/services/glucose-readings";
import { calcularInicioPeriodo, ehPeriodoValido } from "@/lib/period";
import { gerarCsvLeituras } from "@/lib/csv/export";
import { CONTEXTOS_GLICEMIA } from "@/lib/validations/glucose";

/**
 * Trata a requisição GET de exportação CSV.
 *
 * @param request Requisição contendo filtros opcionais.
 * @returns Resposta com o arquivo CSV.
 */
export async function GET(request: NextRequest) {
  try {
    const usuario = await exigirUsuarioAutenticado();
    const { searchParams } = new URL(request.url);

    const periodo = ehPeriodoValido(searchParams.get("period")) ? (searchParams.get("period") as "24h" | "7d" | "30d") : undefined;
    const contextoParam = searchParams.get("context");
    const contexto =
      contextoParam && (CONTEXTOS_GLICEMIA as readonly string[]).includes(contextoParam)
        ? (contextoParam as (typeof CONTEXTOS_GLICEMIA)[number])
        : undefined;
    const timeZone = searchParams.get("tz") ?? undefined;

    const inicio = periodo ? calcularInicioPeriodo(periodo) : undefined;
    const fim = periodo ? new Date() : undefined;

    const leituras = await listarLeituras(usuario.id, {
      inicio,
      fim,
      context: contexto,
    });

    const csv = gerarCsvLeituras(leituras, timeZone);
    // BOM UTF-8 para compatibilidade com planilhas.
    const corpo = "\uFEFF" + csv;

    return new NextResponse(corpo, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="glicemia.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (erro) {
    console.error("Erro na exportação CSV:", erro instanceof Error ? erro.message : "desconhecido");
    return NextResponse.json({ erro: "Não foi possível exportar." }, { status: 401 });
  }
}