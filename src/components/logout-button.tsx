// Botão de logout que encerra a sessão do Supabase no navegador.

"use client";

import { useRouter } from "next/navigation";
import { criarClienteSupabaseNavegador } from "@/lib/supabase/client";

/**
 * Botão para encerrar a sessão do usuário.
 */
export function LogoutButton() {
  const router = useRouter();

  async function sair() {
    const supabase = criarClienteSupabaseNavegador();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
    >
      Sair
    </button>
  );
}