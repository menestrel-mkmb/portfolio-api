import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "../lib/prisma";

import { NotFoundError } from "../errors/not-found";
import { DuplicateEntityError } from "../errors/duplicate-entity";
import { BadRequestError } from "../errors/bad-request";

// ###
// # RAW
// ###

export const educationIdSchema = z.object({
    id: z.string().uuid(),
});
export const educationObjectSchema = z.object({
    title: z.string(),
    institution: z.string(),
    startDate: z.string().datetime({ offset: true}),
    endDate: z.string().datetime({ offset: true}).optional().nullable(),
    location: z.string(),
    duration: z.number().int(),
    verifyUrl: z.string().url()
});
export const educationObjectSchemaWithId = educationIdSchema.merge(educationObjectSchema);

// ###
// # METHODS
// ###

export const getEducationsResponseSchema = {
    200: z.array(educationObjectSchemaWithId),
    204: z.array(educationObjectSchemaWithId).optional()
};
export const getEducationsSchema = {
    summary: "Get all education",
    tags: ["education"],
    response: getEducationsResponseSchema
};

const getEducations = async (request: FastifyRequest, reply: FastifyReply) => {
    const prismaEducations = await prisma.education.findMany({});
    const datedEducations = prismaEducations.map(education => ({
        ...education,
        startDate: education.startDate.toISOString(),
        endDate: education.endDate ? education.endDate.toISOString() : null
    }));

    const educations = (getEducationsResponseSchema[200]).parse(datedEducations);
    if(educations.length === 0) throw new NotFoundError("No education found");

    reply.send(educations);
}

export const getEducationDetailsResponseSchema = {
    200: educationObjectSchemaWithId
};
export const getEducationDetailsSchema = {
    summary: "Get education details",
    tags: ["education"],
    params: educationIdSchema,
    response: getEducationDetailsResponseSchema
};

const getEducationDetails = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = educationIdSchema.parse(request.params);

    const prismaEducation = await prisma.education.findUnique({ where: { id } });
    if(!prismaEducation) throw new NotFoundError("Education not found");

    const education = (getEducationDetailsResponseSchema[200]).parse({
        ...prismaEducation,
        startDate: prismaEducation.startDate.toISOString(),
        endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
    });

    reply.send(education);
};

export const postEducationRequestSchema = educationObjectSchema;
export const postEducationResponseSchema = {
    201: educationObjectSchemaWithId
};
export const postEducationSchema = {
    summary: "Create education",
    tags: ["education"],
    body: postEducationRequestSchema,
    response: postEducationResponseSchema
};

const postEducation = async (request: FastifyRequest, reply: FastifyReply) => {
    const education = postEducationRequestSchema.parse(request.body);

    const educationExists = await prisma.education.findUnique({
        where: { title: education.title }
    });
    if(educationExists) throw new DuplicateEntityError("Education already exists");

    const datedEducation = {
        ...education,
        startDate: new Date(education.startDate),
        endDate: education.endDate ? new Date(education.endDate) : null
    };

    if(!datedEducation) throw new BadRequestError("Invalid education data");
    if( datedEducation.endDate &&
        datedEducation.startDate > datedEducation.endDate
    ) throw new BadRequestError("Start date is after end date");

    const prismaEducation = await prisma.education.create({ data: education });

    const response = (postEducationResponseSchema[201]).parse({
        ...prismaEducation,
        startDate: prismaEducation.startDate.toISOString(),
        endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
    });

    reply.code(201).send(response);
};

export const patchEducationRequestSchema = educationObjectSchema.partial();
export const patchEducationResponseSchema = {
    200: educationObjectSchemaWithId
};
export const patchEducationSchema = {
    summary: "Update education",
    tags: ["education"],
    body: patchEducationRequestSchema,
    params: educationIdSchema,
    response: patchEducationResponseSchema
};

const patchEducation = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = educationIdSchema.parse(request.params);

    const educationExists = await prisma.education.findUnique({ where: { id } });
    if(!educationExists) throw new NotFoundError("Education not found");

    const education = patchEducationRequestSchema.parse(request.body);

    const nameExists = await prisma.education.findUnique({ where: { title: education.title } });
    if(nameExists) throw new DuplicateEntityError("Unique title already exists");

    const datedEducation = {
        ...education,
        startDate: education.startDate ? new Date(education.startDate) : null,
        endDate: education.endDate ? new Date(education.endDate) : null
    };

    if(!datedEducation) throw new BadRequestError("Invalid education data");
    if( datedEducation.endDate && datedEducation.startDate &&
        datedEducation.startDate > datedEducation.endDate
    ) throw new BadRequestError("Start date is after end date");

    const prismaEducation = await prisma.education.update({
        where: { id },
        data: education
    });

    reply.send({
        ...prismaEducation,
        startDate: prismaEducation.startDate ? prismaEducation.startDate.toISOString() : null,
        endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
    });
};

export const deleteEducationResponseSchema = {
    204: educationIdSchema
};
export const deleteEducationSchema = {
    summary: "Delete education",
    tags: ["education"],
    params: educationIdSchema,
    response: deleteEducationResponseSchema
};

const deleteEducation = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = educationIdSchema.parse(request.params);

    const educationExists = await prisma.education.findUnique({ where: { id } });
    if(!educationExists) throw new NotFoundError("Education not found. Maybe already deleted?");

    await prisma.education.delete({ where: { id } });

    reply.code(204).send();
};

export async function education(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/educations",
        { schema: getEducationsSchema },
        getEducations)
    .get("/educations/:id",
        { schema: getEducationDetailsSchema },
        getEducationDetails)
    .post("/educations",
        { schema: postEducationSchema },
        postEducation)
    .patch("/educations/:id",
        { schema: patchEducationSchema },
        patchEducation)
    .delete("/educations/:id",
        { schema: deleteEducationSchema },
        deleteEducation);
}