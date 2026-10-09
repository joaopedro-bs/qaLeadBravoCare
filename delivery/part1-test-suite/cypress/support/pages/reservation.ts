import type { BookingRequest, Dates } from '../api-types';

export function reservationUrl(roomid: number, target: Dates) {
  // The URL creates a Selected event over its initial dates. Start with a different
  // window, then change it through the calendar. The final request must prove the change.
  const previous = (date: string) => {
    const value = new Date(`${date}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() - 14);
    return value.toISOString().slice(0, 10);
  };
  return `/reservation/${roomid}?checkin=${previous(target.checkin)}&checkout=${previous(target.checkout)}`;
}

export function selectDates(dates: Dates) {
  const start = new Date(`${dates.checkin}T12:00:00Z`);
  const lastNight = new Date(`${dates.checkout}T12:00:00Z`);
  lastNight.setUTCDate(lastNight.getUTCDate() - 1);
  const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  cy.get('.rbc-calendar').should('be.visible');
  cy.get('.rbc-toolbar-label').invoke('text').then(currentLabel => {
    const current = new Date(`${currentLabel.trim()} 1`);
    const moves = (start.getUTCFullYear() - current.getFullYear()) * 12 + start.getUTCMonth() - current.getMonth();
    expect(moves, 'calendar navigation months').to.be.within(0, 37);
    for (let i = 0; i < moves; i++) cy.contains('.rbc-toolbar button', /^Next$/).click();
  });
  cy.get('.rbc-toolbar-label').should('have.text', label);
  cy.get('.rbc-calendar').scrollIntoView({ offset: { top: -120, left: 0 } });
  const dateCell = (day: number) => cy.contains('.rbc-date-cell:not(.rbc-off-range) button', String(day).padStart(2, '0')).parent();
  dateCell(start.getUTCDate()).then($start => {
    const row = $start.closest('.rbc-month-row');
    const first = row.find('.rbc-day-bg').get($start.index());
    dateCell(lastNight.getUTCDate()).then($end => {
      const last = $end.closest('.rbc-month-row').find('.rbc-day-bg').get($end.index());
      const a = first.getBoundingClientRect();
      const b = last.getBoundingClientRect();
      const opts = (r: DOMRect) => ({ eventConstructor: 'MouseEvent', clientX: r.x + r.width / 2,
        clientY: r.y + r.height - 4, which: 1, buttons: 1, bubbles: true });
      cy.wrap(first, { log: false }).trigger('mousedown', a.width / 2, a.height - 4,
        { ...opts(a), scrollBehavior: false });
      cy.get('body').trigger('mousemove', { ...opts(b), scrollBehavior: false })
        .trigger('mouseup', { ...opts(b), buttons: 0, scrollBehavior: false });
    });
  });
  cy.contains('.rbc-event', 'Selected').should('be.visible');
}

export function openForm() {
  cy.get('#doReservation').should('be.visible').click();
  cy.get('input.room-firstname').should('be.visible');
  cy.get('input.room-lastname').should('be.visible');
  cy.get('input.room-email').should('be.visible');
  cy.get('input.room-phone').should('be.visible');
}

export function fillGuest(payload: BookingRequest) {
  cy.get('input.room-firstname').type(payload.firstname, { log: false });
  cy.get('input.room-lastname').type(payload.lastname, { log: false });
  cy.get('input.room-email').type(payload.email, { log: false });
  cy.get('input.room-phone').type(payload.phone, { log: false });
}
