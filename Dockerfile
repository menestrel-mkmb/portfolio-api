# Use the official Node.js 18 image as the base image
FROM node:20-alpine AS base

# Set the working directory in the container
FROM base AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Compile n copy node_modules
FROM base AS build
WORKDIR /usr/src/app
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN npm i -D typescript @types/node tsx prisma
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Deploy configs
FROM base AS deploy
WORKDIR /usr/src/app
RUN apk add --no-cache bash sqlite
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
# COPY --from=build /usr/src/app/wait-for-it.sh ./wait-for-it.sh
# RUN chmod a+x ./wait-for-it.sh

# Set environment variables
FROM deploy AS prod
ENV DATABASE_URL=file:./dev.db

# Start the Fastify API
# CMD [ "./wait-for-it.sh", "sqlite3", "/prisma/dev.db", "--", "npm", "start" ]
CMD [ "npm", "start" ]