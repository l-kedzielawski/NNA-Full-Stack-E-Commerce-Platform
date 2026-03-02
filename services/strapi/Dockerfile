# Strapi CMS – production build

FROM node:20-alpine AS deps
WORKDIR /srv/strapi
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /srv/strapi
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /srv/strapi
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 strapi

COPY --from=builder --chown=strapi:nodejs /srv/strapi/dist      ./dist
COPY --from=builder --chown=strapi:nodejs /srv/strapi/.strapi   ./.strapi
COPY --from=builder --chown=strapi:nodejs /srv/strapi/public    ./public
RUN mkdir -p ./public/uploads && chown strapi:nodejs ./public/uploads
COPY --from=builder --chown=strapi:nodejs /srv/strapi/package.json ./package.json
COPY --from=builder --chown=strapi:nodejs /srv/strapi/package-lock.json ./package-lock.json
COPY --from=builder --chown=strapi:nodejs /srv/strapi/config    ./config
COPY --from=builder --chown=strapi:nodejs /srv/strapi/database  ./database
COPY --from=builder --chown=strapi:nodejs /srv/strapi/tsconfig.json ./tsconfig.json
COPY --from=deps    --chown=strapi:nodejs /srv/strapi/node_modules ./node_modules

USER strapi
EXPOSE 1337

CMD ["npm", "run", "start"]
