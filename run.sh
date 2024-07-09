# Build the Docker image
docker build -t my-fastify-api .

# Run the Docker container
docker run -p 3000:3000 my-fastify-api