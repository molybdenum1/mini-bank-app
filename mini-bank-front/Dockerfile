# Multi-stage Dockerfile for building the Vite React app and serving with nginx

# --- builder ---
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies based on package.json
COPY package*.json ./
RUN npm ci --silent --no-audit --progress=false

# Copy source and build
COPY . .
RUN npm run build

# --- production image ---
FROM nginx:stable-alpine

# Remove default server definition (optional) and replace with SPA-friendly config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
