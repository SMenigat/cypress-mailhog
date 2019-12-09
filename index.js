const mhApiUrl = (path) => {
  const envValue = Cypress.env('mailHogUrl');
  const basePath = envValue ? envValue : Cypress.config('mailHogUrl');
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

/**
 * Mail Collection
 */
Cypress.Commands.add('mhDeleteAll', () => {
  return cy.request('DELETE', mhApiUrl('/v1/messages'));
});

Cypress.Commands.add('mhGetAllMails', () => {
  return cy
    .request({
      method: 'GET',
      url: mhApiUrl('/v2/messages?limit=9999'),
    })
    .then((response) => {
        if (typeof response.body === 'string') {
            return JSON.parse(response.body);
        } else {
            return response.body;
        }
    })
    .then((parsed) => parsed.items);
});

Cypress.Commands.add('mhFirst', {prevSubject: true}, (mails) => {
  return Array.isArray(mails) && mails.length > 0 ? mails[0] : mails;
});

Cypress.Commands.add('mhGetMailsBySubject', (subject) => {
  cy.mhGetAllMails().then((mails) => {
    return mails.filter((mail) => mail.Content.Headers.Subject[0] === subject);
  });
});

Cypress.Commands.add('mhGetMailsByRecipient', (recipient) => {
  cy.mhGetAllMails().then((mails) => {
    return mails.filter((mail) =>
      mail.To.map(
        (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
      ).includes(recipient)
    );
  });
});

Cypress.Commands.add('mhGetMailsBySender', (from) => {
  cy.mhGetAllMails().then((mails) => {
    return mails.filter((mail) => mail.Raw.From === from);
  });
});

/**
 * Single Mail Commands and Assertions
 */
Cypress.Commands.add('mhGetSubject', {prevSubject: true}, (mail) => {
  return cy.wrap(mail.Content.Headers).then((headers) => headers.Subject[0]);
});

Cypress.Commands.add('mhGetBody', {prevSubject: true}, (mail) => {
  return cy.wrap(mail.Content).its('Body');
});

Cypress.Commands.add('mhGetSender', {prevSubject: true}, (mail) => {
  return cy.wrap(mail.Raw).its('From');
});

Cypress.Commands.add('mhGetRecipients', {prevSubject: true}, (mail) => {
  return cy
    .wrap(mail)
    .then((mail) =>
      mail.To.map(
        (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
      )
    );
});

/**
 * Mail Collection Assertions
 */
Cypress.Commands.add('mhHasMailWithSubject', (subject) => {
  cy.mhGetMailsBySubject(subject).should('not.have.length', 0);
});

Cypress.Commands.add('mhHasMailFrom', (from) => {
  cy.mhGetMailsBySender(from).should('not.have.length', 0);
});

Cypress.Commands.add('mhHasMailTo', (recipient) => {
  cy.mhGetMailsByRecipient(recipient).should('not.have.length', 0);
});
