#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function checkAndSeed() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking if database needs seeding...');
    
    // Check if there are any users in the database
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('🌱 Database is empty, running seed...');
      
      try {
        execSync('npx prisma db seed', { stdio: 'inherit' });
        console.log('✅ Database seeded successfully');
      } catch (error) {
        console.log('⚠️ Seeding failed, but this is not critical for deployment');
        console.log('You can manually seed the database later if needed');
      }
    } else {
      console.log(`✅ Database already has ${userCount} users, skipping seed`);
    }
  } catch (error) {
    console.log('⚠️ Could not check database state, skipping seed');
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed().catch((error) => {
  console.error('Error in seed check:', error);
  // Don't exit with error code as this shouldn't block deployment
  process.exit(0);
});