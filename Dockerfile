FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl wget postgresql-client dcron su-exec

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=1024
ARG NEXT_PUBLIC_CALENDLY_LINK
ENV NEXT_PUBLIC_CALENDLY_LINK=$NEXT_PUBLIC_CALENDLY_LINK
RUN npx prisma@5.19.1 generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN mkdir -p /app/public /app/.next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/@types/bcryptjs ./node_modules/@types/bcryptjs
COPY --from=builder /app/node_modules/isomorphic-dompurify ./node_modules/isomorphic-dompurify
COPY --from=builder /app/node_modules/dompurify ./node_modules/dompurify
COPY --from=builder /app/node_modules/@types/dompurify ./node_modules/@types/dompurify
COPY --from=builder /app/node_modules/date-fns ./node_modules/date-fns
COPY --from=builder /app/node_modules/ioredis ./node_modules/ioredis
COPY --from=builder /app/node_modules/nodemailer ./node_modules/nodemailer
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib
RUN npm install -g tsx prisma@5.19.1 && \
    chmod +x /app/scripts/docker-entrypoint.sh

# Create backup directory
RUN mkdir -p /app/backups && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 755 /app/.next && \
    chmod +x /app/scripts/backup-db.ts

# Setup cron for database backups (daily at 2 AM)
# Setup crontab as root (crond runs as root)
RUN echo "0 2 * * * cd /app && /usr/bin/tsx scripts/backup-db.ts >> /app/backups/backup.log 2>&1" | crontab - || true

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health

CMD ["/app/scripts/docker-entrypoint.sh"]
