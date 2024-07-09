"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_fastify = __toESM(require("fastify"));
var import_fastify_type_provider_zod = require("fastify-type-provider-zod");

// src/routes/health.ts
var getHealthStatus = async (request, reply) => {
  return reply.send({
    status: "ok"
  });
};
async function health(app2) {
  app2.get(
    "/health",
    getHealthStatus
  );
}

// src/routes/course.ts
var import_zod = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/errors/duplicate-entity.ts
var DuplicateEntityError = class extends Error {
};

// src/errors/not-found.ts
var NotFoundError = class extends Error {
};

// src/routes/course.ts
var courseIdSchema = import_zod.z.object({
  id: import_zod.z.string().uuid()
});
var courseObjectSchema = import_zod.z.object({
  name: import_zod.z.string(),
  provedor: import_zod.z.string(),
  category: import_zod.z.string(),
  duration: import_zod.z.number(),
  verifyUrl: import_zod.z.string()
});
var courseObjectSchemaWithId = courseIdSchema.merge(courseObjectSchema);
var getCoursesResponseSchema = {
  200: import_zod.z.array(courseObjectSchemaWithId),
  204: import_zod.z.array(courseObjectSchemaWithId).optional()
};
var getCoursesSchema = {
  summary: "Get all courses",
  tags: ["courses"],
  response: getCoursesResponseSchema
};
var getCourses = async (request, reply) => {
  const prismaCourses = await prisma.course.findMany({});
  const courses = getCoursesResponseSchema[200].parse(prismaCourses);
  if (!courses) return reply.code(204).send(courses);
  return reply.send(courses);
};
var getCourseDetailsRequestSchema = courseIdSchema;
var getCourseDetailsResponseSchema = {
  200: courseObjectSchemaWithId
};
var getCourseDetailsSchema = {
  summary: "Get course details",
  tags: ["courses", "details"],
  params: getCourseDetailsRequestSchema,
  response: getCourseDetailsResponseSchema
};
var getCourseDetails = async (request, reply) => {
  const { id } = getCourseDetailsRequestSchema.parse(request.params);
  const courseExists = await prisma.course.findUnique({ where: { id } });
  if (!courseExists) throw new NotFoundError("Course not found");
  return reply.send(courseExists);
};
var postCourseRequestSchema = courseObjectSchema;
var postCourseResponseSchema = {
  201: courseObjectSchemaWithId
};
var postCourseSchema = {
  summary: "Create course",
  tags: ["courses"],
  body: postCourseRequestSchema,
  response: postCourseResponseSchema
};
var postCourses = async (request, reply) => {
  const course2 = postCourseRequestSchema.parse(request.body);
  const nameExists = await prisma.course.findUnique({ where: { name: course2.name } });
  if (nameExists) throw new DuplicateEntityError("Course name already exists");
  const prismaCourse = await prisma.course.create({ data: course2 });
  return reply.code(201).send(prismaCourse);
};
var patchCourseRequestSchema = courseObjectSchema.partial();
var patchCourseResponseSchema = {
  200: courseObjectSchemaWithId
};
var patchCourseSchema = {
  summary: "Update course",
  tags: ["courses"],
  params: courseIdSchema,
  body: patchCourseRequestSchema,
  response: patchCourseResponseSchema
};
var patchCourses = async (request, reply) => {
  const { id } = courseIdSchema.parse(request.params);
  const course2 = patchCourseRequestSchema.parse(request.body);
  const courseExists = await prisma.course.findUnique({ where: { id } });
  if (!courseExists) throw new NotFoundError("Course not found");
  const nameExists = await prisma.course.findUnique({ where: { name: course2.name } });
  if (nameExists) throw new DuplicateEntityError("Course name already exists");
  const prismaCourse = await prisma.course.update({
    where: { id },
    data: { ...course2 }
  });
  return reply.send(prismaCourse);
};
var deleteCourseRequestSchema = courseIdSchema;
var deleteCourseResponseSchema = {
  204: courseIdSchema.optional()
};
var deleteCourseSchema = {
  summary: "Delete course",
  tags: ["courses"],
  params: deleteCourseRequestSchema,
  response: deleteCourseResponseSchema
};
var deleteCourses = async (request, reply) => {
  const { id } = courseIdSchema.parse(request.params);
  const courseExists = await prisma.course.findUnique({ where: { id } });
  if (!courseExists) throw new NotFoundError("Course not found, maybe already deleted?");
  const deletedCourse = await prisma.course.delete({ where: { id } });
  return reply.code(204).send(deletedCourse);
};
async function course(app2) {
  app2.withTypeProvider().get(
    "/courses",
    { schema: getCoursesSchema },
    getCourses
  ).get(
    "/courses/:id",
    { schema: getCourseDetailsSchema },
    getCourseDetails
  ).post(
    "/courses",
    { schema: postCourseSchema },
    postCourses
  ).patch(
    "/courses/:id",
    { schema: patchCourseSchema },
    patchCourses
  ).delete(
    "/courses/:id",
    { schema: deleteCourseSchema },
    deleteCourses
  );
}

