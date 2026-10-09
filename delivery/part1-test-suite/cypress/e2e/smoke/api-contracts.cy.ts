import type { Room } from '../../support/api-types';

describe('Read-only API contracts', () => {
  it('[S-01][R-01][R-03] room list has the observed contract @p0 @readonly @smoke', () => {
    cy.request<{ rooms: Room[] }>({ url: '/api/room', log: false }).then(r => {
      expect(r.status).to.eq(200);
      expect(r.body.rooms).to.be.an('array').and.not.be.empty;
      r.body.rooms.forEach(room => {
        ['roomid', 'roomPrice'].forEach(k => expect(room[k as keyof Room], k).to.be.a('number'));
        ['roomName', 'type', 'image', 'description'].forEach(k => expect(room[k as keyof Room], k).to.be.a('string'));
        expect(room.accessible).to.be.a('boolean');
        expect(room.features).to.be.an('array');
        room.features.forEach(f => expect(f).to.be.a('string'));
      });
    });
  });
  it('[S-03][R-02][R-03] anonymous booking list is rejected @p0 @readonly @smoke', () => {
    cy.clearAllCookies({ log: false });
    cy.request({ url: '/api/booking', failOnStatusCode: false, log: false }).then(r => {
      expect(r.status).to.eq(401);
      expect(r.body).to.deep.eq({ error: 'Authentication required' });
    });
  });
});
