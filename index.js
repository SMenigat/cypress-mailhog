const PostalMime = require("postal-mime");

/**
 * Yields the decoded subject of a mail (RFC 2047 encoded words like
 * `=?UTF-8?Q?Gr=C3=BC=C3=9Fe?=` are decoded to `Grüße`).
 * @param {mailhog.Item} mail The MailHog mail.
 * @returns {string} The decoded subject.
 */
const mhDecodedSubject = (mail) => {
  const subject = mail.Content.Headers.Subject?.[0] ?? "";
  return PostalMime.decodeWords(subject);
};

/**
 * Checks if a mail has the given subject, comparing against the decoded and
 * the raw subject so that matching the encoded form keeps working.
 * @param {mailhog.Item} mail The MailHog mail.
 * @param {string} subject The subject to look for.
 * @returns {boolean} Whether the subject matches.
 */
const mhHasSubject = (mail, subject) =>
  mhDecodedSubject(mail) === subject ||
  mail.Content.Headers.Subject?.[0] === subject;

/**
 * Parses the raw source of a mail with postal-mime.
 * @param {mailhog.Item} mail The MailHog mail.
 * @returns {Cypress.Chainable} Yields the parsed mail.
 */
const mhParse = (mail) =>
  cy.wrap(PostalMime.parse(mail.Raw.Data), { log: false });

/**
 * Resolves the MailHog base url.
 * Lookup order: `expose.mailHogUrl` -> `env.mailHogUrl` -> `e2e.mailHogUrl` (config).
 * @param {Record<string, any>} env Values yielded by `cy.env()`.
 * @returns {string} The base url.
 */
const mhBaseUrl = (env) =>
  Cypress.expose("mailHogUrl") ||
  env.mailHogUrl ||
  Cypress.config("mailHogUrl");

/**
 * Resolves the MailHog basic auth credentials from `cy.env()` values.
 * @param {Record<string, any>} env Values yielded by `cy.env()`.
 * @returns {{user: string, pass: string} | undefined} The auth options.
 */
const mhAuth = (env) => {
  if (env.mailHogUsername && env.mailHogPassword) {
    return { user: env.mailHogUsername, pass: env.mailHogPassword };
  }
  return env.mailHogAuth || undefined;
};

const MH_ENV_KEYS = [
  "mailHogUrl",
  "mailHogAuth",
  "mailHogUsername",
  "mailHogPassword",
];

/**
 * Sends a request to the MailHog API.
 * Credentials are read via `cy.env()` so they never need to be exposed to the browser.
 * @param {string} path The API path, e.g. `/v2/messages`.
 * @param {Partial<Cypress.RequestOptions>} options Additional request options.
 * @returns {Cypress.Chainable<Cypress.Response<any>>} The response.
 */
const mhRequest = (path, options = {}) => {
  return cy.env(MH_ENV_KEYS, { log: false }).then((env) => {
    const auth = mhAuth(env);
    return cy.request({
      url: new URL(`api${path}`, mhBaseUrl(env)).href,
      ...(auth ? { auth } : {}),
      ...options,
    });
  });
};

/**
 * Gets unfiltered emails from mailhog.
 * @param {number} limit The maximum number of emails to get. 
 * @returns {Promise<any>} The emails.
 */
