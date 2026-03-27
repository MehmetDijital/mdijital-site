import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') || 'tr').toLowerCase() === 'en' ? 'en' : 'tr';
    const jobs = await prisma.jobPosting.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    const items = jobs.map((j) => ({
      id: j.id,
      title: locale === 'en' ? j.titleEN : j.titleTR,
      description: locale === 'en' ? j.descriptionEN : j.descriptionTR,
      location: j.location,
      jobType: j.jobType,
      createdAt: j.createdAt.toISOString(),
    }));
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
