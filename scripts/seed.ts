#!/usr/bin/env node

import { seedOrganizations, clearSeededData } from '../src/lib/organizationSeeds';
import { supabase } from '../src/integrations/supabase/client';

async function main() {
  const command = process.argv[2];
  const userId = process.argv[3] || process.env.SUPABASE_USER_ID;

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
    process.exit(1);
  }

  try {
    console.log(`🔐 Authenticating with user ID: ${userId}`);
    
    // Test the connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Authentication error:', authError.message);
      process.exit(1);
    }

    if (command === 'seed') {
      console.log('🌱 Seeding database with test data...');
      const results = await seedOrganizations(userId);
      
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
      await clearSeededData(userId);
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