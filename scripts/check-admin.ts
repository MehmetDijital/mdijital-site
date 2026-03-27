import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@mdijital.io';
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true, role: true, emailVerified: true, isActive: true, createdAt: true },
  });
  if (!user) {
    console.log('No user found with email:', email);
    process.exit(0);
  }
  console.log(JSON.stringify(user, null, 2));
  console.log('Role:', user.role, '| Active:', user.isActive, '| Email verified:', user.emailVerified);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
