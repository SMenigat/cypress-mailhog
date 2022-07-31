declare namespace Cypress {
  interface Chainable {
    mhGetJimMode(auth?: JSON): Chainable<boolean>;
    mhSetJimMode(enabled : boolean, auth?: JSON): Chainable<Cypress.Response<any>>;
    mhDeleteAll(auth?: JSON): Chainable<Cypress.Response<any>>;
    mhGetAllMails(auth?: JSON, limit?: number): Chainable<mailhog.Item[]>;
    mhFirst(): Chainable<mailhog.Item>;
    mhGetMailsBySubject(subject : string, auth?: JSON, limit?: number): Chainable<mailhog.Item[]>;
    mhGetMailsByRecipient(recipient : string, auth?: JSON, limit?: number): Chainable<mailhog.Item[]>;
    mhGetMailsBySender(from : string, auth?: JSON, limit?: number): Chainable<mailhog.Item[]>;
    mhGetSubject(): Chainable<string>;
    mhGetBody(): Chainable<string>;
    mhGetSender(): Chainable<string>;
    mhGetRecipients(): Chainable<string[]>;
    mhHasMailWithSubject(subject : string): Chainable;
    mhHasMailFrom(from : string): Chainable;
    mhHasMailTo(recipient: string): Chainable;
  }
}