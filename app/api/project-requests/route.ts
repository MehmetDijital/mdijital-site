import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { sendEmail, getProjectRequestConfirmationEmailTemplate } from '@/lib/ses';
import { z } from 'zod';
import { logApiError } from '@/lib/logger';
import { sanitizeName, sanitizeProjectIdea, sanitizeText } from '@/lib/sanitize';
import { handleCors, getCorsHeaders } from '@/lib/cors';
import { checkRateLimit } from '@/lib/security';
import { headers } from 'next/headers';

const requestSchema = z.object({
  name: z.string().min(1),
  projectIdea: z.string().min(1),
  productRange: z.string().optional(),
  timeHorizon: z.string().optional(),
  budgetRange: z.string().optional(),
  companyName: z.string().optional(),
  companyIndustry: z.string().optional(),
  companySector: z.string().optional(),
  companySize: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: Request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const session = await auth();

    if (!session?.user?.email) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const rateLimitKey = `project_request:${session.user.id}:${ipAddress}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 10, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      const origin = request.headers.get('origin');
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const body = await request.json();
    const validated = requestSchema.parse(body);

    // Sanitize inputs
    const sanitizedName = sanitizeName(validated.name);
    const sanitizedProjectIdea = sanitizeProjectIdea(validated.projectIdea);
    const sanitizedProductRange = validated.productRange ? sanitizeText(validated.productRange) : null;
    const sanitizedTimeHorizon = validated.timeHorizon ? sanitizeText(validated.timeHorizon) : null;
    const sanitizedBudgetRange = validated.budgetRange ? sanitizeText(validated.budgetRange) : null;
    const sanitizedCompanyName = validated.companyName ? sanitizeName(validated.companyName) : null;
    const sanitizedCompanyIndustry = validated.companyIndustry ? sanitizeText(validated.companyIndustry) : null;
    const sanitizedCompanySector = validated.companySector ? sanitizeText(validated.companySector) : null;
    const sanitizedCompanySize = validated.companySize ? sanitizeText(validated.companySize) : null;
    const sanitizedCompanyWebsite = validated.companyWebsite && validated.companyWebsite.trim() !== '' ? validated.companyWebsite.trim() : null;

    if (!sanitizedName || sanitizedName.length < 1) {
      return NextResponse.json(
        { error: 'Invalid name' },
        { status: 400 }
      );
    }

    if (!sanitizedProjectIdea || sanitizedProjectIdea.length < 1) {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        preferredLocale: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const projectRequest = await prisma.projectRequest.create({
      data: {
        userId: user.id,
        name: sanitizedName,
        projectIdea: sanitizedProjectIdea,
        productRange: sanitizedProductRange,
        timeHorizon: sanitizedTimeHorizon,
        budgetRange: sanitizedBudgetRange,
        companyName: sanitizedCompanyName,
        companyIndustry: sanitizedCompanyIndustry,
        companySector: sanitizedCompanySector,
        companySize: sanitizedCompanySize,
        companyWebsite: sanitizedCompanyWebsite,
        status: 'Received',
      },
    });

    const userLocale = user.preferredLocale || 'tr';

    try {
      const { subject, htmlBody, textBody } = getProjectRequestConfirmationEmailTemplate(userLocale);
      await sendEmail({
        to: user.email,
        subject,
        body: textBody,
        htmlBody,
      });
    } catch (emailError) {
      logApiError('/api/project-requests', emailError, { step: 'send_confirmation_email', email: user.email });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.AWS_SES_FROM_EMAIL;

    if (adminEmail) {
      const companyInfo = sanitizedCompanyName ? `
        <h3>Company Information</h3>
        <p><strong>Company Name:</strong> ${sanitizedCompanyName}</p>
        ${sanitizedCompanyIndustry ? `<p><strong>Industry:</strong> ${sanitizedCompanyIndustry}</p>` : ''}
        ${sanitizedCompanySector ? `<p><strong>Sector:</strong> ${sanitizedCompanySector}</p>` : ''}
        ${sanitizedCompanySize ? `<p><strong>Size:</strong> ${sanitizedCompanySize}</p>` : ''}
        ${sanitizedCompanyWebsite ? `<p><strong>Website:</strong> <a href="${sanitizedCompanyWebsite}">${sanitizedCompanyWebsite}</a></p>` : ''}
      ` : '';

      await sendEmail({
        to: adminEmail,
        subject: `New Project Request from ${sanitizedName}`,
        body: `Name: ${sanitizedName}\nProject Idea: ${sanitizedProjectIdea}\nProduct Range: ${sanitizedProductRange || 'Not specified'}\nTime Horizon: ${sanitizedTimeHorizon || 'Not specified'}\nBudget Range: ${sanitizedBudgetRange || 'Not specified'}\n${sanitizedCompanyName ? `\nCompany Information:\nCompany Name: ${sanitizedCompanyName}\nIndustry: ${sanitizedCompanyIndustry || 'Not specified'}\nSector: ${sanitizedCompanySector || 'Not specified'}\nSize: ${sanitizedCompanySize || 'Not specified'}\nWebsite: ${sanitizedCompanyWebsite || 'Not specified'}` : ''}\nUser: ${user.email}`,
        htmlBody: `
          <h2>New Project Request</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Project Idea:</strong></p>
          <p>${sanitizedProjectIdea.replace(/\n/g, '<br>')}</p>
          <p><strong>Product Range:</strong> ${sanitizedProductRange || 'Not specified'}</p>
          <p><strong>Time Horizon:</strong> ${sanitizedTimeHorizon || 'Not specified'}</p>
          <p><strong>Budget Range:</strong> ${sanitizedBudgetRange || 'Not specified'}</p>
          ${companyInfo}
          <p><strong>User:</strong> ${user.email}</p>
        `,
      });
    }

    const origin = request.headers.get('origin');
    return NextResponse.json(projectRequest, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    const origin = request.headers.get('origin');
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    logApiError('/api/project-requests', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}

