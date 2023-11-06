const mhApiUrl = (path) => {
  const envValue = Cypress.env("mailHogUrl");
  const basePath = envValue ? envValue : Cypress.config("mailHogUrl");
  return `${basePath}/api${path}`;
};

let mhAuth = Cypress.env("mailHogAuth") || "";
if (Cypress.env("mailHogUsername") && Cypress.env("mailHogPassword")) {
  mhAuth = {
    user: Cypress.env("mailHogUsername"),
    pass: Cypress.env("mailHogPassword"),
  };
}

const messages = (limit) => {
  return cy
    .request({
      method: "GET",
      url: mhApiUrl(`/v2/messages?limit=${limit}`),
      auth: mhAuth,
      log: false,
    })
    .then((response) => {
      if (typeof response.body === "string") {
        return JSON.parse(response.body);
      } else {
        return response.body;
      }
    })
    .then((parsed) => parsed.items);
};

const retryFetchMessages = (filter, limit, options = {}) => {
  const timeout =
    options.timeout || Cypress.config("defaultCommandTimeout") || 4000;
  let timedout = false;

  setTimeout(() => {
    timedout = true;
  }, timeout);

  const filteredMessages = (limit) => messages(limit).then(filter);

  const resolve = () => {
    if (timedout) {
      return filteredMessages(limit);
    }
    return filteredMessages(limit).then((messages) => {
      return cy.verifyUpcomingAssertions(messages, options, {
        onRetry: resolve,
      });
    });
  };

  return resolve();
};

Cypress.Commands.add("mhGetJimMode", () => {
  return cy
    .request({
      method: "GET",
      url: mhApiUrl("/v2/jim"),
      failOnStatusCode: false,
      auth: mhAuth,
    })
    .then((response) => {
      return cy.wrap(response.status === 200);
    });
});

Cypress.Commands.add("mhSetJimMode", (enabled) => {
  return cy.request({
    method: enabled ? "POST" : "DELETE",
    url: mhApiUrl("/v2/jim"),
    failOnStatusCode: false,
    auth: mhAuth,
  });
});

/**
 * Mail Collection
 */
Cypress.Commands.add("mhDeleteAll", () => {
  return cy.request({
    method: "DELETE",
    url: mhApiUrl("/v1/messages"),
    auth: mhAuth,
  });
});

Cypress.Commands.add("mhGetAllMails", (limit = 50, options = {}) => {
  const filter = (mails) => mails;

  return retryFetchMessages(filter, limit, options);
});

Cypress.Commands.add("mhFirst", { prevSubject: true }, (mails) => {
  return Array.isArray(mails) && mails.length > 0 ? mails[0] : mails;
});

Cypress.Commands.add(
  "mhGetMailsBySubject",
  (subject, limit = 50, options = {}) => {
    const filter = (mails) =>
      mails.filter((mail) => mail.Content.Headers.Subject[0] === subject);

    return retryFetchMessages(filter, limit, options);
  }
);

Cypress.Commands.add(
  "mhGetMailsByRecipient",
  (recipient, limit = 50, options = {}) => {
    const filter = (mails) => {
      return mails.filter((mail) =>
        mail.To.map(
          (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
        ).includes(recipient)
      );
    };

    return retryFetchMessages(filter, limit, options);
  }
);

Cypress.Commands.add("mhGetMailsBySender", (from, limit = 50, options = {}) => {
  const filter = (mails) => mails.filter((mail) => mail.Raw.From === from);

  return retryFetchMessages(filter, limit, options);
});

/**
 * Filters on Mail Collections
 */
Cypress.Commands.add(
  "mhFilterBySubject",
  { prevSubject: true },
  (messages, subject) => {
    return messages.filter(
      (mail) => mail.Content.Headers.Subject[0] === subject
    );
  }
);

Cypress.Commands.add(
  "mhFilterByRecipient",
  { prevSubject: true },
  (messages, recipient) => {
    return messages.filter((mail) =>
      mail.To.map(
        (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
      ).includes(recipient)
    );
  }
);

Cypress.Commands.add(
  "mhFilterBySender",
  { prevSubject: true },
  (messages, from) => {
    return messages.filter((mail) => mail.Raw.From === from);
  }
);

/**
 * Single Mail Commands and Assertions
 */
Cypress.Commands.add("mhGetSubject", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content.Headers).then((headers) => headers.Subject[0]);
});

Cypress.Commands.add("mhGetBody", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content).its("Body");
});

Cypress.Commands.add("mhGetSender", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Raw).its("From");
});

Cypress.Commands.add("mhGetRecipients", { prevSubject: true }, (mail) => {
  return cy
    .wrap(mail)
    .then((mail) =>
      mail.To.map(
        (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
      )
    );
});

/**
 * Mail Collection Assertions
 */
Cypress.Commands.add("mhHasMailWithSubject", (subject) => {
  cy.mhGetMailsBySubject(subject).should("not.have.length", 0);
});

Cypress.Commands.add("mhHasMailFrom", (from) => {
  cy.mhGetMailsBySender(from).should("not.have.length", 0);
});

Cypress.Commands.add("mhHasMailTo", (recipient) => {
  cy.mhGetMailsByRecipient(recipient).should("not.have.length", 0);
});
