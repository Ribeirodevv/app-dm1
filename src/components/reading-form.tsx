// Formulário reutilizável para criação e edição de medições.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONTEXTOS_GLICEMIA } from "@/lib/validations/glucose";

type ValoresIniciais = {
  glucoseMgDl?: number;
  date?: string;
  time?: string;
  context?: string;
  notes?: string;
  measuredAtIso?: string;
};

type Props = {
  valoresIniciais?: ValoresIniciais;
  aoEnviar: (dados: {
    glucoseMgDl: number;
    date: string;
    time: string;
    context: string;
    notes?: string;
    timeZoneOffset: number;
  }) => Promise<{ sucesso: boolean; mensagem?: string }>;
  rotuloBotao: string;
};

const CONTEXTOS_PT: Record<string, string> = {
  jejum: "Jejum",
  antes_refeicao: "Antes da refeição",
  depois_refeicao: "Depois da refeição",
  ao_deitar: "Ao deitar",
  outro: "Outro",
};

/**
 * Formulário de medição com validação básica no cliente.
 */
export function ReadingForm({ valoresIniciais, aoEnviar, rotuloBotao }: Props) {
  const router = useRouter();
  const hoje = new Date().toISOString().slice(0, 10);
  const agora = new Date().toTimeString().slice(0, 5);

  // Quando for edição, converte o instante armazenado (UTC) para data/hora locais.
  let dataInicial = valoresIniciais?.date ?? hoje;
  let horaInicial = valoresIniciais?.time ?? agora;
  if (valoresIniciais?.measuredAtIso) {
    const d = new Date(valoresIniciais.measuredAtIso);
    dataInicial = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    horaInicial = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  const [glucose, setGlucose] = useState<string>(valoresIniciais?.glucoseMgDl?.toString() ?? "");
  const [date, setDate] = useState(dataInicial);
  const [time, setTime] = useState(horaInicial);
  const [context, setContext] = useState(valoresIniciais?.context ?? "jejum");
  const [notes, setNotes] = useState(valoresIniciais?.notes ?? "");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    const numero = Number(glucose);
    if (!Number.isInteger(numero) || numero < 20 || numero > 600) {
      setErro("Informe um valor inteiro entre 20 e 600 mg/dL.");
      return;
    }
    if (!date || !time) {
      setErro("Informe data e hora da medição.");
      return;
    }
    if (notes.length > 1000) {
      setErro("As observações podem ter no máximo 1.000 caracteres.");
      return;
    }

    setCarregando(true);
    const resultado = await aoEnviar({
      glucoseMgDl: numero,
      date,
      time,
      context,
      notes: notes || undefined,
      timeZoneOffset: new Date().getTimezoneOffset(),
    });
    setCarregando(false);

    if (resultado.sucesso) {
      router.push("/readings");
      router.refresh();
    } else {
      setErro(resultado.mensagem ?? "Erro ao salvar.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow" aria-label="Formulário de medição">
      <div>
        <label htmlFor="glucose" className="block text-sm font-medium text-gray-700">
          Glicemia (mg/dL)
        </label>
        <input
          id="glucose"
          type="number"
          inputMode="numeric"
          required
          value={glucose}
          onChange={(e) => setGlucose(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Unidade utilizada: mg/dL.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Data da medição
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Hora da medição
          </label>
          <input
            id="time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700">
          Contexto
        </label>
        <select
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CONTEXTOS_GLICEMIA.map((c) => (
            <option key={c} value={c}>
              {CONTEXTOS_PT[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">{notes.length}/1000 caracteres.</p>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {carregando ? "Salvando..." : rotuloBotao}
      </button>
    </form>
  );
}