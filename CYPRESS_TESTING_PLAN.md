# Cypress Testing Plan for Family Shapes

## Overview

This document outlines the comprehensive testing strategy implemented for the Family Shapes application using Cypress for End-to-End (E2E) testing and component testing.

## Testing Architecture

### Test Structure
```
cypress/
├── e2e/                           # End-to-end tests
│   ├── auth/                      # Authentication flows
│   ├── family-trees/              # Family tree functionality
│   │   ├── 01-family-tree-creation.cy.ts
│   │   ├── 02-family-tree-visualization.cy.ts
│   │   └── 03-connections-and-relationships.cy.ts
│   └── people/                    # People/persons management
│       ├── 01-person-management.cy.ts
│       └── 02-person-profile-management.cy.ts
├── component/                     # Component tests
├── fixtures/                      # Test data
│   └── test-data.json
└── support/                       # Support files
    ├── commands.ts                # Custom commands
    ├── e2e.ts                     # E2E support
    └── component.ts               # Component support
```

## Test Suites

### 1. Family Tree Testing Suite

#### **01-family-tree-creation.cy.ts**
- **Purpose**: Tests family tree creation, validation, and basic management
- **Key Scenarios**:
  - Create new family tree with all details
  - Validate required fields and form validation
  - Handle duplicate tree names
  - Test different visibility levels (private, family-only, public)
- **Test Data**: Uses `familyTrees` fixtures for consistent test scenarios

#### **02-family-tree-visualization.cy.ts**
- **Purpose**: Tests the interactive family tree visualization features
- **Key Scenarios**:
  - Multiple layout options (hierarchical, force-directed, circular, tree)
  - Zoom and pan functionality
  - Person node interactions and details view
  - Fullscreen mode
  - Relationship line rendering
  - Generation level display
- **Visual Testing**: Includes viewport and layout validation

#### **03-connections-and-relationships.cy.ts**
- **Purpose**: Tests relationship management and family connections
- **Key Scenarios**:
  - Create parent-child relationships
  - Establish spouse relationships with marriage details
  - Define sibling connections
  - Validate relationship constraints
  - Edit existing relationships
  - Delete relationships with confirmation
  - View connection history and changes
- **Data Integrity**: Ensures relationship data consistency

### 2. People/Persons Testing Suite

#### **01-person-management.cy.ts**
- **Purpose**: Tests CRUD operations for person entities
- **Key Scenarios**:
  - Create person with comprehensive details
  - Form validation for required fields
  - View person details and profiles
  - Edit person information
  - Delete person with confirmation
  - Prevent deletion of connected persons
  - Search and filter functionality
  - Bulk operations on multiple people
- **Coverage**: Full person lifecycle management

#### **02-person-profile-management.cy.ts**
- **Purpose**: Tests advanced person profile features
- **Key Scenarios**:
  - Profile photo upload and management
  - Life events and milestones tracking
  - Occupation and career history
  - Family medical history
  - Document and media file management
  - Self-designation with special privileges
  - Timeline view with chronological events
  - Data export and report generation
- **Rich Data**: Tests complex profile data structures

### 3. Authentication Testing Suite

#### **authentication.cy.ts**
- **Purpose**: Tests user authentication and session management
- **Key Scenarios**:
  - User registration with validation
  - Sign-in with valid/invalid credentials
  - Password reset workflow
  - User logout and session cleanup
  - Session persistence across page refreshes
  - Protected route access control
  - Post-login redirect handling

## Test Data Management

### Fixtures (`cypress/fixtures/test-data.json`)
- **Users**: Test user credentials for different access levels
- **Family Trees**: Sample family tree data with various configurations
- **People**: Multi-generational family data (grandparents, parents, children)
- **Relationships**: Different relationship types and configurations

### Data Consistency
- Each test uses `cy.cleanupTestData()` for isolation
- Fixtures provide consistent, realistic test scenarios
- Test data includes edge cases and validation scenarios

## Custom Commands

