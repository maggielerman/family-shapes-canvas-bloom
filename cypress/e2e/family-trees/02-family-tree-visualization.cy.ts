describe('Family Tree Visualization', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should display family tree visualization with multiple layout options', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Create a family tree with multiple people
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add multiple people to create a meaningful visualization
    const grandparents = this.testData.people.grandparents
    const parents = this.testData.people.parents
    const children = this.testData.people.children
    
    // Add grandparents
    grandparents.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    
    // Add parents
    parents.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    
    // Add children
    children.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    
    // Switch to visualization tab
    cy.get('[data-testid="visualization-tab"]').click()
    
    // Verify visualization is loaded
    cy.get('[data-testid="family-tree-visualization"]').should('be.visible')
    cy.get('[data-testid="person-node"]').should('have.length.at.least', 5)
    
    // Test layout options
    const layouts = ['hierarchical', 'force-directed', 'circular', 'tree']
    layouts.forEach(layout => {
      cy.get('[data-testid="layout-selector"]').click()
      cy.get(`[data-testid="layout-${layout}"]`).click()
      cy.get('[data-testid="family-tree-visualization"]').should('be.visible')
      cy.wait(1000) // Allow layout to render
    })
  })

  it('should allow zooming and panning in the visualization', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add a few people
    this.testData.people.parents.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    
    cy.get('[data-testid="visualization-tab"]').click()
    cy.get('[data-testid="family-tree-visualization"]').should('be.visible')
    
    // Test zoom in
    cy.get('[data-testid="zoom-in-button"]').click()
    cy.get('[data-testid="zoom-level"]').should('contain', '110%')
    
    // Test zoom out
    cy.get('[data-testid="zoom-out-button"]').click()
    cy.get('[data-testid="zoom-level"]').should('contain', '100%')
    
    // Test reset view
    cy.get('[data-testid="reset-view-button"]').click()
    cy.get('[data-testid="zoom-level"]').should('contain', '100%')
    
    // Test drag to pan (simulate mouse events)
    cy.get('[data-testid="family-tree-visualization"]')
      .trigger('mousedown', { which: 1, pageX: 300, pageY: 300 })
      .trigger('mousemove', { which: 1, pageX: 350, pageY: 350 })
      .trigger('mouseup')
  })

  it('should show person details when clicking on nodes', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    const person = this.testData.people.parents[0]
    cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    
    cy.get('[data-testid="visualization-tab"]').click()
    
    // Click on person node
    cy.get('[data-testid="person-node"]').first().click()
    
    // Verify person details modal/panel appears
    cy.get('[data-testid="person-details-modal"]').should('be.visible')
    cy.get('[data-testid="person-name"]').should('contain', `${person.firstName} ${person.lastName}`)
    cy.get('[data-testid="person-birth-date"]').should('contain', person.birthDate)
    
    // Close modal
    cy.get('[data-testid="close-modal-button"]').click()
    cy.get('[data-testid="person-details-modal"]').should('not.exist')
  })

  it('should support fullscreen mode for better visualization', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add people to visualize
    this.testData.people.children.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    
    cy.get('[data-testid="visualization-tab"]').click()
    
    // Enter fullscreen
    cy.get('[data-testid="fullscreen-button"]').click()
    cy.get('[data-testid="family-tree-visualization"]').should('have.class', 'fullscreen')
    
    // Exit fullscreen
    cy.get('[data-testid="exit-fullscreen-button"]').click()
    cy.get('[data-testid="family-tree-visualization"]').should('not.have.class', 'fullscreen')
  })

  it('should display relationship lines between connected people', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add related people
    const parent = this.testData.people.parents[0]
    const child = this.testData.people.children[0]
    
    cy.addPersonToTree(parent.firstName, parent.lastName, parent.birthDate)
    cy.addPersonToTree(child.firstName, child.lastName, child.birthDate)
    
    // Create relationship
    cy.get('[data-testid="manage-connections-button"]').click()
    cy.get('[data-testid="add-connection-button"]').click()
    cy.get('[data-testid="person1-select"]').select(`${parent.firstName} ${parent.lastName}`)
    cy.get('[data-testid="person2-select"]').select(`${child.firstName} ${child.lastName}`)
    cy.get('[data-testid="relationship-type-select"]').select('parent-child')
    cy.get('[data-testid="save-connection-button"]').click()
    
    cy.get('[data-testid="visualization-tab"]').click()
    
    // Verify relationship lines are visible
    cy.get('[data-testid="relationship-line"]').should('be.visible')
    cy.get('[data-testid="relationship-label"]').should('contain', 'Parent-Child')
  })

  it('should show generation levels and family structure clearly', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Add people from different generations
    this.testData.people.grandparents.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    this.testData.people.parents.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    this.testData.people.children.forEach(person => {
      cy.addPersonToTree(person.firstName, person.lastName, person.birthDate)
    })
    
    // Set up relationships to establish generational structure
    // (This would involve creating parent-child relationships)
    
    cy.get('[data-testid="visualization-tab"]').click()
    cy.get('[data-testid="layout-selector"]').click()
    cy.get('[data-testid="layout-hierarchical"]').click()
    
    // Verify generation levels are clearly displayed
    cy.get('[data-testid="generation-level-1"]').should('be.visible')
    cy.get('[data-testid="generation-level-2"]').should('be.visible')
    cy.get('[data-testid="generation-level-3"]').should('be.visible')
    
    // Check legend
    cy.get('[data-testid="tree-legend"]').should('be.visible')
    cy.get('[data-testid="legend-generation-colors"]').should('be.visible')
  })
})