/*
  Warnings:

  - You are about to drop the column `end_date` on the `Work` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "statement" TEXT
);
INSERT INTO "new_Work" ("category", "description", "id", "name", "occupation", "start_date", "statement") SELECT "category", "description", "id", "name", "occupation", "start_date", "statement" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE UNIQUE INDEX "Work_name_key" ON "Work"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
