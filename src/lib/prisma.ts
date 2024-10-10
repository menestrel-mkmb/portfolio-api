import { Prisma, PrismaClient } from "@prisma/client";

const optionsPrisma: Prisma.Subset<Prisma.PrismaClientOptions, Prisma.PrismaClientOptions> = process.env.NODE_ENV !== 'production' ? {
    log: [
        "query",
        "error",
        "warn"
    ],
} : { log: ['query']};

export const prisma = new PrismaClient(optionsPrisma);