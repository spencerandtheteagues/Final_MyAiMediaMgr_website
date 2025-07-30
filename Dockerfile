# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY . .
WORKDIR /app/myaimediamgr_project/myaimediamgr-frontend
RUN npm install --legacy-peer-deps
RUN npm run build

# Stage 2: Build Backend
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
COPY myaimediamgr_project/myaimediamgr-backend/requirements.txt .
COPY myaimediamgr_project/myaimediamgr-backend/ .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Final Production Image
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin
COPY --from=backend-builder /app/backend/ .
COPY myaimediamgr_project/myaimediamgr-backend/entrypoint.sh .
RUN chmod +x /app/entrypoint.sh

# Copy frontend build
COPY --from=frontend-builder /app/myaimediamgr_project/myaimediamgr-frontend/dist ./src/static

ENV PYTHONPATH /app

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]

