import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mdijital.io';
const ADMIN_HOST = 'https://admin.mdijital.io';

async function main() {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const testPassword = process.argv[2];

  console.log('=== Admin dashboard check ===');
  console.log('Admin URL (production):', ADMIN_HOST);
  console.log('Admin route: open', ADMIN_HOST, '-> login then dashboard');
  console.log('');

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, isActive: true, emailVerified: true, password: true },
  });

  if (!user) {
    console.log('Admin user: NOT FOUND');
    console.log('Run: npx tsx scripts/init-admin.ts (requires ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in .env)');
    process.exit(1);
  }

  console.log('Admin user:', user.email);
  console.log('  role:', user.role);
  console.log('  isActive:', user.isActive);
  console.log('  emailVerified:', user.emailVerified);
  console.log('  hasPassword:', user.password ? 'yes' : 'NO (will cause 401)');

  if (!user.isActive || !user.emailVerified || !user.password) {
    console.log('');
    console.log('Fix: run init-admin to sync from .env, or reset password:');
    console.log("  npx tsx scripts/reset-admin-password.ts", email, "'YOUR_PASSWORD'");
  }

  if (user.role !== 'ADMIN') {
    console.log('');
    console.log('Role is not ADMIN. Run init-admin or update user role in DB.');
  }

  if (testPassword) {
    const ok = user.password ? await bcrypt.compare(testPassword, user.password) : false;
    console.log('');
    console.log('Password check:', ok ? 'OK' : 'FAILED (this causes 401)');
    if (!ok && user.password) {
      console.log('Reset password on server:');
      console.log("  docker exec <APP_CONTAINER> npx tsx scripts/reset-admin-password.ts", email, "'V9tP3rLz7Fs2KpN4hGd6Bcffkd0'");
    }
  }

  console.log('');
  console.log('Test login from server (after fixing password):');
  console.log('  curl -s -X POST', ADMIN_HOST + '/api/auth/admin/login', '\\');
  console.log("    -H 'Content-Type: application/json' \\");
  console.log("    -H 'Host: admin.mdijital.io' \\");
  console.log("    -d '{\"email\":\"" + email + "\",\"password\":\"YOUR_PASSWORD\"}'");
  console.log('');
  console.log('Expected 200: {"success":true,"user":{...}}');
  console.log('401 = wrong password or missing hash -> run reset-admin-password on server');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
