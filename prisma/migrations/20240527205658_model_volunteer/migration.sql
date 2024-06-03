-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "occupation" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "category" TEXT NOT NULL,
    "what_i_did" TEXT NOT NULL,
    "what_i_learned" TEXT NOT NULL
);
