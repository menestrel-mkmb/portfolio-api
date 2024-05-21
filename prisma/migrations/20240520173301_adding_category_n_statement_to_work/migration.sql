/*
  Warnings:

  - Added the required column `category` to the `Work` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "statement" TEXT
);
INSERT INTO "new_Work" ("description", "end_date", "id", "name", "occupation", "start_date") SELECT "description", "end_date", "id", "name", "occupation", "start_date" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE UNIQUE INDEX "Work_name_key" ON "Work"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
