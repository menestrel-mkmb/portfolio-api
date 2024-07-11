# Build the Docker image
docker build -t my-fastify-api .

# Run the Docker container
docker run -d -p 3000:3000 my-fastify-api:v5