import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const getHealthStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
        status: "ok"
    });
}

export async function health(app: FastifyInstance) {
    app
        .get("/health",
            getHealthStatus);

}