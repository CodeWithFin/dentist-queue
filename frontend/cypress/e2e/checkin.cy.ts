describe('Patient Check-In Flow', () => {
  beforeEach(() => {
    cy.visit('/check-in');
  });

  it('should display check-in page', () => {
    cy.contains('Patient Check-In').should('be.visible');
    cy.contains('Enter Your Phone Number').should('be.visible');
  });

  it('should validate phone number input', () => {
    cy.get('input[label="Phone Number"]').type('123');
    cy.contains('Continue').click();
    // Should show validation error or stay on same page
  });

  it('should proceed to registration for new patient', () => {
    const uniquePhone = `+1${Date.now()}`;
    cy.get('input[placeholder="+1234567890"]').type(uniquePhone);
    cy.contains('Continue').click();
    
    // Should show registration form
    cy.contains('New Patient Registration', { timeout: 10000 }).should('be.visible');
  });

  it('should complete full check-in flow', () => {
    const uniquePhone = `+1${Date.now()}`;
    
    // Enter phone
    cy.get('input[placeholder="+1234567890"]').type(uniquePhone);
    cy.contains('Continue').click();
    
    // Fill registration
    cy.contains('New Patient Registration', { timeout: 10000 });
    cy.get('input[label="First Name"]').type('Test');
    cy.get('input[label="Last Name"]').type('Patient');
    cy.contains('Register & Continue').click();
    
    // Complete check-in
    cy.contains('Welcome', { timeout: 10000 });
    cy.get('textarea[label="Reason for Visit"]').type('Regular checkup');
    cy.contains('Complete Check-In').click();
    
    // Should redirect to status page
    cy.url().should('include', '/patient/');
  });
});

describe('Reception Dashboard', () => {
  beforeEach(() => {
    cy.visit('/reception');
  });

  it('should display reception dashboard', () => {
    cy.contains('Reception Dashboard').should('be.visible');
  });

  it('should show queue statistics', () => {
    cy.contains('In Queue').should('be.visible');
    cy.contains('Waiting').should('be.visible');
    cy.contains('In Progress').should('be.visible');
  });
});

describe('Dentist Dashboard', () => {
  beforeEach(() => {
    cy.visit('/dentist');
  });

  it('should display dentist dashboard', () => {
    cy.contains('Dentist Dashboard').should('be.visible');
  });

  it('should show patient lists', () => {
    cy.contains('My Patients').should('be.visible');
    cy.contains('Waiting Queue').should('be.visible');
  });
});

describe('Public Display', () => {
  beforeEach(() => {
    cy.visit('/display');
  });

  it('should display public waiting screen', () => {
    cy.contains('Queue Management System').should('be.visible');
  });

  it('should show waiting queue', () => {
    cy.contains('Waiting Queue').should('be.visible');
  });
});

