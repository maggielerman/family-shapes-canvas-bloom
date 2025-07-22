# Cypress Test Troubleshooting Guide

## Common Issues and Solutions

### 🔧 **Quick Fix for Current Failing Tests**

The tests are failing because they were designed with placeholder selectors. Here's how to fix them:

### **Step 1: Start with Basic Tests**

Run only the basic UI structure tests first:
```bash
# Run only the basic UI tests
npx cypress run --spec "cypress/e2e/basic-ui/*.cy.ts"

# Or run them interactively
npx cypress open
```

### **Step 2: Check Your Development Server**

Make sure your app is running before running tests:
```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Run Cypress
npm run cypress:open
```

### **Step 3: Authentication Issues**

The tests expect authentication to work. You have several options:

#### Option A: Skip Authentication for UI Testing
Add this to your test files:
```typescript
beforeEach(() => {
  // Skip auth errors for UI testing
  cy.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('auth') || err.message.includes('401')) {
      return false
    }
  })
})
```

#### Option B: Set Up Test Credentials
1. Create test users in your database
2. Update `cypress/fixtures/test-data.json` with real credentials
3. Use `cy.signIn(email, password)` in your tests

#### Option C: Mock Authentication
Add auth mocking to your support files.

### **Step 4: Fix Selector Issues**

The original tests use `data-testid` attributes that don't exist. You can either:

#### Option A: Update Tests to Use Existing Selectors
Use the actual HTML structure (already done in updated files):
```typescript
// Instead of: cy.get('[data-testid="email-input"]')
// Use: cy.get('#signin-email')

// Instead of: cy.get('[data-testid="create-tree-button"]')
// Use: cy.contains('Create Tree')
```

#### Option B: Add data-testid Attributes (Recommended)
Add test attributes to your components:
```jsx
// In your React components
<input 
  id="signin-email" 
  data-testid="email-input"  // Add this
  type="email" 
  // ... other props
/>

<button 
  data-testid="create-tree-button"  // Add this
  onClick={handleCreate}
>
  Create Tree
</button>
```

## **Current Test Status**

### ✅ **Working Tests:**
- `cypress/e2e/basic-ui/01-page-structure.cy.ts` - Basic UI validation
- `cypress/e2e/auth/authentication.cy.ts` - Updated auth tests

### ⚠️ **Needs Work:**
- Family tree tests - Need authentication or mocking
- People management tests - Need authentication or mocking
- Connection tests - Need authentication or mocking

## **Immediate Action Plan**

### **Phase 1: Get Basic Tests Running (5 minutes)**
```bash
# 1. Start your dev server
npm run dev

# 2. Run basic UI tests only
npx cypress run --spec "cypress/e2e/basic-ui/*.cy.ts"
```

### **Phase 2: Fix Authentication (15 minutes)**
Choose one approach:

**Quick Fix - Skip Auth:**
```typescript
// Add to cypress/support/e2e.ts
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('auth')) return false
})
```

**Proper Fix - Test User:**
1. Create a test user in your database
2. Update the credentials in test files
3. Use `cy.signIn('test@example.com', 'testpassword')` before protected tests

### **Phase 3: Add Test Attributes (30 minutes)**
Add `data-testid` attributes to key components:

**Priority components to update:**
1. **Auth.tsx**: Add `data-testid="email-input"`, `data-testid="password-input"`, etc.
2. **FamilyTrees.tsx**: Add `data-testid="create-tree-button"`
3. **People.tsx**: Add `data-testid="add-person-button"`

### **Phase 4: Run Full Test Suite**
```bash
npm run test:all
```

## **Debug Commands**

### **Check What's Actually on the Page:**
```typescript
// In your test
cy.get('body').then(($body) => {
  console.log($body.html())
})

// Or take a screenshot
cy.screenshot()
```

### **Debug Selector Issues:**
```typescript
// Check if element exists
cy.get('body').should('contain', 'expected text')

// Find what selectors are available
cy.get('input').then(($inputs) => {
  $inputs.each((i, el) => {
    console.log('Input:', el.id, el.name, el.type)
  })
})
```

### **Check Console Errors:**
Open browser dev tools while running tests to see console errors.

## **File-by-File Status**

### **✅ Ready to Run:**
- `cypress/e2e/basic-ui/01-page-structure.cy.ts`
- `cypress/e2e/auth/authentication.cy.ts`

### **⚠️ Needs Auth Setup:**
- `cypress/e2e/family-trees/01-family-tree-creation.cy.ts`
- `cypress/e2e/people/01-person-management.cy.ts`

### **❌ Needs Major Updates:**
- `cypress/e2e/family-trees/02-family-tree-visualization.cy.ts`
- `cypress/e2e/family-trees/03-connections-and-relationships.cy.ts`
- `cypress/e2e/people/02-person-profile-management.cy.ts`

## **Environment Setup Issues**

### **Port Conflicts:**
If Cypress can't reach your app:
```bash
# Check what's running on port 5173
lsof -i :5173

# Update cypress.config.ts baseUrl if needed
```

### **Dependencies:**
```bash
# Reinstall if needed
npm install
npx cypress install
npx cypress verify
```

## **Next Steps Priority**

1. **🚀 Immediate (5 min)**: Run basic UI tests to verify setup
2. **🔧 Quick Fix (15 min)**: Set up authentication handling
3. **📝 Short Term (1 hour)**: Add data-testid attributes to key components
4. **🎯 Long Term (ongoing)**: Gradually improve test coverage

## **Getting Help**

If tests are still failing:
1. Check the Cypress Test Runner console for specific errors
2. Look at the browser console for JavaScript errors
3. Use `cy.screenshot()` and `cy.pause()` for debugging
4. Simplify tests to test one thing at a time

**Remember**: It's better to have a few working tests than many broken ones. Start small and build up!