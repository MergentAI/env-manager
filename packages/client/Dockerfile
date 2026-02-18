# Stage 1: Build the React Application
FROM node:20-alpine as builder

WORKDIR /app

# Copy root files for workspace resolution
COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/cli/package.json ./packages/cli/

# Install dependencies
RUN npm ci

# Copy client source code
COPY packages/client ./packages/client

# Build the client
# We set VITE_API_URL to /api because Nginx will proxy requests there
ENV VITE_API_URL=/api
RUN npm run build --workspace=@env-manager/client

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Copy our custom nginx configuration
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
