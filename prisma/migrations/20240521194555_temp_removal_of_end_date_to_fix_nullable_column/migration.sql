/*
  Warnings:

  - You are about to drop the column `end_date` on the `Education` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "verify_url" TEXT NOT NULL
);
INSERT INTO "new_Education" ("duration", "id", "institution", "location", "start_date", "title", "verify_url") SELECT "duration", "id", "institution", "location", "start_date", "title", "verify_url" FROM "Education";
DROP TABLE "Education";
ALTER TABLE "new_Education" RENAME TO "Education";
CREATE UNIQUE INDEX "Education_title_key" ON "Education"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
