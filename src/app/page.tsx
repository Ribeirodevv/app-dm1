// Página inicial redireciona para o painel (que exige autenticação).

import { redirect } from "next/navigation";

export default function PaginaInicial() {
  redirect("/dashboard");
}