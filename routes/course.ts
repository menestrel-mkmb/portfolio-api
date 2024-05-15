import { Course } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const getCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const courses = {
        courses: [
            { name: "course 1" },
            { name: "course 2" },
            { name: "course 3" },
            { name: "course 4" },
            { name: "course 5" },
            { name: "course 6" }
        ]
    }
    return { courses };
}

const postCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const course = request.body as Course;

    console.log(course.name, course.provedor, course.category, course.duration, course.verifyUrl);

    return reply.send(course);
}

export async function course(app: FastifyInstance) {
    app.get("/courses", getCourses)
        .post("/courses", postCourses)
}