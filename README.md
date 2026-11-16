# cypress-mailhog

A collection of useful Cypress commands for MailHog 🐗.

This package supports TypeScript out of the box.

### Setup

Install this package:

```bash
# npm
npm install --save-dev cypress-mailhog

# yarn
yarn add --dev cypress-mailhog

# pnpm
pnpm add -D cypress-mailhog
```

Include this package into your Cypress command file:

```JavaScript
// cypress/support/commands
import 'cypress-mailhog';
```

Add the base url of your MailHog installation to the `expose` block of your `cypress.config.ts` / `cypress.config.js`:

```typescript
export default defineConfig({
  projectId: "****",
  expose: {
    mailHogUrl: "http://localhost:8090/",
  },
});
```

You can also pass it via the CLI (`cypress run --expose mailHogUrl=http://localhost:8090/`).
For backwards compatibility, `mailHogUrl` is also read from `env` (e.g. `CYPRESS_mailHogUrl`) and from the `e2e` config block.

> **Note:** Since version 3.0 this package requires Cypress `>= 15.10.0`, because it uses
> [`Cypress.expose()`](https://on.cypress.io/expose) and [`cy.env()`](https://on.cypress.io/env)
> instead of `Cypress.env()`, which was removed in Cypress 16. Use version 2.x for older Cypress versions.

### MailHog authentication (Basic Auth)

If your MailHog instance uses authentication, add `mailHogAuth` to your cypress `env` config.
Credentials are read with `cy.env()`, so they are never exposed to the browser / application under test.

```typescript
export default defineConfig({
  env: {
    mailHogAuth: { user: "mailhog username", pass: "mailhog password" },
  },
});
```

or add `mailHogUsername` and `mailHogPassword` to your cypress `env` config
(e.g. via the `CYPRESS_mailHogUsername` and `CYPRESS_mailHogPassword` environment variables):

```typescript
export default defineConfig({
  env: {
    mailHogUsername: "mailhog username",
    mailHogPassword: "mailhog password",
  },
});
```

## Commands

### Mail Collection

#### mhGetAllMails( limit=50, options={timeout=defaultCommandTimeout} )

Yields an array of all the mails stored in MailHog. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1);
```

#### mhGetMailsBySubject( subject, limit=50, options={timeout=defaultCommandTimeout} )

Fetches all mails from MailHog and yields an array of all mails with given subject. Encoded subjects are decoded before comparing. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mhGetMailsBySubject('My Subject')
  .should('have.length', 1);
```

#### mhGetMailsBySender( from, limit=50, options={timeout=defaultCommandTimeout} )

Fetches all mails from MailHog and yields an array of all mails with given sender. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mhGetMailsBySender('sender@example.com')
  .should('have.length', 1);
```

#### mhGetMailsByRecipient( recipient, limit=50 )

Fetches all mails from MailHog and yields an array of all mails with given recipient.

```JavaScript
cy
  .mhGetMailsByRecipient('recipient@example.com')
  .should('have.length', 1);
```

#### mhFirst()

Yields the first mail of the loaded selection.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst();
```

#### mhDeleteAll(options={timeout=requestTimeout})

Deletes all stored mails from MailHog.

```JavaScript
cy.mhDeleteAll();

```

### Mail Searching

#### mhSearchMails( kind, query, limit=50, options={timeout=defaultCommandTimeout} )

Yields an array of mails matching the search query. This retries automatically until mails are found (or until timeout is reached).

Possible search kinds are `from` (sender), `to` (recipient) or `containing` (subject).

```JavaScript
cy
  .mhSearchMails('containing', 'My favorite subject')
  .should('have.length', 1)
  .mhFirst();

```

### Collection Filtering 🪮

**Note:** the below described filter functions can be chained together to build complex filters. They are currently not automatically retrying. So make sure to either wait a certain time before fetching your mails or to implement you own re-try logic.

#### mhFilterBySubject( subject )

