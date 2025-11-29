# Use official Node.js LTS image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary build dependencies
RUN apk add --no-cache python3 make g++ libc6-compat

# Install pnpm globally
RUN npm install -g pnpm 


# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
# Note: Font loading errors are non-fatal and will use fallback fonts
# Flowbite class generation warnings are also non-fatal
RUN pnpm build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose frontend port
EXPOSE 3030

# Start the server
CMD ["pnpm", "start"]
