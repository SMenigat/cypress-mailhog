Cypress.Commands.add('mhDeleteAll', () => {
  cy.request('DELETE', 'http://localhost:8090/api/v1/messages');
});
