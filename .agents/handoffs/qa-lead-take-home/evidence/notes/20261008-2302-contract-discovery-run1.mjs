// Targeted, authorized contract discovery for qa-lead-take-home.
// Credentials come ONLY from env (RBP_ADMIN_USER / RBP_ADMIN_PASSWORD). Nothing secret is written out.
// Writes: at most one tagged booking (+ possible overlap/invalid attempts) and one tagged message.
// Cleanup: only records whose names/subject carry this run's tag.
import { writeFileSync } from 'node:fs';

const BASE = 'https://automationintesting.online';
const OUT = process.argv[2];
const user = process.env.RBP_ADMIN_USER;
const pass = process.env.RBP_ADMIN_PASSWORD;
if (!OUT || !user || !pass) { console.error('usage: RBP_ADMIN_USER=.. RBP_ADMIN_PASSWORD=.. node discover.mjs <out.json>'); process.exit(2); }

const TAG = 'qa' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5); // e.g. qa1k2x9ab
const SECRET_KEY = /token|session|password|secret|authorization|cookie/i;
const log = { tag: TAG, startedAt: new Date().toISOString(), redaction: 'credentials, token/cookie values and other users\' field values removed; other users\' records summarised as key/type only', steps: [] };
let cookie = null; // in-memory only
const ownedBookings = new Set(); const ownedMessages = new Set(); const deleted = new Set();

function redact(v) {
  if (Array.isArray(v)) return v.map(redact);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SECRET_KEY.test(k) && typeof x !== 'object' ? '[REDACTED]' : redact(x)]));
  return v;
}
function shape(v) {
  if (Array.isArray(v)) return v.length ? [shape(v[0])] : [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]));
  return typeof v;
}
const owns = (s) => typeof s === 'string' && s.includes(TAG);

async function call(label, method, path, { body, auth = false, summarise } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = undefined; }
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const step = {
    label, method, path, authenticated: Boolean(auth && cookie),
    requestBody: body === undefined ? undefined : redact(body),
    status: res.status,
    contentType: res.headers.get('content-type'),
    setCookieNames: setCookies.map(c => c.split('=')[0]),
    setCookieAttributes: setCookies.map(c => c.split(';').slice(1).map(s => s.trim().split('=')[0]).join(';')),
    response: json === undefined ? (text.length > 300 ? text.slice(0, 300) + '...' : text) : (summarise ? summarise(json) : redact(json)),
  };
  log.steps.push(step);
  console.log(`${label}: ${method} ${path} -> ${res.status}`);
  return { res, json, setCookies };
}

const ymd = (d) => d.toISOString().slice(0, 10);
const overlaps = (a1, a2, b1, b2) => a1 < b2 && b1 < a2;

