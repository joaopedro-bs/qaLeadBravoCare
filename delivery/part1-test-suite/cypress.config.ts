import { defineConfig } from 'cypress';
import { installTasks } from './cypress/support/node-tasks';

export default defineConfig({
  retries: { runMode: 1, openMode: 0 },
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 30000,
  video: false,
  screenshotOnRunFailure: false,
  reporter: 'junit',
  reporterOptions: { mochaFile: 'results/junit/results-[hash].xml', toConsole: false },
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://automationintesting.online',
    testIsolation: true,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(on, config) {
      // Cypress auto-imports CYPRESS_* variables. Remove secrets before browser config is sent.
      delete config.env.ADMIN_USER;
      delete config.env.ADMIN_PASSWORD;
      config.env.CI = process.env.CI === 'true';
      installTasks(on, config);
      return config;
    }
  }
});
