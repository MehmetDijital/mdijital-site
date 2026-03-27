import { sendEmail, getVerificationEmailTemplate } from '../lib/ses';

const TEST_EMAIL = process.env.TEST_EMAIL || process.argv[2] || 'test@example.com';

async function testSMTP() {
  console.log('🚀 Testing SMTP Email Sending...');
  console.log('==========================================\n');
  
  console.log('📋 Configuration:');
  console.log(`   TEST_EMAIL: ${TEST_EMAIL}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  console.log(`   AWS_SES_FROM_EMAIL: ${process.env.AWS_SES_FROM_EMAIL || 'NOT SET'}`);
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER ? 'SET ✅' : 'NOT SET ❌'}`);
  console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? 'SET ✅' : 'NOT SET ❌'}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET ✅' : 'NOT SET ❌'}`);
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET ✅' : 'NOT SET ❌'}`);
  console.log('');

  const fromEmail = process.env.EMAIL_FROM || process.env.AWS_SES_FROM_EMAIL;
  if (!fromEmail) {
    console.error('❌ EMAIL_FROM or AWS_SES_FROM_EMAIL is not configured');
    console.error('   Please set EMAIL_FROM or AWS_SES_FROM_EMAIL in your .env file');
    process.exit(1);
  }

  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD;
  const hasAws = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasSmtp && !hasAws) {
    console.error('❌ Neither SMTP nor AWS credentials are configured');
    console.error('   Please configure either:');
    console.error('   - SMTP_HOST, SMTP_USER, SMTP_PASSWORD (for SMTP)');
    console.error('   - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (for AWS SDK)');
    process.exit(1);
  }

  try {
    const testCode = '123456';
    const { subject, htmlBody, textBody } = getVerificationEmailTemplate(testCode, 'tr');
    
    console.log('📧 Sending test email...');
    console.log(`   To: ${TEST_EMAIL}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Code: ${testCode}`);
    console.log('');
    
    await sendEmail({
      to: TEST_EMAIL,
      subject,
      body: textBody,
      htmlBody,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('');
    console.log('📬 Please check your inbox:');
    console.log(`   ${TEST_EMAIL}`);
    console.log('');
    console.log('🔐 Verification Code: 123456');
    console.log('');
    console.log('==========================================');
    console.log('✅ SMTP test completed successfully!');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Error sending email:');
    console.error(`   ${error.message}`);
    console.error('');
    
    if (error.name === 'MessageRejected') {
      console.error('💡 Possible issues:');
      console.error('   1. Email address is not verified in AWS SES');
      console.error('   2. AWS SES is in sandbox mode (only verified emails can receive)');
      console.error('   3. Check AWS SES console for verification status');
    } else if (error.name === 'InvalidClientTokenId') {
      console.error('💡 AWS credentials are invalid');
      console.error('   Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('💡 AWS secret key is incorrect');
      console.error('   Please check AWS_SECRET_ACCESS_KEY');
    }
    
    console.error('');
    process.exit(1);
  }
}

testSMTP();
