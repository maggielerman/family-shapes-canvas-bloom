# Deployment Guide: Fix Invitation Token Encoding

This guide explains how to deploy the fixes for the invitation token encoding issue that was causing 404 errors.

## Problem Summary

The invitation links were returning 404 errors because:
1. Tokens containing special characters (like `+`) weren't being properly URL-encoded
2. The frontend wasn't properly decoding the tokens
3. Some URLs had extra segments that didn't match the expected route pattern

## Changes Made

### Frontend Changes (Already Deployed ✅)
- Added route for malformed URLs: `/invite/:action/P/:token`
- Added token decoding in `OrganizationInvitePage.tsx` and `InvitationPage.tsx`
- Updated routing to handle URL encoding issues

### Supabase Function Changes (Need Deployment)
- **send-invitation**: Added `encodeURIComponent()` for proper token encoding
- **process-invitation**: Added `decodeURIComponent()` for proper token decoding

## Deployment Options

### Option 1: Automated Deployment (Recommended)

If you have Supabase CLI access:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
npx supabase login

# Deploy the functions
npm run deploy:functions
```

### Option 2: Manual Deployment via Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nhkufibfwskdpzdjwirr)
2. Navigate to **Edge Functions** in the sidebar
3. Update each function with the changes below

#### Update send-invitation function:

Find these lines:
```typescript
const acceptUrl = `${appUrl}/invite/accept/${invitation.token}`;
const declineUrl = `${appUrl}/invite/decline/${invitation.token}`;
```

Replace with:
```typescript
const acceptUrl = `${appUrl}/invite/accept/${encodeURIComponent(invitation.token)}`;
const declineUrl = `${appUrl}/invite/decline/${encodeURIComponent(invitation.token)}`;
```

#### Update process-invitation function:

Add this line after parsing the request body:
```typescript
const decodedToken = decodeURIComponent(token);
```

Replace all instances of `token` with `decodedToken` in the database queries:
```typescript
.eq("token", decodedToken)
```

### Option 3: View Manual Instructions

```bash
npm run deploy:functions:manual
```

## Testing the Fix

1. Send a new invitation to test the updated URL generation
2. Try accessing the original broken link: `https://familyshapes.com/invite/accept/P/LToeinfhAnDsyd+AoTZsAoxMVOGTYb7FqtGjGAFN4=`
3. Verify that both new and existing invitation links work correctly

## Migration Applied

The database migration `20250722000000-fix-invitation-token-encoding.sql` has been applied, which:
- Creates a tracking table for function deployments
- Provides functions to check deployment status
- Documents the changes made

## Verification

After deployment, you can check the deployment status by running:

```sql
SELECT * FROM public.get_function_deployment_status();
```

This will show you which functions have been updated and their deployment status.

## Rollback

If needed, you can rollback by:
1. Reverting the function changes in the Supabase dashboard
2. The frontend changes are already deployed and working correctly

## Support

If you encounter any issues during deployment, please:
1. Check the Supabase function logs for errors
2. Verify the function syntax is correct
3. Test with a new invitation to ensure the fix works