// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Authentication commands
Cypress.Commands.add('signIn', (email: string, password: string) => {
  cy.visit('/auth/signin')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="sign-in-button"]').click()
  cy.url().should('not.include', '/auth/signin')
})

Cypress.Commands.add('createTestUser', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  cy.visit('/auth/signin')
  cy.get('[data-testid="sign-up-link"]').click()
  cy.get('[data-testid="email-input"]').type(testEmail)
  cy.get('[data-testid="password-input"]').type(testPassword)
  cy.get('[data-testid="confirm-password-input"]').type(testPassword)
  cy.get('[data-testid="sign-up-button"]').click()
  
  return cy.wrap({ email: testEmail, password: testPassword })
})

// Family Tree commands
Cypress.Commands.add('createFamilyTree', (name: string, description?: string) => {
  cy.visit('/family-trees')
  cy.get('[data-testid="create-tree-button"]').click()
  cy.get('[data-testid="tree-name-input"]').type(name)
  
  if (description) {
    cy.get('[data-testid="tree-description-input"]').type(description)
  }
  
  cy.get('[data-testid="create-tree-submit"]').click()
  cy.get('[data-testid="tree-card"]').should('contain', name)
  
  return cy.get('[data-testid="tree-card"]').first().then(($el) => {
    const treeId = $el.attr('data-tree-id')
    return cy.wrap({ id: treeId, name, description })
  })
})

Cypress.Commands.add('addPersonToTree', (firstName: string, lastName: string, birthDate?: string) => {
  cy.get('[data-testid="add-person-button"]').click()
  cy.get('[data-testid="first-name-input"]').type(firstName)
  cy.get('[data-testid="last-name-input"]').type(lastName)
  
  if (birthDate) {
    cy.get('[data-testid="birth-date-input"]').type(birthDate)
  }
  
  cy.get('[data-testid="save-person-button"]').click()
  cy.get('[data-testid="person-card"]').should('contain', `${firstName} ${lastName}`)
  
  return cy.get('[data-testid="person-card"]').contains(`${firstName} ${lastName}`).then(($el) => {
    const personId = $el.closest('[data-testid="person-card"]').attr('data-person-id')
    return cy.wrap({ id: personId, firstName, lastName, birthDate })
  })
})

// Cleanup commands
Cypress.Commands.add('cleanupTestData', () => {
  // This would integrate with your API to clean up test data
  // For now, we'll just clear localStorage and cookies
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Add support for file uploads
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string) => {
  cy.get(selector).selectFile({
    contents: Cypress.Buffer.from('file contents'),
    fileName: fileName,
    mimeType: fileType,
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      uploadFile(selector: string, fileName: string, fileType: string): Chainable<void>
    }
  }
}