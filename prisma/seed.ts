import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test employer accounts
  const passwordHash = await bcrypt.hash('password123', 10);

  const employer1 = await prisma.user.upsert({
    where: { email: 'employer@test.com' },
    update: {},
    create: {
      email: 'employer@test.com',
      passwordHash,
      role: 'EMPLOYER',
      commercialRegistrationNumber: '1234567890',
      commercialRegistrationImageUrl: '/uploads/cr-test-1.pdf',
      status: 'APPROVED', // Pre-approved test account
      employerProfile: {
        create: {
          companyName: 'Tech Solutions Inc.',
          contactPerson: 'John Manager',
          phone: '0501234567',
          companyWebsite: 'https://techsolutions.example.com',
        },
      },
    },
    include: {
      employerProfile: true,
    },
  });

  const employer2 = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      commercialRegistrationNumber: '0987654321',
      commercialRegistrationImageUrl: '/uploads/cr-test-2.pdf',
      status: 'APPROVED', // Pre-approved test account
      email: 'hr@company.com',
      passwordHash,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Global Innovations',
          contactPerson: 'Sarah Johnson',
          phone: '0509876543',
          companyWebsite: 'https://globalinnovations.example.com',
        },
      },
    },
    include: {
      employerProfile: true,
    },
  });

  console.log('✅ Created employer accounts:');
  console.log(`   - ${employer1.email} (password: password123)`);
  console.log(`   - ${employer2.email} (password: password123)`);

  // Create admin account
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@readyhr.com' },
    update: {
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@readyhr.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      commercialRegistrationNumber: 'ADMIN-N/A',
      commercialRegistrationImageUrl: '/admin-placeholder',
      status: 'APPROVED', // Admins are always approved
    },
  });

  console.log('✅ Created admin account:');
  console.log(`   - ${admin.email} (password: Admin@123456)`);
  console.log('   ⚠️  IMPORTANT: Change this password after first login!');

  // Create default platform settings
  const settings = await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      maintenanceMode: false,
      allowNewRegistrations: true,
      allowNewApplications: true,
      platformName: 'Ready HR',
      supportEmail: 'support@readyhr.com',
      supportPhone: '+966 50 123 4567',
    },
  });

  console.log('✅ Created default platform settings');

  // Create some sample employee applications
  const employee1 = await prisma.employeeApplication.create({
    data: {
      fullName: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      phone: '0501111111',
      city: 'Riyadh',
      nationality: 'Saudi Arabian',
      skills: 'Chef / Cook, Kitchen Assistant',
      experience: 'Professional chef with 3 years of experience in fine dining restaurants. Specialized in Mediterranean and Middle Eastern cuisine.',
      resumeUrl: '/uploads/sample-resume.pdf',
      iqamaNumber: '1234567890',
      iqamaExpiryDate: new Date('2026-12-31'),
      kafeelNumber: 'KFL123456',
    },
  });

  const employee2 = await prisma.employeeApplication.create({
    data: {
      fullName: 'Fatima Hassan',
      email: 'fatima@example.com',
      phone: '0502222222',
      city: 'Jeddah',
      nationality: 'Egyptian',
      skills: 'Waiter / Customer Service, Cashier',
      experience: '5 years of customer service experience in high-end restaurants. Excellent communication skills and fluent in Arabic and English.',
      resumeUrl: '/uploads/sample-resume-2.pdf',
      iqamaNumber: '2345678901',
      iqamaExpiryDate: new Date('2027-06-30'),
      kafeelNumber: 'KFL234567',
    },
  });

  const employee3 = await prisma.employeeApplication.create({
    data: {
      fullName: 'Mohammed Khalid',
      email: 'mohammed@example.com',
      phone: '0503333333',
      city: 'Dammam',
      nationality: 'Jordanian',
      skills: 'Restaurant Supervisor / Manager, Waiter / Customer Service',
      experience: '4 years of restaurant management experience. Skilled in staff training, inventory management, and customer satisfaction.',
      resumeUrl: '/uploads/sample-resume-3.pdf',
      iqamaNumber: '3456789012',
      iqamaExpiryDate: new Date('2025-12-31'),
      kafeelNumber: 'KFL345678',
    },
  });

  console.log('✅ Created sample employee applications:');
  console.log(`   - ${employee1.fullName} (${employee1.city})`);
  console.log(`   - ${employee2.fullName} (${employee2.city})`);
  console.log(`   - ${employee3.fullName} (${employee3.city})`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('\n   ADMIN ACCOUNT:');
  console.log('   Email: admin@readyhr.com');
  console.log('   Password: Admin@123456');
  console.log('   Access: /adminofjb/login');
  console.log('   ⚠️  Change password after first login!');
  console.log('\n   EMPLOYER ACCOUNTS:');
  console.log('   Email: employer@test.com');
  console.log('   Password: password123');
  console.log('   ---');
  console.log('   Email: hr@company.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
