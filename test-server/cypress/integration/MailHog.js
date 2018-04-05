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
  describe('Jim Chaos Monkey 🐵', () => {
    it('cy.mhGetJimMode() - returns if jim mode is enabled', () => {
      cy.mhSetJimMode(true).mhGetJimMode().should('eq', true);
    });
    it('cy.mhSetJimMode(true) - enables jim mode', () => {
      cy.mhSetJimMode(true).mhGetJimMode().should('eq', true);
    });
    it('cy.mhSetJimMode(false) - disables jim mode', () => {
      cy.mhSetJimMode(false).mhGetJimMode().should('eq', false);
    });
  });
});
