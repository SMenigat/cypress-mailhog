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

Cypress.Commands.add('mhGetAllMails', () => {
  return cy
    .request({
      method: 'GET',
      url: mhApiUrl('/v2/messages?limit=9999'),
    })
    .then((response) => JSON.parse(response.body))
    .then((parsed) => parsed.items);
});

Cypress.Commands.add('mhHasMailWithSubject', (subject) => {
  cy.mhGetAllMails().then((mails) => {
    const subjects = mails.reduce(
      (subjects, mail) => [subjects, ...mail.Content.Headers.Subject],
      []
    );
    expect(subjects).to.contain(subject);
  });
});

Cypress.Commands.add('mhHasMailFrom', (from) => {
  cy.mhGetAllMails().then((mails) => {
    const fromAdresses = mails.reduce(
      (adresses, mail) => [adresses, mail.Raw.From],
      []
    );
    expect(fromAdresses).to.contain(from);
  });
});

Cypress.Commands.add('mhHasMailTo', (recipient) => {
  cy.mhGetAllMails().then((mails) => {
    const recipientAdresses = mails.reduce(
      (adresses, mail) => [
        adresses,
        ...mail.To.map(
          (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
        ),
      ],
      []
    );
    expect(recipientAdresses).to.contain(recipient);
  });
});
