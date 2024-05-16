import { build } from "./app";

export const server = build(
    { logger: {
        level: "debug",
        transport: {
            target: "pino-pretty"
        },
    }
});

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    server.log.info(`server listening on ${address}`);
})