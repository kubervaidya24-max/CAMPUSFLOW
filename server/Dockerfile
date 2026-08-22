# ==============================================================================
# CampusFlow Server — Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Dependencies & Build
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Run as unprivileged non-root node user
USER node

# Copy production node_modules and application source
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 5000

# Health check against health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) process.exit(1)});" || exit 1

CMD ["node", "src/server.js"]
