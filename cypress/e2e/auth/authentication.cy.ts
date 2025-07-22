describe('Authentication', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should allow user registration with valid credentials', function() {
    const newUser = {
      email: `newuser-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      firstName: 'New',
      lastName: 'User'
    }
    
    cy.visit('/auth/signin')
    cy.get('[data-testid="sign-up-link"]').click()
    
    // Fill registration form
    cy.get('[data-testid="first-name-input"]').type(newUser.firstName)
    cy.get('[data-testid="last-name-input"]').type(newUser.lastName)
    cy.get('[data-testid="email-input"]').type(newUser.email)
    cy.get('[data-testid="password-input"]').type(newUser.password)
    cy.get('[data-testid="confirm-password-input"]').type(newUser.password)
    
    // Accept terms
    cy.get('[data-testid="terms-checkbox"]').check()
    
    // Submit registration
    cy.get('[data-testid="sign-up-button"]').click()
    
    // Verify successful registration
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome')
  })

  it('should validate registration form fields', () => {
    cy.visit('/auth/signin')
    cy.get('[data-testid="sign-up-link"]').click()
    
    // Try to submit empty form
    cy.get('[data-testid="sign-up-button"]').click()
    
    // Verify validation errors
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    
    // Test invalid email
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="sign-up-button"]').click()
    cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format')
    
    // Test weak password
    cy.get('[data-testid="email-input"]').clear().type('valid@email.com')
    cy.get('[data-testid="password-input"]').type('weak')
    cy.get('[data-testid="sign-up-button"]').click()
    cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 8 characters')
    
    // Test password mismatch
    cy.get('[data-testid="password-input"]').clear().type('StrongPassword123!')
    cy.get('[data-testid="confirm-password-input"]').type('DifferentPassword123!')
    cy.get('[data-testid="sign-up-button"]').click()
    cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
  })

  it('should allow user sign in with valid credentials', function() {
    cy.visit('/auth/signin')
    
    // Use test user credentials
    cy.get('[data-testid="email-input"]').type(this.testData.users.testUser.email)
    cy.get('[data-testid="password-input"]').type(this.testData.users.testUser.password)
    cy.get('[data-testid="sign-in-button"]').click()
    
    // Verify successful login
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-menu"]').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/auth/signin')
    
    // Try invalid credentials
    cy.get('[data-testid="email-input"]').type('invalid@email.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="sign-in-button"]').click()
    
    // Verify error message
    cy.get('[data-testid="auth-error"]').should('contain', 'Invalid email or password')
    cy.url().should('include', '/auth/signin')
  })

  it('should support password reset flow', () => {
    cy.visit('/auth/signin')
    
    // Click forgot password
    cy.get('[data-testid="forgot-password-link"]').click()
    
    // Enter email for reset
    cy.get('[data-testid="reset-email-input"]').type('test@example.com')
    cy.get('[data-testid="send-reset-button"]').click()
    
    // Verify confirmation message
    cy.get('[data-testid="reset-confirmation"]').should('contain', 'Password reset email sent')
  })

  it('should allow user logout', function() {
    // Sign in first
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Logout
    cy.get('[data-testid="user-menu"]').click()
    cy.get('[data-testid="logout-button"]').click()
    
    // Verify logout
    cy.url().should('include', '/auth/signin')
    cy.get('[data-testid="user-menu"]').should('not.exist')
  })

  it('should persist session across page refreshes', function() {
    // Sign in
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Refresh page
    cy.reload()
    
    // Verify still logged in
    cy.get('[data-testid="user-menu"]').should('be.visible')
    cy.url().should('include', '/dashboard')
  })

  it('should redirect to login when accessing protected routes', () => {
    cy.visit('/family-trees')
    
    // Should redirect to login
    cy.url().should('include', '/auth/signin')
    cy.get('[data-testid="login-required-message"]').should('contain', 'Please sign in to access this page')
  })

  it('should redirect to originally requested page after login', () => {
    // Try to access protected page
    cy.visit('/people')
    cy.url().should('include', '/auth/signin')
    
    // Sign in
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="sign-in-button"]').click()
    
    // Should redirect to originally requested page
    cy.url().should('include', '/people')
  })
})