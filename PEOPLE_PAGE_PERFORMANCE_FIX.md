# People Page Performance Fix

## Issue
The `/people` page was loading very slowly compared to other pages due to an N+1 query problem.

## Root Cause
The `fetchPersons` function in `src/pages/People.tsx` was making individual database queries for each person to count their:
1. Family trees (via `family_tree_members` table)
2. Connections (via `connections` table)

For example, if a user had 50 people, the code was making:
- 1 query to get all persons
- 50 queries to count family trees for each person
- 50 queries to count connections for each person
- **Total: 101 database queries**

This created a classic N+1 query problem where performance degraded linearly with the number of people.

## Solution

### 1. Optimized Database Queries
Replaced the N+1 queries with 3 efficient queries:

```typescript
// Before: 1 + 2N queries (where N = number of people)
// After: 3 queries total

// 1. Get all persons
const { data: personsData } = await supabase
  .from('persons')
  .select('*')
  .eq('user_id', user.id);

// 2. Get all family tree counts in one query
const { data: treeCounts } = await supabase
  .from('family_tree_members')
  .select('person_id, count')
  .in('person_id', personIds);

// 3. Get all connection counts in one query  
const { data: connectionCounts } = await supabase
  .from('connections')
  .select('from_person_id, to_person_id')
  .or(`from_person_id.in.(${personIds.join(',')}),to_person_id.in.(${personIds.join(',')})`);
```

### 2. Added Database Indexes
Created a new migration `20250126_add_connection_person_indexes.sql` to add indexes on:
- `idx_connections_from_person_id` - for queries filtering by from_person_id
- `idx_connections_to_person_id` - for queries filtering by to_person_id  
- `idx_connections_person_ids` - composite index for both columns
- `idx_connections_person_lookup` - GIN index for OR conditions

## Performance Improvement
- **Before**: O(N) database queries where N = number of people
- **After**: O(1) database queries (constant 3 queries regardless of people count)

## Files Modified
1. `src/pages/People.tsx` - Optimized fetchPersons function
2. `supabase/migrations/20250126_add_connection_person_indexes.sql` - Added database indexes

## Testing
To verify the fix:
1. Navigate to `/people` page
2. The page should load much faster, especially with many people
3. Check browser network tab to confirm fewer database requests
4. Verify that all person cards still show correct tree and connection counts

## Additional Recommendations
1. Consider implementing pagination if users have hundreds of people
2. Add loading states for better UX during data fetching
3. Consider caching frequently accessed data
4. Monitor database query performance in production