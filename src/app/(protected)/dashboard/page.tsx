// Painel inicial com resumo, gráfico e atalhos.

import { redirect } from "next/navigation";
import Link from "next/link";
import { obterUsuarioAutenticado } from "@/lib/auth/get-user";
import { listarLeituras, contarLeituras } from "@/services/glucose-readings";
import { calcularInicioPeriodo, ehPeriodoValido } from "@/lib/period";
import { GlucoseChart } from "@/components/glucose-chart";

type SearchParams = { period?: string };

export default async function PaginaDashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) redirect("/login");

  const params = await searchParams;
  const periodo = ehPeriodoValido(params.period) ? params.period : "24h";
  const inicio = calcularInicioPeriodo(periodo);
  const fim = new Date();

  const [ultimaLista, recentes, quantidade] = await Promise.all([
    listarLeituras(usuario.id, { limite: 1 }),
    listarLeituras(usuario.id, { inicio, fim, limite: 5 }),
    contarLeituras(usuario.id, { inicio, fim }),
  ]);

  const ultima = ultimaLista[0] ?? null;

  // Pontos do gráfico em ordem cronológica (ascendente).
  const pontosPeriodo = await listarLeituras(usuario.id, { inicio, fim });
  const dadosGrafico = pontosPeriodo
    .map((l: { measuredAt: Date; glucoseMgDl: number; context: string }) => ({
      measuredAt: l.measuredAt.toISOString(),
      glucoseMgDl: l.glucoseMgDl,
      context: l.context,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
        <div className="flex gap-2 text-sm">
          {(["24h", "7d", "30d"] as const).map((p) => (
            <Link
              key={p}
              href={`/dashboard?period=${p}`}
              className={`rounded-md px-3 py-1.5 ${periodo === p ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
            >
              {p === "24h" ? "24 horas" : p === "7d" ? "7 dias" : "30 dias"}
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Última medição</p>
          {ultima ? (
            <>
              <p className="text-3xl font-bold text-gray-900">{ultima.glucoseMgDl} mg/dL</p>
              <p className="text-sm text-gray-600">
                {ultima.measuredAt.toLocaleString("pt-BR")}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma medição registrada.</p>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Medições no período</p>
          <p className="text-3xl font-bold text-gray-900">{quantidade}</p>
          <p className="text-sm text-gray-600">
            {periodo === "24h" ? "Últimas 24 horas" : periodo === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Atalhos</p>
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/readings/new" className="text-blue-600 hover:underline">
              Registrar medição
            </Link>
            <Link href="/readings" className="text-blue-600 hover:underline">
              Ver histórico
            </Link>
            <Link href={`/api/export/csv?period=${periodo}`} className="text-blue-600 hover:underline">
              Exportar CSV
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Evolução da glicemia</h2>
        <GlucoseChart dados={dadosGrafico} />
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Registros recentes</h2>
        {recentes.length === 0 ? (
          <p className="text-sm text-gray-500">Sem registros no período selecionado.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentes.map((r: { id: string; measuredAt: Date; glucoseMgDl: number; context: string }) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {r.measuredAt.toLocaleString("pt-BR")} — {r.glucoseMgDl} mg/dL
                </span>
                <span className="text-gray-500">{r.context}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-gray-500">
        Os valores exibidos são registros históricos informados pelo usuário. Este aplicativo não realiza diagnósticos nem recomenda tratamento.
      </p>
    </div>
  );
}