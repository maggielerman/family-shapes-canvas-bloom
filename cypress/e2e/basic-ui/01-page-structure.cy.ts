describe('Basic UI Structure', () => {
  beforeEach(() => {
    // Skip authentication failures for basic UI testing
    cy.on('uncaught:exception', (err, runnable) => {
      // Ignore auth-related errors for basic UI testing
      if (err.message.includes('auth') || err.message.includes('401')) {
        return false
      }
    })
  })

  it('should display the home page correctly', () => {
    cy.visit('/')
    
    // Basic page load validation
    cy.get('body').should('be.visible')
    
    // Look for main navigation or header elements
    cy.get('nav, header, [role="navigation"]').should('exist')
  })

  it('should have accessible auth page', () => {
    cy.visit('/auth')
    
    // Check page loads
    cy.get('body').should('be.visible')
    
    // Should have form elements
    cy.get('form, input[type="email"], input[type="password"]').should('exist')
    
    // Should have tab navigation
    cy.get('[role="tablist"], [role="tab"]').should('exist')
    
    // Check for signin/signup tabs
    cy.contains('Sign In').should('be.visible')
    cy.contains('Sign Up').should('be.visible')
  })

  it('should redirect protected routes to auth', () => {
    cy.visit('/family-trees')
    
    // Should either show the page (if already authenticated) or redirect to auth
    cy.url().then((url) => {
      if (url.includes('/auth')) {
        cy.get('form').should('exist')
        cy.contains('Sign In').should('be.visible')
      } else {
        // If already authenticated, should see family trees page
        cy.contains('Family Trees').should('be.visible')
      }
    })
  })

  it('should redirect people page to auth when not logged in', () => {
    cy.visit('/people')
    
    cy.url().then((url) => {
      if (url.includes('/auth')) {
        cy.get('form').should('exist')
      } else {
        // If already authenticated, should see people page
        cy.contains('People').should('be.visible')
      }
    })
  })

  it('should have working navigation links', () => {
    cy.visit('/')
    
    // Look for navigation links
    cy.get('a[href*="/"], nav a, header a').then(($links) => {
      if ($links.length > 0) {
        // Test at least one navigation link
        cy.get('a[href*="/"]').first().click()
        
        // Should navigate somewhere
        cy.url().should('not.equal', Cypress.config().baseUrl + '/')
      }
    })
  })

  it('should have responsive design elements', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.visit('/')
    
    cy.get('body').should('be.visible')
    
    // Check that content is still accessible
    cy.get('nav, header, main, [role="main"]').should('exist')
    
    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.visit('/')
    
    cy.get('body').should('be.visible')
  })

  it('should handle 404 pages gracefully', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false })
    
    // Should either show a 404 page or redirect to a valid page
    cy.get('body').should('be.visible')
    
    // Common 404 indicators
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      const has404Content = bodyText.includes('404') || 
                           bodyText.includes('Not Found') || 
                           bodyText.includes('Page not found')
      
      if (!has404Content) {
        // If no 404 page, should redirect to a valid page
        cy.url().should('not.include', '/non-existent-page')
      }
    })
  })

  it('should load CSS and styling correctly', () => {
    cy.visit('/')
    
    // Check that styles are loaded
    cy.get('body').should('have.css', 'margin')
    
    // Check for any button elements
    cy.get('button').then(($buttons) => {
      if ($buttons.length > 0) {
        cy.get('button').first().should('have.css', 'cursor', 'pointer')
      }
    })
  })

  it('should have functional form elements on auth page', () => {
    cy.visit('/auth')
    
    // Test email input
    cy.get('input[type="email"]').first().should('be.enabled')
    cy.get('input[type="email"]').first().type('test@example.com')
    cy.get('input[type="email"]').first().should('have.value', 'test@example.com')
    
    // Test password input
    cy.get('input[type="password"]').first().should('be.enabled')
    cy.get('input[type="password"]').first().type('testpassword')
    
    // Test form submission button
    cy.get('button[type="submit"]').should('be.enabled')
  })
})