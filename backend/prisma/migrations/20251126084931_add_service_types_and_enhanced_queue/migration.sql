-- AlterEnum
ALTER TYPE "QueueStatus" ADD VALUE 'MISSED_CALL';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "dayBeforeReminder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceTypeId" TEXT;

-- AlterTable
ALTER TABLE "queue_entries" ADD COLUMN     "missedCallCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serviceTypeId" TEXT;

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "estimatedDuration" INTEGER NOT NULL,
    "requiresAssistant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_types_name_key" ON "service_types"("name");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_entries" ADD CONSTRAINT "queue_entries_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
