# Multi-stage production build for Render and container environments
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies required to build frontend & backend bundle
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend and bundled server (creates /app/dist/...)
RUN npm run build

# Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files for production dependency install
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets and server bundle from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Run compiled Express production server directly
CMD ["node", "dist/server.cjs"]
