// Formulário de login usando autenticação própria no servidor.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

/**
 * Formulário de login por e-mail e senha.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const resultado = await loginAction({ email, password: senha });
    if (resultado.sucesso) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMensagem(resultado.mensagem ?? "Erro ao entrar.");
    }
    setCarregando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de login">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {mensagem && (
        <p role="alert" className="text-sm text-red-600">
          {mensagem}
        </p>
      )}
      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {carregando ? "Aguarde..." : "Entrar"}
      </button>
    </form>
  );
}