# Multi-stage production build for Render and container environments
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build Vite frontend and bundled server
RUN npm run build

# Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files for production dependency install
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
