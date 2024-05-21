-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Work_name_key" ON "Work"("name");
