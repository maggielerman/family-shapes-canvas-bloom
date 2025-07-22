describe('Family Connections and Relationships', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should allow creating parent-child relationships', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add parent and child
    const parent = this.testData.people.parents[0]
    const child = this.testData.people.children[0]
    
    cy.addPersonToTree(parent.firstName, parent.lastName, parent.birthDate)
    cy.addPersonToTree(child.firstName, child.lastName, child.birthDate)
    
    // Navigate to connections management
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    
    // Select parent and child
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${parent.firstName}-${parent.lastName}"]`).click()
    
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${child.firstName}-${child.lastName}"]`).click()
    
    // Set relationship type
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-parent-child"]').click()
    
    // Add relationship attributes
    cy.get('[data-testid="relationship-direction-select"]').click()
    cy.get('[data-testid="direction-parent-to-child"]').click()
    
    // Save the connection
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Verify connection was created
    cy.get('[data-testid="success-message"]').should('contain', 'Connection created successfully')
    cy.get('[data-testid="connection-list"]').should('contain', `${parent.firstName} ${parent.lastName}`)
    cy.get('[data-testid="connection-list"]').should('contain', `${child.firstName} ${child.lastName}`)
    cy.get('[data-testid="connection-list"]').should('contain', 'Parent-Child')
  })

  it('should allow creating spouse relationships', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add two people who will be spouses
    const spouse1 = this.testData.people.parents[0]
    const spouse2 = this.testData.people.parents[1]
    
    cy.addPersonToTree(spouse1.firstName, spouse1.lastName, spouse1.birthDate)
    cy.addPersonToTree(spouse2.firstName, spouse2.lastName, spouse2.birthDate)
    
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    
    // Select both spouses
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${spouse1.firstName}-${spouse1.lastName}"]`).click()
    
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${spouse2.firstName}-${spouse2.lastName}"]`).click()
    
    // Set relationship as spouse
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-spouse"]').click()
    
    // Add marriage details
    cy.get('[data-testid="marriage-date-input"]').type('1985-06-15')
    cy.get('[data-testid="marriage-location-input"]').type('New York, NY')
    
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Verify spouse connection
    cy.get('[data-testid="success-message"]').should('contain', 'Connection created successfully')
    cy.get('[data-testid="connection-list"]').should('contain', 'Spouse')
    cy.get('[data-testid="marriage-info"]').should('contain', '1985-06-15')
  })

  it('should allow creating sibling relationships', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add siblings
    const sibling1 = this.testData.people.children[0]
    const sibling2 = this.testData.people.children[1]
    
    cy.addPersonToTree(sibling1.firstName, sibling1.lastName, sibling1.birthDate)
    cy.addPersonToTree(sibling2.firstName, sibling2.lastName, sibling2.birthDate)
    
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    
    // Select siblings
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${sibling1.firstName}-${sibling1.lastName}"]`).click()
    
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${sibling2.firstName}-${sibling2.lastName}"]`).click()
    
    // Set relationship as sibling
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-sibling"]').click()
    
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Verify sibling connection
    cy.get('[data-testid="success-message"]').should('contain', 'Connection created successfully')
    cy.get('[data-testid="connection-list"]').should('contain', 'Sibling')
  })

  it('should validate relationship constraints and prevent invalid connections', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    const person = this.testData.people.parents[0]
    cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    
    // Try to create self-relationship
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${person.firstName}-${person.lastName}"]`).click()
    
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${person.firstName}-${person.lastName}"]`).click()
    
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('contain', 'Cannot create relationship with self')
  })

  it('should allow editing existing relationships', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add people and create initial relationship
    const parent = this.testData.people.parents[0]
    const child = this.testData.people.children[0]
    
    cy.addPersonToTree(parent.firstName, parent.lastName, parent.birthDate)
    cy.addPersonToTree(child.firstName, child.lastName, child.birthDate)
    
    // Create parent-child relationship
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${parent.firstName}-${parent.lastName}"]`).click()
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${child.firstName}-${child.lastName}"]`).click()
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-parent-child"]').click()
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Edit the relationship
    cy.get('[data-testid="connection-item"]').first().within(() => {
      cy.get('[data-testid="edit-connection-button"]').click()
    })
    
    // Add notes to the relationship
    cy.get('[data-testid="relationship-notes-input"]').type('Biological father and son relationship')
    cy.get('[data-testid="update-connection-button"]').click()
    
    // Verify update
    cy.get('[data-testid="success-message"]').should('contain', 'Connection updated successfully')
    cy.get('[data-testid="connection-item"]').should('contain', 'Biological father and son')
  })

  it('should allow deleting relationships', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add people and create relationship
    const person1 = this.testData.people.children[0]
    const person2 = this.testData.people.children[1]
    
    cy.addPersonToTree(person1.firstName, person1.lastName, person1.birthDate)
    cy.addPersonToTree(person2.firstName, person2.lastName, person2.birthDate)
    
    // Create sibling relationship
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${person1.firstName}-${person1.lastName}"]`).click()
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${person2.firstName}-${person2.lastName}"]`).click()
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-sibling"]').click()
    cy.get('[data-testid="save-connection-button"]').click()
    
    // Delete the relationship
    cy.get('[data-testid="connection-item"]').first().within(() => {
      cy.get('[data-testid="delete-connection-button"]').click()
    })
    
    // Confirm deletion
    cy.get('[data-testid="confirm-delete-button"]').click()
    
    // Verify deletion
    cy.get('[data-testid="success-message"]').should('contain', 'Connection deleted successfully')
    cy.get('[data-testid="connection-item"]').should('not.exist')
  })

  it('should show connection history and relationship changes', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    const spouse1 = this.testData.people.parents[0]
    const spouse2 = this.testData.people.parents[1]
    
    cy.addPersonToTree(spouse1.firstName, spouse1.lastName, spouse1.birthDate)
    cy.addPersonToTree(spouse2.firstName, spouse2.lastName, spouse2.birthDate)
    
    // Create and modify relationship
    cy.get('[data-testid="connections-tab"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    cy.get('[data-testid="person1-select"]').click()
    cy.get(`[data-testid="person-option-${spouse1.firstName}-${spouse1.lastName}"]`).click()
    cy.get('[data-testid="person2-select"]').click()
    cy.get(`[data-testid="person-option-${spouse2.firstName}-${spouse2.lastName}"]`).click()
    cy.get('[data-testid="relationship-type-select"]').click()
    cy.get('[data-testid="relationship-spouse"]').click()
    cy.get('[data-testid="save-connection-button"]').click()
    
    // View connection history
    cy.get('[data-testid="connection-item"]').first().within(() => {
      cy.get('[data-testid="view-history-button"]').click()
    })
    
    // Verify history is displayed
    cy.get('[data-testid="connection-history-modal"]').should('be.visible')
    cy.get('[data-testid="history-entry"]').should('contain', 'Connection created')
    cy.get('[data-testid="history-timestamp"]').should('be.visible')
  })
})