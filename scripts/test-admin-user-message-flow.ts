import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_USER_EMAIL = process.env.TEST_EMAIL ?? 'test-message-flow@mdijital.io';
const ADMIN_REPLY_TEXT = 'Test admin reply – message flow verified.';

async function main() {
  console.log('Testing admin -> user message flow (real DB, no mocks)\n');

  const user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error(`User not found: ${TEST_USER_EMAIL}. Create a user or set TEST_EMAIL.`);
    process.exit(1);
  }

  const created = await prisma.projectRequest.create({
    data: {
      userId: user.id,
      name: 'Message flow test',
      projectIdea: 'Verify admin reply reaches user.',
      timeHorizon: '1 week',
      status: 'Received',
    },
  });
  console.log('1. Created project request:', created.id);

  const updated = await prisma.projectRequest.update({
    where: { id: created.id },
    data: {
      status: 'Completed',
      adminNotes: ADMIN_REPLY_TEXT,
    },
  });
  if (updated.adminNotes !== ADMIN_REPLY_TEXT || updated.status !== 'Completed') {
    console.error('2. Update failed: adminNotes or status not set.');
    await prisma.projectRequest.delete({ where: { id: created.id } }).catch(() => {});
    process.exit(1);
  }
  console.log('2. Admin updated request with status=Completed and adminNotes.');

  const asUser = await prisma.projectRequest.findFirst({
    where: {
      id: created.id,
      user: { email: user.email },
    },
  });

  if (!asUser) {
    console.error('3. User cannot see request (findFirst returned null).');
    await prisma.projectRequest.delete({ where: { id: created.id } }).catch(() => {});
    process.exit(1);
  }
  if (asUser.adminNotes !== ADMIN_REPLY_TEXT) {
    console.error('3. User view missing adminNotes. Got:', asUser.adminNotes ?? '(null)');
    await prisma.projectRequest.delete({ where: { id: created.id } }).catch(() => {});
    process.exit(1);
  }
  if (asUser.status !== 'Completed') {
    console.error('3. User view wrong status. Got:', asUser.status);
    await prisma.projectRequest.delete({ where: { id: created.id } }).catch(() => {});
    process.exit(1);
  }
  console.log('3. User sees request with adminNotes and Completed status.');

  await prisma.projectRequest.delete({ where: { id: created.id } });
  console.log('\nAdmin -> user message flow OK (request created, updated, user sees reply, cleanup done).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
