import fastify from 'fastify';

import { health } from "../routes/health";
import { course } from "../routes/course";

const app = fastify();

app.register(health);

app.register(course);

app.listen({ port: 3000 })
    .then( () => {
        console.log("server listening on port 3000");
    });