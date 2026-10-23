// Rota de inicialização para criar o primeiro usuário (Thiago).
// Exige um token de bootstrap definido em variável de ambiente e só funciona
// quando ainda não existem usuários cadastrados.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarPrimeiroUsuario } from "@/services/users";

const bootstrapSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
  name: z.string().min(1).optional(),
});

/**
 * Cria o primeiro usuário quando autorizado.
 *
 * @param request Requisição com dados de bootstrap.
 * @returns Resultado da operação.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validado = bootstrapSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json({ erro: validado.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }

    const tokenEsperado = process.env.BOOTSTRAP_TOKEN;
    if (!tokenEsperado || validado.data.token !== tokenEsperado) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
    }

    const usuario = await criarPrimeiroUsuario(
      validado.data.name ?? "Thiago",
      validado.data.email,
      validado.data.password
    );

    return NextResponse.json({ sucesso: true, id: usuario.id });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido.";
    return NextResponse.json({ erro: mensagem }, { status: 400 });
  }
}