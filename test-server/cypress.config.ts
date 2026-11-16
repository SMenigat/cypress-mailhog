import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000/cypress-mh-tests/',
  },
  expose: {
    mailHogUrl: 'http://localhost:8090',
  },
})