// src/routes/work.ts
var import_zod2 = require("zod");

// src/errors/bad-request.ts
var BadRequestError = class extends Error {
};

// src/routes/work.ts
var workIdSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid()
});
var workObjectSchema = import_zod2.z.object({
  name: import_zod2.z.string(),
  occupation: import_zod2.z.string(),
  description: import_zod2.z.string(),
  category: import_zod2.z.string(),
  statement: import_zod2.z.string().optional().nullable(),
  startDate: import_zod2.z.string().datetime({ offset: true }),
  endDate: import_zod2.z.string().datetime({ offset: true }).optional().nullable()
});
var workObjectSchemaWithId = workIdSchema.merge(workObjectSchema);
var getWorksArraySchema = import_zod2.z.array(workObjectSchemaWithId);
var getWorksResponseSchema = {
  200: getWorksArraySchema,
  204: getWorksArraySchema.optional()
};
var getWorksSchema = {
  summary: "Get all works",
  tags: ["works"],
  response: getWorksResponseSchema
};
var getWorks = async (request, reply) => {
  const prismaWorks = await prisma.work.findMany({});
  const works = prismaWorks.map((work2) => {
    return {
      ...work2,
      statement: work2.statement ? work2.statement : null,
      startDate: new Date(work2.startDate).toISOString(),
      endDate: work2.endDate ? new Date(work2.endDate).toISOString() : null
    };
  });
  if (!works) return reply.code(204).send(works);
  return reply.send(works);
};
var getWorkDetailsRequestSchema = workIdSchema;
var getWorkDetailsResponseSchema = {
  200: workObjectSchemaWithId
};
var getWorkDetailsSchema = {
  summary: "Get work details",
  tags: ["works", "details"],
  params: getWorkDetailsRequestSchema,
  response: getWorkDetailsResponseSchema
};
var getWorkDetails = async (request, reply) => {
  const { id } = getWorkDetailsRequestSchema.parse(request.params);
  let workExists = await prisma.work.findUnique({ where: { id } });
  if (!workExists) throw new NotFoundError("Work not found");
  return reply.send({
    ...workExists,
    startDate: new Date(workExists.startDate).toISOString(),
    endDate: workExists.endDate ? new Date(workExists.endDate).toISOString() : null
  });
};
var postWorkRequestSchema = workObjectSchema;
var postWorkResponseSchema = {
  201: workObjectSchemaWithId
};
var postWorkSchema = {
  summary: "Create new work",
  tags: ["works"],
  body: postWorkRequestSchema,
  response: postWorkResponseSchema
};
var postWork = async (request, reply) => {
  const work2 = postWorkRequestSchema.parse(request.body);
  const workExists = await prisma.work.findFirst({ where: { name: work2.name } });
  if (workExists) throw new DuplicateEntityError("Work already exists");
  const newWork = await prisma.work.create({
    data: {
      ...work2,
      statement: work2.statement ? work2.statement : null,
      startDate: new Date(work2.startDate).toISOString(),
      endDate: work2.endDate ? new Date(work2.endDate).toISOString() : null
    }
  });
  return reply.code(201).send({
    ...newWork,
    statement: newWork.statement ? newWork.statement : null,
    startDate: new Date(newWork.startDate).toISOString(),
    endDate: newWork.endDate ? new Date(newWork.endDate).toISOString() : null
  });
};
var patchWorkRequestSchema = workObjectSchema.partial();
var patchWorkResponseSchema = {
  200: workObjectSchemaWithId
};
var patchWorkSchema = {
  summary: "Update work",
  tags: ["works"],
  params: workIdSchema,
  body: patchWorkRequestSchema,
  response: patchWorkResponseSchema
};
var patchWork = async (request, reply) => {
  const { id } = workIdSchema.parse(request.params);
  const workExists = await prisma.work.findUnique({ where: { id } });
  if (!workExists) throw new NotFoundError("Work not found");
  const work2 = patchWorkRequestSchema.parse(request.body);
  const workNameExists = await prisma.work.findFirst({ where: { name: work2.name } });
  if (workNameExists) throw new DuplicateEntityError("Work name already exists");
  if (work2.startDate && work2.endDate && work2.startDate > work2.endDate) throw new BadRequestError("Start date is after end date");
  const updatedWork = await prisma.work.update({ where: { id }, data: work2 });
  return reply.send({
    ...updatedWork,
    statement: updatedWork.statement ? updatedWork.statement : null,
    startDate: new Date(updatedWork.startDate).toISOString(),
    endDate: updatedWork.endDate ? new Date(updatedWork.endDate).toISOString() : null
  });
};
var deleteWorkRequestSchema = workIdSchema;
var deleteWorkResponseSchema = {
  204: workObjectSchemaWithId.optional()
};
var deleteWorkSchema = {
  summary: "Delete work",
  tags: ["works"],
  params: deleteWorkRequestSchema,
  response: deleteWorkResponseSchema
};
var deleteWork = async (request, reply) => {
  const { id } = deleteWorkRequestSchema.parse(request.params);
  let workExists = await prisma.work.findUnique({ where: { id } });
  if (!workExists) throw new NotFoundError("Work not found");
  await prisma.work.delete({ where: { id } });
  return reply.code(204).send();
};
async function work(app2) {
  app2.withTypeProvider().get(
    "/works",
    { schema: getWorksSchema },
    getWorks
  ).get(
    "/works/:id",
    { schema: getWorkDetailsSchema },
    getWorkDetails
  ).post(
    "/works",
    { schema: postWorkSchema },
    postWork
  ).patch(
    "/works/:id",
    { schema: patchWorkSchema },
    patchWork
  ).delete(
    "/works/:id",
    { schema: deleteWorkSchema },
    deleteWork
  );
}

