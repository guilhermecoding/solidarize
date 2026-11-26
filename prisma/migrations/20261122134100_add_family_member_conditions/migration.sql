-- AlterTable
ALTER TABLE "public"."family_member"
ADD COLUMN IF NOT EXISTS "disability" TEXT,
ADD COLUMN IF NOT EXISTS "rent" TEXT;
