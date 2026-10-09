afterEach(() => {
  // Task records failures separately; it never throws an HTTP error over the original assertion.
  cy.task('cleanupCurrentAttempt', null, { log: false, timeout: 120000 });
});
