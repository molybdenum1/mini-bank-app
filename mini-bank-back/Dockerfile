# Builder stage - install deps and build
FROM node:18-alpine AS builder
WORKDIR /app

# Install build deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# Runner stage - smaller production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled app and prod deps from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

# run as non-root user
USER node

# Start the compiled Nest application
CMD ["node", "dist/main.js"]
