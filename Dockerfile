# Use an official Node.js runtime as the base image
FROM node:14

# Install the PostgreSQL client tools
RUN apt-get update 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if exists) to the container
COPY package*.json ./ 

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Import the environment variables
ENV PORT=${APP_PORT}

# Expose the port on which web service is running
EXPOSE ${PORT}

CMD [ "npm", "run", "doc" ]

# alias sd='sudo docker'
# alias sdb='sudo docker build -t'
# alias sdc='sudo docker ps -a'
# alias sdi='sudo docker images -a'
# alias sdp='sudo docker system prune'
# alias sdpa='sudo docker system prune -a'
# alias sdr='sudo docker run'
# alias sdrm='sudo docker rmi'