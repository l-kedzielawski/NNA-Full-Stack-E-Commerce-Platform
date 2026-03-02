# Medusa backend - production build
FROM node:20-alpine AS deps
WORKDIR /srv/medusa
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
FROM node:20-alpine AS builder
WORKDIR /srv/medusa
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
FROM node:20-alpine AS runner
# medusa start must run from the compiled output directory where medusa-config.js lives
WORKDIR /srv/medusa/.medusa/server
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa
# Copy built artifacts
COPY --from=builder --chown=medusa:nodejs /srv/medusa/.medusa /srv/medusa/.medusa
COPY --from=builder --chown=medusa:nodejs /srv/medusa/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /srv/medusa/package-lock.json ./package-lock.json
# Install only production deps in runner (smaller image)
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
# Static admin files served by Medusa itself (Medusa looks for /static relative to cwd)
COPY --from=builder --chown=medusa:nodejs /srv/medusa/static ./static
USER medusa
EXPOSE 9000
CMD ["node_modules/.bin/medusa", "start"]

