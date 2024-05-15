import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const courseObjectSchema = z.object({
    name: z.string(),
    provedor: z.string(),
    category: z.string(),
    duration: z.number(),
    verifyUrl: z.string()
});
const courseObjectSchemaWithId = courseObjectSchema.extend({
    id: z.string().uuid(),
})
const getCoursesResponseSchema = z.array(courseObjectSchemaWithId);
const getCoursesSchema = {
    summary: "Get all courses",
    tags: ["courses"],
    response: {
        200: getCoursesResponseSchema
    }
};

const getCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const courses = getCoursesResponseSchema.parse([
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

const postCourseRequestSchema = courseObjectSchema;
const postCourseResponseSchema = courseObjectSchemaWithId;
const postCourseSchema = {
    summary: "Create course",
    tags: ["courses"],
    body: postCourseRequestSchema,
    response: {
        201: postCourseResponseSchema
    }
};

const postCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const course = postCourseRequestSchema.parse(request.body);

    console.log(course.name, course.provedor, course.category, course.duration, course.verifyUrl);

    return reply.send(course);
}

export async function course(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/courses",
            {schema: getCoursesSchema},
            getCourses)
        .post("/courses",
            {schema: postCourseSchema},
            postCourses)
}