import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { prisma } from "../lib/prisma";

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

export const getAllEducationResponseSchema = {
    200: z.array(educationObjectSchemaWithId),
    204: z.array(educationObjectSchemaWithId).optional()
};
export const getAllEducationSchema = {
    summary: "Get all education",
    tags: ["education"],
    response: getAllEducationResponseSchema
};

const getAllEducation = async (request: FastifyRequest, reply: FastifyReply) => {
    const prismaEducations = await prisma.education.findMany({});
    const education = (getAllEducationResponseSchema[200]).parse(prismaEducations);

    if(education.length === 0) throw new Error("No education found");

    reply.send(education);
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

    if(!prismaEducation) throw new Error("Education not found");

    const education = (getEducationDetailsResponseSchema[200]).parse(prismaEducation);

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
        where: {
            title: education.title
        }
    });

    if(educationExists) throw new Error("Education already exists");

    const datedEducation = {
        ...education,
        startDate: new Date(education.startDate),
        endDate: education.endDate ? new Date(education.endDate) : null
    }

    if(!datedEducation) throw new Error("Invalid education data");
    if( datedEducation.endDate &&
        datedEducation.startDate > datedEducation.endDate
        ) throw new Error("Start date is after end date");

    const prismaEducation = await prisma.education.create({
        data: 
            education
    });

    const response = (postEducationResponseSchema[201]).parse({
        ...prismaEducation,
        startDate: prismaEducation.startDate.toISOString(),
        endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
    });

    reply.code(201).send(response);
};

export async function education(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/education",
        { schema: getAllEducationSchema },
        getAllEducation)
    .get("/education/:id",
        { schema: getEducationDetailsSchema },
        getEducationDetails)
    .post("/education",
        { schema: postEducationSchema },
        postEducation);
}