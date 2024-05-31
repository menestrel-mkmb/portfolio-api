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

export const getVolunteerResponseSchema = {
    200: volunteerObjectSchemaWithId,
    204: volunteerObjectSchemaWithId.optional()
};
export const getVolunteerSchema = {
    summary: "Get a volunteer",
    tags: ["volunteer"],
    params: volunteerIdSchema,
    response: getVolunteerResponseSchema
};

const getVolunteer = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = volunteerIdSchema.parse(request.params);

    const volunteer = await prisma.volunteer.findUnique({ where: { id } });
    if(!volunteer) reply.code(204).send(null);

    reply.send({
        ...volunteer,
        startDate: volunteer?.startDate.toISOString(),
        endDate: volunteer?.endDate?.toISOString()
    });
};

export const postVolunteerRequestSchema = {
    body: volunteerObjectSchema
};
export const postVolunteerResponseSchema = {
    201: volunteerObjectSchemaWithId,
    209: volunteerObjectSchemaWithId
};
export const postVolunteerSchema = {
    summary: "Create a volunteer",
    tags: ["volunteer"],
    body: volunteerObjectSchema,
    response: postVolunteerResponseSchema
};

const postVolunteer = async (request: FastifyRequest, reply: FastifyReply) => {
    const volunteer = volunteerObjectSchema.parse(request.body);

    const datedVolunteer = {
        ...volunteer,
        startDate: new Date(volunteer.startDate),
        endDate: volunteer.endDate ? new Date(volunteer.endDate) : null
    };

    if(datedVolunteer.endDate &&
        datedVolunteer.endDate < datedVolunteer.startDate
    ) throw new BadRequestError("End date must be after start date");

    const prismaVolunteer = await prisma.volunteer.create({ data: datedVolunteer });

    reply.code(201).send({
        ...prismaVolunteer,
        startDate: prismaVolunteer.startDate.toISOString(),
        endDate: prismaVolunteer.endDate?.toISOString()
    });
};

const patchVolunteerRequestSchema = volunteerObjectSchema.partial();
const patchVolunteerResponseSchema = {
    200: volunteerObjectSchemaWithId,
    204: volunteerObjectSchemaWithId.optional()
};
const patchVolunteerSchema = {
    summary: "Update a volunteer",
    tags: ["volunteer"],
    params: volunteerIdSchema,
    body: patchVolunteerRequestSchema,
    response: patchVolunteerResponseSchema
};

const patchVolunteer = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = volunteerIdSchema.parse(request.params);
    
    const volunteer = patchVolunteerRequestSchema.parse(request.body);
    if(!volunteer) throw new BadRequestError("No data provided");

    const datedVolunteer = {
        ...volunteer,
        startDate: volunteer.startDate ? new Date(volunteer.startDate) : undefined,
        endDate: volunteer.endDate ? new Date(volunteer.endDate) : undefined
    };
    console.log(datedVolunteer);

    if(datedVolunteer.startDate && datedVolunteer.endDate &&
        datedVolunteer.endDate < datedVolunteer.startDate
    ) throw new BadRequestError("End date must be after start date");

    const prismaVolunteer = await prisma.volunteer.update({
        where: { id }, data: datedVolunteer
    });

    reply.send({
        ...prismaVolunteer,
        startDate: prismaVolunteer.startDate.toISOString(),
        endDate: prismaVolunteer.endDate?.toISOString()
    });
};

export async function volunteer(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/volunteers',
            { schema: getVolunteersSchema },
            getVolunteers)
        .get('/volunteers/:id',
            { schema: getVolunteerSchema },
            getVolunteer)
        .post('/volunteers',
            { schema: postVolunteerSchema },
            postVolunteer)
        .patch('/volunteers/:id',
            { schema: patchVolunteerSchema },
            patchVolunteer);
}