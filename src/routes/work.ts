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

const workIdSchema = z.object({
    id: z.string().uuid(),
});
const workObjectSchema = z.object({
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

const getWorksResponseSchema = {
    200: z.array(workObjectSchemaWithId),
    204: z.array(workObjectSchemaWithId).optional()
};
const getWorksSchema = {
    summary: "Get all works",
    tags: ["works"],
    response: getWorksResponseSchema
};

const getWorks = async (request: FastifyRequest, reply: FastifyReply) => {
    const prismaWorks = await prisma.work.findMany({});
    const works = (getWorksResponseSchema[200]).parse(prismaWorks);

    if(!works) return reply.status(204).send(works);

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
    let workExists = await prisma.work.findUnique({
        where: {
            id
        }
    });

    if(!workExists) throw new Error("Work not found");

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
    const {
        name,
        occupation,
        description,
        category,
        statement,
        startDate,
        endDate
    } = postWorkRequestSchema.parse(request.body);

    const workExists = await prisma.work.findFirst({
        where: {
            name
        }
    });

    if(workExists) throw new Error("Work already exists");

    const newWork = await prisma.work.create({
        data: {
            name,
            occupation,
            description,
            category,
            statement: statement ? statement : null,
            startDate: new Date(startDate).toISOString(),
            endDate: endDate ? new Date(endDate).toISOString() : null
        }
    });

    console.log(newWork);

    return reply.status(201).send({
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

    let workExists = await prisma.work.findUnique({
        where: {
            id
        }
    });

    if(!workExists) throw new Error("Work not found");

    const {
        name,
        occupation,
        description,
        category,
        statement,
        startDate,
        endDate
    } = patchWorkRequestSchema.parse(request.body);

    const updatedWork = await prisma.work.update({
        where: {
            id
        },
        data: {
            name,
            occupation,
            description,
            category,
            statement,
            startDate,
            endDate
        }
    });

    return reply.send({
        ...updatedWork,
        statement: updatedWork.statement ? updatedWork.statement : null,
        startDate: new Date(updatedWork.startDate).toISOString(),
        endDate: updatedWork.endDate ? new Date(updatedWork.endDate).toISOString() : null
    });
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
}