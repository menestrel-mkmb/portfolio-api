# Build the Docker image
docker build -t portfolio-api .

# Run the Docker container
docker run -d --network host -p 3000:3000 portfolio-api:latest