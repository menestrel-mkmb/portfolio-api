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
const workStringDateSchema = z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
});
const workDateSchema = z.object({
    startDate: z.date(),
    endDate: z.date().optional(),
})
const workObjectSchema = z.object({
    name: z.string(),
    occupation: z.string(),
    description: z.string(),
    category: z.string(),
    statement: z.string().optional(),
});
const workObjectSchemaWithId = workIdSchema.merge(workObjectSchema);
const workObjectSchemaWithIdWithDate = workObjectSchemaWithId.merge(workDateSchema);

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
    200: workObjectSchemaWithIdWithDate
};
const getWorkDetailsSchema = {
    summary: "Get work details",
    tags: ["works", "details"],
    params: getWorkDetailsRequestSchema,
    response: getWorkDetailsResponseSchema
};

const getWorkDetails = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = getWorkDetailsRequestSchema.parse(request.params);
    const workExists = await prisma.work.findUnique({
        where: {
            id
        }
    });

    if(!workExists) throw new Error("Work not found");

    return reply.send(workExists);
}

const postWorkRequestSchema = workObjectSchema.merge(workStringDateSchema);
const postWorkResponseSchema = {
    201: workObjectSchemaWithIdWithDate
}
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
    const endDate = work.endDate? new Date(work.endDate) : null;

    let datedWork = {
        ...work,
        startDate,
    }

    if(endDate) {
        datedWork = {
            ...datedWork,
            endDate
        };
    }

    console.log(datedWork);

    const prismaWork = await prisma.work.create({
        data: datedWork
    });

    return reply
            .status(201)
            // .send({
            //     "id": "00000000-0000-0000-0000-000000000000",
            //     ...work
            // });
            .send(datedWork);
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