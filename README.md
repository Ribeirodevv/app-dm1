# Glicemia

Diário pessoal de medições de glicemia para pessoas com diabetes tipo 1. O aplicativo permite registrar medições realizadas com glicosímetro de ponta de dedo, visualizar histórico, gráficos e exportar dados em CSV.

Este aplicativo é um diário de registros. Não realiza diagnósticos, não recomenda tratamento e não calcula doses de insulina.

## Tecnologias

- Next.js 15 (App Router)
- React 19
- TypeScript (modo strict)
- Tailwind CSS 4
- Prisma 7
- Neon PostgreSQL
- Supabase Auth
- Zod
- Recharts
- Vitest

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Conta no Supabase (Auth)
- Banco PostgreSQL no Neon

## Instalação

```bash
npm install
```

## Configuração do Supabase Auth

1. Crie um projeto no Supabase.
2. Em Authentication, habilite o provedor de e-mail/senha.
3. Copie a URL do projeto e a chave anônima (anon key) para as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Configuração do banco Neon

1. Crie um banco PostgreSQL no Neon.
2. Copie a connection string com pooler para `DATABASE_URL`.
3. Copie a connection string direta (sem pooler) para `DIRECT_URL`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

Variáveis:

- `DATABASE_URL`: conexão usada pelo aplicativo em tempo de execução (pode usar pooler do Neon).
- `DIRECT_URL`: conexão direta usada pelas migrações do Prisma (sem pooler).
- `NEXT_PUBLIC_SUPABASE_URL`: URL pública do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave anônima pública do Supabase.

## Prisma

Gerar o cliente:

```bash
npx prisma generate
```

Aplicar migrações:

```bash
npx prisma migrate deploy
```

Em desenvolvimento, para criar/aplicar migrações:

```bash
npx prisma migrate dev
```

## Execução local

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Testes

```bash
npm test
```

## Build de produção

```bash
npm run build
npm run start
```

## Implantação

Implante em uma plataforma compatível com Next.js (ex.: Vercel). Configure as variáveis de ambiente no painel da plataforma. Utilize HTTPS em produção.

## Estratégia de backup e recuperação

- O Neon oferece backups automáticos e point-in-time recovery conforme o plano.
- Exporte periodicamente os dados via funcionalidade de exportação CSV.
- Em caso de perda, restaure o banco a partir do backup do Neon e reaplique migrações com `npx prisma migrate deploy`.

## Limitações conhecidas do MVP

- Sem sincronização offline de dados sensíveis.
- A formatação de data/hora no servidor utiliza o fuso do ambiente; a interface exibe no fuso local do navegador.
- Sem cálculos clínicos, diagnósticos ou recomendações de tratamento.
- A exportação CSV utiliza delimitador `;` para compatibilidade com planilhas em pt-BR.

## Privacidade e segurança

- A identidade do usuário é obtida da sessão validada no servidor.
- Todas as consultas são limitadas ao usuário autenticado.
- Segredos não são expostos no frontend.
- Consulte `.env.example` para as variáveis necessárias.

## Decisões arquiteturais

- Prisma 7 com adaptador Neon (`@prisma/adapter-neon`) e `@neondatabase/serverless`.
- Supabase Auth exclusivamente para autenticação; dados ficam no Neon.
- Datas persistidas como `timestamptz` (instante UTC).
- Comentários em português brasileiro em todo o código.