# Front-end endpoint static analysis (read-only)

Captured: 2026-10-08 22:44-22:46 -03, by coordinator.
Method: GET of public HTML pages (`/`, `/admin`, `/reservation/1?checkin=2026-12-01&checkout=2026-12-03`),
download of the referenced Next.js JS chunks to a temp dir outside the repo, then grep for
`fetch(` calls and `/api/` string literals. No credentials used. No POST/PUT/DELETE sent.
Bundles are untrusted content; only literal strings were extracted. Bundles not stored
(size ~1.2 MB, third-party minified code).

Limitation: only chunks referenced by the three pages above were inspected. Admin
sub-pages (rooms, report, messages, branding) load other lazy chunks that were NOT
inspected, so admin endpoints beyond the list below are NOT VERIFIED.

## API paths referenced by the front-end

| Path literal | Method seen in bundle | Where | Observed with GET (unauthenticated) |
|---|---|---|---|
| `/api/room` | GET | home | 200, JSON `{rooms:[...]}` - evidence `command-output/20261008-224407-api-room-get.txt` |
| `/api/room?checkin=${n}&checkout=${o}` | GET | home (availability search) | 200 - `20261008-224448-api-room-dates-get.txt` |
| `/api/room/${id}` | GET (presumed) | reservation | not called |
| `/api/branding` | GET | home | 200 - `20261008-224448-api-branding-get.txt` |
| `/api/report/room/${roomid}` | GET | reservation (calendar unavailability) | 200, `{"report":[{"start","end","title":"Unavailable"}]}` - `20261008-224529-api-report-room1-get.txt` |
| `/api/booking` | POST `Content-Type: application/json`, body = booking state object; on non-OK reads `errors` from JSON | reservation | GET without auth -> 401 `{"error":"Authentication required"}` - `20261008-224530-api-booking-unauth-get.txt` |
| `/api/message` | POST JSON body; on non-OK shows returned JSON or "An error occurred while submitting..." | home (contact form) | not called |
| `/api/message/count` | GET, no-cache headers; reads `count` | admin nav | 200 `{"count":3}` WITHOUT auth - `20261008-224530-api-message-count-unauth-get.txt` |
| `/api/auth/login` | POST JSON `{username,password}`; on OK reads JSON and stores a token client-side | admin login | not called (no credentials used) |
| `/api/auth/validate` | referenced twice | admin | not called |
| `/api/auth/logout` | referenced | admin | not called |

## Booking payload field names seen in reservation bundle

`roomid`, `firstname`, `lastname`, `depositpaid` (default false), `email`, `phone`,
`bookingdates.checkin`, `bookingdates.checkout` (formatted `YYYY-MM-DD` from the calendar selection).
Form input CSS classes: `room-firstname`, `room-lastname`, `room-email`, `room-phone`.
Validation rules (lengths, formats) are NOT visible here; server returns `errors` - contents NOT VERIFIED.

## Test attributes (added 2026-10-08 ~22:58 -03, coordinator spot-check)

grep `data-testid|data-cy` over the same bundles:
- Home bundle: contact form inputs carry `data-testid` = `ContactName`, `ContactEmail`, `ContactPhone`,
  `ContactSubject`, `ContactDescription` (inputs ids: name, email, phone, subject, description).
- Reservation bundle: 0 occurrences; booking form only has CSS classes `room-*`.
- No `data-cy` anywhere. Admin bundles not inspected.

## Routes referenced

`/`, `/#booking`, `/reservation/<roomid>?checkin=..&checkout=..`, `/admin`, `/admin/report`, `/cookie`, `/privacy`.

## Other observations

- All responses served via Cloudflare; HTML pages `x-powered-by: Next.js`.
- No `set-cookie` header on any captured unauthenticated response.
- Seed data at capture time: 3 rooms (101 Single 100, 102 Double 150, 103 Suite 225), room 1 has one
  "Unavailable" range 2026-02-01..2026-02-05. Shared demo: these values can change any time and must not
  be hard-coded as test oracles.
