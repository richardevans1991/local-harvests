-- AlterTable
ALTER TABLE "Farm" ADD COLUMN "deliveryFee" REAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryFee" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "farmDeliveryFees" TEXT;