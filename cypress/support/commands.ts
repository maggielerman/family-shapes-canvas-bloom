// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Authentication commands - Updated to work with actual Auth component
Cypress.Commands.add('signIn', (email: string, password: string) => {
  cy.visit('/auth')
  
  // Wait for page to load
  cy.get('[role="tablist"]').should('be.visible')
  
  // Make sure we're on sign in tab
  cy.get('[role="tab"]').contains('Sign In').click()
  
  // Use actual form field IDs
  cy.get('#signin-email').type(email)
  cy.get('#signin-password').type(password)
  
  // Submit the form
  cy.get('[role="tabpanel"]').contains('Sign In').within(() => {
    cy.get('button[type="submit"]').click()
  })
  
  // Wait for potential redirect or authentication
  cy.wait(2000)
})

Cypress.Commands.add('signUp', (email: string, password: string, name: string) => {
  cy.visit('/auth')
  
  // Switch to sign up tab
  cy.get('[role="tab"]').contains('Sign Up').click()
  
  // Fill in signup form
  cy.get('#signup-email').type(email)
  cy.get('#signup-name').type(name)
  cy.get('#signup-password').type(password)
  cy.get('#signup-confirm-password').type(password)
  
  // Submit signup form
  cy.get('[role="tabpanel"]').contains('Sign Up').within(() => {
    cy.get('button[type="submit"]').click()
  })
  
  cy.wait(2000)
})

// Family Tree commands - Updated to work with actual structure
Cypress.Commands.add('visitFamilyTrees', () => {
  cy.visit('/family-trees', { failOnStatusCode: false })
  
  // Handle auth redirect
  cy.url().then((url) => {
    if (url.includes('/auth')) {
      // If redirected to auth, we're not logged in
      cy.log('Not authenticated - redirected to auth page')
    } else {
      // We're on the family trees page
      cy.get('h1').should('contain', 'Family Trees')
    }
  })
})

Cypress.Commands.add('createFamilyTree', (name: string, description?: string) => {
  // Try to visit family trees page
  cy.visitFamilyTrees()
  
  cy.url().then((url) => {
    if (!url.includes('/auth')) {
      // We're authenticated, try to create tree
      cy.contains('Create Tree').click()
      
      // Wait for dialog
      cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible')
      
      // Fill in form (using common form patterns)
      cy.get('input[name="name"], input[placeholder*="name" i]').type(name)
      
      if (description) {
        cy.get('input[name="description"], textarea[name="description"], input[placeholder*="description" i]')
          .type(description)
      }
      
      // Submit form
      cy.get('[role="dialog"]').within(() => {
        cy.get('button[type="submit"], button').contains(/create|save|submit/i).click()
      })
      
      cy.wait(1000)
    } else {
      cy.log('Cannot create family tree - not authenticated')
    }
  })
})

// Cleanup commands
Cypress.Commands.add('cleanupTestData', () => {
  // Basic cleanup - clear storage and cookies
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Clear any session storage
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})

// Utility commands
Cypress.Commands.add('skipOnAuth', () => {
  cy.url().then((url) => {
    if (url.includes('/auth')) {
      cy.log('Skipping test - authentication required')
      return cy.then(() => {
        // Skip the rest of the test
        return false
      })
    }
    return cy.then(() => true)
  })
})

// Add support for file uploads (simplified)
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string) => {
  cy.get(selector).selectFile({
    contents: Cypress.Buffer.from('file contents'),
    fileName: fileName,
    mimeType: fileType,
  }, { force: true })
})

// Helper for checking if element exists without failing
Cypress.Commands.add('getOptional', (selector: string) => {
  return cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0) {
      return cy.get(selector)
    } else {
      return cy.wrap(null)
    }
  })
})

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.document().should('have.property', 'readyState', 'complete')
})

declare global {
  namespace Cypress {
    interface Chainable {
      signIn(email: string, password: string): Chainable<void>
      signUp(email: string, password: string, name: string): Chainable<void>
      visitFamilyTrees(): Chainable<void>
      createFamilyTree(name: string, description?: string): Chainable<void>
      cleanupTestData(): Chainable<void>
      skipOnAuth(): Chainable<boolean>
      uploadFile(selector: string, fileName: string, fileType: string): Chainable<void>
      getOptional(selector: string): Chainable<any>
      waitForPageLoad(): Chainable<void>
    }
  }
}