# ============================================
# PRODUCTION MULTI-STAGE DOCKERFILE
# ============================================
# This Dockerfile uses multi-stage builds to create an optimized production image:
# - Stage 1 (builder): Installs ALL dependencies + builds the app
# - Stage 2 (production): Only includes runtime files + production dependencies
# Result: Smaller, faster, more secure production image

# ============================================
# STAGE 1: Builder - Build the application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (needed for compiling native Node.js modules)
# python3, make, g++ are required for packages like bcrypt, node-gyp, etc.
RUN apk add --no-cache python3 make g++ libc6-compat && \
    npm install -g pnpm@latest

# Copy package files first (Docker layer caching optimization)
# If package.json doesn't change, Docker reuses this layer
COPY package.json pnpm-lock.yaml ./
# Copy pnpm workspace config if it exists (optional)
COPY pnpm-workspace.yaml* ./

# Install ALL dependencies (including devDependencies needed for build)
# Dev dependencies include: TypeScript, ESLint, Tailwind, etc.
RUN pnpm install --frozen-lockfile

# Copy all remaining source files (config files, src, public, etc.)
# .dockerignore ensures node_modules and .next are excluded
COPY . .

# Build the Next.js application for production
# This creates optimized production bundles in .next folder
RUN pnpm build

# ============================================
# STAGE 2: Production - Runtime only
# ============================================
FROM node:20-alpine AS production

# Set production environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Install pnpm (needed to run pnpm commands)
RUN npm install -g pnpm@latest && \
    npm cache clean --force

# Copy package files (needed to install production dependencies)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
# Copy pnpm workspace config if it exists
COPY --from=builder /app/pnpm-workspace.yaml* ./

# Copy built application files from builder stage
# .next folder contains the compiled Next.js application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Install ONLY production dependencies (excludes devDependencies)
# This significantly reduces image size (no TypeScript, ESLint, etc.)
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune && \
    rm -rf /tmp/* /var/cache/apk/* ~/.npm ~/.pnpm-store

# Expose port (matching package.json start script)
EXPOSE 3030

# Start the production Next.js server
CMD ["pnpm", "start"]
