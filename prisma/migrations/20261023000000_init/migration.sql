-- Migração inicial: cria a tabela de medições de glicemia.
-- As datas utilizam timestamptz para preservar o instante UTC.

-- Enum de contextos permitidos.
CREATE TYPE "GlucoseContext" AS ENUM (
  'jejum',
  'antes_refeicao',
  'depois_refeicao',
  'ao_deitar',
  'outro'
);

-- Tabela de medições.
CREATE TABLE "GlucoseReading" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "measuredAt" TIMESTAMPTZ(3) NOT NULL,
  "glucoseMgDl" INTEGER NOT NULL,
  "context" "GlucoseContext" NOT NULL,
  "notes" VARCHAR(1000),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "GlucoseReading_pkey" PRIMARY KEY ("id")
);

-- Índice para consultas por usuário e data, da mais recente para a mais antiga.
CREATE INDEX "GlucoseReading_userId_measuredAt_idx" ON "GlucoseReading"("userId", "measuredAt" DESC);