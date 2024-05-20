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
    startDate: z.date(),
    endDate: z.date().optional(),
    description: z.string(),
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

export async function work(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get("/works",
            {schema: getWorksSchema},
            getWorks)
        // .get("/works/:id",
        //     {schema: getWorkDetailsSchema},
        //     getWorkDetails)
        // .post("/works",
        //     {schema: postWorkSchema},
        //     postWork)
        // .patch("/works/:id",
        //     {schema: patchWorkSchema},
        //     patchWork)
        // .delete("/works/:id",
        //     {schema: deleteWorkSchema},
        //     deleteWork);
}