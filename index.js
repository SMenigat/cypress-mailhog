const mhApiUrl = (path) => {
  const basePath = Cypress.config('mailHogUrl');
  return `${basePath}/api${path}`;
};

Cypress.Commands.add('mhDeleteAll', () => {
  cy.request('DELETE', mhApiUrl('/v1/messages'));
});