# Use an official Node.js runtime as the base image
FROM node:14

# Install the PostgreSQL client tools
RUN apt-get update 

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . /app

# Import the environment variables
ENV PORT=${APP_PORT}

# Expose the port on which web service is running
EXPOSE ${PORT}

CMD ["node","server.js"]
