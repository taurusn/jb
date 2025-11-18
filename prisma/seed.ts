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
    where: { email: 'admin@jobplatform.com' },
    update: {
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@jobplatform.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
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
      platformName: 'Job Platform',
      supportEmail: 'support@jobplatform.com',
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
      education: "Bachelor's in Computer Science",
      skills: 'JavaScript, React, Node.js, TypeScript, SQL, Git',
      experience: 'Software Developer with 3 years of experience building web applications. Worked on multiple full-stack projects including e-commerce platforms and internal business tools.',
      resumeUrl: '/uploads/sample-resume.pdf',
    },
  });

  const employee2 = await prisma.employeeApplication.create({
    data: {
      fullName: 'Fatima Hassan',
      email: 'fatima@example.com',
      phone: '0502222222',
      city: 'Jeddah',
      education: "Master's in Data Science",
      skills: 'Python, Machine Learning, TensorFlow, Data Analysis, SQL, Tableau',
      experience: '5 years as a Data Scientist specializing in predictive analytics and business intelligence. Led multiple ML projects that improved operational efficiency by 40%.',
      resumeUrl: '/uploads/sample-resume-2.pdf',
    },
  });

  const employee3 = await prisma.employeeApplication.create({
    data: {
      fullName: 'Mohammed Khalid',
      email: 'mohammed@example.com',
      phone: '0503333333',
      city: 'Dammam',
      education: "Bachelor's in Information Technology",
      skills: 'Java, Spring Boot, Microservices, Docker, Kubernetes, AWS',
      experience: 'Backend Engineer with 4 years experience designing and implementing scalable microservices architectures. Strong focus on cloud-native applications.',
      resumeUrl: '/uploads/sample-resume-3.pdf',
    },
  });

  console.log('✅ Created sample employee applications:');
  console.log(`   - ${employee1.fullName} (${employee1.city})`);
  console.log(`   - ${employee2.fullName} (${employee2.city})`);
  console.log(`   - ${employee3.fullName} (${employee3.city})`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('\n   ADMIN ACCOUNT:');
  console.log('   Email: admin@jobplatform.com');
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
