// Botão de logout que encerra a sessão no servidor.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

/**
 * Botão para encerrar a sessão do usuário.
 */
export function LogoutButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function sair() {
    setCarregando(true);
    await logoutAction();
    setCarregando(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={carregando}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
    >
      {carregando ? "Saindo..." : "Sair"}
    </button>
  );
}