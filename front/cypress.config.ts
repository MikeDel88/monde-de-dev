import { defineConfig } from 'cypress'
import {environment} from "./src/environments/environment.test";

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  video:false,
  env: {
    apiUrl: environment.apiUrl,
    token: 'fake-jwt-token',
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
})
