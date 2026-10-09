import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { BookingCreated, BookingIdentity, BookingRequest, CleanupOutcome, SafeResponse } from './api-types';

// The admin token stays in this Node closure, never in Cypress/browser state or artifacts.
export function installTasks(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
  const dir = path.join(config.projectRoot, 'results');
  fs.mkdirSync(dir, { recursive: true });
  const registryFile = path.join(dir, 'cleanup-registry.json');
  const run = randomUUID();
  type Entry = { run: string; bookingid: number | null; identity: BookingIdentity };
  let registry: Entry[] = fs.existsSync(registryFile)
    ? JSON.parse(fs.readFileSync(registryFile, 'utf8')) as Entry[] : [];
  const outcomes: CleanupOutcome[] = [];
  let token: string | undefined;
  const base = config.baseUrl!;
  const persist = () => fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2));
  const credentials = () => ({ username: process.env.CYPRESS_ADMIN_USER, password: process.env.CYPRESS_ADMIN_PASSWORD });
  async function request(method: string, endpoint: string, body?: unknown, admin = false): Promise<{ status: number; body: any }> {
    try {
      if (admin && !token) {
        const c = credentials();
        if (!c.username || !c.password) return { status: 0, body: null };
        const login = await request('POST', '/api/auth/login', c);
        if (login.status !== 200 || typeof login.body?.token !== 'string') return { status: 0, body: null };
        token = login.body.token;
        const validation = await request('POST', '/api/auth/validate', { token });
        if (validation.status !== 200 || validation.body?.valid !== true) {
          token = undefined;
          return { status: 0, body: null };
        }
      }
      const response = await fetch(new URL(endpoint, base), {
        method,
        headers: { 'Content-Type': 'application/json', ...(admin ? { Cookie: `token=${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
        redirect: 'error'
      });
      const data = await response.json().catch(() => null);
      return { status: response.status, body: data };
    } catch {
      // Never propagate fetch errors: they can contain credentials, cookies or record bodies.
      return { status: 0, body: null };
    }
  }
  function identity(input: BookingIdentity): BookingIdentity {
    return { roomid: input.roomid, firstname: input.firstname, lastname: input.lastname,
      depositpaid: input.depositpaid, bookingdates: { ...input.bookingdates } };
  }
  function register(input: { bookingid: number | null; identity: BookingIdentity }) {
    const id = typeof input.bookingid === 'number' && Number.isInteger(input.bookingid) ? input.bookingid : null;
    if (!registry.some(e => e.run === run && e.bookingid === id && e.identity.lastname === input.identity.lastname)) {
      registry.push({ run, bookingid: id, identity: identity(input.identity) });
      persist();
    }
    return null;
  }
  const matches = (b: BookingCreated, expected: BookingIdentity) =>
    b && b.roomid === expected.roomid && b.firstname === expected.firstname &&
    b.lastname === expected.lastname && b.depositpaid === expected.depositpaid &&
    b.bookingdates?.checkin === expected.bookingdates.checkin &&
    b.bookingdates?.checkout === expected.bookingdates.checkout;
  function record(entry: Entry, outcome: string, status?: number) {
    const result: CleanupOutcome = { bookingid: entry.bookingid, marker: entry.identity.lastname,
      outcome, status, classification: outcome === 'deleted-and-absent' ? 'not-applicable' : 'unknown' };
    outcomes.push(result);
    fs.appendFileSync(path.join(dir, 'cleanup-outcomes.jsonl'), JSON.stringify({ run, ...result }) + '\n');
    console.log(`[cleanup] id=${entry.bookingid ?? 'unknown'} outcome=${outcome} status=${status ?? 'n/a'}`);
    return result;
  }
  async function cleanup(entry: Entry) {
    if (entry.bookingid === null) return record(entry, 'missing-id-obligation');
    const endpoint = `/api/booking/${entry.bookingid}`;
    const read = await request('GET', endpoint, undefined, true);
    if (read.status === 404) {
      registry = registry.filter(e => e !== entry); persist();
      return record(entry, 'already-absent', 404); // Symptom only; cause remains unknown.
    }
    if (read.status !== 200) return record(entry, 'identity-unverified-no-delete', read.status);
    if (!matches(read.body, entry.identity)) return record(entry, 'identity-mismatch-no-delete', 200);
    const deletion = await request('DELETE', endpoint, undefined, true);
    if (deletion.status !== 202 && deletion.status !== 404) return record(entry, 'delete-failed', deletion.status);
    const verify = await request('GET', endpoint, undefined, true);
    if (verify.status !== 404) return record(entry, 'absence-unverified', verify.status);
    registry = registry.filter(e => e !== entry); persist();
    return record(entry, deletion.status === 202 ? 'deleted-and-absent' : 'already-absent', deletion.status);
  }
  on('task', {
    credentialsAvailable() { const c = credentials(); return !!(c.username && c.password); },
    registerBooking: register,
    async createBooking(payload: BookingRequest): Promise<SafeResponse> {
      const r = await request('POST', '/api/booking', payload);
      if (r.status >= 200 && r.status < 300) register({ bookingid: r.body?.bookingid ?? null, identity: payload });
      return { status: r.status,
        booking: r.status === 201 && r.body ? { bookingid: r.body.bookingid, ...identity(r.body) } : undefined,
        errors: Array.isArray(r.body?.errors) ? r.body.errors.filter((s: unknown) => typeof s === 'string') : undefined,
        error: r.body?.error === 'Failed to create booking' ? r.body.error : undefined,
        contactFieldsAbsent: r.body ? !('email' in r.body) && !('phone' in r.body) : undefined };
    },
    async verifyOwnedBooking(input: { bookingid: number; identity: BookingIdentity }) {
      const r = await request('GET', `/api/booking/${input.bookingid}`, undefined, true);
      const list = r.status === 200 ? await request('GET', `/api/booking?roomid=${input.identity.roomid}`, undefined, true) : null;
      return { status: r.status, matches: r.status === 200 && matches(r.body, input.identity),
        listStatus: list?.status, listed: Array.isArray(list?.body?.bookings) && list.body.bookings.some((b: BookingCreated) =>
          b.bookingid === input.bookingid && matches(b, input.identity)) };
    },
    async cleanupBooking(id: number) {
      const entry = registry.find(e => e.run === run && e.bookingid === id);
      return entry ? cleanup(entry) : { outcome: 'not-registered-no-delete' };
    },
    async cleanupCurrentAttempt() {
      for (const entry of [...registry].filter(e => e.run === run)) await cleanup(entry);
      return { unresolved: registry.length };
    }
  });
  const specs: unknown[] = [];
  on('after:spec', (spec, results) => {
    if (!results) return;
    specs.push({ spec: spec.relative, tests: results.tests.map(t => ({ title: t.title, state: t.state,
      attempts: t.attempts.map(a => ({ state: a.state })) })) });
  });
  on('after:run', results => {
    fs.writeFileSync(path.join(dir, 'run-summary.json'), JSON.stringify({ run, node: process.version,
      cypress: 'cypressVersion' in results ? results.cypressVersion : null,
      specs, cleanup: outcomes, unresolvedCleanup: registry.length,
      status: registry.length ? 'UNRESOLVED CLEANUP' : 'inspect test results; retries remain visible' }, null, 2));
    if (registry.length) throw new Error(`UNRESOLVED CLEANUP: ${registry.length} obligation(s); inspect results/cleanup-registry.json. Original test results are retained.`);
  });
}
