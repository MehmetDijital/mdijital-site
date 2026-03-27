const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mdijital.io';
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD;
const BASE_URL = 'http://localhost:3000';

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Missing ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD in env');
    process.exit(1);
  }

  const res = await fetch(`${BASE_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Host: 'localhost',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL.trim().toLowerCase(),
      password: ADMIN_PASSWORD,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok && data.success) {
    console.log('OK: Admin login API returned 200 with success:true');
    process.exit(0);
  }

  console.error('FAIL: Admin login failed', res.status, data);
  process.exit(1);
}

main();
