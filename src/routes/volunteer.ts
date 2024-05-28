import {
    FastifyInstance,
    FastifyRequest,
    FastifyReply
} from 'fastify';

import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { prisma } from '../lib/prisma';

// ###
// # RAW
// ###

export const volunteerIdSchema = z.object({
    id: z.string().uuid(),
});
export const volunteerObjectSchema = z.object({
    title: z.string(),
    institution: z.string(),
    startDate: z.string().datetime({ offset: true}),
    endDate: z.string().datetime({ offset: true}).optional().nullable(),
    location: z.string(),
    duration: z.number().int(),
    verifyUrl: z.string().url()
});
export const volunteerObjectSchemaWithId = volunteerIdSchema.merge(volunteerObjectSchema);

export const getVolunteersResponseSchema = {
    200: z.array(volunteerObjectSchemaWithId),
    204: z.array(volunteerObjectSchemaWithId).optional()
};

export const getVolunteersSchema = {
    summary: "Get all volunteer",
    tags: ["volunteer"],
    response: getVolunteersResponseSchema
};

const getVolunteers = async (request: FastifyRequest, reply: FastifyReply) => {
    const volunteers = await prisma.volunteer.findMany({});

    if(volunteers.length === 0) reply.code(204).send([]);

    reply.send(volunteers);
}

export async function volunteer(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/volunteers',
            { schema: getVolunteersSchema },
            getVolunteers)
        
}