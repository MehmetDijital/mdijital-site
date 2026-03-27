const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'mert@pohjalab.fi';
const TEST_PASSWORD = 'Test1234!';
const TEST_NAME = 'Mert Test';

async function testRegistration() {
  console.log('🚀 Testing User Registration and Email Verification...');
  console.log('==========================================\n');
  
  console.log('📋 Configuration:');
  console.log(`   BASE_URL: ${BASE_URL}`);
  console.log(`   TEST_EMAIL: ${TEST_EMAIL}`);
  console.log(`   TEST_PASSWORD: ${TEST_PASSWORD}`);
  console.log(`   TEST_NAME: ${TEST_NAME}`);
  console.log('');

  try {
    console.log('📝 Step 1: Registering user...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
        locale: 'tr',
      }),
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      if (registerData.error === 'User already exists') {
        console.log('ℹ️  User already exists, continuing with verification...');
      } else {
        throw new Error(registerData.error || 'Registration failed');
      }
    } else {
      console.log('✅ Registration successful');
      console.log(`   User ID: ${registerData.id}`);
      console.log(`   Email: ${registerData.email}`);
      console.log(`   Name: ${registerData.name}`);
    }

    let verificationCode: string | null = null;

    if (registerData.devMode && registerData.verificationCode) {
      verificationCode = registerData.verificationCode;
      console.log(`\n🔐 Verification Code (Dev Mode): ${verificationCode}`);
    } else {
      console.log('\n📧 Step 2: Requesting verification code...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sendCodeResponse = await fetch(`${BASE_URL}/api/auth/verify-email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          locale: 'tr',
        }),
      });

      const sendCodeData = await sendCodeResponse.json();

      if (!sendCodeResponse.ok) {
        throw new Error(sendCodeData.error || 'Failed to send verification code');
      }

      console.log('✅ Verification code sent');

      if (sendCodeData.devMode && sendCodeData.verificationCode) {
        verificationCode = sendCodeData.verificationCode;
        console.log(`\n🔐 Verification Code (Dev Mode): ${verificationCode}`);
      } else if (sendCodeData.verificationCode) {
        verificationCode = sendCodeData.verificationCode;
        console.log(`\n🔐 Verification Code: ${verificationCode}`);
      } else {
        console.log('📧 Check your email inbox for the verification code.');
        console.log('   If email is not received, check Docker logs.');
      }
    }

    if (!verificationCode) {
      console.log('\n⚠️  Verification code not available in response.');
      console.log('   Please check:');
      console.log('   1. Docker logs: docker logs mdijital-app --tail=50');
      console.log('   2. Email inbox: ' + TEST_EMAIL);
      console.log('   3. SMTP configuration in .env file');
      process.exit(1);
    }

    console.log(`\n🔐 Step 3: Verifying email with code: ${verificationCode}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify-email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        code: verificationCode,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || 'Verification failed');
    }

    console.log('✅ Email verified successfully');

    console.log('\n🔑 Step 4: Testing login...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        rememberMe: false,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(loginData.error || 'Login failed');
    }

    console.log('✅ Login successful');
    console.log(`   Redirect URL: ${loginData.url || 'N/A'}`);

    console.log('\n✅ All tests passed!');
    console.log('==========================================');
    console.log('\n📝 Summary:');
    console.log(`   ✅ User registered: ${TEST_EMAIL}`);
    console.log(`   ✅ Email verified with code: ${verificationCode}`);
    console.log(`   ✅ Login successful`);
    
  } catch (error: any) {
    console.error('\n❌ Test failed:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check Docker logs: docker logs mdijital-app --tail=50');
    console.error('   2. Verify SMTP configuration in .env file');
    console.error('   3. Check email inbox: ' + TEST_EMAIL);
    console.error('   4. Ensure Docker container is running: docker ps');
    process.exit(1);
  }
}

testRegistration();
