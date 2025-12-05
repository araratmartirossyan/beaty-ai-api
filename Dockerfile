# Build stage
FROM node:20-alpine AS builder

# Install yarn
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

WORKDIR /app

# Copy package files, yarn lock, and yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies (using node-modules linker instead of PnP)
RUN yarn install --immutable 

# Copy source files and config
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN yarn build

# Production stage
FROM node:20-alpine

# Install yarn
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

WORKDIR /app

# Copy package files, yarn lock, and yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies based on NODE_ENV
# For development: install all dependencies (including devDependencies)
# For production: install all dependencies (yarn workspaces focus doesn't work for single packages)
RUN yarn install --immutable

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy any other necessary files
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]

