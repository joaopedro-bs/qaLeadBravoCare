import type { BookingRequest, Dates, Room } from './api-types';

export function guest(roomid: number, bookingdates: Dates): BookingRequest {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const lastname = 'qa' + [...bytes].map(b => String.fromCharCode(97 + b % 26)).join('');
  return { roomid, firstname: 'Tester', lastname, depositpaid: false,
    email: `${lastname}@example.com`, phone: '01234567890', bookingdates };
}
export function roomAndDates(): Cypress.Chainable<{ room: Room; dates: Dates }> {
  return cy.request<{ rooms: Room[] }>({ url: '/api/room', log: false }).then(r => {
    expect(r.status, 'room list status').to.eq(200);
    expect(r.body.rooms, 'available catalogue').to.be.an('array').and.not.be.empty;
    const room = r.body.rooms[0];
    return cy.request<{ report: { start: string; end: string }[] }>({
      url: `/api/report/room/${room.roomid}`, log: false
    }).then(report => {
      expect(report.status, 'availability report status').to.eq(200);
      expect(report.body.report, 'availability report').to.be.an('array');
      const day = 86400000;
      for (let i = 0; i < 20; i++) {
        const start = new Date(); start.setUTCHours(0, 0, 0, 0);
        start.setUTCDate(start.getUTCDate() + 730 + Math.floor(Math.random() * 365));
        const end = new Date(start.getTime() + 2 * day);
        const free = report.body.report.every(e => end.getTime() + day < Date.parse(e.start) || start.getTime() - day > Date.parse(e.end));
        if (free) return { room, dates: { checkin: start.toISOString().slice(0, 10), checkout: end.toISOString().slice(0, 10) } };
      }
      throw new Error('No free window in 20 checked candidates; cause unknown. No booking submitted.');
    });
  });
}
export function requireWriteCredentials() {
  before(function () {
    cy.task<boolean>('credentialsAvailable', null, { log: false }).then(present => {
      if (!present) {
        if (Cypress.env('CI')) throw new Error('Write coverage unexecuted: admin environment credentials missing.');
        cy.log('WRITE COVERAGE UNEXECUTED: admin environment credentials missing');
        this.skip();
      }
    });
  });
}
