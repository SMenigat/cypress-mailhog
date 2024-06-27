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

declare namespace mailhog {
  type SearchKind = 'from' | 'to' | 'containing';
 
   interface Messages {
     total: number;
     count: number;
     start: number;
     items: Item[];
   }
 
   interface Item {
     ID: string;
     From: From;
     To: From[];
     Content: Content;
     Created: Date;
     MIME: MimeParts | null;
     Raw: Raw;
   }
 
   interface Content {
     Headers: Headers;
     Body: string;
     Size: number;
     MIME: MimeParts | null;
   }
 
   interface Headers {
    [key: string]: string[]
   }
 
   interface From {
     Relays: null;
     Mailbox: string;
     Domain: string;
     Params: string;
   }
 
   interface Raw {
     From: string;
     To: string[];
     Data: string;
     Helo: string;
   }
 
   interface MimeParts {
     Parts: Content[];
   }
 }