Filters the current mails in context by subject and returns the filtered mail list. Encoded subjects are decoded before comparing.

```JavaScript
cy
  .mhGetMailsBySender('sender@example.com')
  .mhFilterBySubject('My Subject')
  .should('have.length', 1);
```

#### mhFilterByRecipient( recipient )

Filters the current mails in context by recipient and returns the filtered mail list.

```JavaScript
cy
  .mhGetMailsBySender('sender@example.com')
  .mhFilterByRecipient('recipient@example.com')
  .should('have.length', 1);
```

#### mhFilterBySender( sender )

Filters the current mails in context by sender and returns the filtered mail list.

```JavaScript
cy
  .mhGetMailsByRecipient('recipient@example.com')
  .mhFilterBySender('sender@example.com')
  .should('have.length', 1);
```

#### Chaining Filters

Filters can be infinitely chained together.

```JavaScript
cy
  .mhGetAllMails()
  .mhFilterBySubject('My Subject')
  .mhFilterByRecipient('recipient@example.com')
  .mhFilterBySender('sender@example.com')
  .should('have.length', 1);
```

### Handling a Single Mail ✉️

#### mhGetSubject()

Yields the decoded subject of the current mail (encoded subjects like `=?UTF-8?Q?Gr=C3=BC=C3=9Fe?=` are yielded as `Grüße`).

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetSubject()
  .should('eq', 'My Mails Subject');
```

#### mhGetBody()

Yields the body of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetBody()
  .should('contain', 'Part of the Message Body');
```

**Note:** `mhGetBody()` yields the raw body as stored by MailHog, which may still be encoded (e.g. quoted-printable) and, for multipart mails, contains all parts including their MIME boundaries. Use `mhGetText()` / `mhGetHtml()` to assert on the decoded content.

#### mhGetText()

Yields the decoded plain text body of the current mail (`undefined` if the mail has no text part).

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetText()
  .should('contain', 'Grüße');
```

#### mhGetHtml()

Yields the decoded HTML body of the current mail (`undefined` if the mail has no HTML part).

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetHtml()
  .should('contain', '<b>Grüße</b>');
```

#### mhParseMail()

