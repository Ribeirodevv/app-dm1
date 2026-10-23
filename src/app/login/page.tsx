// Tela de login do aplicativo Glicemia.

import { LoginForm } from "@/components/login-form";

export default function PaginaLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Glicemia</h1>
        <p className="mb-6 text-sm text-gray-600">
          Diário pessoal de medições de glicemia. Este aplicativo não substitui acompanhamento médico.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}