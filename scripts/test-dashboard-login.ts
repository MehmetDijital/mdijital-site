import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'mert@pohjalab.fi';
const TEST_PASSWORD = 'Mert6378!';

async function testDashboardLogin() {
  console.log('Starting dashboard login test...');
  console.log(`Testing with email: ${TEST_EMAIL}`);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('\n1. Navigating to login page...');
    await page.goto(`${BASE_URL}/tr/auth/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    console.log('\n2. Filling login form...');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    await page.waitForTimeout(500);

    console.log('\n3. Submitting login form...');
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    console.log('\n4. Waiting for navigation...');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {
      console.log('Navigation timeout - checking current URL...');
    });

    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    if (finalUrl.includes('/dashboard')) {
      console.log('\n✓ SUCCESS: Redirected to dashboard!');
      
      console.log('\n5. Checking dashboard page content...');
      await page.waitForTimeout(1000);
      
      const pageContent = await page.textContent('body');
      const hasDashboardTitle = pageContent?.includes('Dashboard') || finalUrl.includes('dashboard');
      
      if (hasDashboardTitle) {
        console.log('✓ Dashboard page loaded successfully!');
        
        const errorMessages = await page.locator('.bg-red-500, [class*="error"], [class*="Error"]').count();
        if (errorMessages > 0) {
          const errorText = await page.locator('.bg-red-500, [class*="error"]').first().textContent();
          console.log(`⚠ Warning: Error message found: ${errorText}`);
        } else {
          console.log('✓ No error messages found on dashboard');
        }
        
        console.log('\n✓ TEST PASSED: Dashboard login successful!');
        return true;
      } else {
        console.log('✗ Dashboard page content not found');
        return false;
      }
    } else {
      console.log(`\n✗ FAILED: Not redirected to dashboard. Current URL: ${finalUrl}`);
      
      const errorMessage = await page.locator('.bg-red-500, [class*="error"]').first().textContent().catch(() => null);
      if (errorMessage) {
        console.log(`Error message: ${errorMessage}`);
      }
      
      const pageContent = await page.textContent('body');
      console.log(`Page content preview: ${pageContent?.substring(0, 200)}`);
      
      return false;
    }
  } catch (error: any) {
    console.error('\n✗ TEST FAILED with error:');
    console.error(error.message);
    console.error(error.stack);
    
    const screenshot = await page.screenshot({ path: 'test-dashboard-login-error.png' }).catch(() => null);
    if (screenshot) {
      console.log('Screenshot saved to: test-dashboard-login-error.png');
    }
    
    return false;
  } finally {
    await browser.close();
  }
}

testDashboardLogin()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
