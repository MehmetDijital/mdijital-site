import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be set in environment variables');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail.trim().toLowerCase() },
  });

  const normalizedEmail = adminEmail.trim().toLowerCase();

  if (existingAdmin) {
    if (existingAdmin.role === 'ADMIN' && existingAdmin.isActive) {
      console.log('Admin user exists, skipping:', normalizedEmail);
      return;
    }
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    });
    console.log('Admin user updated from env:', normalizedEmail);
    return;
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('Admin user created:', normalizedEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

