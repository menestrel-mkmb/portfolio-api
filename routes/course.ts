import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const getCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    // const courses = getCoursesResponseSchema.parse([
    const courses = ([
        {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Course 1",
            provedor: "Course 1",
            category: "Course 1",
            duration: 30,
            verifyUrl: "https://example.com"
        },
        {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "Course 2",
            provedor: "Course 2",
            category: "Course 2",
            duration: 60,
            verifyUrl: "https://example.com"
        }
    ]);
    return reply.send(courses);
}

const postCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    // const course = postCourseRequestSchema.parse(request.body);
    const course = {
        id: "123e4567-e89b-12d3-a456-426614174002",
        name: "Course 3",
        provedor: "Course 3",
        category: "Course 3",
        duration: 90,
        verifyUrl: "https://example.com"
    }

    console.log(course.name, course.provedor, course.category, course.duration, course.verifyUrl);

    return reply.send(course);
}

export async function course(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/courses",
            // {schema: getCoursesSchema},
            getCourses)
        .post("/courses",
            // {schema: postCourseSchema},
            postCourses)
}