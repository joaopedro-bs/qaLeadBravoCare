let hydrationErrors = 0;
Cypress.on('uncaught:exception', error => {
  // React reports this recoverable hydration mismatch while replacing the server tree.
  // Record every occurrence; functional assertions still must pass. Other errors fail normally.
  if (error.message.includes('Minified React error #418;')) {
    hydrationErrors++;
    return false;
  }
});
afterEach(function () {
  drainObservedCreates().forEach(entry => cy.task('registerBooking', entry, { log: false }));
  cy.task('recordBrowserSymptoms', { react418: hydrationErrors,
    test: this.currentTest?.fullTitle(), attempt: Cypress.currentRetry }, { log: false });
  hydrationErrors = 0;
  // Task records failures separately; it never throws an HTTP error over the original assertion.
  cy.task('cleanupCurrentAttempt', null, { log: false, timeout: 120000 });
});
import { drainObservedCreates } from './cleanup';
