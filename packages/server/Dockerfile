# Server Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy all workspace package definitions
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
# If you have a CLI package, include it to satisfy workspace requirements
COPY packages/cli/package.json ./packages/cli/

# Install dependencies
RUN npm ci

# Copy server source code
COPY packages/server ./packages/server

# Build the server package
RUN npm run build --workspace=@env-manager/server

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
