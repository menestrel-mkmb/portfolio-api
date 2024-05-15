import { FastifyInstance } from "fastify";

export async function health(app: FastifyInstance) {
    app.get("/health", () => {
        return { status: "ok" };
    });
}