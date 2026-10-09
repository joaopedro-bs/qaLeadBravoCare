import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installTasks } from '../cypress/support/node-tasks.ts';

const identity = { roomid: 1, firstname: 'Tester', lastname: 'qaabcdefgh', depositpaid: false,
  bookingdates: { checkin: '2029-01-01', checkout: '2029-01-03' } };

function harness(t, responses) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-cleanup-proof-'));
  const handlers = {};
  const calls = [];
  const before = { user: process.env.CYPRESS_ADMIN_USER, password: process.env.CYPRESS_ADMIN_PASSWORD };
  process.env.CYPRESS_ADMIN_USER = 'synthetic-test-user';
  process.env.CYPRESS_ADMIN_PASSWORD = 'synthetic-test-secret';
  t.after(() => {
    for (const [key, value] of [['CYPRESS_ADMIN_USER', before.user], ['CYPRESS_ADMIN_PASSWORD', before.password]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    fs.rmSync(root, { recursive: true, force: true });
  });
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ pathname: url.pathname, method: options.method });
    if (url.pathname === '/api/auth/login') return Response.json({ token: 'synthetic-test-token' });
    if (url.pathname === '/api/auth/validate') return Response.json({ valid: true });
    const response = responses.shift();
    if (!response) throw new Error('Unplanned request');
    return Response.json(response.body ?? {}, { status: response.status });
  });
  installTasks((event, callback) => { handlers[event] = callback; }, { projectRoot: root, baseUrl: 'https://example.invalid' });
  handlers.task.registerBooking({ bookingid: 7, identity });
  return { handlers, calls, summary: () => JSON.parse(fs.readFileSync(path.join(root, 'results/run-summary.json'), 'utf8')),
    registry: () => JSON.parse(fs.readFileSync(path.join(root, 'results/cleanup-registry.json'), 'utf8')) };
}

test('missing record clears obligation without DELETE or reset classification', async t => {
  const h = harness(t, [{ status: 404 }]);
  const result = await h.handlers.task.cleanupBooking(7);
  assert.equal(result.outcome, 'already-absent');
  assert.equal(result.classification, 'unknown');
  assert.equal(h.calls.some(c => c.method === 'DELETE'), false);
  assert.equal(h.registry().length, 0);
});
test('reused ID with different identity is never deleted and remains unresolved', async t => {
  const h = harness(t, [{ status: 200, body: { bookingid: 7, ...identity, lastname: 'other-person' } }]);
  const result = await h.handlers.task.cleanupBooking(7);
  assert.equal(result.outcome, 'identity-mismatch-no-delete');
  assert.equal(h.calls.some(c => c.method === 'DELETE'), false);
  assert.equal(h.registry().length, 1);
  assert.throws(() => h.handlers['after:run']({ cypressVersion: 'unit-proof' }), /UNRESOLVED CLEANUP/);
});
test('GET returning another ID with matching fields cannot authorize deletion', async t => {
  const h = harness(t, [{ status: 200, body: { bookingid: 8, ...identity } }]);
  assert.equal((await h.handlers.task.cleanupBooking(7)).outcome, 'identity-mismatch-no-delete');
  assert.equal(h.calls.some(c => c.method === 'DELETE'), false);
  assert.equal(h.registry().length, 1);
});
test('unverifiable identity and failed deletion retain separate obligations', async t => {
  const h = harness(t, [{ status: 401 }]);
  assert.equal((await h.handlers.task.cleanupBooking(7)).outcome, 'identity-unverified-no-delete');
  assert.equal(h.registry().length, 1);
  assert.equal(h.calls.some(c => c.method === 'DELETE'), false);
});
test('failed cleanup returns separately rather than replacing a test failure', async t => {
  const h = harness(t, [{ status: 200, body: { bookingid: 7, ...identity } }, { status: 500 }]);
  const result = await h.handlers.task.cleanupBooking(7);
  assert.equal(result.outcome, 'delete-failed');
  assert.equal(h.registry().length, 1);
  h.handlers['after:spec']({ relative: 'failed.cy.ts' }, { tests: [{ title: ['original failing test'], state: 'failed', attempts: [{ state: 'failed' }] }] });
  assert.throws(() => h.handlers['after:run']({ cypressVersion: 'unit-proof' }), /UNRESOLVED CLEANUP/);
  assert.equal(h.summary().specs[0].tests[0].state, 'failed');
  assert.equal(h.summary().cleanup[0].outcome, 'delete-failed');
});
test('matching identity permits DELETE and clears only after verified absence', async t => {
  const h = harness(t, [{ status: 200, body: { bookingid: 7, ...identity } }, { status: 202 }, { status: 404 }]);
  assert.equal((await h.handlers.task.cleanupBooking(7)).outcome, 'deleted-and-absent');
  assert.equal(h.calls.filter(c => c.method === 'DELETE').length, 1);
  assert.equal(h.registry().length, 0);
});
test('accepted create without ID remains an obligation and never triggers guessed deletion', async t => {
  const h = harness(t, []);
  h.handlers.task.registerBooking({ bookingid: null, identity: { ...identity, lastname: 'qazzzzzzzz' } });
  await h.handlers.task.cleanupCurrentAttempt();
  assert.equal(h.registry().length, 2);
  assert.equal(h.calls.some(c => c.method === 'DELETE'), false);
});
test('an allowed React #418 occurrence downgrades an all-pass run to PASS WITH RISKS', async t => {
  const h = harness(t, [{ status: 404 }]);
  await h.handlers.task.cleanupBooking(7);
  h.handlers.task.recordAllowedAppErrors([{ test: ['spec', 'S-10'], attempt: 0, load: 1, at: '2029-01-01T00:00:00.000Z',
    messageMatched: true, stackSourceMatched: true, firstChunkFrame: '/_next/static/chunks/174b7k13ybrt2.js', allowed: true }]);
  h.handlers['after:run']({ cypressVersion: 'unit-proof', totalTests: 1, totalPassed: 1,
    totalFailed: 0, totalPending: 0, totalSkipped: 0 });
  assert.equal(h.summary().status, 'PASS WITH RISKS');
  assert.equal(h.summary().allowedAppErrors.length, 1);
  assert.equal(h.summary().cleanupStatus, 'RESOLVED');
});
test('failed tests keep FAIL primary outcome even when cleanup is resolved', async t => {
  const h = harness(t, [{ status: 404 }]);
  await h.handlers.task.cleanupBooking(7);
  h.handlers['after:run']({ cypressVersion: 'unit-proof', totalTests: 1, totalPassed: 0,
    totalFailed: 1, totalPending: 0, totalSkipped: 0 });
  assert.equal(h.summary().status, 'FAIL: CORE INCOMPLETE');
  assert.equal(h.summary().totals.failed, 1);
  assert.equal(h.summary().cleanupStatus, 'RESOLVED');
});
