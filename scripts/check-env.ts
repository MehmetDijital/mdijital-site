const MIN_SECRET_LENGTH = 32;

function check(): boolean {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || typeof secret !== 'string') {
    console.error('NEXTAUTH_SECRET is not set. Set it in your environment.');
    return false;
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    console.error(
      `NEXTAUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters for security.`
    );
    return false;
  }
  return true;
}

if (!check()) {
  process.exit(1);
}
