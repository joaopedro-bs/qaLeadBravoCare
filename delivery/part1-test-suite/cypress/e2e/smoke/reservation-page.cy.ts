import { roomAndDates } from '../../support/data';
import { openForm, reservationUrl } from '../../support/pages/reservation';

describe('Reservation page', () => {
  it('[S-09][R-01] API-sourced room opens reservation form @p0 @readonly @smoke', () => {
    roomAndDates().then(({ room, dates }) => {
      cy.visit(reservationUrl(room.roomid, dates));
      cy.get('.rbc-calendar').should('be.visible');
      cy.get('body').then($body => {
        // Read-only spike: selectors and visible copy only, no contacts or page body dump.
        const safe = {
          buttons: $body.find('button').toArray().map(e => e.textContent?.trim()),
          inputs: $body.find('input').toArray().map(e => {
            const input = e as unknown as HTMLInputElement;
            return { type: input.type, class: input.className, placeholder: input.placeholder };
          }),
          calendarClasses: [...new Set($body.find('[class*="rbc-"]').toArray().map(e => e.className))]
        };
        cy.writeFile('results/reservation-dom-inspection.json', safe, { log: false });
      });
      openForm();
    });
  });
});
