import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "../lib/prisma";

import { DuplicateEntityError } from "../errors/duplicate-entity";
import { NotFoundError } from "../errors/not-found";

// ###
// # RAW
// ###

const courseIdSchema = z.object({
    id: z.string().uuid(),
});
export const courseObjectSchema = z.object({
    name: z.string().min(1).max(100),
    provedor: z.string().min(1).max(100),
    category: z.string().min(1).max(100),
    duration: z.number().gte(1).positive().int().finite().safe(),
    verifyUrl: z.string().min(14).max(256)
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
    if(!courses) return reply.code(204).send(courses);

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

    const courseExists = await prisma.course.findUnique({ where: { id } });
    if(!courseExists) throw new NotFoundError("Course not found");

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
    
    const nameExists = await prisma.course.findUnique({ where: { name: course.name } });
    if(nameExists) throw new DuplicateEntityError("Course name already exists");

    const prismaCourse = await prisma.course.create({ data: course });

    return reply.code(201).send(prismaCourse);
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

    const courseExists = await prisma.course.findUnique({ where: { id } });
    if(!courseExists) throw new NotFoundError("Course not found");

    const nameExists = await prisma.course.findUnique({ where: { name: course.name } });
    if(nameExists) throw new DuplicateEntityError("Course name already exists");

    const prismaCourse = await prisma.course.update({
        where: { id },
        data: { ...course }
    });

    return reply.send(prismaCourse);
};

const deleteCourseRequestSchema = courseIdSchema;
const deleteCourseResponseSchema = {
    204: courseIdSchema.optional()
};
const deleteCourseSchema = {
    summary: "Delete course",
    tags: ["courses"],
    params: deleteCourseRequestSchema,
    response: deleteCourseResponseSchema
};

const deleteCourses = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = courseIdSchema.parse(request.params);

    const courseExists = await prisma.course.findUnique({ where: { id } });
    if(!courseExists) throw new NotFoundError("Course not found, maybe already deleted?");

    const deletedCourse = await prisma.course.delete({ where: { id } });

    return reply.code(204).send(deletedCourse);
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