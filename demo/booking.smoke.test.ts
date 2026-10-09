import { test } from 'node:test';
import assert from 'node:assert/strict';

// Smoke de API - dominio booking (restful-booker). Zero dependencias de runtime.
// Rodar:  node --experimental-strip-types --test demo/booking.smoke.test.ts   (Node 22+)

const BASE = 'https://restful-booker.herokuapp.com';
const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };

interface BookingDates { checkin: string; checkout: string; }
interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}
interface CreateBookingResponse { bookingid: number; booking: Booking; }

let bookingId: number | undefined; // compartilhado entre os passos do smoke

test('POST /booking cria reserva e retorna contrato valido', async () => {
  const payload: Booking = {
    firstname: 'Joao', lastname: 'Martins',
    totalprice: 1299, depositpaid: true,
    bookingdates: { checkin: '2026-08-01', checkout: '2026-08-08' },
    additionalneeds: 'Ocean-view cabin',
  };
  const res = await fetch(`${BASE}/booking`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
  assert.equal(res.status, 200, 'create deve retornar 200');
  const body = (await res.json()) as CreateBookingResponse;
  assert.ok(Number.isInteger(body.bookingid), 'bookingid deve ser inteiro');           // contrato
  assert.equal(body.booking.firstname, payload.firstname);                              // echo
  assert.equal(body.booking.totalprice, payload.totalprice);
  assert.equal(body.booking.bookingdates.checkin, payload.bookingdates.checkin);
  bookingId = body.bookingid;
});

test('GET /booking/{id} retorna a reserva persistida', async () => {
  assert.ok(bookingId, 'depende da reserva criada');
  const res = await fetch(`${BASE}/booking/${bookingId}`, { headers: { Accept: 'application/json' } });
  assert.equal(res.status, 200);
  const b = (await res.json()) as Booking;
  assert.equal(b.lastname, 'Martins');
  assert.equal(b.depositpaid, true);
});

test('GET /booking/{invalido} retorna 404 (caminho negativo)', async () => {
  const res = await fetch(`${BASE}/booking/99999999`, { headers: { Accept: 'application/json' } });
  assert.equal(res.status, 404, 'id inexistente deve dar 404, nao 200');
});
