-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "todo" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
