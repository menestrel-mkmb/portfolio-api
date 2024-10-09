import fastify from 'fastify';

import {
    serializerCompiler,
    validatorCompiler
} from "fastify-type-provider-zod";

import { errorHandler } from './error-handler';

import { health } from "./routes/health";
import { course } from "./routes/course";
import { work } from "./routes/work";
import { education } from './routes/education';
import { volunteer } from './routes/volunteer';

const app = fastify();
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.setErrorHandler(errorHandler);

app.register(health);
app.register(course);
app.register(work);
app.register(education);
app.register(volunteer);

app.listen({ port: Number(process.env.PORT) || 3000 })
    .then( (port) => {
        console.log(`server listening on port ${port}`);
    });