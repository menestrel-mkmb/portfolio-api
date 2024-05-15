import fastify from 'fastify';

import {
    serializerCompiler,
    validatorCompiler
} from "fastify-type-provider-zod";

import { health } from "../routes/health";
import { course } from "../routes/course";

const app = fastify();
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(health);
app.register(course);




app.listen({ port: 3000 })
    .then( () => {
        console.log("server listening on port 3000");
    });