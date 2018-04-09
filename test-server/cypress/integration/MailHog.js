const triggerAction = (actionName) => {
  return cy
    .get(`[data-action="${actionName}"`)
    .click()
    .get('.status-wrapper .status')
    .contains('✅');
};

describe('MailHog', () => {
  before(() => {
    cy
      .visit('/')
      .mhDeleteAll()
      .mhSetJimMode(false);
  });
  after(() => {
    cy.mhDeleteAll().mhSetJimMode(false);
  });
  it('loads the page', () => {
    cy.get('.status-wrapper').should('be.visible');
  });
  describe('Mail Collection', () => {
    beforeEach(() => {
      cy.mhDeleteAll();
      triggerAction('generate-bulk');
    });
    it('cy.mhGetAllMails() - returns an array containing all mails', () => {
      cy.mhGetAllMails().should('have.length', 10);
    });
    it('cy.mhDeleteAll() - delets all mails from MailCatcher', () => {
      cy
        .mhDeleteAll()
        .mhGetAllMails()
        .should('have.length', 0);
    });
  });
  describe('Finding Mails 🔍', () => {
    beforeEach(() => {
      cy.mhDeleteAll();
      triggerAction('generate-single');
    });
    it('cy.mhHasMailWithSubject(subject) - asserts for mail by subject', () => {
      cy.mhHasMailWithSubject('Single Mail');
    });
    it('cy.mhHasMailFrom(from) - asserts for mail by sender', () => {
      cy.mhHasMailFrom('single@example.com');
    });
    it('cy.mhHasMailTo(recipient) - asserts for mail by recipient', () => {
      cy
        .mhHasMailTo('recipient@example.com')
        .mhHasMailTo('cc-recipient@example.com')
        .mhHasMailTo('bcc-recipient@example.com');
    });
  });
  describe('Jim Chaos Monkey 🐵', () => {
    it('cy.mhGetJimMode() - returns if jim mode is enabled', () => {
      cy
        .mhSetJimMode(true)
        .mhGetJimMode()
        .should('eq', true);
    });
    it('cy.mhSetJimMode(true) - enables jim mode', () => {
      cy
        .mhSetJimMode(true)
        .mhGetJimMode()
        .should('eq', true);
    });
    it('cy.mhSetJimMode(false) - disables jim mode', () => {
      cy
        .mhSetJimMode(false)
        .mhGetJimMode()
        .should('eq', false);
    });
  });
});
