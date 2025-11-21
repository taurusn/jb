/**
 * Environment Variable Validation
 * Ensures critical security variables are properly configured
 * Called at application startup via instrumentation.ts
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate critical environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Critical: JWT_SECRET must be set and strong
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push('CRITICAL: JWT_SECRET is not set');
  } else if (jwtSecret === 'your-secret-key' || jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push('CRITICAL: JWT_SECRET is using default value. Change it immediately!');
  } else if (jwtSecret.length < 32) {
    errors.push('CRITICAL: JWT_SECRET must be at least 32 characters long');
  }

  // Critical: DATABASE_URL must be set
  if (!process.env.DATABASE_URL) {
    errors.push('CRITICAL: DATABASE_URL is not set');
  }

  // Production-specific checks
  if (isProduction) {
    // NEXTAUTH_SECRET for production
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (!nextAuthSecret) {
      warnings.push('WARNING: NEXTAUTH_SECRET is not set (recommended for production)');
    } else if (nextAuthSecret === 'your-nextauth-secret-change-this-in-production') {
      errors.push('CRITICAL: NEXTAUTH_SECRET is using default value');
    }

    // Storage configuration
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                          process.env.CLOUDINARY_API_KEY &&
                          process.env.CLOUDINARY_API_SECRET;

    if (!hasSupabase && !hasCloudinary) {
      warnings.push('WARNING: No cloud storage configured (Supabase or Cloudinary). Files will be stored locally.');
    }

    // Email configuration
    if (!process.env.RESEND_API_KEY) {
      warnings.push('WARNING: RESEND_API_KEY not set. Email notifications will fail.');
    }

    // Google Calendar integration
    const hasGoogleCalendar = process.env.GOOGLE_CLIENT_ID &&
                              process.env.GOOGLE_CLIENT_SECRET &&
                              process.env.GOOGLE_REFRESH_TOKEN;
    if (!hasGoogleCalendar) {
      warnings.push('WARNING: Google Calendar not configured. Interview scheduling will be limited.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and exit if critical errors found
 */
export function validateEnvironmentOrExit(): void {
  const result = validateEnvironment();

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    result.warnings.forEach(warning => console.warn(`   ${warning}`));
    console.warn('');
  }

  // Log errors and exit if any critical errors found
  if (!result.valid) {
    console.error('\n❌ CRITICAL ENVIRONMENT ERRORS:');
    result.errors.forEach(error => console.error(`   ${error}`));
    console.error('\n🔒 Security Check Failed: Fix these errors before starting the application.\n');
    process.exit(1);
  }

  // Success message
  console.log('✅ Environment validation passed');
}
