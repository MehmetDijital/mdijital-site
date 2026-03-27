import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'email-smtp.eu-central-1.amazonaws.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || 'AKIAT5Z5KYFQKBIPEEKI';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'BLLPCQoxAdpEVP8VFLMUEAiFOKHvTGJw8uVW9nfut9Hs';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@mdijital.io';
const TEST_EMAIL = process.argv[2] || 'mert@pohjalab.fi';

console.log('🔍 SMTP Configuration Test');
console.log('==========================================');
console.log(`SMTP_HOST: ${SMTP_HOST}`);
console.log(`SMTP_PORT: ${SMTP_PORT}`);
console.log(`SMTP_SECURE: ${SMTP_SECURE}`);
console.log(`SMTP_USER: ${SMTP_USER}`);
console.log(`EMAIL_FROM: ${EMAIL_FROM}`);
console.log(`TEST_EMAIL: ${TEST_EMAIL}`);
console.log('');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

async function testSMTP() {
  try {
    console.log('📧 Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    console.log('');

    console.log('📧 Step 2: Sending test email...');
    const testCode = '123456';
    const result = await transporter.sendMail({
      from: EMAIL_FROM,
      to: TEST_EMAIL,
      subject: 'M Dijital - E-posta Doğrulama Kodu (Test)',
      text: `Doğrulama kodunuz: ${testCode}`,
      html: `
        <h2>E-posta Doğrulama</h2>
        <p>Merhaba,</p>
        <p>E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
        <div style="background: #f4f4f4; border: 2px solid #39ff14; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #39ff14; letter-spacing: 8px; font-family: monospace;">${testCode}</div>
        </div>
        <p>Bu kod 10 dakika geçerlidir.</p>
        <p>M Dijital</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`   MessageId: ${result.messageId}`);
    console.log(`   From: ${EMAIL_FROM}`);
    console.log(`   To: ${TEST_EMAIL}`);
    console.log(`   Test Code: ${testCode}`);
    console.log('');
    console.log('📬 Please check your inbox:');
    console.log(`   ${TEST_EMAIL}`);
    console.log('');
    console.log('==========================================');
    console.log('✅ SMTP test completed successfully!');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Error:');
    console.error(`   ${error.message}`);
    console.error('');
    
    if (error.code === 'EAUTH') {
      console.error('💡 Authentication failed');
      console.error('   Check SMTP_USER and SMTP_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Connection failed');
      console.error('   Check SMTP_HOST and SMTP_PORT');
    } else if (error.response) {
      console.error('💡 SMTP Server Response:');
      console.error(`   ${error.response}`);
    }
    
    console.error('');
    process.exit(1);
  }
}

testSMTP();
