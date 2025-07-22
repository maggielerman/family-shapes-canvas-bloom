#!/bin/bash

# Setup script for Cypress testing environment
# Run this script to set up your development environment for testing

set -e

echo "🚀 Setting up Cypress testing environment for Family Shapes..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Verify Cypress installation
echo "🔍 Verifying Cypress installation..."
if npx cypress verify; then
    echo "✅ Cypress is properly installed"
else
    echo "❌ Cypress verification failed. Reinstalling..."
    npm install cypress --save-dev
    npx cypress install
fi

# Create test environment file if it doesn't exist
if [ ! -f ".env.test" ]; then
    echo "📝 Creating test environment file..."
    cat > .env.test << EOF
# Test Environment Configuration
NODE_ENV=test
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=test-anon-key
EOF
    echo "✅ Created .env.test file"
fi

# Create cypress.env.json if it doesn't exist
if [ ! -f "cypress.env.json" ]; then
    echo "📝 Creating Cypress environment configuration..."
    cat > cypress.env.json << EOF
{
  "baseUrl": "http://localhost:5173",
  "apiUrl": "http://localhost:54321",
  "testUser": {
    "email": "test@familyshapes.com",
    "password": "TestPassword123!"
  },
  "retries": {
    "runMode": 2,
    "openMode": 0
  }
}
EOF
    echo "✅ Created cypress.env.json file"
fi

# Add test data attributes reminder
echo "📋 Creating test data attributes reference..."
cat > cypress/TEST_ATTRIBUTES.md << 'EOF'
# Test Data Attributes Reference

This file lists the required `data-testid` attributes that need to be added to UI components for testing.

## Authentication
- `email-input`
- `password-input`
- `sign-in-button`
- `sign-up-link`
- `user-menu`
- `logout-button`

## Family Trees
- `create-tree-button`
- `tree-name-input`
- `tree-description-input`
- `family-tree-visualization`
- `person-node`
- `zoom-in-button`
- `zoom-out-button`

## People Management
- `add-person-button`
- `first-name-input`
- `last-name-input`
- `person-card`
- `edit-person-button`
- `delete-person-button`

## Connections
- `connections-tab`
- `add-connection-button`
- `person1-select`
- `person2-select`
- `relationship-type-select`

## Usage
Add these attributes to your React components:
```jsx
<button data-testid="create-tree-button">Create Tree</button>
```
EOF

echo "📚 Test Commands Reference:"
echo "  npm run cypress:open       - Open Cypress Test Runner (interactive)"
echo "  npm run test:e2e           - Run E2E tests (headless)"
echo "  npm run test:e2e:headed    - Run E2E tests with browser visible"
echo "  npm run test:component     - Run component tests"
echo "  npm run test:all           - Run all tests (unit + E2E)"
echo ""
echo "📖 Documentation:"
echo "  CYPRESS_TESTING_PLAN.md    - Comprehensive testing strategy"
echo "  cypress/TEST_ATTRIBUTES.md - Required test attributes reference"
echo ""
echo "🎯 Next Steps:"
echo "1. Add data-testid attributes to your components (see cypress/TEST_ATTRIBUTES.md)"
echo "2. Start your development server: npm run dev"
echo "3. Run Cypress tests: npm run cypress:open"
echo ""
echo "✨ Cypress testing environment is ready!"
EOF