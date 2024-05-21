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
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional().nullable(),
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
}

export async function education(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/education",
        { schema: getAllEducationSchema },
        getAllEducation)
    .get("/education/:id",
        { schema: getEducationDetailsSchema },
        getEducationDetails)
}