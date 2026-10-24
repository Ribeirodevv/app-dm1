// Server Actions de autenticação própria.

"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buscarUsuarioPorEmail } from "@/services/users";
import { verificarSenha } from "@/lib/auth/password";
import { criarSessao } from "@/lib/auth/session";
import { NOME_COOKIE_SESSAO } from "@/lib/auth/constants";
import { estaBloqueado, registrarTentativaLogin } from "@/lib/auth/rate-limit";
import { encerrarSessao } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export type ResultadoAuth = {
  sucesso: boolean;
  mensagem?: string;
};

/**
 * Realiza o login do usuário.
 *
 * @param entrada Dados do formulário.
 * @returns Resultado da operação.
 */
export async function loginAction(entrada: unknown): Promise<ResultadoAuth> {
  const validado = loginSchema.safeParse(entrada);
  if (!validado.success) {
    return { sucesso: false, mensagem: validado.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = validado.data.email.trim().toLowerCase();
  const senha = validado.data.password;

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "desconhecido";

  // Limita por e-mail e por origem (IP), sem confiar cegamente em cabeçalhos.
  if (await estaBloqueado(email) || await estaBloqueado(ip)) {
    return { sucesso: false, mensagem: "Muitas tentativas. Tente novamente mais tarde." };
  }

  const usuario = await buscarUsuarioPorEmail(email);
  const senhaValida = usuario ? await verificarSenha(senha, usuario.passwordHash) : false;

  await registrarTentativaLogin(email, senhaValida);
  await registrarTentativaLogin(ip, senhaValida);

  if (!usuario || !senhaValida) {
    return { sucesso: false, mensagem: "E-mail ou senha inválidos." };
  }

  const token = await criarSessao(usuario.id);
  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  revalidatePath("/dashboard");
  return { sucesso: true };
}

/**
 * Encerra a sessão do usuário.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE_SESSAO)?.value;
  await encerrarSessao(token);
  cookieStore.delete(NOME_COOKIE_SESSAO);
  redirect("/login");
}