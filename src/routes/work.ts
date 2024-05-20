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
    statement: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
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
    200: workObjectSchema
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
        },
        select: {
            name: true,
            occupation: true,
            description: true,
            category: true,
            statement: true,
            startDate: true,
            endDate: true
        }
    });

    if(!workExists) throw new Error("Work not found");

    let stringWork = {
        ...workExists,
        startDate: new Date(workExists.startDate).toISOString(),
        endDate: workExists.endDate ? new Date(workExists.endDate).toISOString() : undefined
    };

    return reply.send(stringWork);
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

    const workExists = await prisma.work.findUnique({
        where: {
            name: work.name
        }
    });

    if(workExists) throw new Error("Work name already exists");

    const startDate = new Date(work.startDate);

    let datedWork = {
        ...work,
        startDate: startDate.toISOString()
    };

    if(work.endDate) {
        const endDate = new Date(work.endDate);
        datedWork = {
            ...datedWork,
            endDate: endDate.toISOString()
        }
    } //to maintain endDate as optional

    let prismaWork = await prisma.work.create({
        data: datedWork
    });

    prismaWork = {
        ...prismaWork,
        startDate: (prismaWork.startDate).toISOString(),
    }

    if(prismaWork.endDate) {
        prismaWork = {
            ...prismaWork,
            endDate: (prismaWork.endDate).toISOString(),
        }
    }

    return reply
            .status(201)
            .send(prismaWork);
}

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
        // .patch("/works/:id",
        //     {schema: patchWorkSchema},
        //     patchWork)
        // .delete("/works/:id",
        //     {schema: deleteWorkSchema},
        //     deleteWork);
}