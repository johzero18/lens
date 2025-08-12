#!/usr/bin/env node

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL'
];

const optionalVars = [
  'NEXT_PUBLIC_GA_ID',
  'SENTRY_DSN',
  'CONTACT_EMAIL',
  'RATE_LIMIT_MAX_REQUESTS',
  'RATE_LIMIT_WINDOW_MS'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');

  const missingVars = [];
  const presentVars = [];
  const presentOptionalVars = [];

  // Check required variables
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      presentVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });

  // Check optional variables
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      presentOptionalVars.push(varName);
    }
  });

  // Report results
  if (presentVars.length > 0) {
    console.log('✅ Required variables found:');
    presentVars.forEach(varName => {
      const value = process.env[varName];
      const displayValue = varName.includes('KEY') || varName.includes('DSN') 
        ? `${value.substring(0, 10)}...` 
        : value;
      console.log(`   ${varName}: ${displayValue}`);
    });
    console.log('');
  }

  if (presentOptionalVars.length > 0) {
    console.log('ℹ️  Optional variables found:');
    presentOptionalVars.forEach(varName => {
      const value = process.env[varName];
      const displayValue = varName.includes('KEY') || varName.includes('DSN') 
        ? `${value.substring(0, 10)}...` 
        : value;
      console.log(`   ${varName}: ${displayValue}`);
    });
    console.log('');
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please check your .env.local file or environment configuration.\n');
    process.exit(1);
  }

  // Validate URL formats
  const urlVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_APP_URL'];
  urlVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !isValidUrl(value)) {
      console.error(`❌ Invalid URL format for ${varName}: ${value}`);
      process.exit(1);
    }
  });

  // Validate Supabase keys format
  const supabaseKeys = ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  supabaseKeys.forEach(varName => {
    const value = process.env[varName];
    if (value && !isValidJWT(value)) {
      console.error(`❌ Invalid JWT format for ${varName}`);
      process.exit(1);
    }
  });

  console.log('✅ All environment variables are valid!\n');

  // Environment-specific warnings
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    console.log('🚀 Production environment detected');
    
    if (!process.env.NEXT_PUBLIC_GA_ID) {
      console.warn('⚠️  Consider adding NEXT_PUBLIC_GA_ID for analytics');
    }
    
    if (!process.env.SENTRY_DSN) {
      console.warn('⚠️  Consider adding SENTRY_DSN for error tracking');
    }
  } else {
    console.log(`🛠️  Development environment (NODE_ENV: ${nodeEnv || 'not set'})`);
  }

  console.log('');
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidJWT(token) {
  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

// Run validation
validateEnvironment();