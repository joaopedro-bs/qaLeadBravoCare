import type { BookingRequest, Dates } from '../api-types';

// URL preselection: the target dates are passed in the query string; the calendar is not driven.
// Calendar drag selection is DEFERRED coverage (see README); git history keeps the native-pointer driver.
export function reservationUrl(roomid: number, dates: Dates) {
  return `/reservation/${roomid}?checkin=${dates.checkin}&checkout=${dates.checkout}`;
}

export function openForm() {
  cy.get('#doReservation').should('be.visible').click();
  cy.get('input.room-firstname').should('be.visible');
  cy.get('input.room-lastname').should('be.visible');
  cy.get('input.room-email').should('be.visible');
  cy.get('input.room-phone').should('be.visible');
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

// Pre-submit proof that the booking card priced the URL dates: "£{price} x {nights} nights" and
// Total "£{price*nights+40}" (fixed fees, per the app bundle). Fails if this structure is absent.
export function assertPriceSummary(roomPrice: number, nights: number) {
  const total = roomPrice * nights + 40;
  // Whitespace-tolerant on visible text only; (?!\d) stops £28 matching £280.
  cy.contains(new RegExp(`£${roomPrice}\\s*x\\s*${nights}\\s*nights`)).should('be.visible');
  cy.contains(new RegExp(`Total\\s*£${total}(?!\\d)`)).should('be.visible').invoke('text').should((text: string) => {
    expect(normalize(text), `[price-summary] Total row shows £${total}`).to.match(new RegExp(`Total ?£${total}(?!\\d)`));
  });
}

export function fillGuest(payload: BookingRequest) {
  cy.get('input.room-firstname').type(payload.firstname, { log: false });
  cy.get('input.room-lastname').type(payload.lastname, { log: false });
  cy.get('input.room-email').type(payload.email, { log: false });
  cy.get('input.room-phone').type(payload.phone, { log: false });
}
