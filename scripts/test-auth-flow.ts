import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, getVerificationEmailTemplate } from '../lib/ses';

const prisma = new PrismaClient();

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = 'Test1234!';
const TEST_NAME = 'Test User';

async function cleanupTestUser() {
  console.log('\n🧹 Cleaning up test user...');
  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
    });

    if (user) {
      await prisma.emailVerification.deleteMany({
        where: { userId: user.id },
      });
      await prisma.user.delete({
        where: { email: TEST_EMAIL },
      });
      console.log('✅ Test user deleted');
    } else {
      console.log('ℹ️  Test user does not exist');
    }
  } catch (error) {
    console.error('❌ Error cleaning up:', error);
  }
}

async function testEmailSending() {
  console.log('\n📧 Testing email sending...');
  
  if (!process.env.AWS_SES_FROM_EMAIL) {
    console.error('❌ AWS_SES_FROM_EMAIL is not configured');
    return false;
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials are not configured');
    return false;
  }

  try {
    const testCode = '123456';
    const { subject, htmlBody, textBody } = getVerificationEmailTemplate(testCode, 'tr');
    
    await sendEmail({
      to: TEST_EMAIL,
      subject,
      body: textBody,
      htmlBody,
    });
    
    console.log('✅ Email sent successfully');
    console.log(`   To: ${TEST_EMAIL}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Code: ${testCode}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending email:', error.message);
    if (error.name === 'MessageRejected') {
      console.error('   Email address might not be verified in SES');
    }
    return false;
  }
}

async function testRegistration() {
  console.log('\n📝 Testing user registration...');
  
  try {
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    
    const user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        password: hashedPassword,
        name: TEST_NAME,
        emailVerified: false,
      },
    });

    console.log('✅ User created successfully');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);

    const code = crypto.randomInt(100000, 999999).toString();
    
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    console.log('✅ Verification code created');
    console.log(`   Code: ${code}`);

    const { subject, htmlBody, textBody } = getVerificationEmailTemplate(code, 'tr');
    
    await sendEmail({
      to: TEST_EMAIL,
      subject,
      body: textBody,
      htmlBody,
    });

    console.log('✅ Verification email sent');
    console.log(`   Check your inbox: ${TEST_EMAIL}`);
    console.log(`   Verification code: ${code}`);

    return { user, code };
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('❌ User already exists');
      const existingUser = await prisma.user.findUnique({
        where: { email: TEST_EMAIL },
      });
      if (existingUser) {
        const verification = await prisma.emailVerification.findFirst({
          where: { userId: existingUser.id },
          orderBy: { createdAt: 'desc' },
        });
        if (verification) {
          console.log(`   Existing verification code: ${verification.code}`);
          return { user: existingUser, code: verification.code };
        }
      }
    }
    console.error('❌ Error during registration:', error.message);
    throw error;
  }
}

async function testEmailVerification(code: string) {
  console.log('\n🔐 Testing email verification...');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new Error('Invalid or expired verification code');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    console.log('✅ Email verified successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error verifying email:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔑 Testing user login...');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    const isValid = await bcrypt.compare(TEST_PASSWORD, user.password);
    
    if (!isValid) {
      throw new Error('Invalid password');
    }

    console.log('✅ Login successful');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Error during login:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting authentication flow test...');
  console.log('==========================================');
  
  console.log('\n📋 Configuration:');
  console.log(`   TEST_EMAIL: ${TEST_EMAIL}`);
  console.log(`   AWS_SES_FROM_EMAIL: ${process.env.AWS_SES_FROM_EMAIL || 'NOT SET'}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);

  try {
    await cleanupTestUser();

    const emailTest = await testEmailSending();
    if (!emailTest) {
      console.error('\n❌ Email sending test failed. Please check your AWS SES configuration.');
      process.exit(1);
    }

    const registrationResult = await testRegistration();
    if (!registrationResult) {
      console.error('\n❌ Registration test failed.');
      process.exit(1);
    }

    console.log('\n⏳ Waiting 2 seconds before verification...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const verificationResult = await testEmailVerification(registrationResult.code);
    if (!verificationResult) {
      console.error('\n❌ Email verification test failed.');
      process.exit(1);
    }

    const loginResult = await testLogin();
    if (!loginResult) {
      console.error('\n❌ Login test failed.');
      process.exit(1);
    }

    console.log('\n✅ All tests passed!');
    console.log('==========================================');
    
    await cleanupTestUser();
    console.log('\n🧹 Test cleanup completed');
    
  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
