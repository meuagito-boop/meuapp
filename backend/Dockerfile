# Stage 1: Development image
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npm run prisma:generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# Stage 2: Build
FROM development AS builder

RUN npm run build
RUN npm prune --omit=dev

# Stage 3: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD sh -c 'wget -q -O /dev/null "http://127.0.0.1:${PORT:-3001}/health" || exit 1'

CMD ["npm", "run", "start:prod"]
