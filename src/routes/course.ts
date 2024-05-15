import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// ###
// # RAW
// ###

const courseIdSchema = z.object({
    id: z.string().uuid(),
});
const courseObjectSchema = z.object({
    name: z.string(),
    provedor: z.string(),
    category: z.string(),
    duration: z.number(),
    verifyUrl: z.string()
});
const courseObjectSchemaWithId = courseIdSchema.merge(courseObjectSchema);

// ###
// # METHODS
// ###

const getCoursesResponseSchema = {
    200: z.array(courseObjectSchemaWithId)
};
const getCoursesSchema = {
    summary: "Get all courses",
    tags: ["courses"],
    response: getCoursesResponseSchema
};

const getCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const courses = (getCoursesResponseSchema[200]).parse([
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
};

const getCourseDetailsRequestSchema = courseIdSchema;
const getCourseDetailsResponseSchema = {
    200: courseObjectSchemaWithId
};
const getCourseDetailsSchema = {
    summary: "Get course details",
    tags: ["courses", "details"],
    params: getCourseDetailsRequestSchema,
    response: getCourseDetailsResponseSchema
};

const getCourseDetails = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = getCourseDetailsRequestSchema.parse(request.params);

    return reply.send({
        id,
        name: "Course 1",
        provedor: "Course 1",
        category: "Course 1",
        duration: 30,
        verifyUrl: "https://example.com"
    });
};

const postCourseRequestSchema = courseObjectSchema;
const postCourseResponseSchema = {
    201: courseObjectSchemaWithId
};
const postCourseSchema = {
    summary: "Create course",
    tags: ["courses"],
    body: postCourseRequestSchema,
    response: postCourseResponseSchema
};

const postCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const course = postCourseRequestSchema.parse(request.body);

    return reply.send(course);
};

const patchCourseRequestSchema = courseObjectSchema.partial();
const patchCourseResponseSchema = {
    200: courseObjectSchemaWithId
};
const patchCourseSchema = {
    summary: "Update course",
    tags: ["courses"],
    params: courseIdSchema,
    body: patchCourseRequestSchema,
    response: patchCourseResponseSchema
};

const patchCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = courseIdSchema.parse(request.params);
    const course = patchCourseRequestSchema.parse(request.body);

    return reply.send({ id, ...course });
};

const deleteCourseRequestSchema = courseIdSchema;
const deleteCourseResponseSchema = {
    204: courseIdSchema
};
const deleteCourseSchema = {
    summary: "Delete course",
    tags: ["courses"],
    params: deleteCourseRequestSchema,
    response: deleteCourseResponseSchema
};

const deleteCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = courseIdSchema.parse(request.params);

    return reply.send({ id });
};

export async function course(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/courses",
            {schema: getCoursesSchema},
            getCourses)
        .get("/courses/:id",
            {schema: getCourseDetailsSchema},
            getCourseDetails)
        .post("/courses",
            {schema: postCourseSchema},
            postCourses)
        .patch("/courses/:id",
            {schema: patchCourseSchema},
            patchCourses)
        .delete("/courses/:id",
            {schema: deleteCourseSchema},
            deleteCourses);
};