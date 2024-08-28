# Step 1: Use the official Node.js image as the base image
FROM node:16-alpine AS build-stage

# Step 2: Set the working directory inside the Docker container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your application code
COPY . .

# Step 6: Build the Vue.js application for production
RUN npm run build

# Step 7: Use the official Nginx image to serve the built application
FROM nginx:stable-alpine AS production-stage

# Step 8: Copy the custom nginx.conf to the /etc/nginx/conf.d directory
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Step 9: Copy the build output from the previous stage to the Nginx HTML directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Step 10: Expose port 80
EXPOSE 80

# Step 11: Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
