# Stage 1: Build Admin (Vue 2)
FROM node:16-alpine as build-admin
WORKDIR /app
COPY package.json package-lock.json ./
# Install dependencies
RUN npm config set registry https://registry.npmmirror.com
# Using legacy-peer-deps to avoid conflicts in old projects
RUN npm install --legacy-peer-deps --ignore-scripts
COPY . .
# Build
RUN npm run build

# Stage 2: Build Client (Vue 3)
FROM node:20-alpine as build-client
WORKDIR /app
COPY sky-client/package.json sky-client/package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install
COPY sky-client/ .
# Build
RUN npm run build

# Stage 3: Production Nginx
FROM nginx:alpine
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy Admin dist to /admin subdirectory (mapped to root in nginx.conf)
COPY --from=build-admin /app/dist /usr/share/nginx/html/admin

# Copy Client dist to /client subdirectory (mapped to /h5 in nginx.conf)
COPY --from=build-client /app/dist /usr/share/nginx/html/client

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]