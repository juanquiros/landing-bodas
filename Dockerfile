# Build the Vinext/Worker artifact once, then run only the generated server.
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Wrangler is intentionally kept because Vinext's generated server is a
# Cloudflare Worker and is served locally through Wrangler.
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node --from=build /app/dist ./dist

RUN mkdir -p .wrangler/state .sites-runtime && chown -R node:node .wrangler .sites-runtime
USER node

EXPOSE 3000
CMD ["npm", "run", "docker:start"]
