import { json } from "stream/consumers";
import { prisma } from "../src/lib/prisma";

import course from "./seed/course.json";

export const seed = async () => {
    await prisma.$transaction([
        prisma.course.deleteMany({}),
        prisma.education.deleteMany({}),
        prisma.volunteer.deleteMany({}),
        prisma.work.deleteMany({}),
    ]);

    console.warn("Database cleared");

    await prisma.$transaction([
        prisma.course.createMany({ data: course.data }),
        // prisma.education.createMany({ data: educations }),
        // prisma.volunteer.createMany({ data: volunteers }),
        // prisma.work.createMany({ data: works }),
    ]);
}

seed()
.then(() => {
    console.log("Database seeded");
    prisma.$disconnect();
})
.catch((e) => {
    console.error(e);
    process.exit(1);
})