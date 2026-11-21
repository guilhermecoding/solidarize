-- CreateTable
CREATE TABLE "public"."food" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "brand" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "batch" TEXT NOT NULL,
    "productCode" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_history" (
    "id" TEXT NOT NULL,
    "foodId" TEXT,
    "foodLabel" TEXT NOT NULL,
    "foodBatch" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."basket_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."basket_template_food" (
    "templateId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,

    CONSTRAINT "basket_template_food_pkey" PRIMARY KEY ("templateId","foodId")
);

-- CreateTable
CREATE TABLE "public"."basket_sequence" (
    "dateKey" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "basket_sequence_pkey" PRIMARY KEY ("dateKey")
);

-- CreateTable
CREATE TABLE "public"."basket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "templateId" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."basket_food" (
    "basketId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,

    CONSTRAINT "basket_food_pkey" PRIMARY KEY ("basketId","foodId")
);

-- CreateTable
CREATE TABLE "public"."basket_history" (
    "id" TEXT NOT NULL,
    "basketId" TEXT,
    "basketName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "basket_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_batch_key" ON "public"."food"("batch");

-- CreateIndex
CREATE INDEX "food_label_idx" ON "public"."food"("label");

-- CreateIndex
CREATE INDEX "food_expiresAt_idx" ON "public"."food"("expiresAt");

-- CreateIndex
CREATE INDEX "food_type_idx" ON "public"."food"("type");

-- CreateIndex
CREATE INDEX "food_createdById_idx" ON "public"."food"("createdById");

-- CreateIndex
CREATE INDEX "food_history_createdAt_idx" ON "public"."food_history"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "food_history_foodId_idx" ON "public"."food_history"("foodId");

-- CreateIndex
CREATE INDEX "food_history_createdById_idx" ON "public"."food_history"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "basket_template_name_key" ON "public"."basket_template"("name");

-- CreateIndex
CREATE INDEX "basket_template_name_idx" ON "public"."basket_template"("name");

-- CreateIndex
CREATE INDEX "basket_template_createdById_idx" ON "public"."basket_template"("createdById");

-- CreateIndex
CREATE INDEX "basket_template_food_foodId_idx" ON "public"."basket_template_food"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "basket_name_key" ON "public"."basket"("name");

-- CreateIndex
CREATE INDEX "basket_quantity_idx" ON "public"."basket"("quantity");

-- CreateIndex
CREATE INDEX "basket_createdAt_idx" ON "public"."basket"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "basket_templateId_idx" ON "public"."basket"("templateId");

-- CreateIndex
CREATE INDEX "basket_createdById_idx" ON "public"."basket"("createdById");

-- CreateIndex
CREATE INDEX "basket_food_foodId_idx" ON "public"."basket_food"("foodId");

-- CreateIndex
CREATE INDEX "basket_history_createdAt_idx" ON "public"."basket_history"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "basket_history_basketId_idx" ON "public"."basket_history"("basketId");

-- CreateIndex
CREATE INDEX "basket_history_createdById_idx" ON "public"."basket_history"("createdById");

-- AddForeignKey
ALTER TABLE "public"."food" ADD CONSTRAINT "food_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "system-auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_history" ADD CONSTRAINT "food_history_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_history" ADD CONSTRAINT "food_history_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "system-auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_template" ADD CONSTRAINT "basket_template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "system-auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_template_food" ADD CONSTRAINT "basket_template_food_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."basket_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_template_food" ADD CONSTRAINT "basket_template_food_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket" ADD CONSTRAINT "basket_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."basket_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket" ADD CONSTRAINT "basket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "system-auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_food" ADD CONSTRAINT "basket_food_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "public"."basket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_food" ADD CONSTRAINT "basket_food_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_history" ADD CONSTRAINT "basket_history_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "public"."basket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."basket_history" ADD CONSTRAINT "basket_history_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "system-auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
