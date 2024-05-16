import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "../lib/prisma";

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
    200: z.array(courseObjectSchemaWithId),
    204: z.array(courseObjectSchemaWithId).optional()
};
const getCoursesSchema = {
    summary: "Get all courses",
    tags: ["courses"],
    response: getCoursesResponseSchema
};

const getCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const prismaCourses = await prisma.course.findMany({});
    const courses = (getCoursesResponseSchema[200]).parse(prismaCourses);

    if(!courses) return reply.status(204).send(courses);

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
    const courseExists = await prisma.course.findUnique({
        where: {
            id
        }
    });

    if(!courseExists) throw new Error("Course not found");

    return reply.send(courseExists);
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
    const nameExists = await prisma.course.findUnique({
        where: {
            name: course.name
        }
    });

    if(nameExists) throw new Error("Course name already exists");

    const prismaCourse = await prisma.course.create({
        data: course
    });

    return reply.send(prismaCourse);
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