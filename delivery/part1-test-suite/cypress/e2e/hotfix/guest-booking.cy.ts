import { guest, requireWriteCredentials, roomAndDates } from '../../support/data';
import { fillGuest, openForm, reservationUrl, selectDates } from '../../support/pages/reservation';
import { witnessCreate } from '../../support/cleanup';
import type { BookingIdentity } from '../../support/api-types';

describe('Anonymous guest booking with real calendar and backend', () => {
  requireWriteCredentials();
  // S-10 starts with the URL Selected event visible in the target month; S-11 starts with it outside.
  for (const [id, width, height, placement] of [['S-10', 1280, 800, 'inside-target-month'],
    ['S-11', 390, 844, 'outside-target-month']] as const) {
    it(`[${id}][R-01] real booking and visible confirmation at ${width}x${height} desktop engine @p0 @write @hotfix`, () => {
      cy.viewport(width, height);
      cy.clearAllCookies({ log: false });
      roomAndDates().then(({ room, dates }) => {
        const payload = guest(room.roomid, dates);
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
        cy.visit(reservationUrl(room.roomid, dates, placement));
        selectDates(dates, placement);
        openForm();
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
              attempt: Cypress.currentRetry, observedAt: new Date().toISOString(), initialWindow: placement,
              status: response?.statusCode ?? 0,
              expectedDates: dates, submittedDates: request.bookingdates,
              bookingid: response?.body.bookingid ?? null }, { log: false }).then(() => {
            expect(request.roomid, 'selected room').to.eq(room.roomid);
            expect(request.firstname, 'synthetic first name').to.eq(payload.firstname);
            expect(request.lastname, 'unique execution marker').to.eq(payload.lastname);
            expect(request.depositpaid).to.eq(false);
            expect(request.bookingdates, 'real calendar submitted dates').to.deep.eq(dates);
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
