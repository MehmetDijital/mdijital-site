
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = 'Test1234!';
const TEST_NAME = 'Test User';

let verificationCode: string | null = null;

async function testRegistration() {
  console.log('\n📝 Testing user registration via API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
        locale: 'tr',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === 'User already exists') {
        console.log('ℹ️  User already exists, continuing with verification...');
        return true;
      }
      throw new Error(data.error || 'Registration failed');
    }

    console.log('✅ Registration successful');
    console.log(`   User ID: ${data.id}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Name: ${data.name}`);

    if (data.devMode && data.verificationCode) {
      verificationCode = data.verificationCode;
      console.log(`\n🔐 Verification Code (Dev Mode): ${verificationCode}`);
    } else if (data.verificationCode) {
      verificationCode = data.verificationCode;
      console.log(`\n🔐 Verification Code: ${verificationCode}`);
    } else {
      console.log('\n📧 Verification email sent. Please check your inbox.');
      console.log('   If email is not received, check Docker logs for the code.');
    }

    return true;
  } catch (error: any) {
    console.error('❌ Registration failed:', error.message);
    return false;
  }
}

async function testSendVerificationCode() {
  console.log('\n📧 Requesting verification code via API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        locale: 'tr',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification code');
    }

    console.log('✅ Verification code sent');
    
    if (data.devMode && data.verificationCode) {
      verificationCode = data.verificationCode;
      console.log(`\n🔐 Verification Code (Dev Mode): ${verificationCode}`);
    } else if (data.verificationCode) {
      verificationCode = data.verificationCode;
      console.log(`\n🔐 Verification Code: ${verificationCode}`);
    } else {
      console.log('📧 Check your email inbox for the verification code.');
      console.log('   If email is not received, check Docker logs.');
    }

    return true;
  } catch (error: any) {
    console.error('❌ Failed to send verification code:', error.message);
    return false;
  }
}

async function testEmailVerification(code: string) {
  console.log('\n🔐 Testing email verification via API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed');
    }

    console.log('✅ Email verified successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔑 Testing user login via API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        rememberMe: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === 'EMAIL_NOT_VERIFIED') {
        throw new Error('Email not verified. Please verify your email first.');
      }
      throw new Error(data.error || 'Login failed');
    }

    console.log('✅ Login successful');
    console.log(`   Redirect URL: ${data.url || 'N/A'}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting authentication flow test (via API)...');
  console.log('==========================================');
  
  console.log('\n📋 Configuration:');
  console.log(`   BASE_URL: ${BASE_URL}`);
  console.log(`   TEST_EMAIL: ${TEST_EMAIL}`);
  console.log(`   TEST_PASSWORD: ${TEST_PASSWORD}`);
  console.log(`   TEST_NAME: ${TEST_NAME}`);

  try {
    const registrationResult = await testRegistration();
    if (!registrationResult) {
      console.error('\n❌ Registration test failed.');
      process.exit(1);
    }

    if (!verificationCode) {
      console.log('\n⏳ Verification code not received in response.');
      console.log('   Attempting to request verification code...');
      const sendCodeResult = await testSendVerificationCode();
      if (!sendCodeResult) {
        console.error('\n❌ Failed to get verification code.');
        console.error('   Please check:');
        console.error('   1. AWS SES configuration in Docker environment');
        console.error('   2. Docker logs: docker logs mdijital-app');
        console.error('   3. Email inbox for verification code');
        process.exit(1);
      }
    }

    if (!verificationCode) {
      console.error('\n❌ Verification code is required but not available.');
      console.error('   Please check Docker logs or your email inbox.');
      process.exit(1);
    }

    console.log(`\n⏳ Using verification code: ${verificationCode}`);
    console.log('   Waiting 2 seconds before verification...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const verificationResult = await testEmailVerification(verificationCode);
    if (!verificationResult) {
      console.error('\n❌ Email verification test failed.');
      process.exit(1);
    }

    console.log('\n⏳ Waiting 1 second before login...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const loginResult = await testLogin();
    if (!loginResult) {
      console.error('\n❌ Login test failed.');
      process.exit(1);
    }

    console.log('\n✅ All tests passed!');
    console.log('==========================================');
    console.log('\n📝 Summary:');
    console.log(`   ✅ User registered: ${TEST_EMAIL}`);
    console.log(`   ✅ Email verified with code: ${verificationCode}`);
    console.log(`   ✅ Login successful`);
    
  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

main();
