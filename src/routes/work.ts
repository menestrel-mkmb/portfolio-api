import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "../lib/prisma";

import { NotFoundError } from "../errors/not-found";
import { DuplicateEntityError } from "../errors/duplicate-entity";
import { BadRequestError } from "../errors/bad-request";

// ###
// # RAW
// ###

const workIdSchema = z.object({
    id: z.string().uuid(),
});
export const workObjectSchema = z.object({
    name: z.string(),
    occupation: z.string(),
    description: z.string(),
    category: z.string(),
    statement: z.string().optional().nullable(),
    startDate: z.string().datetime({offset: true}),
    endDate: z.string().datetime({offset: true}).optional().nullable(),
});
const workObjectSchemaWithId = workIdSchema.merge(workObjectSchema);

// ###
// # METHODS
// ###

const getWorksArraySchema = z.array(workObjectSchemaWithId);
const getWorksResponseSchema = {
    200: getWorksArraySchema,
    204: getWorksArraySchema.optional()
};
const getWorksSchema = {
    summary: "Get all works",
    tags: ["works"],
    response: getWorksResponseSchema
};

const getWorks = async (request: FastifyRequest, reply: FastifyReply) => {
    const prismaWorks = await prisma.work.findMany({});
    const works = (prismaWorks).map(work  => {
        return {
            ...work,
            statement: work.statement ? work.statement : null,
            startDate: new Date(work.startDate).toISOString(),
            endDate: work.endDate ? new Date(work.endDate).toISOString() : null
        };
    });
    if(!works) return reply.code(204).send(works);

    return reply.send(works);
};

const getWorkDetailsRequestSchema = workIdSchema;
const getWorkDetailsResponseSchema = {
    200: workObjectSchemaWithId
};
const getWorkDetailsSchema = {
    summary: "Get work details",
    tags: ["works", "details"],
    params: getWorkDetailsRequestSchema,
    response: getWorkDetailsResponseSchema
};

const getWorkDetails = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = getWorkDetailsRequestSchema.parse(request.params);
    
    let workExists = await prisma.work.findUnique({ where: { id } });
    if(!workExists) throw new NotFoundError("Work not found");

    return reply.send({
        ...workExists,
        startDate: new Date(workExists.startDate).toISOString(),
        endDate: workExists.endDate ? new Date(workExists.endDate).toISOString() : null
    });
}

const postWorkRequestSchema = workObjectSchema;
const postWorkResponseSchema = {
    201: workObjectSchemaWithId
};
const postWorkSchema = {
    summary: "Create new work",
    tags: ["works"],
    body: postWorkRequestSchema,
    response: postWorkResponseSchema
};

const postWork = async (request: FastifyRequest, reply: FastifyReply) => {
    const work = postWorkRequestSchema.parse(request.body);

    const workExists = await prisma.work.findFirst({ where: { name: work.name } });
    if(workExists) throw new DuplicateEntityError("Work already exists");

    const newWork = await prisma.work.create({
        data: {
            ...work,
            statement: work.statement ? work.statement : null,
            startDate: new Date(work.startDate).toISOString(),
            endDate: work.endDate ? new Date(work.endDate).toISOString() : null
        }
    });

    return reply.code(201).send({
        ...newWork,
        statement: newWork.statement ? newWork.statement : null,
        startDate: new Date(newWork.startDate).toISOString(),
        endDate: newWork.endDate ? new Date(newWork.endDate).toISOString() : null
    });
};

const patchWorkRequestSchema = workObjectSchema.partial();
const patchWorkResponseSchema = {
    200: workObjectSchemaWithId
};
const patchWorkSchema = {
    summary: "Update work",
    tags: ["works"],
    params: workIdSchema,
    body: patchWorkRequestSchema,
    response: patchWorkResponseSchema
};

const patchWork = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = workIdSchema.parse(request.params);

    const workExists = await prisma.work.findUnique({ where: { id } });
    if(!workExists) throw new NotFoundError("Work not found");

    const work = patchWorkRequestSchema.parse(request.body);

    const workNameExists = await prisma.work.findFirst({ where: { name: work.name } });
    if(workNameExists) throw new DuplicateEntityError("Work name already exists");

    if(work.startDate && work.endDate
        && work.startDate > work.endDate
    ) throw new BadRequestError("Start date is after end date");

    const updatedWork = await prisma.work.update({ where: { id }, data: work });

    return reply.send({
        ...updatedWork,
        statement: updatedWork.statement ? updatedWork.statement : null,
        startDate: new Date(updatedWork.startDate).toISOString(),
        endDate: updatedWork.endDate ? new Date(updatedWork.endDate).toISOString() : null
    });
};

const deleteWorkRequestSchema = workIdSchema;
const deleteWorkResponseSchema = {
    204: workObjectSchemaWithId.optional()
};
const deleteWorkSchema = {
    summary: "Delete work",
    tags: ["works"],
    params: deleteWorkRequestSchema,
    response: deleteWorkResponseSchema
};

const deleteWork = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = deleteWorkRequestSchema.parse(request.params);

    let workExists = await prisma.work.findUnique({ where: { id } });
    if(!workExists) throw new NotFoundError("Work not found");

    await prisma.work.delete({ where: { id } });

    return reply.code(204).send();
};

export async function work(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/works",
            {schema: getWorksSchema},
            getWorks)
        .get("/works/:id",
            {schema: getWorkDetailsSchema},
            getWorkDetails)
        .post("/works",
            {schema: postWorkSchema},
            postWork)
        .patch("/works/:id",
            {schema: patchWorkSchema},
            patchWork)
        .delete("/works/:id",
            {schema: deleteWorkSchema},
            deleteWork);
}