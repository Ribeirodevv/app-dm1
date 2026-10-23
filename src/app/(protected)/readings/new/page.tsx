// Página para registrar uma nova medição.

import { redirect } from "next/navigation";
import { obterUsuarioAutenticado } from "@/lib/auth/get-user";
import { ReadingForm } from "@/components/reading-form";
import { criarLeituraAction } from "@/app/actions/glucose";

export default async function PaginaNovaLeitura() {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Nova medição</h1>
      <ReadingForm
        aoEnviar={async (dados) => criarLeituraAction(dados)}
        rotuloBotao="Registrar medição"
      />
    </div>
  );
}