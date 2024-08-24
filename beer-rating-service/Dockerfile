# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json, package-lock.json, and tsconfig.json to the working directory
COPY package*.json tsconfig.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose the application port (adjust this to your server port if different)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
