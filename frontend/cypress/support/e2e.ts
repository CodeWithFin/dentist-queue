// Cypress E2E support file

// Import commands
import './commands';

// Disable uncaught exception failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

