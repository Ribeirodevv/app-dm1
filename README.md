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
- Autenticação própria (Argon2id + sessões no Neon)
- Zod
- Recharts
- Vitest

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Nenhuma conta externa de autenticação (autenticação própria)
- Banco PostgreSQL no Neon

## Instalação

```bash
npm install
```

## Autenticação própria

A autenticação é realizada no servidor com senhas armazenadas como hash Argon2id no Neon.

Para criar o primeiro usuário (Thiago):

1. Defina `BOOTSTRAP_TOKEN` no `.env.local`.
2. Com o servidor em execução, envie uma requisição POST para `/api/bootstrap` com o token e as credenciais desejadas:

```bash
curl -X POST http://localhost:3000/api/bootstrap ^
  -H "Content-Type: application/json" ^
  -d "{\"token\":\"SEU_TOKEN\",\"email\":\"thiago@exemplo.com\",\"password\":\"SenhaForte123!\",\"name\":\"Thiago\"}"
```

O bootstrap só funciona quando não existem usuários cadastrados. A rota deve ser desabilitada em produção após o uso (removendo `BOOTSTRAP_TOKEN`).

Recuperação de acesso: redefina a senha por um procedimento administrativo documentado (execução controlada de um script ou atualização direta do hash no banco), nunca expondo senhas em logs.

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
- `BOOTSTRAP_TOKEN`: token para criar o primeiro usuário (usar uma vez e remover).

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
- Autenticação própria (Argon2id + sessões no Neon) exclusivamente para autenticação; dados ficam no Neon.
- Datas persistidas como `timestamptz` (instante UTC).
- Comentários em português brasileiro em todo o código.