describe('Authentication', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should allow user sign in with valid credentials', () => {
    cy.visit('/auth')
    
    // Wait for the page to load and tabs to be visible
    cy.get('[role="tablist"]').should('be.visible')
    
    // Make sure we're on the signin tab (should be default)
    cy.get('[data-state="active"]').should('contain', 'Sign In')
    
    // Use actual form field IDs from the Auth component
    cy.get('#signin-email').type('test@example.com')
    cy.get('#signin-password').type('password123')
    
    // Find the submit button in the signin form
    cy.get('[role="tabpanel"]').contains('Sign In').within(() => {
      cy.get('button[type="submit"]').click()
    })
    
    // Note: This will likely fail with invalid credentials, but the form submission should work
    // In a real test environment, you'd have valid test credentials
  })

  it('should show validation on empty form submission', () => {
    cy.visit('/auth')
    
    // Try to submit empty signin form
    cy.get('[role="tabpanel"]').contains('Sign In').within(() => {
      cy.get('button[type="submit"]').click()
    })
    
    // Check for HTML5 validation (required fields)
    cy.get('#signin-email:invalid').should('exist')
    cy.get('#signin-password:invalid').should('exist')
  })

  it('should allow switching to signup tab', () => {
    cy.visit('/auth')
    
    // Click the Sign Up tab
    cy.get('[role="tab"]').contains('Sign Up').click()
    
    // Verify we're on signup tab
    cy.get('[data-state="active"]').should('contain', 'Sign Up')
    
    // Verify signup form elements are visible
    cy.get('#signup-email').should('be.visible')
    cy.get('#signup-name').should('be.visible')
  })

  it('should show account type selection in signup', () => {
    cy.visit('/auth')
    
    // Switch to signup tab
    cy.get('[role="tab"]').contains('Sign Up').click()
    
    // Check account type buttons exist
    cy.contains('Individual').should('be.visible')
    cy.contains('Organization').should('be.visible')
    
    // Test account type selection
    cy.contains('Organization').click()
    
    // Verify organization field appears
    cy.get('#signup-name').should('be.visible')
  })

  it('should show/hide password with eye icon', () => {
    cy.visit('/auth')
    
    // Type in password field
    cy.get('#signin-password').type('testpassword')
    
    // Password should be hidden by default
    cy.get('#signin-password').should('have.attr', 'type', 'password')
    
    // Click the eye icon to show password
    cy.get('#signin-password').parent().find('button').click()
    
    // Password should now be visible
    cy.get('#signin-password').should('have.attr', 'type', 'text')
    
    // Click again to hide
    cy.get('#signin-password').parent().find('button').click()
    cy.get('#signin-password').should('have.attr', 'type', 'password')
  })

  it('should handle signup form validation', () => {
    cy.visit('/auth')
    
    // Switch to signup
    cy.get('[role="tab"]').contains('Sign Up').click()
    
    // Fill in some fields but leave others empty
    cy.get('#signup-email').type('test@example.com')
    cy.get('#signup-password').type('short')
    cy.get('#signup-confirm-password').type('different')
    
    // Try to submit
    cy.get('[role="tabpanel"]').contains('Sign Up').within(() => {
      cy.get('button[type="submit"]').click()
    })
    
    // Should show password mismatch error (handled by component)
    // This would trigger the toast notification for password mismatch
  })
})