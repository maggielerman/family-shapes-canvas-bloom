# Admin Dashboard Setup Guide

This guide explains how to set up and configure the admin dashboard with secure authentication.

## Overview

The admin dashboard uses Supabase's built-in authentication with custom claims for role-based access control (RBAC). Admin users are completely separate from regular application users and have their own authentication flow.

## Key Features

- **Secure Authentication**: Email/password authentication with session management
- **Role-Based Access Control**: Support for `admin` and `super_admin` roles
- **Custom JWT Claims**: Admin roles are embedded in JWT tokens for secure verification
- **Row Level Security**: Database-level protection for admin-only operations
- **Session Tracking**: Monitor active admin sessions

## Initial Setup

### 1. Run Database Migrations

First, apply the admin authentication migration:

```bash
# Run the migration through Supabase CLI or dashboard
supabase migration up
```

This creates:
- `user_profiles` table with role management
- `admin_sessions` table for session tracking
- RLS policies for secure access
- Custom functions for role checking

### 2. Configure Auth Hook in Supabase Dashboard

**This step is crucial for admin authentication to work properly!**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Hooks (Beta)**
3. In the "Custom Access Token Hook" section:
   - Select `custom_access_token_hook` from the dropdown
   - Click "Enable Hook"

This hook adds admin role claims to JWT tokens when users sign in.

### 3. Set Environment Variables

Add the following to your `.env` file:

```bash
# Required for the application
VITE_SUPABASE_PROJECT_URL=https://your-project.supabase.co

# For the admin creation script only (keep this secure!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Set your app URL for the admin creation script
APP_URL=https://your-app-domain.com
```

⚠️ **Security Note**: Never commit the service role key to version control. It has full database access.

### 4. Create Your First Admin User

Use the provided script to create your first super admin:

```bash
npm run create-admin -- --email=admin@example.com --password=YourSecurePassword123!
```

The script will:
1. Create a new user in Supabase Auth
2. Assign the `super_admin` role
3. Confirm the email automatically

## Admin Roles

### Super Admin (`super_admin`)
- Full access to all admin features
- Can manage other admin users
- Can view all system data

### Admin (`admin`)
- Access to admin dashboard
- Limited management capabilities
- Cannot manage other admins

## Accessing the Admin Dashboard

1. Navigate to `/admin/signin`
2. Enter your admin credentials
3. You'll be redirected to `/admin` after successful authentication

## Security Best Practices

### 1. Strong Passwords
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Consider using a password manager

### 2. Regular Security Audits
- Review admin sessions regularly
- Remove inactive admin accounts
- Monitor failed login attempts

### 3. Environment Security
- Never expose service role keys
- Use environment variables for sensitive data
- Rotate keys periodically

### 4. Session Management
- Sessions expire after 24 hours
- Admin sign-outs invalidate sessions
- Monitor active sessions in the dashboard

## Troubleshooting

### "Access denied" Error
1. Verify the auth hook is enabled in Supabase
2. Check that the user has the correct role in `user_profiles` table
3. Ensure RLS policies are active

### JWT Claims Not Working
1. Sign out and sign back in
2. Verify the `custom_access_token_hook` is enabled
3. Check the function permissions in the database

### Cannot Create Admin User
1. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify the migration has run successfully
3. Check Supabase logs for errors

## Managing Admin Users

### Adding New Admins (SQL)

```sql
-- After creating a user through Supabase Auth
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'newadmin@example.com';
```

### Removing Admin Access

```sql
UPDATE user_profiles 
SET role = 'user' 
WHERE email = 'former-admin@example.com';
```

### Viewing Active Sessions

```sql
SELECT 
  up.email,
  as.ip_address,
  as.created_at,
  as.expires_at
FROM admin_sessions as
JOIN user_profiles up ON as.user_id = up.id
WHERE as.is_active = true
ORDER BY as.created_at DESC;
```

## Development Tips

### Testing Admin Features Locally
1. Create a test admin user
2. Use different browser profiles for admin/regular users
3. Monitor the browser console for auth errors

### Debugging Authentication
- Check JWT contents: Use [jwt.io](https://jwt.io) to decode tokens
- Verify claims: Look for `user_role`, `is_admin`, `is_super_admin`
- Monitor Supabase logs for auth errors

## Future Enhancements

Potential improvements to consider:
- Multi-factor authentication (MFA)
- IP allowlisting
- Audit logging
- Role hierarchy customization
- Admin activity monitoring

## Support

For issues or questions:
1. Check Supabase logs for detailed error messages
2. Review RLS policies in the SQL editor
3. Verify auth hook configuration
4. Test with the database connectivity tool in the admin dashboard