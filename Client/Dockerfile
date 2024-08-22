# Stage 1: Build the application
FROM node:lts AS build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
# Copy the built files from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# COPY .env /usr/share/nginx/html/.env

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