// src/routes/education.ts
var import_zod3 = __toESM(require("zod"));
var educationIdSchema = import_zod3.default.object({
  id: import_zod3.default.string().uuid()
});
var educationObjectSchema = import_zod3.default.object({
  title: import_zod3.default.string(),
  institution: import_zod3.default.string(),
  startDate: import_zod3.default.string().datetime({ offset: true }),
  endDate: import_zod3.default.string().datetime({ offset: true }).optional().nullable(),
  location: import_zod3.default.string(),
  duration: import_zod3.default.number().int(),
  verifyUrl: import_zod3.default.string().url()
});
var educationObjectSchemaWithId = educationIdSchema.merge(educationObjectSchema);
var getEducationsResponseSchema = {
  200: import_zod3.default.array(educationObjectSchemaWithId),
  204: import_zod3.default.array(educationObjectSchemaWithId).optional()
};
var getEducationsSchema = {
  summary: "Get all education",
  tags: ["education"],
  response: getEducationsResponseSchema
};
var getEducations = async (request, reply) => {
  const prismaEducations = await prisma.education.findMany({});
  const datedEducations = prismaEducations.map((education2) => ({
    ...education2,
    startDate: education2.startDate.toISOString(),
    endDate: education2.endDate ? education2.endDate.toISOString() : null
  }));
  const educations = getEducationsResponseSchema[200].parse(datedEducations);
  if (educations.length === 0) throw new NotFoundError("No education found");
  reply.send(educations);
};
var getEducationDetailsResponseSchema = {
  200: educationObjectSchemaWithId
};
var getEducationDetailsSchema = {
  summary: "Get education details",
  tags: ["education"],
  params: educationIdSchema,
  response: getEducationDetailsResponseSchema
};
var getEducationDetails = async (request, reply) => {
  const { id } = educationIdSchema.parse(request.params);
  const prismaEducation = await prisma.education.findUnique({ where: { id } });
  if (!prismaEducation) throw new NotFoundError("Education not found");
  const education2 = getEducationDetailsResponseSchema[200].parse({
    ...prismaEducation,
    startDate: prismaEducation.startDate.toISOString(),
    endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
  });
  reply.send(education2);
};
var postEducationRequestSchema = educationObjectSchema;
var postEducationResponseSchema = {
  201: educationObjectSchemaWithId
};
var postEducationSchema = {
  summary: "Create education",
  tags: ["education"],
  body: postEducationRequestSchema,
  response: postEducationResponseSchema
};
var postEducation = async (request, reply) => {
  const education2 = postEducationRequestSchema.parse(request.body);
  const educationExists = await prisma.education.findUnique({
    where: { title: education2.title }
  });
  if (educationExists) throw new DuplicateEntityError("Education already exists");
  const datedEducation = {
    ...education2,
    startDate: new Date(education2.startDate),
    endDate: education2.endDate ? new Date(education2.endDate) : null
  };
  if (!datedEducation) throw new BadRequestError("Invalid education data");
  if (datedEducation.endDate && datedEducation.startDate > datedEducation.endDate) throw new BadRequestError("Start date is after end date");
  const prismaEducation = await prisma.education.create({ data: education2 });
  const response = postEducationResponseSchema[201].parse({
    ...prismaEducation,
    startDate: prismaEducation.startDate.toISOString(),
    endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
  });
  reply.code(201).send(response);
};
var patchEducationRequestSchema = educationObjectSchema.partial();
var patchEducationResponseSchema = {
  200: educationObjectSchemaWithId
};
var patchEducationSchema = {
  summary: "Update education",
  tags: ["education"],
  body: patchEducationRequestSchema,
  params: educationIdSchema,
  response: patchEducationResponseSchema
};
var patchEducation = async (request, reply) => {
  const { id } = educationIdSchema.parse(request.params);
  const educationExists = await prisma.education.findUnique({ where: { id } });
  if (!educationExists) throw new NotFoundError("Education not found");
  const education2 = patchEducationRequestSchema.parse(request.body);
  const nameExists = await prisma.education.findUnique({ where: { title: education2.title } });
  if (nameExists) throw new DuplicateEntityError("Unique title already exists");
  const datedEducation = {
    ...education2,
    startDate: education2.startDate ? new Date(education2.startDate) : null,
    endDate: education2.endDate ? new Date(education2.endDate) : null
  };
  if (!datedEducation) throw new BadRequestError("Invalid education data");
  if (datedEducation.endDate && datedEducation.startDate && datedEducation.startDate > datedEducation.endDate) throw new BadRequestError("Start date is after end date");
  const prismaEducation = await prisma.education.update({
    where: { id },
    data: education2
  });
  reply.send({
    ...prismaEducation,
    startDate: prismaEducation.startDate ? prismaEducation.startDate.toISOString() : null,
    endDate: prismaEducation.endDate ? prismaEducation.endDate.toISOString() : null
  });
};
var deleteEducationResponseSchema = {
  204: educationIdSchema
};
var deleteEducationSchema = {
  summary: "Delete education",
  tags: ["education"],
  params: educationIdSchema,
  response: deleteEducationResponseSchema
};
var deleteEducation = async (request, reply) => {
  const { id } = educationIdSchema.parse(request.params);
  const educationExists = await prisma.education.findUnique({ where: { id } });
  if (!educationExists) throw new NotFoundError("Education not found. Maybe already deleted?");
  await prisma.education.delete({ where: { id } });
  reply.code(204).send();
};
async function education(app2) {
  app2.withTypeProvider().get(
    "/educations",
    { schema: getEducationsSchema },
    getEducations
  ).get(
    "/educations/:id",
    { schema: getEducationDetailsSchema },
    getEducationDetails
  ).post(
    "/educations",
    { schema: postEducationSchema },
    postEducation
  ).patch(
    "/educations/:id",
    { schema: patchEducationSchema },
    patchEducation
  ).delete(
    "/educations/:id",
    { schema: deleteEducationSchema },
    deleteEducation
  );
}

// src/error-handler.ts
var errorHandler = async (error, request, reply) => {
  request.log.error(error);
  console.log("constructor", error.constructor);
  let errorCode = null;
  switch (error.constructor) {
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
  if (!error) {
    console.log(error);
    return;
  }
  return reply.code(errorCode).send({
    message: errorCode === 500 ? "Internal server error" : error.message
  });
};

// src/server.ts
var app = (0, import_fastify.default)();
app.setSerializerCompiler(import_fastify_type_provider_zod.serializerCompiler);
app.setValidatorCompiler(import_fastify_type_provider_zod.validatorCompiler);
app.setErrorHandler(errorHandler);
app.register(health);
app.register(course);
app.register(work);
app.register(education);
app.listen({ port: 3e3 }).then(() => {
  console.log("server listening on port 3000");
});
