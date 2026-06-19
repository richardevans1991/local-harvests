-- CreateTable
CREATE TABLE "FarmCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "FarmCategory_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmCategory_farmId_name_key" ON "FarmCategory"("farmId", "name");
