import type { Room } from '../../support/api-types';

describe('Guest home', () => {
  for (const [id, width, height] of [['S-07', 1280, 800], ['S-08', 390, 844]] as const) {
    it(`[${id}][R-01] rooms and booking entry at ${width}x${height} desktop engine @p0 @readonly @smoke`, () => {
      cy.viewport(width, height);
      cy.request<{ rooms: Room[] }>({ url: '/api/room', log: false }).then(r => {
        expect(r.body.rooms).to.be.an('array').and.not.be.empty;
        cy.visit('/');
        r.body.rooms.forEach(room => {
          // The card displays room type, not roomName. Its reservation URL proves room identity.
          cy.get(`a[href^="/reservation/${room.roomid}?"]`).should('be.visible').closest('.card').within(() => {
            cy.contains(room.type).should('be.visible');
            cy.contains(room.description).should('be.visible');
            cy.contains(String(room.roomPrice)).should('be.visible');
          });
        });
        cy.get('a[href^="/reservation/"]').first().should('be.visible').click();
        cy.location('pathname').should('match', /^\/reservation\/\d+$/);
      });
    });
  }
});
