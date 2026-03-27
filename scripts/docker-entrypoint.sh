#!/bin/sh
set -e

# Start cron daemon as root (required for dcron)
crond -f -d 8 &

# Ensure uploads dir exists and is writable by nextjs (for volume mount)
mkdir -p /app/public/uploads/blog /app/public/uploads/careers
chown -R nextjs:nodejs /app/public/uploads

# Switch to nextjs user and run the application
# Use migrate deploy if migrations exist, otherwise db push (both preserve data)
exec su-exec nextjs sh -c "
  npx tsx scripts/check-env.ts
  if npx prisma@5.19.1 migrate deploy --skip-generate 2>/dev/null; then
    echo '✅ Migrations applied'
  else
    echo '⚠️  No migrations found, syncing schema with db push (preserves data)...'
    npx prisma@5.19.1 db push --skip-generate
  fi
  npx tsx scripts/init-admin.ts
  node server.js
"
