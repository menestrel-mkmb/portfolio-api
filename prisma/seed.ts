import { prisma } from "../src/lib/prisma";

import course from "./seed/course.json";
import education from "./seed/education.json";
import volunteer from "./seed/volunteer.json";
import work from "./seed/work.json";

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
        prisma.education.createMany({ data: education.data }),
        prisma.volunteer.createMany({ data: volunteer.data }),
        prisma.work.createMany({ data: work.data }),
    ]);
}

seed()
.then(() => {
    console.log("Database seeded");
    prisma.$disconnect();
})
.catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});