Parses the current mail with [postal-mime](https://github.com/postalsys/postal-mime) and yields the decoded result: `subject`, `from`, `to`, `cc`, `headers`, `text`, `html` and `attachments` (including their content). Encoded bodies (quoted-printable, base64), encoded headers and charsets are decoded — no `cy.task()` or plugin setup required.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhParseMail()
  .its('text')
  .should('contain', 'Grüße');

cy
  .mhGetMailsBySubject('Mail with Attachment')
  .mhFirst()
  .mhParseMail()
  .its('attachments')
  .should('have.length', 2);
```

#### mhGetSender()

Yields the sender of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetSender()
  .should('eq', 'sender@example.com');
```

#### mhGetRecipients()

Yields the recipient of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetRecipients()
  .should('contain', 'recipient@example.com');
```

#### mhGetAttachments()

Yields the list of all file names of the attachments of the current mail.

```JavaScript
cy
  .mhGetAllMails()
  .should('have.length', 1)
  .mhFirst()
  .mhGetAttachments()
  .should('have.length', 2)
  .should('include', 'sample.pdf');
```

### Links 🔗

Links are extracted from the decoded HTML part (quoted-printable encoding and HTML entities like `&amp;` are resolved). Mails without an HTML part fall back to the plain `http(s)://` urls found in the text part, using the url as label. Labels have their whitespace collapsed; image-only links use `aria-label`, `title` or the image's `alt` text.

#### mhGetLinks()

Yields all links of the current mail as `{ label, href }` objects, in document order.

```JavaScript
cy
  .mhGetMailsBySubject('Newsletter')
  .mhFirst()
  .mhGetLinks()
  .each((link) => cy.request(link.href)); // e.g. assert there are no broken links
```

#### mhGetLinkByLabel( label )

Yields the first link whose label equals `label` (exact match) or matches the given `RegExp`. Fails with a list of the available labels if no link matches.

```JavaScript
cy
  .mhGetMailsBySubject('Confirm your account')
  .mhFirst()
  .mhGetLinkByLabel('Confirm account')
  .its('href')
  .should('contain', 'token=');
```

#### mhGetLinkByHref( href )

Yields the first link whose href equals `href` (exact match) or matches the given `RegExp`. Fails with a list of the available hrefs if no link matches.

```JavaScript
cy
  .mhGetMailsBySubject('Confirm your account')
  .mhFirst()
  .mhGetLinkByHref(/\/confirm\?token=/)
  .its('label')
  .should('eq', 'Confirm account');
```

#### mhVisitLink( options={} )

Visits the link yielded by `mhGetLinkByLabel()` / `mhGetLinkByHref()`, or the first link of the list yielded by `mhGetLinks()`. `options` are passed on to `cy.visit()`.

```JavaScript
// click-through test
cy
  .mhGetMailsBySubject('Confirm your account')
  .mhFirst()
  .mhGetLinkByLabel('Confirm account')
  .mhVisitLink();

cy.contains('Your account is confirmed');
```

**Note:** if the link points to a different origin than your `baseUrl`, wrap the following commands in [`cy.origin()`](https://on.cypress.io/origin).

### Asserting the Mail Collection 🔍

#### mhHasMailWithSubject( subject )

Asserts if there is a mail with given subject.

```JavaScript
cy.mhHasMailWithSubject('My Subject');
```

#### mhHasMailFrom( from )

Asserts if there is a mail from given sender.

```JavaScript
cy.mhHasMailFrom('sender@example.com');
```

#### mhHasMailTo( recipient )

Asserts if there is a mail to given recipient (looks for "To", "CC" and "BCC").

```JavaScript
cy.mhHasMailTo('recipient@example.com');
```

### Helper Functions ⚙️

#### mhWaitForMails( moreMailsThen = 0 )

Waits until more then <`moreMailsThen`> mails are available on MailHog.
This is especially useful when using the `mhFilterBy<X>` functions, since they do not support automatic retrying.

```JavaScript
// this waits until there are at least 10 mails on MailHog
cy
  .mhWaitForMails(9)
  .mhGetAllMails()
  .mhFilterBySender("sender-10@example.com")
  .should("have.length", 1);
```

### Jim Chaos Monkey 🐵

#### mhGetJimMode()

Returns if Jim is enabled / disabled.

```JavaScript
cy
  .mhGetJimMode()
  .should('eq', true);
```

#### mhSetJimMode( enabled )

Enables / Disables Jim chaos monkey.

```JavaScript
cy
  .mhSetJimMode(true)
  .mhGetJimMode()
  .should('eq', true);
```

## Package Development

### Start Local Test Server

Navigate into the `test-server` directory.

```bash
cd ./test-server/
```

Install dependencies.

```bash
composer install
yarn # or npm install
```

Start docker server.

```bash
docker compose up
```

Open the test page in your browser: [http://localhost:3000/cypress-mh-tests/](http://localhost:3000/cypress-mh-tests/)

Open MailHog in your browser: [http://localhost:8090/](http://localhost:8090/)

Open the Cypress test client.

```bash
yarn cypress:open
```

### Commits, Pull Requests & Releases

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), title only — no body, no AI attribution, lowercase scope — e.g. `feat(commands): add mhGetMailsByCc`, `docs(readme): fix typo`. The `/commit` Claude Code skill automates it.
- **Pull requests:** follow the [pull request guide](./documentation/pull-request-guide.md) (`[Feat] …` titles, Description + Demo sections, labels for release drafting). The `/create-pr` Claude Code skill automates it.
Merged PRs are collected into a draft release by [Release Drafter](https://github.com/release-drafter/release-drafter), grouped by their labels.
