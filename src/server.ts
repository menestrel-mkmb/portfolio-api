import fastify from 'fastify';

import { health } from "../routes/health";

const app = fastify();

app.register(health);

app.listen({ port: 3000 })
    .then( () => {
        console.log("server listening on port 3000");
    });