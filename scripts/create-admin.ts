#!/usr/bin/env node
/**
 * Script to create an admin user in Supabase
 * Usage: npm run create-admin -- --email=admin@example.com --password=your-secure-password
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { parseArgs } from 'node:util';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_PROJECT_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_PROJECT_URL environment variable is required');
  console.error('Please add it to your .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Please add it to your .env file');
  process.exit(1);
}

// Parse command line arguments
const { values } = parseArgs({
  options: {
    email: {
      type: 'string',
      short: 'e',
    },
    password: {
      type: 'string',
      short: 'p',
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
  },
});

if (values.help || !values.email || !values.password) {
  console.log(`
Admin User Creation Script

Usage:
  npm run create-admin -- --email=admin@example.com --password=your-secure-password

Options:
  -e, --email      Admin user email (required)
  -p, --password   Admin user password (required)
  -h, --help       Show this help message

Example:
  npm run create-admin -- --email=admin@example.com --password=SecureP@ssw0rd!

Note: Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env file
`);
  process.exit(0);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const { email, password } = values;

  console.log(`🔧 Creating admin user with email: ${email}`);

  try {
    // Step 1: Create the user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email!,
      password: password!,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    console.log('✅ User created successfully');

    // Step 2: Update the user profile to set admin role
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .update({ role: 'super_admin' })
      .eq('id', authData.user.id)
      .select()
      .single();

    // If update returned no rows, the profile doesn't exist yet
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email!,
          role: 'super_admin',
        });

      if (insertError) {
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }
    } else if (profileError) {
      // Some other error occurred
      throw new Error(`Failed to update user profile: ${profileError.message}`);
    }

    console.log('✅ Admin role assigned successfully');
    console.log('\n🎉 Admin user created successfully!');
    
    // Use the app's actual URL
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    console.log(`\nYou can now sign in at: ${appUrl}/admin/signin`);
    console.log(`Email: ${email}`);
    console.log(`Password: [hidden]`);
    
    // Important note about auth hook
    console.log('\n⚠️  Important: Make sure to enable the custom_access_token_hook in your Supabase dashboard:');
    console.log('1. Go to Authentication > Hooks (Beta) in your Supabase dashboard');
    console.log('2. Select "custom_access_token_hook" from the dropdown');
    console.log('3. Click "Enable Hook"');
    console.log('\nThis is required for admin role claims to work properly.');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();