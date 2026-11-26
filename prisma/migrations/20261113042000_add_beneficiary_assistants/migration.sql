-- Links a beneficiary to the system members who assist them.

CREATE TABLE "public"."beneficiary_assistant" (
    "beneficiaryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "beneficiary_assistant_pkey" PRIMARY KEY ("beneficiaryId", "userId")
);

CREATE INDEX "beneficiary_assistant_userId_idx" ON "public"."beneficiary_assistant"("userId");

ALTER TABLE "public"."beneficiary_assistant" ADD CONSTRAINT "beneficiary_assistant_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "public"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."beneficiary_assistant" ADD CONSTRAINT "beneficiary_assistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "system-auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
