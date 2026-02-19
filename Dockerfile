# Unified Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy all workspace package definitions
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/cli/package.json ./packages/cli/

# Install dependencies
RUN npm ci

# Copy client source code & Build Client
COPY packages/client ./packages/client
RUN npm run build --workspace=@env-manager/client

# Copy server source code & Build Server
COPY packages/server ./packages/server
RUN npm run build --workspace=@env-manager/server

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy only necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules

# Copy built server
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Copy built client
COPY --from=builder /app/packages/client/dist ./packages/client/dist

EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
