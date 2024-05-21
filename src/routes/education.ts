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



export async function education(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    
}