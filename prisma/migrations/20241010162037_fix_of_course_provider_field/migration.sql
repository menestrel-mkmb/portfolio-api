/*
  Warnings:

  - You are about to drop the column `provedor` on the `Course` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "verify_url" TEXT NOT NULL
);
INSERT INTO "new_Course" ("category", "duration", "id", "name", "verify_url") SELECT "category", "duration", "id", "name", "verify_url" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
