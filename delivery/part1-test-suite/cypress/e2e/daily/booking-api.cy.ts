import { guest, requireWriteCredentials, roomAndDates } from '../../support/data';
import type { CleanupOutcome, SafeResponse } from '../../support/api-types';

describe('Guest to administrative API lifecycle', () => {
  requireWriteCredentials();
  it('[S-31][S-12][S-15][R-01][R-02][R-03] create, overlap, admin visibility, report and owned deletion @p0 @write @daily', () => {
    roomAndDates().then(({ room, dates }) => {
      const payload = guest(room.roomid, dates);
      cy.task<SafeResponse>('createBooking', payload, { log: false }).then(created => {
        expect(created.status, 'anonymous create status; cause unknown on mismatch').to.eq(201);
        expect(created.booking?.bookingid, 'returned booking ID').to.be.a('number');
        const bookingid = created.booking!.bookingid;
        expect(created.booking).to.deep.eq({ bookingid, roomid: payload.roomid,
          firstname: payload.firstname, lastname: payload.lastname, depositpaid: false, bookingdates: dates });
        expect(created.contactFieldsAbsent, 'observed echo excludes contact fields').to.eq(true);
        cy.task<SafeResponse>('createBooking', payload, { log: false }).then(overlap => {
          expect(overlap.status, 'deliberate identical overlap status').to.eq(409);
          expect(overlap.error, 'observed overlap error contract').to.eq('Failed to create booking');
        });
        cy.task<{ status: number; matches: boolean; listStatus: number; listed: boolean }>(
          'verifyOwnedBooking', { bookingid, identity: payload }, { log: false }
        ).then(read => {
          expect(read.status, 'owned record read status; cause unknown on mismatch').to.eq(200);
          expect(read.matches, 'owned record identity').to.eq(true);
          expect(read.listStatus).to.eq(200);
          expect(read.listed, 'owned booking in room-filtered list').to.eq(true);
        });
        cy.request<{ report: { start: string; end: string }[] }>({ url: `/api/report/room/${room.roomid}`, log: false }).then(report => {
          expect(report.status).to.eq(200);
          expect(report.body.report.some(e => e.start <= dates.checkin && e.end >= dates.checkin),
            'availability report covers owned check-in').to.eq(true);
        });
        cy.task<CleanupOutcome>('cleanupBooking', bookingid, { log: false }).then(cleanup => {
          expect(cleanup.outcome, 'identity checked, deleted, and subsequent GET absent').to.eq('deleted-and-absent');
          expect(cleanup.status).to.eq(202);
        });
      });
    });
  });
  it('[S-14][R-01][R-03] invalid fields return observed validation rules @p1 @write @daily', () => {
    roomAndDates().then(({ room, dates }) => {
      const payload = { ...guest(room.roomid, dates), firstname: 'Qa', email: 'invalid', phone: '123' };
      // Node task registers any unexpected successful create before returning to assertions.
      cy.task<SafeResponse>('createBooking', payload, { log: false }).then(r => {
        expect(r.status, 'invalid create status').to.eq(400);
        expect(r.errors).to.be.an('array');
        expect(r.errors).to.include.members(['size must be between 3 and 18',
          'size must be between 11 and 21', 'must be a well-formed email address']);
      });
    });
  });
});
