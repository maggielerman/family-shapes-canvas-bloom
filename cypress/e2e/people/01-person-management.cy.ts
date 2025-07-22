describe('Person Management', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should allow creating a new person with all details', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Navigate to people page
    cy.visit('/people')
    cy.get('[data-testid="page-title"]').should('contain', 'People')
    
    // Click add new person
    cy.get('[data-testid="add-person-button"]').click()
    
    // Fill in person details
    const person = this.testData.people.parents[0]
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    
    // Select gender
    cy.get('[data-testid="gender-select"]').click()
    cy.get(`[data-testid="gender-${person.gender}"]`).click()
    
    // Add notes
    cy.get('[data-testid="notes-textarea"]').type(person.notes)
    
    // Add contact information
    cy.get('[data-testid="email-input"]').type('robert.smith@email.com')
    cy.get('[data-testid="phone-input"]').type('555-123-4567')
    
    // Add address
    cy.get('[data-testid="address-street-input"]').type('123 Main Street')
    cy.get('[data-testid="address-city-input"]').type('Anytown')
    cy.get('[data-testid="address-state-input"]').type('CA')
    cy.get('[data-testid="address-zip-input"]').type('12345')
    
    // Save the person
    cy.get('[data-testid="save-person-button"]').click()
    
    // Verify person was created
    cy.get('[data-testid="success-message"]').should('contain', 'Person created successfully')
    cy.get('[data-testid="person-card"]').should('contain', `${person.firstName} ${person.lastName}`)
    cy.get('[data-testid="person-card"]').should('contain', person.birthDate)
  })

  it('should validate required fields when creating a person', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Try to create person without required fields
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="save-person-button"]').click()
    
    // Verify validation errors
    cy.get('[data-testid="first-name-error"]').should('contain', 'First name is required')
    cy.get('[data-testid="last-name-error"]').should('contain', 'Last name is required')
    
    // Fill first name but make it too short
    cy.get('[data-testid="first-name-input"]').type('A')
    cy.get('[data-testid="save-person-button"]').click()
    cy.get('[data-testid="first-name-error"]').should('contain', 'First name must be at least 2 characters')
    
    // Test invalid birth date
    cy.get('[data-testid="first-name-input"]').clear().type('John')
    cy.get('[data-testid="last-name-input"]').type('Doe')
    cy.get('[data-testid="birth-date-input"]').type('invalid-date')
    cy.get('[data-testid="save-person-button"]').click()
    cy.get('[data-testid="birth-date-error"]').should('contain', 'Invalid date format')
  })

  it('should allow viewing person details', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person first
    const person = this.testData.people.children[0]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="gender-select"]').click()
    cy.get(`[data-testid="gender-${person.gender}"]`).click()
    cy.get('[data-testid="notes-textarea"]').type(person.notes)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Click to view person details
    cy.get('[data-testid="person-card"]').first().click()
    
    // Verify details modal/page
    cy.get('[data-testid="person-details-modal"]').should('be.visible')
    cy.get('[data-testid="person-full-name"]').should('contain', `${person.firstName} ${person.lastName}`)
    cy.get('[data-testid="person-birth-date"]').should('contain', person.birthDate)
    cy.get('[data-testid="person-gender"]').should('contain', person.gender)
    cy.get('[data-testid="person-notes"]').should('contain', person.notes)
  })

  it('should allow editing person information', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person first
    const originalPerson = this.testData.people.children[1]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(originalPerson.firstName)
    cy.get('[data-testid="last-name-input"]').type(originalPerson.lastName)
    cy.get('[data-testid="birth-date-input"]').type(originalPerson.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Edit the person
    cy.get('[data-testid="person-card"]').first().within(() => {
      cy.get('[data-testid="edit-person-button"]').click()
    })
    
    // Update information
    const updatedInfo = {
      firstName: 'Updated',
      lastName: 'Name',
      notes: 'Updated notes for this person'
    }
    
    cy.get('[data-testid="first-name-input"]').clear().type(updatedInfo.firstName)
    cy.get('[data-testid="last-name-input"]').clear().type(updatedInfo.lastName)
    cy.get('[data-testid="notes-textarea"]').clear().type(updatedInfo.notes)
    
    // Add death date
    cy.get('[data-testid="death-date-input"]').type('2023-12-31')
    
    // Save changes
    cy.get('[data-testid="save-person-button"]').click()
    
    // Verify updates
    cy.get('[data-testid="success-message"]').should('contain', 'Person updated successfully')
    cy.get('[data-testid="person-card"]').should('contain', `${updatedInfo.firstName} ${updatedInfo.lastName}`)
    cy.get('[data-testid="person-card"]').should('contain', '2023-12-31')
  })

  it('should allow deleting a person with confirmation', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person first
    const person = this.testData.people.children[2]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Delete the person
    cy.get('[data-testid="person-card"]').first().within(() => {
      cy.get('[data-testid="delete-person-button"]').click()
    })
    
    // Confirm deletion in modal
    cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible')
    cy.get('[data-testid="delete-confirmation-text"]').should('contain', `${person.firstName} ${person.lastName}`)
    cy.get('[data-testid="confirm-delete-button"]').click()
    
    // Verify deletion
    cy.get('[data-testid="success-message"]').should('contain', 'Person deleted successfully')
    cy.get('[data-testid="person-card"]').should('not.exist')
  })

  it('should prevent deleting a person with existing relationships', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Create a family tree and add people with relationships
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    const parent = this.testData.people.parents[0]
    const child = this.testData.people.children[0]
    
    cy.addPersonToTree(parent.firstName, parent.lastName, parent.birthDate)
    cy.addPersonToTree(child.firstName, child.lastName, child.birthDate)
    
    // Create relationship between them
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${parent.firstName}-${parent.lastName}"]`).click()
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${child.firstName}-${child.lastName}"]`).click()
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-parent-child"]').click()
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Try to delete the parent
    cy.visit('/people')
    cy.get('[data-testid="person-card"]').contains(`${parent.firstName} ${parent.lastName}`).within(() => {
      cy.get('[data-testid="delete-person-button"]').click()
    })
    
    // Verify warning about existing relationships
    cy.get('[data-testid="delete-warning-modal"]').should('be.visible')
    cy.get('[data-testid="warning-text"]').should('contain', 'This person has existing relationships')
    cy.get('[data-testid="relationship-count"]').should('contain', '1 relationship')
    
    // Cancel deletion
    cy.get('[data-testid="cancel-delete-button"]').click()
    cy.get('[data-testid="person-card"]').should('contain', `${parent.firstName} ${parent.lastName}`)
  })

  it('should support searching and filtering people', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Add multiple people
    const people = [
      ...this.testData.people.grandparents,
      ...this.testData.people.parents,
      ...this.testData.people.children
    ]
    
    people.forEach(person => {
      cy.get('[data-testid="add-person-button"]').click()
      cy.get('[data-testid="first-name-input"]').type(person.firstName)
      cy.get('[data-testid="last-name-input"]').type(person.lastName)
      cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
      cy.get('[data-testid="gender-select"]').click()
      cy.get(`[data-testid="gender-${person.gender}"]`).click()
      cy.get('[data-testid="save-person-button"]').click()
      cy.wait(500) // Allow person to be created
    })
    
    // Test search functionality
    cy.get('[data-testid="search-input"]').type('William')
    cy.get('[data-testid="person-card"]').should('have.length', 1)
    cy.get('[data-testid="person-card"]').should('contain', 'William')
    
    // Clear search
    cy.get('[data-testid="search-input"]').clear()
    cy.get('[data-testid="person-card"]').should('have.length.greaterThan', 1)
    
    // Test gender filter
    cy.get('[data-testid="gender-filter"]').click()
    cy.get('[data-testid="filter-male"]').click()
    cy.get('[data-testid="person-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Male')
    })
    
    // Test generation filter
    cy.get('[data-testid="generation-filter"]').click()
    cy.get('[data-testid="filter-children"]').click()
    cy.get('[data-testid="person-card"]').should('have.length.lessThan', people.length)
  })

  it('should allow bulk operations on multiple people', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Add several people
    const peopleToAdd = this.testData.people.children
    
    peopleToAdd.forEach(person => {
      cy.get('[data-testid="add-person-button"]').click()
      cy.get('[data-testid="first-name-input"]').type(person.firstName)
      cy.get('[data-testid="last-name-input"]').type(person.lastName)
      cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
      cy.get('[data-testid="save-person-button"]').click()
      cy.wait(500)
    })
    
    // Enable bulk selection mode
    cy.get('[data-testid="bulk-select-toggle"]').click()
    
    // Select multiple people
    cy.get('[data-testid="person-checkbox"]').first().click()
    cy.get('[data-testid="person-checkbox"]').eq(1).click()
    
    // Perform bulk action
    cy.get('[data-testid="bulk-actions-menu"]').click()
    cy.get('[data-testid="bulk-export-button"]').click()
    
    // Verify export action
    cy.get('[data-testid="success-message"]').should('contain', 'Export completed')
    
    // Test bulk tag assignment
    cy.get('[data-testid="bulk-actions-menu"]').click()
    cy.get('[data-testid="bulk-tag-button"]').click()
    cy.get('[data-testid="tag-input"]').type('Family')
    cy.get('[data-testid="apply-tag-button"]').click()
    
    // Verify tags were applied
    cy.get('[data-testid="person-card"]').first().should('contain', 'Family')
    cy.get('[data-testid="person-card"]').eq(1).should('contain', 'Family')
  })
})