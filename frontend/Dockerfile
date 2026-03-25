# ============================================
# Frontend Dockerfile — Multi-stage build
# Stage 1: Node build
# Stage 2: Nginx static server
# ============================================

# --- Build stage ---
FROM node:18 AS build
WORKDIR /app

# Ensure we have a clean slate for the target environment
COPY package.json ./
RUN rm -f package-lock.json && npm install

# Copy source and build
COPY . .
RUN ls -la node_modules/.bin && ./node_modules/.bin/vite build

# --- Runtime stage ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx content
RUN rm -rf ./*

# Copy built frontend
COPY --from=build /app/dist .

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
