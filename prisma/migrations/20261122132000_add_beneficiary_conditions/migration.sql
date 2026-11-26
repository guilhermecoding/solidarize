-- AlterTable
ALTER TABLE "public"."beneficiary"
ADD COLUMN "disability" TEXT NOT NULL DEFAULT 'no',
ADD COLUMN "rent" TEXT NOT NULL DEFAULT 'no';

ALTER TABLE "public"."beneficiary"
ALTER COLUMN "disability" DROP DEFAULT,
ALTER COLUMN "rent" DROP DEFAULT;
