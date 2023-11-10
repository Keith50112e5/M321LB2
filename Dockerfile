# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the all files to the container
COPY . ./

# Install the dependencies
RUN npm i

# Start the server when the container starts
CMD npm start
