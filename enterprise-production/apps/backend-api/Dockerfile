# ─── Multi-Stage Dockerfile for NestJS API (Optimized for AWS ECS Fargate) ───

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Non-root security user
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
