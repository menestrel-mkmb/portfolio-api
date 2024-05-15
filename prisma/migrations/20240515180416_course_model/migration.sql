-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provedor" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "verify_url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");
