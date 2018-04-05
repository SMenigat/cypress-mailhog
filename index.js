const mhApiUrl = (path) => {
  const basePath = Cypress.config('mailHogUrl');
  return `${basePath}/api${path}`;
};

Cypress.Commands.add('mhGetJimMode', (enabled) => {
  return cy
    .request({
      method: 'GET',
      url: mhApiUrl('/v2/jim'),
      failOnStatusCode: false,
    })
    .then((response) => {
      return cy.wrap(response.status === 200);
    });
});

Cypress.Commands.add('mhSetJimMode', (enabled) => {
  return cy.request({
    method: enabled ? 'POST' : 'DELETE',
    url: mhApiUrl('/v2/jim'),
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('mhDeleteAll', () => {
  return cy.request('DELETE', mhApiUrl('/v1/messages'));
});
