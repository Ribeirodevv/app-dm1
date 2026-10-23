// Página para editar uma medição existente.

import { redirect, notFound } from "next/navigation";
import { obterUsuarioAutenticado } from "@/lib/auth/get-user";
import { obterLeitura } from "@/services/glucose-readings";
import { ReadingForm } from "@/components/reading-form";
import { atualizarLeituraAction } from "@/app/actions/glucose";

type Params = { id: string };

export default async function PaginaEditarLeitura({ params }: { params: Promise<Params> }) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) redirect("/login");

  const { id } = await params;
  const leitura = await obterLeitura(usuario.id, id);
  if (!leitura) notFound();

  const contextPt: Record<string, string> = {
    jejum: "Jejum",
    antes_refeicao: "Antes da refeição",
    depois_refeicao: "Depois da refeição",
    ao_deitar: "Ao deitar",
    outro: "Outro",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Editar medição</h1>
      <p className="text-sm text-gray-600">
        {leitura.measuredAt.toLocaleString("pt-BR")} — {leitura.glucoseMgDl} mg/dL ({contextPt[leitura.context]})
      </p>
      <ReadingForm
        valoresIniciais={{
          glucoseMgDl: leitura.glucoseMgDl,
          context: leitura.context,
          notes: leitura.notes ?? "",
          measuredAtIso: leitura.measuredAt.toISOString(),
        }}
        aoEnviar={async (dados) => atualizarLeituraAction(id, dados)}
        rotuloBotao="Salvar alterações"
      />
    </div>
  );
}