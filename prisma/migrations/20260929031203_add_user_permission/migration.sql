-- AlterTable
ALTER TABLE "system-auth"."user" ADD COLUMN     "permission" TEXT NOT NULL DEFAULT 'read';

-- Existing administrators keep full access.
UPDATE "system-auth"."user" SET "permission" = 'full' WHERE "role" = 'admin';
