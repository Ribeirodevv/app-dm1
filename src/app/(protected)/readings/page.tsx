// Página de histórico de medições com filtros e paginação.

import { redirect } from "next/navigation";
import Link from "next/link";
import { obterUsuarioAutenticado } from "@/lib/auth/get-user";
import { listarLeituras, contarLeituras } from "@/services/glucose-readings";
import { calcularInicioPeriodo, ehPeriodoValido } from "@/lib/period";
import { CONTEXTOS_GLICEMIA } from "@/lib/validations/glucose";
import { ExcluirLeituraButton } from "@/components/excluir-leitura-button";

const TAMANHO_PAGINA = 20;

type SearchParams = {
  period?: string;
  context?: string;
  page?: string;
};

export default async function PaginaHistorico({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) redirect("/login");

  const params = await searchParams;
  const periodo = ehPeriodoValido(params.period) ? params.period : undefined;
  const contexto =
    params.context && (CONTEXTOS_GLICEMIA as readonly string[]).includes(params.context)
      ? (params.context as (typeof CONTEXTOS_GLICEMIA)[number])
      : undefined;
  const pagina = Math.max(1, Number(params.page ?? "1") || 1);
  const deslocamento = (pagina - 1) * TAMANHO_PAGINA;

  const inicio = periodo ? calcularInicioPeriodo(periodo) : undefined;
  const fim = periodo ? new Date() : undefined;

  const [leituras, total] = await Promise.all([
    listarLeituras(usuario.id, {
      inicio,
      fim,
      context: contexto,
      limite: TAMANHO_PAGINA,
      deslocamento,
    }),
    contarLeituras(usuario.id, { inicio, fim, context: contexto }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));

  const contextoPt: Record<string, string> = {
    jejum: "Jejum",
    antes_refeicao: "Antes da refeição",
    depois_refeicao: "Depois da refeição",
    ao_deitar: "Ao deitar",
    outro: "Outro",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        <div className="flex gap-2">
          <Link href="/readings/new" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
            Nova medição
          </Link>
          <Link
            href={`/api/export/csv${periodo ? `?period=${periodo}` : ""}${contexto ? `${periodo ? "&" : "?"}context=${contexto}` : ""}`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Exportar CSV
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow" method="get">
        <div>
          <label htmlFor="period" className="block text-xs text-gray-500">
            Período
          </label>
          <select
            id="period"
            name="period"
            defaultValue={periodo ?? ""}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
        <div>
          <label htmlFor="context" className="block text-xs text-gray-500">
            Contexto
          </label>
          <select
            id="context"
            name="context"
            defaultValue={contexto ?? ""}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {CONTEXTOS_GLICEMIA.map((c) => (
              <option key={c} value={c}>
                {contextoPt[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900">
            Filtrar
          </button>
        </div>
      </form>

      {leituras.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow">
          Nenhuma medição encontrada para os filtros selecionados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Data e hora</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Glicemia</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Contexto</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Observações</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leituras.map((l: { id: string; measuredAt: Date; glucoseMgDl: number; context: string; notes: string | null }) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-gray-900">{l.measuredAt.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-2 text-gray-900">{l.glucoseMgDl} mg/dL</td>
                  <td className="px-4 py-2 text-gray-700">{contextoPt[l.context]}</td>
                  <td className="px-4 py-2 text-gray-700">{l.notes ?? "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/readings/${l.id}/edit`} className="mr-3 text-blue-600 hover:underline">
                      Editar
                    </Link>
                    <ExcluirLeituraButton id={l.id} descricao={`${l.glucoseMgDl} mg/dL em ${l.measuredAt.toLocaleString("pt-BR")}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Página {pagina} de {totalPaginas} ({total} registros)
        </span>
        <div className="flex gap-2">
          {pagina > 1 && (
            <Link
              href={`/readings?${new URLSearchParams({
                ...(periodo ? { period: periodo } : {}),
                ...(contexto ? { context: contexto } : {}),
                page: String(pagina - 1),
              }).toString()}`}
              className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-100"
            >
              Anterior
            </Link>
          )}
          {pagina < totalPaginas && (
            <Link
              href={`/readings?${new URLSearchParams({
                ...(periodo ? { period: periodo } : {}),
                ...(contexto ? { context: contexto } : {}),
                page: String(pagina + 1),
              }).toString()}`}
              className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-100"
            >
              Próxima
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}