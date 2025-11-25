/// <reference types="cypress" />

// Custom commands
Cypress.Commands.add('login', (username: string, password: string) => {
  // Add login command if authentication is implemented
});

// Add TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
    }
  }
}

export {};

