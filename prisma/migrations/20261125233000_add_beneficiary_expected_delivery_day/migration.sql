-- AlterTable
ALTER TABLE "public"."beneficiary"
ADD COLUMN IF NOT EXISTS "expectedDeliveryDay" INTEGER;

-- AlterTable
ALTER TABLE "public"."family_member"
ADD COLUMN IF NOT EXISTS "expectedDeliveryDay" INTEGER;