### Authentication Commands
- `cy.signIn(email, password)`: Streamlined login process
- `cy.createTestUser()`: Generate unique test users
- `cy.cleanupTestData()`: Clean test environment

### Family Tree Commands
- `cy.createFamilyTree(name, description)`: Create trees with validation
- `cy.addPersonToTree(firstName, lastName, birthDate)`: Add people to trees

### Utility Commands
- `cy.uploadFile(selector, fileName, fileType)`: File upload testing

## Testing Strategy

### Test Organization
1. **Functional Testing**: Core application features
2. **Integration Testing**: Component interactions
3. **UI Testing**: User interface and experience
4. **Data Integrity Testing**: Relationship and data consistency
5. **Performance Testing**: Page load and interaction responsiveness

### Test Execution Patterns
- **Isolated Tests**: Each test cleans up after itself
- **Progressive Complexity**: Simple to complex scenarios
- **Real User Workflows**: Tests mirror actual user journeys
- **Edge Case Coverage**: Validation errors, constraints, limits

## Running Tests

### Development
```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all E2E tests (headless)
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run component tests
npm run test:component

# Run all tests (unit + E2E)
npm run test:all
```

### CI/CD Integration
```bash
# Continuous Integration (headless)
npm run cypress:run

# Generate test reports
cypress run --reporter mochawesome
```

## Test Data Attributes

### Required data-testid Attributes
The tests rely on specific `data-testid` attributes in the UI components:

#### Authentication
- `email-input`, `password-input`, `sign-in-button`
- `sign-up-link`, `forgot-password-link`
- `user-menu`, `logout-button`

#### Family Trees
- `create-tree-button`, `tree-name-input`, `tree-description-input`
- `visibility-select`, `family-tree-visualization`
- `zoom-in-button`, `zoom-out-button`, `fullscreen-button`

#### People Management
- `add-person-button`, `first-name-input`, `last-name-input`
- `person-card`, `edit-person-button`, `delete-person-button`
- `search-input`, `gender-filter`, `generation-filter`

#### Connections
- `connections-tab`, `add-connection-button`
- `person1-select`, `person2-select`, `relationship-type-select`
- `save-connection-button`, `connection-list`

## Best Practices

### Test Writing
1. **Descriptive Test Names**: Clear, specific test descriptions
2. **Single Responsibility**: Each test focuses on one scenario
3. **Setup and Cleanup**: Proper test isolation
4. **Assertions**: Meaningful, specific assertions
5. **Error Handling**: Test both success and failure paths

### Maintenance
1. **Regular Updates**: Keep tests current with UI changes
2. **Fixture Management**: Update test data as needed
3. **Command Reusability**: Leverage custom commands
4. **Documentation**: Keep this plan updated

## Performance Considerations

### Test Optimization
- Parallel test execution where possible
- Efficient test data creation and cleanup
- Strategic use of `cy.wait()` vs. proper assertions
- Minimal test dependencies

### CI/CD Optimization
- Headless execution for speed
- Test result caching
- Failure screenshot capture
- Test retry strategies for flaky tests

## Reporting and Monitoring

### Test Results
- Console output for development
- HTML reports for CI/CD
- Screenshot capture on failures
- Video recording for debugging

### Coverage Metrics
- Feature coverage by test suite
- User journey coverage
- Edge case coverage
- Regression test coverage

## Future Enhancements

### Planned Additions
1. **Visual Regression Testing**: Screenshot comparison
2. **Accessibility Testing**: A11y compliance validation
3. **Performance Testing**: Load time and interaction metrics
4. **Mobile Testing**: Responsive design validation
5. **API Testing**: Backend integration tests

### Tool Integration
- Lighthouse for performance audits
- Axe for accessibility testing
- Percy for visual testing
- Datadog for monitoring

## Conclusion

This comprehensive Cypress testing suite provides robust coverage of the Family Shapes application's core functionality. The tests are designed to catch regressions, validate user workflows, and ensure data integrity across the family tree and people management features.

Regular execution of these tests in development and CI/CD pipelines will help maintain application quality and user experience standards.