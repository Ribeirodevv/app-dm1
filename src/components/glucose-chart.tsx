// Gráfico de evolução da glicemia utilizando Recharts.
// Exibe apenas medições reais, sem interpolação.

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Ponto = {
  measuredAt: string;
  glucoseMgDl: number;
  context: string;
};

type Props = {
  dados: Ponto[];
};

const CONTEXTOS_PT: Record<string, string> = {
  jejum: "Jejum",
  antes_refeicao: "Antes da refeição",
  depois_refeicao: "Depois da refeição",
  ao_deitar: "Ao deitar",
  outro: "Outro",
};

/**
 * Gráfico de linha da evolução da glicemia.
 *
 * @param dados Lista de pontos ordenados cronologicamente.
 */
export function GlucoseChart({ dados }: Props) {
  if (dados.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500">
        Sem medições no período selecionado.
      </div>
    );
  }

  const formatarEixo = (valor: string) => {
    const data = new Date(valor);
    return data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="measuredAt" tickFormatter={formatarEixo} minTickGap={24} />
          <YAxis domain={["auto", "auto"]} unit=" mg/dL" width={70} />
          <Tooltip
            labelFormatter={(v) => new Date(v as string).toLocaleString("pt-BR")}
            formatter={(value, _name, item) => {
              const contexto = (item as { payload?: { context?: string } })?.payload?.context;
              return [`${value} mg/dL`, CONTEXTOS_PT[contexto ?? ""] ?? contexto ?? ""];
            }}
          />
          <Line type="linear" dataKey="glucoseMgDl" stroke="#2563eb" dot={{ r: 3 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}