import { FastifyInstance } from 'fastify';
import { BadRequestError } from './errors/bad-request';
import { DuplicateEntityError } from './errors/duplicate-entity';
import { NotFoundError } from './errors/not-found';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = async (error, request, reply) => {
    request.log.error(error);

    console.log('constructor', error.constructor);
    let errorCode = null;
    switch(error.constructor){
        case BadRequestError:
            errorCode = 400;
            break;
        case NotFoundError:
            errorCode = 404;
            break;
        case DuplicateEntityError:
            errorCode = 409;
            break;
        default:
            errorCode = 500;
    }

    if(!error) {console.log(error);return;}

    return reply.code(errorCode).send({
        message: errorCode === 500 ? "Internal server error" : error.message
    });
}