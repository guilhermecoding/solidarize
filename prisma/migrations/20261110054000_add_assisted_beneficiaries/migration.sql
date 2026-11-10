-- Assisted beneficiaries live in public. They are not system users.

CREATE TABLE "public"."beneficiary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "street" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "employment" TEXT NOT NULL,
    "profession" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "aidType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."beneficiary_contact" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficiary_contact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."family_member" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kinship" TEXT NOT NULL,
    "cpf" TEXT,
    "street" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "maritalStatus" TEXT,
    "employment" TEXT,
    "profession" TEXT,
    "notes" TEXT,
    "status" TEXT,
    "aidType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."family_member_contact" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "familyMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_member_contact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "beneficiary_name_idx" ON "public"."beneficiary"("name");

CREATE UNIQUE INDEX "beneficiary_cpf_key" ON "public"."beneficiary"("cpf");

CREATE INDEX "beneficiary_contact_beneficiaryId_idx" ON "public"."beneficiary_contact"("beneficiaryId");

CREATE INDEX "family_member_beneficiaryId_idx" ON "public"."family_member"("beneficiaryId");

CREATE INDEX "family_member_name_idx" ON "public"."family_member"("name");

CREATE UNIQUE INDEX "family_member_cpf_key" ON "public"."family_member"("cpf");

CREATE INDEX "family_member_contact_familyMemberId_idx" ON "public"."family_member_contact"("familyMemberId");

ALTER TABLE "public"."beneficiary_contact" ADD CONSTRAINT "beneficiary_contact_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "public"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."family_member" ADD CONSTRAINT "family_member_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "public"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."family_member_contact" ADD CONSTRAINT "family_member_contact_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "public"."family_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

  CREATE INDEX "beneficiary_name_search_idx"
  ON "public"."beneficiary"
  USING gin (("system-auth".immutable_unaccent(lower("name"))) public.gin_trgm_ops);

  CREATE INDEX "beneficiary_cpf_trgm_idx"
  ON "public"."beneficiary"
  USING gin ("cpf" public.gin_trgm_ops);

  CREATE INDEX "family_member_name_search_idx"
  ON "public"."family_member"
  USING gin (("system-auth".immutable_unaccent(lower("name"))) public.gin_trgm_ops);

  CREATE INDEX "family_member_cpf_trgm_idx"
  ON "public"."family_member"
  USING gin ("cpf" public.gin_trgm_ops);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm indisponível; a busca segue sem índice trigram: %', SQLERRM;
END $$;
