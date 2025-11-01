#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function checkDatabaseConnection() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkIfTablesExist() {
  const prisma = new PrismaClient();
  try {
    // Try to query a table that should exist after migration
    await prisma.user.findFirst();
    console.log('✅ Database tables exist');
    return true;
  } catch (error) {
    console.log('⚠️ Database tables not found, migration needed');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database deployment process...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('🔍 Checking database connection...');
  const canConnect = await checkDatabaseConnection();
  
  if (!canConnect) {
    console.error('❌ Cannot connect to database. Please check your DATABASE_URL');
    process.exit(1);
  }
  
  console.log('\n🔍 Checking if database is initialized...');
  const tablesExist = await checkIfTablesExist();
  
  if (!tablesExist) {
    console.log('\n📦 Initializing database...');
    
    // Generate Prisma client
    const generateSuccess = await runCommand(
      'npx prisma generate',
      'Generating Prisma client'
    );
    if (!generateSuccess) process.exit(1);
    
    // Run migrations
    const migrateSuccess = await runCommand(
      'npx prisma migrate deploy',
      'Running database migrations'
    );
    if (!migrateSuccess) process.exit(1);
    
    // Check if we should seed
    console.log('\n🌱 Checking if database needs seeding...');
    const prisma = new PrismaClient();
    try {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        console.log('🌱 Database is empty, running seed...');
        await prisma.$disconnect();
        
        const seedSuccess = await runCommand(
          'npx prisma db seed',
          'Seeding database with initial data'
        );
        if (!seedSuccess) {
          console.log('⚠️ Seeding failed, but migration was successful');
        }
      } else {
        console.log('✅ Database already has data, skipping seed');
        await prisma.$disconnect();
      }
    } catch (error) {
      console.log('⚠️ Could not check user count, skipping seed');
      await prisma.$disconnect();
    }
  } else {
    console.log('✅ Database is already initialized');
    
    // Still generate client in case it's missing
    await runCommand(
      'npx prisma generate',
      'Generating Prisma client'
    );
  }
  
  console.log('\n🎉 Database deployment completed successfully!');
}

main().catch((error) => {
  console.error('💥 Database deployment failed:', error);
  process.exit(1);
});