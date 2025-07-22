#!/usr/bin/env node

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { seedOrganizations, clearSeededData } from '../src/lib/organizationSeeds';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

const SUPABASE_URL = "https://nhkufibfwskdpzdjwirr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oa3VmaWJmd3NrZHB6ZGp3aXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzcwNDcsImV4cCI6MjA2NzMxMzA0N30.ocKAuYTWxj4DUQGdFkRP4rcVy02nBqRqGjT2VopSsXg";

async function main() {
  const command = process.argv[2];
  const userId = process.argv[3] || process.env.SUPABASE_USER_ID;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!userId) {
    console.error('❌ Error: User ID is required');
    console.log('Usage: npm run seed [command] [userId]');
    console.log('Commands:');
    console.log('  seed     - Seed the database with test data');
    console.log('  clear    - Clear seeded data');
    console.log('');
    console.log('Examples:');
    console.log('  npm run seed seed your-user-id');
    console.log('  npm run seed clear your-user-id');
    console.log('  SUPABASE_USER_ID=your-user-id npm run seed seed');
    console.log('');
    console.log('For production seeding, set SUPABASE_SERVICE_ROLE_KEY environment variable');
    process.exit(1);
  }

  try {
    console.log(`🔐 Authenticating with user ID: ${userId}`);
    
    // Create Supabase client with service role key if available, otherwise use anon key
    const supabase = createClient<Database>(
      SUPABASE_URL, 
      serviceRoleKey || SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (serviceRoleKey) {
      console.log('🔑 Using service role key for authentication');
    } else {
      console.log('⚠️  No service role key found, using anon key (may have limited permissions)');
    }

    if (command === 'seed') {
      console.log('🌱 Seeding database with test data...');
      const results = await seedOrganizations(userId, supabase);
      
      console.log('✅ Seeding completed successfully!');
      console.log(`📊 Created:`);
      console.log(`   - ${results.organizations.length} organizations`);
      console.log(`   - ${results.groups.length} groups`);
      console.log(`   - ${results.persons.length} persons`);
      console.log(`   - ${results.connections.length} connections`);
      
      if (results.errors.length > 0) {
        console.log(`⚠️  ${results.errors.length} errors occurred:`);
        results.errors.forEach(error => console.log(`   - ${error}`));
      }
      
    } else if (command === 'clear') {
      console.log('🧹 Clearing seeded data...');
      await clearSeededData(userId, supabase);
      console.log('✅ Seeded data cleared successfully!');
      
    } else {
      console.error('❌ Invalid command. Use "seed" or "clear"');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 