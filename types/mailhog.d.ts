declare namespace mailhog {
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
    MIME: null;
    Raw: Raw;
  }

  interface Content {
    Headers: Headers;
    Body: string;
    Size: number;
    MIME: null;
  }

  interface Headers {
    "Content-Transfer-Encoding": string[];
    "Content-Type": string[];
    Date: string[];
    From: string[];
    "MIME-Version": string[];
    "Message-ID": string[];
    Received: string[];
    "Return-Path": string[];
    Subject: string[];
    To: string[];
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
}