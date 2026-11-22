-- AlterTable
ALTER TABLE "public"."food_history"
ADD COLUMN "beneficiaryId" TEXT,
ADD COLUMN "beneficiaryName" TEXT,
ADD COLUMN "justification" TEXT;

-- AlterTable
ALTER TABLE "public"."basket_history"
ADD COLUMN "beneficiaryId" TEXT,
ADD COLUMN "beneficiaryName" TEXT,
ADD COLUMN "justification" TEXT;

-- CreateIndex
CREATE INDEX "food_history_beneficiaryId_idx" ON "public"."food_history"("beneficiaryId");

-- CreateIndex
CREATE INDEX "basket_history_beneficiaryId_idx" ON "public"."basket_history"("beneficiaryId");

-- AddForeignKey
ALTER TABLE "public"."food_history"
ADD CONSTRAINT "food_history_beneficiaryId_fkey"
FOREIGN KEY ("beneficiaryId") REFERENCES "public"."beneficiary"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_history"
ADD CONSTRAINT "basket_history_beneficiaryId_fkey"
FOREIGN KEY ("beneficiaryId") REFERENCES "public"."beneficiary"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
