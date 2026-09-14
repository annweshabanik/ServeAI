import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding for ServeAI POS SuperAdmin & Tenants...');

  const passwordHash = await bcrypt.hash('superadmin123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create SuperAdmin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@serveai.com' },
    update: {
      role: Role.SUPERADMIN,
    },
    create: {
      name: 'ServeAI SuperAdmin',
      email: 'superadmin@serveai.com',
      passwordHash: passwordHash,
      role: Role.SUPERADMIN,
    },
  });
  console.log('✅ SuperAdmin User created:', superAdmin.email);

  // 2. Create Tenant 1: Grand Lotus Hotel
  let tenant1 = await prisma.tenant.findFirst({
    where: { name: 'Grand Lotus Hotel' },
  });

  if (!tenant1) {
    tenant1 = await prisma.tenant.create({
      data: {
        name: 'Grand Lotus Hotel',
        slug: 'grand-lotus-hotel',
        address: 'MG Road, Bengaluru',
        phone: '+91 9876543210',
        isActive: true,
      },
    });
    console.log('✅ Tenant 1 Created:', tenant1.name, 'ID:', tenant1.id);
  }

  // Create Admin for Tenant 1
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@serveai.com' },
    update: { tenantId: tenant1.id, role: Role.ADMIN },
    create: {
      name: 'Lotus Admin User',
      email: 'admin@serveai.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      tenantId: tenant1.id,
    },
  });
  console.log('  -> Admin for Grand Lotus Hotel:', admin1.email, '(Tenant ID:', admin1.tenantId, ')');

  // 3. Create Tenant 2: Baba Ka Dhaba
  let tenant2 = await prisma.tenant.findFirst({
    where: { name: 'Baba Ka Dhaba' },
  });

  if (!tenant2) {
    tenant2 = await prisma.tenant.create({
      data: {
        name: 'Baba Ka Dhaba',
        slug: 'baba-ka-dhaba',
        address: 'Malviya Nagar, New Delhi',
        phone: '+91 9123456789',
        isActive: true,
      },
    });
    console.log('✅ Tenant 2 Created:', tenant2.name, 'ID:', tenant2.id);
  }

  // Create Admin for Tenant 2
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin@babakadhaba.com' },
    update: { tenantId: tenant2.id, role: Role.ADMIN },
    create: {
      name: 'Kanta Prasad',
      email: 'admin@babakadhaba.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      tenantId: tenant2.id,
    },
  });
  console.log('  -> Admin for Baba Ka Dhaba:', admin2.email, '(Tenant ID:', admin2.tenantId, ')');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
