// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to sign in a user
       * @example cy.signIn('email@example.com', 'password')
       */
      signIn(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to create a test user
       * @example cy.createTestUser()
       */
      createTestUser(): Chainable<any>
      
      /**
       * Custom command to clean up test data
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>
      
      /**
       * Custom command to create a family tree
       * @example cy.createFamilyTree('My Family Tree', 'A description')
       */
      createFamilyTree(name: string, description?: string): Chainable<any>
      
      /**
       * Custom command to add a person to family tree
       * @example cy.addPersonToTree('John', 'Doe', '1980-01-01')
       */
      addPersonToTree(firstName: string, lastName: string, birthDate?: string): Chainable<any>
    }
  }
}