import { prisma } from '@/lib/prisma';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

function toNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function AdminPage() {
  try {
    const [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9] = await prisma.$transaction([
      prisma.user.count(),
      prisma.projectRequest.count(),
      prisma.projectRequest.count({ where: { status: 'Received' } }),
      prisma.projectRequest.count({ where: { status: 'In Progress' } }),
      prisma.projectRequest.count({ where: { status: 'Completed' } }),
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'New' } }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.newsletterSubscription.count({ where: { subscribed: true } }),
    ]);

    const stats = {
      totalUsers: toNumber(s0),
      totalRequests: toNumber(s1),
      received: toNumber(s2),
      inProgress: toNumber(s3),
      completed: toNumber(s4),
      totalContacts: toNumber(s5),
      newContacts: toNumber(s6),
      totalBlogPosts: toNumber(s7),
      publishedBlogPosts: toNumber(s8),
      newsletterSubscribers: toNumber(s9),
    };

    const recentRequestsRaw = await prisma.projectRequest.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    const recentContactsRaw = await prisma.contactSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const recentRequests = recentRequestsRaw.map((r) => ({
      id: r.id,
      name: r.name ?? '',
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      user: r.user ? { email: r.user.email, name: r.user.name ?? null } : { email: '', name: null },
    }));

    const recentContacts = recentContactsRaw.map((c) => ({
      id: c.id,
      name: c.name ?? null,
      email: c.email ?? null,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));

    return (
      <AdminDashboard
        stats={stats}
        recentRequests={recentRequests}
        recentContacts={recentContacts}
      />
    );
  } catch (error) {
    console.error('Admin page error:', error);
    throw error;
  }
}

