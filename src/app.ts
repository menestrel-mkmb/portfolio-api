import fastify from 'fastify';
import {
    serializerCompiler,
    validatorCompiler
} from "fastify-type-provider-zod";

import { health } from "./routes/health";
import { course } from "./routes/course";


export function build(opts={}) {
    const app = fastify(opts);
    app.setSerializerCompiler(serializerCompiler);
    app.setValidatorCompiler(validatorCompiler);

    app.register(health);
    app.register(course);
    
    return app;
}