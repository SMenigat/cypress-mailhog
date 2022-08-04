declare namespace Cypress {
  interface Chainable {
    mhGetJimMode(): Chainable<boolean>;
    mhSetJimMode(enabled: boolean): Chainable<Cypress.Response<any>>;
    mhDeleteAll(): Chainable<Cypress.Response<any>>;
    mhGetAllMails(limit?: number): Chainable<mailhog.Item[]>;
    mhFirst(): Chainable<mailhog.Item>;
    mhGetMailsBySubject(subject: string, limit?: number): Chainable<mailhog.Item[]>;
    mhGetMailsByRecipient(recipient: string, limit?: number): Chainable<mailhog.Item[]>;
    mhGetMailsBySender(from: string, limit?: number): Chainable<mailhog.Item[]>;
    mhGetSubject(): Chainable<string>;
    mhGetBody(): Chainable<string>;
    mhGetSender(): Chainable<string>;
    mhGetRecipients(): Chainable<string[]>;
    mhHasMailWithSubject(subject : string): Chainable;
    mhHasMailFrom(from : string): Chainable;
    mhHasMailTo(recipient: string): Chainable;
  }
}