import { guest, requireWriteCredentials, roomAndDates } from '../../support/data';
import { assertPriceSummary, fillGuest, openForm, reservationUrl } from '../../support/pages/reservation';
import { witnessCreate } from '../../support/cleanup';
import type { BookingIdentity } from '../../support/api-types';

// TEMPORARY React #418 allowance, scoped to this spec only (evidence 20261009-418diag-*, phase B XML).
// Evidence suggests the hydration error is runner-induced (Cypress-injected script; absent in plain Chrome;
// medium-high confidence, mechanism not isolated). It does not prove the app is defect-free.
// Remove when #418 no longer occurs under Cypress or the mechanism is fixed.
const ALLOWED_MESSAGE = 'Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=';
const ALLOWED_STACK_SOURCE = '/_next/static/chunks/174b7k13ybrt2.js';
const CHUNK_FRAME = /\/_next\/static\/chunks\/[^\s):]+/g;
const DAY_MS = 86400000;

type AppErrorRecord = { test: string[]; attempt: number; load: number; at: string; messageMatched: boolean;
  stackSourceMatched: boolean | null; firstChunkFrame: string | null; allowed: boolean };
let records: AppErrorRecord[] = [];

function allowOneReact418PerLoad() {
  let loads = 0;
  let matchesThisLoad = 0;
  cy.on('window:before:load', () => { matchesThisLoad = 0; loads++; });
  cy.on('uncaught:exception', (err: Error) => {
    const message = err?.message ?? '';
    const stack = err?.stack ?? '';
    const frames = stack.match(CHUNK_FRAME) ?? [];
    const messageMatched = message.includes(ALLOWED_MESSAGE);
    const stackSourceMatched = frames.length ? stack.includes(ALLOWED_STACK_SOURCE) : null;
    const allowed = messageMatched && stackSourceMatched !== false && matchesThisLoad === 0;
    if (messageMatched) matchesThisLoad++;
    records.push({ test: Cypress.currentTest.titlePath, attempt: Cypress.currentRetry, load: loads,
      at: new Date().toISOString(), messageMatched, stackSourceMatched, firstChunkFrame: frames[0] ?? null, allowed });
    if (allowed) return false;
    // Any other error, a non-matching stack source or a second match in the same load fails the test.
    return undefined;
  });
}

describe('Anonymous guest booking with URL-preselected dates and real backend', () => {
  requireWriteCredentials();
  afterEach(() => {
    const batch = records;
    records = [];
    cy.task('recordAllowedAppErrors', batch, { log: false });
  });
  for (const [title, width, height] of [
    ['[S-10][R-01] guest books URL-preselected dates and sees confirmation at 1280x800 desktop engine @p0 @write @hotfix', 1280, 800],
    ['[S-11][R-01][R-08] guest books URL-preselected dates and sees confirmation at 390x844 desktop engine @p0 @write @hotfix', 390, 844]
  ] as const) {
    it(title, () => {
      cy.viewport(width, height);
      cy.clearAllCookies({ log: false });
      roomAndDates().then(({ room, dates }) => {
        const payload = guest(room.roomid, dates);
        const nights = Math.round((Date.parse(`${dates.checkout}T12:00:00Z`) - Date.parse(`${dates.checkin}T12:00:00Z`)) / DAY_MS);
        expect(nights, 'nights computed from the target dates').to.eq(2);
        cy.intercept({ method: 'POST', pathname: '/api/booking' }, req => {
          const identity: BookingIdentity = { roomid: req.body.roomid, firstname: payload.firstname,
            lastname: payload.lastname, depositpaid: req.body.depositpaid,
            bookingdates: { ...req.body.bookingdates } };
          const witness = witnessCreate(identity);
          req.on('response', response => {
            witness.rejected = response.statusCode >= 400 && typeof response.body?.bookingid !== 'number';
            if (typeof response.body?.bookingid === 'number') witness.bookingid = response.body.bookingid;
          });
          // Observation only: no req.body assignments, reply(), stubs or business-field rewriting.
        }).as('booking');
        allowOneReact418PerLoad();
        cy.visit(reservationUrl(room.roomid, dates));
        openForm();
        assertPriceSummary(room.roomPrice, nights);
        fillGuest(payload);
        cy.getCookie('token', { log: false }).should('be.null');
        cy.contains('button', /^Reserve Now$/).click();
        cy.wait('@booking', { log: false }).then(exchange => {
          const request = exchange.request.body;
          const response = exchange.response;
          // Register before any contract/UI assertion, including unexpected successful statuses.
          const registration = response && ((response.statusCode >= 200 && response.statusCode < 300) || typeof response.body?.bookingid === 'number')
            ? cy.task('registerBooking', { bookingid: response.body?.bookingid ?? null,
              identity: { roomid: request.roomid, firstname: payload.firstname, lastname: payload.lastname,
                depositpaid: request.depositpaid, bookingdates: { ...request.bookingdates } } }, { log: false })
            : cy.wrap(null, { log: false });
          return registration.then(() => {
            return cy.task('recordBookingObservation', { test: Cypress.currentTest.titlePath,
              attempt: Cypress.currentRetry, observedAt: new Date().toISOString(), initialWindow: 'url-preselected',
              status: response?.statusCode ?? 0,
              expectedDates: dates, submittedDates: request.bookingdates,
              bookingid: response?.body.bookingid ?? null }, { log: false }).then(() => {
            expect(request.roomid, 'selected room').to.eq(room.roomid);
            expect(request.firstname, 'synthetic first name').to.eq(payload.firstname);
            expect(request.lastname, 'unique execution marker').to.eq(payload.lastname);
            expect(request.depositpaid).to.eq(false);
            expect(request.bookingdates, 'URL-preselected submitted dates').to.deep.eq(dates);
            expect(request.email === payload.email, 'email matches without exposing it').to.eq(true);
            expect(request.phone === payload.phone, 'phone matches without exposing it').to.eq(true);
            expect(response?.statusCode, 'real response status; unexpected cause unknown').to.eq(201);
            expect(response?.body.bookingid, 'real returned ID').to.be.a('number');
            expect(response?.body.roomid, 'echoed room identity').to.eq(room.roomid);
            expect(response?.body.firstname).to.eq(payload.firstname);
            expect(response?.body.lastname).to.eq(payload.lastname);
            expect(response?.body.depositpaid).to.eq(false);
            expect(response?.body.bookingdates, 'real echoed dates').to.deep.eq(dates);
            cy.contains('h2', /^Booking Confirmed$/).should('be.visible');
            cy.contains('.booking-card strong', `${dates.checkin} - ${dates.checkout}`).should('be.visible');
            cy.contains('a', /^Return home$/).should('be.visible');
            });
          });
        });
      });
    });
  }
});
