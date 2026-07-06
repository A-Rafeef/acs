const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load env variables from .env.local manually
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found at project root.');
    console.error('Please make sure you have set up your environment variables.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      // Join remainder in case value contains '='
      let val = parts.slice(1).join('=').trim();
      // Remove wrapping quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      env[key] = val;
    }
  });
  
  return env;
}

async function main() {
  const env = loadEnv();
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('your-supabase-project')) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is missing or contains placeholder values.');
    process.exit(1);
  }

  if (!serviceRoleKey || serviceRoleKey.includes('your-supabase-service-role-key')) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing or contains placeholder values.');
    console.error('The Service Role Key is required to bypass RLS and create admin users.');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];

  if (!email || !password) {
    console.log('\nUsage: node scripts/create-admin.js <email> <password>');
    console.log('Example: node scripts/create-admin.js curator@store.com securepassword123\n');
    process.exit(1);
  }

  console.log(`\nConnecting to Supabase at: ${supabaseUrl}`);
  console.log(`Creating admin account for: ${email}...`);

  // Initialize administrative Supabase Client bypassing RLS using Service Role Key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Create user with email confirmed automatically
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (error) {
    console.error('\n🔴 Error creating account:', error.message);
    process.exit(1);
  }

  console.log('\n🟢 Account created successfully!');
  console.log('User ID:', data.user.id);
  console.log('You can now log in to the admin panel at /admin/login\n');
}

main().catch((err) => {
  console.error('Unexpected execution error:', err);
  process.exit(1);
});
