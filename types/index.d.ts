declare namespace Cypress {
  interface EndToEndConfigOptions {
    mailHogUrl?: string;
  }
  interface Chainable {
    mhGetJimMode(): Chainable<boolean>;
    mhSetJimMode(enabled: boolean): Chainable<Cypress.Response<any>>;
    mhDeleteAll(options?: Partial<Timeoutable>): Chainable<Cypress.Response<any>>;
    mhGetAllMails(
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailhog.Item[]>;
    mhFirst(): Chainable<mailhog.Item>;
    mhGetMailsBySubject(
      subject: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailhog.Item[]>;
    mhGetMailsByRecipient(
      recipient: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailhog.Item[]>;
    mhGetMailsBySender(
      from: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailhog.Item[]>;
    mhSearchMails(
      kind: mailhog.SearchKind,
      query: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailhog.Item[]>;
    mhFilterBySubject(subject: string): Chainable<mailhog.Item[]>;
    mhFilterByRecipient(recipient: string): Chainable<mailhog.Item[]>;
    mhFilterBySender(from: string): Chainable<mailhog.Item[]>;
    mhGetSubject(): Chainable<string>;
    mhGetBody(): Chainable<string>;
    mhGetSender(): Chainable<string>;
    mhGetRecipients(): Chainable<string[]>;
    mhGetAttachments(): Chainable<string[]>;
    mhHasMailWithSubject(subject: string): Chainable;
    mhHasMailFrom(from: string): Chainable;
    mhHasMailTo(recipient: string): Chainable;
    mhWaitForMails(moreMailsThen?: number): Chainable;
  }
}
