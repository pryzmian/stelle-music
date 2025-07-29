# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm@10.13.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code and configuration files
COPY /src ./src
COPY /prisma ./prisma
COPY tsconfig.json seyfert.config.mjs ./

# Generate Prisma client
RUN pnpm generate

# Build the TypeScript application
RUN pnpm build

# Remove dev dependencies to reduce image size
RUN pnpm prune --prod --ignore-scripts

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S stelle -u 1001

# Change ownership of app directory
RUN chown -R stelle:nodejs /app
USER stelle

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/cache

# Start the application
CMD ["pnpm", "start"]
