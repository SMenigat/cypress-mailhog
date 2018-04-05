const triggerAction = (actionName) => {
  return cy
    .get(`[data-action="${actionName}"`)
    .click()
    .get('.status-wrapper .status')
    .contains('✅');
};

describe('MailHog', () => {
  before(() => {
    cy.visit('/');
  });
  it('loads the page', () => {
    cy.get('.status-wrapper').should('be.visible');
  });
  it('can delete all MailCatcher mails', () => {
    triggerAction('generate-bulk').mhDeleteAll();
  });
});
