const triggerAction = (actionName: string) => {
  return cy.get(`[data-action="${actionName}"`).click();
};

const simulatedTransportDelay = 250;

describe("MailHog", () => {
  beforeEach(() => {
    cy.visit("/")
      .mhDeleteAll()
      .mhSetJimMode(false);
  });
  it("loads the page", () => {
    cy.get(".status-wrapper").should("be.visible");
  });
  describe("Mail Collection", () => {
    beforeEach(() => {
      cy.wait(simulatedTransportDelay); // make sure to wait for delayed messages before cleaning up
      cy.mhDeleteAll();
      triggerAction("generate-bulk");
    });
    it("cy.mhGetAllMails() - returns an array containing all mails", () => {
      cy.mhGetAllMails().should("have.length", 10);
    });
    it("cy.mhGetMailsBySubject(subject) - returns array of mails by subject", () => {
      cy.mhGetMailsBySubject("Bulk Mail 1/10").should("have.length", 1);
    });
    it("cy.mhGetMailsBySender(from) - returns array of mails by sender", () => {
      cy.mhGetMailsBySender("single@example.com").should("have.length", 10);
    });
    it("cy.mhGetMailsByRecipient(recipient) - returns array of mails by recipient", () => {
      cy.mhGetMailsByRecipient("recipient@example.com").should(
        "have.length",
        10
      );
    });
    it("cy.mhDeleteAll() - delets all mails from MailCatcher", () => {
      cy.mhWaitForMails(9)
        .mhDeleteAll()
        .mhGetAllMails()
        .should("have.length", 0);
    });
  });
  describe("Filter Mail Collection", () => {
    beforeEach(() => {
      cy.wait(simulatedTransportDelay); // make sure to wait for delayed messages before cleaning up
      cy.mhDeleteAll();
      triggerAction("generate-bulk-unique");
    });
    it("cy.mhFilterBySubject(subject) - returns array of mails filtered by subject", () => {
      cy.wait(1000)
        .mhGetAllMails()
        .mhFilterBySubject("Unique Mail 4/10")
        .should("have.length", 1);
    });
    it("cy.mhGetMailsBySender(sender) - returns array of mails filtered by sender", () => {
      cy.wait(1000)
        .mhGetAllMails()
        .mhFilterBySender("single-4@example.com")
        .should("have.length", 1);
    });
    it("cy.mhGetMailsByRecipient(recipient) - returns array of mails filtered by recipient", () => {
      cy.wait(1000)
        .mhGetAllMails()
        .mhFilterByRecipient("recipient-4@example.com")
        .should("have.length", 1);
    });
    it("allows to chain filters together", () => {
      cy.wait(1000)
        .mhGetAllMails()
        .mhFilterByRecipient("bcc-recipient@example.com")
        .mhFilterBySubject("Unique Mail 4/10")
        .as("filteredMails")
        .should("have.length", 1)
        .get("@filteredMails")
        .mhFilterBySender("sender-1@example.com")
        .should("have.length", 0);
    });
  });
  describe("Handling a Single Mail ✉️", () => {
    beforeEach(() => {
      cy.wait(simulatedTransportDelay); // make sure to wait for delayed messages before cleaning up
      cy.mhDeleteAll();
      triggerAction("generate-single");
    });
    it("mail.mhGetSubject() - returns the mails subject", () => {
      cy.mhGetAllMails()
        .should("have.length", 1)
        .mhFirst()
        .mhGetSubject()
        .should("eq", "Single Mail");
    });
    it("mail.mhGetBody() - returns the message body", () => {
      cy.mhGetAllMails()
        .should("have.length", 1)
        .mhFirst()
        .mhGetBody()
        .should("contain", "HTML message body");
    });
    it("mail.mhGetSender() - returns sender", () => {
      cy.mhGetAllMails()
        .should("have.length", 1)
        .mhFirst()
        .mhGetSender()
        .should("equal", "single@example.com");
    });
    it("mail.mhGetRecipients() - returns recipients", () => {
      cy.mhGetAllMails()
        .should("have.length", 1)
        .mhFirst()
        .mhGetRecipients()
        .should("contain", "bcc-recipient@example.com");
    });
    describe("Attachment Handling", () => {
      beforeEach(() => {
        cy.wait(simulatedTransportDelay); // make sure to wait for delayed messages before cleaning up
        cy.mhDeleteAll();
        triggerAction("generate-single-with-attachment");
      });
      it("mail.mhGetAttachments() - returns list of attachments for current mail", () => {
        cy.mhWaitForMails()
          .mhGetAllMails()
          .mhFirst()
          .mhGetAttachments()
          .should("have.length", 2)
          .should("include", "sample.pdf");
      });
    });
  });
  describe("Parsing a Mail 📨", () => {
    beforeEach(() => {
      cy.wait(simulatedTransportDelay); // make sure to wait for delayed messages before cleaning up
      cy.mhDeleteAll();
    });
    it("mail.mhParseMail() - decodes quoted-printable bodies and encoded headers", () => {
      triggerAction("generate-single-encoded");
      cy.mhWaitForMails()
        .mhGetAllMails()
        .mhFirst()
        .as("mail")
        .mhGetBody()
        .should("not.contain", "Grüße");
      cy.get("@mail")
        .mhParseMail()
        .then((parsed) => {
          expect(parsed.subject).to.eq("Grüße aus Köln 🐗");
          expect(parsed.from).to.deep.include({ address: "single@example.com" });
          expect(parsed.text).to.contain(
            "Grüße! This plain text line is long enough to be soft-wrapped by the quoted-printable encoding."
          );
          expect(parsed.html).to.contain(
            "<p>Grüße! This HTML line is long enough to be soft-wrapped by the quoted-printable encoding.</p>"
          );
        });
    });
    it("mail.mhGetText() - returns the decoded plain text body", () => {
      triggerAction("generate-single-encoded");
      cy.mhWaitForMails()
        .mhGetAllMails()
        .mhFirst()
        .mhGetText()
        .should(
          "contain",
          "Grüße! This plain text line is long enough to be soft-wrapped by the quoted-printable encoding."
        );
    });
    it("mail.mhGetHtml() - returns the decoded html body", () => {
      triggerAction("generate-single-encoded");
      cy.mhWaitForMails()
        .mhGetAllMails()
        .mhFirst()
        .mhGetHtml()
        .should(
          "contain",
          "<p>Grüße! This HTML line is long enough to be soft-wrapped by the quoted-printable encoding.</p>"
        );
    });
    it("mail.mhGetSubject() - returns the decoded subject", () => {
      triggerAction("generate-single-encoded");
      cy.mhWaitForMails()
        .mhGetAllMails()
        .mhFirst()
        .mhGetSubject()
        .should("eq", "Grüße aus Köln 🐗");
    });
    it("subject filters and assertions match the decoded subject", () => {
      triggerAction("generate-single-encoded");
      cy.mhWaitForMails();
      cy.mhGetMailsBySubject("Grüße aus Köln 🐗").should("have.length", 1);
      cy.mhGetAllMails()
        .mhFilterBySubject("Grüße aus Köln 🐗")
        .should("have.length", 1);
      cy.mhHasMailWithSubject("Grüße aus Köln 🐗");
    });
    it("subject filters still match the raw encoded subject", () => {
      triggerAction("generate-single-encoded");
      cy.mhWaitForMails()
        .mhGetAllMails()
        .mhFirst()
        .then((mail) => {
          const rawSubject = mail.Content.Headers.Subject[0];
          expect(rawSubject).not.to.eq("Grüße aus Köln 🐗");
          cy.mhGetMailsBySubject(rawSubject).should("have.length", 1);
        });
    });
    it("mail.mhParseMail() - yields attachments with their content", () => {
      triggerAction("generate-single-with-attachment");
      cy.mhWaitForMails()
        .mhGetAllMails()
        .mhFirst()
        .mhParseMail()
        .its("attachments")
        .then((attachments) => {
          expect(attachments.map((a) => a.filename)).to.have.members([
            "attachment.txt",
            "sample.pdf",
          ]);
          const txt = attachments.find((a) => a.filename === "attachment.txt");
          expect(new TextDecoder().decode(txt!.content as ArrayBuffer)).to.eq(
            "Test attachment"
          );
        });
    });
  });
  describe("Asserting the Mail Collection 🔍", () => {
    beforeEach(() => {
      cy.mhDeleteAll();
      triggerAction("generate-single");
    });
    it("cy.mhHasMailWithSubject(subject) - asserts for mail by subject", () => {
      cy.mhHasMailWithSubject("Single Mail");
    });
    it("cy.mhHasMailFrom(from) - asserts for mail by sender", () => {
      cy.mhHasMailFrom("single@example.com");
    });
    it("cy.mhHasMailTo(recipient) - asserts for mail by recipient", () => {
      cy.mhHasMailTo("recipient@example.com")
        .mhHasMailTo("cc-recipient@example.com")
        .mhHasMailTo("bcc-recipient@example.com");
    });
  });
  describe("Jim Chaos Monkey 🐵", () => {
    it("cy.mhGetJimMode() - returns if jim mode is enabled", () => {
      cy.mhSetJimMode(true)
        .mhGetJimMode()
        .should("eq", true);
    });
    it("cy.mhSetJimMode(true) - enables jim mode", () => {
      cy.mhSetJimMode(true)
        .mhGetJimMode()
        .should("eq", true);
    });
    it("cy.mhSetJimMode(false) - disables jim mode", () => {
      cy.mhSetJimMode(false)
        .mhGetJimMode()
        .should("eq", false);
    });
  });
  describe("General Helper Functions", () => {
    beforeEach(() => {
      cy.wait(simulatedTransportDelay); // make sure to wait for delayed messages before cleaning up
      cy.mhDeleteAll();
      triggerAction("generate-bulk-unique");
    });
    it("cy.mhWaitForMails(moreMailsThen) - waits for a certain nr of mails to be on server", () => {
      cy.mhWaitForMails(9)
        .mhGetAllMails()
        .mhFilterBySender("single-10@example.com")
        .should("have.length", 1);
    });
  });
});
