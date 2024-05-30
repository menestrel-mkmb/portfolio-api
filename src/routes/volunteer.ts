import {
    FastifyInstance,
    FastifyRequest,
    FastifyReply
} from 'fastify';

import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { prisma } from '../lib/prisma';
import { BadRequestError } from '../errors/bad-request';

// ###
// # RAW
// ###

export const volunteerIdSchema = z.object({
    id: z.string().uuid(),
});
export const volunteerObjectSchema = z.object({
    occupation: z.string(),
    organization: z.string(),
    startDate: z.string().datetime({ offset: true}),
    endDate: z.string().datetime({ offset: true}).optional().nullable(),
    category: z.string(),
    whatIDid: z.string(),
    whatILearned: z.string()
});
export const volunteerObjectSchemaWithId = volunteerIdSchema.merge(volunteerObjectSchema);

// ###
// # METHODS
// ###

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
    const datedVolunteers = volunteers.map(volunteer => ({
        ...volunteer,
        startDate: volunteer.startDate.toISOString(),
        endDate: volunteer.endDate?.toISOString()
    }));

    reply.send(datedVolunteers);
};

export async function volunteer(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/volunteers',
            { schema: getVolunteersSchema },
            getVolunteers)
        
}