try {
  // 1. login
  const login = await call('login', 'POST', '/api/auth/login', { body: { username: user, password: pass } });
  const tokenCookie = login.setCookies.find(c => c.startsWith('token='));
  if (tokenCookie) cookie = tokenCookie.split(';')[0];
  else if (login.json?.token) cookie = `token=${login.json.token}`;
  log.authTransport = tokenCookie ? 'set-cookie token' : (login.json?.token ? 'token in JSON body, sent back as cookie "token" (hypothesis)' : 'unknown');

  await call('validate', 'POST', '/api/auth/validate', { auth: true, body: {} });
  // validate needs token in body in some versions; record what happens with the cookie only.

  // 2. pick room + free far-future window
  const rooms = (await call('rooms', 'GET', '/api/room', { summarise: (j) => ({ roomsCount: j.rooms?.length, itemShape: shape(j.rooms?.[0]) }) })).json.rooms;
  const room = rooms[Math.floor(Math.random() * rooms.length)];
  const report = (await call('report-before', 'GET', `/api/report/room/${room.roomid}`, { summarise: (j) => ({ count: j.report?.length, itemShape: shape(j.report?.[0]) }) })).json.report ?? [];
  let checkin, checkout;
  for (let i = 0; i < 20; i++) {
    const start = new Date(); start.setUTCDate(start.getUTCDate() + 730 + Math.floor(Math.random() * 365));
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 2);
    if (!report.some(r => overlaps(ymd(start), ymd(end), r.start, r.end))) { checkin = ymd(start); checkout = ymd(end); break; }
  }
  log.chosen = { roomid: room.roomid, checkin, checkout };

  const guest = { firstname: 'Qa', lastname: TAG, email: `${TAG}@example.com`, phone: '07000000000' };

  // 3. negative: invalid payload (empty names, reversed dates)
  const bad = await call('booking-invalid', 'POST', '/api/booking', { body: { roomid: room.roomid, firstname: '', lastname: '', depositpaid: false, email: 'not-an-email', phone: '1', bookingdates: { checkin: checkout, checkout: checkin } } });

  // 4. happy path booking
  const created = await call('booking-create', 'POST', '/api/booking', { body: { roomid: room.roomid, ...guest, depositpaid: false, bookingdates: { checkin, checkout } } });

  if (created.res.ok && created.json?.bookingid) ownedBookings.add(created.json.bookingid);
  // 5. overlap negative on own window
  const overlap = await call('booking-overlap', 'POST', '/api/booking', { body: { roomid: room.roomid, firstname: 'Qa', lastname: TAG + 'b', email: `${TAG}b@example.com`, phone: '07000000001', depositpaid: false, bookingdates: { checkin, checkout } } });

  if (overlap.res.ok && overlap.json?.bookingid) ownedBookings.add(overlap.json.bookingid);
  // 6. report shows window?
  await call('report-after', 'GET', `/api/report/room/${room.roomid}`, { summarise: (j) => ({ count: j.report?.length, containsOwnWindow: (j.report ?? []).some(r => r.start === checkin || r.end === checkout), itemShape: shape(j.report?.[0]) }) });

  // 7. admin booking list for the room (others' records summarised)
  let ownIds = [];
  const list = await call('booking-list-auth', 'GET', `/api/booking?roomid=${room.roomid}`, { auth: true, summarise: (j) => {
    const items = j.bookings ?? (Array.isArray(j) ? j : []);
    const own = items.filter(b => owns(b.lastname));
    return { topLevelKeys: Object.keys(j), itemCount: items.length, itemShape: shape(items[0]), own: own };
  } });
  const items = list.json?.bookings ?? (Array.isArray(list.json) ? list.json : []);
  ownIds = items.filter(b => owns(b.lastname)).map(b => b.bookingid);
  ownIds.forEach(id => ownedBookings.add(id)); ownIds = [...ownedBookings];
  if (created.json?.bookingid && !ownIds.includes(created.json.bookingid)) log.note = 'bookingid in create response not found by tag in list';

  // 8. GET own booking by id
  for (const id of ownIds) await call('booking-get-own', 'GET', `/api/booking/${id}`, { auth: true });

  // 9. cleanup own bookings only
  for (const id of ownIds) {
    const d = await call('booking-delete-own', 'DELETE', `/api/booking/${id}`, { auth: true }); if (d.res.ok) deleted.add('b' + id);
    await call('booking-get-after-delete', 'GET', `/api/booking/${id}`, { auth: true });
  }

  // 10. message: invalid then valid
  await call('message-invalid', 'POST', '/api/message', { body: { name: '', email: 'x', phone: '1', subject: '', description: '' } });
  const msg = { name: `Qa ${TAG}`, email: `${TAG}@example.com`, phone: '07000000000', subject: `Test ${TAG}`, description: `Synthetic contract-discovery message ${TAG}, safe to ignore.` };
  await call('message-create', 'POST', '/api/message', { body: msg });
  const mlist = await call('message-list-auth', 'GET', '/api/message', { auth: true, summarise: (j) => {
    const ms = j.messages ?? (Array.isArray(j) ? j : []);
    return { topLevelKeys: Object.keys(j), itemCount: ms.length, itemShape: shape(ms[0]), own: ms.filter(m => owns(m.subject) || owns(m.name)) };
  } });
  const ms = mlist.json?.messages ?? (Array.isArray(mlist.json) ? mlist.json : []);
  const ownMsgIds = ms.filter(m => owns(m.subject) || owns(m.name)).map(m => m.id ?? m.messageid);
  ownMsgIds.forEach(id => ownedMessages.add(id));
  for (const id of ownMsgIds) await call('message-get-own', 'GET', `/api/message/${id}`, { auth: true });
  for (const id of ownMsgIds) {
    const d = await call('message-delete-own', 'DELETE', `/api/message/${id}`, { auth: true }); if (d.res.ok) deleted.add('m' + id);
  }
  await call('message-list-after-delete', 'GET', '/api/message', { auth: true, summarise: (j) => {
    const all = j.messages ?? (Array.isArray(j) ? j : []);
    return { ownRemaining: all.filter(m => owns(m.subject) || owns(m.name)).length };
  } });
  await call('booking-list-after-delete', 'GET', `/api/booking?roomid=${room.roomid}`, { auth: true, summarise: (j) => ({ ownRemaining: (j.bookings ?? []).filter(b => owns(b.lastname)).length }) });

  // 11. logout + session invalidation
  await call('logout', 'POST', '/api/auth/logout', { auth: true, body: {} });
  await call('booking-list-after-logout', 'GET', `/api/booking?roomid=${room.roomid}`, { auth: true, summarise: (j) => ({ topLevelKeys: Object.keys(j) }) });
} catch (e) {
  log.error = String(e);
  console.error('ERROR', e);
  // safety sweep: delete only ids proven ours that were not deleted yet
  try {
    if (!cookie) { const l = await call('sweep-login', 'POST', '/api/auth/login', { body: { username: user, password: pass } }); const t = l.setCookies.find(c => c.startsWith('token=')); if (t) cookie = t.split(';')[0]; }
    for (const id of ownedBookings) if (!deleted.has('b' + id)) await call('sweep-booking-delete', 'DELETE', `/api/booking/${id}`, { auth: true });
    for (const id of ownedMessages) if (!deleted.has('m' + id)) await call('sweep-message-delete', 'DELETE', `/api/message/${id}`, { auth: true });
  } catch (e2) { log.sweepError = String(e2); }
} finally {
  log.ownership = { bookings: [...ownedBookings], messages: [...ownedMessages], deleted: [...deleted] };
  log.finishedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(log, null, 2));
}
