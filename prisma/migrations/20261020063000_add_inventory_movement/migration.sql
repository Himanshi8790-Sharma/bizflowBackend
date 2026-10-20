CREATE TYPE "InventoryMovementType" AS ENUM (
    'INCREASE',
    'DECREASE',
    'SALE',
    'RESTOCK',
    'RETURN',
    'ADJUSTMENT'
);

CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InventoryMovement_organizationId_idx"
ON "InventoryMovement"("organizationId");

CREATE INDEX "InventoryMovement_organizationId_productId_idx"
ON "InventoryMovement"("organizationId", "productId");

CREATE INDEX "InventoryMovement_organizationId_createdAt_idx"
ON "InventoryMovement"("organizationId", "createdAt");

CREATE INDEX "InventoryMovement_productId_createdAt_idx"
ON "InventoryMovement"("productId", "createdAt");

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;