// Layout compartilhado das páginas privadas, com navegação e verificação de sessão no servidor.

import { redirect } from "next/navigation";
import { obterUsuarioAutenticado } from "@/lib/auth/get-user";
import { LogoutButton } from "@/components/logout-button";

export default async function LayoutProtegido({ children }: { children: React.ReactNode }) {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/dashboard" className="text-lg font-bold text-gray-900">
            Glicemia
          </a>
          <nav className="flex items-center gap-3 text-sm">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Painel
            </a>
            <a href="/readings" className="text-gray-700 hover:text-blue-600">
              Histórico
            </a>
            <a href="/readings/new" className="text-gray-700 hover:text-blue-600">
              Nova medição
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}