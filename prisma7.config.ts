// Configuração do Prisma 7.
// A CLI do Prisma utiliza esta URL para migrações e introspecção.
// Em produção, DIRECT_URL deve apontar para a conexão direta do Neon (sem pooler),
// pois migrações exigem uma conexão estável e sem pooling. Quando DIRECT_URL não
// estiver definida, utiliza-se DATABASE_URL como alternativa para desenvolvimento.
import dotenv from "dotenv";
// Carrega variáveis locais (.env.local) e, em seguida, .env, sem sobrescrever valores já definidos.
dotenv.config({ path: ".env.local" });
dotenv.config();
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});