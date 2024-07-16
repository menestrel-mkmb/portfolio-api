# Use the official Node.js 18 image as the base image
FROM node:18 AS base
RUN npm i -g pnpm

# Set the working directory in the container
FROM base AS deps
WORKDIR /usr/src/app
COPY package.json ./
RUN pnpm install

# Compile n copy node_modules
FROM base AS build
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN pnpm install -D typescript @types/node tsx prisma
RUN pnpm build
RUN pnpm prune --prod

# Deploy configs
FROM node:18-alpine3.19 AS deploy
WORKDIR /usr/src/app
RUN npm i -g pnpm prisma
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
RUN ls /usr/src/app
RUN pnpm prisma generate

# RUN apk add --no-cache bash
# COPY --from=build /usr/src/app/wait-for-it.sh ./wait-for-it.sh
# RUN chmod a+x ./wait-for-it.sh
# CMD [ "./wait-for-it.sh", "sqlite3", "/prisma/dev.db", "--", "npm", "start" ]

# Set environment variables
FROM deploy AS prod
ENV DATABASE_URL=file:./dev.db
EXPOSE 3000

# Start the Fastify API
CMD [ "pnpm", "start" ]