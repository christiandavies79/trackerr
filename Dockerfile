# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production image
FROM python:3.11-slim

WORKDIR /app

# Install nginx and supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini ./alembic.ini

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Copy nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
