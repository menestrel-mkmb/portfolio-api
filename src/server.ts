import fastify from 'fastify';

const app = fastify();

app.get("/health", () => {
    return { status: "ok" };
});

app.listen({ port: 3000 })
    .then( () => {
        console.log("server listening on port 3000");
    });