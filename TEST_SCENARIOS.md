# Test Scenarios for SessionStorage Flag Fix

## Issue Description
The `explicit-personal-dashboard` sessionStorage flag was being cleared prematurely before all redirect conditions were met, causing unintended auto-redirections.

## Test Scenarios

### Scenario 1: Initial Load with Flag Set (Data Still Loading)
1. Set `sessionStorage.setItem('explicit-personal-dashboard', 'true')`
2. Navigate to Dashboard
3. While data is loading (profile and organizations not yet loaded):
   - Flag should NOT be cleared
   - No redirect should occur
4. When data finishes loading:
   - Flag should still be present
   - No redirect should occur (because flag prevents it)

### Scenario 2: Initial Load without Flag (Normal Auto-Redirect)
1. Ensure no `explicit-personal-dashboard` flag is set
2. Navigate to Dashboard
3. While data is loading:
   - No redirect occurs (data not ready)
4. When data loads and user has owned organizations:
   - Auto-redirect should occur to first owned organization
   - Flag should be cleared (though it wasn't set initially)

### Scenario 3: Switching from Organization to Personal Dashboard
1. User is on organization dashboard
2. User clicks to switch to personal dashboard (via ContextSwitcher)
3. Flag is set by ContextSwitcher
4. Dashboard loads:
   - Flag prevents auto-redirect
   - Flag is NOT cleared (because no redirect happens)
5. User refreshes the page:
   - Flag still prevents auto-redirect
   - Flag is NOT cleared

### Scenario 4: Switching from Personal to Organization Dashboard
1. User is on personal dashboard with flag set
2. User switches to organization dashboard (via ContextSwitcher)
3. ContextSwitcher removes the flag
4. User navigates back to personal dashboard without setting flag
5. Auto-redirect should occur normally

### Scenario 5: Multiple Effect Runs
1. Set flag and navigate to Dashboard
2. First effect run (data not loaded):
   - Flag checked but NOT cleared
   - No redirect
3. Second effect run (profile loaded, orgs not loaded):
   - Flag still present
   - No redirect
4. Third effect run (all data loaded):
   - Flag still present
   - No redirect (flag prevents it)

## Expected Behavior After Fix
- Flag is ONLY cleared when ALL these conditions are true:
  1. `profile` is loaded (truthy)
  2. `organizations.length > 0`
  3. `!hasExplicitlyNavigatedToPersonal` (flag not set)
  4. `!hasRedirectedRef.current`
  5. User has owned organizations
  6. Redirect is actually happening via `checkOrganizationSetup()`

## Edge Cases Handled
1. Race conditions with data loading
2. Multiple effect runs due to dependency changes
3. User navigation patterns between personal and org dashboards
4. Page refreshes while data is loading