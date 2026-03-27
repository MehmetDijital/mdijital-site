import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@mdijital.io';
  const newPassword = process.env.ADMIN_INITIAL_PASSWORD || process.argv[3];

  if (!newPassword) {
    console.error('Set ADMIN_INITIAL_PASSWORD in env or pass as second argument');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    console.error('No user found with email:', email);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Password updated for:', user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
