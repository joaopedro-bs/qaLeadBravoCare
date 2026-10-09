import type { BookingIdentity } from './api-types';

type ObservedCreate = { bookingid: number | null; identity: BookingIdentity; rejected: boolean };
const pending: ObservedCreate[] = [];

// Keeps a witness even if an application error interrupts cy.wait after submission.
// An accepted response without an ID or a missing response leaves an explicit obligation.
export function witnessCreate(identity: BookingIdentity) {
  const witness: ObservedCreate = { bookingid: null, identity, rejected: false };
  pending.push(witness);
  return witness;
}
export function drainObservedCreates() {
  return pending.splice(0).filter(e => !e.rejected).map(({ bookingid, identity }) => ({ bookingid, identity }));
}
