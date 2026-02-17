# =========================================
# Stage 1: Build the React/Vite Application
# =========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Clean install dependencies (reproducible builds)
RUN npm ci

# Copy source code
COPY . .

# Build the Vite application (outputs to /app/dist)
RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginxinc/nginx-unprivileged:alpine AS runner

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the static build output from builder stage
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
