# cypress-mailhog

A collection of usefull Cypress commands for MailHog 🐗.

### Setup
Install this package via NPM:
```bash
npm install --dev cypress-mailhog
```

Include this package into your Cypress command file:
```JavaScript
// cypress/support/commands.js
import 'cypress-mailhog';
```

Add the base url of your MailHog installation to your `cypress.json`:
```json
{
  ...
  "mailHogUrl": "http://localhost:8090"
}
```


## Commands
### Mail Collection
#### mhGetAllMails() 
Returns a promise, containing an array of all the mails stored in MailHog.
```JavaScript
cy.mhGetAllMails().should('have.length', 1);
```
#### mhGetMailsBySubject( subject ) 
Returns a promise, containing an array of all mails with given subject.
```JavaScript
cy.mhGetMailsBySubject('My Subject').should('have.length', 1);
```
#### mhGetMailsBySender( from ) 
Returns a promise, containing an array of all mails with given sender.
```JavaScript
cy.mhGetMailsBySender('sender@example.com').should('have.length', 1);
```
#### mhGetMailsByRecipient( recipient ) 
Returns a promise, containing an array of all mails with given recipient.
```JavaScript
cy.mhGetMailsByRecipient('recipient@example.com').should('have.length', 1);
```
#### mhDeleteAll()
Deletes all stored mails from MailHog.
```JavaScript
cy.mhDeleteAll();
``` 


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
cy.mhHasMailFrom('recipient@example.com');
``` 


### Jim Chaos Monkey 🐵
#### mhGetJimMode()
Returns if Jim is enabled / disabled.
```JavaScript
cy.mhGetJimMode().should('eq', true);
```
#### mhSetJimMode( enabled )
Enables / Disables Jim chaos monkey.
```JavaScript
cy.mhSetJimMode(true).mhGetJimMode().should('eq', true);
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
docker-compose up
```
Open the Testpage in your browser: [http://localhost:8080/cypress-mh-tests/](http://localhost:8080/cypress-mc-tests/)
Open MailHog in your browser: [http://localhost:8090/](http://localhost:8090/)

Open the Cypress testclient.
```bash
yarn cypress:open
```