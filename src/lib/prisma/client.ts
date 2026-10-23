// Cliente Prisma compartilhado para acesso ao Neon PostgreSQL.
// A conexão ocorre exclusivamente no servidor; este módulo não deve ser importado por componentes de cliente.
// O adaptador Neon recebe a connectionString do ambiente, mantendo segredos fora do bundle do navegador.
// A instanciação é feita de forma preguiçosa para não falhar durante o build quando DATABASE_URL
// ainda não estiver definida.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cria uma instância do Prisma Client configurada para o adaptador Neon.
 *
 * @returns Instância pronta para consultas ao banco.
 */
function criarClientePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function obterClientePrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = criarClientePrisma();
  }
  return globalForPrisma.prisma;
}

// Proxy que instancia o cliente apenas no primeiro acesso, permitindo o build sem DATABASE_URL.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = obterClientePrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});