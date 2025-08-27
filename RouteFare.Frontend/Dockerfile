# Multi-stage build for Angular frontend
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies (use npm ci for clean install without node_modules conflicts)
RUN npm ci

# Copy source code (but exclude node_modules to avoid platform conflicts)
COPY . .
# Remove any existing node_modules that might have Windows binaries
RUN rm -rf node_modules && npm ci

# Build Angular application for production with Docker configuration
RUN npm run build -- --configuration=docker

# Production stage with nginx
FROM nginx:alpine

# Copy built application to nginx html directory
COPY --from=build /app/dist/route-fare-frontend/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]