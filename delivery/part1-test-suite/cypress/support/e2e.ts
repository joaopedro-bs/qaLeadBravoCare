import { drainObservedCreates } from './cleanup';

// No uncaught:exception handler: every application error, including React #418, fails the test by default.
afterEach(() => {
  drainObservedCreates().forEach(entry => cy.task('registerBooking', entry, { log: false }));
  // Task records failures separately; it never throws an HTTP error over the original assertion.
  cy.task('cleanupCurrentAttempt', null, { log: false, timeout: 120000 });
});
