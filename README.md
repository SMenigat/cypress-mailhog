# cypress-mailhog

A collection of usefull Cypress commands for MailHog 🐗.

### Start Dev Server

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

Open MailCatcher in your browser: [http://localhost:8090/](http://localhost:8090/)