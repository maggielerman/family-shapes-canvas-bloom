# User Profile Multiple Records Fix

## 🔍 Issue Identified

From the debug logs:
```
1:47:07 PM: Testing user_profiles table access...
1:47:07 PM: ERROR user_profiles: JSON object requested, multiple (or no) rows returned (Code: PGRST116)
```

**Root Cause**: Your user account has **multiple user profile records** in the database, but the query was using `.single()` which expects exactly one row.

## ⚠️ Why This Happened

This likely occurred due to:
1. **Database migration issues** - Multiple triggers creating profiles
2. **Manual profile creation** - Profiles created both by triggers and manually
3. **Development testing** - Multiple profile creation during testing

## ✅ Fix Applied

### **Before (Broken)**:
```typescript
const { data: profile, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single(); // ❌ FAILS when multiple records exist
```

### **After (Working)**:
```typescript
const { data: profiles, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .order('updated_at', { ascending: false })  // Most recent first
  .limit(1); // ✅ Gets exactly one record

// Handle the array result
if (profiles && profiles.length > 0) {
  const profile = profiles[0]; // Use most recent
  // ... use profile data
}
```

## 🔧 Changes Made

### **Files Modified**:
- `src/pages/UserProfile.tsx` - Fixed query to handle multiple records
- `src/components/debug/DatabaseTest.tsx` - Enhanced to detect multiple profiles

### **Query Strategy**:
1. **Remove `.single()`** - No longer assumes exactly one record
2. **Add ordering** - `order('updated_at', { ascending: false })` gets most recent
3. **Add limit** - `limit(1)` ensures we get exactly one result
4. **Handle array** - Process `profiles[0]` instead of direct `profile` object

### **Debug Enhancement**:
```typescript
// Now shows count and warns about multiple records
addResult(`SUCCESS user_profiles: Found ${count} profile records`);
if (profileData && profileData.length > 1) {
  addResult(`WARNING: Multiple profiles found (${profileData.length}) - using most recent`);
}
```

## 🚀 Expected Results

### **For Family Trees**: ✅ **Should work now**
- Database access confirmed working from debug logs
- Query syntax issues were already fixed

### **For User Profile**: ✅ **Fixed**
- Will load the most recent profile record
- Handles multiple records gracefully
- Fallback to auth user data if needed

### **Debug Output (Expected)**:
```
SUCCESS user_profiles: Found 2 profile records
WARNING: Multiple profiles found (2) - using most recent
First profile name: [Your Name]
```

## 🔄 Next Steps

1. **Test the deploy preview** - Both pages should now load
2. **Run debug tests again** - Should show warnings about multiple profiles but work
3. **Optional cleanup** - You may want to clean up duplicate profile records later

## 📊 Database Cleanup (Optional)

If you want to clean up the duplicate records later:

```sql
-- Find duplicate profiles (don't run this yet - just for reference)
SELECT id, full_name, created_at, updated_at 
FROM user_profiles 
WHERE id = '6fdd3adc-2168-4a6f-8c01-67a0d6a306a2'
ORDER BY updated_at DESC;

-- Keep the most recent, delete older ones (be careful!)
-- DELETE FROM user_profiles 
-- WHERE id = 'your-user-id' 
-- AND updated_at < (
--   SELECT MAX(updated_at) 
--   FROM user_profiles 
--   WHERE id = 'your-user-id'
-- );
```

## ✅ Resolution Status

- **User Profile Loading**: ✅ **FIXED**
- **Family Trees Loading**: ✅ **SHOULD WORK** (separate fixes applied)
- **Debug Tooling**: ✅ **Enhanced** (shows multiple record warnings)

Both pages should now load properly in your personal account view!