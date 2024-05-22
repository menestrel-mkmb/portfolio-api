-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "verify_url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Education_title_key" ON "Education"("title");
