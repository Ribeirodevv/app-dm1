// Formulário de autenticação (login e cadastro) usando Supabase Auth.
// Toda a autenticação ocorre via Supabase; este componente apenas coleta credenciais.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteSupabaseNavegador } from "@/lib/supabase/client";

/**
 * Formulário de login/cadastro por e-mail e senha.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setCarregando(true);
    setMensagem(null);
    const supabase = criarClienteSupabaseNavegador();

    if (modoCadastro) {
      const { error } = await supabase.auth.signUp({ email, password: senha });
      if (error) {
        setMensagem(error.message);
      } else {
        setMensagem("Conta criada. Verifique seu e-mail, se necessário, e faça login.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setMensagem("E-mail ou senha inválidos.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setCarregando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de autenticação">
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
          minLength={6}
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
        {carregando ? "Aguarde..." : modoCadastro ? "Criar conta" : "Entrar"}
      </button>
      <button
        type="button"
        onClick={() => setModoCadastro((v) => !v)}
        className="w-full text-sm text-blue-600 hover:underline"
      >
        {modoCadastro ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
      </button>
    </form>
  );
}