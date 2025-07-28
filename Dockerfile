# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY myaimediamgr_project/myaimediamgr-frontend/package*.json ./
RUN npm install
COPY myaimediamgr_project/myaimediamgr-frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM python:3.11-slim AS backend-builder
WORKDIR /app/backend
COPY myaimediamgr_project/myaimediamgr-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY myaimediamgr_project/myaimediamgr-backend/ .

# Stage 3: Final Production Image
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend-builder /app/backend/ .
COPY --from=frontend-builder /app/frontend/dist ./src/static

# Expose port and run the application
EXPOSE 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "src.main:app"]
