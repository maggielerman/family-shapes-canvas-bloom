describe('Family Tree Creation', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should allow users to create a new family tree', function() {
    // Sign in with test user
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Navigate to family trees page
    cy.visit('/family-trees')
    cy.get('[data-testid="page-title"]').should('contain', 'Family Trees')
    
    // Click create new tree button
    cy.get('[data-testid="create-tree-button"]').click()
    
    // Fill in tree details
    const treeData = this.testData.familyTrees.smithFamily
    cy.get('[data-testid="tree-name-input"]').type(treeData.name)
    cy.get('[data-testid="tree-description-input"]').type(treeData.description)
    
    // Select visibility settings
    cy.get('[data-testid="visibility-select"]').click()
    cy.get('[data-testid="visibility-private"]').click()
    
    // Create the tree
    cy.get('[data-testid="create-tree-submit"]').click()
    
    // Verify tree was created
    cy.get('[data-testid="success-message"]').should('contain', 'Family tree created successfully')
    cy.url().should('include', '/family-trees/')
    cy.get('[data-testid="tree-title"]').should('contain', treeData.name)
    cy.get('[data-testid="tree-description"]').should('contain', treeData.description)
  })

  it('should validate required fields when creating a tree', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/family-trees')
    
    // Try to create tree without name
    cy.get('[data-testid="create-tree-button"]').click()
    cy.get('[data-testid="create-tree-submit"]').click()
    
    // Verify validation error
    cy.get('[data-testid="name-error"]').should('contain', 'Name is required')
    
    // Fill name but make it too short
    cy.get('[data-testid="tree-name-input"]').type('Ab')
    cy.get('[data-testid="create-tree-submit"]').click()
    cy.get('[data-testid="name-error"]').should('contain', 'Name must be at least 3 characters')
  })

  it('should handle duplicate tree names within user account', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    
    // Create first tree
    const treeData = this.testData.familyTrees.smithFamily
    cy.createFamilyTree(treeData.name, treeData.description)
    
    // Try to create second tree with same name
    cy.visit('/family-trees')
    cy.get('[data-testid="create-tree-button"]').click()
    cy.get('[data-testid="tree-name-input"]').type(treeData.name)
    cy.get('[data-testid="create-tree-submit"]').click()
    
    // Verify error handling
    cy.get('[data-testid="error-message"]').should('contain', 'A tree with this name already exists')
  })

  it('should allow creating trees with different visibility levels', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/family-trees')
    
    const visibilityLevels = ['private', 'family-only', 'public']
    
    visibilityLevels.forEach((visibility, index) => {
      cy.get('[data-testid="create-tree-button"]').click()
      cy.get('[data-testid="tree-name-input"]').type(`Test Tree ${visibility}`)
      cy.get('[data-testid="visibility-select"]').click()
      cy.get(`[data-testid="visibility-${visibility}"]`).click()
      cy.get('[data-testid="create-tree-submit"]').click()
      
      cy.get('[data-testid="success-message"]').should('be.visible')
      cy.visit('/family-trees') // Return to main page for next iteration
    })
    
    // Verify all trees were created with correct visibility
    cy.get('[data-testid="tree-card"]').should('have.length', 3)
  })
})