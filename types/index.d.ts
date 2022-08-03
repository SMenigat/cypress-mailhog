declare namespace Cypress {
  interface Chainable {
    mhGetJimMode(auth?: any): Chainable<boolean>;
    mhSetJimMode(enabled : boolean, auth?: any): Chainable<Cypress.Response<any>>;
    mhDeleteAll(auth?: any): Chainable<Cypress.Response<any>>;
    mhGetAllMails(auth?: any, limit?: number): Chainable<mailhog.Item[]>;
    mhFirst(): Chainable<mailhog.Item>;
    mhGetMailsBySubject(subject : string, auth?: any, limit?: number): Chainable<mailhog.Item[]>;
    mhGetMailsByRecipient(recipient : string, auth?: any, limit?: number): Chainable<mailhog.Item[]>;
    mhGetMailsBySender(from : string, auth?: any, limit?: number): Chainable<mailhog.Item[]>;
    mhGetSubject(): Chainable<string>;
    mhGetBody(): Chainable<string>;
    mhGetSender(): Chainable<string>;
    mhGetRecipients(): Chainable<string[]>;
    mhHasMailWithSubject(subject : string): Chainable;
    mhHasMailFrom(from : string): Chainable;
    mhHasMailTo(recipient: string): Chainable;
  }
}