describe('Person Profile Management', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
    cy.cleanupTestData()
  })

  it('should allow uploading and managing profile photos', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person first
    const person = this.testData.people.parents[0]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Open person profile
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="edit-profile-button"]').click()
    
    // Upload profile photo
    cy.get('[data-testid="upload-photo-section"]').should('be.visible')
    cy.uploadFile('[data-testid="photo-upload-input"]', 'profile-photo.jpg', 'image/jpeg')
    
    // Verify photo upload
    cy.get('[data-testid="uploaded-photo-preview"]').should('be.visible')
    cy.get('[data-testid="save-profile-button"]').click()
    
    // Verify photo is displayed in person card
    cy.get('[data-testid="person-card"]').first().within(() => {
      cy.get('[data-testid="person-photo"]').should('be.visible')
    })
  })

  it('should allow adding multiple life events and milestones', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person
    const person = this.testData.people.children[0]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Open person profile
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="life-events-tab"]').click()
    
    // Add graduation event
    cy.get('[data-testid="add-life-event-button"]').click()
    cy.get('[data-testid="event-type-select"]').click()
    cy.get('[data-testid="event-type-graduation"]').click()
    cy.get('[data-testid="event-date-input"]').type('2003-06-15')
    cy.get('[data-testid="event-description-input"]').type('Graduated from Harvard University with honors')
    cy.get('[data-testid="event-location-input"]').type('Cambridge, MA')
    cy.get('[data-testid="save-event-button"]').click()
    
    // Add marriage event
    cy.get('[data-testid="add-life-event-button"]').click()
    cy.get('[data-testid="event-type-select"]').click()
    cy.get('[data-testid="event-type-marriage"]').click()
    cy.get('[data-testid="event-date-input"]').type('2008-09-20')
    cy.get('[data-testid="event-description-input"]').type('Married to Jane Doe')
    cy.get('[data-testid="event-location-input"]').type('Seattle, WA')
    cy.get('[data-testid="save-event-button"]').click()
    
    // Verify events are displayed
    cy.get('[data-testid="life-event-item"]').should('have.length', 2)
    cy.get('[data-testid="life-event-item"]').first().should('contain', 'Graduation')
    cy.get('[data-testid="life-event-item"]').eq(1).should('contain', 'Marriage')
  })

  it('should support adding occupation and career history', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person
    const person = this.testData.people.parents[1]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Open person profile and career section
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="career-tab"]').click()
    
    // Add current occupation
    cy.get('[data-testid="add-occupation-button"]').click()
    cy.get('[data-testid="job-title-input"]').type('Registered Nurse')
    cy.get('[data-testid="company-input"]').type('City General Hospital')
    cy.get('[data-testid="start-date-input"]').type('1985-03-01')
    cy.get('[data-testid="current-job-checkbox"]').check()
    cy.get('[data-testid="job-description-textarea"]').type('Provides patient care in the emergency department')
    cy.get('[data-testid="save-occupation-button"]').click()
    
    // Add previous occupation
    cy.get('[data-testid="add-occupation-button"]').click()
    cy.get('[data-testid="job-title-input"]').type('Student Nurse')
    cy.get('[data-testid="company-input"]').type('University Medical Center')
    cy.get('[data-testid="start-date-input"]').type('1982-09-01')
    cy.get('[data-testid="end-date-input"]').type('1985-02-28')
    cy.get('[data-testid="job-description-textarea"]').type('Clinical rotations and nursing education')
    cy.get('[data-testid="save-occupation-button"]').click()
    
    // Verify career history
    cy.get('[data-testid="occupation-item"]').should('have.length', 2)
    cy.get('[data-testid="occupation-item"]').first().should('contain', 'Registered Nurse')
    cy.get('[data-testid="occupation-item"]').first().should('contain', 'Current')
  })

  it('should allow adding family medical history', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person
    const person = this.testData.people.grandparents[0]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Open medical history section
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="medical-tab"]').click()
    
    // Add medical condition
    cy.get('[data-testid="add-medical-condition-button"]').click()
    cy.get('[data-testid="condition-name-input"]').type('Diabetes Type 2')
    cy.get('[data-testid="diagnosis-date-input"]').type('1975-08-15')
    cy.get('[data-testid="condition-notes-textarea"]').type('Managed with diet and medication')
    cy.get('[data-testid="save-condition-button"]').click()
    
    // Add family medical history
    cy.get('[data-testid="add-family-history-button"]').click()
    cy.get('[data-testid="family-condition-input"]').type('Heart Disease')
    cy.get('[data-testid="family-relation-select"]').click()
    cy.get('[data-testid="relation-father"]').click()
    cy.get('[data-testid="family-notes-textarea"]').type('Father had heart attack at age 65')
    cy.get('[data-testid="save-family-history-button"]').click()
    
    // Verify medical information
    cy.get('[data-testid="medical-condition-item"]').should('contain', 'Diabetes Type 2')
    cy.get('[data-testid="family-history-item"]').should('contain', 'Heart Disease')
    cy.get('[data-testid="family-history-item"]').should('contain', 'Father')
  })

  it('should support adding documents and media files', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person
    const person = this.testData.people.children[1]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Open documents section
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="documents-tab"]').click()
    
    // Upload birth certificate
    cy.get('[data-testid="upload-document-button"]').click()
    cy.get('[data-testid="document-type-select"]').click()
    cy.get('[data-testid="document-type-birth-certificate"]').click()
    cy.uploadFile('[data-testid="document-file-input"]', 'birth-certificate.pdf', 'application/pdf')
    cy.get('[data-testid="document-title-input"]').type('Birth Certificate')
    cy.get('[data-testid="document-description-textarea"]').type('Official birth certificate from hospital')
    cy.get('[data-testid="save-document-button"]').click()
    
    // Upload photo album
    cy.get('[data-testid="upload-media-button"]').click()
    cy.get('[data-testid="media-type-select"]').click()
    cy.get('[data-testid="media-type-photo"]').click()
    cy.uploadFile('[data-testid="media-file-input"]', 'family-photo.jpg', 'image/jpeg')
    cy.get('[data-testid="media-title-input"]').type('Family Reunion 2010')
    cy.get('[data-testid="media-description-textarea"]').type('Annual family gathering')
    cy.get('[data-testid="save-media-button"]').click()
    
    // Verify documents and media
    cy.get('[data-testid="document-item"]').should('contain', 'Birth Certificate')
    cy.get('[data-testid="media-item"]').should('contain', 'Family Reunion 2010')
  })

  it('should allow setting person as self with special privileges', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person
    const person = this.testData.people.parents[0]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Mark person as self
    cy.get('[data-testid="person-card"]').first().within(() => {
      cy.get('[data-testid="person-menu-button"]').click()
    })
    cy.get('[data-testid="mark-as-self-button"]').click()
    
    // Confirm in dialog
    cy.get('[data-testid="mark-self-confirmation-modal"]').should('be.visible')
    cy.get('[data-testid="confirm-mark-self-button"]').click()
    
    // Verify self designation
    cy.get('[data-testid="success-message"]').should('contain', 'Marked as self successfully')
    cy.get('[data-testid="person-card"]').first().should('contain', 'You')
    cy.get('[data-testid="self-indicator"]').should('be.visible')
    
    // Verify additional privileges
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="privacy-settings-tab"]').should('be.visible')
    cy.get('[data-testid="advanced-settings-tab"]').should('be.visible')
  })

  it('should support person timeline view with chronological events', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person and add multiple events
    const person = this.testData.people.children[2]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Open person and add life events
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="life-events-tab"]').click()
    
    // Add graduation
    cy.get('[data-testid="add-life-event-button"]').click()
    cy.get('[data-testid="event-type-select"]').click()
    cy.get('[data-testid="event-type-graduation"]').click()
    cy.get('[data-testid="event-date-input"]').type('2008-05-15')
    cy.get('[data-testid="event-description-input"]').type('College graduation')
    cy.get('[data-testid="save-event-button"]').click()
    
    // Add career start
    cy.get('[data-testid="career-tab"]').click()
    cy.get('[data-testid="add-occupation-button"]').click()
    cy.get('[data-testid="job-title-input"]').type('Software Engineer')
    cy.get('[data-testid="start-date-input"]').type('2008-07-01')
    cy.get('[data-testid="current-job-checkbox"]').check()
    cy.get('[data-testid="save-occupation-button"]').click()
    
    // View timeline
    cy.get('[data-testid="timeline-tab"]').click()
    
    // Verify chronological order
    cy.get('[data-testid="timeline-event"]').should('have.length.at.least', 3) // Birth, graduation, career
    cy.get('[data-testid="timeline-event"]').first().should('contain', '1985') // Birth year
    cy.get('[data-testid="timeline-event"]').eq(1).should('contain', '2008') // Graduation
    cy.get('[data-testid="timeline-event"]').eq(2).should('contain', '2008') // Career start
  })

  it('should allow exporting person data and generating reports', function() {
    cy.signIn(this.testData.users.testUser.email, this.testData.users.testUser.password)
    cy.visit('/people')
    
    // Create a person with comprehensive data
    const person = this.testData.people.grandparents[1]
    cy.get('[data-testid="add-person-button"]').click()
    cy.get('[data-testid="first-name-input"]').type(person.firstName)
    cy.get('[data-testid="last-name-input"]').type(person.lastName)
    cy.get('[data-testid="birth-date-input"]').type(person.birthDate)
    cy.get('[data-testid="notes-textarea"]').type(person.notes)
    cy.get('[data-testid="save-person-button"]').click()
    
    // Add some life events
    cy.get('[data-testid="person-card"]').first().click()
    cy.get('[data-testid="life-events-tab"]').click()
    cy.get('[data-testid="add-life-event-button"]').click()
    cy.get('[data-testid="event-type-select"]').click()
    cy.get('[data-testid="event-type-marriage"]').click()
    cy.get('[data-testid="event-date-input"]').type('1955-06-10')
    cy.get('[data-testid="save-event-button"]').click()
    
    // Export person data
    cy.get('[data-testid="person-menu-button"]').click()
    cy.get('[data-testid="export-person-button"]').click()
    
    // Select export format
    cy.get('[data-testid="export-format-modal"]').should('be.visible')
    cy.get('[data-testid="export-pdf-button"]').click()
    
    // Verify export initiated
    cy.get('[data-testid="success-message"]').should('contain', 'Export started')
    
    // Test CSV export
    cy.get('[data-testid="person-menu-button"]').click()
    cy.get('[data-testid="export-person-button"]').click()
    cy.get('[data-testid="export-csv-button"]').click()
    
    cy.get('[data-testid="success-message"]').should('contain', 'Export started')
  })
})