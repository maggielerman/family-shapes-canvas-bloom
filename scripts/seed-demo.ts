#!/usr/bin/env node

import { seedOrganizations } from '../src/lib/organizationSeeds';

async function main() {
  const userId = process.argv[2] || 'demo-user-id';

  try {
    console.log('🌱 Seeding database with demo data (including donor relationships)...');
    console.log(`📝 Using user ID: ${userId}`);
    
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
    
    console.log('\n🎯 Donor relationships created:');
    console.log('   - Sperm Donor #2847 → Elena Chen-Rodriguez');
    console.log('   - Sperm Donor #2847 → Jamie Thompson');
    console.log('   - Egg Donor #E123 → Luna Kim-Park');
    
    console.log('\n🔍 To test donor relationships:');
    console.log('   1. Navigate to a family tree with seeded data');
    console.log('   2. Check the connections table for donor relationships');
    console.log('   3. View tree visualizations to see donors in the tree');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 