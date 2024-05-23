import { FastifyInstance } from 'fastify';
import { BadRequestError } from './errors/bad-request';
import { DuplicateEntityError } from './errors/duplicate-entity';
import { NotFoundError } from './errors/not-found';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = async (error, request, reply) => {
    request.log.error(error);

    console.log('constructor', error.constructor);
    switch(error.constructor){
        case BadRequestError:
            return reply.code(400).send({
                message: error.message
            });
        case NotFoundError:
                return reply.code(404).send({
                    message: error.message
                });
        case DuplicateEntityError:
            return reply.code(409).send({
                message: error.message
            });
        default:
            return reply.code(500).send({
                message: "Internal server error",
                "internalMessage": error.message
            });
    }
}