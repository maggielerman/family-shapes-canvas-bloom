#!/usr/bin/env node

/**
 * Deployment script for Supabase Edge Functions
 * This script helps deploy the updated invitation functions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'nhkufibfwskdpzdjwirr';
const FUNCTIONS = ['send-invitation', 'process-invitation'];

async function deployFunctions() {
  console.log('🚀 Starting Supabase Edge Function deployment...\n');

  // Check if supabase CLI is available
  try {
    execSync('npx supabase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Supabase CLI not found. Please install it first:');
    console.error('   npm install -g supabase');
    process.exit(1);
  }

  // Check if logged in
  try {
    execSync('npx supabase status', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not logged into Supabase. Please run:');
    console.error('   npx supabase login');
    process.exit(1);
  }

  // Deploy each function
  for (const functionName of FUNCTIONS) {
    console.log(`📦 Deploying ${functionName}...`);
    
    try {
      const command = `npx supabase functions deploy ${functionName} --project-ref ${PROJECT_REF}`;
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Successfully deployed ${functionName}\n`);
    } catch (error) {
      console.error(`❌ Failed to deploy ${functionName}:`, error.message);
      process.exit(1);
    }
  }

  console.log('🎉 All functions deployed successfully!');
  console.log('\n📋 Summary of changes:');
  console.log('   • send-invitation: Added encodeURIComponent for proper token encoding');
  console.log('   • process-invitation: Added decodeURIComponent for proper token decoding');
  console.log('\n🔗 Your invitation links should now work correctly!');
}

// Manual deployment instructions
function showManualInstructions() {
  console.log('📋 Manual Deployment Instructions');
  console.log('================================\n');
  
  console.log('1. Go to your Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/nhkufibfwskdpzdjwirr\n');
  
  console.log('2. Navigate to Edge Functions in the sidebar\n');
  
  console.log('3. Update send-invitation function:');
  console.log('   • Open the send-invitation function');
  console.log('   • Replace the URL generation lines with:');
  console.log('     const acceptUrl = `${appUrl}/invite/accept/${encodeURIComponent(invitation.token)}`;');
  console.log('     const declineUrl = `${appUrl}/invite/decline/${encodeURIComponent(invitation.token)}`;\n');
  
  console.log('4. Update process-invitation function:');
  console.log('   • Open the process-invitation function');
  console.log('   • Add after parsing the request body:');
  console.log('     const decodedToken = decodeURIComponent(token);');
  console.log('   • Replace all instances of "token" with "decodedToken" in the database queries\n');
  
  console.log('5. Deploy both functions\n');
  
  console.log('6. Test by sending a new invitation\n');
}

// Check if running with --manual flag
if (process.argv.includes('--manual')) {
  showManualInstructions();
} else {
  deployFunctions().catch(console.error);
}