// Botão de exclusão de medição com confirmação.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { excluirLeituraAction } from "@/app/actions/glucose";

type Props = {
  id: string;
  descricao: string;
};

/**
 * Botão que solicita confirmação e exclui a medição informada.
 */
export function ExcluirLeituraButton({ id, descricao }: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function handleExcluir() {
    if (!window.confirm(`Excluir a medição de ${descricao}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setCarregando(true);
    const resultado = await excluirLeituraAction(id);
    setCarregando(false);
    if (resultado.sucesso) {
      router.refresh();
    } else {
      window.alert(resultado.mensagem ?? "Erro ao excluir.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleExcluir}
      disabled={carregando}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {carregando ? "Excluindo..." : "Excluir"}
    </button>
  );
}