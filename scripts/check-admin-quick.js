require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Checking admin with email:', adminEmail);
    
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        isActive: true, 
        emailVerified: true, 
        password: true 
      }
    });
    
    if (admin) {
      console.log('Admin found:');
      console.log('- ID:', admin.id);
      console.log('- Email:', admin.email);
      console.log('- Role:', admin.role);
      console.log('- Active:', admin.isActive);
      console.log('- Email Verified:', admin.emailVerified);
      console.log('- Has Password:', !!admin.password);
    } else {
      console.log('Admin user not found!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();