const getMessages = (limit) => {
  return mhRequest(`/v2/messages?limit=${encodeURIComponent(limit)}`, {
    method: "GET",
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

/**
 * Gets emails on mailhog that match the specified search query.
 * @param {'from' | 'to' | 'containing'} kind The search kind.
 * @param {string} query The search query.
 * @param {number} limit The maximum number of emails to get.
 * @returns {Promise<any>} The emails.
 */
const searchMessages = (kind, query, limit) => {
  return mhRequest(
    `/v2/search?kind=${encodeURIComponent(kind)}&query=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`,
    {
      method: "GET",
      log: false,
    }
  )
    .then((response) => {
      if (typeof response.body === "string") {
        return JSON.parse(response.body);
      } else {
        return response.body;
      }
    })
    .then((parsed) => parsed.items);
};

/**
 * Fetches messages from mailhog with retryability.
 * @param {(limit: number) => Promise<any>} fetcher The function to fetch the emails.
 * @param {(mails: any) => any} filter The filter to apply to the feteched emails.
 * @param {number} limit The maximum number of emails to fetch.
 * @param {{timeout?: number}} options The request options.
 * @returns {Promise<any>} The emails.
 */
const retryFetchMessages = (fetcher, filter, limit, options = {}) => {
  const timeout =
    options.timeout || Cypress.config("defaultCommandTimeout") || 4000;
  let timedout = false;

  setTimeout(() => {
    timedout = true;
  }, timeout);

  const filteredMessages = (limit) => fetcher(limit).then(filter);

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
  return mhRequest("/v2/jim", {
    method: "GET",
    failOnStatusCode: false,
  })
    .then((response) => {
      return cy.wrap(response.status === 200);
    });
});

Cypress.Commands.add("mhSetJimMode", (enabled) => {
  return mhRequest("/v2/jim", {
    method: enabled ? "POST" : "DELETE",
    failOnStatusCode: false,
  });
});

/** Mail Collection */

Cypress.Commands.add("mhDeleteAll", (options = {}) => {
  return mhRequest("/v1/messages", {
    method: "DELETE",
    timeout: options.timeout || Cypress.config('responseTimeout') || 30000,
  });
});

Cypress.Commands.add("mhGetAllMails", (limit = 50, options = {}) => {
  const filter = (mails) => mails;

  return retryFetchMessages(getMessages, filter, limit, options);
});

Cypress.Commands.add("mhFirst", { prevSubject: true }, (mails) => {
  return Array.isArray(mails) && mails.length > 0 ? mails[0] : mails;
});

Cypress.Commands.add(
  "mhGetMailsBySubject",
  (subject, limit = 50, options = {}) => {
    const filter = (mails) =>
      mails.filter((mail) => mhHasSubject(mail, subject));

    return retryFetchMessages(getMessages, filter, limit, options);
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

    return retryFetchMessages(getMessages, filter, limit, options);
  }
);

Cypress.Commands.add("mhGetMailsBySender", (from, limit = 50, options = {}) => {
  const filter = (mails) => mails.filter((mail) => mail.Raw.From === from);

  return retryFetchMessages(getMessages, filter, limit, options);
});

Cypress.Commands.add("mhSearchMails", (kind, query, limit = 50, options = {}) => {
  const filter = (mails) => mails;
  const fetcher = limit => searchMessages(kind, query, limit);
  return retryFetchMessages(fetcher, filter, limit, options);
});


/** Filters on Mail Collections */

Cypress.Commands.add(
  "mhFilterBySubject",
  { prevSubject: true },
  (messages, subject) => {
    return messages.filter(
      (mail) => mhHasSubject(mail, subject)
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

/** Single Mail Commands and Assertions */

Cypress.Commands.add("mhGetSubject", { prevSubject: true }, (mail) => {
  return cy.wrap(mhDecodedSubject(mail));
});

Cypress.Commands.add("mhGetBody", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content).its("Body");
});

Cypress.Commands.add("mhParseMail", { prevSubject: true }, (mail) => {
  return mhParse(mail);
});

Cypress.Commands.add("mhGetText", { prevSubject: true }, (mail) => {
  return mhParse(mail).then((parsed) => parsed.text);
});

Cypress.Commands.add("mhGetHtml", { prevSubject: true }, (mail) => {
  return mhParse(mail).then((parsed) => parsed.html);
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

/** Links */

/**
 * Collapses whitespace so that labels spanning multiple lines / elements
 * become a single readable string.
 * @param {string | null | undefined} value The raw label.
 * @returns {string} The normalized label.
 */
const normalizeLabel = (value) => (value || "").replace(/\s+/g, " ").trim();

/**
 * Extracts all `<a href>` links from an html body.
 * Image-only links fall back to `aria-label`, `title` or the image `alt`.
 * @param {string} html The decoded html body.
 * @returns {mailhog.Link[]} The links in document order.
 */
const linksFromHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("a[href]")).map((anchor) => {
    const label =
      normalizeLabel(anchor.textContent) ||
      normalizeLabel(anchor.getAttribute("aria-label")) ||
      normalizeLabel(anchor.getAttribute("title")) ||
      normalizeLabel(
        Array.from(anchor.querySelectorAll("img[alt]"))
          .map((img) => img.getAttribute("alt"))
          .join(" ")
      );
    return { label, href: anchor.getAttribute("href").trim() };
  });
};

/**
 * Extracts bare http(s) urls from a plain text body. The url doubles as label.
 * @param {string} text The decoded plain text body.
 * @returns {mailhog.Link[]} The links in order of appearance.
 */
const linksFromText = (text) =>
  (text.match(/https?:\/\/[^\s<>"']+/g) || [])
    .map((url) => url.replace(/[.,;:!?)\]}]+$/, ""))
    .map((href) => ({ label: href, href }));

/**
 * Parses a mail and yields its links, preferring the html part.
 * @param {mailhog.Item} mail The MailHog mail.
 * @returns {Cypress.Chainable} Yields `mailhog.Link[]`.
 */
const mhLinks = (mail) =>
  mhParse(mail).then((parsed) =>
    parsed.html
      ? linksFromHtml(parsed.html)
      : linksFromText(parsed.text || "")
  );

/**
 * Finds the first link whose `key` matches the query (exact string or RegExp).
 * @param {mailhog.Link[]} links The links to search.
 * @param {"label" | "href"} key The link property to match.
 * @param {string | RegExp} query The exact value or a pattern.
 * @returns {mailhog.Link} The matching link.
 */
const findLink = (links, key, query) => {
  const isMatch = (value) =>
    query instanceof RegExp ? value.search(query) !== -1 : value === query;
  const link = links.find((candidate) => isMatch(candidate[key]));
  if (!link) {
    const available =
      links.map((candidate) => JSON.stringify(candidate[key])).join(", ") ||
      "none";
    const wanted = query instanceof RegExp ? String(query) : JSON.stringify(query);
    throw new Error(
      `No link with ${key} ${wanted} found. Available ${key}s: ${available}`
    );
  }
  return link;
};

Cypress.Commands.add("mhGetLinks", { prevSubject: true }, (mail) => {
  return mhLinks(mail);
});

Cypress.Commands.add("mhGetLinkByLabel", { prevSubject: true }, (mail, label) => {
  return mhLinks(mail).then((links) => findLink(links, "label", label));
});

Cypress.Commands.add("mhGetLinkByHref", { prevSubject: true }, (mail, href) => {
  return mhLinks(mail).then((links) => findLink(links, "href", href));
});

Cypress.Commands.add(
  "mhVisitLink",
  { prevSubject: true },
  (subject, options = {}) => {
    const link = Array.isArray(subject) ? subject[0] : subject;
    if (!link || typeof link.href !== "string") {
      throw new Error(
        "mhVisitLink() needs a link yielded by mhGetLinks(), mhGetLinkByLabel() or mhGetLinkByHref()."
      );
    }
    return cy.visit(link.href, options);
  }
);

/** Mail Collection Assertions */

Cypress.Commands.add("mhHasMailWithSubject", (subject) => {
  cy.mhGetMailsBySubject(subject).should("not.have.length", 0);
});

Cypress.Commands.add("mhHasMailFrom", (from) => {
  cy.mhGetMailsBySender(from).should("not.have.length", 0);
});

Cypress.Commands.add("mhHasMailTo", (recipient) => {
  cy.mhGetMailsByRecipient(recipient).should("not.have.length", 0);
});

/** Helpers */

Cypress.Commands.add("mhWaitForMails", (moreMailsThen = 0) => {
  cy.mhGetAllMails().should("to.have.length.greaterThan", moreMailsThen);
});

/** Attachments */

Cypress.Commands.add("mhGetAttachments", { prevSubject: true }, (mail) => {
  const attachments = [];

  // search through mime parts to find attachments
  if (Array.isArray(mail.MIME?.Parts)) {
    for (const mimePart of mail.MIME.Parts) {
      // content disposition tells us if this part represents an attachment
      // sample: Content-Disposition: ["attachment; filename=sample.pdf"]
      if (
        mimePart.Headers &&
        mimePart.Headers["Content-Disposition"] &&
        mimePart.Headers["Content-Disposition"][0]
      ) {
        const contentDisposition = mimePart.Headers["Content-Disposition"][0];
        if (contentDisposition) {
          const dispositionTokens = contentDisposition
            .split(";")
            .map((token) => token.trim());
          if (dispositionTokens.includes("attachment")) {
            const fileNameToken = dispositionTokens.find((token) =>
              token.startsWith("filename=")
            );
            const fileName = fileNameToken.replace("filename=", "");
            attachments.push(fileName);
          }
        }
      }
    }
  }

  return cy.wrap(attachments);
});
